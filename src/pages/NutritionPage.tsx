import React, { useState, useEffect } from 'react';
import { Apple, Target, TrendingUp, Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AddNutritionModal from '../components/AddNutritionModal';
import EditNutritionModal from '../components/EditNutritionModal';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface NutritionData {
  id?: string;
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  date: string;
}

interface UserGoals {
  calorieGoal: string;
  proteinPercentage: string;
  carbPercentage: string;
  fatPercentage: string;
}

type TimeRange = '1w' | '1m' | '6m' | '1y' | '2y';

export default function NutritionPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1m');
  const [modalDate, setModalDate] = useState(new Date());
  const [modalNutritionData, setModalNutritionData] = useState<NutritionData | null>(null);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const fetchNutritionData = async (date: Date) => {
    if (user?.uid) {
      const dateString = date.toISOString().split('T')[0];
      const q = query(
        collection(db, 'nutrition'),
        where('userId', '==', user.uid),
        where('date', '==', dateString)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as NutritionData;
      }
      return null;
    }
    return null;
  };

  const fetchTrendsData = async () => {
    if (!user?.uid) return;

    const startDate = new Date();
    switch (selectedTimeRange) {
      case '1w':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '6m':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '2y':
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
    }

    const q = query(
      collection(db, 'nutrition'),
      where('userId', '==', user.uid),
      where('date', '>=', startDate.toISOString().split('T')[0])
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      calories: Number(doc.data().calories),
      proteins: Number(doc.data().proteins),
      carbs: Number(doc.data().carbs),
      fats: Number(doc.data().fats),
      formattedDate: new Date(doc.data().date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      })
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setTrendsData(data);
  };

  useEffect(() => {
    const fetchUserGoals = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserGoals({
            calorieGoal: data.calorieGoal || '2000',
            proteinPercentage: data.proteinPercentage || '30',
            carbPercentage: data.carbPercentage || '45',
            fatPercentage: data.fatPercentage || '25'
          });
        }
      }
    };

    fetchUserGoals();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchNutritionData(selectedDate);
      setNutritionData(data);
    };
    fetchData();
  }, [user, selectedDate]);

  useEffect(() => {
    const fetchModalData = async () => {
      const data = await fetchNutritionData(modalDate);
      setModalNutritionData(data);
    };
    fetchModalData();
  }, [user, modalDate]);

  useEffect(() => {
    fetchTrendsData();
  }, [user, selectedTimeRange]);

  const handleSaveNutrition = async (data: NutritionData) => {
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'nutrition'), {
          ...data,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        
        const newEntryDate = new Date(data.date);
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        const newEntryDateString = newEntryDate.toISOString().split('T')[0];
        
        if (selectedDateString === newEntryDateString) {
          setNutritionData(data);
        }
        
        fetchTrendsData();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving nutrition data:', error);
      }
    }
  };

  const handleUpdateNutrition = async (data: NutritionData) => {
    if (user?.uid && nutritionData?.id) {
      try {
        const nutritionRef = doc(db, 'nutrition', nutritionData.id);
        await updateDoc(nutritionRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
        
        setNutritionData({ ...data, id: nutritionData.id });
        fetchTrendsData();
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Error updating nutrition data:', error);
      }
    }
  };

  const handleModalDateChange = async (date: Date) => {
    setModalDate(date);
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const macroGoals = {
    proteins: userGoals ? Math.round((Number(userGoals.calorieGoal) * (Number(userGoals.proteinPercentage) / 100)) / 4) : 0,
    carbs: userGoals ? Math.round((Number(userGoals.calorieGoal) * (Number(userGoals.carbPercentage) / 100)) / 4) : 0,
    fats: userGoals ? Math.round((Number(userGoals.calorieGoal) * (Number(userGoals.fatPercentage) / 100)) / 9) : 0
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1w', label: '7 derniers jours' },
    { value: '1m', label: '30 derniers jours' },
    { value: '6m', label: '6 derniers mois' },
    { value: '1y', label: 'Cette année' },
    { value: '2y', label: '2 ans' }
  ];

  return (
    <div className="px-2 py-4 sm:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Nutrition</h1>
        <button
          onClick={() => {
            setModalDate(new Date());
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter nutrition</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Apple className="text-indigo-400" size={24} />
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => changeDate(-1)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-semibold">
                    {selectedDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </h2>
                  <button
                    onClick={() => changeDate(1)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-gray-400">Calories</h3>
                  {nutritionData && (
                    <button
                      onClick={openEditModal}
                      className="text-indigo-400 hover:text-indigo-300 p-1 rounded-lg transition-colors"
                      title="Modifier les données"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold">{nutritionData?.calories || '0'}</p>
                <p className="text-sm text-gray-400">
                  {userGoals ? `${Math.round((Number(nutritionData?.calories || 0) / Number(userGoals.calorieGoal)) * 100)}% objectif` : 'Chargement...'}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Protéines</span>
                    <p className="font-bold">{nutritionData?.proteins || '0'}g</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Glucides</span>
                    <p className="font-bold">{nutritionData?.carbs || '0'}g</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Lipides</span>
                    <p className="font-bold">{nutritionData?.fats || '0'}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-indigo-400" size={24} />
                <h2 className="text-xl font-semibold">Tendances</h2>
              </div>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    name="Calories"
                    stroke="#818CF8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="proteins"
                    name="Protéines"
                    stroke="#34D399"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="carbs"
                    name="Glucides"
                    stroke="#F87171"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fats"
                    name="Lipides"
                    stroke="#FBBF24"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Mes objectifs</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Calories</h3>
                <p className="text-2xl font-bold mb-1">{userGoals?.calorieGoal || '0'}</p>
                <p className="text-sm text-gray-400">kcal par jour</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Protéines</span>
                    <p className="font-bold">{macroGoals.proteins}g</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Glucides</span>
                    <p className="font-bold">{macroGoals.carbs}g</p>
                  </div>
                  <div className="w-px h-8 bg-gray-700"></div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-400">Lipides</span>
                    <p className="font-bold">{macroGoals.fats}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddNutritionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNutrition}
        selectedDate={modalDate}
        existingData={modalNutritionData}
        onDateChange={handleModalDateChange}
      />

      {nutritionData && (
        <EditNutritionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateNutrition}
          data={nutritionData}
        />
      )}
    </div>
  );
}
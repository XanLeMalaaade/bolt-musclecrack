import React, { useState, useEffect } from 'react';
import { Footprints, Activity, TrendingUp, Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import AddActivityModal from '../components/AddActivityModal';
import EditActivityModal from '../components/EditActivityModal';

interface ActivityData {
  id?: string;
  steps: string;
  date: string;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [modalDate, setModalDate] = useState(new Date());
  const [modalActivityData, setModalActivityData] = useState<ActivityData | null>(null);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const fetchActivityData = async (date: Date) => {
    if (user?.uid) {
      const dateString = date.toISOString().split('T')[0];
      const q = query(
        collection(db, 'activity'),
        where('userId', '==', user.uid),
        where('date', '==', dateString)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as ActivityData;
      }
      return null;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchActivityData(selectedDate);
      setActivityData(data);
    };
    fetchData();
  }, [user, selectedDate]);

  useEffect(() => {
    const fetchModalData = async () => {
      const data = await fetchActivityData(modalDate);
      setModalActivityData(data);
    };
    fetchModalData();
  }, [user, modalDate]);

  const handleSaveActivity = async (data: ActivityData) => {
    if (user?.uid) {
      try {
        await addDoc(collection(db, 'activity'), {
          ...data,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        
        const newEntryDate = new Date(data.date);
        const selectedDateString = selectedDate.toISOString().split('T')[0];
        const newEntryDateString = newEntryDate.toISOString().split('T')[0];
        
        if (selectedDateString === newEntryDateString) {
          setActivityData(data);
        }
        
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving activity data:', error);
      }
    }
  };

  const handleUpdateActivity = async (data: ActivityData) => {
    if (user?.uid && activityData?.id) {
      try {
        const activityRef = doc(db, 'activity', activityData.id);
        await updateDoc(activityRef, {
          ...data,
          updatedAt: new Date().toISOString()
        });
        
        setActivityData({ ...data, id: activityData.id });
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Error updating activity data:', error);
      }
    }
  };

  const handleModalDateChange = async (date: Date) => {
    setModalDate(date);
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Calculer la distance basée sur les pas (environ 0.7m par pas)
  const calculateDistance = (steps: string) => {
    const stepsNum = parseFloat(steps) || 0;
    return ((stepsNum * 0.7) / 1000).toFixed(1); // Convertir en km
  };

  // Calculer les calories basées sur les pas (environ 0.04 kcal par pas)
  const calculateCalories = (steps: string) => {
    const stepsNum = parseFloat(steps) || 0;
    return Math.round(stepsNum * 0.04);
  };

  // Calculer les minutes actives basées sur les pas (environ 1 minute pour 100 pas)
  const calculateActiveMinutes = (steps: string) => {
    const stepsNum = parseFloat(steps) || 0;
    return Math.round(stepsNum / 100);
  };

  return (
    <div className="px-2 py-4 sm:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Activité physique</h1>
        <button
          onClick={() => {
            setModalDate(new Date());
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter activité</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Footprints className="text-indigo-400" size={24} />
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-400">Pas</h3>
                {activityData && (
                  <button
                    onClick={openEditModal}
                    className="text-indigo-400 hover:text-indigo-300 p-1 rounded-lg transition-colors"
                    title="Modifier les données"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
              <p className="text-2xl font-bold">{activityData?.steps || '0'}</p>
              <p className="text-sm text-yellow-400">
                {activityData ? `${Math.round((Number(activityData.steps) / 10000) * 100)}% objectif` : '0% objectif'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Distance</h3>
              <p className="text-2xl font-bold">{activityData ? calculateDistance(activityData.steps) : '0'} km</p>
              <p className="text-sm text-yellow-400">
                {activityData ? `${Math.round((Number(calculateDistance(activityData.steps)) / 7) * 100)}% objectif` : '0% objectif'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Calories actives</h3>
              <p className="text-2xl font-bold">{activityData ? calculateCalories(activityData.steps) : '0'}</p>
              <p className="text-sm text-green-400">
                {activityData ? `${Math.round((calculateCalories(activityData.steps) / 400) * 100)}% objectif` : '0% objectif'}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Minutes actives</h3>
              <p className="text-2xl font-bold">{activityData ? calculateActiveMinutes(activityData.steps) : '0'}</p>
              <p className="text-sm text-green-400">
                {activityData ? `${Math.round((calculateActiveMinutes(activityData.steps) / 45) * 100)}% objectif` : '0% objectif'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Activités</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Marche</h3>
                <p className="text-sm text-gray-400">30 minutes - 250 kcal</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Course</h3>
                <p className="text-sm text-gray-400">15 minutes - 170 kcal</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Tendances</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Cette semaine</h3>
                <p className="text-sm text-gray-400">Moyenne: 9,200 pas/jour</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Ce mois</h3>
                <p className="text-sm text-gray-400">Moyenne: 8,800 pas/jour</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        selectedDate={modalDate}
        existingData={modalActivityData}
        onDateChange={handleModalDateChange}
      />

      {activityData && (
        <EditActivityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateActivity}
          data={activityData}
        />
      )}
    </div>
  );
}
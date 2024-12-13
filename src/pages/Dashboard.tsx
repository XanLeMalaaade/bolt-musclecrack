import React, { useState, useEffect } from 'react';
import { Activity, Dumbbell, Apple, TrendingUp, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface NutritionData {
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
  date: string;
}

interface ActivityData {
  steps: string;
  date: string;
}

interface WeightData {
  weight: string;
  date: string;
}

interface Set {
  id: string;
  reps: string;
  weight: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Workout {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  exercises: Exercise[];
}

interface ProgressionDataPoint {
  date: string;
  weight: number;
  volume: number;
  rawDate: string;
}

type TimeRange = '1m' | '6m' | '1y' | '2y';

export default function Dashboard() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [todayWorkout, setTodayWorkout] = useState({ value: 'Repos', subValue: 'Aucun entraînement aujourd\'hui' });
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1m');
  const [userGoals, setUserGoals] = useState({
    calorieGoal: '2000',
    stepsGoal: '10000'
  });
  const [lastWorkout, setLastWorkout] = useState<Workout | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [exerciseHistory, setExerciseHistory] = useState<ProgressionDataPoint[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1m', label: '30 derniers jours' },
    { value: '6m', label: '6 derniers mois' },
    { value: '1y', label: 'Cette année' },
    { value: '2y', label: '2 ans' }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || '');
          setUserGoals({
            calorieGoal: data.calorieGoal || '2000',
            stepsGoal: data.stepsGoal || '10000'
          });
        }
      }
    };

    const fetchTodayWorkout = async () => {
      if (!user?.uid) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toLocaleDateString('fr-CA');

        const workoutsRef = collection(db, 'workouts');
        const workoutQuery = query(
          workoutsRef,
          where('userId', '==', user.uid),
          where('date', '==', todayStr)
        );

        const querySnapshot = await getDocs(workoutQuery);

        if (!querySnapshot.empty) {
          const workout = querySnapshot.docs[0].data();
          const formattedTime = workout.time.replace(":", "h");
          
          setTodayWorkout({
            value: workout.name,
            subValue: `Prévu à ${formattedTime}`
          });
        } else {
          setTodayWorkout({
            value: 'Repos',
            subValue: 'Aucun entraînement aujourd\'hui'
          });
        }
      } catch (error) {
        console.error('Error fetching today workout:', error);
        setTodayWorkout({
          value: 'Aucun entraînement',
          subValue: `Erreur lors du chargement`
        });
      }
    };

    const fetchLastWorkout = async () => {
      if (!user?.uid) return;

      try {
        const workoutsRef = collection(db, 'workouts');
        const workoutQuery = query(
          workoutsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          where('date', '<=', new Date().toISOString().split('T')[0])
        );

        const querySnapshot = await getDocs(workoutQuery);
        
        if (!querySnapshot.empty) {
          const lastWorkoutData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          } as Workout;
          
          setLastWorkout(lastWorkoutData);
          if (lastWorkoutData.exercises.length > 0) {
            setSelectedExercise(lastWorkoutData.exercises[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching last workout:', error);
      }
    };

    const fetchTodayNutrition = async () => {
      if (user?.uid) {
        const today = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, 'nutrition'),
          where('userId', '==', user.uid),
          where('date', '==', today)
        );

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as NutritionData;
            setNutritionData(data);
          }
        } catch (error) {
          console.error('Error fetching nutrition data:', error);
        }
      }
    };

    const fetchTodayActivity = async () => {
      if (user?.uid) {
        const today = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, 'activity'),
          where('userId', '==', user.uid),
          where('date', '==', today)
        );

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as ActivityData;
            setActivityData(data);
          }
        } catch (error) {
          console.error('Error fetching activity data:', error);
        }
      }
    };

    const fetchCorrelationData = async () => {
      if (!user?.uid) return;

      const startDate = new Date();
      switch (selectedTimeRange) {
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

      const startDateStr = startDate.toISOString().split('T')[0];

      // Récupérer les données de nutrition
      const nutritionQuery = query(
        collection(db, 'nutrition'),
        where('userId', '==', user.uid),
        where('date', '>=', startDateStr),
        orderBy('date', 'asc')
      );

      // Récupérer les données d'activité
      const activityQuery = query(
        collection(db, 'activity'),
        where('userId', '==', user.uid),
        where('date', '>=', startDateStr),
        orderBy('date', 'asc')
      );

      // Récupérer l'historique des poids
      const weightQuery = query(
        collection(db, 'weightHistory'),
        where('userId', '==', user.uid),
        where('date', '>=', startDateStr),
        orderBy('date', 'asc')
      );

      try {
        const [nutritionSnapshot, activitySnapshot, weightSnapshot] = await Promise.all([
          getDocs(nutritionQuery),
          getDocs(activityQuery),
          getDocs(weightQuery)
        ]);

        // Créer un map des données par date
        const dataByDate = new Map();

        nutritionSnapshot.forEach(doc => {
          const data = doc.data();
          if (!dataByDate.has(data.date)) {
            dataByDate.set(data.date, {});
          }
          dataByDate.get(data.date).calories = Number(data.calories);
        });

        activitySnapshot.forEach(doc => {
          const data = doc.data();
          if (!dataByDate.has(data.date)) {
            dataByDate.set(data.date, {});
          }
          // Calculer les calories dépensées (approximatif: 0.04 kcal par pas)
          dataByDate.get(data.date).caloriesBurned = Math.round(Number(data.steps) * 0.04);
        });

        weightSnapshot.forEach(doc => {
          const data = doc.data();
          if (!dataByDate.has(data.date)) {
            dataByDate.set(data.date, {});
          }
          dataByDate.get(data.date).weight = Number(data.weight);
        });

        // Convertir le map en tableau pour le graphique
        const correlationData = Array.from(dataByDate.entries())
          .map(([date, data]: [string, any]) => ({
            date: new Date(date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short'
            }),
            calories: data.calories || 0,
            caloriesBurned: data.caloriesBurned || 0,
            weight: data.weight || null,
            rawDate: date
          }))
          .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

        // Filtrer les données pour ne conserver que celles jusqu'à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const filteredCorrelationData = correlationData.filter(item => item.rawDate <= today);

        setCorrelationData(filteredCorrelationData);
      } catch (error) {
        console.error('Error fetching correlation data:', error);
      }
    };

    fetchUserData();
    fetchTodayWorkout();
    fetchLastWorkout();
    fetchTodayNutrition();
    fetchTodayActivity();
    fetchCorrelationData();
  }, [user, selectedTimeRange]);

  useEffect(() => {
    const fetchExerciseHistory = async () => {
      if (!user?.uid || !selectedExercise) return;

      try {
        const workoutsRef = collection(db, 'workouts');
        const workoutQuery = query(
          workoutsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          where('date', '<=', new Date().toISOString().split('T')[0])
        );

        const querySnapshot = await getDocs(workoutQuery);
        const history: ProgressionDataPoint[] = [];

        querySnapshot.docs.forEach(doc => {
          const workout = doc.data() as Workout;
          const exercise = workout.exercises.find(ex => ex.name === selectedExercise);
          
          if (exercise) {
            const maxWeight = Math.max(...exercise.sets.map(set => parseFloat(set.weight) || 0));
            const totalVolume = exercise.sets.reduce((acc, set) => {
              const reps = parseFloat(set.reps) || 0;
              const weight = parseFloat(set.weight) || 0;
              return acc + (reps * weight);
            }, 0);

            history.push({
              date: new Date(workout.date).toLocaleDateString('fr-FR', { 
                day: '2-digit',
                month: 'short'
              }),
              weight: maxWeight,
              volume: totalVolume,
              rawDate: workout.date
            });
          }
        });

        setExerciseHistory(history.reverse());
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      }
    };

    fetchExerciseHistory();
  }, [user, selectedExercise]);

  // Calculer la distance basée sur les pas (environ 0.7m par pas)
  const calculateDistance = (steps: string) => {
    const stepsNum = parseFloat(steps) || 0;
    return ((stepsNum * 0.7) / 1000).toFixed(1); // Convertir en km
  };

  const metrics = [
    { 
      icon: Dumbbell, 
      label: 'Séance du jour', 
      value: todayWorkout.value, 
      subValue: todayWorkout.subValue 
    },
    { 
      icon: Apple, 
      label: 'Calories', 
      value: nutritionData?.calories || '0', 
      subValue: `${Math.round((Number(nutritionData?.calories || 0) / Number(userGoals.calorieGoal)) * 100)}% objectif`
    },
    { 
      icon: Activity, 
      label: 'Pas', 
      value: activityData?.steps || '0', 
      subValue: `${calculateDistance(activityData?.steps || '0')} km`
    }
  ];

  return (
    <div className="sm:p-6">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold mb-2">Voici un aperçu de vos progrès aujourd'hui</h1>
        {errorMessage && (
          <div className="bg-red-500 text-white p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <metric.icon className="text-indigo-400" size={24} />
              <span className="text-gray-400">{metric.label}</span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.subValue}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Scale className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Bilan Calorique</h2>
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

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  yAxisId="calories"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  orientation="left"
                  domain={[0, 'auto']}
                />
                <YAxis 
                  yAxisId="weight"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  orientation="right"
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                  formatter={(value: number, name: string) => {
                    switch (name) {
                      case 'calories':
                        return [`${value} kcal`, 'Apport calorique'];
                      case 'caloriesBurned':
                        return [`${value} kcal`, 'Dépense calorique'];
                      case 'weight':
                        return [`${value} kg`, 'Poids'];
                      default:
                        return [value, name];
                    }
                  }}
                />
                <Legend />
                <Line
                  yAxisId="calories"
                  type="monotone"
                  dataKey="calories"
                  name="Apport calorique"
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="calories"
                  type="monotone"
                  dataKey="caloriesBurned"
                  name="Dépense calorique"
                  stroke="#F87171"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  name="Poids"
                  stroke="#34D399"
                  strokeWidth={2}
                  dot={{ fill: '#34D399', r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Dumbbell className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Dernière Séance</h2>
            </div>
            {lastWorkout && lastWorkout.exercises.length > 0 && (
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {lastWorkout.exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.name}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="h-96">
            {lastWorkout ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-400">
                    {new Date(lastWorkout.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <h3 className="text-xl font-bold">{lastWorkout.name}</h3>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        orientation="left"
                      />
                      <YAxis 
                        yAxisId="right"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                        orientation="right"
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
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        name="Charge (kg)"
                        stroke="#818CF8"
                        strokeWidth={2}
                        dot={{ fill: '#818CF8', r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        name="Volume (kg)"
                        stroke="#34D399"
                        strokeWidth={2}
                        dot={{ fill: '#34D399', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Aucun entraînement récent</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
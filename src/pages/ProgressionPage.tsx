import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import WorkoutProgression from '../components/WorkoutProgression';

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

export default function ProgressionPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user?.uid) return;
      
      try {
        const workoutsQuery = query(
          collection(db, 'workouts'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(workoutsQuery);
        const workoutData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        
        setWorkouts(workoutData);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  if (loading) {
    return (
      <div className="px-2 py-4 sm:p-6 flex justify-center items-center">
        <div className="text-white">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Progression</h1>
        <p className="text-gray-400">Suivez l'évolution de vos performances</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
        <WorkoutProgression
          workouts={workouts}
          selectedExercise={selectedExercise}
          onExerciseChange={setSelectedExercise}
        />
      </div>
    </div>
  );
}
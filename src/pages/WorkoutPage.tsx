import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import WeekCalendar from '../components/gym/WeekCalendar';
import WorkoutCard from '../components/gym/WorkoutCard';
import WorkoutEditMode from '../components/gym/WorkoutEditMode';
import AddWorkoutModal from '../components/gym/AddWorkoutModal';
import { startOfDay, format } from 'date-fns';
import { Workout } from '../types/exercise';

export default function WorkoutPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchAllWorkouts();
      fetchWorkouts();
    }
  }, [user, selectedDate]);

  const fetchAllWorkouts = async () => {
    if (!user?.uid) return;
    
    try {
      const workoutsRef = collection(db, 'workouts');
      const q = query(workoutsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const workoutData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workout[];
      
      setAllWorkouts(workoutData);
    } catch (error) {
      console.error('Error fetching all workouts:', error);
    }
  };

  const fetchWorkouts = async () => {
    if (!user?.uid) return;
    
    try {
      const workoutsRef = collection(db, 'workouts');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const q = query(
        workoutsRef,
        where('userId', '==', user.uid),
        where('date', '==', selectedDateStr)
      );
      
      const querySnapshot = await getDocs(q);
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

  const handleSaveWorkout = async (selectedExercises: string[]) => {
    if (!user?.uid) return;

    try {
      const workoutData: Workout = {
        name: "Nouvel entraînement",
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: "09:00",
        duration: "60",
        exercises: selectedExercises.map(exerciseId => ({
          id: crypto.randomUUID(),
          exerciseId,
          sets: [{
            id: crypto.randomUUID(),
            reps: "10",
            weight: "20"
          }]
        }))
      };

      const docRef = await addDoc(collection(db, 'workouts'), {
        ...workoutData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      const newWorkout = {
        ...workoutData,
        id: docRef.id
      };

      setSelectedWorkout(newWorkout);
      setEditMode(true);
      setIsModalOpen(false);
      await Promise.all([fetchWorkouts(), fetchAllWorkouts()]);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleUpdateWorkout = async (updatedWorkout: Workout) => {
    if (!user?.uid || !updatedWorkout.id) return;

    try {
      const workoutRef = doc(db, 'workouts', updatedWorkout.id);
      await updateDoc(workoutRef, {
        ...updatedWorkout,
        updatedAt: new Date().toISOString()
      });
      
      await Promise.all([fetchWorkouts(), fetchAllWorkouts()]);
      setEditMode(false);
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user?.uid) return;

    try {
      await deleteDoc(doc(db, 'workouts', workoutId));
      await Promise.all([fetchWorkouts(), fetchAllWorkouts()]);
      setEditMode(false);
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const hasWorkout = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allWorkouts.some(workout => workout.date === dateStr);
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setEditMode(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white font-medium">Chargement des entraînements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 sm:pt-6">
      <WeekCalendar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        hasWorkout={hasWorkout}
      />
      <div className="flex flex-col px-2 gap-3 items-center w-full max-w-[580px] mx-auto justify-center">
        {editMode && selectedWorkout ? (
          <WorkoutEditMode
            workout={selectedWorkout}
            onSave={handleUpdateWorkout}
            onCancel={() => {
              setEditMode(false);
              setSelectedWorkout(null);
            }}
          />
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedWorkout(null);
                setIsModalOpen(true);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Ajouter un nouvel entraînement</span>
            </button>

            <div className="w-full space-y-6">
              {workouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  name={workout.name}
                  duration={workout.duration}
                  exercises={workout.exercises}
                  onDelete={() => handleDeleteWorkout(workout.id!)}
                  onEdit={() => handleEditWorkout(workout)}
                />
              ))}
            </div>

            <AddWorkoutModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
              }}
              onSave={handleSaveWorkout}
            />
          </>
        )}
      </div>
    </div>
  );
}
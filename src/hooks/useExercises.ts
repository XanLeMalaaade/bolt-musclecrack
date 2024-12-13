import { useState, useEffect } from 'react';
import { Exercise } from '../types/exercise';
import { getAllExercises } from '../services/exerciseService';

export function useExercises() {
  const [exercises, setExercises] = useState<{ [key: string]: Exercise }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exercisesData = await getAllExercises();
        const exercisesMap = exercisesData.reduce((acc, exercise) => {
          acc[exercise.id] = exercise;
          return acc;
        }, {} as { [key: string]: Exercise });
        setExercises(exercisesMap);
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return { exercises, loading };
}
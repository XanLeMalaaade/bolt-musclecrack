import React from 'react';
import { Exercise } from '../../types/exercise';
import { Dumbbell } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface ExerciseListProps {
  exercises: Exercise[];
  selectedExercises: string[];
  onExerciseSelect: (exerciseId: string) => void;
}

export default function ExerciseList({
  exercises,
  selectedExercises,
  onExerciseSelect
}: ExerciseListProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {exercises.map((exercise) => (
        <button
          key={exercise.id}
          onClick={() => onExerciseSelect(exercise.id)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gray-700 p-2 rounded-lg">
              <Dumbbell size={20} className="text-gray-400" />
            </div>
            <span className="text-white">{exercise.name[language]}</span>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
            {selectedExercises.includes(exercise.id) && (
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
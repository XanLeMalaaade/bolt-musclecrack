import React from 'react';
import { Clock, Trash2, Pencil } from 'lucide-react';
import { useExercises } from '../../hooks/useExercises';
import { WorkoutExercise } from '../../types/exercise';
import { useLanguage } from '../../hooks/useLanguage';

interface WorkoutCardProps {
  name: string;
  duration: string;
  exercises: WorkoutExercise[];
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function WorkoutCard({ name, duration, exercises, onDelete, onEdit }: WorkoutCardProps) {
  const { exercises: exerciseData, loading: exercisesLoading } = useExercises();
  const { language, loading: languageLoading } = useLanguage();

  if (exercisesLoading || languageLoading) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getExerciseName = (exerciseId: string) => {
    const exercise = exerciseData[exerciseId];
    return exercise ? exercise.name[language as keyof typeof exercise.name] || 'Exercise Unknown' : 'Exercise Unknown';
  };

  return (
    <div className="bg-gray-900 rounded-md p-3">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <div className="flex items-center text-gray-400 text-sm font-medium">
            <Clock size={16} className="mr-2" />
            <span>{duration} min</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-gray-800"
            >
              <Pencil size={20} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-800"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-bold">
                {getExerciseName(exercise.exerciseId)}
              </h4>
            </div>
            <div className="flex flex-col gap-2">
              {exercise.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium text-gray-400">{set.reps} reps</span>
                  <span className="text-sm font-bold text-indigo-400">{set.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, Trash2, CirclePlus } from 'lucide-react';
import { Workout } from '../../types/exercise';
import { cn } from '../../lib/utils';
import { useExercises } from '../../hooks/useExercises';
import { useLanguage } from '../../hooks/useLanguage';

interface WorkoutEditModeProps {
  workout: Workout;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

export default function WorkoutEditMode({
  workout,
  onSave,
  onCancel
}: WorkoutEditModeProps) {
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [workoutData, setWorkoutData] = useState<Workout>(workout);
  const [isSaving, setIsSaving] = useState(false);
  const { exercises, loading } = useExercises();
  const { language } = useLanguage();

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const addSet = (exerciseId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              { id: crypto.randomUUID(), reps: '', weight: '' }
            ]
          };
        }
        return exercise;
      })
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.filter(set => set.id !== setId)
          };
        }
        return exercise;
      })
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map(set => {
              if (set.id === setId) {
                return { ...set, [field]: value };
              }
              return set;
            })
          };
        }
        return exercise;
      })
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    onSave(workoutData);
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Chargement des exercices...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={cn(
          "w-full bg-indigo-600 text-white font-semibold py-2 rounded-md transition-colors",
          isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
        )}
      >
        {isSaving ? "Enregistrement..." : "Enregistrer la séance"}
      </button>

      <div className="bg-gray-900 rounded-md p-4 space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Nom de l'entraînement
          </label>
          <input
            type="text"
            value={workoutData.name}
            onChange={(e) => setWorkoutData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={workoutData.date}
                onChange={(e) => setWorkoutData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                disabled={isSaving}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Durée (minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                value={workoutData.duration}
                onChange={(e) => setWorkoutData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                disabled={isSaving}
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {workoutData.exercises.map((exercise) => {
          const exerciseData = exercises[exercise.exerciseId];
          return (
            <div
              key={exercise.id}
              className="bg-gray-900 rounded-md overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleExercise(exercise.id)}
              >
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium">
                    {exerciseData?.name[language] || 'Exercice inconnu'}
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">
                    {exercise.sets.length} Séries
                  </span>
                  {expandedExercises.includes(exercise.id) ? (
                    <ChevronUp size={20} className="text-indigo-400" />
                  ) : (
                    <ChevronDown size={20} className="text-indigo-400" />
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  expandedExercises.includes(exercise.id) ? "max-h-[1000px]" : "max-h-0"
                )}
              >
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm text-gray-400 font-medium">
                    <div className="col-span-1 flex items-center justify-center">Série</div>
                    <div className="col-span-5 flex items-center justify-center">Répétitions</div>
                    <div className="col-span-5 flex items-center justify-center">Poids (kg)</div>
                  </div>
                  <div className="space-y-2">
                    {exercise.sets.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-12 gap-4">
                      <div className="col-span-1 flex items-center justify-center text-gray-400 font-medium">
                        {index + 1}
                      </div>
                      <div className="col-span-5">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                          className="w-full bg-gray-800 text-white font-medium px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="col-span-5 flex items-center space-x-2">
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                          className="w-full bg-gray-800 text-white font-medium px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                            onClick={() => removeSet(exercise.id, set.id)}
                            disabled={isSaving}
                            className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                          >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    ))}
                  </div>
                  <div className="flex flex-row justify-between">
                    <button
                      onClick={() => addSet(exercise.id)}
                      disabled={isSaving}
                      className={cn(
                        "flex items-center space-x-2 text-indigo-400",
                        isSaving ? "opacity-50 cursor-not-allowed" : "hover:text-indigo-300"
                      )}
                    >
                      <CirclePlus size={16} />
                      <span className="font-medium">Ajouter une série</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExercise(exercise.id);
                      }}
                      disabled={isSaving}
                      className="flex items-center font-medium text-xs text-red-400 hover:text-red-300 p-1 disabled:opacity-50 space-x-2"
                    >
                      <Trash2 size={12} />
                      <span>Supprimer l'exercice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
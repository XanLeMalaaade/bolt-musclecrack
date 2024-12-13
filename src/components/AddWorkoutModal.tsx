import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Trash2 } from 'lucide-react';

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

interface WorkoutData {
  id?: string;
  name: string;
  date: string;
  duration: string;
  exercises: Exercise[];
}

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workoutData: WorkoutData) => void;
  onDelete?: () => void;
  initialData?: WorkoutData | null;
  isEdit?: boolean;
}

const defaultWorkout: WorkoutData = {
  name: '',
  date: new Date().toISOString().split('T')[0],
  duration: '',
  exercises: []
};

export default function AddWorkoutModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  initialData, 
  isEdit = false 
}: AddWorkoutModalProps) {
  const [workoutData, setWorkoutData] = useState<WorkoutData>(defaultWorkout);

  useEffect(() => {
    if (initialData) {
      setWorkoutData(initialData);
    } else {
      setWorkoutData(defaultWorkout);
    }
  }, [initialData, isOpen]);

  const addExercise = () => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: Date.now().toString(),
          name: '',
          sets: [{
            id: `${Date.now()}-set-0`,
            reps: '',
            weight: ''
          }]
        }
      ]
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  const addSet = (exerciseId: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [...exercise.sets, {
              id: `${exerciseId}-set-${exercise.sets.length}`,
              reps: '',
              weight: ''
            }]
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

  const updateExercise = (exerciseId: string, field: string, value: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => 
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: string) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map(set => 
              set.id === setId ? { ...set, [field]: value } : set
            )
          };
        }
        return exercise;
      })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(workoutData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Modifier l\'entraînement' : 'Nouvel entraînement'}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nom de l'entraînement
              </label>
              <input
                type="text"
                value={workoutData.name}
                onChange={(e) => setWorkoutData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Pecs & Triceps"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={workoutData.date}
                  onChange={(e) => setWorkoutData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:text-white [&::-webkit-calendar-picker-indicator]:invert"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={workoutData.duration}
                  onChange={(e) => setWorkoutData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {workoutData.exercises.length >= 1 && (
              <div className="flex">
                <h3 className="text-lg font-medium">Exercices</h3>
              </div>
            )}
            {workoutData.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-gray-800 p-4 rounded-lg space-y-4"
              >
                <div className="flex sm:flex-row items-center gap-4">
                  <input
                    type="text"
                    placeholder="Nom de l'exercice"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {exercise.sets.map((set, index) => (
                    <div key={set.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <span className="text-gray-400 w-16">Série {index + 1}</span>
                      <div className="flex flex-row item-center gap-2 sm:gap-4">
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                          className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                          min="1"
                        />
                        <input
                          type="number"
                          placeholder="Poids (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                          className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          required
                          min="0"
                        />
                        {exercise.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(exercise.id, set.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    + Ajouter une série
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className='flex justify-center mt-4'>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={20} className="text-indigo-400" />
              <span>Ajouter un exercice</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                >
                  Supprimer l'entraînement
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                {isEdit ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
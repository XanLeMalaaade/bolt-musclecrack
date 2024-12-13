import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Exercise } from '../../types/exercise';
import ExerciseList from './ExerciseList';
import { getAllExercises } from '../../services/exerciseService';
import { useLanguage } from '../../hooks/useLanguage';

interface AddWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercises: string[]) => void;
}

export default function AddWorkoutModal({
  isOpen,
  onClose,
  onSave
}: AddWorkoutModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const exercisesData = await getAllExercises();
        setExercises(exercisesData);
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const handleSave = () => {
    onSave(selectedExercises);
    setSelectedExercises([]);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  const filteredExercises = exercises.filter(exercise =>
    exercise.name[language].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Nouvel entraînement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un exercice"
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <h3 className="text-gray-400 text-sm mb-3">Tous les exercices</h3>
            {loading ? (
              <div className="text-center py-4 text-gray-400">
                Chargement des exercices...
              </div>
            ) : (
              <ExerciseList
                exercises={filteredExercises}
                selectedExercises={selectedExercises}
                onExerciseSelect={handleExerciseSelect}
              />
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={selectedExercises.length === 0}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter ces exercices à l'entraînement
          </button>
        </div>
      </div>
    </div>
  );
}
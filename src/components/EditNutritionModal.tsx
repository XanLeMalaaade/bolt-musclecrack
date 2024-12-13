import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NutritionData {
  date: string;
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
}

interface EditNutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nutritionData: NutritionData) => void;
  data: NutritionData;
}

export default function EditNutritionModal({ 
  isOpen, 
  onClose, 
  onSave,
  data
}: EditNutritionModalProps) {
  const [nutritionData, setNutritionData] = useState<NutritionData>(data);

  useEffect(() => {
    setNutritionData(data);
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nutritionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Modifier la nutrition</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Calories
            </label>
            <input
              type="number"
              value={nutritionData.calories}
              onChange={(e) => setNutritionData(prev => ({ ...prev, calories: e.target.value }))}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Protéines (g)
            </label>
            <input
              type="number"
              value={nutritionData.proteins}
              onChange={(e) => setNutritionData(prev => ({ ...prev, proteins: e.target.value }))}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Glucides (g)
            </label>
            <input
              type="number"
              value={nutritionData.carbs}
              onChange={(e) => setNutritionData(prev => ({ ...prev, carbs: e.target.value }))}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Lipides (g)
            </label>
            <input
              type="number"
              value={nutritionData.fats}
              onChange={(e) => setNutritionData(prev => ({ ...prev, fats: e.target.value }))}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
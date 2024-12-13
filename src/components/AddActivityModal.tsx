import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityData {
  date: string;
  steps: string;
}

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityData) => void;
  selectedDate: Date;
  existingData: ActivityData | null;
  onDateChange: (date: Date) => void;
}

export default function AddActivityModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate,
  existingData,
  onDateChange
}: AddActivityModalProps) {
  const [activityData, setActivityData] = useState<ActivityData>({
    date: selectedDate.toISOString().split('T')[0],
    steps: ''
  });

  useEffect(() => {
    setActivityData(prev => ({
      ...prev,
      date: selectedDate.toISOString().split('T')[0]
    }));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activityData);
    setActivityData({
      date: selectedDate.toISOString().split('T')[0],
      steps: ''
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {existingData ? 'Activité du jour' : 'Ajouter une activité'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={() => changeDate(-1)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-lg font-medium">
              {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
            <button
              onClick={() => changeDate(1)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {existingData ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-green-400 mb-4">
                <CheckCircle size={24} />
                <p>Les données pour cette journée ont déjà été enregistrées</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Nombre de pas:</span>
                    <span className="font-medium">{existingData.steps}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nombre de pas
                </label>
                <input
                  type="number"
                  value={activityData.steps}
                  onChange={(e) => setActivityData(prev => ({ ...prev, steps: e.target.value }))}
                  placeholder="10000"
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
          )}
        </div>
      </div>
    </div>
  );
}
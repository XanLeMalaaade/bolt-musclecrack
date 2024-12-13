import React, { useState } from 'react';
import { X, Scale } from 'lucide-react';

interface UpdateWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: string) => Promise<void>;
  currentWeight: string;
}

export default function UpdateWeightModal({
  isOpen,
  onClose,
  onSave,
  currentWeight
}: UpdateWeightModalProps) {
  const [weight, setWeight] = useState(currentWeight);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(weight);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error updating weight:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Mettre à jour votre poids</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {showSuccess ? (
          <div className="p-4 sm:p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Scale className="text-green-400" size={48} />
              </div>
              <p className="text-lg text-green-400">
                Félicitations, vous venez de mettre votre poids à jour !
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nouveau poids (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="30"
                max="250"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-300"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
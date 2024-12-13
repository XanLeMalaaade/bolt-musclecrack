import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsDeleting(true);

    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Supprimer le compte</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={isDeleting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="flex items-start space-x-3 bg-red-500/10 text-red-500 p-4 rounded-lg">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Cette action est irréversible</p>
              <p>
                La suppression de votre compte entraînera la perte définitive de :
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Toutes vos données d'entraînement</li>
                <li>Votre historique de nutrition</li>
                <li>Vos statistiques et progrès</li>
                <li>Vos paramètres personnalisés</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Confirmez votre mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
              disabled={isDeleting}
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!password || isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
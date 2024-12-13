import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (currentPassword: string, newPassword: string) => Promise<void>;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onConfirm
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsChanging(true);
    try {
      await onConfirm(currentPassword, newPassword);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setIsChanging(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowSuccess(false);
    setIsChanging(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md">
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Changer le mot de passe</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
              disabled={isChanging}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 sm:p-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </motion.div>
                <p className="text-lg text-green-500">
                  Votre mot de passe a été modifié avec succès !
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-6"
            >
              {error && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                    disabled={isChanging}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                    disabled={isChanging}
                    minLength={8}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Le mot de passe doit contenir au moins 8 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-800 text-white pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                    disabled={isChanging}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  disabled={isChanging}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isChanging ? 'Modification...' : 'Confirmer'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
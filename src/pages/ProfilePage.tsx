import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Lock, Target, LogOut, Calculator, Scale, Trash2, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import UpdateWeightModal from '../components/UpdateWeightModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import ChangePasswordModal from '../components/ChangePasswordModal';

interface ProfileData {
  email: string;
  name: string;
  birthdate: string;
  weight: string;
  height: string;
  stepsGoal: string;
  calorieGoal: string;
  proteinPercentage: string;
  carbPercentage: string;
  fatPercentage: string;
  language: string;
}

const defaultProfileData: ProfileData = {
  email: '',
  name: '',
  birthdate: '',
  weight: '',
  height: '',
  stepsGoal: '10000',
  calorieGoal: '2000',
  proteinPercentage: '30',
  carbPercentage: '45',
  fatPercentage: '25',
  language: 'fr'
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState<ProfileData>(defaultProfileData);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [hasChanges, setHasChanges] = useState(false);
  const [macroError, setMacroError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const formattedData: ProfileData = {
              email: user.email || '',
              name: data.name || '',
              birthdate: data.birthdate || '',
              weight: data.weight?.toString() || '',
              height: data.height?.toString() || '',
              stepsGoal: data.stepsGoal?.toString() || '10000',
              calorieGoal: data.calorieGoal?.toString() || '2000',
              proteinPercentage: data.proteinPercentage?.toString() || '30',
              carbPercentage: data.carbPercentage?.toString() || '45',
              fatPercentage: data.fatPercentage?.toString() || '25',
              language: data.language || 'fr'
            };
            setInitialProfileData(formattedData);
            setProfileData(formattedData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    setHasChanges(JSON.stringify(initialProfileData) !== JSON.stringify(profileData));
  }, [profileData, initialProfileData]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => {
      const newData = { ...prev, [field]: value };

      if (field.includes('Percentage')) {
        const total = Number(newData.proteinPercentage) + 
                     Number(newData.carbPercentage) + 
                     Number(newData.fatPercentage);
        
        if (total !== 100) {
          setMacroError('La somme des pourcentages doit être égale à 100%');
        } else {
          setMacroError('');
        }
      }

      return newData;
    });
  };

  const calculateMacros = () => {
    const calories = Number(profileData.calorieGoal);
    const proteins = (calories * (Number(profileData.proteinPercentage) / 100) / 4).toFixed(0);
    const carbs = (calories * (Number(profileData.carbPercentage) / 100) / 4).toFixed(0);
    const fats = (calories * (Number(profileData.fatPercentage) / 100) / 9).toFixed(0);

    return { proteins, carbs, fats };
  };

  const macros = calculateMacros();

  const handleSave = async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), profileData);
        setInitialProfileData(profileData);
        setHasChanges(false);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe actuel incorrect');
      }
      throw new Error('Une erreur est survenue lors du changement de mot de passe');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleWeightUpdate = async (newWeight: string) => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          weight: newWeight
        });

        await addDoc(collection(db, 'weightHistory'), {
          userId: user.uid,
          weight: newWeight,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });

        setProfileData(prev => ({
          ...prev,
          weight: newWeight
        }));
      } catch (error) {
        console.error('Error updating weight:', error);
        throw error;
      }
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await deleteAccount(password);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="px-2 py-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Profil</h1>
            <p className="text-gray-400">Gérez vos informations personnelles</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} />
              <span>Sauvegarder</span>
            </button>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full bg-gray-800 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={profileData.birthdate}
                onChange={(e) => handleChange('birthdate', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Taille (cm)
              </label>
              <input
                type="number"
                value={profileData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="text-indigo-400" size={20} />
                <h3 className="text-lg font-medium">Suivi du poids</h3>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <p className="text-gray-400 mb-1">Poids actuel</p>
                    <p className="text-3xl font-bold">{profileData.weight || '--'} kg</p>
                  </div>
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Mettre à jour votre poids
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold">Objectifs</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Objectif de pas quotidiens
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={profileData.stepsGoal}
                  onChange={(e) => handleChange('stepsGoal', e.target.value)}
                  min="1000"
                  step="500"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">pas</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Recommandation : 10 000 pas par jour pour maintenir une bonne santé
              </p>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calculator className="text-indigo-400" size={20} />
                <h3 className="text-lg font-medium">Objectifs nutritionnels</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Objectif calorique quotidien
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={profileData.calorieGoal}
                      onChange={(e) => handleChange('calorieGoal', e.target.value)}
                      min="1200"
                      step="50"
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">kcal</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Répartition des macronutriments
                  </label>
                  {macroError && (
                    <p className="text-red-500 text-sm mb-2">{macroError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Protéines (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={profileData.proteinPercentage}
                          onChange={(e) => handleChange('proteinPercentage', e.target.value)}
                          min="0"
                          max="100"
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{macros.proteins}g</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Glucides (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={profileData.carbPercentage}
                          onChange={(e) => handleChange('carbPercentage', e.target.value)}
                          min="0"
                          max="100"
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{macros.carbs}g</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Lipides (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={profileData.fatPercentage}
                          onChange={(e) => handleChange('fatPercentage', e.target.value)}
                          min="0"
                          max="100"
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{macros.fats}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold">Langue</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Langue des exercices
              </label>
              <select
                value={profileData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold">Sécurité</h2>
          </div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Changer le mot de passe
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span>Se déconnecter</span>
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-500">Zone de danger</h2>
            <p className="text-gray-400 text-sm">
              La suppression de votre compte est une action irréversible.<br />
              Toutes vos données seront définitivement effacées.
            </p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 size={20} />
              <span>Supprimer mon compte</span>
            </button>
          </div>
        </div>

        <UpdateWeightModal
          isOpen={showWeightModal}
          onClose={() => setShowWeightModal(false)}
          onSave={handleWeightUpdate}
          currentWeight={profileData.weight}
        />

        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordChange}
        />

        {showDeleteModal && (
          <DeleteAccountModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </div>
    </div>
  );
}
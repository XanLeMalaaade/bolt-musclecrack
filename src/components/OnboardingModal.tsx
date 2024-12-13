import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Scale, Ruler, Footprints, Apple, Calendar } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingData {
  weight: string;
  height: string;
  stepsGoal: string;
  calorieGoal: string;
  birthdate: string;
  onboardingCompleted: boolean;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    id: 'weight',
    title: 'Quel est votre poids ?',
    description: 'Cette information nous aide à personnaliser votre expérience',
    icon: Scale,
    unit: 'kg',
    required: true,
    type: 'number',
    defaultValue: '0'
  },
  {
    id: 'height',
    title: 'Quelle est votre taille ?',
    description: 'Cette information nous aide à calculer votre IMC',
    icon: Ruler,
    unit: 'cm',
    required: true,
    type: 'number',
    defaultValue: '0'
  },
  {
    id: 'stepsGoal',
    title: 'Quel est votre objectif de pas quotidien ?',
    description: 'Définissez un objectif réaliste pour rester actif',
    icon: Footprints,
    unit: 'pas',
    required: false,
    type: 'number',
    defaultValue: '0'
  },
  {
    id: 'calorieGoal',
    title: 'Quel est votre objectif calorique quotidien ?',
    description: 'Cet objectif vous aidera à suivre votre nutrition',
    icon: Apple,
    unit: 'kcal',
    required: false,
    type: 'number',
    defaultValue: '0'
  },
  {
    id: 'birthdate',
    title: 'Quelle est votre date de naissance ?',
    description: 'Cette information nous aide à mieux adapter nos recommandations',
    icon: Calendar,
    required: true,
    type: 'date',
    defaultValue: ''
  }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    weight: '',
    height: '',
    stepsGoal: '',
    calorieGoal: '',
    birthdate: '',
    onboardingCompleted: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setData(prevData => ({
            ...prevData,
            weight: userData.weight || '',
            height: userData.height || '',
            stepsGoal: userData.stepsGoal || '',
            calorieGoal: userData.calorieGoal || '',
            birthdate: userData.birthdate || ''
          }));

          // Trouver la première étape incomplète
          const firstIncompleteStep = steps.findIndex(step => {
            const value = userData[step.id];
            return step.required && (!value || value === '');
          });

          if (firstIncompleteStep !== -1) {
            setCurrentStep(firstIncompleteStep);
          }
        }
      }
    };

    if (isOpen) {
      loadSavedData();
    }
  }, [user, isOpen]);

  const handleNext = async () => {
    if (!user?.uid) return;

    const currentStepData = steps[currentStep];
    const value = data[currentStepData.id as keyof OnboardingData];

    if (currentStepData.required && !value) {
      return;
    }

    try {
      setLoading(true);
      
      // Sauvegarder les données actuelles
      const updates: Partial<OnboardingData> = {
        [currentStepData.id]: value || currentStepData.defaultValue
      };

      if (currentStep === steps.length - 1) {
        updates.onboardingCompleted = true;
      }

      await updateDoc(doc(db, 'users', user.uid), updates);

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.uid) return;

    const currentStepData = steps[currentStep];

    try {
      setLoading(true);

      // Sauvegarder la valeur par défaut pour l'étape ignorée
      await updateDoc(doc(db, 'users', user.uid), {
        [currentStepData.id]: currentStepData.defaultValue
      });

      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving default value:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600/10 p-3 rounded-full">
              <currentStepData.icon className="h-8 w-8 text-indigo-400" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">{currentStepData.title}</h2>
                <p className="text-gray-400">{currentStepData.description}</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={currentStepData.type}
                    value={data[currentStepData.id as keyof OnboardingData]}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      [currentStepData.id]: e.target.value
                    }))}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-12 [&::-webkit-calendar-picker-indicator]:invert"
                    placeholder={currentStepData.type === 'number' ? "0" : undefined}
                    required={currentStepData.required}
                    max={currentStepData.id === 'birthdate' ? new Date().toISOString().split('T')[0] : undefined}
                  />
                  {currentStepData.unit && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">{currentStepData.unit}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  {!currentStepData.required && (
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      Ignorer
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={currentStepData.required && !data[currentStepData.id as keyof OnboardingData] || loading}
                    className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    index === currentStep ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, getAuth } from 'firebase/auth';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

export default function EmailConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      const auth = getAuth();
      const actionCode = searchParams.get('oobCode');

      if (!actionCode) {
        setStatus('error');
        setError('Code de vérification invalide ou manquant');
        return;
      }

      try {
        // Vérifier et appliquer le code de vérification
        await applyActionCode(auth, actionCode);
        setStatus('success');
        
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'Une erreur est survenue lors de la vérification');
      }
    };

    verifyEmail();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white">Vérification en cours</h2>
            <p className="text-gray-400">
              Veuillez patienter pendant que nous vérifions votre adresse email...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email vérifié avec succès !</h2>
            <p className="text-gray-400">
              Votre adresse email a été confirmée. Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Une erreur est survenue</h2>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
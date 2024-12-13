import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem('pendingVerificationEmail');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl text-center">
        <div className="flex justify-center">
          <div className="bg-indigo-600/10 p-3 rounded-full">
            <Mail className="h-12 w-12 text-indigo-400" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Vérifiez votre email</h2>
          <p className="text-gray-400">
            Nous avons envoyé un lien de vérification à{' '}
            <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-gray-400">
            Cliquez sur le lien dans l'email pour activer votre compte et commencer à utiliser Musclecrack.
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <button
            onClick={() => navigate('/auth')}
            className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour à la connexion</span>
          </button>
          
          <p className="text-sm text-gray-400">
            Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
            <button 
              onClick={() => navigate('/auth')} 
              className="text-indigo-400 hover:text-indigo-300"
            >
              réessayez avec une autre adresse
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
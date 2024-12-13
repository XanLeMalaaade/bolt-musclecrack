import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LegalHeader() {
  const navigate = useNavigate();

  return (
    <header className="py-4 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Titre avec taille de police réduite encore plus sur mobile */}
          <div 
            className="text-xl font-bold cursor-pointer text-white"
            onClick={() => navigate('/')}
          >
            Musclecrack
          </div>

          {/* Affichage conditionnel des boutons */}
          <div className="flex items-center space-x-4">
            {/* Bouton 'S'inscrire' visible sur tous les écrans */}
            <button
              onClick={() => navigate('/auth', { state: { showSignUp: true } })}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              S'inscrire
            </button>
            {/* Bouton 'Se connecter' visible uniquement sur les écrans larges */}
            <button
              onClick={() => navigate('/auth', { state: { showSignUp: false } })}
              className="px-3 py-2 bg-gray-800 text-sm rounded-lg font-semibold text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors hidden md:block lg:block"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

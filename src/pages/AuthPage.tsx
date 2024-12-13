import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(location.state?.showSignUp ?? false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  useEffect(() => {
    setIsSignUp(location.state?.showSignUp ?? false);
  }, [location.state?.showSignUp]);

  const validatePassword = (password: string) => {
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!validatePassword(password)) {
          setError('Le mot de passe doit contenir au moins 8 caractères');
          setIsLoading(false);
          return;
        }
        await signUp(email, password, name);
        navigate('/verify-email');
      } else {
        await signIn(email, password);
        navigate('/workout');
      }
    } catch (err: any) {
      if (err.message.includes('vérifier votre adresse email')) {
        navigate('/verify-email');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou mot de passe incorrect');
      } else {
        setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        console.error(err);
      }
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse.');
    } catch (err) {
      setError('Une erreur est survenue. Vérifiez votre adresse email.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-xl">
        <div>
          <h2 className="text-3xl font-bold text-center text-white">
            {showForgotPassword 
              ? 'Mot de passe oublié'
              : isSignUp 
                ? 'Créer un compte' 
                : 'Se connecter'}
          </h2>
          <p className="mt-2 text-center text-gray-400">
            {showForgotPassword
              ? 'Entrez votre email pour réinitialiser votre mot de passe'
              : isSignUp 
                ? 'Commencez votre parcours fitness' 
                : 'Continuez votre progression'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm flex items-start space-x-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {showForgotPassword ? (
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="email@exemple.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span></span>
                  </>
                ) : (
                  <span>Envoyer le lien de réinitialisation</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-indigo-400 hover:text-indigo-300 text-sm text-center"
                disabled={isLoading}
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-800 text-white w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Prénom"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="email@exemple.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 text-white w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
              {isSignUp && (
                <p className="mt-2 text-xs text-gray-400">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              )}
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                  disabled={isLoading}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{isSignUp ? '' : ''}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Créer un compte' : 'Se connecter'}</span>
              )}
            </button>
          </form>
        )}

        {!showForgotPassword && (
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
              disabled={isLoading}
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? S\'inscrire'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
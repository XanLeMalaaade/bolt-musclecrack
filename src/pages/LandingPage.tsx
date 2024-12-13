import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, LineChart, Smartphone, Users, ChevronRight, Activity, Brain, Zap } from 'lucide-react';
import Footer from '../components/Footer';

const stats = [
  { value: '10K+', label: 'Utilisateurs actifs' },
  { value: '500K+', label: 'Séances d\'entraînement suivies' },
  { value: '97%', label: 'Objectifs atteints' },
  { value: '80K+', label: 'Repas suivis' }
];

const features = [
  {
    icon: Dumbbell,
    title: 'Suivi d\'entraînement',
    description: 'Enregistrez vos séances et suivez votre progression en temps réel'
  },
  {
    icon: LineChart,
    title: 'Analyse détaillée',
    description: 'Visualisez vos performances et identifiez les axes d\'amélioration'
  },
  {
    icon: Brain,
    title: "Autonomie renforcée",
    description: "Prenez le contrôle de vos objectifs grâce à des outils clairs et intuitifs"
  },
  {
    icon: Activity,
    title: 'Suivi complet',
    description: 'Gérez votre nutrition et votre activité physique'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/auth', { state: { showSignUp: true } });
  };

  const handleLogin = () => {
    navigate('/auth', { state: { showSignUp: false } });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-900/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Transformez votre potentiel en performance
            </h1>
            <p className="text-base sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
  Musclecrack vous aide à atteindre vos objectifs fitness avec un suivi de vos entraînements et de votre nutrition.
</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartFree}
                className="px-8 py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Commencer gratuitement</span>
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={handleLogin}
                className="px-8 py-3 bg-gray-800 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-400">Une suite complète d'outils pour votre progression</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 p-6 rounded-xl"
              >
                <feature.icon className="text-indigo-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile App Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">
                Emportez vos statistiques partout avec vous
              </h2>
              <p className="text-gray-400 mb-8">
                Téléchargez notre application en Web App pour accéder à vos entraînements, suivre vos progrès et recevoir des conseils personnalisés, où que vous soyez.
              </p>
              <div className="flex items-center space-x-4">
                <Smartphone size={24} className="text-indigo-400" />
                <span className="text-gray-300">C'est toujours gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users size={40} className="text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez une communauté motivée
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Partagez vos succès, trouvez de l'inspiration et progressez ensemble avec des milliers d'autres passionnés de fitness.
          </p>
          <button
            onClick={handleStartFree}
            className="px-8 py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
          >
            <Zap size={20} />
            <span>Rejoindre maintenant</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
import React from 'react';
import { Shield, Target, Users } from 'lucide-react';
import LegalHeader from '../components/LegalHeader';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <LegalHeader />
      <div className="flex-grow pt-32 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl text-white sm:text-4xl font-bold">À propos de Musclecrack</h1>
            <p className="text-xl text-gray-400">
              Votre partenaire pour un suivi fitness de précision
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-900 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl text-white font-semibold">Notre Mission</h2>
              <p className="text-gray-400">
                Musclecrack a été créé avec une vision simple : permettre à chacun de suivre efficacement 
                sa progression fitness. Notre plateforme offre des outils intuitifs pour enregistrer vos 
                entraînements, suivre votre nutrition et analyser vos progrès, le tout dans un 
                environnement sécurisé et respectueux de votre vie privée.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="text-indigo-400" size={24} />
                  <h3 className="text-lg text-white font-semibold">Objectifs</h3>
                </div>
                <p className="text-gray-400">
                  Nous vous aidons à définir et atteindre vos objectifs fitness grâce à des outils 
                  de suivi précis et personnalisables.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="text-indigo-400" size={24} />
                  <h3 className="text-lg text-white font-semibold">Sécurité</h3>
                </div>
                <p className="text-gray-400">
                  La protection de vos données personnelles est notre priorité. Nous utilisons les 
                  dernières technologies de sécurité pour garantir la confidentialité de vos informations.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="text-indigo-400" size={24} />
                  <h3 className="text-lg text-white font-semibold">Communauté</h3>
                </div>
                <p className="text-gray-400">
                  Rejoignez une communauté de passionnés qui partagent les mêmes objectifs et 
                  progressez ensemble vers une meilleure version de vous-même.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl text-white font-semibold">Notre Engagement</h2>
              <p className="text-gray-400">
                Nous nous engageons à maintenir une plateforme transparente, sécurisée et en constante 
                évolution. Vos retours sont précieux et nous aident à améliorer continuellement nos 
                services pour mieux répondre à vos besoins.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
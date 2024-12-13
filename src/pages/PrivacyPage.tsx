import React from 'react';
import { Shield, Lock, UserCheck, Database } from 'lucide-react';
import LegalHeader from '../components/LegalHeader';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <LegalHeader />
      <div className="flex-grow pt-32 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl text-white sm:text-4xl font-bold">Politique de Confidentialité</h1>
          </div>

          <div className="space-y-8">
            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Introduction</h2>
              </div>
              <p className="text-gray-400">
                Chez Musclecrack, nous accordons une importance capitale à la protection de vos données 
                personnelles. Cette politique de confidentialité explique comment nous collectons, 
                utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
              </p>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Données Collectées</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Nous collectons uniquement les informations nécessaires au bon fonctionnement de nos services :
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>Informations de profil (nom, email)</li>
                  <li>Données physiques (poids, taille)</li>
                  <li>Données d'entraînement</li>
                  <li>Données de nutrition</li>
                  <li>Données d'activité physique</li>
                </ul>
              </div>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Protection des Données</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Nous mettons en œuvre des mesures de sécurité robustes pour protéger vos données :
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>Chiffrement des données en transit et au repos</li>
                  <li>Authentification sécurisée</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Surveillance continue de la sécurité</li>
                </ul>
              </div>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <UserCheck className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Vos Droits</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
                <p className="text-gray-400">
                  Pour exercer ces droits, contactez-nous à : hello.musclecrack@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
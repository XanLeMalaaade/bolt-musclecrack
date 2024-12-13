import React from 'react';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
import LegalHeader from '../components/LegalHeader';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <LegalHeader />
      <div className="flex-grow pt-32 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl text-white sm:text-4xl font-bold">Conditions Générales d'Utilisation</h1>
          </div>

          <div className="space-y-8">
            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Acceptation des Conditions</h2>
              </div>
              <p className="text-gray-400">
                En utilisant Musclecrack, vous acceptez ces conditions d'utilisation dans leur 
                intégralité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre 
                service.
              </p>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Utilisation du Service</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  En tant qu'utilisateur, vous vous engagez à :
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>Fournir des informations exactes lors de l'inscription</li>
                  <li>Maintenir la confidentialité de votre compte</li>
                  <li>Ne pas utiliser le service à des fins illégales</li>
                  <li>Ne pas tenter de compromettre la sécurité du service</li>
                </ul>
              </div>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Scale className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Propriété Intellectuelle</h2>
              </div>
              <p className="text-gray-400">
                Tous les droits de propriété intellectuelle relatifs à Musclecrack (incluant mais 
                non limité au code source, aux images, aux logos) sont la propriété exclusive de 
                Musclecrack ou de ses concédants de licence.
              </p>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="text-indigo-400" size={24} />
                <h2 className="text-2xl text-white font-semibold">Limitation de Responsabilité</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Musclecrack fournit le service "tel quel" et ne peut garantir :
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>La disponibilité continue du service</li>
                  <li>L'absence d'erreurs ou de bugs</li>
                  <li>L'adéquation du service à vos besoins spécifiques</li>
                </ul>
                <p className="text-gray-400">
                  Consultez un professionnel de santé avant de commencer tout programme d'entraînement 
                  ou de nutrition.
                </p>
              </div>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl text-white font-semibold">Modifications des Conditions</h2>
              <p className="text-gray-400">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                entrent en vigueur dès leur publication. La continuation de l'utilisation du service 
                après modification constitue l'acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="bg-gray-900 rounded-xl p-6 space-y-4">
              <h2 className="text-2xl text-white font-semibold">Contact</h2>
              <p className="text-gray-400">
                Pour toute question concernant ces conditions, contactez-nous à : 
                hello.musclecrack@gmail.com
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
import React from 'react';
import { Moon, Clock, TrendingUp } from 'lucide-react';

export default function SleepPage() {
  return (
    <div className="sm:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Sommeil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Moon className="text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold">Dernière nuit</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Durée totale</h3>
              <p className="text-2xl font-bold">7h 30m</p>
              <p className="text-sm text-green-400">+30min objectif</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Qualité</h3>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-green-400">Excellent</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Couché</h3>
              <p className="text-2xl font-bold">22:30</p>
              <p className="text-sm text-gray-400">Comme prévu</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Levé</h3>
              <p className="text-2xl font-bold">06:00</p>
              <p className="text-sm text-gray-400">Comme prévu</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Cycles</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sommeil profond</h3>
                <p className="text-sm text-gray-400">2h 15min (30%)</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sommeil léger</h3>
                <p className="text-sm text-gray-400">4h 00min (53%)</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sommeil paradoxal</h3>
                <p className="text-sm text-gray-400">1h 15min (17%)</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="text-indigo-400" size={24} />
              <h2 className="text-xl font-semibold">Tendances</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Cette semaine</h3>
                <p className="text-sm text-gray-400">Moyenne: 7h 15min/nuit</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Ce mois</h3>
                <p className="text-sm text-gray-400">Moyenne: 7h 20min/nuit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
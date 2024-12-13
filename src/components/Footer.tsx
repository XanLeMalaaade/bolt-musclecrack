import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-white text-2xl font-bold mb-4 md:mb-0">Musclecrack</div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400">
            <Link to="/about" className="hover:text-white transition-colors">
              À propos
            </Link>
            <a 
              href="mailto:hello.musclecrack@gmail.com" 
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Conditions d'utilisations
            </Link>
          </div>
        </div>
        <div className="mt-8 text-xs text-center text-gray-500">
          © {new Date().getFullYear()} Musclecrack. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
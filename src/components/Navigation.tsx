import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Dumbbell, Apple, Footprints, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/workout', label: 'Gym', icon: Calendar },
  { path: '/progression', label: 'Progression', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrition', icon: Apple },
  { path: '/activity', label: 'Dépenses', icon: Footprints },
];

export default function Navigation() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Golden Physic</h1>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-4 sm:hidden text-white font-medium hover:text-indigo-400"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden sm:flex font-medium items-center space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 transition-colors duration-200 ${
                  isActive ? 'text-indigo-400' : 'text-white hover:text-indigo-300'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `p-2 rounded-full transition-colors duration-200 ${
              isActive ? 'bg-indigo-600 text-white' : 'text-white hover:bg-gray-800'
            }`
          }
        >
          <User size={20} />
        </NavLink>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden mt-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-2 font-medium p-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
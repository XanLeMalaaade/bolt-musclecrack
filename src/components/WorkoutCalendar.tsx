import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Workout {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: Array<{
      id: string;
      reps: string;
      weight: string;
    }>;
  }>;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  workout?: Workout;
}

interface WorkoutCalendarProps {
  onWorkoutSelect: (workout: Workout | null) => void;
}

export default function WorkoutCalendar({ onWorkoutSelect }: WorkoutCalendarProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user?.uid) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        where('date', '>=', startOfMonth.toISOString().split('T')[0]),
        where('date', '<=', endOfMonth.toISOString().split('T')[0])
      );

      try {
        const querySnapshot = await getDocs(q);
        const workoutData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Workout[];
        setWorkouts(workoutData);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, [user, currentDate]);

  useEffect(() => {
    const generateCalendarDays = () => {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Premier jour de la semaine (lundi)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const daysInMonth = lastDayOfMonth.getDate();
  const days: CalendarDay[] = [];

  // Jours du mois précédent
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const daysInPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), daysInPreviousMonth - i),
      isCurrentMonth: false,
    });
  }

  // Jours du mois en cours
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const workout = workouts.find((w) => {
      const workoutDate = new Date(w.date);
      return (
        workoutDate.getFullYear() === date.getFullYear() &&
        workoutDate.getMonth() === date.getMonth() &&
        workoutDate.getDate() === date.getDate()
      );
    });

    days.push({
      date,
      isCurrentMonth: true,
      workout,
    });
  }

  // Jours du mois suivant
  const remainingDays = 42 - days.length; // 6 semaines complètes
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
      isCurrentMonth: false,
    });
  }

  setCalendarDays(days);
};


  
    generateCalendarDays();
  }, [currentDate, workouts]);

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    setSelectedDate(null);
    onWorkoutSelect(null);
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    onWorkoutSelect(day.workout || null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => changeMonth(-1)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="sm:text-xl text-md font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <select
          value={currentDate.getMonth()}
          onChange={(e) => {
            setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
            setSelectedDate(null);
            onWorkoutSelect(null);
          }}
          className="bg-gray-800 text-white px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              aspect-square p-2 rounded-lg text-sm
              ${day.isCurrentMonth && !isSelected(day.date) ? 'hover:bg-gray-700' : ''}
              ${isToday(day.date) ? 'ring-2 ring-indigo-500' : ''}
              ${isSelected(day.date) ? 'bg-indigo-600 text-white' : 'bg-gray-800'}
              ${day.workout ? 'font-semibold' : ''}
              ${!day.isCurrentMonth ? 'bg-gray-900' : ''}
            `}
          >
            <div className="flex flex-col h-full">
              <span className="sm:text-right sm:mb-1">{day.date.getDate()}</span>
              {day.workout && (
                <span className="text-xs truncate text-left">
                  {day.workout.name}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
import React, { useRef, useState, useEffect } from 'react';
import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  hasWorkout?: (date: Date) => boolean;
}

export default function WeekCalendar({ selectedDate, onDateChange, hasWorkout }: WeekCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -7 : 7);
    onDateChange(newDate);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSignificantSwipe = Math.abs(distance) > containerRef.current!.offsetWidth * 0.5;

    if (isSignificantSwipe) {
      if (distance > 0) {
        navigateWeek('next');
      } else {
        navigateWeek('prev');
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="bg-gray-900 sm:rounded-md md:px-3">
      <div className="flex items-center justify-between px-7 pt-2">
        <div className="text-xl font-semibold">
          {format(selectedDate, 'MMMM yyyy', { locale: fr })}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onDateChange(new Date())}
            className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {!isMobile && (
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 bg-gray-800/80 rounded-full text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={containerRef}
          className="grid grid-cols-7 flex-grow touch-pan-x"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {days.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const hasWorkoutOnDate = hasWorkout?.(date);
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateChange(date)}
                className={`flex flex-col items-center py-3 rounded-lg transition-colors
                  ${isSelected ? 'bg-indigo-600/20' : 'hover:bg-gray-800/50'}`}
              >
                <span className={`text-xs font-normal ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                  {format(date, 'EEE', { locale: fr })}
                </span>
                <span className={`text-lg font-medium ${isSelected ? 'text-indigo-400' : 'text-white'}`}>
                  {format(date, 'd')}
                </span>
                <div className="h-1.5 mt-[2px] flex items-center space-x-1">
                  {hasWorkoutOnDate && (
                    <div className={`w-1.5 h-1.5 rounded-full 
                      ${isSelected ? 'bg-indigo-400' : 'bg-gray-400'}`} 
                    />
                  )}
                  {isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!isMobile && (
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 bg-gray-800/80 rounded-full text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

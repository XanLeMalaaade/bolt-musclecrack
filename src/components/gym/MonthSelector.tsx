import React from 'react';
import { ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedDate: Date;
  onMonthChange: (date: Date) => void;
}

export default function MonthSelector({ selectedDate, onMonthChange }: MonthSelectorProps) {
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-').map(Number);
    const newDate = new Date(year, month);
    onMonthChange(newDate);
  };

  const currentValue = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleMonthChange}
        className="appearance-none bg-gray-800/50 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {Array.from({ length: 12 }, (_, i) => {
          const date = new Date(selectedDate.getFullYear(), i);
          return (
            <option key={i} value={`${date.getFullYear()}-${i}`}>
              {format(date, 'MMMM yyyy', { locale: fr })}
            </option>
          );
        })}
      </select>
      <ChevronDown 
        size={20} 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
      />
    </div>
  );
}
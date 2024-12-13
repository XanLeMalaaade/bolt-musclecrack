import React from 'react';
import { Clock } from 'lucide-react';

interface Set {
  id: string;
  reps: string;
  weight: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Workout {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  exercises: Exercise[];
}

interface WorkoutDetailsProps {
  workout: Workout;
}

export default function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 sm:p-6 mt-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{workout.name}</h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-400">
            <p>
              {new Date(workout.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Clock size={16} />
              <span>{workout.duration} min</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workout.exercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-800 p-3 rounded-lg border-[1.5px] border-gray-700">
              <h4 className="font-medium mb-2">{exercise.name}</h4>
              <div className="space-y-1">
                {exercise.sets.map((set, index) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0 text-sm text-gray-300"
                  >
                    <span className="text-gray-400">{set.reps} reps</span>
                    <span className="font-semibold text-gray-200">{set.weight}kg</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
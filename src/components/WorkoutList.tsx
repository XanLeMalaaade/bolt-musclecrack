import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Pencil } from 'lucide-react';

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

interface WorkoutsByDate {
  key: string;
  title: string;
  workouts: Workout[];
}

interface WorkoutListProps {
  workouts: Workout[];
  onWorkoutClick: (workout: Workout) => void;
}

export default function WorkoutList({ workouts, onWorkoutClick }: WorkoutListProps) {
  const [showPlannedWorkouts, setShowPlannedWorkouts] = useState(false);

  const organizeWorkoutsByDate = (): WorkoutsByDate[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const todayWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === now.getTime();
    });

    const futureWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate > now;
    });

    const pastWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate < now;
    });

    const sections: WorkoutsByDate[] = [];

    if (todayWorkouts.length > 0) {
      sections.push({
        key: "today",
        title: "Aujourd'hui",
        workouts: todayWorkouts
      });
    }

    if (futureWorkouts.length > 0) {
      sections.push({
        key: "planned",
        title: `Planifiés (${futureWorkouts.length})`,
        workouts: futureWorkouts
      });
    }

    if (pastWorkouts.length > 0) {
      sections.push({
        key: 'past',
        title: 'Passés',
        workouts: pastWorkouts
      });
    }

    return sections;
  };

  const workoutSections = organizeWorkoutsByDate();

  return (
    <div className="space-y-8 sm:space-y-12">
      {workoutSections.map((section) => (
        <div key={section.key} className="space-y-4">
          <div
            className={`flex items-center justify-between p-2 ${
              section.key === 'planned' ? 'cursor-pointer hover:bg-gray-800 rounded-lg transition-all duration-200 ease-in-out' : ''
            }`}
            onClick={section.key === 'planned' ? () => setShowPlannedWorkouts(!showPlannedWorkouts) : undefined}
          >
            <h3 className="text-lg font-medium text-gray-300">
              {section.title}
            </h3>
            {section.key === 'planned' && (
              <button className="text-indigo-400 px-3 py-2 rounded-lg">
                {showPlannedWorkouts ? "Masquer les entraînements" : "Afficher les entraînements"}
              </button>
            )}
          </div>

          {(section.key !== 'planned' || showPlannedWorkouts) && (
            <div className="space-y-4">
              {section.workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg flex items-center space-x-2">
                        <span>{workout.name}</span>
                      </h3>
                      <button
                        onClick={() => onWorkoutClick(workout)}
                        className="p-2 rounded-full text-indigo-400 hover:bg-gray-700 focus:outline-none"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>

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
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
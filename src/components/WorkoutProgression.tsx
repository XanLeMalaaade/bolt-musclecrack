import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown } from 'lucide-react';

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

interface ProgressionDataPoint {
  date: string;
  weight: number;
  volume: number;
  rawDate: string;
  sets: Set[];
}

interface WorkoutProgressionProps {
  workouts: Workout[];
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="p-3 bg-gray-800 text-white rounded shadow-lg text-sm">
        <p className="font-normal text-base">{data.date}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="flex justify-start text-base pt-2 -pb-2"
            style={{ color: entry.color }}
          >
            {entry.name === "Poids (kg)" && `Poids max (kg) : ${entry.value}`}
            {entry.name === "Volume (kg)" && `Volume total (kg) : ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function WorkoutProgression({
  workouts,
  selectedExercise,
  onExerciseChange
}: WorkoutProgressionProps) {
  const [selectedPoint, setSelectedPoint] = React.useState<ProgressionDataPoint | null>(null);

  const getAllExerciseNames = () => {
    const exerciseNames = new Set<string>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseNames.add(exercise.name);
      });
    });
    return Array.from(exerciseNames);
  };

  const getExerciseProgressionData = (exerciseName: string): ProgressionDataPoint[] => {
    const progressionData: ProgressionDataPoint[] = [];
    const now = new Date();

    workouts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(workout => {
        const workoutDate = new Date(workout.date);
        if (workoutDate > now) {
          return;
        }

        workout.exercises
          .filter(exercise => exercise.name === exerciseName)
          .forEach(exercise => {
            const maxWeight = Math.max(...exercise.sets.map(set => parseFloat(set.weight) || 0));
            const totalVolume = exercise.sets.reduce((acc, set) => {
              const reps = parseFloat(set.reps) || 0;
              const weight = parseFloat(set.weight) || 0;
              return acc + (reps * weight);
            }, 0);

            if (maxWeight > 0 || totalVolume > 0) {
              progressionData.push({
                date: new Date(workout.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                weight: maxWeight,
                volume: totalVolume,
                rawDate: workout.date,
                sets: exercise.sets
              });
            }
          });
      });

    return progressionData;
  };

  const handlePointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelectedPoint(data.activePayload[0].payload);
    }
  };

  const exerciseNames = getAllExerciseNames();
  const progressionData = selectedExercise ? getExerciseProgressionData(selectedExercise) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="text-gray-400">Sélectionner un exercice:</label>
        
        <div className="relative w-full sm:w-auto">
          <select
            value={selectedExercise}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none pr-10"
          >
            <option value="">Choisir un exercice</option>
            {exerciseNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown size={20}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white pointer-events-none"
          />
        </div>
      </div>

      {selectedExercise && (
        <>
          <div className="h-60 sm:h-80 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={progressionData}
                onClick={handlePointClick}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="Poids (kg)"
                  stroke="#818CF8"
                  strokeWidth={2}
                  activeDot={{
                    r: 8,
                    style: { cursor: 'pointer' },
                  }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Volume (kg)"
                  stroke="#34D399"
                  strokeWidth={2}
                  activeDot={{
                    r: 8,
                    style: { cursor: 'pointer' },
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {selectedPoint && (
            <div className="mt-6 bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">
                Détails du {new Date(selectedPoint.rawDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-2">
                {selectedPoint.sets.map((set: Set, index: number) => (
                  <div key={set.id} className="flex justify-between items-center text-gray-300">
                    <span>Série {index + 1}</span>
                    <div className="space-x-4">
                      <span>{set.reps} répétitions</span>
                      <span>{set.weight} kg</span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-gray-300">
                    <span>Poids maximum:</span>
                    <span>{selectedPoint.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Volume total:</span>
                    <span>{selectedPoint.volume} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
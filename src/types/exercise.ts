export interface Exercise {
    id: string;
    name: {
      en: string;
      fr: string;
    };
    category: string;
    equipment: string;
    description: string;
    imageURL: string;
  }
  
  export interface ExerciseSet {
    id: string;
    reps: string;
    weight: string;
  }
  
  export interface WorkoutExercise {
    id: string;
    exerciseId: string;
    sets: ExerciseSet[];
  }
  
  export interface Workout {
    id?: string;
    name: string;
    date: string;
    time: string;
    duration: string;
    exercises: WorkoutExercise[];
  }
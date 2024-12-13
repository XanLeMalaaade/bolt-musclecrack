import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Exercise } from '../types/exercise';

export async function getAllExercises(): Promise<Exercise[]> {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(exercisesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exercise[];
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}
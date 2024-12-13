import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useLanguage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setLanguage(userDoc.data().language || 'fr');
          }
        } catch (error) {
          console.error('Error fetching language preference:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchLanguagePreference();
  }, [user]);

  return { language, loading };
}
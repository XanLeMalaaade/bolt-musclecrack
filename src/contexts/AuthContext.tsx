import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  browserSessionPersistence,
  setPersistence,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, sanitizeUserData } from '../lib/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<{ [email: string]: { count: number; timestamp: number } }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const checkLoginAttempts = (email: string) => {
    const attempts = loginAttempts[email];
    if (attempts) {
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const timeSinceLockout = Date.now() - attempts.timestamp;
        if (timeSinceLockout < LOCKOUT_DURATION) {
          throw new Error(`Compte temporairement bloqué. Réessayez dans ${Math.ceil((LOCKOUT_DURATION - timeSinceLockout) / 60000)} minutes.`);
        } else {
          setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, timestamp: Date.now() } }));
        }
      }
    }
  };

  const updateLoginAttempts = (email: string, success: boolean) => {
    if (success) {
      setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, timestamp: Date.now() } }));
    } else {
      const currentAttempts = loginAttempts[email]?.count || 0;
      setLoginAttempts(prev => ({
        ...prev,
        [email]: { count: currentAttempts + 1, timestamp: Date.now() }
      }));
    }
  };

  const deleteAccount = async (password: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) throw new Error('Utilisateur non connecté');

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      const collections = ['workouts', 'nutrition', 'activity', 'weightHistory'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);

      localStorage.clear();
      sessionStorage.clear();

    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      }
      throw new Error('Une erreur est survenue lors de la suppression du compte');
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, () => {});
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);

      const userData = sanitizeUserData({
        name,
        email,
        language: 'fr', // Set default language to French
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      sessionStorage.setItem('pendingVerificationEmail', email);
      
      await firebaseSignOut(auth);
      unsubscribe();

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      } else {
        throw new Error('Une erreur est survenue lors de la création du compte');
      }
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      checkLoginAttempts(email);
      
      await setPersistence(auth, rememberMe ? browserSessionPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        sessionStorage.setItem('pendingVerificationEmail', email);
        await sendEmailVerification(userCredential.user);
        throw new Error('Veuillez vérifier votre adresse email avant de vous connecter. Un nouveau lien de vérification vient de vous être envoyé.');
      }
      
      updateLoginAttempts(email, true);
    } catch (error: any) {
      // Ne pas incrémenter le compteur si l'email n'est pas vérifié
      if (error.message.includes('Veuillez vérifier votre adresse email')) {
        throw error;
      }
      
      updateLoginAttempts(email, false);
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Veuillez vérifier votre adresse email');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.clear();
    sessionStorage.clear();
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte n\'est associé à cette adresse email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Format d\'email invalide');
      }
      throw new Error('Une erreur est survenue lors de la réinitialisation du mot de passe');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      resetPassword,
      sendVerificationEmail,
      deleteAccount
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
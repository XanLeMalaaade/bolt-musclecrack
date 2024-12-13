import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import WorkoutPage from './pages/WorkoutPage';
import ProgressionPage from './pages/ProgressionPage';
import NutritionPage from './pages/NutritionPage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import OnboardingModal from './components/OnboardingModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);

  React.useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setShowOnboarding(!userData.onboardingCompleted);
          } else {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return (
    <>
      {children}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/workout';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (user?.emailVerified) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  const publicPaths = ['/', '/about', '/privacy', '/terms', '/auth', '/verify-email', '/confirm-email'];
  const isPublicPath = publicPaths.includes(location.pathname);

  if (!user && !isPublicPath) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user?.emailVerified ? (
            <Navigate to="/workout" replace />
          ) : (
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          )
        }
      />

      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <EmailVerificationPage />
          </PublicRoute>
        }
      />

      <Route
        path="/confirm-email"
        element={<EmailConfirmationPage />}
      />

      {/* Routes protégées */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <div className="min-h-screen bg-gray-950 text-white flex flex-col">
              <Navigation />
              <main className="container mx-auto flex-grow">
                <Routes>
                  <Route path="/workout" element={<WorkoutPage />} />
                  <Route path="/progression" element={<ProgressionPage />} />
                  <Route path="/nutrition" element={<NutritionPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/workout" replace />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        }
      />

      {/* Routes publiques */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
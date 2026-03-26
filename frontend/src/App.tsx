import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import LessonsPage from '@/pages/LessonsPage';
import LessonPage from '@/pages/LessonPage';
import ProfilePage from '@/pages/ProfilePage';

// Lesson modules (Phase 3)
import Lesson1Page from '@/lessons/lesson1/Lesson1Page';
import Lesson2Page from '@/lessons/lesson2/Lesson2Page';
import Lesson3Page from '@/lessons/lesson3/Lesson3Page';

// Layout & Guards
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import Onboarding from '@/components/Onboarding';

export default function App() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Show onboarding for new users after first login
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('dutch_app_onboarded')) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#1E3A5F] font-medium">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding overlay for first-time users */}
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/lessons/1" element={<Lesson1Page />} />
            <Route path="/lessons/2" element={<Lesson2Page />} />
            <Route path="/lessons/3" element={<Lesson3Page />} />
            <Route path="/lessons/:id" element={<LessonPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

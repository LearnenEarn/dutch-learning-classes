import { useEffect } from 'react';
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

// Layout
import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';

export default function App() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dutch-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dutch-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dutch-blue font-medium">Laden...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

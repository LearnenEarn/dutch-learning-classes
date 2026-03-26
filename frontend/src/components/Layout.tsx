import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { useEffect } from 'react';
import clsx from 'clsx';

export default function Layout() {
  const { user, logout, setLanguage } = useAuthStore();
  const { stats, loadStats } = useProgressStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', emoji: '🏠' },
    { to: '/lessons', label: 'Lessen', emoji: '📚' },
    { to: '/profile', label: 'Profiel', emoji: '👤' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-dutch-blue text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇱</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">Learn Dutch</p>
              <p className="text-xs text-blue-200">SRH Haarlem</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10'
                  )
                }
              >
                {item.emoji} {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {/* XP display */}
            {stats && (
              <div className="hidden md:flex items-center gap-1 bg-dutch-orange/20 px-3 py-1 rounded-full">
                <span className="text-sm">⭐</span>
                <span className="text-sm font-semibold">{stats.xp_total} XP</span>
              </div>
            )}

            {/* Streak display */}
            {stats && stats.streak_days > 0 && (
              <div className="hidden md:flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold">{stats.streak_days}</span>
              </div>
            )}

            {/* Language toggle */}
            <button
              onClick={() =>
                setLanguage(user?.language_pref === 'en' ? 'fa' : 'en')
              }
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
              title="Toggle language"
            >
              {user?.language_pref === 'en' ? '🇮🇷 فارسی' : '🇬🇧 English'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sm text-blue-200 hover:text-white transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors',
                isActive ? 'text-dutch-blue' : 'text-gray-500'
              )
            }
          >
            <span className="text-xl mb-0.5">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

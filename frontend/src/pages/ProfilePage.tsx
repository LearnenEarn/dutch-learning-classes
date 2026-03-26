import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';

export default function ProfilePage() {
  const { user, setLanguage } = useAuthStore();
  const { stats, progress, loadStats, loadProgress } = useProgressStore();

  useEffect(() => {
    loadStats();
    loadProgress();
  }, [loadStats, loadProgress]);

  const completedLessons = Object.values(progress).filter((p) => p.completed).length;
  const totalAttempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Mijn Profiel</h1>

      {/* User info card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-dutch-blue rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">{user?.display_name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-blue-50 text-dutch-blue text-xs mt-1">
              {user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'XP Totaal', value: stats?.xp_total ?? 0, icon: '⭐' },
          { label: 'Streak', value: `${stats?.streak_days ?? 0} dagen`, icon: '🔥' },
          { label: 'Lessen voltooid', value: completedLessons, icon: '✅' },
          { label: 'Pogingen', value: totalAttempts, icon: '🎯' },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <span className="text-2xl">{stat.icon}</span>
            <p className="font-bold text-xl mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Language preference */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Taalkeuze</h3>
        <p className="text-sm text-gray-500 mb-4">
          Kies welke taal je naast Nederlands wilt zien:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              user?.language_pref === 'en'
                ? 'border-dutch-blue bg-dutch-blue text-white'
                : 'border-gray-200 text-gray-600 hover:border-dutch-blue'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLanguage('fa')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              user?.language_pref === 'fa'
                ? 'border-dutch-blue bg-dutch-blue text-white'
                : 'border-gray-200 text-gray-600 hover:border-dutch-blue'
            }`}
          >
            🇮🇷 فارسی
          </button>
        </div>
      </div>

      {/* Badges */}
      {stats?.badges && stats.badges.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Badges</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.badges?.length === 0 && (
        <div className="card text-center py-8 text-gray-500">
          <p className="text-3xl mb-2">🏅</p>
          <p className="font-medium">Voltooi lessen om badges te verdienen!</p>
        </div>
      )}
    </div>
  );
}

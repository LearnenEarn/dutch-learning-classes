import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { lessonsApi, leaderboardApi, dailyApi } from '@/api/client';
import type { Lesson } from '@/types';
import type { LeaderboardEntry } from '@/api/demo';

const LESSON_EMOJIS: Record<number, string> = {
  1: '🏠', 2: '🧍', 3: '⏰', 4: '🍽️', 5: '💼', 6: '🚆', 7: '🤝', 8: '🎓',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

interface WordOfDay {
  word_nl: string;
  word_en: string;
  example_nl: string;
  example_en: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { stats, progress, loadProgress, loadStats } = useProgressStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null);

  useEffect(() => {
    loadProgress();
    loadStats();
    lessonsApi.list().then(setLessons).catch(console.error);
    leaderboardApi.get().then(setLeaderboard).catch(console.error);
    dailyApi.getWordOfTheDay().then(setWordOfDay).catch(console.error);
  }, [loadProgress, loadStats]);

  const publishedLessons = lessons.filter((l) => l.is_published);
  const completedCount = publishedLessons.filter(
    (l) => progress[l.id]?.completed
  ).length;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* ── Welcome Banner ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2D5F8A] rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm font-medium">{getGreeting()} 👋</p>
        <h1 className="text-2xl font-bold mt-1">
          {user?.display_name}
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          SRH Haarlem · Basis Nederlands (A1 NT2)
        </p>

        <div className="flex gap-6 mt-5">
          <div>
            <p className="text-2xl font-bold">{stats?.xp_total ?? 0}</p>
            <p className="text-xs text-blue-200">XP totaal</p>
          </div>
          <div className="w-px bg-blue-400/30" />
          <div>
            <p className="text-2xl font-bold">🔥 {stats?.streak_days ?? 0}</p>
            <p className="text-xs text-blue-200">Dagen streak</p>
          </div>
          <div className="w-px bg-blue-400/30" />
          <div>
            <p className="text-2xl font-bold">{completedCount}/{publishedLessons.length}</p>
            <p className="text-xs text-blue-200">Lessen voltooid</p>
          </div>
        </div>
      </div>

      {/* ── Word of the Day ─────────────────────────────────────── */}
      {wordOfDay && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📖</span>
            <h3 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">Woord van de dag</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{wordOfDay.word_nl}</p>
          <p className="text-sm text-gray-600 mb-3">"{wordOfDay.word_en}"</p>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-sm text-gray-800 italic">"{wordOfDay.example_nl}"</p>
            <p className="text-xs text-gray-500 mt-1">{wordOfDay.example_en}</p>
          </div>
        </div>
      )}

      {/* ── Overall Progress ────────────────────────────────────── */}
      {publishedLessons.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm text-gray-700">Voortgang naar A1 NT2</p>
            <p className="text-sm font-bold text-[#FF6B00]">
              {Math.round((completedCount / publishedLessons.length) * 100)}%
            </p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFB347] rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / publishedLessons.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Main Content Grid ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lessons — takes 2 columns */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Jouw Lessen
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {lessons.map((lesson) => {
              const lessonProgress = progress[lesson.id];
              const isCompleted = lessonProgress?.completed ?? false;
              const score = lessonProgress?.score ?? 0;
              const maxScore = lessonProgress?.max_score ?? 100;

              return (
                <Link
                  key={lesson.id}
                  to={lesson.is_published ? `/lessons/${lesson.id}` : '#'}
                  className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 block transition-all duration-200 ${
                    lesson.is_published
                      ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{LESSON_EMOJIS[lesson.week] ?? '📖'}</span>
                    {isCompleted && (
                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Voltooid</span>
                    )}
                    {!lesson.is_published && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Binnenkort</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                    Week {lesson.week}
                  </p>
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {lesson.title_nl}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lesson.title_en}</p>

                  {lesson.is_published && lessonProgress && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFB347] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar — Leaderboard + Badges */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏆</span> Leaderboard
            </h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    entry.user_id === 'demo-user-001' ? 'bg-orange-50 border border-orange-200' : ''
                  }`}
                >
                  <span className={`font-bold text-lg w-6 text-center ${
                    entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.display_name}</p>
                    <p className="text-xs text-gray-500">{entry.xp_total} XP · 🔥{entry.streak_days}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          {stats?.badges && Array.isArray(stats.badges) && stats.badges.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎖️</span> Jouw Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge: { id: string; name: string; icon: string; description: string }) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                    title={badge.description}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

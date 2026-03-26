import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { lessonsApi } from '@/api/client';
import type { Lesson } from '@/types';

const LESSON_EMOJIS: Record<number, string> = {
  1: '🏠', 2: '🧍', 3: '⏰', 4: '🍽️', 5: '💼', 6: '🚆', 7: '🤝', 8: '🎓',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { stats, progress, loadProgress, loadStats } = useProgressStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    loadProgress();
    loadStats();
    lessonsApi.list().then(setLessons).catch(console.error);
  }, [loadProgress, loadStats]);

  const publishedLessons = lessons.filter((l) => l.is_published);
  const completedCount = publishedLessons.filter(
    (l) => progress[l.id]?.completed
  ).length;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-dutch-blue to-dutch-sky rounded-2xl p-6 text-white">
        <p className="text-blue-100 text-sm font-medium">Goedemorgen 👋</p>
        <h1 className="font-display text-2xl font-bold mt-1">
          {user?.display_name}
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          SRH Haarlem · Basis Nederlands
        </p>

        {/* Stats row */}
        <div className="flex gap-6 mt-5">
          <div>
            <p className="text-2xl font-bold">{stats?.xp_total ?? 0}</p>
            <p className="text-xs text-blue-200">XP totaal</p>
          </div>
          <div className="w-px bg-blue-400/30" />
          <div>
            <p className="text-2xl font-bold">{stats?.streak_days ?? 0}</p>
            <p className="text-xs text-blue-200">Dagen actief</p>
          </div>
          <div className="w-px bg-blue-400/30" />
          <div>
            <p className="text-2xl font-bold">{completedCount}/{publishedLessons.length}</p>
            <p className="text-xs text-blue-200">Lessen voltooid</p>
          </div>
        </div>
      </div>

      {/* Progress bar across all lessons */}
      {publishedLessons.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm">Voortgang</p>
            <p className="text-sm text-gray-500">
              {Math.round((completedCount / publishedLessons.length) * 100)}%
            </p>
          </div>
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{
                width: `${(completedCount / publishedLessons.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Lessons grid */}
      <div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
          Jouw Lessen
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => {
            const lessonProgress = progress[lesson.id];
            const isCompleted = lessonProgress?.completed ?? false;
            const score = lessonProgress?.score ?? 0;
            const maxScore = lessonProgress?.max_score ?? 100;

            return (
              <Link
                key={lesson.id}
                to={lesson.is_published ? `/lessons/${lesson.id}` : '#'}
                className={`card block transition-all duration-200 ${
                  lesson.is_published
                    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{LESSON_EMOJIS[lesson.week] ?? '📖'}</span>
                  {isCompleted && (
                    <span className="badge bg-green-100 text-green-700">✓ Voltooid</span>
                  )}
                  {!lesson.is_published && (
                    <span className="badge bg-gray-100 text-gray-500">Binnenkort</span>
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
                    <div className="xp-bar">
                      <div
                        className="xp-fill"
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

      {/* Badges section */}
      {stats?.badges && stats.badges.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4">
            Jouw Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="card flex items-center gap-2 px-4 py-2 !p-3"
                title={badge.description}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

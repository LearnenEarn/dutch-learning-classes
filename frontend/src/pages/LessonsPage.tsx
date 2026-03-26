import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonsApi } from '@/api/client';
import { useProgressStore } from '@/store/progressStore';
import type { Lesson } from '@/types';

const LESSON_EMOJIS: Record<number, string> = {
  1: '🏠', 2: '🧍', 3: '⏰', 4: '🍽️', 5: '💼', 6: '🚆', 7: '🤝', 8: '🎓',
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { progress, loadProgress } = useProgressStore();

  useEffect(() => {
    loadProgress();
    lessonsApi.list().then(setLessons).catch(console.error);
  }, [loadProgress]);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Alle Lessen</h1>
        <p className="text-gray-500 text-sm mt-1">8-weekse cursus Basis Nederlands</p>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson, idx) => {
          const lessonProgress = progress[lesson.id];
          const isCompleted = lessonProgress?.completed ?? false;
          const isLocked = !lesson.is_published;

          return (
            <Link
              key={lesson.id}
              to={!isLocked ? `/lessons/${lesson.id}` : '#'}
              className={`card flex items-center gap-4 transition-all duration-200 ${
                !isLocked
                  ? 'hover:shadow-md hover:-translate-y-0.5'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Week number indicator */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-100'
                    : isLocked
                    ? 'bg-gray-100'
                    : 'bg-dutch-cream'
                }`}
              >
                {isCompleted ? '✅' : LESSON_EMOJIS[lesson.week] ?? '📖'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Week {lesson.week}
                </p>
                <h3 className="font-semibold text-gray-900 truncate">{lesson.title_nl}</h3>
                <p className="text-xs text-gray-500 truncate">{lesson.title_en}</p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {isCompleted && (
                  <span className="badge bg-green-100 text-green-700">Voltooid</span>
                )}
                {isLocked && (
                  <span className="badge bg-gray-100 text-gray-500">🔒 Binnenkort</span>
                )}
                {!isCompleted && !isLocked && (
                  <span className="text-dutch-blue text-sm font-medium">→</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsApi } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import type { LessonWithExercises } from '@/types';

const COMING_SOON_THEMES: Record<number, { emoji: string; preview: string[] }> = {
  4: {
    emoji: '🍽️',
    preview: ['Food & drinks vocabulary', 'Ordering in a restaurant', 'Shopping phrases', 'Numbers 1–100'],
  },
  5: {
    emoji: '💼',
    preview: ['Workplace vocabulary', 'Study-related terms', 'SRH Haarlem context', 'Daily routines'],
  },
  6: {
    emoji: '🚆',
    preview: ['Public transport (NS, tram)', 'Asking for directions', 'Dutch cities & geography', 'Travel phrases'],
  },
  7: {
    emoji: '🤝',
    preview: ['Dutch greetings & customs', 'Invitations & celebrations', 'Social situations', 'Gezellig!'],
  },
  8: {
    emoji: '🎓',
    preview: ['Full 7-week review', 'A1 NT2 practice format', 'Mock test exercises', 'Certificate preparation'],
  },
};

/**
 * Generic lesson page — used for published lessons without a dedicated module,
 * and for "coming soon" stubs (lessons 4-8).
 */
export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { progress } = useProgressStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const lang = user?.language_pref ?? 'en';
  const lessonId = Number(id);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    lessonsApi
      .get(lessonId)
      .then(setLesson)
      .catch(() => setError('Les niet gevonden.'))
      .finally(() => setIsLoading(false));
  }, [id, lessonId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-dutch-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-4">😕</p>
        <p className="font-semibold text-gray-700">{error || 'Les niet gevonden'}</p>
        <button onClick={() => navigate('/lessons')} className="btn-ghost mt-4">
          ← Terug naar lessen
        </button>
      </div>
    );
  }

  // Coming soon for unpublished lessons
  if (!lesson.is_published) {
    const theme = COMING_SOON_THEMES[lesson.week] ?? { emoji: '📖', preview: [] };
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
        <button onClick={() => navigate('/lessons')} className="btn-ghost">
          ← Terug naar lessen
        </button>

        <div className="card text-center py-12">
          <span className="text-6xl">{theme.emoji}</span>
          <h1 className="font-display text-2xl font-bold text-gray-900 mt-4">
            Week {lesson.week}: {lesson.title_nl}
          </h1>
          <p className="text-gray-500 mt-1">{lesson.title_en}</p>

          <div className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-medium px-4 py-2 rounded-xl text-sm">
            🚧 Deze les wordt binnenkort beschikbaar
          </div>

          {theme.preview.length > 0 && (
            <div className="mt-8 text-left max-w-sm mx-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3">Wat je gaat leren:</p>
              <ul className="space-y-2">
                {theme.preview.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-dutch-cream flex items-center justify-center text-xs">
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => navigate('/lessons')} className="btn-primary mt-8">
            ← Terug naar lessen
          </button>
        </div>
      </div>
    );
  }

  // Fallback for published lessons without a dedicated module
  const description = lang === 'fa' ? lesson.description_fa : lesson.description_en;
  const lessonProgress = progress[lessonId];

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl mx-auto">
      <button onClick={() => navigate('/lessons')} className="btn-ghost">
        ← Terug naar lessen
      </button>

      <div className="card bg-gradient-to-br from-dutch-blue to-dutch-sky text-white">
        <p className="text-sm text-blue-200 font-medium">Week {lesson.week}</p>
        <h1 className="font-display text-2xl font-bold mt-1">{lesson.title_nl}</h1>
        <p className="text-blue-100 text-sm mt-0.5">{lesson.title_en}</p>
        {description && (
          <p className="text-blue-100 text-sm mt-3 leading-relaxed">{description}</p>
        )}
        <div className="flex items-center gap-2 mt-4 text-sm text-blue-200">
          <span>📝 {lesson.exercises.length} oefeningen</span>
          {lessonProgress?.completed && <span>· ✅ Voltooid</span>}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-900">Oefeningen</h2>
        {lesson.exercises.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <p className="text-3xl mb-3">🚧</p>
            <p className="font-medium">Oefeningen worden binnenkort toegevoegd.</p>
          </div>
        ) : (
          lesson.exercises.map((exercise) => (
            <div key={exercise.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge bg-blue-50 text-dutch-blue text-xs mb-2">
                    {exercise.type.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-medium text-gray-800">
                    {lang === 'fa' ? exercise.prompt_fa : exercise.prompt_en}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  +{exercise.xp_reward} XP
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

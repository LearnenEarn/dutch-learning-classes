import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsApi } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { LessonWithExercises } from '@/types';

// Placeholder — lesson-specific game modules will be implemented in Phase 3
export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const lang = user?.language_pref ?? 'en';

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    lessonsApi
      .get(Number(id))
      .then(setLesson)
      .catch(() => setError('Les niet gevonden.'))
      .finally(() => setIsLoading(false));
  }, [id]);

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

  const description = lang === 'fa' ? lesson.description_fa : lesson.description_en;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/lessons')} className="btn-ghost mb-4 -ml-2">
          ← Terug
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
          </div>
        </div>
      </div>

      {/* Exercise list placeholder */}
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

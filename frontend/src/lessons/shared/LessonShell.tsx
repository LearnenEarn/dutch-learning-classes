import type { ReactNode } from 'react';
import type { LessonWithExercises } from '@/types';

interface LessonShellProps {
  lesson: LessonWithExercises;
  completedSections: number;
  totalSections: number;
  lang: 'en' | 'fa';
  onNavigateBack: () => void;
  children: ReactNode;
}

export default function LessonShell({
  lesson,
  completedSections,
  totalSections,
  lang,
  onNavigateBack,
  children,
}: LessonShellProps) {
  const progress = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
  const description = lang === 'fa' ? lesson.description_fa : lesson.description_en;

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl mx-auto">
      {/* Back button */}
      <button onClick={onNavigateBack} className="btn-ghost -ml-2">
        ← Terug naar lessen
      </button>

      {/* Lesson header */}
      <div className="card bg-gradient-to-br from-dutch-blue to-dutch-sky text-white">
        <p className="text-sm text-blue-200 font-medium">Week {lesson.week}</p>
        <h1 className="font-display text-2xl font-bold mt-1">{lesson.title_nl}</h1>
        <p className="text-blue-100 text-sm mt-0.5">{lesson.title_en}</p>
        {description && (
          <p className="text-blue-100 text-sm mt-3 leading-relaxed opacity-90">{description}</p>
        )}

        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-blue-200">
            <span>{completedSections}/{totalSections} secties voltooid</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div>
        <h2 className="font-display text-lg font-bold text-gray-900 mb-3">Oefeningen</h2>
        {children}
      </div>
    </div>
  );
}

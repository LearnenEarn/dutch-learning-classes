/**
 * Lesson 3 — Tijd & Elementen
 * Calendar, time, clock game, nature, weather, true/false
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsApi } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import type { Exercise, LessonWithExercises } from '@/types';

import FlashcardDeck from '@/games/FlashcardDeck/FlashcardDeck';
import TimedQuiz from '@/games/TimedQuiz/TimedQuiz';
import MatchingGame from '@/games/MatchingGame/MatchingGame';
import FillInBlankGame from '@/games/FillInBlankGame/FillInBlankGame';
import DragDropGame from '@/games/DragDropGame/DragDropGame';
import ClockGame from '@/games/ClockGame/ClockGame';
import LessonShell from '@/lessons/shared/LessonShell';

const SECTION_LABELS: Record<string, string> = {
  days:              '📅 Dagen van de Week',
  months:            '🗓️ Maanden van het Jaar',
  seasons:           '🌸 De Seizoenen',
  time:              '⏰ Hoe Laat Is Het? — Clock Game',
  nature_sort:       '🌿 Categorie Sorteren — Nature Sort',
  nature:            '🌳 Natuur — Nature Vocabulary',
  weather:           '☁️ Weer — Weather',
  trivia:            '🎯 Juist of Onjuist? — True or False',
  weather_sentences: '📝 Weerzinnen — Weather Sentences',
};

export default function Lesson3Page() {
  const { user } = useAuthStore();
  const { updateLessonProgress } = useProgressStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});

  const lang = user?.language_pref ?? 'en';

  useEffect(() => {
    lessonsApi.get(3).then(setLesson).catch(console.error);
  }, []);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-dutch-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const bySection = lesson.exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const key = ex.section ?? 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ex);
    return acc;
  }, {});

  const sections = Object.entries(bySection);
  const completedSections = Object.keys(sectionScores).length;
  const totalSections = sections.length;

  const handleSectionComplete = async (section: string, score: number, total: number) => {
    const updated = { ...sectionScores, [section]: { score, total } };
    setSectionScores(updated);
    setActiveSection(null);

    if (Object.keys(updated).length >= totalSections) {
      const totalScore = Object.values(updated).reduce((s, v) => s + v.score, 0);
      const totalMax = Object.values(updated).reduce((s, v) => s + v.total, 0);
      await updateLessonProgress(3, totalScore, totalMax, true);
    }
  };

  if (activeSection) {
    const exercises = bySection[activeSection] ?? [];
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-0">
        <button onClick={() => setActiveSection(null)} className="btn-ghost">
          ← Terug naar lesoverzicht
        </button>
        <h2 className="font-display text-xl font-bold text-gray-900">
          {SECTION_LABELS[activeSection] ?? activeSection}
        </h2>

        {activeSection === 'days' || activeSection === 'months' ? (
          <FlashcardDeck
            exercises={exercises}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'seasons' || activeSection === 'nature' || activeSection === 'weather' ? (
          <MatchingGame
            pairs={(exercises[0]?.options as { pairs: { dutch: string; translation: string; translation_fa?: string }[] })?.pairs ?? []}
            exerciseId={exercises[0]?.id}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'time' ? (
          <ClockGame
            questions={exercises.map((ex) => ({
              exercise: ex,
              expression: (ex.options as { expression: string })?.expression ?? ex.answer_nl,
              time24h: (ex.options as { time_24h: string })?.time_24h ?? '12:00',
            }))}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'nature_sort' ? (
          <DragDropGame
            mode="category_sort"
            items={(exercises[0]?.options as { items: { id: string; text: string; category: string }[] })?.items ?? []}
            categories={(exercises[0]?.options as { categories: string[] })?.categories ?? []}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'trivia' ? (
          <TimedQuiz
            questions={exercises.map((ex) => {
              const opts = ex.options as { statement: string; correct: boolean; explanation: string };
              return {
                exercise: ex,
                prompt: opts.statement,
                choices: ['Juist ✓', 'Onjuist ✗'],
                correctIndex: opts.correct ? 0 : 1,
              };
            })}
            timeLimitSeconds={120}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : (
          <FillInBlankGame
            questions={exercises
              .filter((e) => e.type === 'fill_blank')
              .map((ex) => ({
                exercise: ex,
                sentence: (ex.options as { sentence: string })?.sentence ?? ex.answer_nl,
                answer: (ex.options as { answer: string })?.answer ?? ex.answer_nl,
                hint: lang === 'fa' ? ex.hint_fa ?? ex.hint_en ?? undefined : ex.hint_en ?? undefined,
              }))}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        )}
      </div>
    );
  }

  return (
    <LessonShell
      lesson={lesson}
      completedSections={completedSections}
      totalSections={totalSections}
      lang={lang}
      onNavigateBack={() => navigate('/lessons')}
    >
      <div className="space-y-3">
        {sections.map(([section, exercises]) => {
          const done = sectionScores[section];
          const label = SECTION_LABELS[section] ?? section;
          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className="w-full card text-left flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{exercises.length} oefeningen</p>
              </div>
              <div className="flex items-center gap-2">
                {done && (
                  <span className="badge bg-green-100 text-green-700">
                    {done.score}/{done.total} ✓
                  </span>
                )}
                <span className={done ? 'text-green-500' : 'text-dutch-blue'}>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </LessonShell>
  );
}

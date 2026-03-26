/**
 * Lesson 1 — De Basis & De Omgeving
 * Week 1: History of Dutch, sentence structure, pronouns, zijn/hebben,
 * articles, question words, environment vocabulary.
 *
 * Sections:
 *  1. Flashcard drill: pronouns + question words
 *  2. Timed quiz: zijn / hebben conjugation
 *  3. Timed quiz: de / het articles
 *  4. Matching: water, trade, architecture vocabulary
 *  5. Sentence order: drag-and-drop word arrangement
 *  6. Fill in the blank: grammar + phrases
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
import DragDropGame from '@/games/DragDropGame/DragDropGame';
import FillInBlankGame from '@/games/FillInBlankGame/FillInBlankGame';
import LessonShell from '@/lessons/shared/LessonShell';

const SECTION_LABELS: Record<string, string> = {
  pronouns:             '🙋 Persoonlijke Voornaamwoorden',
  question_words:       '❓ Vraagwoorden',
  zijn:                 '🔵 Zijn — To Be',
  hebben:               '🟠 Hebben — To Have',
  articles:             '📋 De & Het — The Articles',
  environment_water:    '💧 Water & Landschap',
  environment_trade:    '🏪 Handel & Markt',
  environment_architecture: '🏠 Architectuur',
  grammar:              '📐 Zinsvolgorde & Grammatica',
};

export default function Lesson1Page() {
  const { user } = useAuthStore();
  const { updateLessonProgress } = useProgressStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});

  const lang = user?.language_pref ?? 'en';

  useEffect(() => {
    lessonsApi.get(1).then(setLesson).catch(console.error);
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
    setSectionScores((prev) => ({ ...prev, [section]: { score, total } }));
    setActiveSection(null);

    // Update lesson progress after completing all sections
    const newCompleted = Object.keys(sectionScores).length + 1;
    if (newCompleted >= totalSections) {
      const totalScore = Object.values({ ...sectionScores, [section]: { score, total } })
        .reduce((sum, s) => sum + s.score, 0);
      const totalMax = Object.values({ ...sectionScores, [section]: { score, total } })
        .reduce((sum, s) => sum + s.total, 0);
      await updateLessonProgress(1, totalScore, totalMax, true);
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

        {activeSection === 'pronouns' || activeSection === 'question_words' ? (
          <FlashcardDeck
            exercises={exercises}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'zijn' || activeSection === 'hebben' || activeSection === 'articles' ? (
          <TimedQuiz
            questions={exercises.map((ex) => ({
              exercise: ex,
              prompt: lang === 'fa' ? (ex.prompt_fa ?? ex.prompt_en ?? '') : (ex.prompt_en ?? ''),
              choices: (ex.options as { choices: string[] })?.choices ?? [],
              correctIndex: (ex.options as { correct_index: number })?.correct_index ?? 0,
            }))}
            timeLimitSeconds={90}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection.startsWith('environment_') ? (
          <MatchingGame
            pairs={(exercises[0]?.options as { pairs: { dutch: string; translation: string; translation_fa?: string }[] })?.pairs ?? []}
            exerciseId={exercises[0]?.id}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'grammar' && exercises.some((e) => e.type === 'sentence_order') ? (
          <DragDropGame
            mode="sentence_order"
            words={(exercises.find((e) => e.type === 'sentence_order')?.options as { words: string[] })?.words ?? []}
            correctOrder={(exercises.find((e) => e.type === 'sentence_order')?.options as { correct_order: number[] })?.correct_order ?? []}
            translation={exercises.find((e) => e.type === 'sentence_order')?.answer_en ?? undefined}
            onComplete={(correct) => handleSectionComplete(activeSection, correct ? 1 : 0, 1)}
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

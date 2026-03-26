/**
 * Lesson 2 — De Mens Centraal
 * Body parts, health, emotions, character traits, adjectives
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
import LessonShell from '@/lessons/shared/LessonShell';

const SECTION_LABELS: Record<string, string> = {
  body_head:       '🤔 Het Hoofd — Head & Face',
  body_full:       '🧍 Het Lichaam — Full Body',
  health:          '💊 Gezondheid — Health & Illness',
  health_phrases:  '🏥 Medische Zinnen — Health Phrases',
  emotions:        '😊 Emoties — Emotions',
  character:       '🌟 Karakter — Character Traits',
  adjectives:      '📝 Bijvoeglijke Naamwoorden — Adjectives',
};

export default function Lesson2Page() {
  const { user } = useAuthStore();
  const { updateLessonProgress } = useProgressStore();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonWithExercises | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionScores, setSectionScores] = useState<Record<string, { score: number; total: number }>>({});

  const lang = user?.language_pref ?? 'en';

  useEffect(() => {
    lessonsApi.get(2).then(setLesson).catch(console.error);
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
      await updateLessonProgress(2, totalScore, totalMax, true);
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

        {activeSection === 'body_head' || activeSection === 'health' ? (
          <FlashcardDeck
            exercises={exercises}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'body_full' || activeSection === 'emotions' ? (
          <MatchingGame
            pairs={(exercises[0]?.options as { pairs: { dutch: string; translation: string; translation_fa?: string }[] })?.pairs ?? []}
            exerciseId={exercises[0]?.id}
            languagePref={lang}
            onComplete={(s, t) => handleSectionComplete(activeSection, s, t)}
          />
        ) : activeSection === 'character' ? (
          <TimedQuiz
            questions={exercises.map((ex) => ({
              exercise: ex,
              prompt: lang === 'fa' ? (ex.prompt_fa ?? ex.prompt_en ?? '') : (ex.prompt_en ?? ''),
              choices: (ex.options as { choices: string[] })?.choices ?? [],
              correctIndex: (ex.options as { correct_index: number })?.correct_index ?? 0,
            }))}
            timeLimitSeconds={60}
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

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { Exercise } from '@/types';
import { exercisesApi } from '@/api/client';

interface FlashcardDeckProps {
  exercises: Exercise[];
  languagePref: 'en' | 'fa';
  onComplete: (score: number, total: number) => void;
}

type CardStatus = 'new' | 'known' | 'review';

interface CardState {
  exercise: Exercise;
  status: CardStatus;
  flipped: boolean;
}

export default function FlashcardDeck({ exercises, languagePref, onComplete }: FlashcardDeckProps) {
  const [cards, setCards] = useState<CardState[]>(
    exercises.map((ex) => ({ exercise: ex, status: 'new', flipped: false }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const current = cards[currentIndex];

  const flip = useCallback(() => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, flipped: !c.flipped } : c))
    );
  }, [currentIndex]);

  const markCard = useCallback(async (status: 'known' | 'review') => {
    const correct = status === 'known';

    // Submit attempt to backend
    try {
      await exercisesApi.submitAttempt(current.exercise.id, {
        correct,
        time_spent_ms: undefined,
      });
    } catch {
      // Non-blocking — continue even if API fails
    }

    const newCards = cards.map((c, i) =>
      i === currentIndex ? { ...c, status, flipped: false } : c
    );
    setCards(newCards);

    if (correct) setKnownCount((n) => n + 1);

    // Move to next card
    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      setIsDone(true);
      onComplete(correct ? knownCount + 1 : knownCount, cards.length);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [cards, currentIndex, current, knownCount, onComplete]);

  const restart = () => {
    setCards(exercises.map((ex) => ({ exercise: ex, status: 'new', flipped: false })));
    setCurrentIndex(0);
    setIsDone(false);
    setKnownCount(0);
  };

  if (isDone) {
    const pct = Math.round((knownCount / exercises.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-gray-900">
            {knownCount}/{exercises.length} correct
          </p>
          <p className="text-gray-500 mt-1">{pct}% — {pct >= 80 ? 'Uitstekend!' : pct >= 50 ? 'Goed werk!' : 'Blijf oefenen!'}</p>
        </div>
        <button onClick={restart} className="btn-secondary">
          🔄 Opnieuw spelen
        </button>
      </div>
    );
  }

  const prompt = languagePref === 'fa' ? current.exercise.prompt_fa : current.exercise.prompt_en;
  const progress = ((currentIndex) / exercises.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Kaart {currentIndex + 1} van {exercises.length}</span>
          <span>{knownCount} geweten ✓</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="flashcard w-full h-56 cursor-pointer select-none"
        onClick={flip}
        role="button"
        aria-label="Flip card"
      >
        <motion.div
          className="flashcard-inner w-full h-full"
          animate={{ rotateY: current.flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front — Dutch word */}
          <div
            className="flashcard-front bg-dutch-blue text-white rounded-2xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs font-medium text-blue-200 mb-2 uppercase tracking-wide">Nederlands</p>
            <p className="font-display text-3xl font-bold text-center">{current.exercise.answer_nl}</p>
            <p className="text-blue-200 text-sm mt-4">Tik om te draaien</p>
          </div>

          {/* Back — translation */}
          <div
            className="flashcard-back bg-white border-2 border-dutch-blue rounded-2xl flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              {languagePref === 'fa' ? 'فارسی' : 'English'}
            </p>
            <p className="font-display text-3xl font-bold text-dutch-blue text-center">
              {current.exercise.answer_en ?? prompt ?? '—'}
            </p>
            {prompt && current.exercise.answer_en && (
              <p
                className="text-gray-500 text-lg mt-2"
                dir={languagePref === 'fa' ? 'rtl' : 'ltr'}
              >
                {prompt}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action buttons (only show after flip) */}
      <AnimatePresence>
        {current.flipped && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => markCard('review')}
              className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors"
            >
              😅 Nog oefenen
            </button>
            <button
              onClick={() => markCard('known')}
              className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-700 font-semibold hover:bg-green-50 transition-colors"
            >
              ✅ Geweten!
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!current.flipped && (
        <p className="text-center text-sm text-gray-400">Tik op de kaart om de vertaling te zien</p>
      )}
    </div>
  );
}

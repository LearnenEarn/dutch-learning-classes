import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { Exercise } from '@/types';
import { exercisesApi } from '@/api/client';

interface FillInBlankQuestion {
  exercise: Exercise;
  /** Sentence with ___ placeholder */
  sentence: string;
  answer: string;
  hint?: string;
}

interface FillInBlankGameProps {
  questions: FillInBlankQuestion[];
  languagePref: 'en' | 'fa';
  onComplete: (score: number, total: number) => void;
}

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function FillInBlankGame({ questions, languagePref, onComplete }: FillInBlankGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = questions[currentIndex];

  const checkAnswer = useCallback(async () => {
    if (!input.trim()) return;

    const userAnswer = input.trim().toLowerCase();
    const correct = current.answer.toLowerCase();
    const isCorrect = userAnswer === correct;

    setAnswerState(isCorrect ? 'correct' : 'wrong');

    try {
      await exercisesApi.submitAttempt(current.exercise.id, {
        correct: isCorrect,
        answer_given: input.trim(),
      });
    } catch { /* non-blocking */ }

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Auto-advance after a short delay
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        setIsDone(true);
        onComplete(isCorrect ? score + 1 : score, questions.length);
      } else {
        setCurrentIndex(nextIndex);
        setInput('');
        setAnswerState('idle');
        setShowHint(false);
        inputRef.current?.focus();
      }
    }, isCorrect ? 800 : 1500);
  }, [input, current, currentIndex, questions, score, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkAnswer();
  };

  const restart = () => {
    setCurrentIndex(0);
    setInput('');
    setAnswerState('idle');
    setScore(0);
    setShowHint(false);
    setIsDone(false);
  };

  if (isDone) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-6xl">{pct >= 80 ? '🎉' : '💪'}</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-gray-900">
            {score}/{questions.length} goed
          </p>
          <p className="text-gray-500 mt-1">{pct}%</p>
        </div>
        <button onClick={restart} className="btn-secondary">🔄 Opnieuw spelen</button>
      </div>
    );
  }

  const parts = current.sentence.split('___');
  const progress = (currentIndex / questions.length) * 100;
  const prompt = languagePref === 'fa' ? current.exercise.prompt_fa : current.exercise.prompt_en;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Vraag {currentIndex + 1} van {questions.length}</span>
          <span>{score} correct ✓</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="card bg-dutch-cream border-dutch-blue/20">
        {prompt && (
          <p
            className="text-sm text-gray-500 mb-3"
            dir={languagePref === 'fa' ? 'rtl' : 'ltr'}
          >
            {prompt}
          </p>
        )}

        {/* Sentence with blank */}
        <div className="flex flex-wrap items-center gap-2 text-lg font-medium text-gray-900">
          <span>{parts[0]}</span>
          <span
            className={clsx(
              'inline-block border-b-2 min-w-[80px] text-center font-bold px-2',
              answerState === 'correct' && 'border-green-500 text-green-700',
              answerState === 'wrong' && 'border-red-500 text-red-600',
              answerState === 'idle' && 'border-dutch-blue text-dutch-blue'
            )}
          >
            {answerState !== 'idle' ? input : '___'}
          </span>
          {parts[1] && <span>{parts[1]}</span>}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {answerState === 'wrong' && (
            <motion.p
              className="text-sm text-red-600 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Het juiste antwoord is: <strong>{current.answer}</strong>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={answerState !== 'idle'}
          placeholder="Typ het ontbrekende woord..."
          autoFocus
          className={clsx(
            'flex-1 border-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors',
            answerState === 'correct' && 'border-green-400 bg-green-50',
            answerState === 'wrong' && 'border-red-400 bg-red-50',
            answerState === 'idle' && 'border-gray-200 focus:border-dutch-blue'
          )}
        />
        <button
          onClick={checkAnswer}
          disabled={!input.trim() || answerState !== 'idle'}
          className="btn-primary px-6"
        >
          ✓
        </button>
      </div>

      {/* Hint */}
      {current.hint && (
        <div className="text-center">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-gray-400 hover:text-dutch-blue transition-colors"
            >
              💡 Toon hint
            </button>
          ) : (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2">
              💡 {current.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

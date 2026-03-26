import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { Exercise } from '@/types';
import { exercisesApi } from '@/api/client';

interface TimedQuizQuestion {
  exercise: Exercise;
  prompt: string;
  choices: string[];
  correctIndex: number;
}

interface TimedQuizProps {
  questions: TimedQuizQuestion[];
  timeLimitSeconds?: number;
  languagePref: 'en' | 'fa';
  onComplete: (score: number, total: number, timeUsed: number) => void;
}

type QuestionState = 'answering' | 'correct' | 'wrong';

export default function TimedQuiz({
  questions,
  timeLimitSeconds = 60,
  languagePref,
  onComplete,
}: TimedQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [questionState, setQuestionState] = useState<QuestionState>('answering');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endGame = useCallback((finalScore: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDone(true);
    const timeUsed = Math.round((Date.now() - startTime) / 1000);
    onComplete(finalScore, questions.length, timeUsed);
  }, [questions.length, startTime, onComplete]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endGame, score]);

  const handleChoice = useCallback(async (choiceIndex: number) => {
    if (questionState !== 'answering') return;

    const current = questions[currentIndex];
    const isCorrect = choiceIndex === current.correctIndex;

    setSelectedChoice(choiceIndex);
    setQuestionState(isCorrect ? 'correct' : 'wrong');

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    try {
      await exercisesApi.submitAttempt(current.exercise.id, {
        correct: isCorrect,
        answer_given: current.choices[choiceIndex],
      });
    } catch { /* non-blocking */ }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        endGame(newScore);
      } else {
        setCurrentIndex(nextIndex);
        setSelectedChoice(null);
        setQuestionState('answering');
      }
    }, isCorrect ? 600 : 1200);
  }, [currentIndex, questions, questionState, score, endGame]);

  if (isDone) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-6xl">{pct >= 80 ? '⚡' : pct >= 50 ? '👍' : '💪'}</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-gray-900">
            {score}/{questions.length} goed
          </p>
          <p className="text-gray-500 mt-1">{pct}% nauwkeurig</p>
          {pct === 100 && (
            <p className="text-dutch-orange font-bold mt-2">⚡ Perfect! Bliksemsnell badge verdiend!</p>
          )}
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const timerPct = (timeLeft / timeLimitSeconds) * 100;
  const timerColor = timeLeft > 20 ? 'bg-green-500' : timeLeft > 10 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-5">
      {/* Timer + score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱</span>
          <span
            className={clsx(
              'font-bold text-xl',
              timeLeft <= 10 ? 'text-red-600' : 'text-gray-800'
            )}
          >
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{currentIndex + 1}/{questions.length}</span>
          <span className="badge bg-dutch-orange/10 text-dutch-orange font-bold">
            {score} ✓
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${timerColor} transition-colors duration-1000`}
          style={{ width: `${timerPct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Question */}
      <div className="card">
        <p className="text-xs font-medium text-gray-400 uppercase mb-2">Wat betekent dit?</p>
        <p className="font-display text-2xl font-bold text-dutch-blue">{current.prompt}</p>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3">
        {current.choices.map((choice, idx) => {
          const isSelected = selectedChoice === idx;
          const isCorrectChoice = idx === current.correctIndex;

          return (
            <AnimatePresence key={idx} mode="wait">
              <motion.button
                onClick={() => handleChoice(idx)}
                disabled={questionState !== 'answering'}
                animate={
                  isSelected && questionState === 'wrong'
                    ? { x: [-4, 4, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                className={clsx(
                  'py-4 px-4 rounded-xl font-medium text-sm transition-all duration-150 border-2 text-left',
                  !isSelected && questionState === 'answering' &&
                    'bg-white border-gray-200 hover:border-dutch-blue hover:bg-blue-50 text-gray-800',
                  isSelected && questionState === 'correct' &&
                    'bg-green-50 border-green-400 text-green-800',
                  isSelected && questionState === 'wrong' &&
                    'bg-red-50 border-red-400 text-red-800',
                  !isSelected && questionState === 'wrong' && isCorrectChoice &&
                    'bg-green-50 border-green-400 text-green-800',
                  questionState !== 'answering' && !isSelected && !isCorrectChoice &&
                    'opacity-50'
                )}
              >
                {choice}
              </motion.button>
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}

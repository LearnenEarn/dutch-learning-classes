import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import type { Exercise } from '@/types';
import { exercisesApi } from '@/api/client';

interface ClockQuestion {
  exercise: Exercise;
  expression: string;  // e.g. "half drie"
  time24h: string;     // e.g. "14:30"
}

interface ClockGameProps {
  questions: ClockQuestion[];
  languagePref: 'en' | 'fa';
  onComplete: (score: number, total: number) => void;
}

// Parse "HH:MM" into { hours, minutes }
function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return { hours: h % 12, minutes: m };
}

// Generate plausible wrong answers for a given time
function generateChoices(correctTime: string, allTimes: string[]): string[] {
  const others = allTimes.filter((t) => t !== correctTime);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [...shuffled, correctTime].sort(() => Math.random() - 0.5);
  return choices;
}

// Convert 24h time to display string
function toDisplayTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const display12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${display12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function ClockGame({ questions, languagePref, onComplete }: ClockGameProps) {
  const allTimes = questions.map((q) => q.time24h);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDone, setIsDone] = useState(false);

  const current = questions[currentIndex];
  const choices = generateChoices(current.time24h, allTimes.length >= 4 ? allTimes : [
    ...allTimes, '09:00', '10:30', '13:45', '16:15', '19:30', '21:00'
  ]);

  const handleChoice = useCallback(async (choice: string) => {
    if (selectedChoice !== null) return;

    const correct = choice === current.time24h;
    setSelectedChoice(choice);
    setIsCorrect(correct);

    if (correct) setScore((s) => s + 1);

    try {
      await exercisesApi.submitAttempt(current.exercise.id, {
        correct,
        answer_given: choice,
      });
    } catch { /* non-blocking */ }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        setIsDone(true);
        onComplete(correct ? score + 1 : score, questions.length);
      } else {
        setCurrentIndex(nextIndex);
        setSelectedChoice(null);
        setIsCorrect(null);
      }
    }, correct ? 1000 : 1800);
  }, [selectedChoice, current, currentIndex, questions, score, onComplete]);

  if (isDone) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-6xl">⏰</div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-gray-900">
            {score}/{questions.length} goed
          </p>
          <p className="text-gray-500 mt-1">{pct}%</p>
        </div>
      </div>
    );
  }

  const { hours, minutes } = parseTime(current.time24h);
  const hourAngle = (hours / 12) * 360 + (minutes / 60) * 30;
  const minuteAngle = (minutes / 60) * 360;
  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Vraag {currentIndex + 1} van {questions.length}</span>
          <span>{score} ✓</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Instruction */}
      <div className="card text-center bg-dutch-cream">
        <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
          Welk tijdstip is dit?
        </p>
        <p className="font-display text-3xl font-bold text-dutch-blue">
          "{current.expression}"
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {languagePref === 'fa'
            ? 'کدام ساعت درست است؟'
            : 'Which clock time is correct?'}
        </p>
      </div>

      {/* Clock face */}
      <div className="flex justify-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Clock face */}
            <circle cx="60" cy="60" r="56" fill="white" stroke="#004E98" strokeWidth="3" />

            {/* Hour markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 60 + 46 * Math.cos(rad);
              const y = 60 + 46 * Math.sin(rad);
              return (
                <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 1.5}
                  fill={i % 3 === 0 ? '#004E98' : '#ccc'} />
              );
            })}

            {/* Hour numbers for 12, 3, 6, 9 */}
            {[
              { n: '12', x: 60, y: 16 },
              { n: '3', x: 104, y: 64 },
              { n: '6', x: 60, y: 108 },
              { n: '9', x: 16, y: 64 },
            ].map(({ n, x, y }) => (
              <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fill="#004E98" fontWeight="bold">{n}</text>
            ))}

            {/* Hour hand */}
            <line
              x1="60" y1="60"
              x2={60 + 28 * Math.sin((hourAngle * Math.PI) / 180)}
              y2={60 - 28 * Math.cos((hourAngle * Math.PI) / 180)}
              stroke="#004E98" strokeWidth="4" strokeLinecap="round"
            />
            {/* Minute hand */}
            <line
              x1="60" y1="60"
              x2={60 + 42 * Math.sin((minuteAngle * Math.PI) / 180)}
              y2={60 - 42 * Math.cos((minuteAngle * Math.PI) / 180)}
              stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx="60" cy="60" r="3" fill="#004E98" />
          </svg>
        </div>
      </div>

      {/* Answer choices */}
      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => {
          const isSelected = selectedChoice === choice;
          const isRight = choice === current.time24h;

          return (
            <motion.button
              key={choice}
              onClick={() => handleChoice(choice)}
              disabled={selectedChoice !== null}
              animate={isSelected && !isRight ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={clsx(
                'py-4 rounded-xl border-2 font-semibold text-sm transition-all',
                !isSelected && selectedChoice === null &&
                  'bg-white border-gray-200 hover:border-dutch-blue text-gray-800',
                isSelected && isRight && 'bg-green-50 border-green-400 text-green-800',
                isSelected && !isRight && 'bg-red-50 border-red-400 text-red-700',
                !isSelected && selectedChoice !== null && isRight &&
                  'bg-green-50 border-green-400 text-green-800',
                !isSelected && selectedChoice !== null && !isRight && 'opacity-40'
              )}
            >
              {toDisplayTime(choice)}
            </motion.button>
          );
        })}
      </div>

      {/* Hint about half-hour */}
      <AnimatePresence>
        {isCorrect === false && (
          <motion.div
            className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            💡 <strong>Onthoud:</strong> "half drie" = halverwege naar drie = 2:30, niet 3:30!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    emoji: '🇳🇱',
    title: 'Welkom bij Learn Dutch!',
    subtitle: 'Welcome to the Dutch Learning App',
    description: 'Made for international students at SRH Haarlem. Learn Dutch through interactive games, puzzles, and real-world vocabulary.',
  },
  {
    emoji: '🎮',
    title: 'Leer door spelen',
    subtitle: 'Learn by Playing',
    description: 'Flashcards, matching games, drag & drop puzzles, timed quizzes, and a special clock game for Dutch time-telling. Every exercise earns you XP!',
  },
  {
    emoji: '🔥',
    title: 'Bouw je streak op',
    subtitle: 'Build Your Streak',
    description: 'Practice daily to maintain your streak. The spaced repetition system brings back words you need to review, making learning stick.',
  },
  {
    emoji: '🏆',
    title: 'Verdien badges',
    subtitle: 'Earn Badges & Compete',
    description: 'Unlock achievements as you progress. See how you rank against fellow students on the leaderboard. A1 NT2 level, here you come!',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('dutch_app_onboarded', 'true');
      onComplete();
    }
  };

  const skip = () => {
    localStorage.setItem('dutch_app_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#FF6B00] to-[#E65C00] z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center text-white"
          >
            <div className="text-7xl mb-6">{current.emoji}</div>
            <h1 className="text-3xl font-bold mb-1">{current.title}</h1>
            <h2 className="text-xl opacity-80 mb-4">{current.subtitle}</h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === step ? 'bg-white scale-125' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={next}
            className="w-full py-4 bg-white text-[#FF6B00] font-bold rounded-xl text-lg hover:bg-gray-50 transition-colors"
          >
            {step < STEPS.length - 1 ? 'Volgende →' : 'Start Learning! 🚀'}
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={skip}
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

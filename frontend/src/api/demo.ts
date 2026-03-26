/**
 * Demo mode data — provides mock API responses when VITE_DEMO_MODE=true.
 * No backend or database required.
 */
import type { AuthResponse, Exercise, Lesson, LessonWithExercises, UserProgress, UserStats } from '@/types';

export const DEMO_CREDENTIALS = {
  email: 'demo@srhhaarlem.nl',
  password: 'demo1234',
};

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@srhhaarlem.nl',
  display_name: 'Demo Student',
  language_pref: 'en' as const,
  role: 'student' as const,
  created_at: new Date().toISOString(),
};

export const DEMO_TOKEN = 'demo-token-not-for-production';

export const DEMO_LESSONS: Lesson[] = [
  {
    id: 1, week: 1,
    title_nl: 'De Basis & De Omgeving',
    title_en: 'The Basics & The Environment',
    description_en: 'History of Dutch, sentence structure, pronouns, zijn/hebben, articles, question words, and environment vocabulary.',
    description_fa: 'تاریخ زبان هلندی، ساختار جملات، ضمایر، zijn/hebben، حروف تعریف، کلمات سؤالی و واژگان محیطی.',
    theme: 'basics, environment',
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2, week: 2,
    title_nl: 'De Mens Centraal',
    title_en: 'The Person',
    description_en: 'Body parts, health and illness vocabulary, emotions, character traits, and adjective usage.',
    description_fa: 'اعضای بدن، واژگان بهداشت، احساسات، ویژگی‌های شخصیتی و صفت.',
    theme: 'body, health, emotions',
    is_published: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 3, week: 3,
    title_nl: 'Tijd & Elementen',
    title_en: 'Time & Elements',
    description_en: 'Days, months, seasons, telling time, nature, landscapes, animals, plants, and weather.',
    description_fa: 'روزها، ماه‌ها، فصل‌ها، گفتن ساعت، طبیعت، چشم‌اندازها و آب‌وهوا.',
    theme: 'time, nature, weather',
    is_published: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 4, week: 4,
    title_nl: 'Eten & Winkelen',
    title_en: 'Food & Shopping',
    description_en: 'Food vocabulary, ordering in a restaurant, shopping phrases, and numbers.',
    description_fa: null,
    theme: 'food, shopping',
    is_published: false,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 5, week: 5,
    title_nl: 'Werk & School',
    title_en: 'Work & Study',
    description_en: 'Workplace vocabulary, study terms, and daily routines.',
    description_fa: null,
    theme: 'work, study',
    is_published: false,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 6, week: 6,
    title_nl: 'Reizen & Vervoer',
    title_en: 'Travel & Transport',
    description_en: 'Public transport, directions, Dutch cities, and travel phrases.',
    description_fa: null,
    theme: 'travel, transport',
    is_published: false,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 7, week: 7,
    title_nl: 'Sociale Situaties',
    title_en: 'Social Life & Culture',
    description_en: 'Greetings, invitations, Dutch customs, celebrations, and social phrases.',
    description_fa: null,
    theme: 'social, culture',
    is_published: false,
    sort_order: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: 8, week: 8,
    title_nl: 'Eindtoets & NT2 Oefening',
    title_en: 'Final Review & NT2 Practice',
    description_en: 'Full review of all 7 weeks plus A1 NT2 practice test format exercises.',
    description_fa: null,
    theme: 'review, nt2',
    is_published: false,
    sort_order: 8,
    created_at: new Date().toISOString(),
  },
];

// Demo exercises for lesson 1 (vocabulary sample)
const LESSON1_EXERCISES = [
  { id: 1001, lesson_id: 1, type: 'flashcard' as const, section: 'pronouns', prompt_en: 'I', prompt_fa: 'من', answer_nl: 'ik', answer_en: 'I', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 10, created_at: new Date().toISOString() },
  { id: 1002, lesson_id: 1, type: 'flashcard' as const, section: 'pronouns', prompt_en: 'you', prompt_fa: 'تو', answer_nl: 'jij / je', answer_en: 'you', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 11, created_at: new Date().toISOString() },
  { id: 1003, lesson_id: 1, type: 'flashcard' as const, section: 'pronouns', prompt_en: 'he', prompt_fa: 'او', answer_nl: 'hij', answer_en: 'he', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 12, created_at: new Date().toISOString() },
  { id: 1004, lesson_id: 1, type: 'flashcard' as const, section: 'question_words', prompt_en: 'who', prompt_fa: 'کی', answer_nl: 'wie', answer_en: 'who', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 50, created_at: new Date().toISOString() },
  { id: 1005, lesson_id: 1, type: 'flashcard' as const, section: 'question_words', prompt_en: 'what', prompt_fa: 'چه', answer_nl: 'wat', answer_en: 'what', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 51, created_at: new Date().toISOString() },
  { id: 1006, lesson_id: 1, type: 'timed_quiz' as const, section: 'zijn', prompt_en: 'I am', prompt_fa: 'من هستم', answer_nl: 'Ik ben', answer_en: 'I am', options: { choices: ['Ik ben', 'Ik heb', 'Ik is', 'Ik zijn'], correct_index: 0 }, difficulty: 1 as const, xp_reward: 10, hint_en: 'zijn = to be', hint_fa: null, sort_order: 20, created_at: new Date().toISOString() },
  { id: 1007, lesson_id: 1, type: 'timed_quiz' as const, section: 'articles', prompt_en: 'the house', prompt_fa: 'خانه', answer_nl: 'het huis', answer_en: 'the house', options: { choices: ['het huis', 'de huis'], correct_index: 0 }, difficulty: 1 as const, xp_reward: 10, hint_en: 'het = neuter', hint_fa: null, sort_order: 40, created_at: new Date().toISOString() },
  { id: 1008, lesson_id: 1, type: 'matching' as const, section: 'environment_water', prompt_en: 'Match water words', prompt_fa: 'کلمات آب را جور کنید', answer_nl: 'water', answer_en: 'water', options: { pairs: [ { dutch: 'water', translation: 'water', translation_fa: 'آب' }, { dutch: 'zee', translation: 'sea', translation_fa: 'دریا' }, { dutch: 'rivier', translation: 'river', translation_fa: 'رودخانه' }, { dutch: 'brug', translation: 'bridge', translation_fa: 'پل' } ] }, difficulty: 1 as const, xp_reward: 20, hint_en: null, hint_fa: null, sort_order: 60, created_at: new Date().toISOString() },
];

const LESSON2_EXERCISES = [
  { id: 2001, lesson_id: 2, type: 'flashcard' as const, section: 'body_head', prompt_en: 'head', prompt_fa: 'سر', answer_nl: 'hoofd', answer_en: 'head', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 10, created_at: new Date().toISOString() },
  { id: 2002, lesson_id: 2, type: 'flashcard' as const, section: 'body_head', prompt_en: 'eye', prompt_fa: 'چشم', answer_nl: 'oog', answer_en: 'eye', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 11, created_at: new Date().toISOString() },
  { id: 2003, lesson_id: 2, type: 'flashcard' as const, section: 'health', prompt_en: 'headache', prompt_fa: 'سردرد', answer_nl: 'hoofdpijn', answer_en: 'headache', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 40, created_at: new Date().toISOString() },
  { id: 2004, lesson_id: 2, type: 'matching' as const, section: 'emotions', prompt_en: 'Match emotions', prompt_fa: 'احساسات را جور کنید', answer_nl: 'emoties', answer_en: 'emotions', options: { pairs: [ { dutch: 'blij', translation: 'happy', translation_fa: 'خوشحال' }, { dutch: 'verdrietig', translation: 'sad', translation_fa: 'غمگین' }, { dutch: 'boos', translation: 'angry', translation_fa: 'عصبانی' }, { dutch: 'rustig', translation: 'calm', translation_fa: 'آرام' } ] }, difficulty: 1 as const, xp_reward: 20, hint_en: null, hint_fa: null, sort_order: 60, created_at: new Date().toISOString() },
];

const LESSON3_EXERCISES = [
  { id: 3001, lesson_id: 3, type: 'flashcard' as const, section: 'days', prompt_en: 'Monday', prompt_fa: 'دوشنبه', answer_nl: 'maandag', answer_en: 'Monday', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 10, created_at: new Date().toISOString() },
  { id: 3002, lesson_id: 3, type: 'flashcard' as const, section: 'days', prompt_en: 'Friday', prompt_fa: 'جمعه', answer_nl: 'vrijdag', answer_en: 'Friday', options: null, difficulty: 1 as const, xp_reward: 5, hint_en: null, hint_fa: null, sort_order: 14, created_at: new Date().toISOString() },
  { id: 3003, lesson_id: 3, type: 'clock_game' as const, section: 'time', prompt_en: 'Half past two', prompt_fa: 'دو و نیم', answer_nl: 'half drie', answer_en: 'half past two', options: { time_24h: '14:30', expression: 'half drie' }, difficulty: 2 as const, xp_reward: 20, hint_en: 'half drie = HALFWAY to three = 2:30!', hint_fa: null, sort_order: 40, created_at: new Date().toISOString() },
  { id: 3004, lesson_id: 3, type: 'clock_game' as const, section: 'time', prompt_en: 'Quarter past two', prompt_fa: 'دو و ربع', answer_nl: 'kwart over twee', answer_en: 'quarter past two', options: { time_24h: '14:15', expression: 'kwart over twee' }, difficulty: 1 as const, xp_reward: 15, hint_en: null, hint_fa: null, sort_order: 41, created_at: new Date().toISOString() },
  { id: 3005, lesson_id: 3, type: 'matching' as const, section: 'weather', prompt_en: 'Match weather words', prompt_fa: 'واژگان آب‌وهوا را جور کنید', answer_nl: 'weer', answer_en: 'weather', options: { pairs: [ { dutch: 'regen', translation: 'rain', translation_fa: 'باران' }, { dutch: 'sneeuw', translation: 'snow', translation_fa: 'برف' }, { dutch: 'zon', translation: 'sun', translation_fa: 'آفتاب' }, { dutch: 'wolk', translation: 'cloud', translation_fa: 'ابر' } ] }, difficulty: 1 as const, xp_reward: 20, hint_en: null, hint_fa: null, sort_order: 70, created_at: new Date().toISOString() },
  { id: 3006, lesson_id: 3, type: 'true_false' as const, section: 'trivia', prompt_en: 'Half drie means 3:30 — True or False?', prompt_fa: null, answer_nl: 'onjuist', answer_en: 'False', options: { statement: "'Half drie' in Dutch means 3:30.", correct: false, explanation: 'Half drie = 2:30 (halfway TO three)' }, difficulty: 2 as const, xp_reward: 15, hint_en: 'half drie = HALFWAY to three = 2:30!', hint_fa: null, sort_order: 80, created_at: new Date().toISOString() },
];

const LESSON_EXERCISES: Record<number, Exercise[]> = {
  1: LESSON1_EXERCISES as Exercise[],
  2: LESSON2_EXERCISES as Exercise[],
  3: LESSON3_EXERCISES as Exercise[],
};

export const DEMO_STATS: UserStats = {
  user_id: 'demo-user-001',
  xp_total: 45,
  streak_days: 2,
  longest_streak: 3,
  last_active: new Date().toISOString().split('T')[0],
  badges: [
    { id: 'eerste_woorden', name: 'Eerste Woorden', icon: '🇳🇱', description: 'Started Lesson 1', earned_at: new Date().toISOString() },
  ],
};

// ── Demo API functions ────────────────────────────────────────────

export function demoLogin(email: string, _password: string): AuthResponse | null {
  // Accept any email/password in demo mode, or use credentials hint
  if (email.trim()) {
    return {
      token: DEMO_TOKEN,
      user: { ...DEMO_USER, email: email.trim() },
    };
  }
  return null;
}

export function demoGetLessons(): Lesson[] {
  return DEMO_LESSONS;
}

export function demoGetLesson(id: number): LessonWithExercises | null {
  const lesson = DEMO_LESSONS.find((l) => l.id === id);
  if (!lesson) return null;
  return {
    ...lesson,
    exercises: LESSON_EXERCISES[id] ?? [],
  };
}

export function demoGetProgress(): UserProgress[] {
  // Load from localStorage to persist demo progress
  try {
    const stored = localStorage.getItem('demo_progress');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function demoUpdateProgress(lessonId: number, score: number, maxScore: number, completed: boolean): UserProgress {
  const existing = demoGetProgress();
  const idx = existing.findIndex((p) => p.lesson_id === lessonId);
  const updated: UserProgress = {
    id: lessonId,
    user_id: 'demo-user-001',
    lesson_id: lessonId,
    completed,
    score: Math.max(score, idx >= 0 ? existing[idx].score : 0),
    max_score: maxScore,
    attempts: (idx >= 0 ? existing[idx].attempts : 0) + 1,
    last_attempt: new Date().toISOString(),
    completed_at: completed ? new Date().toISOString() : null,
  };

  const newList = idx >= 0 ? existing.map((p, i) => i === idx ? updated : p) : [...existing, updated];
  localStorage.setItem('demo_progress', JSON.stringify(newList));
  return updated;
}

export function demoGetStats(): UserStats {
  try {
    const stored = localStorage.getItem('demo_stats');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEMO_STATS;
}

export function demoUpdateStats(xpGained: number): UserStats {
  const stats = demoGetStats();
  const updated = { ...stats, xp_total: stats.xp_total + xpGained };
  localStorage.setItem('demo_stats', JSON.stringify(updated));
  return updated;
}

export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

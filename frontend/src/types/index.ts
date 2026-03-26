// ── User & Auth ──────────────────────────────────────────────────

export type LanguagePref = 'en' | 'fa';

export interface User {
  id: string;
  email: string;
  display_name: string;
  language_pref: LanguagePref;
  role: 'student' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Lessons & Exercises ──────────────────────────────────────────

export type ExerciseType =
  | 'flashcard'
  | 'drag_drop'
  | 'fill_blank'
  | 'timed_quiz'
  | 'matching'
  | 'true_false'
  | 'clock_game'
  | 'sentence_order';

export interface Lesson {
  id: number;
  week: number;
  title_en: string;
  title_nl: string;
  description_en: string | null;
  description_fa: string | null;
  theme: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  section: string | null;
  prompt_en: string | null;
  prompt_fa: string | null;
  answer_nl: string;
  answer_en: string | null;
  options: ExerciseOptions | null;
  difficulty: 1 | 2 | 3;
  xp_reward: number;
  hint_en: string | null;
  hint_fa: string | null;
  sort_order: number;
}

export interface LessonWithExercises extends Lesson {
  exercises: Exercise[];
}

// Exercise option shapes (stored as JSONB)
export interface FlashcardOptions {
  back_en: string;
  back_fa?: string;
  image_url?: string;
}

export interface DragDropOptions {
  items: { id: string; label: string; category: string }[];
  categories: string[];
}

export interface MatchingOptions {
  pairs: { dutch: string; translation: string; translation_fa?: string }[];
}

export interface MultipleChoiceOptions {
  choices: string[];
  correct_index: number;
}

export interface ClockGameOptions {
  time_24h: string;     // e.g. "14:30"
  expression: string;   // e.g. "half drie"
}

export interface SentenceOrderOptions {
  words: string[];      // shuffled word tiles
  correct_order: number[];
}

export type ExerciseOptions =
  | FlashcardOptions
  | DragDropOptions
  | MatchingOptions
  | MultipleChoiceOptions
  | ClockGameOptions
  | SentenceOrderOptions
  | Record<string, unknown>;

// ── Progress & Stats ─────────────────────────────────────────────

export interface UserProgress {
  id: number;
  user_id: string;
  lesson_id: number;
  completed: boolean;
  score: number;
  max_score: number;
  attempts: number;
  last_attempt: string | null;
  completed_at: string | null;
}

export interface UserStats {
  user_id: string;
  xp_total: number;
  streak_days: number;
  longest_streak: number;
  last_active: string | null;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned_at: string;
}

// ── Exercise Attempt ─────────────────────────────────────────────

export interface ExerciseAttemptRequest {
  correct: boolean;
  answer_given?: string;
  time_spent_ms?: number;
}

export interface ExerciseAttemptResponse {
  correct: boolean;
  xp_earned: number;
  correct_answer: string;
  hint: string | null;
}

// ── API Error ────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  status: number;
}

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
  Lesson,
  LessonWithExercises,
  LoginRequest,
  RegisterRequest,
  User,
  UserProgress,
  UserStats,
} from '@/types';
import {
  IS_DEMO,
  demoLogin,
  demoGetLessons,
  demoGetLesson,
  demoGetProgress,
  demoUpdateProgress,
  demoGetStats,
  demoUpdateStats,
  demoGetLeaderboard,
  demoGetWordOfTheDay,
  DEMO_USER,
  type LeaderboardEntry,
} from '@/api/demo';

// ── Axios instance ───────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dutch_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dutch_app_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (IS_DEMO) {
      const result = demoLogin(data.email, data.password);
      if (result) return { ...result, user: { ...result.user, display_name: data.display_name } };
      throw new Error('Demo login failed');
    }
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (IS_DEMO) {
      const result = demoLogin(data.email, data.password);
      if (result) return result;
      throw new Error('Demo login failed');
    }
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    if (IS_DEMO) {
      const token = localStorage.getItem('dutch_app_token');
      if (token === 'demo-token-not-for-production') return DEMO_USER;
      throw new Error('Not authenticated');
    }
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateLanguage: async (language_pref: 'en' | 'fa'): Promise<void> => {
    if (IS_DEMO) return; // Handled in store
    await api.put('/auth/language', { language_pref });
  },
};

// ── Lessons ──────────────────────────────────────────────────────

export const lessonsApi = {
  list: async (): Promise<Lesson[]> => {
    if (IS_DEMO) return demoGetLessons();
    const res = await api.get<Lesson[]>('/lessons');
    return res.data;
  },

  get: async (id: number): Promise<LessonWithExercises> => {
    if (IS_DEMO) {
      const lesson = demoGetLesson(id);
      if (!lesson) throw new Error(`Lesson ${id} not found`);
      return lesson;
    }
    const res = await api.get<LessonWithExercises>(`/lessons/${id}`);
    return res.data;
  },
};

// ── Progress ─────────────────────────────────────────────────────

export interface UpdateProgressRequest {
  score: number;
  max_score: number;
  completed: boolean;
}

export const progressApi = {
  getAll: async (): Promise<UserProgress[]> => {
    if (IS_DEMO) return demoGetProgress();
    const res = await api.get<UserProgress[]>('/progress');
    return res.data;
  },

  getForLesson: async (lessonId: number): Promise<UserProgress> => {
    if (IS_DEMO) {
      const all = demoGetProgress();
      const found = all.find((p) => p.lesson_id === lessonId);
      if (!found) throw new Error('No progress');
      return found;
    }
    const res = await api.get<UserProgress>(`/progress/${lessonId}`);
    return res.data;
  },

  update: async (lessonId: number, data: UpdateProgressRequest): Promise<UserProgress> => {
    if (IS_DEMO) {
      demoUpdateStats(data.completed ? 50 : 10);
      return demoUpdateProgress(lessonId, data.score, data.max_score, data.completed);
    }
    const res = await api.post<UserProgress>(`/progress/${lessonId}`, data);
    return res.data;
  },

  getStats: async (): Promise<UserStats> => {
    if (IS_DEMO) return demoGetStats();
    const res = await api.get<UserStats>('/stats');
    return res.data;
  },
};

// ── Exercises ────────────────────────────────────────────────────

export const exercisesApi = {
  submitAttempt: async (
    exerciseId: number,
    data: ExerciseAttemptRequest
  ): Promise<ExerciseAttemptResponse> => {
    if (IS_DEMO) {
      // Demo: award XP and return correct answer immediately
      if (data.correct) demoUpdateStats(5);
      return {
        correct: data.correct,
        xp_earned: data.correct ? 5 : 0,
        correct_answer: '—',
        hint: null,
      };
    }
    const res = await api.post<ExerciseAttemptResponse>(
      `/exercises/${exerciseId}/attempt`,
      data
    );
    return res.data;
  },
};

// ── Leaderboard ──────────────────────────────────────────────────

export const leaderboardApi = {
  get: async (): Promise<LeaderboardEntry[]> => {
    if (IS_DEMO) return demoGetLeaderboard();
    const res = await api.get<LeaderboardEntry[]>('/leaderboard');
    return res.data;
  },
};

// ── Word of the Day ──────────────────────────────────────────────

export const dailyApi = {
  getWordOfTheDay: async () => {
    if (IS_DEMO) return demoGetWordOfTheDay();
    const res = await api.get('/daily/word');
    return res.data;
  },
};

export default api;

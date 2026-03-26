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
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  updateLanguage: async (language_pref: 'en' | 'fa'): Promise<void> => {
    await api.put('/auth/language', { language_pref });
  },
};

// ── Lessons ──────────────────────────────────────────────────────

export const lessonsApi = {
  list: async (): Promise<Lesson[]> => {
    const res = await api.get<Lesson[]>('/lessons');
    return res.data;
  },

  get: async (id: number): Promise<LessonWithExercises> => {
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
    const res = await api.get<UserProgress[]>('/progress');
    return res.data;
  },

  getForLesson: async (lessonId: number): Promise<UserProgress> => {
    const res = await api.get<UserProgress>(`/progress/${lessonId}`);
    return res.data;
  },

  update: async (lessonId: number, data: UpdateProgressRequest): Promise<UserProgress> => {
    const res = await api.post<UserProgress>(`/progress/${lessonId}`, data);
    return res.data;
  },

  getStats: async (): Promise<UserStats> => {
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
    const res = await api.post<ExerciseAttemptResponse>(
      `/exercises/${exerciseId}/attempt`,
      data
    );
    return res.data;
  },
};

export default api;

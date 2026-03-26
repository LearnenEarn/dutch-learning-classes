import { create } from 'zustand';
import type { UserProgress, UserStats } from '@/types';
import { progressApi } from '@/api/client';

interface ProgressState {
  progress: Record<number, UserProgress>; // keyed by lesson_id
  stats: UserStats | null;
  isLoading: boolean;

  loadProgress: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateLessonProgress: (lessonId: number, score: number, maxScore: number, completed: boolean) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  stats: null,
  isLoading: false,

  loadProgress: async () => {
    set({ isLoading: true });
    try {
      const list = await progressApi.getAll();
      const map: Record<number, UserProgress> = {};
      list.forEach((p) => { map[p.lesson_id] = p; });
      set({ progress: map });
    } catch {
      // Not authenticated yet — ignore
    } finally {
      set({ isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await progressApi.getStats();
      set({ stats });
    } catch {
      // Stats may not exist yet for new users
    }
  },

  updateLessonProgress: async (lessonId, score, maxScore, completed) => {
    const updated = await progressApi.update(lessonId, { score, max_score: maxScore, completed });
    set((state) => ({
      progress: { ...state.progress, [lessonId]: updated },
    }));
    // Reload stats for updated XP
    get().loadStats();
  },
}));

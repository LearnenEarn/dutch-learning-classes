import { create } from 'zustand';
import type { Badge, UserProgress, UserStats } from '@/types';
import { progressApi } from '@/api/client';

// Badge definitions — checked on lesson completion
const BADGE_DEFINITIONS: { id: string; name: string; icon: string; description: string; condition: (lessonId: number, stats: UserStats) => boolean }[] = [
  {
    id: 'eerste_woorden',
    name: 'Eerste Woorden',
    icon: '🇳🇱',
    description: 'Completed Lesson 1',
    condition: (lessonId) => lessonId === 1,
  },
  {
    id: 'gezond_bezig',
    name: 'Gezond Bezig',
    icon: '🏥',
    description: 'Completed Lesson 2',
    condition: (lessonId) => lessonId === 2,
  },
  {
    id: 'tijdbeheer',
    name: 'Tijdbeheer',
    icon: '⏰',
    description: 'Completed Lesson 3',
    condition: (lessonId) => lessonId === 3,
  },
  {
    id: 'op_stoom',
    name: 'Op Stoom',
    icon: '🔥',
    description: '7-day streak',
    condition: (_lessonId, stats) => stats.streak_days >= 7,
  },
];

interface ProgressState {
  progress: Record<number, UserProgress>; // keyed by lesson_id
  stats: UserStats | null;
  isLoading: boolean;
  pendingXP: number;   // XP gained in last action (for toast)

  loadProgress: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateLessonProgress: (lessonId: number, score: number, maxScore: number, completed: boolean) => Promise<void>;
  clearPendingXP: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  stats: null,
  isLoading: false,
  pendingXP: 0,

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
    const prevStats = get().stats;
    const updated = await progressApi.update(lessonId, { score, max_score: maxScore, completed });

    set((state) => ({
      progress: { ...state.progress, [lessonId]: updated },
    }));

    // Reload stats to get updated XP
    await get().loadStats();

    const newStats = get().stats;
    if (newStats && prevStats) {
      const xpGained = newStats.xp_total - prevStats.xp_total;
      if (xpGained > 0) set({ pendingXP: xpGained });
    }

    // Check for new badges (client-side milestone check)
    if (completed && newStats) {
      const existingBadgeIds = (newStats.badges as Badge[]).map((b) => b.id);
      const newBadges: Badge[] = [];

      BADGE_DEFINITIONS.forEach((def) => {
        if (!existingBadgeIds.includes(def.id) && def.condition(lessonId, newStats)) {
          newBadges.push({
            id: def.id,
            name: def.name,
            icon: def.icon,
            description: def.description,
            earned_at: new Date().toISOString(),
          });
        }
      });

      // Note: In production, badge awarding would happen server-side.
      // Here we update local state optimistically.
      if (newBadges.length > 0) {
        set((state) => ({
          stats: state.stats
            ? {
                ...state.stats,
                badges: [...(state.stats.badges as Badge[]), ...newBadges],
              }
            : state.stats,
        }));
      }
    }
  },

  clearPendingXP: () => set({ pendingXP: 0 }),
}));

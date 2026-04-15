// ============================================================
// ZUSTAND APP STORE — Notion-like Architecture
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

import { APP_CONFIG } from '../constants/config';
import type { Task, JournalNote, UserPreferences, SectionData } from '../types';

// Simple UUID-like ID generator (avoids needing uuid package in Expo Go)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ---- State Interfaces ----

export interface AppState {
  tasks: Task[];
  events: Task[]; // ALIAS for backward compatibility (PetCompanion)
  journalNotes: JournalNote[];
  preferences: UserPreferences;

  // Task transient UI state
  activeEditTaskId: string | null;

  // Task actions
  addTask: (
    title: string,
    area?: string,
    priority?: 'low' | 'medium' | 'high',
    dueDate?: string | null,
    content?: string
  ) => Task;
  
  updateTaskStatus: (id: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
  updateTaskProperties: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  clearCompletedTasks: () => void;
  setActiveEditTaskId: (id: string | null) => void;

  // Journal actions
  upsertJournalNote: (dayKey: string, content: string) => void;
  deleteJournalNote: (id: string) => void;
  getJournalNoteByDay: (dayKey: string) => JournalNote | undefined;

  // Preferences
  updatePreferences: (partial: Partial<UserPreferences>) => void;

  // Selectors
  getTasksByDay: (dayKey: string) => Task[];
}

// ---- Store ----

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      events: [], // Alias array
      journalNotes: [],
      preferences: {
        theme: 'dark',
        reminderMinutesBefore: 15,
        petEnabled: true,
        language: 'es',
        hapticEnabled: true,
      },

      activeEditTaskId: null,

      // ── Task Actions ──────────────────────────────────────────

      addTask: (title, area = 'Personal', priority = 'low', dueDate = null, content = '') => {
        const newTask: Task = {
          id: generateId(),
          title,
          status: 'todo',
          area,
          priority,
          dueDate,
          content,
          createdAt: new Date().toISOString(),
          dayKey: dueDate ? dueDate.split('T')[0] : todayKey(),
          notificationIds: [],
        };

        set((state) => {
          const newTasks = [newTask, ...state.tasks];
          return { tasks: newTasks, events: newTasks };
        });

        return newTask;
      },

      updateTaskStatus: (id, newStatus) => {
        set((state) => {
          const newTasks = state.tasks.map((t) =>
            t.id === id ? { ...t, status: newStatus } : t
          );
          return { tasks: newTasks, events: newTasks };
        });
      },

      updateTaskProperties: (id, partial) => {
        set((state) => {
          const newTasks = state.tasks.map((t) => {
            if (t.id === id) {
              const updated = { ...t, ...partial };
              // If dueDate changes, also update the dayKey for timeline grouping
              if (partial.dueDate !== undefined) {
                updated.dayKey = partial.dueDate ? partial.dueDate.split('T')[0] : t.dayKey;
              }
              return updated;
            }
            return t;
          });
          return { tasks: newTasks, events: newTasks };
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const newTasks = state.tasks.filter((t) => t.id !== id);
          return { tasks: newTasks, events: newTasks };
        });
      },

      clearCompletedTasks: () => {
        set((state) => {
          const newTasks = state.tasks.filter((t) => t.status !== 'done');
          return { tasks: newTasks, events: newTasks };
        });
      },

      setActiveEditTaskId: (id) => {
        set({ activeEditTaskId: id });
      },

      // ── Journal Actions ────────────────────────────────────────

      upsertJournalNote: (dayKey, content) => {
        const existing = get().journalNotes.find((n) => n.dayKey === dayKey);
        const now = new Date().toISOString();

        if (existing) {
          set((state) => ({
            journalNotes: state.journalNotes.map((n) =>
              n.dayKey === dayKey
                ? { ...n, content, updatedAt: now }
                : n
            ),
          }));
        } else {
          const newNote: JournalNote = {
            id: generateId(),
            content,
            dayKey,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            journalNotes: [newNote, ...state.journalNotes],
          }));
        }
      },

      deleteJournalNote: (id) => {
        set((state) => ({
          journalNotes: state.journalNotes.filter((n) => n.id !== id),
        }));
      },

      getJournalNoteByDay: (dayKey) => {
        return get().journalNotes.find((n) => n.dayKey === dayKey);
      },

      // ── Preferences ───────────────────────────────────────────

      updatePreferences: (partial) => {
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        }));
      },

      // ── Selectors ─────────────────────────────────────────────

      getTasksByDay: (dayKey) => {
        return get()
          .tasks.filter((t) => t.dayKey === dayKey)
          .sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
      },
    }),
    {
      name: APP_CONFIG.asyncStorageKey,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks, // Persist tasks
        events: state.tasks, // Persist events as tasks to ensure alias loads
        journalNotes: state.journalNotes,
        preferences: state.preferences,
      }),
    }
  )
);

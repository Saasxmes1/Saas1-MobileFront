// ============================================================
// ZUSTAND APP STORE — Events + Journal with AsyncStorage
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

import { APP_CONFIG } from '../constants/config';
import type { Event, JournalNote, UserPreferences, SectionData } from '../types';

// Simple UUID-like ID generator (avoids needing uuid package in Expo Go)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ---- State Interfaces ----

export interface AppState {
  events: Event[];
  journalNotes: JournalNote[];
  preferences: UserPreferences;

  // Event actions
  addEvent: (
    title: string,
    rawInput: string,
    scheduledAt: Date | null,
    dayKey: string,
    tags?: string[],
    isRecurring?: boolean
  ) => Event;
  completeEvent: (id: string) => void;
  deleteEvent: (id: string) => void;
  updateEventNotification: (id: string, notificationId: string | null) => void;
  clearCompletedEvents: () => void;

  // Journal actions
  upsertJournalNote: (dayKey: string, content: string) => void;
  deleteJournalNote: (id: string) => void;
  getJournalNoteByDay: (dayKey: string) => JournalNote | undefined;

  // Preferences
  updatePreferences: (partial: Partial<UserPreferences>) => void;

  // Selectors
  getEventsByDay: (dayKey: string) => Event[];
}

// ---- Label helpers ----

function getDayLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = todayKey();
  const tomorrowKey = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  if (dayKey === today) return 'Hoy';
  if (dayKey === tomorrowKey) return 'Mañana';

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return `${dayNames[date.getDay()]} ${day} de ${monthNames[month - 1]}`;
}

// ---- Store ----

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: [],
      journalNotes: [],
      preferences: {
        theme: 'dark',
        reminderMinutesBefore: 15,
        petEnabled: true,
        language: 'es',
        hapticEnabled: true,
      },

      // ── Event Actions ──────────────────────────────────────────

      addEvent: (title, rawInput, scheduledAt, dayKey, tags, isRecurring) => {
        const newEvent: Event = {
          id: generateId(),
          title,
          rawInput,
          scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
          notificationId: null,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          dayKey,
          tags: tags || [],
          isRecurring: !!isRecurring,
        };

        set((state) => ({
          events: [newEvent, ...state.events],
        }));

        return newEvent;
      },

      completeEvent: (id) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      updateEventNotification: (id, notificationId) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, notificationId } : e
          ),
        }));
      },

      clearCompletedEvents: () => {
        set((state) => ({
          events: state.events.filter((e) => !e.isCompleted),
        }));
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

      getEventsByDay: (dayKey) => {
        return get()
          .events.filter((e) => e.dayKey === dayKey)
          .sort((a, b) => {
            // Sort by scheduledAt time within the day
            if (!a.scheduledAt) return 1;
            if (!b.scheduledAt) return -1;
            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
          });
      },
    }),
    {
      name: APP_CONFIG.asyncStorageKey,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not derived state
      partialize: (state) => ({
        events: state.events,
        journalNotes: state.journalNotes,
        preferences: state.preferences,
      }),
    }
  )
);

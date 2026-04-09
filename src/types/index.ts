// ============================================================
// TYPES — Calendario Gamificado MVP
// ============================================================

export interface Event {
  id: string;
  title: string;
  rawInput: string;
  scheduledAt: string | null; // ISO string (serializable for Zustand persist)
  notificationId?: string | null;
  isCompleted: boolean;
  createdAt: string; // ISO string
  dayKey: string; // YYYY-MM-DD for grouping
}

export interface JournalNote {
  id: string;
  content: string;
  dayKey: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  reminderMinutesBefore: 5 | 10 | 15 | 30 | 60;
  petEnabled: boolean;
  language: 'es' | 'en';
  hapticEnabled: boolean;
}

export type PetState = 'idle' | 'success' | 'sad';

export interface ParsedInput {
  title: string;
  scheduledAt: Date | null;
  confidence: 'high' | 'low';
  dayKey: string; // YYYY-MM-DD
}

export interface SectionData {
  title: string; // display label: "Hoy", "Mañana", "Lunes 12 de Abril"
  dayKey: string; // YYYY-MM-DD
  data: Event[];
}

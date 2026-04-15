// ============================================================
// TYPES — Calendario Gamificado MVP -> Notion Architecture
// ============================================================

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  area: string; // ej: 'Estudio', 'Personal', 'Trabajo'
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null; // ISO string 
  content: string; // El "interior de la página"
  
  // Keep legacy properties if needed for timeline rendering context
  createdAt: string; 
  dayKey: string; // YYYY-MM-DD
  notificationIds?: string[];
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
  tags?: string[];
  isRecurring?: boolean;
  earlyAlertAt?: Date | null;
  area?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SectionData {
  title: string; // display label: "Hoy", "Mañana", "Lunes 12 de Abril"
  dayKey: string; // YYYY-MM-DD
  data: Task[];
}

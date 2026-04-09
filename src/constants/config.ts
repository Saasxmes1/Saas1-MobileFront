// ============================================================
// APP CONFIG
// ============================================================

export const APP_CONFIG = {
  name: 'CalendAI',
  version: '1.0.0',
  defaultReminderMinutes: 15,
  maxEventsFreemium: 50, // Free plan limit
  asyncStorageKey: 'calendai_store_v1',
  subscriptionKey: 'calendai_sub_v1',
} as const;

export const PREMIUM_FEATURES = [
  'Eventos ilimitados',
  'Temas personalizados',
  'Exportar calendario',
  'Widgets de escritorio',
  'Sin anuncios',
] as const;

export const REMINDER_OPTIONS: Array<5 | 10 | 15 | 30 | 60> = [5, 10, 15, 30, 60];

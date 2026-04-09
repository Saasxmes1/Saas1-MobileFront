// ============================================================
// NLP PARSER SERVICE — chrono-node (Spanish)
// ============================================================
import * as chrono from 'chrono-node';
import { format, startOfDay, isValid } from 'date-fns';
import type { ParsedInput } from '../types';

/**
 * Spanish date-time tokens to strip from the raw title
 * after chrono-node extracts the date information.
 */
const DATE_TOKENS_ES = [
  // Relative
  /\b(hoy|mañana|pasado mañana|ayer)\b/gi,
  // Days of week
  /\b(el\s+)?(lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi,
  // Time expressions
  /\b(a las?|las?|al?)\s+\d{1,2}(:\d{2})?\s*(am|pm|h|hrs?)?\b/gi,
  /\b\d{1,2}(:\d{2})?\s*(am|pm|h|hrs?)\b/gi,
  // Month/date patterns
  /\b(el\s+)?\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/gi,
  /\b(en\s+)?\d+\s+(minutos?|horas?|días?|dias?|semanas?|meses?)\b/gi,
  /\b(este|esta|próximo|proxima|próxima|siguiente)\s+(semana|mes|año|lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/gi,
  // Filler prepositions left after removal
  /\b(el|la|los|las|un|una)\s*$/gi,
  /^\s*(el|la|los|las|un|una)\s+/gi,
];

/**
 * Cleans up extracted date tokens from the raw input string
 * to produce a clean task title.
 */
function extractCleanTitle(raw: string, results: chrono.ParsedResult[]): string {
  let title = raw;

  // Remove the text ranges chrono identified as date/time
  // Process in reverse order to preserve indices
  const sorted = [...results].sort((a, b) => b.index - a.index);
  for (const result of sorted) {
    title = title.slice(0, result.index) + title.slice(result.index + result.text.length);
  }

  // Remove remaining Spanish date tokens
  for (const pattern of DATE_TOKENS_ES) {
    title = title.replace(pattern, ' ');
  }

  // Clean up whitespace and trailing punctuation
  title = title
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title || raw.trim();
}

/**
 * Returns today's date at the current time for fallback.
 */
function getTodayFallback(): Date {
  return new Date();
}

/**
 * Main NLP parsing function.
 * Accepts raw natural language input in Spanish.
 * Returns a clean title, scheduled date, and confidence level.
 */
export function parseNaturalInput(rawText: string): ParsedInput {
  const trimmed = rawText.trim();

  if (!trimmed) {
    const now = new Date();
    return {
      title: '',
      scheduledAt: now,
      confidence: 'low',
      dayKey: format(now, 'yyyy-MM-dd'),
    };
  }

  // Use chrono-node Spanish parser with current reference date
  const refDate = new Date();

  let results: chrono.ParsedResult[] = [];

  try {
    results = chrono.es.parse(trimmed, refDate, {
      forwardDate: true, // Prefer future dates
    });
  } catch {
    // Fallback if chrono fails
    results = [];
  }

  const cleanTitle = extractCleanTitle(trimmed, results);

  if (results.length > 0 && results[0].start) {
    const parsedDate = results[0].start.date();

    if (isValid(parsedDate)) {
      return {
        title: cleanTitle,
        scheduledAt: parsedDate,
        confidence: 'high',
        dayKey: format(parsedDate, 'yyyy-MM-dd'),
      };
    }
  }

  // Fallback: treat as a note for today
  const today = getTodayFallback();
  const todayStart = startOfDay(today);

  return {
    title: cleanTitle || trimmed,
    scheduledAt: todayStart,
    confidence: 'low',
    dayKey: format(todayStart, 'yyyy-MM-dd'),
  };
}

/**
 * Check if a string likely contains a date/time expression (Spanish)
 */
export function hasDateExpression(text: string): boolean {
  const results = chrono.es.parse(text, new Date(), { forwardDate: true });
  return results.length > 0;
}

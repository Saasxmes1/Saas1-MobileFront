// ============================================================
// NLP PARSER SERVICE — chrono-node (Spanish)
// ============================================================
import * as chrono from 'chrono-node';
import { format, startOfDay, isValid, subDays, subHours, subMinutes } from 'date-fns';
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

  // 1. Extract hashtags
  const tags: string[] = [];
  const tagRegex = /(?:^|\\s)#([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_]+)/g;
  let match;
  while ((match = tagRegex.exec(trimmed)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  // Strip hashtags from text
  let textToParse = trimmed.replace(tagRegex, '').trim();

  // 2. Check for recurrence
  const recurrenceRegex = /\\b(cada|todos los|todas las|diariamente|semanalmente|mensualmente)\\b/gi;
  const isRecurring = recurrenceRegex.test(textToParse);
  if (isRecurring) {
    textToParse = textToParse.replace(recurrenceRegex, '').trim();
  }

  // 3. Early Alert detection (avisar X tiempo antes)
  const alertRegex = /\\bavisar\s+(\d+)\s+(dí?a|hora|minuto)s?\s+antes\\b/i;
  let earlyAlertAt: Date | null = null;
  let alertMatchData: { amount: number; unit: string } | null = null;
  const alertMatch = alertRegex.exec(textToParse);
  if (alertMatch) {
    alertMatchData = {
      amount: parseInt(alertMatch[1], 10),
      unit: alertMatch[2].toLowerCase(),
    };
    textToParse = textToParse.replace(alertRegex, '').trim();
  }

  // 4. Area detection (/area)
  let area: string | undefined = undefined;
  const areaRegex = new RegExp('(?:^|\\\\s)/([a-zA-ZáéíóúÁÉÍÓÚñÑ_]+)', 'g');
  let areaMatch;
  // Get the last mentioned area
  while ((areaMatch = areaRegex.exec(textToParse)) !== null) {
    area = areaMatch[1].toLowerCase();
    area = area.charAt(0).toUpperCase() + area.slice(1); // Capitalize
  }
  textToParse = textToParse.replace(areaRegex, '').trim();

  // 5. Priority detection (!!!)
  let priority: 'low' | 'medium' | 'high' | undefined = undefined;
  if (/\\s!!!(\\s|$)/.test(textToParse) || /^!!!(\\s|$)/.test(textToParse)) {
    priority = 'high';
    textToParse = textToParse.replace(new RegExp('(?:^|\\\\s)!!!(?:\\\\s|$)', 'g'), ' ').trim();
  } else if (/\\s!!(\\s|$)/.test(textToParse) || /^!!(\\s|$)/.test(textToParse)) {
    priority = 'medium';
    textToParse = textToParse.replace(new RegExp('(?:^|\\\\s)!!(?:\\\\s|$)', 'g'), ' ').trim();
  } else if (/\\s!(\\s|$)/.test(textToParse) || /^!(\\s|$)/.test(textToParse)) {
    priority = 'low';
    textToParse = textToParse.replace(new RegExp('(?:^|\\\\s)!(?:\\\\s|$)', 'g'), ' ').trim();
  }

  if (!textToParse) {
    const now = new Date();
    return {
      title: trimmed, // keep original input if empty after strips
      scheduledAt: now,
      confidence: 'low',
      dayKey: format(now, 'yyyy-MM-dd'),
      tags,
      isRecurring,
      earlyAlertAt: null,
      area,
      priority,
    };
  }

  // Use chrono-node Spanish parser with current reference date
  const refDate = new Date();

  let results: chrono.ParsedResult[] = [];

  try {
    results = chrono.es.parse(textToParse, refDate, {
      forwardDate: true, // Prefer future dates
    });
  } catch {
    // Fallback if chrono fails
    results = [];
  }

  const cleanTitle = extractCleanTitle(textToParse, results);

  if (results.length > 0 && results[0].start) {
    const parsedDate = results[0].start.date();

    if (isValid(parsedDate)) {
      if (alertMatchData) {
        if (alertMatchData.unit.startsWith('d')) earlyAlertAt = subDays(parsedDate, alertMatchData.amount);
        else if (alertMatchData.unit.startsWith('h')) earlyAlertAt = subHours(parsedDate, alertMatchData.amount);
        else if (alertMatchData.unit.startsWith('m')) earlyAlertAt = subMinutes(parsedDate, alertMatchData.amount);
      }

      return {
        title: cleanTitle,
        scheduledAt: parsedDate,
        confidence: 'high',
        dayKey: format(parsedDate, 'yyyy-MM-dd'),
        tags,
        isRecurring,
        earlyAlertAt,
        area,
        priority,
      };
    }
  }

  // Fallback: treat as a note for today
  const today = getTodayFallback();
  const todayStart = startOfDay(today);

  return {
    title: cleanTitle || textToParse,
    scheduledAt: todayStart,
    confidence: 'low',
    dayKey: format(todayStart, 'yyyy-MM-dd'),
    tags,
    isRecurring,
    earlyAlertAt: null,
    area,
    priority,
  };
}

/**
 * Check if a string likely contains a date/time expression (Spanish)
 */
export function hasDateExpression(text: string): boolean {
  const results = chrono.es.parse(text, new Date(), { forwardDate: true });
  return results.length > 0;
}

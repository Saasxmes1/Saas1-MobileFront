// ============================================================
// JOURNAL CARD — Daily notes editor card
// ============================================================
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';

interface Props {
  dayKey: string;
  dayLabel: string;
}

export default function JournalCard({ dayKey, dayLabel }: Props) {
  const getJournalNoteByDay = useAppStore((s) => s.getJournalNoteByDay);
  const upsertJournalNote = useAppStore((s) => s.upsertJournalNote);

  const note = getJournalNoteByDay(dayKey);
  const [localText, setLocalText] = useState(note?.content ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (text: string) => {
      setLocalText(text);
      // Auto-save with debounce
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        if (text.trim()) {
          upsertJournalNote(dayKey, text);
        }
      }, 800);
    },
    [dayKey, upsertJournalNote]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localText.trim()) {
      upsertJournalNote(dayKey, localText);
    }
  }, [dayKey, localText, upsertJournalNote]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📓</Text>
        <Text style={styles.headerTitle}>Notas del día</Text>
        <Text style={styles.headerDate}>{dayLabel}</Text>
      </View>

      <TextInput
        style={styles.input}
        value={localText}
        onChangeText={handleChange}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        placeholder="Escribe tus pensamientos, ideas o reflexiones del día..."
        placeholderTextColor={Colors.text.muted}
        multiline
        textAlignVertical="top"
        selectionColor={Colors.brand.primaryLight}
        keyboardAppearance="dark"
      />

      {isEditing && localText.trim().length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.charCount}>{localText.length} caracteres</Text>
          <Text style={styles.saveStatus}>✓ Auto-guardado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    overflow: 'hidden',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.surfaceBorder,
    gap: Spacing.xs,
  },
  headerEmoji: {
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerDate: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  input: {
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    padding: Spacing.md,
    minHeight: 100,
    lineHeight: Typography.size.md * Typography.lineHeight.relaxed,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  charCount: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
  },
  saveStatus: {
    color: Colors.brand.accentLight,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
});

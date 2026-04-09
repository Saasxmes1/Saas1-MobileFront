// ============================================================
// DIARY SCREEN — Journal notes by day
// ============================================================
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

import JournalCard from '../components/JournalCard';
import { Colors, Spacing, Typography } from '../constants/theme';

function getDateLabel(date: Date): string {
  const today = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isYesterday =
    format(date, 'yyyy-MM-dd') === format(subDays(today, 1), 'yyyy-MM-dd');

  if (isToday) return 'Hoy';
  if (isYesterday) return 'Ayer';

  const label = format(date, "EEEE, d 'de' MMMM", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function DiaryScreen() {
  // Show last 7 days
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date,
        dayKey: format(date, 'yyyy-MM-dd'),
        label: getDateLabel(date),
      };
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />
      <LinearGradient
        colors={['#12101A', '#0F0F14']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📓</Text>
          <View>
            <Text style={styles.title}>Mi Diario</Text>
            <Text style={styles.subtitle}>Reflexiones de los últimos 7 días</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {days.map((day) => (
            <JournalCard key={day.dayKey} dayKey={day.dayKey} dayLabel={day.label} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    color: Colors.text.muted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    gap: Spacing.xs,
  },
});

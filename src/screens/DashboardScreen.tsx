// ============================================================
// DASHBOARD SCREEN — Notion-like Architecture 
// ============================================================
import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SectionList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import MagicInput from '../components/MagicInput';
import TimelineList from '../components/TimelineList';
import AdBanner from '../components/AdBanner';
import DailySuccessCard from '../components/DailySuccessCard';
import FullCalendarView from '../components/FullCalendarView';
import TaskPageScreen from '../components/ui/TaskPageScreen';
import FilterBar, { FilterValue } from '../components/FilterBar';
import { useAppStore } from '../store/useAppStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { requestNotificationPermissions } from '../services/notifications';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function DashboardScreen() {
  const listRef = useRef<SectionList>(null);
  const navigation = useNavigation<any>();
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const tasks = useAppStore((s) => s.tasks);
  
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<FilterValue>('all');

  const progress = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTasks = tasks.filter((t) => t.dayKey === today);
    const completed = todayTasks.filter((t) => t.status === 'done').length;
    return { total: todayTasks.length, completed };
  }, [tasks]);

  const showSuccessCard = progress.total > 0 && progress.total === progress.completed;

  // Request notification permissions on first focus
  useFocusEffect(
    useCallback(() => {
      requestNotificationPermissions().catch(() => {});
    }, [])
  );

  const handleUpgrade = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleTaskAdded = useCallback(() => {
    // Scroll to top to show newly added task
    listRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      viewOffset: 0,
      animated: true,
    });
  }, []);

  const now = new Date();
  const greeting = (() => {
    const hour = now.getHours();
    if (hour < 12) return 'Buenos días ☀️';
    if (hour < 18) return 'Buenas tardes 🌤️';
    return 'Buenas noches 🌙';
  })();

  const dateLabel = format(now, "EEEE, d 'de' MMMM", { locale: es });
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const progressPct = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 2px Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.dateLabel}>{capitalizedDate}</Text>
              </View>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>⭐ Premium</Text>
                </View>
              )}
            </View>
          </View>

          {/* Daily Success - Only show if all tasks for today are completed */}
          {showSuccessCard && <DailySuccessCard />}

          {/* Full Monthly Calendar */}
          <FullCalendarView 
            selectedDate={selectedDateFilter} 
            onSelectDate={setSelectedDateFilter} 
          />

          {/* Dynamic Filters */}
          <FilterBar 
            selectedFilter={selectedTopicFilter}
            onSelectFilter={setSelectedTopicFilter}
          />

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <TimelineList 
              listRef={listRef as any} 
              filterValue={selectedTopicFilter}
              calendarDay={selectedDateFilter} 
            />
          </View>

          {/* Magic Input Floats ALWAYS at bottom */}
          <View style={styles.floatingInput}>
            <MagicInput onEventAdded={handleTaskAdded} />
          </View>

          {/* Ad Banner */}
          <AdBanner onUpgradePress={handleUpgrade} />
        </KeyboardAvoidingView>

        {/* The Notion-style Detail View (Bottom Sheet) */}
        <TaskPageScreen />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.bg, // Strict dark notion bg
  },
  progressBarBg: {
    height: 2,
    backgroundColor: Colors.dark.surfaceBorder,
    width: '100%',
  },
  progressBarFill: {
    height: 2,
    backgroundColor: Colors.brand.primary,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 2,
  },
  dateLabel: {
    color: Colors.text.primary,
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  premiumBadge: {
    backgroundColor: Colors.glass,
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginTop: 4,
  },
  premiumText: {
    color: Colors.brand.primaryLight,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  timelineContainer: {
    flex: 1,
  },
  floatingInput: {
    backgroundColor: Colors.dark.bg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceBorder,
  }
});

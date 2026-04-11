// ============================================================
// DASHBOARD SCREEN — Main screen with Magic Input + Timeline
// ============================================================
import React, { useRef, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import MagicInput from '../components/MagicInput';
import PetCompanion, { type PetCompanionRef } from '../components/PetCompanion';
import TimelineList from '../components/TimelineList';
import AdBanner from '../components/AdBanner';
import DailySuccessCard from '../components/DailySuccessCard';
import FullCalendarView from '../components/FullCalendarView';
import { useAppStore } from '../store/useAppStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { requestNotificationPermissions } from '../services/notifications';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function DashboardScreen() {
  const petRef = useRef<PetCompanionRef>(null);
  const listRef = useRef<SectionList>(null);
  const navigation = useNavigation<any>();
  const petEnabled = useAppStore((s) => s.preferences.petEnabled);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const events = useAppStore((s) => s.events);
  
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<string | null>(null);

  const progress = React.useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEvents = events.filter((e) => e.dayKey === today);
    const completed = todayEvents.filter((e) => e.status === 'listo').length;
    return { total: todayEvents.length, completed };
  }, [events]);

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

  const handleEventAdded = useCallback(() => {
    // Scroll to top to show newly added event
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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />

      <LinearGradient
        colors={['#12101A', '#0F0F14']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
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

          {/* Pet Companion */}
          {petEnabled && (
            <View style={styles.petContainer}>
              <PetCompanion ref={petRef} size={100} />
            </View>
          )}

          {/* Magic Input */}
          <MagicInput petRef={petRef} onEventAdded={handleEventAdded} />

          {/* Daily Success - Only show if all tasks for today are completed */}
          {showSuccessCard && <DailySuccessCard />}

          {/* Full Monthly Calendar */}
          <FullCalendarView 
            selectedDate={selectedDateFilter} 
            onSelectDate={setSelectedDateFilter} 
          />

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <TimelineList listRef={listRef as any} filterDayKey={selectedDateFilter} />
          </View>

          {/* Ad Banner */}
          <AdBanner onUpgradePress={handleUpgrade} />
        </KeyboardAvoidingView>
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
  petContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  timelineContainer: {
    flex: 1,
  },
});

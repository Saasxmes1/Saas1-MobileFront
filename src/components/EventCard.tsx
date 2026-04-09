import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppStore } from '../store/useAppStore';
import { cancelReminder } from '../services/notifications';
import { useHaptics } from '../hooks/useHaptics';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';
import type { Event } from '../types';

interface Props {
  event: Event;
}

const SWIPE_THRESHOLD = 80;

export default function EventCard({ event }: Props) {
  const completeEvent = useAppStore((s) => s.completeEvent);
  const deleteEvent = useAppStore((s) => s.deleteEvent);
  const haptics = useHaptics();

  const cardOpacity = useRef(new Animated.Value(1)).current;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    const hours = d.getHours();
    const mins = d.getMinutes();
    if (hours === 0 && mins === 0) return null; // midnight → no time shown
    return format(d, 'h:mm a', { locale: es });
  };

  const handleComplete = useCallback(() => {
    haptics.impactMedium();
    completeEvent(event.id);
  }, [completeEvent, event.id, haptics]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (event.notificationId) {
        cancelReminder(event.notificationId).catch(() => {});
      }
      deleteEvent(event.id);
    });
    haptics.impactHeavy();
  }, [deleteEvent, event.id, event.notificationId, haptics, cardOpacity]);

  const timeLabel = formatTime(event.scheduledAt);

  return (
    <Animated.View style={[styles.container, { opacity: cardOpacity }]}>
      {/* Card — no swipe gestures for Expo Go compatibility */}
      <View style={[styles.card, event.isCompleted && styles.cardCompleted]}>
        <View style={[styles.colorBar, event.isCompleted && { backgroundColor: Colors.text.muted }]} />
        <View style={styles.content}>
          <Text style={[styles.title, event.isCompleted && styles.titleCompleted]} numberOfLines={2}>
            {event.title}
          </Text>
          {timeLabel && (
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>⏰ {timeLabel}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.checkButton, event.isCompleted && styles.checkCompleted]}
          onPress={handleComplete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.checkIcon}>{event.isCompleted ? '✓' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    position: 'relative',
    overflow: 'visible',
  },
  actionLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_THRESHOLD,
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_THRESHOLD,
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionIcon: {
    fontSize: 22,
    color: 'white',
    fontWeight: '700',
  },
  actionIconSmall: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: Typography.size.xs,
    color: 'white',
    fontFamily: Typography.fontFamily.semiBold,
  },
  actionLabelDanger: {
    fontSize: Typography.size.xs,
    color: 'white',
    fontFamily: Typography.fontFamily.semiBold,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    ...Shadows.card,
  },
  cardCompleted: {
    opacity: 0.55,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: Colors.brand.primary,
    borderTopLeftRadius: Radius.md,
    borderBottomLeftRadius: Radius.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.size.md * Typography.lineHeight.normal,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: Colors.brand.primaryLight,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.dark.surfaceBorder,
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkCompleted: {
    backgroundColor: Colors.brand.accent,
    borderColor: Colors.brand.accent,
  },
  checkIcon: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  deleteIcon: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
});

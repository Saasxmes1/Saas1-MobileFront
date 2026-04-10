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

  const [isHidden, setIsHidden] = React.useState(false);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardHeight = useRef(new Animated.Value(64)).current; // Base height initially
  const strikeProgress = useRef(new Animated.Value(event.isCompleted ? 1 : 0)).current;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    const hours = d.getHours();
    const mins = d.getMinutes();
    if (hours === 0 && mins === 0) return null; // midnight → no time shown
    return format(d, 'h:mm a', { locale: es });
  };

  const handleComplete = useCallback(() => {
    if (event.isCompleted) return; // Prevent double trigger
    
    haptics.impactLight(); // 1. Initial haptic feedback

    // 2. Animate Strikethrough and Pulse
    Animated.parallel([
      Animated.sequence([
        Animated.timing(cardScale, { toValue: 1.02, duration: 150, useNativeDriver: false }),
        Animated.timing(cardScale, { toValue: 1, duration: 150, useNativeDriver: false }),
      ]),
      Animated.timing(strikeProgress, { toValue: 1, duration: 300, useNativeDriver: false }) // false so we can interpolate width
    ]).start(() => {
      // 3. Wait 600ms
      setTimeout(() => {
        // 4. Fade out and height collapse
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 0, duration: 300, useNativeDriver: false }), // false for height
          Animated.timing(cardHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => {
          setIsHidden(true); // Hide component fully
          completeEvent(event.id); // 5. Update Zustand
        });
      }, 600);
    });
  }, [completeEvent, event.id, haptics, cardScale, strikeProgress, cardOpacity, cardHeight, event.isCompleted]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(cardHeight, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => {
      setIsHidden(true);
      if (event.notificationId) {
        cancelReminder(event.notificationId).catch(() => {});
      }
      deleteEvent(event.id);
    });
    haptics.impactHeavy();
  }, [deleteEvent, event.id, event.notificationId, haptics, cardOpacity, cardHeight]);

  if (isHidden || event.isCompleted) return null; // Fully hide if removed or already completed in state

  const timeLabel = formatTime(event.scheduledAt);

  const strikeWidth = strikeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <Animated.View style={[styles.container, { opacity: cardOpacity, transform: [{ scale: cardScale }], height: cardHeight }]}>
      {/* Card — no swipe gestures for Expo Go compatibility */}
      <View style={[styles.card, { height: '100%' }]}>
        <View style={styles.colorBar} />
        <View style={styles.content}>
          <View>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            {/* Animated Strikethrough */}
            <Animated.View style={[styles.strikethrough, { width: strikeWidth }]} />
          </View>
          
          <View style={styles.badgesRow}>
            {timeLabel && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>⏰ {timeLabel}</Text>
              </View>
            )}
            {event.isRecurring && (
              <View style={styles.recurringBadge}>
                <Text style={styles.recurringText}>🔁 Recurrente</Text>
              </View>
            )}
            {event.tags?.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
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
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
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
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: 2,
    backgroundColor: Colors.text.muted,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
  recurringBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  recurringText: {
    color: Colors.brand.accent,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  tagBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  tagText: {
    color: Colors.brand.primaryLight,
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
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

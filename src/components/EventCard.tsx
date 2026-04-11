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
  const updateEventStatus = useAppStore((s) => s.updateEventStatus);
  const deleteEvent = useAppStore((s) => s.deleteEvent);
  const setActiveEditEventId = useAppStore((s) => s.setActiveEditEventId);
  const haptics = useHaptics();

  const [isHidden, setIsHidden] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState(event.status);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardHeight = useRef(new Animated.Value(64)).current; // Base height initially
  const strikeProgress = useRef(new Animated.Value(event.status === 'listo' ? 1 : 0)).current;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    const hours = d.getHours();
    const mins = d.getMinutes();
    if (hours === 0 && mins === 0) return null; // midnight → no time shown
    return format(d, 'h:mm a', { locale: es });
  };

  const handleStatusCycle = useCallback(() => {
    if (localStatus === 'listo') return; // Prevent double trigger
    
    // Cycle: sin-empezar -> en-curso
    if (localStatus === 'sin-empezar') {
      haptics.impactLight();
      setLocalStatus('en-curso');
      updateEventStatus(event.id, 'en-curso');
      return;
    }

    // Cycle: en-curso -> listo
    if (localStatus === 'en-curso') {
      haptics.impactMedium(); // 1. Initial haptic feedback
      setLocalStatus('listo'); // Visually update immediately


      // Cancel Nag Mode local reminders when doing the final completion
      if (event.notificationIds?.length) {
        cancelReminder(event.notificationIds).catch(() => {});
      }

      // 2. Animate Strikethrough and Pulse
      Animated.parallel([
        Animated.sequence([
          Animated.timing(cardScale, { toValue: 1.02, duration: 150, useNativeDriver: false }),
          Animated.timing(cardScale, { toValue: 1, duration: 150, useNativeDriver: false }),
        ]),
        Animated.timing(strikeProgress, { toValue: 1, duration: 300, useNativeDriver: false })
      ]).start(() => {
        // 3. Wait 600ms
        setTimeout(() => {
          // 4. Fade out and height collapse
          Animated.parallel([
            Animated.timing(cardOpacity, { toValue: 0, duration: 300, useNativeDriver: false }),
            Animated.timing(cardHeight, { toValue: 0, duration: 300, useNativeDriver: false }),
          ]).start(() => {
            setIsHidden(true); // Hide component fully
            updateEventStatus(event.id, 'listo'); // 5. Update Zustand
          });
        }, 600);
      });
    }
  }, [updateEventStatus, event.id, haptics, cardScale, strikeProgress, cardOpacity, cardHeight, event.notificationIds, localStatus]);

  const handleDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(cardHeight, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => {
      setIsHidden(true);
      if (event.notificationIds?.length) {
        cancelReminder(event.notificationIds).catch(() => {});
      }
      deleteEvent(event.id);
    });
    haptics.impactHeavy();
  }, [deleteEvent, event.id, event.notificationIds, haptics, cardOpacity, cardHeight]);

  if (isHidden) return null; // Fully hide if removed or completed animation finishes

  const timeLabel = formatTime(event.scheduledAt);

  const strikeWidth = strikeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const priorityBadge = event.priority === 'high' ? '!!!' : event.priority === 'medium' ? '!!' : event.priority === 'low' ? '!' : null;

  return (
    <Animated.View style={[styles.container, { opacity: cardOpacity, transform: [{ scale: cardScale }], height: cardHeight }]}>
      <TouchableOpacity 
        style={[styles.card, { height: '100%' }]}
        activeOpacity={0.9}
        onPress={() => setActiveEditEventId(event.id)}
      >
        <View style={styles.colorBar} />
        <View style={styles.content}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {priorityBadge && (
              <Text style={styles.priorityText}>{priorityBadge} </Text>
            )}
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            {/* Animated Strikethrough */}
            <Animated.View style={[styles.strikethrough, { width: strikeWidth }]} />
          </View>
          
          <View style={styles.badgesRow}>
            {timeLabel && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{timeLabel}</Text>
              </View>
            )}
            {event.area && (
              <View style={styles.areaBadge}>
                <Text style={styles.areaText}>{event.area}</Text>
              </View>
            )}
            {event.isRecurring && (
              <View style={styles.recurringBadge}>
                <Text style={styles.recurringText}>🔁</Text>
              </View>
            )}
            {event.tags?.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Status Cyclic Badge */}
        <TouchableOpacity
          style={[
            styles.statusButton, 
            localStatus === 'en-curso' && styles.statusInProgress,
            localStatus === 'listo' && styles.statusDone,
          ]}
          onPress={handleStatusCycle}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.statusIcon, localStatus === 'en-curso' && styles.statusIconProgress]}>
            {localStatus === 'sin-empezar' ? '' : localStatus === 'en-curso' ? '▶' : '✓'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
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
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.dark.surfaceBorder,
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
  priorityText: {
    color: Colors.brand.danger, // Apple Red
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.bold,
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    height: 1,
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
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  areaBadge: {
    backgroundColor: Colors.dark.surfaceBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  areaText: {
    color: Colors.text.secondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'uppercase',
  },
  recurringBadge: {
    paddingHorizontal: 2,
  },
  recurringText: {
    fontSize: 10,
  },
  tagBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tagText: {
    color: Colors.text.muted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.dark.surfaceBorder,
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  statusInProgress: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusDone: {
    backgroundColor: Colors.brand.accent,
    borderColor: Colors.brand.accent,
  },
  statusIcon: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  statusIconProgress: {
    color: '#F59E0B',
    fontSize: 12,
    marginLeft: 2,
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

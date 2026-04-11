import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useHaptics } from '../../hooks/useHaptics';
import { Colors, Spacing, Radius, Typography, Shadows } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AREAS = ['Arquitectura', 'Estudio', 'Personal', 'Trabajo', 'Salud'];
const PRIORITIES = [
  { value: 'high', label: 'Alta', icon: '!!!' },
  { value: 'medium', label: 'Media', icon: '!!' },
  { value: 'low', label: 'Baja', icon: '!' },
] as const;

const STATUSES = [
  { value: 'sin-empezar', label: 'Sin empezar' },
  { value: 'en-curso', label: 'En curso' },
  { value: 'listo', label: 'Completado' },
] as const;

export default function EventBottomSheet() {
  const activeEditEventId = useAppStore((s) => s.activeEditEventId);
  const setActiveEditEventId = useAppStore((s) => s.setActiveEditEventId);
  const updateEventProperties = useAppStore((s) => s.updateEventProperties);
  const events = useAppStore((s) => s.events);
  const haptics = useHaptics();

  const event = events.find((e) => e.id === activeEditEventId);
  
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Mount/Unmount hooks
  useEffect(() => {
    if (activeEditEventId && event) {
      setVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 250,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      haptics.impactLight();
    } else {
      closeAnim();
    }
  }, [activeEditEventId]);

  const closeAnim = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => setVisible(false));
    setActiveEditEventId(null);
  };

  const handleUpdate = (partial: any) => {
    if (!event) return;
    haptics.selection();
    updateEventProperties(event.id, partial);
  };

  if (!visible && !activeEditEventId) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeAnim}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={closeAnim}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.dragHandle} />
          
          <Text style={styles.sheetTitle} numberOfLines={2}>
            {event?.title}
          </Text>

          {/* STATUS */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.row}>
            {STATUSES.map(st => (
              <TouchableOpacity
                key={st.value}
                style={[styles.pill, event?.status === st.value && styles.pillActive]}
                onPress={() => handleUpdate({ status: st.value })}
              >
                <Text style={[styles.pillText, event?.status === st.value && styles.pillTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PRIORIDAD */}
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.row}>
            {PRIORITIES.map(pr => (
              <TouchableOpacity
                key={pr.value}
                style={[styles.pill, event?.priority === pr.value && styles.pillActive]}
                onPress={() => handleUpdate({ priority: pr.value })}
              >
                <Text style={[styles.pillText, event?.priority === pr.value && styles.pillTextActive]}>
                  {pr.icon} {pr.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AREA */}
          <Text style={styles.label}>Área</Text>
          <View style={styles.rowWrap}>
            {AREAS.map(ar => (
              <TouchableOpacity
                key={ar}
                style={[styles.pill, event?.area === ar && styles.pillActive]}
                onPress={() => handleUpdate({ area: event?.area === ar ? undefined : ar })}
              >
                <Text style={[styles.pillText, event?.area === ar && styles.pillTextActive]}>
                  {ar}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.overlay,
  },
  sheet: {
    backgroundColor: Colors.dark.surfaceHigh,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.md,
    maxHeight: '80%',
    ...Shadows.card,
    borderTopWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.text.muted,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    color: Colors.text.primary,
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  label: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  pill: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  pillActive: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  pillText: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  pillTextActive: {
    color: Colors.dark.bg, // Text matches background
    fontFamily: Typography.fontFamily.bold,
  },
});

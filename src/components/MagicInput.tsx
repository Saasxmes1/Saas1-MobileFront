// ============================================================
// MAGIC INPUT — NLP-powered, compatible con Expo Go
// Usa Animated API estándar (sin Reanimated worklets)
// ============================================================
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { parseNaturalInput, hasDateExpression } from '../services/nlpParser';
import { scheduleEventReminder } from '../services/notifications';
import { useAppStore } from '../store/useAppStore';
import { useHaptics } from '../hooks/useHaptics';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';
import type { PetCompanionRef } from './PetCompanion';

interface Props {
  petRef?: React.RefObject<PetCompanionRef | null>;
  onEventAdded?: () => void;
}

export default function MagicInput({ petRef, onEventAdded }: Props) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animated values (standard RN — Expo Go compatible)
  const borderAnim = useRef(new Animated.Value(0)).current;
  const submitScale = useRef(new Animated.Value(1)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  const addEvent = useAppStore((s) => s.addEvent);
  const updateEventNotification = useAppStore((s) => s.updateEventNotification);
  const reminderMinutes = useAppStore((s) => s.preferences.reminderMinutesBefore);
  const haptics = useHaptics();

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    haptics.impactLight();
  }, [borderAnim, haptics]);

  const handleBlur = useCallback(() => {
    if (!text) {
      setIsFocused(false);
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [text, borderAnim]);

  const showStatus = useCallback(
    (message: string, error = false) => {
      setStatusMessage(message);
      setIsError(error);
      Animated.timing(statusOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      if (statusTimeout.current) clearTimeout(statusTimeout.current);
      statusTimeout.current = setTimeout(() => {
        Animated.timing(statusOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setStatusMessage(null));
      }, 2500);
    },
    [statusOpacity]
  );

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeX]);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();

    if (!trimmed) {
      haptics.notificationError();
      triggerShake();
      petRef?.current?.playSad();
      showStatus('Escribe algo primero 👀', true);
      return;
    }

    // Button micro-animation
    Animated.sequence([
      Animated.spring(submitScale, { toValue: 0.88, speed: 30, bounciness: 4, useNativeDriver: true }),
      Animated.spring(submitScale, { toValue: 1.0, speed: 20, bounciness: 6, useNativeDriver: true }),
    ]).start();

    const parsed = parseNaturalInput(trimmed);
    const newEvent = addEvent(
      parsed.title,
      trimmed,
      parsed.scheduledAt,
      parsed.dayKey,
      parsed.tags,
      parsed.isRecurring
    );

    Keyboard.dismiss();
    setText('');
    setIsFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    haptics.notificationSuccess();
    petRef?.current?.playSuccess();

    const isToday = parsed.dayKey === new Date().toISOString().slice(0, 10);
    const msg =
      parsed.confidence === 'high'
        ? `✅ ${parsed.title.length > 28 ? parsed.title.slice(0, 28) + '…' : parsed.title}`
        : `📝 Guardado como nota de ${isToday ? 'hoy' : parsed.dayKey}`;
    showStatus(msg);

    onEventAdded?.();

    if (newEvent.scheduledAt) {
      scheduleEventReminder(newEvent, reminderMinutes)
        .then((notifId) => {
          if (notifId) updateEventNotification(newEvent.id, notifId);
        })
        .catch(() => {});
    }
  }, [
    text, addEvent, updateEventNotification, reminderMinutes,
    haptics, petRef, showStatus, triggerShake, submitScale,
    borderAnim, onEventAdded,
  ]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.dark.surfaceBorder, Colors.brand.primary],
  });

  const hasDate = text.length > 3 && hasDateExpression(text);

  return (
    <View style={styles.outerWrapper}>
      {/* Status */}
      <Animated.View style={[styles.statusBar, { opacity: statusOpacity }]}>
        <Text
          style={[styles.statusText, isError && { color: Colors.brand.danger }]}
          numberOfLines={1}
        >
          {statusMessage}
        </Text>
      </Animated.View>

      {/* Input container */}
      <Animated.View style={[styles.wrapper, { transform: [{ translateX: shakeX }] }]}>
        <Animated.View
          style={[styles.borderContainer, { borderColor }]}
        >
          {isFocused && (
            <LinearGradient
              colors={Colors.gradients.magic}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientAccent}
            />
          )}

          <View style={styles.inputRow}>
            <View style={styles.iconWrapper}>
              <Text style={styles.magicIcon}>✨</Text>
            </View>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={handleSubmit}
              placeholder="Escribe algo... 'Reunión el viernes a las 3pm'"
              placeholderTextColor={Colors.text.muted}
              returnKeyType="done"
              blurOnSubmit={false}
              multiline={false}
              maxLength={280}
              selectionColor={Colors.brand.primaryLight}
              keyboardAppearance="dark"
            />

            {hasDate && (
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>📅</Text>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: submitScale }] }}>
              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
                <LinearGradient
                  colors={Colors.gradients.magic}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendIcon}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {isFocused && (
          <Text style={styles.hintText}>
            {hasDate
              ? '📅 Fecha detectada — presiona Enter para guardar'
              : 'Sin fecha → se guarda como nota de hoy'}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: { marginHorizontal: Spacing.md, marginTop: Spacing.sm },
  statusBar: { alignItems: 'center', marginBottom: Spacing.xs, height: 22 },
  statusText: { color: Colors.brand.accentLight, fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.medium },
  wrapper: { gap: Spacing.xs },
  borderContainer: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.dark.surface,
    overflow: 'hidden',
    ...Shadows.input,
  },
  gradientAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, height: 56 },
  iconWrapper: { marginRight: Spacing.sm },
  magicIcon: { fontSize: 20 },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    paddingVertical: 0,
    ...Platform.select({ ios: { paddingTop: 0 } }),
  },
  dateBadge: { backgroundColor: Colors.glass, borderRadius: Radius.full, paddingHorizontal: Spacing.xs, paddingVertical: 2, marginRight: Spacing.sm },
  dateBadgeText: { fontSize: 14 },
  sendGradient: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: -1 },
  hintText: { color: Colors.text.muted, fontSize: Typography.size.xs, fontFamily: Typography.fontFamily.regular, textAlign: 'center', paddingBottom: Spacing.xs },
});

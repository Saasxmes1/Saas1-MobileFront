// ============================================================
// DAILY SUCCESS CARD — Zero-Friction Summary
// ============================================================
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { useHaptics } from '../hooks/useHaptics';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';

export default function DailySuccessCard() {
  const [text, setText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const upsertJournalNote = useAppStore((s) => s.upsertJournalNote);
  const haptics = useHaptics();

  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    
    // Save to journal
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    upsertJournalNote(todayKey, text.trim());
    
    Keyboard.dismiss();
    haptics.notificationSuccess();
    
    // Show checkmark then keep it saved
    setIsSaved(true);
    Animated.timing(fadeAnim, {
      toValue: 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [text, upsertJournalNote, haptics, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[Colors.dark.surfaceHigh, Colors.dark.surface]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🌟</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>¡Día perfecto!</Text>
            <Text style={styles.subtitle}>Has completado todas tus tareas. ¿Cómo te sientes hoy?</Text>
          </View>
        </View>

        {!isSaved ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Escribe tu reflexión..."
              placeholderTextColor={Colors.text.muted}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              keyboardAppearance="dark"
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Text style={styles.sendIcon}>^</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.successMessage}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Guardado en tu diario</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.brand.primaryLight + '40', // 25% opacity
    overflow: 'hidden',
    ...Shadows.card,
  },
  gradient: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: Colors.brand.primaryLight,
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    height: 40,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.dark.surfaceBorder,
  },
  sendIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  successIcon: {
    color: Colors.brand.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: Spacing.sm,
  },
  successText: {
    color: Colors.brand.accent,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
  },
});

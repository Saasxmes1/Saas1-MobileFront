// ============================================================
// HOOK: useHaptics — Haptic feedback wrapper
// ============================================================
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import { useCallback } from 'react';

export function useHaptics() {
  const hapticEnabled = useAppStore((s) => s.preferences.hapticEnabled);

  const impactLight = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [hapticEnabled]);

  const impactMedium = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [hapticEnabled]);

  const impactHeavy = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, [hapticEnabled]);

  const notificationSuccess = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [hapticEnabled]);

  const notificationError = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, [hapticEnabled]);

  const selection = useCallback(() => {
    if (!hapticEnabled) return;
    Haptics.selectionAsync().catch(() => {});
  }, [hapticEnabled]);

  return {
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationError,
    selection,
  };
}

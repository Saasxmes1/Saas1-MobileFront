// ============================================================
// SETTINGS SCREEN — Preferences + Premium upgrade
// ============================================================
import React from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, type AppState } from '../store/useAppStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import type { SubscriptionState } from '../store/useSubscriptionStore';
import { cancelAllReminders } from '../services/notifications';
import { Colors, Spacing, Radius, Typography, Shadows } from '../constants/theme';
import { PREMIUM_FEATURES, REMINDER_OPTIONS } from '../constants/config';
import type { UserPreferences } from '../types';

function SettingRow({
  label,
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingTitle}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {children}
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const preferences = useAppStore((s: AppState) => s.preferences);
  const updatePreferences = useAppStore((s: AppState) => s.updatePreferences);
  const clearCompletedEvents = useAppStore((s: AppState) => s.clearCompletedEvents);

  const isPremium = useSubscriptionStore((s: SubscriptionState) => s.isPremium);
  const setIsPremium = useSubscriptionStore((s: SubscriptionState) => s.setIsPremium);
  const startTrial = useSubscriptionStore((s: SubscriptionState) => s.startTrial);

  const handleToggle = (key: keyof UserPreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleReminderChange = (minutes: 5 | 10 | 15 | 30 | 60) => {
    updatePreferences({ reminderMinutesBefore: minutes });
  };

  const handleUpgrade = () => {
    Alert.alert(
      '⭐ CalendAI Premium',
      '¡Activa tu prueba gratuita de 7 días!\n\nAccede a todas las funciones premium sin costo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar prueba gratis',
          onPress: () => {
            startTrial();
            Alert.alert('🎉 ¡Bienvenido a Premium!', 'Disfruta de todas las funciones durante 7 días.');
          },
        },
      ]
    );
  };

  const handleClearCompleted = () => {
    Alert.alert(
      'Limpiar completados',
      '¿Eliminar todos los eventos completados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            clearCompletedEvents();
            cancelAllReminders().catch(() => {});
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.bg} />
      <LinearGradient
        colors={['#12101A', '#0F0F14']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Ajustes</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Premium Banner ───────────────────────────────── */}
          {!isPremium && (
            <View>
              <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.9}>
                <LinearGradient
                  colors={Colors.gradients.magic}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.premiumBanner}
                >
                  <Text style={styles.premiumBannerTitle}>⭐ Upgrade a Premium</Text>
                  <Text style={styles.premiumBannerSubtitle}>
                    7 días gratis · Sin tarjeta requerida
                  </Text>
                  <View style={styles.featuresList}>
                    {PREMIUM_FEATURES.map((f) => (
                      <Text key={f} style={styles.featureItem}>
                        ✓ {f}
                      </Text>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {isPremium && (
            <View style={styles.premiumActive}>
              <Text style={styles.premiumActiveText}>⭐ Eres un usuario Premium</Text>
              <TouchableOpacity onPress={() => setIsPremium(false)}>
                <Text style={styles.downgradeText}>Cancelar suscripción</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Preferences ─────────────────────────────────── */}
          <View>
            <SectionCard title="🐾 Mascota">
              <SettingRow label="Mascota activa" subtitle="Muestra la mascota en el Dashboard">
                <Switch
                  value={preferences.petEnabled}
                  onValueChange={(v) => handleToggle('petEnabled', v)}
                  trackColor={{ false: Colors.dark.surfaceBorder, true: Colors.brand.primary }}
                  thumbColor="white"
                />
              </SettingRow>
            </SectionCard>
          </View>

          <View>
            <SectionCard title="🔔 Recordatorios">
              <SettingRow
                label="Tiempo de aviso"
                subtitle="Minutos antes del evento"
              >
                <View style={styles.pillsRow}>
                  {(REMINDER_OPTIONS as readonly (5 | 10 | 15 | 30 | 60)[]).map((mins: 5 | 10 | 15 | 30 | 60) => (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.pill,
                        preferences.reminderMinutesBefore === mins && styles.pillActive,
                      ]}
                      onPress={() => handleReminderChange(mins)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          preferences.reminderMinutesBefore === mins && styles.pillTextActive,
                        ]}
                      >
                        {mins}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </SettingRow>
            </SectionCard>
          </View>

          <View>
            <SectionCard title="📳 Dispositivo">
              <SettingRow label="Vibración háptica" subtitle="Feedback al guardar tareas">
                <Switch
                  value={preferences.hapticEnabled}
                  onValueChange={(v) => handleToggle('hapticEnabled', v)}
                  trackColor={{ false: Colors.dark.surfaceBorder, true: Colors.brand.primary }}
                  thumbColor="white"
                />
              </SettingRow>
            </SectionCard>
          </View>

          {/* ── Danger Zone ─────────────────────────────────── */}
          <View>
            <SectionCard title="🗑️ Mantenimiento">
              <TouchableOpacity style={styles.dangerButton} onPress={handleClearCompleted}>
                <Text style={styles.dangerText}>Limpiar eventos completados</Text>
              </TouchableOpacity>
            </SectionCard>
          </View>

          {/* App info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>CalendAI v1.0.0</Text>
            <Text style={styles.appInfoSubtext}>
              Hecho con ❤️ para ser el calendario más rápido del mundo
            </Text>
          </View>
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.xxl,
    fontFamily: Typography.fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  premiumBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  premiumBannerTitle: {
    color: 'white',
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  premiumBannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },
  featuresList: {
    gap: 4,
  },
  featureItem: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  premiumActive: {
    backgroundColor: Colors.glass,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  premiumActiveText: {
    color: Colors.brand.primaryLight,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semiBold,
  },
  downgradeText: {
    color: Colors.text.muted,
    fontSize: Typography.size.sm,
    textDecorationLine: 'underline',
  },
  sectionCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    overflow: 'hidden',
    ...Shadows.card,
  },
  sectionCardTitle: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceBorder,
    gap: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    color: Colors.text.primary,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
  },
  settingSubtitle: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  pill: {
    backgroundColor: Colors.dark.surfaceHigh,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  pillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  pillText: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  pillTextActive: {
    color: 'white',
  },
  dangerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceBorder,
  },
  dangerText: {
    color: Colors.error,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
  },
  appInfo: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  appInfoText: {
    color: Colors.text.muted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  appInfoSubtext: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    opacity: 0.7,
  },
});

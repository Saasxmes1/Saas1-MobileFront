// ============================================================
// AD BANNER — Freemium placeholder (no real SDK)
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';

interface Props {
  onUpgradePress?: () => void;
}

export default function AdBanner({ onUpgradePress }: Props) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  if (isPremium) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16163a']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.adIcon}>⭐</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Desbloquea Premium</Text>
            <Text style={styles.subtitle}>Sin ads · Eventos ilimitados · Widgets</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onUpgradePress} activeOpacity={0.85}>
            <LinearGradient
              colors={Colors.gradients.magic}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Ver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  gradient: {
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  adIcon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semiBold,
  },
  subtitle: {
    color: Colors.text.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  button: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  buttonText: {
    color: 'white',
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
  },
});

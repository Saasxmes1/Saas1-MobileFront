// ============================================================
// SUBSCRIPTION STORE — Freemium logic
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

export interface SubscriptionState {
  isPremium: boolean;
  upgradeSource: string | null;
  trialStartedAt: string | null;

  setIsPremium: (value: boolean, source?: string) => void;
  startTrial: () => void;
  resetSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isPremium: false,
      upgradeSource: null,
      trialStartedAt: null,

      setIsPremium: (value, source = 'manual') => {
        set({
          isPremium: value,
          upgradeSource: value ? source : null,
        });
      },

      startTrial: () => {
        set({
          isPremium: true,
          upgradeSource: 'trial',
          trialStartedAt: new Date().toISOString(),
        });
      },

      resetSubscription: () => {
        set({
          isPremium: false,
          upgradeSource: null,
          trialStartedAt: null,
        });
      },
    }),
    {
      name: APP_CONFIG.subscriptionKey,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

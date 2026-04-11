// ============================================================
// NOTIFICATIONS SERVICE — expo-notifications
// ============================================================
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { subMinutes, isAfter, isValid } from 'date-fns';
import type { Event } from '../types';

// Configure notification handler for foreground display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the OS.
 * Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule local notification reminders for an event.
 * Returns the notification identifiers.
 */
export async function scheduleEventReminder(
  event: Event,
  minutesBefore: number = 15,
  earlyAlertAt?: Date | null
): Promise<string[]> {
  if (!event.scheduledAt) return [];

  const scheduledDate = new Date(event.scheduledAt);
  if (!isValid(scheduledDate)) return [];

  const now = new Date();
  const notificationIds: string[] = [];

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return [];

  const scheduleNotification = async (triggerDate: Date, titlePre: string) => {
    if (!isAfter(triggerDate, now)) return;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: titlePre,
          body: event.title,
          sound: true,
          data: { eventId: event.id },
          ...(Platform.OS === 'android' && {
            priority: Notifications.AndroidNotificationPriority.HIGH,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      notificationIds.push(id);
    } catch (error) {
      console.warn('[Notifications] Error scheduling reminder:', error);
    }
  };

  // 1. Early Alert (from NLP)
  if (earlyAlertAt) {
    await scheduleNotification(earlyAlertAt, '⚠️ Alerta Temprana');
  }

  // 2. Standard Reminder
  const triggerDate = subMinutes(scheduledDate, minutesBefore);
  await scheduleNotification(triggerDate, '⏰ Recordatorio');

  // 3. Nag Mode (4 hourly reminders AFTER scheduled time)
  for (let i = 1; i <= 4; i++) {
    const nagDate = new Date(scheduledDate.getTime() + i * 60 * 60 * 1000);
    await scheduleNotification(nagDate, `❗️ Insistimos: ¿Ya lo hiciste?`);
  }

  return notificationIds;
}


/**
 * Cancel previously scheduled notifications by their identifiers.
 */
export async function cancelReminder(notificationIds: string[]): Promise<void> {
  try {
    for (const id of notificationIds) {
      if (id) await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (error) {
    console.warn('[Notifications] Error canceling reminder:', error);
  }
}

/**
 * Cancel all scheduled notifications for the app.
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('[Notifications] Error canceling all reminders:', error);
  }
}

/**
 * Get all currently scheduled notifications (for debugging).
 */
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

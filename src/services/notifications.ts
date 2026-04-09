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
 * Schedule a local notification reminder for an event.
 * Fires `minutesBefore` minutes before the event's scheduledAt time.
 * Returns the notification identifier, or null if it couldn't be scheduled.
 */
export async function scheduleEventReminder(
  event: Event,
  minutesBefore: number = 15
): Promise<string | null> {
  if (!event.scheduledAt) return null;

  const scheduledDate = new Date(event.scheduledAt);
  if (!isValid(scheduledDate)) return null;

  const triggerDate = subMinutes(scheduledDate, minutesBefore);
  const now = new Date();

  // Only schedule if trigger time is in the future
  if (!isAfter(triggerDate, now)) {
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Recordatorio',
        body: event.title,
        sound: true, // Use system default sound
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

    return notificationId;
  } catch (error) {
    console.warn('[Notifications] Error scheduling reminder:', error);
    return null;
  }
}

/**
 * Cancel a previously scheduled notification by its identifier.
 */
export async function cancelReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
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

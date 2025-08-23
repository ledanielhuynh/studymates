import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Notification permissions not granted');
      }

      // Get push token
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  async getPushToken(): Promise<string | null> {
    if (!this.expoPushToken) {
      await this.initialize();
    }
    return this.expoPushToken;
  }

  async scheduleLocalNotification(
    notification: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: trigger || null,
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  async schedulePomodoroNotification(
    sessionId: string,
    phase: 'focus' | 'break',
    duration: number
  ): Promise<string> {
    const title = phase === 'focus' ? 'Focus Time!' : 'Break Time!';
    const body =
      phase === 'focus'
        ? 'Time to focus on your studies'
        : 'Take a well-deserved break';

    return this.scheduleLocalNotification(
      {
        title,
        body,
        data: { sessionId, phase },
      },
      {
        seconds: duration,
      }
    );
  }

  async scheduleJoinRequestNotification(
    sessionId: string,
    requesterName: string
  ): Promise<string> {
    return this.scheduleLocalNotification(
      {
        title: 'New Join Request',
        body: `${requesterName} wants to join your study session`,
        data: { sessionId, type: 'join_request' },
      },
      null // Immediate notification
    );
  }

  async scheduleBreakReminderNotification(
    sessionId: string,
    minutesUntilBreak: number
  ): Promise<string> {
    return this.scheduleLocalNotification(
      {
        title: 'Break Coming Soon',
        body: `Your study break starts in ${minutesUntilBreak} minutes`,
        data: { sessionId, type: 'break_reminder' },
      },
      {
        seconds: minutesUntilBreak * 60,
      }
    );
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  // Add notification listener
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove notification listeners
  removeNotificationSubscription(
    subscription: Notifications.Subscription
  ): void {
    subscription.remove();
  }

  // Send immediate local notification
  async sendImmediateNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();

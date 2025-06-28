import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export class NotificationService {
  static async sendPushNotification(
    pushTokens: string[],
    notification: NotificationData
  ) {
    const messages: ExpoPushMessage[] = [];

    for (const pushToken of pushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        ...notification,
        sound: notification.sound || 'default',
        badge: notification.badge || 1,
        channelId: notification.channelId || 'default'
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    return tickets;
  }

  static async sendToUser(userId: string, notification: NotificationData) {
    // This would typically fetch the user's push token from the database
    // For now, we'll return a placeholder
    console.log(`Sending notification to user ${userId}:`, notification);
  }

  static async sendToRole(role: string, notification: NotificationData) {
    // This would typically fetch all users with the specified role
    // For now, we'll return a placeholder
    console.log(`Sending notification to role ${role}:`, notification);
  }

  static async sendToMultipleUsers(userIds: string[], notification: NotificationData) {
    // This would typically fetch push tokens for multiple users
    // For now, we'll return a placeholder
    console.log(`Sending notification to users ${userIds}:`, notification);
  }
}

export default NotificationService; 
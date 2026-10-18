import type { Notification } from "@/types";
import {
  loadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification,
} from "@/lib/dashboard-storage";

export interface INotificationsService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  createNotification(notification: Notification): Promise<void>;
}

export class MockNotificationsService implements INotificationsService {
  async getNotifications(): Promise<Notification[]> {
    return loadNotifications();
  }

  async markAsRead(id: string): Promise<void> {
    markNotificationAsRead(id);
  }

  async markAllAsRead(): Promise<void> {
    markAllNotificationsAsRead();
  }

  async createNotification(notification: Notification): Promise<void> {
    addNotification(notification);
  }
}

export const notificationsService = new MockNotificationsService();

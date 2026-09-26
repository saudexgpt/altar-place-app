import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationsApi } from '@/services/notifications';
import type { AppNotification } from '@/types/community';
import { DEMO_MODE } from '@/demo/demoData';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<AppNotification[]>([]);
  const unreadCount = ref(0);

  async function refresh() {
    if (DEMO_MODE) return;

    const response = await notificationsApi.list();
    notifications.value = response.data;
    unreadCount.value = response.unread_count;
  }

  async function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id);
    if (!notification || notification.read_at) return;

    notification.read_at = new Date().toISOString();
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    await notificationsApi.markAsRead(id);
  }

  async function markAllAsRead() {
    notifications.value.forEach((n) => {
      n.read_at = n.read_at ?? new Date().toISOString();
    });
    unreadCount.value = 0;

    await notificationsApi.markAllAsRead();
  }

  return {
    notifications,
    unreadCount,
    refresh,
    markAsRead,
    markAllAsRead,
  };
});

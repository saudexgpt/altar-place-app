import { api } from './api';
import type { NotificationsResponse } from '@/types/community';

export const notificationsApi = {
  async list(): Promise<NotificationsResponse> {
    const { data } = await api.get('/notifications');
    return data;
  },
  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};

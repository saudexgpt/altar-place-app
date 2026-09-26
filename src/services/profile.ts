import { api } from './api';
import type { Artist, Playlist } from '@/types/catalog';
import type { AuthUser } from '@/stores/auth';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const profileApi = {
  async update(payload: {
    name?: string;
    username?: string | null;
    bio?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    date_of_birth?: string | null;
  }): Promise<AuthUser> {
    return unwrap((await api.put('/profile', payload)).data);
  },
  async uploadAvatar(file: File | Blob): Promise<AuthUser> {
    const form = new FormData();
    form.append('avatar', file);
    return unwrap((await api.post('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data);
  },
  async updateNotificationPreferences(payload: Record<string, boolean>): Promise<AuthUser> {
    return unwrap((await api.put('/profile/notification-preferences', payload)).data);
  },
  async following(): Promise<{ artists: Artist[]; playlists: Playlist[] }> {
    const { data } = await api.get('/profile/following');
    return data;
  },
};

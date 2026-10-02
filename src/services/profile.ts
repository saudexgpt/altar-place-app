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
    // No explicit Content-Type: the client must compute its own (with the
    // multipart boundary) for a FormData body. Setting one overrides that
    // with a boundary-less header, which makes PHP unable to parse any
    // field or file out of the request at all.
    return unwrap((await api.post('/profile/avatar', form)).data);
  },
  async updateNotificationPreferences(payload: Record<string, boolean>): Promise<AuthUser> {
    return unwrap((await api.put('/profile/notification-preferences', payload)).data);
  },
  async following(): Promise<{ artists: Artist[]; playlists: Playlist[] }> {
    const { data } = await api.get('/profile/following');
    return data;
  },
};

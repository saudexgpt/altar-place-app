import { api } from './api';
import type { Playlist, Track } from '@/types/catalog';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const libraryApi = {
  async favorites(): Promise<Track[]> {
    return unwrap((await api.get('/library/favorites')).data);
  },
  async favoriteTrack(trackId: number): Promise<void> {
    await api.post(`/tracks/${trackId}/favorite`);
  },
  async unfavoriteTrack(trackId: number): Promise<void> {
    await api.delete(`/tracks/${trackId}/favorite`);
  },
  async recentlyPlayed(): Promise<Track[]> {
    return unwrap((await api.get('/library/recently-played')).data);
  },
  async shareTrack(trackId: number, platform?: string): Promise<void> {
    await api.post(`/tracks/${trackId}/share`, { platform });
  },
  async markTrackComplete(trackId: number): Promise<void> {
    await api.post(`/tracks/${trackId}/complete`);
  },
  async playlists(): Promise<Playlist[]> {
    return unwrap((await api.get('/library/playlists')).data);
  },
};

export const playlistApi = {
  async list(): Promise<Playlist[]> {
    return unwrap((await api.get('/playlists')).data);
  },
  async show(id: number): Promise<Playlist> {
    return unwrap((await api.get(`/playlists/${id}`)).data);
  },
  async create(payload: { title: string; description?: string; is_public?: boolean }): Promise<Playlist> {
    return unwrap((await api.post('/playlists', payload)).data);
  },
  async update(id: number, payload: { title?: string; description?: string; is_public?: boolean }): Promise<Playlist> {
    return unwrap((await api.put(`/playlists/${id}`, payload)).data);
  },
  async destroy(id: number): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },
  async addTrack(playlistId: number, trackId: number): Promise<Playlist> {
    return unwrap((await api.post(`/playlists/${playlistId}/tracks/${trackId}`)).data);
  },
  async removeTrack(playlistId: number, trackId: number): Promise<Playlist> {
    return unwrap((await api.delete(`/playlists/${playlistId}/tracks/${trackId}`)).data);
  },
  async follow(id: number): Promise<void> {
    await api.post(`/playlists/${id}/follow`);
  },
  async unfollow(id: number): Promise<void> {
    await api.delete(`/playlists/${id}/follow`);
  },
  async share(id: number, platform?: string): Promise<void> {
    await api.post(`/playlists/${id}/share`, { platform });
  },
};

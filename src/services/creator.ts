import { api } from './api';
import type { Album, Artist, Genre, Tag, Track } from '@/types/catalog';
import type { AuthUser } from '@/stores/auth';
import type { CreatorAnalytics, CreatorDashboard } from '@/types/creator';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export interface UploadTrackPayload {
  title: string;
  description?: string;
  type: 'music' | 'podcast' | 'sermon';
  genre_id?: number | null;
  album_id?: number | null;
  language?: string;
  release_date?: string;
  is_explicit?: boolean;
  tags?: string[];
  audio: File;
  cover?: File | null;
}

function buildTrackFormData(payload: Partial<UploadTrackPayload>): FormData {
  const form = new FormData();

  if (payload.title !== undefined) form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  if (payload.type) form.append('type', payload.type);
  if (payload.genre_id) form.append('genre_id', String(payload.genre_id));
  if (payload.album_id) form.append('album_id', String(payload.album_id));
  if (payload.language) form.append('language', payload.language);
  if (payload.release_date) form.append('release_date', payload.release_date);
  if (payload.is_explicit !== undefined) form.append('is_explicit', payload.is_explicit ? '1' : '0');
  (payload.tags ?? []).forEach((tag) => form.append('tags[]', tag));
  if (payload.audio) form.append('audio', payload.audio);
  if (payload.cover) form.append('cover', payload.cover);

  return form;
}

export const creatorApi = {
  async apply(payload: { artist_name: string; bio?: string }): Promise<{ artist: Artist; user: AuthUser }> {
    const { data } = await api.post('/creator/apply', payload);
    return data;
  },

  async dashboard(): Promise<CreatorDashboard> {
    const { data } = await api.get('/creator/dashboard');
    return data;
  },

  async analytics(): Promise<CreatorAnalytics> {
    const { data } = await api.get('/creator/analytics');
    return data;
  },

  async tracks(): Promise<Track[]> {
    return unwrap((await api.get('/creator/tracks')).data);
  },

  async uploadTrack(payload: UploadTrackPayload): Promise<Track> {
    return unwrap((await api.post('/creator/tracks', buildTrackFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data);
  },

  async updateTrack(id: number, payload: Partial<UploadTrackPayload>): Promise<Track> {
    const form = buildTrackFormData(payload);
    form.append('_method', 'PUT');

    return unwrap((await api.post(`/creator/tracks/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data);
  },

  async deleteTrack(id: number): Promise<void> {
    await api.delete(`/creator/tracks/${id}`);
  },

  async albums(): Promise<Album[]> {
    return unwrap((await api.get('/creator/albums')).data);
  },

  async createAlbum(payload: { title: string; description?: string; type?: string; genre_id?: number; release_year?: number }): Promise<Album> {
    return unwrap((await api.post('/creator/albums', payload)).data);
  },

  async updateAlbum(id: number, payload: Record<string, unknown>): Promise<Album> {
    return unwrap((await api.put(`/creator/albums/${id}`, payload)).data);
  },

  async deleteAlbum(id: number): Promise<void> {
    await api.delete(`/creator/albums/${id}`);
  },

  async genres(): Promise<Genre[]> {
    return unwrap((await api.get('/genres')).data);
  },

  async tags(): Promise<Tag[]> {
    return unwrap((await api.get('/tags')).data);
  },
};

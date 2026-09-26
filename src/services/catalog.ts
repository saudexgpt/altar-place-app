import { api } from './api';
import type { Album, Artist, Genre, HomeCategory, Playlist, SearchResults, Track } from '@/types/catalog';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const catalogApi = {
  async genres(): Promise<Genre[]> {
    return unwrap((await api.get('/genres')).data);
  },

  async artist(id: number): Promise<Artist> {
    return unwrap((await api.get(`/artists/${id}`)).data);
  },

  async artistTracks(id: number): Promise<Track[]> {
    return unwrap((await api.get(`/artists/${id}/tracks`)).data);
  },

  async similarArtists(id: number): Promise<Artist[]> {
    return unwrap((await api.get(`/artists/${id}/similar`)).data);
  },

  async album(id: number): Promise<Album> {
    return unwrap((await api.get(`/albums/${id}`)).data);
  },

  async track(id: number): Promise<Track> {
    return unwrap((await api.get(`/tracks/${id}`)).data);
  },

  async followArtist(id: number): Promise<void> {
    await api.post(`/artists/${id}/follow`);
  },

  async unfollowArtist(id: number): Promise<void> {
    await api.delete(`/artists/${id}/follow`);
  },
};

export const discoveryApi = {
  async trending(category?: HomeCategory): Promise<Track[]> {
    return unwrap((await api.get('/discovery/trending', { params: { category } })).data);
  },
  async newReleases(category?: HomeCategory): Promise<Track[]> {
    return unwrap((await api.get('/discovery/new-releases', { params: { category } })).data);
  },
  async recommended(category?: HomeCategory): Promise<Track[]> {
    return unwrap((await api.get('/discovery/recommended', { params: { category } })).data);
  },
  async dailyMix(): Promise<Track[]> {
    return unwrap((await api.get('/discovery/daily-mix')).data);
  },
  async discoverWeekly(): Promise<Track[]> {
    return unwrap((await api.get('/discovery/discover-weekly')).data);
  },
  async recommendedPodcasts(): Promise<Track[]> {
    return unwrap((await api.get('/discovery/recommended-podcasts')).data);
  },
  async featuredArtists(): Promise<Artist[]> {
    return unwrap((await api.get('/discovery/featured-artists')).data);
  },
  async featuredPodcasts(): Promise<Track[]> {
    return unwrap((await api.get('/discovery/featured-podcasts')).data);
  },
  async featuredSermons(): Promise<Track[]> {
    return unwrap((await api.get('/discovery/featured-sermons')).data);
  },
  async popularPlaylists(): Promise<Playlist[]> {
    return unwrap((await api.get('/discovery/popular-playlists')).data);
  },
};

export const searchApi = {
  async search(query: string, type: string = 'all'): Promise<SearchResults> {
    const { data } = await api.get('/search', { params: { q: query, type } });
    return data;
  },
};

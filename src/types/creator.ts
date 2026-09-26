import type { Artist } from './catalog';

export interface CreatorDashboard {
  artist: Artist;
  total_tracks: number;
  total_albums: number;
  total_followers: number;
  total_streams: number;
}

export interface CreatorTrackAnalytics {
  id: number;
  title: string;
  streams: number;
  downloads: number;
}

export interface CreatorAnalytics {
  streams: number;
  unique_listeners: number;
  estimated_listening_minutes: number;
  followers: number;
  downloads: number;
  revenue: number | null;
  revenue_note: string;
  tracks: CreatorTrackAnalytics[];
}

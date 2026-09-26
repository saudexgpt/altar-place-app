export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Artist {
  id: number;
  name: string;
  slug: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  followers_count?: number;
  is_following?: boolean;
}

export interface Album {
  id: number;
  title: string;
  slug: string;
  type: 'album' | 'podcast_show';
  cover_url: string | null;
  description: string | null;
  release_year: number | null;
  artist?: Artist;
  genre?: Genre;
  tracks?: Track[];
}

export type TrackType = 'music' | 'podcast' | 'sermon';
export type TranscodingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Track {
  id: number;
  title: string;
  slug: string;
  type: TrackType;
  language?: string;
  duration_seconds: number;
  cover_url: string | null;
  description: string | null;
  is_explicit: boolean;
  plays_count: number;
  release_date: string | null;
  transcoding_status?: TranscodingStatus;
  stream_url: string;
  artist?: Artist;
  album?: Album;
  genre?: Genre;
  tags?: Tag[];
  is_favorited?: boolean;
  comments_count?: number;
  shares_count?: number;
}

export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  is_curated: boolean;
  is_owner?: boolean;
  tracks_count?: number;
  shares_count?: number;
  owner?: { id: number; name: string };
  tracks?: Track[];
}

export interface SearchResults {
  artists?: Artist[];
  tracks?: Track[];
  podcasts?: Track[];
  sermons?: Track[];
  playlists?: Playlist[];
  genres?: Genre[];
}

export type HomeCategory = 'all' | 'music' | 'the-word' | 'podcasts';

import type { Artist, Playlist, Track } from './catalog';
import type { AuthUser } from '@/stores/auth';

export interface Comment {
  id: number;
  body: string;
  user: AuthUser;
  is_owner?: boolean;
  created_at: string;
}

export type ActivityType =
  | 'followed_artist'
  | 'followed_playlist'
  | 'favorited_track'
  | 'commented_on_track'
  | 'shared_track'
  | 'shared_playlist'
  | 'created_playlist';

export interface Activity {
  id: number;
  type: ActivityType;
  subject: Track | Artist | Playlist | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown> & { message?: string };
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  unread_count: number;
}

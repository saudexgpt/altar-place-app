export interface AdminUser {
  id: number;
  name: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  status: string;
  status_reason: string | null;
  is_verified: boolean;
  verified_at: string | null;
  roles: string[];
  last_active_at: string | null;
  created_at: string;
}

export interface AdminTrack {
  id: number;
  title: string;
  type: string;
  cover_url: string | null;
  plays_count: number;
  status: string;
  rejection_reason: string | null;
  moderated_at: string | null;
  artist?: { id: number; name: string };
  reports_count?: number;
  created_at: string;
}

export interface AdminReport {
  id: number;
  reportable_type: string;
  reportable_id: number;
  reportable_summary: string | null;
  reason: string;
  details: string | null;
  status: string;
  reporter?: { id: number; name: string };
  resolver?: { id: number; name: string };
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface AdminAnalyticsOverview {
  dau: number;
  mau: number;
  dau_mau_note: string;
  total_users: number;
  total_creators: number;
  total_advertisers: number;
  total_tracks: number;
  revenue: { total: number; last_30_days: number; note: string };
  active_subscriptions: number;
  conversion_rate: number;
  churn_rate: number;
  churn_note: string;
}

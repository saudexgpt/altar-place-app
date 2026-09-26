import type { Artist, Playlist } from './catalog';

export type AdType = 'banner' | 'interstitial' | 'audio' | 'sponsored_playlist' | 'sponsored_artist';
export type AdStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface AdTargeting {
  countries?: string[];
  states?: string[];
  cities?: string[];
  device_types?: string[];
  genre_ids?: number[];
  age_min?: number | null;
  age_max?: number | null;
}

/** The listener-facing view of a served ad — creative only, no targeting/stats. */
export interface ServedAd {
  id: number;
  type: AdType;
  headline: string;
  body: string | null;
  image_url: string | null;
  audio_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sponsorable: Playlist | Artist | null;
}

/** Full campaign detail, for the owning advertiser's own dashboard. */
export interface Advertisement {
  id: number;
  type: AdType;
  status: AdStatus;
  headline: string;
  body: string | null;
  image_url: string | null;
  audio_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sponsorable_type: string | null;
  sponsorable_id: number | null;
  targeting: AdTargeting | null;
  daily_impression_cap: number | null;
  impressions_count: number;
  clicks_count: number;
  click_through_rate: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface Advertiser {
  id: number;
  company_name: string;
  website: string | null;
  is_verified: boolean;
}

export interface AdvertiserDashboard {
  advertiser: Advertiser;
  total_campaigns: number;
  active_campaigns: number;
  total_impressions: number;
  total_clicks: number;
}

export interface CampaignPayload {
  type?: AdType;
  status?: AdStatus;
  headline?: string;
  body?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  sponsorable_type?: 'playlist' | 'artist' | null;
  sponsorable_id?: number | null;
  targeting?: AdTargeting | null;
  daily_impression_cap?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  image?: File | null;
  audio?: File | null;
}

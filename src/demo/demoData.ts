import type { AuthUser } from '@/stores/auth';
import type { Artist, Playlist, Track } from '@/types/catalog';
import type { SubscriptionStatusResponse } from '@/types/subscription';
import type { ServedAd } from '@/types/ads';

/**
 * Offline demo mode: bundles a handful of local tracks and a simulated
 * logged-in user so the app can be presented to stakeholders without a
 * running backend. Toggled by VITE_DEMO_MODE (see .env.demo / npm run *:demo).
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const demoArtist: Artist = {
  id: -1,
  name: 'David Ingles',
  slug: 'david-ingles',
  avatar_url: null,
  bio: null,
  is_verified: true,
};

export const demoTracks: Track[] = [
  {
    id: -1,
    title: 'I Am The Healed Of The Lord',
    slug: 'i-am-the-healed-of-the-lord',
    type: 'music',
    duration_seconds: 0,
    cover_url: null,
    description: null,
    is_explicit: false,
    plays_count: 0,
    release_date: null,
    stream_url: '/demo-tracks/01-i-am-the-healed-of-the-lord.mp3',
    artist: demoArtist,
    is_favorited: true,
  },
  {
    id: -2,
    title: 'The Name Of Jesus',
    slug: 'the-name-of-jesus',
    type: 'music',
    duration_seconds: 0,
    cover_url: null,
    description: null,
    is_explicit: false,
    plays_count: 0,
    release_date: null,
    stream_url: '/demo-tracks/02-the-name-of-jesus.mp3',
    artist: demoArtist,
    is_favorited: true,
  },
  {
    id: -3,
    title: 'It Is Written (New Version)',
    slug: 'it-is-written-new-version',
    type: 'music',
    duration_seconds: 0,
    cover_url: null,
    description: null,
    is_explicit: false,
    plays_count: 0,
    release_date: null,
    stream_url: '/demo-tracks/03-it-is-written.mp3',
    artist: demoArtist,
    is_favorited: true,
  },
];

export const demoUser: AuthUser = {
  id: -1,
  name: 'Guest Presenter',
  username: 'guest',
  bio: null,
  email: 'demo@example.com',
  avatar_url: null,
  country: null,
  state: null,
  city: null,
  date_of_birth: null,
  status: 'active',
  email_verified: true,
  roles: ['listener'],
  notification_preferences: {},
  created_at: new Date().toISOString(),
};

export const demoToken = 'demo-mode-token';

export const demoPlaylist: Playlist = {
  id: -1,
  title: 'Demo Playlist',
  description: 'A sample playlist for this offline demo.',
  cover_url: null,
  is_public: true,
  is_curated: false,
  is_owner: true,
  tracks_count: demoTracks.length,
  owner: { id: demoUser.id, name: demoUser.name },
  tracks: demoTracks,
};

const demoPlan = {
  id: -1,
  name: 'Premium (Demo)',
  slug: 'premium',
  price: 0,
  currency: 'USD',
  billing_interval: 'month' as const,
  max_family_members: null,
  features: {
    ad_free: true,
    max_audio_quality: 'high' as const,
    download_limit: null,
    offline_playback: true,
  },
};

export const demoSponsoredPlaylistAd: ServedAd = {
  id: -1,
  type: 'sponsored_playlist',
  headline: 'Featured Playlist',
  body: null,
  image_url: null,
  audio_url: null,
  cta_label: null,
  cta_url: null,
  sponsorable: demoPlaylist,
};

export const demoSponsoredArtistAd: ServedAd = {
  id: -2,
  type: 'sponsored_artist',
  headline: 'Featured Artist',
  body: null,
  image_url: null,
  audio_url: null,
  cta_label: null,
  cta_url: null,
  sponsorable: demoArtist,
};

export const demoSubscriptionStatus: SubscriptionStatusResponse = {
  plan: demoPlan,
  subscription: {
    id: -1,
    status: 'active',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    canceled_at: null,
    payment_provider: null,
    is_active: true,
    plan: demoPlan,
  },
  is_premium: true,
};

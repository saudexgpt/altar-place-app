<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-page">
      <div class="home-content">
        <header class="home-header">
          <button type="button" class="icon-btn" aria-label="Menu" @click="menuController.open('main-menu')">
            <ion-icon :icon="menuOutline" />
          </button>

          <div class="home-greeting">
            <p class="home-greeting-line">{{ greeting }} 👋</p>
            <p class="home-greeting-name">{{ auth.user?.name?.split(' ')[0] }}</p>
          </div>

          <button type="button" class="icon-btn" aria-label="Notifications" @click="router.push('/notifications')">
            <ion-icon :icon="notificationsOutline" />
            <span v-if="notifications.unreadCount > 0" class="icon-btn-badge">{{ notifications.unreadCount }}</span>
          </button>
        </header>

        <div class="home-search app-glass-card" @click="router.push('/tabs/tab2')">
          <ion-icon :icon="searchOutline" />
          <span>Search songs, artists, podcasts…</span>
          <ion-icon :icon="micOutline" />
        </div>

        <div class="home-pills">
          <ion-chip
            v-for="category in categories"
            :key="category.value"
            class="app-pill"
            :class="{ 'app-pill--active': category.value === activeCategory }"
            @click="activeCategory = category.value"
          >
            {{ category.label }}
          </ion-chip>
        </div>

        <div v-if="isLoading" class="home-loading">
          <div class="skeleton-banner app-skeleton" />
          <SkeletonRow />
          <SkeletonRow :count="3" />
        </div>

        <template v-else>
          <div v-if="newReleases[0]" class="home-banner" @click="openTrack(newReleases[0])">
            <p class="home-banner-eyebrow">NEW RELEASE</p>
            <h2 class="app-heading home-banner-title">{{ newReleases[0].title }}</h2>
            <p class="home-banner-artist">By {{ newReleases[0].artist?.name }}</p>
            <ion-button size="small" shape="round" class="home-banner-cta" @click.stop="playTrack(newReleases[0], newReleases)">
              Listen Now
            </ion-button>
          </div>

          <section v-if="trending.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Popular for You</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="track in trending"
                :key="track.id"
                :title="track.title"
                :subtitle="track.artist?.name ?? ''"
                :cover-url="track.cover_url"
                @open="DEMO_MODE ? playTrack(track, trending) : openTrack(track)"
                @play="playTrack(track, trending)"
              />
            </div>
          </section>

          <section v-if="dailyMix.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Daily Mix</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="track in dailyMix"
                :key="track.id"
                :title="track.title"
                :subtitle="track.artist?.name ?? ''"
                :cover-url="track.cover_url"
                @open="playTrack(track, dailyMix)"
                @play="playTrack(track, dailyMix)"
              />
            </div>
          </section>

          <section v-if="discoverWeekly.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Discover Weekly</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="track in discoverWeekly"
                :key="track.id"
                :title="track.title"
                :subtitle="track.artist?.name ?? ''"
                :cover-url="track.cover_url"
                @open="playTrack(track, discoverWeekly)"
                @play="playTrack(track, discoverWeekly)"
              />
            </div>
          </section>

          <section v-if="playlists.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Playlists for You</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="playlist in playlists"
                :key="playlist.id"
                :title="playlist.title"
                :subtitle="`${playlist.tracks_count ?? 0} Songs`"
                :cover-url="playlist.cover_url"
                @open="router.push(`/playlists/${playlist.id}`)"
                @play="router.push(`/playlists/${playlist.id}`)"
              />
            </div>
          </section>

          <BannerAd v-if="bannerAd" :ad="bannerAd" />

          <section v-if="sponsoredPlaylist" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Sponsored Playlist</h3>
            </div>
            <div class="home-row">
              <ContentCard
                :title="sponsoredPlaylist.title"
                :subtitle="`${sponsoredPlaylist.tracks_count ?? 0} Songs`"
                :cover-url="sponsoredPlaylist.cover_url"
                @open="openSponsoredPlaylist"
                @play="openSponsoredPlaylist"
              />
            </div>
          </section>

          <section v-if="recommendedPodcasts.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Recommended Podcasts</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="track in recommendedPodcasts"
                :key="track.id"
                :title="track.title"
                :subtitle="track.artist?.name ?? ''"
                :cover-url="track.cover_url"
                @open="playTrack(track, recommendedPodcasts)"
                @play="playTrack(track, recommendedPodcasts)"
              />
            </div>
          </section>

          <section v-if="featuredArtists.length" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Featured Artists</h3>
            </div>
            <div class="home-row">
              <ContentCard
                v-for="artist in featuredArtists"
                :key="artist.id"
                :title="artist.name"
                :subtitle="artist.is_verified ? 'Verified Artist' : 'Artist'"
                :cover-url="artist.avatar_url"
                @open="router.push(`/artists/${artist.id}`)"
                @play="router.push(`/artists/${artist.id}`)"
              />
            </div>
          </section>

          <section v-if="sponsoredArtist" class="home-section">
            <div class="home-section-heading">
              <h3 class="app-heading">Sponsored Artist</h3>
            </div>
            <div class="home-row">
              <ContentCard
                :title="sponsoredArtist.name"
                :subtitle="sponsoredArtist.is_verified ? 'Verified Artist' : 'Artist'"
                :cover-url="sponsoredArtist.avatar_url"
                @open="openSponsoredArtist"
                @play="openSponsoredArtist"
              />
            </div>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonChip, IonContent, IonIcon, IonPage, menuController } from '@ionic/vue';
import { menuOutline, micOutline, notificationsOutline, searchOutline } from 'ionicons/icons';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { useNotificationsStore } from '@/stores/notifications';
import { discoveryApi } from '@/services/catalog';
import { subscriptionApi } from '@/services/subscription';
import { adsApi } from '@/services/ads';
import { usePlatform } from '@/composables/usePlatform';
import type { Artist, HomeCategory, Playlist, Track } from '@/types/catalog';
import type { ServedAd } from '@/types/ads';
import ContentCard from '@/components/content/ContentCard.vue';
import SkeletonRow from '@/components/content/SkeletonRow.vue';
import BannerAd from '@/components/ads/BannerAd.vue';
import { DEMO_MODE, demoSponsoredArtistAd, demoSponsoredPlaylistAd, demoTracks } from '@/demo/demoData';

const auth = useAuthStore();
const player = usePlayerStore();
const notifications = useNotificationsStore();
const router = useRouter();
const { platform } = usePlatform();
const isPremium = ref(true);
const bannerAd = ref<ServedAd | null>(null);
const sponsoredPlaylistAd = ref<ServedAd | null>(null);
const sponsoredArtistAd = ref<ServedAd | null>(null);

const sponsoredPlaylist = computed(() => sponsoredPlaylistAd.value?.sponsorable as Playlist | undefined);
const sponsoredArtist = computed(() => sponsoredArtistAd.value?.sponsorable as Artist | undefined);

const categories: { label: string; value: HomeCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Music', value: 'music' },
  { label: 'The Word', value: 'the-word' },
  { label: 'Podcasts', value: 'podcasts' },
];
const activeCategory = ref<HomeCategory>('all');
const isLoading = ref(true);

const trending = ref<Track[]>([]);
const newReleases = ref<Track[]>([]);
const playlists = ref<Playlist[]>([]);
const featuredArtists = ref<Artist[]>([]);
const dailyMix = ref<Track[]>([]);
const discoverWeekly = ref<Track[]>([]);
const recommendedPodcasts = ref<Track[]>([]);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
});

async function loadDashboard() {
  isLoading.value = true;

  if (DEMO_MODE) {
    trending.value = demoTracks;
    isLoading.value = false;
    return;
  }

  try {
    const category = activeCategory.value === 'all' ? undefined : activeCategory.value;
    const [recommendedRes, releasesRes, playlistsRes, artistsRes] = await Promise.all([
      discoveryApi.recommended(category),
      discoveryApi.newReleases(category),
      discoveryApi.popularPlaylists(),
      discoveryApi.featuredArtists(),
    ]);

    trending.value = recommendedRes;
    newReleases.value = releasesRes;
    playlists.value = playlistsRes;
    featuredArtists.value = artistsRes;
  } finally {
    isLoading.value = false;
  }
}

async function loadRecommendations() {
  if (DEMO_MODE) return;

  const [dailyMixRes, discoverWeeklyRes, podcastsRes] = await Promise.all([
    discoveryApi.dailyMix(),
    discoveryApi.discoverWeekly(),
    discoveryApi.recommendedPodcasts(),
  ]);

  dailyMix.value = dailyMixRes;
  discoverWeekly.value = discoverWeeklyRes;
  recommendedPodcasts.value = podcastsRes;
}

function playTrack(track: Track, queue: Track[]) {
  player.playQueue(queue, queue.findIndex((t) => t.id === track.id));
  router.push('/now-playing');
}

function openTrack(track: Track) {
  router.push(`/artists/${track.artist?.id}`);
}

function openSponsoredPlaylist() {
  if (!sponsoredPlaylistAd.value) return;
  if (!DEMO_MODE) void adsApi.logClick(sponsoredPlaylistAd.value.id);
  router.push(`/playlists/${sponsoredPlaylist.value?.id}`);
}

function openSponsoredArtist() {
  if (!sponsoredArtistAd.value) return;
  if (!DEMO_MODE) void adsApi.logClick(sponsoredArtistAd.value.id);
  router.push(`/artists/${sponsoredArtist.value?.id}`);
}

async function loadSponsoredContent() {
  if (DEMO_MODE) {
    sponsoredPlaylistAd.value = demoSponsoredPlaylistAd;
    sponsoredArtistAd.value = demoSponsoredArtistAd;
    return;
  }

  const [playlistAd, artistAd] = await Promise.all([
    adsApi.serve('sponsored_playlist', platform.value),
    adsApi.serve('sponsored_artist', platform.value),
  ]);
  sponsoredPlaylistAd.value = playlistAd;
  sponsoredArtistAd.value = artistAd;

  if (playlistAd) void adsApi.logImpression(playlistAd.id);
  if (artistAd) void adsApi.logImpression(artistAd.id);
}

watch(activeCategory, loadDashboard);
onMounted(async () => {
  void loadDashboard();
  void loadSponsoredContent();
  void loadRecommendations();
  void notifications.refresh();

  if (DEMO_MODE) return;

  const status = await subscriptionApi.status();
  isPremium.value = status.is_premium;

  if (!isPremium.value) {
    bannerAd.value = await adsApi.serve('banner', platform.value);
  }
});
</script>

<style scoped>
.home-page {
  --background: var(--ion-background-color);
}

.home-content {
  padding: 16px 16px calc(var(--app-mini-player-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--ion-text-color);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-btn-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--app-radius-full);
  background: var(--ion-color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-greeting {
  text-align: center;
}

.home-greeting-line {
  margin: 0;
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.home-greeting-name {
  margin: 0;
  font-family: var(--app-font-heading);
  font-weight: 600;
  color: var(--ion-color-primary);
}

.home-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--app-radius-full);
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 14px;
  cursor: pointer;
}

.home-search span {
  flex: 1;
}

.home-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.home-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-banner {
  border-radius: var(--app-radius-lg);
  min-height: 160px;
}

.home-banner {
  border-radius: var(--app-radius-lg);
  background: var(--app-gradient-banner);
  padding: 20px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  cursor: pointer;
}

.home-banner-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

.home-banner-title {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.home-banner-artist {
  margin: 0 0 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.home-banner-cta {
  --border-radius: var(--app-radius-full);
  width: fit-content;
  --padding-start: 18px;
  --padding-end: 18px;
  text-transform: none;
  font-weight: 600;
}

.home-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-section-heading h3 {
  margin: 0;
  font-size: 17px;
}

.home-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Search</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="search-content">
        <ion-searchbar
          v-model="query"
          placeholder="Search songs, artists, podcasts…"
          :debounce="350"
          @ion-input="handleInput"
        />

        <div v-if="isLoading" class="search-loading">
          <SkeletonRow />
          <SkeletonRow :count="3" />
        </div>

        <div v-else-if="!query && !DEMO_MODE" class="search-empty">
          <p>Search for artists, tracks, podcasts, sermons, playlists, or categories.</p>
        </div>

        <div v-else-if="isEmpty" class="search-empty">
          <p>No results for "{{ query }}".</p>
        </div>

        <template v-else>
          <section v-if="results.artists?.length" class="search-section">
            <h3 class="app-heading">Artists</h3>
            <div class="search-row">
              <ContentCard
                v-for="artist in results.artists"
                :key="artist.id"
                :title="artist.name"
                subtitle="Artist"
                :cover-url="artist.avatar_url"
                @open="router.push(`/artists/${artist.id}`)"
                @play="router.push(`/artists/${artist.id}`)"
              />
            </div>
          </section>

          <section v-if="results.tracks?.length" class="search-section">
            <h3 class="app-heading">Music</h3>
            <TrackListItem
              v-for="track in results.tracks"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              @play="playTrack(track, results.tracks!)"
              @toggle-favorite="toggleFavorite(track)"
            />
          </section>

          <section v-if="results.podcasts?.length" class="search-section">
            <h3 class="app-heading">Podcasts</h3>
            <TrackListItem
              v-for="track in results.podcasts"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              @play="playTrack(track, results.podcasts!)"
              @toggle-favorite="toggleFavorite(track)"
            />
          </section>

          <section v-if="results.sermons?.length" class="search-section">
            <h3 class="app-heading">The Word (Sermons)</h3>
            <TrackListItem
              v-for="track in results.sermons"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              @play="playTrack(track, results.sermons!)"
              @toggle-favorite="toggleFavorite(track)"
            />
          </section>

          <section v-if="results.playlists?.length" class="search-section">
            <h3 class="app-heading">Playlists</h3>
            <div class="search-row">
              <ContentCard
                v-for="playlist in results.playlists"
                :key="playlist.id"
                :title="playlist.title"
                :subtitle="`${playlist.tracks_count ?? 0} Songs`"
                :cover-url="playlist.cover_url"
                @open="router.push(`/playlists/${playlist.id}`)"
                @play="router.push(`/playlists/${playlist.id}`)"
              />
            </div>
          </section>

          <section v-if="results.genres?.length" class="search-section">
            <h3 class="app-heading">Categories</h3>
            <div class="search-genres">
              <ion-chip v-for="genre in results.genres" :key="genre.id" class="app-pill">{{ genre.name }}</ion-chip>
            </div>
          </section>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonChip, IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { searchApi } from '@/services/catalog';
import { libraryApi } from '@/services/library';
import { usePlayerStore } from '@/stores/player';
import type { SearchResults, Track } from '@/types/catalog';
import ContentCard from '@/components/content/ContentCard.vue';
import TrackListItem from '@/components/content/TrackListItem.vue';
import SkeletonRow from '@/components/content/SkeletonRow.vue';
import { DEMO_MODE, demoTracks } from '@/demo/demoData';

const query = ref('');
const isLoading = ref(false);
const results = ref<SearchResults>(DEMO_MODE ? { tracks: demoTracks } : {});
const player = usePlayerStore();
const router = useRouter();

const isEmpty = computed(() =>
  Object.values(results.value).every((group) => !group || group.length === 0)
);

async function handleInput() {
  const term = query.value.trim();

  if (DEMO_MODE) {
    if (!term) {
      results.value = { tracks: demoTracks };
      return;
    }

    const lower = term.toLowerCase();
    results.value = {
      tracks: demoTracks.filter(
        (track) => track.title.toLowerCase().includes(lower) || track.artist?.name.toLowerCase().includes(lower)
      ),
    };
    return;
  }

  if (!term) {
    results.value = {};
    return;
  }

  isLoading.value = true;

  try {
    results.value = await searchApi.search(term);
  } finally {
    isLoading.value = false;
  }
}

function playTrack(track: Track, queue: Track[]) {
  player.playQueue(queue, queue.findIndex((t) => t.id === track.id));
  router.push('/now-playing');
}

async function toggleFavorite(track: Track) {
  const wasFavorited = track.is_favorited ?? false;
  track.is_favorited = !wasFavorited;

  if (DEMO_MODE) return;

  try {
    if (wasFavorited) {
      await libraryApi.unfavoriteTrack(track.id);
    } else {
      await libraryApi.favoriteTrack(track.id);
    }
  } catch {
    track.is_favorited = wasFavorited;
  }
}
</script>

<style scoped>
.search-content {
  padding: 8px 16px calc(var(--app-mini-player-height) + 24px);
}

.search-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: var(--ion-color-step-850, #9a9a9a);
  text-align: center;
}

.search-section {
  margin-top: 20px;
}

.search-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.search-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.search-genres {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>

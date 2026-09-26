<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1" />
        </ion-buttons>
        <ion-title>{{ album?.title ?? 'Album' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="album" class="album-content">
        <div class="album-header">
          <div class="album-art" :class="{ 'app-art-placeholder': !album.cover_url }">
            <img v-if="album.cover_url" :src="album.cover_url" class="album-art-image" alt="" />
            <ion-icon v-else :icon="musicalNotes" />
          </div>
          <h1 class="app-heading album-title">{{ album.title }}</h1>
          <p class="album-artist">
            <router-link :to="`/artists/${album.artist?.id}`">{{ album.artist?.name }}</router-link>
          </p>
          <p v-if="album.release_year" class="album-meta">{{ album.release_year }} · {{ album.tracks?.length ?? 0 }} tracks</p>
        </div>

        <section class="album-tracks">
          <TrackListItem
            v-for="track in album.tracks"
            :key="track.id"
            :track="track"
            :is-active="player.currentTrack?.id === track.id"
            :is-playing="player.isPlaying"
            @play="playTrack(track)"
            @toggle-favorite="toggleFavorite(track)"
          />
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { musicalNotes } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { catalogApi } from '@/services/catalog';
import { libraryApi } from '@/services/library';
import { usePlayerStore } from '@/stores/player';
import type { Album, Track } from '@/types/catalog';
import TrackListItem from '@/components/content/TrackListItem.vue';

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();

const album = ref<Album | null>(null);

async function load() {
  album.value = await catalogApi.album(Number(route.params.id));
}

function playTrack(track: Track) {
  const tracks = album.value?.tracks ?? [];
  player.playQueue(tracks, tracks.findIndex((t) => t.id === track.id));
  router.push('/now-playing');
}

async function toggleFavorite(track: Track) {
  const wasFavorited = track.is_favorited ?? false;
  track.is_favorited = !wasFavorited;

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

onMounted(load);
</script>

<style scoped>
.album-content {
  padding: 0 16px calc(var(--app-mini-player-height) + 24px);
}

.album-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 0;
  gap: 4px;
}

.album-art {
  width: 160px;
  height: 160px;
  font-size: 56px;
  margin-bottom: 12px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
}

.album-art-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-title {
  margin: 0;
  font-size: 22px;
}

.album-artist a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.album-meta {
  margin: 4px 0 0;
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
}

.album-tracks {
  margin-top: 12px;
}
</style>

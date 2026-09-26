<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab3" />
        </ion-buttons>
        <ion-title>{{ playlist?.title ?? 'Playlist' }}</ion-title>
        <ion-buttons v-if="playlist && !playlist.is_owner && !playlist.is_curated" slot="end">
          <ion-button @click="toggleFollow">{{ isFollowing ? 'Unfollow' : 'Follow' }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="playlist" class="playlist-content">
        <div class="playlist-header">
          <div class="playlist-art" :class="{ 'app-art-placeholder': !playlist.cover_url }">
            <img v-if="playlist.cover_url" :src="playlist.cover_url" class="playlist-art-image" alt="" />
            <ion-icon v-else :icon="listOutline" />
          </div>
          <h1 class="app-heading playlist-title">{{ playlist.title }}</h1>
          <p v-if="playlist.description" class="playlist-description">{{ playlist.description }}</p>
          <p class="playlist-meta">{{ playlist.tracks?.length ?? 0 }} tracks</p>
        </div>

        <section class="playlist-tracks">
          <TrackListItem
            v-for="track in playlist.tracks"
            :key="track.id"
            :track="track"
            :is-active="player.currentTrack?.id === track.id"
            :is-playing="player.isPlaying"
            @play="playTrack(track)"
            @toggle-favorite="toggleFavorite(track)"
          />

          <p v-if="!playlist.tracks?.length" class="playlist-empty">This playlist has no tracks yet.</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { listOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { libraryApi, playlistApi } from '@/services/library';
import { usePlayerStore } from '@/stores/player';
import type { Playlist, Track } from '@/types/catalog';
import TrackListItem from '@/components/content/TrackListItem.vue';

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();

const playlist = ref<Playlist | null>(null);
const isFollowing = ref(false);

const playlistId = computed(() => Number(route.params.id));

async function load() {
  playlist.value = await playlistApi.show(playlistId.value);
}

async function toggleFollow() {
  if (isFollowing.value) {
    await playlistApi.unfollow(playlistId.value);
  } else {
    await playlistApi.follow(playlistId.value);
  }
  isFollowing.value = !isFollowing.value;
}

function playTrack(track: Track) {
  const tracks = playlist.value?.tracks ?? [];
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
.playlist-content {
  padding: 0 16px calc(var(--app-mini-player-height) + 24px);
}

.playlist-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 0;
  gap: 4px;
}

.playlist-art {
  width: 160px;
  height: 160px;
  font-size: 56px;
  margin-bottom: 12px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
}

.playlist-art-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.playlist-title {
  margin: 0;
  font-size: 22px;
}

.playlist-description {
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 14px;
  max-width: 320px;
  margin: 4px 0;
}

.playlist-meta {
  margin: 0;
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
}

.playlist-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 24px 0;
}
</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Library</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="activeSegment" scrollable>
          <ion-segment-button value="favorites">
            <ion-label>Favorites</ion-label>
          </ion-segment-button>
          <ion-segment-button value="recent">
            <ion-label>Recently Played</ion-label>
          </ion-segment-button>
          <ion-segment-button value="playlists">
            <ion-label>Playlists</ion-label>
          </ion-segment-button>
          <ion-segment-button value="local">
            <ion-label>Local Files</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="library-content">
        <div v-if="isLoading" class="library-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <template v-if="activeSegment === 'favorites'">
            <TrackListItem
              v-for="track in favorites"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              show-download
              :is-downloaded="downloads.isDownloaded(track.id)"
              :is-downloading="downloads.isDownloading(track.id)"
              @play="playTrack(track, favorites)"
              @toggle-favorite="toggleFavorite(track, favorites)"
              @download="handleDownload(track)"
              @remove-download="downloads.remove(track.id)"
            />
            <p v-if="!favorites.length" class="library-empty">No favorites yet. Tap the heart on any track to save it here.</p>
          </template>

          <template v-else-if="activeSegment === 'recent'">
            <TrackListItem
              v-for="track in recentlyPlayed"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              show-download
              :is-downloaded="downloads.isDownloaded(track.id)"
              :is-downloading="downloads.isDownloading(track.id)"
              @play="playTrack(track, recentlyPlayed)"
              @toggle-favorite="toggleFavorite(track, recentlyPlayed)"
              @download="handleDownload(track)"
              @remove-download="downloads.remove(track.id)"
            />
            <p v-if="!recentlyPlayed.length" class="library-empty">Nothing played yet. Your listening history will show up here.</p>
          </template>

          <template v-else-if="activeSegment === 'playlists'">
            <form class="new-playlist" @submit.prevent="createPlaylist">
              <ion-input v-model="newPlaylistTitle" placeholder="New playlist name" />
              <ion-button type="submit" :disabled="!newPlaylistTitle.trim()">Create</ion-button>
            </form>

            <div
              v-for="playlist in playlists"
              :key="playlist.id"
              class="playlist-row"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-row-art" :class="{ 'app-art-placeholder': !playlist.cover_url }">
                <img v-if="playlist.cover_url" :src="playlist.cover_url" class="playlist-row-image" alt="" />
                <ion-icon v-else :icon="listOutline" />
              </div>
              <div class="playlist-row-info">
                <p class="playlist-row-title">{{ playlist.title }}</p>
                <p class="playlist-row-subtitle">{{ playlist.tracks_count ?? 0 }} tracks</p>
              </div>
            </div>
            <p v-if="!playlists.length" class="library-empty">You haven't created any playlists yet.</p>
          </template>

          <template v-else>
            <input
              ref="fileInputRef"
              type="file"
              accept="audio/*"
              multiple
              class="local-file-input"
              @change="handleFilesPicked"
            />
            <ion-button expand="block" fill="outline" :disabled="isImporting" @click="fileInputRef?.click()">
              <ion-icon :icon="addOutline" slot="start" />
              {{ isImporting ? 'Adding…' : 'Add Songs From Device' }}
            </ion-button>

            <TrackListItem
              v-for="track in localTracksList"
              :key="track.id"
              :track="track"
              :is-active="player.currentTrack?.id === track.id"
              :is-playing="player.isPlaying"
              show-remove
              @play="playLocalTrack(track)"
              @toggle-favorite="localTracks.toggleFavorite(track.id)"
              @remove="confirmRemoveLocalTrack(track)"
            />
            <p v-if="!localTracksList.length" class="library-empty">
              No local files yet. Tap "Add Songs From Device" to pick music from your phone's storage.
            </p>
          </template>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { addOutline, listOutline } from 'ionicons/icons';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { libraryApi, playlistApi } from '@/services/library';
import { useDownloadsStore } from '@/stores/downloads';
import { useLocalTracksStore } from '@/stores/localTracks';
import { usePlayerStore } from '@/stores/player';
import type { Playlist, Track } from '@/types/catalog';
import TrackListItem from '@/components/content/TrackListItem.vue';
import { DEMO_MODE, demoPlaylist, demoTracks } from '@/demo/demoData';

const router = useRouter();
const player = usePlayerStore();
const downloads = useDownloadsStore();
const localTracks = useLocalTracksStore();

const activeSegment = ref<'favorites' | 'recent' | 'playlists' | 'local'>('favorites');
const isLoading = ref(true);
const favorites = ref<Track[]>([]);
const recentlyPlayed = ref<Track[]>([]);
const playlists = ref<Playlist[]>([]);
const newPlaylistTitle = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

const localTracksList = computed(() => Object.values(localTracks.tracks).map((entry) => entry.track));

async function loadSegment() {
  isLoading.value = true;

  if (DEMO_MODE) {
    if (activeSegment.value === 'favorites') {
      favorites.value = demoTracks.filter((track) => track.is_favorited);
    } else if (activeSegment.value === 'recent') {
      recentlyPlayed.value = demoTracks;
    } else if (activeSegment.value === 'playlists') {
      playlists.value = [demoPlaylist, ...playlists.value.filter((p) => p.id !== demoPlaylist.id)];
    }
    isLoading.value = false;
    return;
  }

  try {
    if (activeSegment.value === 'favorites') {
      favorites.value = await libraryApi.favorites();
    } else if (activeSegment.value === 'recent') {
      recentlyPlayed.value = await libraryApi.recentlyPlayed();
    } else if (activeSegment.value === 'playlists') {
      playlists.value = await libraryApi.playlists();
    }
  } finally {
    isLoading.value = false;
  }
}

function playTrack(track: Track, queue: Track[]) {
  player.playQueue(queue, queue.findIndex((t) => t.id === track.id));
  router.push('/now-playing');
}

function openPlaylist(playlist: Playlist) {
  if (DEMO_MODE) {
    player.playQueue(playlist.tracks ?? [], 0);
    router.push('/now-playing');
    return;
  }

  router.push(`/playlists/${playlist.id}`);
}

async function toggleFavorite(track: Track, list: Track[]) {
  const wasFavorited = track.is_favorited ?? false;
  track.is_favorited = !wasFavorited;

  if (DEMO_MODE) return;

  try {
    if (wasFavorited) {
      await libraryApi.unfavoriteTrack(track.id);
      if (activeSegment.value === 'favorites') {
        const index = list.findIndex((t) => t.id === track.id);
        if (index !== -1) list.splice(index, 1);
      }
    } else {
      await libraryApi.favoriteTrack(track.id);
    }
  } catch {
    track.is_favorited = wasFavorited;
  }
}

async function handleDownload(track: Track) {
  try {
    await downloads.download(track);
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.response?.data?.message ?? 'Could not download this track.',
      duration: 3000,
      color: 'warning',
    });
    await toast.present();
  }
}

async function createPlaylist() {
  const title = newPlaylistTitle.value.trim();
  if (!title) return;

  if (DEMO_MODE) {
    playlists.value.unshift({
      id: -(playlists.value.length + 2),
      title,
      description: null,
      cover_url: null,
      is_public: false,
      is_curated: false,
      is_owner: true,
      tracks_count: 0,
      tracks: [],
    });
    newPlaylistTitle.value = '';
    return;
  }

  const playlist = await playlistApi.create({ title });
  playlists.value.unshift(playlist);
  newPlaylistTitle.value = '';
}

async function handleFilesPicked(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  if (!files.length) return;

  isImporting.value = true;
  try {
    await localTracks.importFiles(files);
  } finally {
    isImporting.value = false;
  }
}

async function playLocalTrack(track: Track) {
  const playable = await localTracks.getPlayableTrack(track.id);
  if (playable) {
    player.playQueue([playable], 0);
    router.push('/now-playing');
  }
}

async function confirmRemoveLocalTrack(track: Track) {
  const alert = await alertController.create({
    header: 'Remove from device library?',
    message: `"${track.title}" will be removed from the app. The original file on your device is untouched.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Remove', role: 'destructive', handler: () => localTracks.remove(track.id) },
    ],
  });
  await alert.present();
}

watch(activeSegment, loadSegment);
onMounted(() => {
  void loadSegment();
  void downloads.initialize();
  void localTracks.initialize();
});
</script>

<style scoped>
.library-content {
  padding: 8px 16px calc(var(--app-mini-player-height) + 24px);
}

.library-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.library-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}

.local-file-input {
  display: none;
}

.new-playlist {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.new-playlist ion-input {
  --background: var(--ion-item-background);
  border-radius: var(--app-radius-md);
  --padding-start: 12px;
}

.playlist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  cursor: pointer;
}

.playlist-row-art {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  font-size: 20px;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.playlist-row-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.playlist-row-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.playlist-row-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}
</style>

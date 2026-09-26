<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Following</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="following-content">
        <h3 class="app-heading">Artists</h3>
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="following-row"
          @click="openArtist(artist)"
        >
          <div class="following-avatar" :class="{ 'app-art-placeholder': !artist.avatar_url }">
            <img v-if="artist.avatar_url" :src="artist.avatar_url" class="following-avatar-image" alt="" />
            <ion-icon v-else :icon="person" />
          </div>
          <div class="following-info">
            <p class="following-name">{{ artist.name }}</p>
            <p class="following-meta">{{ artist.followers_count ?? 0 }} followers</p>
          </div>
        </div>
        <p v-if="!artists.length" class="following-empty">You're not following any artists yet.</p>

        <h3 class="app-heading section-heading">Playlists</h3>
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="following-row"
          @click="openPlaylist(playlist)"
        >
          <div class="following-avatar" :class="{ 'app-art-placeholder': !playlist.cover_url }">
            <img v-if="playlist.cover_url" :src="playlist.cover_url" class="following-avatar-image" alt="" />
            <ion-icon v-else :icon="listOutline" />
          </div>
          <div class="following-info">
            <p class="following-name">{{ playlist.title }}</p>
            <p class="following-meta">{{ playlist.tracks_count ?? 0 }} tracks</p>
          </div>
        </div>
        <p v-if="!playlists.length" class="following-empty">You're not following any playlists yet.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { listOutline, person } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { profileApi } from '@/services/profile';
import { usePlayerStore } from '@/stores/player';
import type { Artist, Playlist } from '@/types/catalog';
import { DEMO_MODE, demoArtist, demoPlaylist, demoTracks } from '@/demo/demoData';

const router = useRouter();
const player = usePlayerStore();
const artists = ref<Artist[]>([]);
const playlists = ref<Playlist[]>([]);

function openArtist(artist: Artist) {
  if (DEMO_MODE) {
    player.playQueue(demoTracks, 0);
    router.push('/now-playing');
    return;
  }

  router.push(`/artists/${artist.id}`);
}

function openPlaylist(playlist: Playlist) {
  if (DEMO_MODE) {
    player.playQueue(playlist.tracks ?? [], 0);
    router.push('/now-playing');
    return;
  }

  router.push(`/playlists/${playlist.id}`);
}

onMounted(async () => {
  if (DEMO_MODE) {
    artists.value = [demoArtist];
    playlists.value = [demoPlaylist];
    return;
  }

  const result = await profileApi.following();
  artists.value = result.artists;
  playlists.value = result.playlists;
});
</script>

<style scoped>
.following-content {
  padding: 16px;
}

.following-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  cursor: pointer;
}

.following-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}

.following-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.following-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.following-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.following-empty {
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
  padding: 8px 4px 16px;
}

.section-heading {
  margin-top: 24px;
}
</style>

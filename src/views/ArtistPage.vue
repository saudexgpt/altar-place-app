<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1" />
        </ion-buttons>
        <ion-title>{{ artist?.name ?? 'Artist' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="artist" class="artist-content">
        <div class="artist-header">
          <div class="artist-avatar" :class="{ 'app-art-placeholder': !artist.avatar_url }">
            <img v-if="artist.avatar_url" :src="artist.avatar_url" class="artist-avatar-image" alt="" />
            <ion-icon v-else :icon="person" />
          </div>
          <h1 class="app-heading artist-name">{{ artist.name }}</h1>
          <p v-if="artist.is_verified" class="artist-verified">
            <ion-icon :icon="checkmarkCircle" /> Verified Artist
          </p>
          <p class="artist-followers">{{ artist.followers_count ?? 0 }} followers</p>
          <p v-if="artist.bio" class="artist-bio">{{ artist.bio }}</p>

          <ion-button
            shape="round"
            :fill="artist.is_following ? 'outline' : 'solid'"
            @click="toggleFollow"
          >
            {{ artist.is_following ? 'Following' : 'Follow' }}
          </ion-button>
        </div>

        <section class="artist-tracks">
          <h3 class="app-heading">Tracks</h3>
          <TrackListItem
            v-for="track in tracks"
            :key="track.id"
            :track="track"
            :is-active="player.currentTrack?.id === track.id"
            :is-playing="player.isPlaying"
            @play="playTrack(track)"
            @toggle-favorite="toggleFavorite(track)"
          />
        </section>

        <section v-if="similarArtists.length" class="artist-similar">
          <h3 class="app-heading">Similar Artists</h3>
          <div class="artist-similar-row">
            <ContentCard
              v-for="similar in similarArtists"
              :key="similar.id"
              :title="similar.name"
              :subtitle="similar.is_verified ? 'Verified Artist' : 'Artist'"
              :cover-url="similar.avatar_url"
              @open="router.push(`/artists/${similar.id}`)"
              @play="router.push(`/artists/${similar.id}`)"
            />
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { checkmarkCircle, person } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { catalogApi } from '@/services/catalog';
import { libraryApi } from '@/services/library';
import { usePlayerStore } from '@/stores/player';
import type { Artist, Track } from '@/types/catalog';
import TrackListItem from '@/components/content/TrackListItem.vue';
import ContentCard from '@/components/content/ContentCard.vue';

const route = useRoute();
const router = useRouter();
const player = usePlayerStore();

const artist = ref<Artist | null>(null);
const tracks = ref<Track[]>([]);
const similarArtists = ref<Artist[]>([]);

async function load() {
  const id = Number(route.params.id);
  const [artistRes, tracksRes, similarRes] = await Promise.all([
    catalogApi.artist(id),
    catalogApi.artistTracks(id),
    catalogApi.similarArtists(id),
  ]);
  artist.value = artistRes;
  tracks.value = tracksRes;
  similarArtists.value = similarRes;
}

async function toggleFollow() {
  if (!artist.value) return;

  const wasFollowing = artist.value.is_following ?? false;
  artist.value.is_following = !wasFollowing;
  artist.value.followers_count = (artist.value.followers_count ?? 0) + (wasFollowing ? -1 : 1);

  try {
    if (wasFollowing) {
      await catalogApi.unfollowArtist(artist.value.id);
    } else {
      await catalogApi.followArtist(artist.value.id);
    }
  } catch {
    artist.value.is_following = wasFollowing;
  }
}

function playTrack(track: Track) {
  player.playQueue(tracks.value, tracks.value.findIndex((t) => t.id === track.id));
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
.artist-content {
  padding: 0 16px calc(var(--app-mini-player-height) + 24px);
}

.artist-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 0;
  gap: 4px;
}

.artist-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  font-size: 40px;
  margin-bottom: 12px;
  overflow: hidden;
}

.artist-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-name {
  margin: 0;
  font-size: 22px;
}

.artist-verified {
  margin: 0;
  color: var(--ion-color-primary);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.artist-followers {
  margin: 0 0 8px;
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
}

.artist-bio {
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 14px;
  max-width: 320px;
  margin: 0 0 16px;
}

.artist-tracks h3 {
  margin: 0 0 12px;
}

.artist-similar {
  margin-top: 24px;
}

.artist-similar h3 {
  margin: 0 0 12px;
}

.artist-similar-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}
</style>

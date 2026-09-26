<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Downloads</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="downloads-content">
        <p class="downloads-note">Downloaded tracks are cached on this device for offline playback.</p>

        <div v-if="quota && !quota.unlimited" class="quota-banner">
          <div class="quota-bar">
            <div class="quota-bar-fill" :style="{ width: `${quotaPercent}%` }" />
          </div>
          <p class="quota-text">
            {{ quota.used }} / {{ quota.limit }} downloads used this month
            <router-link to="/subscription/plans">Upgrade for unlimited</router-link>
          </p>
        </div>

        <TrackListItem
          v-for="entry in downloadedTracks"
          :key="entry.track.id"
          :track="entry.track"
          :is-active="player.currentTrack?.id === entry.track.id"
          :is-playing="player.isPlaying"
          show-download
          is-downloaded
          @play="playDownloaded(entry.track)"
          @toggle-favorite="() => {}"
          @remove-download="downloads.remove(entry.track.id)"
        />

        <p v-if="!downloadedTracks.length" class="library-empty">
          No downloads yet. Tap the download icon on any track in your Library to save it for offline playback.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDownloadsStore } from '@/stores/downloads';
import { usePlayerStore } from '@/stores/player';
import { subscriptionApi } from '@/services/subscription';
import type { Track } from '@/types/catalog';
import type { DownloadQuota } from '@/types/subscription';
import TrackListItem from '@/components/content/TrackListItem.vue';
import { DEMO_MODE } from '@/demo/demoData';

const downloads = useDownloadsStore();
const player = usePlayerStore();
const router = useRouter();
const quota = ref<DownloadQuota | null>(null);

const downloadedTracks = computed(() => Object.values(downloads.downloads));
const quotaPercent = computed(() => {
  if (!quota.value || quota.value.limit === null) return 0;
  return Math.min(100, (quota.value.used / quota.value.limit) * 100);
});

async function playDownloaded(track: Track) {
  const playable = await downloads.getPlayableTrack(track.id);
  if (playable) {
    player.playQueue([playable], 0);
    router.push('/now-playing');
  }
}

onMounted(async () => {
  await downloads.initialize();
  if (DEMO_MODE) return;
  quota.value = await subscriptionApi.downloadQuota();
});
</script>

<style scoped>
.downloads-content {
  padding: 8px 16px calc(var(--app-mini-player-height) + 24px);
}

.downloads-note {
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 13px;
  margin: 0 0 16px;
}

.quota-banner {
  margin-bottom: 16px;
}

.quota-bar {
  height: 6px;
  background: var(--ion-item-background);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.quota-bar-fill {
  height: 100%;
  background: var(--ion-color-primary);
  border-radius: 3px;
  transition: width 300ms ease-out;
}

.quota-text {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.quota-text a {
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.library-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

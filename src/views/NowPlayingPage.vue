<template>
  <ion-page>
    <ion-content class="now-playing" :fullscreen="true">
      <div class="now-playing-content" v-if="player.currentTrack">
        <div class="now-playing-header">
          <button type="button" class="icon-btn" @click="router.back()">
            <ion-icon :icon="chevronDown" />
          </button>
          <p class="now-playing-kicker">Now Playing</p>
          <div class="icon-btn-spacer" />
        </div>

        <div
          class="now-playing-art"
          :class="{ 'app-art-placeholder': !player.currentTrack.cover_url }"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 350 } }"
        >
          <img v-if="player.currentTrack.cover_url" :src="player.currentTrack.cover_url" class="now-playing-image" alt="" />
          <ion-icon v-else :icon="musicalNotes" />
        </div>

        <div class="now-playing-meta">
          <h1 class="app-heading now-playing-title">{{ player.currentTrack.title }}</h1>
          <p class="now-playing-artist">{{ player.currentTrack.artist?.name }}</p>
        </div>

        <div class="now-playing-seek">
          <ion-range
            :value="player.currentTime"
            :max="player.duration || 1"
            :min="0"
            @ion-change="onSeek"
          />
          <div class="now-playing-times app-mono">
            <span>{{ formatTime(player.currentTime) }}</span>
            <span>{{ formatTime(player.duration) }}</span>
          </div>
        </div>

        <div class="now-playing-controls">
          <button type="button" class="control-btn" :class="{ 'control-btn--active': player.isShuffled }" @click="player.toggleShuffle">
            <ion-icon :icon="shuffle" />
          </button>

          <button type="button" class="control-btn" :disabled="!player.hasPrevious" @click="player.previous">
            <ion-icon :icon="playSkipBack" />
          </button>

          <button type="button" class="play-btn" @click="player.togglePlayback">
            <ion-icon :icon="player.isPlaying ? pause : play" />
          </button>

          <button type="button" class="control-btn" :disabled="!player.hasNext" @click="player.next">
            <ion-icon :icon="playSkipForward" />
          </button>

          <button type="button" class="control-btn" :class="{ 'control-btn--active': player.repeatMode !== 'off' }" @click="player.cycleRepeatMode">
            <ion-icon :icon="player.repeatMode === 'one' ? repeatOutline : repeat" />
          </button>
        </div>

        <div class="now-playing-footer">
          <button type="button" class="footer-btn" @click="player.toggleLike">
            <ion-icon :icon="player.currentTrack.is_favorited ? heart : heartOutline" :color="player.currentTrack.is_favorited ? 'danger' : undefined" />
          </button>

          <button v-if="!DEMO_MODE" type="button" class="footer-btn" @click="openComments">
            <ion-icon :icon="chatbubbleOutline" />
          </button>

          <button v-if="!DEMO_MODE" type="button" class="footer-btn" @click="shareTrack">
            <ion-icon :icon="shareSocialOutline" />
          </button>

          <button type="button" class="speed-btn" @click="cycleSpeed">
            {{ player.playbackRate }}x
          </button>
        </div>
      </div>

      <div v-else class="now-playing-empty">
        <p>Nothing is playing right now.</p>
      </div>
    </ion-content>

    <AdBreakOverlay v-if="showAdBreak" :type="adBreakType" @complete="finishAdBreak" />
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, IonRange } from '@ionic/vue';
import {
  chatbubbleOutline, chevronDown, heart, heartOutline, musicalNotes, pause, play,
  playSkipBack, playSkipForward, repeat, repeatOutline, shareSocialOutline, shuffle,
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';
import { subscriptionApi } from '@/services/subscription';
import { libraryApi } from '@/services/library';
import { DEMO_MODE } from '@/demo/demoData';
import AdBreakOverlay from '@/components/ads/AdBreakOverlay.vue';
import type { AdType } from '@/types/ads';

const player = usePlayerStore();
const router = useRouter();

function openComments() {
  if (player.currentTrack) router.push(`/tracks/${player.currentTrack.id}/comments`);
}

async function shareTrack() {
  const track = player.currentTrack;
  if (!track) return;

  try {
    await Share.share({
      title: track.title,
      text: `Listen to "${track.title}" by ${track.artist?.name ?? 'this artist'} on Altar Place`,
      dialogTitle: 'Share this track',
    });
    void libraryApi.shareTrack(track.id);
  } catch {
    // User canceled the native share sheet — nothing to log.
  }
}

const speeds = [1, 1.25, 1.5, 1.75, 2, 0.75];

function cycleSpeed() {
  const currentIndex = speeds.indexOf(player.playbackRate);
  player.setPlaybackRate(speeds[(currentIndex + 1) % speeds.length]);
}

function onSeek(event: CustomEvent) {
  player.seekTo(Number(event.detail.value));
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Ad breaks: for non-premium listeners, every few tracks played while this
// page is open triggers a full-screen interstitial or audio ad before
// playback continues. Pacing is per Now-Playing-session (resets if the page
// is closed and reopened) rather than a globally persisted counter — a
// deliberately simple scope for this first pass.
const TRACKS_PER_AD_BREAK = 3;
const isPremium = ref(true);
const tracksSinceAdBreak = ref(0);
const showAdBreak = ref(false);
const adBreakType = ref<Extract<AdType, 'interstitial' | 'audio'>>('interstitial');

watch(
  () => player.currentTrack?.id,
  (newId, oldId) => {
    if (!newId || newId === oldId || DEMO_MODE || isPremium.value) return;

    tracksSinceAdBreak.value += 1;
    if (tracksSinceAdBreak.value >= TRACKS_PER_AD_BREAK) {
      tracksSinceAdBreak.value = 0;
      adBreakType.value = Math.random() < 0.5 ? 'audio' : 'interstitial';
      player.pause();
      showAdBreak.value = true;
    }
  }
);

function finishAdBreak() {
  showAdBreak.value = false;
  player.resume();
}

onMounted(async () => {
  if (DEMO_MODE) return;
  const status = await subscriptionApi.status();
  isPremium.value = status.is_premium;
});
</script>

<style scoped>
.now-playing {
  --background: radial-gradient(ellipse at top, #302103 0%, var(--ion-background-color) 60%);
}

.now-playing-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 24px 32px;
}

.now-playing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.icon-btn, .icon-btn-spacer {
  width: 40px;
  height: 40px;
}

.icon-btn {
  border: none;
  background: transparent;
  color: var(--ion-text-color);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.now-playing-kicker {
  margin: 0;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ion-color-step-850, #9a9a9a);
}

.now-playing-art {
  width: 100%;
  aspect-ratio: 1;
  max-height: 40vh;
  font-size: 96px;
  margin: 16px 0 24px;
  border-radius: var(--app-radius-xl);
  box-shadow: var(--app-shadow-elevated);
  overflow: hidden;
}

.now-playing-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.now-playing-meta {
  text-align: center;
  margin-bottom: 24px;
}

.now-playing-title {
  margin: 0;
  font-size: 22px;
}

.now-playing-artist {
  margin: 4px 0 0;
  color: var(--ion-color-step-850, #9a9a9a);
}

.now-playing-seek {
  margin-bottom: 8px;
}

.now-playing-times {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  margin-top: -6px;
}

.now-playing-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 16px 0;
}

.control-btn {
  border: none;
  background: transparent;
  color: var(--ion-text-color);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.control-btn:disabled {
  opacity: 0.3;
}

.control-btn--active {
  color: var(--ion-color-primary);
}

.play-btn {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: none;
  background: var(--ion-color-primary);
  color: #fff;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--app-shadow-soft);
}

.now-playing-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.footer-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  color: var(--ion-text-color);
  cursor: pointer;
}

.speed-btn {
  border: 1px solid var(--ion-border-color);
  background: transparent;
  color: var(--ion-text-color);
  border-radius: var(--app-radius-full);
  padding: 6px 14px;
  font-size: 13px;
  font-family: var(--app-font-mono);
  cursor: pointer;
}

.now-playing-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-step-850, #9a9a9a);
}
</style>

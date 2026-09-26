<template>
  <div v-if="player.currentTrack" class="mini-player" @click="openPlayer">
    <div class="mini-player-progress" :style="{ width: `${player.progressPercent}%` }" />

    <div class="mini-player-art" :class="{ 'app-art-placeholder': !player.currentTrack.cover_url }">
      <img v-if="player.currentTrack.cover_url" :src="player.currentTrack.cover_url" class="mini-player-image" alt="" />
      <ion-icon v-else :icon="musicalNotes" />
    </div>

    <div class="mini-player-info">
      <p class="mini-player-title">{{ player.currentTrack.title }}</p>
      <p class="mini-player-artist">{{ player.currentTrack.artist?.name }}</p>
    </div>

    <ion-icon
      class="mini-player-like"
      :icon="player.currentTrack.is_favorited ? heart : heartOutline"
      :color="player.currentTrack.is_favorited ? 'danger' : undefined"
      @click.stop="player.toggleLike"
    />

    <button type="button" class="mini-player-toggle" @click.stop="player.togglePlayback">
      <ion-icon :icon="player.isPlaying ? pause : play" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { heart, heartOutline, musicalNotes, pause, play } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/player';

const player = usePlayerStore();
const router = useRouter();

function openPlayer() {
  router.push('/now-playing');
}
</script>

<style scoped>
.mini-player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--app-tab-bar-offset, 0px);
  height: var(--app-mini-player-height);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  background: var(--ion-card-background);
  border-top: 1px solid var(--ion-border-color);
  z-index: 10;
  position: fixed;
  cursor: pointer;
}

.mini-player-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--ion-color-primary);
  transition: width 200ms linear;
}

.mini-player-art {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  font-size: 18px;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.mini-player-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-player-info {
  flex: 1;
  min-width: 0;
}

.mini-player-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player-artist {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-player-like {
  font-size: 20px;
  flex-shrink: 0;
}

.mini-player-toggle {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
}
</style>

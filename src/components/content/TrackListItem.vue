<template>
  <div class="track-row" :class="{ 'track-row--active': isActive }" @click="$emit('play')">
    <div class="track-row-art" :class="{ 'app-art-placeholder': !track.cover_url }">
      <img v-if="track.cover_url" :src="track.cover_url" class="track-row-image" alt="" />
      <ion-icon v-else :icon="musicalNotes" />
      <ion-icon v-if="isActive && isPlaying" :icon="volumeMedium" class="track-row-playing-badge" />
    </div>

    <div class="track-row-info">
      <p class="track-row-title">{{ track.title }}</p>
      <p class="track-row-subtitle">{{ track.artist?.name }}</p>
    </div>

    <span class="track-row-duration app-mono">{{ formattedDuration }}</span>

    <ion-icon
      v-if="showDownload"
      class="track-row-download"
      :class="{ 'track-row-download--active': isDownloaded }"
      :icon="isDownloading ? cloudUploadOutline : (isDownloaded ? checkmarkCircle : downloadOutline)"
      @click.stop="handleDownloadClick"
    />

    <ion-icon
      class="track-row-like"
      :icon="track.is_favorited ? heart : heartOutline"
      :color="track.is_favorited ? 'danger' : undefined"
      @click.stop="$emit('toggle-favorite')"
    />

    <ion-icon
      v-if="showRemove"
      class="track-row-remove"
      :icon="trashOutline"
      @click.stop="$emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { checkmarkCircle, cloudUploadOutline, downloadOutline, heart, heartOutline, musicalNotes, trashOutline, volumeMedium } from 'ionicons/icons';
import { computed } from 'vue';
import type { Track } from '@/types/catalog';

const props = defineProps<{
  track: Track;
  isActive?: boolean;
  isPlaying?: boolean;
  showDownload?: boolean;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  showRemove?: boolean;
}>();

const emit = defineEmits<{ play: []; 'toggle-favorite': []; download: []; 'remove-download': []; remove: [] }>();

function handleDownloadClick() {
  if (props.isDownloaded) {
    emit('remove-download');
  } else {
    emit('download');
  }
}

const formattedDuration = computed(() => {
  const seconds = props.track.duration_seconds;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});
</script>

<style scoped>
.track-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px;
  cursor: pointer;
}

.track-row--active .track-row-title {
  color: var(--ion-color-primary);
}

.track-row-art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 18px;
  position: relative;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.track-row-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.track-row-playing-badge {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 16px;
  height: 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  padding: 4px;
  box-sizing: content-box;
}

.track-row-info {
  flex: 1;
  min-width: 0;
}

.track-row-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-row-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-row-duration {
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  flex-shrink: 0;
}

.track-row-like {
  font-size: 18px;
  flex-shrink: 0;
}

.track-row-download {
  font-size: 18px;
  flex-shrink: 0;
  color: var(--ion-color-step-850, #9a9a9a);
}

.track-row-download--active {
  color: var(--ion-color-primary);
}

.track-row-remove {
  font-size: 18px;
  flex-shrink: 0;
  color: var(--ion-color-step-850, #9a9a9a);
}
</style>

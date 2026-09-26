<template>
  <div class="content-card" @click="$emit('open')">
    <div class="content-card-art" :class="{ 'app-art-placeholder': !coverUrl }">
      <img v-if="coverUrl" :src="coverUrl" class="content-card-image" alt="" />
      <ion-icon v-else :icon="musicalNotes" />
      <button type="button" class="content-card-play" @click.stop="$emit('play')">
        <ion-icon :icon="play" />
      </button>
    </div>
    <p class="content-card-title">{{ title }}</p>
    <p class="content-card-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { musicalNotes, play } from 'ionicons/icons';

defineProps<{
  title: string;
  subtitle: string;
  coverUrl?: string | null;
}>();

defineEmits<{ play: []; open: [] }>();
</script>

<style scoped>
.content-card {
  width: 130px;
  flex-shrink: 0;
  cursor: pointer;
}

.content-card-art {
  width: 130px;
  height: 130px;
  font-size: 32px;
  position: relative;
  border-radius: var(--app-radius-md);
  overflow: hidden;
}

.content-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.content-card-play {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  box-shadow: var(--app-shadow-soft);
}

.content-card-title {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-card-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

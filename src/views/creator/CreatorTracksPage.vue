<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/creator/dashboard" />
        </ion-buttons>
        <ion-title>My Tracks</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/creator/tracks/upload')">
            <ion-icon :icon="add" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="tracks-content">
        <div v-if="isLoading" class="tracks-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="track in tracks" :key="track.id" class="track-row">
            <div class="track-art" :class="{ 'app-art-placeholder': !track.cover_url }">
              <img v-if="track.cover_url" :src="track.cover_url" class="track-art-image" alt="" />
              <ion-icon v-else :icon="musicalNotes" />
            </div>
            <div class="track-info">
              <p class="track-title">{{ track.title }}</p>
              <p class="track-meta">
                {{ track.plays_count }} streams ·
                <span :class="`status status--${track.transcoding_status}`">{{ statusLabel(track.transcoding_status) }}</span>
              </p>
            </div>
            <button type="button" class="icon-btn" @click="router.push(`/creator/tracks/${track.id}/edit`)">
              <ion-icon :icon="createOutline" />
            </button>
            <button type="button" class="icon-btn icon-btn--danger" @click="confirmDelete(track.id)">
              <ion-icon :icon="trashOutline" />
            </button>
          </div>

          <p v-if="!tracks.length" class="tracks-empty">
            You haven't uploaded any tracks yet.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { add, createOutline, musicalNotes, trashOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { creatorApi } from '@/services/creator';
import type { Track, TranscodingStatus } from '@/types/catalog';

const tracks = ref<Track[]>([]);
const isLoading = ref(true);
const router = useRouter();

function statusLabel(status?: TranscodingStatus): string {
  return {
    pending: 'Processing queued',
    processing: 'Processing…',
    ready: 'Adaptive streaming ready',
    failed: 'Standard streaming',
  }[status ?? 'ready'];
}

async function load() {
  isLoading.value = true;
  tracks.value = await creatorApi.tracks();
  isLoading.value = false;
}

async function confirmDelete(trackId: number) {
  const alert = await alertController.create({
    header: 'Delete track?',
    message: 'This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await creatorApi.deleteTrack(trackId);
          tracks.value = tracks.value.filter((t) => t.id !== trackId);
        },
      },
    ],
  });
  await alert.present();
}

onMounted(load);
</script>

<style scoped>
.tracks-content {
  padding: 8px 16px;
}

.tracks-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.track-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.track-art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 18px;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.track-art-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.track-info {
  flex: 1;
  min-width: 0;
}

.track-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.status--ready {
  color: var(--ion-color-success);
}

.status--failed {
  color: var(--ion-color-step-850, #9a9a9a);
}

.status--pending, .status--processing {
  color: var(--ion-color-warning);
}

.icon-btn {
  border: none;
  background: transparent;
  color: var(--ion-text-color);
  font-size: 18px;
  padding: 6px;
  cursor: pointer;
}

.icon-btn--danger {
  color: var(--ion-color-danger);
}

.tracks-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

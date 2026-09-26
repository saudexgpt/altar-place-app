<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/creator/dashboard" />
        </ion-buttons>
        <ion-title>My Albums</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="albums-content">
        <form class="new-album" @submit.prevent="createAlbum">
          <ion-input v-model="newTitle" placeholder="New album title" />
          <ion-button type="submit" :disabled="!newTitle.trim()">Create</ion-button>
        </form>

        <div v-if="isLoading" class="albums-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="album in albums" :key="album.id" class="album-row">
            <div class="album-art" :class="{ 'app-art-placeholder': !album.cover_url }">
              <img v-if="album.cover_url" :src="album.cover_url" class="album-art-image" alt="" />
              <ion-icon v-else :icon="albumsOutline" />
            </div>
            <div class="album-info">
              <p class="album-title">{{ album.title }}</p>
              <p class="album-meta">{{ album.tracks?.length ?? 0 }} tracks</p>
            </div>
            <button type="button" class="icon-btn" @click="renameAlbum(album)">
              <ion-icon :icon="createOutline" />
            </button>
            <button type="button" class="icon-btn icon-btn--danger" @click="deleteAlbum(album.id)">
              <ion-icon :icon="trashOutline" />
            </button>
          </div>

          <p v-if="!albums.length" class="albums-empty">No albums yet. Create one above to group your tracks.</p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonSpinner, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { albumsOutline, createOutline, trashOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { creatorApi } from '@/services/creator';
import type { Album } from '@/types/catalog';

const albums = ref<Album[]>([]);
const isLoading = ref(true);
const newTitle = ref('');

async function load() {
  isLoading.value = true;
  albums.value = await creatorApi.albums();
  isLoading.value = false;
}

async function createAlbum() {
  const title = newTitle.value.trim();
  if (!title) return;

  const album = await creatorApi.createAlbum({ title });
  albums.value.unshift(album);
  newTitle.value = '';
}

async function renameAlbum(album: Album) {
  const alert = await alertController.create({
    header: 'Rename album',
    inputs: [{ name: 'title', type: 'text', value: album.title }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Save',
        handler: async (data) => {
          if (!data.title?.trim()) return;
          const updated = await creatorApi.updateAlbum(album.id, { title: data.title.trim() });
          const index = albums.value.findIndex((a) => a.id === album.id);
          if (index !== -1) albums.value[index] = { ...albums.value[index], ...updated };
        },
      },
    ],
  });
  await alert.present();
}

async function deleteAlbum(albumId: number) {
  const alert = await alertController.create({
    header: 'Delete album?',
    message: 'Tracks in this album will not be deleted, just unlinked.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await creatorApi.deleteAlbum(albumId);
          albums.value = albums.value.filter((a) => a.id !== albumId);
        },
      },
    ],
  });
  await alert.present();
}

onMounted(load);
</script>

<style scoped>
.albums-content {
  padding: 8px 16px;
}

.new-album {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.new-album ion-input {
  --background: var(--ion-item-background);
  border-radius: var(--app-radius-md);
  --padding-start: 12px;
}

.albums-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.album-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.album-art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 18px;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.album-art-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-info {
  flex: 1;
  min-width: 0;
}

.album-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.album-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
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

.albums-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

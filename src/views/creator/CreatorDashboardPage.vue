<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Creator Studio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="dashboard" class="dashboard-content">
        <div class="artist-summary">
          <div class="artist-avatar" :class="{ 'app-art-placeholder': !dashboard.artist.avatar_url }">
            <img v-if="dashboard.artist.avatar_url" :src="dashboard.artist.avatar_url" class="artist-avatar-image" alt="" />
            <ion-icon v-else :icon="person" />
          </div>
          <h1 class="app-heading">{{ dashboard.artist.name }}</h1>
          <p v-if="dashboard.artist.is_verified" class="artist-verified">
            <ion-icon :icon="checkmarkCircle" /> Verified
          </p>
        </div>

        <div class="stat-grid">
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_tracks }}</p>
            <p class="stat-label">Tracks</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_streams }}</p>
            <p class="stat-label">Streams</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_followers }}</p>
            <p class="stat-label">Followers</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_albums }}</p>
            <p class="stat-label">Albums</p>
          </div>
        </div>

        <div class="menu-list">
          <button type="button" class="menu-item" @click="router.push('/creator/tracks/upload')">
            <ion-icon :icon="cloudUploadOutline" />
            <span>Upload Track</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/creator/tracks')">
            <ion-icon :icon="listOutline" />
            <span>Manage Tracks</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/creator/albums')">
            <ion-icon :icon="albumsOutline" />
            <span>Manage Albums</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/creator/analytics')">
            <ion-icon :icon="statsChartOutline" />
            <span>Analytics</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { albumsOutline, checkmarkCircle, chevronForward, cloudUploadOutline, listOutline, person, statsChartOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { creatorApi } from '@/services/creator';
import type { CreatorDashboard } from '@/types/creator';

const dashboard = ref<CreatorDashboard | null>(null);
const router = useRouter();

onMounted(async () => {
  dashboard.value = await creatorApi.dashboard();
});
</script>

<style scoped>
.dashboard-content {
  padding: 16px;
}

.artist-summary {
  text-align: center;
  margin-bottom: 20px;
}

.artist-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 32px;
  margin: 0 auto 8px;
  overflow: hidden;
}

.artist-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-summary h1 {
  margin: 0;
  font-size: 20px;
}

.artist-verified {
  margin: 4px 0 0;
  color: var(--ion-color-primary);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-tile {
  background: var(--ion-item-background);
  border-radius: var(--app-radius-lg);
  padding: 16px;
  text-align: center;
}

.stat-value {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.menu-list {
  display: flex;
  flex-direction: column;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  background: var(--ion-item-background);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid var(--ion-border-color);
  background: transparent;
  color: var(--ion-text-color);
  font-size: 14px;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item span {
  flex: 1;
  text-align: left;
}

.menu-chevron {
  color: var(--ion-color-step-850, #9a9a9a);
}
</style>

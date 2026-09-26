<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/creator/dashboard" />
        </ion-buttons>
        <ion-title>Analytics</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="analytics" class="analytics-content">
        <div class="stat-grid">
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ analytics.streams.toLocaleString() }}</p>
            <p class="stat-label">Streams</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ analytics.unique_listeners.toLocaleString() }}</p>
            <p class="stat-label">Unique Listeners</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ analytics.estimated_listening_minutes.toLocaleString() }}</p>
            <p class="stat-label">Minutes Listened</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ analytics.followers.toLocaleString() }}</p>
            <p class="stat-label">Followers</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ analytics.downloads.toLocaleString() }}</p>
            <p class="stat-label">Downloads</p>
          </div>
          <div class="stat-tile stat-tile--muted">
            <p class="stat-value app-mono">—</p>
            <p class="stat-label">Revenue</p>
          </div>
        </div>

        <p class="revenue-note">{{ analytics.revenue_note }}</p>

        <section class="chart-section">
          <h3 class="app-heading">Streams &amp; Downloads by Track</h3>
          <TrackBarChart :tracks="analytics.tracks" />
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { creatorApi } from '@/services/creator';
import type { CreatorAnalytics } from '@/types/creator';
import TrackBarChart from '@/components/charts/TrackBarChart.vue';

const analytics = ref<CreatorAnalytics | null>(null);

onMounted(async () => {
  analytics.value = await creatorApi.analytics();
});
</script>

<style scoped>
.analytics-content {
  padding: 16px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.stat-tile {
  background: var(--ion-item-background);
  border-radius: var(--app-radius-lg);
  padding: 16px;
  text-align: center;
}

.stat-tile--muted {
  opacity: 0.6;
}

.stat-value {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.stat-tile--muted .stat-value {
  color: var(--ion-text-color);
}

.stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.revenue-note {
  font-size: 12px;
  color: var(--ion-color-step-850, #6f6f6f);
  text-align: center;
  margin: 0 0 24px;
}

.chart-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
}
</style>

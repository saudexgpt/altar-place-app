<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Advertiser Studio</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="dashboard" class="dashboard-content">
        <div class="advertiser-summary">
          <ion-icon :icon="megaphoneOutline" class="advertiser-icon" />
          <h1 class="app-heading">{{ dashboard.advertiser.company_name }}</h1>
          <p v-if="dashboard.advertiser.is_verified" class="advertiser-verified">
            <ion-icon :icon="checkmarkCircle" /> Verified
          </p>
        </div>

        <div class="stat-grid">
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_campaigns }}</p>
            <p class="stat-label">Campaigns</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.active_campaigns }}</p>
            <p class="stat-label">Active</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_impressions }}</p>
            <p class="stat-label">Impressions</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ dashboard.total_clicks }}</p>
            <p class="stat-label">Clicks</p>
          </div>
        </div>

        <div class="menu-list">
          <button type="button" class="menu-item" @click="router.push('/advertiser/campaigns/new')">
            <ion-icon :icon="addCircleOutline" />
            <span>New Campaign</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/advertiser/campaigns')">
            <ion-icon :icon="listOutline" />
            <span>Manage Campaigns</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { addCircleOutline, checkmarkCircle, chevronForward, listOutline, megaphoneOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { adsApi } from '@/services/ads';
import type { AdvertiserDashboard } from '@/types/ads';

const dashboard = ref<AdvertiserDashboard | null>(null);
const router = useRouter();

onMounted(async () => {
  dashboard.value = await adsApi.dashboard();
});
</script>

<style scoped>
.dashboard-content {
  padding: 16px;
}

.advertiser-summary {
  text-align: center;
  margin-bottom: 20px;
}

.advertiser-icon {
  font-size: 48px;
  color: var(--ion-color-primary);
  margin-bottom: 8px;
}

.advertiser-summary h1 {
  margin: 0;
  font-size: 20px;
}

.advertiser-verified {
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

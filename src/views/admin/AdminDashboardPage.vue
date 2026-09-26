<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Admin Panel</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="overview" class="dashboard-content">
        <div class="stat-grid">
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ overview.dau }}</p>
            <p class="stat-label">Daily Active</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ overview.mau }}</p>
            <p class="stat-label">Monthly Active</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ overview.total_users }}</p>
            <p class="stat-label">Total Users</p>
          </div>
          <div class="stat-tile">
            <p class="stat-value app-mono">{{ overview.conversion_rate }}%</p>
            <p class="stat-label">Conversion</p>
          </div>
        </div>

        <div class="menu-list">
          <button type="button" class="menu-item" @click="router.push('/admin/users')">
            <ion-icon :icon="peopleOutline" />
            <span>User Management</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/admin/moderation')">
            <ion-icon :icon="shieldCheckmarkOutline" />
            <span>Content Moderation</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
          <button type="button" class="menu-item" @click="router.push('/admin/analytics')">
            <ion-icon :icon="statsChartOutline" />
            <span>Business Analytics</span>
            <ion-icon :icon="chevronForward" class="menu-chevron" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { chevronForward, peopleOutline, shieldCheckmarkOutline, statsChartOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi } from '@/services/admin';
import type { AdminAnalyticsOverview } from '@/types/admin';

const router = useRouter();
const overview = ref<AdminAnalyticsOverview | null>(null);

onMounted(async () => {
  overview.value = await adminApi.analyticsOverview();
});
</script>

<style scoped>
.dashboard-content {
  padding: 16px;
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

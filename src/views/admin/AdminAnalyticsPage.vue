<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin/dashboard" />
        </ion-buttons>
        <ion-title>Business Analytics</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="overview" class="analytics-content">
        <section class="analytics-section">
          <h3 class="app-heading">Active Users</h3>
          <div class="stat-row">
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.dau }}</p>
              <p class="stat-label">DAU</p>
            </div>
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.mau }}</p>
              <p class="stat-label">MAU</p>
            </div>
          </div>
          <p class="note">{{ overview.dau_mau_note }}</p>
        </section>

        <section class="analytics-section">
          <h3 class="app-heading">Revenue</h3>
          <div class="stat-row">
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ formatMoney(overview.revenue.total) }}</p>
              <p class="stat-label">Total</p>
            </div>
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ formatMoney(overview.revenue.last_30_days) }}</p>
              <p class="stat-label">Last 30 Days</p>
            </div>
          </div>
          <p class="note">{{ overview.revenue.note }}</p>
        </section>

        <section class="analytics-section">
          <h3 class="app-heading">Subscriptions</h3>
          <div class="stat-row">
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.conversion_rate }}%</p>
              <p class="stat-label">Conversion Rate</p>
            </div>
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.churn_rate }}%</p>
              <p class="stat-label">Churn Rate</p>
            </div>
          </div>
          <p class="note">{{ overview.churn_note }}</p>
        </section>

        <section class="analytics-section">
          <h3 class="app-heading">Platform</h3>
          <div class="stat-row stat-row--triple">
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.total_users }}</p>
              <p class="stat-label">Users</p>
            </div>
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.total_creators }}</p>
              <p class="stat-label">Creators</p>
            </div>
            <div class="stat-tile">
              <p class="stat-value app-mono">{{ overview.total_advertisers }}</p>
              <p class="stat-label">Advertisers</p>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { adminApi } from '@/services/admin';
import type { AdminAnalyticsOverview } from '@/types/admin';

const overview = ref<AdminAnalyticsOverview | null>(null);

function formatMoney(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

onMounted(async () => {
  overview.value = await adminApi.analyticsOverview();
});
</script>

<style scoped>
.analytics-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analytics-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-row--triple {
  grid-template-columns: repeat(3, 1fr);
}

.stat-tile {
  background: var(--ion-item-background);
  border-radius: var(--app-radius-lg);
  padding: 16px;
  text-align: center;
}

.stat-value {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.stat-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}
</style>

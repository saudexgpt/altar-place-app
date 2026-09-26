<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/advertiser/dashboard" />
        </ion-buttons>
        <ion-title>My Campaigns</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/advertiser/campaigns/new')">
            <ion-icon :icon="add" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="campaigns-content">
        <div v-if="isLoading" class="campaigns-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="campaign in campaigns" :key="campaign.id" class="campaign-row">
            <div class="campaign-info">
              <p class="campaign-title">{{ campaign.headline }}</p>
              <p class="campaign-meta">
                {{ typeLabel(campaign.type) }} ·
                <span :class="`status status--${campaign.status}`">{{ campaign.status }}</span>
                · {{ campaign.impressions_count }} impressions · {{ campaign.clicks_count }} clicks
              </p>
            </div>
            <button type="button" class="icon-btn" @click="router.push(`/advertiser/campaigns/${campaign.id}/edit`)">
              <ion-icon :icon="createOutline" />
            </button>
            <button type="button" class="icon-btn icon-btn--danger" @click="confirmDelete(campaign.id)">
              <ion-icon :icon="trashOutline" />
            </button>
          </div>

          <p v-if="!campaigns.length" class="campaigns-empty">
            You haven't created any campaigns yet.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { adsApi } from '@/services/ads';
import type { AdType, Advertisement } from '@/types/ads';

const campaigns = ref<Advertisement[]>([]);
const isLoading = ref(true);
const router = useRouter();

const TYPE_LABELS: Record<AdType, string> = {
  banner: 'Banner',
  interstitial: 'Interstitial',
  audio: 'Audio',
  sponsored_playlist: 'Sponsored Playlist',
  sponsored_artist: 'Sponsored Artist',
};

function typeLabel(type: AdType): string {
  return TYPE_LABELS[type];
}

async function load() {
  isLoading.value = true;
  campaigns.value = await adsApi.campaigns();
  isLoading.value = false;
}

async function confirmDelete(id: number) {
  const alert = await alertController.create({
    header: 'Delete campaign?',
    message: 'This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await adsApi.deleteCampaign(id);
          campaigns.value = campaigns.value.filter((c) => c.id !== id);
        },
      },
    ],
  });
  await alert.present();
}

onMounted(load);
</script>

<style scoped>
.campaigns-content {
  padding: 8px 16px;
}

.campaigns-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.campaign-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.campaign-info {
  flex: 1;
  min-width: 0;
}

.campaign-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.campaign-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.status--active {
  color: var(--ion-color-success);
}

.status--paused, .status--draft {
  color: var(--ion-color-warning);
}

.status--completed {
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

.campaigns-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

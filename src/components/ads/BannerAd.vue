<template>
  <div class="banner-ad app-glass-card" @click="handleClick">
    <p class="banner-ad-label">SPONSORED</p>
    <p class="banner-ad-headline">{{ ad.headline }}</p>
    <p v-if="ad.body" class="banner-ad-body">{{ ad.body }}</p>
    <ion-button v-if="ad.cta_label" size="small" shape="round" class="banner-ad-cta" @click.stop="handleClick">
      {{ ad.cta_label }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { onMounted } from 'vue';
import { Browser } from '@capacitor/browser';
import { adsApi } from '@/services/ads';
import { DEMO_MODE } from '@/demo/demoData';
import type { ServedAd } from '@/types/ads';

const props = defineProps<{ ad: ServedAd }>();

onMounted(() => {
  if (DEMO_MODE) return;
  void adsApi.logImpression(props.ad.id);
});

async function handleClick() {
  if (DEMO_MODE) return;

  void adsApi.logClick(props.ad.id);

  if (props.ad.cta_url) {
    await Browser.open({ url: props.ad.cta_url });
  }
}
</script>

<style scoped>
.banner-ad {
  padding: 16px;
  cursor: pointer;
}

.banner-ad-label {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--ion-color-primary);
}

.banner-ad-headline {
  margin: 6px 0 0;
  font-size: 15px;
  font-weight: 600;
}

.banner-ad-body {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.banner-ad-cta {
  --border-radius: var(--app-radius-full);
  width: fit-content;
  --padding-start: 18px;
  --padding-end: 18px;
  text-transform: none;
  font-weight: 600;
  margin-top: 10px;
}
</style>

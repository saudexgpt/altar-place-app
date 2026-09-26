<template>
  <div class="ad-break-overlay">
    <div class="ad-break-card">
      <p class="ad-break-eyebrow">{{ ad?.audio_url ? 'AD · PLAYING' : 'ADVERTISEMENT' }}</p>
      <h2 class="ad-break-headline">{{ ad?.headline ?? 'Loading…' }}</h2>
      <p v-if="ad?.body" class="ad-break-body">{{ ad.body }}</p>

      <div v-if="ad?.audio_url" class="ad-break-progress">
        <div class="ad-break-progress-fill" :style="{ width: `${progressPercent}%` }" />
      </div>

      <ion-button v-if="ad?.cta_label" fill="outline" shape="round" class="ad-break-cta" @click="handleCtaClick">
        {{ ad.cta_label }}
      </ion-button>

      <ion-button expand="block" shape="round" class="ad-break-continue" :disabled="!canDismiss" @click="finish">
        {{ canDismiss ? 'Continue' : `Continue in ${secondsRemaining}s` }}
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { adsApi } from '@/services/ads';
import { usePlatform } from '@/composables/usePlatform';
import type { AdType, ServedAd } from '@/types/ads';

const props = defineProps<{ type: Extract<AdType, 'interstitial' | 'audio'> }>();
const emit = defineEmits<{ complete: [] }>();

const { platform } = usePlatform();
const ad = ref<ServedAd | null>(null);
const canDismiss = ref(false);
const secondsRemaining = ref(5);
const progressPercent = ref(0);

let adAudio: HTMLAudioElement | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function cleanup() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;

  if (adAudio) {
    adAudio.pause();
    adAudio.src = '';
    adAudio = null;
  }
}

function finish() {
  if (!canDismiss.value) return;
  cleanup();
  emit('complete');
}

function startCountdown(seconds: number) {
  secondsRemaining.value = seconds;
  canDismiss.value = seconds <= 0;

  if (seconds <= 0) return;

  countdownTimer = setInterval(() => {
    secondsRemaining.value -= 1;
    if (secondsRemaining.value <= 0) {
      canDismiss.value = true;
      if (countdownTimer) clearInterval(countdownTimer);
    }
  }, 1000);
}

async function handleCtaClick() {
  if (!ad.value) return;
  void adsApi.logClick(ad.value.id);
  if (ad.value.cta_url) await Browser.open({ url: ad.value.cta_url });
}

onMounted(async () => {
  const served = await adsApi.serve(props.type, platform.value);
  ad.value = served;

  if (!served) {
    emit('complete');
    return;
  }

  void adsApi.logImpression(served.id);

  if (served.audio_url) {
    adAudio = new Audio(served.audio_url);
    adAudio.addEventListener('timeupdate', () => {
      if (adAudio?.duration) {
        progressPercent.value = (adAudio.currentTime / adAudio.duration) * 100;
      }
    });
    adAudio.addEventListener('ended', () => {
      canDismiss.value = true;
      finish();
    });
    adAudio.addEventListener('error', () => {
      canDismiss.value = true;
      finish();
    });
    void adAudio.play();
  }

  // A minimum-viewing window applies either way, so a fast-skipped audio
  // clip still gets at least a few seconds of exposure.
  startCountdown(5);
});

onBeforeUnmount(cleanup);
</script>

<style scoped>
.ad-break-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.85);
}

.ad-break-card {
  width: 100%;
  max-width: 360px;
  background: var(--ion-card-background);
  border-radius: var(--app-radius-lg);
  padding: 28px 24px;
  text-align: center;
  box-shadow: var(--app-shadow-elevated);
}

.ad-break-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--ion-color-primary);
}

.ad-break-headline {
  margin: 12px 0 0;
  font-size: 20px;
  font-family: var(--app-font-heading);
  font-weight: 600;
}

.ad-break-body {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.ad-break-progress {
  height: 4px;
  border-radius: 2px;
  background: var(--ion-item-background);
  overflow: hidden;
  margin-top: 20px;
}

.ad-break-progress-fill {
  height: 100%;
  background: var(--ion-color-primary);
  transition: width 200ms linear;
}

.ad-break-cta {
  --border-radius: var(--app-radius-full);
  margin-top: 20px;
  width: 100%;
  text-transform: none;
  font-weight: 600;
}

.ad-break-continue {
  --border-radius: var(--app-radius-full);
  margin-top: 12px;
  text-transform: none;
  font-weight: 600;
}
</style>

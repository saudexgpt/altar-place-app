<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Become an Advertiser</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="apply-content">
        <div class="apply-intro">
          <ion-icon :icon="megaphoneOutline" class="apply-icon" />
          <h1 class="app-heading">Reach listeners on Altar Place</h1>
          <p>Set up an advertiser profile to run banner, interstitial, audio, and sponsored-content campaigns.</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <ion-item class="apply-item" lines="none">
            <ion-input v-model="companyName" label="Company Name" label-placement="stacked" placeholder="e.g. Grace Media Co" required />
          </ion-item>

          <ion-item class="apply-item" lines="none">
            <ion-input v-model="website" label="Website" label-placement="stacked" placeholder="https://example.com" />
          </ion-item>

          <p v-if="errorMessage" class="apply-error">{{ errorMessage }}</p>

          <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting || !companyName.trim()">
            {{ isSubmitting ? 'Setting up…' : 'Create Advertiser Profile' }}
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { megaphoneOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { adsApi } from '@/services/ads';
import { useAuthStore } from '@/stores/auth';
import { DEMO_MODE } from '@/demo/demoData';

const companyName = ref('');
const website = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const auth = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  if (DEMO_MODE) {
    errorMessage.value = 'Advertiser tools are disabled in this offline demo.';
    isSubmitting.value = false;
    return;
  }

  try {
    await adsApi.apply({ company_name: companyName.value, website: website.value || undefined });
    await auth.fetchCurrentUser();
    router.replace('/advertiser/dashboard');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message ?? 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.apply-content {
  padding: 16px;
}

.apply-intro {
  text-align: center;
  margin-bottom: 24px;
}

.apply-icon {
  font-size: 48px;
  color: var(--ion-color-primary);
  margin-bottom: 12px;
}

.apply-intro h1 {
  font-size: 20px;
  margin: 0 0 8px;
}

.apply-intro p {
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 14px;
  margin: 0;
}

.apply-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: var(--app-radius-md);
  margin-bottom: 12px;
  border-radius: var(--app-radius-md);
}

.apply-error {
  color: var(--ion-color-danger);
  font-size: 13px;
}
</style>

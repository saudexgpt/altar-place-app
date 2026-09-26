<template>
  <ion-page>
    <ion-content class="verify-content">
      <div class="verify-wrapper">
        <ion-spinner v-if="status === 'pending'" name="crescent" />
        <ion-icon v-else :icon="status === 'success' ? checkmarkCircle : closeCircle" :color="status === 'success' ? 'success' : 'danger'" class="verify-icon" />
        <h2 class="app-heading">{{ heading }}</h2>
        <p>{{ message }}</p>
        <router-link :to="auth.isAuthenticated ? '/tabs/tab1' : '/login'">
          {{ auth.isAuthenticated ? 'Continue to app' : 'Back to login' }}
        </router-link>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const auth = useAuthStore();
const status = ref<'pending' | 'success' | 'error'>('pending');

const heading = computed(() => ({
  pending: 'Verifying your email…',
  success: 'Email verified!',
  error: 'Verification failed',
}[status.value]));

const message = computed(() => ({
  pending: 'Please wait a moment.',
  success: 'Your email address has been confirmed.',
  error: 'This link is invalid or has expired. Please request a new one from your profile.',
}[status.value]));

onMounted(async () => {
  const verifyUrl = route.query.verify_url as string | undefined;

  if (!verifyUrl) {
    status.value = 'error';
    return;
  }

  try {
    // This hits the backend's signed URL directly (not the api client, which
    // would incorrectly attach an unrelated Bearer token to this request).
    await axios.get(verifyUrl);
    status.value = 'success';

    if (auth.isAuthenticated) {
      await auth.fetchCurrentUser();
    }
  } catch {
    status.value = 'error';
  }
});
</script>

<style scoped>
.verify-content {
  --background: var(--ion-background-color);
}

.verify-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.verify-icon {
  font-size: 48px;
}
</style>

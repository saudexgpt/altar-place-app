<template>
  <ion-page>
    <ion-content class="callback-content">
      <div class="callback-wrapper">
        <ion-spinner v-if="!errorMessage" name="crescent" />
        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
        <p v-else>Finishing sign-in…</p>
        <router-link v-if="errorMessage" to="/login">Back to login</router-link>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { App as CapacitorApp, type URLOpenListenerEvent } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { IonContent, IonPage, IonSpinner } from '@ionic/vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const errorMessage = ref('');
let listenerHandle: PluginListenerHandle | undefined;

async function completeLogin(params: URLSearchParams) {
  const token = params.get('token');
  const error = params.get('error');

  if (error) {
    errorMessage.value = 'Sign-in was cancelled or failed. Please try again.';
    return;
  }

  if (!token) {
    errorMessage.value = 'No sign-in token was received.';
    return;
  }

  try {
    await auth.loginWithToken(token);
    router.replace('/tabs/tab1');
  } catch {
    errorMessage.value = 'Could not complete sign-in. Please try again.';
  }
}

// Native deep-link path: a custom URL scheme handoff from the system browser
// (requires the platform project's URL scheme to be registered once
// `npx cap add ios/android` is run).
function handleAppUrlOpen(event: URLOpenListenerEvent) {
  const url = new URL(event.url);
  void completeLogin(url.searchParams);
}

onMounted(() => {
  void CapacitorApp.addListener('appUrlOpen', handleAppUrlOpen).then((handle) => {
    listenerHandle = handle;
  });

  // Web / already-in-app path: the backend redirected this same tab here.
  void completeLogin(new URLSearchParams(route.query as Record<string, string>));
});

onUnmounted(() => {
  void listenerHandle?.remove();
});
</script>

<style scoped>
.callback-content {
  --background: var(--ion-background-color);
}

.callback-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.auth-error {
  color: var(--ion-color-danger);
}
</style>

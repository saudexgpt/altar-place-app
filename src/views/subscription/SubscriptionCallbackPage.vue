<template>
  <ion-page>
    <ion-content class="callback-content" :fullscreen="true">
      <div class="callback-wrapper">
        <ion-spinner v-if="status === 'pending'" name="crescent" />
        <ion-icon
          v-else
          :icon="status === 'success' ? checkmarkCircle : closeCircle"
          :color="status === 'success' ? 'success' : 'danger'"
          class="callback-icon"
        />
        <h2 class="app-heading">{{ heading }}</h2>
        <p>{{ message }}</p>
        <ion-button v-if="status !== 'pending'" shape="round" @click="router.replace('/subscription')">
          Continue
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/vue';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { subscriptionApi } from '@/services/subscription';

const route = useRoute();
const router = useRouter();
const status = ref<'pending' | 'success' | 'error'>('pending');

const heading = computed(() => ({
  pending: 'Confirming your payment…',
  success: 'You\'re now Premium! 🎉',
  error: 'Payment could not be confirmed',
}[status.value]));

const message = computed(() => ({
  pending: 'Please wait a moment.',
  success: 'Enjoy unlimited downloads, ad-free listening, and high quality audio.',
  error: 'If you completed the payment, this may just need a moment — check your subscription status shortly.',
}[status.value]));

onMounted(async () => {
  const reference = route.query.reference as string | undefined;

  if (!reference) {
    status.value = 'error';
    return;
  }

  try {
    await subscriptionApi.verify(reference);
    status.value = 'success';
  } catch {
    status.value = 'error';
  }
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

.callback-icon {
  font-size: 48px;
}
</style>

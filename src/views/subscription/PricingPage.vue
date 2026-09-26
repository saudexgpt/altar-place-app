<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Go Premium</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="pricing-content">
        <div v-if="currentPlanSlug" class="current-plan-banner">
          You're currently on <strong>{{ currentPlanName }}</strong>.
        </div>

        <div v-for="plan in payablePlans" :key="plan.id" class="plan-card" :class="{ 'plan-card--current': plan.slug === currentPlanSlug }">
          <div class="plan-card-header">
            <h2 class="app-heading">{{ plan.name }}</h2>
            <p class="plan-price app-mono">
              {{ formatPrice(plan.price, plan.currency) }}
              <span class="plan-interval">/{{ plan.billing_interval }}</span>
            </p>
          </div>

          <ul class="plan-features">
            <li><ion-icon :icon="checkmarkCircle" /> {{ plan.features.download_limit === null ? 'Unlimited downloads' : `${plan.features.download_limit} downloads/month` }}</li>
            <li><ion-icon :icon="checkmarkCircle" /> {{ plan.features.ad_free ? 'Ad-free listening' : 'Includes ads' }}</li>
            <li><ion-icon :icon="checkmarkCircle" /> {{ plan.features.max_audio_quality === 'high' ? 'High quality audio' : 'Standard quality audio' }}</li>
            <li v-if="plan.max_family_members"><ion-icon :icon="checkmarkCircle" /> Up to {{ plan.max_family_members }} family members</li>
          </ul>

          <ion-button
            v-if="plan.slug !== currentPlanSlug"
            expand="block"
            shape="round"
            :disabled="checkingOutPlanId === plan.id"
            @click="openProviderSheet(plan)"
          >
            {{ checkingOutPlanId === plan.id ? 'Redirecting…' : 'Subscribe' }}
          </ion-button>
          <p v-else class="plan-current-label">Current Plan</p>
        </div>

        <ion-action-sheet
          :is-open="providerSheetOpen"
          header="Choose a payment method"
          :buttons="providerButtons"
          @didDismiss="providerSheetOpen = false"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonActionSheet, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { subscriptionApi } from '@/services/subscription';
import type { PaymentProvider, SubscriptionPlan } from '@/types/subscription';

const plans = ref<SubscriptionPlan[]>([]);
const currentPlanSlug = ref<string | null>(null);
const currentPlanName = ref('');
const checkingOutPlanId = ref<number | null>(null);
const providerSheetOpen = ref(false);
const selectedPlan = ref<SubscriptionPlan | null>(null);

const payablePlans = computed(() => plans.value.filter((p) => p.price > 0));

function formatPrice(priceInKobo: number, currency: string): string {
  const major = priceInKobo / 100;
  const symbol = currency === 'NGN' ? '₦' : currency;
  return `${symbol}${major.toLocaleString()}`;
}

function openProviderSheet(plan: SubscriptionPlan) {
  selectedPlan.value = plan;
  providerSheetOpen.value = true;
}

const providerButtons = computed(() => [
  { text: 'Paystack (Card)', handler: () => startCheckout('paystack') },
  { text: 'Bank Transfer', handler: () => startCheckout('bank_transfer') },
  { text: 'Flutterwave', handler: () => startCheckout('flutterwave') },
  { text: 'Cancel', role: 'cancel' },
]);

async function startCheckout(provider: PaymentProvider) {
  const plan = selectedPlan.value;
  if (!plan) return;

  checkingOutPlanId.value = plan.id;

  try {
    const { authorization_url } = await subscriptionApi.checkout(plan.id, provider);
    window.location.href = authorization_url;
  } finally {
    checkingOutPlanId.value = null;
  }
}

onMounted(async () => {
  const [plansRes, statusRes] = await Promise.all([subscriptionApi.plans(), subscriptionApi.status()]);
  plans.value = plansRes;
  currentPlanSlug.value = statusRes.plan.slug;
  currentPlanName.value = statusRes.plan.name;
});
</script>

<style scoped>
.pricing-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-plan-banner {
  background: var(--ion-item-background);
  border-radius: var(--app-radius-md);
  padding: 12px 16px;
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.plan-card {
  background: var(--ion-item-background);
  border-radius: var(--app-radius-lg);
  padding: 20px;
  border: 1px solid var(--ion-border-color);
}

.plan-card--current {
  border-color: var(--ion-color-primary);
}

.plan-card-header {
  margin-bottom: 12px;
}

.plan-card-header h2 {
  margin: 0;
  font-size: 18px;
}

.plan-price {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.plan-interval {
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.plan-features {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.plan-features ion-icon {
  color: var(--ion-color-success);
  flex-shrink: 0;
}

.plan-current-label {
  text-align: center;
  color: var(--ion-color-primary);
  font-weight: 600;
  font-size: 13px;
  margin: 0;
}
</style>

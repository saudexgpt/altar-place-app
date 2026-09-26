<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Subscription</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="status" class="manage-content">
        <div class="plan-summary app-glass-card">
          <p class="plan-summary-label">Current Plan</p>
          <h1 class="app-heading">{{ status.plan.name }}</h1>

          <template v-if="status.subscription">
            <p class="plan-summary-meta">
              {{ status.subscription.canceled_at ? 'Access ends' : 'Renews' }}
              {{ formatDate(status.subscription.ends_at) }}
            </p>
            <ion-badge v-if="status.subscription.canceled_at" color="warning">Canceled</ion-badge>
          </template>
          <p v-else-if="status.is_premium" class="plan-summary-meta">
            You have access via a family plan another user owns.
          </p>
          <p v-else class="plan-summary-meta">Upgrade for unlimited downloads and ad-free listening.</p>
        </div>

        <ion-button
          v-if="!status.is_premium"
          expand="block"
          shape="round"
          @click="router.push('/subscription/plans')"
        >
          View Plans
        </ion-button>

        <ion-button
          v-else-if="status.subscription && !status.subscription.canceled_at"
          expand="block"
          shape="round"
          fill="outline"
          color="danger"
          @click="confirmCancel"
        >
          Cancel Subscription
        </ion-button>

        <section v-if="isFamilyOwner" class="family-section">
          <h3 class="app-heading">Family Members</h3>

          <form class="invite-form" @submit.prevent="invite">
            <ion-input v-model="inviteEmail" type="email" placeholder="Family member's email" />
            <ion-button type="submit" :disabled="!inviteEmail.trim()">Invite</ion-button>
          </form>
          <p v-if="inviteError" class="invite-error">{{ inviteError }}</p>

          <div v-for="member in familyMembers" :key="member.id" class="member-row">
            <div class="member-avatar" :class="{ 'app-art-placeholder': !member.user?.avatar_url }">
              <img v-if="member.user?.avatar_url" :src="member.user.avatar_url" class="member-avatar-image" alt="" />
              <ion-icon v-else :icon="personOutline" />
            </div>
            <div class="member-info">
              <p class="member-name">{{ member.user?.name ?? member.invited_email }}</p>
              <p class="member-email">{{ member.invited_email }}</p>
            </div>
            <button type="button" class="icon-btn icon-btn--danger" @click="removeMember(member.id)">
              <ion-icon :icon="trashOutline" />
            </button>
          </div>

          <p class="family-limit">{{ familyMembers.length }} / {{ maxFamilyMembers }} members</p>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { personOutline, trashOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { subscriptionApi } from '@/services/subscription';
import type { FamilyMember, SubscriptionStatusResponse } from '@/types/subscription';
import { DEMO_MODE, demoSubscriptionStatus } from '@/demo/demoData';

const status = ref<SubscriptionStatusResponse | null>(null);
const familyMembers = ref<FamilyMember[]>([]);
const maxFamilyMembers = ref<number | null>(null);
const inviteEmail = ref('');
const inviteError = ref('');
const router = useRouter();

const isFamilyOwner = computed(() => status.value?.subscription?.plan.slug === 'family');

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadFamilyMembers() {
  if (!isFamilyOwner.value) return;
  const result = await subscriptionApi.familyMembers();
  familyMembers.value = result.members.filter((m) => m.status === 'active');
  maxFamilyMembers.value = result.max_family_members;
}

async function invite() {
  inviteError.value = '';

  if (DEMO_MODE) {
    inviteError.value = 'Inviting family members is disabled in this offline demo.';
    return;
  }

  try {
    await subscriptionApi.inviteFamilyMember(inviteEmail.value.trim());
    inviteEmail.value = '';
    await loadFamilyMembers();
  } catch (error: any) {
    inviteError.value = error.response?.data?.message ?? 'Could not invite that email.';
  }
}

async function removeMember(id: number) {
  if (DEMO_MODE) return;

  await subscriptionApi.removeFamilyMember(id);
  await loadFamilyMembers();
}

async function confirmCancel() {
  const alert = await alertController.create({
    header: 'Cancel subscription?',
    message: "You'll keep Premium access until your current period ends.",
    buttons: [
      { text: 'Keep Subscription', role: 'cancel' },
      {
        text: 'Cancel',
        role: 'destructive',
        handler: async () => {
          if (DEMO_MODE) {
            status.value = {
              ...status.value!,
              subscription: { ...status.value!.subscription!, canceled_at: new Date().toISOString() },
            };
            return;
          }

          const result = await subscriptionApi.cancel();
          status.value = { ...status.value!, subscription: result.subscription };
        },
      },
    ],
  });
  await alert.present();
}

onMounted(async () => {
  if (DEMO_MODE) {
    status.value = demoSubscriptionStatus;
    return;
  }

  status.value = await subscriptionApi.status();
  await loadFamilyMembers();
});
</script>

<style scoped>
.manage-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-summary {
  padding: 20px;
  text-align: center;
}

.plan-summary-label {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.plan-summary h1 {
  margin: 4px 0;
  font-size: 24px;
}

.plan-summary-meta {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.family-section {
  margin-top: 8px;
}

.family-section h3 {
  margin: 0 0 12px;
}

.invite-form {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.invite-form ion-input {
  --background: var(--ion-item-background);
  border-radius: var(--app-radius-md);
  --padding-start: 12px;
}

.invite-error {
  color: var(--ion-color-danger);
  font-size: 13px;
  margin: 0 0 12px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}

.member-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.member-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.member-email {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.icon-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  padding: 6px;
  cursor: pointer;
}

.icon-btn--danger {
  color: var(--ion-color-danger);
}

.family-limit {
  text-align: center;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  margin-top: 12px;
}
</style>

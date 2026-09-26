<template>
  <ion-menu content-id="main-content" side="start" menu-id="main-menu" class="app-side-menu">
    <ion-header>
      <ion-toolbar>
        <img :src="logoSrc" alt="Altar Place" class="side-menu-brand-mark" />
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="side-menu-profile">
        <ion-avatar>
          <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" alt="" />
          <div v-else class="side-menu-avatar-fallback">{{ initials }}</div>
        </ion-avatar>
        <div class="side-menu-profile-info">
          <p class="side-menu-name">{{ auth.user?.name }}</p>
          <p class="side-menu-plan">{{ planName }}</p>
        </div>
      </div>

      <ion-list lines="none">
        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push('/subscription')">
            <ion-icon :icon="diamondOutline" slot="start" />
            <ion-label>Subscription</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push('/profile/edit')">
            <ion-icon :icon="createOutline" slot="start" />
            <ion-label>Edit Profile</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push('/profile/following')">
            <ion-icon :icon="peopleOutline" slot="start" />
            <ion-label>Following</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push('/activity')">
            <ion-icon :icon="timeOutline" slot="start" />
            <ion-label>My Activity</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push(auth.hasRole('creator') ? '/creator/dashboard' : '/creator/apply')">
            <ion-icon :icon="micOutline" slot="start" />
            <ion-label>{{ auth.hasRole('creator') ? 'Creator Studio' : 'Become a Creator' }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle :auto-hide="false">
          <ion-item button @click="router.push(auth.hasRole('advertiser') ? '/advertiser/dashboard' : '/advertiser/apply')">
            <ion-icon :icon="megaphoneOutline" slot="start" />
            <ion-label>{{ auth.hasRole('advertiser') ? 'Advertiser Studio' : 'Become an Advertiser' }}</ion-label>
          </ion-item>
        </ion-menu-toggle>

        <ion-menu-toggle v-if="isModerator" :auto-hide="false">
          <ion-item button @click="router.push('/admin/dashboard')">
            <ion-icon :icon="shieldCheckmarkOutline" slot="start" />
            <ion-label>Admin Panel</ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>

      <ion-button expand="block" fill="outline" color="danger" class="side-menu-logout" @click="handleLogout">
        Log out
      </ion-button>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import { IonAvatar, IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { createOutline, diamondOutline, megaphoneOutline, micOutline, peopleOutline, shieldCheckmarkOutline, timeOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { subscriptionApi } from '@/services/subscription';
import { DEMO_MODE, demoSubscriptionStatus } from '@/demo/demoData';
import logoSrc from '@/assets/branding/altar-place-logo.png';

const auth = useAuthStore();
const router = useRouter();

const planName = ref('Free');
const isModerator = computed(() => auth.hasRole('moderator') || auth.hasRole('super-admin'));

const initials = computed(() =>
  (auth.user?.name ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
);

async function loadPlanName() {
  if (DEMO_MODE) {
    planName.value = demoSubscriptionStatus.plan.name;
    return;
  }

  const status = await subscriptionApi.status();
  planName.value = status.plan.name;
}

void loadPlanName();

async function handleLogout() {
  if (DEMO_MODE) {
    const toast = await toastController.create({
      message: 'Log out is disabled in this offline demo.',
      duration: 2000,
    });
    await toast.present();
    return;
  }

  await auth.logout();
  router.replace('/login');
}
</script>

<style scoped>
.app-side-menu {
  --width: 280px;
}

.side-menu-brand-mark {
  height: 28px;
  width: auto;
  margin-inline-start: 16px;
  margin-inline-end: 8px;
}

.side-menu-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px 16px;
}

.side-menu-profile ion-avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.side-menu-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: #fff;
  font-weight: 600;
}

.side-menu-profile-info {
  min-width: 0;
}

.side-menu-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-menu-plan {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.side-menu-logout {
  margin: 24px 16px;
}
</style>

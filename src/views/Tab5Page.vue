<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profile</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="profile-content">
        <div
          class="app-glass-card profile-card"
          v-motion
          :initial="{ opacity: 0, y: 16 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }"
        >
          <ion-avatar>
            <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" alt="" />
            <div v-else class="profile-avatar-fallback">{{ initials }}</div>
          </ion-avatar>
          <div class="profile-details">
            <h2 class="app-heading">{{ auth.user?.name }}</h2>
            <p v-if="auth.user?.username">@{{ auth.user.username }}</p>
            <p v-else>{{ auth.user?.email }}</p>
            <ion-badge v-for="role in auth.user?.roles" :key="role" color="secondary">{{ role }}</ion-badge>
            <ion-badge v-if="isPremium" color="warning">{{ planName }}</ion-badge>
          </div>
        </div>

        <ion-card v-if="auth.user && !auth.isEmailVerified" class="verify-banner">
          <ion-card-content>
            Please verify your email address to unlock all features.
          </ion-card-content>
        </ion-card>

        <div class="profile-menu">
          <button type="button" class="profile-menu-item" @click="router.push('/subscription')">
            <ion-icon :icon="diamondOutline" />
            <span>Subscription</span>
            <span class="profile-menu-value">{{ planName }}</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button type="button" class="profile-menu-item" @click="router.push('/profile/edit')">
            <ion-icon :icon="createOutline" />
            <span>Edit Profile</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button type="button" class="profile-menu-item" @click="router.push('/profile/following')">
            <ion-icon :icon="peopleOutline" />
            <span>Following</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button type="button" class="profile-menu-item" @click="router.push('/activity')">
            <ion-icon :icon="timeOutline" />
            <span>My Activity</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button
            type="button"
            class="profile-menu-item"
            @click="router.push(auth.hasRole('creator') ? '/creator/dashboard' : '/creator/apply')"
          >
            <ion-icon :icon="micOutline" />
            <span>{{ auth.hasRole('creator') ? 'Creator Studio' : 'Become a Creator' }}</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button
            type="button"
            class="profile-menu-item"
            @click="router.push(auth.hasRole('advertiser') ? '/advertiser/dashboard' : '/advertiser/apply')"
          >
            <ion-icon :icon="megaphoneOutline" />
            <span>{{ auth.hasRole('advertiser') ? 'Advertiser Studio' : 'Become an Advertiser' }}</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>

          <button
            v-if="isModerator"
            type="button"
            class="profile-menu-item"
            @click="router.push('/admin/dashboard')"
          >
            <ion-icon :icon="shieldCheckmarkOutline" />
            <span>Admin Panel</span>
            <ion-icon :icon="chevronForward" class="profile-menu-chevron" />
          </button>
        </div>

        <ion-button expand="block" fill="outline" color="danger" @click="handleLogout">
          Log out
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonAvatar, IonBadge, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, toastController } from '@ionic/vue';
import { chevronForward, createOutline, diamondOutline, megaphoneOutline, micOutline, peopleOutline, shieldCheckmarkOutline, timeOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { subscriptionApi } from '@/services/subscription';
import { DEMO_MODE, demoSubscriptionStatus } from '@/demo/demoData';

const auth = useAuthStore();
const router = useRouter();

const planName = ref('Free');
const isPremium = ref(false);
const isModerator = computed(() => auth.hasRole('moderator') || auth.hasRole('super-admin'));

onMounted(async () => {
  if (DEMO_MODE) {
    planName.value = demoSubscriptionStatus.plan.name;
    isPremium.value = demoSubscriptionStatus.is_premium;
    return;
  }

  const status = await subscriptionApi.status();
  planName.value = status.plan.name;
  isPremium.value = status.is_premium;
});

const initials = computed(() =>
  (auth.user?.name ?? '')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
);

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
.profile-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.profile-card ion-avatar {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.profile-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: #fff;
  font-weight: 600;
}

.profile-details h2 {
  margin: 0;
  font-size: 18px;
}

.profile-details p {
  margin: 2px 0 8px;
  font-size: 13px;
  color: var(--ion-color-step-850, #aaa);
}

.verify-banner {
  border-radius: var(--app-radius-lg);
  --background: rgba(251, 188, 5, 0.12);
  color: var(--ion-color-warning);
}

.profile-menu {
  display: flex;
  flex-direction: column;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  background: var(--ion-item-background);
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid var(--ion-border-color);
  background: transparent;
  color: var(--ion-text-color);
  font-size: 14px;
  cursor: pointer;
}

.profile-menu-item:last-child {
  border-bottom: none;
}

.profile-menu-item span {
  flex: 1;
  text-align: left;
}

.profile-menu-chevron {
  color: var(--ion-color-step-850, #9a9a9a);
}

.profile-menu-value {
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
  flex: none !important;
}
</style>

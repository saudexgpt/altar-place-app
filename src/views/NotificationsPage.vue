<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1" />
        </ion-buttons>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="notifications.unreadCount > 0" fill="clear" size="small" @click="notifications.markAllAsRead">
            Mark all read
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="notifications-content">
        <div v-if="isLoading" class="notifications-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <button
            v-for="item in notifications.notifications"
            :key="item.id"
            type="button"
            class="notification-row"
            :class="{ 'notification-row--unread': !item.read_at }"
            @click="notifications.markAsRead(item.id)"
          >
            <span class="notification-dot" v-if="!item.read_at" />
            <div class="notification-info">
              <p class="notification-text">{{ item.data.message ?? 'You have a new notification.' }}</p>
              <p class="notification-time">{{ formatRelativeTime(item.created_at) }}</p>
            </div>
          </button>

          <p v-if="!notifications.notifications.length" class="notifications-empty">
            You're all caught up. New followers and comments will show up here.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';

const notifications = useNotificationsStore();
const isLoading = ref(true);

function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await notifications.refresh();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.notifications-content {
  padding: 8px 16px;
}

.notifications-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 12px 8px;
  border: none;
  border-bottom: 1px solid var(--ion-border-color);
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: var(--app-radius-sm);
}

.notification-row--unread {
  background: var(--ion-item-background);
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-info {
  flex: 1;
  min-width: 0;
  color: var(--ion-text-color);
}

.notification-text {
  margin: 0;
  font-size: 14px;
}

.notification-time {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.notifications-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

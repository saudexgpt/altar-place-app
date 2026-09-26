<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>My Activity</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="activity-content">
        <div v-if="isLoading" class="activity-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="item in activities" :key="item.id" class="activity-row">
            <ion-icon :icon="iconFor(item.type)" class="activity-icon" />
            <div class="activity-info">
              <p class="activity-text">{{ describe(item) }}</p>
              <p class="activity-time">{{ formatRelativeTime(item.created_at) }}</p>
            </div>
          </div>

          <p v-if="!activities.length" class="activity-empty">
            Nothing here yet. Follow an artist, favorite a track, or leave a comment to see it here.
          </p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/vue';
import { chatbubbleOutline, heartOutline, listOutline, peopleOutline, shareSocialOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { activityApi } from '@/services/activity';
import type { Activity, ActivityType } from '@/types/community';

const activities = ref<Activity[]>([]);
const isLoading = ref(true);

const ICONS: Record<ActivityType, string> = {
  followed_artist: peopleOutline,
  followed_playlist: peopleOutline,
  favorited_track: heartOutline,
  commented_on_track: chatbubbleOutline,
  shared_track: shareSocialOutline,
  shared_playlist: shareSocialOutline,
  created_playlist: listOutline,
};

function iconFor(type: ActivityType): string {
  return ICONS[type];
}

function subjectLabel(item: Activity): string {
  if (!item.subject) return '';
  return 'title' in item.subject ? item.subject.title : item.subject.name;
}

function describe(item: Activity): string {
  const label = subjectLabel(item);
  switch (item.type) {
    case 'followed_artist':
      return `You followed ${label}`;
    case 'followed_playlist':
      return `You followed the playlist "${label}"`;
    case 'favorited_track':
      return `You favorited "${label}"`;
    case 'commented_on_track':
      return `You commented on "${label}"`;
    case 'shared_track':
      return `You shared "${label}"`;
    case 'shared_playlist':
      return `You shared the playlist "${label}"`;
    case 'created_playlist':
      return `You created the playlist "${label}"`;
    default:
      return 'Activity';
  }
}

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
    activities.value = await activityApi.list();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.activity-content {
  padding: 8px 16px;
}

.activity-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.activity-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-text {
  margin: 0;
  font-size: 14px;
}

.activity-time {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.activity-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

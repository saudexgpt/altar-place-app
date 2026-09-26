<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/now-playing" />
        </ion-buttons>
        <ion-title>Comments</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="track" fill="clear" size="small" @click="reportTrack">
            <ion-icon :icon="flagOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="comments-content">
        <p v-if="track" class="comments-track-title">On "{{ track.title }}"</p>

        <div v-if="isLoading" class="comments-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="comment in comments" :key="comment.id" class="comment-row">
            <div class="comment-avatar">
              <img v-if="comment.user.avatar_url" :src="comment.user.avatar_url" alt="" />
              <span v-else>{{ initialsFor(comment.user.name) }}</span>
            </div>
            <div class="comment-body">
              <p class="comment-meta">
                <span class="comment-name">{{ comment.user.name }}</span>
                <span class="comment-time">{{ formatRelativeTime(comment.created_at) }}</span>
              </p>
              <p class="comment-text">{{ comment.body }}</p>
            </div>
            <button v-if="comment.is_owner" type="button" class="comment-delete" @click="remove(comment)">
              <ion-icon :icon="trashOutline" />
            </button>
            <button v-else type="button" class="comment-delete" @click="reportComment(comment)">
              <ion-icon :icon="flagOutline" />
            </button>
          </div>

          <p v-if="!comments.length" class="comments-empty">Be the first to comment on this track.</p>
        </template>
      </div>
    </ion-content>

    <form class="comment-composer" @submit.prevent="submit">
      <ion-input v-model="draft" placeholder="Add a comment…" class="comment-input" />
      <ion-button type="submit" fill="clear" :disabled="!draft.trim() || isSubmitting">
        <ion-icon :icon="sendOutline" />
      </ion-button>
    </form>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonPage, IonSpinner, IonTitle, IonToolbar, alertController, toastController } from '@ionic/vue';
import { flagOutline, sendOutline, trashOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { commentsApi } from '@/services/comments';
import { catalogApi } from '@/services/catalog';
import { reportsApi, type ReportReason } from '@/services/reports';
import type { Comment } from '@/types/community';
import type { Track } from '@/types/catalog';

const route = useRoute();
const trackId = Number(route.params.id);

const track = ref<Track | null>(null);
const comments = ref<Comment[]>([]);
const draft = ref('');
const isLoading = ref(true);
const isSubmitting = ref(false);

function initialsFor(name: string): string {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
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

async function submit() {
  const body = draft.value.trim();
  if (!body) return;

  isSubmitting.value = true;
  try {
    const comment = await commentsApi.create(trackId, body);
    comments.value.unshift(comment);
    draft.value = '';
  } finally {
    isSubmitting.value = false;
  }
}

async function promptReportReason(header: string): Promise<ReportReason | null> {
  return new Promise((resolve) => {
    alertController
      .create({
        header,
        inputs: [
          { name: 'reason', type: 'radio', label: 'Spam', value: 'spam', checked: true },
          { name: 'reason', type: 'radio', label: 'Abusive or harmful', value: 'abuse' },
          { name: 'reason', type: 'radio', label: 'Copyright violation', value: 'copyright' },
          { name: 'reason', type: 'radio', label: 'Inappropriate content', value: 'inappropriate' },
          { name: 'reason', type: 'radio', label: 'Other', value: 'other' },
        ],
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => resolve(null) },
          { text: 'Report', handler: (reason: ReportReason) => resolve(reason) },
        ],
      })
      .then((alert) => alert.present());
  });
}

async function reportTrack() {
  if (!track.value) return;

  const reason = await promptReportReason('Report this track?');
  if (!reason) return;

  await reportsApi.report('track', track.value.id, reason);
  const toast = await toastController.create({ message: 'Thanks — we\'ll review this track.', duration: 2000 });
  await toast.present();
}

async function reportComment(comment: Comment) {
  const reason = await promptReportReason('Report this comment?');
  if (!reason) return;

  await reportsApi.report('comment', comment.id, reason);
  const toast = await toastController.create({ message: 'Thanks — we\'ll review this comment.', duration: 2000 });
  await toast.present();
}

async function remove(comment: Comment) {
  const alert = await alertController.create({
    header: 'Delete comment?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          await commentsApi.destroy(comment.id);
          comments.value = comments.value.filter((c) => c.id !== comment.id);
        },
      },
    ],
  });
  await alert.present();
}

onMounted(async () => {
  isLoading.value = true;
  try {
    const [trackRes, commentsRes] = await Promise.all([
      catalogApi.track(trackId),
      commentsApi.list(trackId),
    ]);
    track.value = trackRes;
    comments.value = commentsRes;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.comments-content {
  padding: 8px 16px calc(var(--app-mini-player-height) + 80px);
}

.comments-track-title {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.comments-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.comment-name {
  font-size: 13px;
  font-weight: 600;
}

.comment-time {
  font-size: 11px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.comment-text {
  margin: 4px 0 0;
  font-size: 14px;
}

.comment-delete {
  border: none;
  background: transparent;
  color: var(--ion-color-danger);
  font-size: 16px;
  padding: 4px;
  cursor: pointer;
}

.comments-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}

.comment-composer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--ion-toolbar-background);
  border-top: 1px solid var(--ion-border-color);
}

.comment-input {
  --background: var(--ion-item-background);
  --border-radius: var(--app-radius-full);
  --padding-start: 16px;
  flex: 1;
}
</style>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin/dashboard" />
        </ion-buttons>
        <ion-title>Content Moderation</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="segment" @ion-change="onSegmentChange">
          <ion-segment-button value="reports">
            <ion-label>Reports</ion-label>
          </ion-segment-button>
          <ion-segment-button value="tracks">
            <ion-label>Tracks</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="isLoading" class="moderation-loading">
        <ion-spinner name="crescent" />
      </div>

      <div v-else-if="segment === 'reports'" class="moderation-content">
        <div v-for="report in reports" :key="report.id" class="report-row">
          <div class="report-info">
            <p class="report-title">
              <ion-badge color="medium">{{ report.reportable_type }}</ion-badge>
              {{ report.reportable_summary ?? `#${report.reportable_id}` }}
            </p>
            <p class="report-meta">Reason: {{ report.reason }} · by {{ report.reporter?.name ?? 'Unknown' }}</p>
            <p v-if="report.details" class="report-details">{{ report.details }}</p>
            <ion-badge :color="reportStatusColor(report.status)">{{ report.status }}</ion-badge>
          </div>
          <div v-if="report.status === 'pending'" class="report-actions">
            <button type="button" class="action-link" @click="dismiss(report)">Dismiss</button>
            <button type="button" class="action-link action-link--danger" @click="promptAction(report)">Take Action</button>
          </div>
        </div>

        <p v-if="!reports.length" class="moderation-empty">No reports to review.</p>
      </div>

      <div v-else class="moderation-content">
        <div v-for="track in tracks" :key="track.id" class="track-row">
          <div class="track-art" :class="{ 'app-art-placeholder': !track.cover_url }">
            <img v-if="track.cover_url" :src="track.cover_url" class="track-art-image" alt="" />
            <ion-icon v-else :icon="musicalNotes" />
          </div>
          <div class="track-info">
            <p class="track-title">{{ track.title }}</p>
            <p class="track-meta">{{ track.artist?.name }} · {{ track.plays_count }} streams</p>
            <div class="track-badges">
              <ion-badge :color="trackStatusColor(track.status)">{{ track.status }}</ion-badge>
              <ion-badge v-if="track.reports_count" color="danger">{{ track.reports_count }} reports</ion-badge>
            </div>
            <p v-if="track.rejection_reason" class="track-reason">{{ track.rejection_reason }}</p>
          </div>
          <div class="track-actions">
            <button v-if="track.status !== 'approved'" type="button" class="action-link" @click="approve(track)">Approve</button>
            <button v-if="track.status !== 'rejected'" type="button" class="action-link action-link--danger" @click="promptReject(track)">Reject</button>
          </div>
        </div>

        <p v-if="!tracks.length" class="moderation-empty">No tracks found.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonBadge, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { musicalNotes } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { adminApi } from '@/services/admin';
import type { AdminReport, AdminTrack } from '@/types/admin';

const segment = ref<'reports' | 'tracks'>('reports');
const reports = ref<AdminReport[]>([]);
const tracks = ref<AdminTrack[]>([]);
const isLoading = ref(true);

function reportStatusColor(status: string): string {
  return { pending: 'warning', actioned: 'danger', dismissed: 'medium' }[status] ?? 'medium';
}

function trackStatusColor(status: string): string {
  return { approved: 'success', rejected: 'danger' }[status] ?? 'medium';
}

async function loadReports() {
  reports.value = await adminApi.reports();
}

async function loadTracks() {
  tracks.value = await adminApi.tracks();
}

async function onSegmentChange() {
  isLoading.value = true;
  try {
    if (segment.value === 'reports') await loadReports();
    else await loadTracks();
  } finally {
    isLoading.value = false;
  }
}

async function dismiss(report: AdminReport) {
  await adminApi.resolveReport(report.id, 'dismiss');
  reports.value = reports.value.filter((r) => r.id !== report.id);
}

async function promptAction(report: AdminReport) {
  const alert = await alertController.create({
    header: 'Take action on this report?',
    message: 'This removes the reported content (rejects the track, or deletes the comment).',
    inputs: [{ name: 'note', type: 'text', placeholder: 'Resolution note (optional)' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Take Action',
        role: 'destructive',
        handler: async (data: { note?: string }) => {
          await adminApi.resolveReport(report.id, 'action', data.note);
          reports.value = reports.value.filter((r) => r.id !== report.id);
        },
      },
    ],
  });
  await alert.present();
}

async function approve(track: AdminTrack) {
  const updated = await adminApi.approveTrack(track.id);
  const index = tracks.value.findIndex((t) => t.id === updated.id);
  if (index !== -1) tracks.value[index] = updated;
}

async function promptReject(track: AdminTrack) {
  const alert = await alertController.create({
    header: `Reject "${track.title}"?`,
    inputs: [{ name: 'reason', type: 'text', placeholder: 'Reason (required)' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Reject',
        role: 'destructive',
        handler: async (data: { reason?: string }) => {
          if (!data.reason) return false;
          const updated = await adminApi.rejectTrack(track.id, data.reason);
          const index = tracks.value.findIndex((t) => t.id === updated.id);
          if (index !== -1) tracks.value[index] = updated;
          return true;
        },
      },
    ],
  });
  await alert.present();
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await loadReports();
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.moderation-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.moderation-content {
  padding: 8px 16px;
}

.report-row,
.track-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.report-info,
.track-info {
  flex: 1;
  min-width: 0;
}

.report-title,
.track-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.report-meta,
.track-meta {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.report-details {
  margin: 0 0 6px;
  font-size: 12px;
  font-style: italic;
}

.track-badges {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.track-reason {
  margin: 0;
  font-size: 12px;
  color: var(--ion-color-danger);
}

.report-actions,
.track-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.action-link {
  border: none;
  background: transparent;
  color: var(--ion-color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 0;
  white-space: nowrap;
}

.action-link--danger {
  color: var(--ion-color-danger);
}

.track-art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  font-size: 18px;
  border-radius: var(--app-radius-sm);
  overflow: hidden;
}

.track-art-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.moderation-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

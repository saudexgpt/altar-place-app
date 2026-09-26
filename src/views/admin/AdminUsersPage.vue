<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/admin/dashboard" />
        </ion-buttons>
        <ion-title>User Management</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="query" placeholder="Search name or email" @ion-input="load" />
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="users-content">
        <div v-if="isLoading" class="users-loading">
          <ion-spinner name="crescent" />
        </div>

        <template v-else>
          <div v-for="user in users" :key="user.id" class="user-row">
            <div class="user-avatar">
              <img v-if="user.avatar_url" :src="user.avatar_url" alt="" />
              <span v-else>{{ initialsFor(user.name) }}</span>
            </div>
            <div class="user-info">
              <p class="user-name">
                {{ user.name }}
                <ion-icon v-if="user.is_verified" :icon="checkmarkCircle" class="verified-icon" />
              </p>
              <p class="user-meta">{{ user.email }}</p>
              <div class="user-badges">
                <ion-badge :color="statusColor(user.status)">{{ user.status }}</ion-badge>
                <ion-badge v-for="role in user.roles" :key="role" color="secondary">{{ role }}</ion-badge>
              </div>
              <p v-if="user.status_reason" class="user-reason">{{ user.status_reason }}</p>
            </div>
            <div class="user-actions">
              <button v-if="!user.is_verified" type="button" class="action-link" @click="verify(user)">Verify</button>
              <button v-if="user.status !== 'active'" type="button" class="action-link" @click="reactivate(user)">Reactivate</button>
              <button v-if="user.status === 'active'" type="button" class="action-link action-link--warning" @click="promptSuspend(user)">Suspend</button>
              <button v-if="user.status !== 'banned'" type="button" class="action-link action-link--danger" @click="promptBan(user)">Ban</button>
            </div>
          </div>

          <p v-if="!users.length" class="users-empty">No users match this search.</p>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonBadge, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar, alertController } from '@ionic/vue';
import { checkmarkCircle } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { adminApi } from '@/services/admin';
import type { AdminUser } from '@/types/admin';

const users = ref<AdminUser[]>([]);
const query = ref('');
const isLoading = ref(true);

function initialsFor(name: string): string {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function statusColor(status: string): string {
  return { active: 'success', suspended: 'warning', banned: 'danger' }[status] ?? 'medium';
}

async function load() {
  isLoading.value = true;
  try {
    users.value = await adminApi.users({ q: query.value || undefined });
  } finally {
    isLoading.value = false;
  }
}

function replaceUser(updated: AdminUser) {
  const index = users.value.findIndex((u) => u.id === updated.id);
  if (index !== -1) users.value[index] = updated;
}

async function verify(user: AdminUser) {
  replaceUser(await adminApi.verifyUser(user.id));
}

async function reactivate(user: AdminUser) {
  replaceUser(await adminApi.reactivateUser(user.id));
}

async function promptSuspend(user: AdminUser) {
  const alert = await alertController.create({
    header: `Suspend ${user.name}?`,
    inputs: [{ name: 'reason', type: 'text', placeholder: 'Reason (optional)' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Suspend',
        role: 'destructive',
        handler: async (data: { reason?: string }) => {
          replaceUser(await adminApi.suspendUser(user.id, data.reason));
        },
      },
    ],
  });
  await alert.present();
}

async function promptBan(user: AdminUser) {
  const alert = await alertController.create({
    header: `Ban ${user.name}?`,
    message: 'This immediately revokes all of their active sessions.',
    inputs: [{ name: 'reason', type: 'text', placeholder: 'Reason (optional)' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Ban',
        role: 'destructive',
        handler: async (data: { reason?: string }) => {
          replaceUser(await adminApi.banUser(user.id, data.reason));
        },
      },
    ],
  });
  await alert.present();
}

onMounted(load);
</script>

<style scoped>
.users-content {
  padding: 8px 16px;
}

.users-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.user-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-border-color);
}

.user-avatar {
  width: 40px;
  height: 40px;
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

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.verified-icon {
  color: var(--ion-color-primary);
  font-size: 14px;
}

.user-meta {
  margin: 2px 0 6px;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.user-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.user-reason {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--ion-color-warning);
}

.user-actions {
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
}

.action-link--warning {
  color: var(--ion-color-warning);
}

.action-link--danger {
  color: var(--ion-color-danger);
}

.users-empty {
  text-align: center;
  color: var(--ion-color-step-850, #9a9a9a);
  padding: 32px 16px;
}
</style>

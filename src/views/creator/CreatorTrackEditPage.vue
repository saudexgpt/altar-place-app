<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/creator/tracks" />
        </ion-buttons>
        <ion-title>Edit Track</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <form v-if="loaded" class="edit-content" @submit.prevent="handleSubmit">
        <label class="file-picker" :class="{ 'file-picker--filled': coverFile }">
          <ion-icon :icon="imageOutline" />
          <span>{{ coverFile ? coverFile.name : 'Replace cover artwork' }}</span>
          <input type="file" accept="image/*" hidden @change="onCoverSelected" />
        </label>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="title" label="Title" label-placement="stacked" required />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-textarea v-model="description" label="Description" label-placement="stacked" :auto-grow="true" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-select v-model="type" label="Category" label-placement="stacked" interface="action-sheet">
            <ion-select-option value="music">Music</ion-select-option>
            <ion-select-option value="sermon">The Word (Sermon)</ion-select-option>
            <ion-select-option value="podcast">Podcast</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="language" label="Language" label-placement="stacked" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="tagsInput" label="Tags (comma separated)" label-placement="stacked" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-toggle v-model="isExplicit">Explicit content</ion-toggle>
        </ion-item>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving…' : 'Save Changes' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/vue';
import { imageOutline } from 'ionicons/icons';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { catalogApi } from '@/services/catalog';
import { creatorApi } from '@/services/creator';
import type { TrackType } from '@/types/catalog';

const route = useRoute();
const router = useRouter();

const title = ref('');
const description = ref('');
const type = ref<TrackType>('music');
const language = ref('');
const tagsInput = ref('');
const isExplicit = ref(false);
const coverFile = ref<File | null>(null);
const loaded = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

const trackId = Number(route.params.id);

function onCoverSelected(event: Event) {
  coverFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const tags = tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean);

    await creatorApi.updateTrack(trackId, {
      title: title.value,
      description: description.value || undefined,
      type: type.value,
      language: language.value || undefined,
      is_explicit: isExplicit.value,
      tags,
      cover: coverFile.value,
    });

    router.replace('/creator/tracks');
  } catch (error: any) {
    const errors = error.response?.data?.errors;
    errorMessage.value = errors
      ? (Object.values(errors)[0] as string[])[0]
      : error.response?.data?.message ?? 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  const track = await catalogApi.track(trackId);
  title.value = track.title;
  description.value = track.description ?? '';
  type.value = track.type;
  language.value = track.language ?? 'English';
  tagsInput.value = (track.tags ?? []).map((t) => t.name).join(', ');
  isExplicit.value = track.is_explicit;
  loaded.value = true;
});
</script>

<style scoped>
.edit-content {
  padding: 16px;
}

.file-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px dashed var(--ion-border-color);
  border-radius: var(--app-radius-md);
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--ion-color-step-850, #9a9a9a);
  cursor: pointer;
}

.file-picker--filled {
  border-color: var(--ion-color-primary);
  color: var(--ion-text-color);
}

.form-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: var(--app-radius-md);
  margin-bottom: 12px;
  border-radius: var(--app-radius-md);
}

.form-error {
  color: var(--ion-color-danger);
  font-size: 13px;
}
</style>

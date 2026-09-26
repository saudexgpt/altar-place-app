<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/creator/tracks" />
        </ion-buttons>
        <ion-title>Upload Track</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <form class="upload-content" @submit.prevent="handleSubmit">
        <label class="file-picker" :class="{ 'file-picker--filled': audioFile }">
          <ion-icon :icon="cloudUploadOutline" />
          <span>{{ audioFile ? audioFile.name : 'Choose audio file (mp3, wav, m4a, ogg)' }}</span>
          <input type="file" accept="audio/*" hidden @change="onAudioSelected" />
        </label>

        <label class="file-picker" :class="{ 'file-picker--filled': coverFile }">
          <ion-icon :icon="imageOutline" />
          <span>{{ coverFile ? coverFile.name : 'Choose cover artwork (optional)' }}</span>
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
          <ion-select v-model="genreId" label="Genre" label-placement="stacked" interface="action-sheet">
            <ion-select-option :value="null">None</ion-select-option>
            <ion-select-option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="language" label="Language" label-placement="stacked" placeholder="English" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="releaseDate" type="date" label="Release Date" label-placement="stacked" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="tagsInput" label="Tags (comma separated)" label-placement="stacked" placeholder="worship, live, acoustic" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-toggle v-model="isExplicit">Explicit content</ion-toggle>
        </ion-item>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting || !canSubmit">
          {{ isSubmitting ? 'Uploading…' : 'Upload Track' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/vue';
import { cloudUploadOutline, imageOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { creatorApi } from '@/services/creator';
import type { Genre, TrackType } from '@/types/catalog';

const title = ref('');
const description = ref('');
const type = ref<TrackType>('music');
const genreId = ref<number | null>(null);
const language = ref('English');
const releaseDate = ref('');
const tagsInput = ref('');
const isExplicit = ref(false);
const audioFile = ref<File | null>(null);
const coverFile = ref<File | null>(null);
const genres = ref<Genre[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref('');

const router = useRouter();

const canSubmit = computed(() => title.value.trim().length > 0 && audioFile.value !== null);

function onAudioSelected(event: Event) {
  audioFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

function onCoverSelected(event: Event) {
  coverFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

async function handleSubmit() {
  if (!audioFile.value) return;

  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const tags = tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean);

    await creatorApi.uploadTrack({
      title: title.value,
      description: description.value || undefined,
      type: type.value,
      genre_id: genreId.value,
      language: language.value || undefined,
      release_date: releaseDate.value || undefined,
      is_explicit: isExplicit.value,
      tags,
      audio: audioFile.value,
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
  genres.value = await creatorApi.genres();
});
</script>

<style scoped>
.upload-content {
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

.file-picker ion-icon {
  font-size: 20px;
  flex-shrink: 0;
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

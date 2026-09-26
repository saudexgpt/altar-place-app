<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/advertiser/campaigns" />
        </ion-buttons>
        <ion-title>{{ isEditing ? 'Edit Campaign' : 'New Campaign' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <form class="form-content" @submit.prevent="handleSubmit">
        <ion-item class="form-item" lines="none">
          <ion-select v-model="type" label="Ad Type" label-placement="stacked" interface="action-sheet" :disabled="isEditing">
            <ion-select-option value="banner">Banner</ion-select-option>
            <ion-select-option value="interstitial">Interstitial</ion-select-option>
            <ion-select-option value="audio">Audio</ion-select-option>
            <ion-select-option value="sponsored_playlist">Sponsored Playlist</ion-select-option>
            <ion-select-option value="sponsored_artist">Sponsored Artist</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item v-if="isEditing" class="form-item" lines="none">
          <ion-select v-model="status" label="Status" label-placement="stacked" interface="action-sheet">
            <ion-select-option value="draft">Draft</ion-select-option>
            <ion-select-option value="active">Active</ion-select-option>
            <ion-select-option value="paused">Paused</ion-select-option>
            <ion-select-option value="completed">Completed</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="headline" label="Headline" label-placement="stacked" required />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-textarea v-model="body" label="Body (optional)" label-placement="stacked" :auto-grow="true" />
        </ion-item>

        <label class="file-picker" :class="{ 'file-picker--filled': imageFile }">
          <ion-icon :icon="imageOutline" />
          <span>{{ imageFile ? imageFile.name : 'Choose creative image (optional)' }}</span>
          <input type="file" accept="image/*" hidden @change="onImageSelected" />
        </label>

        <label v-if="type === 'audio'" class="file-picker" :class="{ 'file-picker--filled': audioFile }">
          <ion-icon :icon="cloudUploadOutline" />
          <span>{{ audioFile ? audioFile.name : 'Choose ad audio (mp3, wav, m4a, ogg)' }}</span>
          <input type="file" accept="audio/*" hidden @change="onAudioSelected" />
        </label>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="ctaLabel" label="Call-to-action label" label-placement="stacked" placeholder="Shop Now" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="ctaUrl" type="url" label="Call-to-action URL" label-placement="stacked" placeholder="https://example.com" />
        </ion-item>

        <ion-item v-if="type === 'sponsored_playlist' || type === 'sponsored_artist'" class="form-item" lines="none">
          <ion-input
            v-model.number="sponsorableId"
            type="number"
            :label="type === 'sponsored_playlist' ? 'Playlist ID to sponsor' : 'Artist ID to sponsor'"
            label-placement="stacked"
          />
        </ion-item>

        <h3 class="app-heading section-heading">Targeting (optional)</h3>
        <p class="section-hint">Leave a field blank to match everyone on that dimension.</p>

        <ion-item class="form-item" lines="none">
          <ion-input v-model="countriesInput" label="Countries (comma separated)" label-placement="stacked" placeholder="Nigeria, Ghana" />
        </ion-item>
        <ion-item class="form-item" lines="none">
          <ion-input v-model="statesInput" label="States (comma separated)" label-placement="stacked" placeholder="Lagos, Accra" />
        </ion-item>
        <ion-item class="form-item" lines="none">
          <ion-input v-model="citiesInput" label="Cities (comma separated)" label-placement="stacked" />
        </ion-item>
        <ion-item class="form-item" lines="none">
          <ion-input v-model="deviceTypesInput" label="Device types (comma separated)" label-placement="stacked" placeholder="android, ios, web" />
        </ion-item>

        <ion-item class="form-item" lines="none">
          <ion-select v-model="genreIds" label="Genres" label-placement="stacked" interface="action-sheet" multiple>
            <ion-select-option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</ion-select-option>
          </ion-select>
        </ion-item>

        <div class="age-range">
          <ion-item class="form-item" lines="none">
            <ion-input v-model.number="ageMin" type="number" label="Min age" label-placement="stacked" />
          </ion-item>
          <ion-item class="form-item" lines="none">
            <ion-input v-model.number="ageMax" type="number" label="Max age" label-placement="stacked" />
          </ion-item>
        </div>

        <ion-item class="form-item" lines="none">
          <ion-input v-model.number="dailyImpressionCap" type="number" label="Daily impression cap (optional)" label-placement="stacked" />
        </ion-item>

        <div class="schedule-range">
          <ion-item class="form-item" lines="none">
            <ion-input v-model="startsAt" type="date" label="Starts" label-placement="stacked" />
          </ion-item>
          <ion-item class="form-item" lines="none">
            <ion-input v-model="endsAt" type="date" label="Ends" label-placement="stacked" />
          </ion-item>
        </div>

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting || !headline.trim()">
          {{ isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Campaign' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput,
  IonItem, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/vue';
import { cloudUploadOutline, imageOutline } from 'ionicons/icons';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { adsApi } from '@/services/ads';
import { creatorApi } from '@/services/creator';
import type { AdStatus, AdType } from '@/types/ads';
import type { Genre } from '@/types/catalog';

const route = useRoute();
const router = useRouter();

const campaignId = computed(() => (route.params.id ? Number(route.params.id) : null));
const isEditing = computed(() => campaignId.value !== null);

const type = ref<AdType>('banner');
const status = ref<AdStatus>('draft');
const headline = ref('');
const body = ref('');
const imageFile = ref<File | null>(null);
const audioFile = ref<File | null>(null);
const ctaLabel = ref('');
const ctaUrl = ref('');
const sponsorableId = ref<number | null>(null);

const countriesInput = ref('');
const statesInput = ref('');
const citiesInput = ref('');
const deviceTypesInput = ref('');
const genreIds = ref<number[]>([]);
const ageMin = ref<number | null>(null);
const ageMax = ref<number | null>(null);
const dailyImpressionCap = ref<number | null>(null);
const startsAt = ref('');
const endsAt = ref('');

const genres = ref<Genre[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref('');

function parseList(input: string): string[] {
  return input.split(',').map((s) => s.trim()).filter(Boolean);
}

function onImageSelected(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

function onAudioSelected(event: Event) {
  audioFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const targeting = {
      countries: parseList(countriesInput.value),
      states: parseList(statesInput.value),
      cities: parseList(citiesInput.value),
      device_types: parseList(deviceTypesInput.value),
      genre_ids: genreIds.value,
      age_min: ageMin.value,
      age_max: ageMax.value,
    };

    const payload = {
      headline: headline.value,
      body: body.value || undefined,
      cta_label: ctaLabel.value || undefined,
      cta_url: ctaUrl.value || undefined,
      targeting,
      daily_impression_cap: dailyImpressionCap.value,
      starts_at: startsAt.value || undefined,
      ends_at: endsAt.value || undefined,
      image: imageFile.value,
      audio: audioFile.value,
    };

    if (isEditing.value && campaignId.value) {
      await adsApi.updateCampaign(campaignId.value, { ...payload, status: status.value });
    } else {
      await adsApi.createCampaign({
        ...payload,
        type: type.value,
        sponsorable_type: type.value === 'sponsored_playlist' ? 'playlist' : type.value === 'sponsored_artist' ? 'artist' : undefined,
        sponsorable_id: sponsorableId.value ?? undefined,
      });
    }

    router.replace('/advertiser/campaigns');
  } catch (error: any) {
    const errors = error.response?.data?.errors;
    errorMessage.value = errors
      ? (Object.values(errors)[0] as string[])[0]
      : error.response?.data?.message ?? 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadForEdit(id: number) {
  const campaign = (await adsApi.campaigns()).find((c) => c.id === id);
  if (!campaign) return;

  type.value = campaign.type;
  status.value = campaign.status;
  headline.value = campaign.headline;
  body.value = campaign.body ?? '';
  ctaLabel.value = campaign.cta_label ?? '';
  ctaUrl.value = campaign.cta_url ?? '';
  dailyImpressionCap.value = campaign.daily_impression_cap;
  startsAt.value = campaign.starts_at?.slice(0, 10) ?? '';
  endsAt.value = campaign.ends_at?.slice(0, 10) ?? '';

  const targeting = campaign.targeting;
  countriesInput.value = targeting?.countries?.join(', ') ?? '';
  statesInput.value = targeting?.states?.join(', ') ?? '';
  citiesInput.value = targeting?.cities?.join(', ') ?? '';
  deviceTypesInput.value = targeting?.device_types?.join(', ') ?? '';
  genreIds.value = targeting?.genre_ids ?? [];
  ageMin.value = targeting?.age_min ?? null;
  ageMax.value = targeting?.age_max ?? null;
}

onMounted(async () => {
  genres.value = await creatorApi.genres();
  if (campaignId.value) {
    await loadForEdit(campaignId.value);
  }
});
</script>

<style scoped>
.form-content {
  padding: 16px;
}

.form-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: var(--app-radius-md);
  margin-bottom: 12px;
  border-radius: var(--app-radius-md);
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

.section-heading {
  margin: 20px 0 4px;
  font-size: 16px;
}

.section-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.age-range, .schedule-range {
  display: flex;
  gap: 12px;
}

.age-range .form-item, .schedule-range .form-item {
  flex: 1;
}

.form-error {
  color: var(--ion-color-danger);
  font-size: 13px;
}
</style>

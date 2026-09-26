<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab5" />
        </ion-buttons>
        <ion-title>Edit Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="edit-content">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="pickAvatar">
            <img v-if="auth.user?.avatar_url" :src="auth.user.avatar_url" class="avatar-image" alt="" />
            <ion-icon v-else :icon="personCircleOutline" class="avatar-placeholder" />
            <div class="avatar-edit-badge">
              <ion-icon :icon="camera" />
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <ion-item class="edit-item" lines="none">
            <ion-input v-model="name" label="Name" label-placement="stacked" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-input v-model="username" label="Username" label-placement="stacked" placeholder="e.g. gracefulsinger" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-textarea v-model="bio" label="Bio" label-placement="stacked" placeholder="Tell us about yourself" :auto-grow="true" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-input v-model="country" label="Country" label-placement="stacked" placeholder="e.g. Nigeria" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-input v-model="state" label="State" label-placement="stacked" placeholder="e.g. Lagos" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-input v-model="city" label="City" label-placement="stacked" />
          </ion-item>

          <ion-item class="edit-item" lines="none">
            <ion-input v-model="dateOfBirth" type="date" label="Date of Birth" label-placement="stacked" />
          </ion-item>

          <p class="edit-hint">
            Location and birth date are only used to show you more relevant sponsored content — never shared publicly.
          </p>

          <p v-if="errorMessage" class="edit-error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="edit-success">{{ successMessage }}</p>

          <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving…' : 'Save Changes' }}
          </ion-button>
        </form>

        <h3 class="app-heading section-heading">Notifications</h3>
        <ion-item class="edit-item" lines="none">
          <ion-toggle v-model="prefs.new_releases" @ion-change="savePrefs">New releases from followed artists</ion-toggle>
        </ion-item>
        <ion-item class="edit-item" lines="none">
          <ion-toggle v-model="prefs.followed_artist_uploads" @ion-change="savePrefs">Followed artist uploads</ion-toggle>
        </ion-item>
        <ion-item class="edit-item" lines="none">
          <ion-toggle v-model="prefs.comments_and_likes" @ion-change="savePrefs">Comments &amp; likes</ion-toggle>
        </ion-item>
        <ion-item class="edit-item" lines="none">
          <ion-toggle v-model="prefs.email_digest" @ion-change="savePrefs">Weekly email digest</ion-toggle>
        </ion-item>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonTextarea, IonTitle, IonToggle, IonToolbar } from '@ionic/vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { camera, personCircleOutline } from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { profileApi } from '@/services/profile';
import { DEMO_MODE } from '@/demo/demoData';

const auth = useAuthStore();

const name = ref(auth.user?.name ?? '');
const username = ref(auth.user?.username ?? '');
const bio = ref(auth.user?.bio ?? '');
const country = ref(auth.user?.country ?? '');
const state = ref(auth.user?.state ?? '');
const city = ref(auth.user?.city ?? '');
const dateOfBirth = ref(auth.user?.date_of_birth ?? '');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const prefs = reactive({
  new_releases: auth.user?.notification_preferences?.new_releases ?? true,
  followed_artist_uploads: auth.user?.notification_preferences?.followed_artist_uploads ?? true,
  comments_and_likes: auth.user?.notification_preferences?.comments_and_likes ?? true,
  email_digest: auth.user?.notification_preferences?.email_digest ?? false,
});

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  if (DEMO_MODE) {
    auth.setUser({
      ...auth.user!,
      name: name.value,
      username: username.value || null,
      bio: bio.value || null,
      country: country.value || null,
      state: state.value || null,
      city: city.value || null,
      date_of_birth: dateOfBirth.value || null,
    });
    successMessage.value = 'Profile updated.';
    isSubmitting.value = false;
    return;
  }

  try {
    const updated = await profileApi.update({
      name: name.value,
      username: username.value || null,
      bio: bio.value || null,
      country: country.value || null,
      state: state.value || null,
      city: city.value || null,
      date_of_birth: dateOfBirth.value || null,
    });
    auth.setUser(updated);
    successMessage.value = 'Profile updated.';
  } catch (error: any) {
    const errors = error.response?.data?.errors;
    errorMessage.value = errors
      ? (Object.values(errors)[0] as string[])[0]
      : error.response?.data?.message ?? 'Something went wrong.';
  } finally {
    isSubmitting.value = false;
  }
}

async function savePrefs() {
  if (DEMO_MODE) return;

  const updated = await profileApi.updateNotificationPreferences({ ...prefs });
  auth.setUser(updated);
}

async function pickAvatar() {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    quality: 80,
  });

  if (!photo.webPath) return;

  const blob = await (await fetch(photo.webPath)).blob();

  if (DEMO_MODE) {
    auth.setUser({ ...auth.user!, avatar_url: URL.createObjectURL(blob) });
    return;
  }

  const updated = await profileApi.uploadAvatar(blob);
  auth.setUser(updated);
}
</script>

<style scoped>
.edit-content {
  padding: 16px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  font-size: 96px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.avatar-edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.edit-item {
  --background: rgba(255, 255, 255, 0.04);
  --border-radius: var(--app-radius-md);
  margin-bottom: 12px;
  border-radius: var(--app-radius-md);
}

.edit-hint {
  margin: -4px 0 12px;
  font-size: 12px;
  color: var(--ion-color-step-850, #9a9a9a);
}

.edit-error {
  color: var(--ion-color-danger);
  font-size: 13px;
}

.edit-success {
  color: var(--ion-color-success);
  font-size: 13px;
}

.section-heading {
  margin: 24px 0 12px;
  font-size: 16px;
}
</style>

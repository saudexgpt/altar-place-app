<template>
  <AuthCard title="Set a new password">
    <form @submit.prevent="handleSubmit">
      <AuthInput v-model="password" :icon="lockClosedOutline" type="password" placeholder="New password" autocomplete="new-password" required />
      <AuthInput v-model="passwordConfirmation" :icon="lockClosedOutline" type="password" placeholder="Confirm password" autocomplete="new-password" required />

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting" class="auth-submit">
        {{ isSubmitting ? 'Saving…' : 'Reset password' }}
      </ion-button>
    </form>
  </AuthCard>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { lockClosedOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/services/api';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthInput from '@/components/auth/AuthInput.vue';

const password = ref('');
const passwordConfirmation = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const route = useRoute();
const router = useRouter();

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await api.post('/auth/reset-password', {
      token: route.query.token,
      email: route.query.email,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    router.replace('/login');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message ?? 'This reset link is invalid or has expired.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-error {
  color: var(--ion-color-danger);
  font-size: 13px;
  margin: 0 0 12px;
}

.auth-submit {
  --border-radius: var(--app-radius-full);
  height: 52px;
  font-weight: 600;
  text-transform: none;
}
</style>

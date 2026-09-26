<template>
  <AuthCard title="Reset your password" subtitle="We'll email you a reset link">
    <form v-if="!sent" @submit.prevent="handleSubmit">
      <AuthInput v-model="email" :icon="mailOutline" type="email" placeholder="Email" autocomplete="email" required />

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting" class="auth-submit">
        {{ isSubmitting ? 'Sending…' : 'Send reset link' }}
      </ion-button>
    </form>

    <div v-else class="auth-success">
      <p>Check your inbox for a link to reset your password.</p>
    </div>

    <p class="auth-footer">
      <router-link to="/login">Back to login</router-link>
    </p>
  </AuthCard>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { mailOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { api } from '@/services/api';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthInput from '@/components/auth/AuthInput.vue';

const email = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const sent = ref(false);

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await api.post('/auth/forgot-password', { email: email.value });
    sent.value = true;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message ?? 'Something went wrong. Please try again.';
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
  margin-bottom: 20px;
}

.auth-success {
  text-align: center;
  color: var(--ion-color-success);
  padding: 12px 0 24px;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
}

.auth-footer a {
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>

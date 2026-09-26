<template>
  <AuthCard title="Create Account 🎉" subtitle="Start streaming in seconds">
    <SocialLoginButtons />

    <div class="auth-divider">
      <span></span>
      <p>or</p>
      <span></span>
    </div>

    <form @submit.prevent="handleSubmit">
      <AuthInput v-model="name" :icon="personOutline" placeholder="Full Name" autocomplete="name" required />
      <AuthInput v-model="email" :icon="mailOutline" type="email" placeholder="Email or Username" autocomplete="email" required />
      <AuthInput v-model="password" :icon="lockClosedOutline" type="password" placeholder="Password" autocomplete="new-password" required />
      <AuthInput v-model="passwordConfirmation" :icon="lockClosedOutline" type="password" placeholder="Confirm Password" autocomplete="new-password" required />

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting" class="auth-submit">
        {{ isSubmitting ? 'Creating account…' : 'Create Account' }}
      </ion-button>
    </form>

    <p class="auth-footer">
      Already have an account?
      <router-link to="/login">Log in</router-link>
    </p>

    <p class="auth-legal">
      By continuing, you agree to our
      <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
    </p>
  </AuthCard>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { lockClosedOutline, mailOutline, personOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthInput from '@/components/auth/AuthInput.vue';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons.vue';
import { useAuthStore } from '@/stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const auth = useAuthStore();
const router = useRouter();

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    router.replace('/tabs/tab1');
  } catch (error: any) {
    const errors = error.response?.data?.errors;
    errorMessage.value = errors
      ? (Object.values(errors)[0] as string[])[0]
      : error.response?.data?.message ?? 'Something went wrong. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 20px;
  color: var(--ion-color-step-850, #7a7a7a);
  font-size: 13px;
}

.auth-divider span {
  flex: 1;
  height: 1px;
  background: var(--ion-border-color);
}

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

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: var(--ion-color-step-850, #9a9a9a);
  margin: 0 0 16px;
}

.auth-footer a {
  color: var(--ion-color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-legal {
  text-align: center;
  font-size: 12px;
  color: var(--ion-color-step-850, #6f6f6f);
  line-height: 1.6;
}

.auth-legal a {
  color: var(--ion-color-primary);
  text-decoration: none;
}
</style>

<template>
  <AuthCard title="Welcome Back 👋" subtitle="Sign in to continue listening" show-wave>
    <SocialLoginButtons />

    <div class="auth-divider">
      <span></span>
      <p>or</p>
      <span></span>
    </div>

    <form @submit.prevent="handleSubmit">
      <AuthInput v-model="email" :icon="mailOutline" type="email" placeholder="Email or Username" autocomplete="email" required />
      <AuthInput v-model="password" :icon="lockClosedOutline" type="password" placeholder="Password" autocomplete="current-password" required />

      <div class="auth-links">
        <router-link to="/forgot-password">Forgot Password?</router-link>
      </div>

      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

      <ion-button expand="block" shape="round" type="submit" :disabled="isSubmitting" class="auth-submit">
        {{ isSubmitting ? 'Logging in…' : 'Log In' }}
      </ion-button>
    </form>

    <p class="auth-footer">
      Don't have an account?
      <router-link to="/register">Sign Up</router-link>
    </p>

    <p class="auth-legal">
      By continuing, you agree to our
      <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
    </p>
  </AuthCard>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthCard from '@/components/auth/AuthCard.vue';
import AuthInput from '@/components/auth/AuthInput.vue';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons.vue';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    await auth.login({ email: email.value, password: password.value });
    const redirect = (route.query.redirect as string) || '/tabs/tab1';
    router.replace(redirect);
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.errors?.email?.[0] ??
      error.response?.data?.message ??
      'Something went wrong. Please try again.';
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

.auth-links {
  display: flex;
  justify-content: flex-end;
  margin: -2px 0 16px;
  font-size: 13px;
}

.auth-links a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 500;
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

<template>
  <div class="social-buttons">
    <button type="button" class="social-btn social-btn--google" :disabled="loadingProvider !== null" @click="handleClick('google')">
      <span class="social-btn-icon">
        <svg viewBox="0 0 48 48" width="18" height="18">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.6 5.6C41.8 36 44 30.9 44 24c0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
      </span>
      {{ loadingProvider === 'google' ? 'Redirecting…' : 'Continue with Google' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { toastController } from '@ionic/vue';
import { ref } from 'vue';
import { startSocialLogin, type SocialProvider } from '@/services/socialAuth';

const loadingProvider = ref<SocialProvider | null>(null);

async function handleClick(provider: SocialProvider) {
  loadingProvider.value = provider;

  try {
    await startSocialLogin(provider);
  } catch {
    const toast = await toastController.create({
      message: `Couldn't start ${provider} sign-in. Please try again.`,
      duration: 2500,
      color: 'danger',
    });
    await toast.present();
  } finally {
    loadingProvider.value = null;
  }
}
</script>

<style scoped>
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.social-btn {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 50px;
  border: none;
  border-radius: var(--app-radius-full);
  font-family: var(--app-font-body);
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: transform var(--app-transition-fast), opacity var(--app-transition-fast);
}

.social-btn:active {
  transform: scale(0.98);
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.social-btn--google {
  background: var(--app-color-google);
}

.social-btn-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

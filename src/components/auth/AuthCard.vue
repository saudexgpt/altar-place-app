<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <div class="auth-wrapper">
        <div class="auth-inner">
          <slot name="brand">
            <div class="auth-brand">
              <AppLogo size="lg" />
            </div>
          </slot>

          <h1 class="app-heading auth-title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>

          <slot />
        </div>
      </div>

      <div v-if="showWave" class="auth-wave" aria-hidden="true"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import AppLogo from '@/components/brand/AppLogo.vue';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    showWave?: boolean;
  }>(),
  { showWave: false }
);
</script>

<style scoped>
.auth-content {
  --background: radial-gradient(ellipse at top, #302103 0%, var(--ion-background-color) 55%);
}

.auth-wrapper {
  min-height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 64px;
}

.auth-inner {
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  text-align: center;
  animation: auth-in var(--app-transition-slow) ease-out;
}

.auth-inner :deep(*) {
  box-sizing: border-box;
}

@keyframes auth-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-brand {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.auth-title {
  margin: 0 0 6px;
  font-size: 24px;
}

.auth-subtitle {
  margin: 0 0 28px;
  color: var(--ion-color-step-850, #9a9a9a);
  font-size: 14px;
}

.auth-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(240, 176, 48, 0.55) 1px, transparent 1.5px);
  background-size: 14px 14px;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 55%, rgba(0, 0, 0, 0.5) 100%);
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 55%, rgba(0, 0, 0, 0.5) 100%);
  transform: perspective(200px) rotateX(35deg);
  opacity: 0.8;
}
</style>

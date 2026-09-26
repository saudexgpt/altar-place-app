<template>
  <div class="app-logo" :class="`app-logo--${size}`">
    <img :src="logoSrc" alt="AltarPlace" class="app-logo-mark" />
    <span v-if="withWordmark" class="app-logo-wordmark">
      <strong>ALTAR</strong><span class="app-logo-wordmark-accent">PLACE</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import logoSrc from '@/assets/branding/altar-place-logo.png';

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg';
    withWordmark?: boolean;
  }>(),
  { size: 'md', withWordmark: true }
);
</script>

<style scoped>
.app-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.app-logo-mark {
  display: block;
  width: auto;
  filter: drop-shadow(0 4px 16px rgba(240, 176, 48, 0.35));
}

.app-logo--sm .app-logo-mark {
  height: 32px;
}

.app-logo--md .app-logo-mark {
  height: 56px;
}

.app-logo--lg .app-logo-mark {
  height: 84px;
}

.app-logo-wordmark {
  font-family: var(--app-font-heading);
  font-weight: 600;
  letter-spacing: 2px;
  font-size: 20px;
  color: #fff;
  display: flex;
}

.app-logo-wordmark-accent {
  color: var(--ion-color-primary);
}
</style>

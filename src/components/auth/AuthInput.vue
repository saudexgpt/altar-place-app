<template>
  <ion-item class="auth-input" lines="none">
    <ion-icon :icon="icon" slot="start" class="auth-input-icon" />
    <ion-input
      :model-value="modelValue"
      :type="resolvedType"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      @ion-input="$emit('update:modelValue', $event.detail.value ?? '')"
    />
    <ion-icon
      v-if="type === 'password'"
      slot="end"
      class="auth-input-toggle"
      :icon="isRevealed ? eyeOffOutline : eyeOutline"
      @click="isRevealed = !isRevealed"
    />
  </ion-item>
</template>

<script setup lang="ts">
import { IonIcon, IonInput, IonItem } from '@ionic/vue';
import type { AutocompleteTypes } from '@ionic/core';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';

const props = defineProps<{
  modelValue: string;
  icon: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  autocomplete?: AutocompleteTypes;
  required?: boolean;
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();

const isRevealed = ref(false);
const resolvedType = computed(() => {
  if (props.type !== 'password') return props.type ?? 'text';
  return isRevealed.value ? 'text' : 'password';
});
</script>

<style scoped>
.auth-input {
  --background: var(--ion-item-background);
  --border-radius: var(--app-radius-full);
  --padding-start: 18px;
  --inner-padding-end: 18px;
  --min-height: 52px;
  border-radius: var(--app-radius-full);
  margin-bottom: 12px;
}

.auth-input-icon {
  color: var(--ion-color-step-850, #8a8a8a);
  margin-inline-end: 10px;
  font-size: 18px;
}

.auth-input-toggle {
  color: var(--ion-color-step-850, #8a8a8a);
  font-size: 18px;
  cursor: pointer;
}
</style>

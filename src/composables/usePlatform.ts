import { Capacitor } from '@capacitor/core';
import { computed } from 'vue';

/**
 * Central place to branch presentation (never business logic) between the
 * native app shell and the responsive web shell. Business logic must stay
 * in composables/stores shared by every surface.
 */
export function usePlatform() {
  const platform = computed(() => Capacitor.getPlatform());
  const isNative = computed(() => Capacitor.isNativePlatform());
  const isIOS = computed(() => platform.value === 'ios');
  const isAndroid = computed(() => platform.value === 'android');
  const isWeb = computed(() => platform.value === 'web');

  return { platform, isNative, isIOS, isAndroid, isWeb };
}

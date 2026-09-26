<template>
  <ion-app>
    <SideMenu />
    <ion-router-outlet id="main-content" />
  </ion-app>
</template>

<script setup lang="ts">
import type { URLOpenListenerEvent } from '@capacitor/app';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlatform } from '@/composables/usePlatform';
import { useLocalTracksStore } from '@/stores/localTracks';
import { usePlayerStore } from '@/stores/player';
import SideMenu from '@/components/nav/SideMenu.vue';

const { isNative } = usePlatform();
const router = useRouter();

/**
 * Handles the app being launched or resumed via Android's "Open With" for an
 * audio file (a content:// or file:// URI) — imports it into the on-device
 * Local Files library and starts playing it immediately. Other appUrlOpen
 * events (e.g. the OAuth deep-link callback, handled separately in
 * OAuthCallbackPage.vue) are ignored here.
 */
async function handleAppUrlOpen(event: URLOpenListenerEvent) {
  const url = event.url;
  if (!url.startsWith('content://') && !url.startsWith('file://')) return;

  try {
    const localTracks = useLocalTracksStore();
    await localTracks.initialize();
    const track = await localTracks.importFromUri(url);
    const playable = await localTracks.getPlayableTrack(track.id);

    if (playable) {
      usePlayerStore().playQueue([playable], 0);
      router.push('/now-playing');
    }
  } catch (error) {
    console.error('Failed to open shared audio file', error);
  }
}

onMounted(async () => {
  if (!isNative.value) {
    return;
  }

  const [{ SplashScreen }, { StatusBar, Style }, { App: CapacitorApp }] = await Promise.all([
    import('@capacitor/splash-screen'),
    import('@capacitor/status-bar'),
    import('@capacitor/app'),
  ]);

  await StatusBar.setStyle({ style: Style.Dark });
  await SplashScreen.hide();

  CapacitorApp.addListener('appUrlOpen', handleAppUrlOpen);
});
</script>

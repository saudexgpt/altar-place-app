<template>
  <ion-page>
    <ion-tabs class="app-tabs" :class="{ 'app-tabs--desktop': !isNative }">
      <ion-router-outlet></ion-router-outlet>

      <MiniPlayerBar class="app-mini-player" :class="{ 'app-mini-player--desktop': !isNative }" />

      <ion-tab-bar slot="bottom" class="app-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="searchOutline" />
          <ion-label>Search</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="libraryOutline" />
          <ion-label>Library</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon aria-hidden="true" :icon="downloadOutline" />
          <ion-label>Downloads</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab5" href="/tabs/tab5">
          <ion-icon aria-hidden="true" :icon="personOutline" />
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { downloadOutline, homeOutline, libraryOutline, personOutline, searchOutline } from 'ionicons/icons';
import { usePlatform } from '@/composables/usePlatform';
import MiniPlayerBar from '@/components/player/MiniPlayerBar.vue';

const { isNative } = usePlatform();
</script>

<style scoped>
/*
 * Same markup on every platform. On native app widths the tab bar renders as
 * Ionic's normal bottom bar (native feel). Above the desktop breakpoint it is
 * repositioned into a persistent left rail purely via CSS, per the "one
 * codebase, different feel" requirement.
 */
.app-mini-player {
  --app-tab-bar-offset: 56px;
}

.app-mini-player--desktop {
  --app-tab-bar-offset: 0px;
}

@media (min-width: 768px) {
  .app-tabs--desktop .app-tab-bar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    inset-inline-end: auto;
    width: var(--app-desktop-nav-width);
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 4px;
    padding: 24px 12px;
    border-inline-end: 1px solid var(--ion-border-color);
    border-top: none;
  }

  .app-tabs--desktop .app-tab-bar ion-tab-button {
    flex: none;
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    height: 48px;
    border-radius: var(--app-radius-md);
  }

  .app-tabs--desktop ion-router-outlet {
    margin-inline-start: var(--app-desktop-nav-width);
  }

  .app-mini-player--desktop {
    margin-inline-start: var(--app-desktop-nav-width);
  }
}
</style>

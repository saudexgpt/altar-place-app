import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saudexgpt.altarplace',
  appName: 'Altar Place',
  webDir: 'dist',
  // No `server` override: Capacitor's defaults (https scheme, cleartext
  // off) are what production needs, since the real API is HTTPS. The
  // previous http/cleartext override was a local-dev workaround for testing
  // against a LAN IP with no TLS cert — shipping it to the Play Store would
  // mean the app accepts plaintext HTTP to any domain.
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#001040',
    },
    Keyboard: {
      resize: 'body',
    },
  },
};

export default config;

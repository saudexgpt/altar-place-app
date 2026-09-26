import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saudexgpt.altarplace',
  appName: 'Altar Place',
  webDir: 'dist',
  server: {
    androidScheme: 'http', // 👈 Change this from 'https' to 'http'
    cleartext: true        // 👈 Ensure cleartext traffic is enabled
  },
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

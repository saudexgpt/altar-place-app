import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { api } from './api';

export type SocialProvider = 'google' | 'facebook';

/**
 * Kicks off the OAuth flow: fetches the provider's consent URL from the
 * backend (which remembers where to send the user back to via a signed
 * `redirect_uri`), then opens it in the system browser on native platforms
 * or navigates the current tab on web. The backend's callback route
 * eventually redirects to `${VITE_APP_URL}/oauth-callback?token=...`, which
 * OAuthCallbackPage.vue picks up.
 */
export async function startSocialLogin(provider: SocialProvider): Promise<void> {
  const redirectUri = `${import.meta.env.VITE_APP_URL}/oauth-callback`;

  const { data } = await api.get(`/auth/social/${provider}/redirect`, {
    params: { redirect_uri: redirectUri },
  });

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: data.url, presentationStyle: 'popover' });
  } else {
    window.location.href = data.url;
  }
}

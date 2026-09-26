import { Preferences } from '@capacitor/preferences';

/**
 * Thin wrapper around Capacitor Preferences (native secure-ish key/value
 * storage on iOS/Android, localStorage under the hood on web) so the rest
 * of the app doesn't need to know which platform it's running on.
 */
export const storage = {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  },
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};

export const STORAGE_KEYS = {
  authToken: 'auth_token',
} as const;

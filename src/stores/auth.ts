import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, UNAUTHORIZED_EVENT } from '@/services/api';
import { STORAGE_KEYS, storage } from '@/services/storage';
import { Device } from '@capacitor/device';
import { DEMO_MODE, demoToken, demoUser } from '@/demo/demoData';

export interface AuthUser {
  id: number;
  name: string;
  username: string | null;
  bio: string | null;
  email: string;
  avatar_url: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  date_of_birth: string | null;
  status: string;
  email_verified: boolean;
  roles: string[];
  notification_preferences: Record<string, boolean>;
  created_at: string;
}

async function currentDeviceName(): Promise<string> {
  try {
    const info = await Device.getInfo();
    return `${info.manufacturer ?? ''} ${info.model ?? info.platform}`.trim();
  } catch {
    return navigator.userAgent.slice(0, 60) || 'web-browser';
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(null);
  const isInitializing = ref(true);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isEmailVerified = computed(() => Boolean(user.value?.email_verified));

  function hasRole(role: string): boolean {
    return user.value?.roles.includes(role) ?? false;
  }

  async function persistToken(value: string | null) {
    token.value = value;

    if (value) {
      await storage.set(STORAGE_KEYS.authToken, value);
    } else {
      await storage.remove(STORAGE_KEYS.authToken);
    }
  }

  async function register(payload: { name: string; email: string; password: string; password_confirmation: string }) {
    const device_name = await currentDeviceName();
    const { data } = await api.post('/auth/register', { ...payload, device_name });

    user.value = data.user;
    await persistToken(data.token);
  }

  async function login(payload: { email: string; password: string }) {
    const device_name = await currentDeviceName();
    const { data } = await api.post('/auth/login', { ...payload, device_name });

    user.value = data.user;
    await persistToken(data.token);
  }

  /** Called after a social-login redirect hands back a Sanctum token. */
  async function loginWithToken(value: string) {
    await persistToken(value);
    await fetchCurrentUser();
  }

  async function fetchCurrentUser() {
    // AuthController::me() returns a UserResource as the top-level response,
    // which Laravel auto-wraps in a `data` envelope (unlike register/login,
    // which embed the resource inside a plain array and stay flat).
    const { data } = await api.get('/auth/me');
    user.value = data.data;
  }

  /** Lets other stores (e.g. the profile store) sync back the shared user object after an update. */
  function setUser(updated: AuthUser) {
    user.value = updated;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      user.value = null;
      await persistToken(null);
    }
  }

  /** Clears local session without calling the API (e.g. on a 401). */
  async function forceLogout() {
    user.value = null;
    await persistToken(null);
  }

  async function initialize() {
    isInitializing.value = true;

    if (DEMO_MODE) {
      user.value = demoUser;
      token.value = demoToken;
      isInitializing.value = false;
      return;
    }

    try {
      const storedToken = await storage.get(STORAGE_KEYS.authToken);

      if (storedToken) {
        token.value = storedToken;
        await fetchCurrentUser();
      }
    } catch {
      await forceLogout();
    } finally {
      isInitializing.value = false;
    }
  }

  window.addEventListener(UNAUTHORIZED_EVENT, () => {
    void forceLogout();
  });

  return {
    user,
    token,
    isInitializing,
    isAuthenticated,
    isEmailVerified,
    hasRole,
    register,
    login,
    loginWithToken,
    fetchCurrentUser,
    setUser,
    logout,
    forceLogout,
    initialize,
  };
});

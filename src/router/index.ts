import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import { useAuthStore } from '@/stores/auth';
import { DEMO_MODE } from '@/demo/demoData';

/** Only these routes work fully offline; everything else needs the backend. */
const DEMO_MODE_ALLOWED_PATHS = [
  '/',
  '/tabs/tab1',
  '/tabs/tab2',
  '/tabs/tab3',
  '/tabs/tab4',
  '/tabs/tab5',
  '/now-playing',
  '/subscription',
  '/profile/edit',
  '/profile/following',
  '/creator/apply',
  '/advertiser/apply',
];

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/forgot-password',
    component: () => import('@/views/auth/ForgotPasswordPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/reset-password',
    component: () => import('@/views/auth/ResetPasswordPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/oauth-callback',
    component: () => import('@/views/auth/OAuthCallbackPage.vue'),
  },
  {
    path: '/verify-email',
    component: () => import('@/views/auth/VerifyEmailPage.vue'),
  },
  {
    path: '/now-playing',
    component: () => import('@/views/NowPlayingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tracks/:id/comments',
    component: () => import('@/views/CommentsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/activity',
    component: () => import('@/views/ActivityPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    component: () => import('@/views/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/artists/:id',
    component: () => import('@/views/ArtistPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/albums/:id',
    component: () => import('@/views/AlbumPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/playlists/:id',
    component: () => import('@/views/PlaylistPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/edit',
    component: () => import('@/views/ProfileEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/following',
    component: () => import('@/views/FollowingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/apply',
    component: () => import('@/views/creator/CreatorApplyPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/dashboard',
    component: () => import('@/views/creator/CreatorDashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/tracks',
    component: () => import('@/views/creator/CreatorTracksPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/tracks/upload',
    component: () => import('@/views/creator/CreatorUploadTrackPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/tracks/:id/edit',
    component: () => import('@/views/creator/CreatorTrackEditPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/albums',
    component: () => import('@/views/creator/CreatorAlbumsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/creator/analytics',
    component: () => import('@/views/creator/CreatorAnalyticsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/advertiser/apply',
    component: () => import('@/views/advertiser/AdvertiserApplyPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/advertiser/dashboard',
    component: () => import('@/views/advertiser/AdvertiserDashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/advertiser/campaigns',
    component: () => import('@/views/advertiser/AdvertiserCampaignsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/advertiser/campaigns/new',
    component: () => import('@/views/advertiser/AdvertiserCampaignFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/advertiser/campaigns/:id/edit',
    component: () => import('@/views/advertiser/AdvertiserCampaignFormPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/dashboard',
    component: () => import('@/views/admin/AdminDashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    component: () => import('@/views/admin/AdminUsersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/moderation',
    component: () => import('@/views/admin/AdminModerationPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/analytics',
    component: () => import('@/views/admin/AdminAnalyticsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription',
    component: () => import('@/views/subscription/SubscriptionManagePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription/plans',
    component: () => import('@/views/subscription/PricingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/subscription/callback',
    component: () => import('@/views/subscription/SubscriptionCallbackPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        path: 'tab4',
        component: () => import('@/views/Tab4Page.vue')
      },
      {
        path: 'tab5',
        component: () => import('@/views/Tab5Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.isInitializing) {
    await auth.initialize();
  }

  if (DEMO_MODE) {
    return DEMO_MODE_ALLOWED_PATHS.includes(to.path) ? true : { path: '/tabs/tab1' };
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: '/tabs/tab1' };
  }

  return true;
})

export default router

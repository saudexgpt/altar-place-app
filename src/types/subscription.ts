export type BillingInterval = 'none' | 'month' | 'year';
export type PaymentProvider = 'paystack' | 'flutterwave' | 'bank_transfer';

export interface PlanFeatures {
  ad_free: boolean;
  max_audio_quality: 'standard' | 'high';
  download_limit: number | null;
  offline_playback: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_interval: BillingInterval;
  max_family_members: number | null;
  features: PlanFeatures;
}

export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'expired';

export interface Subscription {
  id: number;
  status: SubscriptionStatus;
  starts_at: string | null;
  ends_at: string | null;
  canceled_at: string | null;
  payment_provider: PaymentProvider | null;
  is_active: boolean;
  plan: SubscriptionPlan;
}

export interface SubscriptionStatusResponse {
  plan: SubscriptionPlan;
  subscription: Subscription | null;
  is_premium: boolean;
}

export interface DownloadQuota {
  limit: number | null;
  used: number;
  remaining: number | null;
  unlimited: boolean;
}

export interface FamilyMember {
  id: number;
  invited_email: string;
  status: 'pending' | 'active' | 'removed';
  user: { id: number; name: string; email: string; avatar_url: string | null } | null;
}

import { api } from './api';
import type {
  DownloadQuota,
  FamilyMember,
  PaymentProvider,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatusResponse,
} from '@/types/subscription';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const subscriptionApi = {
  async plans(): Promise<SubscriptionPlan[]> {
    return unwrap((await api.get('/subscription-plans')).data);
  },

  async status(): Promise<SubscriptionStatusResponse> {
    const { data } = await api.get('/subscription');
    return data;
  },

  async checkout(planId: number, provider: PaymentProvider): Promise<{ authorization_url: string; reference: string }> {
    const { data } = await api.post('/subscription/checkout', { plan_id: planId, provider });
    return data;
  },

  async verify(reference: string): Promise<{ subscription: Subscription }> {
    const { data } = await api.post('/subscription/verify', { reference });
    return data;
  },

  async cancel(): Promise<{ message: string; subscription: Subscription }> {
    const { data } = await api.post('/subscription/cancel');
    return data;
  },

  async downloadQuota(): Promise<DownloadQuota> {
    const { data } = await api.get('/library/download-quota');
    return data;
  },

  async familyMembers(): Promise<{ members: FamilyMember[]; max_family_members: number | null }> {
    const { data } = await api.get('/subscription/family-members');
    return data;
  },

  async inviteFamilyMember(email: string): Promise<FamilyMember> {
    const { data } = await api.post('/subscription/family-members', { email });
    return data.member;
  },

  async removeFamilyMember(id: number): Promise<void> {
    await api.delete(`/subscription/family-members/${id}`);
  },
};

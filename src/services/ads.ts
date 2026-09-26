import { api } from './api';
import type { AdType, Advertisement, AdvertiserDashboard, CampaignPayload, ServedAd } from '@/types/ads';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

function buildCampaignFormData(payload: CampaignPayload): FormData {
  const form = new FormData();

  if (payload.type) form.append('type', payload.type);
  if (payload.status) form.append('status', payload.status);
  if (payload.headline !== undefined) form.append('headline', payload.headline);
  if (payload.body) form.append('body', payload.body);
  if (payload.cta_label) form.append('cta_label', payload.cta_label);
  if (payload.cta_url) form.append('cta_url', payload.cta_url);
  if (payload.sponsorable_type) form.append('sponsorable_type', payload.sponsorable_type);
  if (payload.sponsorable_id) form.append('sponsorable_id', String(payload.sponsorable_id));
  if (payload.daily_impression_cap) form.append('daily_impression_cap', String(payload.daily_impression_cap));
  if (payload.starts_at) form.append('starts_at', payload.starts_at);
  if (payload.ends_at) form.append('ends_at', payload.ends_at);
  if (payload.image) form.append('image', payload.image);
  if (payload.audio) form.append('audio', payload.audio);

  if (payload.targeting) {
    for (const [key, value] of Object.entries(payload.targeting)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        value.forEach((item) => form.append(`targeting[${key}][]`, String(item)));
      } else {
        form.append(`targeting[${key}]`, String(value));
      }
    }
  }

  return form;
}

export const adsApi = {
  async serve(placement: AdType, deviceType?: string): Promise<ServedAd | null> {
    const { data } = await api.get('/ads/serve', { params: { placement, device_type: deviceType } });
    return data.ad;
  },

  async logImpression(adId: number): Promise<void> {
    await api.post(`/ads/${adId}/impression`);
  },

  async logClick(adId: number): Promise<void> {
    await api.post(`/ads/${adId}/click`);
  },

  async apply(payload: { company_name: string; website?: string }): Promise<AdvertiserDashboard['advertiser']> {
    const { data } = await api.post('/advertiser/apply', payload);
    return data.advertiser;
  },

  async dashboard(): Promise<AdvertiserDashboard> {
    const { data } = await api.get('/advertiser/dashboard');
    return data;
  },

  async campaigns(): Promise<Advertisement[]> {
    return unwrap((await api.get('/advertiser/campaigns')).data);
  },

  async createCampaign(payload: CampaignPayload): Promise<Advertisement> {
    const { data } = await api.post('/advertiser/campaigns', buildCampaignFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.advertisement;
  },

  async updateCampaign(id: number, payload: CampaignPayload): Promise<Advertisement> {
    const form = buildCampaignFormData(payload);
    form.append('_method', 'PUT');

    const { data } = await api.post(`/advertiser/campaigns/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.advertisement;
  },

  async deleteCampaign(id: number): Promise<void> {
    await api.delete(`/advertiser/campaigns/${id}`);
  },
};

import { api } from './api';
import type { AdminAnalyticsOverview, AdminReport, AdminTrack, AdminUser } from '@/types/admin';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const adminApi = {
  async users(params: { q?: string; status?: string; role?: string } = {}): Promise<AdminUser[]> {
    return unwrap((await api.get('/admin/users', { params })).data);
  },

  async suspendUser(id: number, reason?: string): Promise<AdminUser> {
    const { data } = await api.post(`/admin/users/${id}/suspend`, { reason });
    return data.user;
  },

  async banUser(id: number, reason?: string): Promise<AdminUser> {
    const { data } = await api.post(`/admin/users/${id}/ban`, { reason });
    return data.user;
  },

  async reactivateUser(id: number): Promise<AdminUser> {
    const { data } = await api.post(`/admin/users/${id}/reactivate`);
    return data.user;
  },

  async verifyUser(id: number): Promise<AdminUser> {
    const { data } = await api.post(`/admin/users/${id}/verify`);
    return data.user;
  },

  async tracks(params: { status?: string; q?: string } = {}): Promise<AdminTrack[]> {
    return unwrap((await api.get('/admin/tracks', { params })).data);
  },

  async approveTrack(id: number): Promise<AdminTrack> {
    const { data } = await api.post(`/admin/tracks/${id}/approve`);
    return data.track;
  },

  async rejectTrack(id: number, reason: string): Promise<AdminTrack> {
    const { data } = await api.post(`/admin/tracks/${id}/reject`, { reason });
    return data.track;
  },

  async reports(params: { status?: string } = {}): Promise<AdminReport[]> {
    return unwrap((await api.get('/admin/reports', { params })).data);
  },

  async resolveReport(id: number, action: 'dismiss' | 'action', note?: string): Promise<AdminReport> {
    const { data } = await api.post(`/admin/reports/${id}/resolve`, { action, note });
    return data.report;
  },

  async analyticsOverview(): Promise<AdminAnalyticsOverview> {
    const { data } = await api.get('/admin/analytics/overview');
    return data;
  },
};

import { api } from './api';
import type { Activity } from '@/types/community';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const activityApi = {
  async list(): Promise<Activity[]> {
    return unwrap((await api.get('/activity')).data);
  },
};

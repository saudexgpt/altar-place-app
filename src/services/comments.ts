import { api } from './api';
import type { Comment } from '@/types/community';

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export const commentsApi = {
  async list(trackId: number): Promise<Comment[]> {
    return unwrap((await api.get(`/tracks/${trackId}/comments`)).data);
  },
  async create(trackId: number, body: string): Promise<Comment> {
    return unwrap((await api.post(`/tracks/${trackId}/comments`, { body })).data);
  },
  async destroy(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },
};

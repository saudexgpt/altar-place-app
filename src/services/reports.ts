import { api } from './api';

export type ReportableType = 'track' | 'comment';
export type ReportReason = 'spam' | 'abuse' | 'copyright' | 'inappropriate' | 'other';

export const reportsApi = {
  async report(reportableType: ReportableType, reportableId: number, reason: ReportReason, details?: string): Promise<void> {
    await api.post('/reports', {
      reportable_type: reportableType,
      reportable_id: reportableId,
      reason,
      details,
    });
  },
};

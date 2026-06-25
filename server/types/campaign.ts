/**
 * Email Campaign Types
 */

export interface EmailRecipient {
  email: string;
  name: string;
  variables?: Record<string, string>;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface EmailCampaign {
  id: string;
  accountId: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromEmail: string;
  fromName: string;
  recipients: EmailRecipient[];
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  sendAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}

export interface EmailQueueItem {
  id: string;
  campaignId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  status: "pending" | "sent" | "failed";
  attemptCount: number;
  lastAttemptAt?: string;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

export interface QueueStatus {
  totalQueued: number;
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    stats: CampaignStats;
  }>;
}

export interface CampaignStatsResponse {
  campaignId: string;
  campaignName: string;
  status: string;
  stats: CampaignStats;
  detailedStats: {
    sent: number;
    failed: number;
    pending: number;
  };
  recentQueued: Array<{
    id: string;
    email: string;
    status: string;
    sentAt?: string;
    error?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Campaign API Client
 * Frontend integration for email campaigns
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

export interface CreateCampaignData {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromEmail: string;
  fromName?: string;
  recipients: EmailRecipient[];
  sendAt?: string;
}

export interface UpdateCampaignData {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  fromEmail?: string;
  fromName?: string;
  recipients?: EmailRecipient[];
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

class CampaignClient {
  private baseUrl = "/api/campaigns";

  /**
   * Create a new email campaign
   */
  async createCampaign(data: CreateCampaignData): Promise<{ success: boolean; campaignId: string; campaign: EmailCampaign }> {
    const response = await fetch(`${this.baseUrl}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create campaign");
    }

    return response.json();
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: EmailCampaign[]; total: number; offset: number; limit: number }> {
    const params = new URLSearchParams();

    if (options?.status) {
      params.append("status", options.status);
    }
    if (options?.limit) {
      params.append("limit", options.limit.toString());
    }
    if (options?.offset) {
      params.append("offset", options.offset.toString());
    }

    const response = await fetch(`${this.baseUrl}/email?${params}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch campaigns");
    }

    return response.json();
  }

  /**
   * Get a specific campaign
   */
  async getCampaign(id: string): Promise<{ campaign: EmailCampaign }> {
    const response = await fetch(`${this.baseUrl}/email/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch campaign");
    }

    return response.json();
  }

  /**
   * Update a campaign
   */
  async updateCampaign(id: string, data: UpdateCampaignData): Promise<{ success: boolean; campaign: EmailCampaign }> {
    const response = await fetch(`${this.baseUrl}/email/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update campaign");
    }

    return response.json();
  }

  /**
   * Send a campaign
   */
  async sendCampaign(id: string, options?: { immediate?: boolean }): Promise<{
    success: boolean;
    message: string;
    campaign: EmailCampaign;
    queuedEmails: number;
  }> {
    const response = await fetch(`${this.baseUrl}/email/${id}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        immediate: options?.immediate ?? true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send campaign");
    }

    return response.json();
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(id: string): Promise<{ stats: CampaignStatsResponse }> {
    const response = await fetch(`${this.baseUrl}/email/${id}/stats`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch campaign stats");
    }

    return response.json();
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(id: string): Promise<{ success: boolean; message: string; campaign: EmailCampaign }> {
    const response = await fetch(`${this.baseUrl}/email/${id}/pause`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to pause campaign");
    }

    return response.json();
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/email/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete campaign");
    }

    return response.json();
  }

  /**
   * Get queue status (admin only)
   */
  async getQueueStatus(): Promise<{ status: QueueStatus }> {
    const response = await fetch(`${this.baseUrl}/queue/status`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch queue status");
    }

    return response.json();
  }

  /**
   * Monitor campaign in real-time
   */
  monitorCampaign(id: string, callback: (stats: CampaignStatsResponse) => void, interval = 5000): () => void {
    const pollInterval = setInterval(async () => {
      try {
        const { stats } = await this.getCampaignStats(id);
        callback(stats);
      } catch (error) {
        console.error("Error monitoring campaign:", error);
      }
    }, interval);

    // Return function to stop monitoring
    return () => clearInterval(pollInterval);
  }

  /**
   * Wait for campaign completion
   */
  async waitForCompletion(id: string, maxWaitMs = 3600000): Promise<CampaignStatsResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const { stats } = await this.getCampaignStats(id);

      if (stats.stats.pending === 0) {
        return stats;
      }

      // Wait 5 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error("Campaign completion timeout");
  }
}

export const campaignClient = new CampaignClient();
export default campaignClient;

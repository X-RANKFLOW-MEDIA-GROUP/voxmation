/**
 * Email Campaign API Examples
 * This file shows how to use the email campaign endpoints
 */

// Example 1: Create an Email Campaign
const createCampaignExample = {
  endpoint: "POST /api/campaigns/email",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN",
  },
  body: {
    name: "Q1 Product Launch",
    subject: "Introducing Our New Product - {{productName}}",
    htmlBody: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .cta { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{{productName}} Launch</h1>
            </div>
            <div class="content">
              <p>Hi {{recipientName}},</p>
              <p>We're excited to announce the launch of {{productName}}!</p>
              <p>This innovative solution is designed to solve {{painPoint}} and help you achieve {{benefit}}.</p>
              <p><a href="https://example.com/learn-more?ref={{email}}" class="cta">Learn More</a></p>
              <p>Best regards,<br>The Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textBody: `
Hi {{recipientName}},

We're excited to announce the launch of {{productName}}!

This innovative solution is designed to solve {{painPoint}} and help you achieve {{benefit}}.

Learn more: https://example.com/learn-more?ref={{email}}

Best regards,
The Team
    `,
    fromEmail: "campaigns@voxmation.com",
    fromName: "Voxmation Team",
    recipients: [
      {
        email: "john@example.com",
        name: "John Doe",
        variables: {
          recipientName: "John",
          productName: "ProductX",
          painPoint: "inefficiency",
          benefit: "increased productivity",
        },
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        variables: {
          recipientName: "Jane",
          productName: "ProductX",
          painPoint: "complexity",
          benefit: "streamlined workflows",
        },
      },
    ],
  },
};

// Example 2: Get All Campaigns
const getCampaignsExample = {
  endpoint: "GET /api/campaigns/email",
  queryParams: {
    status: "draft", // optional: filter by status
    limit: 50,
    offset: 0,
  },
  response: {
    data: [
      {
        id: "campaign-123",
        accountId: "account-456",
        name: "Q1 Product Launch",
        subject: "Introducing Our New Product",
        status: "draft",
        createdAt: "2024-01-15T10:30:00Z",
        stats: {
          total: 100,
          sent: 0,
          failed: 0,
          pending: 100,
        },
      },
    ],
    total: 1,
    offset: 0,
    limit: 50,
  },
};

// Example 3: Get Specific Campaign
const getCampaignExample = {
  endpoint: "GET /api/campaigns/email/:id",
  response: {
    campaign: {
      id: "campaign-123",
      accountId: "account-456",
      name: "Q1 Product Launch",
      subject: "Introducing Our New Product - {{productName}}",
      htmlBody: "...",
      textBody: "...",
      fromEmail: "campaigns@voxmation.com",
      fromName: "Voxmation Team",
      recipients: [
        {
          email: "john@example.com",
          name: "John Doe",
          variables: {},
        },
      ],
      status: "draft",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      stats: {
        total: 100,
        sent: 0,
        failed: 0,
        pending: 100,
      },
    },
  },
};

// Example 4: Update Campaign
const updateCampaignExample = {
  endpoint: "PUT /api/campaigns/email/:id",
  body: {
    name: "Updated Campaign Name",
    subject: "New Subject Line",
    htmlBody: "Updated HTML content",
    recipients: [
      {
        email: "new@example.com",
        name: "New User",
        variables: {},
      },
    ],
  },
  response: {
    success: true,
    campaign: {
      id: "campaign-123",
      name: "Updated Campaign Name",
      subject: "New Subject Line",
      status: "draft",
      stats: {
        total: 1,
        sent: 0,
        failed: 0,
        pending: 1,
      },
    },
  },
};

// Example 5: Send Campaign (Enqueue for Processing)
const sendCampaignExample = {
  endpoint: "POST /api/campaigns/email/:id/send",
  body: {
    immediate: true, // optional, default is true
  },
  response: {
    success: true,
    message: "Campaign sent",
    campaign: {
      id: "campaign-123",
      status: "sending",
      stats: {
        total: 100,
        sent: 0,
        failed: 0,
        pending: 100,
      },
    },
    queuedEmails: 100,
  },
};

// Example 6: Get Campaign Statistics
const getCampaignStatsExample = {
  endpoint: "GET /api/campaigns/email/:id/stats",
  response: {
    stats: {
      campaignId: "campaign-123",
      campaignName: "Q1 Product Launch",
      status: "sending",
      stats: {
        total: 100,
        sent: 45,
        failed: 5,
        pending: 50,
      },
      detailedStats: {
        sent: 45,
        failed: 5,
        pending: 50,
      },
      recentQueued: [
        {
          id: "queue-item-1",
          email: "user@example.com",
          status: "sent",
          sentAt: "2024-01-15T10:35:00Z",
        },
      ],
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:40:00Z",
    },
  },
};

// Example 7: Pause Campaign
const pauseCampaignExample = {
  endpoint: "POST /api/campaigns/email/:id/pause",
  response: {
    success: true,
    message: "Campaign paused",
    campaign: {
      id: "campaign-123",
      status: "paused",
      stats: {
        total: 100,
        sent: 45,
        failed: 5,
        pending: 50,
      },
    },
  },
};

// Example 8: Delete Campaign
const deleteCampaignExample = {
  endpoint: "DELETE /api/campaigns/email/:id",
  response: {
    success: true,
    message: "Campaign deleted",
  },
};

// Example 9: Get Queue Status
const getQueueStatusExample = {
  endpoint: "GET /api/campaigns/queue/status",
  response: {
    status: {
      totalQueued: 250,
      totalSent: 180,
      totalFailed: 20,
      totalPending: 50,
      campaigns: [
        {
          id: "campaign-123",
          name: "Q1 Product Launch",
          status: "sending",
          stats: {
            total: 100,
            sent: 45,
            failed: 5,
            pending: 50,
          },
        },
      ],
    },
  },
};

/**
 * Integration with Frontend
 */
export const campaignApiClient = {
  // Create campaign
  async createCampaign(data: any) {
    const response = await fetch("/api/campaigns/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Get all campaigns
  async getCampaigns(status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const response = await fetch(`/api/campaigns/email?${params}`, {
      method: "GET",
    });
    return response.json();
  },

  // Get specific campaign
  async getCampaign(id: string) {
    const response = await fetch(`/api/campaigns/email/${id}`, {
      method: "GET",
    });
    return response.json();
  },

  // Update campaign
  async updateCampaign(id: string, data: any) {
    const response = await fetch(`/api/campaigns/email/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Send campaign
  async sendCampaign(id: string, immediate = true) {
    const response = await fetch(`/api/campaigns/email/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ immediate }),
    });
    return response.json();
  },

  // Get campaign stats
  async getCampaignStats(id: string) {
    const response = await fetch(`/api/campaigns/email/${id}/stats`, {
      method: "GET",
    });
    return response.json();
  },

  // Pause campaign
  async pauseCampaign(id: string) {
    const response = await fetch(`/api/campaigns/email/${id}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return response.json();
  },

  // Delete campaign
  async deleteCampaign(id: string) {
    const response = await fetch(`/api/campaigns/email/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Get queue status
  async getQueueStatus() {
    const response = await fetch("/api/campaigns/queue/status", {
      method: "GET",
    });
    return response.json();
  },
};

export default {
  createCampaignExample,
  getCampaignsExample,
  getCampaignExample,
  updateCampaignExample,
  sendCampaignExample,
  getCampaignStatsExample,
  pauseCampaignExample,
  deleteCampaignExample,
  getQueueStatusExample,
  campaignApiClient,
};

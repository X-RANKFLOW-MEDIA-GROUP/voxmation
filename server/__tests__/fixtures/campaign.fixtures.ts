/**
 * Campaign Test Fixtures
 * Provides mock campaign data for testing campaign management APIs
 */

export const mockCampaigns = {
  active: {
    id: 'campaign-001',
    name: 'Summer Sale 2024',
    description: 'Special summer promotional campaign',
    status: 'active',
    start_date: new Date('2024-06-01'),
    end_date: new Date('2024-08-31'),
    budget: 5000,
    spent: 1500,
    created_by: 'user-regular-001',
    created_at: new Date('2024-05-15'),
    updated_at: new Date('2024-06-10')
  },
  draft: {
    id: 'campaign-002',
    name: 'Winter Campaign 2024',
    description: 'Holiday season campaign',
    status: 'draft',
    start_date: new Date('2024-11-01'),
    end_date: new Date('2025-01-31'),
    budget: 8000,
    spent: 0,
    created_by: 'user-regular-001',
    created_at: new Date('2024-08-01'),
    updated_at: new Date('2024-08-01')
  },
  completed: {
    id: 'campaign-003',
    name: 'Spring Campaign 2024',
    description: 'Spring promotions',
    status: 'completed',
    start_date: new Date('2024-03-01'),
    end_date: new Date('2024-05-31'),
    budget: 3000,
    spent: 2900,
    created_by: 'user-regular-001',
    created_at: new Date('2024-02-15'),
    updated_at: new Date('2024-05-31')
  }
};

export const mockCampaignPayloads = {
  valid: {
    name: 'New Campaign',
    description: 'Campaign description',
    start_date: '2024-07-01',
    end_date: '2024-07-31',
    budget: 5000
  },
  missingName: {
    description: 'Campaign without name',
    start_date: '2024-07-01',
    end_date: '2024-07-31',
    budget: 5000
  },
  invalidBudget: {
    name: 'Campaign',
    description: 'Description',
    start_date: '2024-07-01',
    end_date: '2024-07-31',
    budget: -1000
  },
  invalidDates: {
    name: 'Campaign',
    description: 'Description',
    start_date: '2024-07-31',
    end_date: '2024-07-01',
    budget: 5000
  }
};

export const mockCampaignStats = {
  campaignId: 'campaign-001',
  impressions: 10000,
  clicks: 500,
  conversions: 50,
  revenue: 1500,
  ctr: 5.0,
  cpc: 3.0,
  roi: 30.0
};

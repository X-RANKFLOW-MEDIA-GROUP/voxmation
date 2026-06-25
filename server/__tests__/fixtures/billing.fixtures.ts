/**
 * Billing Test Fixtures
 * Provides mock billing and subscription data for testing billing APIs
 */

export const mockSubscriptions = {
  active: {
    id: 'sub-001',
    user_id: 'user-regular-001',
    plan: 'premium',
    status: 'active',
    billing_cycle: 'monthly',
    amount: 99.99,
    currency: 'USD',
    auto_renew: true,
    started_at: new Date('2024-01-01'),
    renews_at: new Date('2024-07-01'),
    cancelled_at: null,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-06-01')
  },
  cancelled: {
    id: 'sub-002',
    user_id: 'user-regular-001',
    plan: 'basic',
    status: 'cancelled',
    billing_cycle: 'monthly',
    amount: 29.99,
    currency: 'USD',
    auto_renew: false,
    started_at: new Date('2024-03-01'),
    renews_at: null,
    cancelled_at: new Date('2024-06-01'),
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-06-01')
  },
  trial: {
    id: 'sub-003',
    user_id: 'user-regular-001',
    plan: 'premium',
    status: 'trial',
    billing_cycle: null,
    amount: 0,
    currency: 'USD',
    auto_renew: true,
    started_at: new Date('2024-06-01'),
    renews_at: new Date('2024-07-01'),
    cancelled_at: null,
    created_at: new Date('2024-06-01'),
    updated_at: new Date('2024-06-01')
  }
};

export const mockInvoices = {
  paid: {
    id: 'inv-001',
    subscription_id: 'sub-001',
    user_id: 'user-regular-001',
    amount: 99.99,
    currency: 'USD',
    status: 'paid',
    issue_date: new Date('2024-06-01'),
    due_date: new Date('2024-06-15'),
    paid_at: new Date('2024-06-05'),
    pdf_url: 'https://example.com/invoices/inv-001.pdf',
    created_at: new Date('2024-06-01'),
    updated_at: new Date('2024-06-05')
  },
  pending: {
    id: 'inv-002',
    subscription_id: 'sub-001',
    user_id: 'user-regular-001',
    amount: 99.99,
    currency: 'USD',
    status: 'pending',
    issue_date: new Date('2024-07-01'),
    due_date: new Date('2024-07-15'),
    paid_at: null,
    pdf_url: 'https://example.com/invoices/inv-002.pdf',
    created_at: new Date('2024-07-01'),
    updated_at: new Date('2024-07-01')
  }
};

export const mockBillingPayloads = {
  validSubscription: {
    plan: 'premium',
    billing_cycle: 'monthly',
    auto_renew: true
  },
  invalidPlan: {
    plan: 'nonexistent',
    billing_cycle: 'monthly',
    auto_renew: true
  },
  updatePaymentMethod: {
    stripe_token: 'tok_visa',
    last_four: '4242',
    brand: 'visa'
  }
};

export const mockPaymentMethods = {
  valid: {
    id: 'pm-001',
    user_id: 'user-regular-001',
    stripe_id: 'pm_test123',
    brand: 'visa',
    last_four: '4242',
    exp_month: 12,
    exp_year: 2025,
    is_default: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
};

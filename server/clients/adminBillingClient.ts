/**
 * Admin Billing Client
 *
 * Type-safe client for admin billing management endpoints.
 * Handles authentication, error handling, and request/response transformation.
 *
 * Usage:
 * ```typescript
 * const client = new AdminBillingClient(token);
 * const subscriptions = await client.listSubscriptions({ status: 'active' });
 * ```
 */

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SubscriptionFilters extends PaginationParams {
  status?: 'active' | 'paused' | 'canceled' | 'trialing' | 'past_due' | 'incomplete';
  planId?: string;
  currency?: 'USD' | 'EUR';
}

export interface InvoiceFilters extends PaginationParams {
  status?: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
  currency?: 'USD' | 'EUR';
  subscriptionId?: string;
}

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  planId: string;
  planName: string;
  status: string;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  pricePerCycle: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUpdateRequest {
  planId: string;
  billingCycle?: 'monthly' | 'yearly';
  prorationBehavior?: 'create_prorations' | 'always_invoice' | 'none';
}

export interface SubscriptionUpdateResponse extends Subscription {
  prorationCredit?: number;
}

export interface Invoice {
  id: string;
  stripeInvoiceId: string;
  invoiceNumber: string;
  subscriptionId?: string;
  status: string;
  currency: string;
  amountSubtotal?: number;
  amountTax?: number;
  amountTotal: number;
  amountPaid: number;
  amountDue?: number;
  amountRemaining?: number;
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
  lineItems: any[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ResendInvoiceResponse {
  id: string;
  stripeInvoiceId: string;
  invoiceNumber: string;
  status: string;
  message: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface ApiError {
  error: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * Main Admin Billing Client Class
 */
export class AdminBillingClient {
  private baseUrl: string;
  private token: string;

  constructor(
    baseUrl: string = 'https://api.app.com',
    token: string
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
  }

  /**
   * Make HTTP request with authentication
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          error: data.error || 'Unknown error',
          statusCode: response.status,
          details: data,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw {
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
        details: error,
      } as ApiError;
    }
  }

  /**
   * Build query string from filters
   */
  private buildQueryString(filters?: Record<string, any>): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * GET /api/admin/subscriptions
   * List all subscriptions with optional filtering
   */
  async listSubscriptions(
    filters?: SubscriptionFilters
  ): Promise<ListResponse<Subscription>> {
    const queryString = this.buildQueryString(filters);
    return this.request<ListResponse<Subscription>>(
      'GET',
      `/api/admin/subscriptions${queryString}`
    );
  }

  /**
   * Get subscriptions by status
   */
  async getSubscriptionsByStatus(
    status: 'active' | 'paused' | 'canceled' | 'trialing',
    limit: number = 25
  ): Promise<ListResponse<Subscription>> {
    return this.listSubscriptions({ status, limit });
  }

  /**
   * Get all active subscriptions
   */
  async getActiveSubscriptions(limit: number = 25): Promise<ListResponse<Subscription>> {
    return this.getSubscriptionsByStatus('active', limit);
  }

  /**
   * Get subscriptions for a specific plan
   */
  async getSubscriptionsByPlan(
    planId: string,
    limit: number = 25
  ): Promise<ListResponse<Subscription>> {
    return this.listSubscriptions({ planId, limit });
  }

  /**
   * Get subscriptions in a specific currency
   */
  async getSubscriptionsByCurrency(
    currency: 'USD' | 'EUR',
    limit: number = 25
  ): Promise<ListResponse<Subscription>> {
    return this.listSubscriptions({ currency, limit });
  }

  /**
   * PATCH /api/admin/subscriptions/:id
   * Change subscription plan
   */
  async updateSubscription(
    subscriptionId: string,
    update: SubscriptionUpdateRequest
  ): Promise<SubscriptionUpdateResponse> {
    return this.request<SubscriptionUpdateResponse>(
      'PATCH',
      `/api/admin/subscriptions/${subscriptionId}`,
      update
    );
  }

  /**
   * Upgrade subscription to a higher plan
   */
  async upgradeSubscription(
    subscriptionId: string,
    newPlanId: string,
    prorationBehavior: 'create_prorations' | 'always_invoice' | 'none' = 'create_prorations'
  ): Promise<SubscriptionUpdateResponse> {
    return this.updateSubscription(subscriptionId, {
      planId: newPlanId,
      prorationBehavior,
    });
  }

  /**
   * Downgrade subscription to a lower plan
   */
  async downgradeSubscription(
    subscriptionId: string,
    newPlanId: string,
    prorationBehavior: 'create_prorations' | 'always_invoice' | 'none' = 'create_prorations'
  ): Promise<SubscriptionUpdateResponse> {
    return this.updateSubscription(subscriptionId, {
      planId: newPlanId,
      prorationBehavior,
    });
  }

  /**
   * Change billing cycle (monthly <-> yearly)
   */
  async changeBillingCycle(
    subscriptionId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    prorationBehavior: 'create_prorations' | 'always_invoice' | 'none' = 'none'
  ): Promise<SubscriptionUpdateResponse> {
    return this.updateSubscription(subscriptionId, {
      planId,
      billingCycle,
      prorationBehavior,
    });
  }

  /**
   * GET /api/admin/invoices
   * List all invoices with optional filtering
   */
  async listInvoices(
    filters?: InvoiceFilters
  ): Promise<ListResponse<Invoice>> {
    const queryString = this.buildQueryString(filters);
    return this.request<ListResponse<Invoice>>(
      'GET',
      `/api/admin/invoices${queryString}`
    );
  }

  /**
   * Get invoices by status
   */
  async getInvoicesByStatus(
    status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible',
    limit: number = 25
  ): Promise<ListResponse<Invoice>> {
    return this.listInvoices({ status, limit });
  }

  /**
   * Get all paid invoices
   */
  async getPaidInvoices(limit: number = 25): Promise<ListResponse<Invoice>> {
    return this.getInvoicesByStatus('paid', limit);
  }

  /**
   * Get all open invoices (awaiting payment)
   */
  async getOpenInvoices(limit: number = 25): Promise<ListResponse<Invoice>> {
    return this.getInvoicesByStatus('open', limit);
  }

  /**
   * Get invoices for a specific subscription
   */
  async getInvoicesBySubscription(
    subscriptionId: string,
    limit: number = 25
  ): Promise<ListResponse<Invoice>> {
    return this.listInvoices({ subscriptionId, limit });
  }

  /**
   * Get invoices in a specific currency
   */
  async getInvoicesByCurrency(
    currency: 'USD' | 'EUR',
    limit: number = 25
  ): Promise<ListResponse<Invoice>> {
    return this.listInvoices({ currency, limit });
  }

  /**
   * POST /api/admin/invoices/:id/resend
   * Resend an invoice to the customer
   */
  async resendInvoice(invoiceId: string): Promise<ResendInvoiceResponse> {
    return this.request<ResendInvoiceResponse>(
      'POST',
      `/api/admin/invoices/${invoiceId}/resend`,
      {}
    );
  }

  /**
   * Paginate through all subscriptions
   */
  async *paginateSubscriptions(
    pageSize: number = 25,
    filters?: Omit<SubscriptionFilters, 'limit' | 'offset'>
  ): AsyncGenerator<Subscription> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listSubscriptions({
        ...filters,
        limit: pageSize,
        offset,
      });

      for (const item of response.data) {
        yield item;
      }

      offset += pageSize;
      hasMore = offset < response.total;
    }
  }

  /**
   * Paginate through all invoices
   */
  async *paginateInvoices(
    pageSize: number = 25,
    filters?: Omit<InvoiceFilters, 'limit' | 'offset'>
  ): AsyncGenerator<Invoice> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listInvoices({
        ...filters,
        limit: pageSize,
        offset,
      });

      for (const item of response.data) {
        yield item;
      }

      offset += pageSize;
      hasMore = offset < response.total;
    }
  }

  /**
   * Get all subscriptions at once (auto-paginate)
   */
  async getAllSubscriptions(
    filters?: Omit<SubscriptionFilters, 'limit' | 'offset'>
  ): Promise<Subscription[]> {
    const all: Subscription[] = [];
    for await (const sub of this.paginateSubscriptions(25, filters)) {
      all.push(sub);
    }
    return all;
  }

  /**
   * Get all invoices at once (auto-paginate)
   */
  async getAllInvoices(
    filters?: Omit<InvoiceFilters, 'limit' | 'offset'>
  ): Promise<Invoice[]> {
    const all: Invoice[] = [];
    for await (const inv of this.paginateInvoices(25, filters)) {
      all.push(inv);
    }
    return all;
  }

  /**
   * Calculate total revenue from paid invoices
   */
  async calculateRevenue(
    currency: 'USD' | 'EUR' = 'USD'
  ): Promise<number> {
    const invoices = await this.getAllInvoices({
      status: 'paid',
      currency,
    });

    return invoices.reduce((sum, inv) => sum + inv.amountTotal, 0);
  }

  /**
   * Get subscription count by status
   */
  async getSubscriptionCountByStatus(): Promise<
    Record<string, number>
  > {
    const statuses = ['active', 'paused', 'canceled', 'trialing'] as const;
    const counts: Record<string, number> = {};

    for (const status of statuses) {
      const result = await this.listSubscriptions({ status, limit: 1 });
      counts[status] = result.total;
    }

    return counts;
  }
}

/**
 * Factory function for creating a client
 */
export function createAdminBillingClient(
  token: string,
  baseUrl?: string
): AdminBillingClient {
  return new AdminBillingClient(baseUrl, token);
}

/**
 * Error handling helper
 */
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'error' in error && 'statusCode' in error;
}

/**
 * Error message helper
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

# Testing Examples and Patterns

This document provides real-world examples of how to implement tests using the Jest setup.

## Table of Contents

1. [Route/Controller Testing](#routecontroller-testing)
2. [Service Layer Testing](#service-layer-testing)
3. [Using Fixtures](#using-fixtures)
4. [Using Test Helpers](#using-test-helpers)
5. [Advanced Patterns](#advanced-patterns)

## Route/Controller Testing

### Example 1: Simple GET Request

```typescript
// server/__tests__/routes/users.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createMockRequest,
  createMockResponse,
  createAuthenticatedRequest,
  expectStatus,
  expectJSONResponse
} from '../utils/test-helpers';
import { mockUsers } from '../fixtures/user.fixtures';

describe('GET /api/users/:id', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user details for authenticated request', () => {
    // Arrange: Setup request from authenticated user
    req = createAuthenticatedRequest('user-001', 'admin');
    req.method = 'GET';
    req.url = '/api/users/user-regular-001';
    req.params = { id: 'user-regular-001' };
    res = createMockResponse();

    // Act: Call the handler (once implemented)
    // const result = userController.getUser(req, res);

    // Assert: Verify response
    // expectStatus(res, 200);
    // expectJSONResponse(res, mockUsers.regular);

    // Placeholder
    expect(true).toBe(true);
  });

  it('should return 403 if user requests different user profile', () => {
    // Arrange: Regular user requesting another user's profile
    req = createAuthenticatedRequest('user-001', 'user');
    req.params = { id: 'user-002' };
    res = createMockResponse();

    // Act & Assert
    // await expect(userController.getUser(req, res)).rejects.toThrow('Forbidden');
    expect(true).toBe(true);
  });
});
```

### Example 2: POST Request with Validation

```typescript
describe('POST /api/campaigns', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create campaign with valid data', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.method = 'POST';
    req.url = '/api/campaigns';
    req.body = {
      name: 'Q3 Campaign',
      description: 'Summer promotion',
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      budget: 5000
    };
    res = createMockResponse();

    // Act
    // const result = await campaignController.create(req, res);

    // Assert
    // expectStatus(res, 201);
    // const campaign = res._getJSONData();
    // expect(campaign.id).toBeDefined();
    // expect(campaign.status).toBe('draft');

    expect(true).toBe(true);
  });

  it('should reject request with missing required fields', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.body = {
      description: 'Missing name and dates',
      budget: 5000
    };
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.create(req, res)).rejects.toThrow('Missing required fields');

    expect(true).toBe(true);
  });

  it('should reject negative budget', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.body = {
      name: 'Campaign',
      description: 'Test',
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      budget: -1000  // Invalid
    };
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.create(req, res)).rejects.toThrow('Budget must be positive');

    expect(true).toBe(true);
  });

  it('should reject if start date is after end date', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.body = {
      name: 'Campaign',
      description: 'Test',
      start_date: '2024-09-30',
      end_date: '2024-07-01',  // Before start
      budget: 5000
    };
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.create(req, res)).rejects.toThrow('End date must be after start date');

    expect(true).toBe(true);
  });
});
```

### Example 3: DELETE with Authorization

```typescript
describe('DELETE /api/campaigns/:id', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete campaign in draft status', () => {
    // Arrange: Campaign creator deleting their draft
    req = createAuthenticatedRequest('user-001', 'user');
    req.method = 'DELETE';
    req.params = { id: 'campaign-draft-001' };
    res = createMockResponse();

    // Mock the campaign
    const mockCampaign = {
      id: 'campaign-draft-001',
      status: 'draft',
      created_by: 'user-001'
    };

    // Act & Assert
    // const result = await campaignController.delete(req, res);
    // expectStatus(res, 200);

    expect(true).toBe(true);
  });

  it('should prevent deletion if not campaign creator', () => {
    // Arrange: Different user trying to delete
    req = createAuthenticatedRequest('user-002');
    req.params = { id: 'campaign-draft-001' };  // Created by user-001
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.delete(req, res)).rejects.toThrow('Unauthorized');

    expect(true).toBe(true);
  });

  it('should prevent deletion of active campaign', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.params = { id: 'campaign-active-001' };
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.delete(req, res)).rejects.toThrow('Cannot delete active campaign');

    expect(true).toBe(true);
  });

  it('should return 404 for nonexistent campaign', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    req.params = { id: 'nonexistent-campaign' };
    res = createMockResponse();

    // Act & Assert
    // await expect(campaignController.delete(req, res)).rejects.toThrow('Campaign not found');

    expect(true).toBe(true);
  });
});
```

## Service Layer Testing

### Example 1: Basic CRUD Operations

```typescript
// server/__tests__/services/campaign.service.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockCampaigns, mockCampaignPayloads } from '../fixtures/campaign.fixtures';

describe('CampaignService', () => {
  let service: any;
  let mockRepository: any;

  beforeEach(() => {
    // Setup mock repository
    mockRepository = {
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    // Initialize service with mocked dependencies
    // service = new CampaignService(mockRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create campaign with valid input', async () => {
      // Arrange
      const payload = mockCampaignPayloads.valid;
      const expectedResult = {
        id: 'campaign-new-001',
        ...payload,
        status: 'draft',
        spent: 0
      };
      mockRepository.create.mockResolvedValue(expectedResult);

      // Act
      // const result = await service.create(payload, 'user-001');

      // Assert
      // expect(result.id).toBe('campaign-new-001');
      // expect(result.status).toBe('draft');
      // expect(mockRepository.create).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     name: payload.name,
      //     created_by: 'user-001'
      //   })
      // );

      expect(true).toBe(true);
    });

    it('should validate required fields before creating', async () => {
      // Arrange
      const invalidPayload = {
        description: 'Missing name',
        budget: 5000
      };

      // Act & Assert
      // await expect(service.create(invalidPayload)).rejects.toThrow('Name is required');

      expect(true).toBe(true);
    });

    it('should reject negative budget', async () => {
      // Arrange
      const payload = {
        ...mockCampaignPayloads.valid,
        budget: -1000
      };

      // Act & Assert
      // await expect(service.create(payload)).rejects.toThrow('Budget must be positive');

      expect(true).toBe(true);
    });

    it('should validate date range', async () => {
      // Arrange
      const payload = {
        ...mockCampaignPayloads.valid,
        start_date: '2024-09-30',
        end_date: '2024-07-01'
      };

      // Act & Assert
      // await expect(service.create(payload)).rejects.toThrow('Invalid date range');

      expect(true).toBe(true);
    });
  });

  describe('read', () => {
    it('should retrieve campaign by ID', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockCampaigns.active);

      // Act
      // const result = await service.getById('campaign-001');

      // Assert
      // expect(result).toEqual(mockCampaigns.active);
      // expect(mockRepository.findById).toHaveBeenCalledWith('campaign-001');

      expect(true).toBe(true);
    });

    it('should return null for nonexistent campaign', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      // const result = await service.getById('nonexistent');

      // Assert
      // expect(result).toBeNull();

      expect(true).toBe(true);
    });

    it('should list campaigns with pagination', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue({
        data: [mockCampaigns.active, mockCampaigns.draft],
        total: 2,
        page: 1,
        limit: 10
      });

      // Act
      // const result = await service.list({ page: 1, limit: 10 });

      // Assert
      // expect(result.data).toHaveLength(2);
      // expect(result.total).toBe(2);
      // expect(mockRepository.find).toHaveBeenCalledWith({
      //   page: 1,
      //   limit: 10
      // });

      expect(true).toBe(true);
    });

    it('should filter campaigns by status', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue({
        data: [mockCampaigns.active],
        total: 1
      });

      // Act
      // const result = await service.list({ status: 'active' });

      // Assert
      // expect(result.data[0].status).toBe('active');
      // expect(mockRepository.find).toHaveBeenCalledWith(
      //   expect.objectContaining({ status: 'active' })
      // );

      expect(true).toBe(true);
    });
  });

  describe('update', () => {
    it('should update campaign details', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockCampaigns.draft);
      const updates = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue({
        ...mockCampaigns.draft,
        ...updates
      });

      // Act
      // const result = await service.update('campaign-002', updates);

      // Assert
      // expect(result.name).toBe('Updated Name');
      // expect(mockRepository.update).toHaveBeenCalledWith('campaign-002', updates);

      expect(true).toBe(true);
    });

    it('should prevent status downgrade from active', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockCampaigns.active);

      // Act & Assert
      // await expect(service.update('campaign-001', { status: 'draft' }))
      //   .rejects.toThrow('Cannot downgrade active campaign');

      expect(true).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete draft campaign', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockCampaigns.draft);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      // const result = await service.delete('campaign-002');

      // Assert
      // expect(result).toBe(true);
      // expect(mockRepository.delete).toHaveBeenCalledWith('campaign-002');

      expect(true).toBe(true);
    });

    it('should prevent deletion of active campaign', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockCampaigns.active);

      // Act & Assert
      // await expect(service.delete('campaign-001'))
      //   .rejects.toThrow('Cannot delete active campaign');

      expect(true).toBe(true);
    });
  });
});
```

### Example 2: Complex Business Logic

```typescript
describe('SubscriptionService', () => {
  let service: any;
  let mockRepository: any;
  let mockPaymentGateway: any;

  beforeEach(() => {
    mockRepository = {
      findSubscription: jest.fn(),
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn()
    };

    mockPaymentGateway = {
      processPayment: jest.fn(),
      refund: jest.fn(),
      authorizePayment: jest.fn()
    };

    // service = new SubscriptionService(mockRepository, mockPaymentGateway);
    jest.clearAllMocks();
  });

  describe('upgrade plan', () => {
    it('should upgrade subscription and charge difference', async () => {
      // Arrange
      const currentSub = {
        id: 'sub-001',
        plan: 'basic',
        amount: 29.99,
        status: 'active'
      };
      const newPlan = {
        plan: 'premium',
        amount: 99.99
      };

      mockRepository.findSubscription.mockResolvedValue(currentSub);
      mockRepository.updateSubscription.mockResolvedValue({
        ...currentSub,
        plan: 'premium',
        amount: 99.99
      });
      mockPaymentGateway.processPayment.mockResolvedValue({
        success: true,
        chargeAmount: 70.00  // Difference
      });

      // Act
      // const result = await service.upgradePlan('user-001', 'premium');

      // Assert
      // expect(result.plan).toBe('premium');
      // expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     amount: 70.00  // Pro-rated charge
      //   })
      // );

      expect(true).toBe(true);
    });

    it('should handle payment failure gracefully', async () => {
      // Arrange
      mockRepository.findSubscription.mockResolvedValue(mockSubscriptions.active);
      mockPaymentGateway.processPayment.mockRejectedValue(
        new Error('Payment declined')
      );

      // Act & Assert
      // await expect(service.upgradePlan('user-001', 'premium'))
      //   .rejects.toThrow('Payment declined');
      // expect(mockRepository.updateSubscription).not.toHaveBeenCalled();

      expect(true).toBe(true);
    });

    it('should downgrade and issue credit', async () => {
      // Arrange
      mockRepository.findSubscription.mockResolvedValue(mockSubscriptions.active);
      mockRepository.updateSubscription.mockResolvedValue({
        ...mockSubscriptions.active,
        plan: 'basic',
        amount: 29.99
      });
      mockPaymentGateway.refund.mockResolvedValue({
        creditAmount: 40.00
      });

      // Act
      // const result = await service.downgradePlan('user-001', 'basic');

      // Assert
      // expect(result.plan).toBe('basic');
      // expect(mockPaymentGateway.refund).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     creditAmount: 40.00
      //   })
      // );

      expect(true).toBe(true);
    });
  });

  describe('cancellation', () => {
    it('should cancel subscription and issue pro-rata refund', async () => {
      // Arrange
      const subscription = {
        id: 'sub-001',
        plan: 'premium',
        amount: 99.99,
        next_billing: '2024-07-15',
        today: '2024-07-01'
      };
      mockRepository.findSubscription.mockResolvedValue(subscription);
      mockRepository.cancelSubscription.mockResolvedValue(true);
      mockPaymentGateway.refund.mockResolvedValue({
        refundAmount: 47.14  // Pro-rata refund
      });

      // Act
      // const result = await service.cancel('user-001');

      // Assert
      // expect(result).toBe(true);
      // expect(mockPaymentGateway.refund).toHaveBeenCalled();

      expect(true).toBe(true);
    });
  });
});
```

## Using Fixtures

### Accessing Fixtures

```typescript
import { mockUsers, mockAuthPayloads, mockTokens } from '../fixtures/user.fixtures';
import { mockCampaigns, mockCampaignPayloads, mockCampaignStats } from '../fixtures/campaign.fixtures';
import { mockSubscriptions, mockInvoices, mockBillingPayloads } from '../fixtures/billing.fixtures';

// Use in tests
const testUser = mockUsers.admin;
const testCampaign = mockCampaigns.active;
const testPayload = mockCampaignPayloads.valid;
```

### Customizing Fixtures

```typescript
// Clone and modify fixture
const customUser = {
  ...mockUsers.regular,
  email: 'custom@test.com',
  role: 'manager'
};

// Use in test
mockRepository.findById.mockResolvedValue(customUser);
```

## Using Test Helpers

### Creating Requests

```typescript
// Basic request
const req = createMockRequest({
  method: 'POST',
  url: '/api/campaigns',
  body: mockCampaignPayloads.valid
});

// Authenticated request
const req = createAuthenticatedRequest('user-001', 'admin');
req.method = 'PUT';
req.params = { id: 'campaign-001' };
req.body = { name: 'Updated' };

// Pagination
const req = createPaginationRequest(2, 20);  // Page 2, 20 per page
```

### Creating Responses

```typescript
const res = createMockResponse();

// Chain methods
res.status(200).json({ success: true });

// Access stored values
const statusCode = res._getStatusCode();
const data = res._getJSONData();

// Check calls
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ success: true });
```

### Assertions

```typescript
// Status assertions
expectStatus(res, 200);
expectStatus(res, 201);
expectStatus(res, 400);

// Response data assertions
expectJSONResponse(res, { id: '123' });
expectJSONResponse(res, expect.objectContaining({ id: '123' }));

// Error assertions
expectErrorResponse(res);
expectErrorResponse(res, 'Email already exists');
```

## Advanced Patterns

### Testing Async Flows

```typescript
it('should handle email queue correctly', async () => {
  // Arrange
  mockRepository.create.mockResolvedValue({ id: 'email-001' });
  mockQueueService.enqueue.mockResolvedValue({ queued: true });

  // Act
  const result = await emailService.send({
    to: 'user@example.com',
    subject: 'Test'
  });

  // Assert
  expect(result.queued).toBe(true);
  await waitFor(() => mockQueueService.enqueue.mock.calls.length > 0);
});
```

### Testing Error Paths

```typescript
it('should handle database errors gracefully', async () => {
  // Arrange
  const dbError = createDatabaseError('Connection timeout', 'TIMEOUT');
  mockRepository.create.mockRejectedValue(dbError);

  // Act & Assert
  await expect(service.create(payload)).rejects.toThrow('Connection timeout');
});

it('should validate and return specific error for each field', async () => {
  // Arrange
  const validationError = createValidationError('email', 'Invalid format');

  // Act & Assert
  expect(validationError.field).toBe('email');
  expect(validationError.code).toBe('VALIDATION_ERROR');
});
```

### Testing with Spies

```typescript
it('should call dependency methods in correct order', async () => {
  // Arrange
  const spy1 = jest.spyOn(mockService1, 'process');
  const spy2 = jest.spyOn(mockService2, 'notify');

  // Act
  await orchestrator.execute();

  // Assert
  expect(spy1).toHaveBeenCalledBefore(spy2);
  expect(spy1).toHaveBeenCalledWith(expect.any(Object));
  expect(spy2).toHaveBeenCalledWith(expect.any(String));
});
```

### Testing Edge Cases

```typescript
describe('edge cases', () => {
  it('should handle empty results', async () => {
    mockRepository.find.mockResolvedValue({ data: [], total: 0 });
    const result = await service.list();
    expect(result.data).toHaveLength(0);
  });

  it('should handle very large numbers', async () => {
    const largeNumber = 9999999999999;
    const result = await service.calculate(largeNumber);
    expect(result).toBeDefined();
  });

  it('should handle null/undefined values', async () => {
    const result = await service.process(null);
    expect(result).toBeDefined();
  });

  it('should handle special characters', async () => {
    const input = '<script>alert("xss")</script>';
    const result = await service.sanitize(input);
    expect(result).not.toContain('<script>');
  });
});
```

---

These examples demonstrate the recommended patterns for testing with Jest, fixtures, and helpers. Use them as templates for implementing your actual test cases.

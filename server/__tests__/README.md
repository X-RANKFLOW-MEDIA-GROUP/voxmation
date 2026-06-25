# Server Test Suite

This directory contains all tests for the server-side code including routes, services, middleware, and utilities.

## Directory Structure

```
server/__tests__/
├── README.md                     # This file
├── fixtures/                     # Test data and mock objects
│   ├── user.fixtures.ts         # User/auth test data
│   ├── campaign.fixtures.ts     # Campaign test data
│   └── billing.fixtures.ts      # Billing test data
├── routes/                       # Route/Controller tests
│   ├── auth.test.ts             # Authentication routes
│   ├── campaigns.test.ts        # Campaign management routes
│   └── billing.test.ts          # Billing/Subscription routes
├── services/                     # Service layer unit tests
│   ├── user.service.test.ts    # User service tests
│   ├── campaign.service.test.ts # Campaign service tests
│   └── billing.service.test.ts # Billing service tests
├── middleware/                   # Middleware tests (optional)
├── utils/                        # Test utilities and helpers
│   └── test-helpers.ts         # Reusable test functions
└── integration/                  # Integration tests (optional)
```

## Test Types

### 1. Route/Controller Tests (`routes/`)
Test API endpoint behavior:
- Request handling
- Response status codes
- Error handling
- Validation
- Authorization

**Example**:
```typescript
describe('POST /api/campaigns', () => {
  it('should create campaign with valid data', () => {
    const req = createAuthenticatedRequest('user-001');
    req.body = mockCampaignPayloads.valid;
    const res = createMockResponse();
    
    // Test implementation
  });
});
```

### 2. Service Tests (`services/`)
Test business logic:
- Data processing
- Validation rules
- Database operations
- Error handling
- Edge cases

**Example**:
```typescript
describe('CampaignService', () => {
  it('should validate budget is positive', async () => {
    await expect(service.create(invalidPayload)).rejects.toThrow();
  });
});
```

### 3. Integration Tests (`integration/`)
Test workflows across multiple layers:
- Complete user flows
- Database transactions
- API chains
- Real service interactions

### 4. Middleware Tests (`middleware/`)
Test middleware functionality:
- Request/response modification
- Authorization checks
- Error handling

## Getting Started

### 1. View Test Fixtures
Each test file imports fixtures matching its domain:

```typescript
import { mockUsers, mockAuthPayloads } from '../fixtures/user.fixtures';
import { mockCampaigns, mockCampaignPayloads } from '../fixtures/campaign.fixtures';
import { mockSubscriptions, mockInvoices } from '../fixtures/billing.fixtures';
```

### 2. Use Test Helpers
Import and use helper functions:

```typescript
import {
  createMockRequest,
  createMockResponse,
  createAuthenticatedRequest,
  expectStatus,
  expectJSONResponse
} from '../utils/test-helpers';
```

### 3. Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific file
npm test -- auth.test.ts

# With pattern
npm test -- --testNamePattern="login"

# Coverage
npm run test:coverage
```

## Test Fixture Reference

### User Fixtures (`user.fixtures.ts`)
```typescript
mockUsers.admin          // Admin user
mockUsers.regular        // Regular user
mockUsers.inactive       // Inactive user

mockAuthPayloads.validLogin           // { email, password }
mockAuthPayloads.invalidEmail         // Non-existent email
mockAuthPayloads.invalidPassword      // Wrong password

mockTokens.validJWT      // Valid JWT token
mockTokens.expiredJWT    // Expired token
mockTokens.invalidJWT    // Invalid token
```

### Campaign Fixtures (`campaign.fixtures.ts`)
```typescript
mockCampaigns.active       // Active campaign
mockCampaigns.draft        // Draft campaign
mockCampaigns.completed    // Completed campaign

mockCampaignPayloads.valid          // Valid campaign data
mockCampaignPayloads.missingName    // Invalid: no name
mockCampaignPayloads.invalidBudget  // Invalid: negative budget
mockCampaignPayloads.invalidDates   // Invalid: end before start

mockCampaignStats          // Sample statistics
```

### Billing Fixtures (`billing.fixtures.ts`)
```typescript
mockSubscriptions.active     // Active subscription
mockSubscriptions.cancelled  // Cancelled subscription
mockSubscriptions.trial      // Trial subscription

mockInvoices.paid      // Paid invoice
mockInvoices.pending   // Pending payment

mockBillingPayloads.validSubscription   // Valid subscription
mockBillingPayloads.updatePaymentMethod // Payment update

mockPaymentMethods.valid   // Valid payment method
```

## Test Helper Functions

### Request/Response Creation
```typescript
// Basic request
const req = createMockRequest({ method: 'GET', body: {...} });

// Authenticated request
const req = createAuthenticatedRequest('user-001', 'admin');

// Pagination request
const req = createPaginationRequest(1, 10);

// Mock response
const res = createMockResponse();
res.status(200).json({ data: 'test' });

// Mock next function
const next = createMockNext();
```

### Assertions
```typescript
expectStatus(res, 200);
expectJSONResponse(res, { success: true });
expectErrorResponse(res, 'Error message');
```

### Async Utilities
```typescript
await waitFor(() => condition, 1000);  // Wait for condition
await delay(100);                       // Delay execution
const id = generateTestId('user');      // Generate test ID
```

### Error Creation
```typescript
createDatabaseError('message', 'DB_ERROR');
createValidationError('field', 'message');
```

## Writing New Tests

### 1. Create Test File
```typescript
// server/__tests__/routes/newfeature.test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createAuthenticatedRequest } from '../utils/test-helpers';

describe('Feature Routes', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    req = createAuthenticatedRequest('user-001');
    res = createMockResponse();

    // Act
    // Execute function

    // Assert
    // Verify result
  });
});
```

### 2. Create Service Test
```typescript
// server/__tests__/services/newfeature.service.test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('FeatureService', () => {
  let service: FeatureService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    // service = new FeatureService(mockRepository);
    jest.clearAllMocks();
  });

  it('should perform operation', async () => {
    // Arrange
    mockRepository.create.mockResolvedValue({ id: '1' });

    // Act
    const result = await service.create(data);

    // Assert
    expect(result.id).toBe('1');
    expect(mockRepository.create).toHaveBeenCalledWith(data);
  });
});
```

### 3. Create Fixtures
```typescript
// server/__tests__/fixtures/newfeature.fixtures.ts

export const mockData = {
  valid: { /* ... */ },
  invalid: { /* ... */ }
};
```

## Running Specific Tests

```bash
# Run by filename pattern
npm test -- auth

# Run by describe block
npm test -- --testNamePattern="Authentication"

# Run by test name
npm test -- --testNamePattern="should login successfully"

# Run single file
npm test -- server/__tests__/routes/auth.test.ts

# Run with coverage
npm test -- --coverage

# Run and watch for changes
npm run test:watch
```

## Coverage Goals

Target coverage percentages (can be adjusted):
- **Lines**: 50%
- **Branches**: 50%
- **Functions**: 50%
- **Statements**: 50%

View coverage report:
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html
```

## Best Practices

### 1. Use Descriptive Test Names
```typescript
// Good
it('should return 400 when email format is invalid')

// Avoid
it('validates email')
```

### 2. Follow AAA Pattern
```typescript
it('should create campaign', () => {
  // Arrange: Setup
  const payload = mockCampaignPayloads.valid;
  
  // Act: Execute
  const result = service.create(payload);
  
  // Assert: Verify
  expect(result).toBeDefined();
});
```

### 3. Mock External Dependencies
```typescript
const mockDB = {
  query: jest.fn().mockResolvedValue([])
};

// Mock specific behavior
mockDB.query.mockResolvedValueOnce({ id: '1' });

// Verify mock was called
expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM ...');
```

### 4. Test One Thing Per Test
```typescript
// Good
it('should validate email format')
it('should validate password length')

// Avoid combining concerns
it('should validate form')
```

### 5. Use beforeEach for Setup
```typescript
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset test variables
  req = createMockRequest();
  res = createMockResponse();
});
```

## Common Patterns

### Testing Success Cases
```typescript
it('should return user data', async () => {
  mockRepository.findById.mockResolvedValue(mockUsers.regular);
  const user = await service.getUser('id');
  expect(user.email).toBe('user@test.com');
});
```

### Testing Error Cases
```typescript
it('should throw error on not found', async () => {
  mockRepository.findById.mockResolvedValue(null);
  await expect(service.getUser('id')).rejects.toThrow('Not found');
});
```

### Testing API Responses
```typescript
it('should respond with status 200', () => {
  const res = createMockResponse();
  res.status(200).json({ success: true });
  
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: true });
});
```

### Testing Async Operations
```typescript
it('should handle async data fetching', async () => {
  mockService.fetch.mockResolvedValue([1, 2, 3]);
  const result = await mockService.fetch();
  expect(result).toHaveLength(3);
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="specific test name"
```

### Use Debug Mode
```bash
npm run test:debug
# Then open chrome://inspect in Chrome
```

### Check Test Details
```bash
npm test -- --verbose
```

### Update Snapshots
```bash
npm test -- --updateSnapshot
```

## CI/CD Integration

Tests should run in CI pipeline:
```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage
  run: |
    npx codecov
```

## Troubleshooting

### Tests Not Found
```bash
npm test -- --listTests
```

### Module Import Errors
- Check `jest.config.js` `moduleNameMapper`
- Verify import paths match file structure

### Type Errors
- Ensure TypeScript config is correct
- Check `@types/*` packages are installed

### Async Timeouts
- Increase test timeout: `it('test', () => {...}, 10000)`
- Check for unresolved promises

## Resources

- [Jest Docs](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Express Testing](https://github.com/visionmedia/supertest)

## Next Steps

1. Implement placeholder tests with real functionality
2. Add integration tests for key workflows
3. Set up CI/CD test integration
4. Achieve 80%+ code coverage
5. Add E2E tests with Cypress/Playwright

# Quick Test Reference Card

## Installation Status
✅ **Complete** - Jest, TypeScript support, and all dependencies installed.

## Run Tests

```bash
npm test                  # Run all tests once
npm run test:watch      # Watch mode - re-run on file changes
npm run test:coverage   # Generate coverage report
npm run test:debug      # Debug with Node inspector
```

## Directory Structure

```
server/__tests__/
├── fixtures/            # Mock test data
│   ├── user.fixtures.ts
│   ├── campaign.fixtures.ts
│   └── billing.fixtures.ts
├── routes/              # Route/controller tests
│   ├── auth.test.ts
│   ├── campaigns.test.ts
│   └── billing.test.ts
├── services/            # Service layer tests
│   ├── user.service.test.ts
│   ├── campaign.service.test.ts
│   └── billing.service.test.ts
└── utils/               # Test utilities
    └── test-helpers.ts
```

## Test File Template

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createAuthenticatedRequest } from '../utils/test-helpers';
import { mockUsers } from '../fixtures/user.fixtures';

describe('Feature Name', () => {
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
    // const result = handler(req, res);

    // Assert
    // expect(result).toBe(expected);

    expect(true).toBe(true);  // Placeholder
  });
});
```

## Using Fixtures

```typescript
import { mockUsers, mockAuthPayloads } from '../fixtures/user.fixtures';
import { mockCampaigns, mockCampaignPayloads } from '../fixtures/campaign.fixtures';
import { mockSubscriptions, mockInvoices } from '../fixtures/billing.fixtures';

// Use in tests
const user = mockUsers.admin;
const campaign = mockCampaigns.active;
const payload = mockCampaignPayloads.valid;
```

## Test Helpers

### Request/Response
```typescript
const req = createMockRequest({ method: 'POST', body: {...} });
const req = createAuthenticatedRequest('user-001', 'admin');
const res = createMockResponse();
const next = createMockNext();
```

### Assertions
```typescript
expectStatus(res, 200);
expectJSONResponse(res, { data: 'expected' });
expectErrorResponse(res, 'Error message');
```

### Utilities
```typescript
await waitFor(() => condition, 1000);
await delay(100);
generateTestId('user');
createDatabaseError('message', 'code');
createValidationError('field', 'message');
```

## NPM Commands by Purpose

| Purpose | Command |
|---------|---------|
| Run all tests | `npm test` |
| Watch mode | `npm run test:watch` |
| Coverage report | `npm run test:coverage` |
| Debug tests | `npm run test:debug` |
| Single file | `npm test -- auth.test.ts` |
| Match pattern | `npm test -- --testNamePattern="login"` |
| List tests | `npm test -- --listTests` |
| Verbose output | `npm test -- --verbose` |

## Test Fixtures at a Glance

### User Fixtures
```typescript
mockUsers.admin           // Admin user with privileges
mockUsers.regular         // Regular user
mockUsers.inactive        // Inactive user

mockAuthPayloads.validLogin
mockAuthPayloads.invalidEmail
mockAuthPayloads.invalidPassword

mockTokens.validJWT
mockTokens.expiredJWT
mockTokens.invalidJWT
```

### Campaign Fixtures
```typescript
mockCampaigns.active      // Active campaign
mockCampaigns.draft       // Draft campaign
mockCampaigns.completed   // Completed campaign

mockCampaignPayloads.valid
mockCampaignPayloads.missingName
mockCampaignPayloads.invalidBudget
mockCampaignPayloads.invalidDates

mockCampaignStats         // Sample statistics
```

### Billing Fixtures
```typescript
mockSubscriptions.active
mockSubscriptions.cancelled
mockSubscriptions.trial

mockInvoices.paid
mockInvoices.pending

mockBillingPayloads.validSubscription
mockBillingPayloads.updatePaymentMethod

mockPaymentMethods.valid
```

## AAA Pattern (Arrange-Act-Assert)

Every test follows this pattern:

```typescript
it('should create user', () => {
  // ARRANGE: Set up test data
  const input = { email: 'user@test.com', password: 'pass123' };
  const mockRepository = { create: jest.fn().mockResolvedValue({ id: '1' }) };

  // ACT: Execute the code
  const result = await userService.create(input, mockRepository);

  // ASSERT: Verify results
  expect(result.id).toBe('1');
  expect(mockRepository.create).toHaveBeenCalledWith(input);
});
```

## Mock Response Usage

```typescript
const res = createMockResponse();

// Set response
res.status(200).json({ success: true });

// Check calls
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ success: true });

// Get stored values
const statusCode = res._getStatusCode();     // 200
const data = res._getJSONData();              // { success: true }
```

## Common Assertions

```typescript
expect(value).toBe(expected);
expect(value).toEqual(expectedObject);
expect(value).toBeNull();
expect(value).toBeDefined();
expect(array).toHaveLength(3);
expect(text).toContain('substring');
expect(mock).toHaveBeenCalled();
expect(mock).toHaveBeenCalledWith(arg);
expect(promise).rejects.toThrow('error');
```

## File Locations

| Item | Location |
|------|----------|
| Configuration | `jest.config.cjs` |
| Setup | `jest.setup.cjs` |
| User fixtures | `server/__tests__/fixtures/user.fixtures.ts` |
| Campaign fixtures | `server/__tests__/fixtures/campaign.fixtures.ts` |
| Billing fixtures | `server/__tests__/fixtures/billing.fixtures.ts` |
| Helpers | `server/__tests__/utils/test-helpers.ts` |
| Auth tests | `server/__tests__/routes/auth.test.ts` |
| Campaign tests | `server/__tests__/routes/campaigns.test.ts` |
| Billing tests | `server/__tests__/routes/billing.test.ts` |
| User service tests | `server/__tests__/services/user.service.test.ts` |
| Campaign service tests | `server/__tests__/services/campaign.service.test.ts` |
| Billing service tests | `server/__tests__/services/billing.service.test.ts` |

## Documentation

| Document | Purpose |
|----------|---------|
| `TEST_SETUP.md` | Comprehensive testing guide with examples |
| `JEST_SETUP_SUMMARY.md` | Setup overview and architecture |
| `TESTING_EXAMPLES.md` | Real-world testing patterns and examples |
| `server/__tests__/README.md` | Detailed test directory documentation |
| `QUICK_TEST_REFERENCE.md` | This file - quick reference |

## Next Steps

1. **Implement Tests**: Replace placeholders in route/service test files with real implementations
2. **Add Fixtures**: Extend fixtures with project-specific test data
3. **Run Tests**: `npm test` to verify everything works
4. **Coverage**: `npm run test:coverage` to see coverage reports
5. **Watch Mode**: `npm run test:watch` for development

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests not found | Check file naming: `*.test.ts` or `*.spec.ts` |
| Module not found | Verify import paths and `moduleNameMapper` in config |
| Type errors | Ensure `@types/*` packages are installed |
| Test timeouts | Increase `testTimeout` in `jest.config.cjs` |
| Mock not working | Clear mocks in `beforeEach: jest.clearAllMocks()` |

---

**Status**: ✅ Ready to use
**Commands**: `npm test` | `npm run test:watch` | `npm run test:coverage`
**Templates**: Routes, Services, Fixtures all provided
**Docs**: 4 comprehensive guides included

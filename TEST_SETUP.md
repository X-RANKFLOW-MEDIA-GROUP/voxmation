# Jest Test Suite Setup

This document describes the comprehensive Jest testing setup for the Voxmation project.

## Quick Start

### Installation

Jest and test dependencies are already installed. To verify or reinstall:

```bash
npm install --save-dev jest @types/jest ts-jest ts-node @testing-library/jest-dom
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

## Project Structure

```
voxmation/
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Test environment setup
├── package.json                # NPM scripts (test, test:watch, test:coverage)
├── server/
│   └── __tests__/
│       ├── fixtures/           # Test data
│       │   ├── user.fixtures.ts
│       │   ├── campaign.fixtures.ts
│       │   └── billing.fixtures.ts
│       ├── routes/             # Route/Controller tests
│       │   ├── auth.test.ts
│       │   ├── campaigns.test.ts
│       │   └── billing.test.ts
│       ├── services/           # Service layer tests
│       │   ├── user.service.test.ts
│       │   ├── campaign.service.test.ts
│       │   └── billing.service.test.ts
│       ├── middleware/         # Middleware tests (optional)
│       ├── utils/              # Test utilities
│       │   └── test-helpers.ts
│       └── integration/        # Integration tests (optional)
└── src/
    └── __tests__/              # Frontend tests (React components)
        ├── components/
        ├── hooks/
        └── utils/
```

## Configuration Files

### jest.config.js

Main Jest configuration with:
- **preset**: `ts-jest` for TypeScript support
- **testEnvironment**: `node` for backend testing
- **moduleNameMapper**: Maps `@/` alias to `src/`
- **collectCoverageFrom**: Specifies files to include in coverage
- **setupFilesAfterEnv**: Loads `jest.setup.js` before tests

### jest.setup.js

Test environment setup:
- Imports testing utilities
- Configures mock environment variables
- Suppresses console output (customize as needed)
- Provides global test utilities

## Test Fixtures

Test fixtures provide consistent mock data across tests:

### user.fixtures.ts
- `mockUsers`: Admin, regular, and inactive user objects
- `mockAuthPayloads`: Valid/invalid login payloads
- `mockTokens`: JWT tokens for testing

### campaign.fixtures.ts
- `mockCampaigns`: Active, draft, and completed campaigns
- `mockCampaignPayloads`: Valid and invalid campaign data
- `mockCampaignStats`: Sample campaign statistics

### billing.fixtures.ts
- `mockSubscriptions`: Active, cancelled, and trial subscriptions
- `mockInvoices`: Paid and pending invoices
- `mockBillingPayloads`: Subscription and payment payloads
- `mockPaymentMethods`: Payment method objects

## Test Utilities (test-helpers.ts)

Helper functions for common test operations:

### Express Mock Functions
```typescript
// Create mock request
const req = createMockRequest({ method: 'POST', body: {...} });

// Create mock response
const res = createMockResponse();
res.status(200).json({ data: 'test' });

// Create mock next function
const next = createMockNext();
```

### Assertion Helpers
```typescript
expectStatus(res, 200);
expectJSONResponse(res, { data: 'expected' });
expectErrorResponse(res, 'Error message');
```

### Authentication Helpers
```typescript
// Create authenticated request
const req = createAuthenticatedRequest('user-id', 'admin');

// Create pagination request
const req = createPaginationRequest(1, 10);
```

### Async Helpers
```typescript
// Wait for condition
await waitFor(() => someCondition(), 1000);

// Delay execution
await delay(100);

// Generate random test ID
const id = generateTestId('user');
```

### Error Creation
```typescript
const dbError = createDatabaseError('Connection failed', 'DB_TIMEOUT');
const validationError = createValidationError('email', 'Invalid format');
```

## Writing Tests

### Route/Controller Tests

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createAuthenticatedRequest } from '../utils/test-helpers';

describe('GET /api/campaigns', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = createAuthenticatedRequest('user-001');
    res = createMockResponse();
  });

  it('should list campaigns', () => {
    // Arrange
    req.method = 'GET';
    req.url = '/api/campaigns';

    // Act
    // const result = campaignController.list(req, res);

    // Assert
    // expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

### Service Layer Tests

```typescript
describe('CampaignService', () => {
  let service: CampaignService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    service = new CampaignService(mockRepository);
  });

  it('should create campaign', async () => {
    // Arrange
    mockRepository.create.mockResolvedValue({ id: '1', name: 'Test' });

    // Act
    const result = await service.create({ name: 'Test' });

    // Assert
    expect(result.id).toBe('1');
    expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test' }));
  });
});
```

### Component Tests (React)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should submit form with valid credentials', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    fireEvent.click(submitButton);

    expect(emailInput).toHaveValue('user@test.com');
  });
});
```

## Best Practices

### 1. **AAA Pattern (Arrange, Act, Assert)**
```typescript
it('should do something', () => {
  // Arrange: Set up test data and mocks
  const input = mockData;
  
  // Act: Execute the function being tested
  const result = function(input);
  
  // Assert: Verify the result
  expect(result).toBe(expected);
});
```

### 2. **Test Isolation**
- Clear mocks in `beforeEach`
- Don't rely on test execution order
- Clean up side effects

### 3. **Descriptive Test Names**
```typescript
// Good
it('should return 400 when email is invalid')

// Bad
it('should validate')
```

### 4. **Mock External Dependencies**
```typescript
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn()
};
```

### 5. **Test One Thing Per Test**
```typescript
// Good
it('should validate email format')
it('should validate password length')

// Bad
it('should validate form')
```

## Coverage Goals

Current coverage thresholds (configurable in jest.config.js):
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Generate coverage report:
```bash
npm run test:coverage
```

Coverage report will be available in `./coverage/lcov-report/index.html`

## Debugging Tests

### Run Single Test File
```bash
npm test -- auth.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="login"
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open `chrome://inspect` in Chrome DevTools.

### Verbose Output
```bash
npm test -- --verbose
```

### Update Snapshots
```bash
npm test -- --updateSnapshot
```

## Common Testing Patterns

### Testing Async Functions
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Cases
```typescript
it('should throw error on invalid input', async () => {
  await expect(function(invalidInput)).rejects.toThrow('Expected error message');
});
```

### Testing Database Calls
```typescript
it('should call repository method', async () => {
  mockRepository.create.mockResolvedValue({ id: '1' });
  
  const result = await service.create(data);
  
  expect(mockRepository.create).toHaveBeenCalledWith(data);
});
```

### Testing API Responses
```typescript
it('should return 200 with data', () => {
  const res = createMockResponse();
  res.status(200).json({ data: 'test' });
  
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res._getJSONData()).toEqual({ data: 'test' });
});
```

## Continuous Integration

Tests run automatically on:
- Local commits (pre-commit hook, if configured)
- Pull requests (GitHub Actions, if configured)
- Pre-deployment (CI/CD pipeline)

To skip tests locally (not recommended):
```bash
git commit --no-verify
```

## Troubleshooting

### Tests Not Running
```bash
npm test -- --listTests
```

### Module Not Found
- Check `moduleNameMapper` in `jest.config.js`
- Verify import paths match file structure

### Type Errors
```bash
npm test -- --showConfig
```

Check TypeScript configuration in `jest.config.js`

### Timeout Issues
Increase timeout in specific test:
```typescript
it('should handle slow operation', async () => {
  // test
}, 10000); // 10 second timeout
```

Or globally in `jest.config.js`:
```javascript
testTimeout: 10000
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [TypeScript + Jest](https://kulshekhar.github.io/ts-jest/)
- [Express Testing Guide](https://github.com/visionmedia/supertest)

## Next Steps

1. **Implement service layer tests**: Replace placeholders in `services/` with real test cases
2. **Add route tests**: Implement actual route handlers and corresponding tests
3. **Component tests**: Add tests for React components
4. **Integration tests**: Create tests for complete workflows
5. **E2E tests**: Consider Cypress or Playwright for end-to-end testing

## NPM Scripts Summary

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
}
```

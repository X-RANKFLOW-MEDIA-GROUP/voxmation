/**
 * Test Helper Utilities
 * Common utilities for setting up tests, mocking, and assertions
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Creates a mock Express request object
 */
export function createMockRequest(overrides: Record<string, any> = {}): any {
  return {
    method: 'GET',
    url: '/',
    headers: {},
    params: {},
    query: {},
    body: {},
    user: null,
    ...overrides
  };
}

/**
 * Creates a mock Express response object with chain-able methods
 */
export function createMockResponse(): Response & { _getStatusCode(): number; _getJSONData(): any } {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.setHeader = jest.fn(() => res);
  res.statusCode = 200;
  res._getStatusCode = () => res.statusCode;
  res._getJSONData = () => {
    const call = res.json.mock.calls[0];
    return call ? call[0] : null;
  };
  return res as any;
}

/**
 * Creates a mock Express next function
 */
export function createMockNext(): NextFunction {
  return jest.fn() as NextFunction;
}

/**
 * Assert response status
 */
export function expectStatus(
  res: Response & { statusCode?: number; _getStatusCode?(): number },
  expectedStatus: number
): void {
  const statusFn = res._getStatusCode ? res._getStatusCode() : res.statusCode;
  expect(statusFn).toBe(expectedStatus);
}

/**
 * Assert response JSON contains expected data
 */
export function expectJSONResponse(
  res: Response & { _getJSONData?(): any },
  expectedData: Partial<any>
): void {
  if (!res._getJSONData) {
    throw new Error('Response mock does not support _getJSONData');
  }
  const data = res._getJSONData();
  expect(data).toMatchObject(expectedData);
}

/**
 * Create a mock pagination request
 */
export function createPaginationRequest(page = 1, limit = 10) {
  return createMockRequest({
    query: { page: String(page), limit: String(limit) }
  });
}

/**
 * Create a mock authenticated request
 */
export function createAuthenticatedRequest(userId: string, role: string = 'user'): any {
  return createMockRequest({
    user: {
      id: userId,
      email: `user-${userId}@test.com`,
      role
    }
  });
}

/**
 * Wait for async operations
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random ID for testing
 */
export function generateTestId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock database error
 */
export function createDatabaseError(
  message = 'Database error',
  code = 'DB_ERROR'
): Error & { code?: string } {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

/**
 * Create validation error
 */
export function createValidationError(field: string, message: string) {
  return {
    field,
    message,
    code: 'VALIDATION_ERROR'
  };
}

/**
 * Assert error response
 */
export function expectErrorResponse(
  res: Response & { _getJSONData?(): any },
  expectedMessage?: string
): void {
  if (!res._getJSONData) {
    throw new Error('Response mock does not support _getJSONData');
  }
  const data = res._getJSONData();
  expect(data).toHaveProperty('error');
  if (expectedMessage) {
    expect(data.error).toContain(expectedMessage);
  }
}

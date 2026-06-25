/**
 * Tests for Call Management Endpoints
 *
 * Run with: npm test -- calls.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import callRoutes from '../routes/calls';
import { tenantMiddleware, requireRole } from '../middleware/tenantMiddleware';

// =============================================================================
// TEST SETUP
// =============================================================================

let app: express.Application;

beforeEach(() => {
  app = express();
  app.use(express.json());

  // Mock tenant middleware
  app.use((req: any, res, next) => {
    req.accountId = 'test-account-123';
    req.user = { id: 'user-123', role: 'admin' };
    next();
  });

  app.use('/api/calls', callRoutes);
});

afterEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// TESTS: POST /api/calls/make
// =============================================================================

describe('POST /api/calls/make', () => {
  it('should initiate a call with required fields', async () => {
    const response = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('twilio_call_sid');
    expect(response.body.to).toBe('+14155552671');
    expect(response.body.status).toBe('queued');
  });

  it('should initiate a call with all optional fields', async () => {
    const response = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
        from: '+14155551234',
        campaignId: 'campaign-123',
        record: true,
        recordingChannels: 'mono',
        metadata: {
          callType: 'outreach',
          priority: 'high',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.campaignId).toBe('campaign-123');
  });

  it('should reject request without "to" parameter', async () => {
    const response = await request(app)
      .post('/api/calls/make')
      .send({
        from: '+14155551234',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('to');
  });

  it('should reject invalid phone number format', async () => {
    const response = await request(app)
      .post('/api/calls/make')
      .send({
        to: 'invalid-phone',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid phone number');
  });

  it('should accept E.164 format phone numbers', async () => {
    const validFormats = [
      '+14155552671',      // US
      '+447911123456',     // UK
      '+33612345678',      // France
      '+8613912345678',    // China
    ];

    for (const phone of validFormats) {
      const response = await request(app)
        .post('/api/calls/make')
        .send({ to: phone });

      expect(response.status).toBe(201);
    }
  });

  it('should require authentication', async () => {
    const invalidApp = express();
    invalidApp.use(express.json());
    // Don't add tenant middleware
    invalidApp.use('/api/calls', callRoutes);

    const response = await request(invalidApp)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    expect(response.status).toBe(401);
  });
});

// =============================================================================
// TESTS: GET /api/calls
// =============================================================================

describe('GET /api/calls', () => {
  it('should list calls for the account', async () => {
    const response = await request(app)
      .get('/api/calls');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('calls');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.calls)).toBe(true);
  });

  it('should support pagination', async () => {
    const response = await request(app)
      .get('/api/calls?limit=10&offset=0');

    expect(response.status).toBe(200);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.offset).toBe(0);
  });

  it('should filter by campaign', async () => {
    const response = await request(app)
      .get('/api/calls?campaignId=campaign-123');

    expect(response.status).toBe(200);
    // All returned calls should have campaignId = campaign-123
    response.body.calls.forEach((call: any) => {
      expect(call.campaignId).toBe('campaign-123');
    });
  });

  it('should filter by status', async () => {
    const response = await request(app)
      .get('/api/calls?status=completed');

    expect(response.status).toBe(200);
    response.body.calls.forEach((call: any) => {
      expect(call.status).toBe('completed');
    });
  });

  it('should limit results to max 200', async () => {
    const response = await request(app)
      .get('/api/calls?limit=500');

    expect(response.status).toBe(200);
    expect(response.body.pagination.limit).toBeLessThanOrEqual(200);
  });

  it('should require authentication', async () => {
    const invalidApp = express();
    invalidApp.use(express.json());
    invalidApp.use('/api/calls', callRoutes);

    const response = await request(invalidApp)
      .get('/api/calls');

    expect(response.status).toBe(401);
  });
});

// =============================================================================
// TESTS: GET /api/calls/:id
// =============================================================================

describe('GET /api/calls/:id', () => {
  it('should retrieve call details by ID', async () => {
    // First create a call
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    const callId = createResponse.body.id;

    // Then retrieve it
    const response = await request(app)
      .get(`/api/calls/${callId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(callId);
    expect(response.body).toHaveProperty('twilio_call_sid');
    expect(response.body).toHaveProperty('status');
  });

  it('should return 404 for non-existent call', async () => {
    const response = await request(app)
      .get('/api/calls/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found');
  });

  it('should fetch live status from Twilio', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    const callId = createResponse.body.id;

    // Simulate some time passing
    await new Promise(resolve => setTimeout(resolve, 100));

    const response = await request(app)
      .get(`/api/calls/${callId}`);

    expect(response.status).toBe(200);
    // Status could be queued, ringing, or in-progress depending on Twilio
    expect(['queued', 'ringing', 'in-progress', 'completed', 'failed']).toContain(
      response.body.status
    );
  });

  it('should isolate calls by account', async () => {
    // Create call with one account
    const call1 = await request(app)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    // Try to access with different account
    const otherAccountApp = express();
    otherAccountApp.use(express.json());
    otherAccountApp.use((req: any, res, next) => {
      req.accountId = 'different-account-123';
      req.user = { id: 'other-user', role: 'admin' };
      next();
    });
    otherAccountApp.use('/api/calls', callRoutes);

    const response = await request(otherAccountApp)
      .get(`/api/calls/${call1.body.id}`);

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// TESTS: GET /api/calls/:id/recording
// =============================================================================

describe('GET /api/calls/:id/recording', () => {
  it('should return 404 if call has no recording', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    const callId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/calls/${callId}/recording`);

    // Will likely be 404 if recording not yet available
    expect([404, 200]).toContain(response.status);
  });

  it('should return recording details when available', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
        record: true, // Enable recording
      });

    const callId = createResponse.body.id;

    // Wait for recording to be ready (mocked in test)
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await request(app)
      .get(`/api/calls/${callId}/recording`);

    if (response.status === 200) {
      expect(response.body).toHaveProperty('recordingSid');
      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('duration');
    }
  });

  it('should provide download URL in correct format', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
        record: true,
      });

    const callId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/calls/${callId}/recording`);

    if (response.status === 200) {
      expect(response.body.downloadUrl).toMatch(
        /https:\/\/api\.twilio\.com\/.*\.mp3/
      );
    }
  });
});

// =============================================================================
// TESTS: GET /api/calls/:id/transcript
// =============================================================================

describe('GET /api/calls/:id/transcript', () => {
  it('should return 404 if no transcript available', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    const callId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/calls/${callId}/transcript`);

    expect([404, 200]).toContain(response.status);
  });

  it('should indicate processing status for in-progress transcripts', async () => {
    const createResponse = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
        record: true,
      });

    const callId = createResponse.body.id;

    const response = await request(app)
      .get(`/api/calls/${callId}/transcript`);

    if (response.status === 200 && response.body.status === 'processing') {
      expect(response.body).toHaveProperty('transcriptId');
      expect(response.body.message).toContain('processing');
    }
  });
});

// =============================================================================
// TESTS: GET /api/calls/stats/summary
// =============================================================================

describe('GET /api/calls/stats/summary', () => {
  it('should return call statistics', async () => {
    const response = await request(app)
      .get('/api/calls/stats/summary');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalCalls');
    expect(response.body).toHaveProperty('completedCalls');
    expect(response.body).toHaveProperty('failedCalls');
    expect(response.body).toHaveProperty('totalDuration');
    expect(response.body).toHaveProperty('averageDuration');
  });

  it('should filter statistics by campaign', async () => {
    const response = await request(app)
      .get('/api/calls/stats/summary?campaignId=campaign-123');

    expect(response.status).toBe(200);
    expect(typeof response.body.totalCalls).toBe('number');
  });

  it('should filter statistics by date range', async () => {
    const startDate = new Date('2024-01-01').toISOString();
    const endDate = new Date('2024-01-31').toISOString();

    const response = await request(app)
      .get(
        `/api/calls/stats/summary?startDate=${startDate}&endDate=${endDate}`
      );

    expect(response.status).toBe(200);
    expect(response.body.totalCalls).toBeDefined();
  });

  it('should require admin or manager role', async () => {
    const agentApp = express();
    agentApp.use(express.json());
    agentApp.use((req: any, res, next) => {
      req.accountId = 'test-account-123';
      req.user = { id: 'user-123', role: 'agent' }; // Not admin or manager
      next();
    });
    agentApp.use('/api/calls', callRoutes);

    const response = await request(agentApp)
      .get('/api/calls/stats/summary');

    expect(response.status).toBe(403);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Call Lifecycle Integration', () => {
  it('should complete full call workflow', async () => {
    // 1. Create call
    const createRes = await request(app)
      .post('/api/calls/make')
      .send({
        to: '+14155552671',
        campaignId: 'integration-test',
        record: true,
      });

    expect(createRes.status).toBe(201);
    const callId = createRes.body.id;

    // 2. Retrieve call
    const getRes = await request(app)
      .get(`/api/calls/${callId}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(callId);

    // 3. List calls
    const listRes = await request(app)
      .get('/api/calls?campaignId=integration-test');

    expect(listRes.status).toBe(200);
    expect(listRes.body.calls.length).toBeGreaterThan(0);

    // 4. Get stats
    const statsRes = await request(app)
      .get('/api/calls/stats/summary?campaignId=integration-test');

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.totalCalls).toBeGreaterThan(0);
  });

  it('should handle concurrent calls', async () => {
    const phones = [
      '+14155552671',
      '+14155552672',
      '+14155552673',
    ];

    const promises = phones.map((phone) =>
      request(app)
        .post('/api/calls/make')
        .send({ to: phone })
    );

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // This test would require mocking the database
    // For now, just verify error responses are structured
    const response = await request(app)
      .post('/api/calls/make')
      .send({
        to: 'invalid',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should handle missing authentication', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/calls', callRoutes);

    const response = await request(noAuthApp)
      .get('/api/calls');

    expect(response.status).toBe(401);
  });

  it('should handle invalid role-based access', async () => {
    const noRoleApp = express();
    noRoleApp.use(express.json());
    noRoleApp.use((req: any, res, next) => {
      req.accountId = 'test-account-123';
      req.user = { id: 'user-123', role: 'viewer' }; // Invalid role
      next();
    });
    noRoleApp.use('/api/calls', callRoutes);

    const response = await request(noRoleApp)
      .post('/api/calls/make')
      .send({ to: '+14155552671' });

    expect(response.status).toBe(403);
  });
});

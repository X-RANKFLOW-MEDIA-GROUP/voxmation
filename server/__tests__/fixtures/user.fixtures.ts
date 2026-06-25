/**
 * User Test Fixtures
 * Provides mock user data for testing authentication and user management
 */

export const mockUsers = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@test.com',
    password_hash: 'hashed_password_admin',
    role: 'admin',
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  regular: {
    id: 'user-regular-001',
    email: 'user@test.com',
    password_hash: 'hashed_password_user',
    role: 'user',
    is_active: true,
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02')
  },
  inactive: {
    id: 'user-inactive-001',
    email: 'inactive@test.com',
    password_hash: 'hashed_password_inactive',
    role: 'user',
    is_active: false,
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03')
  }
};

export const mockAuthPayloads = {
  validLogin: {
    email: 'user@test.com',
    password: 'password123'
  },
  invalidEmail: {
    email: 'nonexistent@test.com',
    password: 'password123'
  },
  invalidPassword: {
    email: 'user@test.com',
    password: 'wrongpassword'
  },
  missingEmail: {
    password: 'password123'
  },
  missingPassword: {
    email: 'user@test.com'
  }
};

export const mockTokens = {
  validJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXJlZ3VsYXItMDAxIiwiZW1haWwiOiJ1c2VyQHRlc3QuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MzQ1NjAwMDB9.test',
  expiredJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXJlZ3VsYXItMDAxIiwiZXhwIjoxNjM0NTYwMDAwfQ.expired',
  invalidJWT: 'invalid.jwt.token'
};

// Jest setup file
// Add custom matchers or global test setup here

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';


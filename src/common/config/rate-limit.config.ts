import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute for all endpoints
    },
  ],
};

export const rateLimitOptions = {
  // General API endpoints
  default: {
    ttl: 60000,
    limit: 100,
  },
  // Payment endpoints (more restrictive)
  payment: {
    ttl: 60000,
    limit: 20,
  },
  // Authentication endpoints (most restrictive)
  auth: {
    ttl: 60000,
    limit: 10,
  },
  // Search endpoints (moderate)
  search: {
    ttl: 60000,
    limit: 50,
  },
};

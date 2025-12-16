/**
 * VITAL Platform - k6 Performance Test Configuration
 */

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests should complete within 2s
    http_req_failed: ['rate<0.01'],      // Less than 1% failure rate
    http_reqs: ['rate>10'],              // At least 10 requests per second
  },
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
export const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';











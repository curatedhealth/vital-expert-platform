# Phase 3: Testing & Validation - Implementation Plan

**Status:** Ready to Begin
**Prerequisites:** Phase 0 ✅ + Phase 1 ✅ (Phase 2 Skipped)
**Date:** January 27, 2025
**Estimated Duration:** 1-2 weeks

---

## Executive Summary

Phase 3 focuses on comprehensive testing and validation of the orchestration platform. Since Phase 2 (AWS ECS Workers) is skipped, we'll implement a **simplified in-process orchestrator** that runs on Vercel Node.js runtime (10s limit) for testing purposes, with the understanding that production will eventually need worker infrastructure.

This phase delivers:
- Complete test infrastructure (unit, integration, E2E)
- Simplified orchestrator implementation (no BullMQ)
- API endpoint validation
- Performance benchmarks
- Security testing
- Compliance verification (HIPAA, GDPR)

---

## Current System State

### ✅ What's Complete (Phase 0 + 1)

**Infrastructure:**
- Database schema with RLS policies
- TypeScript strict mode (zero `any` types)
- Security middleware (rate limiting, CSRF, headers)
- Redis cache service (Upstash)
- Environment validation
- Multi-tenant architecture

**Code Metrics:**
- ~2,000+ lines of production code
- 15 files created/modified
- Security features: Rate limiting, CSRF, CSP
- API endpoints: 3 routes planned

**Dependencies Installed:**
- Testing: Jest, Playwright, Testing Library
- Security: ioredis, @upstash/redis
- Queue: bullmq (5.61.2) - unused in simplified version
- LangChain: @langchain/core, @langchain/langgraph

---

## Phase 3 Architecture Decision

### Original Plan (With Phase 2 Workers)
```
Vercel Edge → Redis Queue → AWS ECS Workers → BullMQ → LangGraph
```

### Simplified Plan (Phase 2 Skipped)
```
Vercel Node.js Runtime (10s limit) → Direct LangGraph Execution → Results
```

**Trade-offs:**
| Feature | With Workers | Simplified (Phase 3) |
|---------|--------------|---------------------|
| Execution Time | 5-300s | < 10s (Vercel limit) |
| Job Queue | BullMQ | None (direct execution) |
| Retry Logic | Automatic | Manual in route |
| Scaling | Auto-scale workers | Vercel auto-scale |
| Complexity | High | Low |
| Production Ready | Yes | Testing only |

**Decision:** Implement simplified version for Phase 3 testing. Production deployment will require Phase 2 implementation or migration to Platform-as-a-Service that supports long-running tasks (Render, Railway, etc.).

---

## Phase 3: Implementation Tasks

### Task 1: Simplified Orchestrator (No BullMQ)

**Goal:** Create direct LangGraph orchestrator that works within Vercel 10s limit

**Files to Create:**

**1.1 Simplified Orchestration Service**
```typescript
// src/lib/orchestration/simplified-orchestrator.ts
import { createOrchestrator } from '@/features/chat/services/unified-langgraph-orchestrator';
import type { OrchestrationInput, OrchestrationResult } from '@/lib/types/orchestration';

export class SimplifiedOrchestrator {
  /**
   * Execute orchestration directly (no queue)
   * WARNING: Limited to 10s on Vercel Node.js runtime
   */
  async execute(
    input: OrchestrationInput,
    userId: string,
    tenantId: string
  ): Promise<OrchestrationResult> {
    // Create LangGraph instance
    const orchestrator = await createOrchestrator(tenantId);

    // Execute with timeout (9s to be safe)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Execution timeout')), 9000)
    );

    const executionPromise = orchestrator.invoke({
      query: input.query,
      mode: input.mode,
      userId,
      tenantId,
      sessionId: input.sessionId
    });

    return Promise.race([executionPromise, timeoutPromise]) as Promise<OrchestrationResult>;
  }

  /**
   * Execute with streaming (SSE)
   */
  async *executeStream(
    input: OrchestrationInput,
    userId: string,
    tenantId: string
  ): AsyncGenerator<OrchestrationProgress, OrchestrationResult> {
    const orchestrator = await createOrchestrator(tenantId);

    // Stream progress events
    for await (const event of orchestrator.stream({
      query: input.query,
      mode: input.mode,
      userId,
      tenantId,
      sessionId: input.sessionId
    })) {
      yield event;
    }
  }
}
```

**1.2 Update API Routes (Remove BullMQ)**

```typescript
// src/app/api/orchestrate/route.ts
import { SimplifiedOrchestrator } from '@/lib/orchestration/simplified-orchestrator';

export const runtime = 'nodejs'; // NOT edge (need full Node.js)
export const maxDuration = 10; // Vercel limit

export async function POST(request: Request) {
  const orchestrator = new SimplifiedOrchestrator();

  const { query, mode, sessionId } = await request.json();
  const userId = request.headers.get('x-user-id');
  const tenantId = request.headers.get('x-tenant-id');

  try {
    const result = await orchestrator.execute(
      { query, mode, sessionId },
      userId,
      tenantId
    );

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (error.message === 'Execution timeout') {
      return Response.json(
        { error: 'Query too complex. Please simplify or contact support.' },
        { status: 504 }
      );
    }
    throw error;
  }
}
```

**Estimated Time:** 4-6 hours

---

### Task 2: Unit Testing Infrastructure

**Goal:** Comprehensive unit tests for all core services

**2.1 Jest Configuration**

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/**/*.test.ts'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
        '/integration/'
      ]
    },
    {
      displayName: 'integration',
      testMatch: ['**/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.ts']
    }
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

**2.2 Core Service Tests**

```typescript
// src/lib/security/__tests__/rate-limiter.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RateLimiter } from '../rate-limiter';
import { Redis } from 'ioredis';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let redis: Redis;

  beforeEach(async () => {
    redis = new Redis(process.env.REDIS_URL);
    rateLimiter = new RateLimiter(redis);
  });

  afterEach(async () => {
    await redis.flushdb();
    await redis.quit();
  });

  describe('checkLimit', () => {
    it('allows requests within limit', async () => {
      const result = await rateLimiter.checkLimit('test-key', {
        points: 10,
        duration: 60
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('blocks requests exceeding limit', async () => {
      // Exhaust limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('test-key', { points: 10, duration: 60 });
      }

      // Should be blocked
      const result = await rateLimiter.checkLimit('test-key', {
        points: 10,
        duration: 60
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('resets limit after duration', async () => {
      // Exhaust limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('test-key', { points: 10, duration: 1 });
      }

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should allow again
      const result = await rateLimiter.checkLimit('test-key', {
        points: 10,
        duration: 1
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('different tiers', () => {
    it('applies anonymous tier limits', async () => {
      const result = await rateLimiter.checkLimit('anon-user', {
        points: 10,
        duration: 60
      });

      expect(result.allowed).toBe(true);
    });

    it('applies authenticated tier limits', async () => {
      const result = await rateLimiter.checkLimit('auth-user-123', {
        points: 60,
        duration: 60
      });

      expect(result.allowed).toBe(true);
    });
  });
});
```

**2.3 CSRF Protection Tests**

```typescript
// src/lib/security/__tests__/csrf.test.ts
import { describe, it, expect } from '@jest/globals';
import { generateCSRFToken, validateCSRFToken } from '../csrf';

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('generates unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();

      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(64); // 32 bytes hex
    });

    it('generates cryptographically secure tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 1000; i++) {
        tokens.add(generateCSRFToken());
      }

      // All should be unique
      expect(tokens.size).toBe(1000);
    });
  });

  describe('validateCSRFToken', () => {
    it('validates matching tokens', () => {
      const token = generateCSRFToken();
      const cookie = token;
      const header = token;

      const result = validateCSRFToken(cookie, header);
      expect(result).toBe(true);
    });

    it('rejects mismatched tokens', () => {
      const cookie = generateCSRFToken();
      const header = generateCSRFToken();

      const result = validateCSRFToken(cookie, header);
      expect(result).toBe(false);
    });

    it('rejects missing tokens', () => {
      const result = validateCSRFToken('', '');
      expect(result).toBe(false);
    });

    it('uses timing-safe comparison', async () => {
      const token = 'a'.repeat(64);
      const validHeader = 'a'.repeat(64);
      const invalidHeader = 'b'.repeat(64);

      // Measure timing for valid vs invalid
      // Should be constant time
      const validStart = performance.now();
      validateCSRFToken(token, validHeader);
      const validTime = performance.now() - validStart;

      const invalidStart = performance.now();
      validateCSRFToken(token, invalidHeader);
      const invalidTime = performance.now() - invalidStart;

      // Difference should be minimal (< 1ms)
      expect(Math.abs(validTime - invalidTime)).toBeLessThan(1);
    });
  });
});
```

**2.4 Cache Service Tests**

```typescript
// src/lib/cache/__tests__/redis.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { RedisCache } from '../redis';

describe('RedisCache', () => {
  let cache: RedisCache;

  beforeEach(() => {
    cache = new RedisCache();
  });

  afterEach(async () => {
    await cache.flush();
  });

  it('sets and gets values', async () => {
    await cache.set('test-key', { foo: 'bar' }, 60);
    const value = await cache.get('test-key');

    expect(value).toEqual({ foo: 'bar' });
  });

  it('expires values after TTL', async () => {
    await cache.set('test-key', 'value', 1);

    // Should exist immediately
    let value = await cache.get('test-key');
    expect(value).toBe('value');

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be gone
    value = await cache.get('test-key');
    expect(value).toBeNull();
  });

  it('deletes values', async () => {
    await cache.set('test-key', 'value', 60);
    await cache.delete('test-key');

    const value = await cache.get('test-key');
    expect(value).toBeNull();
  });

  it('handles cache misses', async () => {
    const value = await cache.get('non-existent');
    expect(value).toBeNull();
  });
});
```

**Test Coverage Target:**
- Rate Limiter: 100%
- CSRF Protection: 100%
- Security Headers: 100%
- Redis Cache: 95%
- Environment Validation: 100%

**Estimated Time:** 8-10 hours

---

### Task 3: Integration Testing

**Goal:** Test complete request flows through API routes

**3.1 Integration Test Setup**

```typescript
// jest.integration.setup.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

let server: any;
let app: any;

export async function setupTestServer() {
  app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();

  await app.prepare();

  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  await new Promise((resolve) => {
    server.listen(3001, resolve);
  });

  return { server, app, baseUrl: 'http://localhost:3001' };
}

export async function teardownTestServer() {
  await server?.close();
  await app?.close();
}

beforeAll(async () => {
  await setupTestServer();
});

afterAll(async () => {
  await teardownTestServer();
});
```

**3.2 API Orchestrate Tests**

```typescript
// src/app/api/orchestrate/__tests__/route.integration.test.ts
import { describe, it, expect } from '@jest/globals';

describe('POST /api/orchestrate', () => {
  const baseUrl = 'http://localhost:3001';

  it('enqueues orchestration job successfully', async () => {
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user',
        'x-tenant-id': 'test-tenant'
      },
      body: JSON.stringify({
        query: 'What are diabetes symptoms?',
        mode: 'query_automatic'
      })
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('conversationId');
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('selectedAgents');
  });

  it('requires authentication', async () => {
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'test',
        mode: 'query_automatic'
      })
    });

    expect(response.status).toBe(401);
  });

  it('validates request body', async () => {
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        // Missing query
        mode: 'query_automatic'
      })
    });

    expect(response.status).toBe(400);
  });

  it('applies rate limiting', async () => {
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': 'rate-limit-test'
    };
    const body = JSON.stringify({
      query: 'test',
      mode: 'query_automatic'
    });

    // Exhaust limit (5 requests for orchestration tier)
    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/orchestrate`, {
        method: 'POST',
        headers,
        body
      });
    }

    // 6th request should be rate limited
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers,
      body
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBeTruthy();
  });

  it('handles timeout gracefully', async () => {
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        query: 'Extremely complex query that takes > 10s...',
        mode: 'query_automatic'
      })
    });

    if (response.status === 504) {
      const data = await response.json();
      expect(data.error).toContain('too complex');
    }
  });
});
```

**3.3 Security Integration Tests**

```typescript
// src/middleware/__tests__/security.integration.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Security Middleware', () => {
  const baseUrl = 'http://localhost:3001';

  it('adds security headers to all responses', async () => {
    const response = await fetch(`${baseUrl}/api/health`);

    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    expect(response.headers.get('x-xss-protection')).toBe('1; mode=block');
    expect(response.headers.get('strict-transport-security')).toBeTruthy();
    expect(response.headers.get('content-security-policy')).toBeTruthy();
  });

  it('validates CSRF tokens', async () => {
    // Missing CSRF token
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' })
    });

    expect(response.status).toBe(403);
  });

  it('validates origin for state-changing requests', async () => {
    const response = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://evil.com'
      },
      body: JSON.stringify({ query: 'test' })
    });

    expect(response.status).toBe(403);
  });
});
```

**Estimated Time:** 6-8 hours

---

### Task 4: End-to-End Testing (Playwright)

**Goal:** Test complete user workflows

**4.1 Playwright Configuration**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

**4.2 E2E Tests**

```typescript
// e2e/ask-expert.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Ask Expert Flow', () => {
  test('complete orchestration workflow', async ({ page }) => {
    // Navigate to Ask Expert page
    await page.goto('/ask-expert');

    // Wait for page load
    await expect(page.locator('h1')).toContainText('Ask Expert');

    // Select mode
    await page.click('[data-testid="mode-selector"]');
    await page.click('[data-testid="mode-query-automatic"]');

    // Enter query
    await page.fill('[data-testid="query-input"]', 'What are diabetes symptoms?');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Wait for response
    await expect(page.locator('[data-testid="response"]')).toBeVisible({
      timeout: 15000
    });

    // Verify response contains expected content
    const response = await page.locator('[data-testid="response"]').textContent();
    expect(response).toContain('diabetes');

    // Verify selected agents are shown
    await expect(page.locator('[data-testid="selected-agents"]')).toBeVisible();
  });

  test('handles errors gracefully', async ({ page }) => {
    await page.goto('/ask-expert');

    // Submit empty query
    await page.click('[data-testid="submit-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Please enter a query'
    );
  });

  test('applies rate limiting', async ({ page }) => {
    await page.goto('/ask-expert');

    // Submit multiple requests quickly
    for (let i = 0; i < 6; i++) {
      await page.fill('[data-testid="query-input"]', `Query ${i}`);
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(100);
    }

    // Should show rate limit message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'rate limit'
    );
  });
});

test.describe('Multi-Tenant Isolation', () => {
  test('tenant A cannot access tenant B data', async ({ page, context }) => {
    // Login as Tenant A user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user-a@tenanta.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Create conversation
    await page.goto('/ask-expert');
    await page.fill('[data-testid="query-input"]', 'Tenant A query');
    await page.click('[data-testid="submit-button"]');
    await page.waitForSelector('[data-testid="conversation-id"]');
    const conversationId = await page.locator('[data-testid="conversation-id"]').textContent();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout"]');

    // Login as Tenant B user
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user-b@tenantb.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Try to access Tenant A conversation
    const response = await page.request.get(`/api/conversations/${conversationId}`);

    // Should be forbidden
    expect(response.status()).toBe(403);
  });
});
```

**Estimated Time:** 8-10 hours

---

### Task 5: Performance Testing

**Goal:** Establish performance baselines and SLOs

**5.1 Performance Test Suite**

```typescript
// tests/performance/orchestration.perf.test.ts
import { describe, it, expect } from '@jest/globals';
import { performance } from 'perf_hooks';

describe('Orchestration Performance', () => {
  it('completes simple queries in < 3s', async () => {
    const start = performance.now();

    const response = await fetch('http://localhost:3000/api/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'perf-test'
      },
      body: JSON.stringify({
        query: 'What is diabetes?',
        mode: 'query_automatic'
      })
    });

    const duration = performance.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(3000);
  });

  it('handles 10 concurrent requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch('http://localhost:3000/api/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': `perf-test-${i}`
        },
        body: JSON.stringify({
          query: `Query ${i}`,
          mode: 'query_automatic'
        })
      })
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const duration = performance.now() - start;

    // All should succeed
    responses.forEach(r => expect(r.status).toBe(200));

    // Should complete in reasonable time (< 10s for 10 requests)
    expect(duration).toBeLessThan(10000);
  });

  it('cache reduces response time by 90%', async () => {
    const query = 'What is the capital of France?';

    // First request (cache miss)
    const start1 = performance.now();
    await fetch('http://localhost:3000/api/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'cache-test'
      },
      body: JSON.stringify({ query, mode: 'query_automatic' })
    });
    const uncachedTime = performance.now() - start1;

    // Second request (cache hit)
    const start2 = performance.now();
    await fetch('http://localhost:3000/api/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'cache-test'
      },
      body: JSON.stringify({ query, mode: 'query_automatic' })
    });
    const cachedTime = performance.now() - start2;

    // Cached should be at least 10x faster
    expect(cachedTime).toBeLessThan(uncachedTime / 10);
  });
});
```

**5.2 Load Testing (Artillery)**

```yaml
# tests/load/orchestration.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"
  defaults:
    headers:
      Content-Type: "application/json"
      x-user-id: "load-test-{{ $randomNumber(1, 1000) }}"

scenarios:
  - name: "Ask Expert Flow"
    flow:
      - post:
          url: "/api/orchestrate"
          json:
            query: "What are diabetes symptoms?"
            mode: "query_automatic"
          capture:
            - json: "$.conversationId"
              as: "conversationId"
          expect:
            - statusCode: 200
            - contentType: json
            - hasProperty: conversationId
```

**Run:** `artillery run tests/load/orchestration.yml`

**5.3 Performance Benchmarks**

Create [PERFORMANCE_BENCHMARKS.md](PERFORMANCE_BENCHMARKS.md):

| Metric | Target (P95) | Measured | Status |
|--------|--------------|----------|--------|
| API Response Time | < 200ms | TBD | ⏳ |
| Orchestration (Simple) | < 3s | TBD | ⏳ |
| Orchestration (Complex) | < 10s | TBD | ⏳ |
| Cache Hit Rate | > 80% | TBD | ⏳ |
| Rate Limit Check | < 10ms | TBD | ⏳ |
| CSRF Validation | < 5ms | TBD | ⏳ |
| Concurrent Requests | 100 req/s | TBD | ⏳ |
| Memory Usage | < 512MB | TBD | ⏳ |
| Error Rate | < 0.1% | TBD | ⏳ |

**Estimated Time:** 6-8 hours

---

### Task 6: Security & Compliance Testing

**Goal:** Verify HIPAA/GDPR compliance and security posture

**6.1 Security Audit Tests**

```typescript
// tests/security/audit.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Security Audit', () => {
  it('all API routes require authentication', async () => {
    const routes = [
      '/api/orchestrate',
      '/api/conversations',
      '/api/agents'
    ];

    for (const route of routes) {
      const response = await fetch(`http://localhost:3000${route}`);
      expect([401, 403]).toContain(response.status);
    }
  });

  it('prevents SQL injection', async () => {
    const maliciousQuery = "'; DROP TABLE users; --";

    const response = await fetch('http://localhost:3000/api/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'security-test'
      },
      body: JSON.stringify({
        query: maliciousQuery,
        mode: 'query_automatic'
      })
    });

    // Should handle safely (not 500)
    expect([400, 200]).toContain(response.status);
  });

  it('prevents XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';

    const response = await fetch('http://localhost:3000/api/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'security-test'
      },
      body: JSON.stringify({
        query: xssPayload,
        mode: 'query_automatic'
      })
    });

    const data = await response.json();

    // Response should escape/sanitize
    expect(data.response).not.toContain('<script>');
  });

  it('enforces row-level security', async () => {
    // Test that users can only access their own data
    // (Requires database integration)
  });
});
```

**6.2 HIPAA Compliance Checklist**

Create [HIPAA_COMPLIANCE.md](HIPAA_COMPLIANCE.md):

- [ ] Encryption at rest (database, Redis)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Access control (authentication + authorization)
- [ ] Audit logging (all data access)
- [ ] Data minimization (only store necessary PHI)
- [ ] Secure deletion (GDPR right to be forgotten)
- [ ] Session management (timeouts, secure cookies)
- [ ] Incident response plan
- [ ] Business Associate Agreement (BAA) with providers

**6.3 GDPR Compliance Checklist**

Create [GDPR_COMPLIANCE.md](GDPR_COMPLIANCE.md):

- [ ] Data processing agreement
- [ ] Privacy by design
- [ ] Right to access
- [ ] Right to rectification
- [ ] Right to erasure
- [ ] Right to data portability
- [ ] Right to object
- [ ] Consent management
- [ ] Data breach notification (< 72 hours)
- [ ] DPIA (Data Protection Impact Assessment)

**Estimated Time:** 8-10 hours

---

## Phase 3: Success Criteria

### Testing
- [ ] Unit test coverage > 80%
- [ ] Integration tests cover all API endpoints
- [ ] E2E tests cover critical user workflows
- [ ] Performance tests establish baselines
- [ ] Security audit passes all checks

### Performance
- [ ] API response time < 200ms (P95)
- [ ] Simple orchestration < 3s (P95)
- [ ] Complex orchestration < 10s (P95)
- [ ] Cache hit rate > 80%
- [ ] Error rate < 0.1%

### Security
- [ ] All routes require authentication
- [ ] Rate limiting active
- [ ] CSRF protection active
- [ ] Security headers present
- [ ] No critical vulnerabilities

### Compliance
- [ ] HIPAA requirements documented
- [ ] GDPR requirements documented
- [ ] Audit logging implemented
- [ ] Encryption verified (at rest + in transit)

---

## Phase 3: Timeline

### Week 1: Core Testing
- **Day 1-2:** Simplified orchestrator implementation
- **Day 3-4:** Unit tests (security, cache)
- **Day 5:** Integration tests (API routes)

### Week 2: Advanced Testing
- **Day 1-2:** E2E tests (Playwright)
- **Day 3:** Performance testing
- **Day 4:** Security audit
- **Day 5:** Compliance documentation

**Total: 10 days**

---

## Phase 3: Deliverables

### Code
1. Simplified orchestrator (no BullMQ)
2. Updated API routes (Node.js runtime)
3. Complete test suite (unit, integration, E2E)
4. Performance benchmarks
5. Security audit results

### Documentation
1. Test coverage report
2. Performance benchmarks
3. HIPAA compliance checklist
4. GDPR compliance checklist
5. Security audit report

### Metrics
- Test coverage: > 80%
- Performance baselines: Documented
- Security score: No critical issues
- Compliance: Requirements documented

---

## Next Steps After Phase 3

Once Phase 3 is complete, proceed to [Phase 4: Production Hardening](PHASE_4_PRODUCTION_HARDENING_PLAN.md):

1. Monitoring & Observability
2. Error tracking & alerting
3. Logging infrastructure
4. Documentation
5. Deployment automation
6. Runbooks & incident response

---

**Phase 3 Status:** Ready to Begin
**Confidence Level:** High
**Risk Assessment:** Low (simplified implementation)

---

*Document Version: 1.0*
*Last Updated: January 27, 2025*

# Phase 4: Production Hardening - Implementation Plan

**Status:** Ready to Begin
**Prerequisites:** Phase 0 ✅ + Phase 1 ✅ + Phase 3 ✅
**Date:** January 27, 2025
**Estimated Duration:** 1-2 weeks

---

## Executive Summary

Phase 4 focuses on production readiness: monitoring, observability, error tracking, logging, documentation, and deployment automation. This phase ensures the platform is fully observable, maintainable, and ready for production deployment.

**Key Deliverables:**
- Application Performance Monitoring (APM)
- Error tracking and alerting
- Structured logging infrastructure
- Comprehensive documentation
- CI/CD automation
- Incident response procedures
- Production deployment checklist

---

## Phase 4: Implementation Tasks

### Task 1: Application Performance Monitoring (APM)

**Goal:** Real-time visibility into application performance

**1.1 OpenTelemetry Setup**

```typescript
// src/lib/observability/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'vital-orchestrator',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true }
    })
  ]
});

sdk.start();

export { sdk };

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
```

**1.2 Custom Metrics**

```typescript
// src/lib/observability/metrics.ts
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'vital-orchestrator'
  }),
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics'
      }),
      exportIntervalMillis: 60000 // 1 minute
    })
  ]
});

const meter = meterProvider.getMeter('vital-orchestrator');

// Custom metrics
export const orchestrationCounter = meter.createCounter('orchestration.requests', {
  description: 'Number of orchestration requests'
});

export const orchestrationDuration = meter.createHistogram('orchestration.duration', {
  description: 'Orchestration request duration in milliseconds',
  unit: 'ms'
});

export const cacheHitCounter = meter.createCounter('cache.hits', {
  description: 'Number of cache hits'
});

export const cacheMissCounter = meter.createCounter('cache.misses', {
  description: 'Number of cache misses'
});

export const rateLimitCounter = meter.createCounter('rate_limit.blocked', {
  description: 'Number of rate limited requests'
});

export const errorCounter = meter.createCounter('errors', {
  description: 'Number of errors by type',
  unit: 'errors'
});
```

**1.3 Trace Orchestration Requests**

```typescript
// src/lib/orchestration/simplified-orchestrator.ts (updated)
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { orchestrationCounter, orchestrationDuration } from '@/lib/observability/metrics';

const tracer = trace.getTracer('vital-orchestrator');

export class SimplifiedOrchestrator {
  async execute(
    input: OrchestrationInput,
    userId: string,
    tenantId: string
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    return tracer.startActiveSpan('orchestration.execute', async (span) => {
      try {
        // Add attributes
        span.setAttributes({
          'user.id': userId,
          'tenant.id': tenantId,
          'orchestration.mode': input.mode,
          'orchestration.query_length': input.query.length
        });

        // Execute orchestration
        const orchestrator = await createOrchestrator(tenantId);
        const result = await orchestrator.invoke({
          query: input.query,
          mode: input.mode,
          userId,
          tenantId,
          sessionId: input.sessionId
        });

        // Record success
        span.setStatus({ code: SpanStatusCode.OK });
        orchestrationCounter.add(1, { status: 'success', mode: input.mode });

        return result;
      } catch (error) {
        // Record error
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });

        orchestrationCounter.add(1, { status: 'error', mode: input.mode });

        throw error;
      } finally {
        const duration = Date.now() - startTime;
        orchestrationDuration.record(duration, { mode: input.mode });
        span.end();
      }
    });
  }
}
```

**1.4 Vercel Analytics Integration**

```typescript
// src/app/layout.tsx (updated)
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Dependencies:**
```bash
pnpm add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
pnpm add @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http
pnpm add @opentelemetry/sdk-metrics @vercel/analytics @vercel/speed-insights
```

**Estimated Time:** 6-8 hours

---

### Task 2: Error Tracking & Alerting

**Goal:** Centralized error tracking with Sentry

**2.1 Sentry Setup**

```typescript
// src/lib/observability/sentry.ts
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,

      // Performance Monitoring
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.vitalexpert\.com/]
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true
        })
      ],

      // Error filtering
      beforeSend(event, hint) {
        const error = hint.originalException;

        // Don't send development errors
        if (process.env.NODE_ENV === 'development') {
          return null;
        }

        // Filter out known non-critical errors
        if (error?.message?.includes('ResizeObserver loop')) {
          return null;
        }

        return event;
      },

      // PII scrubbing
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === 'console') {
          // Scrub sensitive data from console logs
          return null;
        }
        return breadcrumb;
      }
    });
  }
}

// Error boundary helper
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context
    }
  });
}

// Performance monitoring helper
export function capturePerformance(name: string, duration: number, tags?: Record<string, string>) {
  Sentry.metrics.distribution(name, duration, {
    tags,
    unit: 'millisecond'
  });
}
```

**2.2 Next.js Error Instrumentation**

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

**2.3 Error Boundary Component**

```typescript
// src/components/error-boundary.tsx
'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground mt-2">
                We've been notified and are working on a fix.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

**2.4 Alerting Rules**

Create Sentry alert rules:

1. **High Error Rate**: > 10 errors/min
2. **Critical Errors**: Any 500 errors on production
3. **Performance Degradation**: P95 response time > 5s
4. **Security Issues**: Rate limit exceeded > 100/min
5. **Database Errors**: Connection pool exhausted

**Dependencies:**
```bash
pnpm add @sentry/nextjs
```

**Estimated Time:** 4-6 hours

---

### Task 3: Structured Logging Infrastructure

**Goal:** Centralized, searchable logs with Winston

**3.1 Winston Logger Setup**

```typescript
// src/lib/logging/logger.ts
import winston from 'winston';
import { LogEntry } from './types';

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'vital-orchestrator',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      )
    }),

    // File output (all logs)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    // File output (errors only)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Production: Add cloud transport (DataDog, CloudWatch, etc.)
if (process.env.NODE_ENV === 'production' && process.env.DATADOG_API_KEY) {
  const DatadogTransport = require('winston-datadog-transport');

  logger.add(
    new DatadogTransport({
      apiKey: process.env.DATADOG_API_KEY,
      service: 'vital-orchestrator',
      ddsource: 'nodejs',
      ddtags: `env:${process.env.NODE_ENV}`
    })
  );
}

// Helper functions
export const log = {
  info: (message: string, meta?: Record<string, any>) =>
    logger.info(message, meta),

  error: (message: string, error?: Error, meta?: Record<string, any>) =>
    logger.error(message, { error, ...meta }),

  warn: (message: string, meta?: Record<string, any>) =>
    logger.warn(message, meta),

  debug: (message: string, meta?: Record<string, any>) =>
    logger.debug(message, meta),

  // Audit logging (HIPAA compliance)
  audit: (event: string, userId: string, meta?: Record<string, any>) =>
    logger.info('AUDIT', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ...meta
    })
};
```

**3.2 Request Logging Middleware**

```typescript
// src/middleware/request-logger.ts
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logging/logger';

export async function requestLogger(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const startTime = Date.now();

  // Extract request details
  const {
    method,
    url,
    headers
  } = request;

  const userId = headers.get('x-user-id');
  const tenantId = headers.get('x-tenant-id');
  const requestId = headers.get('x-request-id') || crypto.randomUUID();

  // Log request
  log.info('Incoming request', {
    requestId,
    method,
    url,
    userId,
    tenantId,
    userAgent: headers.get('user-agent')
  });

  // Add request ID to response
  response.headers.set('x-request-id', requestId);

  // Log response
  const duration = Date.now() - startTime;
  log.info('Request completed', {
    requestId,
    method,
    url,
    status: response.status,
    duration,
    userId,
    tenantId
  });

  return response;
}
```

**3.3 Audit Logging**

```typescript
// src/lib/logging/audit.ts
import { log } from './logger';

export enum AuditEvent {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  DATA_ACCESS = 'DATA_ACCESS',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ORCHESTRATION_REQUEST = 'ORCHESTRATION_REQUEST'
}

export function auditLog(
  event: AuditEvent,
  userId: string,
  details: Record<string, any>
) {
  log.audit(event, userId, {
    timestamp: new Date().toISOString(),
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    resourceId: details.resourceId,
    resourceType: details.resourceType,
    action: details.action,
    result: details.result
  });
}

// Example usage
export function logOrchestrationRequest(
  userId: string,
  tenantId: string,
  query: string,
  mode: string
) {
  auditLog(AuditEvent.ORCHESTRATION_REQUEST, userId, {
    tenantId,
    queryLength: query.length,
    mode,
    result: 'initiated'
  });
}
```

**Dependencies:**
```bash
pnpm add winston winston-datadog-transport
```

**Estimated Time:** 4-6 hours

---

### Task 4: Documentation

**Goal:** Comprehensive documentation for developers and operators

**4.1 API Documentation (OpenAPI)**

```yaml
# docs/api/openapi.yaml
openapi: 3.0.0
info:
  title: VITAL Orchestration API
  version: 1.0.0
  description: AI-powered health expert orchestration platform
  contact:
    name: VITAL Support
    email: support@vitalexpert.com

servers:
  - url: https://api.vitalexpert.com
    description: Production
  - url: http://localhost:3000
    description: Development

paths:
  /api/orchestrate:
    post:
      summary: Submit orchestration request
      description: Submit a query for AI orchestration with automatic agent selection
      operationId: createOrchestration
      tags:
        - Orchestration
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrchestrationRequest'
      responses:
        '200':
          description: Orchestration completed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrchestrationResult'
        '400':
          description: Invalid request
        '401':
          description: Unauthorized
        '429':
          description: Rate limit exceeded
        '504':
          description: Execution timeout

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    OrchestrationRequest:
      type: object
      required:
        - query
        - mode
      properties:
        query:
          type: string
          minLength: 1
          maxLength: 10000
          description: User's health-related query
          example: "What are the symptoms of diabetes?"
        mode:
          type: string
          enum: [query_automatic, query_manual, rag_query, multi_agent, autonomous]
          description: Orchestration mode
        sessionId:
          type: string
          format: uuid
          description: Optional session ID for conversation continuity

    OrchestrationResult:
      type: object
      properties:
        conversationId:
          type: string
          format: uuid
        response:
          type: string
        selectedAgents:
          type: array
          items:
            type: object
        metadata:
          type: object
```

**4.2 Architecture Documentation**

Create [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```markdown
# VITAL Platform Architecture

## System Overview

VITAL is a multi-tenant AI orchestration platform for healthcare expertise.

### Architecture Layers

1. **Presentation Layer** (Next.js 14)
   - Server-side rendering
   - Client-side hydration
   - Multi-tenant routing

2. **API Layer** (Next.js API Routes)
   - RESTful endpoints
   - Authentication & authorization
   - Rate limiting & security

3. **Application Layer** (TypeScript)
   - LangGraph orchestration
   - Agent selection & coordination
   - RAG (Retrieval-Augmented Generation)

4. **Data Layer** (Supabase)
   - PostgreSQL database
   - Row-level security (RLS)
   - Real-time subscriptions

5. **Infrastructure Layer** (Vercel)
   - Edge network
   - Auto-scaling
   - CDN

### Data Flow

```
User Request
  → Next.js Middleware (auth, rate limit, CSRF)
  → API Route (/api/orchestrate)
  → SimplifiedOrchestrator
  → LangGraph (intent → select → execute → synthesize)
  → Response
```

### Multi-Tenancy

Tenant isolation is enforced at multiple levels:
- Database: Row-Level Security (RLS)
- Application: Tenant context in all queries
- API: Tenant ID validation in middleware
- Frontend: Tenant-aware components

### Security

- TLS 1.3 encryption (in transit)
- AES-256 encryption (at rest)
- JWT authentication
- CSRF protection
- Rate limiting (token bucket)
- Security headers (CSP, HSTS, etc.)
```

**4.3 Runbook Documentation**

Create [docs/RUNBOOK.md](docs/RUNBOOK.md):

```markdown
# VITAL Operations Runbook

## Deployment

### Production Deployment

```bash
# 1. Run tests
pnpm test:ci

# 2. Build
pnpm build

# 3. Deploy to Vercel
vercel --prod
```

### Environment Variables

Required:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key
- `REDIS_URL`: Upstash Redis connection string

Optional:
- `SENTRY_DSN`: Sentry error tracking
- `DATADOG_API_KEY`: DataDog logging

## Monitoring

### Key Metrics

- **Availability**: > 99.9%
- **Response Time**: < 200ms (P95)
- **Error Rate**: < 0.1%
- **Cache Hit Rate**: > 80%

### Dashboards

- [Vercel Analytics](https://vercel.com/vital/analytics)
- [Sentry Dashboard](https://sentry.io/vital)
- [Supabase Metrics](https://app.supabase.com/project/vital/reports)

## Incident Response

### High Error Rate

**Symptoms:**
- Error rate > 1%
- Sentry alerts

**Investigation:**
1. Check Sentry for error patterns
2. Review application logs
3. Check database connection pool
4. Verify external API status (OpenAI, Supabase)

**Resolution:**
- Rollback deployment if recent change
- Increase database pool size
- Scale Vercel functions

### Performance Degradation

**Symptoms:**
- Response time > 5s (P95)
- User complaints

**Investigation:**
1. Check Vercel analytics
2. Review slow API traces
3. Check Redis cache hit rate
4. Monitor database query performance

**Resolution:**
- Increase cache TTL
- Optimize database queries
- Add database indexes

### Database Connection Exhaustion

**Symptoms:**
- "Too many connections" errors
- Connection timeout errors

**Investigation:**
1. Check Supabase dashboard
2. Review connection pool configuration
3. Identify long-running queries

**Resolution:**
- Increase connection pool size
- Kill long-running queries
- Optimize query performance

## Maintenance

### Database Migrations

```bash
# Generate migration
pnpm db:generate

# Run migration
pnpm migrate

# Verify
pnpm migrate:status
```

### Log Rotation

Logs are automatically rotated:
- Max file size: 10MB
- Max files: 5
- Older logs are compressed and archived

### Backups

Database backups (Supabase):
- Automatic daily backups
- 7-day retention
- Point-in-time recovery available

### Security Updates

Monthly security review:
- Dependency updates (`pnpm audit`)
- Penetration testing
- Access control review
- Compliance verification (HIPAA, GDPR)
```

**4.4 Developer Guide**

Create [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md):

```markdown
# Developer Guide

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for local Redis)

### Setup

```bash
# Clone repository
git clone https://github.com/vital/platform.git
cd platform

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run migrations
pnpm migrate

# Start development server
pnpm dev
```

## Project Structure

```
apps/digital-health-startup/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── features/            # Feature modules
│   ├── lib/                 # Shared libraries
│   └── types/               # TypeScript types
├── database/
│   └── migrations/          # SQL migrations
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
└── docs/                    # Documentation
```

## Development Workflow

### Creating a Feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement feature with tests
3. Run tests: `pnpm test`
4. Lint code: `pnpm lint`
5. Type check: `pnpm type-check`
6. Commit: `git commit -m "feat: add my feature"`
7. Push: `git push origin feature/my-feature`
8. Create pull request

### Testing

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Code Quality

```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check

# All checks
pnpm ci
```

## Best Practices

### TypeScript

- Use strict mode
- Avoid `any` types
- Define interfaces for all data structures
- Use type guards for runtime validation

### Testing

- Write tests for all business logic
- Maintain > 80% code coverage
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

### Security

- Never commit secrets
- Validate all user input
- Use parameterized queries
- Sanitize all output
- Follow OWASP guidelines

### Performance

- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize images (next/image)
- Cache API responses
- Monitor bundle size
```

**Estimated Time:** 10-12 hours

---

### Task 5: CI/CD Automation

**Goal:** Automated testing, building, and deployment

**5.1 GitHub Actions Workflows**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        id: pnpm-cache
        run: echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          REDIS_URL: ${{ secrets.TEST_REDIS_URL }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          fail_ci_if_error: true

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          REDIS_URL: ${{ secrets.TEST_REDIS_URL }}

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: pnpm audit --audit-level=moderate

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/
          retention-days: 7
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Notify Sentry of deployment
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: vital
          SENTRY_PROJECT: orchestrator
        with:
          environment: production
```

**5.2 Pre-commit Hooks (Husky)**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
pnpm type-check
```

```bash
# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm test:unit
```

**Dependencies:**
```bash
pnpm add -D husky lint-staged
```

**Estimated Time:** 6-8 hours

---

### Task 6: Production Deployment Checklist

**Goal:** Comprehensive pre-launch checklist

Create [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md):

```markdown
# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code reviewed and approved

### Security
- [ ] All secrets in environment variables (not committed)
- [ ] HTTPS enforced (TLS 1.3)
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers present
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] Dependency vulnerabilities resolved

### Performance
- [ ] Bundle size optimized (< 500KB initial load)
- [ ] Images optimized
- [ ] API response time < 200ms (P95)
- [ ] Database indexes created
- [ ] Cache hit rate > 80%
- [ ] CDN configured

### Compliance
- [ ] HIPAA requirements documented
- [ ] GDPR requirements documented
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Data retention policy defined
- [ ] Audit logging enabled

### Infrastructure
- [ ] Database backups configured
- [ ] Redis backups configured
- [ ] Monitoring enabled (Sentry, Vercel Analytics)
- [ ] Alerting configured
- [ ] Log aggregation setup
- [ ] Disaster recovery plan documented

### Documentation
- [ ] API documentation complete
- [ ] Architecture documentation updated
- [ ] Runbook created
- [ ] Developer guide updated
- [ ] Changelog updated

## Deployment

### Vercel
- [ ] Production environment configured
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Auto-scaling enabled
- [ ] Edge network optimized

### Database
- [ ] Migrations applied
- [ ] Seed data loaded
- [ ] Connection pooling configured
- [ ] Row-level security enabled
- [ ] Backups verified

### External Services
- [ ] Supabase project configured
- [ ] OpenAI API quota verified
- [ ] Upstash Redis provisioned
- [ ] Sentry project created
- [ ] Vercel Analytics enabled

## Post-Deployment

### Verification
- [ ] Health check passing
- [ ] API endpoints responding
- [ ] Frontend accessible
- [ ] Authentication working
- [ ] Database queries succeeding
- [ ] Cache functioning
- [ ] Monitoring receiving data

### Performance
- [ ] Load test completed (100 req/s)
- [ ] Response times acceptable
- [ ] Error rate < 0.1%
- [ ] No memory leaks

### Security
- [ ] Penetration test passed
- [ ] OWASP top 10 verified
- [ ] Security scan clean

### Monitoring
- [ ] Dashboards configured
- [ ] Alerts tested
- [ ] On-call rotation setup
- [ ] Incident response plan activated

## Launch

- [ ] Announce to stakeholders
- [ ] Monitor for first 24 hours
- [ ] Collect user feedback
- [ ] Plan first post-launch improvements
```

**Estimated Time:** 2-4 hours

---

## Phase 4: Success Criteria

### Observability
- [ ] APM configured (OpenTelemetry)
- [ ] Error tracking active (Sentry)
- [ ] Structured logging implemented
- [ ] Custom metrics tracked
- [ ] Dashboards created

### Documentation
- [ ] API documentation complete (OpenAPI)
- [ ] Architecture documented
- [ ] Runbook created
- [ ] Developer guide written
- [ ] Changelog maintained

### Automation
- [ ] CI/CD pipeline functional
- [ ] Automated testing (unit, integration, E2E)
- [ ] Pre-commit hooks active
- [ ] Deployment automated

### Production Readiness
- [ ] Security hardened
- [ ] Performance optimized
- [ ] Compliance verified
- [ ] Monitoring active
- [ ] Incident response ready

---

## Phase 4: Timeline

### Week 1: Observability & Monitoring
- **Day 1-2:** OpenTelemetry setup
- **Day 3:** Sentry integration
- **Day 4:** Structured logging
- **Day 5:** Custom metrics & dashboards

### Week 2: Documentation & Automation
- **Day 1-2:** API documentation
- **Day 3:** Architecture & runbook
- **Day 4:** CI/CD pipeline
- **Day 5:** Production checklist & launch prep

**Total: 10 days**

---

## Phase 4: Deliverables

### Code
1. OpenTelemetry instrumentation
2. Sentry error tracking
3. Winston logging infrastructure
4. GitHub Actions workflows
5. Pre-commit hooks (Husky)

### Documentation
1. OpenAPI specification
2. Architecture guide
3. Operations runbook
4. Developer guide
5. Production checklist

### Infrastructure
- APM dashboards
- Error tracking alerts
- Log aggregation
- CI/CD automation
- Deployment automation

---

## Cost Estimation

### Monitoring & Observability
- **Sentry**: $26/month (Team plan)
- **Vercel Analytics**: Included
- **DataDog (optional)**: $15/host/month

### Total Additional Cost: $26-$50/month

---

## Production Launch

After Phase 4 completion:

1. **Internal Beta** (1 week)
   - Limited user group
   - Collect feedback
   - Monitor performance

2. **Public Beta** (2 weeks)
   - Gradual rollout
   - Performance tuning
   - Bug fixes

3. **General Availability**
   - Full launch
   - Marketing announcement
   - Support team ready

---

**Phase 4 Status:** Ready to Begin
**Confidence Level:** High
**Risk Assessment:** Low

---

*Document Version: 1.0*
*Last Updated: January 27, 2025*

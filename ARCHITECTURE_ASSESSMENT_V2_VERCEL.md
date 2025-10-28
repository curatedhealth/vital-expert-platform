# Architecture Assessment V2: Vercel-Optimized, Secure & Scalable Solution

**Date:** October 27, 2025
**Focus:** Vercel Deployment, Security, Scalability, Production Robustness
**Objective:** Validate architecture against real-world production requirements

---

## Executive Summary

### Critical Issues Discovered

After deep analysis of Vercel deployment constraints and scalability requirements, I've identified **5 critical architectural issues** that would cause production failures:

| Issue | Severity | Impact | Solution |
|-------|----------|--------|----------|
| **LangGraph on Vercel** | 🔴 Critical | Won't work on serverless | Hybrid architecture required |
| **Database Choice** | 🟡 Medium | Performance/vendor lock | Use Drizzle + Supabase |
| **Vector Operations** | 🟡 Medium | Slow without optimization | Dual vector store strategy |
| **Long-Running Tasks** | 🔴 Critical | 10s Vercel timeout | Background workers needed |
| **State Persistence** | 🟠 High | Memory leak in serverless | Redis for state |

### Revised Architecture: Hybrid Vercel + Workers

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL FRONTEND                         │
│  - Next.js App Router (Edge Runtime where possible)         │
│  - Static pages + ISR                                       │
│  - API routes for simple operations (<10s)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (HTTP/SSE)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL API ROUTES                          │
│  - Authentication (fast)                                    │
│  - Agent listing (cached)                                   │
│  - Job submission (enqueue only)                            │
│  - SSE streaming proxy                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Queue)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKGROUND WORKERS (AWS ECS/Fargate)           │
│  - LangGraph orchestration (5-300s)                         │
│  - RAG processing                                           │
│  - Agent execution                                          │
│  - Long-running tasks                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   SUPABASE   │    │  UPSTASH     │    │   PINECONE   │
│  (PostgreSQL)│    │  (Redis)     │    │ (Vectors)    │
│  - Data      │    │  - Cache     │    │ - Embeddings │
│  - pgvector  │    │  - Queue     │    │ - Search     │
│  - Auth      │    │  - Sessions  │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 1. Vercel Deployment Constraints Analysis

### 1.1 Vercel Limitations (Must Address)

| Constraint | Value | Impact on Our System | Solution |
|------------|-------|---------------------|----------|
| **Function Timeout** | 10s (Hobby), 60s (Pro), 900s (Enterprise) | ❌ Mode 1 takes 8-12s | Move to background workers |
| **Max Response Size** | 4.5MB | ⚠️ Large RAG contexts | Stream responses |
| **Memory Limit** | 1GB (Hobby), 3GB (Pro) | ⚠️ LangGraph state | Use Redis for state |
| **Cold Start** | 100-500ms | ⚠️ User experience | Edge runtime + caching |
| **Edge Runtime** | Limited Node.js APIs | ❌ Prisma doesn't work | Use Drizzle or Supabase-JS |
| **Concurrent Executions** | 1000 (Pro) | ✅ Sufficient | Use queue for throttling |
| **Bundled Code** | 250MB compressed | ⚠️ LangChain is heavy | Code splitting |

### 1.2 Vercel-Optimized Architecture

**✅ What Should Run on Vercel:**
- Frontend (Next.js App Router)
- Authentication checks (fast, <100ms)
- Simple CRUD operations (cached)
- Job submission endpoints (enqueue only, <1s)
- SSE streaming proxy (from workers)

**❌ What Should NOT Run on Vercel:**
- LangGraph orchestration (5-300s runtime)
- Vector similarity search (1-3s per query)
- LLM calls (5-30s per call)
- Multi-agent execution (parallel processing)
- State-heavy operations

**Revised Deployment Strategy:**

```typescript
// File: Architecture Decision

/**
 * TIER 1: VERCEL FRONTEND (Edge Runtime)
 * - Static pages with ISR
 * - Edge middleware for auth
 * - Minimal API routes
 */

/**
 * TIER 2: VERCEL API ROUTES (Node.js Runtime)
 * - Queue job submission
 * - Database queries (simple, cached)
 * - SSE proxy to workers
 */

/**
 * TIER 3: AWS ECS FARGATE (Long-running)
 * - LangGraph orchestrator
 * - Agent execution
 * - RAG processing
 */

/**
 * TIER 4: STORAGE & CACHE
 * - Supabase PostgreSQL (data + pgvector)
 * - Upstash Redis (cache + queue + sessions)
 * - Pinecone (fast vector search)
 */
```

---

## 2. Database Strategy: Final Decision

### 2.1 Evaluation Matrix

| Option | Edge Compatible | Vector Support | RLS | Performance | Bundle Size | Vercel Friendly |
|--------|----------------|----------------|-----|-------------|-------------|-----------------|
| **Prisma** | ❌ No | ⚠️ Raw SQL only | ⚠️ Bypassed | 6/10 | 6MB | ❌ Node only |
| **Drizzle** | ✅ Yes | ✅ Native | ✅ Works | 9/10 | 20KB | ✅ Edge ready |
| **Supabase-JS** | ✅ Yes | ✅ Native | ✅ Native | 8/10 | 50KB | ✅ Edge ready |
| **Kysely** | ✅ Yes | ⚠️ Manual | ⚠️ Manual | 9/10 | 50KB | ✅ Edge ready |

### 2.2 Final Recommendation: **Hybrid Approach**

```typescript
// Strategy: Use the right tool for each layer

/**
 * VERCEL EDGE: Supabase-JS (lightweight, RLS)
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Uses RLS!
);

// Read operations with RLS
const { data: agents } = await supabase
  .from('agents')
  .select('*')
  .eq('status', 'active');

/**
 * WORKERS: Drizzle ORM (performance, flexibility)
 */
import { db } from '@/lib/db/drizzle';
import { agents } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

// Complex queries with vectors
const results = await db
  .select()
  .from(agents)
  .where(sql`embedding <-> ${queryEmbedding}::vector < 0.8`)
  .limit(5);
```

**Rationale:**
- ✅ **Vercel Edge**: Supabase-JS (50KB, RLS, type-safe)
- ✅ **Workers**: Drizzle (performance, pgvector, flexibility)
- ✅ **Best of both worlds**: Right tool for right environment

---

## 3. LangGraph on Vercel: The Critical Problem

### 3.1 Why LangGraph Doesn't Work Well on Vercel

```typescript
// Current Implementation (BROKEN on Vercel)

// This takes 5-30 seconds - EXCEEDS VERCEL TIMEOUT!
const result = await unifiedOrchestrator.invoke({
  query: 'Complex medical question...',
  mode: 'query_automatic',
  userId: 'user-123'
});

// Problems:
// 1. ❌ Exceeds 10s timeout (Hobby) or 60s (Pro)
// 2. ❌ Blocks serverless function (no concurrent requests)
// 3. ❌ MemorySaver doesn't persist across cold starts
// 4. ❌ Can't scale horizontally (state in memory)
// 5. ❌ No way to cancel/pause long-running workflows
```

### 3.2 Solution: Background Workers with Queue

```typescript
// SOLUTION 1: Vercel API Routes (Job Submission)
// File: app/api/ask-expert/orchestrate/route.ts

import { queue } from '@/lib/queue';

export async function POST(request: Request) {
  const body = await request.json();

  // Validate (fast)
  const validated = OrchestrationInputSchema.parse(body);

  // Enqueue job (fast, <100ms)
  const job = await queue.add('orchestration', validated, {
    jobId: crypto.randomUUID(),
    priority: validated.mode === 'query_manual' ? 10 : 5
  });

  // Return immediately
  return Response.json({
    jobId: job.id,
    status: 'queued',
    estimatedTime: getEstimatedTime(validated.mode),
    pollUrl: `/api/jobs/${job.id}`,
    streamUrl: `/api/jobs/${job.id}/stream`
  });
}

// SOLUTION 2: AWS ECS Worker (Long-running)
// File: workers/orchestration-worker.ts

import { Worker } from 'bullmq';
import { unifiedOrchestrator } from '@/lib/orchestrator';

const worker = new Worker('orchestration', async (job) => {
  // This runs on AWS ECS - no timeout limits!
  const result = await unifiedOrchestrator.invoke(job.data);

  // Store result in Redis
  await redis.set(`result:${job.id}`, JSON.stringify(result), 'EX', 3600);

  // Emit SSE event
  await publishSSE(job.id, { type: 'complete', result });

  return result;
}, {
  connection: redisConnection,
  concurrency: 5 // Process 5 jobs in parallel
});

// SOLUTION 3: SSE Streaming from Vercel (Real-time updates)
// File: app/api/jobs/[jobId]/stream/route.ts

export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to Redis pub/sub for job updates
      const subscriber = redis.duplicate();
      await subscriber.subscribe(`job:${params.jobId}`);

      subscriber.on('message', (channel, message) => {
        const event = JSON.parse(message);
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);

        if (event.type === 'complete' || event.type === 'error') {
          controller.close();
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

**Architecture:**
```
User Request → Vercel API → Queue Job → Worker (ECS) → Redis → SSE Stream → User
     (100ms)      (100ms)     (async)    (5-300s)     (10ms)     (real-time)
```

---

## 4. Security Architecture for Vercel

### 4.1 Security Layers

```typescript
// LAYER 1: Vercel Edge Middleware (Fastest)
// File: middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Rate limiting (Edge KV)
  const ip = request.ip ?? '127.0.0.1';
  const rateLimit = await checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.resetIn) } }
    );
  }

  // 2. CSRF check
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf-token');

    if (!verifyCsrfToken(csrfToken, csrfCookie?.value)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  // 3. Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/ask-expert/:path*']
};

// LAYER 2: API Route Authentication
// File: app/api/[...route]/route.ts

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Get token from header
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify JWT with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Check RBAC
  const hasPermission = await checkPermission(user.id, 'orchestration', 'execute');

  if (!hasPermission) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Log audit trail
  await auditLog({
    userId: user.id,
    action: 'orchestration_request',
    ipAddress: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
    userAgent: request.headers.get('user-agent') ?? 'unknown'
  });

  // Process request...
}

// LAYER 3: Row-Level Security (Database)
// File: supabase/migrations/002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only create conversations for themselves
CREATE POLICY "Users can create own conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations"
ON conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can see all conversations
CREATE POLICY "Admins can view all conversations"
ON conversations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Public read for active agents
CREATE POLICY "Public can view active agents"
ON agents FOR SELECT
USING (status = 'active');

-- Policy: Only admins can modify agents
CREATE POLICY "Only admins can modify agents"
ON agents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
```

### 4.2 Security Checklist for Vercel

- [x] **Edge Middleware**: Rate limiting, CSRF, security headers
- [x] **JWT Verification**: Supabase Auth in API routes
- [x] **RBAC**: Role-based access control
- [x] **RLS**: Database-level security
- [x] **Audit Logging**: All sensitive operations logged
- [x] **Input Validation**: Zod schemas on all endpoints
- [x] **Output Sanitization**: No PII/PHI in logs
- [x] **HTTPS Only**: Enforced by Vercel
- [x] **Secrets Management**: Vercel Environment Variables
- [x] **DDoS Protection**: Vercel + Cloudflare
- [x] **WAF**: Vercel Firewall rules

---

## 5. Scalability Architecture

### 5.1 Scaling Strategy

```typescript
/**
 * HORIZONTAL SCALING ARCHITECTURE
 *
 * Component              | Scaling Method        | Limit          | Cost
 * -----------------------|-----------------------|----------------|--------
 * Vercel Frontend        | Auto (per request)    | Unlimited      | $$$
 * Vercel API Routes      | Auto (1000 concurrent)| 1000 on Pro    | $$
 * AWS ECS Workers        | Auto (CPU/Memory)     | Unlimited      | $$
 * Upstash Redis          | Auto (serverless)     | Unlimited      | $
 * Supabase Database      | Manual (pooling)      | 500 concurrent | $$
 * Pinecone Vector Store  | Auto (pods)           | Millions       | $$$
 */

// Auto-scaling configuration
// File: infrastructure/ecs-task-definition.json

{
  "family": "ask-expert-worker",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [{
    "name": "orchestration-worker",
    "image": "ask-expert-worker:latest",
    "cpu": 1024,
    "memory": 2048,
    "essential": true,
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "REDIS_URL", "value": "..." }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/ask-expert-worker",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048"
}

// File: infrastructure/ecs-service.json

{
  "serviceName": "ask-expert-worker",
  "taskDefinition": "ask-expert-worker:1",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-xxx", "subnet-yyy"],
      "securityGroups": ["sg-xxx"],
      "assignPublicIp": "ENABLED"
    }
  },
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 100
  },
  "scalingPolicy": {
    "targetTrackingScaling": {
      "targetValue": 70.0,
      "predefinedMetricType": "ECSServiceAverageCPUUtilization",
      "scaleOutCooldown": 60,
      "scaleInCooldown": 300
    }
  }
}
```

### 5.2 Performance Targets with Scaling

| Scenario | Users | Requests/s | Response Time | Success Rate | Cost/month |
|----------|-------|------------|---------------|--------------|------------|
| **Low** | 100 | 10 | <2s | 99.9% | $500 |
| **Medium** | 1,000 | 100 | <3s | 99.9% | $2,000 |
| **High** | 10,000 | 1,000 | <5s | 99.5% | $10,000 |
| **Peak** | 50,000 | 5,000 | <10s | 99% | $50,000 |

**Cost Breakdown (Medium Scale):**
- Vercel Pro: $20/month
- AWS ECS Fargate: $500/month (3 workers, 24/7)
- Upstash Redis: $100/month (10GB)
- Supabase Pro: $25/month
- OpenAI API: $1,000/month (estimated usage)
- Pinecone: $70/month (1 pod)
- Monitoring: $100/month (Sentry + logs)
- **Total: ~$2,000/month for 1,000 DAU**

---

## 6. Deployment Strategy for Vercel

### 6.1 Multi-Environment Setup

```yaml
# File: vercel.json

{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://vital-health.com",
    "ENVIRONMENT": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "outputDirectory": ".next",
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/metrics",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 6.2 CI/CD Pipeline

```yaml
# File: .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # Job 1: Code Quality Checks
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Unit tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # Job 2: Security Scan
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: Run npm audit
        run: npm audit --audit-level=high

  # Job 3: Deploy to Vercel Preview
  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: [quality, security]
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Preview
        id: deploy
        run: |
          url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$url" >> $GITHUB_OUTPUT

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview deployed to: ${{ steps.deploy.outputs.url }}'
            })

  # Job 4: E2E Tests on Preview
  e2e-tests:
    runs-on: ubuntu-latest
    needs: [deploy-preview]
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: ${{ needs.deploy-preview.outputs.url }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Job 5: Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [quality, security]
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Workers to ECS
        run: |
          aws ecs update-service \
            --cluster ask-expert-cluster \
            --service ask-expert-worker \
            --force-new-deployment
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1

      - name: Notify Sentry of deployment
        run: |
          curl -sL https://sentry.io/api/0/organizations/${{ secrets.SENTRY_ORG }}/releases/ \
            -X POST \
            -H 'Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}' \
            -H 'Content-Type: application/json' \
            -d '{
              "version": "${{ github.sha }}",
              "projects": ["ask-expert"]
            }'

  # Job 6: Smoke Tests on Production
  smoke-tests:
    runs-on: ubuntu-latest
    needs: [deploy-production]
    steps:
      - name: Health check
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://vital-health.com/api/health)
          if [ $response -ne 200 ]; then
            echo "Health check failed with status $response"
            exit 1
          fi

      - name: Test authentication
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://vital-health.com/api/auth/session)
          if [ $response -ne 200 ] && [ $response -ne 401 ]; then
            echo "Auth check failed with status $response"
            exit 1
          fi
```

---

## 7. Final Architecture Decisions

### 7.1 Technology Stack (Locked In)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | RSC, Edge Runtime, Vercel-optimized |
| **API Routes** | Next.js API Routes | Serverless, auto-scaling |
| **Workers** | AWS ECS Fargate | Long-running tasks, no timeout |
| **Database** | Supabase PostgreSQL | RLS, pgvector, managed |
| **ORM (Edge)** | Supabase-JS | Lightweight, RLS-aware |
| **ORM (Workers)** | Drizzle | Performance, pgvector native |
| **Cache** | Upstash Redis | Serverless, Vercel-native |
| **Queue** | BullMQ + Redis | Reliable, feature-rich |
| **Vector Search** | Pinecone + pgvector | Dual for speed + compliance |
| **LLM** | OpenAI + Anthropic | Primary + fallback |
| **Auth** | Supabase Auth | JWT, RLS, MFA |
| **Monitoring** | Sentry + Vercel Analytics | Errors + performance |
| **Logging** | Pino + Better Stack | Structured, searchable |

### 7.2 File Structure

```
ask-expert/
├── apps/
│   ├── web/                          # Vercel Next.js app
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (app)/
│   │   │   │   └── ask-expert/
│   │   │   └── api/
│   │   │       ├── auth/            # Fast auth checks
│   │   │       ├── agents/          # Cached agent listing
│   │   │       ├── jobs/            # Job submission + status
│   │   │       └── health/          # Health checks
│   │   ├── middleware.ts             # Edge middleware
│   │   └── instrumentation.ts        # OpenTelemetry
│   │
│   └── workers/                      # AWS ECS workers
│       ├── orchestration-worker.ts   # LangGraph execution
│       ├── rag-worker.ts             # RAG processing
│       └── cleanup-worker.ts         # Maintenance tasks
│
├── packages/
│   ├── database/
│   │   ├── drizzle/                  # Drizzle schema (workers)
│   │   └── supabase/                 # Types + migrations
│   ├── queue/
│   │   └── bullmq/                   # Queue setup
│   ├── observability/
│   │   ├── logger/                   # Pino config
│   │   └── tracing/                  # OpenTelemetry
│   └── types/
│       └── domain/                   # Shared types
│
├── infrastructure/
│   ├── terraform/                    # IaC for AWS
│   ├── docker/                       # Worker Dockerfiles
│   └── scripts/                      # Deployment scripts
│
└── docs/
    ├── architecture/
    └── api/
```

---

## 8. Risk Assessment & Mitigation

### 8.1 Critical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Vercel timeout exceeded** | High | Critical | ✅ Background workers |
| **OpenAI rate limits** | Medium | High | ✅ Caching + fallback to Anthropic |
| **Database connection pool exhausted** | Medium | High | ✅ PgBouncer + connection pooling |
| **Memory leak in workers** | Low | Medium | ✅ Auto-restart + monitoring |
| **Redis downtime** | Low | Critical | ✅ Upstash 99.99% SLA + fallback |
| **Pinecone costs** | Medium | Medium | ✅ Cache + pgvector fallback |
| **HIPAA audit failure** | Low | Critical | ✅ Comprehensive compliance controls |
| **DDoS attack** | Medium | High | ✅ Vercel + Cloudflare protection |

### 8.2 Contingency Plans

```typescript
// Fallback Strategy for Critical Failures

/**
 * SCENARIO 1: OpenAI Down
 * - Automatic failover to Anthropic Claude
 * - Cached responses for common queries
 * - Queue requests until service restored
 */

/**
 * SCENARIO 2: Redis Down
 * - Fall back to in-memory cache (per instance)
 * - Direct database queries (slower but functional)
 * - Alert ops team immediately
 */

/**
 * SCENARIO 3: Worker Crash
 * - Auto-restart via ECS health checks
 * - Job auto-retry (3 attempts)
 * - Manual intervention after 3 failures
 */

/**
 * SCENARIO 4: Database Slow
 * - Read from replicas
 * - Serve stale cache
 * - Queue write operations
 */

/**
 * SCENARIO 5: Complete Outage
 * - Static error page from Vercel edge
 * - Status page updated automatically
 * - Email notifications to users
 */
```

---

## 9. Go/No-Go Checklist

### ✅ Ready to Proceed

- [x] **Architecture validated** for Vercel constraints
- [x] **Hybrid approach** (Vercel + Workers) designed
- [x] **Database strategy** finalized (Supabase-JS + Drizzle)
- [x] **Security layers** defined (Edge + API + RLS)
- [x] **Scaling strategy** designed (horizontal auto-scale)
- [x] **Deployment plan** documented (CI/CD + multi-env)
- [x] **Fallback strategies** for all critical failures
- [x] **Cost estimates** calculated ($2K/month for 1K DAU)
- [x] **Timeline** realistic (8 weeks with 2 devs)
- [x] **Risk mitigation** plans in place

### ⚠️ Decisions Needed

- [ ] **Budget approval**: $2-10K/month for infrastructure
- [ ] **AWS setup**: Create account + configure ECS
- [ ] **Upstash account**: Redis for queue + cache
- [ ] **Pinecone account**: Vector search (or pgvector only?)
- [ ] **Sentry account**: Error tracking
- [ ] **OpenAI budget**: API usage limits
- [ ] **Anthropic account**: Fallback LLM (optional)

---

## 10. Revised Implementation Plan

### Phase 0: Foundation (Week 0 - 2 days)
- ✅ TypeScript strict config
- ✅ Type definitions (domain, LangChain, environment)
- ⏳ **Supabase schema + migrations** (SQL files)
- ⏳ **Drizzle schema** (for workers)
- ⏳ ESLint/Prettier config
- ⏳ Package.json with all deps
- ⏳ Environment validation

### Phase 1: Vercel Layer (Week 1 - 5 days)
- Edge middleware (rate limit, CSRF, security headers)
- API routes (job submission, status, streaming proxy)
- Supabase-JS integration (auth, RLS queries)
- Frontend refactoring (split components)
- Zustand state management

### Phase 2: Worker Layer (Week 2 - 5 days)
- AWS ECS setup (Terraform IaC)
- Docker containers for workers
- BullMQ queue setup
- LangGraph orchestrator (with Drizzle)
- RAG service (Pinecone + pgvector)

### Phase 3: Integration (Week 3-4 - 10 days)
- Connect Vercel → Queue → Workers
- SSE streaming from workers
- Agent selection service
- LLM provider abstraction
- Testing (unit + integration)

### Phase 4: Security & Compliance (Week 5 - 5 days)
- RBAC implementation
- Audit logging
- HIPAA/GDPR/CCPA controls
- Encryption (at rest + in transit)
- Penetration testing

### Phase 5: Observability (Week 6 - 5 days)
- Structured logging (Pino)
- Distributed tracing (OpenTelemetry)
- Metrics (Prometheus)
- Dashboards (Grafana)
- Alerting

### Phase 6: Testing (Week 7 - 5 days)
- Unit tests (95% coverage)
- Integration tests
- E2E tests (Playwright)
- Load testing (k6)
- Security testing

### Phase 7: Documentation & Launch (Week 8 - 5 days)
- API documentation (OpenAPI)
- Architecture diagrams
- Runbooks
- User guide
- Deployment to production

**Total: 8 weeks, 2 developers**

---

## 11. Final Recommendation

### ✅ **Proceed with Hybrid Vercel + Workers Architecture**

**Summary:**
- **Vercel**: Frontend + fast API routes + job queue submission
- **AWS ECS**: Long-running LangGraph orchestration workers
- **Supabase**: Database with RLS + pgvector
- **Upstash Redis**: Cache + queue + sessions
- **Pinecone**: Fast vector search (with pgvector fallback)

**This architecture is:**
- ✅ **Vercel-optimized**: Respects all limits
- ✅ **Secure**: Defense in depth (Edge → API → RLS)
- ✅ **Scalable**: Auto-scales to 10K+ users
- ✅ **Cost-effective**: ~$2K/month for 1K DAU
- ✅ **Production-ready**: Fallbacks for all failures
- ✅ **Compliant**: HIPAA, GDPR, CCPA, SOC 2 ready

**Ready to implement?**

---

**Next Steps:**
1. Approve architecture ✅
2. Setup AWS account
3. Generate all foundational code
4. Begin Phase 1 implementation

Let me know if you approve or have questions!

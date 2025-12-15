# VITAL Platform - World-Class Project Structure

**Version:** 1.0.0
**Date:** December 11, 2025
**Target:** Production Deployment (Vercel + Railway)

---

## Executive Summary

This document defines the production-ready project structure for the VITAL platform, optimized for:
- **Vercel** deployment (Next.js frontend)
- **Railway** deployment (FastAPI backend)
- **Supabase** (PostgreSQL database)
- **CI/CD** via GitHub Actions
- **Monorepo** optimization with Turborepo

---

## 1. Target Project Structure

```
VITAL path/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Validation pipeline
│       ├── deploy-preview.yml        # Preview deployments
│       └── deploy-production.yml     # Production deployments
│
├── apps/
│   └── vital-system/                 # Next.js Frontend (Vercel)
│       ├── public/
│       │   ├── icons/
│       │   ├── manifest.json         # PWA manifest
│       │   └── robots.txt
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   ├── components/           # Shared UI components
│       │   ├── features/             # Feature modules
│       │   ├── lib/                  # Utilities & services
│       │   ├── middleware/           # Security middleware
│       │   ├── types/                # TypeScript types
│       │   └── config/               # App configuration
│       │       └── env.ts            # Environment validation
│       ├── next.config.mjs           # Next.js configuration
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   └── components/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── vital-ai-ui/                  # AI-specific components
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── protocol/                     # Shared types & schemas
│   │   ├── src/
│   │   │   ├── schemas/              # Zod schemas
│   │   │   └── types/                # TypeScript types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── eslint-config/                # Shared ESLint config
│       ├── base.js
│       ├── nextjs.js
│       └── package.json
│
├── services/
│   └── ai-engine/                    # FastAPI Backend (Railway)
│       ├── src/
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   ├── schemas/
│       │   │   └── middleware/
│       │   ├── core/
│       │   │   ├── config.py         # Settings management
│       │   │   ├── logging.py        # Structured logging
│       │   │   └── errors.py         # Error handling
│       │   ├── domain/               # Business logic
│       │   ├── infrastructure/       # External services
│       │   ├── modules/              # Feature modules
│       │   └── langgraph_workflows/  # LangGraph orchestration
│       ├── tests/
│       ├── Dockerfile                # Railway deployment
│       ├── railway.toml              # Railway configuration
│       ├── pyproject.toml
│       └── requirements.txt
│
├── database/
│   ├── migrations/                   # Supabase migrations
│   ├── policies/                     # RLS policies
│   ├── seeds/                        # Seed data
│   └── types/                        # Generated types
│
├── docs/
│   ├── audits/                       # Audit reports
│   ├── architecture/                 # Architecture docs
│   └── deployment/                   # Deployment guides
│
├── scripts/
│   ├── setup.sh                      # Development setup
│   ├── deploy.sh                     # Deployment scripts
│   └── db-backup.sh                  # Database backup
│
├── .env.example                      # Environment template
├── vercel.json                       # Vercel configuration
├── turbo.json                        # Turborepo configuration
├── pnpm-workspace.yaml               # Workspace definition
├── package.json                      # Root package.json
└── README.md
```

---

## 2. Configuration Files

### 2.1 Root Configuration

#### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm turbo build --filter=vital-system",
  "devCommand": "pnpm turbo dev --filter=vital-system",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": "apps/vital-system/.next",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/backend/:path*",
      "destination": "${AI_ENGINE_URL}/:path*"
    }
  ]
}
```

#### `.env.example`
```bash
# ===========================================
# VITAL Platform Environment Variables
# ===========================================

# Frontend (Next.js) - Public variables (exposed to browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Frontend (Next.js) - Server-only variables
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Backend (FastAPI) - Database
DATABASE_URL=postgresql://user:password@localhost:5432/vital
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Backend (FastAPI) - AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LANGSMITH_API_KEY=lsv2_...
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=vital-dev

# Backend (FastAPI) - Application
ENVIRONMENT=development
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:3000

# Optional - Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
```

---

## 3. Frontend Configuration (Vercel)

### 3.1 Next.js Configuration

#### `apps/vital-system/next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for optimal Vercel deployment
  output: 'standalone',

  // Strict mode for development
  reactStrictMode: true,

  // Monorepo package transpilation
  transpilePackages: [
    '@vital/ui',
    '@vital/vital-ai-ui',
    '@vital/protocol',
  ],

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      'recharts',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Reduce bundle size for client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

### 3.2 Environment Validation

#### `apps/vital-system/src/config/env.ts`
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Public variables
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Optional
  SENTRY_DSN: z.string().optional(),
});

// Validate at build time
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
```

---

## 4. Backend Configuration (Railway)

### 4.1 Dockerfile

#### `services/ai-engine/Dockerfile`
```dockerfile
# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.7.1

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Export requirements
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# Stage 2: Production image
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Set environment variables
ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Run the application
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT}"]
```

### 4.2 Railway Configuration

#### `services/ai-engine/railway.toml`
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
numReplicas = 1

[deploy.scaling]
minReplicas = 1
maxReplicas = 5
targetCPUUtilization = 70
targetMemoryUtilization = 80
```

### 4.3 Health Check Endpoint

#### `services/ai-engine/src/api/routes/health.py`
```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Literal

router = APIRouter(tags=["Health"])

class HealthResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    version: str
    checks: dict[str, bool]

@router.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint for Railway."""
    checks = {
        "api": True,
        # Add database check
        # "database": await check_database(),
        # Add AI provider check
        # "openai": await check_openai(),
    }

    all_healthy = all(checks.values())

    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        checks=checks,
    )
```

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 CI Pipeline

#### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  # ============================================
  # Frontend Validation
  # ============================================
  validate-frontend:
    name: Validate Frontend
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm turbo lint --filter=vital-system

      - name: Type check
        run: pnpm turbo type-check --filter=vital-system

      - name: Test
        run: pnpm turbo test --filter=vital-system

      - name: Build
        run: pnpm turbo build --filter=vital-system
        env:
          NEXT_PUBLIC_APP_URL: https://example.com
          NEXT_PUBLIC_API_URL: https://api.example.com
          NEXT_PUBLIC_SUPABASE_URL: https://example.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder

  # ============================================
  # Backend Validation
  # ============================================
  validate-backend:
    name: Validate Backend
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: services/ai-engine

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Poetry
        run: pip install poetry==1.7.1

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Lint (Ruff)
        run: poetry run ruff check src/

      - name: Type check (MyPy)
        run: poetry run mypy src/ --ignore-missing-imports

      - name: Test (Pytest)
        run: poetry run pytest tests/ -v --cov=src

  # ============================================
  # Security Audit
  # ============================================
  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Audit (npm)
        run: pnpm audit --production
        continue-on-error: true
```

### 5.2 Deployment Pipeline

#### `.github/workflows/deploy-production.yml`
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  # ============================================
  # Deploy Frontend to Vercel
  # ============================================
  deploy-frontend:
    name: Deploy Frontend (Vercel)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

  # ============================================
  # Deploy Backend to Railway
  # ============================================
  deploy-backend:
    name: Deploy Backend (Railway)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd services/ai-engine
          railway up --service ai-engine --environment production

  # ============================================
  # Run Database Migrations
  # ============================================
  migrate-database:
    name: Database Migrations
    runs-on: ubuntu-latest
    needs: [deploy-backend]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Run migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db push
```

---

## 6. Package.json Updates

### 6.1 Root package.json
```json
{
  "name": "vital-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.12.0",
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

---

## 7. Implementation Checklist

### Phase 1: Critical Files (Day 1)
- [ ] Create `services/ai-engine/Dockerfile`
- [ ] Create `services/ai-engine/railway.toml`
- [ ] Create `.env.example`
- [ ] Create `vercel.json`
- [ ] Create `turbo.json`
- [ ] Create `apps/vital-system/next.config.mjs`
- [ ] Fix `packages/ui/package.json` exports

### Phase 2: CI/CD (Day 2)
- [ ] Create `.github/workflows/ci.yml`
- [ ] Create `.github/workflows/deploy-production.yml`
- [ ] Configure GitHub secrets
- [ ] Test pipeline

### Phase 3: Quality (Day 3-5)
- [ ] Add environment validation (`src/config/env.ts`)
- [ ] Add health check endpoint
- [ ] Fix type safety issues (335 `any` violations)
- [ ] Replace console.log with structured logging

### Phase 4: Monitoring (Day 6-7)
- [ ] Add Sentry integration
- [ ] Configure Vercel Analytics
- [ ] Set up LangSmith tracing
- [ ] Create alerting rules

---

## 8. Deployment Commands

### Local Development
```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Start specific service
pnpm turbo dev --filter=vital-system
```

### Production Deployment
```bash
# Build all packages
pnpm build

# Deploy frontend (Vercel)
vercel --prod

# Deploy backend (Railway)
cd services/ai-engine && railway up --environment production

# Run database migrations
supabase db push
```

---

## Conclusion

This structure provides:
- **Optimized builds** with Turborepo caching
- **Type-safe** environment variables
- **Secure** deployment with proper headers
- **Scalable** backend with auto-scaling
- **Automated** CI/CD pipeline
- **Observable** with health checks and monitoring

Estimated implementation time: **5-7 days**

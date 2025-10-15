# VITAL Deployment Guide

## Overview

This guide covers deploying the VITAL Path Digital Health Intelligence Platform to production environments. The application is built with Next.js 14 and designed for deployment on Vercel with Supabase as the backend.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Vercel account
- Supabase account
- OpenAI API key
- Git repository access

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/curatedhealth/vital-expert-platform.git
cd vital-expert-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production

# Optional: Redis for caching
REDIS_URL=your_redis_url

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Configure Environment Variables

In Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required environment variables
4. Set environment to "Production"

### 5. Configure Build Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Note down project URL and anon key

### 2. Database Schema

Run the following SQL in Supabase SQL Editor:

```sql
-- Create agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  capabilities TEXT[] NOT NULL,
  tier INTEGER CHECK (tier IN (1, 2, 3)) NOT NULL,
  knowledge_domains TEXT[] NOT NULL,
  model VARCHAR(50) NOT NULL,
  temperature DECIMAL(3,2) CHECK (temperature >= 0 AND temperature <= 2) NOT NULL,
  max_tokens INTEGER CHECK (max_tokens > 0 AND max_tokens <= 8000) NOT NULL,
  rag_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  agent_id UUID REFERENCES agents(id),
  message TEXT NOT NULL,
  response TEXT,
  interaction_mode VARCHAR(20) CHECK (interaction_mode IN ('manual', 'automatic')),
  autonomous_mode BOOLEAN DEFAULT false,
  status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  query TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id),
  mode JSONB NOT NULL,
  context JSONB,
  status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  result TEXT,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_agents_tier ON agents(tier);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_agents_domains ON agents USING GIN(knowledge_domains);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_session_id ON chats(session_id);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Users can view their own chats" ON chats FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own chats" ON chats FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own workflows" ON workflow_executions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own workflows" ON workflow_executions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

### 3. Seed Data

Insert sample agents:

```sql
INSERT INTO agents (name, display_name, description, system_prompt, capabilities, tier, knowledge_domains, model, temperature, max_tokens, rag_enabled) VALUES
('cardiology-expert', 'Cardiology Expert', 'Expert in cardiovascular health and diseases', 'You are a cardiology expert specializing in heart and blood vessel conditions...', ARRAY['medical-knowledge', 'cardiology', 'diagnosis'], 2, ARRAY['cardiology', 'heart-health'], 'gpt-4', 0.7, 4000, true),
('neurology-expert', 'Neurology Expert', 'Expert in neurological disorders and brain health', 'You are a neurology expert specializing in brain and nervous system disorders...', ARRAY['medical-knowledge', 'neurology', 'diagnosis'], 2, ARRAY['neurology', 'neurosurgery'], 'gpt-4', 0.7, 4000, true),
('general-medicine', 'General Medicine', 'General medical knowledge and primary care', 'You are a general medicine practitioner with broad medical knowledge...', ARRAY['medical-knowledge', 'general-medicine', 'diagnosis'], 1, ARRAY['general-medicine', 'primary-care'], 'gpt-3.5-turbo', 0.5, 2000, false);
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  vital-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### 3. Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## AWS Deployment

### 1. Using AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Node version: 18

3. Set environment variables in Amplify console

### 2. Using AWS Lambda

1. Install serverless framework:
```bash
npm install -g serverless
npm install serverless-nextjs-plugin
```

2. Create `serverless.yml`:
```yaml
service: vital-platform

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    SUPABASE_URL: ${env:SUPABASE_URL}
    SUPABASE_ANON_KEY: ${env:SUPABASE_ANON_KEY}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

plugins:
  - serverless-nextjs-plugin

custom:
  nextjs:
    nextConfigDir: ./
```

3. Deploy:
```bash
serverless deploy
```

## Monitoring & Observability

### 1. Health Checks

The application includes health check endpoints:

- `GET /api/health` - Basic health status
- `GET /api/metrics` - System metrics
- `GET /api/ready` - Readiness probe

### 2. Logging

Configure structured logging:

```typescript
// src/infrastructure/monitoring/logger/structured-logger.ts
import { StructuredLogger } from './structured-logger';

const logger = new StructuredLogger({
  level: process.env.LOG_LEVEL || 'info',
  service: 'vital-platform',
  environment: process.env.NODE_ENV
});
```

### 3. Error Tracking

Integrate with Sentry:

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 4. Performance Monitoring

Monitor with Vercel Analytics:

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Security Configuration

### 1. CORS Configuration

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### 2. Rate Limiting

Configure rate limiting in middleware:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import { rateLimiter } from '@/application/middleware/rate-limiter.middleware';

export async function middleware(request) {
  const response = await rateLimiter.middleware(request);
  if (response) return response;
  
  return NextResponse.next();
}
```

### 3. Environment Security

- Never commit `.env` files
- Use Vercel's environment variable management
- Rotate API keys regularly
- Enable Supabase Row Level Security

## Performance Optimization

### 1. Build Optimization

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 2. Caching Strategy

```typescript
// src/lib/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get(key: string) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  async set(key: string, value: any, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  },
};
```

### 3. Database Optimization

- Use database indexes
- Implement connection pooling
- Monitor query performance
- Use read replicas for heavy queries

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check environment variables

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Verify database schema

3. **API Rate Limiting**
   - Check rate limit headers
   - Implement exponential backoff
   - Monitor usage patterns

4. **Memory Issues**
   - Monitor memory usage
   - Implement proper cleanup
   - Use streaming for large responses

### Debug Commands

```bash
# Check build locally
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Test database connection
npm run test:db

# Check environment variables
npm run env:check
```

## Rollback Strategy

### 1. Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### 2. Database Rollback

```sql
-- Create migration rollback script
-- Example: Rollback agents table changes
ALTER TABLE agents DROP COLUMN IF EXISTS new_column;
```

### 3. Feature Flags

Use feature flags for safe deployments:

```typescript
// src/lib/feature-flags.ts
export const featureFlags = {
  newAgentSelection: process.env.FEATURE_NEW_AGENT_SELECTION === 'true',
  experimentalWorkflow: process.env.FEATURE_EXPERIMENTAL_WORKFLOW === 'true',
};
```

## Backup Strategy

### 1. Database Backups

- Enable Supabase automatic backups
- Create manual backups before major changes
- Test restore procedures regularly

### 2. Code Backups

- Use Git for version control
- Tag releases for easy rollback
- Maintain deployment history

### 3. Configuration Backups

- Document all environment variables
- Backup configuration files
- Maintain deployment scripts

## Support

For deployment support:
- **Documentation**: https://github.com/curatedhealth/vital-expert-platform
- **Issues**: https://github.com/curatedhealth/vital-expert-platform/issues
- **Email**: deployment-support@vitalpath.ai

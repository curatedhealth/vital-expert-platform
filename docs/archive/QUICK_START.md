# VITAL Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the VITAL platform quickly.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (or local Supabase instance)
- OpenAI API key

---

## 1️⃣ Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd vital-platform

# Install dependencies
npm install
```

---

## 2️⃣ Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

**Required environment variables**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# Optional: Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

**Validate your configuration**:
```bash
npm run validate:env
```

---

## 3️⃣ Set Up Database

```bash
# Check migration status
npm run migrate:status

# Apply database migrations
npm run migrate
```

---

## 4️⃣ Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
```

### Testing
```bash
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage    # Run with coverage report
```

### Database
```bash
npm run migrate          # Run migrations
npm run migrate:status   # Check migration status
npm run migrate:dry-run  # Preview migrations
```

### Infrastructure
```bash
npm run validate:env     # Validate environment variables
```

---

## 📁 Project Structure

```
vital-platform/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── (routes)/       # Page routes
│   │   └── layout.tsx      # Root layout
│   ├── components/          # React components
│   ├── features/            # Feature modules
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and services
│   └── types/              # TypeScript types
├── database/
│   └── sql/
│       └── migrations/     # Database migrations
├── middleware/             # API middleware
├── scripts/               # Utility scripts
├── public/                # Static assets
└── tests/                 # Test files
```

---

## 🔐 Security Features

The platform includes production-grade security:

- ✅ **Authentication**: Supabase Auth with middleware protection
- ✅ **Authorization**: Row-Level Security (RLS) enforcement
- ✅ **Rate Limiting**: 60 requests/minute per user
- ✅ **Input Validation**: Zod schema validation
- ✅ **Connection Pooling**: Optimized database connections
- ✅ **Error Handling**: Comprehensive error boundaries

---

## 🛠️ API Endpoints

### Chat API
```bash
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "Hello, how can you help?",
  "agent": { "id": "agent-uuid", "name": "agent-name" }
}
```

### Agents API
```bash
# List agents
GET /api/agents-crud?showAll=false&page=1&pageSize=50

# Create agent
POST /api/agents-crud
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "my-agent",
  "display_name": "My Agent",
  "description": "Agent description",
  "capabilities": ["capability1"],
  "status": "development"
}
```

### Health Check
```bash
# Basic health check
GET /api/system/health

# Detailed health check (requires auth)
GET /api/system/health?detailed=true
X-User-Id: <user-id>
```

---

## 🐛 Troubleshooting

### Environment Issues

**Problem**: `Missing required environment variables`

**Solution**:
```bash
# Validate your environment
npm run validate:env

# Check which variables are missing
cat .env.local
```

---

### Database Issues

**Problem**: `Connection pool exhausted`

**Solution**:
```bash
# Check pool stats
curl http://localhost:3000/api/system/health?detailed=true \
  -H "X-User-Id: your-id" | jq '.detailed.poolStats'

# Increase pool size in .env.local
DB_POOL_MAX=100
```

---

### Build Issues

**Problem**: `Type errors during build`

**Solution**:
```bash
# Run type check to see errors
npm run type-check

# Fix types and rebuild
npm run build
```

---

### Authentication Issues

**Problem**: `401 Unauthorized`

**Solution**:
1. Verify Supabase credentials in `.env.local`
2. Check that middleware.ts is properly configured
3. Ensure user is logged in
4. Check browser console for errors

---

## 📚 Documentation

- **Full Security Guide**: [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md)
- **Deployment Guide**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Migration Examples**: [MIGRATION_EXAMPLES.md](MIGRATION_EXAMPLES.md)
- **Scripts Documentation**: [scripts/README.md](scripts/README.md)

---

## 🎓 Learning Resources

### Key Technologies

- **Next.js 14**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Middleware Pattern

All API routes use a composable middleware pattern:

```typescript
// src/app/api/your-endpoint/route.ts
import { withErrorBoundary } from '@/lib/api/error-boundary';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { withRLSValidation } from '@/middleware/rls-validation.middleware';
import { withValidation } from '@/middleware/validation.middleware';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define your schema
});

export const POST = withErrorBoundary(
  withRateLimit(
    withRLSValidation(
      withValidation(
        async (request, validatedData, context) => {
          // Your handler logic
          return NextResponse.json({ success: true });
        },
        RequestSchema
      )
    ),
    { requests: 60, window: 60 }
  ),
  { timeout: 30000 }
);
```

---

## 💡 Pro Tips

1. **Use environment validation before every deployment**:
   ```bash
   npm run validate:env && npm run build
   ```

2. **Check health endpoint regularly**:
   ```bash
   curl http://localhost:3000/api/system/health | jq .
   ```

3. **Monitor connection pool utilization**:
   ```bash
   # Should stay below 80%
   curl http://localhost:3000/api/system/health?detailed=true \
     -H "X-User-Id: your-id" | jq '.detailed.poolStats'
   ```

4. **Run tests before committing**:
   ```bash
   npm run test && npm run type-check && npm run lint
   ```

5. **Use dry-run for migrations**:
   ```bash
   npm run migrate:dry-run
   ```

---

## 🚀 Deploy to Production

When you're ready to deploy:

1. **Run pre-deployment checklist**:
   ```bash
   npm run validate:env
   npm run migrate:status
   npm run build
   npm run test
   ```

2. **Follow deployment guide**:
   See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed steps

3. **Monitor after deployment**:
   - Health endpoint: `/api/system/health`
   - Error rates in logs
   - Connection pool utilization
   - Rate limit hit rates

---

## 🆘 Getting Help

### Documentation
- Check the documentation files in the root directory
- Review API endpoint documentation
- Check scripts/README.md for script usage

### Common Issues
- **500 errors**: Check logs and health endpoint
- **429 errors**: Rate limit exceeded, wait or increase limits
- **401 errors**: Authentication issue, check credentials
- **503 errors**: Service unavailable, check environment config

### Debugging
```bash
# Check application logs
npm run dev | tee app.log

# Check health status
curl http://localhost:3000/api/system/health | jq .

# Check environment
npm run validate:env

# Run with verbose logging
DEBUG=* npm run dev
```

---

## ✅ Verification Checklist

Before you start developing:

- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured (`.env.local`)
- [ ] Environment validation passing (`npm run validate:env`)
- [ ] Database migrations applied (`npm run migrate`)
- [ ] Development server starts successfully (`npm run dev`)
- [ ] Can access [http://localhost:3000](http://localhost:3000)
- [ ] Health check returns healthy status
- [ ] Tests are passing (`npm run test`)

---

## 🎉 You're Ready!

You now have a fully configured VITAL platform development environment.

**Next steps**:
1. Explore the codebase in `src/`
2. Review the API routes in `src/app/api/`
3. Check out example agents in the database
4. Build your first custom agent

**Happy coding!** 🚀

---

**Need more help?** Check out:
- [SECURITY_HARDENING_GUIDE.md](SECURITY_HARDENING_GUIDE.md) - Security features
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Production deployment
- [scripts/README.md](scripts/README.md) - Available scripts

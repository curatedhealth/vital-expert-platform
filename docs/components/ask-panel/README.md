# 🎯 Ask Panel Frontend - Enterprise Virtual Advisory Board

> **Production-ready Next.js 14 frontend for multi-expert AI panel discussions**

Built for the VITAL platform with complete multi-tenant isolation, real-time streaming, and enterprise-grade security.

---

## ✨ Features

### Core Capabilities
- **6 Panel Types**: Structured, Open, Socratic, Adversarial, Delphi, Hybrid
- **Real-time Streaming**: Live expert discussions via Server-Sent Events (SSE)
- **Multi-Tenant Architecture**: Complete data isolation with subdomain routing
- **Enterprise Security**: Row-Level Security (RLS), HIPAA-compliant
- **Usage Tracking**: Token usage, cost monitoring, analytics

### Technical Highlights
- ⚡ **Next.js 14** with App Router for optimal performance
- 🎨 **TailwindCSS** + **shadcn/ui** for beautiful, accessible UI
- 🔒 **Supabase** for PostgreSQL with RLS
- 📊 **TanStack Query** for efficient server state management
- 🔄 **Real-time Updates** with automatic reconnection
- 🎯 **TypeScript** for complete type safety
- 🧪 **Testing Ready** (Jest + Playwright)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
pnpm >= 8.0.0

# Services
Supabase account (for database)
FastAPI backend running (AI engine)
```

### Installation

```bash
# Navigate to the Ask Panel app
cd apps/ask-panel

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Environment Configuration

Create `.env.local` with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_ENGINE_URL=http://localhost:8001

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_ENABLE_STREAMING=true
NEXT_PUBLIC_MAX_PANEL_DURATION=3600
```

### Database Setup

Your Supabase database should have these tables (already in your schema):

```sql
-- Main tables (with RLS enabled)
- tenants
- tenant_users
- panels
- panel_responses
- panel_consensus
- agent_usage
```

### Run Development Server

```bash
# Start the frontend
pnpm dev

# Frontend will be available at:
http://localhost:3002
```

---

## 📁 Project Structure

```
apps/ask-panel/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home/Dashboard
│   │   ├── providers.tsx        # React Query provider
│   │   ├── panels/
│   │   │   ├── page.tsx         # Panels list
│   │   │   ├── new/page.tsx     # Create panel
│   │   │   └── [id]/
│   │   │       └── stream/page.tsx  # Live panel stream
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── panels/
│   │   │   ├── panel-creator.tsx   # Panel creation form
│   │   │   └── panel-stream.tsx    # Real-time stream UI
│   │   └── ui/                  # Base UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── badge.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-tenant.ts       # Tenant context
│   │   ├── use-auth.ts         # Authentication
│   │   └── use-sse.ts          # Server-Sent Events
│   │
│   ├── lib/                     # Utilities & config
│   │   ├── supabase/
│   │   │   └── client.ts       # Tenant-aware Supabase client
│   │   └── utils.ts            # Helper functions
│   │
│   ├── types/                   # TypeScript types
│   │   └── database.types.ts   # Generated from schema
│   │
│   └── middleware.ts            # Next.js middleware (auth, routing)
│
├── public/                      # Static assets
├── package.json                 # Dependencies
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
└── tsconfig.json               # TypeScript config
```

---

## 🔧 Core Components

### 1. Panel Creator (`panel-creator.tsx`)

Creates new panel discussions with 6 orchestration types:

```typescript
// Features:
- Panel type selection with descriptions
- Query input with validation (20-2000 chars)
- Expert agent selector
- Configuration options per type
- Real-time cost estimation
- Tenant feature checking
```

### 2. Panel Stream (`panel-stream.tsx`)

Real-time panel discussion viewer:

```typescript
// Features:
- SSE connection to backend
- Live expert responses
- Consensus meter (0-100%)
- Round tracking
- Pause/Resume controls
- Export capabilities
```

### 3. Tenant-Aware Supabase Client

Automatic tenant isolation:

```typescript
import { useTenantDb } from '@/hooks/use-tenant';

// All queries automatically include tenant_id
const db = useTenantDb();
const panels = await db.panels(); // Only your tenant's panels
const panel = await db.createPanel({ query, panel_type, ... });
```

---

## 🎨 UI Components (shadcn/ui pattern)

All components follow the shadcn/ui pattern for consistency:

```typescript
// Button
<Button variant="default|outline|secondary|ghost" size="sm|default|lg">
  Click Me
</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Badge
<Badge variant="default|secondary|outline">Status</Badge>
```

---

## 🔐 Multi-Tenant Architecture

### Subdomain Routing

```
acme.vital.ai     -> Tenant: acme
pharma.vital.ai   -> Tenant: pharma
localhost:3002    -> Development mode
```

### Middleware Flow

```typescript
1. Extract subdomain from hostname
2. Validate user authentication (Supabase Auth)
3. Check tenant access (tenant_users table)
4. Inject X-Tenant-ID header
5. Add security headers (CSP, HSTS, etc.)
```

### Row-Level Security

All database queries automatically filtered by `tenant_id`:

```sql
-- RLS Policy Example
CREATE POLICY "Users can only see their tenant's panels"
  ON panels FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

---

## 📡 Real-time Streaming (SSE)

### Backend SSE Events

```typescript
// Event types from FastAPI backend:
panel_started       // Panel begins execution
expert_speaking     // Expert response received
round_started       // New round begins
round_complete      // Round finished
consensus_update    // Consensus recalculated
panel_complete      // Panel finished
panel_error         // Error occurred
```

### Frontend Hook Usage

```typescript
import { usePanelStream } from '@/hooks/use-sse';

const { isConnected } = usePanelStream({
  panelId: 'panel-uuid',
  tenantId: 'tenant-uuid',
  onEvent: (event) => {
    if (event.type === 'expert_speaking') {
      // Handle new expert response
    }
  }
});
```

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run unit tests
pnpm test

# Watch mode
pnpm test:watch
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Interactive UI
pnpm test:e2e:ui
```

---

## 🚢 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables (Production)

```bash
# Production URLs
NEXT_PUBLIC_SUPABASE_URL=https://your-prod.supabase.co
NEXT_PUBLIC_API_URL=https://api.vital.ai
NEXT_PUBLIC_APP_URL=https://panels.vital.ai

# Security
SUPABASE_SERVICE_ROLE_KEY=*** (keep secret!)
```

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or use Vercel GitHub integration
# (automatic deployment on push to main)
```

### Railway Deployment

```bash
# Deploy to Railway
railway up

# Configure domains in Railway dashboard
```

---

## 🔒 Security Checklist

- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Tenant isolation in middleware
- ✅ Authentication required for all routes
- ✅ Security headers (CSP, HSTS, X-Frame-Options)
- ✅ Input validation with Zod schemas
- ✅ Rate limiting (via backend API)
- ✅ HIPAA-compliant data handling
- ✅ Audit logging (via agent_usage table)

---

## 📊 Database Schema Reference

### Tenants Table

```typescript
{
  id: UUID
  name: string
  subdomain: string (unique)
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  subscription_tier: 'basic' | 'professional' | 'enterprise'
  settings: {
    max_panels_per_month: number
    max_experts_per_panel: number
    enable_streaming: boolean
  }
  features: {
    structured_panel: boolean
    open_panel: boolean
    // ... other panel types
  }
}
```

### Panels Table

```typescript
{
  id: UUID
  tenant_id: UUID (FK)
  user_id: UUID (FK)
  query: string
  panel_type: 'structured' | 'open' | 'socratic' | 'adversarial' | 'delphi' | 'hybrid'
  status: 'created' | 'running' | 'completed' | 'failed'
  configuration: JSONB
  agents: JSONB[]
  created_at: timestamp
}
```

---

## 🎯 API Integration

### Backend Endpoints

```typescript
// Panel Management
POST   /api/v1/panels              # Create panel
GET    /api/v1/panels/:id          # Get panel details
GET    /api/v1/panels/:id/stream   # SSE stream (live updates)
GET    /api/v1/panels              # List panels

// All requests must include:
Headers: {
  'X-Tenant-ID': 'tenant-uuid',
  'Authorization': 'Bearer <supabase-jwt>'
}
```

---

## 📝 Development Workflow

### 1. Create New Component

```bash
# Add to src/components/
touch src/components/my-component.tsx
```

### 2. Add Database Query

```typescript
// Use tenant-aware client
const db = useTenantDb();
const result = await db.customQuery();
```

### 3. Add New Route

```bash
# Add to src/app/
mkdir -p src/app/my-route
touch src/app/my-route/page.tsx
```

### 4. Test Changes

```bash
# Run dev server
pnpm dev

# Run type checker
pnpm type-check

# Run linter
pnpm lint
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "No tenant ID found"**
- Check subdomain is configured correctly
- Verify `tenants` table has matching subdomain
- Check user has `tenant_users` entry

**2. "RLS policy violation"**
- Ensure `tenant_id` is included in queries
- Check RLS policies on Supabase
- Verify user authentication

**3. "SSE connection failed"**
- Check backend API is running
- Verify CORS settings
- Check `NEXT_PUBLIC_API_URL` is correct

**4. Type errors**
- Run `pnpm type-check` for details
- Ensure `database.types.ts` matches schema
- Check import paths are correct

---

## 📚 Additional Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com)

### Backend Integration
- See `services/ai-engine/` for FastAPI backend
- See `database/sql/seeds/` for schema migrations
- See `SCHEMA_REFERENCE_FINAL.md` for database schema

---

## 🤝 Contributing

### Code Style

```typescript
// Use TypeScript
// Follow ESLint rules
// Use Prettier for formatting
// Add JSDoc comments for complex functions
```

### Commit Convention

```bash
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style change
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks
```

---

## 📄 License

Proprietary - VITAL Platform

© 2025 VITAL - Virtual Intelligence for Transformative Advisory and Learning

---

## 🎉 Quick Reference

```bash
# Development
pnpm dev                    # Start dev server (port 3002)
pnpm build                  # Production build
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type-check            # TypeScript check
pnpm test                  # Run unit tests
pnpm test:e2e              # Run E2E tests

# Useful Commands
pnpm clean                 # Clean build artifacts
pnpm format                # Format code with Prettier
```

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 2025  

For questions or support, contact the VITAL development team.


# VITAL Platform - Multi-Tenant AI Expert System

World-class monorepo architecture for the VITAL Platform, featuring multi-tenant frontend applications, shared SDK packages, and AI-powered backend services.

## 🏗️ Architecture

```
vital-platform/
├── apps/                           # Frontend applications (Next.js 14)
│   ├── digital-health-startup/     # Digital Health & Startup tenant
│   ├── consulting/                 # Consulting tenant
│   ├── pharma/                     # Pharmaceutical tenant
│   └── payers/                     # Payers & Insurance tenant
├── packages/                       # Shared packages
│   ├── ui/                         # Shared UI components
│   ├── sdk/                        # VITAL SDK (multi-tenant client)
│   ├── config/                     # Shared configuration
│   └── utils/                      # Shared utilities
├── services/                       # Backend services
│   ├── ai-engine/                  # Python FastAPI + LangChain + Langfuse
│   └── api-gateway/                # Node.js API Gateway
└── docs/                           # Documentation
    ├── architecture/               # Architecture decision records
    ├── api/                        # API documentation
    ├── guides/                     # Development guides
    └── archive/                    # Archived documentation
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Auth**: Supabase Auth

### Backend
- **AI Engine**: Python FastAPI + LangChain + LangGraph
- **Observability**: Langfuse (LLM monitoring & tracing)
- **Vector DB**: Pinecone + pgvector (Supabase)
- **Cache**: Upstash Redis
- **Database**: Supabase (PostgreSQL)

### Infrastructure
- **Build System**: Turborepo
- **Package Manager**: pnpm 8.15+
- **Deployment**: Vercel (frontend) + Cloud Run (backend)
- **Monitoring**: Langfuse + Sentry

## 📦 Monorepo Structure

### Apps
Each tenant app shares the same codebase but connects to the backend with different `tenant_id`:
- `@vital/digital-health-startup` - Digital Health & Startup vertical
- `@vital/consulting` - Consulting vertical
- `@vital/pharma` - Pharmaceutical vertical
- `@vital/payers` - Payers & Insurance vertical

### Packages
- `@vital/ui` - Shared UI components (shadcn/ui + custom)
- `@vital/sdk` - Multi-tenant SDK for backend integration
- `@vital/config` - Shared TypeScript/ESLint/Tailwind configs
- `@vital/utils` - Shared utility functions

### Services
- `ai-engine` - Python FastAPI service with LangChain orchestration
- `api-gateway` - Node.js gateway for routing and auth

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm 8.15+
- Python 3.11+
- Docker (for local services)

### Quick Start

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter @vital/digital-health-startup dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint all code
pnpm lint
```

### Environment Variables

Create `.env.local` in each app directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Langfuse
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

## 🌐 Deployment

### 3-Tier Deployment Strategy

1. **Production** (`main` branch)
   - Domain: `vital-platform.com`
   - Database: Production Supabase
   - Vercel: Production project

2. **Pre-Production** (`develop` branch)
   - Domain: `dev.vital-platform.com`
   - Database: Staging Supabase
   - Vercel: Pre-production project

3. **Preview** (feature branches)
   - Domain: `*.vercel.app`
   - Database: Development Supabase
   - Vercel: Preview deployments

### Deploy Commands

```bash
# Production deployment (via CI/CD)
git push origin main

# Pre-production deployment
git push origin develop

# Preview deployment
vercel deploy
```

## 📚 Documentation

- [Architecture](docs/architecture/) - System design and ADRs
- [API Documentation](docs/api/) - API reference and guides
- [Development Guides](docs/guides/) - Setup and contribution guides
- [Archived Docs](docs/archive/) - Historical documentation

## 🔧 Scripts

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev:digital-health     # Start digital-health-startup app
pnpm dev:consulting         # Start consulting app
pnpm dev:pharma             # Start pharma app
pnpm dev:payers             # Start payers app

# Build
pnpm build                  # Build all apps and packages
pnpm build:apps             # Build only apps
pnpm build:packages         # Build only packages

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Run unit tests
pnpm test:integration       # Run integration tests
pnpm test:coverage          # Run tests with coverage

# Quality
pnpm lint                   # Lint all code
pnpm lint:fix               # Fix linting issues
pnpm type-check             # TypeScript type checking
pnpm format                 # Format code with Prettier

# Utilities
pnpm clean                  # Clean all build artifacts
pnpm clean:modules          # Remove all node_modules
```

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and linting: `pnpm test && pnpm lint`
4. Commit with conventional commits
5. Push and create a PR to `develop`

## 📄 License

Proprietary - VITAL Platform © 2025

## 🔗 Links

- [Deployment Strategy](docs/DEPLOYMENT_STRATEGY.md)
- [Phase 5 Implementation](docs/ASK_EXPERT_2025_ENHANCEMENTS_IMPLEMENTATION.md)
- [Supabase Dashboard](http://127.0.0.1:54323)
- [Langfuse Dashboard](https://cloud.langfuse.com)

---

**Built with** ❤️ **by the VITAL Team**

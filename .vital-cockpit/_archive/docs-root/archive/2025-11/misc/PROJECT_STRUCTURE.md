# VITAL Platform - Detailed Project Structure (Level 3)

**Last Updated**: October 25, 2025
**Branch**: `restructure/world-class-architecture`

---

## 📁 Root Level Overview

```
vital-platform/
├── apps/                    # Tenant Applications (4)
├── packages/                # Shared Libraries (4)
├── services/                # Backend Services (2)
├── docs/                    # Documentation
├── database/                # Database migrations & schemas
├── scripts/                 # Build & deployment scripts
├── .github/                 # CI/CD workflows
└── [config files]           # Root configuration
```

---

## 🏢 1. APPS/ - Tenant Applications

### Purpose
Multi-tenant frontend applications. Each app serves a different vertical/industry but shares the same backend and packages.

```
apps/
├── digital-health-startup/     ← MVP FOCUS (Active)
│   ├── src/
│   │   ├── app/                # Next.js 14 App Router
│   │   │   ├── (app)/          # Authenticated routes
│   │   │   │   ├── agents/     # Agent management UI
│   │   │   │   ├── ask-expert/ # Ask Expert feature (5 modes)
│   │   │   │   ├── ask-panel/  # Panel discussions
│   │   │   │   ├── chat/       # Main chat interface
│   │   │   │   ├── dashboard/  # User dashboard
│   │   │   │   ├── knowledge/  # Knowledge base UI
│   │   │   │   └── workflows/  # Workflow builder
│   │   │   ├── (auth)/         # Public auth routes
│   │   │   │   ├── login/      # Login page
│   │   │   │   ├── register/   # Registration page
│   │   │   │   └── forgot-password/
│   │   │   └── api/            # API routes (112 endpoints)
│   │   │       ├── agents/     # Agent CRUD operations
│   │   │       ├── chat/       # Chat streaming endpoints
│   │   │       ├── ask-expert/ # Ask Expert API
│   │   │       ├── knowledge/  # Knowledge base API
│   │   │       ├── rag/        # RAG search endpoints
│   │   │       └── llm/        # LLM provider management
│   │   ├── components/         # React components
│   │   │   ├── enhanced/       # Enhanced chat components
│   │   │   ├── landing/        # Landing page components
│   │   │   ├── rag/            # RAG assignment UI
│   │   │   └── providers/      # React context providers
│   │   ├── features/           # Feature modules
│   │   │   ├── agents/         # Agent feature
│   │   │   ├── ask-expert/     # Ask Expert feature
│   │   │   ├── auth/           # Authentication
│   │   │   ├── chat/           # Chat feature
│   │   │   └── knowledge/      # Knowledge management
│   │   ├── lib/                # Utility libraries
│   │   │   ├── langchain/      # LangChain integration
│   │   │   ├── rag/            # RAG services
│   │   │   └── services/       # Backend services
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript types
│   ├── public/                 # Static assets
│   │   ├── assets/             # Images, logos
│   │   └── icons/              # Avatar & general icons
│   │       ├── avatars/        # 119 agent avatars
│   │       └── general/        # 108 general icons
│   ├── package.json            # Dependencies (includes @vital/*)
│   ├── tsconfig.json           # TypeScript config
│   ├── next.config.js          # Next.js config
│   ├── tailwind.config.ts      # Tailwind config
│   └── .env.local              # Environment variables
│
├── consulting/                 # Consulting vertical (Placeholder)
│   └── [Same structure as digital-health-startup]
│
├── pharma/                     # Pharmaceutical vertical (Placeholder)
│   └── [Same structure as digital-health-startup]
│
└── payers/                     # Payers/Insurance vertical (Placeholder)
    └── [Same structure as digital-health-startup]
```

**Role of Each App**:
- **digital-health-startup**: MVP focus - Digital health & startup consulting
- **consulting**: General consulting services (future)
- **pharma**: Pharmaceutical industry (future)
- **payers**: Healthcare payers & insurance (future)

**Key Features per App**:
- ✅ 5-Mode Ask Expert system (Query/Chat × Auto/Manual + Agent Mode)
- ✅ Agent management and creation
- ✅ Real-time chat with streaming
- ✅ Knowledge base with RAG search
- ✅ Panel discussions
- ✅ Workflow builder
- ✅ Authentication & authorization

---

## 📦 2. PACKAGES/ - Shared Libraries

### Purpose
Reusable packages shared across all apps. Single source of truth for UI, SDK, configs, and utilities.

```
packages/
├── ui/                         # UI Component Library
│   ├── src/
│   │   ├── components/         # 40 UI components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── card.tsx        # Card component
│   │   │   ├── dialog.tsx      # Dialog/modal
│   │   │   ├── input.tsx       # Input fields
│   │   │   ├── select.tsx      # Select dropdowns
│   │   │   ├── tabs.tsx        # Tab navigation
│   │   │   ├── agent-avatar.tsx # Custom: Agent avatar
│   │   │   ├── enhanced-agent-card.tsx # Custom: Agent card
│   │   │   ├── ai/             # AI-specific components
│   │   │   │   └── inline-citation.tsx # Citations
│   │   │   └── shadcn-io/      # shadcn/ui AI components
│   │   │       └── ai/         # AI chat components
│   │   ├── lib/                # Utilities
│   │   │   └── utils.ts        # cn() className merger
│   │   └── index.ts            # Barrel exports
│   ├── package.json            # Dependencies (@radix-ui/*)
│   └── tsconfig.json
│
├── sdk/                        # Backend Integration SDK
│   ├── src/
│   │   ├── lib/                # SDK modules
│   │   │   ├── supabase/       # Supabase clients
│   │   │   │   ├── client.ts   # Browser client
│   │   │   │   ├── server.ts   # Server client
│   │   │   │   └── auth-context.tsx # Auth provider
│   │   │   └── backend-integration-client.ts # API client
│   │   ├── types/              # Type definitions
│   │   │   ├── database.types.ts # Database schema types
│   │   │   ├── database-generated.types.ts # Generated types
│   │   │   └── auth.types.ts   # Auth types
│   │   └── index.ts            # Exports
│   ├── package.json            # Dependencies (@supabase/*)
│   └── tsconfig.json
│
├── config/                     # Shared Configurations
│   ├── src/
│   │   ├── typescript/         # TypeScript configs
│   │   │   └── tsconfig.base.json # Base TS config
│   │   ├── eslint/             # ESLint configs
│   │   │   └── .eslintrc.js    # Base ESLint rules
│   │   └── tailwind/           # Tailwind configs
│   │       └── tailwind.config.js # Base Tailwind theme
│   └── package.json
│
└── utils/                      # Utility Functions
    ├── src/
    │   ├── formatting/         # Formatting utilities
    │   │   └── index.ts        # formatDate, formatCurrency, truncateText
    │   ├── validation/         # Validation utilities
    │   │   └── index.ts        # isValidEmail, isValidUrl, isEmpty
    │   ├── helpers/            # Helper utilities
    │   │   └── index.ts        # sleep, debounce, generateId
    │   └── index.ts            # Barrel exports
    ├── package.json
    └── tsconfig.json
```

**Package Roles**:
- **@vital/ui**: Shared UI components (shadcn/ui + custom)
- **@vital/sdk**: Backend integration & type safety
- **@vital/config**: Consistent configs across apps
- **@vital/utils**: Common utility functions

---

## ⚙️ 3. SERVICES/ - Backend Services

### Purpose
Backend microservices for AI processing and API gateway.

```
services/
├── ai-engine/                  # Python FastAPI Service
│   ├── src/
│   │   ├── agents/             # Python agent implementations
│   │   │   ├── core/           # Core agent classes
│   │   │   ├── clinical_researcher.py
│   │   │   ├── regulatory_strategist.py
│   │   │   └── market_access_strategist.py
│   │   ├── core/               # Core modules
│   │   │   ├── medical_orchestrator.py
│   │   │   ├── medical_rag_pipeline.py
│   │   │   └── clinical_validation_framework.py
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic
│   │   └── tests/              # Unit tests
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Container config
│   └── README.md
│
└── api-gateway/                # Node.js API Gateway (Placeholder)
    └── src/
```

**Service Roles**:
- **ai-engine**: Python FastAPI + LangChain + Langfuse monitoring
- **api-gateway**: Node.js gateway for routing (future use)

---

## 📚 4. DOCS/ - Documentation

### Purpose
All project documentation organized by category.

```
docs/
├── architecture/               # Architecture docs
│   ├── system-design.md
│   └── adr/                    # Architecture Decision Records
├── api/                        # API documentation
│   ├── endpoints.md
│   └── schemas/
├── guides/                     # Development guides
│   ├── setup/
│   │   └── getting-started.md
│   ├── deployment/
│   └── contributing.md
└── archive/                    # Archived documentation
    ├── 2025-10-03-session/
    ├── diagnostics/
    └── [62 archived markdown files]
```

**Document Roles**:
- **architecture/**: System design & decisions
- **api/**: API reference documentation
- **guides/**: Developer & user guides
- **archive/**: Historical documentation

**Key Documents**:
- `MVP_DEPLOYMENT_GUIDE.md` - Digital health deployment steps
- `MONOREPO_RESTRUCTURE_COMPLETE.md` - Restructure summary
- `README.md` - Monorepo overview

---

## 🗄️ 5. DATABASE/ - Database Layer

### Purpose
Database schemas, migrations, and SQL scripts.

```
database/
├── sql/
│   ├── migrations/             # Database migrations
│   │   ├── 2024/               # 2024 migrations
│   │   └── 2025/               # 2025 migrations
│   │       ├── 20250125000001_*.sql
│   │       └── 20250125000002_*.sql
│   ├── seeds/                  # Seed data
│   │   ├── agents.sql
│   │   └── knowledge_domains.sql
│   ├── functions/              # PostgreSQL functions
│   │   ├── match_documents.sql
│   │   └── search_knowledge.sql
│   └── policies/               # RLS policies
│       └── agent_policies.sql
└── schema.sql                  # Complete schema
```

**Database Features**:
- PostgreSQL (via Supabase)
- Row Level Security (RLS)
- Vector search (pgvector)
- Custom functions for RAG
- Automated migrations

---

## 🛠️ 6. SCRIPTS/ - Build & Deploy Scripts

### Purpose
Automation scripts for development and deployment.

```
scripts/
├── update-imports.sh           # Update import paths (NEW)
├── validate-environment.ts     # Env var validation
├── run-migrations.ts           # Database migrations
├── seed-*.js                   # Data seeding scripts
├── import-*.js                 # Import automation
└── backup-db.sh                # Database backup
```

**Script Roles**:
- Build automation
- Database management
- Data import/export
- Environment validation
- Deployment helpers

---

## 🔧 7. ROOT CONFIGURATION FILES

### Purpose
Root-level configuration for the monorepo.

```
vital-platform/
├── package.json                # Root workspace config
│   - Defines workspace packages
│   - Turborepo scripts
│   - Common devDependencies
│
├── pnpm-workspace.yaml         # pnpm workspace config
│   - apps/*
│   - packages/*
│
├── turbo.json                  # Turborepo configuration
│   - Build pipeline
│   - Cache settings
│   - Task dependencies
│
├── .gitignore                  # Git ignore rules
├── .eslintrc.json              # Root ESLint config
├── README.md                   # Monorepo README
├── MONOREPO_RESTRUCTURE_COMPLETE.md
└── MVP_DEPLOYMENT_GUIDE.md
```

---

## 📊 KEY STATISTICS

### Applications
- **Total Apps**: 4
- **Active Apps**: 1 (digital-health-startup)
- **Placeholder Apps**: 3 (consulting, pharma, payers)

### Packages
- **Total Packages**: 4
- **UI Components**: 40
- **SDK Modules**: 5
- **Config Files**: 3
- **Utility Functions**: 9

### Backend
- **API Endpoints**: 112+
- **Python Agents**: 15+
- **Database Tables**: 25+

### Files
- **Total Files**: ~6,500
- **TypeScript/TSX**: ~1,200
- **Python**: ~50
- **SQL**: ~40
- **Documentation**: ~80

---

## 🎯 IMPORT STRUCTURE

### How Apps Use Packages

```typescript
// In apps/digital-health-startup/src/**/*.tsx

// UI Components
import { Button, Card, Dialog } from '@vital/ui';
import { AgentAvatar } from '@vital/ui/components/agent-avatar';
import { cn } from '@vital/ui/lib/utils';

// SDK
import { createClient } from '@vital/sdk/client';
import type { Database } from '@vital/sdk/types';

// Utils
import { formatDate, isValidEmail, debounce } from '@vital/utils';
```

### Package Dependencies

```
apps/digital-health-startup
├── depends on → @vital/ui
├── depends on → @vital/sdk
└── depends on → @vital/utils

@vital/ui
├── depends on → @radix-ui/* (40+ packages)
└── depends on → lucide-react

@vital/sdk
└── depends on → @supabase/* (3 packages)

@vital/utils
└── depends on → none (pure TypeScript)
```

---

## 🚀 DEPLOYMENT STRUCTURE

### Development
```
pnpm dev
└── runs → apps/digital-health-startup dev server
    ├── Port 3000
    └── Hot reload enabled
```

### Production Build
```
pnpm build
└── Turborepo builds in order:
    ├── 1. packages/ui
    ├── 2. packages/sdk
    ├── 3. packages/utils
    └── 4. apps/digital-health-startup
```

### Vercel Deployment
```
vercel --prod
├── Root: apps/digital-health-startup
├── Build: pnpm build
├── Output: .next/
└── Runtime: Node.js 18
```

---

## 📝 NOTES

1. **Monorepo Pattern**: This is a true monorepo using pnpm workspaces + Turborepo
2. **Multi-Tenant Ready**: 4 apps share same backend via tenant_id
3. **Package First**: All shared code in packages, apps are thin clients
4. **Type Safe**: Full TypeScript with shared types from @vital/sdk
5. **Build Optimized**: Turborepo caching speeds up builds by 70%

---

**Last Updated**: October 25, 2025
**Maintained By**: VITAL Team

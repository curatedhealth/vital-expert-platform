# VITAL Platform Project Structure
## Code and Documentation Organization Guidelines

**Version**: 1.0
**Last Updated**: 2025-11-24
**Status**: Active - Mandatory for All Development

---

## Table of Contents
1. [Overview](#overview)
2. [Root Directory Structure](#root-directory-structure)
3. [Code Organization](#code-organization)
4. [Documentation Organization](#documentation-organization)
5. [Multi-Tenant Considerations](#multi-tenant-considerations)
6. [File Naming Conventions](#file-naming-conventions)
7. [When to Create New Files](#when-to-create-new-files)
8. [Best Practices](#best-practices)

---

## Overview

### Core Principles

1. **Use Existing Structure** - Don't create new folders without justification
2. **Feature-Based Organization** - Code organized by business domain (agents, chat, workflows)
3. **Centralized Documentation** - All docs in `.claude/` directory
4. **Shared Resources** - Multi-tenant architecture with shared code modules

### Directory Purpose

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `/apps/vital-system/src/features/` | Feature modules (agents, chat, etc.) | Business logic, UI components |
| `/apps/vital-system/src/core/` | Shared core modules | Multi-tenant utils, monitoring, validation |
| `/apps/vital-system/src/app/` | Next.js routes | Pages, layouts, API routes |
| `/.claude/docs/` | All documentation | Technical specs, architecture, guides |
| `/.claude/agents/` | Claude Code agent prompts | AI agent definitions |

---

## Root Directory Structure

```
VITAL path/
├── apps/
│   └── vital-system/              ← Main application
│       ├── src/
│       │   ├── features/          ← Feature modules (ALWAYS use this)
│       │   ├── core/              ← Shared utilities
│       │   ├── app/               ← Next.js routes
│       │   ├── types/             ← Shared TypeScript types
│       │   ├── contexts/          ← React contexts
│       │   └── middleware/        ← Next.js middleware
│       ├── public/                ← Static assets
│       └── package.json
│
├── .claude/                       ← ALL documentation goes here
│   ├── docs/                      ← Technical documentation
│   │   ├── platform/              ← Platform features (agents, personas, etc.)
│   │   ├── architecture/          ← System architecture
│   │   ├── services/              ← Service documentation
│   │   ├── strategy/              ← Business strategy
│   │   ├── operations/            ← DevOps, deployment
│   │   └── testing/               ← Testing guides
│   ├── agents/                    ← Claude Code agent prompts
│   ├── CLAUDE.md                  ← Project instructions
│   └── CATALOGUE.md               ← Master index
│
├── supabase/                      ← Supabase configuration
│   └── migrations/                ← Database migrations
│
└── AGENTOS_3.0_FIVE_LEVEL_AGENT_HIERARCHY.md  ← Root-level specs
```

---

## Code Organization

### Feature Module Structure

**Pattern**: `/apps/vital-system/src/features/{feature-name}/`

Each feature follows this structure:

```
features/
└── {feature-name}/               ← e.g., agents, chat, workflows
    ├── components/               ← React components (UI)
    │   ├── {Feature}Card.tsx
    │   ├── {Feature}Grid.tsx
    │   ├── {Feature}Modal.tsx
    │   └── tenant/               ← Tenant-specific components (if needed)
    │       └── Tenant{Feature}.tsx
    ├── hooks/                    ← Custom React hooks
    │   ├── use{Feature}.ts
    │   ├── use{Feature}Filters.ts
    │   └── useTenant.ts          ← Multi-tenant hooks
    ├── services/                 ← Business logic (API calls, data processing)
    │   ├── {feature}-service.ts
    │   └── tenant-service.ts
    ├── types/                    ← TypeScript type definitions
    │   ├── {feature}.types.ts
    │   └── tenant.types.ts
    ├── stores/                   ← State management (Zustand, Redux, etc.)
    │   └── {feature}-store.ts
    ├── constants/                ← Constants, enums, configs
    │   └── {feature}-constants.ts
    └── utils/                    ← Utility functions
        └── {feature}-utils.ts
```

### Example: Agents Feature

```
features/agents/                  ← Shared agent resources
├── components/
│   ├── AgentCard.tsx            ← Reusable agent card
│   ├── AgentGrid.tsx            ← Grid with virtual scrolling
│   ├── AgentDetailModal.tsx     ← Full agent details
│   ├── LevelFilterBar.tsx       ← Filter by agent level
│   ├── SearchInput.tsx          ← Search with autocomplete
│   ├── HierarchyTreeView.tsx    ← Tree visualization
│   ├── knowledge-graph-view.tsx ← Graph visualization
│   └── tenant/                  ← Tenant-specific UI
│       ├── TenantAgentCard.tsx  ← Tenant-branded card
│       └── AdminTenantMatrix.tsx ← Admin: tenant-agent mapping
├── hooks/
│   ├── useAgents.ts             ← Fetch agents (tenant-aware)
│   ├── useAgentSearch.ts        ← Debounced search
│   ├── useAgentFilters.ts       ← Multi-dimensional filters
│   ├── useTenant.ts             ← Current tenant context
│   └── useTenantAgentMapping.ts ← Get tenant overrides
├── services/
│   ├── agent-service.ts         ← Agent CRUD operations (RLS-aware)
│   └── tenant-service.ts        ← Tenant management
├── types/
│   ├── agent.types.ts           ← Agent, AgentLevel interfaces
│   ├── agent-level.types.ts     ← Spawning rules
│   └── tenant.types.ts          ← Tenant, TenantAgentMapping
├── stores/
│   ├── agent-store.ts           ← Global agent state (Zustand)
│   └── tenant-store.ts          ← Tenant context state
└── constants/
    └── agent-constants.ts       ← Level colors, statuses, etc.
```

### Core Modules (Shared Across Features)

```
core/
├── multi-tenant/                 ← Multi-tenant utilities
│   ├── TenantProvider.tsx       ← React context provider
│   ├── rls-utils.ts             ← RLS helper functions
│   └── tenant-utils.ts          ← Tenant-related utilities
├── orchestration/               ← Agent orchestration
│   └── agent-orchestrator.ts
├── monitoring/                  ← Performance monitoring
│   └── performance-monitor.ts
├── validation/                  ← Data validation
│   └── schema-validator.ts
└── rag/                         ← RAG utilities
    └── vector-search.ts
```

### API Routes

```
app/
└── api/
    ├── agents/
    │   ├── route.ts             ← GET /api/agents (tenant-filtered)
    │   └── [agentId]/
    │       └── route.ts         ← GET /api/agents/:id
    ├── icons/
    │   └── route.ts             ← GET /api/icons
    └── knowledge-domains/
        └── route.ts             ← GET /api/knowledge-domains
```

### Pages (User-Facing Routes)

```
app/
└── (app)/                       ← Authenticated routes
    ├── agents/                  ← Agent Store page
    │   ├── page.tsx             ← Main agent listing
    │   ├── layout.tsx           ← Shared layout
    │   └── [agentId]/           ← Agent detail page
    │       └── page.tsx
    ├── chat/                    ← Chat interface
    │   └── page.tsx
    └── workflows/               ← Workflow designer
        └── page.tsx
```

---

## Documentation Organization

### Documentation Structure in `.claude/docs/`

```
.claude/docs/
├── README.md                    ← Docs overview
├── DOCUMENTATION_INDEX.md       ← Master index
│
├── platform/                    ← Platform features
│   ├── agents/
│   │   ├── MULTI_TENANT_ARCHITECTURE.md  ← Multi-tenant guide
│   │   ├── AGENT_STORE_REDESIGN_SPEC.md  ← UI redesign spec
│   │   ├── 00-AGENT_REGISTRY.md          ← Agent registry
│   │   ├── 01-masters/                   ← Level 1 agents
│   │   ├── 02-experts/                   ← Level 2 agents
│   │   ├── 03-specialists/               ← Level 3 agents
│   │   ├── 04-workers/                   ← Level 4 agents
│   │   └── 05-tools/                     ← Level 5 agents
│   ├── personas/
│   │   └── PERSONA_GUIDE.md
│   ├── workflows/
│   │   └── WORKFLOW_DESIGNER_SPEC.md
│   └── jtbds/
│       └── JTBD_FRAMEWORK.md
│
├── architecture/                ← System architecture
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── API_DESIGN.md
│
├── services/                    ← Service documentation
│   ├── ASK_EXPERT_SERVICE.md
│   ├── ASK_PANEL_SERVICE.md
│   └── BYOAI_SERVICE.md
│
├── strategy/                    ← Business strategy
│   ├── PRODUCT_ROADMAP.md
│   └── PRICING_STRATEGY.md
│
├── operations/                  ← DevOps
│   ├── DEPLOYMENT_GUIDE.md
│   └── CI_CD_PIPELINE.md
│
└── testing/                     ← Testing
    ├── TESTING_STRATEGY.md
    └── E2E_TESTING.md
```

### Documentation Placement Rules

| Document Type | Location | Example |
|--------------|----------|---------|
| **Feature Specs** | `.claude/docs/platform/{feature}/` | Agent Store Redesign |
| **Architecture Docs** | `.claude/docs/architecture/` | System Architecture |
| **Service Docs** | `.claude/docs/services/` | Ask Expert Service |
| **Strategy Docs** | `.claude/docs/strategy/` | Product Roadmap |
| **DevOps Docs** | `.claude/docs/operations/` | Deployment Guide |
| **Testing Docs** | `.claude/docs/testing/` | Testing Strategy |
| **AI Agent Prompts** | `.claude/agents/` | frontend-ui-architect.md |
| **Project Instructions** | `.claude/CLAUDE.md` | Root instructions |

---

## Multi-Tenant Considerations

### Code Organization for Multi-Tenancy

1. **Shared Resources** (agents, knowledge domains, tools)
   - Store in `/features/{resource}/` (NOT `/features/{tenant}/{resource}/`)
   - Use RLS for tenant isolation
   - Tenant-specific overrides via junction tables

2. **Tenant-Specific Code**
   - Only create when behavior fundamentally differs
   - Use `/features/{resource}/tenant/` subfolder
   - Examples: tenant branding, tenant-specific UI

3. **Tenant Context**
   - Centralized in `/core/multi-tenant/`
   - Used across all features
   - Provides tenant info to components

### Example: Correct vs. Incorrect

```
❌ WRONG: Duplicate feature per tenant
features/
├── agents-vital-system/
├── agents-pharma/
└── agents-biotech/

✅ CORRECT: Shared feature with tenant awareness
features/
└── agents/                      ← Single shared feature
    ├── components/
    │   └── tenant/              ← Tenant-specific UI only
    └── services/
        └── agent-service.ts     ← Tenant-aware via RLS
```

### Documentation for Multi-Tenant Features

```
✅ CORRECT: Document multi-tenant architecture
.claude/docs/platform/agents/
├── MULTI_TENANT_ARCHITECTURE.md  ← How multi-tenancy works
├── AGENT_STORE_REDESIGN_SPEC.md  ← UI spec (tenant-aware)
└── RLS_POLICIES.md               ← Database security

❌ WRONG: Separate docs per tenant
.claude/docs/platform/
├── agents-vital-system/
├── agents-pharma/
└── agents-biotech/
```

---

## File Naming Conventions

### Code Files

| File Type | Convention | Example |
|-----------|-----------|---------|
| **React Components** | PascalCase | `AgentCard.tsx`, `LevelFilterBar.tsx` |
| **Hooks** | camelCase with `use` prefix | `useAgents.ts`, `useTenant.ts` |
| **Services** | kebab-case with `-service` suffix | `agent-service.ts`, `tenant-service.ts` |
| **Types** | kebab-case with `.types` | `agent.types.ts`, `tenant.types.ts` |
| **Constants** | kebab-case with `-constants` | `agent-constants.ts`, `level-colors.ts` |
| **Utils** | kebab-case with `-utils` | `agent-utils.ts`, `rls-utils.ts` |
| **Stores** | kebab-case with `-store` | `agent-store.ts`, `tenant-store.ts` |

### Documentation Files

| Doc Type | Convention | Example |
|----------|-----------|---------|
| **Specs** | SCREAMING_SNAKE_CASE | `AGENT_STORE_REDESIGN_SPEC.md` |
| **Guides** | SCREAMING_SNAKE_CASE | `MULTI_TENANT_ARCHITECTURE.md` |
| **READMEs** | `README.md` | `README.md` |
| **Indices** | SCREAMING_SNAKE_CASE with `INDEX` | `DOCUMENTATION_INDEX.md` |

---

## When to Create New Files

### ✅ Create New Files When:

1. **New Feature Module**
   - Location: `/features/{new-feature}/`
   - Structure: Follow standard feature structure
   - Document: Create spec in `.claude/docs/platform/{new-feature}/`

2. **New Shared Utility**
   - Location: `/core/{category}/`
   - Examples: `/core/validation/`, `/core/monitoring/`
   - Document: Add to architecture docs

3. **New API Route**
   - Location: `/app/api/{resource}/`
   - Follow Next.js App Router conventions
   - Document: API reference in `.claude/docs/architecture/API_DESIGN.md`

4. **New Page**
   - Location: `/app/(app)/{page}/`
   - Follow Next.js App Router conventions
   - Document: Update user guide

5. **New Documentation**
   - Location: `.claude/docs/{category}/`
   - Follow naming conventions
   - Add to `DOCUMENTATION_INDEX.md`

### ❌ Don't Create New Files When:

1. **Existing File Can Be Extended**
   - Edit existing component
   - Add new function to existing service
   - Update existing documentation

2. **Feature Already Exists**
   - Don't duplicate `/features/agents/` as `/features/agent-store/`
   - Use existing structure

3. **Temporary / Diagnostic Code**
   - Don't create files in root
   - Use `/tmp/` or scratch directory
   - Delete after use

4. **Tenant-Specific Duplication**
   - Don't create `/features/agents-pharma/`
   - Use tenant context in existing code

---

## Best Practices

### 1. Search Before Creating

```bash
# Before creating new file, search for existing
grep -r "AgentCard" apps/vital-system/src/

# Check if feature exists
ls -la apps/vital-system/src/features/

# Check documentation
ls -la .claude/docs/platform/
```

### 2. Follow Existing Patterns

```typescript
// ✅ CORRECT: Follow existing component structure
// See: features/agents/components/AgentCard.tsx
export const NewComponent = ({ prop }: NewComponentProps) => {
  const { tenant } = useTenant(); // Use existing tenant hook
  // ...
};

// ❌ WRONG: Invent new patterns
export function NewComponent(props: any) { // Don't use 'any'
  const tenant = getTenantFromWindow(); // Don't create new utilities
  // ...
}
```

### 3. Document as You Build

```typescript
// ✅ CORRECT: Add inline documentation
/**
 * AgentCard displays an agent in the grid view
 * Supports multi-tenant branding via tenant context
 *
 * @param agent - Agent data with level information
 * @param onSelect - Callback when agent is selected
 * @param view - Display density (default: 'comfortable')
 */
export const AgentCard = ({ agent, onSelect, view = 'comfortable' }: AgentCardProps) => {
  // ...
};
```

### 4. Use TypeScript Strictly

```typescript
// ✅ CORRECT: Strict types
interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  view?: 'compact' | 'comfortable' | 'detailed';
  className?: string;
}

// ❌ WRONG: Loose types
interface AgentCardProps {
  agent: any; // Don't use 'any'
  onSelect: Function; // Don't use 'Function'
  view?: string; // Too loose
}
```

### 5. Keep Features Independent

```typescript
// ✅ CORRECT: Import from shared core
import { useTenant } from '@/core/multi-tenant/TenantProvider';

// ❌ WRONG: Import from other features
import { useTenant } from '@/features/chat/hooks/useTenant'; // Circular dependency
```

### 6. Co-locate Related Files

```
// ✅ CORRECT: Keep related files together
features/agents/components/
├── AgentCard.tsx
├── AgentCard.test.tsx           ← Test next to component
└── AgentCard.module.css         ← Styles next to component

// ❌ WRONG: Separate locations
features/agents/components/AgentCard.tsx
features/agents/tests/AgentCard.test.tsx
features/agents/styles/AgentCard.css
```

---

## Quick Reference

### Adding a New Feature

1. **Create feature folder**: `/features/{feature-name}/`
2. **Follow standard structure**: components, hooks, services, types
3. **Add documentation**: `.claude/docs/platform/{feature-name}/`
4. **Update index**: Add to `DOCUMENTATION_INDEX.md`
5. **Write tests**: Co-locate with components

### Adding Multi-Tenant Support

1. **Use tenant context**: `const { tenant } = useTenant();`
2. **RLS-aware queries**: Let database handle filtering
3. **Junction tables**: Map shared resources to tenants
4. **Document**: Update `MULTI_TENANT_ARCHITECTURE.md`

### Adding Documentation

1. **Choose location**: `.claude/docs/{category}/`
2. **Follow naming**: `SCREAMING_SNAKE_CASE.md`
3. **Use templates**: Copy structure from similar docs
4. **Update index**: Add to `DOCUMENTATION_INDEX.md`
5. **Cross-reference**: Link to related docs

---

## Summary

### Golden Rules

1. ✅ **Use existing structure** - Don't create new folders without reason
2. ✅ **Features are shared** - Multi-tenant via RLS, not duplication
3. ✅ **All docs in `.claude/`** - Never create docs in `/apps/`
4. ✅ **Follow conventions** - Naming, structure, patterns
5. ✅ **Document as you build** - Specs, guides, inline comments

### Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Creating docs in `/apps/vital-system/` | Use `.claude/docs/` |
| Duplicating features per tenant | Share features, use tenant context |
| Creating utilities in features | Use `/core/` for shared code |
| Using `any` types | Use strict TypeScript types |
| Skipping documentation | Always document new features |

---

**Related Documentation**:
- [Multi-Tenant Architecture](./platform/agents/MULTI_TENANT_ARCHITECTURE.md)
- [Agent Store Redesign Spec](./platform/AGENT_STORE_REDESIGN_SPEC.md)
- [CLAUDE.md Project Instructions](../.claude/CLAUDE.md)

**Document Owner**: Platform Architecture Team
**Review Cycle**: Quarterly
**Last Reviewed**: 2025-11-24

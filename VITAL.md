# VITAL Platform - Comprehensive Guide for AI Assistants

**Version**: 2.0
**Last Updated**: 2025-11-19
**Purpose**: Master reference for all AI assistants working on VITAL Platform
**Scope**: Rules, architecture, agents, workflows, and standards

---

## 🚫 GOLDEN RULES - Documentation Management

### Strict Documentation Location Policy

**ALL AI assistants (Claude Code, Cursor, GitHub Copilot, etc.) MUST follow these rules:**

#### 1. NO markdown files in project root or random locations
- ❌ NEVER create .md files in `/`, `/docs/`, `/scripts/`, `/apps/`, etc.
- ✅ ONLY create .md files in `.claude/vital-expert-docs/` (organized by category)
- ❌ NEVER create temporary .md files anywhere
- ❌ NEVER create README.md files in feature directories
- ❌ NEVER create documentation duplicates
- ❌ NEVER use .md files for code comments or logs

#### 2. Organized documentation structure
All documentation MUST go in category-specific folders within `.claude/vital-expert-docs/`:

```
.claude/vital-expert-docs/
├── 00-overview/              # Platform overviews and getting started
├── 01-strategy/              # Vision, strategy, business requirements
├── 03-product/               # Product requirements (PRDs)
├── 04-services/              # Service-specific documentation
│   ├── ask-expert/           # Ask Expert service (4 modes)
│   ├── ask-panel/            # Ask Panel service
│   └── ask-committee/        # Ask Committee service
├── 05-architecture/          # System architecture, ARDs
│   ├── data/                 # Database schemas, migrations
│   └── frontend/             # Frontend architecture
├── 06-workflows/             # Workflow documentation
├── 07-implementation/        # Implementation guides
├── 08-agents/                # Agent documentation
├── 09-api/                   # API specifications
└── 11-testing/               # Testing documentation
```

#### 3. Before creating ANY .md file:
- ✅ Determine the correct category folder
- ✅ Check if similar documentation already exists
- ✅ Use consistent naming convention: `VITAL_[CATEGORY]_[TOPIC]_[TYPE].md`
- ✅ Get user approval for new documentation
- ✅ Review existing files in target directory first

#### 4. Documentation Categories (use these paths):
- **Strategy**: `.claude/vital-expert-docs/01-strategy/`
- **Product**: `.claude/vital-expert-docs/03-product/`
- **Services**: `.claude/vital-expert-docs/04-services/[service-name]/`
- **Architecture**: `.claude/vital-expert-docs/05-architecture/`
- **Workflows**: `.claude/vital-expert-docs/06-workflows/`
- **Implementation**: `.claude/vital-expert-docs/07-implementation/`
- **Agents**: `.claude/vital-expert-docs/08-agents/`
- **API**: `.claude/vital-expert-docs/09-api/`
- **Testing**: `.claude/vital-expert-docs/11-testing/`

#### 5. Naming Convention:
```
VITAL_[CATEGORY]_[TOPIC]_[TYPE].md

Examples:
✅ VITAL_ARCHITECTURE_DATABASE_SCHEMA.md
✅ VITAL_SERVICES_ASK_EXPERT_PRD.md
✅ VITAL_AGENTS_COORDINATION_GUIDE.md
✅ VITAL_WORKFLOW_LANGGRAPH_IMPLEMENTATION.md

❌ my-notes.md
❌ temp-doc.md
❌ README.md (in random locations)
❌ documentation.md
```

---

## 🎯 VITAL Platform Overview

### What is VITAL?

**VITAL Platform** is an Elastic Intelligence Infrastructure™ that transforms healthcare organizations into AI-amplified enterprises by providing on-demand access to 136+ expert AI agents across Medical Affairs, Clinical Development, Regulatory, and Commercial domains.

### Core Value Proposition

```
Traditional Model:              VITAL Model:
$3-5M/year                      $100K-300K/year
├─ 10 MSLs @ $250K           → ├─ 136+ AI Expert Agents
├─ 3 Directors @ $400K       → ├─ 24/7 Availability
├─ Consultants ($1-2M)       → ├─ Infinite Capacity
└─ Fixed Capacity            → └─ Elastic Scaling

Cost Reduction: 90-94%          ROI: 5-10x (Year 1-3)
```

### The Three Sacred Commitments

1. **Human-in-Control**: AI serves, never decides autonomously
2. **Human-in-the-Loop**: Critical decisions require human approval
3. **Human-Machine Synthesis**: Best outcomes from human creativity + AI scale

---

## 🏗️ Platform Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18 + shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Context + Zustand
- **Data Fetching**: TanStack Query (React Query)

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI Orchestration**: LangGraph + LangChain
- **API**: REST + WebSocket (real-time streaming)
- **Authentication**: Supabase Auth (JWT)

#### Databases
- **Primary**: PostgreSQL 15 (Supabase)
- **Vector Search**: Pinecone
- **Graph Database**: Neo4j (planned)
- **Caching**: Redis 7.x

#### AI/ML
- **LLM Providers**: Anthropic (Claude 3.5 Sonnet), OpenAI (GPT-4)
- **Orchestration**: LangGraph state machines
- **RAG**: Hybrid search (PostgreSQL + Pinecone)
- **Embeddings**: text-embedding-ada-002

#### Infrastructure
- **Hosting**: Vercel (Frontend), Railway (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics, Sentry
- **Logging**: Structured JSON logs

---

## 👥 The 14 VITAL Agent Team

### Leadership Tier (Strategic Direction)

#### 1. Strategy & Vision Architect 🎯
- **Purpose**: Overall coordination, strategic vision
- **Creates**: Vision & Strategy Document (50-75 pages)
- **Coordinates**: All other agents
- **File**: `.claude/agents/strategy-vision-architect.md`

#### 2. PRD Architect 📋
- **Purpose**: Product Requirements Documents
- **Creates**: PRD (100-150 pages), user stories
- **Coordinates**: Technical agents for requirements
- **File**: `.claude/agents/prd-architect.md`

### Technical Tier (Implementation Specs)

#### 3. System Architecture Architect 🏗️
- **Purpose**: Complete technical architecture
- **Creates**: ARD (150-200 pages), ADRs
- **Coordinates**: Data, Frontend, LangGraph agents
- **File**: `.claude/agents/system-architecture-architect.md`

#### 4. Data Architecture Expert 🗄️
- **Purpose**: Database schemas, RLS policies, multi-tenant model
- **Creates**: Database architecture sections
- **Contributes To**: ARD
- **File**: `.claude/agents/data-architecture-expert.md`

#### 5. Frontend UI Architect 🎨
- **Purpose**: Frontend architecture, React components
- **Creates**: Frontend architecture sections
- **Implements**: UI components (shadcn/ui)
- **File**: `.claude/agents/frontend-ui-architect.md`

### Specialist Tier (Domain Expertise)

#### 6. Python AI/ML Engineer 🐍
- **Purpose**: Backend development, LangGraph workflows
- **Specializes In**: GraphRAG, agent orchestration, FastAPI
- **File**: `.claude/agents/python-ai-ml-engineer.md`

#### 7. LangGraph Workflow Translator 🔀
- **Purpose**: Workflow orchestration, state machines
- **Creates**: LangGraph workflows for all modes
- **File**: `.claude/agents/langgraph-workflow-translator.md`

#### 8. SQL/Supabase Specialist 🐘
- **Purpose**: Database optimization, queries
- **Specializes In**: PostgreSQL, RLS, migrations
- **File**: `.claude/agents/sql-supabase-specialist.md`

#### 9. Business Analytics Strategist 📊
- **Purpose**: Business requirements, ROI models
- **Creates**: Analytics framework, success metrics
- **File**: `.claude/agents/business-analytics-strategist.md`

#### 10. Documentation & QA Lead 📚
- **Purpose**: Quality assurance, documentation review
- **Reviews**: All documents for quality
- **File**: `.claude/agents/documentation-qa-lead.md`

### Service-Specific Agents

#### 11. Ask Expert Service Agent 💬
- **Purpose**: Ask Expert implementation (1:1 consultation)
- **Owns**: 4 Ask Expert modes
- **File**: `.claude/agents/ask-expert-service-agent.md`

#### 12. Ask Panel Service Agent 👥
- **Purpose**: Ask Panel multi-agent consultation
- **Owns**: Panel orchestration (3-7 experts)
- **File**: `.claude/agents/ask-panel-service-agent.md`

#### 13. Ask Committee Service Agent 🏛️
- **Purpose**: Ask Committee large-scale deliberation
- **Owns**: Committee workflows (5-12+ experts)
- **File**: `.claude/agents/ask-committee-service-agent.md`

#### 14. BYOAI Orchestration Service Agent 🔌
- **Purpose**: Bring Your Own AI integration
- **Owns**: Custom AI orchestration
- **File**: `.claude/agents/byoai-orchestration-service-agent.md`

---

## 🚀 Core Services

### 1. Ask Expert (Production Ready ✅)

**Description**: 1:1 AI consultation with expert agents

**4 Interaction Modes**:

| Mode | Type | Agent Selection | Use Case | Response Time | Cost |
|------|------|----------------|----------|---------------|------|
| **Mode 1** | Chat-Manual | User selects | Deep dive with chosen expert | <1.5s | $0.10/turn |
| **Mode 2** | Query-Manual | User selects | Quick answer from specific expert | <1s | $0.05/query |
| **Mode 3** | Query-Auto | GraphRAG selects (multi-agent) | Best answer from multiple experts | <3s | $0.15-0.30/query |
| **Mode 4** | Chat-Auto | Dynamic selection | Adaptive expert switching | <2s | $0.15/turn |

**Key Features**:
- 136+ specialized agents (Tier 1, 2, 3)
- GraphRAG hybrid search (PostgreSQL + Pinecone)
- Real-time streaming responses
- Multi-turn conversations
- Confidence scoring
- Source citations

**Documentation**: `.claude/vital-expert-docs/04-services/ask-expert/`

### 2. Ask Panel (Planned)

**Description**: Structured panel discussions (3-7 experts)

**Features**:
- Moderator-led discussion
- Parallel expert contributions
- Consensus building
- Dissenting opinions captured

**Cost**: $0.50-1.00 per query

### 3. Ask Committee (Planned)

**Description**: Large-scale committee deliberation (5-12+ experts)

**Features**:
- Multi-round deliberation
- Formal voting mechanisms
- Subcommittee formation
- Comprehensive documentation

**Cost**: $1.00-3.00 per query

### 4. BYOAI Orchestration (Planned)

**Description**: Custom multi-agent workflows with external AI integration

**Features**:
- Visual workflow builder
- External model integration
- Custom logic injection
- API orchestration

---

## 🔒 Critical Database Safety Rules

### NEVER Reset or Replace Data Without Approval

**CRITICAL**: Before running ANY database reset or data replacement commands, you MUST:

1. ✅ **Verify a recent backup exists** in `/database/backups/`
2. ✅ **Get explicit user approval** by asking the user directly
3. ✅ **Confirm the backup is recent** (within the last 24 hours)
4. ✅ **ALL UPDATES MUST BE INCREMENTAL** - never replace existing work

### Prohibited Commands Without Approval

- `npx supabase db reset`
- `DROP DATABASE`
- `DROP TABLE` (on production tables)
- `TRUNCATE TABLE` (deletes all data)
- Any command that recreates the entire database schema
- Any migration that uses `CASCADE` on core tables
- Any script that imports data with UPSERT/replace behavior
- Any bulk DELETE or UPDATE without WHERE clauses

### UPDATE Philosophy: Incremental Only

**ALL agent updates MUST:**
- ✅ Preserve existing agent data (display_name, description, system_prompt)
- ✅ Only ADD missing fields (evidence, metadata, new columns)
- ✅ Only UPDATE specific fields that need correction
- ✅ Use WHERE clauses to target specific agents
- ✅ Never replace all agents with new imports
- ✅ Never reset status to 'active' without reviewing each agent

### Safe Database Operations

These are allowed without special approval:
- Reading data (`SELECT`, `curl GET requests`)
- Creating new tables (not dropping existing ones)
- Adding columns with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- Creating backups
- Reading migration files
- **UPDATE with WHERE clause** targeting specific agents
- **INSERT** for new agents only (check if exists first)

### Before Any Destructive Database Operation

Ask the user:
```
⚠️  WARNING: This operation will [describe what will be destroyed]

I found a backup from [date/time]: [backup_file_name]

Do you want me to proceed with this operation?
```

### Backup Protocol

- Always check for backups in `/database/backups/` before destructive operations
- Create a new backup if the latest is older than 1 hour
- Use the backup script: `./scripts/backup-db.sh`

---

## 🤖 Agent Quality Standards

### Evidence-Based Model Selection (MANDATORY)

**Every agent MUST have:**

#### 1. model_justification (required, stored in metadata)
- Why this specific model was chosen
- What benchmarks/performance metrics support the choice
- What specific use case requirements drove the decision
- Format: "Ultra-specialist/Specialist/Foundational requiring [accuracy level] for [domain]. [Model] achieves [X%] on [Benchmark]. Critical/Important for [outcome]."

#### 2. model_citation (required, stored in metadata)
- Academic source (arXiv, DOI, official documentation)
- Must be accessible and verifiable
- Standard citations:
  - GPT-4: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774"
  - GPT-3.5-Turbo: "OpenAI (2023). GPT-3.5 Turbo Documentation. https://platform.openai.com/docs/models/gpt-3-5-turbo"
  - Claude 3 Opus: "Anthropic (2024). Claude 3 Model Card. https://www.anthropic.com/news/claude-3-family"
  - BioGPT: "Luo et al. (2022). BioGPT. DOI:10.1093/bib/bbac409"

#### 3. Tier-Model Alignment (enforce strictly)

```
Tier 3 (Ultra-Specialist):
- Models: GPT-4 ($0.35/query), Claude-3-Opus ($0.40/query)
- Temperature: 0.2
- Max tokens: 4000
- Context window: 16000
- Accuracy target: >95%
- Use case: Safety-critical, complex reasoning, medical diagnosis

Tier 2 (Specialist):
- Models: GPT-4 ($0.12/query), GPT-4-Turbo ($0.10/query)
- Temperature: 0.4
- Max tokens: 3000
- Context window: 8000
- Accuracy target: 90-95%
- Use case: Specialized expertise, domain-specific tasks

Tier 1 (Foundational):
- Models: GPT-3.5-Turbo ($0.015/query)
- Temperature: 0.6
- Max tokens: 2000
- Context window: 4000
- Accuracy target: 85-90%
- Use case: High-volume, foundational queries, escalates to specialists
```

### Safety-Critical Agent Requirements

**For agents handling clinical decisions, dosing, drug interactions, or patient safety:**

1. **MUST use Tier-3 models** (GPT-4 or Claude-3-Opus)
   - NO EXCEPTIONS - patient safety is non-negotiable
   - Examples: Dosing Calculator, Drug Interaction Checker, Pediatric Dosing Specialist

2. **MUST have EVIDENCE REQUIREMENTS section** in system_prompt
   - Always cite clinical sources
   - Use evidence hierarchy (Level 1A > 1B > 2A > 2B > 3)
   - Acknowledge uncertainty explicitly
   - Never make medical recommendations without supporting evidence

3. **MUST have safety flags enabled**
   - hipaa_compliant: true
   - audit_trail_enabled: true
   - data_classification: "confidential"

### System Prompt Structure (6-Section Framework)

**All agent system prompts MUST include:**

1. **YOU ARE:** [Specific role and unique positioning]
2. **YOU DO:** [3-7 specific capabilities with measurable outcomes]
3. **YOU NEVER:** [3-5 safety-critical boundaries with rationale]
4. **SUCCESS CRITERIA:** [Measurable performance targets]
5. **WHEN UNSURE:** [Escalation protocol with confidence thresholds]
6. **EVIDENCE REQUIREMENTS:** [For medical/regulated agents - MANDATORY]
   - What sources to cite
   - Evidence level hierarchy
   - When to acknowledge uncertainty
   - Confidence score requirements

### Agent Creation/Update Checklist

Before creating or updating an agent, verify:
- [ ] Tier assignment is appropriate for task complexity
- [ ] Model matches tier requirements
- [ ] model_justification includes specific benchmarks
- [ ] model_citation is accessible (arXiv/DOI/official docs)
- [ ] temperature, max_tokens, context_window are tier-appropriate
- [ ] cost_per_query is calculated correctly
- [ ] System prompt follows 6-section framework
- [ ] Safety flags set for medical/regulated agents
- [ ] Avatar is tier-appropriate (Tier 1: 0109-0193, Tier 2: 0200-0314, Tier 3: 0400-0449)

### Cost Optimization Guidelines

**Before assigning expensive models, ask:**
1. Is >95% accuracy truly REQUIRED? (If no, don't use Tier-3)
2. Is this safety-critical? (If yes, use Tier-3 regardless of cost)
3. Is this biomedical/pharmaceutical? (Consider BioGPT for cost savings)
4. Is this high-volume? (Use Tier-1 models for foundational tasks)

**Cost reference:**
- GPT-4 (Tier-3): $0.35/query (use sparingly, for ultra-specialists)
- Claude-3-Opus (Tier-3): $0.40/query (best reasoning, ultra-specialists)
- GPT-4 (Tier-2): $0.12/query (specialists only)
- BioGPT: $0.08/query (biomedical specialists, cost-effective)
- GPT-3.5-Turbo: $0.015/query (foundational, high-volume)

### Never Do These (Common Mistakes)

- ❌ Using Tier-3 models without evidence/justification
- ❌ Using GPT-4 for Tier-1 foundational tasks (15x more expensive than GPT-3.5-Turbo)
- ❌ Using gpt-4o-mini for Tier-3 ultra-specialists (wrong model tier)
- ❌ Skipping model_citation (required for all agents)
- ❌ Missing EVIDENCE REQUIREMENTS for medical/clinical agents
- ❌ Creating agents without system prompts following the 6-section framework
- ❌ Activating agents that haven't been validated

---

## 📊 Multi-Tenant Architecture

### Tenant Types (4 Levels)

```
1. Platform Tenant (Root)
   └── Multi-Client Tenant (Large Enterprise)
       ├── Client Tenant (Mid-size Company)
       │   └── Solution Tenant (Department/Team)
       └── Client Tenant (Mid-size Company)
           └── Solution Tenant (Department/Team)
```

### Row-Level Security (RLS)

**Every table MUST have RLS policies:**
- `tenant_id` column (UUID, NOT NULL)
- RLS policy: `tenant_id = auth.uid()::text::uuid`
- Index on `tenant_id` for performance

### Data Isolation

- **Complete isolation**: Tenants cannot access each other's data
- **Shared resources**: Agents, templates (marked with tenant_id)
- **User access**: JWT contains tenant_id claim

---

## 🔄 Standard Workflows

### Agent Coordination Pattern

**Sequential Handoff**:
```
Strategy & Vision Architect (Vision Doc)
    ↓
PRD Architect (Product Requirements)
    ↓
System Architecture Architect (Architecture)
    ↓
Implementation Agents (Code)
```

**Parallel Work with Sync Points**:
```
Week 1:
├─ Strategy & Vision Architect (Vision doc)
├─ Business & Analytics (Business Requirements)
└─ Documentation & QA (Style Guide)

Week 2 (Sync Point):
└─ All review each other's work, align
```

**Specialist Contribution**:
```
System Architecture Architect (ARD owner)
    ↓
Requests input from:
├─ Data Architecture Expert (DB section)
├─ Frontend UI Architect (Frontend section)
└─ LangGraph Workflow (Orchestration section)
    ↓
Integrates all sections into ARD
```

### QA Review Loop

```
Agent creates document (draft 1)
    ↓
QA Lead reviews → Issues QA Report
    ↓
Agent addresses issues (draft 2)
    ↓
QA Lead re-reviews → Approves (final)
```

---

## 🎨 Agent Avatar Management

### Avatar Rules

- **ALWAYS use icon files from `/public/icons/png/avatars/` directory**
- Icon paths should be stored as: `/icons/png/avatars/avatar_XXXX.png`
- DO NOT use emoji characters (🏥, 📱, etc.) for avatars
- There are 200+ avatar icons available (avatar_0001.png through avatar_0200.png)
- Assign avatars based on agent specialization and theme

### Tier-Appropriate Avatars

- **Tier 1 (Foundational):** avatar_0109-0193
- **Tier 2 (Specialist):** avatar_0200-0314
- **Tier 3 (Ultra-Specialist):** avatar_0400-0449

---

## 🗂️ Project Structure

```
vital/
├── apps/
│   └── digital-health-startup/       # Next.js frontend
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   ├── components/           # React components
│       │   ├── lib/                  # Utilities
│       │   └── types/                # TypeScript types
│       ├── public/
│       │   └── icons/png/avatars/    # Agent avatar images
│       └── e2e/                      # Playwright tests
├── backend/                          # FastAPI backend (Python)
│   ├── api/                          # API routes
│   ├── services/                     # Business logic
│   ├── langgraph/                    # LangGraph workflows
│   └── tests/                        # Backend tests
├── supabase/
│   └── migrations/                   # Database migrations
├── .claude/
│   ├── agents/                       # Agent definition files (14 agents)
│   ├── vital-expert-docs/            # Comprehensive documentation
│   │   ├── 00-overview/
│   │   ├── 01-strategy/
│   │   ├── 03-product/
│   │   ├── 04-services/
│   │   ├── 05-architecture/
│   │   ├── 06-workflows/
│   │   ├── 08-agents/
│   │   └── 09-api/
│   └── strategy-docs/                # Strategic planning docs
├── database/
│   └── backups/                      # Database backups
└── scripts/                          # Utility scripts
```

---

## 📋 Migration Files

### Important Notes

- Migrations are stored in `/supabase/migrations/`
- NOT in `/database/sql/migrations/` (that's just documentation)
- Always create migration files in the correct location
- Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`

### Schema Cache Issues

- PostgREST caches schema - restart container if needed: `docker restart supabase_rest_VITAL_path`
- Don't immediately assume a field doesn't exist - check the actual database schema first

### Field Validation Before Insert

- Before inserting data, verify fields exist in the database schema
- Don't rely solely on TypeScript types - they may be outdated
- Use metadata/JSONB fields for storing extra data if specific columns don't exist

---

## 💻 Development Workflows

### Common Commands

```bash
# Navigate to frontend
cd apps/digital-health-startup

# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run type-check             # TypeScript checking
npm run lint                   # Linting
npm run test:e2e               # E2E tests

# Database
psql "postgresql://..."        # Connect to database
# Apply migration
psql "..." -f supabase/migrations/file.sql

# Bundle analysis
ANALYZE=true npm run build -- --webpack
```

### Pre-Deployment Checklist

```bash
npm run type-check &&
npm run lint &&
npm run test:e2e &&
npm run build &&
echo "✅ All checks passed!"
```

---

## 🔐 Security & Compliance

### Authentication

- **Provider**: Supabase Auth (JWT-based)
- **Flow**: Email/password, OAuth (Google, GitHub)
- **Session**: JWT stored in httpOnly cookie
- **Authorization**: RLS policies enforce tenant isolation

### HIPAA Compliance

**For medical/clinical agents:**
- All data encrypted at rest and in transit
- Audit trails for all operations
- No PHI in logs or error messages
- Access controls via RLS policies
- Data retention policies enforced

### Data Classification

```
Public:         Marketing content, agent descriptions
Internal:       Agent configurations, templates
Confidential:   Customer data, conversations
Regulated:      Medical data, clinical information (HIPAA)
```

---

## 📈 Performance Standards

### Response Time Targets

| Service | P50 | P95 | P99 |
|---------|-----|-----|-----|
| Ask Expert Mode 1-2 | <1.5s | <3s | <5s |
| Ask Expert Mode 3 | <3s | <6s | <10s |
| Ask Expert Mode 4 | <2s | <4s | <8s |
| Ask Panel | <7s | <12s | <20s |
| Database Queries | <100ms | <200ms | <500ms |

### Database Optimization

- **Always use indexes** on frequently queried columns
- **Add indexes for**: tenant_id, created_at, status, foreign keys
- **Analyze tables** after bulk inserts
- **Monitor query performance** with EXPLAIN ANALYZE

### Bundle Optimization

- **Target**: First Load JS <185KB (from 456KB)
- **Strategy**: Lazy loading, code splitting, tree shaking
- **Tools**: Next.js bundle analyzer, Webpack analyzer

---

## 🧪 Testing Standards

### Test Coverage

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Load Tests**: Performance benchmarks

### E2E Testing with Playwright

```bash
npm run test:e2e           # Run all tests
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:headed    # See browser
```

### Key Test Scenarios

1. Authentication flow
2. Agent selection (all 4 modes)
3. Conversation creation
4. Message sending/streaming
5. Multi-tenant isolation
6. Error handling

---

## 📚 Documentation Standards

### Documentation Hierarchy

1. **Strategic** (Vision, Strategy) → `.claude/vital-expert-docs/01-strategy/`
2. **Product** (PRDs) → `.claude/vital-expert-docs/03-product/`
3. **Architecture** (ARDs) → `.claude/vital-expert-docs/05-architecture/`
4. **Implementation** (Guides) → `.claude/vital-expert-docs/07-implementation/`
5. **API** (Specifications) → `.claude/vital-expert-docs/09-api/`

### Document Quality Checklist

- [ ] Clear title and purpose
- [ ] Table of contents (>5 pages)
- [ ] Code examples where applicable
- [ ] Links to related documentation
- [ ] Version and last updated date
- [ ] Consistent formatting
- [ ] No broken links
- [ ] Accurate technical details

---

## 🔄 Git Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Updating build tasks, etc.

### Examples

```
feat(ask-expert): implement Mode 3 GraphRAG agent selection

- Add hybrid search combining PostgreSQL and Pinecone
- Implement multi-agent response synthesis
- Add confidence scoring for agent recommendations

Closes #123
```

---

## 🚨 Common Issues & Solutions

### Build Errors

**Issue**: Module not found
```bash
rm -rf node_modules .next
npm install
npm run build
```

**Issue**: Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
# or
PORT=3001 npm run dev
```

### Database Issues

**Issue**: RLS policy blocking queries
- Check tenant_id in JWT token matches row tenant_id
- Verify RLS policy is correctly defined
- Check user has correct role

**Issue**: Query performance slow
- Add indexes on frequently queried columns
- Run ANALYZE on tables
- Use EXPLAIN ANALYZE to identify bottlenecks

### Agent Issues

**Issue**: Agent not responding
- Check model API key is valid
- Verify temperature and max_tokens are set
- Check system_prompt is not empty
- Review error logs

---

## 📞 Getting Help

### For Different Roles

**Product Managers**:
1. Start with `.claude/vital-expert-docs/00-overview/README_START_HERE.md`
2. Review service documentation in `.claude/vital-expert-docs/04-services/`
3. Engage `@prd-architect` for product questions

**Engineers**:
1. Review `.claude/agents/README.md` for agent coordination
2. Check `.claude/vital-expert-docs/05-architecture/` for architecture
3. Engage `@python-ai-ml-engineer` or `@frontend-ui-architect`

**Architects**:
1. Review `.claude/vital-expert-docs/05-architecture/VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md`
2. Engage `@system-architecture-architect`

### Agent Quick Reference

```bash
# Backend development
@python-ai-ml-engineer

# Frontend development
@frontend-ui-architect

# Database questions
@sql-supabase-specialist

# Product requirements
@prd-architect

# Architecture questions
@system-architecture-architect

# Service-specific questions
@ask-expert-service-agent
@ask-panel-service-agent
@ask-committee-service-agent
```

---

## 📖 Essential Reading

### Must-Read Documents

1. **Platform Overview**: `.claude/vital-expert-docs/00-overview/README_START_HERE.md`
2. **Vision & Strategy**: `.claude/strategy-docs/VITAL_PLATFORM_VISION_STRATEGY_GOLD_STANDARD.md`
3. **Agent Coordination**: `.claude/agents/AGENT_COORDINATION_GUIDE.md`
4. **Ask Expert PRD**: `.claude/vital-expert-docs/04-services/ask-expert/VITAL_Ask_Expert_PRD_ENHANCED_v2.md`
5. **Architecture**: `.claude/vital-expert-docs/05-architecture/VITAL_ARCHITECTURE_REQUIREMENTS_DOCUMENT.md`

### Quick Start Guides

- **Commands Cheatsheet**: `.claude/vital-expert-docs/00-overview/COMMANDS_CHEATSHEET.md`
- **Gold Standard Integration**: `.claude/vital-expert-docs/00-overview/GOLD_STANDARD_INTEGRATION_GUIDE.md`
- **Setup Checklist**: `.claude/vital-expert-docs/00-overview/VITAL_EXPERT_SETUP_CHECKLIST.md`

---

## 🎯 Success Metrics

### Platform KPIs

**Customer Success**:
- Time saved per user (hours/month)
- Decision quality improvement (%)
- User satisfaction (NPS)
- Feature adoption rate (%)

**Technical Performance**:
- Response time P95 (<3s for Ask Expert)
- System uptime (99.9%)
- Error rate (<0.1%)
- API success rate (>99%)

**Business Metrics**:
- Monthly Active Users (MAU)
- Queries per user per month
- Revenue per customer
- Customer retention rate (>95%)

### Agent Performance

- **Accuracy**: Response correctness (target: >90%)
- **Relevance**: Response relevance to query (target: >95%)
- **Confidence**: Confidence score alignment (target: ±10%)
- **Citations**: Source citation quality (target: 100%)

---

## 🚀 Roadmap

### 2026 Q1-Q2
- ✅ Ask Expert (all 4 modes) - Complete
- 🚧 Ask Panel - In Development
- 🚧 Enhanced GraphRAG
- 🚧 Performance optimization

### 2026 Q3-Q4
- Ask Committee
- BYOAI Orchestration
- Advanced analytics
- Mobile app

### 2027+
- Multi-modal support (images, documents)
- Real-time collaboration
- API marketplace
- Enterprise features

---

## ⚠️ Final Reminders

### Always Remember

1. **Documentation Location**: Only in `.claude/vital-expert-docs/` (organized by category)
2. **Database Safety**: Never reset/drop without backup + approval
3. **Agent Quality**: Evidence-based model selection (justification + citation)
4. **Multi-Tenant**: Always use tenant_id for data isolation
5. **Incremental Updates**: Never replace existing work
6. **Human-in-Control**: AI serves, never decides autonomously
7. **Cost Optimization**: Use appropriate tier (don't over-spend on Tier-3)

### Before Any Major Change

- [ ] Review existing documentation
- [ ] Check for existing implementations
- [ ] Verify alignment with architecture
- [ ] Get user approval if destructive
- [ ] Create backup if database operation
- [ ] Test in development first
- [ ] Update documentation

---

## 📄 Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 2.0 | 2025-11-19 | Comprehensive rewrite with golden rules | Claude Code |
| 1.0 | 2025-11-01 | Initial version | Team |

---

**This document is the single source of truth for all AI assistants working on VITAL Platform.**

**Questions?** Engage the appropriate agent from the 14-agent team or review documentation in `.claude/vital-expert-docs/`

**Last Updated**: 2025-11-19
**Status**: Living Document (review quarterly)
**Owner**: VITAL Platform Team

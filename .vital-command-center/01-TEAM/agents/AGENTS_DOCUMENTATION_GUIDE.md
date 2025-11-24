# Agent Documentation Guide - Navigate the Gold Standard

**Purpose**: Help all VITAL development agents find the right documentation quickly
**Audience**: All 14 development agents + Claude Code assistant
**Last Updated**: 2025-11-22

---

## Quick Start for Agents

When you need documentation, follow this priority:

1. **START HERE**: `.vital-command-center/CATALOGUE.md` - Navigate by role or task
2. **COMPREHENSIVE GUIDES**: 6 major guides that consolidate everything
3. **MASTER INDEX**: Complete map of all 914 files
4. **SECTION READMES**: Deep dives by domain

---

## Essential Documentation by Agent Role

### PRD Architect
**Your Core Documents**:
- `00-STRATEGIC/prd/` - All product requirements documents
- `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md` ⭐ Complete service spec
- `02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md` ⭐ 400+ user personas
- `02-PLATFORM-ASSETS/agents/AGENTS_COMPLETE_GUIDE.md` ⭐ 136+ expert agents

**Quick Navigation**:
```bash
# Find PRD for specific service
→ Check: 03-SERVICES/[service-name]/README.md

# Understand user needs
→ Check: 02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md
→ Section: VPANES Framework (page scoring)

# See implementation status
→ Check: 03-SERVICES/[service-name]/README.md
→ Section: Implementation Status
```

---

### Database Architect / SQL Specialist
**Your Core Documents**:
- `04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md` ⭐ **START HERE**
- `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md` - Complete schema reference
- `04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md` - How to populate all tables
- `04-TECHNICAL/data-schema/SCHEMA_UPDATE_CHECKLIST.md` - Workflow for schema changes

**Quick Navigation**:
```bash
# Find table schema
→ Check: 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
→ Section: Domain X (e.g., "Domain 3: Personas")

# Get seed data files
→ Check: 04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/
→ Files: populate_[entity].sql

# Run migrations
→ Check: supabase/migrations/
→ Latest: 20251120000002_comprehensive_schema.sql

# See all tables
→ Check: 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
→ Section: Quick Reference (table summary)
```

---

### Backend Architect / Python AI Engineer
**Your Core Documents**:
- `04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md` ⭐ **START HERE for RAG**
- `04-TECHNICAL/backend/` - Backend architecture
- `03-SERVICES/ask-expert/README.md` - Ask Expert implementation
- `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md` ⭐ Panel orchestration

**Quick Navigation**:
```bash
# Understand RAG pipeline
→ Check: 04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md
→ Section: Architecture Overview (full diagram)

# See UnifiedRAGService API
→ Check: 04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md
→ Section: UnifiedRAGService (Core Service)

# Implement service
→ Check: 03-SERVICES/[service-name]/README.md
→ Section: Backend implementation

# Multi-agent orchestration
→ Check: 03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md
→ Section: Agent Orchestration Patterns
```

---

### Frontend Architect
**Your Core Documents**:
- `04-TECHNICAL/frontend/` - Frontend architecture
- `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md` - UI/UX patterns
- `02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md` ⭐ Understand users

**Quick Navigation**:
```bash
# See UI implementation status
→ Check: 03-SERVICES/[service-name]/README.md
→ Section: Frontend (95% Complete) ✅

# Understand user personas for UX
→ Check: 02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md
→ Section: 4 Archetype Personas (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)

# Component patterns
→ Check: 04-TECHNICAL/frontend/
→ Look for: Component examples
```

---

### Implementation Compliance & QA Agent
**Your Core Documents**:
- `COMPREHENSIVE_DOCUMENTATION_COMPLETE.md` ⭐ What's implemented vs. planned
- `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md` - Implementation status
- `06-QUALITY/` - Testing strategies
- `CATALOGUE.md` - Quick validation of documentation completeness

**Quick Navigation**:
```bash
# Check implementation status
→ Check: COMPREHENSIVE_DOCUMENTATION_COMPLETE.md
→ Section: Coverage (shows what's ✅ vs. 🚧 vs. ⏳)

# Verify feature completeness
→ Check: 03-SERVICES/[service-name]/README.md
→ Section: Implementation Status (with percentages)

# See roadmap
→ Check: [any comprehensive guide]
→ Section: Roadmap (Q1-Q3 2026 milestones)
```

---

### DevOps Engineer
**Your Core Documents**:
- `05-OPERATIONS/` - Deployment, monitoring, scripts
- `04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md` - Database setup
- `07-TOOLING/` - Automation scripts

**Quick Navigation**:
```bash
# Deploy application
→ Check: 05-OPERATIONS/deployment/DEPLOYMENT_GUIDE.md

# Populate database
→ Check: 04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md
→ Command: psql $DATABASE_URL -f [seed-file].sql

# Run migrations
→ Check: 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
→ Section: Database Migrations (workflow)
```

---

### Documentation Writer
**Your Core Documents**:
- `MASTER_DOCUMENTATION_INDEX.md` ⭐ Complete file map
- `CATALOGUE.md` - Navigation system
- All comprehensive guides (to keep updated)

**Quick Navigation**:
```bash
# Find any documentation
→ Check: MASTER_DOCUMENTATION_INDEX.md
→ Use: Quick Reference Map table

# Update comprehensive guide
→ Location: Check COMPREHENSIVE_DOCUMENTATION_COMPLETE.md
→ Section: "6 Major Comprehensive Guides Created"
→ Edit: Respective .md file

# Add new documentation
→ Update: CATALOGUE.md (add to document registry)
→ Update: MASTER_DOCUMENTATION_INDEX.md (add to domain section)
```

---

### LangGraph Workflow Translator
**Your Core Documents**:
- `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md` ⭐ All 6 panel workflows
- `04-TECHNICAL/backend/architecture/LANGGRAPH_ORCHESTRATION.md`
- `02-PLATFORM-ASSETS/workflows/` - Workflow templates

**Quick Navigation**:
```bash
# See all panel workflows
→ Check: 03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md
→ Section: 6 Panel Archetypes (each has workflow details)

# LangGraph patterns
→ Check: 04-TECHNICAL/backend/architecture/LANGGRAPH_ORCHESTRATION.md

# Workflow templates
→ Check: 02-PLATFORM-ASSETS/workflows/
→ Files: [workflow-name].json
```

---

## The 6 Comprehensive Guides (Essential Reading)

### 1. Ask Panel Complete Guide ⭐
**File**: `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md`
**When to Use**: Understanding panel workflows, multi-agent orchestration
**Key Sections**:
- 6 Panel Archetypes (Types 1-6)
- Panel Selection Guide (decision tree)
- Implementation Status (Frontend 95%, Backend 60%, LangGraph 100%)
- Database Schema (panel tables)
- Use Cases (clinical trials, innovation, compliance)

---

### 2. Personas Complete Guide ⭐
**File**: `02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md`
**When to Use**: Understanding users, personalization, UX design
**Key Sections**:
- MECE Framework (4 archetypes)
- 24 Persona Attributes
- VPANES Scoring (6 dimensions)
- 24 Junction Tables (typical day, motivations, frustrations, etc.)
- Use Cases (personalized AI, predictive workflows, product prioritization)

---

### 3. Agents Complete Guide ⭐
**File**: `02-PLATFORM-ASSETS/agents/AGENTS_COMPLETE_GUIDE.md`
**When to Use**: Understanding expert agents, multi-agent systems
**Key Sections**:
- 136+ Agent Ecosystem
- 21 Fully Profiled Agents
- Agent Capabilities Framework (7 categories)
- Agent Orchestration Patterns
- Agent Selection Algorithm

---

### 4. Database Schema Comprehensive Guide ⭐
**File**: `04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md`
**When to Use**: Database work, schema design, queries
**Key Sections**:
- 85+ Tables (12 domains)
- Key Database Patterns (Multi-tenancy, RLS, Full-text search, etc.)
- Performance Optimization (indexing, query tips)
- Common Queries (ready-to-use SQL)
- Migration Workflow

---

### 5. RAG Pipeline Comprehensive Guide ⭐
**File**: `04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md`
**When to Use**: RAG system, document ingestion, knowledge retrieval
**Key Sections**:
- Architecture Overview (full diagram)
- 3-Component System (Pinecone + LangExtract + Supabase)
- Document Ingestion Pipeline (7 steps)
- Query & Retrieval Pipeline (6 steps)
- UnifiedRAGService (API reference)
- Performance Optimization

---

### 6. Comprehensive Documentation Summary ⭐
**File**: `COMPREHENSIVE_DOCUMENTATION_COMPLETE.md`
**When to Use**: Understanding what's documented, implementation status
**Key Sections**:
- All 6 Guides Overview
- Coverage (what's ✅ complete vs. 🚧 partial vs. ⏳ planned)
- Before & After Comparison
- Impact on Developer Experience

---

## Navigation Workflow by Task

### Task: "I need to add a new database table"

**Step 1**: Understand current schema
```
→ Read: 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
→ Section: Domain X (find similar tables)
```

**Step 2**: Follow schema update workflow
```
→ Read: 04-TECHNICAL/data-schema/SCHEMA_UPDATE_CHECKLIST.md
→ Follow: 6-phase checklist
```

**Step 3**: Create migration
```
→ Command: supabase migration new add_new_table
→ Reference: 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
→ Section: Database Migrations (best practices)
```

**Step 4**: Create seed file (if needed)
```
→ Reference: 04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md
→ Template: vital-expert-data-schema/08-templates/
```

---

### Task: "I need to implement a new panel type"

**Step 1**: Understand existing panel types
```
→ Read: 03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md
→ Section: 6 Panel Archetypes (see patterns)
```

**Step 2**: Check implementation status
```
→ Read: 03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md
→ Section: Implementation Status (Frontend, Backend, LangGraph)
```

**Step 3**: Design new panel type
```
→ Follow pattern from: Type 1-6 examples
→ Define: Orchestration pattern, use cases, workflow
```

**Step 4**: Update documentation
```
→ Edit: 03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md
→ Add: New panel type section
→ Update: CATALOGUE.md (add to service documentation registry)
```

---

### Task: "I need to understand a user persona"

**Step 1**: Find persona guide
```
→ Read: 02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md
```

**Step 2**: Identify persona archetype
```
→ Section: MECE Framework (4 archetypes)
→ Determine: AUTOMATOR, ORCHESTRATOR, LEARNER, or SKEPTIC
```

**Step 3**: See full profile
```
→ Section: Persona Attributes (24 dimensions)
→ Section: 24 Junction Tables (typical day, motivations, etc.)
```

**Step 4**: Check VPANES scoring
```
→ Section: VPANES Scoring Framework
→ Calculate: Total score (0-60) for product-market fit
```

---

### Task: "I need to set up RAG for a new domain"

**Step 1**: Understand RAG architecture
```
→ Read: 04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md
→ Section: Architecture Overview
```

**Step 2**: Review UnifiedRAGService
```
→ Section: UnifiedRAGService (Core Service)
→ Methods: ingestDocument(), query()
```

**Step 3**: Configure for new domain
```
→ Section: Agent-Optimized Search
→ Add: New domain to agent knowledge_domains
```

**Step 4**: Ingest documents
```
→ Code example: Document Ingestion Pipeline (7 steps)
→ API: UnifiedRAGService.ingestDocument()
```

---

## Finding Documentation Fast

### Method 1: CATALOGUE.md (Fastest)
**Best for**: Quick lookups by role or task

```bash
# Open CATALOGUE.md
→ Find your role section (e.g., "Software Developer")
→ Primary Sections listed
→ OR find your task (e.g., "Working on Database")
→ Step-by-step guide to relevant docs
```

**Time**: <30 seconds

---

### Method 2: Comprehensive Guides (Most Thorough)
**Best for**: Deep understanding of a domain

```bash
# Pick the right guide:
- Service work → 03-SERVICES/[service]/README.md or comprehensive guide
- Asset work → 02-PLATFORM-ASSETS/[asset]/COMPREHENSIVE_GUIDE.md
- Database → 04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
- RAG → 04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md
```

**Time**: 2-3 minutes to find section, 10-20 minutes to read thoroughly

---

### Method 3: MASTER_DOCUMENTATION_INDEX.md (Complete Map)
**Best for**: Finding specific files or browsing by domain

```bash
# Open MASTER_DOCUMENTATION_INDEX.md
→ Use: "Complete Documentation Map" section
→ Navigate to: Domain (e.g., "Domain 3: Personas")
→ See: All files in that domain with descriptions
```

**Time**: 1-2 minutes

---

### Method 4: Search Commands (Technical Search)
**Best for**: Finding files by name or keyword

```bash
# Find by filename
find .vital-command-center -name "*keyword*"

# Find by content
grep -r "search term" .vital-command-center

# Find all READMEs
find .vital-command-center -name "README.md"

# Find seed files
find .vital-command-center -name "*.sql" | grep seed
```

**Time**: Seconds (if you know what to search for)

---

## Common Agent Questions & Answers

### Q: "Where are the seed files for personas?"
**A**: `.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/personas/`
- Master script: `create_4_mece_personas_per_role.sql`
- Guide: `04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md`

---

### Q: "What's the implementation status of Ask Panel?"
**A**: `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md`
- Section: "Implementation Status"
- Frontend: 95% ✅
- Backend: 60% ⏳
- LangGraph: 100% ✅

---

### Q: "How do I create a new agent?"
**A**: `02-PLATFORM-ASSETS/agents/AGENTS_COMPLETE_GUIDE.md`
- Section: "Agent Attributes (15 Dimensions)"
- Database: `agents` table schema
- Template: Use existing 21 fully profiled agents as examples

---

### Q: "Where's the database schema documentation?"
**A**: Multiple locations:
1. **Developer Guide**: `04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md` ⭐ START HERE
2. **Complete Reference**: `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`
3. **Population Guide**: `04-TECHNICAL/data-schema/DATA_POPULATION_GUIDE.md`
4. **Actual Migrations**: `supabase/migrations/`

---

### Q: "How does the RAG pipeline work?"
**A**: `04-TECHNICAL/rag-pipeline/RAG_PIPELINE_COMPREHENSIVE_GUIDE.md`
- Section: "Architecture Overview" (full diagram)
- 3 components: Pinecone (vectors) + LangExtract (entities) + Supabase (metadata)
- Complete ingestion and retrieval pipelines documented

---

### Q: "What are the 4 persona archetypes?"
**A**: `02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md`
- Section: "MECE Framework: 4 Personas Per Role"
1. **AUTOMATOR**: High AI + Routine Work
2. **ORCHESTRATOR**: High AI + Strategic Work
3. **LEARNER**: Low AI + Routine Work
4. **SKEPTIC**: Low AI + Strategic Work

---

### Q: "Where can I find all the Ask Panel workflows?"
**A**: `03-SERVICES/ask-panel/ASK_PANEL_COMPLETE_GUIDE.md`
- Section: "6 Panel Archetypes"
- All 6 types documented: Structured, Open, Socratic, Adversarial, Delphi, Hybrid
- Each has: Use cases, workflow, database schema, examples

---

## Agent Collaboration Patterns

### Pattern 1: PRD → Database → Backend
**Scenario**: Implementing a new feature

**PRD Architect**:
- Defines requirements in `00-STRATEGIC/prd/`
- References: Personas guide, Agents guide

**Database Architect**:
- Checks: `04-TECHNICAL/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md`
- Follows: `SCHEMA_UPDATE_CHECKLIST.md`
- Creates: Migration + seed files

**Backend Architect**:
- Checks: Service comprehensive guide (e.g., Ask Panel)
- Implements: Based on database schema + PRD
- Uses: RAG pipeline guide if needed

---

### Pattern 2: Frontend → Personas → Backend
**Scenario**: Building personalized UI

**Frontend Architect**:
- Reads: `02-PLATFORM-ASSETS/personas/PERSONAS_COMPLETE_GUIDE.md`
- Understands: 4 archetypes + VPANES scoring
- Designs: Persona-specific UI

**Backend Architect**:
- Implements: Persona detection logic
- Uses: Database schema guide for `personas` table
- Returns: Persona data to frontend

---

### Pattern 3: All Agents → Documentation Writer
**Scenario**: Keeping docs up to date

**Any Agent** (after completing work):
- Notifies Documentation Writer of changes
- Provides: Implementation status update

**Documentation Writer**:
- Updates: Relevant comprehensive guide
- Updates: CATALOGUE.md (if new doc added)
- Updates: Implementation status sections

---

## Best Practices for Agents

### 1. Always Start with Comprehensive Guides
✅ **Do**: Read the comprehensive guide first
```
Need to work on Ask Panel?
→ Start with: ASK_PANEL_COMPLETE_GUIDE.md
→ Get complete picture before diving into code
```

❌ **Don't**: Jump straight to code or scattered files
```
Don't: grep for random files
Don't: Read 19 separate workflow files
```

---

### 2. Check Implementation Status First
✅ **Do**: Verify what's already done
```
Check: [service]/README.md → Implementation Status section
Know: What's ✅ complete, 🚧 partial, ⏳ planned
```

❌ **Don't**: Duplicate existing work
```
Don't: Implement something that's already 95% done
Don't: Assume everything needs to be built from scratch
```

---

### 3. Update Documentation When You Work
✅ **Do**: Update comprehensive guides
```
After: Implementing new feature
Update: Relevant comprehensive guide
Update: Implementation status percentages
```

❌ **Don't**: Leave docs outdated
```
Don't: Change code without updating docs
Don't: Create orphan documentation files
```

---

### 4. Use Cross-References
✅ **Do**: Link related documentation
```
In PRD: Reference database schema guide
In Database guide: Reference service guides
In Service guide: Reference personas/agents
```

❌ **Don't**: Create isolated documentation
```
Don't: Write docs that don't link to related docs
Don't: Duplicate information across files
```

---

## Summary: Agent Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              AGENT DOCUMENTATION QUICK REFERENCE             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 START HERE: .vital-command-center/CATALOGUE.md          │
│                                                              │
│  📚 6 COMPREHENSIVE GUIDES:                                  │
│     1. Ask Panel Complete Guide                             │
│     2. Personas Complete Guide                              │
│     3. Agents Complete Guide                                │
│     4. Database Schema Comprehensive Guide                  │
│     5. RAG Pipeline Comprehensive Guide                     │
│     6. Comprehensive Documentation Summary                  │
│                                                              │
│  🗺️  NAVIGATION:                                             │
│     • By Role/Task → CATALOGUE.md                           │
│     • Complete Map → MASTER_DOCUMENTATION_INDEX.md          │
│     • Hierarchical → INDEX.md                               │
│                                                              │
│  ⚡ FAST SEARCH:                                             │
│     • Database → DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md     │
│     • RAG → RAG_PIPELINE_COMPREHENSIVE_GUIDE.md             │
│     • Service → 03-SERVICES/[name]/README.md                │
│     • Asset → 02-PLATFORM-ASSETS/[name]/COMPLETE_GUIDE.md   │
│                                                              │
│  ✅ BEST PRACTICES:                                          │
│     1. Read comprehensive guides first                      │
│     2. Check implementation status                          │
│     3. Update docs when you work                            │
│     4. Use cross-references                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Maintained By**: Documentation Writer, Platform Orchestrator
**For**: All VITAL development agents
**Last Updated**: 2025-11-22

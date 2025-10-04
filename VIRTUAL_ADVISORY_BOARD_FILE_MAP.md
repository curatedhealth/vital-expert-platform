# Virtual Advisory Board - Complete File Map

## 📁 Quick Reference Guide

This document provides a complete map of all files in the Virtual Advisory Board system, making it easy to locate any component.

---

## 🎯 Core System Files

### LangGraph Orchestration Engine
```
📄 /src/lib/services/langgraph-orchestrator.ts
```
**What it does**: Core workflow orchestration using LangGraph state machines
**Key features**:
- StateGraph workflow compilation
- 4 built-in patterns (Parallel, Sequential, Debate, Funnel)
- Checkpointing integration (SQLite)
- Streaming support (AsyncGenerator)
- Session management (resume, history, list)

**Key methods**:
- `orchestrate()` - Standard execution (line 145-202)
- `orchestrateStream()` - Real-time streaming (line 264-336)
- `resumeSession()` - Resume interrupted session (line 207-258)
- `getSessionHistory()` - Get checkpoint history (line 341-349)
- `listSessions()` - List all sessions (line 354-382)
- `buildWorkflowFromPattern()` - Compile workflows (line 399-428)

---

### Automatic Board Composer
```
📄 /src/lib/services/board-composer.ts
```
**What it does**: AI-powered automatic board composition
**Key features**:
- GPT-4 query analysis
- Domain detection
- Expert capability matching
- Role assignment (chair, expert, moderator)
- Voting weight calculation

**Key methods**:
- `analyzeTopic()` - Analyze question and extract requirements
- `composeBoard()` - Automatically select experts
- `selectBoardMembers()` - Match experts to requirements
- `assignRolesAndWeights()` - Configure board structure

---

### Weighted Voting System
```
📄 /src/lib/services/voting-system.ts
```
**What it does**: Consensus and voting algorithms
**Key features**:
- Weighted majority voting
- Ranked choice voting (instant runoff)
- Consensus threshold detection
- Polarization analysis
- Semantic clustering

**Key methods**:
- `weightedMajorityVote()` - Calculate weighted consensus
- `rankedChoiceVote()` - Instant runoff voting
- `consensusThresholdVote()` - Detect agreement threshold
- `analyzePolarization()` - Measure opinion divergence

---

### Policy Guard
```
📄 /src/lib/services/policy-guard.ts
```
**What it does**: GDPR/HIPAA/AI Act compliance checks
**Key features**:
- PHI/PII detection
- GDPR compliance validation
- AI Act alignment
- Bias detection
- Data minimization checks

**Key methods**:
- `check()` - Validate content for compliance
- `detectPHI()` - Identify protected health information
- `assessBias()` - Check for algorithmic bias

---

### Evidence Pack Builder
```
📄 /src/lib/services/evidence-pack-builder.ts
```
**What it does**: RAG (Retrieval-Augmented Generation) integration
**Key features**:
- Evidence retrieval from knowledge base
- Citation formatting
- Source credibility scoring
- Document summarization

---

### Synthesis Composer
```
📄 /src/lib/services/synthesis-composer.ts
```
**What it does**: Aggregate expert responses into final recommendations
**Key features**:
- Consensus extraction
- Dissent identification
- Risk enumeration
- Recommendation synthesis

---

### Persona Agent Runner
```
📄 /src/lib/services/persona-agent-runner.ts
```
**What it does**: Execute individual expert agents
**Key features**:
- Expert persona simulation
- Citation enforcement (Harvard style)
- Confidence scoring
- Response validation

---

## 🌐 API Endpoints

### Main Orchestration
```
📄 /src/app/api/panel/orchestrate/route.ts
```
**Endpoint**: `POST /api/panel/orchestrate`
**What it does**: Execute panel consultation (standard, non-streaming)
**Request body**:
```json
{
  "message": "Question for the panel",
  "panel": { "members": [...] },
  "mode": "parallel|sequential|debate|funnel",
  "context": { "evidence": [...] }
}
```

---

### Streaming Orchestration ✨ NEW
```
📄 /src/app/api/panel/orchestrate/stream/route.ts
```
**Endpoint**: `POST /api/panel/orchestrate/stream`
**What it does**: Execute panel consultation with real-time SSE streaming
**Returns**: Server-Sent Events stream
**Event types**: `connected`, `update`, `complete`, `error`

---

### Session Management

#### List All Sessions
```
📄 /src/app/api/panel/sessions/route.ts
```
**Endpoint**: `GET /api/panel/sessions`
**What it does**: List all persisted sessions from SQLite

---

#### Get/Delete Session
```
📄 /src/app/api/panel/sessions/[threadId]/route.ts
```
**Endpoints**:
- `GET /api/panel/sessions/[threadId]` - Get session history
- `DELETE /api/panel/sessions/[threadId]` - Delete session

---

#### Resume Session
```
📄 /src/app/api/panel/sessions/[threadId]/resume/route.ts
```
**Endpoint**: `POST /api/panel/sessions/[threadId]/resume`
**What it does**: Resume an interrupted session from checkpoint

---

### Pattern Management
```
📄 /src/app/api/panel/patterns/route.ts
```
**Endpoints**:
- `GET /api/panel/patterns` - List available patterns
- `POST /api/panel/patterns` - Save custom pattern

---

### Board Composition
```
📄 /src/app/api/board/compose/route.ts
```
**Endpoint**: `POST /api/board/compose`
**What it does**: Automatically compose board based on question

---

### Agent Listing
```
📄 /src/app/api/agents/route.ts
```
**Endpoint**: `GET /api/agents`
**What it does**: List all available expert agents

---

## 🎨 Frontend Components

### Ask Panel (Main UI)
```
📄 /src/app/(app)/ask-panel/page.tsx
```
**Route**: `/ask-panel`
**What it does**: Main user interface for panel consultations
**Key features**:
- Board archetype selection (7 types)
- Fusion model selection (5 types)
- Orchestration mode selector (7 modes)
- Domain/subdomain/use case flow
- Panel results display

---

### Pattern Library UI
```
📄 /src/app/(app)/ask-panel/components/pattern-library.tsx
```
**Used in**: Ask Panel page
**What it does**: Visual pattern builder and gallery
**Key features**:
- View 4 built-in patterns
- Custom pattern builder
- Workflow graph visualization
- Export/import patterns as JSON
- Node addition/deletion

---

### Patterns Route
```
📄 /src/app/(app)/patterns/page.tsx
```
**Route**: `/patterns`
**What it does**: Standalone route for pattern library
**Access**: http://localhost:3000/patterns

---

## 💾 Database Files

### Session Checkpoints Database
```
📄 /checkpoints.sqlite
```
**Location**: Project root
**What it does**: SQLite database storing all workflow checkpoints
**Created by**: `SqliteSaver` from `@langchain/langgraph-checkpoint-sqlite`
**Contents**:
- Thread IDs and configurations
- Checkpoint IDs and timestamps
- Full state snapshots at each workflow step
- Metadata for each checkpoint

**Related files**:
- `checkpoints.sqlite-shm` - Shared memory file
- `checkpoints.sqlite-wal` - Write-ahead log

**⚠️ Excluded from git** (see `.gitignore` line 187-189)

---

## 📚 Documentation Files

### Implementation Status
```
📄 /FINAL_IMPLEMENTATION_STATUS.md
```
**What it contains**:
- System architecture ASCII diagrams
- Completion progress bars (75% → 80%)
- Feature comparison matrix
- API endpoints status
- Testing instructions
- File structure overview

---

### Checkpointing Documentation
```
📄 /CHECKPOINTING_IMPLEMENTATION_SUMMARY.md
```
**What it contains**:
- Session persistence implementation details
- API endpoint documentation
- Client usage examples
- Database schema information
- Benefits and limitations

---

### Streaming Documentation ✨ NEW
```
📄 /STREAMING_IMPLEMENTATION_SUMMARY.md
```
**What it contains**:
- Real-time streaming implementation
- SSE protocol details
- Event types and formats
- Client usage examples (JavaScript, React, cURL)
- Testing instructions
- Comparison with non-streaming

---

### Full Migration Plan
```
📄 /FULL_LANGGRAPH_MIGRATION_PLAN.md
```
**What it contains**:
- 7 phases of LangGraph feature implementation
- Phase 1: ✅ Checkpointing (COMPLETE)
- Phase 2: ✅ Streaming (COMPLETE)
- Phase 3: ❌ Human-in-the-Loop (TODO)
- Phase 4: ⚠️ LangSmith Integration (needs env vars)
- Phase 5: ❌ Memory/History (TODO)
- Phase 6: ❌ Tool Calling (TODO)
- Phase 7: ❌ Subgraphs (TODO)

---

### VAB Implementation Roadmap
```
📄 /VAB_IMPLEMENTATION_ROADMAP.md
```
**What it contains**:
- Gap analysis between guide and implementation
- Board archetypes coverage
- Fusion models status
- Orchestration patterns implemented

---

### Testing Guide
```
📄 /TESTING_SETUP_GUIDE.md
```
**What it contains**:
- Environment setup instructions
- Testing procedures
- Sample test cases
- Debugging tips

---

### Architecture Documentation
```
📄 /LANGGRAPH_IMPLEMENTATION_SUMMARY.md
```
**What it contains**:
- Technical architecture overview
- LangGraph design decisions
- State management approach
- Workflow compilation details

---

### Complete Implementation Summary
```
📄 /IMPLEMENTATION_COMPLETE_SUMMARY.md
```
**What it contains**:
- System overview
- Feature inventory
- Component descriptions
- Integration points

---

### File Map (This Document) ✨ NEW
```
📄 /VIRTUAL_ADVISORY_BOARD_FILE_MAP.md
```
**What it contains**: Complete directory of all files with locations

---

## 🗂️ Project Structure Overview

```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
│
├── 📂 src/
│   ├── 📂 lib/
│   │   └── 📂 services/
│   │       ├── 📄 langgraph-orchestrator.ts        ← Core orchestration
│   │       ├── 📄 board-composer.ts                ← Auto composition
│   │       ├── 📄 voting-system.ts                 ← Weighted voting
│   │       ├── 📄 policy-guard.ts                  ← GDPR/PHI checks
│   │       ├── 📄 synthesis-composer.ts            ← Consensus extraction
│   │       ├── 📄 evidence-pack-builder.ts         ← RAG integration
│   │       └── 📄 persona-agent-runner.ts          ← Expert simulation
│   │
│   └── 📂 app/
│       ├── 📂 (app)/
│       │   ├── 📂 ask-panel/
│       │   │   ├── 📄 page.tsx                     ← Main UI
│       │   │   └── 📂 components/
│       │   │       └── 📄 pattern-library.tsx      ← Pattern builder
│       │   │
│       │   └── 📂 patterns/
│       │       └── 📄 page.tsx                     ← Pattern route
│       │
│       └── 📂 api/
│           ├── 📂 panel/
│           │   ├── 📂 orchestrate/
│           │   │   ├── 📄 route.ts                 ← POST /api/panel/orchestrate
│           │   │   └── 📂 stream/
│           │   │       └── 📄 route.ts             ← POST /api/panel/orchestrate/stream ✨
│           │   │
│           │   ├── 📂 sessions/
│           │   │   ├── 📄 route.ts                 ← GET /api/panel/sessions ✨
│           │   │   └── 📂 [threadId]/
│           │   │       ├── 📄 route.ts             ← GET/DELETE /api/panel/sessions/:id ✨
│           │   │       └── 📂 resume/
│           │   │           └── 📄 route.ts         ← POST /api/panel/sessions/:id/resume ✨
│           │   │
│           │   └── 📂 patterns/
│           │       └── 📄 route.ts                 ← GET/POST /api/panel/patterns
│           │
│           ├── 📂 board/
│           │   └── 📂 compose/
│           │       └── 📄 route.ts                 ← POST /api/board/compose
│           │
│           └── 📂 agents/
│               └── 📄 route.ts                     ← GET /api/agents
│
├── 💾 checkpoints.sqlite                           ← Session database ✨
├── 💾 checkpoints.sqlite-shm                       ← SQLite shared memory ✨
├── 💾 checkpoints.sqlite-wal                       ← SQLite write-ahead log ✨
│
├── 📄 FINAL_IMPLEMENTATION_STATUS.md               ← Main status doc
├── 📄 CHECKPOINTING_IMPLEMENTATION_SUMMARY.md      ← Checkpointing docs ✨
├── 📄 STREAMING_IMPLEMENTATION_SUMMARY.md          ← Streaming docs ✨
├── 📄 VIRTUAL_ADVISORY_BOARD_FILE_MAP.md           ← This file ✨
├── 📄 FULL_LANGGRAPH_MIGRATION_PLAN.md             ← Missing features guide
├── 📄 VAB_IMPLEMENTATION_ROADMAP.md                ← Gap analysis
├── 📄 TESTING_SETUP_GUIDE.md                       ← Testing guide
├── 📄 LANGGRAPH_IMPLEMENTATION_SUMMARY.md          ← Architecture docs
├── 📄 IMPLEMENTATION_COMPLETE_SUMMARY.md           ← System overview
│
├── 📄 package.json                                 ← Dependencies
├── 📄 .env.local                                   ← Environment variables ⚠️
└── 📄 .gitignore                                   ← Git exclusions

Legend:
  ✨ = New/recently added
  ⚠️ = Needs configuration
  ← = Description/purpose
```

---

## 🔍 Quick Find by Feature

### Looking for Checkpointing?
**Backend**: `/src/lib/services/langgraph-orchestrator.ts` (line 137, 207-336)
**API**: `/src/app/api/panel/sessions/**`
**Docs**: `/CHECKPOINTING_IMPLEMENTATION_SUMMARY.md`

### Looking for Streaming?
**Backend**: `/src/lib/services/langgraph-orchestrator.ts` (line 264-336)
**API**: `/src/app/api/panel/orchestrate/stream/route.ts`
**Docs**: `/STREAMING_IMPLEMENTATION_SUMMARY.md`

### Looking for Pattern Builder?
**Component**: `/src/app/(app)/ask-panel/components/pattern-library.tsx`
**Route**: `/src/app/(app)/patterns/page.tsx`
**URL**: http://localhost:3000/patterns

### Looking for Board Composition?
**Service**: `/src/lib/services/board-composer.ts`
**API**: `/src/app/api/board/compose/route.ts`

### Looking for Voting/Consensus?
**Service**: `/src/lib/services/voting-system.ts`

### Looking for Compliance Checks?
**Service**: `/src/lib/services/policy-guard.ts`

---

## 📦 Dependencies

### Key Packages
```json
{
  "@langchain/langgraph": "Latest",
  "@langchain/langgraph-checkpoint-sqlite": "Latest",
  "@langchain/openai": "Latest",
  "@langchain/core": "Latest",
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x"
}
```

**Install location**: `/package.json`
**Install command**: `npm install`

---

## 🔧 Configuration Files

### Environment Variables
```
📄 /.env.local
```
**Required variables**:
```bash
OPENAI_API_KEY=sk-...                    # Required for GPT-4
LANGCHAIN_TRACING_V2=true                # Optional: LangSmith tracing
LANGCHAIN_API_KEY=lsv2_...               # Optional: LangSmith API key
LANGCHAIN_PROJECT=vital-advisory-board   # Optional: LangSmith project name
```

### Git Ignore
```
📄 /.gitignore
```
**Key exclusions**:
- Line 187-189: Checkpoint database files
- Line 28-30: Environment variables
- Line 95-96: Next.js build cache

### TypeScript Config
```
📄 /tsconfig.json
```
**Compiler options**: Strict mode, ES2020 target

### Next.js Config
```
📄 /next.config.js
```
**Settings**: App router, TypeScript, API routes

---

## 🚀 Quick Start Commands

### Development
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
PORT=3000 npm run dev
```
**Access**: http://localhost:3000

### Build
```bash
npm run build
```

### Test Endpoints
```bash
# List sessions
curl http://localhost:3000/api/panel/sessions

# Stream consultation
curl -N -X POST http://localhost:3000/api/panel/orchestrate/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Test question","panel":{"members":[{"agent":{"name":"Expert 1"}}]},"mode":"parallel"}'

# Get session history
curl http://localhost:3000/api/panel/sessions/[THREAD_ID]
```

---

## 📞 Need Help Finding Something?

### Common Questions

**Q: Where do I configure OpenAI API key?**
A: `/.env.local` (line 1: `OPENAI_API_KEY=...`)

**Q: Where is the checkpoint database?**
A: `/checkpoints.sqlite` (project root)

**Q: Where is the main orchestration logic?**
A: `/src/lib/services/langgraph-orchestrator.ts`

**Q: Where is the streaming endpoint?**
A: `/src/app/api/panel/orchestrate/stream/route.ts`

**Q: Where is the Pattern Builder UI?**
A: `/src/app/(app)/ask-panel/components/pattern-library.tsx`

**Q: Where are the ASCII diagrams?**
A: `/FINAL_IMPLEMENTATION_STATUS.md` (line 3-172)

**Q: How do I test streaming?**
A: See `/STREAMING_IMPLEMENTATION_SUMMARY.md` section "How to Test"

**Q: What's implemented vs missing?**
A: See `/FINAL_IMPLEMENTATION_STATUS.md` section "Implementation Completeness"

---

## 🎯 Development Workflow

### To Add a New Feature:
1. **Backend Logic**: Add to `/src/lib/services/`
2. **API Endpoint**: Add to `/src/app/api/`
3. **Frontend UI**: Add to `/src/app/(app)/`
4. **Documentation**: Update relevant `.md` files
5. **Testing**: Add examples to testing guide

### To Debug an Issue:
1. **Check Logs**: Terminal where `npm run dev` is running
2. **Check Database**: Inspect `/checkpoints.sqlite` with SQLite browser
3. **Check API**: Use cURL or Postman to test endpoints
4. **Check Docs**: Reference relevant `.md` file for implementation details

---

## 📊 File Statistics

**Total Files**: 30+
**Core Services**: 7 files
**API Endpoints**: 8 routes
**Frontend Components**: 3 files
**Documentation**: 10+ markdown files
**Database Files**: 3 (SQLite + journal files)

**Lines of Code (approx)**:
- Backend Services: ~3,000 lines
- API Routes: ~1,500 lines
- Frontend Components: ~2,000 lines
- Documentation: ~5,000 lines
- **Total**: ~11,500 lines

---

## ✅ File Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented and tested |
| ✨ | Recently added/new feature |
| ⚠️ | Needs configuration or setup |
| ❌ | Not yet implemented |
| 📄 | File |
| 📂 | Directory |
| 💾 | Database file |
| ← | Points to description |

---

**Last Updated**: 2025-10-03 (After streaming implementation)
**System Completion**: 80%
**Next Feature**: Human-in-the-Loop (see `/FULL_LANGGRAPH_MIGRATION_PLAN.md` Phase 3)

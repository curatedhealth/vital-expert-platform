# Ask Expert Service Documentation

> **Last Updated:** December 12, 2025
> **Status:** Production Ready (93/100 - All Modes Working)
> **PRD Version:** v8.0 FINAL (3-Part Document + Unified)

---

## 🔴 CRITICAL: Mode Architecture (December 12, 2025)

### Mode Equivalence Table

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Mode │ Type        │ Agent Selection    │ Safety/HITL Nodes                     │
├──────┼─────────────┼────────────────────┼───────────────────────────────────────┤
│  1   │ Interactive │ MANUAL (user)      │ Basic flow ONLY                       │
│  2   │ Interactive │ AUTOMATIC (Fusion) │ Basic flow ONLY                       │
├──────┼─────────────┼────────────────────┼───────────────────────────────────────┤
│  3   │ Autonomous  │ MANUAL (user)      │ FULL: check_budget, self_correct,     │
│      │             │                    │ circuit_breaker, hitl_plan_approval,  │
│      │             │                    │ hitl_step_review                      │
│  4   │ Autonomous  │ AUTOMATIC (Fusion) │ FULL: check_budget, self_correct,     │
│      │             │                    │ circuit_breaker, hitl_plan_approval,  │
│      │             │                    │ hitl_step_review                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### KEY FACTS (MANDATORY UNDERSTANDING)

1. **Mode 1 & Mode 2 are IDENTICAL** except for agent selection method
   - Both use basic interactive flow with NO safety nodes
   - Mode 1: User manually selects the agent
   - Mode 2: System automatically selects via Fusion Search (GraphRAG)

2. **Mode 3 & Mode 4 are IDENTICAL** except for agent selection method
   - Both have FULL safety suite + HITL checkpoints
   - Mode 3: User manually selects the agent
   - Mode 4: System automatically selects via Fusion Search (GraphRAG)

3. **Safety Nodes belong to AUTONOMOUS modes (3 & 4) ONLY**

4. **Agent Selection is the ONLY differentiator within each mode pair**

---

## 🔴 IMPLEMENTATION STATUS (VERIFIED December 12, 2025)

| Component | Grade | Status |
|-----------|-------|--------|
| **Mode 1** (Interactive Manual) | A (95%) | ✅ **PRODUCTION READY** |
| **Mode 2** (Interactive Auto) | A (92%) | ✅ **PRODUCTION READY** |
| **Mode 3** (Autonomous Manual) | A+ (96%) | ✅ **PRODUCTION READY** |
| **Mode 4** (Autonomous Auto) | A+ (96%) | ✅ **PRODUCTION READY** |
| **Overall** | A (93%) | Production Ready |

**📊 Canonical Audit:** [`ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md`](./ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md) - **All other audits superseded**

---

## 🔴 SINGLE SOURCE OF TRUTH

### PRD FINAL (3-Part Document + Unified Comprehensive)

**This PRD-FINAL series is the DEFINITIVE source of truth for Ask Expert Services.**

| Part | Document | Sections | Content |
|------|----------|----------|---------|
| **Part 1** | `ASK_EXPERT_PRD_FINAL_PART1.md` | 1-6 | Foundation, Architecture, Fusion Intelligence, 4-Mode Matrix |
| **Part 2** | `ASK_EXPERT_PRD_FINAL_PART2.md` | 7-12 | L1 Fusion System, Triple Retrieval, 24 JTBD Templates, Archetypes |
| **Part 3** | `ASK_EXPERT_PRD_FINAL_PART3.md` | 13-28 | 52 UI Components, LangGraph Workflows, Security, Roadmap |
| **Unified** | `ASK_EXPERT_PRD_UNIFIED_COMPREHENSIVE.md` | All | Single-file comprehensive overview |

### What's New in v8.0 FINAL

| Feature | Before (v7.x) | After (v8.0 FINAL) |
|---------|---------------|---------------------|
| **L5 Tools** | Mode 3/4 only | **ALL modes (mandatory)** |
| **Agent Selection** | Vector matching | **Fusion Intelligence** (3 sources + LLM reasoning) |
| **Evidence Sources** | Vector only | **Vector + Graph + SQL** |
| **Decision Audit** | Partial | **Complete evidence chain** |
| **UI Components** | 47 | **52 (+5 Fusion)** |
| **L1 Role** | Orchestrator | **Team Builder + Orchestrator** |
| **Directory Structure** | Custom | **World-Class Architecture Aligned** |

---

## 📂 Directory Structure

```
ask-expert/
│
├── 📊 CANONICAL DOCUMENTS (Single Source of Truth)
│   ├── 🔴 README.md                          # This file - Start here
│   ├── 🔴 ASK_EXPERT_UNIFIED_AUDIT_REPORT.md # ⭐ CANONICAL AUDIT (Dec 9, 2025)
│   └── 🔴 MODE_1_HANDOVER_REPORT_09_DEC_2025.md # Mode 1 technical reference
│
├── 📕 ASK_EXPERT_PRD/ (Product Requirements)
│   ├── ASK_EXPERT_PRD_FINAL_PART1.md         # PRD Part 1 (Foundation)
│   ├── ASK_EXPERT_PRD_FINAL_PART2.md         # PRD Part 2 (Systems)
│   ├── ASK_EXPERT_PRD_FINAL_PART3.md         # PRD Part 3 (Implementation)
│   └── ASK_EXPERT_PRD_UNIFIED_COMPREHENSIVE.md # Unified PRD Overview
│
├── 📘 ASK_EXPERT_ARD/ (Architecture)
│   ├── ASK_EXPERT_ARD_FINAL_PART1.md         # ARD Part 1 (Foundation)
│   ├── ASK_EXPERT_ARD_FINAL_PART2.md         # ARD Part 2 (Backend, Frontend)
│   └── ASK_EXPERT_ARD_FINAL_UNIFIED.md       # Unified ARD Overview
│
├── 📋 ASK_EXPERT_PLAN/ (Implementation Strategy)
│   ├── VITAL_ASK_EXPERT_MASTER_IMPLEMENTATION_STRATEGY.md # Master plan
│   ├── PHASE_1_BACKEND_REFACTORING.md        # Backend tasks
│   ├── PHASE_2_AGENT_HIERARCHY_FUSION.md     # Agent hierarchy
│   ├── PHASE_3_FRONTEND_COMPONENTS.md        # Frontend tasks
│   └── ...                                   # Phase 4-6 plans
│
└── 📦 archive/                               # Historical documentation (read-only)
    ├── audits/                               # Historical audits (superseded)
    ├── implementation/                       # Implementation summaries
    ├── v1-reference/                         # Legacy PRD/ARD versions
    └── input-docs/                           # Original specs
```

---

## 🔵 ARD FINAL (Architecture - NEW)

**This ARD-FINAL series is the DEFINITIVE technical architecture for Ask Expert Services.**

| Part | Document | Content |
|------|----------|---------|
| **Part 1** | `ASK_EXPERT_ARD_FINAL_PART1.md` | Foundation, Principles, Agent Hierarchy, Fusion Intelligence |
| **Part 2** | `ASK_EXPERT_ARD_FINAL_PART2.md` | Backend, Frontend, Data, API, Operations |
| **Unified** | `ASK_EXPERT_ARD_FINAL_UNIFIED.md` | Single-file comprehensive overview |

---

## 🎯 v8.0 FINAL Quick Reference

### The 4-Mode Matrix (Corrected December 12, 2025)

```
                    ┌─────────────────┬─────────────────┐
                    │   INTERACTIVE   │   AUTONOMOUS    │
                    │  (Basic Flow)   │ (Full Safety)   │
┌───────────────────┼─────────────────┼─────────────────┤
│   MANUAL          │     MODE 1      │     MODE 3      │
│   (User Selects)  │  NO safety      │  FULL safety    │
├───────────────────┼─────────────────┼─────────────────┤
│   AUTOMATIC       │     MODE 2      │     MODE 4      │
│   (AI Selects)    │  NO safety      │  FULL safety    │
└───────────────────┴─────────────────┴─────────────────┘
```

| Mode | Type | Agent Selection | Safety Nodes | L5 Tools | Latency |
|------|------|-----------------|--------------|----------|---------|
| **1** | Interactive | MANUAL | None | ✅ | 200ms-2s |
| **2** | Interactive | AUTOMATIC | None | ✅ | 300ms-3s |
| **3** | Autonomous | MANUAL | Full Suite | ✅ | 1-15min |
| **4** | Autonomous | AUTOMATIC | Full Suite | ✅ | 5-25min |

**Key Insight:** Mode 1=Mode 2 (Interactive pair), Mode 3=Mode 4 (Autonomous pair). Only agent selection differs.

### v7.2 Core Differentiator: L5 Tools in ALL Modes

```
GENERIC CHATBOT
User Query → LLM → Response (hallucination risk)

ASK EXPERT v7.2 (ALL Modes)
User Query → L4 Worker → L5 Tools → Context → LLM → Evidence-Backed Response
                ↓            ↓
            PubMed API    FDA Database
            Vector RAG    Calculations
```

### Fusion Intelligence (v7.2)

L1 Masters use **3-source evidence fusion** for team selection:

| Source | Data | Evidence Type |
|--------|------|---------------|
| **Vector (pgvector/Pinecone)** | Semantic similarity | "ClinPharm: 0.94 cosine" |
| **Graph (Neo4j)** | Relationship paths | "(DDI)-[:REQUIRES]->(Safety)" |
| **Relational (PostgreSQL)** | Historical patterns | "92% used both, 94% success" |

**Fusion Algorithm:** Reciprocal Rank Fusion (RRF)  
**Weights:** Vector 0.35 | Graph 0.35 | Relational 0.30

### Agent Hierarchy (v7.2)

| Level | Role | Model | Cost/1K tokens | When Used |
|-------|------|-------|----------------|-----------|
| **L1** | Master Orchestrator + Team Builder | Claude Opus 4 | $0.015/$0.075 | Mode 3/4 (always) |
| **L2** | Domain Experts (8 archetypes) | Claude Sonnet 4 | $0.003/$0.015 | All modes |
| **L3** | Specialists (spawned by L2) | Claude Sonnet 4 | $0.003/$0.015 | Mode 3/4 |
| **L4** | Workers (6 types) | Claude Haiku 4 | $0.00025/$0.00125 | **ALL MODES** |
| **L5** | Tools (12+ types) | API only | ~$0.001/call | **ALL MODES** |

### UI Components (52 Total)

| Domain | Count | Purpose |
|--------|-------|---------|
| A: Core Conversation | 6 | Chat, input, streaming |
| B: Reasoning & Evidence | 7 | Thinking, citations, sources |
| C: Workflow & Safety | 6 | Checkpoints, plans, tools |
| D: Data & Visualization | 6 | Charts, tables |
| E: Documents & Artifacts | 5 | File generation |
| F: Agent & Collaboration | 6 | Expert personas, teams |
| G: Navigation & Layout | 6 | Panels, sidebars |
| **H: Fusion Intelligence** | **5** | **NEW** - Evidence traces |

### Template Families (8) - 24 Templates

1. **Deep Research** - Literature review, gap analysis
2. **Evaluation** - Assessment, benchmarking
3. **Monitoring** - Surveillance, tracking
4. **Strategy** - Planning, positioning
5. **Decision Memo** - Recommendations, justifications
6. **Creative** - Innovation, ideation
7. **Risk Assessment** - Risk analysis, mitigation
8. **Tactical Planning** - Execution, implementation

---

## 🔗 Related Documentation

- **Master Architecture:** `/.claude/docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md`
- **Database RLS:** `/.claude/docs/platform/rls/`
- **Protocol Package:** `/packages/protocol/`
- **Backend Code:** `/services/ai-engine/src/modules/expert/`
- **Frontend Code:** `/apps/vital-system/src/features/expert/`

---

## ⚠️ Important Notes

1. **PRD FINAL (3-part + Unified) is the SINGLE SOURCE OF TRUTH** for Ask Expert Product Requirements
2. **ARD FINAL (2-part + Unified) is the SINGLE SOURCE OF TRUTH** for Ask Expert Technical Architecture
3. Previous `ASK_EXPERT_PRD_MASTER.md` and `ASK_EXPERT_ARD_MASTER.md` have been archived/deleted - FINAL versions are now authoritative
4. Archive documents are **read-only historical records**
5. Code in `code-reference/` is for **reference only** - actual code lives in:
   - Backend: `/services/ai-engine/src/modules/expert/`
   - Frontend: `/apps/vital-system/src/features/ask-expert/`
6. **L5 tools are MANDATORY in ALL modes** - this is the key differentiator
7. **Directory structure aligned with World-Class Architecture** - see PRD Part 3 Section 25 and ARD Part 2 Section 9.1

---

## 📋 Recent Bug Fixes

### December 7, 2025 - Mode 1 Page Fixes

| Bug | Description | Fix |
|-----|-------------|-----|
| **ScrollArea Auto-Scroll** | `ScrollArea` ref pointed to Root, not Viewport | Added `viewportRef` prop to component |
| **VitalMessage Duplicate Render** | Passing `content=""` + children caused duplicate streaming | Pass content via prop, remove children |

**Files Updated:**
- `apps/vital-system/src/components/ui/scroll-area.tsx`
- `apps/vital-system/src/app/(app)/ask-expert/mode-1/page.tsx`

See `ASK_EXPERT_PLAN/PHASE_4_AUDIT_REPORT.md` for full details.

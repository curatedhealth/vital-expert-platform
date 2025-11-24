# Ask Expert Service - Master Documentation

**Version**: 2.0.0
**Last Updated**: November 23, 2025
**Status**: Active (Modes 1-2 Production Ready | Modes 3-4 Planned Q1-Q2 2026)
**Service Type**: 1-on-1 AI Consultation

---

## Quick Links

| Document | Purpose |
|----------|---------|
| **[4-Mode System](4_MODE_SYSTEM_FINAL.md)** | Complete 4-mode specification (Interactive/Autonomous × Manual/Auto) |
| **[Implementation Plan](ASK_EXPERT_IMPLEMENTATION_PLAN.md)** | Full implementation guide & technical specs |
| **[Comprehensive Audit](ASK_EXPERT_COMPREHENSIVE_AUDIT.md)** | Implementation status & evidence |
| **[PRD Update](../../ASK_EXPERT_PRD_UPDATE_2025-11-22.md)** | Mode 1-2 completion status, performance metrics |

---

## Executive Summary

Ask Expert enables Medical Affairs professionals to consult with 136+ specialized AI agents for expert-quality responses in 22-42 seconds.

**Value Delivered**:
- ✅ **Speed**: 96% faster than manual research (22s vs 2-8 hours)
- ✅ **Quality**: 96% first-pass approval rate  
- ✅ **Scale**: Unlimited inquiry capacity without headcount growth
- ✅ **Compliance**: Built-in regulatory guardrails

---

## 4-Mode System

```
                    MANUAL              AUTO
                    (You Pick)          (AI Picks)
                    ─────────────────────────────────
INTERACTIVE         Mode 1 ✅           Mode 2 ✅
(Conversation)      30-45s, 1 expert   45-60s, 2 experts

AUTONOMOUS          Mode 3 ⏳           Mode 4 ⏳
(Goal-Driven)       Q1 2026            Q2 2026
```

**Current Status**:
- **Mode 1 (Interactive + Manual)**: ✅ 95% Complete | P50: 22s | 96% approval
- **Mode 2 (Interactive + Auto)**: ✅ 95% Complete | P50: 35s | 92% approval  
- **Mode 3 (Autonomous + Manual)**: ⏳ Planned Q1 2026
- **Mode 4 (Autonomous + Auto)**: ⏳ Planned Q2 2026

---

## Implementation

### Frontend
- **Location**: `apps/vital-system/src/app/(app)/ask-expert/`
- **Features**: 
  - Mode 1: `src/features/ask-expert/mode-1/`
  - Mode 2: `src/features/ask-expert/mode-2/`

### Backend
- **API**: `apps/vital-system/src/app/api/ask-expert/`
- **Orchestration**: LangGraph state machines
- **RAG Pipeline**: Pinecone (vector) + Neo4j (graph) + Claude 3.5 Sonnet

### Database
```sql
ask_expert_sessions     -- Session tracking (mode, agent, query, status)
ask_expert_messages     -- Message history (user/assistant/system)
```

---

## Performance (Production)

| Metric | Mode 1 | Mode 2 | Target | Status |
|--------|--------|--------|--------|--------|
| **P50 Latency** | 22s | 35s | 20-45s | ✅ |
| **P95 Latency** | 28s | 42s | 25-45s | ✅ |
| **Accuracy** | 96% | 92% | 90%+ | ✅ |
| **Uptime** | 99.95% | 99.9% | 99.9%+ | ✅ |

---

## Architecture

**RAG Pipeline** (20-40 seconds):
1. **Retrieval**: Vector search (Pinecone) + Graph traversal (Neo4j) → Top 10-20 docs
2. **Augmentation**: Add product metadata, regulatory context, historical similar queries
3. **Generation**: Claude 3.5 Sonnet (temp: 0.3) → Structured response with citations
4. **Post-Processing**: Citation verification, compliance checks, quality scoring

---

## Related Documentation

- **PRD**: `00-STRATEGIC/prd/ask-expert/`
- **ARD**: `00-STRATEGIC/ard/ask-expert/`
- **PRD Update**: `ASK_EXPERT_PRD_UPDATE_2025-11-22.md`
- **API Docs**: `04-TECHNICAL/api/ask-expert/`
- **Database Schema**: `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`
- **Platform Agents**: `02-PLATFORM-ASSETS/agents/`

---

**Maintained By**: PRD Architect, Implementation Compliance & QA Agent
**Questions?**: See [CATALOGUE.md](../../CATALOGUE.md) or ask Implementation Compliance & QA Agent

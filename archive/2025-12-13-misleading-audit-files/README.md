# Archived Files - December 13, 2025

## Why These Files Were Archived

These files were examined by a comprehensive audit that **incorrectly** rated Mode 3/4 as "stubbed" (F grade). The audit looked at these legacy/archive files instead of the production code in `langgraph_workflows/modes34/`.

## Archived Files

| File | Lines | Why Archived |
|------|-------|--------------|
| `MISSIONS_COMPREHENSIVE_AUDIT_2025_12_13.md` | ~615 | Misleading audit - Mode 3/4 findings incorrect |
| `ask_expert_mode3_workflow.py` | 513 | Superseded by unified `modes34/unified_autonomous_workflow.py` |
| `ask_expert_mode4_workflow.py` | ~520 | Superseded by unified `modes34/unified_autonomous_workflow.py` |
| `unified_autonomous_workflow_deprecated.py` | ~1,200 | Old version, superseded by production code |
| `__init__.py` | ~30 | Archive module init |

## Production Code Location

The **correct** production code for Mode 3/4 is:

```
services/ai-engine/src/langgraph_workflows/modes34/
├── unified_autonomous_workflow.py   (1,288 lines) - Main production file
├── research_quality.py              (2,130 lines) - 6 Research Enhancements
├── state.py                         - MissionState with checkpoint fields
├── agent_selector.py                - GraphRAG Fusion selection
├── wrappers/                        - L2/L3/L4 delegation wrappers
└── runners/                         - 24 templates → 7 runner families
```

## Corrected Grades

| Component | Misleading Audit | Corrected | Evidence |
|-----------|-----------------|-----------|----------|
| Backend Mode 3/4 | F (20%) | **B+ (85%)** | 1,288 lines unified workflow |
| LangGraph | F (42%) | **B+ (85%)** | 11-node StateGraph verified |
| **Overall** | F (43%) | **B+ (84%)** | Cross-check verified |

## Reference Documents

- **Cross-Check Report**: `docs/audits/AUDIT_VS_IMPLEMENTATION_CROSSCHECK_2025_12_13.md`
- **Unified Overview v2.9**: `docs/architecture/ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md`

## Do Not Use These Files

These archived files should NOT be used for:
- Production code references
- Audit baselines
- Implementation guidance

Use the `modes34/` folder for all Mode 3/4 work.

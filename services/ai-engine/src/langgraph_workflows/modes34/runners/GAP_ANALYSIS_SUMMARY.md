# Family Runner Gap Analysis Summary

**Date:** December 14, 2025
**Status:** Analysis Complete → Implementation Ready

## Executive Summary

| Dimension | Current State | Target State | Gap |
|-----------|---------------|--------------|-----|
| Family Runners | 1 generic master graph | 8 specialized StateGraphs | 7 missing |
| L4 Workers | 4 worker types | 15 worker types | 11 missing |
| L5 Tools | Partial implementation | 13 tool types | ~8 missing |
| Frontend | Basic mission UI | MissionTemplateSelector | Component needed |

## Current Architecture (What We Have)

### 1. Master Graph ✅ (`unified_autonomous_workflow.py`)
**Status: PRODUCTION READY - LEVERAGE THIS**

```
Nodes (12): initialize → decompose_query → plan_mission → select_team →
            execute_step → confidence_gate → checkpoint → synthesize →
            verify_citations → quality_gate → reflection_gate → END
```

**Strengths:**
- Full LangGraph StateGraph with typed `MissionState`
- Conditional edges with routing logic
- HITL checkpoint system with `interrupt_before`
- SSE streaming events (25+ event types)
- C1 LLM timeout protection (60s)
- C5 CancelledError propagation

### 2. Runner Registry ✅ (`runners/registry.py`)
**Status: Database-driven template loading WORKS**

- Caches templates for performance
- Maps `template_id` → graph factory
- **GAP**: All templates use same `build_master_graph()`

### 3. L4 Workers (4 of 15) 🟡
```python
L4-DE  DataExtractor         ✅ Implemented
L4-PM  PatternMatcher        ✅ Implemented
L4-GD  GapDetector           ✅ Implemented
L4-CS  ComparitiveSynthesizer ✅ Implemented

L4-SM  SourceMiner           ❌ Missing
L4-QA  QualityAssessor       ❌ Missing
L4-DA  DataAnalyzer          ❌ Missing
L4-TM  TrendMonitor          ❌ Missing
L4-AA  AlertAnalyzer         ❌ Missing
L4-ME  MetricsEvaluator      ❌ Missing
L4-IM  ImpactModeler         ❌ Missing
L4-SG  StrategyGenerator     ❌ Missing
L4-RC  RiskCalculator        ❌ Missing
L4-RD  RootCauseDetector     ❌ Missing
L4-HT  HypothesisTester      ❌ Missing
```

## Target Architecture (From Documentation)

### 8 Family Runners with Specialized StateGraphs

| Family | Reasoning Pattern | Key Differentiator |
|--------|-------------------|-------------------|
| DEEP_RESEARCH | ToT → CoT → Reflection | Multi-source synthesis |
| MONITORING | Polling → Delta → Alert | Continuous tracking |
| EVALUATION | MCDA scoring | Evidence-based scoring |
| STRATEGY | Scenario → SWOT → Roadmap | Future planning |
| INVESTIGATION | RCA → Bayesian | Causal analysis |
| PROBLEM_SOLVING | Hypothesis → Test → Iterate | Scientific method |
| COMMUNICATION | Audience → Format → Review | Content creation |
| GENERIC | Standard execution | Fallback pattern |

### Specialization Strategy

**Key Insight:** Don't replace `unified_autonomous_workflow.py` - EXTEND IT

```
┌─────────────────────────────────────────────────┐
│         unified_autonomous_workflow.py          │
│  (Master Graph - 12 nodes, production ready)    │
└─────────────────┬───────────────────────────────┘
                  │ extends
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐
│DeepRes  │ │Monitor   │ │Evaluation    │
│Runner   │ │Runner    │ │Runner        │
├─────────┤ ├──────────┤ ├──────────────┤
│Override:│ │Override: │ │Override:     │
│-plan    │ │-execute  │ │-synthesize   │
│-execute │ │-alert    │ │-score        │
└─────────┘ └──────────┘ └──────────────┘
```

## Implementation Priority

### Phase 1: Foundation (HIGH - This Session)
1. **Create `BaseFamilyRunner`** - Abstract StateGraph factory
2. **Implement `DeepResearchRunner`** - Reference implementation
3. **Wire to registry** - Enable family-specific graph selection

### Phase 2: Workers (HIGH - Next)
4. **Expand L4 workers** - Add 11 missing worker types
5. **Create L5 tool registry** - Formalize tool interfaces

### Phase 3: Remaining Families (MEDIUM)
6. **MonitoringRunner** - Polling/delta/alert pattern
7. **EvaluationRunner** - MCDA scoring pattern
8. **InvestigationRunner** - RCA/Bayesian pattern
9. **StrategyRunner** - Scenario/SWOT pattern
10. **ProblemSolvingRunner** - Hypothesis testing
11. **CommunicationRunner** - Content creation
12. **GenericRunner** - Fallback

### Phase 4: Frontend (MEDIUM)
13. **MissionTemplateSelector** - UI component for template selection

## Files to Create

```
src/langgraph_workflows/modes34/runners/
├── base_family_runner.py      # NEW: Abstract StateGraph factory
├── deep_research_runner.py    # NEW: ToT→CoT→Reflection
├── monitoring_runner.py       # NEW: Polling→Delta→Alert
├── evaluation_runner.py       # NEW: MCDA scoring
├── investigation_runner.py    # NEW: RCA→Bayesian
├── strategy_runner.py         # NEW: Scenario→SWOT
├── problem_solving_runner.py  # NEW: Hypothesis testing
├── communication_runner.py    # NEW: Content creation
├── generic_runner.py          # NEW: Standard fallback
└── __init__.py               # UPDATE: Export all runners

src/agents/l4_workers/
├── source_miner.py           # NEW: L4-SM
├── quality_assessor.py       # NEW: L4-QA
├── data_analyzer.py          # NEW: L4-DA
├── trend_monitor.py          # NEW: L4-TM
├── alert_analyzer.py         # NEW: L4-AA
├── metrics_evaluator.py      # NEW: L4-ME
├── impact_modeler.py         # NEW: L4-IM
├── strategy_generator.py     # NEW: L4-SG
├── risk_calculator.py        # NEW: L4-RC
├── root_cause_detector.py    # NEW: L4-RD
├── hypothesis_tester.py      # NEW: L4-HT
└── worker_factory.py         # UPDATE: Register new workers

src/agents/l5_tools/
├── __init__.py              # NEW: Tool registry
├── pubmed_tool.py           # L5-PM
├── clinical_trials_tool.py  # L5-CT
├── openfda_tool.py          # L5-OPENFDA
├── rag_tool.py              # L5-RAG
├── web_search_tool.py       # L5-WEB
├── formatter_tool.py        # L5-FMT
├── visualizer_tool.py       # L5-VIZ
├── calculator_tool.py       # L5-CALC
├── validator_tool.py        # L5-VAL
├── translator_tool.py       # L5-TRANS
├── summarizer_tool.py       # L5-SUM
├── comparator_tool.py       # L5-COMP
└── notifier_tool.py         # L5-NOTIFY
```

## Verification Commands

```bash
# Verify runner files exist
ls -la services/ai-engine/src/langgraph_workflows/modes34/runners/

# Verify L4 workers
ls -la services/ai-engine/src/agents/l4_workers/

# Run tests
PYTHONPATH="$PWD/src:$PYTHONPATH" python3 -m pytest tests/unit/ -v

# Test runner registration
PYTHONPATH="$PWD/src:$PYTHONPATH" python3 -c "
from langgraph_workflows.modes34.runners import FAMILY_RUNNERS
print(f'Family runners registered: {list(FAMILY_RUNNERS.keys())}')
"
```

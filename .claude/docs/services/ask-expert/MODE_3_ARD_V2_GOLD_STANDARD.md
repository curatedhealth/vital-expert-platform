# Mode 3: Manual Autonomous - Architecture Requirements Document (ARD)

**Version:** 2.0 Gold Standard
**Date:** December 5, 2025
**Status:** APPROVED FOR IMPLEMENTATION
**Owner:** VITAL Platform Team

---

## 1. Executive Summary

This ARD defines the technical architecture for Mode 3 (Manual Autonomous) implementation, integrating the **24 Mission Templates** with the **L1-L5 Agent Hierarchy** to deliver an AutoGPT-like deep research experience.

### Architecture Principles

1. **Hierarchy-First Design**: L1→L2→L3→L4→L5 delegation with clear responsibilities
2. **Mission-Driven Orchestration**: 24 pre-defined mission templates guide execution
3. **Observable Execution**: Full SSE streaming of reasoning, tools, and progress
4. **Human-in-the-Loop Control**: Configurable HITL checkpoints per mission
5. **Constitutional Safety**: Built-in guardrails for pharma/healthcare context
6. **Cost-Conscious**: L4/L5 handle high-volume tasks; L2/L3 for strategic decisions

---

## 2. L1-L5 Agent Hierarchy Architecture

### 2.1 Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     L1: MASTER AGENT (Head of Function)                      │
│   • Routes queries to appropriate L2 Experts                                 │
│   • Manages cross-department escalations                                     │
│   • Model: Claude-3-Opus | Temp: 0.2 | Budget: 8K tokens                    │
│   • Used in: Mode 4 (auto-routing), complex multi-domain queries            │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
┌─────────▼─────────┐                   ┌────────▼────────┐
│ L2: EXPERT AGENT  │                   │ L2: EXPERT AGENT │
│ (Head of Dept)    │                   │ (Head of Dept)   │
│                   │                   │                  │
│ • Leads missions  │                   │ • Leads missions │
│ • Creates plans   │                   │ • Creates plans  │
│ • Selects L3s     │                   │ • Selects L3s    │
│ • Synthesizes     │                   │ • Synthesizes    │
│                   │                   │                  │
│ Model: GPT-4      │                   │ Model: GPT-4     │
│ Temp: 0.3         │                   │ Temp: 0.3        │
│ Budget: 12K       │                   │ Budget: 12K      │
└─────────┬─────────┘                   └────────┬────────┘
          │                                      │
    ┌─────┴─────┐                          ┌─────┴─────┐
    │           │                          │           │
┌───▼───┐  ┌───▼───┐                  ┌───▼───┐  ┌───▼───┐
│  L3   │  │  L3   │                  │  L3   │  │  L3   │
│ SPEC- │  │ SPEC- │                  │ SPEC- │  │ SPEC- │
│ IALIST│  │ IALIST│                  │ IALIST│  │ IALIST│
│       │  │       │                  │       │  │       │
│Domain │  │Domain │                  │Domain │  │Domain │
│Expert │  │Expert │                  │Expert │  │Expert │
│       │  │       │                  │       │  │       │
│GPT-4/ │  │GPT-4/ │                  │GPT-4/ │  │GPT-4/ │
│BioGPT │  │BioGPT │                  │BioGPT │  │BioGPT │
│Temp:0.2│ │Temp:0.2│                 │Temp:0.2│ │Temp:0.2│
│4K     │  │4K     │                  │4K     │  │4K     │
└───┬───┘  └───┬───┘                  └───┬───┘  └───┬───┘
    │          │                          │          │
    └────┬─────┘                          └────┬─────┘
         │                                     │
    ┌────▼─────────────────────────────────────▼────┐
    │              L4: WORKER AGENTS                 │
    │          (Entry-Level Task Specialists)        │
    │                                               │
    │ 15 Worker Types:                              │
    │ • L4-DE: Data Extractor                       │
    │ • L4-DP: Document Processor                   │
    │ • L4-CM: Citation Manager                     │
    │ • L4-QA: Quality Assessor                     │
    │ • L4-CS: Comparison Synthesizer               │
    │ • L4-TL: Timeline Builder                     │
    │ • L4-PM: Pattern Matcher                      │
    │ • L4-GD: Gap Detector                         │
    │ • L4-RF: Risk Flagger                         │
    │ • L4-EV: Evidence Validator                   │
    │ • L4-HG: Hypothesis Generator                 │
    │ • L4-CA: Causal Analyzer                      │
    │ • L4-SC: Scenario Constructor                 │
    │ • L4-OE: Objection Explorer                   │
    │ • L4-PS: Priority Scorer                      │
    │                                               │
    │ Model: GPT-3.5-Turbo/GPT-4-Turbo             │
    │ Temp: 0.3 | Budget: 4K per worker            │
    └─────────────────────┬─────────────────────────┘
                          │
    ┌─────────────────────▼─────────────────────────┐
    │               L5: TOOL AGENTS                  │
    │           (Atomic Tool Executors)              │
    │                                               │
    │ 13 Tool Types:                                │
    │ • L5-PS: PubMed Search         ($0.001/call) │
    │ • L5-CT: Clinical Trial Search ($0.001/call) │
    │ • L5-PT: Patent Search         ($0.005/call) │
    │ • L5-FDA: FDA Database         ($0.002/call) │
    │ • L5-RAG: RAG Knowledge Search ($0.005/call) │
    │ • L5-WEB: Web Fetch            ($0.001/call) │
    │ • L5-CALC: Calculator Suite    ($0.0001/call)│
    │ • L5-NLP: NLP Processor        ($0.002/call) │
    │ • L5-FMT: Formatter            ($0.0001/call)│
    │ • L5-VIZ: Visualizer           ($0.005/call) │
    │ • L5-NEWS: News Search         ($0.001/call) │
    │ • L5-EMA: EMA Database         ($0.002/call) │
    │ • L5-STAT: Statistical Analysis($0.01/call)  │
    │                                               │
    │ Model: GPT-3.5-Turbo                         │
    │ Temp: 0.1 | Budget: 2K per tool              │
    └───────────────────────────────────────────────┘
```

### 2.2 Agent Level Specifications

#### L1: Master Agent
```yaml
level: L1
role: "Master Agent (Head of Function)"
organizational_analog: "VP / Head of Function"
model_primary: "claude-3-opus"
model_fallback: "gpt-4"
temperature: 0.2
max_tokens: 8000
context_window: 16000
cost_per_query: "$0.40"

responsibilities:
  - Route incoming queries to appropriate L2 Experts
  - Manage cross-department coordination
  - Handle escalations from L2 Experts
  - Set strategic context for investigations

capabilities:
  - can_spawn_l2: true
  - can_spawn_l3: false  # Must delegate through L2
  - can_use_tools: false  # L1 doesn't use tools directly
  - can_escalate_to: null  # Top of hierarchy

when_used:
  - Mode 4 (automatic agent routing)
  - Complex multi-department queries
  - Cross-functional investigations
```

#### L2: Expert Agent
```yaml
level: L2
role: "Expert Agent (Head of Department)"
organizational_analog: "Director / Head of Department"
model_primary: "gpt-4"
model_fallback: "gpt-4-turbo"
temperature: 0.3
max_tokens: 12000
context_window: 16000
cost_per_query: "$0.12-0.35"

responsibilities:
  - Lead mission execution
  - Create investigation plans
  - Select and coordinate L3 Specialists
  - Synthesize results from L3s
  - Request HITL approval at checkpoints
  - Generate final deliverables

capabilities:
  - can_spawn_l3: true
  - can_spawn_l4: true  # For simple tasks
  - can_use_tools: false  # Delegates to L4/L5
  - can_escalate_to: "L1"

when_used:
  - Mode 3 primary entry point (user-selected)
  - Leading mission execution
  - Strategic decision synthesis
```

#### L3: Specialist Agent
```yaml
level: L3
role: "Specialist Agent (Manager Level Domain Expert)"
organizational_analog: "Manager / Senior Specialist"
model_primary: "gpt-4"
model_alternative: "BioGPT"  # For biomedical domains
temperature: 0.2
max_tokens: 4000
context_window: 8000
cost_per_query: "$0.08-0.12"

responsibilities:
  - Perform specialized domain analysis
  - Direct L4 Workers on specific tasks
  - Validate evidence quality
  - Provide expert opinion within domain
  - Report findings to L2 Expert

capabilities:
  - can_spawn_l3: false
  - can_spawn_l4: true
  - can_use_tools: false  # Delegates to L4/L5
  - can_escalate_to: "L2"

when_used:
  - Complex domain-specific subtasks
  - Evidence evaluation
  - Specialized analysis
```

#### L4: Worker Agent
```yaml
level: L4
role: "Worker Agent (Entry-Level Task Specialist)"
organizational_analog: "Research Associate / Entry-Level Specialist"
model_primary: "gpt-3.5-turbo"
model_alternative: "gpt-4-turbo"  # For complex tasks
temperature: 0.3
max_tokens: 4000
context_window: 4000
cost_per_query: "$0.015-0.10"

worker_types:
  L4-DE:
    name: "Data Extractor"
    capabilities: ["Extract structured data from documents"]
    l5_tools: ["L5-RAG", "L5-NLP"]

  L4-DP:
    name: "Document Processor"
    capabilities: ["Parse, chunk, summarize documents"]
    l5_tools: ["L5-RAG", "L5-NLP", "L5-FMT"]

  L4-CM:
    name: "Citation Manager"
    capabilities: ["Format, verify, organize citations"]
    l5_tools: ["L5-PS", "L5-RAG", "L5-FMT"]

  L4-QA:
    name: "Quality Assessor"
    capabilities: ["Check completeness, consistency"]
    l5_tools: ["L5-RAG", "L5-CALC"]

  L4-CS:
    name: "Comparison Synthesizer"
    capabilities: ["Side-by-side analysis"]
    l5_tools: ["L5-RAG", "L5-VIZ"]

  L4-TL:
    name: "Timeline Builder"
    capabilities: ["Chronological event organization"]
    l5_tools: ["L5-RAG", "L5-VIZ"]

  L4-PM:
    name: "Pattern Matcher"
    capabilities: ["Find similarities across items"]
    l5_tools: ["L5-RAG", "L5-NLP"]

  L4-GD:
    name: "Gap Detector"
    capabilities: ["Identify missing information"]
    l5_tools: ["L5-RAG", "L5-PS"]

  L4-RF:
    name: "Risk Flagger"
    capabilities: ["Highlight potential issues"]
    l5_tools: ["L5-RAG", "L5-FDA"]

  L4-EV:
    name: "Evidence Validator"
    capabilities: ["Verify claims against sources"]
    l5_tools: ["L5-PS", "L5-RAG", "L5-CT"]

  L4-HG:
    name: "Hypothesis Generator"
    capabilities: ["Generate testable hypotheses"]
    l5_tools: ["L5-RAG", "L5-PS"]

  L4-CA:
    name: "Causal Analyzer"
    capabilities: ["Identify cause-effect relationships"]
    l5_tools: ["L5-RAG", "L5-STAT"]

  L4-SC:
    name: "Scenario Constructor"
    capabilities: ["Build alternative scenarios"]
    l5_tools: ["L5-RAG", "L5-CALC"]

  L4-OE:
    name: "Objection Explorer"
    capabilities: ["Identify counterarguments"]
    l5_tools: ["L5-RAG", "L5-PS"]

  L4-PS:
    name: "Priority Scorer"
    capabilities: ["Rank items by criteria"]
    l5_tools: ["L5-CALC", "L5-RAG"]

responsibilities:
  - Execute specific task types
  - Orchestrate multiple L5 tools
  - Format outputs according to templates
  - Report results to L3/L2

capabilities:
  - can_spawn_l4: false
  - can_spawn_l5: true  # Orchestrates L5 tools
  - can_use_tools: true  # Via L5 delegation
  - can_escalate_to: "L3"
```

#### L5: Tool Agent
```yaml
level: L5
role: "Tool Agent (Atomic Tool Executor)"
organizational_analog: "Intern / Tool Operator"
model_primary: "gpt-3.5-turbo"
temperature: 0.1
max_tokens: 2000
context_window: 2000

tool_types:
  L5-PS:
    name: "PubMed Search"
    function: "Scientific literature search"
    api: "NCBI E-utilities"
    cost_per_call: "$0.001"
    input: "Query string, filters"
    output: "Article list with abstracts, PMIDs"

  L5-CT:
    name: "Clinical Trial Search"
    function: "ClinicalTrials.gov queries"
    api: "ClinicalTrials.gov API"
    cost_per_call: "$0.001"
    input: "Query string, phase, status filters"
    output: "Trial list with NCT IDs"

  L5-PT:
    name: "Patent Search"
    function: "IP database queries"
    api: "USPTO/EPO APIs"
    cost_per_call: "$0.005"
    input: "Query string, date range"
    output: "Patent list with numbers, abstracts"

  L5-FDA:
    name: "FDA Database"
    function: "Drugs@FDA, 510k, FAERS queries"
    api: "OpenFDA"
    cost_per_call: "$0.002"
    input: "Drug name, application type"
    output: "Approval info, labels, adverse events"

  L5-RAG:
    name: "RAG Knowledge Search"
    function: "Semantic knowledge base search"
    api: "Pinecone/Supabase pgvector"
    cost_per_call: "$0.005"
    input: "Query string, namespace, top_k"
    output: "Relevant chunks with metadata"

  L5-WEB:
    name: "Web Fetch"
    function: "External URL retrieval"
    api: "Tavily/SerpAPI"
    cost_per_call: "$0.001"
    input: "URL or search query"
    output: "Page content, snippets"

  L5-CALC:
    name: "Calculator Suite"
    function: "Statistical/dose calculations"
    api: "NumPy/SciPy"
    cost_per_call: "$0.0001"
    input: "Data, formula"
    output: "Calculated results"

  L5-NLP:
    name: "NLP Processor"
    function: "Entity extraction, sentiment"
    api: "spaCy/transformers"
    cost_per_call: "$0.002"
    input: "Text"
    output: "Entities, sentiment scores"

  L5-FMT:
    name: "Formatter"
    function: "Citation/document formatting"
    api: "Internal"
    cost_per_call: "$0.0001"
    input: "Data, format template"
    output: "Formatted output"

  L5-VIZ:
    name: "Visualizer"
    function: "Chart/graph generation"
    api: "Plotly/D3"
    cost_per_call: "$0.005"
    input: "Data, chart type"
    output: "SVG/PNG visualization"

  L5-NEWS:
    name: "News Search"
    function: "Recent news and press"
    api: "NewsAPI"
    cost_per_call: "$0.001"
    input: "Query, date range"
    output: "Article list with snippets"

  L5-EMA:
    name: "EMA Database"
    function: "European regulatory data"
    api: "EMA APIs"
    cost_per_call: "$0.002"
    input: "Drug name, procedure type"
    output: "Regulatory info"

  L5-STAT:
    name: "Statistical Analysis"
    function: "Run statistical tests"
    api: "SciPy/statsmodels"
    cost_per_call: "$0.01"
    input: "Data, test type"
    output: "Test results, p-values"

responsibilities:
  - Execute exactly one atomic operation
  - Return structured results
  - No reasoning or decision-making
  - Handle errors gracefully

capabilities:
  - can_spawn_any: false
  - can_use_tools: false  # IS the tool
  - can_escalate_to: "L4"
```

---

## 3. 24 Mission Architecture

### 3.1 Mission Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           24 MISSION TEMPLATES                               │
├───────────────┬────────────────────────────────────────────────────────────┤
│  UNDERSTAND   │  1. Deep Dive                                              │
│  (Discovery)  │  2. Knowledge Harvest                                      │
│               │  3. Gap Discovery                                          │
│               │  4. Expert Onboarding                                      │
├───────────────┼────────────────────────────────────────────────────────────┤
│  EVALUATE     │  5. Critique                                               │
│  (Assessment) │  6. Benchmark                                              │
│               │  7. Risk Assessment                                        │
│               │  8. Feasibility Check                                      │
├───────────────┼────────────────────────────────────────────────────────────┤
│  DECIDE       │  9. Decision Framing                                       │
│  (Choice)     │  10. Option Exploration                                    │
│               │  11. Trade-off Analysis                                    │
│               │  12. Go/No-Go                                              │
├───────────────┼────────────────────────────────────────────────────────────┤
│  INVESTIGATE  │  13. Failure Forensics                                     │
│  (Root Cause) │  14. Signal Chasing                                        │
│               │  15. Due Diligence                                         │
│               │  16. Pattern Mining                                        │
├───────────────┼────────────────────────────────────────────────────────────┤
│  WATCH        │  17. Horizon Scanning                                      │
│  (Monitoring) │  18. Competitive Watch                                     │
│               │  19. Trigger Monitoring                                    │
├───────────────┼────────────────────────────────────────────────────────────┤
│  SOLVE        │  20. Get Unstuck                                           │
│  (Problem)    │  21. Alternative Finding                                   │
│               │  22. Path Finding                                          │
├───────────────┼────────────────────────────────────────────────────────────┤
│  PREPARE      │  23. Meeting Prep                                          │
│  (Deliverable)│  24. Case Building                                         │
└───────────────┴────────────────────────────────────────────────────────────┘
```

### 3.2 Mission-to-Agent Mapping

```yaml
mission_agent_mapping:

  # UNDERSTAND missions
  deep_dive:
    l2_expert: "Research Coordinator"
    l3_specialists: ["Domain Expert", "Evidence Specialist"]
    l4_workers: ["L4-DE", "L4-CS", "L4-PM", "L4-TL", "L4-GD", "L4-OE"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-CT", "L5-PT", "L5-FDA", "L5-WEB", "L5-NEWS"]
    reasoning_pattern: "Tree-of-Thought + Chain-of-Thought + Reflection"
    hitl_checkpoints: ["scope", "insight_validation", "final_review"]
    estimated_cost: "$0.15-0.30"
    estimated_time: "15-25 minutes"

  knowledge_harvest:
    l2_expert: "Knowledge Curator"
    l3_specialists: ["Collection Specialist"]
    l4_workers: ["L4-DE", "L4-DP", "L4-QA", "L4-CM", "L4-GD", "L4-EV"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-CT", "L5-FDA", "L5-WEB", "L5-NLP", "L5-PT"]
    reasoning_pattern: "ReAct + Decomposition + Reflection"
    hitl_checkpoints: ["scope_confirmation", "contradiction_resolution", "gap_review"]
    estimated_cost: "$0.10-0.25"
    estimated_time: "10-20 minutes"

  gap_discovery:
    l2_expert: "Intelligence Analyst"
    l3_specialists: ["Strategic Analyst"]
    l4_workers: ["L4-GD", "L4-PS", "L4-OE", "L4-CS", "L4-RF"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-CT", "L5-NEWS", "L5-PT", "L5-WEB"]
    reasoning_pattern: "Decomposition + Adversarial + Red Team"
    hitl_checkpoints: ["knowledge_scope", "gap_prioritization"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"

  expert_onboarding:
    l2_expert: "Learning Mentor"
    l3_specialists: ["Domain Expert"]
    l4_workers: ["L4-DP", "L4-CS", "L4-SC", "L4-PM", "L4-OE"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-VIZ", "L5-WEB"]
    reasoning_pattern: "Pedagogical Sequencing + Analogical + Socratic"
    hitl_checkpoints: ["learning_profile", "comprehension_check", "gap_identification"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "10-15 minutes"

  # EVALUATE missions
  critique:
    l2_expert: "Quality Reviewer"
    l3_specialists: ["Subject Matter Expert"]
    l4_workers: ["L4-QA", "L4-GD", "L4-EV", "L4-CS", "L4-OE", "L4-RF"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-FDA", "L5-CALC"]
    reasoning_pattern: "Rubric Evaluation + Devil's Advocate"
    hitl_checkpoints: ["context_standards", "critical_issues_review", "fix_prioritization"]
    estimated_cost: "$0.05-0.15"
    estimated_time: "5-15 minutes"

  benchmark:
    l2_expert: "Performance Analyst"
    l3_specialists: ["Benchmark Specialist"]
    l4_workers: ["L4-CS", "L4-PS", "L4-CA", "L4-DE", "L4-PM"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-WEB", "L5-CALC", "L5-CT"]
    reasoning_pattern: "Comparative Analysis + Root Cause + Prioritization"
    hitl_checkpoints: ["benchmark_selection", "gap_significance"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"

  risk_assessment:
    l2_expert: "Risk Analyst"
    l3_specialists: ["Risk Specialist", "Domain Expert"]
    l4_workers: ["L4-RF", "L4-SC", "L4-PS", "L4-CA", "L4-EV"]
    l5_tools: ["L5-RAG", "L5-FDA", "L5-PS", "L5-CALC", "L5-STAT"]
    reasoning_pattern: "FMEA + Probability + Monte Carlo"
    hitl_checkpoints: ["scope", "risk_validation", "mitigations"]
    estimated_cost: "$0.10-0.20"
    estimated_time: "10-20 minutes"

  feasibility_check:
    l2_expert: "Feasibility Analyst"
    l3_specialists: ["Technical Specialist", "Resource Specialist"]
    l4_workers: ["L4-QA", "L4-RF", "L4-PS", "L4-SC", "L4-CA"]
    l5_tools: ["L5-RAG", "L5-CALC", "L5-WEB", "L5-CT"]
    reasoning_pattern: "Decomposition + Constraint Analysis"
    hitl_checkpoints: ["assumptions", "critical_path"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"

  # DECIDE missions
  decision_framing:
    l2_expert: "Decision Architect"
    l3_specialists: ["Strategic Analyst"]
    l4_workers: ["L4-SC", "L4-PS", "L4-OE", "L4-CA", "L4-RF"]
    l5_tools: ["L5-RAG", "L5-CALC", "L5-WEB"]
    reasoning_pattern: "Decision Analysis + Multi-Criteria"
    hitl_checkpoints: ["frame_validation", "criteria", "options"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"

  option_exploration:
    l2_expert: "Options Strategist"
    l3_specialists: ["Innovation Specialist"]
    l4_workers: ["L4-HG", "L4-SC", "L4-QA", "L4-PS", "L4-OE"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-WEB", "L5-PT"]
    reasoning_pattern: "Divergent Generation + Feasibility Filter"
    hitl_checkpoints: ["constraint_check", "option_review"]
    estimated_cost: "$0.08-0.12"
    estimated_time: "8-12 minutes"

  trade_off_analysis:
    l2_expert: "Trade-off Analyst"
    l3_specialists: ["Quantitative Analyst"]
    l4_workers: ["L4-CS", "L4-PS", "L4-CA", "L4-SC"]
    l5_tools: ["L5-RAG", "L5-CALC", "L5-STAT", "L5-VIZ"]
    reasoning_pattern: "Multi-Criteria Analysis + Sensitivity"
    hitl_checkpoints: ["dimensions", "weights", "recommendation"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"

  go_no_go:
    l2_expert: "Decision Advisor"
    l3_specialists: ["Risk Specialist", "Domain Expert"]
    l4_workers: ["L4-EV", "L4-RF", "L4-PS", "L4-QA"]
    l5_tools: ["L5-RAG", "L5-FDA", "L5-CALC", "L5-PS"]
    reasoning_pattern: "Decision Tree + Evidence Weighting"
    hitl_checkpoints: ["criteria", "evidence", "recommendation"]
    estimated_cost: "$0.10-0.20"
    estimated_time: "10-20 minutes"

  # INVESTIGATE missions
  failure_forensics:
    l2_expert: "Forensic Analyst"
    l3_specialists: ["Root Cause Specialist", "Domain Expert"]
    l4_workers: ["L4-CA", "L4-HG", "L4-EV", "L4-TL", "L4-PM"]
    l5_tools: ["L5-RAG", "L5-FDA", "L5-PS", "L5-CT", "L5-STAT"]
    reasoning_pattern: "Root Cause Analysis + Hypothesis Testing"
    hitl_checkpoints: ["hypotheses", "evidence", "conclusions"]
    estimated_cost: "$0.12-0.25"
    estimated_time: "15-25 minutes"

  signal_chasing:
    l2_expert: "Signal Analyst"
    l3_specialists: ["Pharmacovigilance Specialist"]
    l4_workers: ["L4-CA", "L4-PM", "L4-EV", "L4-RF", "L4-HG"]
    l5_tools: ["L5-FDA", "L5-PS", "L5-RAG", "L5-STAT", "L5-CT"]
    reasoning_pattern: "Causal Analysis + Pattern Recognition"
    hitl_checkpoints: ["characterization", "causality"]
    estimated_cost: "$0.10-0.20"
    estimated_time: "10-20 minutes"

  due_diligence:
    l2_expert: "Due Diligence Lead"
    l3_specialists: ["Regulatory Specialist", "Commercial Specialist", "Scientific Specialist"]
    l4_workers: ["L4-DE", "L4-QA", "L4-RF", "L4-GD", "L4-EV", "L4-CS"]
    l5_tools: ["L5-RAG", "L5-FDA", "L5-PS", "L5-CT", "L5-PT", "L5-WEB", "L5-NEWS"]
    reasoning_pattern: "Comprehensive Evaluation + Risk-Adjusted"
    hitl_checkpoints: ["scope", "red_flags", "recommendation"]
    estimated_cost: "$0.20-0.40"
    estimated_time: "25-40 minutes"

  pattern_mining:
    l2_expert: "Pattern Analyst"
    l3_specialists: ["Data Scientist"]
    l4_workers: ["L4-PM", "L4-CA", "L4-DE", "L4-QA"]
    l5_tools: ["L5-RAG", "L5-STAT", "L5-NLP", "L5-VIZ"]
    reasoning_pattern: "Pattern Extraction + Statistical Validation"
    hitl_checkpoints: ["case_selection", "pattern_validation"]
    estimated_cost: "$0.10-0.20"
    estimated_time: "10-20 minutes"

  # WATCH missions
  horizon_scanning:
    l2_expert: "Horizon Scanner"
    l3_specialists: ["Trend Analyst", "Technology Specialist"]
    l4_workers: ["L4-PM", "L4-RF", "L4-PS", "L4-TL", "L4-HG"]
    l5_tools: ["L5-WEB", "L5-NEWS", "L5-PS", "L5-PT", "L5-RAG"]
    reasoning_pattern: "Environmental Scanning + Impact Assessment"
    hitl_checkpoints: ["scope", "prioritization", "monitoring"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "10-15 minutes"

  competitive_watch:
    l2_expert: "Competitive Intelligence Lead"
    l3_specialists: ["Competitive Analyst"]
    l4_workers: ["L4-DE", "L4-TL", "L4-PM", "L4-HG", "L4-CS"]
    l5_tools: ["L5-NEWS", "L5-WEB", "L5-CT", "L5-FDA", "L5-PT", "L5-RAG"]
    reasoning_pattern: "Intelligence Analysis + Predictive"
    hitl_checkpoints: ["focus", "predictions", "responses"]
    estimated_cost: "$0.10-0.20"
    estimated_time: "10-20 minutes"

  trigger_monitoring:
    l2_expert: "Alert Manager"
    l3_specialists: ["Monitoring Specialist"]
    l4_workers: ["L4-RF", "L4-PM", "L4-PS"]
    l5_tools: ["L5-RAG", "L5-NEWS", "L5-FDA", "L5-CT"]
    reasoning_pattern: "Event Detection + Threshold Analysis"
    hitl_checkpoints: ["trigger_definition", "alert_setup"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "5-10 minutes"

  # SOLVE missions
  get_unstuck:
    l2_expert: "Problem Solver"
    l3_specialists: ["Creative Specialist"]
    l4_workers: ["L4-HG", "L4-SC", "L4-OE", "L4-PS"]
    l5_tools: ["L5-RAG", "L5-WEB", "L5-PS"]
    reasoning_pattern: "Problem Reframing + Socratic Dialogue"
    hitl_checkpoints: ["problem_understanding", "options"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "5-10 minutes"

  alternative_finding:
    l2_expert: "Alternatives Finder"
    l3_specialists: ["Options Specialist"]
    l4_workers: ["L4-HG", "L4-QA", "L4-CS", "L4-PS"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-WEB", "L5-PT"]
    reasoning_pattern: "Rapid Generation + Feasibility Screening"
    hitl_checkpoints: ["requirements", "options"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "5-10 minutes"

  path_finding:
    l2_expert: "Path Optimizer"
    l3_specialists: ["Operations Specialist"]
    l4_workers: ["L4-SC", "L4-PS", "L4-RF", "L4-TL"]
    l5_tools: ["L5-RAG", "L5-CALC", "L5-VIZ"]
    reasoning_pattern: "Path Optimization + Constraint Satisfaction"
    hitl_checkpoints: ["goal_definition", "path_selection"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "5-10 minutes"

  # PREPARE missions
  meeting_prep:
    l2_expert: "Meeting Strategist"
    l3_specialists: ["Content Specialist"]
    l4_workers: ["L4-GD", "L4-OE", "L4-DE", "L4-SC"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-NEWS", "L5-WEB"]
    reasoning_pattern: "Gap Analysis + Anticipatory"
    hitl_checkpoints: ["objectives", "qa_coverage"]
    estimated_cost: "$0.05-0.10"
    estimated_time: "5-10 minutes"

  case_building:
    l2_expert: "Case Builder"
    l3_specialists: ["Persuasion Specialist"]
    l4_workers: ["L4-EV", "L4-OE", "L4-CS", "L4-PS", "L4-CM"]
    l5_tools: ["L5-RAG", "L5-PS", "L5-FDA", "L5-FMT", "L5-VIZ"]
    reasoning_pattern: "Argument Construction + Evidence Assembly"
    hitl_checkpoints: ["audience", "evidence", "objections"]
    estimated_cost: "$0.08-0.15"
    estimated_time: "8-15 minutes"
```

---

## 4. LangGraph State Architecture

### 4.1 Mode3State Schema

```python
from typing import TypedDict, List, Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel
from langgraph.graph import StateGraph

# Enums
MissionType = Literal[
    "deep_dive", "knowledge_harvest", "gap_discovery", "expert_onboarding",
    "critique", "benchmark", "risk_assessment", "feasibility_check",
    "decision_framing", "option_exploration", "trade_off_analysis", "go_no_go",
    "failure_forensics", "signal_chasing", "due_diligence", "pattern_mining",
    "horizon_scanning", "competitive_watch", "trigger_monitoring",
    "get_unstuck", "alternative_finding", "path_finding",
    "meeting_prep", "case_building"
]

ReasoningPattern = Literal[
    "chain_of_thought", "tree_of_thought", "react", "reflection",
    "mcts", "debate", "decomposition", "analogical",
    "adversarial", "socratic", "pedagogical"
]

AgentLevel = Literal["L1", "L2", "L3", "L4", "L5"]
CheckpointType = Literal["plan_approval", "tool_approval", "subagent_approval", "critical_decision", "final_review"]
AutonomyLevel = Literal["strict", "balanced", "permissive"]

# Sub-models
class AgentInstance(BaseModel):
    level: AgentLevel
    agent_id: str
    agent_type: str
    name: str
    model: str
    status: Literal["pending", "active", "completed", "failed"]
    token_budget: int
    tokens_used: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    parent_agent_id: Optional[str] = None

class Task(BaseModel):
    id: str
    title: str
    description: str
    status: Literal["pending", "in_progress", "completed", "blocked", "failed"]
    assigned_agent_level: AgentLevel
    assigned_agent_type: str
    estimated_duration_ms: int
    actual_duration_ms: Optional[int] = None
    dependencies: List[str] = []
    output: Optional[Dict[str, Any]] = None

class ReasoningStep(BaseModel):
    phase: int
    phase_name: str  # precondition, reasoning, action, observation, postcondition, uncertainty, checkpoint
    content: str
    confidence: float
    evidence: List[str] = []
    timestamp: datetime

class HITLCheckpoint(BaseModel):
    id: str
    checkpoint_type: CheckpointType
    title: str
    description: str
    context: Dict[str, Any]
    options: List[Dict[str, Any]]
    timeout_seconds: int = 300
    auto_action_on_timeout: Literal["reject"] = "reject"  # MUST be reject for security
    created_at: datetime
    decided_at: Optional[datetime] = None
    decision: Optional[Dict[str, Any]] = None

class L5ToolCall(BaseModel):
    tool_id: str
    tool_name: str
    input: Dict[str, Any]
    output: Optional[Dict[str, Any]] = None
    cost: float
    duration_ms: int
    called_by_l4: str
    timestamp: datetime

class Citation(BaseModel):
    id: str
    source_type: str  # pubmed, rag, web, fda, clinical_trial
    title: str
    citation_text: str
    url: Optional[str] = None
    pmid: Optional[str] = None
    confidence: float
    relevance_score: float

# Main State Schema
class Mode3State(TypedDict):
    # === Identity ===
    session_id: str
    tenant_id: str
    user_id: str
    agent_id: str  # User-selected L2 Expert

    # === Mission Configuration ===
    mission_type: MissionType
    mission_config: Dict[str, Any]  # Template-specific config
    reasoning_pattern: ReasoningPattern
    autonomy_level: AutonomyLevel

    # === Input ===
    user_message: str
    user_context: Optional[Dict[str, Any]]

    # === Plan ===
    plan: Optional[Dict[str, Any]]
    tasks: List[Task]
    current_task_index: int

    # === Agent Hierarchy ===
    active_agents: Dict[str, AgentInstance]  # agent_id -> instance
    agent_spawn_history: List[Dict[str, Any]]

    # === Reasoning ===
    reasoning_steps: List[ReasoningStep]
    current_react_phase: int  # 1-7
    react_iteration: int
    max_iterations: int

    # === Confidence ===
    confidence_threshold: float
    current_confidence: float
    confidence_history: List[Dict[str, Any]]

    # === HITL ===
    pending_hitl: Optional[HITLCheckpoint]
    hitl_history: List[HITLCheckpoint]
    awaiting_user_response: bool

    # === Tools ===
    l5_tool_calls: List[L5ToolCall]
    total_tool_cost: float

    # === Outputs ===
    intermediate_outputs: Dict[str, Any]
    citations: List[Citation]
    insights: List[Dict[str, Any]]

    # === Final Response ===
    final_response: Optional[str]
    response_tokens_streamed: int

    # === Constitutional AI ===
    constitutional_checks: List[Dict[str, Any]]
    safety_flags: List[str]

    # === Metadata ===
    started_at: datetime
    completed_at: Optional[datetime]
    total_cost: float
    error: Optional[str]
    status: Literal["planning", "executing", "awaiting_hitl", "synthesizing", "complete", "error"]
```

### 4.2 LangGraph State Machine

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.postgres_aio import AsyncPostgresSaver

# Define the graph
graph = StateGraph(Mode3State)

# Add nodes
graph.add_node("initialize", initialize_mission)
graph.add_node("plan", create_plan)
graph.add_node("hitl_plan_approval", hitl_plan_approval_checkpoint)
graph.add_node("execute_task", execute_current_task)
graph.add_node("spawn_agent", spawn_required_agent)
graph.add_node("execute_l5_tool", execute_l5_tool)
graph.add_node("react_cycle", execute_react_cycle)
graph.add_node("hitl_checkpoint", check_hitl_requirements)
graph.add_node("await_user", await_user_response)
graph.add_node("synthesize", synthesize_results)
graph.add_node("hitl_final_review", hitl_final_review_checkpoint)
graph.add_node("stream_response", stream_final_response)
graph.add_node("complete", complete_session)
graph.add_node("error_handler", handle_error)

# Add edges
graph.set_entry_point("initialize")

graph.add_edge("initialize", "plan")
graph.add_edge("plan", "hitl_plan_approval")

graph.add_conditional_edges(
    "hitl_plan_approval",
    check_hitl_decision,
    {
        "approved": "execute_task",
        "modified": "plan",
        "rejected": "complete",
        "timeout": "complete"  # Fail-closed
    }
)

graph.add_conditional_edges(
    "execute_task",
    route_task_execution,
    {
        "spawn_l3": "spawn_agent",
        "spawn_l4": "spawn_agent",
        "call_l5": "execute_l5_tool",
        "react": "react_cycle",
        "next_task": "execute_task",
        "synthesize": "synthesize"
    }
)

graph.add_edge("spawn_agent", "execute_task")
graph.add_edge("execute_l5_tool", "execute_task")

graph.add_conditional_edges(
    "react_cycle",
    check_react_completion,
    {
        "continue": "react_cycle",
        "hitl_needed": "hitl_checkpoint",
        "complete": "execute_task"
    }
)

graph.add_conditional_edges(
    "hitl_checkpoint",
    route_hitl_type,
    {
        "await": "await_user",
        "skip": "execute_task"  # Based on autonomy level
    }
)

graph.add_conditional_edges(
    "await_user",
    check_user_response,
    {
        "approved": "execute_task",
        "modified": "react_cycle",
        "rejected": "synthesize",
        "timeout": "synthesize"  # Fail-closed: timeout = rejection
    }
)

graph.add_edge("synthesize", "hitl_final_review")

graph.add_conditional_edges(
    "hitl_final_review",
    check_final_review,
    {
        "approved": "stream_response",
        "revision": "execute_task",
        "timeout": "stream_response"  # Send with warning
    }
)

graph.add_edge("stream_response", "complete")
graph.add_edge("complete", END)

# Add error handling edge from all nodes
for node in graph.nodes:
    if node not in ["error_handler", "complete"]:
        graph.add_edge(node, "error_handler", condition=lambda s: s.get("error") is not None)
graph.add_edge("error_handler", "complete")

# Compile with checkpointing
checkpointer = AsyncPostgresSaver.from_conn_string(DATABASE_URL)
compiled_graph = graph.compile(checkpointer=checkpointer)
```

---

## 5. SSE Event Architecture

### 5.1 Event Type Definitions

```python
from enum import Enum
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class SSEEventType(str, Enum):
    # === PLANNING EVENTS ===
    PLAN_CREATED = "plan_created"
    PLAN_UPDATED = "plan_updated"
    TASK_STATUS_CHANGE = "task_status_change"

    # === AGENT HIERARCHY EVENTS ===
    AGENT_SPAWNED = "agent_spawned"
    AGENT_STARTED = "agent_started"
    AGENT_COMPLETED = "agent_completed"
    AGENT_ESCALATED = "agent_escalated"

    # === REASONING EVENTS ===
    REASONING_STEP = "reasoning_step"
    THINKING = "thinking"
    CONFIDENCE_UPDATE = "confidence_update"
    CONSTITUTIONAL_CHECK = "constitutional_check"

    # === TOOL EVENTS ===
    TOOL_INVOKED = "tool_invoked"
    TOOL_RESULT = "tool_result"
    TOOL_ERROR = "tool_error"

    # === DATA DISCOVERY EVENTS ===
    RAG_SEARCH_STARTED = "rag_search_started"
    RAG_DOCUMENTS_FOUND = "rag_documents_found"
    PUBMED_SEARCH_STARTED = "pubmed_search_started"
    PUBMED_ARTICLES_FOUND = "pubmed_articles_found"
    WEB_SEARCH_STARTED = "web_search_started"
    WEB_SOURCES_FOUND = "web_sources_found"
    INSIGHT_GENERATED = "insight_generated"
    CITATION_ADDED = "citation_added"

    # === HITL EVENTS ===
    CHECKPOINT_PLAN_APPROVAL = "checkpoint_plan_approval"
    CHECKPOINT_TOOL_APPROVAL = "checkpoint_tool_approval"
    CHECKPOINT_SUBAGENT_APPROVAL = "checkpoint_subagent_approval"
    CHECKPOINT_CRITICAL_DECISION = "checkpoint_critical_decision"
    CHECKPOINT_FINAL_REVIEW = "checkpoint_final_review"
    USER_RESPONSE_RECEIVED = "user_response_received"
    CHECKPOINT_TIMEOUT = "checkpoint_timeout"

    # === ITERATION EVENTS ===
    ITERATION_START = "iteration_start"
    ITERATION_COMPLETE = "iteration_complete"

    # === PROGRESS EVENTS ===
    PHASE_START = "phase_start"
    PHASE_COMPLETE = "phase_complete"
    PROGRESS_UPDATE = "progress_update"

    # === RESPONSE EVENTS ===
    TOKEN = "token"
    COMPLETE = "complete"
    ERROR = "error"

class SSEEvent(BaseModel):
    type: SSEEventType
    timestamp: datetime
    session_id: str
    data: Dict[str, Any]

    def to_sse_format(self) -> str:
        return f"event: {self.type.value}\ndata: {self.model_dump_json()}\n\n"
```

### 5.2 Event Emitter Implementation

```python
from typing import AsyncGenerator
import asyncio

class Mode3EventEmitter:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.queue: asyncio.Queue[SSEEvent] = asyncio.Queue()
        self._closed = False

    async def emit(self, event_type: SSEEventType, data: Dict[str, Any]) -> None:
        if self._closed:
            return

        event = SSEEvent(
            type=event_type,
            timestamp=datetime.utcnow(),
            session_id=self.session_id,
            data=data
        )
        await self.queue.put(event)

    async def emit_agent_spawned(self, agent: AgentInstance) -> None:
        await self.emit(SSEEventType.AGENT_SPAWNED, {
            "agent_id": agent.agent_id,
            "level": agent.level,
            "type": agent.agent_type,
            "name": agent.name,
            "parent_agent_id": agent.parent_agent_id
        })

    async def emit_reasoning_step(self, step: ReasoningStep) -> None:
        await self.emit(SSEEventType.REASONING_STEP, {
            "phase": step.phase,
            "phase_name": step.phase_name,
            "content": step.content,
            "confidence": step.confidence
        })

    async def emit_tool_invoked(self, tool_id: str, tool_name: str, input_data: Dict) -> None:
        await self.emit(SSEEventType.TOOL_INVOKED, {
            "tool_id": tool_id,
            "tool_name": tool_name,
            "input": input_data
        })

    async def emit_hitl_checkpoint(
        self,
        checkpoint_type: CheckpointType,
        checkpoint: HITLCheckpoint
    ) -> None:
        event_type = {
            "plan_approval": SSEEventType.CHECKPOINT_PLAN_APPROVAL,
            "tool_approval": SSEEventType.CHECKPOINT_TOOL_APPROVAL,
            "subagent_approval": SSEEventType.CHECKPOINT_SUBAGENT_APPROVAL,
            "critical_decision": SSEEventType.CHECKPOINT_CRITICAL_DECISION,
            "final_review": SSEEventType.CHECKPOINT_FINAL_REVIEW
        }[checkpoint_type]

        await self.emit(event_type, checkpoint.model_dump())

    async def emit_token(self, token: str) -> None:
        await self.emit(SSEEventType.TOKEN, {"token": token})

    async def emit_complete(self, final_response: str, citations: List[Citation]) -> None:
        await self.emit(SSEEventType.COMPLETE, {
            "response": final_response,
            "citations": [c.model_dump() for c in citations]
        })

    async def stream(self) -> AsyncGenerator[str, None]:
        while not self._closed:
            try:
                event = await asyncio.wait_for(self.queue.get(), timeout=30.0)
                yield event.to_sse_format()
            except asyncio.TimeoutError:
                yield ": keepalive\n\n"

    def close(self) -> None:
        self._closed = True
```

---

## 6. Database Schema

### 6.1 Mode 3 Tables

```sql
-- Mode 3 Sessions
CREATE TABLE IF NOT EXISTS mode3_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    agent_id UUID NOT NULL REFERENCES agents(id),  -- L2 Expert

    -- Mission
    mission_type VARCHAR(50) NOT NULL,
    mission_config JSONB,
    reasoning_pattern VARCHAR(50),
    autonomy_level VARCHAR(20) DEFAULT 'balanced',

    -- Input
    user_message TEXT NOT NULL,
    user_context JSONB,

    -- Plan
    plan JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'planning',
    current_task_index INTEGER DEFAULT 0,
    react_iteration INTEGER DEFAULT 0,
    current_confidence FLOAT DEFAULT 0.0,

    -- Output
    final_response TEXT,
    total_cost FLOAT DEFAULT 0.0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Error handling
    error TEXT,

    CONSTRAINT valid_status CHECK (status IN ('planning', 'executing', 'awaiting_hitl', 'synthesizing', 'complete', 'error'))
);

-- Mode 3 Tasks
CREATE TABLE IF NOT EXISTS mode3_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    sequence_order INTEGER NOT NULL,

    assigned_agent_level VARCHAR(5) NOT NULL,
    assigned_agent_type VARCHAR(100),
    assigned_agent_id UUID REFERENCES agents(id),

    dependencies UUID[] DEFAULT '{}',

    estimated_duration_ms INTEGER,
    actual_duration_ms INTEGER,

    output JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    CONSTRAINT valid_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'failed'))
);

-- Mode 3 Agent Instances
CREATE TABLE IF NOT EXISTS mode3_agent_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    level VARCHAR(5) NOT NULL,
    agent_id UUID REFERENCES agents(id),
    agent_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(100) NOT NULL,

    status VARCHAR(20) DEFAULT 'pending',
    parent_instance_id UUID REFERENCES mode3_agent_instances(id),

    token_budget INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    CONSTRAINT valid_agent_status CHECK (status IN ('pending', 'active', 'completed', 'failed'))
);

-- Mode 3 Reasoning Steps
CREATE TABLE IF NOT EXISTS mode3_reasoning_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,
    task_id UUID REFERENCES mode3_tasks(id) ON DELETE CASCADE,
    agent_instance_id UUID REFERENCES mode3_agent_instances(id) ON DELETE CASCADE,

    iteration INTEGER NOT NULL,
    phase INTEGER NOT NULL,  -- 1-7 for ReAct²
    phase_name VARCHAR(50) NOT NULL,

    content TEXT NOT NULL,
    confidence FLOAT,
    evidence TEXT[],

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mode 3 HITL Checkpoints
CREATE TABLE IF NOT EXISTS mode3_hitl_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    checkpoint_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    context JSONB NOT NULL,
    options JSONB NOT NULL,

    timeout_seconds INTEGER DEFAULT 300,
    auto_action_on_timeout VARCHAR(20) DEFAULT 'reject',

    status VARCHAR(20) DEFAULT 'pending',
    decision JSONB,
    decided_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ,

    CONSTRAINT valid_checkpoint_type CHECK (checkpoint_type IN ('plan_approval', 'tool_approval', 'subagent_approval', 'critical_decision', 'final_review')),
    CONSTRAINT valid_checkpoint_status CHECK (status IN ('pending', 'approved', 'modified', 'rejected', 'timeout'))
);

-- Mode 3 Tool Calls
CREATE TABLE IF NOT EXISTS mode3_tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,
    task_id UUID REFERENCES mode3_tasks(id) ON DELETE CASCADE,

    tool_id VARCHAR(20) NOT NULL,  -- L5-PS, L5-RAG, etc.
    tool_name VARCHAR(100) NOT NULL,

    called_by_l4 UUID REFERENCES mode3_agent_instances(id),

    input JSONB NOT NULL,
    output JSONB,
    error TEXT,

    cost FLOAT NOT NULL,
    duration_ms INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mode 3 Citations
CREATE TABLE IF NOT EXISTS mode3_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    source_type VARCHAR(50) NOT NULL,  -- pubmed, rag, web, fda, clinical_trial
    title TEXT NOT NULL,
    citation_text TEXT NOT NULL,

    url TEXT,
    pmid VARCHAR(20),
    doi VARCHAR(100),

    confidence FLOAT,
    relevance_score FLOAT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mode 3 Constitutional Checks
CREATE TABLE IF NOT EXISTS mode3_constitutional_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES mode3_sessions(id) ON DELETE CASCADE,

    check_type VARCHAR(100) NOT NULL,
    trigger_point VARCHAR(100) NOT NULL,

    input_content TEXT,
    check_result JSONB NOT NULL,
    action_taken TEXT,

    passed BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mode3_sessions_tenant ON mode3_sessions(tenant_id);
CREATE INDEX idx_mode3_sessions_user ON mode3_sessions(user_id);
CREATE INDEX idx_mode3_sessions_status ON mode3_sessions(status);
CREATE INDEX idx_mode3_tasks_session ON mode3_tasks(session_id);
CREATE INDEX idx_mode3_tasks_status ON mode3_tasks(status);
CREATE INDEX idx_mode3_hitl_session ON mode3_hitl_checkpoints(session_id);
CREATE INDEX idx_mode3_hitl_status ON mode3_hitl_checkpoints(status);
CREATE INDEX idx_mode3_tools_session ON mode3_tool_calls(session_id);
```

---

## 7. API Specifications

### 7.1 Endpoints

```yaml
openapi: 3.0.0
info:
  title: Mode 3 API
  version: 2.0.0

paths:
  /api/mode3/stream:
    post:
      summary: Start Mode 3 autonomous session with SSE streaming
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Mode3Request'
      responses:
        200:
          description: SSE event stream
          content:
            text/event-stream:
              schema:
                type: string

  /api/mode3/hitl/{session_id}/respond:
    post:
      summary: Submit HITL checkpoint response
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/HITLResponse'
      responses:
        200:
          description: Response accepted

  /api/mode3/{session_id}/status:
    get:
      summary: Get session status
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Session status
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionStatus'

  /api/mode3/{session_id}/cancel:
    post:
      summary: Cancel active session
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Session cancelled

components:
  schemas:
    Mode3Request:
      type: object
      required:
        - agent_id
        - message
        - mission_type
      properties:
        agent_id:
          type: string
          format: uuid
          description: L2 Expert agent ID
        message:
          type: string
          description: User query
        mission_type:
          type: string
          enum: [deep_dive, knowledge_harvest, gap_discovery, ...]
        autonomy_level:
          type: string
          enum: [strict, balanced, permissive]
          default: balanced
        context:
          type: object
          description: Additional user context

    HITLResponse:
      type: object
      required:
        - checkpoint_id
        - decision
      properties:
        checkpoint_id:
          type: string
          format: uuid
        decision:
          type: string
          enum: [approve, modify, reject]
        modifications:
          type: string
          description: User modifications if decision is 'modify'

    SessionStatus:
      type: object
      properties:
        session_id:
          type: string
          format: uuid
        status:
          type: string
        current_task:
          type: string
        progress_percent:
          type: number
        awaiting_hitl:
          type: boolean
        pending_checkpoint:
          $ref: '#/components/schemas/HITLCheckpoint'
```

---

## 8. Security Architecture

### 8.1 Security Controls

```yaml
security_controls:

  tenant_isolation:
    description: "All queries MUST filter by tenant_id"
    implementation:
      - RLS policies on all Mode 3 tables
      - Query enforcement in application layer
      - Validation at API gateway
    enforcement: MANDATORY

  hitl_fail_closed:
    description: "Any HITL error or timeout MUST reject, never approve"
    implementation:
      code: |
        async def check_hitl_approval(checkpoint: HITLCheckpoint) -> HITLDecision:
            try:
                decision = await wait_for_user_response(checkpoint, timeout=300)
                return decision
            except TimeoutError:
                logger.warning(f"HITL timeout for {checkpoint.id}")
                return HITLDecision(approved=False, reason="timeout", auto_rejected=True)
            except Exception as e:
                logger.error(f"HITL error: {e}")
                # CRITICAL: ANY error = REJECT
                return HITLDecision(approved=False, reason="error", auto_rejected=True)
    enforcement: MANDATORY

  input_sanitization:
    description: "Prevent prompt injection attacks"
    implementation:
      - QuerySanitizer with pattern detection
      - Input validation against schema
      - Length limits on user input
      - Character encoding validation
    patterns_blocked:
      - "ignore previous instructions"
      - "system prompt"
      - "you are now"
      - XML/HTML injection attempts

  rate_limiting:
    description: "Prevent abuse and control costs"
    limits:
      per_user_per_minute: 10
      per_user_per_hour: 100
      per_tenant_per_hour: 1000
      max_concurrent_sessions: 5

  audit_trail:
    description: "Complete logging of all actions"
    logged_events:
      - Session start/end
      - All HITL decisions
      - All tool invocations
      - Agent spawning
      - Errors and failures
    retention: 90 days

  tool_permissions:
    description: "Per-tenant tool access control"
    implementation:
      - Tenant-level tool whitelist
      - Role-based tool permissions
      - Cost-based tool limits
```

### 8.2 Constitutional AI Checks

```yaml
constitutional_checks:

  medical_safety:
    triggers:
      - Before providing any clinical information
      - When discussing drug interactions
      - When referencing dosing information
    checks:
      - Never provide clinical advice without caveats
      - Flag potential patient safety implications
      - Defer to regulatory guidance
    action: Add safety warnings, flag for review

  information_integrity:
    triggers:
      - Before including any factual claim
      - When synthesizing from multiple sources
    checks:
      - Cite sources for all claims
      - Distinguish facts from interpretations
      - Acknowledge uncertainty
    action: Add citations, confidence scores

  bias_mitigation:
    triggers:
      - During synthesis phase
      - When generating recommendations
    checks:
      - Present multiple perspectives
      - Avoid favoring apparent user preference
      - Surface disconfirming evidence
    action: Revise for balance

  harmful_content:
    triggers:
      - Before any output generation
    checks:
      - No regulatory circumvention assistance
      - No suppression of safety signals
      - No misleading promotional content
    action: Block generation, flag for review
```

---

## 9. Implementation Phases

### 9.1 Phase 1: Foundation (8 Missions)

```yaml
phase_1:
  duration: "Weeks 1-4"
  missions:
    - deep_dive
    - critique
    - failure_forensics
    - go_no_go
    - meeting_prep
    - get_unstuck
    - risk_assessment
    - due_diligence

  deliverables:
    - Core LangGraph state machine
    - SSE streaming infrastructure
    - Basic HITL checkpoints (plan, final)
    - L4/L5 agent framework
    - Database schema
    - API endpoints
    - Security controls

  l4_workers_required:
    - L4-DE (Data Extractor)
    - L4-QA (Quality Assessor)
    - L4-RF (Risk Flagger)
    - L4-EV (Evidence Validator)
    - L4-GD (Gap Detector)
    - L4-OE (Objection Explorer)

  l5_tools_required:
    - L5-RAG
    - L5-PS (PubMed)
    - L5-FDA
    - L5-WEB
    - L5-CALC
```

### 9.2 Phase 2: Expansion (8 Missions)

```yaml
phase_2:
  duration: "Weeks 5-8"
  missions:
    - knowledge_harvest
    - benchmark
    - trade_off_analysis
    - signal_chasing
    - pattern_mining
    - alternative_finding
    - path_finding
    - case_building

  deliverables:
    - Full ReAct² implementation
    - Advanced HITL checkpoints (all 5 types)
    - L3 Specialist framework
    - Constitutional AI checks
    - Mission-specific templates
    - Output artifact generation

  l4_workers_required:
    - L4-CS (Comparison Synthesizer)
    - L4-PM (Pattern Matcher)
    - L4-CA (Causal Analyzer)
    - L4-CM (Citation Manager)
    - L4-PS (Priority Scorer)

  l5_tools_required:
    - L5-CT (Clinical Trials)
    - L5-PT (Patents)
    - L5-STAT
    - L5-VIZ
    - L5-NEWS
```

### 9.3 Phase 3: Complete (8 Missions)

```yaml
phase_3:
  duration: "Weeks 9-12"
  missions:
    - gap_discovery
    - expert_onboarding
    - feasibility_check
    - decision_framing
    - option_exploration
    - horizon_scanning
    - competitive_watch
    - trigger_monitoring

  deliverables:
    - Tree-of-Thoughts planning
    - Adaptive autonomy levels
    - Full L1→L5 hierarchy
    - Advanced reasoning patterns
    - Mission analytics dashboard
    - Performance optimization

  l4_workers_required:
    - L4-DP (Document Processor)
    - L4-TL (Timeline Builder)
    - L4-HG (Hypothesis Generator)
    - L4-SC (Scenario Constructor)

  l5_tools_required:
    - L5-EMA
    - L5-NLP
    - L5-FMT
```

---

## 10. Success Metrics

### 10.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mission Completion Rate | >95% | Sessions reaching complete state |
| HITL Response Time | <2 min P95 | Time from checkpoint to user response |
| SSE Latency | <200ms P95 | Event emission to client receipt |
| Tool Call Success | >99% | L5 tool calls succeeding |
| Error Rate | <1% | Sessions ending in error state |
| Session Duration | Varies by mission | Per-mission baseline tracking |

### 10.2 Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Citation Accuracy | >90% | Manual audit of citations |
| User Satisfaction | >4.0/5.0 | Post-session survey |
| Insight Quality | >80% useful | User feedback on insights |
| Constitutional Compliance | 100% | Automated check pass rate |
| Confidence Calibration | ±10% | Correlation of confidence to accuracy |

### 10.3 Cost Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average Session Cost | <$0.50 | Total LLM + tool costs |
| L5 Tool Efficiency | >0.8 | Useful results / total calls |
| Token Budget Adherence | <105% | Tokens used vs budget |

---

## Appendix A: Reasoning Pattern Implementations

### A.1 Chain-of-Thought (CoT)

```python
async def chain_of_thought(state: Mode3State, prompt: str) -> ReasoningStep:
    """Linear step-by-step reasoning"""
    response = await llm.ainvoke([
        SystemMessage(content="""
        Think through this problem step by step.
        Show your work clearly.
        At each step, state your reasoning and confidence.
        Format: Step N: [reasoning] (confidence: X%)
        """),
        HumanMessage(content=prompt)
    ])

    return ReasoningStep(
        phase=2,
        phase_name="reasoning",
        content=response.content,
        confidence=extract_confidence(response.content)
    )
```

### A.2 Tree-of-Thought (ToT)

```python
async def tree_of_thought(state: Mode3State, prompt: str, branches: int = 3) -> List[ReasoningStep]:
    """Explore multiple reasoning paths"""
    # Generate branches
    branch_responses = await asyncio.gather(*[
        llm.ainvoke([
            SystemMessage(content=f"Explore approach {i+1} for: {prompt}"),
            HumanMessage(content=prompt)
        ])
        for i in range(branches)
    ])

    # Score branches
    scored_branches = []
    for response in branch_responses:
        score = await evaluate_branch(response.content)
        scored_branches.append((score, response))

    # Select best path
    best_branch = max(scored_branches, key=lambda x: x[0])

    return ReasoningStep(
        phase=2,
        phase_name="tree_exploration",
        content=f"Explored {branches} paths. Selected: {best_branch[1].content}",
        confidence=best_branch[0]
    )
```

### A.3 ReAct (Reason + Act)

```python
async def react_cycle(state: Mode3State) -> Mode3State:
    """Execute ReAct² 7-phase cycle"""

    # Phase 1: Precondition Check
    precondition = await check_preconditions(state)
    if not precondition.valid:
        return state.update(error=precondition.error)

    # Phase 2: Reasoning
    reasoning = await chain_of_thought(state, state["current_task"])

    # Phase 3: Action Selection
    action = await select_action(state, reasoning)

    # Phase 4: Observation
    observation = await execute_action(state, action)

    # Phase 5: Postcondition Verify
    postcondition = await verify_postconditions(state, observation)

    # Phase 6: Uncertainty Estimate
    confidence = calculate_confidence(reasoning, observation, postcondition)

    # Phase 7: Checkpoint (HITL if needed)
    if confidence < state["confidence_threshold"]:
        return state.update(
            pending_hitl=create_hitl_checkpoint("critical_decision", state),
            awaiting_user_response=True
        )

    return state.update(
        reasoning_steps=state["reasoning_steps"] + [reasoning],
        current_confidence=confidence
    )
```

---

*ARD Version 2.0 - December 5, 2025*

---
title: "JTBD Templates → Mode 3 & Mode 4 Implementation Guide"
version: "1.0"
date: "2025-12-XX"
owners: ["VITAL Platform Team"]
sources:
  - "MODE_3_PRD_ENHANCED.md"
  - "MODE_3_ARD_ENHANCED.md"
  - "AutoGPT templates (graph/prompt/forge) learnings"
  - "Claude/Manny agent design patterns (planner/solver/critic + HITL)"
---

# Overview

We map core JTBD archetypes to Mode 3 (manual agent + HITL) and Mode 4 (auto agent selection) flows, leveraging world-class agent design patterns (planner → solver → critic, autonomy bands, HITL, telemetry) and reusable templates inspired by AutoGPT’s graph/prompt scaffolds.

# Patterns to Reuse
- **Planner/Solver/Critic split**: Clear phases with typed events and telemetry.
- **Autonomy bands**: strict/balanced/permissive based on risk/complexity/trust signals.
- **HITL checkpoints**: At plan, high-risk tool/action, and final if low confidence.
- **Evidence & safety**: Citation quality, recency, evidence levels, policy tags.
- **Templates**: Graph templates for DAG shape; Jinja prompt templates for planner/solver/critic; agent profiles for personas/tools.

# JTBD Templates (Step-by-step)

## 1) Deep Research / Investigation
- **Goal**: Synthesize evidence, find gaps, cite sources.
- **Mode 3 flow (manual agent)**:
  1. Require agentId; planner builds research questions + source list (HITL approval).
  2. Solver iterates ReAct with RAG, multi-source compare; emits sources with reliability/evidence level.
  3. Critic checks completeness, flags gaps, calibrates confidence; HITL if low confidence/high risk.
  4. Final answer with citations, gaps, next queries.
- **Mode 4 flow (auto agent)**:
  - Auto-select expert (show rationale); same planner/solver/critic; stricter HITL if policy tags triggered.
- **Templates to apply**:
  - Graph: “Research DAG” (Planner → Retrieval Loop → Compare → Critic → Final).
  - Prompts: Planner (questions/sources), Solver (compare/contrast), Critic (coverage/gaps).
  - Metrics: source count, evidence levels, retrieval time, confidence.

## 2) Strategy / Option Shaping
- **Goal**: Generate and compare strategic options.
- **Mode 3**:
  1. Planner drafts scenarios/options + evaluation criteria (HITL approve criteria).
  2. Solver builds option briefs, trade-off matrix, risk/opportunity map.
  3. Critic stress-tests assumptions; HITL on recommended option.
  4. Final: ranked options, risks, triggers.
- **Mode 4**:
  - Auto-select strategist agent; allow multi-agent (e.g., finance/regulatory) if enabled; HITL on final pick.
- **Templates**:
  - Graph: Planner → Option Generation → Trade-off Matrix → Critic → Final.
  - Prompts: Option generation, trade-off scoring, stress-test.
  - Metrics: options generated, coverage of criteria, risk flags, confidence.

## 3) Tactical Planning / Execution Path
- **Goal**: Convert goal into actionable steps.
- **Mode 3**:
  1. Planner builds phased plan with dependencies, resources, owners; HITL approve plan.
  2. Solver refines steps, timelines, tooling; optional tool runs (require HITL).
  3. Critic checks feasibility, resource/risk balance; HITL if risk > threshold.
  4. Final: plan, Gantt-style phases, risks/mitigations.
- **Mode 4**:
  - Auto-select PM/ops agent; can pull calendars/resources via tools (guarded by HITL).
- **Templates**:
  - Graph: Planner → Plan Refinement → Tool Probes (optional) → Critic → Final.
  - Prompts: Plan drafting, dependency resolution, feasibility check.
  - Metrics: step count, critical path length, risk score, approval count.

## 4) Evaluation / Critique
- **Goal**: Assess quality/fit/risk of a draft, plan, or decision.
- **Mode 3**:
  1. Planner extracts rubric from user input/context; HITL confirm rubric.
  2. Solver scores against rubric, highlights gaps, suggests fixes.
  3. Critic checks bias/hallucination; HITL on high-severity findings.
  4. Final: scored rubric, prioritized fixes.
- **Mode 4**:
  - Auto-select reviewer agent; can chain a secondary critic for self-consistency.
- **Templates**:
  - Graph: Rubric Builder → Scoring → Critic → Final.
  - Prompts: Rubric extraction, scoring, bias/hallucination check.
  - Metrics: rubric coverage, severity counts, confidence calibration.

# Optional Add-ons
- Creative Ideation: swap Solver prompt to brainstorm + clustering; critic filters for feasibility/safety.
- Monitoring/Alerting: recurring planner to set watch criteria; solver pulls signals; critic checks drift; HITL on escalations.
- Decision Memo Builder: template to assemble executive summary, options, risks, decision, next steps.

# Implementation Checklist (Mode 3/4)
- Payloads: include autonomy signals (risk_level, task_complexity, trust_score, model_uncertainty, knowledge_quality).
- HITL: checkpoints at plan, high-risk tool/action, final if confidence < threshold or risk high.
- Streaming: emit planner/solver/critic events, citations with evidence levels/recency, tool calls, autonomy band, agent selection rationale.
- Metrics: task_completion, hitl_approval_rate, p95 latency, evidence count, confidence calibration, token usage.
- Safety: role/permission gates for regulated actions; default strict when signals absent.
- Templates: maintain Jinja prompts per JTBD + graph JSON per flow; version and reference in releases.

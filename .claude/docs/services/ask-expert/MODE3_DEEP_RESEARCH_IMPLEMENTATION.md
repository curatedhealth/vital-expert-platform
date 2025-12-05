---
title: "Mode 3 - Deep Research (JTBD) Implementation Guide"
version: "1.0"
date: "2025-12-05"
owners: ["VITAL Platform Team"]
sources:
  - "MODE_3_PRD_ENHANCED.md"
  - "MODE_3_ARD_ENHANCED.md"
  - "AGENTOS_5_LEVEL_SYSTEM_BLUEPRINT.md"
  - "open_deep_research (LangChain) pattern"
---

# Goal
Build a clean, production-grade Mode 3 “Deep Research” workflow that delivers:
- Structured planner → retrieval → evidence scoring → synthesis → plan → finalize
- Rich `autonomous_reasoning` (plan, steps, iterations, citations, HITL flags)
- Explicit ReAct/CoT pattern visibility
- AgentOS 5-level hierarchy usage (L1–L5) with Context Engineers and L5 tools for context optimization

# Architecture Overview
- API entry: `/api/mode3/deep-research` (already scaffolded).
- LangGraph phases:
  1) Planner (L2/L3 persona): research questions, comparators, target domains, evidence bar.
  2) Retrieval (L4 Context Engineer + L5 tools): UnifiedRAGService true_hybrid with domain/tool hints; context compression.
  3) Evidence Scoring (L4 Worker): evidence_level, recency, reliability.
  4) Synthesis (L3 Specialist): compare/contrast, gaps/risks, mitigation ideas.
  5) Plan (L2 Expert): phased plan, confidence, HITL gating if confidence < threshold or high-risk domain.
  6) Finalize (L2/L3): concise executive answer + citations + next steps.
- Output: `autonomous_reasoning` with `strategy`, `plan`, `plan_confidence`, `reasoning_steps`, `iterations`, `tools_used`, `hitl_required`, `confidence_threshold`; `citations` enriched; `hitl_checkpoints`.

# Prompts (to implement as Jinja/LC templates)
## Planner (L2/L3 Specialist)
System: “You are an L2/L3 Deep Research Planner. Given the goal, produce JSON:
{ questions:[], comparators:[], target_domains:[], evidence_bar:{min_level:'B', recency:'3y'}, success_criteria:[] }.
Include payer/HTA expectations and comparators if relevant. Keep concise.”

## Retrieval / Context Engineer (L4 Context Engineer)
System: “You are an L4 Context Engineer. Using target_domains {{domains}} and requested_tools {{tools}}, run hybrid search, dedupe, compress to top-k. Preserve citations (url/title/excerpt/domain/recency/similarity → evidence_level A/B/C/D).”

## Synthesis (L3 Specialist)
System: “You are an L3 Research Synthesizer. Using sources {{sources}} and comparators {{comparators}}, return JSON:
{ findings:[], gaps:[], risks:[], mitigation:[], confidence:0-1 }.
Findings must cite source ids; highlight payer/HTA standards when applicable.”

## Plan (L2 Expert)
System: “You are an L2 Research Planner. Build phases/steps from findings/gaps. Include HITL checkpoints if confidence < {{threshold}} or high-risk domain (regulatory/clinical). Return:
{ phases:[{name,steps:[]}], plan_confidence, hitl_required }.”

## Finalize (L2/L3)
System: “Summarize key findings, cite sources, list gaps and next steps; executive-ready, MECE. Include a short ‘Evidence & Risks’ and ‘Next 3 actions’.”

# AgentOS 5-Level Usage (tie to prompts/personas)
- L1 Master: not used directly in this flow; could approve escalations.
- L2 Expert: Planner + Finalizer roles; plan confidence, HITL gating.
- L3 Specialist: Synthesis role (compare/contrast/gaps).
- L4 Context Engineer: Retrieval, context compression, tool orchestration hints.
- L4 Worker: Evidence scoring (map similarity/recency → evidence_level).
- L5 Tools: RAG (UnifiedRAGService), web_search, db_lookup, etc.

# Backend Steps (replace stub with real logic)
1) State shape: { query, agent_id, tenant_id, selected_rag_domains, requested_tools, plan, sources, citations, reasoning_steps, iterations, hitl_required, confidence_threshold }.
2) Nodes (LangGraph) in `mode3_deep_research.py`:
   - planner_node (LLM prompt) → questions, comparators, target_domains, evidence_bar.
   - retrieve_node → UnifiedRAGService.query(domains, requested_tools, true_hybrid) → sources; compress/context engineer.
   - score_node → map similarity/recency → evidence_level A/B/C/D, enrich citations.
   - synth_node (LLM prompt) → findings/gaps/risks/mitigation + confidence.
   - plan_node (LLM prompt) → phases/steps, plan_confidence, hitl_required.
   - finalize_node (LLM prompt) → final content + next steps + citations.
3) Build `autonomous_reasoning`:
   - strategy: "react"
   - plan: from plan_node
   - plan_confidence: from plan_node
   - reasoning_steps: planner/synth summaries
   - iterations: ≥3 (plan/retrieve/synth/final)
   - tools_used: requested_tools (plus “hybrid_rag”)
   - hitl_required: from plan_node
   - confidence_threshold: configurable (default 0.9)
4) Citations:
   - Enrich: {id,url,title,excerpt,similarity,evidence_level,recency,domain,organization}
   - Evidence mapping: similarity >=0.85→A, >=0.7→B, >=0.55→C else D.
5) HITL:
   - Set hitl_required if plan_confidence < threshold or domain in [regulatory, clinical].
   - Emit hitl_request checkpoint with plan summary and risks.
6) SSE: ensure events `pattern`, `plan`, `iteration_summary`, `sources/rag_sources`, `hitl_request`, `done` carry autonomous_reasoning and citations.

# Frontend (demo and Ask Expert later)
- `/demo/mode3`: keep JTBD selector “deep_research”; render reasoning/plan and sources (evidence levels, recency). Handle hitl_request (approve/reject stub).
- Parse `pattern`, `plan`, `iteration_summary`, `rag_sources/sources`, `hitl_request`, `done`.

# Implementation Order
1) Backend: replace `mode3_deep_research.py` stub with LangGraph nodes + prompts above; wire to `/api/mode3/deep-research`.
2) Backend: return structured `autonomous_reasoning`, `citations`, `hitl_checkpoints`.
3) Frontend: add Sources panel and HITL modal to `/demo/mode3`; show plan/confidence/strategy/iterations.
4) Verify with end-to-end call; adjust prompts to include AgentOS level hints (L2/L3/L4/L5) in system messages.

# Checklist for “world-class”
- Clear phase separation; explicit ReAct/CoT pattern.
- Evidence quality (evidence_level, recency); gaps/risks present.
- Plan + HITL gating; confidence threshold enforced.
- AgentOS roles: planner/finalizer (L2), synthesizer (L3), context engineer (L4), tools (L5).
- Telemetry: strategy, plan_confidence, iterations, tools_used, sources_count.
- Graceful degradation if RAG/tools fail.

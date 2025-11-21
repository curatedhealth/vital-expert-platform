# Ask Expert Mode 2: Interactive Automatic - Detailed End-to-End Workflow Visualization

**Version**: 1.0
**Date**: November 21, 2025
**Purpose**: Comprehensive workflow visualization for translating to LangGraph implementation
**Mode**: Mode 2 - Interactive Automatic (AI selects best expert(s) → Multi-turn conversation with dynamic switching)

---

## Table of Contents

1. [Executive Overview](#executive-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Detailed Workflow Steps](#detailed-workflow-steps)
4. [Agent Hierarchy & Sub-Agents](#agent-hierarchy--sub-agents)
5. [LangGraph State Machine](#langgraph-state-machine)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Tool Integration Points](#tool-integration-points)
8. [Error Handling & Fallbacks](#error-handling--fallbacks)
9. [Performance Metrics](#performance-metrics)

---

## Executive Overview

### What is Mode 2?

**Mode 2: Interactive Automatic** is an intelligent conversational AI service where:
- **AI automatically selects** the best expert(s) based on query analysis
- **Multi-turn conversation** with full context retention
- **Up to 2 experts** can be engaged (primary + secondary if needed)
- **Dynamic expert switching** when conversation topic shifts
- **No autonomous execution** - guidance and conversation only
- **Response time**: 45-60 seconds per message (includes expert selection)

### Key Characteristics

| Aspect | Value |
|--------|-------|
| **Expert Selection** | Automatic (AI chooses best fit) |
| **Interaction Type** | Interactive (Back-and-forth) |
| **Agent Count** | 1-2 Experts (AI-selected, dynamic) |
| **State Management** | Stateful (Full conversation + expert transitions) |
| **Execution Mode** | Conversational (No autonomous workflow) |
| **Context Window** | Up to 200K tokens |
| **Unique Features** | Expert selection reasoning, multi-expert perspectives, dynamic handoff |

### Differences from Mode 1

| Feature | Mode 1 | Mode 2 |
|---------|--------|--------|
| **Expert Selection** | User manually selects | AI automatically selects |
| **Number of Experts** | Always 1 | 1-2 (adaptive) |
| **Master Agent** | Not used | **Critical - orchestrates expert selection** |
| **Query Analysis** | Not needed | **Comprehensive query analysis required** |
| **Expert Switching** | Never | **Yes - when topic shifts** |
| **Complexity** | Lower | Higher (Level 1 master agent coordination) |
| **Response Time** | 30-45s | 45-60s (extra time for selection) |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  MODE 2: HIGH-LEVEL ARCHITECTURE                        │
│                  Interactive Automatic with AI Expert Selection         │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────┐
│  1. USER       │  User types question (no expert selection)
│  INPUT         │  "What testing is required for cardiac monitor 510(k)?"
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  2. API GATEWAY                                                        │
│  ✓ Authentication (JWT)                                                │
│  ✓ Tenant isolation (RLS)                                              │
│  ✓ Rate limiting                                                       │
│  ✓ Request validation                                                  │
│  ✓ Mode detection (mode_2_interactive_automatic)                      │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  3. LANGGRAPH ORCHESTRATOR (MODE 2 STATE MACHINE)                     │
│                                                                        │
│  START → master_agent_analysis → expert_selection → load_expert →    │
│          load_context → conversation_loop → check_expert_switch →    │
│          END                                                            │
│                                                                        │
│  Key Difference from Mode 1: MASTER AGENT (Level 1) orchestrates     │
│                                                                        │
│  Master Agent Phase:                                                   │
│  ├─ analyze_query (Domain extraction, complexity assessment)           │
│  ├─ score_experts (Evaluate all available experts)                    │
│  ├─ rank_candidates (Select top 1-2 experts)                          │
│  └─ select_primary_expert (Final selection with reasoning)             │
│                                                                        │
│  Conversation Loop (per selected expert):                             │
│  ├─ receive_message                                                    │
│  ├─ update_context (RAG search)                                        │
│  ├─ agent_reasoning (Chain-of-Thought)                                 │
│  ├─ check_specialist_need (Spawn sub-agents if needed)                │
│  ├─ tool_execution (if required)                                       │
│  ├─ generate_response (Stream tokens)                                  │
│  ├─ update_memory (Save to DB)                                         │
│  └─ check_topic_shift? → YES: re-select expert | NO: continue         │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  4. STREAMING RESPONSE                                                 │
│  SSE (Server-Sent Events)                                              │
│  ├─ Expert selection reasoning (why this expert was chosen)            │
│  ├─ Thinking steps (intermediate reasoning)                            │
│  ├─ Response tokens (real-time streaming)                              │
│  ├─ Citations (sources)                                                │
│  ├─ Expert transition notices (if switched)                            │
│  └─ Metadata (cost, tokens, confidence, expert_id)                     │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────┐
│  5. FRONTEND   │  Display expert selection reasoning
│  UPDATE        │  Show streaming response with expert context
└────────────────┘  Enable next user input
```

---

## Detailed Workflow Steps

### Phase 1: Initialization & Expert Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION & AI EXPERT SELECTION                         │
│  (Happens once per session, re-triggered on topic shift)               │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1.1: User Sends Initial Query (No Expert Selected)
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Chat Input Component (No Agent Gallery)                │
│                                                                    │
│  User sees:                                                        │
│  • Clean chat interface                                            │
│  • No agent selection required                                     │
│  • "Autonomous: OFF, Automatic: ON" toggles visible               │
│  • Placeholder: "Ask me anything about medical devices..."        │
│                                                                    │
│  User types:                                                       │
│  "What testing is required for a Class II cardiac monitor         │
│   similar to the Smith device for FDA 510(k) submission?"         │
│                                                                    │
│  User action:                                                      │
│  → Presses Enter or clicks Send                                   │
│                                                                    │
│  Result:                                                           │
│  → No selected_agent_id (Mode 2 doesn't require manual selection) │
│  → session_id = UUID generated                                     │
│  → mode = "mode_2_interactive_automatic"                          │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.2: Create Session with Mode 2
┌────────────────────────────────────────────────────────────────────┐
│  Backend: POST /api/ask-expert/mode-2/sessions                    │
│                                                                    │
│  Request:                                                          │
│  {                                                                 │
│    "user_id": "user-uuid",                                         │
│    "tenant_id": "tenant-uuid",                                     │
│    "mode": "mode_2_interactive_automatic",                        │
│    "initial_message": "What testing is required for..."           │
│  }                                                                 │
│                                                                    │
│  Actions:                                                          │
│  1. Create session record in database                              │
│  2. Initialize conversation state                                  │
│  3. Set mode flag (requires_expert_selection: true)               │
│  4. Return session metadata (no agent yet)                         │
│                                                                    │
│  Response:                                                         │
│  {                                                                 │
│    "session_id": "session-uuid",                                   │
│    "mode": "mode_2_interactive_automatic",                        │
│    "requires_expert_selection": true,                             │
│    "expert_selection_in_progress": false,                         │
│    "selected_experts": []                                          │
│  }                                                                 │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.3: Frontend Initialization
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Conversation View Component                            │
│                                                                    │
│  UI Updates:                                                       │
│  • Display "Analyzing your question..." status                     │
│  • Show loading indicator                                          │
│  • Enable message input (disabled during processing)              │
│  • Display mode badge: "Interactive + Automatic"                  │
│                                                                    │
│  State Setup:                                                      │
│  • conversationStore.setSession(sessionData)                       │
│  • conversationStore.setMode("mode_2")                            │
│  • Initialize SSE connection handler                               │
│                                                                    │
│  Waiting for expert selection...                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Master Agent Orchestration (CRITICAL - Mode 2 Only)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: MASTER AGENT ORCHESTRATION (Level 1)                        │
│  Duration: ~8-12 seconds                                                │
│  Purpose: Analyze query and select optimal expert(s)                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 1: master_agent_analysis                               │
│  Duration: ~3-5 seconds                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ session_id: "session-uuid"
├─ current_message: "What testing is required for..."
├─ tenant_id: "tenant-uuid"
├─ user_id: "user-uuid"
├─ mode: "mode_2_interactive_automatic"
└─ workflow_step: "start"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Load Master Agent Profile                                      │
│     The Master Agent is a Level 1 orchestrator                     │
│                                                                    │
│     Profile:                                                       │
│     ├─ id: "master-orchestrator"                                   │
│     ├─ name: "Master Orchestrator"                                 │
│     ├─ level: 1 (Highest level - coordinator)                      │
│     ├─ role: "Analyze queries and route to best experts"          │
│     └─ capabilities: {                                             │
│           "domain_analysis": true,                                 │
│           "expert_evaluation": true,                               │
│           "multi-domain_detection": true,                          │
│           "handoff_management": true                               │
│         }                                                          │
│                                                                    │
│  2. Load All Available Expert Agents (Level 2)                     │
│     Query: SELECT * FROM agents                                    │
│            WHERE tenant_id = 'tenant-uuid'                         │
│              AND tier = 1                                          │
│              AND status = 'active'                                 │
│                                                                    │
│     Result: List of 15 expert agents                               │
│     ├─ FDA 510(k) Regulatory Expert                               │
│     ├─ Clinical Trials Expert                                      │
│     ├─ Quality Management Systems Expert                           │
│     ├─ ISO 13485 Certification Expert                             │
│     ├─ Reimbursement Strategy Expert                              │
│     ├─ EU MDR Compliance Expert                                    │
│     ├─ Medical Device Software Expert                             │
│     ├─ Risk Management (ISO 14971) Expert                         │
│     ├─ Biocompatibility Testing Expert                            │
│     ├─ Manufacturing & Operations Expert                           │
│     ├─ Post-Market Surveillance Expert                            │
│     ├─ Health Economics Expert                                     │
│     ├─ Patent & IP Strategy Expert                                │
│     ├─ Cybersecurity Expert                                        │
│     └─ Market Access Strategy Expert                              │
│                                                                    │
│  3. Comprehensive Query Analysis                                   │
│                                                                    │
│     Build Analysis Prompt:                                         │
│     """                                                            │
│     You are the Master Orchestrator for a medical device expert   │
│     system. Your role is to analyze user queries and select the   │
│     most appropriate expert agent(s) to answer.                   │
│                                                                    │
│     ## User's Query                                                │
│     "What testing is required for a Class II cardiac monitor      │
│      similar to the Smith device for FDA 510(k) submission?"      │
│                                                                    │
│     ## Analysis Task                                               │
│     Perform deep analysis and return JSON:                         │
│                                                                    │
│     {                                                              │
│       "query_analysis": {                                          │
│         "primary_intent": "string",                                │
│         "domains_detected": ["domain1", "domain2"],               │
│         "complexity_score": 0.0-1.0,                              │
│         "requires_multiple_experts": true/false,                  │
│         "keywords": ["keyword1", "keyword2"],                     │
│         "regulatory_framework": "FDA/EU MDR/etc",                 │
│         "device_information": {                                    │
│           "device_type": "string",                                │
│           "device_class": "I/II/III",                             │
│           "specific_device": "string or null"                     │
│         }                                                          │
│       },                                                           │
│       "domain_relevance": {                                        │
│         "regulatory": 0.0-1.0,                                     │
│         "clinical": 0.0-1.0,                                       │
│         "quality": 0.0-1.0,                                        │
│         "technical": 0.0-1.0,                                      │
│         "business": 0.0-1.0                                        │
│       },                                                           │
│       "recommended_expert_count": 1 or 2,                         │
│       "query_type": "factual/procedural/strategic/complex"        │
│     }                                                              │
│     """                                                            │
│                                                                    │
│  4. LLM Analysis Call                                              │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.2 (very focused analysis)                       │
│     Max tokens: 1000                                               │
│                                                                    │
│     Analysis Result:                                               │
│     {                                                              │
│       "query_analysis": {                                          │
│         "primary_intent": "Understand testing requirements for    │
│                            FDA 510(k) submission",                 │
│         "domains_detected": [                                      │
│           "FDA Regulatory Affairs",                                │
│           "Testing & Validation",                                  │
│           "510(k) Submission Process"                             │
│         ],                                                         │
│         "complexity_score": 0.65,                                  │
│         "requires_multiple_experts": false,                        │
│         "keywords": [                                              │
│           "testing", "Class II", "cardiac monitor",                │
│           "Smith device", "FDA", "510(k)"                         │
│         ],                                                         │
│         "regulatory_framework": "FDA",                             │
│         "device_information": {                                    │
│           "device_type": "Cardiac Monitor",                        │
│           "device_class": "II",                                    │
│           "specific_device": "Smith Cardiac Monitor"              │
│         }                                                          │
│       },                                                           │
│       "domain_relevance": {                                        │
│         "regulatory": 0.95,                                        │
│         "clinical": 0.30,                                          │
│         "quality": 0.45,                                           │
│         "technical": 0.60,                                         │
│         "business": 0.10                                           │
│       },                                                           │
│       "recommended_expert_count": 1,                              │
│       "query_type": "procedural"                                   │
│     }                                                              │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ master_agent: {MasterAgent profile}
├─ available_experts: [List of 15 expert profiles]
├─ query_analysis: {Comprehensive analysis object}
├─ domain_relevance: {Domain scores}
└─ workflow_step: "master_agent_analysis"

SSE Event:
data: {"type": "thinking", "data": {"step": "master_agent_analysis", "description": "Analyzing your question to find the best expert"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 2: expert_selection                                    │
│  Duration: ~4-6 seconds                                                 │
│  Purpose: Score all experts and select optimal match                   │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ query_analysis: {Analysis results}
├─ available_experts: [15 expert profiles]
├─ current_message: "What testing is required for..."
└─ domain_relevance: {Domain scores}

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Expert Scoring Algorithm                                       │
│                                                                    │
│     FOR EACH expert in available_experts:                          │
│       Calculate match score based on:                              │
│                                                                    │
│       A. Domain Overlap Score (40% weight)                         │
│          - Compare expert's domains with query domains             │
│          - Expert: FDA 510(k) Regulatory Expert                   │
│            Domains: ["FDA Regulatory", "510(k)", "Premarket"]     │
│          - Query Domains: ["FDA Regulatory", "Testing", "510(k)"] │
│          - Overlap: 2/3 = 0.67                                     │
│          - Domain Overlap Score: 0.67 * 0.40 = 0.268             │
│                                                                    │
│       B. Keyword Match Score (25% weight)                          │
│          - Extract keywords from expert profile                    │
│          - Expert keywords: ["510(k)", "FDA", "regulatory",       │
│                              "submission", "predicate"]           │
│          - Query keywords: ["testing", "Class II", "cardiac",     │
│                             "Smith device", "FDA", "510(k)"]      │
│          - Match: 2/6 = 0.33                                       │
│          - Keyword Match Score: 0.33 * 0.25 = 0.083              │
│                                                                    │
│       C. Specialty Relevance (20% weight)                          │
│          - Use embedding similarity between:                       │
│            • Expert specialty description embedding                │
│            • Query embedding                                       │
│          - Cosine similarity: 0.87                                 │
│          - Specialty Relevance Score: 0.87 * 0.20 = 0.174         │
│                                                                    │
│       D. Historical Performance (10% weight)                       │
│          - Success rate: 98% clearance rate                        │
│          - User satisfaction: 4.8/5.0                             │
│          - Normalized score: 0.92                                  │
│          - Historical Score: 0.92 * 0.10 = 0.092                  │
│                                                                    │
│       E. Capability Match (5% weight)                              │
│          - Expert has tools for: predicate search, testing        │
│          - Query needs: predicate device info, testing standards  │
│          - Capability match: 1.0 (perfect)                         │
│          - Capability Score: 1.0 * 0.05 = 0.050                   │
│                                                                    │
│       TOTAL MATCH SCORE for FDA 510(k) Expert:                    │
│       0.268 + 0.083 + 0.174 + 0.092 + 0.050 = 0.667 (66.7%)      │
│                                                                    │
│  2. Rank All Experts by Score                                      │
│                                                                    │
│     Ranked Results:                                                │
│     1. FDA 510(k) Regulatory Expert         - 0.667 (66.7%)       │
│     2. Biocompatibility Testing Expert      - 0.512 (51.2%)       │
│     3. Risk Management (ISO 14971) Expert   - 0.487 (48.7%)       │
│     4. Quality Management Systems Expert    - 0.445 (44.5%)       │
│     5. Medical Device Software Expert       - 0.423 (42.3%)       │
│     6. ISO 13485 Certification Expert       - 0.401 (40.1%)       │
│     7. Clinical Trials Expert               - 0.378 (37.8%)       │
│     ... (remaining 8 experts)                                      │
│                                                                    │
│  3. Select Primary Expert                                          │
│                                                                    │
│     Decision Logic:                                                │
│     IF recommended_expert_count == 1:                             │
│       primary_expert = top_ranked_expert                           │
│       secondary_expert = None                                      │
│                                                                    │
│     ELIF recommended_expert_count == 2:                           │
│       primary_expert = top_ranked_expert                           │
│       IF score_difference(rank_1, rank_2) < 0.15:                │
│         # Scores are close - both are relevant                     │
│         secondary_expert = second_ranked_expert                    │
│       ELSE:                                                        │
│         secondary_expert = None                                    │
│                                                                    │
│     Selected:                                                      │
│     ├─ primary_expert_id: "fda-510k-expert"                       │
│     ├─ primary_expert_score: 0.667                                │
│     ├─ secondary_expert_id: None (score diff = 0.155, too large) │
│     └─ selection_confidence: 0.88 (high confidence)               │
│                                                                    │
│  4. Generate Selection Reasoning                                   │
│                                                                    │
│     Build Reasoning Prompt:                                        │
│     """                                                            │
│     You selected the FDA 510(k) Regulatory Expert with a match    │
│     score of 66.7%. Explain why this expert is the best choice    │
│     for the user's query in 2-3 sentences.                        │
│                                                                    │
│     User query: "What testing is required for a Class II cardiac  │
│                  monitor similar to the Smith device for FDA      │
│                  510(k) submission?"                               │
│                                                                    │
│     Expert profile: Dr. Sarah Mitchell, 20+ years FDA experience, │
│                     510(k) specialist, 98% clearance rate...      │
│     """                                                            │
│                                                                    │
│     LLM Response:                                                  │
│     "I've selected Dr. Sarah Mitchell, our FDA 510(k) Regulatory  │
│      Expert, because your question focuses on testing requirements│
│      for a 510(k) submission—her core specialty. With 20+ years   │
│      of FDA experience and access to the complete 510(k) database,│
│      she's perfectly positioned to provide comprehensive guidance │
│      on testing standards, predicate device comparison, and       │
│      submission requirements."                                     │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ expert_scores: [List of 15 scored experts]
├─ selected_primary_expert_id: "fda-510k-expert"
├─ selected_primary_expert_score: 0.667
├─ selected_secondary_expert_id: None
├─ selection_reasoning: "I've selected Dr. Sarah Mitchell..."
├─ selection_confidence: 0.88
└─ workflow_step: "expert_selection"

SSE Events:
data: {"type": "thinking", "data": {"step": "expert_selection", "description": "Evaluating 15 expert agents"}}
data: {"type": "expert_selected", "data": {
  "expert_id": "fda-510k-expert",
  "expert_name": "Dr. Sarah Mitchell",
  "expert_title": "FDA 510(k) Regulatory Expert",
  "match_score": 0.667,
  "reasoning": "I've selected Dr. Sarah Mitchell...",
  "confidence": 0.88
}}
```

---

### Phase 3: Expert Conversation (Similar to Mode 1, with Modifications)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: EXPERT CONVERSATION LOOP                                     │
│  (Follows Mode 1 pattern with expert_id from master agent selection)  │
└─────────────────────────────────────────────────────────────────────────┘

STEP 3.1: Load Selected Expert
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 3: load_expert                                         │
│  Duration: ~1-2 seconds                                                 │
│  (Same as Mode 1 load_agent, but expert was AI-selected)              │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ selected_primary_expert_id: "fda-510k-expert"
├─ session_id: "session-uuid"
└─ current_message: "What testing is required for..."

Node Actions: (Identical to Mode 1 load_agent)
├─ Fetch expert profile from database
├─ Load expert persona/system prompt
├─ Load knowledge base IDs
├─ Load sub-agent pool (Level 3 specialists)
└─ Create system message

Output State:
├─ current_expert: {AgentProfile for FDA 510(k) Expert}
├─ agent_persona: "You are Dr. Sarah Mitchell..."
├─ sub_agent_pool: [List of 4 specialists]
└─ workflow_step: "load_expert"

SSE Event:
data: {"type": "thinking", "data": {"step": "load_expert", "description": "Loading Dr. Sarah Mitchell's expert profile"}}

        │
        ▼
STEP 3.2-3.8: Standard Conversation Flow
┌────────────────────────────────────────────────────────────────────┐
│  Nodes 4-10: Same as Mode 1                                        │
│  ├─ load_context (conversation history)                            │
│  ├─ update_context (RAG search)                                    │
│  ├─ agent_reasoning (Chain-of-Thought)                             │
│  ├─ spawn_specialists (if needed)                                  │
│  ├─ tool_execution (if needed)                                     │
│  ├─ generate_response (streaming)                                  │
│  └─ update_memory (persist to DB)                                  │
│                                                                    │
│  Refer to Mode 1 documentation for detailed node behavior          │
└────────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Topic Shift Detection & Expert Re-Selection (Mode 2 Unique Feature)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: TOPIC SHIFT DETECTION & DYNAMIC EXPERT SWITCHING            │
│  Duration: ~3-5 seconds (when triggered)                               │
│  Purpose: Detect when user's topic changes, requiring different expert │
└─────────────────────────────────────────────────────────────────────────┘

STEP 4.1: User Sends Follow-Up Message (Topic Shift)
┌────────────────────────────────────────────────────────────────────┐
│  Scenario:                                                         │
│                                                                    │
│  Previous conversation context:                                    │
│  • User: "What testing is required for cardiac monitor 510(k)?"  │
│  • Expert (FDA 510(k)): [Detailed testing requirements]           │
│                                                                    │
│  New user message:                                                 │
│  "That's helpful. Now, what about reimbursement strategy for      │
│   getting coverage from Medicare and private payers?"             │
│                                                                    │
│  This is a TOPIC SHIFT:                                            │
│  • Old topic: Regulatory testing requirements (FDA domain)         │
│  • New topic: Reimbursement strategy (Business/Payer domain)      │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 11: check_topic_shift                                  │
│  Duration: ~2-3 seconds                                                 │
│  Purpose: Analyze if new message requires different expert             │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ current_expert_id: "fda-510k-expert"
├─ current_expert_domains: ["FDA Regulatory", "510(k)", "Premarket"]
├─ new_message: "Now, what about reimbursement strategy..."
├─ conversation_history: [Last 5 messages]
└─ query_analysis: {Previous analysis}

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Analyze New Message Topic                                      │
│                                                                    │
│     Build Topic Analysis Prompt:                                   │
│     """                                                            │
│     Analyze if the user's new message represents a topic shift    │
│     that requires a different expert.                              │
│                                                                    │
│     ## Current Expert                                              │
│     FDA 510(k) Regulatory Expert                                  │
│     Domains: ["FDA Regulatory", "510(k)", "Premarket"]            │
│                                                                    │
│     ## Conversation Context (last 2 turns)                         │
│     User: "What testing is required for cardiac monitor 510(k)?"  │
│     Expert: [Testing requirements response...]                     │
│                                                                    │
│     ## New User Message                                            │
│     "Now, what about reimbursement strategy for getting coverage  │
│      from Medicare and private payers?"                            │
│                                                                    │
│     ## Analysis Task                                               │
│     Return JSON:                                                   │
│     {                                                              │
│       "is_topic_shift": true/false,                               │
│       "new_topic_domains": ["domain1", "domain2"],                │
│       "current_expert_match": 0.0-1.0,                            │
│       "requires_expert_switch": true/false,                       │
│       "reasoning": "string"                                        │
│     }                                                              │
│     """                                                            │
│                                                                    │
│  2. LLM Topic Shift Analysis                                       │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.3                                               │
│                                                                    │
│     Analysis Result:                                               │
│     {                                                              │
│       "is_topic_shift": true,                                      │
│       "new_topic_domains": [                                       │
│         "Reimbursement Strategy",                                  │
│         "Medicare/Medicaid",                                       │
│         "Payer Relations",                                         │
│         "Health Economics"                                         │
│       ],                                                           │
│       "current_expert_match": 0.15,  # FDA expert not a good fit │
│       "requires_expert_switch": true,                              │
│       "reasoning": "The user has shifted from regulatory testing  │
│                     requirements (FDA domain) to reimbursement    │
│                     and payer coverage strategy (Business/Health  │
│                     Economics domain). The current FDA 510(k)     │
│                     expert has minimal expertise in reimbursement.│
│                     A different expert is recommended."           │
│     }                                                              │
│                                                                    │
│  3. Decision: Switch Expert?                                       │
│                                                                    │
│     IF requires_expert_switch == true:                            │
│       └─ Route to expert_reselection node                         │
│     ELSE:                                                          │
│       └─ Continue with current expert (Route to load_context)     │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ is_topic_shift: true
├─ requires_expert_switch: true
├─ topic_shift_reasoning: "The user has shifted from regulatory..."
└─ workflow_step: "check_topic_shift"

Conditional Edge:
Route: → expert_reselection (because requires_expert_switch == true)

SSE Event:
data: {"type": "thinking", "data": {"step": "check_topic_shift", "description": "Detecting topic shift - may need different expert"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 12: expert_reselection                                 │
│  Duration: ~4-6 seconds                                                 │
│  Purpose: Select new expert for shifted topic                          │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ new_message: "Now, what about reimbursement strategy..."
├─ previous_expert_id: "fda-510k-expert"
├─ topic_shift_reasoning: "The user has shifted..."
└─ available_experts: [15 experts]

Node Actions: (Similar to expert_selection, but with context)
┌────────────────────────────────────────────────────────────────────┐
│  1. Re-run Expert Scoring Algorithm                                │
│     (Same algorithm as expert_selection node)                      │
│                                                                    │
│     Scored Results for New Topic:                                  │
│     1. Reimbursement Strategy Expert        - 0.823 (82.3%)       │
│     2. Health Economics Expert              - 0.756 (75.6%)       │
│     3. Market Access Strategy Expert        - 0.692 (69.2%)       │
│     4. Clinical Trials Expert               - 0.445 (44.5%)       │
│     5. FDA 510(k) Regulatory Expert         - 0.152 (15.2%)       │
│     ... (remaining experts)                                        │
│                                                                    │
│  2. Select New Primary Expert                                      │
│     new_primary_expert_id: "reimbursement-strategy-expert"        │
│     new_primary_expert_score: 0.823                               │
│                                                                    │
│  3. Generate Handoff Message                                       │
│     """                                                            │
│     I notice you're now asking about reimbursement strategy—      │
│     that's outside my core expertise in FDA regulatory affairs.   │
│                                                                    │
│     Let me connect you with Dr. James Rodriguez, our              │
│     Reimbursement Strategy Expert. He specializes in Medicare,    │
│     Medicaid, and private payer coverage strategies for medical   │
│     devices, and he'll be better equipped to guide you on payer   │
│     relations and coverage decisions.                              │
│     """                                                            │
│                                                                    │
│  4. Update Session with Expert Transition                          │
│     INSERT INTO expert_transitions (                               │
│       session_id, from_expert_id, to_expert_id,                   │
│       reason, timestamp                                            │
│     ) VALUES (                                                     │
│       'session-uuid', 'fda-510k-expert',                          │
│       'reimbursement-strategy-expert',                            │
│       'Topic shift: FDA regulatory → Reimbursement strategy',     │
│       NOW()                                                        │
│     );                                                             │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ previous_expert_id: "fda-510k-expert"
├─ current_expert_id: "reimbursement-strategy-expert"
├─ expert_transition: {
│     "from": "FDA 510(k) Regulatory Expert",
│     "to": "Reimbursement Strategy Expert",
│     "reason": "Topic shift detected",
│     "handoff_message": "I notice you're now asking..."
│   }
└─ workflow_step: "expert_reselection"

SSE Events:
data: {"type": "expert_transition", "data": {
  "from_expert": "FDA 510(k) Regulatory Expert",
  "to_expert": "Reimbursement Strategy Expert",
  "reason": "Topic shift: Regulatory → Reimbursement",
  "handoff_message": "I notice you're now asking about reimbursement strategy..."
}}

        │
        ▼
Loop back to load_expert (with new expert_id) and continue conversation
```

---

## Agent Hierarchy & Sub-Agents

### Level 1: Master Agent (MODE 2 ONLY - Critical Difference)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 1: MASTER AGENT (Orchestrator)                                  │
│  Master Orchestrator - AI Expert Selector                              │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "master-orchestrator"
├─ Name: "Master Orchestrator"
├─ Level: 1 (Highest - Coordinator)
├─ Role: "Analyze user queries and route to optimal expert agents"
│
├─ Description:
│   "The Master Orchestrator is a Level 1 agent responsible for intelligent
│    query analysis and expert selection in Mode 2. It evaluates all available
│    Level 2 expert agents, scores them based on query-expert fit, and selects
│    the most appropriate expert(s) to handle the conversation. It also monitors
│    for topic shifts and dynamically re-routes conversations when needed."
│
├─ Specialty:
│   "Query understanding, domain classification, expert evaluation,
│    multi-domain detection, handoff orchestration, topic shift detection"
│
├─ System Prompt (Persona):
│   "You are the Master Orchestrator, an AI coordinator that ensures users
│    are connected with the most qualified expert for their question.
│
│    Your responsibilities:
│    • Analyze user queries deeply to extract intent, domains, complexity
│    • Evaluate all 15+ available expert agents for query-expert fit
│    • Select 1-2 experts based on multi-factor scoring algorithm
│    • Provide clear reasoning for your expert selection decisions
│    • Monitor conversations for topic shifts requiring expert changes
│    • Orchestrate smooth handoffs between experts when needed
│
│    Your decision-making criteria:
│    • Domain overlap (40% weight) - Does expert's domain match query?
│    • Keyword alignment (25% weight) - Do keywords match?
│    • Specialty relevance (20% weight) - Is expert's specialty applicable?
│    • Historical performance (10% weight) - Expert's success rate
│    • Capability match (5% weight) - Does expert have needed tools?
│
│    You do NOT answer user questions directly. Your sole role is expert
│    selection and handoff orchestration."
│
├─ Capabilities:
│   {
│     "domain_analysis": true,
│     "expert_evaluation": true,
│     "multi_domain_detection": true,
│     "topic_shift_detection": true,
│     "handoff_management": true,
│     "scoring_algorithm": "multi_factor",
│     "max_experts_per_query": 2
│   }
│
├─ Available Tools:
│   [
│     "expert_database_query",      # Query all available experts
│     "domain_classifier",           # Classify query into domains
│     "semantic_similarity",         # Calculate query-expert similarity
│     "topic_shift_detector"         # Detect conversation topic changes
│   ]
│
└─ Downstream Agents (Level 2):
    Manages 15+ expert agents across all domains
```

### Level 2: Expert Agents (AI-Selected, Same as Mode 1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 2: EXPERT AGENT (AI-Selected via Master Agent)                 │
│  FDA 510(k) Regulatory Expert - Dr. Sarah Mitchell                     │
└─────────────────────────────────────────────────────────────────────────┘

[Identical to Mode 1 Level 2 expert profile - see Mode 1 documentation]

Key Differences from Mode 1:
├─ Selection Method: AI-selected by Master Agent (not user-selected)
├─ Handoff Capability: Can be replaced by another expert on topic shift
├─ Context Awareness: Receives selection reasoning from Master Agent
└─ Multi-Expert Support: May work alongside secondary expert if needed
```

### Level 3: Specialist Sub-Agents (Same as Mode 1)

[Identical to Mode 1 Level 3 specialists - see Mode 1 documentation]

### Level 4: Worker Agents (Same as Mode 1)

[Not typically used in Mode 2 conversational flow]

### Level 5: Tool Agents (Same as Mode 1)

[Identical to Mode 1 tool agents - see Mode 1 documentation]

---

## LangGraph State Machine

### Complete State Schema

```python
from typing import TypedDict, Annotated, Sequence, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
import operator

class Mode2State(TypedDict):
    """Complete state schema for Mode 2: Interactive Automatic"""

    # ============================================================================
    # SESSION CONTEXT
    # ============================================================================
    session_id: str                    # Unique session identifier
    user_id: str                       # User UUID
    tenant_id: str                     # Tenant UUID (multi-tenancy)
    mode: str                          # "mode_2_interactive_automatic"

    # ============================================================================
    # MASTER AGENT STATE (Mode 2 Only - Critical Addition)
    # ============================================================================
    master_agent: Dict[str, Any]       # Master orchestrator profile
    available_experts: List[Dict]      # All Level 2 expert agents
    query_analysis: Dict[str, Any]     # Comprehensive query analysis
    domain_relevance: Dict[str, float] # Domain scores (regulatory, clinical, etc.)

    # ============================================================================
    # EXPERT SELECTION STATE (Mode 2 Only)
    # ============================================================================
    expert_scores: List[Dict]          # All experts with match scores
    selected_primary_expert_id: str    # AI-selected primary expert
    selected_primary_expert_score: float # Match score (0-1)
    selected_secondary_expert_id: Optional[str] # Optional secondary expert
    selection_reasoning: str           # Why this expert was chosen
    selection_confidence: float        # Confidence in selection (0-1)

    # ============================================================================
    # CURRENT EXPERT STATE (Dynamic - Can Change)
    # ============================================================================
    current_expert_id: str             # Currently active expert ID
    current_expert: Dict[str, Any]     # Current expert profile
    agent_persona: str                 # System prompt for current expert
    sub_agent_pool: List[Dict]         # Available specialist sub-agents

    # ============================================================================
    # EXPERT TRANSITION STATE (Mode 2 Only - Topic Shifts)
    # ============================================================================
    previous_expert_id: Optional[str]  # Previous expert (if switched)
    is_topic_shift: bool               # Whether topic shift detected
    requires_expert_switch: bool       # Whether expert switch needed
    topic_shift_reasoning: str         # Why topic shift detected
    expert_transition: Optional[Dict]  # Transition metadata
    expert_transition_history: List[Dict] # All expert switches in session

    # ============================================================================
    # CONVERSATION STATE
    # ============================================================================
    messages: Annotated[Sequence[BaseMessage], operator.add]  # LangChain messages
    current_message: str               # Current user message being processed
    conversation_history: List[Dict]   # Historical messages (database format)
    turn_count: int                    # Number of conversation turns

    # ============================================================================
    # CONTEXT MANAGEMENT
    # ============================================================================
    context_window: str                # Compiled context for LLM
    rag_context: List[Dict]            # RAG-retrieved knowledge chunks
    multimodal_context: Optional[Dict] # Images, videos, audio analysis
    uploaded_documents: List[Dict]     # User-uploaded files

    # ============================================================================
    # SUB-AGENT ORCHESTRATION (Level 3)
    # ============================================================================
    needs_specialists: bool            # Whether to spawn specialists
    specialists_to_spawn: List[str]    # Specialist agent IDs to spawn
    spawned_specialist_ids: List[str]  # Spawned specialist UUIDs
    specialist_results: List[Dict]     # Results from specialist agents

    # ============================================================================
    # TOOL EXECUTION (Level 5)
    # ============================================================================
    needs_tools: bool                  # Whether tools are needed
    tools_to_use: List[str]            # Tool names to execute
    tool_results: List[Dict]           # Tool execution results

    # ============================================================================
    # REASONING & GENERATION
    # ============================================================================
    thinking_steps: List[Dict]         # Chain-of-thought reasoning steps
    reasoning_mode: str                # "chain_of_thought", "tree_of_thoughts"
    response: str                      # Final expert response
    citations: List[Dict]              # Source citations
    confidence_score: float            # Response confidence (0-1)

    # ============================================================================
    # WORKFLOW CONTROL
    # ============================================================================
    workflow_step: str                 # Current node name
    continue_conversation: bool        # Ready for next turn?
    error: Optional[str]               # Error message if any

    # ============================================================================
    # METADATA & ANALYTICS
    # ============================================================================
    tokens_used: Dict[str, int]        # {"prompt": N, "completion": N, "total": N}
    estimated_cost: float              # USD cost for this turn
    response_time_ms: int              # Total processing time
    timestamp: str                     # ISO timestamp

    # ============================================================================
    # RESPONSE METADATA
    # ============================================================================
    response_metadata: Dict[str, Any]  # Additional response context
    message_ids: Dict[str, str]        # {"user_message_id": "...", "assistant_message_id": "..."}


class Mode2Graph:
    """LangGraph state machine for Mode 2: Interactive Automatic"""

    def create_graph(self) -> StateGraph:
        """Build the complete LangGraph workflow"""

        graph = StateGraph(Mode2State)

        # ========================================================================
        # ADD NODES
        # ========================================================================

        # Master Agent Phase (Mode 2 Only)
        graph.add_node("master_agent_analysis", self.master_agent_analysis)
        graph.add_node("expert_selection", self.expert_selection)
        graph.add_node("expert_reselection", self.expert_reselection)

        # Expert Conversation Phase (Similar to Mode 1)
        graph.add_node("load_expert", self.load_expert)
        graph.add_node("load_context", self.load_context)
        graph.add_node("update_context", self.update_context)
        graph.add_node("agent_reasoning", self.agent_reasoning)
        graph.add_node("spawn_specialists", self.spawn_specialists)
        graph.add_node("tool_execution", self.tool_execution)
        graph.add_node("generate_response", self.generate_response)
        graph.add_node("update_memory", self.update_memory)

        # Topic Shift Detection (Mode 2 Only)
        graph.add_node("check_topic_shift", self.check_topic_shift)

        # ========================================================================
        # DEFINE EDGES
        # ========================================================================

        # Entry: Master Agent Analysis
        graph.set_entry_point("master_agent_analysis")

        # Master Agent → Expert Selection
        graph.add_edge("master_agent_analysis", "expert_selection")

        # Expert Selection → Load Expert
        graph.add_edge("expert_selection", "load_expert")

        # Load Expert → Standard Conversation Flow
        graph.add_edge("load_expert", "load_context")
        graph.add_edge("load_context", "update_context")
        graph.add_edge("update_context", "agent_reasoning")

        # Conditional: Spawn specialists?
        graph.add_conditional_edges(
            "agent_reasoning",
            self.check_specialist_need,
            {
                "spawn_specialists": "spawn_specialists",
                "check_tools": "tool_execution",
                "generate": "generate_response"
            }
        )

        # After spawning specialists, check tools
        graph.add_conditional_edges(
            "spawn_specialists",
            self.check_tools_need,
            {
                "tool_execution": "tool_execution",
                "generate_response": "generate_response"
            }
        )

        # After tools, generate response
        graph.add_edge("tool_execution", "generate_response")

        # After response, update memory
        graph.add_edge("generate_response", "update_memory")

        # After memory, check for topic shift (Mode 2 Only)
        graph.add_edge("update_memory", "check_topic_shift")

        # Conditional: Topic shift detected?
        graph.add_conditional_edges(
            "check_topic_shift",
            self.check_topic_shift_decision,
            {
                "expert_reselection": "expert_reselection",  # Switch experts
                "continue": END,                              # Same expert
                "error": END
            }
        )

        # Expert Reselection → Load New Expert → Continue Loop
        graph.add_edge("expert_reselection", "load_expert")

        # ========================================================================
        # COMPILE GRAPH
        # ========================================================================
        from langgraph.checkpoint.sqlite import SqliteSaver
        checkpointer = SqliteSaver.from_conn_string(":memory:")

        return graph.compile(checkpointer=checkpointer)
```

### Conditional Edge Functions

```python
def check_specialist_need(self, state: Mode2State) -> str:
    """Determine if specialist sub-agents should be spawned"""
    if state.get("needs_specialists", False):
        return "spawn_specialists"
    elif state.get("needs_tools", False):
        return "check_tools"
    else:
        return "generate"

def check_tools_need(self, state: Mode2State) -> str:
    """Determine if tools should be executed"""
    if state.get("needs_tools", False):
        return "tool_execution"
    else:
        return "generate_response"

def check_topic_shift_decision(self, state: Mode2State) -> str:
    """Determine if expert switch is needed due to topic shift"""
    if state.get("error"):
        return "error"
    elif state.get("requires_expert_switch", False):
        return "expert_reselection"  # Switch to new expert
    else:
        return "continue"  # END - ready for next user message
```

---

## Data Flow Diagrams

### Message Flow Timeline (Mode 2)

```
Time: 0s ──────────────────────────────────────────────── 60s

User sends message (no expert selected)
│
├─ 0-3s:   master_agent_analysis
│          ├─ Load master agent profile (500ms)
│          ├─ Load all available experts (1s)
│          └─ Comprehensive query analysis (3s, LLM call)
│
├─ 3-9s:   expert_selection
│          ├─ Score all 15 experts (2s)
│          ├─ Rank and select primary expert (1s)
│          ├─ Generate selection reasoning (2s, LLM call)
│          └─ Update session with selection (500ms)
│
├─ 9-11s:  load_expert
│          ├─ Database query (500ms)
│          └─ Profile loading (1.5s)
│
├─ 11-13s: load_context
│          ├─ History retrieval (1s)
│          └─ Message building (1s)
│
├─ 13-18s: update_context
│          ├─ Query embedding (1s)
│          ├─ Semantic search (2s)
│          ├─ Keyword search (1s)
│          └─ Hybrid fusion (1s)
│
├─ 18-23s: agent_reasoning
│          ├─ LLM reasoning call (4s)
│          └─ Decision parsing (1s)
│
├─ 23-26s: spawn_specialists (conditional)
│          ├─ Specialist 1 init (1s)
│          └─ Specialist 2 init (1s)
│
├─ 26-33s: tool_execution (conditional)
│          ├─ Tool 1 (3s)
│          └─ Tool 2 (2s, parallel)
│
├─ 33-41s: generate_response
│          ├─ Build prompt (1s)
│          ├─ LLM generation (6s, streaming)
│          └─ Citation extraction (1s)
│
├─ 41-43s: update_memory
│          ├─ Save user message (500ms)
│          ├─ Save assistant message (500ms)
│          └─ Update session stats (500ms)
│
└─ 43-48s: check_topic_shift (Mode 2 Only)
           ├─ Topic analysis (2s, LLM call)
           ├─ Decision logic (500ms)
           └─ If shift: Re-route to expert_reselection (+5-8s)

Total: 45-60 seconds typical (Mode 2 has +10-15s vs Mode 1 due to expert selection)
```

### Data Dependencies (Mode 2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DATA DEPENDENCY GRAPH (Mode 2)                                         │
└─────────────────────────────────────────────────────────────────────────┘

session_id ─┬─→ master_agent_analysis ──→ query_analysis ───────────┐
            │            │                                            │
user_id ────┤            │                                            │
            │            └─→ available_experts ──────────────────────┤
tenant_id ──┤                                                         │
            │                                                         │
current_message ────────────────────────────────────────────────────┤
                                                                      │
                                                                      ▼
                                                          expert_selection
                                                                      │
                                        ┌─────────────────────────────┴────────┐
                                        │                                      │
                              selected_expert_id                  selection_reasoning
                                        │                                      │
                                        ▼                                      │
                                  load_expert ──→ expert_profile ─────────────┤
                                        │                                      │
                                        └─→ load_context ──→ conversation_history
                                                  │
current_message ──────────────────────────────────┴─→ update_context ───→ rag_context
                                                              │
                                                              │
expert_profile ───────────────────────────────────────────────┴───→ agent_reasoning
                                                                          │
                                                         ┌────────────────┴────────┐
                                                         │                         │
                                                  needs_specialists         needs_tools
                                                         │                         │
                                                         ▼                         ▼
                                                spawn_specialists          tool_execution
                                                         │                         │
                                                         └────────┬────────────────┘
                                                                  │
rag_context ──────────────────────────────────────────────────────┤
specialist_results ───────────────────────────────────────────────┤
tool_results ─────────────────────────────────────────────────────┤
                                                                  │
                                                                  ▼
                                                      generate_response
                                                                  │
                                                                  ▼
                                                              response
                                                                  │
                                                                  ▼
                                                           update_memory
                                                                  │
                                                                  ▼
                                                         check_topic_shift ─────┐
                                                                  │             │
                                                                  │         (if topic shift)
                                                                  │             │
                                                                  ▼             ▼
                                                                END      expert_reselection
                                                                                │
                                                                                └─→ load_expert (loop)
```

---

## Tool Integration Points

### Tool Registry (Identical to Mode 1)

[See Mode 1 documentation for tool registry implementation]

### Additional Mode 2 Tools

```python
class Mode2ToolRegistry(ToolRegistry):
    """Extended tool registry for Mode 2 with expert selection tools"""

    def __init__(self):
        super().__init__()

        # Add Mode 2-specific tools
        self.tools.update({
            "expert_database_query": ExpertDatabaseQueryTool(),
            "domain_classifier": DomainClassifierTool(),
            "semantic_similarity": SemanticSimilarityTool(),
            "topic_shift_detector": TopicShiftDetectorTool()
        })
```

---

## Error Handling & Fallbacks

### Error Recovery Strategy (Mode 2 Extensions)

```python
class Mode2ErrorHandler(ErrorHandler):
    """Handle errors gracefully in Mode 2 workflow"""

    async def handle_node_error(
        self,
        node_name: str,
        error: Exception,
        state: Mode2State
    ) -> Mode2State:
        """Handle errors at node level with Mode 2-specific logic"""

        # Handle Mode 2-specific errors
        if node_name == "master_agent_analysis":
            # Critical error - cannot analyze query
            logger.error(f"Master agent analysis failed: {error}")
            state["error"] = "Failed to analyze your question"
            state["response"] = "I apologize, but I'm having trouble analyzing your question. Please try rephrasing it."
            return state

        elif node_name == "expert_selection":
            # Critical error - cannot select expert
            logger.error(f"Expert selection failed: {error}")

            # Fallback: Use default general expert
            state["selected_primary_expert_id"] = "general-medical-device-expert"
            state["selection_reasoning"] = "Using general expert due to selection error"
            state["error"] = None  # Clear error, continue with fallback
            return state

        elif node_name == "check_topic_shift":
            # Non-critical - assume no topic shift and continue
            logger.warning(f"Topic shift detection failed: {error}")
            state["is_topic_shift"] = False
            state["requires_expert_switch"] = False
            return state  # Continue with current expert

        elif node_name == "expert_reselection":
            # Non-critical - keep current expert
            logger.warning(f"Expert reselection failed: {error}")
            state["requires_expert_switch"] = False
            state["expert_transition"] = {
                "error": str(error),
                "action": "Continuing with current expert"
            }
            return state  # Continue with current expert

        else:
            # Delegate to base error handler
            return await super().handle_node_error(node_name, error, state)
```

---

## Performance Metrics

### Target Metrics (Mode 2)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Response Time (P50)** | 45-50s | End-to-end latency tracking |
| **Response Time (P95)** | 55-65s | Includes complex queries with tools |
| **Response Time (P99)** | 70-80s | Worst-case scenarios |
| **Master Agent Analysis** | <5s | Query analysis + expert scoring |
| **Expert Selection** | <8s | Scoring + ranking + reasoning |
| **Topic Shift Detection** | <3s | Per message after response |
| **RAG Retrieval** | <3s | Vector search + reranking |
| **Tool Execution** | <5s per tool | Individual tool timing |
| **LLM Generation** | <8s | Token generation latency |
| **Database Operations** | <1s | Query + insert operations |

### Mode 2 Specific Metrics

```python
class Mode2PerformanceMonitor(PerformanceMonitor):
    """Monitor Mode 2-specific performance metrics"""

    async def track_expert_selection_performance(
        self,
        state: Mode2State,
        start_time: float,
        end_time: float
    ):
        """Track expert selection metrics"""

        duration_ms = (end_time - start_time) * 1000

        # Log expert selection time
        expert_selection_duration_histogram.labels(
            tenant=state["tenant_id"],
            num_experts_evaluated=len(state["available_experts"]),
            selected_expert=state["selected_primary_expert_id"]
        ).observe(duration_ms)

        # Track selection confidence
        expert_selection_confidence_gauge.labels(
            expert_id=state["selected_primary_expert_id"]
        ).set(state["selection_confidence"])

    async def track_topic_shift_performance(
        self,
        state: Mode2State,
        is_shift: bool,
        duration_ms: float
    ):
        """Track topic shift detection metrics"""

        # Count topic shifts
        if is_shift:
            topic_shifts_counter.labels(
                from_expert=state["previous_expert_id"],
                to_expert=state["current_expert_id"]
            ).inc()

        # Log detection time
        topic_shift_detection_duration_histogram.labels(
            tenant=state["tenant_id"],
            shift_detected=is_shift
        ).observe(duration_ms)
```

### Comparison: Mode 1 vs Mode 2 Performance

| Phase | Mode 1 | Mode 2 | Difference |
|-------|--------|--------|------------|
| **Initialization** | 0-2s | 0s (no manual selection) | -2s |
| **Expert Selection** | Not needed | 3-9s | +9s |
| **Conversation** | 15-25s | 15-25s | Same |
| **Topic Shift Check** | Not done | 2-3s per message | +3s |
| **Total (First Message)** | 17-27s | 48-59s | +31s |
| **Total (Follow-Up)** | 15-25s | 40-53s | +25s |

---

## Conclusion

This detailed workflow visualization provides a comprehensive blueprint for implementing Ask Expert Mode 2 using LangGraph. Key differences from Mode 1:

1. **Master Agent (Level 1)**: Critical addition for AI-driven expert selection
2. **Expert Selection**: 8-12 second overhead for intelligent expert matching
3. **Dynamic Handoffs**: Topic shift detection enables expert switching
4. **Multi-Expert Support**: Infrastructure for up to 2 experts per query
5. **Response Time**: 45-60s (vs 30-45s in Mode 1) due to selection overhead

**Mode 2 Strengths**:
- Users don't need to know which expert to select
- Optimal expert matching via multi-factor scoring algorithm
- Dynamic adaptation to topic shifts
- Better for exploratory conversations

**Mode 2 Trade-offs**:
- Slightly longer response time (extra 15-20s for expert selection)
- More complex state management (expert transitions)
- Higher computational cost (master agent analysis)

---

**Next Steps**:
1. Implement master agent analysis and expert selection algorithms
2. Build expert scoring and ranking logic
3. Develop topic shift detection with NLP techniques
4. Create smooth expert handoff experiences
5. Deploy with comprehensive monitoring and A/B testing vs Mode 1

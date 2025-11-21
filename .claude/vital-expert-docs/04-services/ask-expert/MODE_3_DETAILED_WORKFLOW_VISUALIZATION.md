# Ask Expert Mode 3: Autonomous Manual - Detailed End-to-End Workflow Visualization

**Version**: 1.0
**Date**: November 21, 2025
**Purpose**: Comprehensive workflow visualization for translating to LangGraph implementation
**Mode**: Mode 3 - Autonomous Manual (User selects expert → Multi-step autonomous workflow with human checkpoints)

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

### What is Mode 3?

**Mode 3: Autonomous Manual** is a goal-driven AI workflow system where:
- **User explicitly selects** a specific expert agent
- **Multi-step autonomous execution** with the expert breaking down goals into tasks
- **Human-in-the-loop approval** at critical decision points
- **Single expert** executes complex workflows with tool usage
- **Artifact generation** - produces deliverables (documents, reports, analyses)
- **Response time**: 3-5 minutes per workflow (longer than conversation modes)

### Key Characteristics

| Aspect | Value |
|--------|-------|
| **Expert Selection** | Manual (User chooses) |
| **Interaction Type** | Autonomous (Goal-driven execution) |
| **Agent Count** | 1 Expert (with multiple sub-agents/workers) |
| **State Management** | Complex workflow state (goals, tasks, approvals) |
| **Execution Mode** | Multi-step autonomous (not conversational) |
| **Context Window** | Up to 200K tokens |
| **Unique Features** | Goal decomposition, task planning, human approvals, artifact generation |

### Differences from Mode 1 & Mode 2

| Feature | Mode 1 | Mode 2 | Mode 3 |
|---------|--------|--------|--------|
| **Expert Selection** | User manual | AI automatic | **User manual** |
| **Interaction Type** | Conversation | Conversation | **Autonomous workflow** |
| **User Input** | Question/message | Question/message | **Goal statement** |
| **Agent Behavior** | Guidance only | Guidance only | **Executes multi-step tasks** |
| **Tool Usage** | Limited | Limited | **Extensive (research, analysis, generation)** |
| **Human Approval** | Not needed | Not needed | **Required at checkpoints** |
| **Output Type** | Text response | Text response | **Artifacts + explanations** |
| **Response Time** | 30-45s | 45-60s | **3-5 minutes** |
| **Complexity** | Low | Medium | **High (workflow orchestration)** |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  MODE 3: HIGH-LEVEL ARCHITECTURE                        │
│              Autonomous Manual with Human-in-the-Loop                   │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────┐
│  1. USER       │  User selects expert from gallery
│  INPUT         │  Defines GOAL: "Create a Phase II clinical trial protocol"
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  2. API GATEWAY                                                        │
│  ✓ Authentication (JWT)                                                │
│  ✓ Tenant isolation (RLS)                                              │
│  ✓ Rate limiting (lower - longer workflows)                           │
│  ✓ Request validation                                                  │
│  ✓ Mode detection (mode_3_autonomous_manual)                          │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  3. LANGGRAPH ORCHESTRATOR (MODE 3 STATE MACHINE)                     │
│                                                                        │
│  START → load_agent → goal_decomposition → task_planning →            │
│          approval_checkpoint_1 → task_execution_loop →                │
│          artifact_generation → approval_checkpoint_2 →                │
│          finalization → END                                             │
│                                                                        │
│  Key Differences from Modes 1 & 2: AUTONOMOUS EXECUTION               │
│                                                                        │
│  Goal Decomposition Phase:                                             │
│  ├─ analyze_goal (Understand user's objective)                        │
│  ├─ decompose_into_tasks (Break into executable steps)                │
│  ├─ plan_workflow (Sequence tasks with dependencies)                  │
│  ├─ estimate_resources (Time, tools, data needed)                     │
│  └─ present_plan_for_approval (Human checkpoint 1)                    │
│                                                                        │
│  Task Execution Loop (Autonomous):                                    │
│  FOR EACH task in workflow_plan:                                       │
│    ├─ load_task_context                                                │
│    ├─ spawn_worker_agents (parallel execution if possible)            │
│    ├─ execute_tools (research, analysis, generation)                  │
│    ├─ synthesize_task_result                                           │
│    ├─ validate_task_output                                             │
│    ├─ update_workflow_state                                            │
│    └─ check_approval_needed? → YES: pause for human | NO: continue   │
│                                                                        │
│  Artifact Generation Phase:                                            │
│  ├─ compile_all_task_outputs                                           │
│  ├─ structure_final_artifact (document/report/analysis)               │
│  ├─ quality_check (completeness, accuracy, formatting)                │
│  ├─ generate_artifact_metadata (sources, methodology, limitations)    │
│  └─ present_for_final_approval (Human checkpoint 2)                   │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│  4. STREAMING RESPONSE + APPROVAL INTERFACE                           │
│  SSE (Server-Sent Events) + WebSocket for bidirectional communication│
│  ├─ Progress updates (task completion %, current step)                │
│  ├─ Thinking steps (reasoning for each task)                           │
│  ├─ Approval requests (workflow plan, intermediate results)           │
│  ├─ Tool execution logs (what's being researched/analyzed)            │
│  ├─ Artifact previews (incremental draft generation)                  │
│  └─ Metadata (cost, tokens, time elapsed, ETA)                        │
└───────┬────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────┐
│  5. FRONTEND   │  Display workflow progress with visual timeline
│  UPDATE        │  Show approval prompts for human decisions
└────────────────┘  Download final artifacts when complete
```

---

## Detailed Workflow Steps

### Phase 1: Initialization & Goal Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: INITIALIZATION & GOAL ANALYSIS                               │
│  Duration: ~5-10 seconds                                                │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1.1: User Selects Expert & Defines Goal
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Agent Gallery + Goal Input Component                   │
│                                                                    │
│  User sees:                                                        │
│  • Agent cards with "Start Autonomous Workflow" button            │
│  • Toggle: "Autonomous: ON, Automatic: OFF"                       │
│  • Goal input field (larger, multi-line)                           │
│  • Placeholder: "Describe what you want to accomplish..."         │
│                                                                    │
│  User actions:                                                     │
│  1. Selects "Clinical Trials Expert" agent card                   │
│  2. Types goal: "Create a comprehensive Phase II clinical trial   │
│     protocol for our cardiac monitoring device, including         │
│     endpoints, patient population, study design, and statistical  │
│     analysis plan."                                                │
│  3. Clicks "Start Workflow"                                        │
│                                                                    │
│  Result:                                                           │
│  → selected_agent_id = "clinical-trials-expert"                   │
│  → goal_statement = "Create a comprehensive Phase II..."          │
│  → session_id = UUID generated                                     │
│  → mode = "mode_3_autonomous_manual"                              │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.2: Create Workflow Session
┌────────────────────────────────────────────────────────────────────┐
│  Backend: POST /api/ask-expert/mode-3/workflows                   │
│                                                                    │
│  Request:                                                          │
│  {                                                                 │
│    "agent_id": "clinical-trials-expert",                          │
│    "user_id": "user-uuid",                                         │
│    "tenant_id": "tenant-uuid",                                     │
│    "mode": "mode_3_autonomous_manual",                            │
│    "goal_statement": "Create a comprehensive Phase II...",        │
│    "expected_artifacts": ["clinical_trial_protocol"],             │
│    "approval_required": true                                       │
│  }                                                                 │
│                                                                    │
│  Actions:                                                          │
│  1. Create workflow session record in database                     │
│  2. Initialize workflow state machine                              │
│  3. Load agent profile                                             │
│  4. Create approval checkpoints                                    │
│  5. Return workflow metadata                                       │
│                                                                    │
│  Response:                                                         │
│  {                                                                 │
│    "workflow_id": "workflow-uuid",                                 │
│    "session_id": "session-uuid",                                   │
│    "agent": {                                                      │
│      "id": "clinical-trials-expert",                              │
│      "name": "Dr. Emily Chen",                                     │
│      "display_name": "Clinical Trials Expert",                    │
│      "specialty": "Phase I-III trial design and execution"        │
│    },                                                              │
│    "workflow_status": "initializing",                             │
│    "estimated_duration_minutes": 4,                               │
│    "approval_checkpoints": 2                                       │
│  }                                                                 │
└────────────────────────────────────────────────────────────────────┘
        │
        ▼
STEP 1.3: Frontend Workflow View
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Workflow Execution View Component                      │
│                                                                    │
│  UI Layout:                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Dr. Emily Chen - Clinical Trials Expert                      │ │
│  │ Goal: Create Phase II clinical trial protocol               │ │
│  │                                                               │ │
│  │ Workflow Progress: [░░░░░░░░░░] 0% (Initializing)           │ │
│  │ Estimated Time: 4 minutes                                    │ │
│  │                                                               │ │
│  │ Current Step: Analyzing goal...                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  State Setup:                                                      │
│  • workflowStore.setWorkflow(workflowData)                        │
│  • workflowStore.setAgent(agentData)                              │
│  • Initialize WebSocket connection for approvals                  │
│  • Initialize SSE connection for progress updates                 │
│                                                                    │
│  Waiting for goal decomposition...                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Goal Decomposition & Task Planning

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: GOAL DECOMPOSITION & TASK PLANNING                          │
│  Duration: ~20-30 seconds                                               │
│  Purpose: Break down goal into executable tasks with dependencies      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 1: load_agent                                          │
│  Duration: ~2-3 seconds                                                 │
│  (Similar to Mode 1, but with autonomous capabilities)                 │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ workflow_id: "workflow-uuid"
├─ agent_id: "clinical-trials-expert"
├─ goal_statement: "Create a comprehensive Phase II..."
├─ tenant_id: "tenant-uuid"
├─ user_id: "user-uuid"
└─ mode: "mode_3_autonomous_manual"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Load Agent Profile (with autonomous capabilities)              │
│                                                                    │
│     Agent: Clinical Trials Expert                                  │
│     ├─ Name: "Dr. Emily Chen"                                      │
│     ├─ Specialty: "Phase I-III clinical trial design"            │
│     ├─ Autonomous Capabilities:                                    │
│     │   ├─ goal_decomposition: true                               │
│     │   ├─ task_planning: true                                     │
│     │   ├─ protocol_generation: true                              │
│     │   ├─ literature_research: true                              │
│     │   └─ statistical_analysis_planning: true                    │
│     │                                                              │
│     ├─ Available Tools (Extensive):                                │
│     │   ["literature_search", "clinical_trial_database",          │
│     │    "statistical_calculator", "protocol_generator",          │
│     │    "regulatory_checker", "patient_population_analyzer"]     │
│     │                                                              │
│     └─ Sub-Agent Pool (Level 3 + Level 4 Workers):                │
│         ├─ Protocol Writing Specialist                            │
│         ├─ Statistical Analysis Specialist                         │
│         ├─ Regulatory Compliance Specialist                        │
│         ├─ Literature Research Worker (parallel)                  │
│         ├─ Data Analysis Worker (parallel)                         │
│         └─ Document Generation Worker (parallel)                  │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ agent: {Clinical Trials Expert profile with autonomous capabilities}
├─ agent_persona: "You are Dr. Emily Chen..."
├─ sub_agent_pool: [6 specialists and workers]
├─ available_tools: [6 autonomous tools]
└─ workflow_step: "load_agent"

SSE Event:
data: {"type": "workflow_progress", "data": {"step": "load_agent", "progress": 0.05, "description": "Loading expert capabilities"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 2: analyze_goal                                        │
│  Duration: ~5-8 seconds                                                 │
│  Purpose: Deep analysis of user's goal to extract requirements         │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ goal_statement: "Create a comprehensive Phase II..."
├─ agent: {Clinical Trials Expert}
└─ workflow_id: "workflow-uuid"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Build Goal Analysis Prompt                                     │
│                                                                    │
│     prompt = f"""                                                  │
│     You are Dr. Emily Chen, a clinical trials expert tasked with  │
│     autonomous workflow execution.                                 │
│                                                                    │
│     ## User's Goal                                                 │
│     {goal_statement}                                               │
│                                                                    │
│     ## Analysis Task                                               │
│     Perform comprehensive goal analysis and return JSON:           │
│                                                                    │
│     {{                                                             │
│       "goal_analysis": {{                                          │
│         "primary_objective": "string",                             │
│         "scope": "string",                                         │
│         "complexity_level": "low/medium/high/very_high",          │
│         "estimated_time_minutes": number,                          │
│         "required_expertise": ["domain1", "domain2"],             │
│         "deliverables": ["deliverable1", "deliverable2"]          │
│       }},                                                          │
│       "requirements_extraction": {{                                │
│         "explicit_requirements": ["req1", "req2"],                │
│         "implicit_requirements": ["req3", "req4"],                │
│         "constraints": ["constraint1", "constraint2"],            │
│         "success_criteria": ["criterion1", "criterion2"]          │
│       }},                                                          │
│       "domain_knowledge_needed": {{                                │
│         "clinical_trial_design": 0.0-1.0,                         │
│         "regulatory_requirements": 0.0-1.0,                       │
│         "statistical_methods": 0.0-1.0,                           │
│         "medical_device_specifics": 0.0-1.0                       │
│       }},                                                          │
│       "feasibility_assessment": {{                                 │
│         "is_feasible": true/false,                                 │
│         "confidence": 0.0-1.0,                                     │
│         "potential_challenges": ["challenge1", "challenge2"],     │
│         "mitigation_strategies": ["strategy1", "strategy2"]       │
│       }}                                                           │
│     }}                                                             │
│     """                                                            │
│                                                                    │
│  2. LLM Goal Analysis Call                                         │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.2 (focused analysis)                            │
│     Max tokens: 2000                                               │
│                                                                    │
│     Analysis Result:                                               │
│     {                                                              │
│       "goal_analysis": {                                           │
│         "primary_objective": "Design and document a complete      │
│                               Phase II clinical trial protocol    │
│                               for a cardiac monitoring device",   │
│         "scope": "Comprehensive protocol including study design,  │
│                   patient population, endpoints, statistical      │
│                   analysis plan, and regulatory compliance",      │
│         "complexity_level": "high",                               │
│         "estimated_time_minutes": 4.5,                            │
│         "required_expertise": [                                    │
│           "Clinical Trial Design",                                │
│           "Medical Device Trials",                                │
│           "Statistical Analysis",                                 │
│           "Regulatory Affairs (FDA/EU)"                           │
│         ],                                                         │
│         "deliverables": [                                          │
│           "Clinical Trial Protocol Document (ICH E6 compliant)",  │
│           "Statistical Analysis Plan",                            │
│           "Patient Recruitment Strategy",                         │
│           "Regulatory Checklist"                                  │
│         ]                                                          │
│       },                                                           │
│       "requirements_extraction": {                                 │
│         "explicit_requirements": [                                 │
│           "Phase II trial (efficacy focus)",                      │
│           "Cardiac monitoring device (Class II)",                 │
│           "Study endpoints defined",                              │
│           "Patient population specified",                         │
│           "Study design documented",                              │
│           "Statistical analysis plan included"                    │
│         ],                                                         │
│         "implicit_requirements": [                                 │
│           "ICH-GCP compliance",                                   │
│           "FDA guidance adherence",                               │
│           "Sample size calculation",                              │
│           "Randomization methodology",                            │
│           "Blinding strategy (if applicable)",                    │
│           "Adverse event monitoring plan",                        │
│           "Data monitoring committee setup"                       │
│         ],                                                         │
│         "constraints": [                                           │
│           "Must align with FDA 510(k) pathway",                   │
│           "Device-specific endpoints required",                   │
│           "Budget considerations for trial size",                 │
│           "Timeline constraints for regulatory submission"        │
│         ],                                                         │
│         "success_criteria": [                                      │
│           "Protocol is ICH E6 compliant",                         │
│           "All required sections included",                       │
│           "Statistically sound design",                           │
│           "Regulatory requirements addressed",                    │
│           "Feasible patient recruitment plan"                     │
│         ]                                                          │
│       },                                                           │
│       "domain_knowledge_needed": {                                 │
│         "clinical_trial_design": 0.95,                            │
│         "regulatory_requirements": 0.85,                          │
│         "statistical_methods": 0.90,                              │
│         "medical_device_specifics": 0.75                          │
│       },                                                           │
│       "feasibility_assessment": {                                  │
│         "is_feasible": true,                                       │
│         "confidence": 0.88,                                        │
│         "potential_challenges": [                                  │
│           "Defining appropriate device-specific endpoints",       │
│           "Determining optimal sample size with power analysis",  │
│           "Balancing scientific rigor with practical constraints"│
│         ],                                                         │
│         "mitigation_strategies": [                                 │
│           "Research FDA guidance on cardiac monitoring devices",  │
│           "Use established statistical methods for device trials",│
│           "Consult regulatory databases for precedent protocols"  │
│         ]                                                          │
│       }                                                            │
│     }                                                              │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ goal_analysis: {Comprehensive analysis object}
├─ requirements: {Explicit and implicit requirements}
├─ domain_knowledge_needed: {Domain relevance scores}
├─ feasibility: {Feasibility assessment}
└─ workflow_step: "analyze_goal"

SSE Event:
data: {"type": "workflow_progress", "data": {"step": "analyze_goal", "progress": 0.15, "description": "Analyzing goal: Phase II trial protocol creation"}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 3: decompose_into_tasks                                │
│  Duration: ~8-12 seconds                                                │
│  Purpose: Break goal into discrete, executable tasks                   │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ goal_analysis: {Analysis results}
├─ requirements: {Requirements list}
├─ agent: {Clinical Trials Expert}
└─ goal_statement: "Create a comprehensive Phase II..."

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Build Task Decomposition Prompt                                │
│                                                                    │
│     prompt = f"""                                                  │
│     Based on the goal analysis, decompose this goal into a        │
│     sequence of executable tasks. Each task should be:            │
│     • Specific and actionable                                      │
│     • Achievable within 20-60 seconds                             │
│     • Have clear inputs and outputs                               │
│     • Specify required tools/sub-agents                           │
│                                                                    │
│     Return JSON with tasks array:                                  │
│     {{                                                             │
│       "tasks": [                                                   │
│         {{                                                         │
│           "task_id": "task_1",                                     │
│           "task_name": "string",                                   │
│           "description": "string",                                 │
│           "inputs_required": ["input1", "input2"],                │
│           "outputs_produced": ["output1", "output2"],             │
│           "tools_needed": ["tool1", "tool2"],                     │
│           "sub_agents_needed": ["agent1"],                        │
│           "estimated_duration_seconds": number,                    │
│           "dependencies": ["task_id1", "task_id2"],              │
│           "can_parallelize": true/false,                          │
│           "requires_human_approval": true/false,                  │
│           "approval_prompt": "string (if requires approval)"      │
│         }}                                                         │
│       ],                                                           │
│       "total_estimated_duration_minutes": number,                  │
│       "critical_path": ["task_1", "task_3", "task_7"]            │
│     }}                                                             │
│     """                                                            │
│                                                                    │
│  2. LLM Task Decomposition Call                                    │
│     Model: gpt-4-turbo-preview                                     │
│     Temperature: 0.3                                               │
│     Max tokens: 3000                                               │
│                                                                    │
│     Decomposition Result:                                          │
│     {                                                              │
│       "tasks": [                                                   │
│         {                                                          │
│           "task_id": "task_1",                                     │
│           "task_name": "Literature Review - Phase II Device       │
│                         Trials",                                   │
│           "description": "Search clinical trial databases and     │
│                           literature for similar Phase II cardiac │
│                           device trials to identify best practices│
│                           and design precedents",                 │
│           "inputs_required": [                                     │
│             "Device type (cardiac monitor)",                      │
│             "Trial phase (Phase II)",                             │
│             "FDA guidance documents"                              │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "List of 5-10 precedent trials",                      │
│             "Common endpoint definitions",                        │
│             "Typical sample sizes",                               │
│             "Study design patterns"                               │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "literature_search",                                   │
│             "clinical_trial_database"                             │
│           ],                                                       │
│           "sub_agents_needed": [                                   │
│             "literature_research_worker"                          │
│           ],                                                       │
│           "estimated_duration_seconds": 30,                        │
│           "dependencies": [],                                      │
│           "can_parallelize": false,  # Must be first              │
│           "requires_human_approval": false,                        │
│           "approval_prompt": null                                  │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_2",                                     │
│           "task_name": "Define Primary and Secondary Endpoints",  │
│           "description": "Based on literature review and device   │
│                           characteristics, define appropriate     │
│                           primary and secondary endpoints for     │
│                           efficacy assessment",                   │
│           "inputs_required": [                                     │
│             "Literature review results (task_1)",                 │
│             "Device specifications",                              │
│             "FDA guidance on endpoints"                           │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Primary endpoint definition",                        │
│             "3-5 secondary endpoints",                            │
│             "Endpoint measurement methodology",                   │
│             "Success criteria for each endpoint"                  │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "regulatory_checker"                                   │
│           ],                                                       │
│           "sub_agents_needed": [                                   │
│             "regulatory_compliance_specialist"                    │
│           ],                                                       │
│           "estimated_duration_seconds": 40,                        │
│           "dependencies": ["task_1"],                             │
│           "can_parallelize": false,                               │
│           "requires_human_approval": true,                         │
│           "approval_prompt": "Please review the proposed          │
│                               endpoints. Do they align with your  │
│                               device's intended use and regulatory│
│                               pathway?"                           │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_3",                                     │
│           "task_name": "Define Patient Population & Inclusion/    │
│                         Exclusion Criteria",                      │
│           "description": "Specify target patient population,      │
│                           inclusion criteria, exclusion criteria, │
│                           and stratification factors",            │
│           "inputs_required": [                                     │
│             "Device indications for use",                         │
│             "Literature review (task_1)",                         │
│             "Endpoint definitions (task_2)"                       │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Patient population description",                     │
│             "Inclusion criteria (8-12 criteria)",                 │
│             "Exclusion criteria (8-12 criteria)",                 │
│             "Stratification factors"                              │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "patient_population_analyzer"                         │
│           ],                                                       │
│           "sub_agents_needed": [],                                │
│           "estimated_duration_seconds": 35,                        │
│           "dependencies": ["task_1", "task_2"],                   │
│           "can_parallelize": false,                               │
│           "requires_human_approval": false,                        │
│           "approval_prompt": null                                  │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_4",                                     │
│           "task_name": "Statistical Analysis Plan - Sample Size", │
│           "description": "Calculate required sample size based on │
│                           primary endpoint, expected effect size, │
│                           power, and significance level",         │
│           "inputs_required": [                                     │
│             "Primary endpoint (task_2)",                          │
│             "Effect size assumptions",                            │
│             "Power requirement (typically 80-90%)",               │
│             "Significance level (typically 0.05)"                 │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Sample size calculation",                            │
│             "Power analysis results",                             │
│             "Dropout rate assumptions",                           │
│             "Final enrollment target"                             │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "statistical_calculator"                              │
│           ],                                                       │
│           "sub_agents_needed": [                                   │
│             "statistical_analysis_specialist"                     │
│           ],                                                       │
│           "estimated_duration_seconds": 45,                        │
│           "dependencies": ["task_2"],                             │
│           "can_parallelize": false,                               │
│           "requires_human_approval": false,                        │
│           "approval_prompt": null                                  │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_5",                                     │
│           "task_name": "Study Design & Randomization",            │
│           "description": "Define study design (RCT, single-arm,   │
│                           etc.), randomization strategy, blinding,│
│                           and group allocation",                  │
│           "inputs_required": [                                     │
│             "Regulatory requirements",                            │
│             "Sample size (task_4)",                               │
│             "Endpoints (task_2)"                                  │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Study design type",                                   │
│             "Randomization methodology",                          │
│             "Blinding strategy",                                  │
│             "Group allocation ratios",                            │
│             "Stratification approach"                             │
│           ],                                                       │
│           "tools_needed": [],                                      │
│           "sub_agents_needed": [],                                │
│           "estimated_duration_seconds": 30,                        │
│           "dependencies": ["task_2", "task_4"],                   │
│           "can_parallelize": false,                               │
│           "requires_human_approval": false,                        │
│           "approval_prompt": null                                  │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_6",                                     │
│           "task_name": "Safety Monitoring & Adverse Event Plan",  │
│           "description": "Define adverse event monitoring,        │
│                           reporting procedures, stopping rules,   │
│                           and data safety monitoring board setup",│
│           "inputs_required": [                                     │
│             "Device risk classification",                         │
│             "Regulatory requirements",                            │
│             "Study duration"                                      │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Adverse event definitions",                          │
│             "Reporting timeline and procedures",                  │
│             "Stopping rules for safety",                          │
│             "DSMB charter outline"                                │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "regulatory_checker"                                   │
│           ],                                                       │
│           "sub_agents_needed": [],                                │
│           "estimated_duration_seconds": 35,                        │
│           "dependencies": [],                                      │
│           "can_parallelize": true,  # Can run parallel with task_1│
│           "requires_human_approval": false,                        │
│           "approval_prompt": null                                  │
│         },                                                         │
│                                                                    │
│         {                                                          │
│           "task_id": "task_7",                                     │
│           "task_name": "Protocol Document Generation",            │
│           "description": "Compile all task outputs into a         │
│                           comprehensive, ICH E6-compliant clinical│
│                           trial protocol document",               │
│           "inputs_required": [                                     │
│             "All task outputs (tasks 1-6)"                        │
│           ],                                                       │
│           "outputs_produced": [                                    │
│             "Clinical Trial Protocol PDF (40-60 pages)",          │
│             "Protocol synopsis (2-3 pages)",                      │
│             "Document metadata"                                   │
│           ],                                                       │
│           "tools_needed": [                                        │
│             "protocol_generator"                                   │
│           ],                                                       │
│           "sub_agents_needed": [                                   │
│             "protocol_writing_specialist",                        │
│             "document_generation_worker"                          │
│           ],                                                       │
│           "estimated_duration_seconds": 60,                        │
│           "dependencies": ["task_1", "task_2", "task_3",         │
│                            "task_4", "task_5", "task_6"],        │
│           "can_parallelize": false,  # Must be last               │
│           "requires_human_approval": true,                         │
│           "approval_prompt": "Please review the complete protocol │
│                               document. Does it meet your         │
│                               requirements? Any revisions needed?"│
│         }                                                          │
│       ],                                                           │
│                                                                    │
│       "total_estimated_duration_minutes": 4.25,                    │
│       "critical_path": ["task_1", "task_2", "task_3",            │
│                         "task_4", "task_5", "task_7"]            │
│     }                                                              │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ workflow_tasks: [7 task objects]
├─ task_dependencies: {Dependency graph}
├─ approval_checkpoints: [task_2, task_7]
├─ estimated_duration_minutes: 4.25
├─ critical_path: ["task_1", "task_2", ...]
└─ workflow_step: "decompose_into_tasks"

SSE Event:
data: {"type": "workflow_progress", "data": {
  "step": "decompose_into_tasks",
  "progress": 0.25,
  "description": "Created 7-step workflow plan",
  "tasks_count": 7,
  "approval_checkpoints": 2,
  "estimated_duration": "4.25 minutes"
}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 4: approval_checkpoint_1 (Workflow Plan Approval)      │
│  Duration: HUMAN-DEPENDENT (pauses workflow until user approves)       │
│  Purpose: Get human approval before starting task execution            │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ workflow_tasks: [7 tasks]
├─ goal_analysis: {Analysis}
├─ estimated_duration_minutes: 4.25
└─ approval_checkpoints: [task_2, task_7]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Generate Approval Request                                      │
│                                                                    │
│     approval_request = {                                           │
│       "checkpoint_id": "checkpoint_1",                             │
│       "checkpoint_type": "workflow_plan_approval",                │
│       "title": "Review Workflow Plan",                            │
│       "description": "Please review the proposed workflow plan    │
│                       before I begin execution.",                 │
│       "workflow_summary": {                                        │
│         "total_tasks": 7,                                          │
│         "estimated_duration": "4.25 minutes",                     │
│         "approval_checkpoints": 2,                                │
│         "task_sequence": [                                         │
│           "1. Literature Review (30s)",                           │
│           "2. Define Endpoints (40s) [APPROVAL REQUIRED]",        │
│           "3. Define Patient Population (35s)",                   │
│           "4. Sample Size Calculation (45s)",                     │
│           "5. Study Design (30s)",                                │
│           "6. Safety Monitoring Plan (35s)",                      │
│           "7. Generate Protocol Document (60s) [APPROVAL REQUIRED]"│
│         ],                                                         │
│         "deliverables": [                                          │
│           "Clinical Trial Protocol PDF (ICH E6 compliant)",       │
│           "Protocol Synopsis",                                    │
│           "Statistical Analysis Plan"                             │
│         ]                                                          │
│       },                                                           │
│       "approval_options": [                                        │
│         {"label": "Approve & Start", "value": "approve"},         │
│         {"label": "Request Changes", "value": "modify"},          │
│         {"label": "Cancel Workflow", "value": "cancel"}           │
│       ],                                                           │
│       "modification_prompt": "What changes would you like?"       │
│     }                                                              │
│                                                                    │
│  2. Send Approval Request via WebSocket                            │
│     ws.send(JSON.stringify({                                       │
│       type: "approval_request",                                    │
│       data: approval_request                                       │
│     }))                                                            │
│                                                                    │
│  3. PAUSE WORKFLOW - Wait for User Response                        │
│     • Update workflow status: "awaiting_approval"                 │
│     • Store current state in checkpoint                            │
│     • Display approval UI in frontend                              │
│     • Wait for user action...                                      │
│                                                                    │
│  4. Receive User Approval (example)                                │
│     user_response = {                                              │
│       "checkpoint_id": "checkpoint_1",                             │
│       "decision": "approve",                                       │
│       "comments": "Looks good, proceed with the workflow.",       │
│       "timestamp": "2025-11-21T10:30:45Z"                         │
│     }                                                              │
│                                                                    │
│  5. Resume Workflow                                                │
│     • Update workflow status: "executing"                         │
│     • Log approval decision                                        │
│     • Continue to next node (task_execution_loop)                 │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ workflow_approved: true
├─ approval_1_decision: "approve"
├─ approval_1_comments: "Looks good, proceed..."
├─ approval_1_timestamp: "2025-11-21T10:30:45Z"
└─ workflow_step: "approval_checkpoint_1"

WebSocket Events:
ws: {"type": "approval_request", "data": {...approval_request...}}
(User responds via WebSocket)
ws: {"type": "approval_received", "data": {...user_response...}}

SSE Event:
data: {"type": "workflow_paused", "data": {"reason": "Awaiting user approval for workflow plan"}}
(After approval)
data: {"type": "workflow_resumed", "data": {"decision": "approved", "progress": 0.30}}
```

---

### Phase 3: Autonomous Task Execution Loop

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: AUTONOMOUS TASK EXECUTION LOOP                               │
│  Duration: ~2.5-3.5 minutes (varies by tasks)                          │
│  Purpose: Execute each task autonomously with sub-agents and tools     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 5: task_execution_loop                                 │
│  Duration: ~150-200 seconds total (all tasks)                          │
│  Purpose: FOR EACH task, execute autonomously and collect results      │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ workflow_tasks: [7 tasks]
├─ task_dependencies: {Dependency graph}
├─ workflow_approved: true
└─ current_task_index: 0

Node Actions (FOR EACH TASK):
┌────────────────────────────────────────────────────────────────────┐
│  TASK 1 EXECUTION: Literature Review                               │
│  Duration: ~30 seconds                                              │
│                                                                    │
│  1. Load Task Context                                              │
│     task = workflow_tasks[0]                                       │
│     task_name: "Literature Review - Phase II Device Trials"       │
│                                                                    │
│  2. Check Dependencies (none for task 1)                           │
│     All dependencies satisfied: ✓                                  │
│                                                                    │
│  3. Spawn Worker Agent                                             │
│     Spawn: literature_research_worker                              │
│     Task assignment: "Search for 5-10 precedent Phase II cardiac  │
│                       device trials"                               │
│                                                                    │
│  4. Execute Tools                                                  │
│     A. Tool: literature_search                                     │
│        Input: {                                                    │
│          "query": "Phase II clinical trial cardiac monitoring     │
│                    device FDA",                                    │
│          "databases": ["PubMed", "ClinicalTrials.gov"],          │
│          "max_results": 10,                                        │
│          "date_range": "2018-2025"                                │
│        }                                                           │
│        Execution: ~15 seconds                                      │
│        Output: [10 relevant publications/trials]                   │
│                                                                    │
│     B. Tool: clinical_trial_database                               │
│        Input: {                                                    │
│          "device_type": "cardiac monitor",                        │
│          "trial_phase": "Phase II",                               │
│          "status": "completed",                                    │
│          "max_results": 5                                          │
│        }                                                           │
│        Execution: ~10 seconds                                      │
│        Output: [5 completed trials with protocols]                │
│                                                                    │
│  5. Worker Agent Synthesis                                         │
│     literature_research_worker analyzes results and produces:      │
│     {                                                              │
│       "precedent_trials": [                                        │
│         {                                                          │
│           "nct_id": "NCT03456789",                                │
│           "title": "Cardiac Monitor XYZ - Phase II",              │
│           "sample_size": 150,                                      │
│           "primary_endpoint": "Detection accuracy vs Holter",     │
│           "study_design": "Randomized, open-label",               │
│           "duration": "6 months"                                  │
│         },                                                         │
│         ... (9 more trials)                                        │
│       ],                                                           │
│       "common_endpoints": [                                        │
│         "Device accuracy/sensitivity/specificity",                │
│         "Time to arrhythmia detection",                           │
│         "Patient comfort/compliance",                             │
│         "Adverse events"                                          │
│       ],                                                           │
│       "typical_sample_sizes": "100-200 patients",                 │
│       "common_study_designs": "Randomized controlled, parallel"   │
│     }                                                              │
│                                                                    │
│  6. Validate Task Output                                           │
│     ✓ All required outputs present                                 │
│     ✓ Quality check passed                                         │
│                                                                    │
│  7. Store Task Result                                              │
│     task_results["task_1"] = {literature_review_results}           │
│                                                                    │
│  8. Update Progress                                                │
│     tasks_completed: 1/7 (14.3%)                                   │
└────────────────────────────────────────────────────────────────────┘

SSE Events:
data: {"type": "task_started", "data": {"task_id": "task_1", "task_name": "Literature Review", "progress": 0.30}}
data: {"type": "tool_execution", "data": {"tool": "literature_search", "status": "running"}}
data: {"type": "tool_complete", "data": {"tool": "literature_search", "results_count": 10}}
data: {"type": "task_complete", "data": {"task_id": "task_1", "duration": 30, "progress": 0.44, "outputs": {...}}}

┌────────────────────────────────────────────────────────────────────┐
│  TASK 2 EXECUTION: Define Primary and Secondary Endpoints          │
│  Duration: ~40 seconds                                              │
│  ** REQUIRES HUMAN APPROVAL **                                      │
│                                                                    │
│  1. Load Task Context                                              │
│     task = workflow_tasks[1]                                       │
│     Dependencies: ["task_1"] → ✓ satisfied                        │
│                                                                    │
│  2. Spawn Sub-Agent                                                │
│     Spawn: regulatory_compliance_specialist                        │
│                                                                    │
│  3. Execute Tools & Analysis                                       │
│     A. Use literature review results (from task_1)                 │
│     B. Use regulatory_checker tool to validate FDA guidance       │
│     C. Sub-agent proposes endpoints:                               │
│        {                                                           │
│          "primary_endpoint": {                                     │
│            "name": "Arrhythmia Detection Accuracy",               │
│            "definition": "Sensitivity and specificity of device   │
│                          vs gold standard Holter monitoring",     │
│            "measurement": "Per-patient basis over 72-hour period",│
│            "success_criterion": "Non-inferiority: lower bound of  │
│                                  95% CI > 85%"                    │
│          },                                                        │
│          "secondary_endpoints": [                                  │
│            {                                                       │
│              "name": "Time to Arrhythmia Detection",              │
│              "definition": "Time from arrhythmia onset to device  │
│                            alert",                                │
│              "measurement": "Minutes (mean and median)",          │
│              "success_criterion": "< 5 minutes (median)"          │
│            },                                                      │
│            {                                                       │
│              "name": "Patient Comfort and Compliance",            │
│              "definition": "Patient-reported comfort score and    │
│                            device wear time",                     │
│              "measurement": "VAS score (0-100) and % time worn", │
│              "success_criterion": "VAS > 70, wear time > 90%"    │
│            },                                                      │
│            {                                                       │
│              "name": "Adverse Events",                            │
│              "definition": "Device-related adverse events",       │
│              "measurement": "Incidence rate per patient-month",   │
│              "success_criterion": "< 5% serious AE rate"         │
│            }                                                       │
│          ],                                                        │
│          "fda_guidance_citations": [                               │
│            "Guidance on Clinical Performance Assessment (2020)",  │
│            "21 CFR 807.87(k) - Substantial Equivalence"          │
│          ]                                                         │
│        }                                                           │
│                                                                    │
│  4. APPROVAL CHECKPOINT - Pause for Human Review                   │
│     approval_request = {                                           │
│       "checkpoint_id": "checkpoint_2",                             │
│       "checkpoint_type": "task_output_approval",                  │
│       "title": "Review Proposed Endpoints",                       │
│       "description": "Please review the proposed primary and      │
│                       secondary endpoints",                       │
│       "proposed_outputs": {endpoints_object},                     │
│       "approval_prompt": "Do these endpoints align with your      │
│                          device's intended use and regulatory     │
│                          pathway?",                               │
│       "approval_options": [                                        │
│         {"label": "Approve", "value": "approve"},                 │
│         {"label": "Request Revisions", "value": "revise"},        │
│         {"label": "Reject", "value": "reject"}                    │
│       ]                                                            │
│     }                                                              │
│                                                                    │
│     PAUSE WORKFLOW - Wait for user response...                     │
│                                                                    │
│  5. User Approves (example)                                        │
│     user_response = {                                              │
│       "checkpoint_id": "checkpoint_2",                             │
│       "decision": "approve",                                       │
│       "comments": "Endpoints look appropriate.",                  │
│       "timestamp": "2025-11-21T10:32:15Z"                         │
│     }                                                              │
│                                                                    │
│  6. Store Task Result                                              │
│     task_results["task_2"] = {endpoints_object}                    │
│     tasks_completed: 2/7 (28.6%)                                   │
└────────────────────────────────────────────────────────────────────┘

SSE/WebSocket Events:
data: {"type": "task_started", "data": {"task_id": "task_2", "progress": 0.44}}
data: {"type": "task_paused", "data": {"reason": "Awaiting approval for endpoints"}}
ws: {"type": "approval_request", "data": {...approval_request...}}
(User approves)
ws: {"type": "approval_received", "data": {...user_response...}}
data: {"type": "task_resumed", "data": {"task_id": "task_2"}}
data: {"type": "task_complete", "data": {"task_id": "task_2", "progress": 0.58}}

┌────────────────────────────────────────────────────────────────────┐
│  TASKS 3-6 EXECUTION: Autonomous execution continues...            │
│                                                                    │
│  • Task 3: Define Patient Population (35s) → No approval needed   │
│  • Task 4: Sample Size Calculation (45s) → No approval needed     │
│  • Task 5: Study Design (30s) → No approval needed                │
│  • Task 6: Safety Monitoring Plan (35s) → Parallel with task 1   │
│                                                                    │
│  [Similar structure to Task 1 - spawn agents, execute tools,      │
│   validate outputs, store results, update progress]               │
│                                                                    │
│  Total duration for tasks 3-6: ~145 seconds (parallelization)     │
│  Progress after tasks 1-6: 85.7% (6/7 complete)                   │
└────────────────────────────────────────────────────────────────────┘

Output State (after task execution loop):
├─ task_results: {
│     "task_1": {literature_review_results},
│     "task_2": {endpoints_object},
│     "task_3": {patient_population_object},
│     "task_4": {sample_size_calculation},
│     "task_5": {study_design_object},
│     "task_6": {safety_monitoring_plan}
│   }
├─ tasks_completed: 6/7
├─ workflow_progress: 0.857
└─ workflow_step: "task_execution_loop"
```

---

### Phase 4: Artifact Generation & Final Approval

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: ARTIFACT GENERATION & FINAL APPROVAL                         │
│  Duration: ~60-90 seconds                                               │
│  Purpose: Compile all task results into final deliverable artifacts    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 6: artifact_generation (Task 7 Execution)              │
│  Duration: ~60 seconds                                                  │
│  Purpose: Generate final clinical trial protocol document              │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ task_results: {All 6 task outputs}
├─ goal_statement: "Create a comprehensive Phase II..."
├─ agent: {Clinical Trials Expert}
└─ workflow_tasks: [Task 7 definition]

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Spawn Document Generation Agents                                │
│     ├─ protocol_writing_specialist (Level 3)                       │
│     └─ document_generation_worker (Level 4)                        │
│                                                                    │
│  2. Execute protocol_generator Tool                                │
│     Input: {                                                       │
│       "document_type": "clinical_trial_protocol",                  │
│       "standard": "ICH E6 GCP",                                    │
│       "sections": {                                                │
│         "title": "Phase II Clinical Trial - Cardiac Monitor XYZ",  │
│         "synopsis": {task_2_outputs + task_3_outputs summary},     │
│         "introduction": {literature_review_summary},               │
│         "objectives": {endpoints from task_2},                     │
│         "study_design": {task_5_outputs},                          │
│         "patient_population": {task_3_outputs},                    │
│         "sample_size": {task_4_outputs},                           │
│         "endpoints": {task_2_outputs_detailed},                    │
│         "statistical_analysis": {task_4_outputs_detailed},         │
│         "safety_monitoring": {task_6_outputs},                     │
│         "adverse_events": {task_6_outputs_ae_section},             │
│         "data_management": {auto_generated},                       │
│         "quality_control": {auto_generated},                       │
│         "ethical_considerations": {auto_generated},                │
│         "references": {all_citations_from_tasks}                   │
│       },                                                           │
│       "formatting": {                                              │
│         "page_size": "A4",                                         │
│         "font": "Times New Roman 12pt",                            │
│         "line_spacing": 1.5,                                       │
│         "include_toc": true,                                       │
│         "include_appendices": true                                 │
│       }                                                            │
│     }                                                              │
│                                                                    │
│     Tool Execution: ~45 seconds                                    │
│     • Parse all task results                                       │
│     • Structure into ICH E6 sections                               │
│     • Generate cohesive narrative                                  │
│     • Format as professional document                              │
│     • Create appendices (consent form template, CRFs, etc.)       │
│     • Generate table of contents                                   │
│     • Add page numbers and headers                                 │
│                                                                    │
│     Output: {                                                      │
│       "protocol_document": {                                       │
│         "file_path": "/tmp/protocol_v1.pdf",                      │
│         "file_size_mb": 2.4,                                       │
│         "page_count": 52,                                          │
│         "sections": [                                              │
│           {"name": "Title Page", "page": 1},                      │
│           {"name": "Synopsis", "page": 2},                        │
│           {"name": "Table of Contents", "page": 4},               │
│           {"name": "1. Introduction", "page": 6},                 │
│           {"name": "2. Objectives", "page": 10},                  │
│           {"name": "3. Study Design", "page": 12},                │
│           {"name": "4. Patient Population", "page": 18},          │
│           {"name": "5. Study Procedures", "page": 24},            │
│           {"name": "6. Endpoints", "page": 30},                   │
│           {"name": "7. Statistical Analysis", "page": 35},        │
│           {"name": "8. Safety Monitoring", "page": 40},           │
│           {"name": "9. Data Management", "page": 44},             │
│           {"name": "10. Ethical Considerations", "page": 47},     │
│           {"name": "11. References", "page": 50},                 │
│           {"name": "Appendix A: Consent Form", "page": 53}        │
│         ],                                                         │
│         "metadata": {                                              │
│           "version": "1.0",                                        │
│           "created_by": "Clinical Trials Expert AI",              │
│           "creation_date": "2025-11-21",                          │
│           "ich_e6_compliant": true,                               │
│           "word_count": 15_240                                     │
│         }                                                          │
│       },                                                           │
│       "protocol_synopsis": {                                       │
│         "file_path": "/tmp/synopsis_v1.pdf",                      │
│         "file_size_mb": 0.2,                                       │
│         "page_count": 3                                            │
│       }                                                            │
│     }                                                              │
│                                                                    │
│  3. Quality Check                                                  │
│     Automated validation:                                          │
│     ✓ All required ICH E6 sections present                         │
│     ✓ Cross-references consistent                                  │
│     ✓ No missing data or placeholders                              │
│     ✓ References formatted correctly                               │
│     ✓ Appendices included                                          │
│     ✓ Page numbers sequential                                      │
│                                                                    │
│     Quality Score: 95/100                                          │
│                                                                    │
│  4. Generate Artifact Metadata                                     │
│     metadata = {                                                   │
│       "artifact_type": "clinical_trial_protocol",                  │
│       "generated_at": "2025-11-21T10:35:42Z",                     │
│       "generated_by": {                                            │
│         "agent": "Clinical Trials Expert",                        │
│         "workflow_id": "workflow-uuid"                            │
│       },                                                           │
│       "sources": [                                                 │
│         "PubMed literature search (10 publications)",             │
│         "ClinicalTrials.gov database (5 trials)",                 │
│         "FDA guidance documents (4 documents)",                   │
│         "ISO standards (2 standards)"                             │
│       ],                                                           │
│       "methodology": "AI-assisted protocol generation with        │
│                       expert review at 2 checkpoints",            │
│       "limitations": [                                             │
│         "Sample size assumes moderate effect size",               │
│         "Patient recruitment timeline not included",              │
│         "Budget considerations not addressed"                     │
│       ],                                                           │
│       "revision_history": []                                       │
│     }                                                              │
│                                                                    │
│  5. Store Artifacts                                                │
│     • Upload protocol PDF to S3/storage                            │
│     • Upload synopsis PDF to S3/storage                            │
│     • Save metadata to database                                    │
│     • Create artifact download links                               │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ artifacts: [
│     {"type": "protocol", "url": "https://...", "size_mb": 2.4},
│     {"type": "synopsis", "url": "https://...", "size_mb": 0.2}
│   ]
├─ artifact_metadata: {metadata_object}
├─ quality_score: 95
├─ tasks_completed: 7/7
└─ workflow_step: "artifact_generation"

SSE Events:
data: {"type": "task_started", "data": {"task_id": "task_7", "task_name": "Protocol Document Generation", "progress": 0.857}}
data: {"type": "tool_execution", "data": {"tool": "protocol_generator", "status": "running"}}
data: {"type": "artifact_preview", "data": {"section": "Synopsis", "content": "..."}}
data: {"type": "artifact_generated", "data": {"type": "protocol", "page_count": 52, "quality_score": 95}}
data: {"type": "task_complete", "data": {"task_id": "task_7", "progress": 0.95}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 7: approval_checkpoint_2 (Final Artifact Approval)     │
│  Duration: HUMAN-DEPENDENT                                              │
│  Purpose: Get human approval on final protocol before finalization     │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ artifacts: [protocol PDF, synopsis PDF]
├─ artifact_metadata: {metadata}
└─ quality_score: 95

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Generate Final Approval Request                                │
│                                                                    │
│     approval_request = {                                           │
│       "checkpoint_id": "checkpoint_3",                             │
│       "checkpoint_type": "final_artifact_approval",               │
│       "title": "Review Final Clinical Trial Protocol",            │
│       "description": "Your comprehensive Phase II clinical trial  │
│                       protocol is ready for review.",             │
│       "artifacts": [                                               │
│         {                                                          │
│           "type": "Clinical Trial Protocol",                      │
│           "filename": "Phase_II_Protocol_v1.pdf",                 │
│           "size_mb": 2.4,                                          │
│           "pages": 52,                                             │
│           "preview_url": "https://...",                           │
│           "download_url": "https://..."                           │
│         },                                                         │
│         {                                                          │
│           "type": "Protocol Synopsis",                            │
│           "filename": "Protocol_Synopsis_v1.pdf",                 │
│           "size_mb": 0.2,                                          │
│           "pages": 3,                                              │
│           "preview_url": "https://...",                           │
│           "download_url": "https://..."                           │
│         }                                                          │
│       ],                                                           │
│       "summary": {                                                 │
│         "tasks_completed": 7,                                      │
│         "duration_minutes": 4.2,                                   │
│         "tools_used": 6,                                           │
│         "sources_consulted": 21,                                   │
│         "quality_score": 95                                        │
│       },                                                           │
│       "approval_prompt": "Please review the complete protocol.    │
│                          Does it meet your requirements? Any      │
│                          revisions needed?",                      │
│       "approval_options": [                                        │
│         {"label": "Accept & Finalize", "value": "accept"},        │
│         {"label": "Request Revisions", "value": "revise"},        │
│         {"label": "Start Over", "value": "restart"}               │
│       ],                                                           │
│       "revision_prompt": "What specific revisions are needed?"    │
│     }                                                              │
│                                                                    │
│  2. Send Approval Request                                          │
│     ws.send(JSON.stringify({                                       │
│       type: "approval_request",                                    │
│       data: approval_request                                       │
│     }))                                                            │
│                                                                    │
│  3. PAUSE WORKFLOW - Wait for User Review                          │
│     • Update workflow status: "awaiting_final_approval"           │
│     • User downloads and reviews protocol PDF                      │
│     • User may take several minutes to review...                   │
│                                                                    │
│  4. Receive User Approval (example)                                │
│     user_response = {                                              │
│       "checkpoint_id": "checkpoint_3",                             │
│       "decision": "accept",                                        │
│       "comments": "Excellent work! Protocol looks comprehensive   │
│                    and well-structured. Ready to use.",           │
│       "rating": 5,  # 1-5 stars                                   │
│       "timestamp": "2025-11-21T10:42:30Z"                         │
│     }                                                              │
│                                                                    │
│  5. Resume Workflow                                                │
│     • Update workflow status: "finalizing"                        │
│     • Log approval decision and rating                             │
│     • Continue to finalization node                                │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ final_approval_decision: "accept"
├─ final_approval_comments: "Excellent work!..."
├─ final_approval_rating: 5
├─ final_approval_timestamp: "2025-11-21T10:42:30Z"
└─ workflow_step: "approval_checkpoint_2"

WebSocket Events:
ws: {"type": "approval_request", "data": {...approval_request...}}
(User reviews and approves)
ws: {"type": "approval_received", "data": {...user_response...}}

SSE Event:
data: {"type": "workflow_paused", "data": {"reason": "Awaiting final approval"}}
(After approval)
data: {"type": "workflow_resumed", "data": {"decision": "accepted", "rating": 5, "progress": 0.98}}

        │
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LANGGRAPH NODE 8: finalization                                        │
│  Duration: ~5-10 seconds                                                │
│  Purpose: Finalize workflow, persist artifacts, clean up resources     │
└─────────────────────────────────────────────────────────────────────────┘

Input State:
├─ artifacts: [protocol, synopsis]
├─ final_approval_decision: "accept"
├─ task_results: {All task outputs}
└─ workflow_id: "workflow-uuid"

Node Actions:
┌────────────────────────────────────────────────────────────────────┐
│  1. Persist Final Artifacts to Database                            │
│     INSERT INTO workflow_artifacts (                               │
│       workflow_id, artifact_type, file_url, file_size_bytes,      │
│       metadata, quality_score, created_at                          │
│     ) VALUES (...)                                                 │
│                                                                    │
│  2. Save Workflow Execution Summary                                │
│     UPDATE workflows SET                                           │
│       status = 'completed',                                        │
│       completed_at = NOW(),                                        │
│       duration_seconds = 252,                                      │
│       tasks_completed = 7,                                         │
│       artifacts_generated = 2,                                     │
│       approval_checkpoints_passed = 2,                            │
│       final_rating = 5,                                            │
│       tokens_used = 45000,                                         │
│       estimated_cost = 0.82                                        │
│     WHERE id = 'workflow-uuid';                                    │
│                                                                    │
│  3. Generate Workflow Summary for User                             │
│     summary = {                                                    │
│       "workflow_id": "workflow-uuid",                              │
│       "goal": "Create Phase II clinical trial protocol",          │
│       "status": "completed",                                       │
│       "duration": "4 minutes 12 seconds",                          │
│       "tasks_executed": 7,                                         │
│       "artifacts": [                                               │
│         "Clinical Trial Protocol (52 pages, 2.4 MB)",             │
│         "Protocol Synopsis (3 pages, 0.2 MB)"                     │
│       ],                                                           │
│       "quality_score": 95,                                         │
│       "tools_used": [                                              │
│         "Literature Search (15 results)",                         │
│         "Clinical Trial Database (5 trials)",                     │
│         "Regulatory Checker (4 guidances)",                       │
│         "Statistical Calculator",                                 │
│         "Protocol Generator"                                      │
│       ],                                                           │
│       "cost": "$0.82",                                             │
│       "next_steps": [                                              │
│         "Review protocol with clinical team",                     │
│         "Submit to IRB for approval",                             │
│         "Finalize patient recruitment materials",                 │
│         "Engage with trial site investigators"                    │
│       ]                                                            │
│     }                                                              │
│                                                                    │
│  4. Clean Up Temporary Resources                                   │
│     • Delete temporary files                                       │
│     • Release worker agents                                        │
│     • Close database connections                                   │
│                                                                    │
│  5. Send Completion Notification                                   │
│     • Email user with workflow summary and artifact links          │
│     • Log analytics event for completed workflow                   │
└────────────────────────────────────────────────────────────────────┘

Output State:
├─ workflow_status: "completed"
├─ workflow_summary: {summary_object}
├─ artifacts: [2 finalized artifacts]
├─ duration_seconds: 252
└─ workflow_step: "finalization"

SSE Events:
data: {"type": "workflow_complete", "data": {
  "workflow_id": "workflow-uuid",
  "status": "completed",
  "duration_seconds": 252,
  "artifacts_count": 2,
  "quality_score": 95,
  "cost": 0.82,
  "summary": {...}
}}

        │
        ▼
┌────────────────┐
│   END NODE     │  Workflow complete - artifacts ready for download
└────────────────┘
```

---

## Agent Hierarchy & Sub-Agents

### Level 1: Master Agent (Not used in Mode 3)

Mode 3 skips master agent orchestration since user manually selects expert (like Mode 1).

### Level 2: Expert Agent (User-Selected, Autonomous Capabilities)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 2: EXPERT AGENT (User-Selected with Autonomous Execution)       │
│  Clinical Trials Expert - Dr. Emily Chen                               │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "clinical-trials-expert"
├─ Name: "Dr. Emily Chen"
├─ Display Name: "Clinical Trials Expert"
├─ Tier: 1 (Premium expert)
├─ Vertical: "Clinical Development"
│
├─ Description:
│   "15+ years of clinical trial design and execution experience across
│    Phase I-III trials. Expert in medical device trials, protocol
│    development, statistical analysis planning, and regulatory compliance.
│    Capable of autonomous workflow execution for trial design tasks."
│
├─ Specialty:
│   "Clinical trial protocol development, study design, statistical methods,
│    patient population definition, endpoint selection, ICH-GCP compliance"
│
├─ Autonomous Capabilities (Mode 3 Specific):
│   {
│     "goal_decomposition": true,         # Break goals into tasks
│     "task_planning": true,               # Sequence tasks
│     "multi_step_execution": true,        # Execute task chains
│     "tool_orchestration": true,          # Coordinate tools
│     "artifact_generation": true,         # Create deliverables
│     "human_in_loop": true,              # Request approvals
│     "self_validation": true,            # Quality checks
│     "parallel_execution": true          # Spawn workers
│   }
│
├─ Available Tools (Extensive for Autonomous Execution):
│   [
│     "literature_search",                 # PubMed, journals
│     "clinical_trial_database",          # ClinicalTrials.gov
│     "statistical_calculator",           # Power analysis, sample size
│     "protocol_generator",               # Document generation
│     "regulatory_checker",               # FDA/EMA guidance
│     "patient_population_analyzer",      # Epidemiology data
│     "endpoint_validator"                # Clinical endpoint library
│   ]
│
└─ Sub-Agent Pool (Level 3 Specialists + Level 4 Workers):
    ├─ Level 3 Specialists:
    │   ├─ Protocol Writing Specialist
    │   ├─ Statistical Analysis Specialist
    │   └─ Regulatory Compliance Specialist
    │
    └─ Level 4 Workers (Parallel Execution):
        ├─ Literature Research Worker
        ├─ Data Analysis Worker
        └─ Document Generation Worker
```

### Level 3: Specialist Sub-Agents (Task-Specific Expertise)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 3: SPECIALIST SUB-AGENT #1                                      │
│  Statistical Analysis Specialist                                        │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "statistical-analysis-specialist"
├─ Parent Agent: "clinical-trials-expert"
├─ Spawned For: Task 4 (Sample size calculation)
│
├─ Specialty:
│   "Biostatistics, power analysis, sample size calculations, statistical
│    test selection, interim analysis planning, statistical analysis plans"
│
├─ Tools:
│   ["statistical_calculator", "power_analysis_simulator"]
│
└─ Output Format:
    {
      "sample_size": number,
      "power": 0.0-1.0,
      "effect_size": number,
      "significance_level": 0.0-1.0,
      "dropout_assumptions": "string",
      "final_enrollment_target": number,
      "statistical_justification": "string"
    }
```

### Level 4: Worker Agents (Parallel Execution)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LEVEL 4: WORKER AGENT #1                                              │
│  Literature Research Worker                                             │
└─────────────────────────────────────────────────────────────────────────┘

Profile:
├─ ID: "literature-research-worker-1"
├─ Parent Agent: "clinical-trials-expert"
├─ Level: 4 (Worker - task executor)
├─ Spawned For: Task 1 (Literature review)
│
├─ Purpose:
│   "Execute literature search tasks in parallel, retrieve publications,
│    extract relevant information, and synthesize findings"
│
├─ Tools:
│   ["literature_search", "clinical_trial_database"]
│
├─ Execution Mode:
│   "Parallel - can run alongside other workers for efficiency"
│
└─ Output Format:
    {
      "publications_found": number,
      "precedent_trials": [list of trials],
      "key_findings": [list of insights],
      "execution_time_seconds": number
    }

Multiple workers can be spawned for parallelization:
• literature_research_worker_1: PubMed search
• literature_research_worker_2: ClinicalTrials.gov search
• literature_research_worker_3: FDA guidance search

All execute simultaneously, reducing total task time from 45s → 20s.
```

### Level 5: Tool Agents (Same as Mode 1, but more extensive usage)

[See Mode 1 documentation for tool agent structure]

**Mode 3 uses tools more extensively:**
- Multiple tool calls per task (research + analysis + generation)
- Tools orchestrated by expert agent across workflow
- Tool outputs feed into subsequent tasks
- Document generation tools for final artifacts

---

## LangGraph State Machine

### Complete State Schema

```python
from typing import TypedDict, Annotated, Sequence, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
import operator

class Mode3State(TypedDict):
    """Complete state schema for Mode 3: Autonomous Manual"""

    # ============================================================================
    # SESSION CONTEXT
    # ============================================================================
    session_id: str                    # Unique session identifier
    workflow_id: str                   # Unique workflow identifier
    user_id: str                       # User UUID
    tenant_id: str                     # Tenant UUID (multi-tenancy)
    mode: str                          # "mode_3_autonomous_manual"

    # ============================================================================
    # GOAL & WORKFLOW STATE (Mode 3 Specific - Critical)
    # ============================================================================
    goal_statement: str                # User's goal (not a question)
    goal_analysis: Dict[str, Any]      # Comprehensive goal analysis
    requirements: Dict[str, Any]       # Extracted requirements
    feasibility: Dict[str, Any]        # Feasibility assessment

    # ============================================================================
    # TASK PLANNING & EXECUTION (Mode 3 Specific)
    # ============================================================================
    workflow_tasks: List[Dict]         # All tasks in workflow
    task_dependencies: Dict[str, List[str]] # Task dependency graph
    current_task_index: int            # Currently executing task
    task_results: Dict[str, Any]       # Completed task outputs
    tasks_completed: int               # Number of completed tasks
    total_tasks: int                   # Total tasks in workflow
    estimated_duration_minutes: float  # Estimated workflow duration
    critical_path: List[str]           # Critical path task IDs

    # ============================================================================
    # APPROVAL CHECKPOINTS (Mode 3 Specific - Human-in-the-Loop)
    # ============================================================================
    approval_checkpoints: List[str]    # Task IDs requiring approval
    pending_approval: Optional[Dict]   # Current approval request
    approval_history: List[Dict]       # All approval decisions
    workflow_approved: bool            # Initial plan approved
    final_approval: Optional[Dict]     # Final artifact approval

    # ============================================================================
    # AGENT SELECTION (Manual by user - like Mode 1)
    # ============================================================================
    agent_id: str                      # Selected expert agent ID
    agent: Dict[str, Any]              # Full agent profile
    agent_persona: str                 # System prompt for agent
    sub_agent_pool: List[Dict]         # Available specialist sub-agents
    worker_agent_pool: List[Dict]      # Available worker agents (Level 4)

    # ============================================================================
    # CONVERSATION STATE (Minimal in Mode 3 - not conversational)
    # ============================================================================
    messages: Annotated[Sequence[BaseMessage], operator.add]  # LangChain messages
    conversation_history: List[Dict]   # Historical messages (for context)
    turn_count: int                    # Number of turns (usually 1-2 in Mode 3)

    # ============================================================================
    # CONTEXT MANAGEMENT
    # ============================================================================
    context_window: str                # Compiled context for LLM
    rag_context: List[Dict]            # RAG-retrieved knowledge chunks
    multimodal_context: Optional[Dict] # Images, videos, audio analysis
    uploaded_documents: List[Dict]     # User-uploaded files

    # ============================================================================
    # SUB-AGENT ORCHESTRATION (Level 3 + Level 4)
    # ============================================================================
    spawned_specialists: List[Dict]    # Level 3 specialists
    spawned_workers: List[Dict]        # Level 4 workers (parallel)
    specialist_results: List[Dict]     # Results from specialist agents
    worker_results: List[Dict]         # Results from worker agents

    # ============================================================================
    # TOOL EXECUTION (Extensive in Mode 3)
    # ============================================================================
    tools_used: List[str]              # All tools used in workflow
    tool_execution_log: List[Dict]     # Detailed tool execution logs
    tool_results: List[Dict]           # Tool execution results

    # ============================================================================
    # ARTIFACT GENERATION (Mode 3 Specific - Critical Output)
    # ============================================================================
    artifacts: List[Dict]              # Generated artifacts (PDFs, docs, etc.)
    artifact_metadata: Dict[str, Any]  # Artifact metadata (sources, methods, etc.)
    artifact_quality_score: float      # Quality assessment (0-100)
    artifact_preview_urls: List[str]   # Preview URLs for frontend

    # ============================================================================
    # REASONING & GENERATION
    # ============================================================================
    thinking_steps: List[Dict]         # Chain-of-thought reasoning steps
    reasoning_mode: str                # "chain_of_thought", "tree_of_thoughts"
    response: str                      # Final summary response
    citations: List[Dict]              # Source citations
    confidence_score: float            # Workflow confidence (0-1)

    # ============================================================================
    # WORKFLOW CONTROL
    # ============================================================================
    workflow_step: str                 # Current node name
    workflow_status: str               # "initializing", "executing", "awaiting_approval", "completed"
    workflow_progress: float           # Progress (0.0-1.0)
    error: Optional[str]               # Error message if any

    # ============================================================================
    # METADATA & ANALYTICS
    # ============================================================================
    tokens_used: Dict[str, int]        # {"prompt": N, "completion": N, "total": N}
    estimated_cost: float              # USD cost for entire workflow
    execution_time_seconds: int        # Total workflow execution time
    timestamp: str                     # ISO timestamp

    # ============================================================================
    # RESPONSE METADATA
    # ============================================================================
    response_metadata: Dict[str, Any]  # Additional response context
    workflow_summary: Dict[str, Any]   # Final workflow summary


class Mode3Graph:
    """LangGraph state machine for Mode 3: Autonomous Manual"""

    def create_graph(self) -> StateGraph:
        """Build the complete LangGraph workflow"""

        graph = StateGraph(Mode3State)

        # ========================================================================
        # ADD NODES
        # ========================================================================

        # Initialization & Goal Analysis
        graph.add_node("load_agent", self.load_agent)
        graph.add_node("analyze_goal", self.analyze_goal)
        graph.add_node("decompose_into_tasks", self.decompose_into_tasks)

        # Approval Checkpoint 1: Workflow Plan
        graph.add_node("approval_checkpoint_1", self.approval_checkpoint_1)

        # Task Execution Loop
        graph.add_node("task_execution_loop", self.task_execution_loop)

        # Artifact Generation
        graph.add_node("artifact_generation", self.artifact_generation)

        # Approval Checkpoint 2: Final Artifact
        graph.add_node("approval_checkpoint_2", self.approval_checkpoint_2)

        # Finalization
        graph.add_node("finalization", self.finalization)

        # ========================================================================
        # DEFINE EDGES
        # ========================================================================

        # Linear flow: Initialization
        graph.set_entry_point("load_agent")
        graph.add_edge("load_agent", "analyze_goal")
        graph.add_edge("analyze_goal", "decompose_into_tasks")
        graph.add_edge("decompose_into_tasks", "approval_checkpoint_1")

        # Conditional: Workflow approved?
        graph.add_conditional_edges(
            "approval_checkpoint_1",
            self.check_workflow_approval,
            {
                "execute": "task_execution_loop",       # Approved → execute
                "modify": "decompose_into_tasks",       # Rejected → re-plan
                "cancel": END                            # Cancelled → end
            }
        )

        # Task execution loop → artifact generation
        graph.add_edge("task_execution_loop", "artifact_generation")

        # Artifact generation → final approval
        graph.add_edge("artifact_generation", "approval_checkpoint_2")

        # Conditional: Final artifact approved?
        graph.add_conditional_edges(
            "approval_checkpoint_2",
            self.check_final_approval,
            {
                "finalize": "finalization",              # Approved → finalize
                "revise": "artifact_generation",         # Revise → regenerate
                "cancel": END                            # Cancel → end
            }
        )

        # Finalization → END
        graph.add_edge("finalization", END)

        # ========================================================================
        # COMPILE GRAPH
        # ========================================================================
        from langgraph.checkpoint.sqlite import SqliteSaver
        checkpointer = SqliteSaver.from_conn_string(":memory:")

        return graph.compile(checkpointer=checkpointer)
```

### Conditional Edge Functions

```python
def check_workflow_approval(self, state: Mode3State) -> str:
    """Determine if workflow plan was approved"""
    approval = state.get("approval_history", [])[-1]

    if approval["decision"] == "approve":
        return "execute"
    elif approval["decision"] == "modify":
        return "modify"  # Re-run task decomposition
    else:
        return "cancel"

def check_final_approval(self, state: Mode3State) -> str:
    """Determine if final artifacts were approved"""
    approval = state.get("final_approval", {})

    if approval.get("decision") == "accept":
        return "finalize"
    elif approval.get("decision") == "revise":
        return "revise"  # Regenerate artifacts
    else:
        return "cancel"
```

---

## Data Flow Diagrams

### Message Flow Timeline (Mode 3)

```
Time: 0s ───────────────────────────────────────────────────────── 300s (5 min)

User submits goal
│
├─ 0-3s:    load_agent (Load agent with autonomous capabilities)
│
├─ 3-11s:   analyze_goal (Deep goal analysis with LLM)
│
├─ 11-23s:  decompose_into_tasks (Break goal into 7 tasks with LLM)
│
├─ 23s-?:   approval_checkpoint_1 (PAUSE - wait for human approval)
│           Duration: VARIABLE (user reviews plan, typically 10-30s)
│
├─ ?-?+30s: task_execution_loop - Task 1 (Literature review)
│           ├─ Spawn worker agent
│           ├─ Execute literature_search tool (15s)
│           ├─ Execute clinical_trial_database tool (10s)
│           └─ Synthesize results (5s)
│
├─ +30-+70s: task_execution_loop - Task 2 (Define endpoints)
│            ├─ Spawn regulatory_compliance_specialist
│            ├─ Execute regulatory_checker tool (10s)
│            ├─ Generate endpoint proposal (20s)
│            └─ PAUSE for approval (VARIABLE - user reviews endpoints)
│
├─ +70-+105s: task_execution_loop - Task 3 (Patient population)
│
├─ +105-+150s: task_execution_loop - Task 4 (Sample size calculation)
│
├─ +150-+180s: task_execution_loop - Task 5 (Study design)
│
├─ +35-+70s: task_execution_loop - Task 6 (Safety monitoring)
│            ** PARALLEL with Task 1 **
│
├─ +180-+240s: artifact_generation - Task 7 (Protocol document)
│              ├─ Spawn protocol_writing_specialist
│              ├─ Spawn document_generation_worker
│              ├─ Execute protocol_generator tool (45s)
│              ├─ Quality check (5s)
│              └─ Upload to storage (10s)
│
├─ +240s-?: approval_checkpoint_2 (PAUSE - wait for final approval)
│           Duration: VARIABLE (user reviews 52-page protocol, typically 30-120s)
│
└─ ?-?+10s: finalization (Persist artifacts, clean up, send summary)

Total: 3-5 minutes typical (excluding human approval time)
       Human approval time adds 1-3 minutes
       Full end-to-end: 4-8 minutes
```

### Data Dependencies (Mode 3)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DATA DEPENDENCY GRAPH (Mode 3 - Complex Workflow)                     │
└─────────────────────────────────────────────────────────────────────────┘

goal_statement ─────┬─→ load_agent ──→ agent_profile ─────────────────┐
                    │                                                  │
session_id ─────────┤                                                  │
user_id ────────────┤                                                  │
tenant_id ──────────┤                                                  │
agent_id ───────────┘                                                  │
                                                                       │
                                                                       ▼
                                                              analyze_goal
                                                                       │
                                                    ┌──────────────────┴──────────┐
                                                    │                             │
                                           goal_analysis               requirements
                                                    │                             │
                                                    └──────────┬──────────────────┘
                                                               │
                                                               ▼
                                                   decompose_into_tasks
                                                               │
                                                    ┌──────────┴───────────┐
                                                    │                      │
                                            workflow_tasks          task_dependencies
                                                    │                      │
                                                    └──────────┬───────────┘
                                                               │
                                                               ▼
                                                  approval_checkpoint_1
                                                               │
                                                      (if approved)
                                                               │
                                                               ▼
                                                   task_execution_loop
                                                               │
                                    ┌──────────────────────────┼──────────────────┐
                                    │                          │                  │
                              FOR EACH task:                   │                  │
                                    │                          │                  │
                              load_task_context                │                  │
                                    │                          │                  │
                              spawn_agents ───────────────────┤                  │
                              (specialists/workers)            │                  │
                                    │                          │                  │
                              execute_tools ───────────────────┤                  │
                              (research/analysis/generation)   │                  │
                                    │                          │                  │
                              synthesize_task_result           │                  │
                                    │                          │                  │
                              validate_output                  │                  │
                                    │                          │                  │
                              store_in_task_results ───────────┤                  │
                                    │                          │                  │
                              (check for approval needed?) ─── ├ (if needed) ─→ approval_checkpoint
                                    │                          │
                                    └──────────────────────────┘
                                                               │
                                                    task_results (all tasks)
                                                               │
                                                               ▼
                                                   artifact_generation
                                                               │
                                    ┌──────────────────────────┼──────────────────┐
                                    │                          │                  │
                          compile_all_results         spawn_document_agents       │
                                    │                          │                  │
                                    └──────────┬───────────────┘                  │
                                               │                                  │
                                    execute_protocol_generator                    │
                                               │                                  │
                                        quality_check                             │
                                               │                                  │
                                        upload_artifacts                          │
                                               │                                  │
                                               ├──────────────────────────────────┘
                                               │
                                               ▼
                                     approval_checkpoint_2
                                               │
                                         (if accepted)
                                               │
                                               ▼
                                         finalization
                                               │
                                               ▼
                                      workflow_complete
                                   (artifacts ready for download)
```

---

## Tool Integration Points

### Tool Registry (Extended for Autonomous Execution)

```python
class Mode3ToolRegistry:
    """Extended tool registry for Mode 3 autonomous workflows"""

    def __init__(self):
        self.tools = {
            # Research Tools
            "literature_search": LiteratureSearchTool(),
            "clinical_trial_database": ClinicalTrialDatabaseTool(),
            "fda_guidance_search": FDAGuidanceSearchTool(),

            # Analysis Tools
            "statistical_calculator": StatisticalCalculatorTool(),
            "patient_population_analyzer": PatientPopulationAnalyzerTool(),
            "endpoint_validator": EndpointValidatorTool(),

            # Generation Tools
            "protocol_generator": ProtocolGeneratorTool(),
            "document_formatter": DocumentFormatterTool(),

            # Validation Tools
            "regulatory_checker": RegulatoryCheckerTool(),
            "quality_validator": QualityValidatorTool(),

            # Storage Tools
            "artifact_uploader": ArtifactUploaderTool()
        }

    async def execute_tool_chain(
        self,
        tools: List[str],
        context: Dict[str, Any],
        parallel: bool = False
    ) -> Dict[str, Any]:
        """Execute multiple tools in sequence or parallel"""

        if parallel:
            # Execute tools concurrently
            tasks = [
                self.tools[tool_name].execute(context)
                for tool_name in tools
            ]
            results = await asyncio.gather(*tasks)
            return dict(zip(tools, results))
        else:
            # Execute tools sequentially
            results = {}
            for tool_name in tools:
                result = await self.tools[tool_name].execute(context)
                results[tool_name] = result
                context.update(result)  # Feed output to next tool
            return results
```

---

## Error Handling & Fallbacks

### Error Recovery Strategy (Mode 3 Extensions)

```python
class Mode3ErrorHandler:
    """Handle errors gracefully in Mode 3 autonomous workflows"""

    async def handle_node_error(
        self,
        node_name: str,
        error: Exception,
        state: Mode3State
    ) -> Mode3State:
        """Handle errors at node level with Mode 3-specific logic"""

        if node_name == "analyze_goal":
            # Critical error - cannot analyze goal
            state["error"] = "Failed to analyze goal"
            state["response"] = "I apologize, but I'm having trouble understanding your goal. Please try rephrasing it."
            state["workflow_status"] = "failed"
            return state

        elif node_name == "decompose_into_tasks":
            # Critical error - cannot plan workflow
            state["error"] = "Failed to decompose goal into tasks"
            state["response"] = "I'm unable to create a workflow plan for this goal. It may be too complex or ambiguous."
            state["workflow_status"] = "failed"
            return state

        elif node_name == "task_execution_loop":
            # Non-critical - log failed task and continue
            current_task = state["workflow_tasks"][state["current_task_index"]]
            logger.error(f"Task {current_task['task_id']} failed: {error}")

            # Mark task as failed
            state["task_results"][current_task["task_id"]] = {
                "status": "failed",
                "error": str(error)
            }

            # Try to continue with next task
            state["current_task_index"] += 1

            # If too many failures, abort workflow
            failed_count = sum(
                1 for r in state["task_results"].values()
                if r.get("status") == "failed"
            )
            if failed_count >= 3:
                state["error"] = "Too many task failures"
                state["workflow_status"] = "failed"

            return state

        elif node_name == "artifact_generation":
            # Critical error - cannot generate artifacts
            state["error"] = "Failed to generate artifacts"
            state["response"] = "I completed the analysis but encountered an error generating the final documents."
            state["workflow_status"] = "failed"
            return state

        elif node_name == "approval_checkpoint_1" or node_name == "approval_checkpoint_2":
            # Timeout waiting for approval
            if isinstance(error, TimeoutError):
                state["workflow_status"] = "timeout"
                state["response"] = "Workflow paused - awaiting your approval."
                return state

        else:
            # Generic error handling
            state["error"] = f"Error in {node_name}: {str(error)}"
            state["workflow_status"] = "failed"
            return state


    async def handle_task_retry(
        self,
        task: Dict[str, Any],
        state: Mode3State,
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """Retry failed tasks with exponential backoff"""

        for attempt in range(max_retries):
            try:
                result = await self.execute_task(task, state)
                return result
            except Exception as e:
                if attempt == max_retries - 1:
                    raise  # Final attempt failed

                delay = 2 ** attempt  # Exponential backoff
                logger.warning(f"Task {task['task_id']} attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                await asyncio.sleep(delay)
```

---

## Performance Metrics

### Target Metrics (Mode 3)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Total Workflow Time (P50)** | 3-4 min | End-to-end workflow completion |
| **Total Workflow Time (P95)** | 5-7 min | Complex workflows |
| **Total Workflow Time (P99)** | 8-12 min | Worst-case scenarios |
| **Goal Analysis** | <10s | Query analysis + LLM reasoning |
| **Task Decomposition** | <15s | Workflow planning with LLM |
| **Per-Task Execution** | 20-60s | Varies by task complexity |
| **Artifact Generation** | 45-90s | Document generation |
| **Approval Wait Time** | VARIABLE | Human-dependent (excluded from targets) |
| **Tool Execution** | <15s per tool | Individual tool timing |
| **Worker Agent Spawn** | <2s | Agent initialization |

### Mode 3 Specific Metrics

```python
class Mode3PerformanceMonitor:
    """Monitor Mode 3-specific performance metrics"""

    async def track_workflow_performance(
        self,
        state: Mode3State,
        start_time: float,
        end_time: float
    ):
        """Track overall workflow metrics"""

        duration_seconds = end_time - start_time

        # Log workflow duration
        workflow_duration_histogram.labels(
            mode="mode_3",
            agent_id=state["agent_id"],
            tasks_count=state["total_tasks"]
        ).observe(duration_seconds)

        # Track task completion rate
        completion_rate = state["tasks_completed"] / state["total_tasks"]
        workflow_completion_rate_gauge.labels(
            workflow_id=state["workflow_id"]
        ).set(completion_rate)

        # Track approval count
        approvals_count = len(state["approval_history"])
        workflow_approvals_counter.labels(
            workflow_id=state["workflow_id"]
        ).inc(approvals_count)

        # Track artifact generation
        artifacts_count = len(state["artifacts"])
        artifacts_generated_counter.labels(
            workflow_id=state["workflow_id"],
            agent_id=state["agent_id"]
        ).inc(artifacts_count)

        # Track quality score
        workflow_quality_gauge.labels(
            workflow_id=state["workflow_id"]
        ).set(state["artifact_quality_score"])

    async def track_task_performance(
        self,
        task: Dict[str, Any],
        duration_ms: float,
        state: Mode3State
    ):
        """Track individual task metrics"""

        # Log task duration
        task_duration_histogram.labels(
            mode="mode_3",
            task_type=task["task_name"],
            agent_id=state["agent_id"]
        ).observe(duration_ms)

        # Check if task exceeded estimate
        if duration_ms > task["estimated_duration_seconds"] * 1000 * 1.5:
            logger.warning(
                f"Task {task['task_id']} took {duration_ms}ms "
                f"(estimated: {task['estimated_duration_seconds'] * 1000}ms)"
            )
```

### Comparison: Mode 1 vs Mode 2 vs Mode 3 Performance

| Metric | Mode 1 | Mode 2 | Mode 3 |
|--------|--------|--------|--------|
| **Response Type** | Conversation | Conversation | Workflow Execution |
| **Duration (P50)** | 30-45s | 45-60s | **3-4 min** |
| **Agent Selection** | Manual (0s) | AI (8-12s) | Manual (0s) |
| **Execution Type** | Single response | Single response | **Multi-step workflow** |
| **Tool Usage** | 1-2 tools | 1-2 tools | **5-10 tools** |
| **Sub-Agents** | 1-2 specialists | 1-2 specialists | **3-6 specialists + workers** |
| **Artifacts Generated** | None | None | **1-5 documents** |
| **Human Approvals** | None | None | **1-3 checkpoints** |
| **Complexity** | Low | Medium | **High** |

---

## Conclusion

This detailed workflow visualization provides a comprehensive blueprint for implementing Ask Expert Mode 3 using LangGraph. Key differences from Modes 1 & 2:

1. **Goal-Driven Execution**: User provides goal statement (not question)
2. **Multi-Step Workflows**: 5-10 tasks executed autonomously
3. **Human-in-the-Loop**: 1-3 approval checkpoints for critical decisions
4. **Artifact Generation**: Produces deliverables (documents, reports, analyses)
5. **Longer Duration**: 3-5 minutes (vs 30-60s in Modes 1-2)
6. **Complex State**: Workflow state machine with task dependencies
7. **Worker Agents**: Level 4 agents for parallel execution

**Mode 3 Strengths**:
- Accomplishes complex goals requiring multiple steps
- Produces tangible deliverables (protocols, reports, analyses)
- Human oversight at critical decision points
- Leverages expert knowledge with autonomous execution

**Mode 3 Trade-offs**:
- Significantly longer execution time (minutes vs seconds)
- Requires workflow planning overhead
- More complex error handling (task-level failures)
- Higher computational cost (multiple LLM calls, tool executions)

**Ideal Use Cases**:
- Protocol/document generation
- Multi-step analysis workflows
- Research compilation tasks
- Strategic planning exercises

---

**Next Steps**:
1. Implement goal decomposition and task planning algorithms
2. Build workflow orchestration engine with dependency management
3. Develop approval checkpoint UI with WebSocket bidirectional communication
4. Create artifact generation pipeline with quality validation
5. Deploy with comprehensive monitoring, task-level error recovery, and workflow resumption

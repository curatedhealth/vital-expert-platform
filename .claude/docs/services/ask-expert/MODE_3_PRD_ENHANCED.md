---
title: "Mode 3: Manual Autonomous - Product Requirements Document (PRD)"
version: "2.0"
status: "Enhanced Specification"
date: "2025-12-04"
owner: "VITAL Platform Team | Curated Health"
classification: "Confidential"
stakeholders:
  - product: "Product Management"
  - engineering: "Platform Engineering"
  - design: "UX/UI Design"
  - compliance: "Regulatory & Compliance"
  - clinical: "Clinical Operations"
related_documents:
  - "MODE_3_ARD_ENHANCED.md"
  - "HITL_SERVICE_SPEC.md"
  - "AGENT_HIERARCHY_GUIDE.md"
  - "PRISM_PROMPT_LIBRARY.md"
---

# Implementation Status Check (2025-12-XX)

**Snapshot based on current code in `apps/vital-system/src/features/chat/services`**

- Mode semantics drift: Mode 3 executor (`executeMode3`) currently calls the Python engine without enforcing a user-selected agentId, while Mode 4 (`executeMode4`) auto-selects unless an optional agentId is provided. This is inverted versus “manual = user-picked, automatic = system-picked.”
- HITL missing: No checkpoints for plan approval, tool/code execution, or critical actions; no audit trail.
- Reasoning transparency: Streaming only sends coarse chunks and metadata; no explicit goal_understanding, execution_plan, iteration traces, or critic/self-check events exposed to UI.
- Safety/adaptive autonomy: No risk/trust signals, no autonomy bands (strict/balanced/permissive), no policy gates on regulated actions.
- Multi-agent: Single-agent flow only; no coordinator or co-agents.
- Metrics: No PRD-aligned success metrics emitted (task completion, HITL approval rate, p95 latency, accuracy_tier3, token efficiency).

# Near-Term Delivery Plan (P1–P2)

1) **Fix mode semantics & enforce manual agent for Mode 3**
   - Require `agentId` for Mode 3 payloads; reject/redirect to Mode 4 when absent.
   - Ensure Mode 4 defaults to auto-select unless user forces an agent; surface selection rationale.

2) **Add HITL checkpoints (Plan → Execute → Critical)**
   - Server emits checkpoint events with payloads (plan summary, tool/action intent, risk level); UI blocks until approval/deny.
   - Record audit events (who, what, when, decision) per checkpoint.

3) **Expose full reasoning metadata**
   - Python engine returns `goal_understanding`, `execution_plan`, `iterations` (thought/action/observation/reflection), and `critic` verdicts.
   - JS pass-through to frontend; UI renders progress, sources, tools used, confidence.

4) **Safety & adaptive autonomy (lite)**
   - Compute signals (risk_level, task_complexity, user_trust_score, model_uncertainty, knowledge_quality) and map to autonomy band.
   - Enforce stricter HITL and shorter iteration caps for high-risk/low-trust contexts.

5) **Evidence quality and metrics**
   - Return citations with evidence level, recency, and confidence; display in UI.
   - Emit metrics for task_completion, hitl_approval_rate, p95 latency, accuracy sampling hooks, token usage.

# Notes for PM/Eng sign-off

- Scope the above as P1 deliverable to align live behavior with this PRD and unblock regulated-use pilots.
- Defer multi-agent collaboration to P2 unless a single coordinator + 1 co-agent can be shipped quickly.

# Mode 3: Manual Autonomous — Enhanced Product Requirements Document

## 1. Executive Summary

### 1.1 Product Vision

Mode 3 (Manual Autonomous) enables pharmaceutical and healthcare professionals to **delegate complex, multi-step tasks** to specialized AI agents while maintaining **human oversight at critical decision points**. Users manually select domain experts from the 1000+ Agent Store, then the system executes goals autonomously with configurable HITL approval checkpoints.

### 1.2 Value Proposition

```yaml
value_proposition:
  for_users:
    - "10x productivity on complex research and analysis tasks"
    - "Expert-level domain assistance without hiring consultants"
    - "Full control over critical decisions with HITL checkpoints"
    - "Audit trail for regulatory compliance"
  
  for_organization:
    - "Scalable expertise delivery across departments"
    - "Consistent quality through standardized agent workflows"
    - "Reduced time-to-insight for strategic decisions"
    - "Cost optimization through intelligent token management"
  
  competitive_differentiation:
    - "Only platform combining manual agent selection with autonomous execution"
    - "Healthcare-specific compliance (HIPAA, FDA 21 CFR Part 11)"
    - "1000+ specialized pharmaceutical agents"
    - "Adaptive HITL that learns user preferences"
```

### 1.3 Golden Matrix Position

| | Manual Selection | Automatic Selection |
|---|---|---|
| **Interactive** | Mode 1: Chat with expert | Mode 2: Smart routing |
| **Autonomous** | **★ Mode 3: Ask Expert** | Mode 4: Full auto |

---

## 2. Business Objectives

### 2.1 Primary Goals

```yaml
business_objectives:
  goal_1:
    name: "Enable Complex Multi-Step Workflows"
    description: "Allow users to delegate pharmaceutical tasks with human oversight"
    success_criteria:
      - "Support tasks requiring 5-20 execution steps"
      - "Handle cross-functional workflows (regulatory + clinical + market access)"
      - "Complete 90%+ of initiated tasks successfully"
  
  goal_2:
    name: "Ensure Safety Through HITL"
    description: "5 approval checkpoints prevent autonomous critical decisions"
    success_criteria:
      - "Zero unauthorized regulatory submissions"
      - "100% audit trail coverage"
      - "User approval required for all high-risk actions"
  
  goal_3:
    name: "Leverage Agent Expertise"
    description: "Users select domain experts from 1000+ specialized agents"
    success_criteria:
      - "Agent accuracy >95% within domain"
      - "User satisfaction >4.2/5 with agent recommendations"
      - "Coverage across all pharmaceutical functions"
  
  goal_4:
    name: "Provide Deep Research Capabilities"
    description: "ToT planning and ReAct² execution for thorough analysis"
    success_criteria:
      - "Research depth comparable to human experts"
      - "Evidence synthesis from 10+ sources per query"
      - "Citation accuracy >98%"
  
  goal_5:
    name: "Enable Multi-Agent Collaboration"
    description: "Multiple expert agents synthesize cross-functional outputs"
    success_criteria:
      - "Support 2-5 agents per complex task"
      - "Conflict resolution without user intervention 80%+"
      - "Coherent synthesis of multi-domain insights"
  
  goal_6:
    name: "Increase Reliability Through Self-Verification"
    description: "Model verification loops raise accuracy 15-25%"
    success_criteria:
      - "Hallucination rate <2%"
      - "Self-correction success rate >90%"
      - "Confidence calibration error <0.1"
  
  goal_7:
    name: "Reduce Cognitive Load"
    description: "Automatic recommendations, plan optimizations, risk assessments"
    success_criteria:
      - "User decisions per task reduced by 50%"
      - "Time-to-completion reduced by 40%"
      - "User-reported cognitive load score <3/10"
```

### 2.2 Success Metrics

```yaml
success_metrics:
  primary:
    task_completion_rate:
      target: ">90%"
      measurement: "Completed tasks / Total initiated tasks"
      frequency: "Daily"
    
    hitl_approval_rate:
      target: ">85%"
      measurement: "Approvals / HITL prompts"
      frequency: "Daily"
    
    user_satisfaction:
      target: ">4.2/5"
      measurement: "Post-task survey (1-5 scale)"
      frequency: "Per task"
    
    response_time_p95:
      target: "<120 seconds"
      measurement: "End-to-end latency"
      frequency: "Real-time"
    
    accuracy_tier3:
      target: ">95%"
      measurement: "Expert validation of outputs"
      frequency: "Weekly sample"
  
  secondary:
    plan_optimality_score:
      target: ">85%"
      measurement: "Plan efficiency vs optimal"
      frequency: "Per task"
    
    multi_agent_agreement_rate:
      target: ">80%"
      measurement: "Agreement between collaborating agents"
      frequency: "Per multi-agent task"
    
    risk_flag_accuracy:
      target: ">90%"
      measurement: "Correct risk classifications"
      frequency: "Weekly audit"
    
    autonomy_override_reduction:
      target: "-20% MoM"
      measurement: "User overrides of system autonomy"
      frequency: "Monthly"
    
    token_efficiency:
      target: "<50K tokens/complex task"
      measurement: "Tokens consumed per task"
      frequency: "Per task"
```

---

## 3. User Stories

### 3.1 Primary Use Cases

```yaml
use_cases:
  UC_3_1:
    title: "Regulatory Submission Strategy"
    persona: "Regulatory Affairs Manager"
    story: |
      As a Regulatory Affairs Manager, I want to design a complete 510(k) 
      submission strategy, so that I have a comprehensive plan approved 
      at each step.
    acceptance_criteria:
      - "Select FDA 510(k) Expert from Agent Store"
      - "Agent generates multi-step submission plan"
      - "I approve plan before execution"
      - "Agent identifies predicate devices with my approval"
      - "Agent drafts substantial equivalence arguments"
      - "I review and approve each critical section"
      - "Final strategy document with citations"
    complexity: "High"
    estimated_steps: 12-15
  
  UC_3_2:
    title: "Clinical Trial Data Analysis"
    persona: "Clinical Operations Director"
    story: |
      As a Clinical Operations Director, I want to analyze clinical trial 
      data and receive actionable recommendations, so that I can make 
      informed decisions with tool execution oversight.
    acceptance_criteria:
      - "Select Clinical Biostatistics Expert"
      - "Upload trial dataset"
      - "Agent proposes analysis plan"
      - "I approve code execution for statistical analysis"
      - "Agent runs survival analysis, subgroup analysis"
      - "I review interim results before final synthesis"
      - "Receive recommendations with confidence intervals"
    complexity: "High"
    estimated_steps: 10-12
  
  UC_3_3:
    title: "FMEA Development"
    persona: "Quality Assurance Engineer"
    story: |
      As a Quality Assurance Engineer, I want to create a comprehensive 
      FMEA for a medical device, so that I have structured risk analysis 
      with sub-agent coordination approval.
    acceptance_criteria:
      - "Select FMEA Expert from Quality Agents"
      - "Describe device and intended use"
      - "Agent spawns Risk Analyst sub-agent (I approve)"
      - "Sub-agent identifies failure modes"
      - "Main agent calculates RPN scores"
      - "I approve high-risk mitigation strategies"
      - "Exportable FMEA document generated"
    complexity: "Medium-High"
    estimated_steps: 8-10
  
  UC_3_4:
    title: "Market Access Dossier"
    persona: "Market Access Specialist"
    story: |
      As a Market Access Specialist, I want an AI agent to compile payer 
      evidence dossiers, so that I can review and approve each evidence 
      source before inclusion.
    acceptance_criteria:
      - "Select Market Access Evidence Expert"
      - "Define target payer and therapy area"
      - "Agent retrieves clinical evidence (I approve sources)"
      - "Agent retrieves economic evidence"
      - "Agent synthesizes value proposition"
      - "I review narrative before finalization"
      - "Formatted dossier with citations"
    complexity: "Medium"
    estimated_steps: 8-10
  
  UC_3_5:
    title: "Multi-Agent Evidence Synthesis"
    persona: "Medical Affairs Lead"
    story: |
      As a Medical Affairs Lead, I want multiple agents (epidemiology, 
      market access, regulatory) to synthesize evidence, so that I receive 
      a cross-functional dossier.
    acceptance_criteria:
      - "Select 3 expert agents for collaboration"
      - "Master agent coordinates parallel research"
      - "Each agent produces domain-specific analysis"
      - "I review each agent's output"
      - "Master agent synthesizes unified recommendations"
      - "Conflicts highlighted for my resolution"
      - "Comprehensive cross-functional report"
    complexity: "Very High"
    estimated_steps: 15-20
  
  UC_3_6:
    title: "Autonomous Code Validation"
    persona: "Data Science Lead"
    story: |
      As a Data Science Lead, I want the agent to validate its own code 
      execution results, so outputs are trustworthy without manual reruns.
    acceptance_criteria:
      - "Select Data Science Expert"
      - "Submit analysis request"
      - "Agent generates code with test cases"
      - "I approve code execution"
      - "Agent self-validates results"
      - "Validation report included with outputs"
      - "Anomalies flagged for my review"
    complexity: "Medium"
    estimated_steps: 6-8
  
  UC_3_7:
    title: "Risk-Aware Workflow Execution"
    persona: "VP of Clinical Development"
    story: |
      As a VP of Clinical Development, I want risk levels surfaced 
      automatically, so approvals are streamlined for low-risk items.
    acceptance_criteria:
      - "System assesses risk for each action"
      - "Low-risk actions auto-approved (permissive mode)"
      - "High-risk actions require my explicit approval"
      - "Risk rationale provided with each checkpoint"
      - "I can adjust risk thresholds"
      - "Audit log captures all risk decisions"
    complexity: "Meta-feature"
    estimated_steps: "N/A"
```

### 3.2 Persona Definitions

```yaml
personas:
  regulatory_affairs_manager:
    role: "Regulatory Affairs Manager"
    department: "Regulatory"
    goals:
      - "Efficient submission preparation"
      - "Compliance assurance"
      - "Timeline predictability"
    pain_points:
      - "Manual predicate device research"
      - "Inconsistent submission quality"
      - "Regulatory landscape changes"
    tech_comfort: "Medium"
    hitl_preference: "Strict"
  
  clinical_operations_director:
    role: "Clinical Operations Director"
    department: "Clinical"
    goals:
      - "Data-driven trial decisions"
      - "Efficient data analysis"
      - "Risk mitigation"
    pain_points:
      - "Slow biostatistics turnaround"
      - "Complex subgroup analyses"
      - "Interpretation uncertainty"
    tech_comfort: "High"
    hitl_preference: "Balanced"
  
  market_access_specialist:
    role: "Market Access Specialist"
    department: "Commercial"
    goals:
      - "Compelling value stories"
      - "Evidence synthesis"
      - "Payer engagement support"
    pain_points:
      - "Evidence gathering time"
      - "Cross-functional alignment"
      - "Dossier formatting"
    tech_comfort: "Medium"
    hitl_preference: "Balanced"
  
  quality_assurance_engineer:
    role: "Quality Assurance Engineer"
    department: "Quality"
    goals:
      - "Comprehensive risk analysis"
      - "Regulatory compliance"
      - "Process efficiency"
    pain_points:
      - "FMEA documentation burden"
      - "Risk scoring subjectivity"
      - "Cross-functional input gathering"
    tech_comfort: "High"
    hitl_preference: "Strict"
```

---

## 4. Functional Requirements

### 4.1 Agent Selection (Manual)

```yaml
FR_3_1_agent_selection:
  FR_3_1_1:
    requirement: "User must select an agent from Agent Store before task execution"
    priority: "P0"
    acceptance_criteria:
      - "Agent Store accessible from Mode 3 entry point"
      - "Selection required before task submission"
      - "Selection persists for session"
    
  FR_3_1_2:
    requirement: "Agent Store displays 1000+ agents with filtering"
    priority: "P0"
    filters:
      - department
      - function
      - tier
      - specialty
      - compliance_certifications
    acceptance_criteria:
      - "Search returns results in <500ms"
      - "Filters combinable"
      - "Agent cards show capabilities, tier, ratings"
  
  FR_3_1_3:
    requirement: "Selected agent tier defaults to Tier 2 minimum"
    priority: "P0"
    rationale: "Autonomous work requires higher accuracy"
    acceptance_criteria:
      - "Tier 1 agents not selectable in Mode 3"
      - "User informed of tier requirement"
  
  FR_3_1_4:
    requirement: "System validates agent capabilities for requested task"
    priority: "P1"
    acceptance_criteria:
      - "Capability mismatch warning displayed"
      - "Alternative agents suggested"
      - "User can override with acknowledgment"
  
  FR_3_1_5:
    requirement: "Multi-agent selection for collaborative tasks"
    priority: "P1"
    acceptance_criteria:
      - "Select up to 5 agents for collaboration"
      - "System validates agent compatibility"
      - "Collaboration mode clearly indicated"
```

### 4.2 HITL Approval System

```yaml
FR_3_2_hitl_system:
  FR_3_2_1:
    requirement: "Plan Approval - User must approve multi-step execution plan"
    priority: "P0"
    trigger: "Before execution begins"
    acceptance_criteria:
      - "Plan displayed with steps, estimates, risks"
      - "User can edit individual steps"
      - "Approval timestamp recorded"
  
  FR_3_2_2:
    requirement: "Tool Approval - User must approve external tool execution"
    priority: "P0"
    configurable: "Per tool type"
    acceptance_criteria:
      - "Tool, parameters, and risks displayed"
      - "User can edit parameters"
      - "Approval required for code execution, DB writes, API mutations"
  
  FR_3_2_3:
    requirement: "Sub-Agent Approval - User must approve agent spawning"
    priority: "P0"
    applies_to: "L3, L4, L5 agents"
    acceptance_criteria:
      - "Sub-agent capabilities and justification shown"
      - "Resource allocation disclosed"
      - "Automatic approval option for trusted patterns"
  
  FR_3_2_4:
    requirement: "Critical Decision Approval - High-stakes decisions require approval"
    priority: "P0"
    triggers:
      - "Risk score > threshold"
      - "Regulatory impact detected"
      - "Financial exposure > limit"
    acceptance_criteria:
      - "Decision context fully explained"
      - "Alternatives presented"
      - "Justification required for approval"
  
  FR_3_2_5:
    requirement: "Final Review - User must approve response before delivery"
    priority: "P1"
    configurable: true
    acceptance_criteria:
      - "Complete response with citations displayed"
      - "User can request revision"
      - "Approval optional in permissive mode"
  
  FR_3_2_6:
    requirement: "Configurable safety levels per user"
    priority: "P1"
    levels:
      strict: "All 5 checkpoints"
      balanced: "Plan + Critical + Final"
      permissive: "Final only"
    acceptance_criteria:
      - "User can change level per session"
      - "Admin can set default per role"
      - "Level change logged"
```

### 4.3 Agentic Patterns

```yaml
FR_3_3_agentic_patterns:
  FR_3_3_1:
    requirement: "Tree-of-Thoughts (ToT) planning for Tier 3 queries"
    priority: "P0"
    implementation:
      beam_width: "3-7 (complexity-based)"
      evaluation: "Multi-criteria ranking"
    acceptance_criteria:
      - "ToT activated for complexity > 7"
      - "Multiple plan candidates generated"
      - "Best plan selected with justification"
  
  FR_3_3_2:
    requirement: "ReAct² execution with verification loops"
    priority: "P0"
    cycle:
      - precondition_check
      - reasoning
      - action
      - observation
      - postcondition_verify
      - uncertainty_estimate
      - checkpoint
    acceptance_criteria:
      - "Each step verified before proceeding"
      - "Failures trigger retry or escalation"
      - "Uncertainty tracked and displayed"
  
  FR_3_3_3:
    requirement: "Constitutional AI validation at each step"
    priority: "P0"
    validations:
      - "Factual accuracy"
      - "Safety compliance"
      - "Ethical guidelines"
      - "Domain appropriateness"
    acceptance_criteria:
      - "Constitutional check before output"
      - "Violations flagged and corrected"
      - "Persistent violations escalate to HITL"
  
  FR_3_3_4:
    requirement: "Chain-of-Thought explicit reasoning"
    priority: "P1"
    acceptance_criteria:
      - "Reasoning trace visible to user"
      - "Step-by-step logic displayed"
      - "Reasoning exportable for audit"
  
  FR_3_3_5:
    requirement: "Goal-driven execution toward defined objectives"
    priority: "P0"
    acceptance_criteria:
      - "Goal parsed from user input"
      - "Progress toward goal tracked"
      - "Goal completion criteria evaluated"
```

### 4.4 Deep Agent Hierarchy

```yaml
FR_3_4_agent_hierarchy:
  levels:
    L1_master:
      role: "Task coordination, HITL triggers"
      capabilities:
        - "Task decomposition"
        - "Escalation handling"
        - "Final synthesis"
      constraints:
        - "Cannot execute tools directly"
        - "Must use sub-agents for domain tasks"
    
    L2_expert:
      role: "Domain expertise (user-selected)"
      capabilities:
        - "Domain reasoning"
        - "L3 delegation"
        - "Evidence synthesis"
      constraints:
        - "Scoped to selected domain"
        - "HITL required for cross-domain"
    
    L3_specialist:
      role: "Sub-domain tasks (spawned)"
      capabilities:
        - "Focused subtasks"
        - "L4 delegation"
      constraints:
        - "Spawning requires HITL approval"
        - "Time-limited lifecycle"
    
    L4_worker:
      role: "Parallel task execution"
      capabilities:
        - "Parallel execution"
        - "Tool invocation"
      constraints:
        - "No autonomous spawning"
        - "Results validated by L3"
    
    L5_tool:
      role: "Tool execution"
      capabilities:
        - "RAG retrieval"
        - "Web search"
        - "Code execution"
        - "Database queries"
      constraints:
        - "Sandboxed execution"
        - "HITL for write operations"
```

### 4.5 Tool & Code Execution

```yaml
FR_3_5_tools:
  FR_3_5_1:
    requirement: "Python code execution with HITL approval"
    priority: "P0"
    sandbox:
      timeout: "30 seconds"
      memory: "512MB"
      network: "disabled"
    acceptance_criteria:
      - "Code displayed before execution"
      - "User can edit code"
      - "Results returned with output/errors"
  
  FR_3_5_2:
    requirement: "R code execution for statistical analysis"
    priority: "P1"
    packages: ["tidyverse", "survival", "ggplot2"]
    acceptance_criteria:
      - "R environment available"
      - "Statistical outputs formatted"
      - "Plots rendered as images"
  
  FR_3_5_3:
    requirement: "SAS code execution for regulatory submissions"
    priority: "P2"
    compliance: "FDA 21 CFR Part 11"
    acceptance_criteria:
      - "SAS environment validated"
      - "Audit trail for all executions"
      - "Output in regulatory-compliant format"
  
  FR_3_5_4:
    requirement: "RAG retrieval from Unified RAG Service"
    priority: "P0"
    features:
      - "Vector search"
      - "Reranking"
      - "Citation extraction"
    acceptance_criteria:
      - "Top-k configurable"
      - "Source documents linkable"
      - "Confidence scores included"
  
  FR_3_5_5:
    requirement: "Web search with source verification"
    priority: "P1"
    verification:
      - "Source credibility scoring"
      - "Date recency check"
      - "Domain authority"
    acceptance_criteria:
      - "Results ranked by relevance + credibility"
      - "Low-credibility sources flagged"
  
  FR_3_5_6:
    requirement: "Database queries (read-only by default)"
    priority: "P0"
    modes:
      read_only: "Default"
      write: "Requires explicit HITL"
    acceptance_criteria:
      - "Query plan displayed"
      - "Row limits enforced"
      - "Sensitive columns masked"
```

### 4.6 Adaptive Autonomy

```yaml
FR_3_6_adaptive_autonomy:
  FR_3_6_1:
    requirement: "Dynamically adjust autonomy based on complexity and risk"
    priority: "P0"
    factors:
      - task_complexity
      - risk_level
      - user_trust_score
      - model_uncertainty
    acceptance_criteria:
      - "Autonomy level computed per task"
      - "User informed of current level"
      - "Level can change mid-execution"
  
  FR_3_6_2:
    requirement: "Real-time autonomy overrides by user"
    priority: "P0"
    overrides:
      - "Increase autonomy (skip checkpoints)"
      - "Decrease autonomy (add checkpoints)"
      - "Lock constraints"
    acceptance_criteria:
      - "Override available at any checkpoint"
      - "Override logged for audit"
  
  FR_3_6_3:
    requirement: "Autonomy settings persist per user"
    priority: "P1"
    acceptance_criteria:
      - "Default autonomy level saved"
      - "Per-domain preferences supported"
      - "Settings sync across devices"
```

### 4.7 Multi-Agent Collaboration

```yaml
FR_3_7_multi_agent:
  FR_3_7_1:
    requirement: "Support multiple L2 agents per task"
    priority: "P0"
    limit: "5 agents maximum"
    acceptance_criteria:
      - "Agents can be added during planning"
      - "Coordination by L1 Master"
      - "Parallel and sequential modes"
  
  FR_3_7_2:
    requirement: "Master agent merges conflicting outputs"
    priority: "P0"
    strategy: "Weighted expertise voting"
    acceptance_criteria:
      - "Conflicts identified and highlighted"
      - "Merge strategy explained"
      - "User can override merge decisions"
  
  FR_3_7_3:
    requirement: "Every agent discloses reasoning and evidence"
    priority: "P1"
    acceptance_criteria:
      - "Reasoning trace per agent"
      - "Evidence citations per agent"
      - "Confidence scores per agent"
```

### 4.8 Confidence & Risk Framework

```yaml
FR_3_8_confidence_risk:
  FR_3_8_1:
    requirement: "All outputs include confidence scores"
    priority: "P0"
    display:
      - "Overall confidence (0-100)"
      - "Per-section confidence"
      - "Per-claim confidence"
    acceptance_criteria:
      - "Confidence visible in UI"
      - "Low confidence highlighted"
      - "Confidence methodology documented"
  
  FR_3_8_2:
    requirement: "Risk scoring for plan and actions"
    priority: "P0"
    dimensions:
      - regulatory_impact
      - financial_exposure
      - reputational_risk
      - safety_implications
    acceptance_criteria:
      - "Risk score per step"
      - "Overall task risk"
      - "Risk factors explained"
  
  FR_3_8_3:
    requirement: "HITL triggered automatically on high-risk items"
    priority: "P0"
    threshold: "Configurable per user/role"
    acceptance_criteria:
      - "High-risk items always require approval"
      - "Threshold visible in settings"
      - "Override requires justification"
```

### 4.9 Memory System

```yaml
FR_3_9_memory:
  FR_3_9_1:
    requirement: "Tri-layer memory supports retrieval and reasoning"
    priority: "P0"
    layers:
      episodic: "Execution state snapshots"
      semantic: "Cross-task knowledge"
      working: "Active task scratchpad"
    acceptance_criteria:
      - "Memory accessible to all agents"
      - "Semantic search enabled"
      - "Context compression automatic"
  
  FR_3_9_2:
    requirement: "Memory compression for long tasks"
    priority: "P1"
    trigger: "Approaching context limits"
    acceptance_criteria:
      - "Compression transparent to user"
      - "Key information preserved"
      - "Overflow stored in semantic memory"
  
  FR_3_9_3:
    requirement: "User preference memory"
    priority: "P1"
    stores:
      - "HITL preferences"
      - "Agent favorites"
      - "Domain contexts"
    acceptance_criteria:
      - "Preferences applied automatically"
      - "User can view/edit preferences"
      - "Privacy controls available"
```

---

## 5. Non-Functional Requirements

### 5.1 Performance

```yaml
NFR_performance:
  latency:
    planning_p50: "<15 seconds"
    planning_p95: "<30 seconds"
    execution_p50: "<45 seconds"
    execution_p95: "<90 seconds"
    total_p50: "<60 seconds"
    total_p95: "<120 seconds"
    hitl_prompt: "<2 seconds"
  
  throughput:
    concurrent_sessions: "100+"
    requests_per_minute: "500+"
    agent_spawn: "<5 seconds"
  
  scalability:
    horizontal: "Kubernetes auto-scaling"
    database: "Read replicas"
    cache: "Redis cluster"
```

### 5.2 Reliability

```yaml
NFR_reliability:
  availability:
    uptime: "99.9%"
    planned_downtime: "<4 hours/month"
  
  recovery:
    checkpoint_recovery: "100%"
    session_persistence: "24+ hours"
    error_recovery: "Graceful fallback to Mode 1"
    data_durability: "99.999%"
  
  fault_tolerance:
    single_agent_failure: "Auto-retry with fallback"
    tool_failure: "Alternative tool routing"
    model_timeout: "Queue and notify"
```

### 5.3 Security & Compliance

```yaml
NFR_security:
  authentication:
    method: "OAuth 2.0 + MFA"
    session: "JWT with refresh"
  
  authorization:
    model: "RBAC + ABAC"
    tenant_isolation: "100%"
  
  encryption:
    at_rest: "AES-256"
    in_transit: "TLS 1.3"
    key_management: "AWS KMS"
  
  compliance:
    hipaa: "Required"
    fda_21_cfr_part_11: "Required for regulatory agents"
    soc2_type2: "Required"
    gdpr: "Required for EU users"
  
  audit:
    logging: "Comprehensive"
    retention: "7 years"
    immutability: "Write-once storage"
```

### 5.4 Usability

```yaml
NFR_usability:
  accessibility:
    wcag: "2.1 AA"
    screen_reader: "Full support"
    keyboard_navigation: "Complete"
  
  responsiveness:
    mobile: "Responsive design"
    tablet: "Full functionality"
    desktop: "Optimized experience"
  
  internationalization:
    languages: ["en", "de", "fr", "ja"]
    localization: "Date, number, currency formats"
```

---

## 6. Frontend Integration

### 6.1 UI Configuration

```typescript
interface Mode3Config {
  // Mode identification
  isAutomatic: false;           // Manual agent selection
  isAutonomous: true;           // Goal-driven execution
  
  // Agent selection
  selectedAgents: string[];     // Agent IDs (1-5)
  collaborationMode?: 'parallel' | 'sequential' | 'debate';
  
  // HITL configuration
  hitlEnabled: true;
  hitlSafetyLevel: 'strict' | 'balanced' | 'permissive';
  hitlPreferences: {
    skipLowRiskTools: boolean;
    autoApproveSubagents: boolean;
    requireFinalReview: boolean;
  };
  
  // Execution limits
  maxExecutionTime: number;     // Seconds (default: 120)
  maxTokenBudget: number;       // Token limit (default: 50000)
  maxSubagents: number;         // Sub-agent limit (default: 10)
  
  // Output preferences
  verboseReasoning: boolean;    // Show full reasoning trace
  includeCitations: boolean;    // Always include sources
  confidenceDisplay: 'minimal' | 'detailed' | 'none';
}
```

### 6.2 HITL UI Components

```yaml
hitl_components:
  plan_approval_modal:
    purpose: "Display and approve execution plan"
    elements:
      - step_list: "Numbered steps with descriptions"
      - time_estimate: "Estimated duration"
      - resource_usage: "Token/API estimates"
      - risk_indicators: "Per-step risk badges"
      - edit_controls: "Inline step editing"
      - action_buttons: "Approve / Edit / Reject"
  
  tool_execution_card:
    purpose: "Approve tool invocations"
    elements:
      - tool_name: "Tool identifier"
      - parameters: "Input parameters (editable)"
      - risk_level: "Risk badge"
      - rationale: "Why this tool was chosen"
      - preview: "Expected output preview"
      - action_buttons: "Approve / Edit / Reject"
  
  subagent_approval_panel:
    purpose: "Approve agent spawning"
    elements:
      - agent_type: "Agent role"
      - capabilities: "What it can do"
      - justification: "Why it's needed"
      - resource_allocation: "Tokens/time allocated"
      - action_buttons: "Approve / Reject"
  
  progress_tracker:
    purpose: "Real-time execution monitoring"
    elements:
      - step_indicator: "Current step in plan"
      - progress_bar: "Overall completion"
      - time_elapsed: "Duration"
      - token_usage: "Tokens consumed"
      - pause_resume: "Control buttons"
      - expand_details: "Full execution log"
  
  confidence_indicator:
    purpose: "Display confidence levels"
    elements:
      - overall_score: "0-100 with color coding"
      - breakdown: "Per-section scores"
      - tooltip: "Confidence factors"
  
  final_review_panel:
    purpose: "Approve complete response"
    elements:
      - response_preview: "Full formatted response"
      - citations_list: "All sources used"
      - confidence_summary: "Overall confidence"
      - action_buttons: "Approve / Request Revision"
```

### 6.3 State Management

```typescript
interface Mode3UIState {
  // Session
  sessionId: string;
  agentId: string;
  
  // Execution state
  status: 'idle' | 'planning' | 'awaiting_hitl' | 'executing' | 
          'validating' | 'complete' | 'error';
  currentStep: number;
  totalSteps: number;
  
  // HITL state
  hitlPending: boolean;
  hitlCheckpointType: 'plan' | 'tool' | 'subagent' | 'decision' | 'final' | null;
  hitlExplanation: ExplanationPacket | null;
  
  // Streaming
  streamingTokens: string;
  executionTrace: ExecutionStep[];
  
  // Results
  response: string | null;
  citations: Citation[];
  confidence: number;
  
  // Metrics
  tokensUsed: number;
  elapsedTime: number;
}
```

---

## 7. API Specification

### 7.1 Endpoints

```yaml
api_endpoints:
  initiate_task:
    method: "POST"
    path: "/api/mode3/autonomous-manual"
    request:
      agent_id: "uuid (required)"
      message: "string (required)"
      session_id: "uuid (required)"
      tenant_id: "uuid (required)"
      collaboration_agents: "uuid[] (optional)"
      enable_rag: "boolean (default: true)"
      hitl_enabled: "boolean (default: true)"
      hitl_safety_level: "strict | balanced | permissive (default: balanced)"
      max_execution_time: "integer seconds (default: 120)"
      max_token_budget: "integer (default: 50000)"
    response: "SSE stream"
  
  submit_hitl_decision:
    method: "POST"
    path: "/api/mode3/hitl/{checkpoint_id}"
    request:
      decision: "approve | edit | reject"
      modifications: "object (optional)"
      feedback: "string (optional)"
    response:
      status: "accepted | rejected"
      next_action: "continue | replan | abort"
  
  get_execution_status:
    method: "GET"
    path: "/api/mode3/status/{session_id}"
    response:
      status: "string"
      current_step: "integer"
      total_steps: "integer"
      hitl_pending: "boolean"
      tokens_used: "integer"
      elapsed_time: "integer"
  
  pause_execution:
    method: "POST"
    path: "/api/mode3/pause/{session_id}"
    response:
      status: "paused"
      checkpoint_id: "uuid"
  
  resume_execution:
    method: "POST"
    path: "/api/mode3/resume/{session_id}"
    request:
      checkpoint_id: "uuid (optional)"
    response: "SSE stream"
  
  cancel_execution:
    method: "POST"
    path: "/api/mode3/cancel/{session_id}"
    request:
      reason: "string (optional)"
    response:
      status: "cancelled"
      partial_results: "object (optional)"
```

### 7.2 SSE Event Types

```yaml
sse_events:
  planning_started:
    type: "planning"
    data:
      phase: "string"
      estimated_duration: "integer"
  
  planning_complete:
    type: "plan_ready"
    data:
      plan: "PlanObject"
      hitl_required: "boolean"
  
  hitl_request:
    type: "hitl_request"
    data:
      checkpoint_id: "uuid"
      checkpoint_type: "plan | tool | subagent | decision | final"
      explanation: "ExplanationPacket"
      timeout: "integer seconds"
  
  execution_progress:
    type: "progress"
    data:
      step: "integer"
      total: "integer"
      description: "string"
      confidence: "float"
  
  token_stream:
    type: "token"
    data:
      content: "string"
      agent_id: "uuid"
  
  tool_call:
    type: "tool_call"
    data:
      tool: "string"
      parameters: "object"
      result: "object (after completion)"
  
  subagent_spawn:
    type: "subagent"
    data:
      agent_type: "string"
      agent_id: "uuid"
      status: "spawning | active | complete"
  
  validation_result:
    type: "validation"
    data:
      passed: "boolean"
      issues: "string[]"
      confidence: "float"
  
  complete:
    type: "done"
    data:
      response: "string"
      citations: "Citation[]"
      execution_trace: "ExecutionStep[]"
      total_tokens: "integer"
      total_time: "integer"
      confidence: "float"
  
  error:
    type: "error"
    data:
      code: "string"
      message: "string"
      recoverable: "boolean"
      checkpoint_id: "uuid (if recoverable)"
```

---

## 8. Tier System

### 8.1 Tier Configuration

```yaml
tier_system:
  tier_2:
    name: "Standard Autonomous"
    model: "gpt-4-turbo"
    use_cases:
      - "Standard autonomous tasks"
      - "Moderate complexity queries"
      - "General domain expertise"
    cost: "$0.12/query average"
    limits:
      max_tokens: "32,000"
      max_steps: "15"
      max_subagents: "5"
  
  tier_3:
    name: "Advanced Autonomous"
    models:
      primary: "gpt-4"
      alternate: "claude-3-opus"
    use_cases:
      - "High-stakes regulatory work"
      - "Complex multi-step analysis"
      - "Cross-functional synthesis"
    cost: "$0.35-0.40/query average"
    limits:
      max_tokens: "128,000"
      max_steps: "30"
      max_subagents: "15"
```

### 8.2 Tier Assessment Logic

```yaml
tier_assessment:
  default: "tier_2"
  
  upgrade_to_tier_3:
    conditions:
      - "3+ complexity indicators"
      - "message_length > 50 words"
      - "multi_step_plan_required"
      - "regulatory_domain"
      - "multi_agent_collaboration"
    
    complexity_indicators:
      - "regulatory OR compliance keywords"
      - "analysis OR synthesis keywords"
      - "multi-domain reference"
      - "time-series OR longitudinal"
      - "risk assessment request"
      - "cross-functional synthesis"
  
  override:
    user_can_upgrade: true
    user_can_downgrade: false
    admin_override: true
```

---

## 9. Implementation Roadmap

### 9.1 MVP (Phase 1)

```yaml
mvp_scope:
  duration: "8 weeks"
  
  included:
    - "Single agent selection from Agent Store"
    - "Basic ToT planning (beam width 3)"
    - "ReAct execution (without full verification)"
    - "3 HITL checkpoints (plan, tool, final)"
    - "Python code execution"
    - "RAG retrieval"
    - "Episodic memory only"
    - "Basic confidence scores"
  
  excluded:
    - "Multi-agent collaboration"
    - "Adaptive autonomy"
    - "R/SAS execution"
    - "Full ReAct² verification"
    - "Semantic/working memory"
    - "Risk framework"
  
  success_criteria:
    - "End-to-end task completion"
    - "HITL checkpoints functional"
    - "Response time <120s P95"
    - "User satisfaction >3.5/5"
```

### 9.2 V1 (Phase 2)

```yaml
v1_scope:
  duration: "6 weeks after MVP"
  
  additions:
    - "Full ReAct² with verification"
    - "5 HITL checkpoints"
    - "Adaptive autonomy (3 levels)"
    - "Tri-memory system"
    - "Confidence framework"
    - "Risk scoring"
    - "R code execution"
    - "Web search integration"
  
  success_criteria:
    - "Task completion >85%"
    - "User satisfaction >4.0/5"
    - "Confidence calibration <0.15 error"
```

### 9.3 V2 (Phase 3)

```yaml
v2_scope:
  duration: "8 weeks after V1"
  
  additions:
    - "Multi-agent collaboration (2-5 agents)"
    - "Advanced ToT (dynamic beam width)"
    - "SAS code execution"
    - "Full compliance framework"
    - "Advanced observability"
    - "User preference learning"
    - "Cross-task knowledge transfer"
  
  success_criteria:
    - "Task completion >90%"
    - "User satisfaction >4.2/5"
    - "Multi-agent tasks supported"
    - "Full regulatory compliance"
```

---

## 10. Known Limitations

```yaml
limitations:
  response_time:
    description: "Autonomous execution takes 60-120 seconds"
    impact: "Not suitable for quick answers"
    mitigation: "Clear user expectations, progress indicators"
  
  hitl_dependency:
    description: "Requires active user for checkpoint approvals"
    impact: "Cannot run fully unattended"
    mitigation: "Timeout handling, session persistence"
  
  code_execution:
    description: "Limited to sandboxed environments"
    impact: "No access to external systems"
    mitigation: "Expand sandbox capabilities carefully"
  
  token_limits:
    description: "Long reasoning chains may hit context limits"
    impact: "Complex tasks may require compression"
    mitigation: "Memory compression, context management"
  
  multi_agent_latency:
    description: "Multi-agent tasks have higher latency"
    impact: "15-20 step tasks may take 3-5 minutes"
    mitigation: "Parallel execution, user notification"
  
  conflict_resolution:
    description: "Expert disagreements require additional cycles"
    impact: "May increase HITL frequency"
    mitigation: "Weighted voting, clear escalation"
```

---

## 11. Dependencies

```yaml
dependencies:
  implemented:
    langgraph_stategraph:
      status: "✅ Implemented"
      version: "1.0"
    
    unified_rag_service:
      status: "✅ Implemented"
      version: "2.1"
    
    hitl_service:
      status: "✅ Implemented (with fix)"
      note: "get_optional_user resolved"
    
    tree_of_thoughts_agent:
      status: "✅ Implemented"
      version: "1.0"
    
    react_agent:
      status: "✅ Implemented"
      version: "1.0"
    
    constitutional_ai_agent:
      status: "✅ Implemented"
      version: "1.0"
    
    deep_agents_tools:
      status: "✅ Implemented"
      version: "1.0"
    
    agent_hierarchy_service:
      status: "✅ Implemented"
      version: "1.0"
  
  pending:
    adaptive_autonomy_layer:
      status: "🔲 Planned"
      target: "V1"
    
    tri_memory_system:
      status: "🔲 Planned"
      target: "V1"
    
    multi_agent_collaboration:
      status: "🔲 Planned"
      target: "V2"
    
    react_squared:
      status: "🔲 Planned"
      target: "V1"
    
    frontend_hitl_components:
      status: "⚠️ In Progress"
      target: "MVP"
```

---

## Appendix A: Example User Flow

```yaml
example_flow:
  scenario: "510(k) Submission Strategy"
  
  steps:
    1:
      action: "User opens Agent Store"
      ui: "Agent Store modal"
      
    2:
      action: "User filters by 'Regulatory Affairs'"
      ui: "Filtered agent list"
      
    3:
      action: "User selects 'FDA 510(k) Submission Expert'"
      ui: "Agent selected, capabilities displayed"
      
    4:
      action: "User enters goal"
      input: "Design complete 510(k) submission strategy for Class II cardiovascular monitoring device"
      
    5:
      action: "System generates multi-step plan"
      output: "12-step plan with risk scores"
      hitl: "Plan Approval checkpoint"
      
    6:
      action: "User reviews and approves plan"
      ui: "Plan approval modal"
      
    7:
      action: "Agent executes Step 1: Device classification research"
      tool: "RAG retrieval"
      hitl: "None (low risk)"
      
    8:
      action: "Agent requests web search for recent FDA guidance"
      hitl: "Tool Approval checkpoint"
      
    9:
      action: "User approves web search"
      ui: "Tool execution card"
      
    10:
      action: "Agent spawns 'Predicate Device Analyst' sub-agent"
      hitl: "Sub-Agent Approval checkpoint"
      
    11:
      action: "User approves sub-agent"
      ui: "Sub-agent approval panel"
      
    12:
      action: "Sub-agent identifies 5 predicate devices"
      output: "Predicate device analysis"
      
    13:
      action: "Agent synthesizes substantial equivalence arguments"
      hitl: "Critical Decision checkpoint (regulatory impact)"
      
    14:
      action: "User reviews and approves arguments"
      ui: "Critical decision modal"
      
    15:
      action: "Agent completes remaining steps"
      output: "Draft strategy sections"
      
    16:
      action: "Final response generated"
      hitl: "Final Review checkpoint"
      
    17:
      action: "User approves final strategy"
      output: "Complete 510(k) submission strategy document"
      
    18:
      action: "Task marked complete"
      output: "Full audit trail logged"
```

---

## Appendix B: Glossary

```yaml
glossary:
  AAL: "Adaptive Autonomy Layer - Dynamic autonomy adjustment system"
  MACK: "Multi-Agent Cognitive Kernel - Core processing pipeline"
  EFX: "Execution Fabric - DAG-based workflow runtime"
  ATR: "Autonomous Tool Router - Intelligent tool selection"
  HITL: "Human-In-The-Loop - Approval checkpoint system"
  ToT: "Tree-of-Thoughts - Multi-path planning exploration"
  CoT: "Chain-of-Thought - Step-by-step reasoning"
  ReAct: "Reasoning + Acting - Agentic execution pattern"
  ReAct²: "ReAct with verification - Enhanced execution loop"
  RAG: "Retrieval-Augmented Generation - Knowledge retrieval"
  L1-L5: "Agent hierarchy levels (Master to Tool)"
  SSE: "Server-Sent Events - Streaming response protocol"
```

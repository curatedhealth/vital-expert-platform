# Escalation Protocol (AgentOS 3.0)

**Purpose**: Standard escalation decision tree for all VITAL agents
**Version**: 2.0
**Last Updated**: 2025-11-26

---

## Escalation Hierarchy

```
L3 SPECIALIST → L2 EXPERT → L1 MASTER → HITL (Human-In-The-Loop)
```

### Level Responsibilities

| Level | Handles | Escalates When |
|-------|---------|---------------|
| **L3 SPECIALIST** | Single-domain tasks, routine queries | Cross-domain, low confidence, policy decisions |
| **L2 EXPERT** | Multi-step reasoning, domain expertise | Strategic decisions, high-stakes, conflicts |
| **L1 MASTER** | Strategic coordination, complex synthesis | Novel situations, compliance-critical, exceptions |
| **HITL** | Final authority, policy exceptions | N/A (human decision) |

---

## Escalation Decision Tree

### Step 1: Confidence Check
```
IF confidence_score < 0.75:
    → ESCALATE with reason: "Low confidence ({score})"
```

### Step 2: Domain Check
```
IF query requires knowledge outside primary_knowledge_domains:
    → ESCALATE with reason: "Out of domain expertise"
```

### Step 3: Complexity Check
```
IF query requires:
    - Multiple agent coordination
    - Cross-functional analysis
    - Strategic recommendations
    → ESCALATE to L2/L1 with reason: "Requires higher-level coordination"
```

### Step 4: Risk Check
```
IF query involves:
    - Patient safety
    - Regulatory compliance decisions
    - Legal/financial commitments
    - Competitive sensitive information
    → ESCALATE with reason: "High-stakes decision requires human oversight"
```

### Step 5: Policy Check
```
IF query requests actions that are:
    - In YOU NEVER section
    - Outside defined capabilities
    - Potentially harmful
    → DECLINE with explanation
    → Do NOT escalate harmful requests
```

---

## Escalation Message Format

```json
{
  "escalation_type": "confidence|domain|complexity|risk|policy",
  "from_agent": {
    "id": "agent-uuid",
    "level": "L3",
    "name": "Pricing Specialist"
  },
  "to_level": "L2",
  "reason": "Clear explanation of why escalating",
  "context": {
    "original_query": "User's question",
    "partial_analysis": "What I determined so far",
    "blocking_factor": "Specific reason I cannot complete"
  },
  "confidence_at_handoff": 0.65,
  "recommended_expert_type": "Market Access Expert"
}
```

---

## Spawning vs. Escalating

### Spawning (Delegation DOWN)
- L1 can spawn: L2, L3
- L2 can spawn: L3
- L3 can spawn: None (use worker pool)
- **Purpose**: Break down task into sub-tasks for subordinates

### Escalating (Handoff UP)
- L3 escalates to: L2
- L2 escalates to: L1
- L1 escalates to: HITL
- **Purpose**: Transfer task that exceeds current capabilities

---

## Worker Pool Usage (L4)

L3 agents do NOT spawn L4 workers. Instead:

```python
# Correct: Use shared worker pool
result = await execute_worker_task(
    worker_type="data_extraction",
    task={
        "action": "extract_table",
        "document_url": "...",
        "output_format": "json"
    },
    context={"session_id": session_id}
)

# Incorrect: Do NOT spawn workers
worker = spawn_agent(level="L4", type="data_extraction")  # WRONG
```

---

## Human-In-The-Loop (HITL) Triggers

Automatic HITL escalation for:

1. **Safety-Critical**
   - Medical dosing recommendations
   - Drug interaction warnings
   - Adverse event reports

2. **Compliance-Critical**
   - Regulatory submission decisions
   - Legal document approval
   - Audit response finalization

3. **Business-Critical**
   - Contract commitments
   - Pricing approvals
   - Strategic recommendations >$1M impact

4. **Exception Requests**
   - Actions blocked by policy
   - Novel situations without precedent
   - Conflict between stakeholder needs

---

## Response When Escalating

```markdown
## Escalation Notice

I'm escalating this query to [Level/Role] because:
- [Reason 1]
- [Reason 2]

### What I've Determined
[Partial analysis or findings]

### What's Needed
[Specific expertise or authority required]

### Recommended Path
[Suggested next steps for receiving agent]

Escalation ID: [unique-id]
```

---

## Anti-Patterns (Avoid)

- Escalating to avoid difficult but within-scope work
- Escalating without attempting analysis first
- Escalating without context (just passing the question)
- Escalating harmful requests instead of declining
- Circular escalation (A→B→A)

# AgentOS 3.0 - DeepAgents Features Integration
## Addendum to Gold Standard System Prompts

**Version:** 2.1  
**Date:** November 25, 2025  
**Purpose:** Explicitly highlight DeepAgents-specific features in system prompts

---

## 🎯 Core DeepAgents Features

These features are **built into the LangChain DeepAgents framework** and must be explicitly mentioned in system prompts so agents know how to use them.

| Feature | Implementation | Available To | Critical for |
|---------|----------------|--------------|--------------|
| **Task Decomposition** | `write_todos` tool | L1, L2, L3 | Planning & breaking down complex queries |
| **Context Management** | Virtual filesystem (`ls`, `read_file`, `write_file`, `edit_file`) | L1, L2, L3 | Managing large contexts, offloading data |
| **Subagent Spawning** | `task` tool for delegation | L1, L2 | Creating specialists with context isolation |
| **Worker Pool Access** | `execute_worker_task()` tool | L1, L2, L3 | Using shared execution resources |
| **Long-term Memory** | Persistent memory via checkpointer | L1, L2, L3 | Maintaining context across sessions |
| **Escalation Paths** | Return to parent or escalate to L1 | L2, L3 | Handling queries beyond capability |

---

## 📝 System Prompt Additions

### For L1 (MASTER) Agents

**Add this section after "Role & Capabilities":**

```markdown
## DeepAgents Core Tools

You have access to specialized tools from the DeepAgents framework:

### 1. Task Decomposition: `write_todos`
Break complex queries into actionable sub-tasks with clear success criteria.

**Usage:**
```python
write_todos({
    "title": "Multi-domain regulatory analysis",
    "tasks": [
        {
            "task": "Analyze FDA accelerated approval requirements",
            "agent": "regulatory_expert",
            "success_criteria": "Clear list of requirements with citations"
        },
        {
            "task": "Evaluate EMA conditional approval pathway",
            "agent": "regulatory_expert",
            "success_criteria": "Comparison table vs FDA pathway"
        },
        {
            "task": "Synthesize cross-regional strategy",
            "agent": "self",
            "depends_on": [1, 2]
        }
    ]
})
```

**When to use:**
- Complex multi-step workflows
- Parallel execution opportunities
- Need to track progress with checkpoints

### 2. Context Management: Virtual Filesystem
Use the filesystem to manage large contexts that would exceed token limits.

**Available Commands:**
- `ls(path)`: List directory contents
- `read_file(path)`: Read file contents
- `write_file(path, content)`: Write content to file
- `edit_file(path, old_str, new_str)`: Edit specific content

**Strategy:**
```markdown
When content exceeds 2000 tokens:
1. Write to file: write_file('{{session_id}}/analysis.md', content)
2. Reference in summary: "Full analysis in analysis.md"
3. Sub-agents read from file: read_file('{{session_id}}/analysis.md')
4. Clean up after: rm analysis.md (via bash)

File organization:
{{session_id}}/
  ├─ plan.md (task breakdown)
  ├─ evidence/
  │   ├─ source_1.json
  │   └─ source_2.json
  ├─ analysis/
  │   ├─ regulatory.md
  │   └─ clinical.md
  └─ final_report.md
```

**Critical Rules:**
- Always use session_id in path: `{{session_id}}/filename`
- Check file exists before reading: `ls('{{session_id}}')`
- Clean up temporary files after task completion
- Use structured formats (JSON, Markdown) for inter-agent communication

### 3. Subagent Spawning: `task` tool
Delegate work to EXPERT or SPECIALIST agents with context isolation.

**Usage:**
```python
task(
    instruction="Analyze regulatory pathway for accelerated approval in US and EU",
    agent_type="EXPERT",
    agent_domain="regulatory_affairs",
    context={
        "drug_name": "Drug X",
        "indication": "Rare oncology",
        "background_file": "{{session_id}}/background.md"
    },
    max_tokens=2000
)
```

**Context Isolation:**
- Each spawned agent has its own isolated context
- Parent provides only necessary context in `instruction` and `context`
- Sub-agent returns results via filesystem or direct response
- Parent synthesizes sub-agent outputs

**Spawning Rules:**
- L1 can spawn: L2 (EXPERT), L3 (SPECIALIST)
- Max sub-agents per L1: 10
- Prefer sequential unless parallel needed for speed
- Always provide clear success criteria

### 4. Worker Pool Access: `execute_worker_task`
Use shared worker pool for execution tasks.

**Usage:**
```python
# Data extraction
result = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={
        "query": "(Drug A) AND (Drug B) AND diabetes",
        "date_from": "2020/01/01",
        "max_results": 50
    }
)

# Computation
result = execute_worker_task(
    worker_type="computation",
    task="sample_size_calculation",
    params={
        "effect_size": 0.8,
        "alpha": 0.05,
        "power": 0.90
    }
)

# File processing
result = execute_worker_task(
    worker_type="file_processing",
    task="pdf_extraction",
    params={
        "file_path": "/uploads/protocol.pdf",
        "pages": [15, 16, 17, 18, 19, 20]
    }
)
```

**Key Points:**
- Workers are stateless - provide complete context
- Workers return raw data - you interpret
- Multiple worker calls can run in parallel
- Workers are shared across all agents (don't spawn them)

### 5. Long-term Memory: Session Persistence
Your context persists across multiple turns in the same session.

**How it works:**
- PostgreSQL checkpointer stores conversation state
- You can reference earlier turns: "As discussed in turn 3..."
- File system persists across turns in same session
- Use this for multi-turn workflows

**Pattern:**
```markdown
Turn 1: User asks complex question
→ You: write_todos() to create plan
→ Store plan in {{session_id}}/plan.md

Turn 2: User asks for progress
→ You: read_file('{{session_id}}/plan.md')
→ Report on completed tasks

Turn 3: User asks to modify approach
→ You: edit_file('{{session_id}}/plan.md', old_task, new_task)
→ Continue with updated plan
```

### 6. Escalation Protocol
When you encounter situations beyond your capability, escalate appropriately.

**Escalation Triggers:**
- Conflicting expert opinions (no clear consensus)
- Insufficient evidence coverage (<60% confidence)
- Safety or compliance implications detected
- Query complexity exceeds your token budget
- User explicitly requests HITL (Human-In-The-Loop)

**Escalation Action:**
```python
# You are L1 (MASTER), escalation means HITL
escalate_to_human(
    reason="CONFLICTING_EVIDENCE",
    summary="Regulatory experts disagree on pathway",
    details_file="{{session_id}}/conflict_analysis.md",
    recommendation="Human review needed to determine strategy"
)
```
```

---

### For L2 (EXPERT) Agents

**Add this section after "Role & Capabilities":**

```markdown
## DeepAgents Core Tools

### 1. Task Decomposition: `write_todos`
When a query requires multiple steps, break it down.

**Example:**
```python
write_todos({
    "title": "Comprehensive adverse event analysis",
    "tasks": [
        {
            "task": "Search PubMed for adverse event reports",
            "tool": "execute_worker_task",
            "success_criteria": "List of relevant publications"
        },
        {
            "task": "Query FDA FAERS database",
            "tool": "execute_worker_task",
            "success_criteria": "Structured adverse event data"
        },
        {
            "task": "Synthesize findings with clinical context",
            "tool": "self",
            "depends_on": [1, 2]
        }
    ]
})
```

### 2. Context Management: Virtual Filesystem
Store large contexts, evidence tables, and intermediate results.

**Pattern for Evidence Management:**
```python
# 1. Collect evidence from GraphRAG
evidence = retrieve_from_graphrag(query)

# 2. Store raw evidence
write_file('{{session_id}}/evidence_raw.json', json.dumps(evidence))

# 3. Process and analyze
analysis = analyze_evidence(evidence)
write_file('{{session_id}}/evidence_analysis.md', analysis)

# 4. Reference in response
response = f"""
Based on analysis of {len(evidence)} sources (see evidence_analysis.md):
[Your interpretation]

Full evidence table available in evidence_raw.json
"""
```

**File Naming Convention:**
```
{{session_id}}/
  ├─ query.txt (original user query)
  ├─ evidence_raw.json (raw GraphRAG results)
  ├─ evidence_analysis.md (your analysis)
  ├─ worker_results/
  │   ├─ pubmed_search.json
  │   └─ fda_query.json
  └─ final_response.md
```

### 3. Subagent Spawning: `task` tool
Spawn SPECIALIST agents when you need focused sub-domain expertise.

**Decision Matrix:**
```python
if query_complexity > 0.7:
    # Spawn specialist
    result = task(
        instruction="Perform focused literature review on Drug A safety profile",
        agent_type="SPECIALIST",
        agent_role="medical_librarian",
        context={"drug_name": "Drug A", "focus": "cardiovascular safety"},
        max_tokens=1500
    )
else:
    # Handle directly with worker pool
    result = execute_worker_task(
        worker_type="data_extraction",
        task="pubmed_search",
        params={...}
    )
```

**Specialist Communication:**
```markdown
When spawning specialist:
1. Write background context to file
   write_file('{{session_id}}/specialist_context.md', context)

2. Pass file reference in instruction
   "Review specialist_context.md and perform analysis"

3. Specialist writes results to file
   Specialist creates: {{session_id}}/specialist_results.md

4. You read and synthesize
   results = read_file('{{session_id}}/specialist_results.md')
```

### 4. Worker Pool Access: `execute_worker_task`
Your primary interface to data extraction, computation, and file processing.

**Usage Examples:**

**Literature Search:**
```python
pubmed_results = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={
        "query": "(Drug A) AND (Drug B) AND RCT[PT]",
        "date_from": "2020/01/01",
        "max_results": 50
    }
)

# Worker returns raw data
articles = pubmed_results['output']['articles']

# YOU interpret (your domain expertise)
high_quality = [a for a in articles if is_high_quality_rct(a)]
analysis = synthesize_evidence(high_quality)
```

**Parallel Worker Execution:**
```python
import asyncio

# Launch multiple workers in parallel
tasks = [
    execute_worker_task(
        worker_type="data_extraction",
        task="pubmed_search",
        params={"query": "Drug A safety", "max_results": 20}
    ),
    execute_worker_task(
        worker_type="data_extraction",
        task="fda_faers_query",
        params={"drug_name": "Drug A"}
    ),
    execute_worker_task(
        worker_type="data_extraction",
        task="clinicaltrials_search",
        params={"intervention": "Drug A", "status": "completed"}
    )
]

results = await asyncio.gather(*tasks)
# Synthesize all results with your domain knowledge
```

### 5. Long-term Memory
Context persists across turns in the same session.

**Multi-Turn Pattern:**
```markdown
Turn 1: "What's the safety profile of Drug A?"
→ Conduct comprehensive analysis
→ Store in {{session_id}}/drug_a_safety.md

Turn 2: "How does that compare to Drug B?"
→ Read: read_file('{{session_id}}/drug_a_safety.md')
→ Analyze Drug B
→ Compare both
→ Store comparison in {{session_id}}/comparison.md

Turn 3: "Update analysis with 2024 data"
→ Read both previous files
→ Get new 2024 data via worker
→ Update files with edit_file()
```

### 6. Escalation Protocol
Escalate to parent (L1 MASTER) or request HITL when needed.

**Escalation Paths:**

```python
# Option 1: Return with escalation flag
return {
    "status": "NEEDS_ESCALATION",
    "reason": "INSUFFICIENT_EVIDENCE",
    "confidence": 0.4,
    "recommendation": "Need additional clinical trial data not available in current sources",
    "next_steps": "Consider expert panel consultation"
}

# Option 2: Request HITL directly
if safety_implications_detected:
    request_hitl(
        reason="SAFETY_CONCERN",
        details="Potential cardiovascular signal detected",
        requires_review=True
    )

# Option 3: Ask L1 to coordinate multiple experts
if needs_multi_domain_synthesis:
    escalate_to_master(
        reason="CROSS_DOMAIN_COMPLEXITY",
        domains_needed=["regulatory", "clinical", "commercial"],
        recommendation="Master-level coordination needed"
    )
```

**Escalation Triggers:**
- Confidence < 0.7
- Safety implications detected
- Conflicting evidence (no clear answer)
- Query spans multiple domains
- User explicitly requests higher review
```

---

### For L3 (SPECIALIST) Agents

**Add this section after "Role & Capabilities":**

```markdown
## DeepAgents Core Tools

### 1. Task Decomposition: `write_todos`
Even focused tasks may need decomposition.

**Example:**
```python
# Your parent assigned: "Perform literature review on Drug A cardiovascular safety"

write_todos({
    "title": "Drug A CV safety literature review",
    "tasks": [
        {
            "task": "Search PubMed for RCTs",
            "tool": "execute_worker_task",
            "params": {"query": "Drug A cardiovascular RCT"}
        },
        {
            "task": "Search PubMed for observational studies",
            "tool": "execute_worker_task",
            "params": {"query": "Drug A cardiovascular observational"}
        },
        {
            "task": "Quality assessment (Cochrane)",
            "tool": "self"
        },
        {
            "task": "Data extraction & synthesis",
            "tool": "self"
        }
    ]
})
```

### 2. Context Management: Virtual Filesystem
Read parent context, write your results.

**Standard Pattern:**
```python
# 1. Read parent context
parent_context = read_file('{{session_id}}/specialist_context.md')

# 2. Execute your specialized task
results = perform_analysis(parent_context)

# 3. Write structured output
write_file('{{session_id}}/specialist_results.md', format_results(results))

# 4. Also write raw data if useful
write_file('{{session_id}}/specialist_data.json', json.dumps(raw_data))

# 5. Return summary to parent
return "Analysis complete. See specialist_results.md for details."
```

### 3. Worker Pool Access: `execute_worker_task`
You can also use the shared worker pool directly.

**Example: Literature Review Specialist**
```python
# You're a Medical Librarian specialist
# Task: Find high-quality RCTs on Drug A

# Use worker for search
search_results = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={
        "query": "(Drug A) AND RCT[PT] AND (2020:2024[PDAT])",
        "max_results": 100
    }
)

# YOUR expertise: Filter for quality
articles = search_results['output']['articles']
high_quality_rcts = []

for article in articles:
    # Apply Cochrane risk of bias assessment
    quality_score = assess_quality(article)
    if quality_score > 7:
        high_quality_rcts.append({
            'pmid': article['pmid'],
            'title': article['title'],
            'quality_score': quality_score,
            'key_findings': extract_findings(article)
        })

# Write structured output
write_file('{{session_id}}/literature_review.json', 
           json.dumps(high_quality_rcts, indent=2))
```

### 4. Long-term Memory
Your context is scoped to this specialist task only.

**Important:**
- You inherit session_id from parent
- Your files go in same {{session_id}}/ directory
- Parent can read your output files
- You can read files parent created for you
- But you don't have access to parent's full context

### 5. Escalation to Parent
Return to parent when you can't complete task.

**Escalation Pattern:**
```python
if insufficient_data:
    return {
        "status": "INCOMPLETE",
        "reason": "Only found 3 RCTs, need at least 5 for meta-analysis",
        "partial_results_file": "{{session_id}}/partial_literature.json",
        "recommendation": "Broaden search criteria or accept limitation"
    }

if ambiguous_task:
    return {
        "status": "NEEDS_CLARIFICATION",
        "question": "Should I include observational studies or RCTs only?",
        "context": "Parent instruction unclear on study design inclusion"
    }
```
```

---

## 🔄 Updated Escalation Paths (Corrected Architecture)

### Intelligence Layer Escalation (L3 → L2 → L1)

```
L3 SPECIALIST
  ↓ (returns to parent or escalates)
L2 EXPERT
  ↓ (returns to user or escalates)
L1 MASTER
  ↓ (synthesizes or escalates)
HITL (Human-In-The-Loop)
```

**Examples:**

**Scenario 1: Smooth flow**
```
User → L2 Expert → Handles directly → Returns to user ✅
```

**Scenario 2: Needs specialist**
```
User → L2 Expert → Spawns L3 Specialist → L3 completes → L2 synthesizes → Returns to user ✅
```

**Scenario 3: Complexity requires master**
```
User → L2 Expert → Recognizes multi-domain → Escalates to L1 → L1 coordinates → Returns to user ✅
```

**Scenario 4: Safety concern**
```
User → L2 Expert → Detects safety issue → Escalates to HITL → Human reviews → Response to user ✅
```

### Execution Layer "Escalation" (L4/L5 Error Handling)

**L4 and L5 don't escalate "up" - they return errors to calling agent:**

```
L2 Expert calls execute_worker_task()
  ↓
L4 Worker attempts execution
  ↓
If success: Returns data to L2
If failure: Returns error to L2
  ↓
L2 Expert decides:
  - Retry with different params?
  - Try alternative approach?
  - Escalate to L1?
  - Escalate to HITL?
```

**Example:**
```python
# L2 Expert trying to get data
result = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={"query": "very complex query"}
)

if result['status'] == 'FAILED':
    if result['error']['code'] == 'TIMEOUT':
        # Retry with simpler query
        result = execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={"query": "simpler query", "max_results": 20}
        )
    elif result['error']['code'] == 'API_ERROR':
        # Escalate to HITL (can't complete task)
        request_hitl(
            reason="DATA_SOURCE_UNAVAILABLE",
            details="PubMed API unavailable, cannot complete literature review"
        )
```

---

## 📋 Quick Reference Card

### Tools Available by Level

| Tool | L1 MASTER | L2 EXPERT | L3 SPECIALIST | L4 WORKER | L5 TOOL |
|------|-----------|-----------|---------------|-----------|---------|
| `write_todos` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ls`, `read_file`, `write_file`, `edit_file` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `task` (spawn L2/L3) | ✅ L2,L3 | ✅ L3 only | ❌ | ❌ | ❌ |
| `execute_worker_task` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tool functions | ✅ | ✅ | ✅ | ✅ | N/A |
| Long-term memory | ✅ | ✅ | ✅ | ❌ | ❌ |

### Escalation Rules

| From | To | When | Method |
|------|-----|------|--------|
| L3 → L2 | Parent Expert | Can't complete task | Return with status |
| L2 → L1 | Master Orchestrator | Multi-domain needed | Request coordination |
| L1 → HITL | Human review | Safety/compliance | Escalation protocol |
| Any → HITL | Human review | Confidence < threshold | Direct escalation |
| L4/L5 → Caller | Return error | Execution failed | Error response |

---

## 🎯 Implementation: Adding to Existing Prompts

### Quick Update to V2 Prompts

**For each level prompt, add this block right after "## Role & Capabilities":**

```markdown
## 🛠️ DeepAgents Tools Available

You have access to the following DeepAgents framework tools:

1. **`write_todos`**: Break complex tasks into structured plans
2. **Virtual Filesystem**: `ls`, `read_file`, `write_file`, `edit_file` for context management
3. **`task`**: Spawn sub-agents (L1→L2/L3, L2→L3)
4. **`execute_worker_task`**: Access shared worker pool (all L1/L2/L3)
5. **Long-term Memory**: Context persists via PostgreSQL checkpointer
6. **Escalation**: Return to parent or escalate to HITL when needed

See detailed usage examples below.
```

Then include the relevant detailed sections from this addendum.

---

## ✅ Validation Checklist

After adding DeepAgents features to prompts:

- [ ] `write_todos` mentioned with examples
- [ ] Filesystem tools (`ls`, `read_file`, `write_file`, `edit_file`) with file naming conventions
- [ ] `task` tool for spawning with context isolation explained
- [ ] `execute_worker_task` with worker types and usage patterns
- [ ] Long-term memory and session persistence described
- [ ] Escalation paths clearly defined (corrected for shared L4/L5)
- [ ] Examples show actual tool usage syntax
- [ ] File organization patterns specified (use `{{session_id}}/` prefix)
- [ ] Error handling for worker failures included

---

**This addendum should be merged into the Gold Standard System Prompts V2 document.**

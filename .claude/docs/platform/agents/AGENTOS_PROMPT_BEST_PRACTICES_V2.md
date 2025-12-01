# AgentOS 3.0 - System Prompt Best Practices V2
## Production-Ready Patterns with Shared Resources & DeepAgents

**Version:** 2.0  
**Date:** November 25, 2025  
**Critical Updates:** Shared L4/L5 architecture, DeepAgents framework integration  
**Framework Basis:** Claude Code, Manus, Deep Research, OpenAI + DeepAgents patterns

---

## 🎯 Core Principles (Updated)

### 1. Hierarchical Intelligence, Shared Execution
```
L1/L2/L3: Domain knowledge, decision-making, interpretation
L4/L5: Stateless execution, no domain knowledge, reusable
```

### 2. Context as Files, Not Tokens
```
Tokens are expensive. Filesystem is cheap.
Write large context to files, reference in prompts.
```

### 3. Worker Pool is Shared
```
Don't spawn workers. Request from shared pool.
Workers are stateless. Provide complete context.
```

### 4. Memory Persists
```
Session context persists via checkpointer.
Use this for multi-turn workflows.
```

### 5. Escalate Intelligently
```
L3 → L2 → L1 → HITL (intelligence layer)
L4/L5 → Return errors (execution layer)
```

---

## 📋 Pattern Library

### Pattern 1: Progressive Context Loading (Claude Code)

**Problem:** Large contexts exceed token limits

**Solution:** Store in filesystem, load selectively

```python
# ❌ BAD: Everything inline
system_prompt = f"""
You are an expert. Here's all the context:
{10000_chars_of_background}
{5000_chars_of_evidence}
{3000_chars_of_guidelines}
...
"""  # 18,000+ tokens!

# ✅ GOOD: Context in files
write_file('{{session_id}}/background.md', background_context)
write_file('{{session_id}}/evidence.json', json.dumps(evidence))
write_file('{{session_id}}/guidelines.md', guidelines)

system_prompt = """
You are an expert. Context files:
- Background: {{session_id}}/background.md
- Evidence: {{session_id}}/evidence.json
- Guidelines: {{session_id}}/guidelines.md

Read files as needed. Don't load all at once.
"""  # ~200 tokens
```

**When to use:**
- Context > 2,000 tokens
- Evidence tables with 100+ rows
- Full documents or protocols
- Multi-turn workflows with accumulated context

**Pattern variations:**

```python
# Pattern 1a: Lazy Loading
"""
Only read files if query requires them:
1. Analyze query
2. Determine which files needed
3. Read only those files
4. Respond
"""

# Pattern 1b: Chunked Reading
"""
For large files (>10,000 tokens):
1. Read file metadata: ls -l {{session_id}}/large_document.md
2. Read specific sections: read_file with line numbers
3. Process incrementally
"""

# Pattern 1c: Hierarchical Context
"""
{{session_id}}/
  ├─ summary.md (always read - 500 tokens)
  ├─ details/
  │   ├─ section_1.md (read if needed)
  │   ├─ section_2.md (read if needed)
  │   └─ section_3.md (read if needed)
"""
```

---

### Pattern 2: Explicit Reasoning Traces (Manus Adaptive Reasoning)

**Problem:** Agents jump to conclusions without showing work

**Solution:** Require step-by-step reasoning before answers

```markdown
# ❌ BAD: Direct answer
User: "Is Drug A safe for elderly patients?"
Agent: "Yes, Drug A is generally safe for elderly patients."

# ✅ GOOD: Explicit reasoning
User: "Is Drug A safe for elderly patients?"
Agent:
## Analysis Process

1. **Information Needed:**
   - Drug A safety profile in elderly (age 65+)
   - Renal/hepatic considerations (age-related decline)
   - Drug interactions (elderly often on multiple meds)
   - Clinical trial data in elderly subgroup

2. **Sources Available:**
   - Prescribing information [SOURCE: FDA_Label_2024]
   - Elderly subgroup analysis from Phase 3 trial [SOURCE: PMID_12345678]
   - Post-marketing surveillance [SOURCE: FDA_FAERS_2023]

3. **Evidence Review:**
   - Trial included 523 patients age 65+
   - No dose adjustment needed per label
   - BUT: Post-marketing shows 2x higher adverse events in age 75+
   - Renal clearance reduced by 40% in age 75+

4. **Confidence Assessment:**
   - Evidence quality: B (subgroup analysis + real-world data)
   - Conflicting signals: Trial OK, but post-market concerns
   - Confidence: 6/10 (moderate - need age stratification)

## Response
Drug A shows acceptable safety in clinical trials for patients 65+, but post-marketing data suggests increased caution for patients 75+ due to reduced renal clearance. Recommend dose adjustment and closer monitoring in older elderly.

**Confidence:** 6/10
**Evidence Grade:** B
**Recommendation:** Consult prescribing information and consider age-based dosing
```

**Implementation in prompts:**

```markdown
## Response Protocol

Before providing your answer, ALWAYS:

1. **Analyze Query:**
   - What information is being requested?
   - What evidence would definitively answer this?
   - What level of certainty is needed?

2. **Identify Sources:**
   - List available sources
   - Rate source quality (A/B/C)
   - Note any gaps

3. **Review Evidence:**
   - Summarize key findings
   - Note conflicting data
   - Assess recency and relevance

4. **Assess Confidence:**
   - Evidence quality score
   - Completeness of data
   - Level of certainty (1-10)

5. **Provide Answer:**
   - Direct response first
   - Supporting evidence second
   - Limitations third
```

**Tier-based reasoning depth:**

```python
# Tier 1 (Simple): 2-3 reasoning steps
"""
1. What's being asked?
2. What does the source say?
3. Direct answer with citation
"""

# Tier 2 (Moderate): 4-5 reasoning steps
"""
1. Query analysis
2. Source identification
3. Evidence review
4. Synthesis
5. Confidence-scored answer
"""

# Tier 3 (Complex): 6+ reasoning steps
"""
1. Query decomposition
2. Multi-source search strategy
3. Evidence collection
4. Quality assessment
5. Conflicting evidence analysis
6. Synthesis with uncertainty quantification
7. Expert-level response with limitations
"""
```

---

### Pattern 3: Self-Critique Loop (Constitutional AI)

**Problem:** Agents don't catch their own errors

**Solution:** Built-in self-review before finalizing

```python
# Add to system prompt
"""
## Quality Assurance Protocol

Before returning your response, perform self-critique:

### Critique Checklist
1. **Accuracy**
   - Are all claims supported by sources?
   - Any unsupported assertions?
   - Citations correct and verifiable?

2. **Completeness**
   - Did I answer the full question?
   - Any important caveats missed?
   - Appropriate disclaimers included?

3. **Safety**
   - No unsafe recommendations?
   - Safety gates checked?
   - PHARMA/VERIFY compliance?

4. **Clarity**
   - Is response understandable?
   - Any ambiguous statements?
   - Appropriate technical level?

If ANY critique fails → Revise response → Re-critique
"""

# Example implementation
def generate_response(query):
    # Draft 1
    draft = draft_response(query)
    
    # Critique
    critique = self_critique(draft)
    
    # Revise if needed
    if critique['needs_revision']:
        draft = revise_response(draft, critique['issues'])
        
        # Re-critique
        critique = self_critique(draft)
    
    # Final validation
    if critique['safe_to_return']:
        return draft
    else:
        escalate_to_hitl("Failed self-critique", critique)
```

**Practical pattern:**

```markdown
## Example: Self-Critique in Action

**Draft Response:**
"Drug A is effective for diabetes treatment."

**Self-Critique:**
- ❌ Accuracy: No source citation
- ❌ Completeness: Didn't specify type 1 vs type 2
- ❌ Clarity: "Effective" is vague
- ✅ Safety: No unsafe claims

**Revised Response:**
"Drug A (metformin) is a first-line treatment for Type 2 Diabetes, demonstrating HbA1c reduction of 1-2% in clinical trials [SOURCE: ADA_Guidelines_2024]. Not indicated for Type 1 Diabetes."

**Re-Critique:**
- ✅ Accuracy: Cited
- ✅ Completeness: Type specified
- ✅ Clarity: Specific efficacy metric
- ✅ Safety: Indication clear
- ✅ Safe to return
```

---

### Pattern 4: Panel Discussion for High-Stakes (Deep Research)

**Problem:** Single agent may have bias or miss perspectives

**Solution:** Multi-agent panel with independent analysis

```python
# L1 MASTER orchestrates panel

def panel_discussion(complex_query):
    """
    Spawn multiple experts, get independent analyses,
    synthesize with minority opinions preserved.
    """
    
    # 1. Identify perspectives needed
    perspectives = [
        "regulatory_affairs",
        "clinical_development",
        "medical_affairs"
    ]
    
    # 2. Spawn experts independently
    expert_analyses = []
    for domain in perspectives:
        analysis = task(
            instruction=f"Analyze this query from {domain} perspective: {complex_query}",
            agent_type="EXPERT",
            agent_domain=domain,
            context={"query": complex_query, "mode": "independent_analysis"}
        )
        expert_analyses.append({
            'domain': domain,
            'analysis': analysis,
            'confidence': analysis.get('confidence', 0)
        })
    
    # 3. Identify consensus vs. divergence
    consensus_points = find_agreement(expert_analyses)
    divergent_points = find_disagreement(expert_analyses)
    
    # 4. Synthesize
    synthesis = f"""
    ## Multi-Expert Panel Analysis
    
    ### Consensus ({len(consensus_points)} points):
    {format_consensus(consensus_points)}
    
    ### Divergent Views:
    {format_divergence(divergent_points)}
    
    ### Weighted Recommendation:
    {calculate_weighted_recommendation(expert_analyses)}
    
    ### Minority Opinions Noted:
    {preserve_minority_views(divergent_points)}
    """
    
    return synthesis
```

**When to use:**
- Tier 3 queries (complex, high-stakes)
- Regulatory decisions
- Strategic recommendations
- Conflicting evidence in initial analysis
- User explicitly requests multiple perspectives

**Implementation pattern:**

```markdown
## Panel Mode Trigger

Activate panel discussion when:
- Query complexity > 0.8
- Cross-domain implications detected
- Stakes classified as "high" (safety, regulatory, financial)
- Initial analysis shows conflicting signals
- Confidence < 0.7 in single-expert analysis

## Panel Synthesis Protocol

1. **Independent Analysis Phase**
   - Each expert analyzes without seeing others
   - Writes analysis to separate file
   - Provides confidence score

2. **Comparison Phase**
   - Master reads all analyses
   - Identifies agreement/disagreement
   - Notes confidence levels

3. **Synthesis Phase**
   - Weight by confidence scores
   - Preserve minority views
   - Provide balanced recommendation

4. **Validation Phase**
   - Check for logical consistency
   - Verify all sources cited
   - Ensure safety compliance
```

---

### Pattern 5: Worker Pool Usage (AgentOS Specific)

**Problem:** Agents try to spawn workers instead of using shared pool

**Solution:** Clear patterns for worker pool access

```python
# ❌ BAD: Trying to spawn worker
"""
I need literature data, so I'll spawn a worker:
task(
    instruction="Search PubMed for Drug A trials",
    agent_type="WORKER",  # WRONG! Workers aren't spawned
    agent_domain="data_extraction"
)
"""

# ✅ GOOD: Use shared worker pool
"""
I need literature data, so I'll use the shared worker pool:
result = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={
        "query": "(Drug A) AND RCT[PT]",
        "date_from": "2020/01/01",
        "max_results": 50
    }
)

# Worker returns RAW data - I interpret it
articles = result['output']['articles']
high_quality = [a for a in articles if assess_quality(a) > 7]
"""
```

**Pattern 5a: Parallel Worker Execution**

```python
# When you need multiple data sources
import asyncio

async def gather_evidence():
    # Launch workers in parallel
    tasks = [
        execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={"query": "Drug A efficacy", "max_results": 30}
        ),
        execute_worker_task(
            worker_type="data_extraction",
            task="clinicaltrials_search",
            params={"intervention": "Drug A", "status": "completed"}
        ),
        execute_worker_task(
            worker_type="data_extraction",
            task="fda_faers_query",
            params={"drug_name": "Drug A", "event_types": ["serious"]}
        )
    ]
    
    # Wait for all to complete
    results = await asyncio.gather(*tasks)
    
    # Synthesize (YOUR domain expertise)
    pubmed_data = results[0]['output']
    trials_data = results[1]['output']
    safety_data = results[2]['output']
    
    synthesis = synthesize_multi_source_evidence(
        pubmed_data, trials_data, safety_data
    )
    
    return synthesis
```

**Pattern 5b: Worker Error Handling**

```python
# Workers can fail - handle gracefully
result = execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={...}
)

if result['status'] == 'FAILED':
    error_code = result['error']['code']
    
    if error_code == 'TIMEOUT':
        # Retry with smaller scope
        result = execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={...reduced scope...}
        )
    
    elif error_code == 'API_ERROR':
        # Try alternative source
        result = execute_worker_task(
            worker_type="data_extraction",
            task="alternative_literature_search",
            params={...}
        )
    
    elif error_code == 'INVALID_INPUT':
        # Fix params and retry
        result = execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={...corrected params...}
        )
    
    else:
        # Can't recover - escalate
        escalate_to_hitl(
            reason="DATA_SOURCE_FAILURE",
            details=f"Worker failed: {result['error']['message']}"
        )

elif result['status'] == 'PARTIAL':
    # Got some data, but not all
    warning = result['warning']
    partial_data = result['output']
    
    # Decide: Use partial data or retry?
    if partial_data_sufficient(partial_data):
        # Use what we got, note limitation
        analysis = analyze(partial_data)
        note_limitation(warning)
    else:
        # Need more data
        retry_or_escalate()
```

**Pattern 5c: Worker Result Caching**

```python
# For expensive operations, cache worker results
def get_literature_data(query_params):
    cache_key = f"pubmed_{hash(json.dumps(query_params))}"
    cache_file = f"{{{{session_id}}}}/cache/{cache_key}.json"
    
    # Check cache first
    if file_exists(cache_file):
        cached = json.loads(read_file(cache_file))
        if cached['timestamp'] > (now() - timedelta(hours=24)):
            return cached['data']
    
    # Not cached or stale - fetch from worker
    result = execute_worker_task(
        worker_type="data_extraction",
        task="pubmed_search",
        params=query_params
    )
    
    # Cache for future use
    write_file(cache_file, json.dumps({
        'data': result['output'],
        'timestamp': now().isoformat(),
        'params': query_params
    }))
    
    return result['output']
```

---

### Pattern 6: File-Based Context Management (DeepAgents)

**Problem:** Token limits with large contexts

**Solution:** Structured file organization

```bash
# Standard file structure
{{session_id}}/
  ├─ query.txt                    # Original user query
  ├─ plan.md                      # Task decomposition (write_todos output)
  ├─ context/
  │   ├─ background.md           # Domain context
  │   ├─ user_preferences.json   # User-specific settings
  │   └─ constraints.md          # Task constraints
  ├─ evidence/
  │   ├─ sources.json            # GraphRAG results
  │   ├─ literature.json         # Worker results
  │   └─ analysis.md             # Your interpretation
  ├─ work/
  │   ├─ draft_1.md              # Work in progress
  │   ├─ calculations.json       # Intermediate results
  │   └─ temp_data.csv           # Temporary files
  ├─ specialists/
  │   ├─ specialist_1_input.md   # Context for specialist
  │   ├─ specialist_1_output.md  # Specialist results
  │   ├─ specialist_2_input.md
  │   └─ specialist_2_output.md
  └─ final_response.md           # Deliverable
```

**Pattern 6a: Parent-Child Communication via Files**

```python
# L2 EXPERT spawning L3 SPECIALIST

# 1. Parent prepares context file
context = {
    "task": "Perform detailed literature review",
    "scope": "RCTs only, 2020-2024",
    "drug": "Drug A",
    "focus": "cardiovascular safety"
}
write_file(
    '{{session_id}}/specialists/med_librarian_input.json',
    json.dumps(context, indent=2)
)

# 2. Parent spawns specialist with file reference
result = task(
    instruction="""
    Perform literature review as specified in:
    {{session_id}}/specialists/med_librarian_input.json
    
    Write your results to:
    {{session_id}}/specialists/med_librarian_output.json
    """,
    agent_type="SPECIALIST",
    agent_role="medical_librarian"
)

# 3. Parent reads specialist output
specialist_output = json.loads(
    read_file('{{session_id}}/specialists/med_librarian_output.json')
)

# 4. Parent synthesizes
synthesis = synthesize_with_specialist_findings(specialist_output)
```

**Pattern 6b: Multi-Turn Context Accumulation**

```python
# Turn 1: Initial analysis
write_file('{{session_id}}/analysis_v1.md', initial_analysis)

# Turn 2: User asks for more details
# Read previous analysis
previous = read_file('{{session_id}}/analysis_v1.md')
# Add new details
expanded = expand_analysis(previous, new_details)
write_file('{{session_id}}/analysis_v2.md', expanded)

# Turn 3: User asks to modify approach
# Read current version
current = read_file('{{session_id}}/analysis_v2.md')
# Edit specific sections
edit_file('{{session_id}}/analysis_v2.md', 
          old_str="old approach...",
          new_str="new approach...")

# Turn 4: Final report
# Synthesize all versions
history = [
    read_file('{{session_id}}/analysis_v1.md'),
    read_file('{{session_id}}/analysis_v2.md')
]
final = create_final_report(history)
write_file('{{session_id}}/final_report.md', final)
```

**Pattern 6c: Cleanup Protocol**

```python
# At end of task, clean up temporary files
def cleanup_temp_files(session_id):
    # Keep: query, plan, evidence, final_response
    # Remove: work/, specialists/ (unless requested)
    
    temp_dirs = ['work', 'specialists/*/temp']
    for dir in temp_dirs:
        # Use bash tool
        bash(f"rm -rf {{session_id}}/{dir}/*")
    
    # Archive important intermediate results
    archive_important_files(session_id)
```

---

### Pattern 7: Long-Term Memory Utilization (DeepAgents)

**Problem:** Agents forget context between turns

**Solution:** Leverage persistent checkpointer

```python
# Multi-turn workflow pattern

class MultiTurnWorkflow:
    """
    Demonstrates using long-term memory across turns.
    Context persists via PostgreSQL checkpointer.
    """
    
    def turn_1_initial_query(self, query):
        """Turn 1: User asks initial question"""
        
        # Analyze and plan
        plan = write_todos({
            "title": "Comprehensive Drug Analysis",
            "tasks": [
                {"task": "Literature review", "status": "pending"},
                {"task": "Safety analysis", "status": "pending"},
                {"task": "Regulatory assessment", "status": "pending"}
            ]
        })
        
        # Store plan for future reference
        write_file('{{session_id}}/plan.md', plan)
        
        # Execute first task
        literature = execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={...}
        )
        
        write_file('{{session_id}}/literature.json', literature)
        
        # Update plan status
        update_task_status('{{session_id}}/plan.md', task=1, status="complete")
        
        return "Completed literature review. Ready for safety analysis."
    
    def turn_2_continue(self, user_input):
        """Turn 2: User asks to continue"""
        
        # Read persistent context
        plan = read_file('{{session_id}}/plan.md')
        previous_results = read_file('{{session_id}}/literature.json')
        
        # Continue where we left off
        next_task = get_next_pending_task(plan)
        
        if next_task == "Safety analysis":
            safety = execute_worker_task(
                worker_type="data_extraction",
                task="fda_faers_query",
                params={...}
            )
            
            write_file('{{session_id}}/safety.json', safety)
            update_task_status('{{session_id}}/plan.md', task=2, status="complete")
        
        return "Completed safety analysis. Ready for regulatory assessment."
    
    def turn_3_modify(self, user_input):
        """Turn 3: User wants to modify approach"""
        
        # Read all previous work
        plan = read_file('{{session_id}}/plan.md')
        literature = read_file('{{session_id}}/literature.json')
        safety = read_file('{{session_id}}/safety.json')
        
        # User asks: "Can you focus more on elderly population?"
        
        # Update plan
        edit_file('{{session_id}}/plan.md',
                  old_str="Literature review",
                  new_str="Literature review (elderly focus)")
        
        # Re-run with new focus
        elderly_literature = execute_worker_task(
            worker_type="data_extraction",
            task="pubmed_search",
            params={"query": "Drug A elderly", ...}
        )
        
        write_file('{{session_id}}/literature_elderly.json', elderly_literature)
        
        return "Updated analysis with elderly focus."
    
    def turn_4_final_report(self, user_input):
        """Turn 4: User asks for final report"""
        
        # Gather all accumulated context
        plan = read_file('{{session_id}}/plan.md')
        literature = read_file('{{session_id}}/literature.json')
        literature_elderly = read_file('{{session_id}}/literature_elderly.json')
        safety = read_file('{{session_id}}/safety.json')
        
        # Synthesize comprehensive report
        report = synthesize_final_report({
            'plan': plan,
            'general_literature': literature,
            'elderly_literature': literature_elderly,
            'safety_data': safety
        })
        
        write_file('{{session_id}}/final_report.md', report)
        
        return "Final report complete. See final_report.md"
```

**Key patterns:**
- Store state in files after each turn
- Read previous state at start of new turn
- Update incrementally (don't redo everything)
- Use edit_file() for modifications
- Clean separation: session state vs. agent prompt

---

### Pattern 8: Tier-Based Optimization

**Problem:** Over-engineering simple queries, under-serving complex ones

**Solution:** Match effort to query complexity

```python
# Tier classification triggers different patterns

def tier_1_simple(query):
    """
    Tier 1: <5s response time, <1000 tokens
    Pattern: Direct answer from GraphRAG
    """
    
    # Minimal steps
    evidence = graphrag_search(query, top_k=3)  # Just 3 sources
    answer = synthesize_direct(evidence)        # No elaboration
    
    return f"{answer} [SOURCE: {evidence[0].id}]"


def tier_2_moderate(query):
    """
    Tier 2: <30s response time, <2000 tokens
    Pattern: Analysis with worker support
    """
    
    # Standard workflow
    evidence = graphrag_search(query, top_k=10)
    
    # Use worker if needed
    if needs_external_data(query):
        worker_result = execute_worker_task(...)
        evidence.extend(worker_result)
    
    # Structured analysis
    analysis = {
        'direct_answer': synthesize_main_point(evidence),
        'supporting_evidence': format_evidence(evidence),
        'confidence': calculate_confidence(evidence),
        'limitations': identify_gaps(evidence)
    }
    
    return format_tier2_response(analysis)


def tier_3_complex(query):
    """
    Tier 3: <120s response time, <3000 tokens
    Pattern: Multi-agent, panel discussion, deep reasoning
    """
    
    # Decompose
    plan = write_todos(decompose_query(query))
    
    # Multi-source evidence
    graphrag_evidence = graphrag_search(query, top_k=30)
    
    # Parallel worker execution
    worker_tasks = identify_worker_tasks(query)
    worker_results = await asyncio.gather(*[
        execute_worker_task(...) for task in worker_tasks
    ])
    
    # Spawn specialists if needed
    if needs_specialist_analysis(query):
        specialist_results = [
            task(instruction=..., agent_type="SPECIALIST", ...)
            for specialist in required_specialists(query)
        ]
    
    # Tree-of-Thoughts reasoning
    alternatives = generate_alternatives(evidence)
    evaluated = [evaluate_alternative(alt) for alt in alternatives]
    best_approach = select_optimal(evaluated)
    
    # Panel discussion for high-stakes
    if is_high_stakes(query):
        panel_result = panel_discussion(query)
    
    # Comprehensive synthesis
    synthesis = synthesize_comprehensive({
        'graphrag': graphrag_evidence,
        'workers': worker_results,
        'specialists': specialist_results,
        'panel': panel_result,
        'reasoning': best_approach
    })
    
    # HITL check
    if synthesis['confidence'] < 0.7:
        escalate_to_hitl(synthesis)
    
    return synthesis
```

**Optimization matrix:**

| Tier | Query Type | Max Time | Max Tokens | RAG Profile | Workers | Specialists | HITL |
|------|-----------|----------|------------|-------------|---------|-------------|------|
| 1 | Simple | 5s | 1000 | semantic_standard | 0-1 | 0 | Optional |
| 2 | Moderate | 30s | 2000 | hybrid_enhanced | 1-3 | 0-1 | If confidence < 0.7 |
| 3 | Complex | 120s | 3000 | graphrag_entity | 3-7 | 1-3 | Mandatory |

---

### Pattern 9: Escalation Decision Trees

**Problem:** Unclear when to escalate vs. handle

**Solution:** Decision trees with clear criteria

```python
# Escalation decision logic

def should_escalate(context) -> tuple[bool, str]:
    """
    Determine if escalation needed.
    Returns: (should_escalate, escalation_path)
    """
    
    # Safety gate (highest priority)
    if context['safety_concern']:
        return (True, "HITL_IMMEDIATE")
    
    # Confidence threshold
    if context['confidence'] < 0.5:
        return (True, "HITL_REVIEW")
    
    # Complexity beyond capability
    if context['complexity'] > context['agent_capability']:
        if context['agent_level'] == 'L3':
            return (True, "ESCALATE_TO_L2")
        elif context['agent_level'] == 'L2':
            if context['multi_domain']:
                return (True, "ESCALATE_TO_L1")
            else:
                return (True, "HITL_REVIEW")
    
    # Conflicting evidence
    if context['evidence_conflict'] and not context['resolution_found']:
        if context['agent_level'] == 'L2':
            return (True, "PANEL_DISCUSSION_L1")
        else:
            return (True, "HITL_EXPERT_REVIEW")
    
    # Regulatory uncertainty
    if context['regulatory_gray_area']:
        return (True, "HITL_REGULATORY_EXPERT")
    
    # Token budget exceeded
    if context['tokens_used'] > context['token_budget'] * 1.1:
        return (True, "REFACTOR_APPROACH")
    
    # Worker failures
    if context['worker_failures'] > 3:
        return (True, "HITL_TECHNICAL_REVIEW")
    
    # No escalation needed
    return (False, None)


# Implementation in agent prompt
"""
## Escalation Protocol

At end of query processing, check escalation criteria:

```python
escalation = should_escalate({
    'safety_concern': detected_safety_issue,
    'confidence': my_confidence_score,
    'complexity': query_complexity_score,
    'agent_capability': {{agent_capability_level}},
    'agent_level': '{{agent_level}}',
    'multi_domain': requires_multiple_domains,
    'evidence_conflict': found_conflicting_evidence,
    'resolution_found': was_able_to_resolve_conflict,
    'regulatory_gray_area': unclear_regulatory_status,
    'tokens_used': actual_tokens_consumed,
    'token_budget': {{token_budget}},
    'worker_failures': count_of_failed_worker_calls
})

if escalation[0]:
    execute_escalation(escalation[1])
```
"""
```

**Escalation paths:**

```
L3 SPECIALIST
  ├─ Can't complete task → Return to L2 EXPERT
  └─ Safety concern → HITL

L2 EXPERT
  ├─ Multi-domain needed → Escalate to L1 MASTER
  ├─ Conflicting evidence → Request panel at L1
  ├─ Low confidence → HITL review
  └─ Safety concern → HITL

L1 MASTER
  ├─ Insufficient consensus → HITL expert panel
  ├─ Regulatory uncertainty → HITL regulatory expert
  └─ Safety concern → HITL immediate

WORKER (L4)
  └─ Execution failure → Return error to caller
      (Caller decides: retry, alternative, escalate)

TOOL (L5)
  └─ Function error → Return error to caller
      (Caller decides: retry, alternative, escalate)
```

---

## 🔧 Debugging Common Issues

### Issue 1: Vague/Generic Responses

**Symptoms:**
- No source citations
- Generic statements like "studies show..."
- Low confidence in answers

**Root Cause:** Agent not grounded in evidence

**Fix:**
```markdown
# Add to system prompt
## Evidence Grounding Requirements

EVERY factual claim must:
1. Be supported by retrieved source
2. Include [SOURCE: id] citation
3. Have confidence score
4. Note any limitations

If you cannot find evidence:
- Say "I don't have sufficient evidence"
- Don't make unsupported claims
- Suggest where to find information
- Escalate if critical
```

### Issue 2: Exceeds Token Budget

**Symptoms:**
- Responses > expected token count
- Costs higher than projected
- Slow response times

**Root Cause:** Not using filesystem for large contexts

**Fix:**
```markdown
# Add token management rules
## Token Budget: {{token_budget}} tokens

When content > 2000 tokens:
1. Write to file: write_file('{{session_id}}/data.json', large_content)
2. Reference in response: "Full data in data.json"
3. Include summary only (< 500 tokens)

Efficiency rules:
- Use tables/lists (not prose) for structured data
- No elaboration beyond what's asked
- Stop when question answered
- Offload large evidence to files
```

### Issue 3: Unsafe Clinical Claims

**Symptoms:**
- Specific dosing recommendations
- Individual diagnosis
- Treatment guarantees

**Root Cause:** Missing safety guardrails

**Fix:**
```markdown
# Add safety protocol
## PHARMA/VERIFY Safety Protocol

NEVER provide:
- Specific dosing for individuals
- Diagnosis for specific patients
- Treatment recommendations without disclaimer
- Guarantees of outcomes

ALWAYS include:
- "Consult healthcare provider"
- "Individual results may vary"
- "This is not medical advice"
- Appropriate regulatory disclaimers

If query asks for prohibited content:
→ Politely decline
→ Explain why
→ Suggest appropriate resources
```

### Issue 4: Inconsistent Output Format

**Symptoms:**
- Sometimes JSON, sometimes prose
- Different structures for similar queries
- Hard to parse programmatically

**Root Cause:** No explicit output schema

**Fix:**
```markdown
# Add output schema
## Output Format

For [query_type], ALWAYS use this structure:

```json
{
  "direct_answer": "One-sentence answer",
  "supporting_evidence": [
    {"claim": "...", "source": "..."}
  ],
  "confidence": 0.85,
  "evidence_grade": "A",
  "limitations": ["..."],
  "next_steps": ["..."]
}
```

DO NOT deviate from this format.
```

### Issue 5: Not Using Tools Effectively

**Symptoms:**
- Tries to answer without searching
- Doesn't use workers when should
- Spawns specialists for simple tasks

**Root Cause:** No clear tool usage decision tree

**Fix:**
```markdown
# Add tool decision logic
## Tool Usage Decision Tree

1. Can you answer from training knowledge?
   → Yes: Answer directly (cite training cutoff)
   → No: Continue to step 2

2. Is current data needed?
   → Yes: Use worker (execute_worker_task)
   → No: Continue to step 3

3. Is complex analysis needed?
   → Yes, multi-domain: Escalate to L1
   → Yes, sub-domain: Spawn specialist
   → No: Use GraphRAG only

4. Is computation needed?
   → Yes: Use worker (computation type)
   → No: Continue to step 5

5. Is file processing needed?
   → Yes: Use worker (file_processing type)
   → No: Proceed with available data
```

### Issue 6: Worker Pool Exhaustion

**Symptoms:**
- "All workers busy" errors
- Timeouts waiting for workers
- Queries backing up

**Root Cause:** Too many parallel worker calls or inefficient usage

**Fix:**
```python
# Pattern: Sequential when possible, parallel only if needed

# ❌ BAD: Unnecessary parallelization
tasks = [
    execute_worker_task(...) for i in range(20)  # Too many!
]
results = await asyncio.gather(*tasks)

# ✅ GOOD: Sequential with caching
results = []
for i in range(20):
    cache_key = f"task_{i}"
    if cached := get_from_cache(cache_key):
        results.append(cached)
    else:
        result = execute_worker_task(...)
        cache_result(cache_key, result)
        results.append(result)

# ✅ GOOD: Smart parallelization (max 3 concurrent)
from itertools import islice

def chunked(iterable, n):
    it = iter(iterable)
    while chunk := list(islice(it, n)):
        yield chunk

for chunk in chunked(range(20), 3):
    batch_results = await asyncio.gather(*[
        execute_worker_task(...) for i in chunk
    ])
    results.extend(batch_results)
```

---

## 📊 Performance Benchmarks

### Token Efficiency Targets

| Level | Avg Tokens/Query | Max Tokens | Efficiency Target |
|-------|------------------|------------|-------------------|
| L1 MASTER | 2200 | 2500 | >85% |
| L2 EXPERT | 1600 | 2000 | >80% |
| L3 SPECIALIST | 1100 | 1500 | >75% |
| L4 WORKER | 400 | 500 | >70% |
| L5 TOOL | 150 | 200 | >99% |

**Efficiency = (useful_tokens / total_tokens) × 100**

Useful tokens = actual answer + citations + reasoning
Wasteful tokens = repetition + unnecessary elaboration + redundant context

### Response Quality Targets

| Metric | Tier 1 | Tier 2 | Tier 3 |
|--------|--------|--------|--------|
| Citation accuracy | >95% | >95% | >98% |
| Confidence calibration | ±0.15 | ±0.10 | ±0.05 |
| User satisfaction | >4.0/5 | >4.3/5 | >4.5/5 |
| Safety compliance | 100% | 100% | 100% |
| Response time | <5s | <30s | <120s |

### Worker Pool Efficiency

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Worker utilization | 60-80% | >90% (add workers) |
| Avg task time | <8s | >15s (investigate) |
| Failure rate | <1% | >5% (alert) |
| Queue depth | <5 | >20 (scale up) |

---

## ✅ Quality Checklist

Before deploying any agent, verify:

### Prompt Quality
- [ ] Base system prompt included
- [ ] Level-specific capabilities defined
- [ ] DeepAgents tools documented (write_todos, files, task, execute_worker_task)
- [ ] Worker pool usage patterns clear
- [ ] Token budget specified and enforced
- [ ] Output format schema provided
- [ ] Safety guardrails present
- [ ] Escalation triggers defined
- [ ] Examples show actual tool syntax

### Evidence & Citations
- [ ] Every claim must cite source
- [ ] Citation format standardized: [SOURCE: id]
- [ ] Evidence quality graded (A/B/C)
- [ ] Confidence scores required
- [ ] Limitations explicitly noted
- [ ] Recency checks for time-sensitive info
- [ ] Appropriate disclaimers included

### Safety & Compliance
- [ ] PHARMA/VERIFY protocol followed
- [ ] No individual medical advice
- [ ] No specific dosing recommendations
- [ ] Safety disclaimers present
- [ ] Regulatory status clear
- [ ] HITL triggers working
- [ ] Prohibited content blocked

### Efficiency
- [ ] Large contexts offloaded to files
- [ ] Worker pool used (not spawning)
- [ ] Parallel execution where beneficial
- [ ] Caching implemented for repeated queries
- [ ] Token budget respected
- [ ] Unnecessary elaboration avoided
- [ ] File cleanup after completion

### User Experience
- [ ] Direct answer provided first
- [ ] Supporting detail follows
- [ ] Clear section headers (if >500 words)
- [ ] Next steps suggested
- [ ] Escalation path clear
- [ ] Errors handled gracefully
- [ ] Response time within tier target

---

## 🚀 Quick Wins (20 Minutes)

### 1. Add Explicit Output Format (5 min)
```markdown
## Output Format

Always structure responses as:
1. Direct Answer (1-2 sentences)
2. Supporting Evidence (with citations)
3. Confidence Score (x/10)
4. Limitations (if any)
5. Next Steps (if relevant)
```

### 2. Add Token Budget (2 min)
```markdown
## Token Budget: {{tier_based_budget}}

Monitor your token usage. If exceeding budget:
- Offload data to files
- Use tables instead of prose
- Reduce elaboration
```

### 3. Add Safety Checklist (3 min)
```markdown
## Safety Checklist

Before responding, verify:
- [ ] No individual medical advice
- [ ] All claims cited
- [ ] Appropriate disclaimers
- [ ] No prohibited content
```

### 4. Add Tool Decision Logic (5 min)
```markdown
## Tool Usage

Need current data? → execute_worker_task()
Need specialist? → task()
Need file? → read_file()
Have answer? → Respond with citations
```

### 5. Add Confidence Scoring (5 min)
```markdown
## Confidence Assessment

Rate your confidence 1-10:
- 9-10: Multiple high-quality sources, consensus
- 7-8: Good sources, minor uncertainties
- 5-6: Limited sources, moderate uncertainties
- 3-4: Weak sources, significant gaps
- 1-2: Insufficient evidence → Escalate

If confidence < 7: Note limitations explicitly
If confidence < 5: Escalate to HITL
```

---

## 📚 Further Reading

### Original Framework Sources
- **Claude Code**: Agentic coding patterns, file-based context
- **Manus**: Adaptive reasoning depth matching query complexity
- **Deep Research**: Evidence grading, panel discussions
- **OpenAI Best Practices**: Few-shot examples, structured outputs
- **DeepAgents**: Task decomposition, persistent memory, subagent spawning

### AgentOS-Specific
- Gold Standard System Prompts V2
- Implementation Guide V2
- DeepAgents Features Addendum
- Worker Pool Architecture Guide

---

**Version History:**
- V1.0: Initial best practices (hierarchical spawning)
- V2.0: Updated for shared L4/L5 resources + DeepAgents features

**Questions? Need help implementing a specific pattern? Let me know!**

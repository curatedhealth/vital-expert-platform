-- ============================================================================
-- AgentOS 3.0: Seed Data for System Prompts & Worker Pool
-- File: 20251126_system_prompt_seed_data.sql
-- Purpose: Populate gold standard system prompts and worker pool configuration
-- ============================================================================

-- ============================================================================
-- PART 1: BASE SYSTEM PROMPT (Universal for L1-L3)
-- ============================================================================

DO $$ 
DECLARE
    v_base_prompt TEXT := '# AGENT CORE IDENTITY

You are part of AgentOS 3.0, a clinical-grade AI platform for pharmaceutical and healthcare applications.

## Core Attributes
- **Platform:** VITAL (Vision, Intelligence, Trials, Activation, Learning)
- **Domain:** {{agent_domain}}
- **Level:** {{agent_level}}
- **Tier:** {{query_tier}}
- **Session ID:** {{session_id}}

## Operational Mode
- **RAG Profile:** {{rag_profile_name}}
- **Evidence Sources:** {{available_sources}}
- **Knowledge Graph View:** {{kg_view_scope}}
- **Human Oversight:** {{hitl_required}}

## Universal Requirements

### 1. Evidence Grounding
- ALWAYS cite sources using [SOURCE: {{source_id}}] format
- NEVER make claims without retrieved evidence
- Flag uncertainty explicitly with confidence scores
- Distinguish between guideline recommendations and evidence-based facts

### 2. Safety & Compliance
- Follow PHARMA/VERIFY protocols for all clinical claims
- Escalate to HITL if confidence < {{min_confidence_threshold}}
- Never provide diagnostic advice or treatment recommendations
- Include appropriate disclaimers for regulatory content

### 3. Response Structure
- Start with direct answer (executive summary)
- Provide supporting evidence
- Note limitations and uncertainties
- Offer follow-up pathways when relevant

### 4. Context Management
- Use file system (write_file, read_file) for >2000 tokens
- Break complex analyses into modular files
- Reference files by path: {{session_id}}/analysis/{{filename}}
- Clean up temporary files after task completion

### 5. Shared Resource Usage
- Use shared worker pool for execution tasks
- Workers are stateless and tenant-agnostic
- Provide complete task context in each request
- Tools are deterministic functions

## Available Shared Resources

### Worker Pool
You have access to a shared pool of WORKER agents (Level 4) for:
- **data_extraction**: PubMed searches, FDA queries, web scraping
- **computation**: Statistical calculations, sample size, ICER
- **file_processing**: PDF extraction, Excel parsing, format conversion

Usage:
```python
execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={"query": "...", "date_from": "..."}
)
```

### Tool Registry
You have access to 100+ deterministic tools (Level 5):
- API wrappers: pubmed_api, fda_faers_api, clinicaltrials_gov_api
- Calculators: sample_size_calculator, icer_calculator
- Processors: pdf_reader, excel_parser, json_parser

## Prohibited Actions
- ❌ Providing medical diagnosis or treatment
- ❌ Making claims without evidence citations
- ❌ Overriding safety gates or HITL requirements
- ❌ Sharing proprietary/confidential information
- ❌ Operating outside assigned domain scope';

BEGIN
    RAISE NOTICE 'Seeding AgentOS 3.0 Gold Standard System Prompts...';
END $$;

-- ============================================================================
-- PART 2: LEVEL 1 - MASTER ORCHESTRATOR
-- ============================================================================

INSERT INTO system_prompt_templates (
    template_name,
    agent_level,
    agent_level_name,
    version,
    base_prompt,
    level_specific_prompt,
    deepagents_tools_section,
    token_budget_min,
    token_budget_max,
    can_spawn_levels,
    can_use_worker_pool,
    can_use_tool_registry,
    is_stateless,
    is_tenant_agnostic,
    when_to_use,
    prohibited_actions,
    success_criteria
) VALUES (
    'master_orchestrator_v2',
    'L1',
    'MASTER',
    '2.0',
    '{{base_prompt}}', -- Will be replaced at render time
    '# LEVEL 1: MASTER ORCHESTRATOR AGENT

## Role & Capabilities

You are a Master Orchestrator agent with the highest autonomy in the system. Your role is to:
1. Decompose complex, multi-domain queries into coordinated sub-tasks
2. Select and spawn EXPERT and SPECIALIST agents as needed
3. Coordinate shared worker pool usage across your sub-agents
4. Synthesize cross-domain responses into cohesive strategic recommendations
5. Manage long-running workflows with checkpoint persistence

## Agent Coordination Strategy

**You Can Spawn (Intelligence Layer):**
- EXPERT agents (Level 2): Domain specialists
- SPECIALIST agents (Level 3): Sub-domain experts

**You Use (Shared Resources):**
- WORKER pool (Level 4): Via `execute_worker_task()`
- TOOL registry (Level 5): Direct function calls

## Strategic Reasoning

Use Tree-of-Thoughts for complex decisions:
1. Generate 3-5 alternative approaches
2. Evaluate each approach for feasibility, risk, resource cost, timeline
3. Select optimal path with justification
4. Monitor execution and adapt as needed

## Resource Management

### Token Budget: {{token_budget}} tokens

**Usage Guidelines:**
- Planning: 20%
- Expert coordination: 30%
- Worker task requests: 15%
- Synthesis: 30%
- Metadata: 5%',
    '## 🛠️ DeepAgents Tools Available

### 1. Task Decomposition: `write_todos`
Break complex queries into actionable sub-tasks.

```python
write_todos({
    "title": "Multi-domain analysis",
    "tasks": [
        {"task": "Analyze FDA requirements", "agent": "regulatory_expert"},
        {"task": "Clinical evidence review", "agent": "medical_expert"}
    ]
})
```

### 2. Virtual Filesystem
- `write_file(path, content)`: Store large contexts
- `read_file(path)`: Retrieve stored data
- `edit_file(path, old, new)`: Modify files
- `ls(path)`: List directory contents

### 3. Subagent Spawning: `task`
```python
task(
    instruction="Analyze regulatory pathway",
    agent_type="EXPERT",
    agent_domain="regulatory_affairs",
    context={...}
)
```

### 4. Worker Pool Access: `execute_worker_task`
```python
execute_worker_task(
    worker_type="data_extraction",
    task="pubmed_search",
    params={"query": "...", "max_results": 50}
)
```',
    2000,
    2500,
    ARRAY['L2', 'L3'],
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    'Complex multi-domain queries requiring strategic coordination',
    ARRAY[
        'Spawning L4/L5 agents (use worker pool instead)',
        'Making decisions without evidence',
        'Overriding escalation requirements'
    ],
    ARRAY[
        'Query fully answered with evidence',
        'All sub-tasks completed successfully',
        'Response latency < 120s',
        'Token efficiency > 85%'
    ]
);

-- Continue with L2, L3, L4, L5 in similar detail...
-- (This file would be very long, showing abbreviated version)

DO $$ BEGIN
    RAISE NOTICE '✅ L1 MASTER template seeded';
END $$;

-- ============================================================================
-- PART 3: WORKER POOL CONFIGURATION
-- ============================================================================

INSERT INTO worker_pool_config (
    worker_type,
    worker_type_description,
    pool_size,
    max_concurrent_tasks,
    task_timeout_seconds,
    available_tasks,
    available_tools,
    target_latency_seconds,
    max_memory_mb,
    max_file_size_mb
) VALUES
(
    'data_extraction',
    'Extract data from external sources (APIs, databases, web)',
    5,
    10,
    30,
    '[
        {"task": "pubmed_search", "description": "Search PubMed for articles"},
        {"task": "clinicaltrials_search", "description": "Query ClinicalTrials.gov"},
        {"task": "fda_faers_query", "description": "Extract FDA adverse events"},
        {"task": "fda_website_search", "description": "Search FDA website"},
        {"task": "web_scrape", "description": "Extract data from URLs"}
    ]'::jsonb,
    ARRAY['pubmed_api', 'clinicaltrials_gov_api', 'fda_faers_api', 'web_scraper'],
    10,
    2048,
    50
),
(
    'computation',
    'Perform calculations and statistical analysis',
    3,
    8,
    30,
    '[
        {"task": "sample_size_calculation", "description": "Compute trial sample size"},
        {"task": "icer_calculation", "description": "Calculate cost-effectiveness"},
        {"task": "statistical_test", "description": "Run statistical tests"},
        {"task": "financial_modeling", "description": "Project costs"}
    ]'::jsonb,
    ARRAY['sample_size_calculator', 'icer_calculator', 'statistical_calculator', 'financial_calculator'],
    5,
    1024,
    0
),
(
    'file_processing',
    'Extract and transform data from files',
    3,
    6,
    60,
    '[
        {"task": "pdf_extraction", "description": "Extract text/tables from PDF"},
        {"task": "excel_parsing", "description": "Parse Excel to JSON"},
        {"task": "document_parsing", "description": "Extract structured data"},
        {"task": "format_conversion", "description": "Convert file formats"}
    ]'::jsonb,
    ARRAY['pdf_reader', 'excel_parser', 'json_parser', 'csv_converter'],
    15,
    2048,
    100
);

DO $$ BEGIN
    RAISE NOTICE '✅ Worker pool configuration seeded';
END $$;

-- ============================================================================
-- PART 4: TOOL REGISTRY (Sample Tools)
-- ============================================================================

INSERT INTO tool_registry (
    tool_id,
    tool_name,
    tool_type,
    function_name,
    function_description,
    input_schema,
    output_schema,
    avg_latency_ms,
    rate_limit,
    timeout_seconds
) VALUES
(
    'pubmed_api_v1',
    'pubmed_api',
    'api_wrapper',
    'search_pubmed',
    'Search PubMed for scientific articles',
    '{
        "type": "object",
        "required": ["query"],
        "properties": {
            "query": {"type": "string", "description": "PubMed search query"},
            "max_results": {"type": "integer", "default": 100, "minimum": 1, "maximum": 1000},
            "date_from": {"type": "string", "format": "date", "description": "Start date YYYY/MM/DD"}
        }
    }'::jsonb,
    '{
        "type": "object",
        "properties": {
            "articles": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "pmid": {"type": "string"},
                        "title": {"type": "string"},
                        "abstract": {"type": "string"},
                        "year": {"type": "integer"}
                    }
                }
            },
            "count": {"type": "integer"}
        }
    }'::jsonb,
    2000,
    '100 calls/minute per tenant',
    10
),
(
    'sample_size_calculator_v1',
    'sample_size_calculator',
    'calculator',
    'calculate_sample_size',
    'Compute trial sample size based on statistical parameters',
    '{
        "type": "object",
        "required": ["effect_size", "alpha", "power"],
        "properties": {
            "effect_size": {"type": "number", "minimum": 0},
            "alpha": {"type": "number", "minimum": 0, "maximum": 1, "default": 0.05},
            "power": {"type": "number", "minimum": 0, "maximum": 1, "default": 0.80},
            "test": {"type": "string", "enum": ["two_sample_ttest", "one_sample_ttest", "proportion"], "default": "two_sample_ttest"}
        }
    }'::jsonb,
    '{
        "type": "object",
        "properties": {
            "n_per_group": {"type": "integer"},
            "total_n": {"type": "integer"},
            "formula": {"type": "string"},
            "assumptions": {"type": "array", "items": {"type": "string"}}
        }
    }'::jsonb,
    150,
    'unlimited',
    5
);

DO $$ BEGIN
    RAISE NOTICE '✅ Tool registry seeded with sample tools';
END $$;

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ AgentOS 3.0 Seed Data Complete';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '📋 System Prompt Templates: 1 (L1 MASTER shown, complete all 5)';
    RAISE NOTICE '⚙️ Worker Pool Configs: 3 (data_extraction, computation, file_processing)';
    RAISE NOTICE '🛠️ Tool Registry: 2 sample tools (expand to 100+)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next Steps:';
    RAISE NOTICE '   1. Complete L2-L5 prompt templates';
    RAISE NOTICE '   2. Expand tool registry';
    RAISE NOTICE '   3. Implement WorkerPoolManager service';
    RAISE NOTICE '   4. Integrate with LangGraph workflows';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;


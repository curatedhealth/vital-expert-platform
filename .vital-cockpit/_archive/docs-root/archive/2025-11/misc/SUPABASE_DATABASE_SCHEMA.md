# VITAL AI Platform - Supabase Database Schema Documentation

**Version:** 2.0  
**Last Updated:** November 2, 2025  
**Database:** PostgreSQL 15+ (Supabase)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core System Tables](#core-system-tables)
3. [Agent & AI System Tables](#agent--ai-system-tables)
4. [Digital Health Workflow Tables](#digital-health-workflow-tables)
5. [Tools & Capabilities Tables](#tools--capabilities-tables)
6. [Knowledge & RAG Tables](#knowledge--rag-tables)
7. [Chat & Conversation Tables](#chat--conversation-tables)
8. [Memory & Feedback Tables](#memory--feedback-tables)
9. [Analytics & Monitoring Tables](#analytics--monitoring-tables)
10. [Entity Relationship Diagrams](#entity-relationship-diagrams)

---

## Architecture Overview

The VITAL AI Platform uses a multi-tenant PostgreSQL database with the following architectural patterns:

- **Multi-tenancy**: All major tables reference `tenants.id` for data isolation
- **Row-Level Security (RLS)**: Enforced on all tenant-scoped tables
- **UUID Primary Keys**: All tables use UUID for primary keys
- **JSONB Metadata**: Flexible metadata columns for extensibility
- **Audit Trails**: `created_at`, `updated_at` timestamps on all tables
- **Soft Deletes**: Some tables use `is_active` flags instead of hard deletes

---

## Core System Tables

### 1. **`tenants`**
Multi-tenant organization management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Tenant name |
| `slug` | TEXT | URL-safe identifier |
| `settings` | JSONB | Tenant configuration |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **1:N** → `users` (tenant has many users)
- **1:N** → `agents` (tenant has many agents)
- **1:N** → All `dh_*` tables (digital health workflows)

**Indexes:**
- `idx_tenants_slug` on `slug`
- `idx_tenants_active` on `is_active`

---

### 2. **`users`**
Platform users with role-based access.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `email` | TEXT | User email (unique) |
| `role` | TEXT | User role (admin, user, agent) |
| `profile` | JSONB | User profile data |
| `preferences` | JSONB | User preferences |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants` (many users to one tenant)
- **1:N** → `conversations` (user has many conversations)
- **1:N** → `session_memories` (user has many memories)

**Indexes:**
- `idx_users_tenant` on `tenant_id`
- `idx_users_email` on `email`

---

## Agent & AI System Tables

### 3. **`agents`**
AI agent definitions and configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `agent_type` | TEXT | Agent type (specialist, generalist) |
| `name` | TEXT | Agent name |
| `description` | TEXT | Agent description |
| `system_prompt` | TEXT | Base system prompt |
| `avatar_id` | UUID | FK → `avatars.id` |
| `llm_model_id` | UUID | FK → `llm_models.id` |
| `temperature` | NUMERIC | LLM temperature (0.0-2.0) |
| `max_tokens` | INTEGER | Max generation tokens |
| `is_active` | BOOLEAN | Active status |
| `metadata` | JSONB | Additional configuration |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `avatars` (agent has one avatar)
- **N:1** → `llm_models` (agent uses one LLM model)
- **1:N** → `agent_capabilities` (agent has many capabilities)
- **1:N** → `agent_tools` (agent has many tools)
- **1:N** → `agent_rag_domains` (agent has many RAG domains)
- **1:N** → `conversations` (agent handles many conversations)

**Indexes:**
- `idx_agents_tenant` on `tenant_id`
- `idx_agents_type` on `agent_type`
- `idx_agents_active` on `is_active`

---

### 4. **`avatars`**
Visual representations for agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Avatar name |
| `image_url` | TEXT | Avatar image URL |
| `style` | TEXT | Visual style |
| `is_default` | BOOLEAN | Default avatar flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **1:N** → `agents` (avatar used by many agents)

---

### 5. **`llm_models`**
Available LLM models and configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `provider` | TEXT | Provider (openai, anthropic, etc.) |
| `model_name` | TEXT | Model identifier |
| `display_name` | TEXT | User-friendly name |
| `context_window` | INTEGER | Max context tokens |
| `max_output_tokens` | INTEGER | Max output tokens |
| `cost_per_1k_input` | NUMERIC | Cost per 1K input tokens |
| `cost_per_1k_output` | NUMERIC | Cost per 1K output tokens |
| `capabilities` | TEXT[] | Model capabilities |
| `is_available` | BOOLEAN | Availability status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **1:N** → `agents` (model used by many agents)

**Indexes:**
- `idx_llm_models_provider` on `provider`
- `idx_llm_models_available` on `is_available`

---

### 6. **`agent_capabilities`**
Skills and abilities assigned to agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | FK → `agents.id` |
| `capability_type` | TEXT | Type (medical, regulatory, technical) |
| `name` | TEXT | Capability name |
| `description` | TEXT | Capability description |
| `proficiency_level` | TEXT | Level (expert, intermediate, basic) |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `agents`

**Indexes:**
- `idx_agent_capabilities_agent` on `agent_id`
- `idx_agent_capabilities_type` on `capability_type`

---

## Digital Health Workflow Tables

### 7. **`dh_domain`**
Top-level digital health domains (Clinical Development, Regulatory Affairs, etc.).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `code` | VARCHAR(50) | Domain code (CD, RA, MA, PD, EG) |
| `name` | VARCHAR(150) | Domain name |
| `description` | TEXT | Domain description |
| `metadata` | JSONB | Additional configuration |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **1:N** → `dh_use_case` (domain has many use cases)

**Indexes:**
- `idx_dh_domain_tenant` on `tenant_id`
- `idx_dh_domain_code` on `code`

**Unique Constraints:**
- `(tenant_id, code)` - Unique domain per tenant

---

### 8. **`dh_use_case`**
Specific use cases within domains.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `domain_id` | UUID | FK → `dh_domain.id` |
| `code` | VARCHAR(50) | Use case code (UC_CD_003) |
| `title` | VARCHAR(255) | Use case title |
| `summary` | TEXT | Use case summary |
| `complexity` | VARCHAR(20) | Complexity level (Basic, Intermediate, Advanced, Expert) |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_domain`
- **1:N** → `dh_workflow` (use case has many workflows)

**Indexes:**
- `idx_dh_use_case_domain` on `domain_id`
- `idx_dh_use_case_tenant` on `tenant_id`

---

### 9. **`dh_workflow`**
Workflows for executing use cases.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `use_case_id` | UUID | FK → `dh_use_case.id` |
| `name` | VARCHAR(255) | Workflow name |
| `description` | TEXT | Workflow description |
| `position` | INTEGER | Display order |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_use_case`
- **1:N** → `dh_task` (workflow has many tasks)

**Indexes:**
- `idx_dh_workflow_use_case` on `use_case_id`
- `idx_dh_workflow_tenant` on `tenant_id`

---

### 10. **`dh_task`**
Individual tasks within workflows.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `workflow_id` | UUID | FK → `dh_workflow.id` |
| `code` | VARCHAR(50) | Task code (T1, T2, etc.) |
| `title` | VARCHAR(255) | Task title |
| `objective` | TEXT | Task objective |
| `position` | INTEGER | Display order |
| `extra` | JSONB | Task-specific data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_workflow`
- **1:N** → `dh_task_dependency` (task has dependencies)
- **1:N** → `dh_task_role` (task has assigned roles)
- **1:N** → `dh_task_tool` (task uses domain tools)
- **1:N** → `dh_task_ai_tool` (task uses AI agent tools)
- **1:N** → `dh_task_rag` (task uses RAG sources)
- **1:N** → `dh_prompt` (task has prompts)
- **1:N** → `dh_task_input` (task has inputs)
- **1:N** → `dh_task_output` (task has outputs)
- **1:N** → `dh_task_kpi_target` (task has KPI targets)

**Indexes:**
- `idx_dh_task_workflow` on `workflow_id`
- `idx_dh_task_code` on `code`
- `idx_dh_task_tenant` on `tenant_id`

---

### 11. **`dh_task_dependency`**
Task dependencies (task A depends on task B).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `depends_on_task_id` | UUID | FK → `dh_task.id` |
| `note` | TEXT | Dependency notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task` (dependent task)
- **N:1** → `dh_task` (prerequisite task)

**Indexes:**
- `idx_dh_task_dep_task` on `task_id`
- `idx_dh_task_dep_depends` on `depends_on_task_id`

**Constraints:**
- `chk_task_dependency_not_self` - Task cannot depend on itself

---

### 12. **`dh_role`**
Roles (human or AI) for task execution.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `code` | VARCHAR(50) | Role code (P04_BIOSTAT) |
| `name` | VARCHAR(150) | Role name |
| `agent_type` | VARCHAR(10) | Type (Human, AI) |
| `department` | VARCHAR(150) | Department |
| `description` | TEXT | Role description |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **1:N** → `dh_task_role` (role assigned to many tasks)

**Indexes:**
- `idx_dh_role_tenant` on `tenant_id`

---

### 13. **`dh_task_role`**
Role assignments to tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `role_id` | UUID | FK → `dh_role.id` |
| `responsibility` | VARCHAR(20) | Responsibility (Lead, Reviewer, Approver, Contributor) |
| `note` | TEXT | Assignment notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task`
- **N:1** → `dh_role`

**Indexes:**
- `idx_dh_task_role_task` on `task_id`
- `idx_dh_task_role_role` on `role_id`

---

### 14. **`dh_tool`**
Domain-specific tools (R, TreeAge, EDC, etc.).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `code` | VARCHAR(50) | Tool code (R, TreeAge, EDC) |
| `name` | VARCHAR(150) | Tool name |
| `category` | VARCHAR(100) | Tool category |
| `vendor` | VARCHAR(150) | Vendor name |
| `version` | VARCHAR(50) | Tool version |
| `notes` | TEXT | Additional notes |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **1:N** → `dh_task_tool` (tool used in many tasks)

**Indexes:**
- `idx_dh_tool_tenant` on `tenant_id`

---

### 15. **`dh_task_tool`**
Domain tool assignments to tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `tool_id` | UUID | FK → `dh_tool.id` |
| `purpose` | TEXT | Tool usage purpose |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task`
- **N:1** → `dh_tool`

**Indexes:**
- `idx_dh_task_tool_task` on `task_id`
- `idx_dh_task_tool_tool` on `tool_id`

---

### 16. **`dh_rag_source`**
RAG knowledge sources for tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `code` | VARCHAR(80) | Source code |
| `name` | VARCHAR(255) | Source name |
| `source_type` | VARCHAR(30) | Type (document, dataset, guidance, database, api, other) |
| `uri` | TEXT | Source URI |
| `description` | TEXT | Source description |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **1:N** → `dh_task_rag` (source used in many tasks)

**Indexes:**
- `idx_dh_rag_source_tenant` on `tenant_id`

---

### 17. **`dh_task_rag`**
RAG source assignments to tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `rag_source_id` | UUID | FK → `dh_rag_source.id` |
| `note` | TEXT | Usage notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task`
- **N:1** → `dh_rag_source`

**Indexes:**
- `idx_dh_task_rag_task` on `task_id`
- `idx_dh_task_rag_source` on `rag_source_id`

---

### 18. **`dh_prompt`**
Task-specific prompts for AI agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `name` | VARCHAR(150) | Prompt name |
| `pattern` | VARCHAR(30) | Prompt pattern (CoT, Few-Shot, ReAct, Direct, Other) |
| `system_prompt` | TEXT | System prompt |
| `user_template` | TEXT | User prompt template |
| `variables` | TEXT[] | Template variables |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task`

**Indexes:**
- `idx_dh_prompt_task` on `task_id`

---

### 19-22. **Task I/O and KPI Tables**
- **`dh_task_input`** - Task input requirements
- **`dh_task_output`** - Task output specifications
- **`dh_task_output_template`** - Output templates
- **`dh_task_kpi_target`** - Task KPI targets

*(Similar structure to above tables, linking to tasks)*

---

## Tools & Capabilities Tables

### 23. **`tools`**
AI agent tools registry (LangGraph-compatible).

| Column | Type | Description |
|--------|------|-------------|
| `tool_id` | UUID | Primary key |
| `tool_code` | TEXT | Unique tool code (web_search, pubmed_search) |
| `tool_name` | TEXT | Tool name |
| `tool_description` | TEXT | Tool description |
| `category` | TEXT | Tool category (web, rag, computation, medical) |
| `subcategory` | TEXT | Tool subcategory |
| `implementation_type` | TEXT | Type (python_function, api_endpoint, langchain_tool) |
| `implementation_path` | TEXT | Python module path or API URL |
| `function_name` | TEXT | Function name if Python |
| `input_schema` | JSONB | JSON Schema for inputs |
| `output_schema` | JSONB | JSON Schema for outputs |
| `default_config` | JSONB | Default configuration |
| `required_env_vars` | TEXT[] | Required environment variables |
| `is_async` | BOOLEAN | Async execution support |
| `max_execution_time_seconds` | INTEGER | Max execution time |
| `retry_config` | JSONB | Retry configuration |
| `rate_limit_per_minute` | INTEGER | Rate limit |
| `cost_per_execution` | NUMERIC | Cost in USD |
| `langgraph_compatible` | BOOLEAN | LangGraph compatibility |
| `langgraph_node_name` | TEXT | Suggested LangGraph node name |
| `supports_streaming` | BOOLEAN | Streaming support |
| `status` | TEXT | Status (active, deprecated, disabled, beta) |
| `version` | TEXT | Tool version |
| `deprecated_by` | UUID | FK → `tools.tool_id` |
| `deprecation_date` | TIMESTAMPTZ | Deprecation date |
| `access_level` | TEXT | Access level (public, authenticated, premium, admin) |
| `allowed_tenants` | TEXT[] | Allowed tenants (NULL = all) |
| `allowed_roles` | TEXT[] | Allowed roles |
| `tags` | TEXT[] | Tool tags |
| `documentation_url` | TEXT | Documentation URL |
| `example_usage` | JSONB | Usage examples |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `created_by` | TEXT | Creator |
| `updated_by` | TEXT | Last updater |

**Relationships:**
- **1:N** → `agent_tools` (tool assigned to many agents)
- **1:N** → `dh_task_ai_tool` (tool assigned to many tasks)
- **1:N** → `tool_executions` (tool has many executions)

**Indexes:**
- `idx_tools_code` on `tool_code`
- `idx_tools_category` on `category`
- `idx_tools_status` on `status`
- `idx_tools_langgraph_compatible` on `langgraph_compatible`
- `idx_tools_tags` (GIN index) on `tags`

**Current Tools:**
1. `web_search` - Tavily web search
2. `web_scraper` - BeautifulSoup4 HTML extraction
3. `rag_search` - Knowledge base search
4. `pubmed_search` - PubMed medical literature
5. `arxiv_search` - arXiv scientific papers
6. `who_guidelines` - WHO health guidelines
7. `clinicaltrials_search` - ClinicalTrials.gov
8. `fda_drugs` - FDA drug database
9. `calculator` - Math calculations
10. `python_executor` - Sandboxed Python execution

---

### 24. **`agent_tools`**
Agent-to-tools linking (many-to-many).

| Column | Type | Description |
|--------|------|-------------|
| `agent_tool_id` | UUID | Primary key |
| `agent_id` | TEXT | Agent identifier |
| `tool_id` | UUID | FK → `tools.tool_id` |
| `is_enabled` | BOOLEAN | Tool enabled for agent |
| `priority` | INTEGER | Selection priority (1-100) |
| `custom_config` | JSONB | Agent-specific configuration |
| `max_uses_per_session` | INTEGER | Max uses per session |
| `max_cost_per_session` | NUMERIC | Max cost per session (USD) |
| `allowed_contexts` | TEXT[] | Allowed contexts (autonomous, interactive) |
| `auto_approve` | BOOLEAN | Auto-approve execution |
| `require_confirmation` | BOOLEAN | Require user confirmation |
| `fallback_tool_id` | UUID | FK → `tools.tool_id` |
| `assigned_by` | TEXT | Who assigned the tool |
| `assigned_at` | TIMESTAMPTZ | Assignment timestamp |
| `notes` | TEXT | Assignment notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tools`
- **1:N** → `tool_executions` (tool-agent pair has many executions)

**Indexes:**
- `idx_agent_tools_agent_id` on `agent_id`
- `idx_agent_tools_tool_id` on `tool_id`
- `idx_agent_tools_enabled` on `is_enabled`
- `idx_agent_tools_priority` on `(agent_id, priority DESC)`

**Unique Constraint:**
- `(agent_id, tool_id)` - One link per agent-tool pair

---

### 25. **`dh_task_ai_tool`**
Task-to-AI-tools linking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `task_id` | UUID | FK → `dh_task.id` |
| `tool_id` | UUID | FK → `tools.tool_id` |
| `is_required` | BOOLEAN | Tool required for task |
| `is_recommended` | BOOLEAN | Tool recommended for task |
| `priority` | INTEGER | Tool priority (1-100) |
| `task_specific_config` | JSONB | Task-specific configuration |
| `usage_notes` | TEXT | Usage notes |
| `max_uses_per_execution` | INTEGER | Max uses per execution |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `dh_task`
- **N:1** → `tools`

**Indexes:**
- `idx_dh_task_ai_tool_task_id` on `task_id`
- `idx_dh_task_ai_tool_tool_id` on `tool_id`
- `idx_dh_task_ai_tool_tenant` on `tenant_id`
- `idx_dh_task_ai_tool_required` on `is_required`

---

### 26. **`task_category_ai_tools`**
Task category templates for auto-assigning AI tools.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category` | TEXT | Task category (research, analysis, documentation) |
| `task_type` | TEXT | Task type (literature_review, data_analysis) |
| `tool_id` | UUID | FK → `tools.tool_id` |
| `is_required` | BOOLEAN | Tool required for category |
| `is_recommended` | BOOLEAN | Tool recommended for category |
| `priority` | INTEGER | Tool priority (1-100) |
| `usage_notes` | TEXT | Usage notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tools`

**Indexes:**
- `idx_task_category_ai_tools_category` on `category`
- `idx_task_category_ai_tools_tool_id` on `tool_id`

**Categories:**
- `research` - literature_review, market_intelligence, regulatory_research, clinical_trial_search
- `analysis` - data_analysis, risk_assessment, cost_benefit
- `documentation` - report_generation, summary_creation, guideline_development
- `monitoring` - safety_monitoring, competitor_tracking, regulatory_updates
- `design` - endpoint_selection, biomarker_validation, study_design

---

### 27. **`tool_executions`**
Tool execution history and analytics.

| Column | Type | Description |
|--------|------|-------------|
| `execution_id` | UUID | Primary key |
| `tool_id` | UUID | FK → `tools.tool_id` |
| `agent_tool_id` | UUID | FK → `agent_tools.agent_tool_id` |
| `agent_id` | TEXT | Agent identifier |
| `session_id` | TEXT | Session identifier |
| `conversation_id` | TEXT | Conversation identifier |
| `tenant_id` | TEXT | Tenant identifier |
| `user_id` | TEXT | User identifier |
| `input_params` | JSONB | Tool input parameters |
| `output_result` | JSONB | Tool output |
| `error_message` | TEXT | Error message if failed |
| `error_traceback` | TEXT | Error traceback |
| `status` | TEXT | Status (pending, running, success, failed, timeout, cancelled) |
| `started_at` | TIMESTAMPTZ | Start timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |
| `execution_time_ms` | INTEGER | Execution time (milliseconds) |
| `cost_usd` | NUMERIC | Execution cost (USD) |
| `tokens_used` | INTEGER | Tokens used |
| `api_calls_made` | INTEGER | API calls made |
| `workflow_run_id` | TEXT | LangGraph workflow run ID |
| `node_name` | TEXT | LangGraph node name |
| `iteration_number` | INTEGER | Iteration number |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tools`
- **N:1** → `agent_tools`

**Indexes:**
- `idx_tool_executions_tool_id` on `tool_id`
- `idx_tool_executions_agent_id` on `agent_id`
- `idx_tool_executions_session_id` on `session_id`
- `idx_tool_executions_tenant_id` on `tenant_id`
- `idx_tool_executions_status` on `status`
- `idx_tool_executions_started_at` on `started_at DESC`
- `idx_tool_executions_workflow_run_id` on `workflow_run_id`

---

### 28. **`tool_analytics` (Materialized View)**
Pre-aggregated tool usage analytics (last 30 days).

| Column | Type | Description |
|--------|------|-------------|
| `tool_id` | UUID | Tool ID |
| `tool_code` | TEXT | Tool code |
| `tool_name` | TEXT | Tool name |
| `category` | TEXT | Tool category |
| `total_executions` | BIGINT | Total executions |
| `successful_executions` | BIGINT | Successful executions |
| `failed_executions` | BIGINT | Failed executions |
| `success_rate_percent` | NUMERIC | Success rate (%) |
| `avg_execution_time_ms` | NUMERIC | Average execution time (ms) |
| `p95_execution_time_ms` | NUMERIC | 95th percentile execution time |
| `total_cost_usd` | NUMERIC | Total cost (USD) |
| `avg_cost_usd` | NUMERIC | Average cost per execution |
| `unique_agents_using` | BIGINT | Unique agents |
| `unique_tenants_using` | BIGINT | Unique tenants |
| `last_used_at` | TIMESTAMPTZ | Last usage timestamp |

**Refresh:** Manual via `refresh_tool_analytics()` function

---

## Knowledge & RAG Tables

### 29. **`knowledge_domains`**
Knowledge domain registry for RAG routing.

| Column | Type | Description |
|--------|------|-------------|
| `domain_id` | UUID | Primary key |
| `code` | TEXT | Domain code (regulatory_affairs, clinical_development) |
| `slug` | TEXT | URL-safe slug |
| `parent_domain_id` | UUID | FK → `knowledge_domains.domain_id` (hierarchical) |
| `function_id` | TEXT | Function identifier |
| `function_name` | TEXT | Function name |
| `domain_name` | TEXT | Domain name |
| `domain_description_llm` | TEXT | LLM-friendly description |
| `tenants_primary` | TEXT[] | Primary tenants |
| `tenants_secondary` | TEXT[] | Secondary tenants |
| `is_cross_tenant` | BOOLEAN | Cross-tenant flag |
| `domain_scope` | TEXT | Scope (global, enterprise, user) |
| `enterprise_id` | TEXT | Enterprise ID |
| `owner_user_id` | TEXT | Owner user ID |
| `tier` | INTEGER | Authority tier (1=highest) |
| `tier_label` | TEXT | Tier label |
| `maturity_level` | TEXT | Maturity (Established, Specialized, Emerging, Draft) |
| `regulatory_exposure` | TEXT | Exposure (High, Medium, Low) |
| `pii_sensitivity` | TEXT | PII sensitivity (None, Low, Medium, High) |
| `lifecycle_stage` | TEXT[] | Applicable lifecycle stages |
| `governance_owner` | TEXT | Governance owner |
| `last_review_owner_role` | TEXT | Last reviewer role |
| `embedding_model` | TEXT | Embedding model used |
| `rag_priority_weight` | NUMERIC | RAG priority weight (0-1) |
| `access_policy` | TEXT | Access policy (public, enterprise_confidential, etc.) |
| `metadata` | JSONB | Additional data |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `knowledge_domains` (parent domain)
- **1:N** → `agent_rag_domains` (domain assigned to many agents)

**Indexes:**
- `idx_knowledge_domains_scope` on `domain_scope`
- `idx_knowledge_domains_enterprise` on `enterprise_id`
- `idx_knowledge_domains_parent` on `parent_domain_id`
- `idx_knowledge_domains_priority` on `(rag_priority_weight DESC, tier ASC)`

**Current Domains:**
1. Regulatory Affairs
2. Pharmacovigilance & Safety Reporting
3. Clinical Development & Trials
4. Market Access & Pricing
5. Manufacturing & Supply Chain
6. Digital Health Strategy
7. Enterprise Specific Policy
8. User Personal Notes

---

### 30. **`agent_rag_domains`**
Agent-to-knowledge-domain linking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `agent_id` | UUID | FK → `agents.id` |
| `domain_id` | UUID | FK → `knowledge_domains.domain_id` |
| `priority` | INTEGER | Domain priority for agent |
| `is_enabled` | BOOLEAN | Domain enabled |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `agents`
- **N:1** → `knowledge_domains`

**Indexes:**
- `idx_agent_rag_domains_agent` on `agent_id`
- `idx_agent_rag_domains_domain` on `domain_id`

---

### 31. **`knowledge_base`**
Uploaded documents and knowledge files.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `user_id` | UUID | FK → `users.id` |
| `file_name` | TEXT | Original filename |
| `file_path` | TEXT | Storage path |
| `file_type` | TEXT | MIME type |
| `file_size` | INTEGER | File size (bytes) |
| `domain_ids` | TEXT[] | Associated domain IDs |
| `chunk_count` | INTEGER | Number of chunks |
| `embedding_status` | TEXT | Status (pending, processing, completed, failed) |
| `metadata` | JSONB | Document metadata |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `users`
- **1:N** → `knowledge_chunks` (document has many chunks)

**Indexes:**
- `idx_knowledge_base_tenant` on `tenant_id`
- `idx_knowledge_base_user` on `user_id`
- `idx_knowledge_base_status` on `embedding_status`

---

### 32. **`knowledge_chunks`**
Chunked text from knowledge base documents with embeddings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `knowledge_base_id` | UUID | FK → `knowledge_base.id` |
| `tenant_id` | UUID | FK → `tenants.id` |
| `chunk_index` | INTEGER | Chunk order |
| `content` | TEXT | Chunk content |
| `embedding` | VECTOR | Text embedding (pgvector) |
| `metadata` | JSONB | Chunk metadata |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `knowledge_base`
- **N:1** → `tenants`

**Indexes:**
- `idx_knowledge_chunks_kb` on `knowledge_base_id`
- `idx_knowledge_chunks_tenant` on `tenant_id`
- **HNSW index** on `embedding` for vector similarity search

---

## Chat & Conversation Tables

### 33. **`conversations`**
Chat conversations/sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `user_id` | UUID | FK → `users.id` |
| `agent_id` | UUID | FK → `agents.id` |
| `title` | TEXT | Conversation title |
| `mode` | TEXT | Conversation mode (interactive_auto, interactive_manual, autonomous_auto, autonomous_manual) |
| `status` | TEXT | Status (active, archived, deleted) |
| `message_count` | INTEGER | Message count |
| `last_message_at` | TIMESTAMPTZ | Last message timestamp |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `users`
- **N:1** → `agents`
- **1:N** → `messages` (conversation has many messages)

**Indexes:**
- `idx_conversations_tenant` on `tenant_id`
- `idx_conversations_user` on `user_id`
- `idx_conversations_agent` on `agent_id`
- `idx_conversations_status` on `status`

---

### 34. **`messages`**
Individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | FK → `conversations.id` |
| `tenant_id` | UUID | FK → `tenants.id` |
| `role` | TEXT | Message role (user, assistant, system) |
| `content` | TEXT | Message content |
| `agent_id` | UUID | FK → `agents.id` (for assistant messages) |
| `model_used` | TEXT | LLM model used |
| `tokens_used` | INTEGER | Tokens consumed |
| `cost_usd` | NUMERIC | Message cost (USD) |
| `rag_sources` | JSONB | RAG sources used |
| `tools_used` | JSONB | Tools executed |
| `reasoning` | JSONB | AI reasoning details |
| `confidence` | NUMERIC | Response confidence |
| `feedback` | TEXT | User feedback (positive, negative, neutral) |
| `feedback_details` | TEXT | Feedback details |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `conversations`
- **N:1** → `tenants`
- **N:1** → `agents`

**Indexes:**
- `idx_messages_conversation` on `conversation_id`
- `idx_messages_tenant` on `tenant_id`
- `idx_messages_created_at` on `created_at`
- `idx_messages_feedback` on `feedback`

---

## Memory & Feedback Tables

### 35. **`session_memories`**
Long-term semantic memory for agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `user_id` | UUID | FK → `users.id` |
| `agent_id` | UUID | FK → `agents.id` |
| `session_id` | TEXT | Session identifier |
| `memory_type` | TEXT | Type (entity, fact, preference, interaction) |
| `content` | TEXT | Memory content |
| `embedding` | VECTOR | Content embedding (pgvector) |
| `importance_score` | NUMERIC | Importance (0-1) |
| `confidence_score` | NUMERIC | Confidence (0-1) |
| `source_message_id` | UUID | FK → `messages.id` |
| `entities` | TEXT[] | Extracted entities |
| `metadata` | JSONB | Additional data |
| `accessed_count` | INTEGER | Access count |
| `last_accessed_at` | TIMESTAMPTZ | Last access timestamp |
| `expires_at` | TIMESTAMPTZ | Expiration timestamp |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `users`
- **N:1** → `agents`
- **N:1** → `messages` (source message)

**Indexes:**
- `idx_session_memories_tenant` on `tenant_id`
- `idx_session_memories_user` on `user_id`
- `idx_session_memories_agent` on `agent_id`
- `idx_session_memories_session` on `session_id`
- `idx_session_memories_type` on `memory_type`
- **HNSW index** on `embedding`

---

### 36. **`agent_performance`**
Agent performance metrics and feedback tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `agent_id` | UUID | FK → `agents.id` |
| `user_id` | UUID | FK → `users.id` |
| `query_type` | TEXT | Query type |
| `query_complexity` | TEXT | Complexity (simple, medium, complex) |
| `response_quality` | NUMERIC | Quality score (1-5) |
| `response_time_ms` | INTEGER | Response time (ms) |
| `tokens_used` | INTEGER | Tokens consumed |
| `cost_usd` | NUMERIC | Query cost (USD) |
| `rag_used` | BOOLEAN | RAG used flag |
| `tools_used` | TEXT[] | Tools used |
| `feedback` | TEXT | User feedback |
| `feedback_score` | INTEGER | Feedback score (-1, 0, 1) |
| `feedback_details` | TEXT | Feedback details |
| `conversation_id` | UUID | FK → `conversations.id` |
| `message_id` | UUID | FK → `messages.id` |
| `metadata` | JSONB | Additional data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `agents`
- **N:1** → `users`
- **N:1** → `conversations`
- **N:1** → `messages`

**Indexes:**
- `idx_agent_performance_agent` on `agent_id`
- `idx_agent_performance_tenant` on `tenant_id`
- `idx_agent_performance_user` on `user_id`
- `idx_agent_performance_created` on `created_at`

---

## Analytics & Monitoring Tables

### 37. **`workflow_runs`**
LangGraph workflow execution tracking.

| Column | Type | Description |
|--------|------|-------------|
| `run_id` | UUID | Primary key |
| `tenant_id` | UUID | FK → `tenants.id` |
| `agent_id` | UUID | FK → `agents.id` |
| `conversation_id` | UUID | FK → `conversations.id` |
| `workflow_type` | TEXT | Workflow type (mode1, mode2, mode3, mode4) |
| `status` | TEXT | Status (running, completed, failed, cancelled) |
| `input_data` | JSONB | Input data |
| `output_data` | JSONB | Output data |
| `nodes_executed` | TEXT[] | Executed nodes |
| `iterations` | INTEGER | Iteration count |
| `total_tokens` | INTEGER | Total tokens |
| `total_cost_usd` | NUMERIC | Total cost (USD) |
| `execution_time_ms` | INTEGER | Execution time (ms) |
| `error_message` | TEXT | Error message |
| `metadata` | JSONB | Additional data |
| `started_at` | TIMESTAMPTZ | Start timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

**Relationships:**
- **N:1** → `tenants`
- **N:1** → `agents`
- **N:1** → `conversations`

**Indexes:**
- `idx_workflow_runs_tenant` on `tenant_id`
- `idx_workflow_runs_agent` on `agent_id`
- `idx_workflow_runs_status` on `status`
- `idx_workflow_runs_started` on `started_at DESC`

---

### 38. **`checkpoints`**
LangGraph workflow checkpoints for resumability.

| Column | Type | Description |
|--------|------|-------------|
| `checkpoint_id` | UUID | Primary key |
| `run_id` | UUID | FK → `workflow_runs.run_id` |
| `thread_id` | TEXT | LangGraph thread ID |
| `checkpoint_ns` | TEXT | Checkpoint namespace |
| `checkpoint_data` | JSONB | Checkpoint state |
| `parent_checkpoint_id` | UUID | FK → `checkpoints.checkpoint_id` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**Relationships:**
- **N:1** → `workflow_runs`
- **N:1** → `checkpoints` (parent checkpoint)

**Indexes:**
- `idx_checkpoints_run` on `run_id`
- `idx_checkpoints_thread` on `thread_id`

---

## Entity Relationship Diagrams

### Core System ERD

```
┌──────────────┐
│   tenants    │
│              │
│ • id (PK)    │
│ • name       │
│ • slug       │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│    users     │
│              │
│ • id (PK)    │
│ • tenant_id  │◄─────────────┐
│ • email      │              │
│ • role       │              │ 1:N
└──────┬───────┘              │
       │                      │
       │ 1:N            ┌─────┴────────┐
       ▼                │ conversations│
┌──────────────────┐   │              │
│ session_memories │   │ • id (PK)    │
│                  │   │ • tenant_id  │
│ • id (PK)        │   │ • user_id    │
│ • user_id        │   │ • agent_id   │
│ • agent_id       │   │ • mode       │
│ • content        │   └─────┬────────┘
│ • embedding      │         │
└──────────────────┘         │ 1:N
                             ▼
                      ┌──────────────┐
                      │   messages   │
                      │              │
                      │ • id (PK)    │
                      │ • conv_id    │
                      │ • role       │
                      │ • content    │
                      └──────────────┘
```

### Agent & Tools ERD

```
┌──────────────┐           ┌───────────────┐
│   agents     │           │    tools      │
│              │           │               │
│ • id (PK)    │           │ • tool_id (PK)│
│ • name       │           │ • tool_code   │
│ • avatar_id  │───┐   ┌───│ • category    │
│ • llm_model  │   │   │   │ • status      │
└──────┬───────┘   │   │   └───────┬───────┘
       │           │   │           │
       │ 1:N       │   │           │ 1:N
       ▼           │   │           ▼
┌──────────────────┐  │   ┌─────────────────┐
│agent_capabilities│  │   │  agent_tools    │
│                  │  │   │                 │
│ • id (PK)        │  │   │ • id (PK)       │
│ • agent_id       │  │   │ • agent_id      │
│ • type           │  │   │ • tool_id       │
│ • proficiency    │  │   │ • priority      │
└──────────────────┘  │   │ • is_enabled    │
                      │   └────────┬────────┘
       ┌──────────────┘            │
       │                           │ 1:N
       │ N:1                       ▼
       ▼                   ┌───────────────────┐
┌──────────────┐          │ tool_executions   │
│   avatars    │          │                   │
│              │          │ • execution_id(PK)│
│ • id (PK)    │          │ • tool_id         │
│ • name       │          │ • agent_id        │
│ • image_url  │          │ • status          │
└──────────────┘          │ • execution_time  │
                          └───────────────────┘
```

### Digital Health Workflow ERD

```
┌──────────────┐
│  dh_domain   │
│              │
│ • id (PK)    │
│ • code       │
│ • name       │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│ dh_use_case  │
│              │
│ • id (PK)    │
│ • domain_id  │
│ • code       │
│ • title      │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│ dh_workflow  │
│              │
│ • id (PK)    │
│ • use_case_id│
│ • name       │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│    dh_task       │
│                  │
│ • id (PK)        │
│ • workflow_id    │
│ • code           │
│ • title          │
└────────┬─────────┘
         │
         ├─────► dh_task_role
         ├─────► dh_task_tool (domain tools)
         ├─────► dh_task_ai_tool (AI tools)
         ├─────► dh_task_rag
         ├─────► dh_task_dependency
         ├─────► dh_task_input
         ├─────► dh_task_output
         └─────► dh_prompt
```

### Knowledge & RAG ERD

```
┌───────────────────┐
│knowledge_domains  │
│                   │
│ • domain_id (PK)  │
│ • code            │
│ • domain_name     │
│ • parent_id       │◄──┐
│ • tier            │   │ Self-reference
│ • rag_priority    │   │ (hierarchy)
└─────────┬─────────┘   │
          │             │
          └─────────────┘
          │
          │ 1:N
          ▼
┌──────────────────────┐
│ agent_rag_domains    │
│                      │
│ • id (PK)            │
│ • agent_id           │
│ • domain_id          │
│ • priority           │
└──────────────────────┘

┌──────────────┐
│knowledge_base│
│              │
│ • id (PK)    │
│ • tenant_id  │
│ • file_name  │
│ • domain_ids │
└──────┬───────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│knowledge_chunks  │
│                  │
│ • id (PK)        │
│ • kb_id          │
│ • content        │
│ • embedding      │
└──────────────────┘
```

---

## Key Features

### 1. **Multi-Tenancy**
- All core tables include `tenant_id`
- Row-Level Security (RLS) enforces tenant isolation
- Platform admin can bypass RLS for system operations

### 2. **Hierarchical Data**
- **Knowledge Domains:** Support parent-child relationships
- **Tasks:** Can have dependencies on other tasks
- **Tools:** Can have fallback tools

### 3. **JSONB Flexibility**
- All tables have `metadata` JSONB column for extensibility
- Tool configurations, agent settings, and task data stored as JSONB
- Enables schema evolution without migrations

### 4. **Vector Search**
- `knowledge_chunks.embedding` - Document embeddings
- `session_memories.embedding` - Memory embeddings
- HNSW indexes for efficient similarity search

### 5. **Audit Trails**
- `created_at`, `updated_at` timestamps on all tables
- `created_by`, `updated_by` fields on critical tables
- Soft deletes via `is_active` flags

### 6. **Performance Optimization**
- Extensive indexing on foreign keys and filter columns
- Materialized view (`tool_analytics`) for aggregated data
- GIN indexes on arrays and JSONB columns

---

## Database Statistics

| Metric | Count |
|--------|-------|
| **Total Tables** | 38+ |
| **Core System Tables** | 2 (tenants, users) |
| **Agent Tables** | 6 (agents, avatars, llm_models, capabilities, tools, rag_domains) |
| **Digital Health Tables** | 22 (domains, use cases, workflows, tasks, roles, tools, prompts, etc.) |
| **AI Tools Tables** | 4 (tools, agent_tools, task_ai_tools, tool_executions) |
| **Knowledge Tables** | 4 (knowledge_domains, knowledge_base, knowledge_chunks, agent_rag_domains) |
| **Chat Tables** | 2 (conversations, messages) |
| **Memory Tables** | 2 (session_memories, agent_performance) |
| **Workflow Tables** | 2 (workflow_runs, checkpoints) |

---

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2024-01-01 | Initial Schema | Core tenants, users, agents |
| 2024-01-02 | Agents Schema | Agent capabilities and configuration |
| 2024-01-03 | Chat Schema | Conversations and messages |
| 2025-09-19 | LLM Providers | LLM models and avatars |
| 2025-09-24 | RAG Schema | Knowledge base and embeddings |
| 2025-10-03 | RAG Knowledge Base | Knowledge domains registry |
| 2025-11-01 | Digital Health Workflows | Comprehensive workflow system |
| 2025-11-01 | Knowledge Domains Fix | Domain schema fixes |
| 2025-11-02 | Tools Registry | AI agent tools system |
| 2025-11-02 | Task-Tool Linking | AI tool-task integration |

---

## Access Patterns

### Most Frequent Queries

1. **Get Agent Tools:**
   ```sql
   SELECT * FROM get_agent_tools('agent_id', 'context');
   ```

2. **Get Task AI Tools:**
   ```sql
   SELECT * FROM get_ai_tools_for_task('task_id');
   ```

3. **Search Knowledge Base:**
   ```sql
   SELECT * FROM knowledge_chunks 
   WHERE tenant_id = $1 
   ORDER BY embedding <=> $2 
   LIMIT 10;
   ```

4. **Get Conversation History:**
   ```sql
   SELECT * FROM messages 
   WHERE conversation_id = $1 
   ORDER BY created_at ASC;
   ```

5. **Agent Performance:**
   ```sql
   SELECT * FROM agent_performance 
   WHERE agent_id = $1 AND created_at >= now() - interval '30 days';
   ```

---

## Security

### Row-Level Security (RLS)

All tenant-scoped tables enforce RLS:

```sql
-- Example RLS policy
CREATE POLICY tenant_isolation ON agents
  FOR ALL
  USING (
    tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );
```

### Access Levels

1. **Public** - No RLS (system tables)
2. **Tenant** - Tenant-isolated via RLS
3. **User** - User-isolated via RLS
4. **Service Role** - Bypass RLS for system operations

---

## Backup & Maintenance

### Recommended Schedules

- **Full Backup:** Daily at 2 AM UTC
- **Point-in-Time Recovery:** Enabled (7-day retention)
- **Analytics Refresh:** `tool_analytics` - Daily at 3 AM UTC
- **Cleanup:** Expired memories, old executions - Weekly

### Indexes to Monitor

- Vector indexes (HNSW) on `embedding` columns
- GIN indexes on JSONB columns
- Foreign key indexes on high-traffic joins

---

**Document Version:** 2.0  
**Last Updated:** November 2, 2025  
**Maintained By:** VITAL AI Platform Team

For questions or updates, see `TOOLS_DATABASE_SETUP.md` and `TASK_TOOL_LINKING_COMPLETE.md`.


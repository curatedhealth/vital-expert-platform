# Agent Schema Relationship Diagram

**Last Updated**: November 26, 2025  
**Status**: ✅ Production-Ready  
**Total Tables**: 35+  
**Total Agents**: 489

---

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MULTITENANCY FOUNDATION                          │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────────┐
                          │  organizations       │ (Tenants)
                          ├──────────────────────┤
                          │ id (PK)              │
                          │ tenant_key           │
                          │ tenant_type          │
                          │ organization_name    │
                          │ is_active            │
                          └────────┬─────────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
       ┌─────────▼─────────┐  ┌───▼──────────┐  ┌──▼───────────────┐
       │ tenant_agents     │  │tenant_configs │  │ tenant_feature   │
       │ (junction)        │  │               │  │ _flags           │
       ├───────────────────┤  ├───────────────┤  ├──────────────────┤
       │ tenant_id (FK)    │  │ tenant_id (FK)│  │ tenant_id (FK)   │
       │ agent_id (FK)     │  │ ui_config     │  │ feature_flag_id  │
       │ is_enabled        │  │ enabled_apps  │  │ enabled          │
       │ custom_config     │  └───────────────┘  └──────────────────┘
       │ usage_count       │
       └─────────┬─────────┘
                 │
                 │
┌────────────────▼───────────────────────────────────────────────────────┐
│                           AGENT CORE SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────────────────┐
                          │        agents                │ (Core: 40+ columns)
                          ├──────────────────────────────┤
                          │ -- IDENTITY                  │
                          │ id (PK)                      │
                          │ tenant_id (FK)               │
                          │ name, slug, tagline          │
                          │ description, title           │
                          │                              │
                          │ -- ORGANIZATION              │
                          │ agent_level_id (FK) ────────┼──┐
                          │ function_id (FK) ───────────┼──┼──┐
                          │ department_id (FK) ─────────┼──┼──┼──┐
                          │ role_id (FK) ───────────────┼──┼──┼──┼──┐
                          │ function_name (cached)       │  │  │  │  │
                          │ department_name (cached)     │  │  │  │  │
                          │ role_name (cached)           │  │  │  │  │
                          │                              │  │  │  │  │
                          │ -- AGENTOS 3.0 (NEW)         │  │  │  │  │
                          │ system_prompt_template_id ───┼──┼──┼──┼──┼──┐
                          │ system_prompt_override       │  │  │  │  │  │
                          │ prompt_variables (JSONB)     │  │  │  │  │  │
                          │                              │  │  │  │  │  │
                          │ -- AI CONFIG                 │  │  │  │  │  │
                          │ system_prompt (legacy)       │  │  │  │  │  │
                          │ base_model                   │  │  │  │  │  │
                          │ temperature, max_tokens      │  │  │  │  │  │
                          │                              │  │  │  │  │  │
                          │ -- PROFILE                   │  │  │  │  │  │
                          │ expertise_level              │  │  │  │  │  │
                          │ years_of_experience          │  │  │  │  │  │
                          │ avatar_url                   │  │  │  │  │  │
                          │ communication_style          │  │  │  │  │  │
                          │                              │  │  │  │  │  │
                          │ -- STATUS & METRICS          │  │  │  │  │  │
                          │ status, validation_status    │  │  │  │  │  │
                          │ usage_count, average_rating  │  │  │  │  │  │
                          │ created_at, updated_at       │  │  │  │  │  │
                          └──────────┬───────────────────┘  │  │  │  │  │
                                     │                       │  │  │  │  │
                                     │                       │  │  │  │  │
┌────────────────────────────────────┼───────────────────────┼──┼──┼──┼──┼──┐
│  AGENT LEVEL SYSTEM (5 Levels)     │                       │  │  │  │  │  │
└────────────────────────────────────┼───────────────────────┼──┼──┼──┼──┼──┘
                                     │                       │  │  │  │  │
                          ┌──────────▼────────────┐          │  │  │  │  │
                          │   agent_levels        │◄─────────┘  │  │  │  │
                          ├───────────────────────┤              │  │  │  │
                          │ level_number (1-5)    │              │  │  │  │
                          │ level_name            │              │  │  │  │
                          │ - L1: Master (24)     │              │  │  │  │
                          │ - L2: Expert (110)    │              │  │  │  │
                          │ - L3: Specialist (266)│              │  │  │  │
                          │ - L4: Worker (39)     │              │  │  │  │
                          │ - L5: Tool (50)       │              │  │  │  │
                          │ can_delegate          │              │  │  │  │
                          │ can_spawn_subagents   │              │  │  │  │
                          └───────────┬───────────┘              │  │  │  │
                                      │                          │  │  │  │
                          ┌───────────▼────────────┐             │  │  │  │
                          │ agent_level_models     │             │  │  │  │
                          │ (approved LLMs)        │             │  │  │  │
                          ├────────────────────────┤             │  │  │  │
                          │ agent_level_id (FK)    │             │  │  │  │
                          │ llm_model_id (FK) ─────┼──┐          │  │  │  │
                          │ is_default, priority   │  │          │  │  │  │
                          └────────────────────────┘  │          │  │  │  │
                                                      │          │  │  │  │
┌─────────────────────────────────────────────────────┼──────────┼──┼──┼──┼──┐
│  ORGANIZATIONAL STRUCTURE                           │          │  │  │  │  │
└─────────────────────────────────────────────────────┼──────────┼──┼──┼──┼──┘
                                                      │          │  │  │  │
                          ┌───────────────────────────┘          │  │  │  │
                          │                                      │  │  │  │
              ┌───────────▼────────────┐                         │  │  │  │
              │   org_functions        │◄────────────────────────┘  │  │  │
              │   (8 functions)        │                            │  │  │
              ├────────────────────────┤                            │  │  │
              │ function_name          │                            │  │  │
              │ - Regulatory Affairs   │                            │  │  │
              │ - Clinical Dev         │                            │  │  │
              │ - Market Access        │                            │  │  │
              │ - Medical Affairs      │                            │  │  │
              └───────────┬────────────┘                            │  │  │
                          │                                         │  │  │
              ┌───────────▼────────────┐                            │  │  │
              │  org_departments       │◄───────────────────────────┘  │  │
              │  (~50 departments)     │                               │  │
              ├────────────────────────┤                               │  │
              │ department_name        │                               │  │
              │ function_id (FK)       │                               │  │
              └───────────┬────────────┘                               │  │
                          │                                            │  │
              ┌───────────▼────────────┐                               │  │
              │   org_roles            │◄──────────────────────────────┘  │
              │   (~200 roles)         │                                  │
              ├────────────────────────┤                                  │
              │ role_name              │                                  │
              │ seniority_level        │                                  │
              │ responsibilities[]     │                                  │
              └────────────────────────┘                                  │
                                                                          │
┌─────────────────────────────────────────────────────────────────────────┼──┐
│  AGENTOS 3.0: SYSTEM PROMPTS & TEMPLATES                                │  │
└─────────────────────────────────────────────────────────────────────────┼──┘
                                                                          │
                    ┌─────────────────────────────────────────────────────┘
                    │
        ┌───────────▼──────────────────┐
        │ system_prompt_templates      │
        │ (Gold Standard Prompts)      │
        ├──────────────────────────────┤
        │ id (PK)                      │
        │ template_name                │
        │ agent_level ('L1'-'L5')      │
        │                              │
        │ -- PROMPT CONTENT            │
        │ base_prompt                  │
        │ level_specific_prompt        │
        │ deepagents_tools_section     │
        │ examples_section             │
        │                              │
        │ -- HIERARCHY INSTRUCTIONS    │
        │ delegation_instructions      │
        │ escalation_instructions      │
        │ collaboration_instructions   │
        │                              │
        │ -- CONTEXT MANAGEMENT        │
        │ context_management_instr     │
        │ memory_instructions          │
        │ filesystem_instructions      │
        │                              │
        │ -- CONFIGURATION             │
        │ token_budget_min/max         │
        │ can_spawn_levels[]           │
        │ can_use_worker_pool          │
        │ can_use_tool_registry        │
        │ allowed_models (JSONB)       │
        └──────────────────────────────┘
                    ▲
                    │
                    └── Referenced by agents.system_prompt_template_id


┌─────────────────────────────────────────────────────────────────────────┐
│  CAPABILITIES & SKILLS SYSTEM                                           │
└─────────────────────────────────────────────────────────────────────────┘

        ┌────────────────────────┐
        │   capabilities         │ (30+ capabilities)
        │   (parent)             │
        ├────────────────────────┤
        │ capability_name        │
        │ category               │
        │ complexity_level       │
        │ parent_capability_id   │ (hierarchical)
        └────────┬───────────────┘
                 │
                 ├──────────────┐
                 │              │
    ┌────────────▼─────┐  ┌─────▼──────────────┐
    │ agent_capabilities│  │ capability_skills  │
    │ (junction)        │  │ (cap → skill)      │
    ├───────────────────┤  ├────────────────────┤
    │ agent_id (FK)     │  │ capability_id (FK) │
    │ capability_id (FK)│  │ skill_id (FK)      │
    │ proficiency_level │  │ importance_level   │
    │ is_primary        │  │ relationship_type  │
    │ usage_count       │  └─────┬──────────────┘
    │ success_rate      │        │
    └───────────────────┘        │
                                 │
                    ┌────────────▼─────────┐
                    │     skills           │ (150+ skills)
                    │     (child)          │
                    ├──────────────────────┤
                    │ skill_name           │
                    │ skill_type           │
                    │ invocation_method    │
                    │ function_definition  │
                    │ prerequisites[]      │
                    │ complexity_level     │
                    └────────┬─────────────┘
                             │
                ┌────────────▼─────────┐
                │   agent_skills       │
                │   (junction)         │
                ├──────────────────────┤
                │ agent_id (FK)        │
                │ skill_id (FK)        │
                │ proficiency_level    │
                │ usage_count          │
                └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│  KNOWLEDGE DOMAINS & EXPERTISE                                          │
└─────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────┐
        │  knowledge_domains       │ (50+ domains)
        ├──────────────────────────┤
        │ domain_code              │
        │ domain_name              │
        │ tier (1-5)               │
        │ parent_domain_id         │ (hierarchical)
        │ rag_namespace            │ (Pinecone)
        │ vector_count             │
        └────────┬─────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ agent_knowledge_domains       │ (1,467 assignments)
    │ (junction)                    │
    ├───────────────────────────────┤
    │ agent_id (FK)                 │
    │ knowledge_domain_id (FK)      │
    │ domain_name (cached)          │
    │ proficiency_level             │
    │ is_primary_domain             │
    │ years_of_experience           │
    └───────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│  AGENT RELATIONSHIPS & WORKFLOWS                                        │
└─────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │  agent_relationships             │ (440 relationships)
        ├──────────────────────────────────┤
        │ parent_agent_id (FK)             │
        │ child_agent_id (FK)              │
        │                                  │
        │ relationship_type:               │
        │   - orchestrates                 │
        │   - delegates_to                 │
        │   - uses_worker                  │
        │   - uses_tool                    │
        │   - spawns_subagent              │
        │   - collaborates_with            │
        │   - escalates_to                 │
        │                                  │
        │ -- DeepAgents Context            │
        │ context_isolation                │
        │ share_memory                     │
        │ share_filesystem                 │
        │                                  │
        │ -- Activation                    │
        │ priority                         │
        │ activation_conditions (JSONB)    │
        └──────────────────────────────────┘
                     │
                     ├──► L1 MASTER → L2 EXPERT
                     ├──► L1 MASTER → L4 WORKER (direct)
                     ├──► L2 EXPERT → L3 SPECIALIST
                     ├──► L3 SPECIALIST → L5 TOOL
                     └──► L4 WORKER → L5 TOOL


        ┌──────────────────────────────────┐
        │  agent_workflows                 │
        ├──────────────────────────────────┤
        │ workflow_name                    │
        │ workflow_type:                   │
        │   - sequential                   │
        │   - parallel                     │
        │   - conditional                  │
        │   - graph                        │
        │ trigger_conditions (JSONB)       │
        │ input_schema, output_schema      │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼─────────────────────┐
        │  workflow_steps                  │
        ├──────────────────────────────────┤
        │ step_number                      │
        │ step_type                        │
        │ assigned_agent_id (FK)           │
        │ dependencies[]                   │
        │ step_config (JSONB)              │
        │ timeout_seconds                  │
        └──────────────────────────────────┘


        ┌──────────────────────────────────┐
        │  agent_task_templates            │
        ├──────────────────────────────────┤
        │ template_name                    │
        │ task_category                    │
        │ agent_level_id (FK)              │
        │ input_schema, output_schema      │
        │ execution_steps (JSONB)          │
        │ required_capabilities[]          │
        │ required_skills[]                │
        │ estimated_duration               │
        └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│  LLM CONFIGURATION                                                      │
└─────────────────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────┐
        │  llm_providers                   │ (10+ providers)
        ├──────────────────────────────────┤
        │ provider_name                    │
        │   - OpenAI                       │
        │   - Anthropic (Claude)           │
        │   - Google (Gemini)              │
        │   - Mistral AI                   │
        │   - Meta (Llama)                 │
        │   - Cohere                       │
        │   - HuggingFace                  │
        │ api_base_url                     │
        │ auth_method                      │
        │ rate_limits (JSONB)              │
        └────────────┬─────────────────────┘
                     │
        ┌────────────▼─────────────────────┐
        │  llm_models                      │ (50+ models)
        ├──────────────────────────────────┤
        │ provider_id (FK)                 │
        │ model_id                         │
        │   - gpt-4-turbo-2024-04-09       │
        │   - claude-3-opus-20240229       │
        │   - gemini-1.5-pro               │
        │   - llama-3.1-405b-instruct      │
        │   - mixtral-8x22b                │
        │                                  │
        │ -- CAPABILITIES                  │
        │ context_window (tokens)          │
        │ max_output_tokens                │
        │ supports_function_calling        │
        │ supports_vision                  │
        │ supports_streaming               │
        │                                  │
        │ -- PRICING & PERFORMANCE         │
        │ input_cost_per_1k (USD)          │
        │ output_cost_per_1k (USD)         │
        │ avg_latency_ms                   │
        │ rate_limit_rpm                   │
        │ quality_tier                     │
        └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│  COMPLETE TABLE LIST (35+ TABLES)                                      │
└─────────────────────────────────────────────────────────────────────────┘

Core Agent System (10 tables):
  1. agents                         - Primary agent table (489 agents)
  2. agent_levels                   - 5-level hierarchy (L1-L5)
  3. agent_level_models             - LLM model assignments per level
  4. agent_level_characteristics    - Level characteristics
  5. agent_level_use_cases          - Use cases per level
  6. agent_relationships            - Delegation, collaboration (440)
  7. agent_workflows                - Multi-step orchestration
  8. workflow_steps                 - Workflow step definitions
  9. agent_task_templates           - Reusable task templates
 10. user_agents                    - User favorites & custom agents

Organizational Structure (3 tables):
 11. org_functions                  - Top functions (8)
 12. org_departments                - Departments (~50)
 13. org_roles                      - Specific roles (~200)

Capabilities & Skills (8 tables):
 14. capabilities                   - Capability categories (30+)
 15. agent_capabilities             - Agent-capability junction (2,352)
 16. capability_skills              - Capability-skill mapping
 17. capability_tags                - Capability tagging
 18. skills                         - Granular skills (150+)
 19. agent_skills                   - Agent-skill junction (~7,350)
 20. skill_tags                     - Skill tagging
 21. skill_prerequisites            - Skill dependencies

Knowledge Domains (2 tables):
 22. knowledge_domains              - Domain registry (50+)
 23. agent_knowledge_domains        - Agent-domain junction (1,467)

System Prompts (1 table):
 24. system_prompt_templates        - Gold standard prompts (5: L1-L5)

LLM Configuration (2 tables):
 25. llm_providers                  - AI providers (10+)
 26. llm_models                     - LLM models (50+)

Multi-Tenancy (3 tables):
 27. organizations                  - Tenants (2: Pharma, Digital Health)
 28. tenant_agents                  - Tenant-agent mapping
 29. tenant_configs                 - Tenant configurations

Supporting Tables (6 tables):
 30. characteristics                - Agent characteristics
 31. use_cases                      - Agent use cases
 32. tags                           - Universal tagging
 33. personas                       - User personas (deprecated)
 34. feature_flags                  - Feature toggles
 35. tenant_feature_flags           - Tenant-specific features

TOTAL: 35+ tables, 8,022+ enrichment records


┌─────────────────────────────────────────────────────────────────────────┐
│  KEY DATA FLOW PATTERNS                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Agent Selection Flow:
  User Query → Evidence-Based Selector → Agent Matching Algorithm
       ↓
  Factor Scoring (8 factors):
    - Semantic similarity (30%)
    - Domain expertise (25%)
    - Historical performance (15%)
    - Keyword relevance (10%)
    - Graph proximity (10%)
    - User preference (5%)
    - Availability (3%)
    - Tier compatibility (2%)
       ↓
  Best Agent(s) Selected → System Prompt Rendered
       ↓
  Dynamic Prompt = Template + Variables + Context
       ↓
  LLM Invocation (appropriate model for level)
       ↓
  Response → Workflow Tracking → User


Delegation Flow:
  L1 Master receives complex query
       ↓
  Checks agent_relationships for available L2 Experts
       ↓
  Selects L2 Expert based on:
    - Domain match
    - Relationship priority
    - Activation conditions
    - Current workload
       ↓
  Delegates with context (isolated or shared)
       ↓
  L2 Expert processes → May delegate to L3 Specialist
       ↓
  L3 Specialist → May use L4 Worker or L5 Tool
       ↓
  Results bubble up to L1 Master
       ↓
  L1 synthesizes and returns final answer


System Prompt Rendering Flow:
  Agent Invocation
       ↓
  Load system_prompt_template (by agent_level_id)
       ↓
  Inject prompt_variables (agent-specific)
       ↓
  Add dynamic context:
    - Capabilities (from agent_capabilities)
    - Skills (from agent_skills)
    - Knowledge Domains (from agent_knowledge_domains)
    - Delegation targets (from agent_relationships)
       ↓
  Render final prompt
       ↓
  Send to LLM with appropriate model


┌─────────────────────────────────────────────────────────────────────────┐
│  INDEX STRATEGY FOR PERFORMANCE                                         │
└─────────────────────────────────────────────────────────────────────────┘

Critical Indexes (Sub-50ms Query Performance):

agents table:
  - idx_agents_tenant (tenant_id)
  - idx_agents_agent_level (agent_level_id)
  - idx_agents_function (function_id)
  - idx_agents_department (department_id)
  - idx_agents_role (role_id)
  - idx_agents_status (status)
  - idx_agents_slug (slug) UNIQUE
  - idx_agents_system_prompt_template (system_prompt_template_id)

agent_capabilities:
  - idx_agent_cap_agent (agent_id)
  - idx_agent_cap_capability (capability_id)
  - idx_agent_cap_proficiency (proficiency_level)
  - UNIQUE(agent_id, capability_id)

agent_skills:
  - idx_agent_skill_agent (agent_id)
  - idx_agent_skill_skill (skill_id)
  - UNIQUE(agent_id, skill_id)

agent_knowledge_domains:
  - idx_agent_kd_agent (agent_id)
  - idx_agent_kd_domain (knowledge_domain_id)
  - idx_agent_kd_primary (is_primary_domain) WHERE is_primary_domain = true

agent_relationships:
  - idx_agent_rel_parent (parent_agent_id)
  - idx_agent_rel_child (child_agent_id)
  - idx_agent_rel_type (relationship_type)
  - UNIQUE(parent_agent_id, child_agent_id, relationship_type)

tenant_agents:
  - idx_tenant_agents_tenant (tenant_id)
  - idx_tenant_agents_agent (agent_id)
  - UNIQUE(tenant_id, agent_id)


┌─────────────────────────────────────────────────────────────────────────┐
│  PRODUCTION STATISTICS                                                  │
└─────────────────────────────────────────────────────────────────────────┘

Current Scale (as of Nov 26, 2025):
  - Total Agents: 489
  - Agent Levels: 5 (L1-L5)
  - L1 Masters: 24 (4.9%)
  - L2 Experts: 110 (22.5%)
  - L3 Specialists: 266 (54.4%)
  - L4 Workers: 39 (8.0%)
  - L5 Tools: 50 (10.2%)

  - Total Functions: 8
  - Total Departments: ~50
  - Total Roles: ~200
  - Total Tenants: 2 (Pharma, Digital Health)

Enrichment Records:
  - Agent Capabilities: 2,352 assignments
  - Agent Skills: ~7,350 assignments
  - Knowledge Domains: 1,467 assignments
  - Agent Relationships: 440 connections
  - System Prompt Templates: 5 (L1-L5)
  - LLM Providers: 10+
  - LLM Models: 50+

  TOTAL: 8,022+ enrichment records

Database Size (Estimated 1 Year):
  - Agent Core Tables: ~5 MB
  - Junction Tables: ~10 MB
  - Workflow History: ~250 MB
  - Total: ~265 MB

Query Performance:
  - Agent Selection: 20-50ms
  - Agent Profile Load: 30-60ms
  - Delegation Chain: 40-80ms
  - Workflow Creation: 30-50ms


┌─────────────────────────────────────────────────────────────────────────┐
│  SECURITY ARCHITECTURE (RLS)                                            │
└─────────────────────────────────────────────────────────────────────────┘

Row Level Security (RLS) Policies:

Layer 1: Service Role (Full Access)
  - Bypasses all RLS policies
  - Used by API routes for admin operations

Layer 2: Tenant Isolation
  - tenant_agents: Filter by tenant_id
  - workflow_instances: Filter by tenant_id
  - Users only see their tenant's data

Layer 3: User Ownership
  - workflow_instances: WHERE user_id = auth.uid()
  - Users only see their own workflows
  - user_agents: User-specific favorites

Layer 4: Read-Only Public Data
  - knowledge_domains: All authenticated users
  - capabilities: All authenticated users
  - skills: All authenticated users
  - system_prompt_templates: Authenticated access


┌─────────────────────────────────────────────────────────────────────────┐
│  ADDITIONAL RESOURCES                                                   │
└─────────────────────────────────────────────────────────────────────────┘

Documentation:
  - AGENT_SCHEMA_COMPLETE_GUIDE.md       - Full schema guide
  - AGENT_SCHEMA_QUICK_REFERENCE.md      - SQL snippets & examples
  - AGENT_ENRICHMENT_COMPLETE_CERTIFIED  - Enrichment status
  - AGENTOS_3.0_FIVE_LEVEL_AGENT_HIERARCHY - Level system docs

Status: ✅ Production-Ready
Last Updated: November 26, 2025
Total Tables: 35+
Total Agents: 489 (100% enriched)
Total Records: 8,022+ enrichment records
```

---

**End of Diagram**

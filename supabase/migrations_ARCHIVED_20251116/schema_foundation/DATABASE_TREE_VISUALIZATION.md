# VITAL.expert Database - Complete Tree Visualization

**80 Tables Organized by Architectural Layer**

---

## 🌳 Complete Database Tree

```
VITAL.expert Platform Database
│
├─── 🔐 LAYER 1: Identity & Access (4 tables)
│    │
│    ├── auth.users (Supabase built-in)
│    ├── user_profiles
│    ├── tenant_members
│    └── api_keys
│
├─── 🏢 LAYER 2: Multi-Tenant Hierarchy (5 tables)
│    │
│    ├── tenants ⭐ (5-level hierarchy with ltree)
│    │   ├── Level 0: Platform
│    │   ├── Level 1: Solution Provider
│    │   ├── Level 2: Enterprise Client
│    │   ├── Level 3: Partner Org
│    │   └── Level 4: Trial Tenant
│    │
│    ├── tenant_organizations
│    ├── tenant_usage_tracking
│    ├── services_registry
│    └── subscription_tiers
│
├─── 🎯 LAYER 3: Solutions & Industries (6 tables)
│    │
│    ├── solutions ⭐ (5 predefined solutions)
│    │   ├── Launch Excellence
│    │   ├── Brand Excellence
│    │   ├── Strategic Foresight (PULSE)
│    │   ├── Commercial Excellence
│    │   └── Medical Excellence
│    │
│    ├── industries ⭐ (6 industries)
│    │   ├── Pharmaceutical
│    │   ├── Biotechnology
│    │   ├── Medical Devices
│    │   ├── Healthcare Payers
│    │   ├── Digital Health
│    │   └── Healthcare Consulting
│    │
│    ├── solution_industry_matrix ⭐ (compatibility mapping)
│    ├── solution_installations
│    ├── solution_prompt_suites
│    └── solution_versions
│
├─── 🤖 LAYER 4: Core Domain - AI Assets (8 tables)
│    │
│    ├── agents ⭐ (254 to import)
│    ├── prompts (7 role types)
│    ├── skills
│    ├── tools
│    ├── knowledge_sources
│    ├── knowledge_chunks (RAG vectors)
│    ├── templates
│    └── capabilities
│
├─── 📊 LAYER 5: Business Context - Organizational Structure (20 tables)
│    │
│    ├── 🏭 Industries & Functions
│    │   ├── industries (already in Layer 3)
│    │   ├── org_functions ⭐ (14 functions)
│    │   │   ├── Commercial
│    │   │   ├── Medical Affairs
│    │   │   ├── Market Access
│    │   │   ├── Clinical
│    │   │   ├── Regulatory
│    │   │   ├── Research & Development
│    │   │   ├── Manufacturing
│    │   │   ├── Quality
│    │   │   ├── Operations
│    │   │   ├── IT/Digital
│    │   │   ├── Legal
│    │   │   ├── Finance
│    │   │   ├── HR
│    │   │   └── Business Development
│    │   │
│    │   ├── org_departments
│    │   ├── org_roles
│    │   └── org_responsibilities
│    │
│    ├── 🔗 Junction Tables (Organization)
│    │   ├── function_departments
│    │   ├── function_roles
│    │   ├── department_roles
│    │   ├── role_responsibilities
│    │   └── function_industries
│    │
│    ├── 👥 Personas & Jobs
│    │   ├── personas ⭐ (335 records)
│    │   ├── jobs_to_be_done ⭐ (338 records)
│    │   └── jtbd_personas (mapping with relevance scores)
│    │
│    └── 🎯 Business Strategy
│        ├── domains
│        ├── strategic_priorities
│        └── capability_jtbd_mapping
│
├─── 💼 LAYER 6: Services - User-Facing (25 tables)
│    │
│    ├── 🗣️ SERVICE 1: Ask Expert (1:1 Consultations)
│    │   ├── expert_consultations
│    │   ├── expert_messages
│    │   └── consultation_sessions
│    │
│    ├── 👥 SERVICE 2: Ask Panel (Multi-Agent Discussions)
│    │   ├── panel_discussions
│    │   ├── panel_members
│    │   ├── panel_messages
│    │   ├── panel_rounds
│    │   ├── panel_consensus
│    │   ├── panel_votes
│    │   ├── panel_templates
│    │   └── panel_facilitator_configs
│    │
│    ├── 🔄 SERVICE 3: Workflows
│    │   ├── workflows
│    │   ├── workflow_step_definitions
│    │   ├── workflow_step_connections
│    │   ├── tasks
│    │   ├── steps
│    │   └── task_prerequisites
│    │
│    ├── 🔗 Workflow Junction Tables
│    │   ├── workflow_tasks
│    │   ├── task_agents
│    │   ├── task_tools
│    │   └── task_skills
│    │
│    └── 🛍️ SERVICE 4: Solutions Marketplace
│        ├── solutions (already in Layer 3)
│        ├── solution_agents
│        ├── solution_workflows
│        ├── solution_prompts
│        ├── solution_templates
│        └── solution_knowledge
│
├─── ⚙️ LAYER 7: Execution - Runtime (6 tables)
│    │
│    ├── workflow_executions
│    ├── workflow_execution_steps
│    ├── workflow_approvals
│    ├── workflow_logs
│    ├── task_executions
│    └── execution_context
│
├─── 📦 LAYER 8: Outputs & Artifacts (6 tables)
│    │
│    ├── deliverables
│    ├── artifacts
│    ├── consultation_feedback
│    ├── votes
│    ├── vote_records
│    └── deliverable_versions
│
└─── 🔍 LAYER 9: Governance & Compliance (10 tables)
     │
     ├── 📝 Audit Trail
     │   ├── audit_log (7-year retention)
     │   ├── service_role_audit
     │   └── data_retention_policies
     │
     └── 💰 Token Usage & Billing
         ├── token_usage_messages
         ├── token_usage_sessions
         ├── token_usage_consultations
         ├── subscription_usage_monthly
         ├── cost_allocation
         ├── billing_invoices
         └── payment_methods
```

---

## 🔗 Key Relationships Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CORE ENTITY RELATIONSHIPS                       │
└─────────────────────────────────────────────────────────────────────┘

TENANTS (Root Entity - Everything connects here)
  ├── tenant_id → user_profiles
  ├── tenant_id → agents
  ├── tenant_id → personas
  ├── tenant_id → jobs_to_be_done
  ├── tenant_id → solutions
  ├── tenant_id → workflows
  ├── tenant_id → expert_consultations
  └── tenant_id → panel_discussions


AGENTS (AI Consultants)
  ├── agent_prompts → prompts
  ├── agent_tools → tools
  ├── agent_knowledge → knowledge_sources
  ├── agent_skills → skills
  ├── agent_industries → industries
  ├── task_agents → tasks
  ├── solution_agents → solutions
  └── expert_consultations (assigned agent)


PERSONAS (Professional Roles)
  ├── jtbd_personas → jobs_to_be_done
  ├── org_roles → org_roles
  ├── expert_consultations (user acting as persona)
  └── panel_members (panel participant persona)


JOBS_TO_BE_DONE (Business Objectives)
  ├── jtbd_personas → personas
  ├── capability_jtbd_mapping → capabilities
  ├── strategic_priority_id → strategic_priorities
  ├── workflow_id → workflows
  └── expert_consultations (context)


SOLUTIONS (Packaged Offerings)
  ├── solution_industry_matrix → industries
  ├── solution_agents → agents
  ├── solution_workflows → workflows
  ├── solution_prompts → prompts
  ├── solution_templates → templates
  ├── solution_knowledge → knowledge_sources
  └── solution_installations → tenants


WORKFLOWS (Multi-Step Processes)
  ├── workflow_tasks → tasks
  ├── tasks → steps
  ├── workflow_executions (runtime instances)
  └── solution_workflows → solutions


CONSULTATIONS & PANELS (Conversations)
  ├── expert_consultations → agents
  ├── expert_consultations → user_profiles
  ├── expert_messages → expert_consultations
  ├── panel_discussions → (multiple) agents via panel_members
  └── panel_messages → panel_discussions


KNOWLEDGE (RAG System)
  ├── knowledge_sources → knowledge_chunks (embeddings)
  ├── agent_knowledge → agents
  └── solution_knowledge → solutions
```

---

## 📊 Table Count by Layer

```
Layer 1: Identity & Access                    4 tables   ████
Layer 2: Multi-Tenant Hierarchy               5 tables   █████
Layer 3: Solutions & Industries               6 tables   ██████
Layer 4: Core Domain (AI Assets)              8 tables   ████████
Layer 5: Business Context (Org Structure)    20 tables   ████████████████████
Layer 6: Services (User-Facing)              25 tables   █████████████████████████
Layer 7: Execution (Runtime)                  6 tables   ██████
Layer 8: Outputs & Artifacts                  6 tables   ██████
Layer 9: Governance & Compliance             10 tables   ██████████
                                             ───────────
                                             80 TABLES
```

---

## 🎯 Critical Tables for MVP

If building incrementally, prioritize these **20 core tables** first:

```
MVP Phase 1: Foundation (5 tables)
├── tenants ⭐⭐⭐
├── user_profiles ⭐⭐⭐
├── tenant_members ⭐⭐⭐
├── industries ⭐⭐
└── org_functions ⭐⭐

MVP Phase 2: AI Assets (4 tables)
├── agents ⭐⭐⭐
├── prompts ⭐⭐⭐
├── tools ⭐⭐
└── knowledge_sources ⭐⭐

MVP Phase 3: Business Context (3 tables)
├── personas ⭐⭐⭐
├── jobs_to_be_done ⭐⭐⭐
└── jtbd_personas ⭐⭐⭐

MVP Phase 4: Services (3 tables)
├── expert_consultations ⭐⭐⭐
├── expert_messages ⭐⭐⭐
└── solutions ⭐⭐

MVP Phase 5: Execution (2 tables)
├── workflows ⭐⭐
└── workflow_executions ⭐⭐

MVP Phase 6: Governance (3 tables)
├── audit_log ⭐⭐⭐
├── token_usage_consultations ⭐⭐
└── consultation_feedback ⭐
```

---

## 🔢 Junction Tables Summary

**20 Junction Tables** (Many-to-Many Relationships):

```
Agent Relationships (6)
├── agent_prompts
├── agent_tools
├── agent_knowledge
├── agent_skills
├── agent_industries
└── task_agents

Organizational Relationships (5)
├── function_departments
├── function_roles
├── department_roles
├── role_responsibilities
└── function_industries

Business Relationships (3)
├── jtbd_personas ⭐ (with relevance scoring)
├── capability_jtbd_mapping
└── solution_industry_matrix ⭐ (with compatibility)

Workflow Relationships (4)
├── workflow_tasks
├── task_tools
├── task_skills
└── task_prerequisites

Solution Relationships (5)
├── solution_agents
├── solution_workflows
├── solution_prompts
├── solution_templates
└── solution_knowledge

Panel Relationships (2)
├── panel_members
└── panel_votes
```

---

## 📈 Growth Path (Table Evolution)

```
Current Production Database:     ~50 tables (estimated)
Gold-Standard Database:           80 tables
Improvement:                     +60% more comprehensive

Key Additions:
├── +5-level tenant hierarchy
├── +Solutions marketplace infrastructure
├── +Complete organizational structure
├── +Token usage & billing tracking
├── +Panel discussion system
├── +Workflow execution runtime
└── +Comprehensive audit trail
```

---

## 🎨 Visual: Data Flow Through Layers

```
USER REQUEST
     │
     ▼
┌────────────────────┐
│  Identity Layer    │  Who is this user? What tenant?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Multi-Tenant      │  Which organization? What level?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Solutions Layer   │  Which solution? Which industry?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Core Domain       │  Which agents? Which prompts/tools?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Business Context  │  Which persona? Which JTBD?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Services Layer    │  Ask Expert? Ask Panel? Workflow?
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Execution Layer   │  Run workflow, execute tasks
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Outputs Layer     │  Generate deliverables, collect feedback
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│  Governance Layer  │  Log everything, track tokens, ensure compliance
└────────────────────┘
```

---

## 🔐 Security: RLS Policies Required

**All tenant-scoped tables** (60+ tables) need RLS policies:

```sql
-- Standard tenant isolation policy (applied to all)
CREATE POLICY tenant_isolation_[table_name] ON [table_name]
  FOR ALL TO authenticated
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    OR
    -- For hierarchy, allow parent tenants to see child data
    tenant_id IN (
      SELECT id FROM tenants
      WHERE tenant_path <@ (
        SELECT tenant_path FROM tenants
        WHERE id = current_setting('app.current_tenant_id', true)::uuid
      )
    )
  );
```

---

## 🚀 Next Steps

1. ✅ Review this tree structure
2. ⏳ Create 22 SQL migration files
3. ⏳ Apply migrations sequentially
4. ⏳ Import seed data (solutions, industries, functions)
5. ⏳ Import production data (agents, personas, JTBDs)
6. ⏳ Verify and test

**Ready to generate all 22 SQL files?**

---

**Total: 80 Tables, 20 ENUMs, 20 Junction Tables, 22 Migration Phases**

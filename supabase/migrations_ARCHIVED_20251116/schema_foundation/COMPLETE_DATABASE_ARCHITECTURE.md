# VITAL.expert - Complete Gold-Standard Database Architecture

**Based on**: vital_data_strategy.md + VITAL_Hierarchy_Architecture_Specification.md
**Date**: 2025-11-13
**Status**: Final architecture ready for implementation

---

## Architectural Layers (Top to Bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│                   VITAL.expert Data Platform                      │
├──────────────────────────────────────────────────────────────────┤
│ 1. Identity & Access                                             │
│    auth.users, user_profiles, api_keys                           │
├──────────────────────────────────────────────────────────────────┤
│ 2. Multi-Tenant Layer (5-Level Hierarchy)                        │
│    tenants, tenant_members, tenant_organizations                 │
├──────────────────────────────────────────────────────────────────┤
│ 3. Solutions & Industries                                        │
│    solutions, industries, solution_industry_matrix               │
├──────────────────────────────────────────────────────────────────┤
│ 4. Core Domain (AI Assets)                                       │
│    agents, prompts, skills, tools, knowledge                     │
├──────────────────────────────────────────────────────────────────┤
│ 5. Business Context (Organizational)                             │
│    industries, org_functions, org_departments, org_roles,        │
│    org_responsibilities, personas, jtbds, capabilities           │
├──────────────────────────────────────────────────────────────────┤
│ 6. Services (User-Facing)                                        │
│    ask_expert (consultations), ask_panel (panels),               │
│    workflows, solutions_marketplace                              │
├──────────────────────────────────────────────────────────────────┤
│ 7. Execution Layer                                               │
│    workflow_executions, tasks, steps, approvals                  │
├──────────────────────────────────────────────────────────────────┤
│ 8. Outputs & Artifacts                                           │
│    deliverables, artifacts, consensus, feedback, votes           │
├──────────────────────────────────────────────────────────────────┤
│ 9. Governance & Compliance                                       │
│    audit_log, retention_policies, service_audit, token_usage    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Complete Entity Model (75 Tables)

### Layer 1: Identity & Access (4 tables)

1. **auth.users** - Supabase auth (built-in)
2. **user_profiles** - Extended user data
3. **tenant_members** - User-tenant membership with roles
4. **api_keys** - Programmatic access

---

### Layer 2: Multi-Tenant Hierarchy (3 tables)

**5-Level Tenant Hierarchy**:
```
Level 0: Platform (VITAL.expert Core)
Level 1: Solution Provider (Pharma Vertical)
Level 2: Enterprise Client (Novartis Global)
Level 3: Partner Org (CRO Partner)
Level 4: Trial Tenant (Pilot Team)
```

5. **tenants** - Multi-level tenant hierarchy
6. **tenant_organizations** - Extended org metadata
7. **tenant_usage_tracking** - Token/cost tracking per tenant

**Tenant Structure**:
```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  parent_tenant_id uuid REFERENCES tenants(id), -- For hierarchy
  tenant_level integer NOT NULL, -- 0=Platform, 1=Solution Provider, 2=Enterprise, 3=Partner, 4=Trial

  -- Identity
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,

  -- Hierarchy context
  root_tenant_id uuid REFERENCES tenants(id), -- Top-level parent
  tenant_path ltree, -- For efficient hierarchy queries

  -- Rest of fields...
);
```

---

### Layer 3: Solutions & Industries (5 tables)

8. **solutions** - Packaged offerings (Launch Excellence, Brand Excellence, etc.)
9. **industries** - Industry classifications (6 industries)
10. **solution_industry_matrix** - Which solutions work for which industries
11. **solution_installations** - Tenant installations of solutions
12. **solution_prompt_suites** - Solution-specific prompt collections

**Predefined Solutions**:
1. Launch Excellence
2. Brand Excellence
3. Strategic Foresight (PULSE)
4. Commercial Excellence
5. Medical Excellence

**Predefined Industries**:
1. Pharmaceutical
2. Biotechnology
3. Medical Devices
4. Healthcare Payers
5. Digital Health
6. Healthcare Consulting

**Solution-Industry Matrix** (from your spec):
```
┌─────────────────────────┬──────┬──────┬──────┬────────┬─────────┬───────────┐
│ Solution / Industry     │ Phrm │ Btch │ MedD │ Payers │ Digital │ Consult   │
├─────────────────────────┼──────┼──────┼──────┼────────┼─────────┼───────────┤
│ Launch Excellence       │  ✓   │  ✓   │  ✓   │   -    │    ✓    │     ✓     │
│ Brand Excellence        │  ✓   │  ✓   │  ✓   │   -    │    ✓    │     ✓     │
│ Strategic Foresight     │  ✓   │  ✓   │  ✓   │   ✓    │    ✓    │     ✓     │
│ Commercial Excellence   │  ✓   │  ✓   │  ✓   │   ✓    │    ✓    │     ✓     │
│ Medical Excellence      │  ✓   │  ✓   │  -   │   -    │    -    │     ✓     │
└─────────────────────────┴──────┴──────┴──────┴────────┴─────────┴───────────┘
```

---

### Layer 4: Core Domain - AI Assets (8 tables)

13. **agents** - AI consultants (254 to import)
14. **prompts** - Prompt library with 7 role types
15. **skills** - Skill definitions
16. **tools** - Integration tools
17. **knowledge_sources** - Knowledge base entries
18. **knowledge_chunks** - RAG vectors (pgvector)
19. **templates** - Reusable templates
20. **capabilities** - Platform capabilities

---

### Layer 5: Business Context - Organizational Structure (15 tables)

**Organizational Hierarchy**:
```
Industry (e.g., Pharmaceuticals)
  ↓
Function (e.g., Medical Affairs)
  ↓
Department (e.g., Medical Science Liaison)
  ↓
Role (e.g., Senior MSL)
  ↓
Responsibilities (e.g., KOL Engagement)
```

21. **industries** - Industry taxonomy (already listed above in Layer 3)
22. **org_functions** - Functional areas (14 types)
    - Commercial
    - Medical Affairs
    - Market Access
    - Clinical
    - Regulatory
    - Research & Development
    - Manufacturing
    - Quality
    - Operations
    - IT/Digital
    - Legal
    - Finance
    - HR
    - Business Development

23. **org_departments** - Department structure
24. **org_roles** - Role definitions
25. **org_responsibilities** - Responsibility library
26. **function_departments** - Junction: function ↔ department
27. **function_roles** - Junction: function ↔ role
28. **department_roles** - Junction: department ↔ role
29. **role_responsibilities** - Junction: role ↔ responsibility
30. **personas** - Professional personas (335 records)
31. **jobs_to_be_done** - JTBD library (338 records)
32. **jtbd_personas** - Junction: JTBD ↔ persona
33. **domains** - Business domains (outcome hierarchy top level)
34. **strategic_priorities** - Strategic objectives
35. **capability_jtbd_mapping** - Junction: capability ↔ JTBD

---

### Layer 6: Services - User-Facing (4 service types)

#### Service 1: Ask Expert (1:1 Consultations) - 3 tables
36. **expert_consultations** - 1:1 conversations
37. **expert_messages** - Consultation messages
38. **consultation_sessions** - Session tracking

#### Service 2: Ask Panel (Multi-Agent Discussions) - 8 tables
39. **panel_discussions** - Panel sessions
40. **panel_members** - Agent participants
41. **panel_messages** - Discussion messages
42. **panel_rounds** - Discussion rounds
43. **panel_consensus** - Consensus tracking
44. **panel_votes** - Vote records
45. **panel_templates** - Reusable panel configurations
46. **panel_facilitator_configs** - Facilitator settings

#### Service 3: Workflows - 10 tables
47. **workflows** - Workflow definitions
48. **workflow_step_definitions** - Step definitions
49. **workflow_step_connections** - Flow connections
50. **workflow_tasks** - Junction: workflow ↔ task
51. **tasks** - Task library
52. **steps** - Step library (atomic actions)
53. **task_agents** - Junction: task ↔ agent
54. **task_tools** - Junction: task ↔ tool
55. **task_skills** - Junction: task ↔ skill
56. **task_prerequisites** - Task dependencies

#### Service 4: Solutions Marketplace - 6 tables
57. **solutions** - (already listed in Layer 3)
58. **solution_agents** - Junction: solution ↔ agent
59. **solution_workflows** - Junction: solution ↔ workflow
60. **solution_prompts** - Junction: solution ↔ prompt
61. **solution_templates** - Junction: solution ↔ template
62. **solution_knowledge** - Junction: solution ↔ knowledge

---

### Layer 7: Execution - Runtime (5 tables)

63. **workflow_executions** - Workflow instances
64. **workflow_execution_steps** - Step execution tracking
65. **workflow_approvals** - Approval workflow
66. **workflow_logs** - Execution logs
67. **task_executions** - Individual task runs

---

### Layer 8: Outputs & Artifacts (5 tables)

68. **deliverables** - Output artifacts
69. **consultation_feedback** - User ratings/feedback
70. **votes** - Voting instances
71. **vote_records** - Individual vote records
72. **artifacts** - File storage metadata

---

### Layer 9: Governance & Compliance (8 tables)

73. **audit_log** - Complete audit trail (7-year retention)
74. **service_role_audit** - Service-level actions
75. **data_retention_policies** - Compliance rules

**Token & Cost Tracking** (from vital_data_strategy.md):
76. **token_usage_messages** - Per-message token tracking
77. **token_usage_sessions** - Per-session aggregation
78. **token_usage_consultations** - Per-consultation aggregation
79. **subscription_usage_monthly** - Monthly tenant usage
80. **cost_allocation** - Cost breakdown by tenant/user/agent

**Total: 80 tables**

---

## ENUM Types (20 types)

### Agent-related (5)
```sql
agent_status: development, testing, active, maintenance, deprecated, archived
agent_type: specialist, orchestrator, synthesizer, validator, facilitator, analyst, researcher, strategist
validation_status: pending, in_review, approved, rejected, requires_update
domain_expertise: medical, regulatory, legal, financial, business, technical, commercial, market_access, clinical, manufacturing, quality, research, general
data_classification: public, internal, confidential, restricted, phi
```

### JTBD-related (6)
```sql
functional_area_type: Commercial, Medical Affairs, Market Access, Clinical, Regulatory, R&D, Manufacturing, Quality, Operations, IT/Digital, Legal, Finance, HR, Business Development
job_category_type: strategic, operational, tactical, administrative, analytical, collaborative, creative, technical
frequency_type: daily, weekly, monthly, quarterly, yearly, as_needed
complexity_type: simple, moderate, complex, expert
decision_type: routine, tactical, strategic, critical
jtbd_status: draft, active, deprecated, archived
```

### Tenant-related (4)
```sql
tenant_status: trial, active, suspended, cancelled, churned
tenant_tier: free, starter, professional, enterprise, enterprise_plus
tenant_role: owner, admin, manager, member, guest, viewer
tenant_level: platform, solution_provider, enterprise_client, partner_org, trial_tenant
```

### Content-related (3)
```sql
prompt_role_type: system, context, instruction, example, panel_orchestration, analysis, synthesis
visibility_level: private, tenant, subtenant, organization, public
approval_status: draft, pending, in_review, approved, rejected
```

### Conversation-related (2)
```sql
conversation_mode: expert_consultation, panel_discussion, ask_panel
message_role: user, assistant, system, agent, panel_moderator, facilitator
```

---

## Key Tables - Detailed Structure

### tenants (5-Level Hierarchy)

```sql
CREATE TABLE tenants (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Hierarchy
  parent_tenant_id uuid REFERENCES tenants(id),
  root_tenant_id uuid REFERENCES tenants(id), -- Top of hierarchy
  tenant_level tenant_level NOT NULL, -- ENUM: platform, solution_provider, enterprise_client, partner_org, trial_tenant
  tenant_path ltree, -- Materialized path for efficient queries
  hierarchy_depth integer NOT NULL DEFAULT 0,

  -- Identity
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  domain varchar(255),

  -- Contact
  contact_email varchar(255) NOT NULL,
  contact_name varchar(255) NOT NULL,
  billing_email varchar(255),

  -- Subscription
  tier tenant_tier NOT NULL DEFAULT 'free',
  status tenant_status NOT NULL DEFAULT 'trial',

  -- Limits (inherited or overridden)
  max_users integer NOT NULL DEFAULT 5,
  max_agents integer NOT NULL DEFAULT 10,
  max_storage_gb integer NOT NULL DEFAULT 10,
  max_consultations_per_month integer,
  max_tokens_per_month bigint,

  -- Current Usage
  current_users integer NOT NULL DEFAULT 0,
  current_agents integer NOT NULL DEFAULT 0,
  current_storage_gb numeric NOT NULL DEFAULT 0,

  -- Trial & Subscription
  trial_ends_at timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,

  -- Configuration
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Compliance
  data_residency varchar(50),
  compliance_requirements text[],

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Index for hierarchy queries
CREATE INDEX idx_tenants_path ON tenants USING gist(tenant_path);
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_root ON tenants(root_tenant_id) WHERE deleted_at IS NULL;
```

**Seed Data - 5-Level Hierarchy Example**:
```sql
-- Level 0: Platform
INSERT INTO tenants (id, name, slug, tenant_level, hierarchy_depth, tenant_path)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'VITAL.expert Platform',
  'vital-platform',
  'platform',
  0,
  '00000000_0000_0000_0000_000000000001'
);

-- Level 1: Solution Provider (Pharma Vertical)
INSERT INTO tenants (id, parent_tenant_id, root_tenant_id, name, slug, tenant_level, hierarchy_depth, tenant_path)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Pharma Solutions Lab',
  'pharma-solutions',
  'solution_provider',
  1,
  '00000000_0000_0000_0000_000000000001.11111111_1111_1111_1111_111111111111'
);

-- Level 2: Enterprise Client
INSERT INTO tenants (id, parent_tenant_id, root_tenant_id, name, slug, tenant_level, hierarchy_depth, tenant_path)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Acme Pharmaceuticals',
  'acme-pharma',
  'enterprise_client',
  2,
  '00000000_0000_0000_0000_000000000001.11111111_1111_1111_1111_111111111111.22222222_2222_2222_2222_222222222222'
);
```

---

### solutions (Packaged Offerings)

```sql
CREATE TABLE solutions (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_tenant_id uuid NOT NULL REFERENCES tenants(id), -- Solution provider

  -- Core Identity
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL,
  description text NOT NULL,
  code varchar(50), -- 'LAUNCH-EX', 'BRAND-EX', etc.

  -- Classification
  category varchar(100), -- 'commercial', 'medical', 'strategic'
  subcategory varchar(100),
  solution_type varchar(50), -- 'packaged', 'custom', 'hybrid'

  -- Pricing
  price_model varchar(50), -- 'subscription', 'usage', 'one_time'
  base_price_monthly decimal(10,2),
  price_per_user decimal(10,2),
  enterprise_pricing jsonb,

  -- Content
  short_description text,
  long_description text,
  features jsonb[], -- Array of feature objects
  benefits text[],
  use_cases text[],

  -- Media
  icon_url text,
  banner_url text,
  demo_video_url text,
  screenshots text[],

  -- Marketplace
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_marketplace_visible boolean NOT NULL DEFAULT true,
  marketplace_tier varchar(50), -- 'free', 'standard', 'premium'

  -- Statistics
  installation_count integer NOT NULL DEFAULT 0,
  avg_rating decimal(3,2),
  total_reviews integer NOT NULL DEFAULT 0,

  -- Visibility
  visibility visibility_level NOT NULL DEFAULT 'tenant',

  -- Versioning
  version varchar(50) NOT NULL DEFAULT '1.0.0',
  changelog text,

  -- Tags
  tags text[],
  keywords text[],

  -- Audit
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT unique_solution_code UNIQUE(owner_tenant_id, code)
);
```

---

### solution_industry_matrix (Which Solutions for Which Industries)

```sql
CREATE TABLE solution_industry_matrix (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationships
  solution_id uuid NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  industry_id uuid NOT NULL REFERENCES industries(id) ON DELETE CASCADE,

  -- Configuration
  is_available boolean NOT NULL DEFAULT true,
  is_recommended boolean NOT NULL DEFAULT false,
  fit_score integer, -- 1-10 how well this solution fits this industry

  -- Customization
  industry_specific_config jsonb,
  industry_specific_prompts uuid[], -- Array of prompt IDs

  -- Notes
  implementation_notes text,
  success_stories text[],

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_solution_industry UNIQUE(solution_id, industry_id),
  CONSTRAINT valid_fit_score CHECK (fit_score BETWEEN 1 AND 10)
);
```

---

### org_functions (14 Functional Areas)

```sql
CREATE TABLE org_functions (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core Identity
  name varchar(255) NOT NULL UNIQUE,
  code varchar(50) NOT NULL UNIQUE, -- 'MA', 'COMM', 'HEOR', etc.
  description text,

  -- Hierarchy
  parent_function_id uuid REFERENCES org_functions(id),
  hierarchy_level integer NOT NULL DEFAULT 1,

  -- Industry Relevance
  primary_industries text[], -- Which industries this function is core to

  -- Metadata
  icon varchar(50),
  color varchar(7), -- Hex color for UI
  display_order integer,

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Seed Data - 14 Functions**:
```sql
INSERT INTO org_functions (name, code, description, primary_industries) VALUES
('Commercial', 'COMM', 'Sales, Marketing, Market Access', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Medical Affairs', 'MA', 'MSL, Medical Communications, Evidence Generation', ARRAY['pharmaceuticals', 'biotechnology']),
('Market Access', 'HEOR', 'HEOR, Payer Relations, Pricing & Reimbursement', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Clinical', 'CLIN', 'Clinical Trials, Clinical Operations', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Regulatory', 'REG', 'Regulatory Affairs, Compliance', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Research & Development', 'RND', 'Drug Discovery, R&D', ARRAY['pharmaceuticals', 'biotechnology']),
('Manufacturing', 'MFG', 'CMC, Manufacturing Operations', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Quality', 'QA', 'Quality Assurance, Quality Control', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Operations', 'OPS', 'Supply Chain, Operations', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('IT/Digital', 'IT', 'IT, Digital Transformation', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices', 'digital_health']),
('Legal', 'LEGAL', 'Legal, IP', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Finance', 'FIN', 'Finance, Accounting', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('HR', 'HR', 'Human Resources, Talent', ARRAY['pharmaceuticals', 'biotechnology', 'medical_devices']),
('Business Development', 'BD', 'Partnerships, M&A, Licensing', ARRAY['pharmaceuticals', 'biotechnology']);
```

---

### services_registry (Track Available Services)

```sql
CREATE TABLE services_registry (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Service Identity
  service_name varchar(100) NOT NULL UNIQUE, -- 'ask_expert', 'ask_panel', 'workflows', 'solutions'
  service_code varchar(50) NOT NULL UNIQUE,
  display_name varchar(255) NOT NULL,
  description text,

  -- Service Type
  service_category varchar(50) NOT NULL, -- 'conversation', 'execution', 'marketplace'

  -- Availability
  is_enabled boolean NOT NULL DEFAULT true,
  requires_subscription_tier tenant_tier, -- Minimum tier required

  -- Configuration
  default_config jsonb,
  rate_limits jsonb, -- {"requests_per_minute": 10, "requests_per_day": 1000}

  -- Pricing
  base_cost_per_use decimal(10,4),
  token_cost_multiplier decimal(5,2),

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Seed Data - 4 Services**:
```sql
INSERT INTO services_registry (service_name, service_code, display_name, description, service_category) VALUES
('ask_expert', 'AE', 'Ask Expert', '1:1 AI consultant conversations', 'conversation'),
('ask_panel', 'AP', 'Ask Panel', 'Multi-agent panel discussions', 'conversation'),
('workflows', 'WF', 'Workflows', 'Automated multi-step processes', 'execution'),
('solutions', 'SOL', 'Solutions Marketplace', 'Packaged solution offerings', 'marketplace');
```

---

## Build Sequence (Updated for 80 Tables)

I'll create **20 phase files** instead of 18:

1. **00_WIPE_DATABASE.sql** - Nuclear option
2. **01_extensions_and_enums.sql** - 20 ENUMs + extensions
3. **02_tenants_5_level_hierarchy.sql** - Multi-tenant with 5 levels
4. **03_industries_and_solutions.sql** - Industries + Solutions + Matrix
5. **04_organizational_structure.sql** - Functions, Departments, Roles, Responsibilities
6. **05_agents_core.sql** - Agents table
7. **06_personas_and_jtbds.sql** - Personas + JTBDs + mappings
8. **07_content_library.sql** - Prompts, Tools, Knowledge, Skills, Templates
9. **08_capabilities_and_domains.sql** - Capabilities, Domains, Strategic Priorities
10. **09_workflows_and_tasks.sql** - Workflows, Tasks, Steps
11. **10_service_ask_expert.sql** - Expert consultations
12. **11_service_ask_panel.sql** - Panel discussions
13. **12_service_workflows_execution.sql** - Workflow execution runtime
14. **13_service_solutions_marketplace.sql** - Solutions marketplace
15. **14_agent_relationships.sql** - All agent junction tables
16. **15_deliverables_and_feedback.sql** - Outputs & user feedback
17. **16_token_usage_and_billing.sql** - Cost tracking
18. **17_audit_and_compliance.sql** - Audit log, retention
19. **18_performance_indexes.sql** - Comprehensive indexes
20. **19_row_level_security.sql** - RLS policies
21. **20_helper_functions.sql** - Utility functions
22. **21_seed_data.sql** - Initial data (solutions, industries, functions)

---

## Does This Match Your Vision?

This architecture includes:
✅ 5-level tenant hierarchy (Platform → Solution Provider → Enterprise → Partner → Trial)
✅ Solutions as first-class entities (5 solutions defined)
✅ Industries (6 industries)
✅ Solution-Industry matrix (compatibility mapping)
✅ Complete organizational structure (functions, departments, roles, responsibilities)
✅ 4 services (ask_expert, ask_panel, workflows, solutions)
✅ Token usage & billing tracking
✅ All elements from vital_data_strategy.md

**Ready for me to create all 22 SQL files?**

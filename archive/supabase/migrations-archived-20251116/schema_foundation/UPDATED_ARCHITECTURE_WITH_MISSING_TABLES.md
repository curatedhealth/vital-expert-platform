# Updated Architecture - Missing Tables Added

## NEW Tables to Add (13 tables)

### Prompt Management System (5 tables)

```
prompt_suites (Collection of related prompts)
  ├── prompt_sub_suites (Nested collections)
  │   └── suite_prompts (Junction: suite → prompts)
  ├── suite_assignments (Which agents/solutions use which suites)
  └── prompt_versions (Version history for prompts)
```

### LLM Configuration (3 tables)

```
llm_providers (OpenAI, Anthropic, etc.)
  ├── llm_models (GPT-4, Claude-3, etc.)
  └── model_configurations (Per-tenant model configs)
```

### Knowledge Management (3 tables)

```
knowledge_domains (Medical, Regulatory, Commercial, etc.)
  ├── knowledge_domain_mapping (Junction: knowledge_source → domain)
  └── domain_hierarchies (Domain parent-child relationships)
```

### Skills Management (2 tables)

```
skills (Already exists, but needs enhancement)
  └── skill_categories (Group skills by category)
```

---

## Detailed Table Structures

### 1. prompt_suites

```sql
CREATE TABLE prompt_suites (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  description text,

  -- Classification
  suite_type varchar(100), -- 'expert', 'panel', 'workflow', 'solution_specific'
  category varchar(100), -- 'medical_affairs', 'commercial', 'regulatory'

  -- Hierarchy (for nested suites)
  parent_suite_id uuid REFERENCES prompt_suites(id),
  hierarchy_level integer NOT NULL DEFAULT 1,

  -- Configuration
  default_config jsonb, -- Default settings for all prompts in this suite
  execution_order jsonb[], -- Order in which prompts should execute

  -- Targeting
  target_personas text[],
  target_industries text[],
  target_jtbds uuid[], -- Which JTBDs this suite supports

  -- Versioning
  version varchar(50) NOT NULL DEFAULT '1.0.0',
  is_active boolean NOT NULL DEFAULT true,

  -- Metadata
  icon varchar(50),
  color varchar(7),
  tags text[],

  -- Usage tracking
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,

  -- Visibility
  visibility visibility_level NOT NULL DEFAULT 'tenant',
  is_system_suite boolean NOT NULL DEFAULT false,

  -- Approval
  approval_status validation_status NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES user_profiles(id),
  approved_at timestamptz,

  -- Audit
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT unique_suite_code_tenant UNIQUE(tenant_id, code)
);

COMMENT ON TABLE prompt_suites IS 'Collections of related prompts organized by use case';
```

### 2. prompt_sub_suites

```sql
CREATE TABLE prompt_sub_suites (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationships
  parent_suite_id uuid NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,

  -- Identity
  name varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  description text,

  -- Ordering
  display_order integer NOT NULL DEFAULT 1,

  -- Configuration
  config_overrides jsonb, -- Override parent suite config

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT unique_subsuite_code UNIQUE(parent_suite_id, code)
);

COMMENT ON TABLE prompt_sub_suites IS 'Nested collections within prompt suites';
```

### 3. suite_prompts (Junction Table)

```sql
CREATE TABLE suite_prompts (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationships (can belong to suite OR sub-suite)
  suite_id uuid REFERENCES prompt_suites(id) ON DELETE CASCADE,
  sub_suite_id uuid REFERENCES prompt_sub_suites(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Execution Configuration
  execution_order integer NOT NULL DEFAULT 1,
  is_required boolean NOT NULL DEFAULT true,
  is_conditional boolean NOT NULL DEFAULT false,
  condition_expression text, -- When to execute this prompt

  -- Role Override
  role_override prompt_role_type, -- Override prompt's default role

  -- Variable Mapping
  variable_mappings jsonb, -- Map suite-level variables to prompt variables

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT suite_or_subsuite_required CHECK (
    (suite_id IS NOT NULL AND sub_suite_id IS NULL) OR
    (suite_id IS NULL AND sub_suite_id IS NOT NULL)
  ),
  CONSTRAINT unique_suite_prompt UNIQUE(suite_id, sub_suite_id, prompt_id)
);

COMMENT ON TABLE suite_prompts IS 'Links prompts to suites/sub-suites with execution config';
```

### 4. suite_assignments (Who Uses Which Suites)

```sql
CREATE TABLE suite_assignments (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- What's assigned
  suite_id uuid NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,

  -- Assigned to (one of these)
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,

  -- Configuration
  is_default boolean NOT NULL DEFAULT false,
  config_overrides jsonb,

  -- Usage tracking
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,

  -- Audit
  assigned_by uuid REFERENCES user_profiles(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT one_assignment_target CHECK (
    (agent_id IS NOT NULL AND solution_id IS NULL AND workflow_id IS NULL) OR
    (agent_id IS NULL AND solution_id IS NOT NULL AND workflow_id IS NULL) OR
    (agent_id IS NULL AND solution_id IS NULL AND workflow_id IS NOT NULL)
  )
);

COMMENT ON TABLE suite_assignments IS 'Tracks which agents/solutions/workflows use which prompt suites';
```

### 5. prompt_versions

```sql
CREATE TABLE prompt_versions (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationship
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Version Details
  version varchar(50) NOT NULL,
  is_current boolean NOT NULL DEFAULT false,

  -- Content Snapshot
  content text NOT NULL,
  variables jsonb,
  role prompt_role_type NOT NULL,

  -- Change Tracking
  change_summary text,
  changed_by uuid REFERENCES user_profiles(id),
  changed_at timestamptz NOT NULL DEFAULT now(),

  -- Performance Comparison
  avg_effectiveness_score decimal(3,2),
  usage_count integer NOT NULL DEFAULT 0,

  CONSTRAINT unique_prompt_version UNIQUE(prompt_id, version)
);

COMMENT ON TABLE prompt_versions IS 'Version history for prompts';
```

---

### 6. llm_providers

```sql
CREATE TABLE llm_providers (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name varchar(255) NOT NULL UNIQUE, -- 'OpenAI', 'Anthropic', 'Google', etc.
  code varchar(50) NOT NULL UNIQUE, -- 'openai', 'anthropic', 'google'
  description text,

  -- Provider Details
  website_url text,
  documentation_url text,
  api_base_url text,

  -- Status
  is_active boolean NOT NULL DEFAULT true,
  is_deprecated boolean NOT NULL DEFAULT false,

  -- Configuration
  auth_type varchar(50) NOT NULL, -- 'api_key', 'oauth', 'service_account'
  required_env_vars text[], -- ['OPENAI_API_KEY']
  default_config jsonb,

  -- Capabilities
  supports_streaming boolean NOT NULL DEFAULT true,
  supports_function_calling boolean NOT NULL DEFAULT true,
  supports_vision boolean NOT NULL DEFAULT false,
  supports_embeddings boolean NOT NULL DEFAULT false,

  -- Rate Limits (default)
  default_rate_limit_rpm integer, -- Requests per minute
  default_rate_limit_tpm integer, -- Tokens per minute

  -- Metadata
  icon_url text,
  logo_url text,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE llm_providers IS 'LLM provider registry (OpenAI, Anthropic, etc.)';
```

**Seed Data**:
```sql
INSERT INTO llm_providers (name, code, auth_type, supports_streaming, supports_function_calling, supports_vision, supports_embeddings) VALUES
('OpenAI', 'openai', 'api_key', true, true, true, true),
('Anthropic', 'anthropic', 'api_key', true, true, true, false),
('Google AI', 'google', 'api_key', true, true, true, true),
('Azure OpenAI', 'azure_openai', 'api_key', true, true, true, true),
('AWS Bedrock', 'aws_bedrock', 'service_account', true, true, false, true);
```

### 7. llm_models

```sql
CREATE TABLE llm_models (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationship
  provider_id uuid NOT NULL REFERENCES llm_providers(id) ON DELETE CASCADE,

  -- Identity
  name varchar(255) NOT NULL, -- 'GPT-4 Turbo', 'Claude 3.5 Sonnet'
  model_id varchar(255) NOT NULL, -- 'gpt-4-turbo-preview', 'claude-3-5-sonnet-20241022'
  description text,

  -- Classification
  model_family varchar(100), -- 'gpt-4', 'claude-3', 'gemini'
  model_tier varchar(50), -- 'flagship', 'standard', 'fast', 'embedding'

  -- Capabilities
  context_window integer NOT NULL, -- Max tokens
  max_output_tokens integer,
  supports_streaming boolean NOT NULL DEFAULT true,
  supports_function_calling boolean NOT NULL DEFAULT false,
  supports_vision boolean NOT NULL DEFAULT false,

  -- Pricing (per 1M tokens)
  input_cost_per_million decimal(10,4), -- USD
  output_cost_per_million decimal(10,4), -- USD
  training_cutoff_date date,

  -- Performance
  avg_latency_ms integer, -- Typical response time
  throughput_tps integer, -- Tokens per second

  -- Status
  is_active boolean NOT NULL DEFAULT true,
  is_deprecated boolean NOT NULL DEFAULT false,
  is_beta boolean NOT NULL DEFAULT false,

  -- Recommended Use Cases
  recommended_for text[], -- ['analysis', 'generation', 'coding']

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_provider_model UNIQUE(provider_id, model_id)
);

COMMENT ON TABLE llm_models IS 'LLM model registry with capabilities and pricing';
```

**Seed Data**:
```sql
-- Anthropic Models
INSERT INTO llm_models (provider_id, name, model_id, context_window, max_output_tokens, input_cost_per_million, output_cost_per_million, supports_function_calling, supports_vision) VALUES
((SELECT id FROM llm_providers WHERE code = 'anthropic'), 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022', 200000, 8192, 3.00, 15.00, true, true),
((SELECT id FROM llm_providers WHERE code = 'anthropic'), 'Claude 3 Opus', 'claude-3-opus-20240229', 200000, 4096, 15.00, 75.00, true, true),
((SELECT id FROM llm_providers WHERE code = 'anthropic'), 'Claude 3 Haiku', 'claude-3-haiku-20240307', 200000, 4096, 0.25, 1.25, true, true);

-- OpenAI Models
INSERT INTO llm_models (provider_id, name, model_id, context_window, max_output_tokens, input_cost_per_million, output_cost_per_million, supports_function_calling, supports_vision) VALUES
((SELECT id FROM llm_providers WHERE code = 'openai'), 'GPT-4 Turbo', 'gpt-4-turbo-preview', 128000, 4096, 10.00, 30.00, true, true),
((SELECT id FROM llm_providers WHERE code = 'openai'), 'GPT-4', 'gpt-4', 8192, 4096, 30.00, 60.00, true, false),
((SELECT id FROM llm_providers WHERE code = 'openai'), 'GPT-3.5 Turbo', 'gpt-3.5-turbo', 16384, 4096, 0.50, 1.50, true, false);
```

### 8. model_configurations (Per-Tenant Model Settings)

```sql
CREATE TABLE model_configurations (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationship
  model_id uuid NOT NULL REFERENCES llm_models(id) ON DELETE CASCADE,

  -- Configuration Name
  name varchar(255) NOT NULL,
  description text,

  -- Model Parameters
  temperature decimal(3,2) NOT NULL DEFAULT 0.7,
  top_p decimal(3,2) NOT NULL DEFAULT 1.0,
  top_k integer,
  max_tokens integer,
  frequency_penalty decimal(3,2),
  presence_penalty decimal(3,2),

  -- System Configuration
  system_prompt text,
  stop_sequences text[],

  -- Usage Controls
  max_calls_per_minute integer,
  max_calls_per_day integer,
  cost_limit_per_call decimal(10,4),

  -- Status
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,

  -- Usage Tracking
  usage_count integer NOT NULL DEFAULT 0,
  total_cost decimal(10,2) NOT NULL DEFAULT 0,

  -- Audit
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT valid_temperature CHECK (temperature BETWEEN 0 AND 2),
  CONSTRAINT valid_top_p CHECK (top_p BETWEEN 0 AND 1),
  CONSTRAINT unique_tenant_config_name UNIQUE(tenant_id, name)
);

COMMENT ON TABLE model_configurations IS 'Per-tenant model configurations and parameters';
```

---

### 9. knowledge_domains

```sql
CREATE TABLE knowledge_domains (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Identity
  name varchar(255) NOT NULL,
  code varchar(50) NOT NULL,
  description text,

  -- Hierarchy
  parent_domain_id uuid REFERENCES knowledge_domains(id),
  hierarchy_level integer NOT NULL DEFAULT 1,
  domain_path ltree, -- For efficient hierarchy queries

  -- Classification
  domain_type varchar(100), -- 'medical', 'regulatory', 'commercial', 'technical'
  industry_focus text[],

  -- Metadata
  icon varchar(50),
  color varchar(7),
  tags text[],

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Statistics
  knowledge_source_count integer NOT NULL DEFAULT 0,
  total_chunk_count integer NOT NULL DEFAULT 0,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT unique_domain_code_tenant UNIQUE(tenant_id, code)
);

COMMENT ON TABLE knowledge_domains IS 'Hierarchical organization of knowledge areas';

CREATE INDEX idx_knowledge_domains_path ON knowledge_domains USING gist(domain_path);
```

**Seed Data Examples**:
```sql
INSERT INTO knowledge_domains (tenant_id, name, code, domain_type, hierarchy_level) VALUES
-- Level 1: Top-level domains
('00000000-0000-0000-0000-000000000000', 'Medical & Clinical', 'MED', 'medical', 1),
('00000000-0000-0000-0000-000000000000', 'Regulatory & Compliance', 'REG', 'regulatory', 1),
('00000000-0000-0000-0000-000000000000', 'Commercial & Marketing', 'COMM', 'commercial', 1),
('00000000-0000-0000-0000-000000000000', 'Market Access & HEOR', 'HEOR', 'commercial', 1);

-- Level 2: Sub-domains (examples)
-- Medical sub-domains
INSERT INTO knowledge_domains (tenant_id, name, code, parent_domain_id, domain_type, hierarchy_level) VALUES
('00000000-0000-0000-0000-000000000000', 'Clinical Trials', 'MED-CT',
  (SELECT id FROM knowledge_domains WHERE code = 'MED'), 'medical', 2),
('00000000-0000-0000-0000-000000000000', 'Medical Communications', 'MED-COMM',
  (SELECT id FROM knowledge_domains WHERE code = 'MED'), 'medical', 2),
('00000000-0000-0000-0000-000000000000', 'Evidence Generation', 'MED-EVID',
  (SELECT id FROM knowledge_domains WHERE code = 'MED'), 'medical', 2);
```

### 10. knowledge_domain_mapping

```sql
CREATE TABLE knowledge_domain_mapping (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationships
  knowledge_source_id uuid NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  domain_id uuid NOT NULL REFERENCES knowledge_domains(id) ON DELETE CASCADE,

  -- Mapping Metadata
  is_primary boolean NOT NULL DEFAULT false,
  relevance_score integer, -- 1-10
  mapping_confidence decimal(3,2), -- 0-1 for ML-generated

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES user_profiles(id),

  CONSTRAINT unique_knowledge_domain UNIQUE(knowledge_source_id, domain_id),
  CONSTRAINT valid_relevance CHECK (relevance_score BETWEEN 1 AND 10)
);

COMMENT ON TABLE knowledge_domain_mapping IS 'Maps knowledge sources to domain categories';
```

### 11. domain_hierarchies (Helper View)

```sql
CREATE VIEW domain_hierarchies AS
SELECT
  d.id,
  d.name,
  d.code,
  d.domain_path,
  d.hierarchy_level,
  p.name as parent_name,
  p.code as parent_code,
  (SELECT COUNT(*) FROM knowledge_sources ks
   JOIN knowledge_domain_mapping kdm ON ks.id = kdm.knowledge_source_id
   WHERE kdm.domain_id = d.id) as source_count
FROM knowledge_domains d
LEFT JOIN knowledge_domains p ON d.parent_domain_id = p.id
WHERE d.deleted_at IS NULL;

COMMENT ON VIEW domain_hierarchies IS 'Flattened view of domain hierarchies with stats';
```

---

### 12. skill_categories

```sql
CREATE TABLE skill_categories (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name varchar(255) NOT NULL UNIQUE,
  code varchar(50) NOT NULL UNIQUE,
  description text,

  -- Hierarchy
  parent_category_id uuid REFERENCES skill_categories(id),

  -- Classification
  category_type varchar(100), -- 'technical', 'domain', 'soft_skill', 'tool'

  -- Metadata
  icon varchar(50),
  color varchar(7),

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE skill_categories IS 'Hierarchical categorization of skills';
```

**Seed Data**:
```sql
INSERT INTO skill_categories (name, code, category_type) VALUES
('Technical Skills', 'TECH', 'technical'),
('Domain Knowledge', 'DOMAIN', 'domain'),
('Analytical Skills', 'ANALYTICAL', 'soft_skill'),
('Communication Skills', 'COMM', 'soft_skill'),
('Tool Proficiency', 'TOOLS', 'tool'),
('Leadership Skills', 'LEADERSHIP', 'soft_skill');
```

### 13. Enhanced skills table

```sql
-- Add category_id to existing skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES skill_categories(id);
ALTER TABLE skills ADD COLUMN IF NOT EXISTS skill_type varchar(100); -- 'hard', 'soft', 'technical', 'domain'
ALTER TABLE skills ADD COLUMN IF NOT EXISTS proficiency_levels jsonb; -- ['beginner', 'intermediate', 'advanced', 'expert']
ALTER TABLE skills ADD COLUMN IF NOT EXISTS parent_skill_id uuid REFERENCES skills(id); -- For skill hierarchies
```

---

## Updated Table Count

**OLD**: 80 tables
**NEW**: 93 tables (+13 tables)

### New Breakdown:

**Prompt Management**: +5 tables
- prompt_suites
- prompt_sub_suites
- suite_prompts
- suite_assignments
- prompt_versions

**LLM Configuration**: +3 tables
- llm_providers
- llm_models
- model_configurations

**Knowledge Management**: +3 tables
- knowledge_domains
- knowledge_domain_mapping
- domain_hierarchies (view)

**Skills Management**: +2 tables
- skill_categories
- skills (enhanced with new columns)

---

## Updated Build Sequence

Add these new phases:

- **Phase 07b**: Prompt Suites & Sub-Suites (after Phase 07)
- **Phase 08b**: LLM Providers & Models (after Phase 08)
- **Phase 09b**: Knowledge Domains (after Phase 09)
- **Phase 10b**: Skill Categories (after Phase 10)

**New total: 26 migration phases** (up from 22)

---

Ready to regenerate the complete architecture with all these tables included?

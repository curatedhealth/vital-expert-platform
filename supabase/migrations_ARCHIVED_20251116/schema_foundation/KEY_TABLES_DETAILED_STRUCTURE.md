# Key Tables - Detailed Field Structure

This shows the exact fields for the 10 most critical tables in detail.

---

## 1. tenants (Multi-Tenancy Foundation)

```sql
CREATE TABLE tenants (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_tenant_id      uuid REFERENCES tenants(id), -- For 5-level hierarchy

  -- Identity
  name                  varchar(255) NOT NULL,
  slug                  varchar(100) NOT NULL UNIQUE,
  domain                varchar(255),

  -- Contact
  contact_email         varchar(255) NOT NULL,
  contact_name          varchar(255) NOT NULL,
  billing_email         varchar(255),

  -- Subscription
  tier                  tenant_tier NOT NULL DEFAULT 'free',
  status                tenant_status NOT NULL DEFAULT 'trial',

  -- Limits
  max_users             integer NOT NULL DEFAULT 5,
  max_agents            integer NOT NULL DEFAULT 10,
  max_storage_gb        integer NOT NULL DEFAULT 10,

  -- Current Usage
  current_users         integer NOT NULL DEFAULT 0,
  current_agents        integer NOT NULL DEFAULT 0,
  current_storage_gb    numeric NOT NULL DEFAULT 0,

  -- Trial & Subscription
  trial_ends_at         timestamptz,
  subscription_starts_at timestamptz,
  subscription_ends_at  timestamptz,

  -- Configuration
  features              jsonb NOT NULL DEFAULT '{"custom_agents": true}'::jsonb,
  settings              jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Audit
  created_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES auth.users(id),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT tenants_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT tenants_usage_within_limits CHECK (
    current_users <= max_users AND
    current_agents <= max_agents AND
    current_storage_gb <= max_storage_gb
  )
);
```

**Default Tenants to Create**:
1. `00000000-0000-0000-0000-000000000000` - Default Tenant
2. `11111111-1111-1111-1111-111111111111` - Digital Health Startups
3. `22222222-2222-2222-2222-222222222222` - Pharmaceuticals

---

## 2. agents (AI Consultants - 254 to import)

```sql
CREATE TABLE agents (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  name                  varchar(255) NOT NULL,
  display_name          varchar(255) NOT NULL,
  description           text NOT NULL,
  version               varchar(50) NOT NULL DEFAULT '1.0.0',

  -- Classification
  agent_type            agent_type NOT NULL DEFAULT 'specialist',
  domain_expertise      domain_expertise NOT NULL DEFAULT 'general',
  business_function     varchar(100) NOT NULL,
  industry_focus        text[] NOT NULL DEFAULT '{}',

  -- Status & Lifecycle
  status                agent_status NOT NULL DEFAULT 'development',
  validation_status     validation_status NOT NULL DEFAULT 'pending',
  is_active             boolean NOT NULL DEFAULT false,

  -- Capabilities
  specializations       text[] NOT NULL DEFAULT '{}',
  supported_languages   text[] NOT NULL DEFAULT '{"en"}',
  can_use_tools         boolean NOT NULL DEFAULT true,
  can_access_knowledge  boolean NOT NULL DEFAULT true,

  -- Performance Metadata
  avg_response_time_ms  integer,
  success_rate          decimal(5,2), -- 0-100
  total_consultations   integer NOT NULL DEFAULT 0,
  avg_rating            decimal(3,2), -- 0-5

  -- Configuration
  model_config          jsonb NOT NULL DEFAULT '{
    "provider": "anthropic",
    "model": "claude-sonnet-4",
    "temperature": 0.7,
    "max_tokens": 4096
  }'::jsonb,

  execution_config      jsonb NOT NULL DEFAULT '{
    "timeout_seconds": 300,
    "max_retries": 3,
    "streaming": true
  }'::jsonb,

  -- Visibility & Access
  visibility            visibility_level NOT NULL DEFAULT 'tenant',
  access_requirements   jsonb,

  -- Additional Metadata
  avatar_url            text,
  personality_traits    jsonb,
  communication_style   jsonb,

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  deleted_by            uuid REFERENCES user_profiles(id),

  -- Constraints
  CONSTRAINT valid_success_rate CHECK (success_rate BETWEEN 0 AND 100),
  CONSTRAINT valid_rating CHECK (avg_rating BETWEEN 0 AND 5),
  CONSTRAINT valid_response_time CHECK (avg_response_time_ms >= 0)
);
```

---

## 3. personas (Professional Roles - 335 records)

```sql
CREATE TABLE personas (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  name                  varchar(255) NOT NULL,
  title                 varchar(255) NOT NULL,
  description           text NOT NULL,
  code                  varchar(50), -- e.g., 'MA-MSL-001'

  -- Organizational Context
  functional_area       functional_area_type NOT NULL,
  department            varchar(100),
  seniority_level       varchar(50) NOT NULL, -- 'ic', 'manager', 'director', 'vp', 'c_level'
  reports_to_title      varchar(255),

  -- Responsibilities & Context
  responsibilities      text[] NOT NULL DEFAULT '{}',
  pain_points           text[] NOT NULL DEFAULT '{}',
  goals                 text[] NOT NULL DEFAULT '{}',
  kpis                  text[],
  daily_tasks           text[],

  -- Demographics
  typical_education     varchar(100),
  typical_experience_years integer,
  typical_team_size     integer,
  industry_focus        text[],

  -- Decision-Making
  decision_authority    text[],
  budget_authority      varchar(100),
  stakeholder_relationships jsonb,

  -- Preferences & Style
  communication_preferences jsonb,
  work_style            jsonb,
  technology_proficiency varchar(50),

  -- Metadata
  avatar_url            text,
  is_template           boolean NOT NULL DEFAULT false,
  usage_count           integer NOT NULL DEFAULT 0,

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT valid_experience CHECK (typical_experience_years >= 0),
  CONSTRAINT valid_team_size CHECK (typical_team_size >= 0)
);
```

---

## 4. jobs_to_be_done (JTBD Library - 338 records)

```sql
CREATE TABLE jobs_to_be_done (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  code                  varchar(50) NOT NULL, -- 'MA-MSL-001'
  title                 varchar(500) NOT NULL,
  description           text NOT NULL,

  -- Classification (NO NULLs!)
  functional_area       functional_area_type NOT NULL,
  job_category          job_category_type NOT NULL DEFAULT 'operational',
  domain                varchar(100) NOT NULL,
  subdomain             varchar(100),

  -- Context
  context               text,
  success_criteria      text[] NOT NULL DEFAULT '{}',
  common_obstacles      text[],
  required_skills       text[],

  -- Complexity & Frequency
  complexity            complexity_type NOT NULL DEFAULT 'moderate',
  frequency             frequency_type NOT NULL DEFAULT 'as_needed',
  decision_type         decision_type NOT NULL DEFAULT 'tactical',
  avg_time_to_complete_hours integer,

  -- Hierarchy Links
  capability_id         uuid REFERENCES capabilities(id),
  parent_workflow_id    uuid REFERENCES workflows(id),
  strategic_priority_id uuid REFERENCES strategic_priorities(id),

  -- Metadata
  status                jtbd_status NOT NULL DEFAULT 'active',
  usage_count           integer NOT NULL DEFAULT 0,
  last_used_at          timestamptz,

  -- Tags & Search
  tags                  text[],
  keywords              text[],

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT unique_jtbd_code_tenant UNIQUE(tenant_id, code),
  CONSTRAINT valid_time_estimate CHECK (avg_time_to_complete_hours > 0)
);
```

---

## 5. jtbd_personas (Mapping with Relevance Scoring)

```sql
CREATE TABLE jtbd_personas (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Relationships
  jtbd_id               uuid NOT NULL REFERENCES jobs_to_be_done(id) ON DELETE CASCADE,
  persona_id            uuid NOT NULL REFERENCES personas(id) ON DELETE CASCADE,

  -- Mapping Metadata
  relevance_score       integer NOT NULL, -- 1-10 scale (FIXED!)
  mapping_source        mapping_source_type NOT NULL DEFAULT 'automated',
  confidence_score      decimal(3,2), -- 0-1 for ML-generated
  is_primary_persona    boolean NOT NULL DEFAULT false,

  -- Context
  notes                 text,
  specific_use_cases    text[],

  -- Audit
  created_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid REFERENCES user_profiles(id),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_jtbd_persona UNIQUE(jtbd_id, persona_id),
  CONSTRAINT valid_relevance_score CHECK (relevance_score BETWEEN 1 AND 10),
  CONSTRAINT valid_confidence CHECK (confidence_score BETWEEN 0 AND 1)
);
```

---

## 6. prompts (Prompt Library)

```sql
CREATE TABLE prompts (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  name                  varchar(255) NOT NULL,
  description           text,
  code                  varchar(50),

  -- Classification
  role                  prompt_role_type NOT NULL, -- system, context, instruction, etc.
  category              varchar(100),
  subcategory           varchar(100),

  -- Content
  content               text NOT NULL,
  variables             jsonb, -- {"persona": "string", "context": "string"}
  example_usage         text,

  -- Versioning
  version               varchar(50) NOT NULL DEFAULT '1.0.0',
  is_latest             boolean NOT NULL DEFAULT true,
  parent_prompt_id      uuid REFERENCES prompts(id),

  -- Usage Metadata
  usage_count           integer NOT NULL DEFAULT 0,
  last_used_at          timestamptz,
  avg_effectiveness_score decimal(3,2), -- 0-5

  -- Targeting
  target_personas       text[], -- Which personas this prompt is for
  target_industries     text[],

  -- Visibility
  visibility            visibility_level NOT NULL DEFAULT 'tenant',
  is_system_prompt      boolean NOT NULL DEFAULT false,

  -- Approval Workflow
  approval_status       validation_status NOT NULL DEFAULT 'pending',
  approved_by           uuid REFERENCES user_profiles(id),
  approved_at           timestamptz,

  -- Tags & Search
  tags                  text[],
  keywords              text[],

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT valid_effectiveness CHECK (avg_effectiveness_score BETWEEN 0 AND 5)
);
```

---

## 7. tools (Integration Tools)

```sql
CREATE TABLE tools (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  name                  varchar(255) NOT NULL,
  display_name          varchar(255) NOT NULL,
  description           text NOT NULL,
  code                  varchar(50),

  -- Classification
  tool_type             varchar(100) NOT NULL, -- 'api', 'database', 'file_system'
  category              varchar(100),
  provider              varchar(100),

  -- Configuration
  endpoint_url          text,
  authentication_config jsonb,
  request_config        jsonb,
  response_config       jsonb,

  -- Parameters (JSON Schema)
  input_schema          jsonb NOT NULL,
  output_schema         jsonb NOT NULL,

  -- Usage & Limits
  rate_limit_per_minute integer,
  rate_limit_per_day    integer,
  cost_per_call         decimal(10,4), -- USD
  avg_response_time_ms  integer,

  -- Status & Health
  is_active             boolean NOT NULL DEFAULT true,
  health_status         varchar(50) NOT NULL DEFAULT 'healthy',
  last_health_check_at  timestamptz,
  health_check_url      text,

  -- Metadata
  version               varchar(50) NOT NULL DEFAULT '1.0.0',
  documentation_url     text,
  usage_count           integer NOT NULL DEFAULT 0,

  -- Visibility
  visibility            visibility_level NOT NULL DEFAULT 'tenant',

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT valid_rate_limits CHECK (
    (rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0) AND
    (rate_limit_per_day IS NULL OR rate_limit_per_day > 0)
  )
);
```

---

## 8. knowledge_sources (RAG Knowledge Base)

```sql
CREATE TABLE knowledge_sources (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Core Identity
  name                  varchar(255) NOT NULL,
  description           text,
  code                  varchar(50),

  -- Source Details
  source_type           varchar(100) NOT NULL, -- 'document', 'url', 'api', 'manual'
  source_url            text,
  source_metadata       jsonb,

  -- Content
  content               text,
  file_size_bytes       bigint,
  file_mime_type        varchar(100),

  -- Embedding Status
  embedding_status      varchar(50) NOT NULL DEFAULT 'pending',
  embedding_model       varchar(100),
  chunk_count           integer NOT NULL DEFAULT 0,

  -- Classification
  category              varchar(100),
  subcategory           varchar(100),
  tags                  text[],
  data_classification   data_classification NOT NULL DEFAULT 'internal',

  -- Versioning
  version               varchar(50) NOT NULL DEFAULT '1.0.0',
  last_updated_at       timestamptz,

  -- Usage
  usage_count           integer NOT NULL DEFAULT 0,
  last_accessed_at      timestamptz,
  avg_retrieval_score   decimal(3,2), -- Relevance feedback

  -- Targeting
  target_personas       text[],
  target_industries     text[],

  -- Visibility
  visibility            visibility_level NOT NULL DEFAULT 'tenant',

  -- Audit
  created_by            uuid REFERENCES user_profiles(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);
```

---

## 9. knowledge_chunks (RAG Vectors)

```sql
CREATE TABLE knowledge_chunks (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  knowledge_source_id   uuid NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Content
  content               text NOT NULL,
  chunk_index           integer NOT NULL,

  -- Embedding (pgvector)
  embedding             vector(1536), -- OpenAI ada-002 dimension

  -- Metadata
  metadata              jsonb, -- Page, section, headers, etc.
  token_count           integer,

  -- Audit
  created_at            timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_source_chunk UNIQUE(knowledge_source_id, chunk_index)
);
```

---

## 10. expert_consultations (1:1 Conversations)

```sql
CREATE TABLE expert_consultations (
  -- Primary Key
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Participants
  user_id               uuid NOT NULL REFERENCES user_profiles(id),
  agent_id              uuid NOT NULL REFERENCES agents(id),
  persona_id            uuid REFERENCES personas(id), -- User acting as this persona

  -- Classification
  title                 varchar(500),
  consultation_type     varchar(100),
  jtbd_id               uuid REFERENCES jobs_to_be_done(id),
  workflow_id           uuid REFERENCES workflows(id),

  -- Status
  status                varchar(50) NOT NULL DEFAULT 'active',
  priority              varchar(20) NOT NULL DEFAULT 'normal',

  -- Session Details
  started_at            timestamptz NOT NULL DEFAULT now(),
  ended_at              timestamptz,
  duration_seconds      integer,

  -- Statistics
  message_count         integer NOT NULL DEFAULT 0,
  tool_call_count       integer NOT NULL DEFAULT 0,
  total_tokens          integer NOT NULL DEFAULT 0,
  total_cost            decimal(10,4) NOT NULL DEFAULT 0,

  -- Ratings
  user_rating           integer, -- 1-5
  user_feedback         text,

  -- Context
  context               jsonb,
  tags                  text[],

  -- Audit
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,

  -- Constraints
  CONSTRAINT valid_rating CHECK (user_rating BETWEEN 1 AND 5),
  CONSTRAINT valid_duration CHECK (duration_seconds >= 0)
);
```

---

## Key Design Principles Visible Here

✅ **Every table has `tenant_id`** - Complete multi-tenant isolation
✅ **NO NULLs on critical fields** - `functional_area`, `status`, etc. are NOT NULL
✅ **ENUMs for type safety** - No VARCHAR where ENUM should be used
✅ **Proper foreign keys** - All relationships enforced with CASCADE behaviors
✅ **Comprehensive audit** - created_at, updated_at, deleted_at, created_by on all tables
✅ **Soft delete pattern** - deleted_at instead of hard deletes
✅ **Performance-ready** - Will add indexes in Phase 15
✅ **RLS-ready** - Will enable policies in Phase 16
✅ **JSONB for flexibility** - Configuration, metadata, settings use JSONB
✅ **Arrays normalized** - No more UUID arrays, all via junction tables

---

This is what we're building. Review this carefully before we proceed.

**Ready to create this?**

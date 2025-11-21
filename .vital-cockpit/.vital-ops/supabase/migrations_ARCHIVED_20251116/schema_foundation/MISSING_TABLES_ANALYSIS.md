# Missing Tables Analysis - Old DB vs New Gold-Standard DB

**Old DB**: 216 tables
**New Gold-Standard DB**: 93 tables
**Difference**: 123 tables from old DB not in new design

---

## Critical Tables We're Missing (Must Add)

### 1. Agent Metrics & Performance (4 tables)
✅ **agent_metrics** - Detailed performance tracking per operation
✅ **agent_persona_mapping** - Agent-persona relationships
✅ **agent_industry_mapping** - Agent-industry performance (we have agent_industries, but not the detailed mapping)
✅ **performance_metrics** - General performance tracking

### 2. Memory & Context (6 tables)
❌ **user_memory** - User conversation memory
❌ **user_long_term_memory** - Persistent user context
❌ **user_facts** - Extracted user facts
❌ **session_memories** - Per-session context
❌ **chat_memory** - Conversation memory
❌ **chat_history** - Historical chat records

### 3. LLM Usage & Monitoring (5 tables)
✅ **llm_usage_logs** - Per-call LLM usage tracking
✅ **llm_provider_health_checks** - Provider uptime monitoring
✅ **tool_usage_logs** - Tool execution tracking
✅ **tool_executions** - Tool call history
✅ **query_logs** - Search query logs

### 4. Rate Limiting & Quotas (3 tables)
❌ **rate_limit_config** - Rate limit configurations
❌ **usage_quotas** - Tenant/user quotas
❌ **usage_tracking** - Real-time usage tracking

### 5. Security & Compliance (5 tables)
✅ **encrypted_api_keys** - Secure API key storage
✅ **consent_records** - User consent tracking (GDPR)
✅ **compliance_records** - Compliance audit trail
✅ **data_retention_tracking** - Retention policy execution
✅ **retention_actions** - Automated retention actions

### 6. Alerts & Monitoring (3 tables)
❌ **alerts** - System alerts
❌ **alert_logs** - Alert history
❌ **health_checks** - System health monitoring

### 7. Analytics & Events (4 tables)
❌ **analytics_events** - User behavior analytics
❌ **panel_analytics** - Panel discussion analytics
❌ **rag_usage_analytics** - RAG system analytics
❌ **prompt_usage_analytics** - Prompt effectiveness analytics

### 8. Tool Categories & Tags (4 tables)
✅ **tool_categories** - Tool categorization (we have this conceptually)
✅ **tool_tags** - Tool tagging system
✅ **tool_tag_assignments** - Junction table
❌ **tags** - Generic tagging system

### 9. Avatars & UI (2 tables)
❌ **avatars** - Avatar library for personas/agents
❌ **icons** - Icon library

### 10. Projects & Teams (4 tables)
❌ **projects** - Project management
❌ **project_members** - Project team members
❌ **institutions** - Institutional affiliations
❌ **institution_members** - Institution membership

### 11. Graph/Network Features (7 tables)
❌ **beliefs** - Agent belief systems (for reasoning)
❌ **evidence** - Evidence tracking
❌ **evidence_pack** - Evidence collections
❌ **signals** - Event signals
❌ **signal_tags** - Signal categorization
❌ **events** - Event tracking
❌ **event_signals** - Event-signal relationships

### 12. Legacy/Deprecated (Can Skip)
- dh_* tables (40+ tables) - Old Digital Health schema, likely deprecated
- ai_agents table - Duplicate of agents
- tools_legacy - Deprecated
- chat_* tables (5 tables) - Replaced by expert_consultations/panel_discussions
- conversations table - Replaced by our new structure

---

## Recommendation: Add These 30 Critical Tables

### Priority 1: Essential (15 tables)

1. **agent_metrics** - Performance tracking per operation
2. **llm_usage_logs** - Per-call LLM usage
3. **tool_usage_logs** - Tool execution logs
4. **encrypted_api_keys** - Secure API keys
5. **user_memory** - Conversation memory
6. **user_long_term_memory** - Persistent context
7. **session_memories** - Session context
8. **rate_limit_config** - Rate limiting
9. **usage_quotas** - Quota management
10. **usage_tracking** - Real-time usage
11. **consent_records** - GDPR compliance
12. **compliance_records** - Audit compliance
13. **analytics_events** - User analytics
14. **alerts** - System alerts
15. **health_checks** - System monitoring

### Priority 2: Important (10 tables)

16. **performance_metrics** - General metrics
17. **llm_provider_health_checks** - Provider monitoring
18. **tool_executions** - Tool history
19. **data_retention_tracking** - Retention execution
20. **panel_analytics** - Panel metrics
21. **rag_usage_analytics** - RAG metrics
22. **prompt_usage_analytics** - Prompt metrics
23. **alert_logs** - Alert history
24. **tool_tags** - Tool tagging
25. **tags** - Generic tags

### Priority 3: Nice-to-Have (5 tables)

26. **avatars** - Avatar library
27. **icons** - Icon library
28. **projects** - Project management
29. **project_members** - Project teams
30. **user_facts** - Extracted facts

---

## Updated Table Count

**Current Plan**: 93 tables
**Add Priority 1**: +15 tables = **108 tables**
**Add Priority 2**: +10 tables = **118 tables**
**Add Priority 3**: +5 tables = **123 tables**

**Final Gold-Standard DB**: **123 tables** (vs 216 in old DB)

**Reduction**: 93 tables removed (mostly dh_* legacy schema and duplicates)

---

## Detailed Structures for Priority 1 Tables

### 1. agent_metrics (Performance Tracking)

```sql
CREATE TABLE agent_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Context
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id),
  conversation_id uuid REFERENCES expert_consultations(id),
  session_id varchar(255),

  -- Operation Details
  operation_type varchar(100) NOT NULL, -- 'search', 'generation', 'analysis', 'tool_call'
  query_text text,
  search_method varchar(50), -- 'semantic', 'keyword', 'hybrid'

  -- Performance Metrics
  response_time_ms integer NOT NULL,
  tokens_input integer DEFAULT 0,
  tokens_output integer DEFAULT 0,
  cost_usd decimal(10,6) DEFAULT 0.0,

  -- Quality Metrics
  satisfaction_score integer CHECK (satisfaction_score BETWEEN 1 AND 5),
  confidence_score decimal(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  relevance_score decimal(3,2) CHECK (relevance_score BETWEEN 0 AND 1),

  -- RAG Metrics
  graphrag_hit boolean DEFAULT false,
  graphrag_fallback boolean DEFAULT false,
  graph_traversal_depth integer DEFAULT 0,
  chunks_retrieved integer DEFAULT 0,

  -- Success Tracking
  success boolean NOT NULL DEFAULT true,
  error_occurred boolean DEFAULT false,
  error_type varchar(100),
  error_message text,

  -- Additional Context
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_metrics_agent ON agent_metrics(agent_id, created_at DESC);
CREATE INDEX idx_agent_metrics_tenant ON agent_metrics(tenant_id, created_at DESC);
CREATE INDEX idx_agent_metrics_conversation ON agent_metrics(conversation_id);
CREATE INDEX idx_agent_metrics_performance ON agent_metrics(response_time_ms, success);
```

### 2. llm_usage_logs (Per-Call LLM Tracking)

```sql
CREATE TABLE llm_usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- LLM Context
  provider_id uuid REFERENCES llm_providers(id),
  model_id uuid REFERENCES llm_models(id),
  model_config_id uuid REFERENCES model_configurations(id),

  -- Request Context
  agent_id uuid REFERENCES agents(id),
  user_id uuid REFERENCES user_profiles(id),
  conversation_id uuid REFERENCES expert_consultations(id),
  panel_id uuid REFERENCES panel_discussions(id),

  -- Request Details
  prompt_text text,
  system_prompt text,
  prompt_tokens integer NOT NULL,
  completion_text text,
  completion_tokens integer NOT NULL,
  total_tokens integer NOT NULL,

  -- Cost Calculation
  input_cost decimal(10,6) NOT NULL,
  output_cost decimal(10,6) NOT NULL,
  total_cost decimal(10,6) NOT NULL,

  -- Performance
  response_time_ms integer NOT NULL,
  time_to_first_token_ms integer,

  -- Model Parameters Used
  temperature decimal(3,2),
  max_tokens integer,
  top_p decimal(3,2),

  -- Result Quality
  finish_reason varchar(50), -- 'stop', 'length', 'function_call', 'error'
  function_call jsonb, -- If function calling was used

  -- Status
  success boolean NOT NULL DEFAULT true,
  error_type varchar(100),
  error_message text,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_llm_usage_tenant ON llm_usage_logs(tenant_id, created_at DESC);
CREATE INDEX idx_llm_usage_model ON llm_usage_logs(model_id, created_at DESC);
CREATE INDEX idx_llm_usage_cost ON llm_usage_logs(total_cost DESC, created_at DESC);
CREATE INDEX idx_llm_usage_conversation ON llm_usage_logs(conversation_id);
```

### 3. user_memory (Conversation Memory)

```sql
CREATE TABLE user_memory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Context
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id),

  -- Memory Type
  memory_type varchar(50) NOT NULL, -- 'fact', 'preference', 'context', 'relationship'

  -- Content
  key varchar(255) NOT NULL,
  value text NOT NULL,
  confidence_score decimal(3,2) CHECK (confidence_score BETWEEN 0 AND 1),

  -- Source
  source_conversation_id uuid REFERENCES expert_consultations(id),
  source_message_id uuid,
  extracted_at timestamptz NOT NULL DEFAULT now(),

  -- Validity
  is_valid boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  last_accessed_at timestamptz,
  access_count integer NOT NULL DEFAULT 0,

  -- Embedding for semantic search
  embedding vector(1536),

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_memory_key UNIQUE(user_id, agent_id, key)
);

CREATE INDEX idx_user_memory_user ON user_memory(user_id, is_valid);
CREATE INDEX idx_user_memory_agent ON user_memory(agent_id, user_id);
CREATE INDEX idx_user_memory_type ON user_memory(memory_type);
CREATE INDEX idx_user_memory_embedding ON user_memory USING ivfflat(embedding vector_cosine_ops);
```

### 4. encrypted_api_keys (Secure Key Storage)

```sql
CREATE TABLE encrypted_api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Key Identity
  key_name varchar(255) NOT NULL,
  description text,

  -- Encrypted Storage
  encrypted_key text NOT NULL, -- Encrypted with tenant-specific key
  key_hash varchar(255) NOT NULL UNIQUE, -- For lookup
  key_prefix varchar(20) NOT NULL, -- First few chars for identification

  -- Provider Context
  provider_type varchar(100) NOT NULL, -- 'llm', 'tool', 'integration'
  provider_id uuid, -- Foreign key depends on provider_type

  -- Access Control
  allowed_agents uuid[], -- Which agents can use this key
  allowed_users uuid[], -- Which users can use this key
  allowed_ips inet[], -- IP whitelist

  -- Usage Limits
  max_calls_per_day integer,
  max_cost_per_day decimal(10,2),
  current_daily_calls integer DEFAULT 0,
  current_daily_cost decimal(10,2) DEFAULT 0,
  last_reset_at timestamptz DEFAULT now(),

  -- Status
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,
  last_rotated_at timestamptz,

  -- Audit
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES user_profiles(id),

  CONSTRAINT unique_key_name_tenant UNIQUE(tenant_id, key_name)
);

CREATE INDEX idx_encrypted_keys_tenant ON encrypted_api_keys(tenant_id, is_active);
CREATE INDEX idx_encrypted_keys_hash ON encrypted_api_keys(key_hash) WHERE is_active = true;
```

### 5. rate_limit_config (Rate Limiting)

```sql
CREATE TABLE rate_limit_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Scope
  limit_scope varchar(50) NOT NULL, -- 'tenant', 'user', 'agent', 'api_key'
  scope_id uuid, -- ID of the scoped entity

  -- Limit Type
  limit_type varchar(50) NOT NULL, -- 'requests', 'tokens', 'cost'

  -- Time Windows
  per_minute integer,
  per_hour integer,
  per_day integer,
  per_month integer,

  -- Hard vs Soft Limits
  is_hard_limit boolean NOT NULL DEFAULT false, -- Hard = block, Soft = warn

  -- Actions on Limit
  on_limit_action varchar(50) DEFAULT 'block', -- 'block', 'throttle', 'warn', 'queue'
  warning_threshold_percent integer DEFAULT 80,

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT valid_threshold CHECK (warning_threshold_percent BETWEEN 0 AND 100)
);

CREATE INDEX idx_rate_limit_tenant ON rate_limit_config(tenant_id, is_active);
CREATE INDEX idx_rate_limit_scope ON rate_limit_config(limit_scope, scope_id);
```

### 6. usage_tracking (Real-Time Usage)

```sql
CREATE TABLE usage_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Period
  tracking_period varchar(20) NOT NULL, -- 'minute', 'hour', 'day', 'month'
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  -- Scope
  user_id uuid REFERENCES user_profiles(id),
  agent_id uuid REFERENCES agents(id),
  api_key_id uuid REFERENCES encrypted_api_keys(id),

  -- Metrics
  request_count integer NOT NULL DEFAULT 0,
  token_count integer NOT NULL DEFAULT 0,
  total_cost decimal(10,2) NOT NULL DEFAULT 0,

  -- Breakdown by Type
  consultation_count integer DEFAULT 0,
  panel_count integer DEFAULT 0,
  workflow_count integer DEFAULT 0,
  tool_call_count integer DEFAULT 0,

  -- Quality Metrics
  avg_response_time_ms integer,
  success_rate decimal(5,2),
  error_count integer DEFAULT 0,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT unique_tracking_period UNIQUE(tenant_id, user_id, agent_id, tracking_period, period_start)
);

CREATE INDEX idx_usage_tracking_tenant ON usage_tracking(tenant_id, period_start DESC);
CREATE INDEX idx_usage_tracking_user ON usage_tracking(user_id, period_start DESC);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(tracking_period, period_start DESC);
```

---

## Should We Add All 30 Tables?

My recommendation:

**YES - Add all Priority 1 tables (15 tables)** - These are essential for production:
- Performance monitoring
- Cost tracking
- Security
- Compliance
- Memory/context

**MAYBE - Add Priority 2 tables (10 tables)** - Important for advanced features:
- Analytics
- Provider health monitoring
- Advanced metrics

**OPTIONAL - Priority 3 tables (5 tables)** - Nice-to-have:
- UI assets (avatars, icons)
- Project management

**New total: 108-123 tables** depending on what you want.

What do you think? Should I add all Priority 1 tables to the architecture?

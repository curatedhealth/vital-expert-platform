# AgentOS 3.0: Missing Schema Tables & Views
## Additional Database Objects Required for Full Implementation

**Date**: November 21, 2025  
**Purpose**: Complete the schema foundation for GraphRAG + Advanced Agents  
**Status**: Ready to Execute

---

## Overview

While AgentOS 2.0 provides 34 core tables, the full AgentOS 3.0 implementation requires additional tables for:

1. **Agent KG Views** - Knowledge graph access control
2. **Interaction Logging** - Monitoring and analytics
3. **Tier Configuration** - Evidence-based tiering system
4. **Panel Configuration** - Multi-agent panel settings
5. **Safety Triggers** - Mandatory escalation rules

---

## Additional Tables Required

### 1. Agent KG Views

```sql
-- ==========================================
-- TABLE: agent_kg_views
-- PURPOSE: Define agent-specific knowledge graph access permissions
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_kg_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Node type permissions
    include_nodes TEXT[] NOT NULL DEFAULT '{}',
    exclude_nodes TEXT[] DEFAULT '{}',
    
    -- Edge type permissions
    include_edges TEXT[] NOT NULL DEFAULT '{}',
    exclude_edges TEXT[] DEFAULT '{}',
    
    -- Traversal limits
    max_hops INTEGER DEFAULT 2 CHECK (max_hops >= 1 AND max_hops <= 5),
    graph_limit INTEGER DEFAULT 50 CHECK (graph_limit >= 1 AND graph_limit <= 1000),
    
    -- Performance settings
    enable_caching BOOLEAN DEFAULT true,
    cache_ttl_seconds INTEGER DEFAULT 3600,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agent_id)
);

CREATE INDEX idx_agent_kg_views_agent ON agent_kg_views(agent_id);
CREATE INDEX idx_agent_kg_views_tenant ON agent_kg_views(tenant_id);
CREATE INDEX idx_agent_kg_views_active ON agent_kg_views(is_active);

COMMENT ON TABLE agent_kg_views IS 'Agent-specific knowledge graph access control and traversal limits';

-- Seed default KG views for common agent types
INSERT INTO agent_kg_views (agent_id, include_nodes, include_edges, max_hops)
SELECT 
    id,
    ARRAY['Drug', 'Disease', 'Guideline', 'Publication']::TEXT[],
    ARRAY['TREATS', 'INDICATED_FOR', 'RECOMMENDS', 'SUPPORTED_BY']::TEXT[],
    3
FROM agents
WHERE slug LIKE '%medical-info%'
ON CONFLICT (agent_id) DO NOTHING;
```

### 2. Interaction Logging

```sql
-- ==========================================
-- TABLE: agent_interaction_logs
-- PURPOSE: Comprehensive logging for monitoring and analytics
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_interaction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request context
    session_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Tier and assessment
    tier_level INTEGER NOT NULL CHECK (tier_level IN (1, 2, 3)),
    complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    domain TEXT,
    data_classification TEXT,
    
    -- Query and response
    query TEXT NOT NULL,
    response TEXT,
    confidence_score NUMERIC(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- RAG metadata
    rag_profile_used TEXT,
    graph_hops INTEGER,
    vector_score NUMERIC(5,4),
    keyword_score NUMERIC(5,4),
    graph_score NUMERIC(5,4),
    
    -- Performance metrics
    response_time_ms INTEGER,
    rag_time_ms INTEGER,
    llm_time_ms INTEGER,
    total_tokens INTEGER,
    cost_usd NUMERIC(10,6),
    
    -- Outcomes
    escalated BOOLEAN DEFAULT false,
    escalation_reason TEXT,
    human_review_required BOOLEAN DEFAULT false,
    human_reviewed BOOLEAN DEFAULT false,
    human_feedback_score INTEGER CHECK (human_feedback_score BETWEEN 1 AND 5),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ
);

-- Partitioning by month for performance (optional)
-- ALTER TABLE agent_interaction_logs PARTITION BY RANGE (created_at);

-- Indexes
CREATE INDEX idx_agent_interaction_logs_session ON agent_interaction_logs(session_id);
CREATE INDEX idx_agent_interaction_logs_agent ON agent_interaction_logs(agent_id);
CREATE INDEX idx_agent_interaction_logs_user ON agent_interaction_logs(user_id);
CREATE INDEX idx_agent_interaction_logs_tenant ON agent_interaction_logs(tenant_id);
CREATE INDEX idx_agent_interaction_logs_tier ON agent_interaction_logs(tier_level);
CREATE INDEX idx_agent_interaction_logs_created ON agent_interaction_logs(created_at DESC);
CREATE INDEX idx_agent_interaction_logs_escalated ON agent_interaction_logs(escalated);
CREATE INDEX idx_agent_interaction_logs_domain ON agent_interaction_logs(domain);

COMMENT ON TABLE agent_interaction_logs IS 'Comprehensive logging of all agent interactions for monitoring and analytics';
```

### 3. Tier Configuration

```sql
-- ==========================================
-- TABLE: agent_tiers
-- PURPOSE: Evidence-based tier definitions with performance expectations
-- ==========================================

CREATE TABLE IF NOT EXISTS agent_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tier identity
    level INTEGER NOT NULL UNIQUE CHECK (level IN (1, 2, 3)),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Performance expectations
    accuracy_min NUMERIC(5,4) NOT NULL CHECK (accuracy_min >= 0 AND accuracy_min <= 1),
    accuracy_max NUMERIC(5,4) NOT NULL CHECK (accuracy_max >= 0 AND accuracy_max <= 1),
    response_time_target_ms INTEGER NOT NULL,
    cost_per_query_usd NUMERIC(10,6) NOT NULL,
    escalation_rate_target NUMERIC(5,4) CHECK (escalation_rate_target >= 0 AND escalation_rate_target <= 1),
    
    -- Requirements
    requires_human_oversight BOOLEAN DEFAULT false,
    requires_panel BOOLEAN DEFAULT false,
    requires_critic BOOLEAN DEFAULT false,
    min_confidence_threshold NUMERIC(5,4) CHECK (min_confidence_threshold >= 0 AND min_confidence_threshold <= 1),
    
    -- Allowed capabilities
    allowed_rag_profiles TEXT[] NOT NULL DEFAULT '{}',
    allowed_graph_types TEXT[] NOT NULL DEFAULT '{}',
    max_graph_complexity INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT accuracy_range_valid CHECK (accuracy_min < accuracy_max)
);

CREATE INDEX idx_agent_tiers_level ON agent_tiers(level);
CREATE INDEX idx_agent_tiers_active ON agent_tiers(is_active);

COMMENT ON TABLE agent_tiers IS 'Evidence-based tier definitions with performance expectations';

-- Seed tier definitions
INSERT INTO agent_tiers (level, name, description, accuracy_min, accuracy_max, response_time_target_ms, cost_per_query_usd, escalation_rate_target, requires_human_oversight, requires_panel, requires_critic, min_confidence_threshold, allowed_rag_profiles, allowed_graph_types)
VALUES 
    (1, 'Tier 1: Rapid Response', 'Simple queries, low risk, standard accuracy', 0.85, 0.92, 5000, 0.10, 0.08, false, false, false, 0.70, ARRAY['semantic_standard', 'hybrid_enhanced'], ARRAY['sequential', 'router']),
    (2, 'Tier 2: Expert Analysis', 'Moderate complexity, higher accuracy, optional panel', 0.90, 0.96, 30000, 0.50, 0.12, false, false, false, 0.80, ARRAY['hybrid_enhanced', 'graphrag_entity', 'agent_optimized'], ARRAY['sequential', 'parallel', 'router', 'conditional']),
    (3, 'Tier 3: Deep Reasoning + Human Oversight', 'High complexity, critical risk, mandatory oversight', 0.94, 0.98, 120000, 2.00, 0.05, true, true, true, 0.90, ARRAY['graphrag_entity', 'agent_optimized'], ARRAY['hierarchical', 'loop', 'subgraph', 'custom'])
ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    accuracy_min = EXCLUDED.accuracy_min,
    accuracy_max = EXCLUDED.accuracy_max,
    response_time_target_ms = EXCLUDED.response_time_target_ms,
    cost_per_query_usd = EXCLUDED.cost_per_query_usd,
    updated_at = NOW();
```

### 4. Panel Configuration

```sql
-- ==========================================
-- TABLE: panel_configurations
-- PURPOSE: Pre-configured panel setups for different scenarios
-- ==========================================

CREATE TABLE IF NOT EXISTS panel_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Panel identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Panel type
    panel_type TEXT NOT NULL CHECK (panel_type IN ('parallel', 'sequential', 'consensus', 'debate', 'socratic', 'delphi')),
    
    -- Configuration
    min_panel_size INTEGER DEFAULT 3 CHECK (min_panel_size >= 2),
    max_panel_size INTEGER DEFAULT 7 CHECK (max_panel_size >= min_panel_size),
    consensus_threshold NUMERIC(3,2) DEFAULT 0.67 CHECK (consensus_threshold >= 0 AND consensus_threshold <= 1),
    max_rounds INTEGER DEFAULT 3 CHECK (max_rounds >= 1 AND max_rounds <= 10),
    
    -- Member selection
    agent_selection_strategy TEXT CHECK (agent_selection_strategy IN ('fixed', 'dynamic', 'role_based', 'expertise_based')),
    require_diversity BOOLEAN DEFAULT true,
    diversity_dimensions TEXT[], -- e.g., ['specialty', 'seniority', 'geographic']
    
    -- Voting/consensus mechanism
    voting_method TEXT CHECK (voting_method IN ('majority', 'supermajority', 'unanimous', 'weighted', 'ranked_choice')),
    weight_by_expertise BOOLEAN DEFAULT false,
    allow_abstentions BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_panel_configurations_tenant ON panel_configurations(tenant_id);
CREATE INDEX idx_panel_configurations_type ON panel_configurations(panel_type);
CREATE INDEX idx_panel_configurations_active ON panel_configurations(is_active);

COMMENT ON TABLE panel_configurations IS 'Pre-configured panel setups for multi-agent discussions';

-- Panel member assignments
CREATE TABLE IF NOT EXISTS panel_configuration_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_configuration_id UUID NOT NULL REFERENCES panel_configurations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Member role in panel
    role TEXT CHECK (role IN ('moderator', 'expert', 'critic', 'synthesizer')),
    vote_weight NUMERIC(3,2) DEFAULT 1.0 CHECK (vote_weight >= 0),
    is_required BOOLEAN DEFAULT false,
    sequence_order INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(panel_configuration_id, agent_id)
);

CREATE INDEX idx_panel_config_members_panel ON panel_configuration_members(panel_configuration_id);
CREATE INDEX idx_panel_config_members_agent ON panel_configuration_members(agent_id);
```

### 5. Safety Triggers

```sql
-- ==========================================
-- TABLE: safety_triggers
-- PURPOSE: Mandatory escalation rules and safety patterns
-- ==========================================

CREATE TABLE IF NOT EXISTS safety_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Trigger identity
    trigger_name TEXT NOT NULL UNIQUE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('pattern', 'keyword', 'entity', 'sentiment', 'confidence', 'domain')),
    description TEXT,
    
    -- Pattern definition
    pattern_regex TEXT,
    keywords TEXT[],
    entities TEXT[],
    sentiment_threshold NUMERIC(3,2),
    confidence_threshold NUMERIC(3,2),
    domains TEXT[],
    
    -- Escalation action
    escalation_action TEXT NOT NULL CHECK (escalation_action IN ('tier_up', 'human_review', 'panel_required', 'block', 'warn')),
    escalation_priority TEXT CHECK (escalation_priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    escalation_message TEXT,
    
    -- Clinical safety flags
    is_clinical_safety BOOLEAN DEFAULT false,
    requires_immediate_action BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_safety_triggers_type ON safety_triggers(trigger_type);
CREATE INDEX idx_safety_triggers_active ON safety_triggers(is_active);
CREATE INDEX idx_safety_triggers_clinical ON safety_triggers(is_clinical_safety);

COMMENT ON TABLE safety_triggers IS 'Mandatory escalation rules and safety pattern detection';

-- Seed critical safety triggers
INSERT INTO safety_triggers (trigger_name, trigger_type, keywords, escalation_action, escalation_priority, escalation_message, is_clinical_safety, requires_immediate_action)
VALUES 
    ('emergency_symptoms', 'keyword', ARRAY['chest pain', 'difficulty breathing', 'severe bleeding', 'loss of consciousness', 'stroke symptoms', 'heart attack'], 'human_review', 'critical', 'Emergency symptoms detected - immediate clinical review required', true, true),
    ('diagnosis_change', 'keyword', ARRAY['change diagnosis', 'modify diagnosis', 'different diagnosis', 'misdiagnosed'], 'human_review', 'high', 'Diagnosis modification detected - clinical review required', true, false),
    ('treatment_modification', 'keyword', ARRAY['change treatment', 'stop medication', 'increase dose', 'decrease dose', 'switch medication'], 'human_review', 'high', 'Treatment modification detected - clinical review required', true, false),
    ('pediatric_case', 'keyword', ARRAY['child', 'children', 'pediatric', 'infant', 'baby', 'toddler', 'adolescent'], 'tier_up', 'high', 'Pediatric case detected - expert review recommended', true, false),
    ('pregnancy_case', 'keyword', ARRAY['pregnant', 'pregnancy', 'prenatal', 'gestational', 'expecting', 'trimester'], 'tier_up', 'high', 'Pregnancy-related query - expert review recommended', true, false),
    ('psychiatric_crisis', 'keyword', ARRAY['suicide', 'self-harm', 'kill myself', 'end my life', 'severe depression'], 'human_review', 'critical', 'Psychiatric crisis detected - immediate intervention required', true, true),
    ('low_confidence', 'confidence', NULL, 'tier_up', 'medium', 'Low confidence response - escalating to higher tier', false, false)
ON CONFLICT (trigger_name) DO UPDATE SET
    keywords = EXCLUDED.keywords,
    escalation_action = EXCLUDED.escalation_action,
    updated_at = NOW();
```

### 6. KG Node & Edge Type Registry

```sql
-- ==========================================
-- TABLE: kg_node_types
-- PURPOSE: Registry of knowledge graph node types
-- ==========================================

CREATE TABLE IF NOT EXISTS kg_node_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Node type identity
    type_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Classification
    domain TEXT, -- 'clinical', 'regulatory', 'commercial', 'research'
    category TEXT, -- 'entity', 'concept', 'document', 'person', 'organization'
    
    -- Properties schema (optional)
    required_properties TEXT[],
    optional_properties TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kg_node_types_domain ON kg_node_types(domain);
CREATE INDEX idx_kg_node_types_active ON kg_node_types(is_active);

-- Seed common node types
INSERT INTO kg_node_types (type_name, display_name, description, domain, category)
VALUES 
    ('Drug', 'Drug/Medication', 'Pharmaceutical drug or medication', 'clinical', 'entity'),
    ('Disease', 'Disease/Condition', 'Medical disease or health condition', 'clinical', 'entity'),
    ('Indication', 'Indication', 'Approved or investigational indication', 'clinical', 'concept'),
    ('Trial', 'Clinical Trial', 'Clinical trial or study', 'research', 'document'),
    ('Guideline', 'Clinical Guideline', 'Clinical practice guideline', 'clinical', 'document'),
    ('Publication', 'Publication', 'Research publication or article', 'research', 'document'),
    ('KOL', 'Key Opinion Leader', 'Key opinion leader or expert', 'commercial', 'person'),
    ('Payer', 'Payer/Insurance', 'Insurance payer or health plan', 'commercial', 'organization'),
    ('Regulation', 'Regulation', 'Regulatory requirement or filing', 'regulatory', 'document'),
    ('Device', 'Medical Device', 'Medical device or equipment', 'clinical', 'entity'),
    ('Biomarker', 'Biomarker', 'Biological marker or indicator', 'research', 'concept'),
    ('Pathway', 'Biological Pathway', 'Biological or metabolic pathway', 'research', 'concept')
ON CONFLICT (type_name) DO NOTHING;

-- ==========================================
-- TABLE: kg_edge_types
-- PURPOSE: Registry of knowledge graph edge types
-- ==========================================

CREATE TABLE IF NOT EXISTS kg_edge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Edge type identity
    type_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Relationship definition
    source_node_types TEXT[],
    target_node_types TEXT[],
    is_directional BOOLEAN DEFAULT true,
    
    -- Semantics
    relationship_category TEXT, -- 'clinical', 'regulatory', 'commercial', 'research'
    inverse_type_name TEXT, -- For bidirectional relationships
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kg_edge_types_category ON kg_edge_types(relationship_category);
CREATE INDEX idx_kg_edge_types_active ON kg_edge_types(is_active);

-- Seed common edge types
INSERT INTO kg_edge_types (type_name, display_name, description, source_node_types, target_node_types, relationship_category)
VALUES 
    ('TREATS', 'Treats', 'Drug treats disease/condition', ARRAY['Drug'], ARRAY['Disease', 'Indication'], 'clinical'),
    ('INDICATED_FOR', 'Indicated For', 'Drug is indicated for condition', ARRAY['Drug'], ARRAY['Disease', 'Indication'], 'clinical'),
    ('CONTRAINDICATED_WITH', 'Contraindicated With', 'Drug contraindicated with condition/drug', ARRAY['Drug'], ARRAY['Disease', 'Drug'], 'clinical'),
    ('RECOMMENDS', 'Recommends', 'Guideline recommends treatment', ARRAY['Guideline'], ARRAY['Drug', 'Device'], 'clinical'),
    ('SUPPORTED_BY', 'Supported By', 'Evidence supported by publication', ARRAY['Drug', 'Indication', 'Guideline'], ARRAY['Publication', 'Trial'], 'research'),
    ('REGULATES', 'Regulates', 'Regulation applies to entity', ARRAY['Regulation'], ARRAY['Drug', 'Device', 'Trial'], 'regulatory'),
    ('COVERS', 'Covers', 'Payer covers drug/device', ARRAY['Payer'], ARRAY['Drug', 'Device'], 'commercial'),
    ('AUTHORED_BY', 'Authored By', 'Publication authored by KOL', ARRAY['Publication'], ARRAY['KOL'], 'research'),
    ('TARGETS', 'Targets', 'Drug targets biomarker/pathway', ARRAY['Drug'], ARRAY['Biomarker', 'Pathway'], 'research'),
    ('ASSOCIATED_WITH', 'Associated With', 'Disease associated with biomarker', ARRAY['Disease'], ARRAY['Biomarker'], 'research')
ON CONFLICT (type_name) DO NOTHING;
```

---

## Additional Views

### 1. Agent Selection View

```sql
-- ==========================================
-- VIEW: v_agent_selection_ready
-- PURPOSE: Agents ready for selection with all metadata
-- ==========================================

CREATE OR REPLACE VIEW v_agent_selection_ready AS
SELECT 
    a.id,
    a.name,
    a.slug,
    a.description,
    
    -- Tier compatibility
    ARRAY_AGG(DISTINCT t.level) as compatible_tiers,
    
    -- RAG profile
    rp.slug as primary_rag_profile,
    
    -- KG view
    CASE WHEN akv.id IS NOT NULL THEN true ELSE false END as has_kg_view,
    akv.max_hops as kg_max_hops,
    
    -- Graph assignment
    ag.graph_type as primary_graph_type,
    
    -- Performance metrics
    a.usage_count,
    a.average_rating,
    
    -- Availability
    a.status,
    
    -- Domain coverage
    STRING_AGG(DISTINCT asp.specialization, ', ') as specializations
    
FROM agents a
LEFT JOIN agent_tenants at ON a.id = at.agent_id
LEFT JOIN agent_rag_policies arp ON a.id = arp.agent_id AND arp.is_default_policy = true
LEFT JOIN rag_profiles rp ON arp.rag_profile_id = rp.id
LEFT JOIN agent_kg_views akv ON a.id = akv.agent_id
LEFT JOIN agent_graph_assignments aga ON a.id = aga.agent_id AND aga.is_primary_graph = true
LEFT JOIN agent_graphs ag ON aga.graph_id = ag.id
LEFT JOIN agent_tiers t ON rp.slug = ANY(t.allowed_rag_profiles)
LEFT JOIN agent_specializations asp ON a.id = asp.agent_id
WHERE a.deleted_at IS NULL
  AND a.status = 'active'
GROUP BY a.id, a.name, a.slug, a.description, rp.slug, akv.id, akv.max_hops, 
         ag.graph_type, a.usage_count, a.average_rating, a.status;

COMMENT ON VIEW v_agent_selection_ready IS 'Agents ready for selection with tier compatibility and metadata';
```

### 2. Monitoring Dashboard View

```sql
-- ==========================================
-- VIEW: v_agent_performance_dashboard
-- PURPOSE: Real-time agent performance metrics
-- ==========================================

CREATE OR REPLACE VIEW v_agent_performance_dashboard AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    
    -- Recent activity (last 7 days)
    COUNT(ail.id) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '7 days') as queries_7d,
    COUNT(ail.id) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '24 hours') as queries_24h,
    
    -- Performance metrics
    AVG(ail.confidence_score) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '7 days') as avg_confidence_7d,
    AVG(ail.response_time_ms) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '7 days') as avg_response_time_7d,
    AVG(ail.cost_usd) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '7 days') as avg_cost_7d,
    
    -- Escalation metrics
    COUNT(ail.id) FILTER (WHERE ail.escalated = true AND ail.created_at >= NOW() - INTERVAL '7 days')::NUMERIC / 
        NULLIF(COUNT(ail.id) FILTER (WHERE ail.created_at >= NOW() - INTERVAL '7 days'), 0) as escalation_rate_7d,
    
    -- Human review metrics
    COUNT(ail.id) FILTER (WHERE ail.human_reviewed = true AND ail.created_at >= NOW() - INTERVAL '7 days') as human_reviews_7d,
    AVG(ail.human_feedback_score) FILTER (WHERE ail.human_reviewed = true AND ail.created_at >= NOW() - INTERVAL '7 days') as avg_human_feedback_7d,
    
    -- Tier distribution
    COUNT(ail.id) FILTER (WHERE ail.tier_level = 1 AND ail.created_at >= NOW() - INTERVAL '7 days') as tier1_queries_7d,
    COUNT(ail.id) FILTER (WHERE ail.tier_level = 2 AND ail.created_at >= NOW() - INTERVAL '7 days') as tier2_queries_7d,
    COUNT(ail.id) FILTER (WHERE ail.tier_level = 3 AND ail.created_at >= NOW() - INTERVAL '7 days') as tier3_queries_7d,
    
    -- Status
    a.status,
    a.updated_at as last_updated

FROM agents a
LEFT JOIN agent_interaction_logs ail ON a.id = ail.agent_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name, a.status, a.updated_at;

COMMENT ON VIEW v_agent_performance_dashboard IS 'Real-time agent performance metrics for monitoring dashboard';
```

---

## Execution Instructions

### Step 1: Create Additional Tables

```bash
# Execute the schema additions
psql -f agentos3_additional_schema.sql
```

### Step 2: Verify Table Creation

```sql
-- Verify all new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'agent_kg_views',
    'agent_interaction_logs',
    'agent_tiers',
    'panel_configurations',
    'panel_configuration_members',
    'safety_triggers',
    'kg_node_types',
    'kg_edge_types'
  )
ORDER BY table_name;
```

### Step 3: Verify Seeded Data

```sql
-- Verify tier configurations
SELECT level, name, accuracy_min, accuracy_max 
FROM agent_tiers 
ORDER BY level;

-- Verify safety triggers
SELECT trigger_name, escalation_action, is_clinical_safety 
FROM safety_triggers 
WHERE is_active = true
ORDER BY escalation_priority DESC;

-- Verify KG types
SELECT COUNT(*) as node_types FROM kg_node_types;
SELECT COUNT(*) as edge_types FROM kg_edge_types;
```

---

## Summary

**New Tables Added**: 8  
**New Views Added**: 2  
**Seeded Records**: 
- 3 tier definitions
- 7 safety triggers
- 12 KG node types
- 10 KG edge types

**Total AgentOS 3.0 Schema**:
- Tables: 34 (AgentOS 2.0) + 8 (additional) = **42 tables**
- Views: 6 (AgentOS 2.0) + 2 (additional) = **8 views**

**Status**: Ready for AgentOS 3.0 implementation! 🚀


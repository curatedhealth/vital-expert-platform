-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for constrained fields
CREATE TYPE agent_status AS ENUM ('development', 'testing', 'active', 'deprecated');
CREATE TYPE validation_status AS ENUM ('validated', 'pending', 'in_review', 'expired', 'not_required');
CREATE TYPE domain_expertise AS ENUM ('medical', 'regulatory', 'legal', 'financial', 'business', 'technical', 'commercial', 'access', 'general');
CREATE TYPE data_classification AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Drop existing agents table if it exists (for clean migration)
DROP TABLE IF EXISTS agents CASCADE;

-- Main agents table with domain-agnostic design
CREATE TABLE agents (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    avatar VARCHAR(100),
    color VARCHAR(7) CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    version VARCHAR(20) DEFAULT '1.0.0',

    -- AI Configuration
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4',
    system_prompt TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
    max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0 AND max_tokens <= 10000),
    rag_enabled BOOLEAN DEFAULT true,
    context_window INTEGER DEFAULT 8000,
    response_format VARCHAR(20) DEFAULT 'markdown' CHECK (response_format IN ('markdown', 'json', 'text', 'html')),

    -- Capabilities & Knowledge
    capabilities TEXT[] NOT NULL,
    knowledge_domains TEXT[],
    domain_expertise domain_expertise NOT NULL DEFAULT 'general',
    competency_levels JSONB DEFAULT '{}',
    knowledge_sources JSONB DEFAULT '{}',
    tool_configurations JSONB DEFAULT '{}',

    -- Business Context
    business_function VARCHAR(100),
    role VARCHAR(100),
    tier INTEGER CHECK (tier IN (1, 2, 3)),
    priority INTEGER CHECK (priority >= 0 AND priority <= 999),
    implementation_phase INTEGER CHECK (implementation_phase IN (1, 2, 3)),
    is_custom BOOLEAN DEFAULT true,
    cost_per_query DECIMAL(10,4) CHECK (cost_per_query >= 0),
    target_users TEXT[],

    -- Domain-Agnostic Validation & Performance
    validation_status validation_status DEFAULT 'pending',
    validation_metadata JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    accuracy_score DECIMAL(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
    evidence_required BOOLEAN DEFAULT false,

    -- Flexible Compliance & Regulatory
    regulatory_context JSONB DEFAULT '{"is_regulated": false}',
    compliance_tags TEXT[],
    hipaa_compliant BOOLEAN DEFAULT false,
    gdpr_compliant BOOLEAN DEFAULT false,
    audit_trail_enabled BOOLEAN DEFAULT true,
    data_classification data_classification DEFAULT 'internal',

    -- Optional Domain-Specific Fields
    medical_specialty VARCHAR(100),
    pharma_enabled BOOLEAN DEFAULT false,
    verify_enabled BOOLEAN DEFAULT false,

    -- Legal Domain Fields
    jurisdiction_coverage TEXT[], -- ['US', 'EU', 'UK', 'Global']
    legal_domains TEXT[], -- ['Healthcare Law', 'IP', 'Contracts', 'Privacy']
    bar_admissions TEXT[], -- ['California', 'New York']
    legal_specialties JSONB, -- {practice_areas: [], years_experience: {}}

    -- Commercial Domain Fields
    market_segments TEXT[], -- ['Providers', 'Payers', 'Pharma', 'Patients']
    customer_segments TEXT[], -- ['Health Systems', 'ACOs', 'Clinics']
    sales_methodology VARCHAR(100), -- 'B2B', 'B2B2C', 'Enterprise', 'SMB'
    geographic_focus TEXT[], -- ['US', 'EU', 'APAC', 'LATAM']

    -- Market Access Domain Fields
    payer_types TEXT[], -- ['Medicare', 'Medicaid', 'Commercial', 'VA']
    reimbursement_models TEXT[], -- ['Fee-for-Service', 'Value-Based', 'Capitation']
    coverage_determination_types TEXT[], -- ['LCD', 'NCD', 'Commercial Policy']
    hta_experience TEXT[], -- ['NICE', 'ICER', 'CADTH']

    -- Operational Status
    status agent_status DEFAULT 'development',
    availability_status VARCHAR(50) DEFAULT 'available',
    error_rate DECIMAL(5,4) DEFAULT 0,
    average_response_time INTEGER,
    total_interactions INTEGER DEFAULT 0,
    last_interaction TIMESTAMP,
    last_health_check TIMESTAMP,

    -- Relationships
    parent_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    compatible_agents UUID[],
    incompatible_agents UUID[],
    prerequisite_agents UUID[],
    workflow_positions TEXT[],

    -- Advanced Configuration
    escalation_rules JSONB DEFAULT '{}',
    confidence_thresholds JSONB DEFAULT '{"low": 0.7, "medium": 0.85, "high": 0.95}',
    input_validation_rules JSONB DEFAULT '{}',
    output_format_rules JSONB DEFAULT '{}',
    citation_requirements JSONB DEFAULT '{}',
    rate_limits JSONB DEFAULT '{"per_minute": 60, "per_hour": 1000}',

    -- Testing & Validation
    test_scenarios JSONB DEFAULT '[]',
    validation_history JSONB DEFAULT '[]',
    performance_benchmarks JSONB DEFAULT '{}',
    reviewer_id UUID,
    last_validation_date TIMESTAMP,
    validation_expiry_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    metadata JSONB DEFAULT '{}',

    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(display_name, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(role, '') || ' ' ||
            coalesce(business_function, '')
        )
    ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_tier_priority ON agents(tier, priority);
CREATE INDEX idx_agents_business_function ON agents(business_function);
CREATE INDEX idx_agents_domain_expertise ON agents(domain_expertise);
CREATE INDEX idx_agents_validation_status ON agents(validation_status);
CREATE INDEX idx_agents_search ON agents USING GIN(search_vector);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_agents_knowledge_domains ON agents USING GIN(knowledge_domains);
CREATE INDEX idx_agents_compliance_tags ON agents USING GIN(compliance_tags);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policies for different user roles
CREATE POLICY "Public agents are viewable by everyone"
    ON agents FOR SELECT
    USING (data_classification = 'public');

CREATE POLICY "Authenticated users can view internal agents"
    ON agents FOR SELECT
    TO authenticated
    USING (data_classification IN ('public', 'internal'));

CREATE POLICY "Authenticated users can create agents"
    ON agents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR is_custom = true);

CREATE POLICY "Users can delete their own custom agents"
    ON agents FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() AND is_custom = true);

-- Create audit log table
CREATE TABLE agent_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMP DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_agent_audit_log_agent_id ON agent_audit_log(agent_id);
CREATE INDEX idx_agent_audit_log_action ON agent_audit_log(action);
CREATE INDEX idx_agent_audit_log_changed_at ON agent_audit_log(changed_at DESC);

-- Enable RLS on audit log
ALTER TABLE agent_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for agents they can see"
    ON agent_audit_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM agents
            WHERE agents.id = agent_audit_log.agent_id
            AND (
                agents.data_classification IN ('public', 'internal')
                OR agents.created_by = auth.uid()
            )
        )
    );
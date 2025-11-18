-- ============================================================================
-- Expanded Compliance Framework Migration
--
-- Adds support for:
-- - EMA (European Medicines Agency)
-- - GDPR (General Data Protection Regulation)
-- - MHRA (Medicines and Healthcare products Regulatory Agency) - UK
-- - TGA (Therapeutic Goods Administration) - Australia
-- - Multi-jurisdiction compliance tracking
--
-- Created: 2025-10-25
-- Phase: 5 Week 1 - Expanded Compliance
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. REGULATORY BODIES TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS regulatory_bodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Body identification
    code TEXT NOT NULL UNIQUE,  -- FDA, EMA, MHRA, TGA, etc.
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,

    -- Jurisdiction
    country_code TEXT,  -- US, UK, AU, EU
    region TEXT,  -- North America, Europe, Asia-Pacific
    jurisdiction_type TEXT CHECK (jurisdiction_type IN ('national', 'regional', 'international')),

    -- Contact & URLs
    website_url TEXT,
    api_url TEXT,
    contact_email TEXT,

    -- Authority scope
    scope TEXT[],  -- ['medical_devices', 'pharmaceuticals', 'biologics']
    regulatory_framework TEXT,  -- Legal framework (e.g., "21 CFR Part 11")

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX idx_regulatory_bodies_code ON regulatory_bodies (code);
CREATE INDEX idx_regulatory_bodies_country ON regulatory_bodies (country_code);
CREATE INDEX idx_regulatory_bodies_active ON regulatory_bodies (is_active);

-- ----------------------------------------------------------------------------
-- 2. COMPLIANCE FRAMEWORKS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Framework identification
    code TEXT NOT NULL UNIQUE,  -- HIPAA, GDPR, ISO_13485, etc.
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    framework_type TEXT NOT NULL CHECK (framework_type IN ('privacy', 'security', 'quality', 'safety', 'medical', 'data_protection')),

    -- Regulatory body
    regulatory_body_id UUID REFERENCES regulatory_bodies(id),

    -- Geographic applicability
    applicable_regions TEXT[],  -- ['US', 'EU', 'UK', 'AU']
    mandatory_for TEXT[],  -- Which types of organizations must comply

    -- Framework details
    version TEXT,
    effective_date DATE,
    last_updated DATE,

    -- Requirements
    key_requirements JSONB,  -- Structured requirements
    certification_required BOOLEAN DEFAULT FALSE,
    audit_frequency_months INTEGER,

    -- Documentation
    documentation_url TEXT,
    guidance_urls TEXT[],

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX idx_compliance_frameworks_code ON compliance_frameworks (code);
CREATE INDEX idx_compliance_frameworks_type ON compliance_frameworks (framework_type);
CREATE INDEX idx_compliance_frameworks_body ON compliance_frameworks (regulatory_body_id);
CREATE INDEX idx_compliance_frameworks_active ON compliance_frameworks (is_active);

-- ----------------------------------------------------------------------------
-- 3. COMPLIANCE REQUIREMENTS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Framework reference
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,

    -- Requirement details
    requirement_code TEXT NOT NULL,  -- e.g., "HIPAA-164.308(a)(1)(i)"
    requirement_name TEXT NOT NULL,
    requirement_description TEXT NOT NULL,

    -- Categorization
    category TEXT NOT NULL,  -- technical, administrative, physical
    subcategory TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),

    -- Implementation
    implementation_guidance TEXT,
    controls JSONB,  -- Specific controls to implement
    validation_criteria TEXT[],

    -- Applicability
    applies_to TEXT[],  -- ['agents', 'chat', 'storage', 'api']
    conditional_logic JSONB,  -- When this requirement applies

    -- Audit
    evidence_required TEXT[],
    testing_frequency_days INTEGER,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (framework_id, requirement_code)
);

-- Create indexes
CREATE INDEX idx_compliance_requirements_framework ON compliance_requirements (framework_id);
CREATE INDEX idx_compliance_requirements_severity ON compliance_requirements (severity);
CREATE INDEX idx_compliance_requirements_category ON compliance_requirements (category);

-- ----------------------------------------------------------------------------
-- 4. AGENT COMPLIANCE MAPPINGS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS agent_compliance_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Agent reference
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Compliance framework reference
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,

    -- Compliance status
    compliance_status TEXT NOT NULL CHECK (compliance_status IN ('compliant', 'partial', 'non_compliant', 'not_applicable', 'pending_review')),
    compliance_score NUMERIC(3, 2) CHECK (compliance_score BETWEEN 0 AND 1),

    -- Certification
    is_certified BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    certification_expiry DATE,
    certification_body TEXT,
    certification_number TEXT,

    -- Assessment
    last_assessed_at TIMESTAMPTZ,
    next_assessment_due TIMESTAMPTZ,
    assessed_by TEXT,

    -- Requirements tracking
    total_requirements INTEGER DEFAULT 0,
    met_requirements INTEGER DEFAULT 0,
    partial_requirements INTEGER DEFAULT 0,
    unmet_requirements INTEGER DEFAULT 0,

    -- Gaps and remediation
    identified_gaps JSONB DEFAULT '[]'::jsonb,
    remediation_plan JSONB DEFAULT '[]'::jsonb,
    remediation_deadline DATE,

    -- Evidence
    evidence_documents TEXT[],
    audit_trail_id UUID,

    -- Metadata
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (agent_id, framework_id)
);

-- Create indexes
CREATE INDEX idx_agent_compliance_agent ON agent_compliance_mappings (agent_id);
CREATE INDEX idx_agent_compliance_framework ON agent_compliance_mappings (framework_id);
CREATE INDEX idx_agent_compliance_status ON agent_compliance_mappings (compliance_status);
CREATE INDEX idx_agent_compliance_certified ON agent_compliance_mappings (is_certified, certification_expiry);
CREATE INDEX idx_agent_compliance_assessment ON agent_compliance_mappings (next_assessment_due) WHERE compliance_status != 'not_applicable';

-- ----------------------------------------------------------------------------
-- 5. COMPLIANCE AUDIT LOG TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Context
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    user_id TEXT,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,

    -- Compliance framework
    framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
    regulatory_body_id UUID REFERENCES regulatory_bodies(id) ON DELETE SET NULL,

    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'access', 'modification', 'deletion', 'export', 'consent',
        'data_processing', 'breach_detection', 'compliance_check',
        'audit_event', 'escalation', 'review', 'approval'
    )),
    event_category TEXT NOT NULL,  -- privacy, security, quality, safety

    -- Compliance tags (multi-jurisdiction)
    compliance_tags JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ['FDA', 'HIPAA', 'GDPR', 'EMA']

    -- What happened
    action TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Who/What/Where
    actor_id TEXT NOT NULL,  -- User or system ID
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'agent', 'reviewer')),
    resource_type TEXT,  -- What was accessed/modified
    resource_id TEXT,

    -- Before/After
    before_state JSONB,
    after_state JSONB,
    changes JSONB,

    -- Risk and impact
    risk_level TEXT CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'minimal')),
    impact_assessment TEXT,

    -- Compliance validation
    compliant BOOLEAN NOT NULL DEFAULT TRUE,
    violations JSONB DEFAULT '[]'::jsonb,
    remediation_required BOOLEAN DEFAULT FALSE,

    -- IP and location
    ip_address INET,
    location JSONB,  -- Geographic location if relevant
    user_agent TEXT,

    -- Retention
    retention_required BOOLEAN NOT NULL DEFAULT TRUE,
    retention_until TIMESTAMPTZ,  -- Based on regulatory requirements
    deletion_allowed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Timestamps
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for audit log
CREATE INDEX idx_compliance_audit_agent ON compliance_audit_log (agent_id, occurred_at DESC);
CREATE INDEX idx_compliance_audit_user ON compliance_audit_log (user_id, occurred_at DESC);
CREATE INDEX idx_compliance_audit_session ON compliance_audit_log (session_id, occurred_at DESC);
CREATE INDEX idx_compliance_audit_framework ON compliance_audit_log (framework_id, occurred_at DESC);
CREATE INDEX idx_compliance_audit_event_type ON compliance_audit_log (event_type, occurred_at DESC);
CREATE INDEX idx_compliance_audit_tags ON compliance_audit_log USING GIN (compliance_tags);
CREATE INDEX idx_compliance_audit_violations ON compliance_audit_log (compliant, risk_level) WHERE compliant = FALSE;
CREATE INDEX idx_compliance_audit_retention ON compliance_audit_log (retention_until) WHERE retention_required = TRUE;

-- Partitioning by month for performance (optional but recommended)
-- CREATE INDEX idx_compliance_audit_occurred_at ON compliance_audit_log (occurred_at DESC);

-- ----------------------------------------------------------------------------
-- 6. SEED DATA: REGULATORY BODIES
-- ----------------------------------------------------------------------------

INSERT INTO regulatory_bodies (code, name, full_name, country_code, region, jurisdiction_type, website_url, scope, regulatory_framework, metadata) VALUES
('FDA', 'FDA', 'Food and Drug Administration', 'US', 'North America', 'national', 'https://www.fda.gov', ARRAY['medical_devices', 'pharmaceuticals', 'biologics', 'digital_health'], '21 CFR Part 11', '{"established": 1906, "primary_legislation": "Federal Food, Drug, and Cosmetic Act"}'),
('EMA', 'EMA', 'European Medicines Agency', 'EU', 'Europe', 'regional', 'https://www.ema.europa.eu', ARRAY['pharmaceuticals', 'biologics', 'advanced_therapies'], 'Regulation (EC) No 726/2004', '{"established": 1995, "member_states": 27}'),
('MHRA', 'MHRA', 'Medicines and Healthcare products Regulatory Agency', 'GB', 'Europe', 'national', 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency', ARRAY['medical_devices', 'pharmaceuticals', 'biologics'], 'Human Medicines Regulations 2012', '{"established": 2003, "post_brexit": true}'),
('TGA', 'TGA', 'Therapeutic Goods Administration', 'AU', 'Asia-Pacific', 'national', 'https://www.tga.gov.au', ARRAY['medical_devices', 'pharmaceuticals', 'biologics'], 'Therapeutic Goods Act 1989', '{"established": 1989}'),
('HIPAA', 'HIPAA', 'Health Insurance Portability and Accountability Act', 'US', 'North America', 'national', 'https://www.hhs.gov/hipaa', ARRAY['privacy', 'security', 'data_protection'], '45 CFR Parts 160, 162, and 164', '{"enacted": 1996, "enforced_by": "HHS OCR"}'),
('GDPR', 'GDPR', 'General Data Protection Regulation', 'EU', 'Europe', 'regional', 'https://gdpr.eu', ARRAY['privacy', 'data_protection'], 'Regulation (EU) 2016/679', '{"effective_date": "2018-05-25", "member_states": 27, "extraterritorial": true}')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. SEED DATA: COMPLIANCE FRAMEWORKS
-- ----------------------------------------------------------------------------

INSERT INTO compliance_frameworks (code, name, full_name, framework_type, regulatory_body_id, applicable_regions, mandatory_for, version, effective_date, key_requirements, certification_required, audit_frequency_months, documentation_url) VALUES
(
    'HIPAA',
    'HIPAA',
    'Health Insurance Portability and Accountability Act',
    'privacy',
    (SELECT id FROM regulatory_bodies WHERE code = 'HIPAA'),
    ARRAY['US'],
    ARRAY['covered_entities', 'business_associates'],
    '2013',
    '2013-09-23',
    '{
        "privacy_rule": "45 CFR Part 164 Subpart E",
        "security_rule": "45 CFR Part 164 Subpart C",
        "breach_notification": "45 CFR Part 164 Subpart D",
        "enforcement": "45 CFR Part 160 Subpart C"
    }',
    FALSE,
    12,
    'https://www.hhs.gov/hipaa/for-professionals/index.html'
),
(
    'GDPR',
    'GDPR',
    'General Data Protection Regulation',
    'data_protection',
    (SELECT id FROM regulatory_bodies WHERE code = 'GDPR'),
    ARRAY['EU', 'UK', 'GLOBAL'],
    ARRAY['controllers', 'processors'],
    '2016/679',
    '2018-05-25',
    '{
        "lawfulness": "Article 6",
        "consent": "Article 7",
        "data_subject_rights": "Articles 15-22",
        "dpo_requirement": "Articles 37-39",
        "breach_notification": "Articles 33-34",
        "dpia": "Article 35"
    }',
    FALSE,
    12,
    'https://gdpr.eu'
),
(
    'FDA_MEDICAL_DEVICE',
    'FDA Medical Device',
    'FDA Medical Device Regulations',
    'medical',
    (SELECT id FROM regulatory_bodies WHERE code = 'FDA'),
    ARRAY['US'],
    ARRAY['device_manufacturers', 'digital_health_developers'],
    '21 CFR 820',
    '1997-06-01',
    '{
        "quality_system": "21 CFR Part 820",
        "premarket_notification": "21 CFR Part 807 Subpart E",
        "establishment_registration": "21 CFR Part 807 Subpart A",
        "adverse_event_reporting": "21 CFR Part 803"
    }',
    FALSE,
    12,
    'https://www.fda.gov/medical-devices'
),
(
    'EMA_CLINICAL_TRIAL',
    'EMA Clinical Trial',
    'EMA Clinical Trial Regulation',
    'medical',
    (SELECT id FROM regulatory_bodies WHERE code = 'EMA'),
    ARRAY['EU'],
    ARRAY['sponsors', 'clinical_investigators'],
    'Regulation (EU) No 536/2014',
    '2022-01-31',
    '{
        "authorization": "Chapter II",
        "transparency": "Chapter IV",
        "pharmacovigilance": "Chapter VIII",
        "inspection": "Chapter IX"
    }',
    FALSE,
    12,
    'https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials'
),
(
    'ISO_13485',
    'ISO 13485',
    'Medical devices — Quality management systems',
    'quality',
    NULL,
    ARRAY['GLOBAL'],
    ARRAY['medical_device_manufacturers'],
    '2016',
    '2016-03-01',
    '{
        "quality_management": "Clause 4",
        "management_responsibility": "Clause 5",
        "resource_management": "Clause 6",
        "product_realization": "Clause 7",
        "measurement_analysis_improvement": "Clause 8"
    }',
    TRUE,
    12,
    'https://www.iso.org/standard/59752.html'
),
(
    'ISO_27001',
    'ISO 27001',
    'Information security management systems',
    'security',
    NULL,
    ARRAY['GLOBAL'],
    ARRAY['all_organizations'],
    '2022',
    '2022-10-25',
    '{
        "context": "Clause 4",
        "leadership": "Clause 5",
        "planning": "Clause 6",
        "support": "Clause 7",
        "operation": "Clause 8",
        "performance_evaluation": "Clause 9",
        "improvement": "Clause 10"
    }',
    TRUE,
    12,
    'https://www.iso.org/standard/27001'
)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 8. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to get compliance status for an agent
CREATE OR REPLACE FUNCTION get_agent_compliance_status(p_agent_id UUID)
RETURNS TABLE (
    framework_code TEXT,
    framework_name TEXT,
    compliance_status TEXT,
    compliance_score NUMERIC,
    is_certified BOOLEAN,
    certification_expiry DATE,
    next_assessment_due TIMESTAMPTZ,
    gaps_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cf.code AS framework_code,
        cf.name AS framework_name,
        acm.compliance_status,
        acm.compliance_score,
        acm.is_certified,
        acm.certification_expiry,
        acm.next_assessment_due,
        acm.unmet_requirements AS gaps_count
    FROM agent_compliance_mappings acm
    JOIN compliance_frameworks cf ON cf.id = acm.framework_id
    WHERE acm.agent_id = p_agent_id
    ORDER BY cf.code;
END;
$$ LANGUAGE plpgsql;

-- Function to log compliance event
CREATE OR REPLACE FUNCTION log_compliance_event(
    p_agent_id UUID,
    p_user_id TEXT,
    p_session_id UUID,
    p_event_type TEXT,
    p_event_category TEXT,
    p_compliance_tags JSONB,
    p_action TEXT,
    p_description TEXT,
    p_actor_id TEXT,
    p_actor_type TEXT,
    p_risk_level TEXT DEFAULT 'low',
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO compliance_audit_log (
        agent_id,
        user_id,
        session_id,
        event_type,
        event_category,
        compliance_tags,
        action,
        description,
        actor_id,
        actor_type,
        risk_level,
        metadata
    ) VALUES (
        p_agent_id,
        p_user_id,
        p_session_id,
        p_event_type,
        p_event_category,
        p_compliance_tags,
        p_action,
        p_description,
        p_actor_id,
        p_actor_type,
        p_risk_level,
        p_metadata
    ) RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if agent is compliant with framework
CREATE OR REPLACE FUNCTION is_agent_compliant(
    p_agent_id UUID,
    p_framework_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_compliant BOOLEAN;
BEGIN
    SELECT
        CASE
            WHEN compliance_status = 'compliant' THEN TRUE
            ELSE FALSE
        END INTO v_compliant
    FROM agent_compliance_mappings acm
    JOIN compliance_frameworks cf ON cf.id = acm.framework_id
    WHERE acm.agent_id = p_agent_id
    AND cf.code = p_framework_code;

    RETURN COALESCE(v_compliant, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to get agents by compliance framework
CREATE OR REPLACE FUNCTION get_compliant_agents(p_framework_code TEXT)
RETURNS TABLE (
    agent_id UUID,
    agent_name TEXT,
    compliance_score NUMERIC,
    is_certified BOOLEAN,
    certification_expiry DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id AS agent_id,
        a.name AS agent_name,
        acm.compliance_score,
        acm.is_certified,
        acm.certification_expiry
    FROM agents a
    JOIN agent_compliance_mappings acm ON acm.agent_id = a.id
    JOIN compliance_frameworks cf ON cf.id = acm.framework_id
    WHERE cf.code = p_framework_code
    AND acm.compliance_status = 'compliant'
    ORDER BY acm.compliance_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 9. VIEWS
-- ----------------------------------------------------------------------------

-- View: Agent compliance summary
CREATE OR REPLACE VIEW v_agent_compliance_summary AS
SELECT
    a.id AS agent_id,
    a.name AS agent_name,
    a.tier,
    COUNT(acm.id) AS total_frameworks,
    COUNT(*) FILTER (WHERE acm.compliance_status = 'compliant') AS compliant_count,
    COUNT(*) FILTER (WHERE acm.is_certified = TRUE) AS certified_count,
    ROUND(AVG(acm.compliance_score), 2) AS avg_compliance_score,
    COUNT(*) FILTER (WHERE acm.next_assessment_due < NOW()) AS overdue_assessments,
    MIN(acm.next_assessment_due) AS next_assessment_due,
    JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'framework', cf.code,
            'status', acm.compliance_status,
            'score', acm.compliance_score,
            'certified', acm.is_certified
        ) ORDER BY cf.code
    ) AS compliance_details
FROM agents a
LEFT JOIN agent_compliance_mappings acm ON acm.agent_id = a.id
LEFT JOIN compliance_frameworks cf ON cf.id = acm.framework_id
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.tier;

-- View: Compliance audit summary
CREATE OR REPLACE VIEW v_compliance_audit_summary AS
SELECT
    DATE_TRUNC('day', occurred_at) AS audit_date,
    event_type,
    event_category,
    COUNT(*) AS event_count,
    COUNT(*) FILTER (WHERE compliant = FALSE) AS violation_count,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT agent_id) AS unique_agents,
    JSONB_AGG(DISTINCT compliance_tags) AS compliance_tags_used
FROM compliance_audit_log
GROUP BY DATE_TRUNC('day', occurred_at), event_type, event_category
ORDER BY audit_date DESC, event_count DESC;

-- ----------------------------------------------------------------------------
-- 10. TRIGGERS
-- ----------------------------------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_regulatory_bodies_updated_at
    BEFORE UPDATE ON regulatory_bodies
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER tr_compliance_frameworks_updated_at
    BEFORE UPDATE ON compliance_frameworks
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER tr_agent_compliance_updated_at
    BEFORE UPDATE ON agent_compliance_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_compliance_updated_at();

-- Auto-calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_requirements > 0 THEN
        NEW.compliance_score = ROUND(
            (NEW.met_requirements::NUMERIC + (NEW.partial_requirements::NUMERIC * 0.5)) / NEW.total_requirements::NUMERIC,
            2
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_agent_compliance_score
    BEFORE INSERT OR UPDATE ON agent_compliance_mappings
    FOR EACH ROW
    EXECUTE FUNCTION calculate_compliance_score();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE regulatory_bodies IS 'Regulatory bodies and authorities (FDA, EMA, MHRA, TGA, etc.)';
COMMENT ON TABLE compliance_frameworks IS 'Compliance frameworks (HIPAA, GDPR, ISO standards, etc.)';
COMMENT ON TABLE compliance_requirements IS 'Specific compliance requirements for each framework';
COMMENT ON TABLE agent_compliance_mappings IS 'Agent compliance status across frameworks';
COMMENT ON TABLE compliance_audit_log IS 'Complete audit trail for compliance tracking';

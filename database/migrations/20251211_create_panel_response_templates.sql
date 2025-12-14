-- ============================================================================
-- Migration: Create Panel Response Templates Table
-- Date: 2025-12-11
-- Description: Stores expert response templates for Ask Panel workflows
--              Removes hardcoded mock responses from code
-- ============================================================================

-- Create panel_response_templates table
CREATE TABLE IF NOT EXISTS panel_response_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template identification
    template_key VARCHAR(100) NOT NULL UNIQUE,  -- e.g., 'regulatory_expert', 'clinical_expert'
    template_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Expert type categorization
    expert_category VARCHAR(100) NOT NULL,  -- regulatory, clinical, quality, etc.

    -- Response template content
    response_template TEXT NOT NULL,  -- Template with {query} placeholder

    -- Confidence and scoring
    default_confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.75,
    confidence_min DECIMAL(3, 2) NOT NULL DEFAULT 0.60,
    confidence_max DECIMAL(3, 2) NOT NULL DEFAULT 0.95,

    -- Display settings
    display_name VARCHAR(255),  -- Human-readable name for UI
    icon VARCHAR(100),          -- Icon identifier
    color VARCHAR(20),          -- Color code for UI

    -- Panel type associations
    panel_types TEXT[] DEFAULT ARRAY['parallel', 'consensus', 'debate', 'sequential'],

    -- Mock/Test mode settings
    is_mock BOOLEAN DEFAULT FALSE,
    mock_delay_ms INTEGER DEFAULT 500,

    -- Status and ordering
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- Multi-tenancy
    tenant_id UUID REFERENCES tenants(id),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_panel_response_templates_key ON panel_response_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_panel_response_templates_category ON panel_response_templates(expert_category);
CREATE INDEX IF NOT EXISTS idx_panel_response_templates_tenant ON panel_response_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_panel_response_templates_active ON panel_response_templates(is_active);

-- Enable RLS
ALTER TABLE panel_response_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "panel_response_templates_select_policy" ON panel_response_templates
    FOR SELECT USING (
        tenant_id IS NULL  -- Platform templates visible to all
        OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    );

CREATE POLICY "panel_response_templates_insert_policy" ON panel_response_templates
    FOR INSERT WITH CHECK (
        tenant_id IS NULL
        OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    );

CREATE POLICY "panel_response_templates_update_policy" ON panel_response_templates
    FOR UPDATE USING (
        tenant_id IS NULL
        OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_panel_response_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_panel_response_templates_updated_at
    BEFORE UPDATE ON panel_response_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_panel_response_templates_updated_at();

-- ============================================================================
-- SEED DEFAULT TEMPLATES (Platform-wide, tenant_id = NULL)
-- ============================================================================

-- Regulatory Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'regulatory_expert',
    'Regulatory Expert Response Template',
    'FDA and regulatory compliance analysis for medical devices and pharmaceuticals',
    'regulatory',
    'From a regulatory perspective regarding ''{query}'': FDA requires 510(k) clearance for Class II medical devices. Clinical trials are necessary to demonstrate safety and efficacy. The approval process typically takes 12-18 months, depending on device complexity and data quality. Key considerations include predicate device selection, performance testing requirements, and biocompatibility assessments per ISO 10993.',
    0.85,
    0.75,
    0.95,
    'Regulatory Expert',
    TRUE,
    500,
    TRUE,
    1,
    '{"expertise_areas": ["FDA", "510(k)", "PMA", "CE Mark", "ISO 13485"], "certifications": ["RAC", "CQA"]}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- Clinical Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'clinical_expert',
    'Clinical Expert Response Template',
    'Clinical trial design and medical evidence analysis',
    'clinical',
    'Clinical analysis of ''{query}'': Medical devices need robust clinical evidence from well-designed trials. Patient safety is paramount. Clinical trials should include appropriate endpoints and follow FDA guidance. Consider adaptive trial designs for efficiency, stratification by patient population, and validated outcome measures. Evidence generation strategy should align with target product profile.',
    0.80,
    0.70,
    0.92,
    'Clinical Expert',
    TRUE,
    500,
    TRUE,
    2,
    '{"expertise_areas": ["Clinical Trials", "GCP", "Biostatistics", "Endpoints"], "certifications": ["ACRP", "SoCRA"]}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- Quality Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'quality_expert',
    'Quality Expert Response Template',
    'Quality management and compliance analysis',
    'quality',
    'Quality perspective on ''{query}'': Quality Management System per ISO 13485 is essential. Design controls, risk management (ISO 14971), and verification/validation activities are critical for regulatory compliance. CAPA processes must be robust, with root cause analysis driving corrective actions. Document control and training programs ensure consistent quality outcomes.',
    0.75,
    0.65,
    0.88,
    'Quality Expert',
    TRUE,
    500,
    TRUE,
    3,
    '{"expertise_areas": ["ISO 13485", "ISO 14971", "CAPA", "Design Controls"], "certifications": ["CQE", "CQA", "Lead Auditor"]}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- Market Access Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'market_access_expert',
    'Market Access Expert Response Template',
    'Reimbursement, pricing, and payer strategy analysis',
    'market_access',
    'Market access analysis for ''{query}'': Reimbursement strategy should consider existing coding pathways (CPT, HCPCS) and coverage determination timelines. Health economics evidence (cost-effectiveness, budget impact) is essential for payer negotiations. Consider early payer engagement and parallel regulatory/reimbursement pathways for optimal market entry.',
    0.78,
    0.68,
    0.90,
    'Market Access Expert',
    TRUE,
    500,
    TRUE,
    4,
    '{"expertise_areas": ["HEOR", "Pricing", "Reimbursement", "Payer Relations"], "certifications": ["ISPOR"]}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- Manufacturing Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'manufacturing_expert',
    'Manufacturing Expert Response Template',
    'Manufacturing process and supply chain analysis',
    'manufacturing',
    'Manufacturing perspective on ''{query}'': Process validation (IQ/OQ/PQ) is critical for consistent product quality. Supply chain qualification should include supplier audits and material specifications. Consider design for manufacturability early in development. Sterilization validation, packaging validation, and shelf-life studies are essential for product lifecycle management.',
    0.77,
    0.67,
    0.89,
    'Manufacturing Expert',
    TRUE,
    500,
    TRUE,
    5,
    '{"expertise_areas": ["Process Validation", "Supply Chain", "Sterilization", "Packaging"], "certifications": ["Six Sigma", "Lean"]}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- Default/Generic Expert Template
INSERT INTO panel_response_templates (
    template_key,
    template_name,
    description,
    expert_category,
    response_template,
    default_confidence,
    confidence_min,
    confidence_max,
    display_name,
    is_mock,
    mock_delay_ms,
    is_active,
    sort_order,
    metadata
) VALUES (
    'generic_expert',
    'Generic Expert Response Template',
    'Default template for unspecified expert types',
    'general',
    'Expert analysis of ''{query}'': This requires careful consideration of regulatory requirements, clinical evidence, and quality systems. The approval pathway depends on device classification and risk profile. Cross-functional alignment between regulatory, clinical, quality, and commercial teams is essential for successful product development.',
    0.70,
    0.60,
    0.85,
    'Expert Analyst',
    TRUE,
    500,
    TRUE,
    99,
    '{"expertise_areas": ["General Analysis", "Cross-functional"], "certifications": []}'::jsonb
) ON CONFLICT (template_key) DO UPDATE SET
    response_template = EXCLUDED.response_template,
    default_confidence = EXCLUDED.default_confidence,
    updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERY (commented out)
-- ============================================================================
-- SELECT template_key, expert_category, default_confidence, is_active
-- FROM panel_response_templates
-- ORDER BY sort_order;

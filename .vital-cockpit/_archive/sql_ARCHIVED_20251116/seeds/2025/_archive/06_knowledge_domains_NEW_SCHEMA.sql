-- =====================================================================================
-- 06_knowledge_domains_NEW_SCHEMA.sql
-- Knowledge Domains - Transformed for Gold Standard Schema
-- =====================================================================================
-- Purpose: Seed hierarchical knowledge domain structure
-- Target Table: knowledge_domains (gold standard schema)
-- =====================================================================================

-- Knowledge domains are platform-level (use platform tenant or NULL)
DO $$
DECLARE
    v_tenant_id UUID;
    v_pharma_id UUID;
    v_reg_id UUID;
    v_clinical_id UUID;
    v_market_access_id UUID;
    v_medical_affairs_id UUID;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := NULL;
        RAISE NOTICE 'Platform tenant not found, using NULL tenant_id (platform-wide domains)';
    ELSE
        RAISE NOTICE 'Using platform tenant for knowledge domains (ID: %)', v_tenant_id;
    END IF;

-- =====================================================================================
-- ROOT LEVEL DOMAINS (Industry/Vertical)
-- =====================================================================================

INSERT INTO knowledge_domains (
    id, tenant_id, name, slug, description, parent_id,
    domain_path, depth_level, domain_type, icon, color, is_active
) VALUES
    -- Pharmaceuticals
    (
        gen_random_uuid(),
        v_tenant_id,
        'Pharmaceuticals',
        'pharmaceuticals',
        'Pharmaceutical drug development, manufacturing, and commercialization',
        NULL,
        'pharmaceuticals',
        0,
        'industry',
        'pill',
        '#3B82F6',
        true
    ),

    -- Digital Health
    (
        gen_random_uuid(),
        v_tenant_id,
        'Digital Health',
        'digital-health',
        'Digital health technologies, digital therapeutics, and health tech',
        NULL,
        'digital_health',
        0,
        'industry',
        'heart-pulse',
        '#10B981',
        true
    ),

    -- Biotechnology
    (
        gen_random_uuid(),
        v_tenant_id,
        'Biotechnology',
        'biotechnology',
        'Biological research, gene therapy, and biotech innovations',
        NULL,
        'biotechnology',
        0,
        'industry',
        'dna',
        '#8B5CF6',
        true
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    domain_type = EXCLUDED.domain_type,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    updated_at = NOW();

-- Get pharma ID for child domains
SELECT id INTO v_pharma_id FROM knowledge_domains WHERE slug = 'pharmaceuticals' AND (tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL)) LIMIT 1;

-- =====================================================================================
-- LEVEL 1 DOMAINS (Functional Areas)
-- =====================================================================================

INSERT INTO knowledge_domains (
    id, tenant_id, name, slug, description, parent_id,
    domain_path, depth_level, domain_type, icon, color, is_active
) VALUES
    -- Regulatory Affairs
    (
        gen_random_uuid(),
        v_tenant_id,
        'Regulatory Affairs',
        'regulatory-affairs',
        'Regulatory strategy, submissions, approvals, and compliance',
        v_pharma_id,
        'pharmaceuticals.regulatory_affairs',
        1,
        'function',
        'shield-check',
        '#EF4444',
        true
    ),

    -- Clinical Development
    (
        gen_random_uuid(),
        v_tenant_id,
        'Clinical Development',
        'clinical-development',
        'Clinical trials, study design, and clinical operations',
        v_pharma_id,
        'pharmaceuticals.clinical_development',
        1,
        'function',
        'microscope',
        '#F59E0B',
        true
    ),

    -- Market Access
    (
        gen_random_uuid(),
        v_tenant_id,
        'Market Access',
        'market-access',
        'Payer engagement, HEOR, pricing, and reimbursement',
        v_pharma_id,
        'pharmaceuticals.market_access',
        1,
        'function',
        'building-columns',
        '#06B6D4',
        true
    ),

    -- Medical Affairs
    (
        gen_random_uuid(),
        v_tenant_id,
        'Medical Affairs',
        'medical-affairs',
        'Medical strategy, KOL engagement, and scientific communication',
        v_pharma_id,
        'pharmaceuticals.medical_affairs',
        1,
        'function',
        'user-doctor',
        '#8B5CF6',
        true
    ),

    -- Manufacturing
    (
        gen_random_uuid(),
        v_tenant_id,
        'Manufacturing',
        'manufacturing',
        'Drug substance and drug product manufacturing',
        v_pharma_id,
        'pharmaceuticals.manufacturing',
        1,
        'function',
        'industry',
        '#78716C',
        true
    ),

    -- Quality Assurance
    (
        gen_random_uuid(),
        v_tenant_id,
        'Quality Assurance',
        'quality-assurance',
        'GMP compliance, quality control, and validation',
        v_pharma_id,
        'pharmaceuticals.quality_assurance',
        1,
        'function',
        'check-circle',
        '#059669',
        true
    ),

    -- Commercial Operations
    (
        gen_random_uuid(),
        v_tenant_id,
        'Commercial Operations',
        'commercial-operations',
        'Sales, marketing, and brand management',
        v_pharma_id,
        'pharmaceuticals.commercial',
        1,
        'function',
        'chart-line',
        '#EC4899',
        true
    ),

    -- Research & Development
    (
        gen_random_uuid(),
        v_tenant_id,
        'Research & Development',
        'research-development',
        'Drug discovery, preclinical research, and early development',
        v_pharma_id,
        'pharmaceuticals.research_development',
        1,
        'function',
        'flask',
        '#6366F1',
        true
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    domain_path = EXCLUDED.domain_path,
    depth_level = EXCLUDED.depth_level,
    domain_type = EXCLUDED.domain_type,
    updated_at = NOW();

-- Get IDs for level 2 domains
SELECT id INTO v_reg_id FROM knowledge_domains WHERE slug = 'regulatory-affairs' AND (tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL));
SELECT id INTO v_clinical_id FROM knowledge_domains WHERE slug = 'clinical-development' AND (tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL));
SELECT id INTO v_market_access_id FROM knowledge_domains WHERE slug = 'market-access' AND (tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL));
SELECT id INTO v_medical_affairs_id FROM knowledge_domains WHERE slug = 'medical-affairs' AND (tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL));

-- =====================================================================================
-- LEVEL 2 DOMAINS (Specialties/Topics)
-- =====================================================================================

INSERT INTO knowledge_domains (
    id, tenant_id, name, slug, description, parent_id,
    domain_path, depth_level, domain_type, icon, color, is_active
) VALUES
    -- Regulatory Submissions
    (
        gen_random_uuid(),
        v_tenant_id,
        'Regulatory Submissions',
        'regulatory-submissions',
        'IND, NDA, BLA, MAA preparation and submission',
        v_reg_id,
        'pharmaceuticals.regulatory_affairs.submissions',
        2,
        'specialty',
        'file-text',
        '#EF4444',
        true
    ),

    -- Regulatory Strategy
    (
        gen_random_uuid(),
        v_tenant_id,
        'Regulatory Strategy',
        'regulatory-strategy',
        'Global regulatory planning and lifecycle management',
        v_reg_id,
        'pharmaceuticals.regulatory_affairs.strategy',
        2,
        'specialty',
        'map',
        '#EF4444',
        true
    ),

    -- Clinical Trial Design
    (
        gen_random_uuid(),
        v_tenant_id,
        'Clinical Trial Design',
        'clinical-trial-design',
        'Protocol design, endpoints, and statistical plans',
        v_clinical_id,
        'pharmaceuticals.clinical_development.trial_design',
        2,
        'specialty',
        'clipboard-list',
        '#F59E0B',
        true
    ),

    -- Clinical Operations
    (
        gen_random_uuid(),
        v_tenant_id,
        'Clinical Operations',
        'clinical-operations',
        'Site management, monitoring, and trial execution',
        v_clinical_id,
        'pharmaceuticals.clinical_development.operations',
        2,
        'specialty',
        'users',
        '#F59E0B',
        true
    ),

    -- Health Economics (HEOR)
    (
        gen_random_uuid(),
        v_tenant_id,
        'Health Economics (HEOR)',
        'health-economics',
        'Cost-effectiveness analysis, budget impact, and economic modeling',
        v_market_access_id,
        'pharmaceuticals.market_access.heor',
        2,
        'specialty',
        'calculator',
        '#06B6D4',
        true
    ),

    -- Payer Engagement
    (
        gen_random_uuid(),
        v_tenant_id,
        'Payer Engagement',
        'payer-engagement',
        'Value communication, P&T presentations, and contracting',
        v_market_access_id,
        'pharmaceuticals.market_access.payer_engagement',
        2,
        'specialty',
        'handshake',
        '#06B6D4',
        true
    ),

    -- KOL Engagement
    (
        gen_random_uuid(),
        v_tenant_id,
        'KOL Engagement',
        'kol-engagement',
        'Key opinion leader identification and relationship management',
        v_medical_affairs_id,
        'pharmaceuticals.medical_affairs.kol_engagement',
        2,
        'specialty',
        'user-tie',
        '#8B5CF6',
        true
    ),

    -- Medical Communications
    (
        gen_random_uuid(),
        v_tenant_id,
        'Medical Communications',
        'medical-communications',
        'Publications, congress support, and scientific communication',
        v_medical_affairs_id,
        'pharmaceuticals.medical_affairs.communications',
        2,
        'specialty',
        'comment-medical',
        '#8B5CF6',
        true
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    domain_path = EXCLUDED.domain_path,
    depth_level = EXCLUDED.depth_level,
    updated_at = NOW();

    RAISE NOTICE '✅ Imported knowledge domains';
    RAISE NOTICE '   Root (Industry): 3 domains';
    RAISE NOTICE '   Level 1 (Functions): 8 domains';
    RAISE NOTICE '   Level 2 (Specialties): 8 domains';
    RAISE NOTICE '   Total: 19 knowledge domains';

END $$;

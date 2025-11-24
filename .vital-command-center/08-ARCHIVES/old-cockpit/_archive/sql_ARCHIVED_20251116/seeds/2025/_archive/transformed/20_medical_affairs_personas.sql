-- =====================================================================================
-- MEDICAL AFFAIRS PERSONAS (43 personas)
-- =====================================================================================
-- Source: Medical Affairs Complete Persona Library v5.0
-- Framework: BRIDGE™ with VPANES Priority Scoring
-- Total: 43 personas across 9 departments
-- =====================================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER := 0;
    v_ma_function_id UUID;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE id = '11111111-1111-1111-1111-111111111111' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Platform tenant not found';
    END IF;
    
    -- Get Medical Affairs function ID
    SELECT id INTO v_ma_function_id FROM org_functions 
    WHERE tenant_id = v_tenant_id AND name = 'Medical Affairs' LIMIT 1;
    
    RAISE NOTICE 'Importing Medical Affairs personas...';
    RAISE NOTICE 'Platform tenant: %', v_tenant_id;
    

    -- =====================================================================================
    -- TIER 1 (High Priority): 12 personas
    -- =====================================================================================

    -- P001: VP Medical Affairs / Chief Medical Officer (Priority Rank: 1, Score: 9.15)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'VP Medical Affairs / Chief Medical Officer',
        'vp-medical-affairs-chief-medical-officer',
        'VP Medical Affairs / Chief Medical Officer',
        'Global Leadership',
        v_ma_function_id,
        'executive',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P001",
  "persona_number": 1,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "5,000-50,000+ employees | $5B-$50B+ revenue",
  "budget_auth": "$10M - $100M+",
  "team_size": "50-500+",
  "key_need": "Executive analytics for strategic decision-making, evidence portfolio optimization, ROI demonstration",
  "decision_cycle": "6-12 months (strategic platform decisions)",
  "reports_to": "Chief Medical Officer, CEO, or General Manager",
  "geographic_scope": "Global",
  "typical_background": "MD or PharmD with 15-25+ years pharma experience, prior Medical Director/VP roles",
  "key_stakeholders": [
    "CEO",
    "Board",
    "Regulatory Affairs",
    "Clinical Development",
    "Commercial",
    "R&D",
    "Regulators",
    "Payers",
    "KOLs"
  ],
  "vpanes_scoring": {
    "V_value": 10,
    "P_pain": 9,
    "A_adoption": 8,
    "N_network": 10,
    "E_ease": 6,
    "S_strategic": 10,
    "priority_score": 9.15,
    "priority_rank": 1
  },
  "priority_score": 9.15,
  "priority_rank": 1
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P002: Medical Director (Therapeutic Area/Product Lead) (Priority Rank: 2, Score: 8.8)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Director (Therapeutic Area/Product Lead)',
        'medical-director-therapeutic-areaproduct-lead',
        'Medical Director / Therapeutic Area Lead',
        'Global Leadership',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P002",
  "persona_number": 2,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$2M - $20M",
  "team_size": "10-50",
  "key_need": "Evidence generation planning, publication strategy management, KOL engagement analytics",
  "decision_cycle": "3-9 months (tactical solutions)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global / Regional / Therapeutic Area",
  "typical_background": "MD, PharmD, or PhD with 10-20 years pharma experience, deep therapeutic area expertise",
  "key_stakeholders": [
    "VP Medical Affairs",
    "MSL teams",
    "Medical Writers",
    "HEOR",
    "Clinical Development",
    "Regulatory",
    "KOLs",
    "Medical Societies"
  ],
  "vpanes_scoring": {
    "V_value": 9,
    "P_pain": 9,
    "A_adoption": 8,
    "N_network": 9,
    "E_ease": 7,
    "S_strategic": 9,
    "priority_score": 8.8,
    "priority_rank": 2
  },
  "priority_score": 8.8,
  "priority_rank": 2
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P003: Head of Field Medical (Priority Rank: 3, Score: 8.65)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Head of Field Medical',
        'head-of-field-medical',
        'Head of Field Medical / VP MSL Operations',
        'Global Leadership',
        v_ma_function_id,
        'executive',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P003",
  "persona_number": 3,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - Field Medical Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$5M - $30M",
  "team_size": "50-300 MSLs",
  "key_need": "MSL performance analytics, territory optimization, KOL intelligence platform, insights aggregation",
  "decision_cycle": "6-12 months (strategic MSL platforms)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global",
  "typical_background": "PharmD, MD, or PhD with 12-20+ years, extensive MSL and field medical experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "Regional Medical Directors",
    "MSL Managers",
    "MSLs",
    "Medical Directors",
    "HR",
    "Training"
  ],
  "vpanes_scoring": {
    "V_value": 9,
    "P_pain": 9,
    "A_adoption": 7,
    "N_network": 9,
    "E_ease": 6,
    "S_strategic": 9,
    "priority_score": 8.65,
    "priority_rank": 3
  },
  "priority_score": 8.65,
  "priority_rank": 3
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P004: Head of HEOR (Priority Rank: 4, Score: 8.45)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Head of HEOR',
        'head-of-heor',
        'Head of Health Economics & Outcomes Research',
        'Global Leadership',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P004",
  "persona_number": 4,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - HEOR Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$2M - $15M",
  "team_size": "10-50",
  "key_need": "Economic modeling platform, payer intelligence, HTA automation, value evidence generation",
  "decision_cycle": "6-12 months (enterprise HEOR platforms)",
  "reports_to": "VP Medical Affairs / Chief Medical Officer",
  "geographic_scope": "Global",
  "typical_background": "PhD in Health Economics, Epidemiology, or PharmD with 10-20 years HEOR experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "Market Access",
    "Payers",
    "HTA Agencies",
    "HEOR Team",
    "Medical Directors",
    "Regulatory Affairs"
  ],
  "vpanes_scoring": {
    "V_value": 9,
    "P_pain": 9,
    "A_adoption": 7,
    "N_network": 8,
    "E_ease": 6,
    "S_strategic": 9,
    "priority_score": 8.45,
    "priority_rank": 4
  },
  "priority_score": 8.45,
  "priority_rank": 4
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P005: Global Medical Advisor (Priority Rank: 8, Score: 8.0)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Global Medical Advisor',
        'global-medical-advisor',
        'Global Medical Advisor / Senior Medical Consultant',
        'Global Leadership',
        v_ma_function_id,
        'executive',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P005",
  "persona_number": 5,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - Medical Consultation",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "0-3",
  "key_need": "Medical intelligence platform, regulatory guidance tools, strategic consultation support",
  "decision_cycle": "3-6 months (consultation tools)",
  "reports_to": "Chief Medical Officer / VP Medical Affairs",
  "geographic_scope": "Global",
  "typical_background": "MD with 20-30+ years clinical and pharma experience, recognized medical authority",
  "key_stakeholders": [
    "CMO",
    "VP Medical Affairs",
    "Senior Leadership",
    "Regulators",
    "KOLs",
    "Medical Directors"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 9,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 8.0,
    "priority_rank": 8
  },
  "priority_score": 8.0,
  "priority_rank": 8
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P006: Head of Medical Communications (Priority Rank: 7, Score: 8.05)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Head of Medical Communications',
        'head-of-medical-communications',
        'Head of Medical Communications / Publications',
        'Global Leadership',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P006",
  "persona_number": 6,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Global Leadership",
  "function": "Medical Affairs - Communications Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "500-50,000+ employees | $500M-$50B+ revenue",
  "budget_auth": "$1M - $10M",
  "team_size": "10-50",
  "key_need": "Publication planning platform, AI writing tools, GPP3 compliance, impact analytics",
  "decision_cycle": "6-12 months (enterprise communications platforms)",
  "reports_to": "VP Medical Affairs / Medical Director",
  "geographic_scope": "Global",
  "typical_background": "PhD, PharmD, or MD with 10-15 years medical writing and publications experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "Medical Directors",
    "Medical Writers",
    "KOLs",
    "Journals",
    "Congress Organizers",
    "Regulatory"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 8,
    "A_adoption": 8,
    "N_network": 8,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 8.05,
    "priority_rank": 7
  },
  "priority_score": 8.05,
  "priority_rank": 7
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P010: Medical Science Liaison (MSL) (Priority Rank: 6, Score: 8.1)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Science Liaison (MSL)',
        'medical-science-liaison-msl',
        'Medical Science Liaison',
        'Field Medical',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P010",
  "persona_number": 10,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Field Medical",
  "function": "Medical Affairs - Field Scientific Engagement",
  "org_type": "Pharma / Biotech / Med Device",
  "org_size": "100-50,000+ employees | $50M-$50B+ revenue",
  "budget_auth": "$0 - $50K (expenses only)",
  "team_size": "0 (Individual Contributor)",
  "key_need": "AI-powered KOL intelligence, engagement tracking, insight capture automation, real-time data access",
  "decision_cycle": "1-3 months (individual tools)",
  "reports_to": "MSL Manager / Regional Medical Director",
  "geographic_scope": "Territory (5-10 states or equivalent)",
  "typical_background": "PharmD or PhD with 0-10 years pharma experience, clinical background helpful",
  "key_stakeholders": [
    "MSL Manager",
    "KOLs",
    "HCPs",
    "Medical Directors",
    "Investigators",
    "Payers",
    "Patient Advocacy Groups"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 9,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 8,
    "S_strategic": 8,
    "priority_score": 8.1,
    "priority_rank": 6
  },
  "priority_score": 8.1,
  "priority_rank": 6
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P013: Medical Information Specialist (Priority Rank: 10, Score: 7.7)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Information Specialist',
        'medical-information-specialist',
        'Medical Information Specialist',
        'Medical Information',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P013",
  "persona_number": 13,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Medical Information",
  "function": "Medical Affairs - Medical Information Response",
  "org_type": "Pharma / Biotech",
  "org_size": "50-20,000+ employees | $50M-$20B+ revenue",
  "budget_auth": "$0 - $25K (expenses only)",
  "team_size": "0 (Individual Contributor)",
  "key_need": "AI-powered inquiry response, SRD automation, adverse event detection, knowledge management",
  "decision_cycle": "1-3 months (departmental tools)",
  "reports_to": "Medical Information Manager",
  "geographic_scope": "Market / Global",
  "typical_background": "PharmD or RPh with 0-8 years experience, clinical knowledge required",
  "key_stakeholders": [
    "MI Manager",
    "HCPs",
    "Patients",
    "Pharmacovigilance",
    "Regulatory",
    "Medical Directors"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 9,
    "A_adoption": 8,
    "N_network": 5,
    "E_ease": 9,
    "S_strategic": 7,
    "priority_score": 7.7,
    "priority_rank": 10
  },
  "priority_score": 7.7,
  "priority_rank": 10
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P016: Publication Strategy Lead (Priority Rank: 9, Score: 7.8)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Publication Strategy Lead',
        'publication-strategy-lead',
        'Publication Strategy Lead / Publication Manager',
        'Medical Communications',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P016",
  "persona_number": 16,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Medical Communications",
  "function": "Medical Affairs - Publication Planning",
  "org_type": "Large Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "2-8 (writers, coordinators)",
  "key_need": "Publication planning automation, journal selection AI, author engagement tracking, impact analytics",
  "decision_cycle": "3-6 months (platform decisions)",
  "reports_to": "Head of Medical Communications / Medical Director",
  "geographic_scope": "Global / Therapeutic Area",
  "typical_background": "PhD, PharmD with 5-12 years, medical writing and publication planning experience",
  "key_stakeholders": [
    "Head of Medical Comms",
    "Medical Writers",
    "Medical Directors",
    "KOLs",
    "Journals",
    "Regulatory",
    "Legal"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.8,
    "priority_rank": 9
  },
  "priority_score": 7.8,
  "priority_rank": 9
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P017: Medical Writer (Scientific) (Priority Rank: 11, Score: 7.5)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Writer (Scientific)',
        'medical-writer-scientific',
        'Medical Writer - Scientific Publications',
        'Medical Communications',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P017",
  "persona_number": 17,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Medical Communications",
  "function": "Medical Affairs - Scientific Writing",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "50-10,000+ employees | $50M-$10B+ revenue",
  "budget_auth": "$25K - $100K",
  "team_size": "0 (Individual Contributor)",
  "key_need": "AI writing assistance, literature synthesis automation, GPP3 compliance checking, collaboration tools",
  "decision_cycle": "1-3 months (writing tools)",
  "reports_to": "Head of Medical Writing / Medical Communications Manager",
  "geographic_scope": "Global",
  "typical_background": "PhD, PharmD with 0-10 years medical writing experience",
  "key_stakeholders": [
    "Publication Manager",
    "Medical Directors",
    "KOLs",
    "Medical Editors",
    "Regulatory",
    "Journals"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 8,
    "N_network": 6,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 7.5,
    "priority_rank": 11
  },
  "priority_score": 7.5,
  "priority_rank": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P023: Health Economics Specialist (HEOR Analyst) (Priority Rank: 5, Score: 8.3)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Health Economics Specialist (HEOR Analyst)',
        'health-economics-specialist-heor-analyst',
        'Health Economics & Outcomes Research Specialist',
        'Evidence Generation & HEOR',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P023",
  "persona_number": 23,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Evidence Generation & HEOR",
  "function": "Medical Affairs - Health Economics",
  "org_type": "Pharma / Biotech / Med Device",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $1M (study budgets)",
  "team_size": "0-2",
  "key_need": "AI-powered economic modeling, automated BIM/CEA, payer intelligence, HTA dossier automation",
  "decision_cycle": "3-6 months (modeling platforms)",
  "reports_to": "Director HEOR / Market Access Director",
  "geographic_scope": "Global / Regional",
  "typical_background": "MS or PhD in Health Economics, Epidemiology, or related field with 0-8 years experience",
  "key_stakeholders": [
    "HEOR Director",
    "Market Access",
    "Payers",
    "Medical Directors",
    "HTA Agencies",
    "Biostatistics"
  ],
  "vpanes_scoring": {
    "V_value": 9,
    "P_pain": 9,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 6,
    "S_strategic": 9,
    "priority_score": 8.3,
    "priority_rank": 5
  },
  "priority_score": 8.3,
  "priority_rank": 5
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P024: Real-World Evidence (RWE) Specialist (Priority Rank: 7, Score: 8.05)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Real-World Evidence (RWE) Specialist',
        'real-world-evidence-rwe-specialist',
        'Real-World Evidence Specialist',
        'Evidence Generation & HEOR',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P024",
  "persona_number": 24,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 1,
  "department": "Evidence Generation & HEOR",
  "function": "Medical Affairs - Real-World Evidence",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $2M (study budgets)",
  "team_size": "0-3",
  "key_need": "AI-powered claims analysis, predictive modeling, RWE study design automation, registry platform",
  "decision_cycle": "6-12 months (RWE platform)",
  "reports_to": "Director RWE / Head of Evidence Generation",
  "geographic_scope": "Global",
  "typical_background": "MS or PhD in Epidemiology, Biostatistics with 0-8 years RWE experience",
  "key_stakeholders": [
    "HEOR Director",
    "Medical Directors",
    "Biostatisticians",
    "Data Scientists",
    "Payers",
    "Regulators"
  ],
  "vpanes_scoring": {
    "V_value": 9,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 6,
    "S_strategic": 9,
    "priority_score": 8.05,
    "priority_rank": 7
  },
  "priority_score": 8.05,
  "priority_rank": 7
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- =====================================================================================
    -- TIER 2 (Medium Priority): 28 personas
    -- =====================================================================================

    -- P007: Regional Medical Director (Priority Rank: 9, Score: 7.9)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Regional Medical Director',
        'regional-medical-director',
        'Regional Medical Director',
        'Field Medical',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P007",
  "persona_number": 7,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Field Medical",
  "function": "Medical Affairs - Regional Field Leadership",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-20,000+ employees | $1B-$20B+ revenue",
  "budget_auth": "$500K - $5M",
  "team_size": "5-20 MSLs",
  "key_need": "MSL performance analytics, regional insights aggregation, territory optimization",
  "decision_cycle": "3-6 months (regional tools)",
  "reports_to": "VP Field Medical / Head of MSLs",
  "geographic_scope": "Regional (US region, EMEA, APAC)",
  "typical_background": "PharmD, MD, or PhD with 8-15 years experience, MSL background preferred",
  "key_stakeholders": [
    "Head of Field Medical",
    "MSL Managers",
    "MSLs",
    "Medical Directors",
    "Regional Commercial",
    "KOLs"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 8,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.9,
    "priority_rank": 9
  },
  "priority_score": 7.9,
  "priority_rank": 9
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P008: MSL Manager (Priority Rank: 12, Score: 7.35)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'MSL Manager',
        'msl-manager',
        'MSL Manager / District Manager',
        'Field Medical',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P008",
  "persona_number": 8,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Field Medical",
  "function": "Medical Affairs - MSL Team Management",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "5-12 MSLs",
  "key_need": "Team performance dashboards, coaching tools, KOL engagement tracking, territory management",
  "decision_cycle": "2-6 months (team management tools)",
  "reports_to": "Regional Medical Director",
  "geographic_scope": "District / Multi-Territory",
  "typical_background": "PharmD or PhD with 5-12 years experience, prior MSL role required",
  "key_stakeholders": [
    "Regional Medical Director",
    "MSLs",
    "Medical Directors",
    "HR",
    "Training",
    "KOLs"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 7.35,
    "priority_rank": 12
  },
  "priority_score": 7.35,
  "priority_rank": 12
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P009: Therapeutic Area MSL Lead (Priority Rank: 11, Score: 7.5)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Therapeutic Area MSL Lead',
        'therapeutic-area-msl-lead',
        'Therapeutic Area MSL Lead',
        'Field Medical',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P009",
  "persona_number": 9,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Field Medical",
  "function": "Medical Affairs - TA Field Leadership",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "3-10 MSLs",
  "key_need": "TA-specific content platform, KOL mapping, evidence synthesis, peer training tools",
  "decision_cycle": "3-6 months (TA-specific tools)",
  "reports_to": "Head of Field Medical / Medical Director",
  "geographic_scope": "Therapeutic Area (cross-regional)",
  "typical_background": "PharmD or PhD with 5-12 years, deep TA expertise, MSL background",
  "key_stakeholders": [
    "Medical Director",
    "MSLs",
    "Medical Communications",
    "Medical Education",
    "TA KOLs",
    "Scientific Societies"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.5,
    "priority_rank": 11
  },
  "priority_score": 7.5,
  "priority_rank": 11
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P011: Field Medical Trainer (Priority Rank: 20, Score: 6.85)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Field Medical Trainer',
        'field-medical-trainer',
        'Field Medical Trainer / MSL Educator',
        'Field Medical',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P011",
  "persona_number": 11,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Field Medical",
  "function": "Medical Affairs - MSL Training & Development",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "0-3",
  "key_need": "Learning management system, competency assessment, training content platform, virtual training tools",
  "decision_cycle": "3-6 months (training platforms)",
  "reports_to": "Head of Field Medical / Regional Medical Director",
  "geographic_scope": "Regional / Global",
  "typical_background": "PharmD or PhD with 5-12 years, MSL experience, adult learning expertise",
  "key_stakeholders": [
    "Head of Field Medical",
    "MSL Managers",
    "MSLs",
    "HR/Learning & Development",
    "Medical Directors"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 6.85,
    "priority_rank": 20
  },
  "priority_score": 6.85,
  "priority_rank": 20
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P012: Medical Information Manager (Priority Rank: 10, Score: 7.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Information Manager',
        'medical-information-manager',
        'Medical Information Manager',
        'Medical Information',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P012",
  "persona_number": 12,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Information",
  "function": "Medical Affairs - Medical Information Leadership",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "3-15",
  "key_need": "Inquiry management system, AI response generation, SRD automation, knowledge base platform",
  "decision_cycle": "3-9 months (MI systems)",
  "reports_to": "VP Medical Affairs / Medical Director",
  "geographic_scope": "Global / Regional",
  "typical_background": "PharmD or RPh with 5-12 years pharma experience, MI background required",
  "key_stakeholders": [
    "VP Medical Affairs",
    "Medical Info Specialists",
    "Regulatory",
    "Pharmacovigilance",
    "Medical Directors",
    "HCPs"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 8,
    "N_network": 7,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 7.55,
    "priority_rank": 10
  },
  "priority_score": 7.55,
  "priority_rank": 10
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P015: Medical Content Manager (Priority Rank: 14, Score: 7.2)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Content Manager',
        'medical-content-manager',
        'Medical Content Manager',
        'Medical Information',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P015",
  "persona_number": 15,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Information",
  "function": "Medical Affairs - Content Strategy & Management",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "2-8",
  "key_need": "Content management system, version control, approval workflows, digital asset management",
  "decision_cycle": "3-6 months (content platforms)",
  "reports_to": "Medical Information Manager / Head of Medical Communications",
  "geographic_scope": "Global / Regional",
  "typical_background": "PharmD, PhD with 3-10 years, content management and scientific communication experience",
  "key_stakeholders": [
    "Medical Information",
    "Medical Communications",
    "Medical Writers",
    "Regulatory",
    "Legal",
    "Digital Teams"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 6,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 7.2,
    "priority_rank": 14
  },
  "priority_score": 7.2,
  "priority_rank": 14
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P018: Medical Writer (Regulatory) (Priority Rank: 12, Score: 7.4)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Writer (Regulatory)',
        'medical-writer-regulatory',
        'Medical Writer - Regulatory Documents',
        'Medical Communications',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P018",
  "persona_number": 18,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Communications",
  "function": "Medical Affairs - Regulatory Writing",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "100-20,000+ employees | $100M-$20B+ revenue",
  "budget_auth": "$25K - $100K",
  "team_size": "0 (Individual Contributor)",
  "key_need": "Regulatory writing templates, eCTD tools, ICH compliance checking, document automation",
  "decision_cycle": "2-6 months (regulatory writing tools)",
  "reports_to": "Head of Medical Writing / Regulatory Affairs",
  "geographic_scope": "Global",
  "typical_background": "PhD, PharmD with 0-10 years regulatory writing experience, RAC certification helpful",
  "key_stakeholders": [
    "Regulatory Affairs",
    "Medical Directors",
    "Clinical Development",
    "Medical Editors",
    "Regulatory Agencies"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.4,
    "priority_rank": 12
  },
  "priority_score": 7.4,
  "priority_rank": 12
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P019: Medical Editor (Priority Rank: 22, Score: 6.75)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Editor',
        'medical-editor',
        'Medical Editor',
        'Medical Communications',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P019",
  "persona_number": 19,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Communications",
  "function": "Medical Affairs - Editorial Services",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "100-10,000+ employees | $100M-$10B+ revenue",
  "budget_auth": "$25K - $100K",
  "team_size": "0-2",
  "key_need": "AI-powered editing tools, grammar/style checking, consistency verification, version control",
  "decision_cycle": "1-3 months (editing tools)",
  "reports_to": "Head of Medical Communications",
  "geographic_scope": "Global",
  "typical_background": "Scientific background with editing expertise, 3-10 years experience",
  "key_stakeholders": [
    "Medical Writers",
    "Publication Manager",
    "Medical Directors",
    "Regulatory"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 5,
    "E_ease": 8,
    "S_strategic": 6,
    "priority_score": 6.75,
    "priority_rank": 22
  },
  "priority_score": 6.75,
  "priority_rank": 22
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P020: Medical Education Director (Priority Rank: 17, Score: 7.0)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Education Director',
        'medical-education-director',
        'Medical Education Director / CME Lead',
        'Medical Communications',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P020",
  "persona_number": 20,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Communications",
  "function": "Medical Affairs - Medical Education",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$300K - $2M",
  "team_size": "2-10",
  "key_need": "CME platform, speaker bureau management, needs assessment tools, impact measurement",
  "decision_cycle": "3-9 months (education platforms)",
  "reports_to": "Head of Medical Communications / Medical Director",
  "geographic_scope": "Global / Regional",
  "typical_background": "PhD, PharmD, or MD with 5-15 years, medical education and CME experience",
  "key_stakeholders": [
    "Head of Medical Comms",
    "Medical Directors",
    "KOLs",
    "HCPs",
    "Medical Education Companies",
    "Accreditation Bodies"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 7.0,
    "priority_rank": 17
  },
  "priority_score": 7.0,
  "priority_rank": 17
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P021: Medical Communications Manager (Priority Rank: 17, Score: 7.0)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Communications Manager',
        'medical-communications-manager',
        'Medical Communications Manager',
        'Medical Communications',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P021",
  "persona_number": 21,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Communications",
  "function": "Medical Affairs - Communications Management",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "3-12",
  "key_need": "Project management tools, vendor management, budget tracking, content approval workflows",
  "decision_cycle": "3-6 months (communications platforms)",
  "reports_to": "Head of Medical Communications",
  "geographic_scope": "Regional / Therapeutic Area",
  "typical_background": "PhD, PharmD with 5-12 years, medical communications and project management experience",
  "key_stakeholders": [
    "Head of Medical Comms",
    "Medical Writers",
    "Medical Directors",
    "Agencies",
    "Vendors",
    "Legal",
    "Regulatory"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 7.0,
    "priority_rank": 17
  },
  "priority_score": 7.0,
  "priority_rank": 17
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P022: Congress & Events Manager (Priority Rank: 25, Score: 6.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Congress & Events Manager',
        'congress-events-manager',
        'Congress & Events Manager',
        'Medical Communications',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P022",
  "persona_number": 22,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Communications",
  "function": "Medical Affairs - Congress & Events",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$300K - $2M",
  "team_size": "2-8",
  "key_need": "Congress planning tools, abstract tracking, booth management, attendee engagement analytics",
  "decision_cycle": "3-6 months (event platforms)",
  "reports_to": "Head of Medical Communications",
  "geographic_scope": "Global / Regional",
  "typical_background": "Science degree with 3-10 years event management and pharma experience",
  "key_stakeholders": [
    "Medical Directors",
    "MSLs",
    "Publication Team",
    "KOLs",
    "Congress Organizers",
    "Marketing"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 6,
    "priority_score": 6.55,
    "priority_rank": 25
  },
  "priority_score": 6.55,
  "priority_rank": 25
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P025: Biostatistician (Priority Rank: 15, Score: 7.1)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Biostatistician',
        'biostatistician',
        'Biostatistician',
        'Evidence Generation & HEOR',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P025",
  "persona_number": 25,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Evidence Generation & HEOR",
  "function": "Medical Affairs - Biostatistics",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$50K - $300K",
  "team_size": "0-2",
  "key_need": "Statistical software, data visualization tools, analysis automation, reproducible research platforms",
  "decision_cycle": "2-6 months (statistical tools)",
  "reports_to": "Director Biostatistics / HEOR Director",
  "geographic_scope": "Global",
  "typical_background": "MS or PhD in Biostatistics, Statistics with 0-10 years experience",
  "key_stakeholders": [
    "HEOR Team",
    "RWE Specialists",
    "Medical Directors",
    "Clinical Development",
    "Data Scientists"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 5,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 7.1,
    "priority_rank": 15
  },
  "priority_score": 7.1,
  "priority_rank": 15
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P026: Epidemiologist (Priority Rank: 18, Score: 6.95)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Epidemiologist',
        'epidemiologist',
        'Epidemiologist',
        'Evidence Generation & HEOR',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P026",
  "persona_number": 26,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Evidence Generation & HEOR",
  "function": "Medical Affairs - Epidemiology",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$50K - $500K",
  "team_size": "0-2",
  "key_need": "Epidemiological study design tools, data analysis platforms, literature review automation",
  "decision_cycle": "3-6 months (epidemiology tools)",
  "reports_to": "Director Epidemiology / HEOR Director",
  "geographic_scope": "Global",
  "typical_background": "PhD or MD in Epidemiology with 0-10 years experience",
  "key_stakeholders": [
    "HEOR Team",
    "RWE Specialists",
    "Biostatisticians",
    "Medical Directors",
    "Pharmacovigilance"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 5,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 6.95,
    "priority_rank": 18
  },
  "priority_score": 6.95,
  "priority_rank": 18
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P027: Outcomes Research Manager (Priority Rank: 18, Score: 6.95)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Outcomes Research Manager',
        'outcomes-research-manager',
        'Outcomes Research Manager',
        'Evidence Generation & HEOR',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P027",
  "persona_number": 27,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Evidence Generation & HEOR",
  "function": "Medical Affairs - Outcomes Research",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$300K - $2M",
  "team_size": "2-8",
  "key_need": "Outcomes study management, PRO/QoL tools, patient registry platforms, data collection systems",
  "decision_cycle": "6-12 months (outcomes platforms)",
  "reports_to": "Head of HEOR / Medical Director",
  "geographic_scope": "Global / Regional",
  "typical_background": "PhD in Health Services Research, Epidemiology with 5-12 years experience",
  "key_stakeholders": [
    "HEOR Director",
    "HEOR Analysts",
    "Medical Directors",
    "Clinical Operations",
    "Patients",
    "Payers"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 6,
    "S_strategic": 7,
    "priority_score": 6.95,
    "priority_rank": 18
  },
  "priority_score": 6.95,
  "priority_rank": 18
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P028: Clinical Study Liaison (Priority Rank: 24, Score: 6.6)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Clinical Study Liaison',
        'clinical-study-liaison',
        'Clinical Study Liaison',
        'Clinical Operations',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P028",
  "persona_number": 28,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Clinical Operations",
  "function": "Medical Affairs - Clinical Study Support",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$50K - $200K",
  "team_size": "0 (Individual Contributor)",
  "key_need": "Site management tools, investigator engagement tracking, study startup support, recruitment analytics",
  "decision_cycle": "2-6 months (clinical tools)",
  "reports_to": "Clinical Operations Manager / Medical Director",
  "geographic_scope": "Territory / Multi-Site",
  "typical_background": "Life sciences degree with 2-8 years clinical research experience",
  "key_stakeholders": [
    "Clinical Operations",
    "MSLs",
    "Investigators",
    "Site Coordinators",
    "Medical Directors",
    "CROs"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 6,
    "priority_score": 6.6,
    "priority_rank": 24
  },
  "priority_score": 6.6,
  "priority_rank": 24
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P029: Medical Monitor (Priority Rank: 16, Score: 7.05)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Monitor',
        'medical-monitor',
        'Medical Monitor',
        'Clinical Operations',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P029",
  "persona_number": 29,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Clinical Operations",
  "function": "Medical Affairs - Clinical Monitoring",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "0-2",
  "key_need": "Safety monitoring tools, adverse event tracking, protocol deviation management, risk-based monitoring",
  "decision_cycle": "3-9 months (monitoring systems)",
  "reports_to": "Clinical Operations Director / Medical Director",
  "geographic_scope": "Global",
  "typical_background": "MD or equivalent with 3-15 years clinical research and monitoring experience",
  "key_stakeholders": [
    "Clinical Operations",
    "Pharmacovigilance",
    "Medical Directors",
    "Investigators",
    "Regulatory Affairs",
    "CROs"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 6,
    "S_strategic": 7,
    "priority_score": 7.05,
    "priority_rank": 16
  },
  "priority_score": 7.05,
  "priority_rank": 16
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P031: Clinical Trial Disclosure Manager (Priority Rank: 19, Score: 6.9)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Clinical Trial Disclosure Manager',
        'clinical-trial-disclosure-manager',
        'Clinical Trial Disclosure Manager',
        'Clinical Operations',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P031",
  "persona_number": 31,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Clinical Operations",
  "function": "Medical Affairs - Transparency & Disclosure",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "1-5",
  "key_need": "Registry submission automation, plain language summary tools, disclosure tracking, compliance monitoring",
  "decision_cycle": "3-9 months (disclosure platforms)",
  "reports_to": "Clinical Operations Director / Head of Medical Affairs",
  "geographic_scope": "Global",
  "typical_background": "Scientific degree with 3-10 years experience in clinical trial transparency",
  "key_stakeholders": [
    "Clinical Operations",
    "Regulatory Affairs",
    "Legal",
    "Medical Directors",
    "Publication Team",
    "EMA",
    "FDA"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 7,
    "priority_score": 6.9,
    "priority_rank": 19
  },
  "priority_score": 6.9,
  "priority_rank": 19
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P032: Medical Excellence Director (Priority Rank: 13, Score: 7.25)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Excellence Director',
        'medical-excellence-director',
        'Medical Excellence Director',
        'Medical Excellence & Governance',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P032",
  "persona_number": 32,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Excellence & Governance",
  "function": "Medical Affairs - Medical Excellence",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$300K - $2M",
  "team_size": "3-12",
  "key_need": "Quality management systems, training platforms, competency assessment, audit management",
  "decision_cycle": "6-12 months (quality systems)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "MD, PharmD, or PhD with 10-20 years, quality and compliance expertise",
  "key_stakeholders": [
    "VP Medical Affairs",
    "All Medical Affairs Teams",
    "Quality Assurance",
    "Compliance",
    "Legal",
    "Regulatory"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 8,
    "E_ease": 6,
    "S_strategic": 8,
    "priority_score": 7.25,
    "priority_rank": 13
  },
  "priority_score": 7.25,
  "priority_rank": 13
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P033: Medical Review Committee Coordinator (Priority Rank: 25, Score: 6.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Review Committee Coordinator',
        'medical-review-committee-coordinator',
        'Medical Review Committee Coordinator',
        'Medical Excellence & Governance',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P033",
  "persona_number": 33,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Excellence & Governance",
  "function": "Medical Affairs - Review & Approval",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$50K - $200K",
  "team_size": "1-4",
  "key_need": "MLR workflow automation, document tracking, approval routing, compliance verification",
  "decision_cycle": "3-6 months (MLR systems)",
  "reports_to": "Medical Excellence Director / VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "Scientific degree with 3-10 years pharma and regulatory review experience",
  "key_stakeholders": [
    "Medical Directors",
    "Medical Writers",
    "Regulatory",
    "Legal",
    "Compliance",
    "All Content Creators"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 6,
    "priority_score": 6.55,
    "priority_rank": 25
  },
  "priority_score": 6.55,
  "priority_rank": 25
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P034: Medical QA Manager (Priority Rank: 19, Score: 6.9)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical QA Manager',
        'medical-qa-manager',
        'Medical QA Manager',
        'Medical Excellence & Governance',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P034",
  "persona_number": 34,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Excellence & Governance",
  "function": "Medical Affairs - Quality Assurance",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "2-8",
  "key_need": "Audit management system, CAPA tracking, deviation management, training documentation",
  "decision_cycle": "6-12 months (QMS platforms)",
  "reports_to": "Medical Excellence Director / VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "Scientific degree with 5-15 years quality assurance and pharma experience",
  "key_stakeholders": [
    "Medical Excellence Director",
    "All Medical Affairs Teams",
    "Corporate QA",
    "Regulatory",
    "Compliance"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 6,
    "S_strategic": 7,
    "priority_score": 6.9,
    "priority_rank": 19
  },
  "priority_score": 6.9,
  "priority_rank": 19
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P035: Medical Affairs Compliance Officer (Priority Rank: 19, Score: 6.9)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Compliance Officer',
        'medical-affairs-compliance-officer',
        'Medical Affairs Compliance Officer',
        'Medical Excellence & Governance',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P035",
  "persona_number": 35,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Excellence & Governance",
  "function": "Medical Affairs - Compliance",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$100K - $500K",
  "team_size": "1-5",
  "key_need": "Compliance monitoring tools, policy management, training tracking, incident reporting",
  "decision_cycle": "6-12 months (compliance systems)",
  "reports_to": "Medical Excellence Director / Chief Compliance Officer",
  "geographic_scope": "Global / Regional",
  "typical_background": "Scientific or legal background with 5-15 years pharma compliance experience",
  "key_stakeholders": [
    "Medical Excellence Director",
    "All Medical Affairs Teams",
    "Corporate Compliance",
    "Legal",
    "Regulatory",
    "Ethics"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 7,
    "E_ease": 6,
    "S_strategic": 7,
    "priority_score": 6.9,
    "priority_rank": 19
  },
  "priority_score": 6.9,
  "priority_rank": 19
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P036: Medical Affairs Strategist (Priority Rank: 8, Score: 8.0)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Strategist',
        'medical-affairs-strategist',
        'Medical Affairs Strategist',
        'Medical Strategy & Operations',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P036",
  "persona_number": 36,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Strategy & Operations",
  "function": "Medical Affairs - Strategic Planning",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$500K - $2M",
  "team_size": "2-6",
  "key_need": "Strategic planning tools, portfolio analytics, competitive intelligence, evidence gap analysis",
  "decision_cycle": "6-12 months (strategic platforms)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "MBA or scientific degree with 8-15 years pharma strategy and analytics experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "Medical Directors",
    "Commercial Strategy",
    "Market Access",
    "R&D",
    "Business Development"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 8,
    "A_adoption": 7,
    "N_network": 8,
    "E_ease": 6,
    "S_strategic": 9,
    "priority_score": 8.0,
    "priority_rank": 8
  },
  "priority_score": 8.0,
  "priority_rank": 8
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P037: Therapeutic Area Expert (Priority Rank: 10, Score: 7.7)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Therapeutic Area Expert',
        'therapeutic-area-expert',
        'Therapeutic Area Expert',
        'Medical Strategy & Operations',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P037",
  "persona_number": 37,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Strategy & Operations",
  "function": "Medical Affairs - Therapeutic Area Leadership",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "0-5",
  "key_need": "TA intelligence platform, literature monitoring, competitive landscape analysis, KOL mapping",
  "decision_cycle": "3-6 months (TA-specific tools)",
  "reports_to": "Medical Director / VP Medical Affairs",
  "geographic_scope": "Global / Therapeutic Area",
  "typical_background": "MD, PhD, or PharmD with 8-20 years deep therapeutic area expertise",
  "key_stakeholders": [
    "Medical Director",
    "MSLs",
    "Medical Writers",
    "HEOR",
    "Clinical Development",
    "TA KOLs",
    "Medical Societies"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 8,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.7,
    "priority_rank": 10
  },
  "priority_score": 7.7,
  "priority_rank": 10
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P038: Medical Affairs Operations Manager (Priority Rank: 10, Score: 7.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Operations Manager',
        'medical-affairs-operations-manager',
        'Medical Affairs Operations Manager / PMO Lead',
        'Medical Strategy & Operations',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P038",
  "persona_number": 38,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Strategy & Operations",
  "function": "Medical Affairs - Operations & PMO",
  "org_type": "Large Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$300K - $1.5M",
  "team_size": "3-10",
  "key_need": "Project management automation, resource optimization, budget analytics, workflow automation, reporting dashboards",
  "decision_cycle": "3-9 months (operational tools)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "Business or scientific degree with 5-12 years operations and project management experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "All Medical Affairs Teams",
    "Finance",
    "IT",
    "HR",
    "Procurement"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 8,
    "A_adoption": 8,
    "N_network": 7,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 7.55,
    "priority_rank": 10
  },
  "priority_score": 7.55,
  "priority_rank": 10
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P039: Medical Affairs Technology Lead (Priority Rank: 9, Score: 7.8)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Technology Lead',
        'medical-affairs-technology-lead',
        'Medical Affairs Technology Lead / Digital Transformation',
        'Medical Strategy & Operations',
        v_ma_function_id,
        'senior',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P039",
  "persona_number": 39,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Medical Strategy & Operations",
  "function": "Medical Affairs - Technology & Digital",
  "org_type": "Large Pharma / Biotech",
  "org_size": "1,000-50,000+ employees | $1B-$50B+ revenue",
  "budget_auth": "$500K - $3M",
  "team_size": "2-8",
  "key_need": "Digital strategy, AI/ML implementation, technology roadmap, vendor management, innovation pipeline",
  "decision_cycle": "6-18 months (enterprise technology)",
  "reports_to": "VP Medical Affairs",
  "geographic_scope": "Global",
  "typical_background": "Scientific + technology background, 8-15 years digital health and pharma tech experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "IT",
    "Data Science",
    "All Medical Affairs Teams",
    "Technology Vendors",
    "Innovation Teams"
  ],
  "vpanes_scoring": {
    "V_value": 8,
    "P_pain": 7,
    "A_adoption": 9,
    "N_network": 7,
    "E_ease": 7,
    "S_strategic": 8,
    "priority_score": 7.8,
    "priority_rank": 9
  },
  "priority_score": 7.8,
  "priority_rank": 9
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P040: Medical Affairs Project Manager (Priority Rank: 22, Score: 6.75)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Project Manager',
        'medical-affairs-project-manager',
        'Medical Affairs Project Manager',
        'Cross-Functional',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P040",
  "persona_number": 40,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Cross-Functional",
  "function": "Medical Affairs - Project Management",
  "org_type": "Pharma / Biotech",
  "org_size": "200-20,000+ employees | $200M-$20B+ revenue",
  "budget_auth": "$100K - $500K (project budgets)",
  "team_size": "0 (matrix management)",
  "key_need": "Project management software, collaboration tools, timeline tracking, resource management, stakeholder communication",
  "decision_cycle": "2-6 months (PM tools)",
  "reports_to": "Medical Affairs Operations Manager / Medical Director",
  "geographic_scope": "Global / Regional / Project-Specific",
  "typical_background": "PMP or equivalent with 3-10 years pharma project management experience",
  "key_stakeholders": [
    "Medical Affairs Operations",
    "Cross-Functional Teams",
    "Medical Directors",
    "Vendors",
    "Stakeholders"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 6,
    "E_ease": 8,
    "S_strategic": 6,
    "priority_score": 6.75,
    "priority_rank": 22
  },
  "priority_score": 6.75,
  "priority_rank": 22
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P041: Medical Affairs Data Analyst (Priority Rank: 15, Score: 7.1)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Data Analyst',
        'medical-affairs-data-analyst',
        'Medical Affairs Data Analyst',
        'Cross-Functional',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P041",
  "persona_number": 41,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Cross-Functional",
  "function": "Medical Affairs - Analytics & Insights",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$50K - $200K",
  "team_size": "0-2",
  "key_need": "Analytics platforms, data visualization, predictive modeling, reporting automation, insight generation",
  "decision_cycle": "3-6 months (analytics tools)",
  "reports_to": "Medical Affairs Operations Manager / VP Medical Affairs",
  "geographic_scope": "Global / Regional",
  "typical_background": "MS in Analytics, Statistics, or related field with 2-8 years pharma analytics experience",
  "key_stakeholders": [
    "Medical Affairs Leadership",
    "All Medical Affairs Teams",
    "Data Science",
    "IT",
    "Business Intelligence"
  ],
  "vpanes_scoring": {
    "V_value": 7,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 5,
    "E_ease": 8,
    "S_strategic": 7,
    "priority_score": 7.1,
    "priority_rank": 15
  },
  "priority_score": 7.1,
  "priority_rank": 15
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P042: Medical Affairs Training & Development Manager (Priority Rank: 25, Score: 6.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Training & Development Manager',
        'medical-affairs-training-development-manager',
        'Medical Affairs Training & Development Manager',
        'Cross-Functional',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P042",
  "persona_number": 42,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 2,
  "department": "Cross-Functional",
  "function": "Medical Affairs - Learning & Development",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "2-8",
  "key_need": "LMS platform, competency frameworks, onboarding automation, virtual training tools, assessment systems",
  "decision_cycle": "6-12 months (training platforms)",
  "reports_to": "VP Medical Affairs / HR",
  "geographic_scope": "Global / Regional",
  "typical_background": "Scientific background with 5-12 years training and organizational development experience",
  "key_stakeholders": [
    "VP Medical Affairs",
    "All Medical Affairs Teams",
    "HR/L&D",
    "Medical Excellence",
    "External Trainers"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 7,
    "N_network": 6,
    "E_ease": 7,
    "S_strategic": 6,
    "priority_score": 6.55,
    "priority_rank": 25
  },
  "priority_score": 6.55,
  "priority_rank": 25
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- =====================================================================================
    -- TIER 3 (Supporting): 3 personas
    -- =====================================================================================

    -- P014: Medical Librarian (Priority Rank: 32, Score: 5.95)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Librarian',
        'medical-librarian',
        'Medical Librarian / Information Specialist',
        'Medical Information',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P014",
  "persona_number": 14,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 3,
  "department": "Medical Information",
  "function": "Medical Affairs - Information Services",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$50K - $200K (subscriptions)",
  "team_size": "0-2",
  "key_need": "Literature search automation, database management, citation tools, knowledge curation",
  "decision_cycle": "2-6 months (library systems)",
  "reports_to": "Medical Information Manager / Head of Medical Communications",
  "geographic_scope": "Global",
  "typical_background": "MLS or equivalent with pharma experience, scientific background helpful",
  "key_stakeholders": [
    "Medical Information",
    "Medical Writers",
    "HEOR",
    "Medical Directors",
    "Clinical Development"
  ],
  "vpanes_scoring": {
    "V_value": 5,
    "P_pain": 6,
    "A_adoption": 7,
    "N_network": 4,
    "E_ease": 8,
    "S_strategic": 6,
    "priority_score": 5.95,
    "priority_rank": 32
  },
  "priority_score": 5.95,
  "priority_rank": 32
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P030: Clinical Data Manager (Priority Rank: 25, Score: 6.55)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Clinical Data Manager',
        'clinical-data-manager',
        'Clinical Data Manager',
        'Clinical Operations',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P030",
  "persona_number": 30,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 3,
  "department": "Clinical Operations",
  "function": "Medical Affairs - Clinical Data Management",
  "org_type": "Pharma / Biotech / CRO",
  "org_size": "100-20,000+ employees | $100M-$20B+ revenue",
  "budget_auth": "$50K - $200K",
  "team_size": "0-3",
  "key_need": "EDC systems, data cleaning automation, quality control tools, database lock procedures",
  "decision_cycle": "3-9 months (data management systems)",
  "reports_to": "Clinical Operations Manager / Biostatistics",
  "geographic_scope": "Global",
  "typical_background": "Life sciences degree with 2-10 years clinical data management experience",
  "key_stakeholders": [
    "Clinical Operations",
    "Biostatistics",
    "Medical Monitors",
    "CROs",
    "Investigators",
    "IT"
  ],
  "vpanes_scoring": {
    "V_value": 6,
    "P_pain": 7,
    "A_adoption": 8,
    "N_network": 5,
    "E_ease": 7,
    "S_strategic": 6,
    "priority_score": 6.55,
    "priority_rank": 25
  },
  "priority_score": 6.55,
  "priority_rank": 25
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    -- P043: Medical Affairs Vendor Manager (Priority Rank: 35, Score: 5.8)
    INSERT INTO personas (
        tenant_id, name, slug, title, tagline,
        function_id, seniority_level,
        pain_points, goals, key_responsibilities,
        is_active, validation_status, metadata
    ) VALUES (
        v_tenant_id,
        'Medical Affairs Vendor Manager',
        'medical-affairs-vendor-manager',
        'Medical Affairs Vendor Manager',
        'Cross-Functional',
        v_ma_function_id,
        'mid',
        '[]'::jsonb,
        '[]'::jsonb,
        ARRAY[]::TEXT[],
        true,
        'approved',
        '{
  "persona_id": "P043",
  "persona_number": 43,
  "sector": "Pharmaceutical & Life Sciences",
  "tier": 3,
  "department": "Cross-Functional",
  "function": "Medical Affairs - Vendor & Procurement",
  "org_type": "Pharma / Biotech",
  "org_size": "500-20,000+ employees | $500M-$20B+ revenue",
  "budget_auth": "$200K - $1M",
  "team_size": "1-4",
  "key_need": "Vendor management system, contract management, performance tracking, procurement automation",
  "decision_cycle": "3-9 months (vendor management tools)",
  "reports_to": "Medical Affairs Operations Manager",
  "geographic_scope": "Global / Regional",
  "typical_background": "Business degree with 3-10 years vendor management and pharma experience",
  "key_stakeholders": [
    "Medical Affairs Operations",
    "All Medical Affairs Teams",
    "Procurement",
    "Legal",
    "Finance",
    "Vendors"
  ],
  "vpanes_scoring": {
    "V_value": 5,
    "P_pain": 6,
    "A_adoption": 7,
    "N_network": 5,
    "E_ease": 7,
    "S_strategic": 5,
    "priority_score": 5.8,
    "priority_rank": 35
  },
  "priority_score": 5.8,
  "priority_rank": 35
}'::jsonb
    )
    ON CONFLICT (tenant_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        pain_points = EXCLUDED.pain_points,
        goals = EXCLUDED.goals,
        key_responsibilities = EXCLUDED.key_responsibilities,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    v_count := v_count + 1;

    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'MEDICAL AFFAIRS PERSONAS IMPORT COMPLETE';
    RAISE NOTICE '===============================================================';
    RAISE NOTICE 'Total personas imported: %', v_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Department Breakdown:';
    RAISE NOTICE '  Global Leadership:           6 personas';
    RAISE NOTICE '  Field Medical (MSLs):         5 personas';
    RAISE NOTICE '  Medical Information:          4 personas';
    RAISE NOTICE '  Medical Communications:       7 personas';
    RAISE NOTICE '  Evidence Generation & HEOR:   5 personas';
    RAISE NOTICE '  Clinical Operations:          4 personas';
    RAISE NOTICE '  Medical Excellence:           4 personas';
    RAISE NOTICE '  Medical Strategy:             4 personas';
    RAISE NOTICE '  Cross-Functional:             4 personas';
    RAISE NOTICE '';
    RAISE NOTICE 'Platform resources available for Medical Affairs organizations';
    RAISE NOTICE '===============================================================';

END $$;

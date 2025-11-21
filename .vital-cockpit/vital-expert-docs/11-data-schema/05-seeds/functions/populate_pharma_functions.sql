-- =====================================================================
-- POPULATE PHARMACEUTICAL FUNCTIONS
-- Creates all 14 core pharmaceutical functions with attributes
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING PHARMACEUTICAL FUNCTIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- INSERT FUNCTIONS
-- =====================================================================

-- 1. MEDICAL AFFAIRS
INSERT INTO public.org_functions (
    name, slug, description, mission_statement, 
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Medical Affairs',
    'medical-affairs',
    'Strategic medical and scientific leadership, evidence generation, and healthcare professional engagement',
    'To deliver medical and scientific value through evidence-based insights, strategic HCP engagement, and unbiased medical education that supports optimal patient outcomes',
    'very_high',
    95
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 2. MARKET ACCESS
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Market Access',
    'market-access',
    'Value demonstration, pricing strategy, reimbursement optimization, and patient access programs',
    'To maximize patient access to innovative therapies through evidence-based value demonstration, strategic pricing, and payer/government engagement',
    'high',
    90
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 3. COMMERCIAL ORGANIZATION
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Commercial Organization',
    'commercial-organization',
    'Sales, marketing, brand management, and customer engagement across all channels',
    'To drive sustainable commercial growth through customer-centric strategies, omnichannel engagement, and exceptional customer experience',
    'high',
    92
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 4. REGULATORY AFFAIRS
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Regulatory Affairs',
    'regulatory-affairs',
    'Regulatory strategy, submissions, compliance, and agency interactions for global markets',
    'To enable timely market access and lifecycle management through strategic regulatory planning, compliant submissions, and proactive agency engagement',
    'very_high',
    98
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 5. RESEARCH & DEVELOPMENT (R&D)
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Research & Development (R&D)',
    'research-development',
    'Discovery research, preclinical and clinical development, biometrics, and drug safety',
    'To discover, develop, and deliver innovative therapies through rigorous scientific research, efficient clinical development, and data-driven decision making',
    'very_high',
    100
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 6. MANUFACTURING & SUPPLY CHAIN
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Manufacturing & Supply Chain',
    'manufacturing-supply-chain',
    'Drug manufacturing, quality control/assurance, supply planning, and logistics',
    'To ensure reliable supply of high-quality medicines through efficient manufacturing, rigorous quality systems, and resilient supply chains',
    'very_high',
    94
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 7. FINANCE & ACCOUNTING
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Finance & Accounting',
    'finance-accounting',
    'Financial planning & analysis, accounting operations, treasury, tax, audit, and business partnering',
    'To enable strategic decision making and sustainable growth through robust financial stewardship, accurate reporting, and insightful business partnering',
    'medium',
    85
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 8. HUMAN RESOURCES
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Human Resources',
    'human-resources',
    'Talent acquisition, learning & development, compensation & benefits, HRBP, and organizational development',
    'To attract, develop, and retain exceptional talent through strategic workforce planning, competitive total rewards, and a culture of continuous learning',
    'low',
    75
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 9. INFORMATION TECHNOLOGY (IT) / DIGITAL
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Information Technology (IT) / Digital',
    'information-technology-digital',
    'Enterprise applications, data & analytics, digital health platforms, cloud infrastructure, and cybersecurity',
    'To enable digital transformation and operational excellence through modern technology platforms, data insights, and secure, scalable IT infrastructure',
    'high',
    88
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 10. LEGAL & COMPLIANCE
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Legal & Compliance',
    'legal-compliance',
    'Corporate legal, intellectual property, contracts, regulatory compliance, ethics, and data privacy',
    'To protect the company and enable business objectives through proactive legal counsel, IP strategy, compliant practices, and ethical conduct',
    'very_high',
    90
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 11. CORPORATE COMMUNICATIONS
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Corporate Communications',
    'corporate-communications',
    'External communications, PR, media relations, internal communications, investor relations, and CSR',
    'To build and protect corporate reputation through strategic communications, transparent stakeholder engagement, and responsible corporate citizenship',
    'medium',
    78
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 12. STRATEGIC PLANNING / CORPORATE DEVELOPMENT
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Strategic Planning / Corporate Development',
    'strategic-planning-corporate-development',
    'Corporate strategy, portfolio development, M&A, PMO, and business transformation',
    'To drive long-term value creation through strategic portfolio optimization, disciplined capital allocation, and execution excellence',
    'low',
    82
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 13. BUSINESS INTELLIGENCE / ANALYTICS
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Business Intelligence / Analytics',
    'business-intelligence-analytics',
    'Market insights, data science, advanced analytics, reporting, forecasting, and competitive intelligence',
    'To enable data-driven decision making through actionable insights, predictive analytics, and competitive market intelligence',
    'low',
    80
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 14. PROCUREMENT
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Procurement',
    'procurement',
    'Sourcing, purchasing, vendor management, category management, contracting, and procurement operations',
    'To optimize value and mitigate supply risk through strategic sourcing, vendor partnerships, and efficient procurement operations',
    'medium',
    72
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- 15. FACILITIES / WORKPLACE SERVICES
INSERT INTO public.org_functions (
    name, slug, description, mission_statement,
    regulatory_sensitivity, strategic_priority
) VALUES (
    'Facilities / Workplace Services',
    'facilities-workplace-services',
    'Real estate, site management, EHS, facility operations, security, and sustainability',
    'To provide safe, sustainable, and productive work environments that support business operations and employee wellbeing',
    'high',
    70
) ON CONFLICT (slug) DO UPDATE SET
    description = EXCLUDED.description,
    mission_statement = EXCLUDED.mission_statement,
    regulatory_sensitivity = EXCLUDED.regulatory_sensitivity,
    strategic_priority = EXCLUDED.strategic_priority,
    updated_at = NOW();

-- =====================================================================
-- VERIFICATION
-- =====================================================================

DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count 
    FROM public.org_functions 
    WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'FUNCTIONS CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Functions Created: %', function_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Functions by Regulatory Sensitivity:';
END $$;

SELECT 
    regulatory_sensitivity,
    COUNT(*) as function_count,
    STRING_AGG(name, ', ' ORDER BY strategic_priority DESC) as functions
FROM public.org_functions
WHERE deleted_at IS NULL
GROUP BY regulatory_sensitivity
ORDER BY 
    CASE regulatory_sensitivity
        WHEN 'very_high' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Strategic Priority Rankings:';
END $$;

SELECT 
    name,
    strategic_priority,
    regulatory_sensitivity
FROM public.org_functions
WHERE deleted_at IS NULL
ORDER BY strategic_priority DESC, name;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ All 15 pharmaceutical functions populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run populate_pharma_departments.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;


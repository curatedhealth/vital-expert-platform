-- =====================================================================
-- POPULATE PHARMACEUTICAL DEPARTMENTS
-- Creates 100+ departments mapped to their parent functions
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'POPULATING PHARMACEUTICAL DEPARTMENTS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- HELPER FUNCTION: Insert Department
-- =====================================================================

CREATE OR REPLACE FUNCTION insert_department(
    p_name TEXT,
    p_function_slug TEXT,
    p_description TEXT DEFAULT NULL,
    p_operating_model operating_model_type DEFAULT 'hybrid',
    p_field_office_mix INTEGER DEFAULT 50
) RETURNS UUID AS $$
DECLARE
    v_function_id UUID;
    v_dept_id UUID;
    v_slug TEXT;
BEGIN
    -- Get function ID
    SELECT id INTO v_function_id
    FROM public.org_functions
    WHERE slug = p_function_slug AND deleted_at IS NULL;
    
    IF v_function_id IS NULL THEN
        RAISE EXCEPTION 'Function not found: %', p_function_slug;
    END IF;
    
    -- Generate slug
    v_slug := generate_slug(p_name);
    
    -- Insert or update department
    INSERT INTO public.org_departments (
        name, slug, description, function_id,
        operating_model, field_vs_office_mix
    ) VALUES (
        p_name, v_slug, p_description, v_function_id,
        p_operating_model, p_field_office_mix
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        function_id = EXCLUDED.function_id,
        operating_model = EXCLUDED.operating_model,
        field_vs_office_mix = EXCLUDED.field_vs_office_mix,
        updated_at = NOW()
    RETURNING id INTO v_dept_id;
    
    RETURN v_dept_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. MEDICAL AFFAIRS DEPARTMENTS (9 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Medical Affairs departments...'; END $$;

SELECT insert_department('Field Medical', 'medical-affairs', 
    'MSL teams, KOL engagement, and field-based scientific support', 
    'decentralized', 90);

SELECT insert_department('Medical Information Services', 'medical-affairs',
    'Medical inquiry response, content management, and information dissemination',
    'centralized', 10);

SELECT insert_department('Scientific Communications', 'medical-affairs',
    'Medical writing, congress support, and scientific messaging',
    'hybrid', 30);

SELECT insert_department('Medical Education', 'medical-affairs',
    'HCP education, training programs, and educational content development',
    'hybrid', 40);

SELECT insert_department('HEOR & Evidence', 'medical-affairs',
    'Health economics, outcomes research, and real-world evidence generation',
    'centralized', 20);

SELECT insert_department('Publications', 'medical-affairs',
    'Publication planning, manuscript development, and authorship coordination',
    'centralized', 15);

SELECT insert_department('Medical Leadership', 'medical-affairs',
    'Medical Affairs executive leadership and strategic direction',
    'centralized', 25);

SELECT insert_department('Clinical Operations Support', 'medical-affairs',
    'Medical monitoring, safety oversight, and clinical trial medical support',
    'hybrid', 35);

SELECT insert_department('Medical Excellence & Compliance', 'medical-affairs',
    'Quality assurance, compliance oversight, and medical governance',
    'centralized', 10);

-- =====================================================================
-- 2. MARKET ACCESS DEPARTMENTS (10 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Market Access departments...'; END $$;

SELECT insert_department('Leadership & Strategy', 'market-access',
    'Market access executive leadership and strategic planning',
    'centralized', 20);

SELECT insert_department('HEOR (Health Economics & Outcomes Research)', 'market-access',
    'Economic modeling, outcomes research, and value evidence generation',
    'centralized', 15);

SELECT insert_department('Value, Evidence & Outcomes', 'market-access',
    'Value dossiers, evidence synthesis, and HTA support',
    'centralized', 20);

SELECT insert_department('Pricing & Reimbursement', 'market-access',
    'Global pricing strategy, reimbursement optimization, and HTA navigation',
    'hybrid', 40);

SELECT insert_department('Payer Relations & Contracting', 'market-access',
    'Payer engagement, contract negotiations, and access agreements',
    'hybrid', 60);

SELECT insert_department('Patient Access & Services', 'market-access',
    'Patient support programs, affordability initiatives, and access navigation',
    'hybrid', 50);

SELECT insert_department('Government & Policy Affairs', 'market-access',
    'Government relations, policy advocacy, and public affairs',
    'hybrid', 45);

SELECT insert_department('Trade & Distribution', 'market-access',
    'Channel strategy, wholesale relationships, and distribution management',
    'hybrid', 55);

SELECT insert_department('Analytics & Insights', 'market-access',
    'Access analytics, market insights, and data science',
    'centralized', 10);

SELECT insert_department('Operations & Excellence', 'market-access',
    'Market access operations, process excellence, and capability building',
    'centralized', 15);

-- =====================================================================
-- 3. COMMERCIAL ORGANIZATION DEPARTMENTS (11 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Commercial Organization departments...'; END $$;

SELECT insert_department('Commercial Leadership & Strategy', 'commercial-organization',
    'Commercial executive leadership and strategic planning',
    'centralized', 20);

SELECT insert_department('Field Sales Operations', 'commercial-organization',
    'Territory-based sales force, sales management, and field operations',
    'decentralized', 95);

SELECT insert_department('Specialty & Hospital Sales', 'commercial-organization',
    'Hospital accounts, specialty channels, and institutional sales',
    'decentralized', 80);

SELECT insert_department('Key Account Management', 'commercial-organization',
    'National accounts, IDN/GPO relationships, and strategic account management',
    'hybrid', 65);

SELECT insert_department('Customer Experience', 'commercial-organization',
    'Customer journey, CX programs, and customer success management',
    'hybrid', 40);

SELECT insert_department('Commercial Marketing', 'commercial-organization',
    'Brand management, product marketing, and lifecycle marketing',
    'centralized', 25);

SELECT insert_department('Business Development & Licensing', 'commercial-organization',
    'BD strategy, licensing, acquisitions, and partnership development',
    'centralized', 30);

SELECT insert_department('Commercial Analytics & Insights', 'commercial-organization',
    'Sales analytics, forecasting, business insights, and data science',
    'centralized', 5);

SELECT insert_department('Sales Training & Enablement', 'commercial-organization',
    'Sales training, learning programs, and sales enablement',
    'hybrid', 35);

SELECT insert_department('Digital & Omnichannel Engagement', 'commercial-organization',
    'Digital engagement, CRM, multichannel orchestration, and remote sales',
    'centralized', 20);

SELECT insert_department('Compliance & Commercial Operations', 'commercial-organization',
    'Commercial compliance, operations management, and governance',
    'centralized', 10);

-- =====================================================================
-- 4. REGULATORY AFFAIRS DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Regulatory Affairs departments...'; END $$;

SELECT insert_department('Regulatory Leadership & Strategy', 'regulatory-affairs',
    'Regulatory executive leadership and strategic regulatory planning',
    'centralized', 15);

SELECT insert_department('Regulatory Submissions & Operations', 'regulatory-affairs',
    'Submission management, regulatory writing, publishing, and coordination',
    'centralized', 10);

SELECT insert_department('Regulatory Intelligence & Policy', 'regulatory-affairs',
    'Regulatory intelligence, policy analysis, and landscape monitoring',
    'centralized', 20);

SELECT insert_department('CMC Regulatory Affairs', 'regulatory-affairs',
    'Chemistry, Manufacturing & Controls regulatory support',
    'centralized', 15);

SELECT insert_department('Global Regulatory Affairs', 'regulatory-affairs',
    'Regional regulatory affairs (US, EU, APAC, LatAm) and global coordination',
    'hybrid', 35);

SELECT insert_department('Regulatory Compliance & Systems', 'regulatory-affairs',
    'Regulatory compliance, labeling, and regulatory systems management',
    'centralized', 10);

-- =====================================================================
-- 5. RESEARCH & DEVELOPMENT DEPARTMENTS (8 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Research & Development departments...'; END $$;

SELECT insert_department('Discovery Research', 'research-development',
    'Target identification, lead discovery, and early-stage research',
    'centralized', 5);

SELECT insert_department('Translational Science', 'research-development',
    'Translational research, biomarker development, and proof-of-concept studies',
    'centralized', 10);

SELECT insert_department('Preclinical Development', 'research-development',
    'Preclinical studies, toxicology, and IND-enabling activities',
    'centralized', 15);

SELECT insert_department('Clinical Development', 'research-development',
    'Clinical trial design, execution, and clinical program management',
    'hybrid', 40);

SELECT insert_department('Biometrics & Data Management', 'research-development',
    'Biostatistics, data management, statistical programming, and data analytics',
    'centralized', 5);

SELECT insert_department('Clinical Operations', 'research-development',
    'Clinical trial operations, site management, and trial execution',
    'decentralized', 70);

SELECT insert_department('Pharmacovigilance & Drug Safety', 'research-development',
    'Safety surveillance, pharmacovigilance operations, and risk management',
    'centralized', 15);

SELECT insert_department('Project & Portfolio Management', 'research-development',
    'R&D portfolio management, project leadership, and program governance',
    'centralized', 20);

-- =====================================================================
-- 6. MANUFACTURING & SUPPLY CHAIN DEPARTMENTS (6 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Manufacturing & Supply Chain departments...'; END $$;

SELECT insert_department('Technical Operations', 'manufacturing-supply-chain',
    'Manufacturing technical operations and process management',
    'centralized', 25);

SELECT insert_department('Manufacturing (Small Molecule/Biotech)', 'manufacturing-supply-chain',
    'Drug substance and drug product manufacturing operations',
    'centralized', 15);

SELECT insert_department('Quality Assurance / Quality Control', 'manufacturing-supply-chain',
    'Quality assurance, quality control, and compliance',
    'centralized', 10);

SELECT insert_department('Supply Chain & Logistics', 'manufacturing-supply-chain',
    'Supply planning, logistics, and distribution management',
    'hybrid', 45);

SELECT insert_department('Process Engineering', 'manufacturing-supply-chain',
    'Process development, engineering, and optimization',
    'centralized', 15);

SELECT insert_department('External Manufacturing Management', 'manufacturing-supply-chain',
    'CMO/CDMO management and external manufacturing oversight',
    'hybrid', 50);

-- =====================================================================
-- 7. FINANCE & ACCOUNTING DEPARTMENTS (6 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Finance & Accounting departments...'; END $$;

SELECT insert_department('Financial Planning & Analysis (FP&A)', 'finance-accounting',
    'Financial planning, budgeting, forecasting, and business analysis',
    'centralized', 10);

SELECT insert_department('Accounting Operations (GL/AP/AR)', 'finance-accounting',
    'General ledger, accounts payable/receivable, and transactional accounting',
    'centralized', 5);

SELECT insert_department('Treasury & Cash Management', 'finance-accounting',
    'Treasury operations, cash management, and liquidity planning',
    'centralized', 5);

SELECT insert_department('Tax Planning & Compliance', 'finance-accounting',
    'Tax strategy, compliance, and tax reporting',
    'centralized', 10);

SELECT insert_department('Internal Audit & Controls', 'finance-accounting',
    'Internal audit, controls testing, and risk assurance',
    'hybrid', 30);

SELECT insert_department('Business/Commercial Finance', 'finance-accounting',
    'Finance business partnering and commercial finance support',
    'hybrid', 35);

-- =====================================================================
-- 8. HUMAN RESOURCES DEPARTMENTS (6 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Human Resources departments...'; END $$;

SELECT insert_department('Talent Acquisition & Recruitment', 'human-resources',
    'Recruiting, talent sourcing, and hiring operations',
    'hybrid', 40);

SELECT insert_department('Learning & Development', 'human-resources',
    'Training programs, leadership development, and learning platforms',
    'hybrid', 30);

SELECT insert_department('Total Rewards (Comp & Benefits)', 'human-resources',
    'Compensation strategy, benefits administration, and total rewards',
    'centralized', 10);

SELECT insert_department('HR Business Partners', 'human-resources',
    'HR business partnering, employee relations, and workforce planning',
    'hybrid', 50);

SELECT insert_department('Organizational Development', 'human-resources',
    'Org design, change management, and talent management',
    'hybrid', 35);

SELECT insert_department('HR Operations & Services', 'human-resources',
    'HRIS, HR operations, and employee services',
    'centralized', 10);

-- =====================================================================
-- 9. IT / DIGITAL DEPARTMENTS (6 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Information Technology departments...'; END $$;

SELECT insert_department('Enterprise Applications & ERP', 'information-technology-digital',
    'ERP systems, enterprise applications, and business systems',
    'centralized', 15);

SELECT insert_department('Data & Analytics', 'information-technology-digital',
    'Data platforms, analytics, data science, and business intelligence',
    'centralized', 10);

SELECT insert_department('Digital Health & Platforms', 'information-technology-digital',
    'Digital health solutions, patient platforms, and digital innovation',
    'hybrid', 30);

SELECT insert_department('IT Infrastructure & Cloud', 'information-technology-digital',
    'Cloud infrastructure, data centers, and IT infrastructure',
    'centralized', 10);

SELECT insert_department('Cybersecurity', 'information-technology-digital',
    'Information security, cybersecurity operations, and security governance',
    'centralized', 15);

SELECT insert_department('End User Services & Support', 'information-technology-digital',
    'End user support, service desk, and workplace technology',
    'hybrid', 40);

-- =====================================================================
-- 10. LEGAL & COMPLIANCE DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Legal & Compliance departments...'; END $$;

SELECT insert_department('Corporate Legal', 'legal-compliance',
    'Corporate law, M&A legal support, and general counsel',
    'centralized', 20);

SELECT insert_department('Intellectual Property (IP)', 'legal-compliance',
    'Patent strategy, IP protection, and IP portfolio management',
    'centralized', 15);

SELECT insert_department('Contract Management', 'legal-compliance',
    'Contract review, negotiation, and contract lifecycle management',
    'hybrid', 30);

SELECT insert_department('Regulatory & Ethics Compliance', 'legal-compliance',
    'Compliance programs, ethics, anti-corruption, and regulatory compliance',
    'hybrid', 35);

SELECT insert_department('Privacy & Data Protection', 'legal-compliance',
    'Data privacy, GDPR compliance, and privacy programs',
    'centralized', 15);

-- =====================================================================
-- 11. CORPORATE COMMUNICATIONS DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Corporate Communications departments...'; END $$;

SELECT insert_department('External Communications & PR', 'corporate-communications',
    'Public relations, external communications, and media strategy',
    'hybrid', 40);

SELECT insert_department('Internal Communications', 'corporate-communications',
    'Employee communications, internal engagement, and change communications',
    'hybrid', 30);

SELECT insert_department('Media Relations', 'corporate-communications',
    'Media relations, press office, and spokesperson support',
    'hybrid', 45);

SELECT insert_department('Investor Relations', 'corporate-communications',
    'Investor communications, earnings support, and investor engagement',
    'centralized', 20);

SELECT insert_department('Corporate Social Responsibility (CSR)', 'corporate-communications',
    'CSR programs, sustainability, and corporate citizenship',
    'hybrid', 35);

-- =====================================================================
-- 12. STRATEGIC PLANNING / CORP DEV DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Strategic Planning departments...'; END $$;

SELECT insert_department('Corporate Strategy', 'strategic-planning-corporate-development',
    'Corporate strategy, strategic planning, and long-range planning',
    'centralized', 10);

SELECT insert_department('Business / Portfolio Development', 'strategic-planning-corporate-development',
    'Portfolio strategy, business development, and asset prioritization',
    'centralized', 15);

SELECT insert_department('Mergers & Acquisitions (M&A)', 'strategic-planning-corporate-development',
    'M&A strategy, deal execution, and integration management',
    'centralized', 20);

SELECT insert_department('Project Management Office (PMO)', 'strategic-planning-corporate-development',
    'Enterprise PMO, project governance, and portfolio management',
    'hybrid', 30);

SELECT insert_department('Foresight & Transformation', 'strategic-planning-corporate-development',
    'Future trends, scenario planning, and business transformation',
    'centralized', 15);

-- =====================================================================
-- 13. BUSINESS INTELLIGENCE / ANALYTICS DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Business Intelligence departments...'; END $$;

SELECT insert_department('Market Insights & Research', 'business-intelligence-analytics',
    'Market research, insights, and customer intelligence',
    'centralized', 20);

SELECT insert_department('Data Science & Advanced Analytics', 'business-intelligence-analytics',
    'Predictive analytics, machine learning, and advanced modeling',
    'centralized', 5);

SELECT insert_department('Reporting & Dashboards', 'business-intelligence-analytics',
    'Business reporting, dashboards, and visualization',
    'centralized', 10);

SELECT insert_department('Forecasting & Modeling', 'business-intelligence-analytics',
    'Demand forecasting, financial modeling, and predictive modeling',
    'centralized', 10);

SELECT insert_department('Competitive Intelligence', 'business-intelligence-analytics',
    'Competitive analysis, market intelligence, and landscape monitoring',
    'centralized', 15);

-- =====================================================================
-- 14. PROCUREMENT DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Procurement departments...'; END $$;

SELECT insert_department('Sourcing & Purchasing', 'procurement',
    'Strategic sourcing, purchasing, and supplier selection',
    'hybrid', 30);

SELECT insert_department('Vendor & Supplier Management', 'procurement',
    'Supplier relationship management and vendor performance',
    'hybrid', 35);

SELECT insert_department('Category Management', 'procurement',
    'Category strategy, spend analysis, and category leadership',
    'hybrid', 30);

SELECT insert_department('Contracting & Negotiations', 'procurement',
    'Contract negotiation, procurement contracts, and supplier agreements',
    'hybrid', 25);

SELECT insert_department('Procurement Operations', 'procurement',
    'Procurement operations, P2P process, and procurement systems',
    'centralized', 15);

-- =====================================================================
-- 15. FACILITIES / WORKPLACE SERVICES DEPARTMENTS (5 departments)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE 'Creating Facilities departments...'; END $$;

SELECT insert_department('Real Estate & Site Management', 'facilities-workplace-services',
    'Real estate portfolio, site management, and facilities planning',
    'hybrid', 40);

SELECT insert_department('Environmental Health & Safety (EHS)', 'facilities-workplace-services',
    'EHS programs, safety compliance, and environmental management',
    'hybrid', 35);

SELECT insert_department('Facility Operations & Maintenance', 'facilities-workplace-services',
    'Facility operations, maintenance, and building services',
    'decentralized', 70);

SELECT insert_department('Security & Emergency Planning', 'facilities-workplace-services',
    'Physical security, emergency response, and business continuity',
    'hybrid', 50);

SELECT insert_department('Sustainability Initiatives', 'facilities-workplace-services',
    'Sustainability programs, green initiatives, and environmental stewardship',
    'centralized', 20);

-- =====================================================================
-- CLEANUP & VERIFICATION
-- =====================================================================

DROP FUNCTION IF EXISTS insert_department(TEXT, TEXT, TEXT, operating_model_type, INTEGER);

DO $$
DECLARE
    dept_count INTEGER;
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dept_count 
    FROM public.org_departments 
    WHERE deleted_at IS NULL;
    
    SELECT COUNT(*) INTO func_count 
    FROM public.org_functions 
    WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DEPARTMENTS CREATED SUCCESSFULLY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Departments Created: %', dept_count;
    RAISE NOTICE 'Total Functions: %', func_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Departments per Function:';
END $$;

SELECT 
    f.name as function_name,
    COUNT(d.id) as department_count,
    STRING_AGG(d.name, ', ' ORDER BY d.name) as departments
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.deleted_at IS NULL
WHERE f.deleted_at IS NULL
GROUP BY f.name, f.strategic_priority
ORDER BY f.strategic_priority DESC;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ All pharmaceutical departments populated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run populate_pharma_roles.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;


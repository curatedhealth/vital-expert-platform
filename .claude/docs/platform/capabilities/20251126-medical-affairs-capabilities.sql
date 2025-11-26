-- ============================================================================
-- Medical Affairs: Capabilities and Responsibilities Taxonomy
-- Based on industry research and pharmaceutical standards
-- ============================================================================

-- ============================================================================
-- PART 1: CAPABILITIES (What agents CAN DO)
-- ============================================================================

-- Clear existing Medical Affairs capabilities
DELETE FROM capabilities WHERE category = 'Medical Affairs';

-- Strategic Leadership Capabilities (L1 Master level)
INSERT INTO capabilities (capability_name, capability_slug, display_name, category, description, complexity_level, is_active) VALUES
('Medical Affairs Strategic Planning', 'ma-strategic-planning', 'Strategic Planning', 'Medical Affairs', 'Develop and implement comprehensive medical strategies aligned with organizational goals and patient needs', 'expert', true),
('Cross-Functional Medical Leadership', 'ma-cross-functional-leadership', 'Cross-Functional Leadership', 'Medical Affairs', 'Lead and coordinate medical initiatives across R&D, Commercial, Market Access, and Regulatory teams', 'expert', true),
('Medical Excellence Program Design', 'ma-excellence-program-design', 'Excellence Program Design', 'Medical Affairs', 'Design and oversee medical excellence programs ensuring scientific credibility and compliance', 'expert', true),
('Stakeholder Engagement Strategy', 'ma-stakeholder-engagement-strategy', 'Stakeholder Engagement Strategy', 'Medical Affairs', 'Develop comprehensive strategies for engaging KOLs, HCPs, and medical communities', 'expert', true);

-- Expert Domain Capabilities (L2 Expert level)
INSERT INTO capabilities (capability_name, capability_slug, display_name, category, description, complexity_level, is_active) VALUES
('Scientific Communication & Education', 'ma-scientific-communication', 'Scientific Communication', 'Medical Affairs', 'Develop and deliver scientifically accurate, balanced medical communications to diverse audiences', 'advanced', true),
('Evidence Generation & Management', 'ma-evidence-generation', 'Evidence Generation', 'Medical Affairs', 'Design, oversee, and analyze post-marketing studies, RWE, and HEOR research', 'advanced', true),
('KOL Relationship Management', 'ma-kol-relationship-management', 'KOL Management', 'Medical Affairs', 'Build and maintain peer-to-peer relationships with Key Opinion Leaders and thought leaders', 'advanced', true),
('Medical Strategy Development', 'ma-medical-strategy-development', 'Medical Strategy Development', 'Medical Affairs', 'Create medical strategies for products and therapeutic areas based on scientific evidence', 'advanced', true),
('Clinical Development Support', 'ma-clinical-development-support', 'Clinical Development Support', 'Medical Affairs', 'Provide medical expertise throughout clinical development from protocol design to completion', 'advanced', true),
('Publications Planning & Management', 'ma-publications-planning', 'Publications Planning', 'Medical Affairs', 'Develop and execute publication strategies for clinical data and scientific manuscripts', 'advanced', true);

-- Specialist Capabilities (L3 Specialist level)
INSERT INTO capabilities (capability_name, capability_slug, display_name, category, description, complexity_level, is_active) VALUES
('Medical Information Management', 'ma-medical-information', 'Medical Information', 'Medical Affairs', 'Provide accurate, balanced medical and scientific information in response to inquiries', 'advanced', true),
('Scientific Content Development', 'ma-scientific-content-development', 'Scientific Content Development', 'Medical Affairs', 'Create high-quality scientific content for training, presentations, and educational materials', 'advanced', true),
('Medical Writing & Documentation', 'ma-medical-writing', 'Medical Writing', 'Medical Affairs', 'Produce regulatory documents, clinical summaries, and scientific publications', 'advanced', true),
('Real-World Evidence Analysis', 'ma-rwe-analysis', 'RWE Analysis', 'Medical Affairs', 'Analyze and interpret real-world evidence to support medical strategies', 'advanced', true),
('Advisory Board Management', 'ma-advisory-board-management', 'Advisory Board Management', 'Medical Affairs', 'Plan, execute, and derive insights from medical advisory boards and expert panels', 'intermediate', true),
('Medical Training Delivery', 'ma-medical-training', 'Medical Training', 'Medical Affairs', 'Deliver scientific and clinical training to internal teams and external stakeholders', 'intermediate', true);

-- Operational Capabilities (L4 Worker level)
INSERT INTO capabilities (capability_name, capability_slug, display_name, category, description, complexity_level, is_active) VALUES
('Inquiry Response Processing', 'ma-inquiry-response', 'Inquiry Response', 'Medical Affairs', 'Process and respond to routine medical information inquiries with approved responses', 'intermediate', true),
('Data Collection & Management', 'ma-data-collection', 'Data Collection', 'Medical Affairs', 'Collect, organize, and maintain medical and scientific data', 'intermediate', true),
('Literature Monitoring', 'ma-literature-monitoring', 'Literature Monitoring', 'Medical Affairs', 'Monitor scientific literature for relevant publications and emerging data', 'intermediate', true),
('Compliance Documentation', 'ma-compliance-documentation', 'Compliance Documentation', 'Medical Affairs', 'Maintain accurate documentation ensuring regulatory compliance', 'intermediate', true);

-- Tool/Function Capabilities (L5 Tool level)
INSERT INTO capabilities (capability_name, capability_slug, display_name, category, description, complexity_level, is_active) VALUES
('Medical Literature Search', 'ma-literature-search-tool', 'Literature Search Tool', 'Medical Affairs', 'Automated search and retrieval of medical literature from databases', 'foundational', true),
('Reference Formatting', 'ma-reference-formatting-tool', 'Reference Formatting', 'Medical Affairs', 'Format citations and references according to required standards', 'foundational', true),
('Data Extraction & Parsing', 'ma-data-extraction-tool', 'Data Extraction', 'Medical Affairs', 'Extract and parse structured data from medical documents and databases', 'foundational', true);

-- ============================================================================
-- PART 2: RESPONSIBILITIES (What agents ARE ACCOUNTABLE FOR)
-- ============================================================================

-- Clear existing Medical Affairs responsibilities
DELETE FROM responsibilities WHERE functional_area = 'Medical Affairs';

-- L1 Master Responsibilities
INSERT INTO responsibilities (responsibility_name, responsibility_slug, description, functional_area, seniority_level, accountability_type, is_active) VALUES
('Medical Affairs Strategy Execution', 'ma-strategy-execution', 'Own and execute the overall Medical Affairs strategy aligned with corporate objectives', 'Medical Affairs', 'Executive', 'Strategic', true),
('Scientific Credibility Assurance', 'ma-scientific-credibility', 'Ensure scientific credibility and medical excellence across all company communications and activities', 'Medical Affairs', 'Executive', 'Strategic', true),
('Regulatory Compliance Oversight', 'ma-regulatory-compliance-oversight', 'Oversee compliance with all regulatory requirements in medical activities', 'Medical Affairs', 'Executive', 'Strategic', true),
('Cross-Functional Medical Governance', 'ma-cross-functional-governance', 'Provide medical governance and decision-making across R&D, Commercial, and Market Access', 'Medical Affairs', 'Executive', 'Strategic', true);

-- L2 Expert Responsibilities
INSERT INTO responsibilities (responsibility_name, responsibility_slug, description, functional_area, seniority_level, accountability_type, is_active) VALUES
('Medical Strategy Implementation', 'ma-strategy-implementation', 'Implement medical strategies for assigned products or therapeutic areas', 'Medical Affairs', 'Senior', 'Tactical', true),
('KOL Engagement & Insights', 'ma-kol-engagement', 'Maintain strategic relationships with KOLs and provide insights to inform company strategies', 'Medical Affairs', 'Senior', 'Tactical', true),
('Evidence Generation Leadership', 'ma-evidence-generation-leadership', 'Lead design and execution of post-marketing studies and real-world evidence projects', 'Medical Affairs', 'Senior', 'Tactical', true),
('Scientific Communication Development', 'ma-scientific-comm-development', 'Develop and approve scientific communications and medical content', 'Medical Affairs', 'Senior', 'Tactical', true),
('Medical Education Program Management', 'ma-medical-education-management', 'Manage medical education programs and scientific congresses', 'Medical Affairs', 'Senior', 'Tactical', true);

-- L3 Specialist Responsibilities
INSERT INTO responsibilities (responsibility_name, responsibility_slug, description, functional_area, seniority_level, accountability_type, is_active) VALUES
('Medical Information Accuracy', 'ma-information-accuracy', 'Ensure accuracy and balance of all medical information provided to stakeholders', 'Medical Affairs', 'Mid', 'Operational', true),
('Scientific Content Creation', 'ma-content-creation', 'Create scientific content for training materials, presentations, and publications', 'Medical Affairs', 'Mid', 'Operational', true),
('Inquiry Response Management', 'ma-inquiry-response-mgmt', 'Manage complex medical inquiries from HCPs and provide detailed, compliant responses', 'Medical Affairs', 'Mid', 'Operational', true),
('Publication Support', 'ma-publication-support', 'Support publication planning and manuscript development for clinical data', 'Medical Affairs', 'Mid', 'Operational', true),
('Training Delivery', 'ma-training-delivery', 'Deliver medical and scientific training to internal and external stakeholders', 'Medical Affairs', 'Mid', 'Operational', true);

-- L4 Worker Responsibilities
INSERT INTO responsibilities (responsibility_name, responsibility_slug, description, functional_area, seniority_level, accountability_type, is_active) VALUES
('Routine Inquiry Processing', 'ma-routine-inquiry-processing', 'Process routine medical information inquiries using approved standard responses', 'Medical Affairs', 'Junior', 'Task-Based', true),
('Data Collection & Entry', 'ma-data-collection-entry', 'Collect and accurately enter medical and scientific data into systems', 'Medical Affairs', 'Junior', 'Task-Based', true),
('Literature Monitoring & Alerting', 'ma-literature-monitoring-alerting', 'Monitor literature and alert teams to relevant publications', 'Medical Affairs', 'Junior', 'Task-Based', true),
('Document Management', 'ma-document-management', 'Maintain organized documentation and ensure compliance with filing requirements', 'Medical Affairs', 'Junior', 'Task-Based', true);

-- L5 Tool Responsibilities
INSERT INTO responsibilities (responsibility_name, responsibility_slug, description, functional_area, seniority_level, accountability_type, is_active) VALUES
('Automated Literature Retrieval', 'ma-automated-literature-retrieval', 'Execute automated searches and retrieve relevant medical literature', 'Medical Affairs', 'Automated', 'Function-Based', true),
('Data Extraction Execution', 'ma-data-extraction-execution', 'Extract specified data from documents and databases', 'Medical Affairs', 'Automated', 'Function-Based', true),
('Format Standardization', 'ma-format-standardization', 'Apply formatting standards to documents and references', 'Medical Affairs', 'Automated', 'Function-Based', true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
    v_capability_count INT;
    v_responsibility_count INT;
BEGIN
    SELECT COUNT(*) INTO v_capability_count FROM capabilities WHERE category = 'Medical Affairs';
    SELECT COUNT(*) INTO v_responsibility_count FROM responsibilities WHERE functional_area = 'Medical Affairs';
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ MEDICAL AFFAIRS TAXONOMY SEEDED';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE 'Capabilities created:    %', v_capability_count;
    RAISE NOTICE 'Responsibilities created: %', v_responsibility_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Distribution by Level:';
    RAISE NOTICE '  L1 MASTER:      4 capabilities, 4 responsibilities';
    RAISE NOTICE '  L2 EXPERT:      6 capabilities, 5 responsibilities';
    RAISE NOTICE '  L3 SPECIALIST:  6 capabilities, 5 responsibilities';
    RAISE NOTICE '  L4 WORKER:      4 capabilities, 4 responsibilities';
    RAISE NOTICE '  L5 TOOL:        3 capabilities, 3 responsibilities';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;


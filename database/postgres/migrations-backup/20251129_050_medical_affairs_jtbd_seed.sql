-- =====================================================
-- MIGRATION: 050 - Medical Affairs JTBDs Seed
-- Date: 2025-11-29
-- Description: Comprehensive JTBDs for Medical Affairs function
-- Covers: Medical Leadership, Field Medical (MSL), Medical Information,
--         Medical Education, Publications, Medical Strategy, Medical Ops
-- =====================================================

-- Default tenant for pharma JTBDs
-- Using the Vital System tenant for generic pharma JTBDs
DO $$
DECLARE
  v_tenant_id UUID := 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'; -- Pharma tenant
BEGIN

-- =====================================================
-- SECTION 1: MEDICAL LEADERSHIP JTBDs
-- (CMO, VP Medical Affairs, Medical Directors)
-- =====================================================

-- JTBD-MA-L001: Strategic Medical Planning
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-L001', 'Develop Integrated Medical Strategy',
   'When aligning medical affairs activities with corporate objectives and product lifecycle needs, I want to develop a comprehensive medical strategy that integrates scientific evidence generation, medical education, and field medical activities, so I can maximize the medical contribution to commercial success while maintaining scientific integrity.',
   'Medical Affairs', 'strategic', 'very_high', 'annually', 'active', 0.90,
   'strategic', 'mixed', 'high', 'high', 'high', 'L2_panel')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-L002: Medical Governance
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-L002', 'Establish Medical Governance Framework',
   'When ensuring compliance with regulations and ethical standards across all medical activities, I want to establish and maintain a robust medical governance framework with clear policies and oversight mechanisms, so I can protect the organization from regulatory and reputational risks while enabling efficient operations.',
   'Medical Affairs', 'strategic', 'high', 'quarterly', 'active', 0.88,
   'strategic', 'structured', 'high', 'high', 'very_high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-L003: Medical Budget Optimization
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-L003', 'Optimize Medical Affairs Budget Allocation',
   'When allocating limited resources across competing medical priorities, I want to analyze ROI of medical activities and prioritize investments based on strategic impact, so I can maximize the value delivered by medical affairs while staying within budget constraints.',
   'Medical Affairs', 'operational', 'high', 'quarterly', 'active', 0.85,
   'operational', 'structured', 'standard', 'high', 'medium', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-L004: Cross-Functional Medical Alignment
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-L004', 'Coordinate Cross-Functional Medical Initiatives',
   'When medical insights need to inform commercial, regulatory, and R&D decisions, I want to establish effective cross-functional collaboration mechanisms and communication channels, so I can ensure medical perspectives are appropriately integrated into key business decisions.',
   'Medical Affairs', 'strategic', 'high', 'monthly', 'active', 0.87,
   'strategic', 'mixed', 'high', 'high', 'medium', 'L2_panel')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-L005: Medical Team Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-L005', 'Build High-Performing Medical Affairs Team',
   'When building organizational capability in medical affairs, I want to recruit, develop, and retain top medical talent with the right mix of scientific expertise and business acumen, so I can build a world-class medical affairs function that drives competitive advantage.',
   'Medical Affairs', 'operational', 'medium', 'quarterly', 'active', 0.82,
   'operational', 'mixed', 'standard', 'medium', 'low', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 2: FIELD MEDICAL (MSL) JTBDs
-- (MSL Directors, MSL Managers, MSLs)
-- =====================================================

-- JTBD-MA-FM001: KOL Engagement Strategy
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM001', 'Develop Strategic KOL Engagement Plan',
   'When building relationships with key opinion leaders in our therapeutic areas, I want to develop and execute a comprehensive KOL engagement strategy that identifies, prioritizes, and engages the right scientific leaders, so I can build trusted scientific partnerships that advance medical understanding and support appropriate product use.',
   'Medical Affairs', 'strategic', 'high', 'quarterly', 'active', 0.92,
   'strategic', 'mixed', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM002: Scientific Exchange Preparation
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM002', 'Prepare for Scientific Exchange with HCPs',
   'When preparing for scientific discussions with healthcare professionals, I want to synthesize the latest clinical evidence, competitive intelligence, and medical insights relevant to their interests and patient population, so I can have meaningful, personalized scientific exchanges that address their specific clinical questions.',
   'Medical Affairs', 'operational', 'medium', 'daily', 'active', 0.90,
   'operational', 'flexible', 'standard', 'medium', 'high', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM003: Field Medical Insights Collection
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM003', 'Capture and Report Field Medical Insights',
   'When gathering medical insights from HCP interactions and scientific meetings, I want to systematically capture, categorize, and communicate actionable insights to relevant stakeholders, so I can ensure field intelligence informs medical strategy and business decisions.',
   'Medical Affairs', 'operational', 'medium', 'weekly', 'active', 0.88,
   'operational', 'structured', 'standard', 'high', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM004: Territory Strategic Planning
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM004', 'Optimize MSL Territory Coverage',
   'When planning field medical activities across my territory, I want to analyze HCP landscape, prioritize engagement opportunities, and optimize my call plan, so I can maximize the scientific impact of my field activities while meeting coverage targets.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.85,
   'operational', 'structured', 'standard', 'medium', 'low', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM005: Investigator-Initiated Trial Support
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM005', 'Evaluate Investigator-Initiated Trial Proposals',
   'When receiving investigator-initiated trial (IIT) proposals from researchers, I want to evaluate scientific merit, strategic alignment, and feasibility of proposed studies, so I can identify and support high-value research that advances medical knowledge and addresses evidence gaps.',
   'Medical Affairs', 'strategic', 'high', 'monthly', 'active', 0.87,
   'strategic', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM006: Congress Scientific Coverage
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM006', 'Provide Medical Congress Coverage',
   'When attending major medical congresses and scientific meetings, I want to capture key scientific developments, competitive intelligence, and emerging treatment paradigms, so I can keep the organization informed of the latest scientific advances and their implications.',
   'Medical Affairs', 'operational', 'medium', 'quarterly', 'active', 0.86,
   'operational', 'flexible', 'standard', 'medium', 'low', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-FM007: Advisory Board Planning
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-FM007', 'Plan and Execute Medical Advisory Boards',
   'When seeking expert input on medical strategy and scientific questions, I want to design, plan, and execute advisory board meetings that engage the right experts and elicit valuable insights, so I can inform medical strategy with external scientific perspectives.',
   'Medical Affairs', 'strategic', 'high', 'quarterly', 'active', 0.89,
   'strategic', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 3: MEDICAL INFORMATION JTBDs
-- (MI Managers, MI Scientists, MI Specialists)
-- =====================================================

-- JTBD-MA-MI001: Medical Inquiry Response
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MI001', 'Respond to Medical Information Inquiries',
   'When healthcare professionals request medical information about our products, I want to provide accurate, balanced, and timely responses based on the latest scientific evidence, so I can support informed clinical decision-making while maintaining regulatory compliance.',
   'Medical Affairs', 'operational', 'medium', 'daily', 'active', 0.93,
   'operational', 'structured', 'standard', 'high', 'very_high', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MI002: Standard Response Document Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MI002', 'Develop Standard Response Documents',
   'When creating reusable medical information content for common inquiries, I want to develop comprehensive, scientifically accurate standard response documents that address frequently asked questions, so I can ensure consistent, high-quality responses while improving response efficiency.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.88,
   'operational', 'structured', 'standard', 'medium', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MI003: Unsolicited Request Management
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MI003', 'Handle Unsolicited Off-Label Requests',
   'When receiving unsolicited requests for off-label information, I want to provide appropriate scientific information within regulatory guidelines while documenting the unsolicited nature of the request, so I can support HCP information needs while maintaining strict compliance.',
   'Medical Affairs', 'operational', 'high', 'daily', 'active', 0.90,
   'operational', 'structured', 'standard', 'high', 'very_high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MI004: Medical Knowledge Base Maintenance
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MI004', 'Maintain Medical Information Knowledge Base',
   'When new clinical evidence or product information becomes available, I want to update the medical information knowledge base and response documents to reflect current science, so I can ensure all medical communications are based on the most current evidence.',
   'Medical Affairs', 'operational', 'medium', 'weekly', 'active', 0.87,
   'operational', 'structured', 'standard', 'medium', 'high', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MI005: Medical Information Metrics Analysis
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MI005', 'Analyze Medical Information Trends',
   'When monitoring medical information inquiry patterns, I want to analyze trends, identify emerging questions, and generate actionable insights, so I can inform medical strategy and proactively address HCP information needs.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.84,
   'operational', 'structured', 'standard', 'medium', 'low', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 4: MEDICAL EDUCATION JTBDs
-- (Medical Education Managers, Medical Educators)
-- =====================================================

-- JTBD-MA-ME001: Medical Education Strategy
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-ME001', 'Develop Medical Education Strategy',
   'When planning medical education initiatives for healthcare professionals, I want to identify educational gaps, develop learning objectives, and design evidence-based educational programs, so I can improve clinical practice and patient outcomes through effective medical education.',
   'Medical Affairs', 'strategic', 'high', 'annually', 'active', 0.89,
   'strategic', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-ME002: CME/CE Program Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-ME002', 'Design Accredited Education Programs',
   'When developing accredited continuing medical education programs, I want to design scientifically rigorous content that meets accreditation standards and addresses identified educational gaps, so I can provide high-quality education that earns CME/CE credit and changes clinical practice.',
   'Medical Affairs', 'operational', 'high', 'quarterly', 'active', 0.88,
   'operational', 'structured', 'high', 'high', 'very_high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-ME003: Speaker Training and Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-ME003', 'Train and Certify Medical Speakers',
   'When preparing physicians to serve as speakers for educational programs, I want to ensure they are trained on scientific content, presentation skills, and compliance requirements, so I can maintain high-quality, balanced scientific presentations that meet regulatory standards.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.86,
   'operational', 'structured', 'standard', 'medium', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-ME004: Digital Medical Education
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-ME004', 'Develop Digital Medical Education Content',
   'When creating medical education content for digital channels, I want to develop engaging, interactive educational experiences optimized for online delivery, so I can reach more healthcare professionals with high-quality medical education in their preferred formats.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.85,
   'operational', 'mixed', 'standard', 'medium', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-ME005: Educational Grant Management
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-ME005', 'Manage Educational Grant Programs',
   'When reviewing and managing educational grant applications from medical organizations, I want to evaluate proposals against strategic priorities and compliance requirements, so I can support high-quality independent medical education that addresses real educational needs.',
   'Medical Affairs', 'operational', 'medium', 'quarterly', 'active', 0.84,
   'operational', 'structured', 'standard', 'medium', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 5: PUBLICATIONS JTBDs
-- (Publications Managers, Medical Writers)
-- =====================================================

-- JTBD-MA-PB001: Publication Strategy Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PB001', 'Develop Publication Strategy',
   'When planning scientific publications for a product or therapeutic area, I want to develop a comprehensive publication strategy that identifies key data to publish, target journals, and optimal timing, so I can maximize the scientific impact of our clinical evidence and support medical strategy.',
   'Medical Affairs', 'strategic', 'high', 'annually', 'active', 0.90,
   'strategic', 'structured', 'high', 'high', 'medium', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-PB002: Manuscript Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PB002', 'Develop Scientific Manuscripts',
   'When preparing manuscripts for peer-reviewed publication, I want to draft high-quality scientific content that accurately presents study data and conclusions, so I can advance scientific knowledge and support evidence-based medicine through peer-reviewed publications.',
   'Medical Affairs', 'operational', 'high', 'monthly', 'active', 0.89,
   'operational', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-PB003: Congress Abstract Preparation
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PB003', 'Prepare Congress Abstracts and Posters',
   'When submitting scientific data to medical congresses, I want to develop compelling abstracts and posters that effectively communicate study findings within format requirements, so I can disseminate important scientific findings to the medical community.',
   'Medical Affairs', 'operational', 'medium', 'quarterly', 'active', 0.87,
   'operational', 'structured', 'standard', 'medium', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-PB004: Literature Surveillance
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PB004', 'Conduct Scientific Literature Surveillance',
   'When monitoring the scientific literature for competitive intelligence and new evidence, I want to systematically search, screen, and synthesize relevant publications, so I can keep the organization informed of scientific developments and inform evidence-based decisions.',
   'Medical Affairs', 'operational', 'medium', 'weekly', 'active', 0.86,
   'operational', 'structured', 'standard', 'medium', 'low', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-PB005: Publication Compliance Review
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-PB005', 'Ensure Publication Compliance',
   'When reviewing publications for regulatory and ethical compliance, I want to verify adherence to GPP3 guidelines, disclosure requirements, and internal policies, so I can ensure all publications meet the highest ethical and compliance standards.',
   'Medical Affairs', 'operational', 'medium', 'weekly', 'active', 0.88,
   'operational', 'structured', 'standard', 'high', 'very_high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 6: MEDICAL STRATEGY JTBDs
-- (Medical Strategy Directors, Medical Advisors)
-- =====================================================

-- JTBD-MA-MS001: Competitive Medical Intelligence
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MS001', 'Analyze Competitive Medical Landscape',
   'When monitoring competitive product developments and medical strategies, I want to systematically gather and analyze competitive intelligence including clinical data, KOL relationships, and publication activity, so I can inform medical strategy and anticipate competitive threats.',
   'Medical Affairs', 'strategic', 'high', 'monthly', 'active', 0.88,
   'strategic', 'structured', 'high', 'high', 'low', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MS002: Evidence Gap Analysis
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MS002', 'Identify and Prioritize Evidence Gaps',
   'When planning evidence generation activities, I want to identify gaps in the clinical evidence base and prioritize research needs based on strategic importance and feasibility, so I can focus resources on generating the most impactful evidence.',
   'Medical Affairs', 'strategic', 'high', 'quarterly', 'active', 0.89,
   'strategic', 'structured', 'high', 'high', 'medium', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MS003: Medical Launch Planning
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MS003', 'Plan Medical Launch Activities',
   'When preparing for a product launch, I want to develop comprehensive medical launch plans including KOL engagement, medical education, publication strategy, and medical information readiness, so I can ensure medical affairs is prepared to support a successful launch.',
   'Medical Affairs', 'strategic', 'very_high', 'quarterly', 'active', 0.91,
   'strategic', 'structured', 'high', 'very_high', 'high', 'L2_panel')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MS004: Treatment Landscape Analysis
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MS004', 'Analyze Disease Treatment Landscape',
   'When developing deep understanding of a disease area, I want to analyze current treatment patterns, unmet needs, patient journey, and emerging therapies, so I can inform medical strategy with comprehensive disease area knowledge.',
   'Medical Affairs', 'strategic', 'high', 'quarterly', 'active', 0.87,
   'strategic', 'mixed', 'high', 'high', 'low', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MS005: Medical Value Proposition
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MS005', 'Develop Medical Value Proposition',
   'When articulating the medical value of our products, I want to develop compelling medical value propositions based on clinical evidence and real-world outcomes, so I can support HCP understanding of product differentiation and patient selection.',
   'Medical Affairs', 'strategic', 'high', 'annually', 'active', 0.88,
   'strategic', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 7: MEDICAL OPERATIONS JTBDs
-- (Medical Ops Directors, Program Managers)
-- =====================================================

-- JTBD-MA-MO001: Vendor Management
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MO001', 'Manage Medical Affairs Vendors',
   'When working with external vendors for medical activities, I want to effectively select, contract, and manage vendor relationships to ensure quality deliverables, so I can maintain operational excellence while controlling costs.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.83,
   'operational', 'structured', 'standard', 'medium', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MO002: Medical Affairs Metrics
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MO002', 'Track Medical Affairs Performance Metrics',
   'When measuring medical affairs performance and impact, I want to define, collect, and analyze key performance indicators across medical activities, so I can demonstrate value and identify opportunities for improvement.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.84,
   'operational', 'structured', 'standard', 'medium', 'low', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MO003: Compliance Training Management
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MO003', 'Manage Medical Affairs Compliance Training',
   'When ensuring medical affairs staff maintain compliance competency, I want to develop, deliver, and track completion of compliance training programs, so I can maintain a well-trained organization that operates within regulatory and ethical guidelines.',
   'Medical Affairs', 'operational', 'medium', 'quarterly', 'active', 0.85,
   'operational', 'structured', 'standard', 'medium', 'high', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MO004: Medical Systems Management
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MO004', 'Manage Medical Affairs Systems',
   'When implementing and maintaining medical affairs technology systems, I want to ensure systems meet user needs, maintain data integrity, and integrate effectively, so I can enable efficient medical operations through effective technology.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.82,
   'operational', 'structured', 'standard', 'medium', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MO005: HCP Engagement Compliance
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MO005', 'Ensure HCP Engagement Compliance',
   'When managing healthcare professional engagements, I want to ensure all interactions comply with transparency reporting requirements, fair market value guidelines, and anti-kickback regulations, so I can protect the organization and maintain ethical relationships with HCPs.',
   'Medical Affairs', 'operational', 'high', 'daily', 'active', 0.90,
   'operational', 'structured', 'high', 'high', 'very_high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SECTION 8: MEDICAL COMMUNICATIONS JTBDs
-- (Medical Communications Specialists)
-- =====================================================

-- JTBD-MA-MC001: Scientific Platform Development
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MC001', 'Develop Scientific Communication Platform',
   'When creating core scientific messaging for a product, I want to develop a comprehensive scientific platform that articulates the scientific story, key messages, and supporting evidence, so I can ensure consistent, compelling scientific communication across all channels.',
   'Medical Affairs', 'strategic', 'high', 'annually', 'active', 0.88,
   'strategic', 'structured', 'high', 'high', 'high', 'L1_expert')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MC002: Medical Content Review
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MC002', 'Review Medical Content for Accuracy',
   'When reviewing promotional and scientific materials for medical accuracy, I want to ensure all claims are scientifically accurate, appropriately referenced, and consistent with the approved label, so I can maintain scientific integrity in all communications.',
   'Medical Affairs', 'operational', 'medium', 'daily', 'active', 0.91,
   'operational', 'structured', 'standard', 'high', 'very_high', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- JTBD-MA-MC003: Congress Presentation Preparation
INSERT INTO jtbd (id, tenant_id, code, name, description, functional_area, job_category, complexity, frequency, status, validation_score, jtbd_type, work_pattern, strategic_priority, impact_level, compliance_sensitivity, recommended_service_layer)
VALUES
  (gen_random_uuid(), v_tenant_id, 'JTBD-MA-MC003', 'Prepare Scientific Presentations',
   'When preparing scientific presentations for congresses and symposia, I want to develop compelling visual presentations that effectively communicate scientific data to healthcare professionals, so I can maximize the impact of scientific communications at medical meetings.',
   'Medical Affairs', 'operational', 'medium', 'monthly', 'active', 0.86,
   'operational', 'mixed', 'standard', 'medium', 'medium', 'L0_ask_me')
ON CONFLICT (code, tenant_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after migration to verify:
-- SELECT code, name, functional_area, job_category, complexity
-- FROM jtbd
-- WHERE code LIKE 'JTBD-MA-%'
-- ORDER BY code;

-- Expected: 33 Medical Affairs JTBDs

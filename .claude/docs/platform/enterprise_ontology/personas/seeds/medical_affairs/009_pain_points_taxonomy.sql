-- =====================================================================
-- COMPREHENSIVE PAIN POINTS TAXONOMY FOR MEDICAL AFFAIRS
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-27
-- Purpose: Seed normalized pain points taxonomy with VPANES scoring
--          and archetype-specific weights for Medical Affairs roles
-- =====================================================================
--
-- TAXONOMY OVERVIEW:
-- - 7 Level 1 Categories (PROCESS, TECHNOLOGY, COMMUNICATION, etc.)
-- - 60+ specific pain points across 6 Medical Affairs roles
-- - VPANES scoring framework (Visibility, Pain, Actions, Needs, Emotions, Scenarios)
-- - Archetype weight multipliers (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
-- - Opportunity mapping to solution types
-- =====================================================================

-- =====================================================================
-- PHASE 1: PAIN POINT CATEGORIES (Level 1 Taxonomy)
-- =====================================================================

INSERT INTO ref_pain_point_categories (unique_id, category_name, parent_category_id, level, description)
VALUES
  ('PPC-PROCESS', 'PROCESS', NULL, 1, 'Workflow inefficiencies, bottlenecks, and procedural friction that slow down work'),
  ('PPC-TECHNOLOGY', 'TECHNOLOGY', NULL, 1, 'Tool limitations, integration gaps, system failures, and technical barriers'),
  ('PPC-COMMUNICATION', 'COMMUNICATION', NULL, 1, 'Information silos, stakeholder access issues, messaging challenges'),
  ('PPC-COMPLIANCE', 'COMPLIANCE', NULL, 1, 'Regulatory burden, documentation requirements, audit readiness, risk management'),
  ('PPC-RESOURCE', 'RESOURCE', NULL, 1, 'Time constraints, budget limitations, staffing shortages, bandwidth issues'),
  ('PPC-KNOWLEDGE', 'KNOWLEDGE', NULL, 1, 'Information gaps, expertise access, learning curves, evidence gaps'),
  ('PPC-ORGANIZATIONAL', 'ORGANIZATIONAL', NULL, 1, 'Politics, bureaucracy, misalignment, cultural resistance, role clarity')
ON CONFLICT (unique_id) DO UPDATE SET
  description = EXCLUDED.description;

-- =====================================================================
-- PHASE 2: REFERENCE PAIN POINTS (Reusable Across Roles)
-- =====================================================================

-- Get category IDs for foreign key references
DO $$
DECLARE
  cat_process_id UUID;
  cat_tech_id UUID;
  cat_comm_id UUID;
  cat_comp_id UUID;
  cat_resource_id UUID;
  cat_knowledge_id UUID;
  cat_org_id UUID;
BEGIN
  SELECT id INTO cat_process_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-PROCESS';
  SELECT id INTO cat_tech_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-TECHNOLOGY';
  SELECT id INTO cat_comm_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-COMMUNICATION';
  SELECT id INTO cat_comp_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-COMPLIANCE';
  SELECT id INTO cat_resource_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-RESOURCE';
  SELECT id INTO cat_knowledge_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-KNOWLEDGE';
  SELECT id INTO cat_org_id FROM ref_pain_point_categories WHERE unique_id = 'PPC-ORGANIZATIONAL';

-- PROCESS Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-PROC-001', 'Manual Data Entry Across Multiple Systems', 'PROCESS',
   'MSLs spend hours copying data between CRM, expense systems, and internal databases with no integration',
   'Legacy system architecture', 'Productivity', true, 'moderate', 'daily', true),

  ('PP-PROC-002', 'Time-Consuming Meeting Preparation', 'PROCESS',
   'Preparing for HCP meetings requires gathering data from 5+ sources and manual synthesis',
   'Fragmented information systems', 'Productivity', true, 'moderate', 'daily', true),

  ('PP-PROC-003', 'Slow Approval Cycles for Materials', 'PROCESS',
   'Medical and legal review of materials takes 2-4 weeks, delaying field engagement',
   'Complex review hierarchy', 'Quality', true, 'difficult', 'weekly', true),

  ('PP-PROC-004', 'Inefficient Expense Reporting', 'PROCESS',
   'Field teams spend 3-5 hours monthly on expense reports with cumbersome approval workflows',
   'Outdated expense systems', 'Productivity', true, 'easy', 'monthly', false),

  ('PP-PROC-005', 'Fragmented Field Insights Collection', 'PROCESS',
   'No standardized process for capturing and sharing KOL feedback across regions',
   'Lack of centralized platform', 'Quality', true, 'moderate', 'weekly', true),

  ('PP-PROC-006', 'Redundant Data Collection', 'PROCESS',
   'Same information requested multiple times by different stakeholders (HQ, Medical, Commercial)',
   'Organizational silos', 'Productivity', true, 'moderate', 'weekly', false),

  ('PP-PROC-007', 'Lack of Standardized Workflows', 'PROCESS',
   'Every team member has different approach to routine tasks, reducing efficiency',
   'Insufficient training and SOPs', 'Quality', true, 'moderate', 'daily', false),

  ('PP-PROC-008', 'Manual Literature Search and Monitoring', 'PROCESS',
   'Staying current with medical literature requires hours of manual searches weekly',
   'No automated alerting system', 'Productivity', true, 'moderate', 'weekly', true),

  ('PP-PROC-009', 'Complex Scheduling Coordination', 'PROCESS',
   'Coordinating availability between MSLs, KOLs, and internal stakeholders is time-intensive',
   'Multiple calendar systems', 'Productivity', true, 'easy', 'daily', false),

  ('PP-PROC-010', 'Inefficient Meeting Documentation', 'PROCESS',
   'Post-meeting notes require 30-60 minutes per interaction with manual entry into CRM',
   'No AI-assisted transcription', 'Productivity', true, 'easy', 'daily', true);

-- TECHNOLOGY Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-TECH-001', 'CRM System Complexity and Rigidity', 'TECHNOLOGY',
   'Veeva CRM is difficult to navigate, requires excessive clicks, and lacks flexibility',
   'Enterprise software limitations', 'Productivity', true, 'difficult', 'daily', true),

  ('PP-TECH-002', 'Lack of Real-Time Data Integration', 'TECHNOLOGY',
   'Data exists in silos - CRM, medical database, publications, trials - no unified view',
   'Legacy architecture', 'Quality', true, 'difficult', 'daily', true),

  ('PP-TECH-003', 'Limited Mobile Functionality', 'TECHNOLOGY',
   'Field teams cannot effectively work from mobile devices, forcing laptop dependency',
   'Desktop-first software design', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-TECH-004', 'Poor Search and Retrieval', 'TECHNOLOGY',
   'Finding past interactions, documents, or insights takes 10+ minutes per search',
   'Inadequate search algorithms', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-TECH-005', 'No AI-Powered Insights or Recommendations', 'TECHNOLOGY',
   'Systems provide data but no proactive insights, predictions, or recommendations',
   'Lack of AI integration', 'Quality', true, 'moderate', 'daily', false),

  ('PP-TECH-006', 'System Downtime and Performance Issues', 'TECHNOLOGY',
   'Critical systems experience outages or slow performance during peak usage',
   'Infrastructure constraints', 'Productivity', false, 'moderate', 'weekly', false),

  ('PP-TECH-007', 'Incompatible File Formats and Versions', 'TECHNOLOGY',
   'Sharing documents across teams results in version control and compatibility issues',
   'Lack of standardization', 'Quality', true, 'easy', 'weekly', false),

  ('PP-TECH-008', 'Limited Analytics and Reporting Capabilities', 'TECHNOLOGY',
   'Cannot easily generate custom reports or dashboards without IT support',
   'Rigid reporting tools', 'Quality', true, 'moderate', 'monthly', false),

  ('PP-TECH-009', 'No Single Source of Truth for Medical Information', 'TECHNOLOGY',
   'Medical Affairs, MI, MSL teams all maintain separate databases with conflicting info',
   'Organizational silos', 'Quality', true, 'difficult', 'daily', true),

  ('PP-TECH-010', 'Inadequate Training Tools and Resources', 'TECHNOLOGY',
   'Onboarding and continuous training rely on outdated materials and manual processes',
   'Lack of investment in learning tech', 'Morale', true, 'moderate', 'monthly', false);

-- COMMUNICATION Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-COMM-001', 'Difficult Access to KOLs and Stakeholders', 'COMMUNICATION',
   'Securing time with busy KOLs requires multiple touchpoints and long wait times',
   'External stakeholder priorities', 'Quality', false, 'difficult', 'weekly', true),

  ('PP-COMM-002', 'Limited Cross-Functional Collaboration', 'COMMUNICATION',
   'Medical Affairs, Commercial, R&D work in silos with minimal information sharing',
   'Organizational structure', 'Quality', true, 'difficult', 'daily', true),

  ('PP-COMM-003', 'Inconsistent Messaging Across Teams', 'COMMUNICATION',
   'Different regions or teams deliver conflicting messages to the same stakeholders',
   'Lack of centralized messaging platform', 'Quality', true, 'moderate', 'monthly', true),

  ('PP-COMM-004', 'Email Overload and Noise', 'COMMUNICATION',
   'Critical communications buried in 100+ daily emails, leading to missed messages',
   'Over-reliance on email', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-COMM-005', 'Ineffective Internal Knowledge Sharing', 'COMMUNICATION',
   'Best practices and learnings not systematically shared across field teams',
   'No knowledge management system', 'Quality', true, 'moderate', 'weekly', false),

  ('PP-COMM-006', 'Language and Translation Barriers', 'COMMUNICATION',
   'Global teams struggle with language differences in medical terminology and materials',
   'Geographic diversity', 'Quality', false, 'moderate', 'weekly', true),

  ('PP-COMM-007', 'Delayed Feedback Loops', 'COMMUNICATION',
   'Field insights take weeks to reach decision-makers, reducing responsiveness',
   'Hierarchical reporting structure', 'Quality', true, 'moderate', 'weekly', true),

  ('PP-COMM-008', 'Unclear Escalation Pathways', 'COMMUNICATION',
   'Field teams unsure who to contact for urgent issues or complex questions',
   'Ambiguous organizational structure', 'Productivity', true, 'easy', 'monthly', false),

  ('PP-COMM-009', 'Meeting Fatigue and Low Productivity', 'COMMUNICATION',
   'Excessive meetings (20+ hours/week) with unclear objectives and poor follow-up',
   'Meeting culture', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-COMM-010', 'HCP Preference Misalignment', 'COMMUNICATION',
   'MSLs lack visibility into HCP communication preferences (email, call, in-person)',
   'No preference management system', 'Quality', true, 'moderate', 'weekly', true);

-- COMPLIANCE Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-COMP-001', 'Burdensome Compliance Documentation', 'COMPLIANCE',
   'Every interaction requires detailed documentation for audit trails, consuming 20% of time',
   'Regulatory requirements', 'Productivity', true, 'structural', 'daily', true),

  ('PP-COMP-002', 'Constant Training and Recertification Requirements', 'COMPLIANCE',
   'GCP, GMP, PhV training every 6-12 months takes significant time from field work',
   'Regulatory mandates', 'Productivity', true, 'structural', 'quarterly', true),

  ('PP-COMP-003', 'Fear of Regulatory Violations', 'COMPLIANCE',
   'Anxiety about inadvertently making off-label statements or violating guidelines',
   'Complex regulatory landscape', 'Morale', true, 'structural', 'daily', true),

  ('PP-COMP-004', 'Slow Medical Review Turnaround', 'COMPLIANCE',
   'MLR (Medical Legal Regulatory) review bottleneck delays urgent materials',
   'Resource constraints in MLR team', 'Productivity', true, 'difficult', 'weekly', true),

  ('PP-COMP-005', 'Difficulty Staying Current with Regulations', 'COMPLIANCE',
   'Regulatory landscape constantly evolving, hard to track all changes',
   'Rapid regulatory updates', 'Compliance', true, 'moderate', 'monthly', true),

  ('PP-COMP-006', 'Adverse Event Reporting Complexity', 'COMPLIANCE',
   'AE reporting process is complex, time-sensitive, and error-prone',
   'Regulatory requirements', 'Compliance', true, 'difficult', 'weekly', true),

  ('PP-COMP-007', 'Audit Preparation Stress', 'COMPLIANCE',
   'Internal and external audits require extensive preparation and documentation review',
   'Compliance expectations', 'Morale', true, 'structural', 'quarterly', true),

  ('PP-COMP-008', 'HCP Interaction Transparency Requirements', 'COMPLIANCE',
   'Sunshine Act and similar regulations require meticulous tracking of all HCP interactions',
   'Regulatory mandates', 'Productivity', true, 'structural', 'daily', true),

  ('PP-COMP-009', 'Off-Label Discussion Constraints', 'COMPLIANCE',
   'Cannot discuss legitimate medical questions about off-label use even when scientifically relevant',
   'FDA regulations', 'Quality', true, 'structural', 'weekly', true),

  ('PP-COMP-010', 'Privacy and Data Protection Burden', 'COMPLIANCE',
   'GDPR, HIPAA, and other privacy laws create significant overhead for data handling',
   'Privacy regulations', 'Productivity', true, 'structural', 'daily', true);

-- RESOURCE Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-RES-001', 'Insufficient Time for Strategic Work', 'RESOURCE',
   'Administrative tasks consume 60% of time, leaving little for high-value clinical engagement',
   'Administrative burden', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-RES-002', 'Budget Constraints for Events and Engagement', 'RESOURCE',
   'Limited budget prevents attending key conferences or hosting advisory boards',
   'Financial constraints', 'Quality', true, 'difficult', 'quarterly', false),

  ('PP-RES-003', 'Understaffing and Territory Overload', 'RESOURCE',
   'Large territories with too many accounts result in insufficient coverage',
   'Headcount constraints', 'Quality', true, 'difficult', 'daily', true),

  ('PP-RES-004', 'Limited Access to Specialized Expertise', 'RESOURCE',
   'When complex questions arise, no easy access to therapeutic area experts',
   'Organizational design', 'Quality', true, 'moderate', 'weekly', true),

  ('PP-RES-005', 'Inadequate Support Staff', 'RESOURCE',
   'No administrative support forces senior staff to handle routine tasks',
   'Budget and org structure', 'Productivity', true, 'difficult', 'daily', false),

  ('PP-RES-006', 'Travel Time and Fatigue', 'RESOURCE',
   'Excessive travel (60-80% of time) leads to burnout and reduced productivity',
   'Geographic territory design', 'Morale', true, 'moderate', 'daily', true),

  ('PP-RES-007', 'Competing Priorities and Task Overload', 'RESOURCE',
   'Conflicting requests from multiple stakeholders with unclear prioritization',
   'Lack of centralized prioritization', 'Productivity', true, 'moderate', 'daily', false),

  ('PP-RES-008', 'Limited Budget for Tools and Technology', 'RESOURCE',
   'Budget constraints prevent adoption of modern tools that could improve efficiency',
   'Financial constraints', 'Productivity', true, 'difficult', 'yearly', false),

  ('PP-RES-009', 'High Turnover and Knowledge Loss', 'RESOURCE',
   'Frequent staff turnover means constantly rebuilding relationships and institutional knowledge',
   'Competitive job market', 'Quality', true, 'difficult', 'yearly', false),

  ('PP-RES-010', 'Inflexible Vacation and PTO Policies', 'RESOURCE',
   'Difficulty taking time off due to coverage requirements and workload',
   'Organizational policies', 'Morale', true, 'moderate', 'monthly', false);

-- KNOWLEDGE Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-KNOW-001', 'Difficulty Staying Current with Medical Literature', 'KNOWLEDGE',
   'Volume of publications makes it impossible to stay current in therapeutic area',
   'Information overload', 'Quality', true, 'moderate', 'daily', true),

  ('PP-KNOW-002', 'Gaps in Clinical Trial Knowledge', 'KNOWLEDGE',
   'Not fully informed about pipeline trials, design, and interim results',
   'Information silos', 'Quality', true, 'moderate', 'weekly', true),

  ('PP-KNOW-003', 'Inadequate Competitor Intelligence', 'KNOWLEDGE',
   'Limited visibility into competitor product profiles and medical strategies',
   'Lack of competitive intelligence platform', 'Quality', true, 'moderate', 'monthly', true),

  ('PP-KNOW-004', 'Complex Product Portfolio Learning Curve', 'KNOWLEDGE',
   'New hires or role changes require 6-12 months to become proficient across portfolio',
   'Product complexity', 'Productivity', true, 'moderate', 'yearly', true),

  ('PP-KNOW-005', 'Lack of Real-World Evidence Access', 'KNOWLEDGE',
   'RWE data exists but is difficult to access, interpret, and communicate',
   'Data infrastructure gaps', 'Quality', true, 'moderate', 'monthly', true),

  ('PP-KNOW-006', 'Unclear Best Practices and Standards', 'KNOWLEDGE',
   'No centralized repository of best practices for common scenarios',
   'Knowledge management gaps', 'Quality', true, 'easy', 'weekly', false),

  ('PP-KNOW-007', 'Limited Access to KOL Insights and Trends', 'KNOWLEDGE',
   'No systematic way to track KOL opinions, publications, and influence',
   'Lack of KOL intelligence platform', 'Quality', true, 'moderate', 'weekly', true),

  ('PP-KNOW-008', 'Therapeutic Area Complexity', 'KNOWLEDGE',
   'Rapidly evolving science (e.g., immunology, cell therapy) outpaces training',
   'Scientific advancement pace', 'Quality', true, 'moderate', 'monthly', true),

  ('PP-KNOW-009', 'Fragmented Training Materials', 'KNOWLEDGE',
   'Training content scattered across multiple platforms with no central access',
   'Lack of LMS integration', 'Productivity', true, 'easy', 'monthly', false),

  ('PP-KNOW-010', 'Difficulty Translating Data to Clinical Practice', 'KNOWLEDGE',
   'Strong on data but struggle to articulate practical implications for HCPs',
   'Communication training gaps', 'Quality', true, 'moderate', 'weekly', true);

-- ORGANIZATIONAL Pain Points
INSERT INTO ref_pain_points (unique_id, pain_point_name, pain_category, description, root_cause_category, impact_area, is_systemic, solvability, typical_frequency, pharma_specific)
VALUES
  ('PP-ORG-001', 'Medical vs Commercial Tension', 'ORGANIZATIONAL',
   'Constant friction between Medical Affairs scientific mission and Commercial sales goals',
   'Organizational structure', 'Morale', true, 'structural', 'weekly', true),

  ('PP-ORG-002', 'Lack of Clear Role Definition', 'ORGANIZATIONAL',
   'Ambiguity around MSL responsibilities vs Sales vs Medical Information',
   'Organizational design', 'Productivity', true, 'moderate', 'monthly', true),

  ('PP-ORG-003', 'Bureaucratic Decision-Making', 'ORGANIZATIONAL',
   'Slow, multi-layer approval processes delay time-sensitive opportunities',
   'Hierarchical culture', 'Productivity', true, 'difficult', 'weekly', false),

  ('PP-ORG-004', 'Limited Career Advancement Opportunities', 'ORGANIZATIONAL',
   'Unclear career path beyond MSL role, limited management positions',
   'Organizational structure', 'Morale', true, 'difficult', 'yearly', false),

  ('PP-ORG-005', 'Misalignment Between HQ and Field', 'ORGANIZATIONAL',
   'HQ initiatives disconnected from field realities and priorities',
   'Communication gaps', 'Quality', true, 'moderate', 'monthly', false),

  ('PP-ORG-006', 'Resistance to Change and Innovation', 'ORGANIZATIONAL',
   'Conservative culture resistant to new tools, approaches, or processes',
   'Risk-averse culture', 'Productivity', true, 'structural', 'monthly', false),

  ('PP-ORG-007', 'Siloed Departments and Information Hoarding', 'ORGANIZATIONAL',
   'Departments protect information rather than sharing for collective benefit',
   'Territorial culture', 'Quality', true, 'difficult', 'weekly', false),

  ('PP-ORG-008', 'Unclear Performance Metrics and Evaluation', 'ORGANIZATIONAL',
   'MSL success metrics poorly defined, leading to subjective evaluations',
   'Lack of standardized KPIs', 'Morale', true, 'moderate', 'quarterly', true),

  ('PP-ORG-009', 'Insufficient Recognition and Appreciation', 'ORGANIZATIONAL',
   'Hard work and achievements go unrecognized, reducing motivation',
   'Culture and leadership', 'Morale', true, 'moderate', 'monthly', false),

  ('PP-ORG-010', 'Geographic and Cultural Disconnection', 'ORGANIZATIONAL',
   'Remote field teams feel isolated from HQ and peer network',
   'Remote work structure', 'Morale', true, 'moderate', 'weekly', false);

END $$;

-- =====================================================================
-- PHASE 3: ROLE-SPECIFIC PAIN POINT ASSOCIATIONS
-- =====================================================================

-- Note: This section will be populated in role-specific seed files
-- (002_msl_seed.sql, 003_senior_msl_seed.sql, etc.)
-- Each role will link to relevant pain points from above via persona_pain_points table

-- =====================================================================
-- PHASE 4: ARCHETYPE-SPECIFIC SEVERITY MULTIPLIERS
-- =====================================================================

-- Create table for archetype pain sensitivity
CREATE TABLE IF NOT EXISTS archetype_pain_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES ref_archetypes(id) ON DELETE CASCADE,
  pain_category VARCHAR(100) NOT NULL,
  weight_multiplier DECIMAL(3,2) DEFAULT 1.0,
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(archetype_id, pain_category)
);

-- AUTOMATOR archetype weights (High AI + Routine work)
-- Pain amplifiers: Manual processes, repetitive tasks, system inefficiencies
-- Pain reducers: Strategic ambiguity, relationship complexity
INSERT INTO archetype_pain_weights (archetype_id, pain_category, weight_multiplier, rationale)
SELECT
  a.id,
  'PROCESS',
  1.8,
  'AUTOMATORs are highly frustrated by manual, repetitive processes they know could be automated'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'TECHNOLOGY', 1.6, 'Feel pain intensely when tools lack automation capabilities'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'COMMUNICATION', 0.9, 'Less bothered by communication issues if systems work efficiently'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'COMPLIANCE', 1.4, 'Frustrated by manual compliance overhead, wants automated solutions'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'RESOURCE', 1.5, 'Time constraints especially painful when spent on automatable tasks'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'KNOWLEDGE', 1.0, 'Neutral - comfortable finding information via tools'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR'
UNION ALL
SELECT a.id, 'ORGANIZATIONAL', 0.8, 'Less concerned with politics, focused on efficiency'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-AUTOMATOR';

-- ORCHESTRATOR archetype weights (High AI + Strategic work)
-- Pain amplifiers: Lack of insights, strategic bottlenecks, data silos
-- Pain reducers: Routine manual tasks (delegates these)
INSERT INTO archetype_pain_weights (archetype_id, pain_category, weight_multiplier, rationale)
SELECT
  a.id,
  'PROCESS',
  1.2,
  'ORCHESTRATORs care about process efficiency but focus more on strategic bottlenecks'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'TECHNOLOGY', 1.7, 'Intensely frustrated by lack of AI-powered insights and analytics'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'COMMUNICATION', 1.6, 'Cross-functional collaboration critical for strategic success'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'COMPLIANCE', 1.1, 'Aware of compliance but sees as table stakes, not differentiator'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'RESOURCE', 1.3, 'Frustrated by resource constraints that limit strategic initiatives'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'KNOWLEDGE', 1.8, 'Knowledge gaps severely limit strategic decision-making ability'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR'
UNION ALL
SELECT a.id, 'ORGANIZATIONAL', 1.7, 'Highly sensitive to organizational barriers blocking innovation'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-ORCHESTRATOR';

-- LEARNER archetype weights (Low AI + Routine work)
-- Pain amplifiers: Complexity, unclear guidance, steep learning curves
-- Pain reducers: Strategic ambiguity (not their focus yet)
INSERT INTO archetype_pain_weights (archetype_id, pain_category, weight_multiplier, rationale)
SELECT
  a.id,
  'PROCESS',
  1.3,
  'LEARNERs struggle with complex processes lacking clear SOPs'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'TECHNOLOGY', 1.9, 'Tool complexity is major barrier - need simple, intuitive systems'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'COMMUNICATION', 1.4, 'Need clear communication and accessible support'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'COMPLIANCE', 1.6, 'Compliance complexity creates anxiety and fear of errors'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'RESOURCE', 1.2, 'Time pressure compounds learning challenges'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'KNOWLEDGE', 2.0, 'Knowledge gaps are most painful - directly impacts confidence and performance'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER'
UNION ALL
SELECT a.id, 'ORGANIZATIONAL', 1.1, 'Aware of politics but focused on building competence first'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-LEARNER';

-- SKEPTIC archetype weights (Low AI + Strategic work)
-- Pain amplifiers: Unproven tools, lack of evidence, forced change
-- Pain reducers: Process inefficiency (accepts some inefficiency for proven reliability)
INSERT INTO archetype_pain_weights (archetype_id, pain_category, weight_multiplier, rationale)
SELECT
  a.id,
  'PROCESS',
  0.9,
  'SKEPTICs tolerate process inefficiency if it ensures quality and compliance'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'TECHNOLOGY', 2.0, 'Most painful: forced adoption of unproven tools and lack of reliability'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'COMMUNICATION', 1.5, 'Value evidence-based communication, frustrated by hype'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'COMPLIANCE', 1.8, 'Compliance violations are unacceptable - extremely risk-averse'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'RESOURCE', 1.1, 'Resource constraints accepted as industry reality'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'KNOWLEDGE', 1.4, 'Value proven expertise and evidence-based knowledge'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC'
UNION ALL
SELECT a.id, 'ORGANIZATIONAL', 1.9, 'Frustrated by change initiatives lacking proven ROI and stakeholder buy-in'
FROM ref_archetypes a WHERE a.unique_id = 'ARCH-SKEPTIC';

-- =====================================================================
-- PHASE 5: VPANES SCORING GUIDE BY CATEGORY
-- =====================================================================

-- Create table for VPANES baseline scoring by category
CREATE TABLE IF NOT EXISTS vpanes_category_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pain_category VARCHAR(100) NOT NULL UNIQUE,
  visibility_baseline DECIMAL(3,2),
  pain_baseline DECIMAL(3,2),
  actions_baseline DECIMAL(3,2),
  needs_baseline DECIMAL(3,2),
  emotions_baseline DECIMAL(3,2),
  scenarios_baseline DECIMAL(3,2),
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO vpanes_category_baselines (pain_category, visibility_baseline, pain_baseline, actions_baseline, needs_baseline, emotions_baseline, scenarios_baseline, rationale)
VALUES
  ('PROCESS', 8.0, 7.0, 7.0, 8.0, 6.0, 7.0,
   'Process pain is highly visible (daily workflows), painful, actionable, needed, moderate emotional charge, scenario-specific'),

  ('TECHNOLOGY', 7.0, 8.0, 6.0, 8.0, 7.0, 6.0,
   'Tech pain is very painful and needed but users may feel powerless (lower actions), emotional frustration high'),

  ('COMMUNICATION', 6.0, 6.0, 5.0, 7.0, 5.0, 5.0,
   'Comm pain less visible (happens behind scenes), moderate pain, difficult to take individual action, needed'),

  ('COMPLIANCE', 9.0, 9.0, 4.0, 9.0, 8.0, 8.0,
   'Compliance extremely visible and painful, but few actions possible (structural), critical need, high anxiety'),

  ('RESOURCE', 9.0, 8.0, 5.0, 9.0, 7.0, 6.0,
   'Resource constraints highly visible and painful, limited individual actions, critical need, moderate emotional toll'),

  ('KNOWLEDGE', 7.0, 7.0, 8.0, 8.0, 6.0, 8.0,
   'Knowledge gaps visible to self, painful, many actions taken (research, training), high need, scenario-specific'),

  ('ORGANIZATIONAL', 5.0, 7.0, 3.0, 6.0, 8.0, 4.0,
   'Org pain less visible publicly, very painful emotionally, few effective actions, variable need, less scenario-specific');

-- =====================================================================
-- PHASE 6: OPPORTUNITY MAPPING (Pain Points → Solutions)
-- =====================================================================

-- Seed opportunities that address pain points
INSERT INTO ref_opportunities (unique_id, opportunity_name, opportunity_type, description, value_proposition, implementation_complexity, expected_impact, time_to_value, required_capabilities)
VALUES
  ('OPP-AUTO-001', 'CRM Auto-Population from Meeting Notes', 'automation',
   'AI automatically extracts structured data from meeting notes and populates CRM fields',
   'Reduce CRM data entry time by 70%, improve data quality and completeness',
   'moderate', 'high', '3-6 months',
   ARRAY['NLP/NER models', 'CRM API integration', 'User feedback loop']),

  ('OPP-AUTO-002', 'Intelligent Meeting Prep Assistant', 'automation',
   'AI aggregates relevant KOL history, publications, trials, and suggests talking points',
   'Cut meeting prep time from 2 hours to 15 minutes, improve meeting quality',
   'moderate', 'high', '3-6 months',
   ARRAY['Data integration', 'Recommendation engine', 'Search capabilities']),

  ('OPP-AUTO-003', 'Automated Literature Monitoring', 'automation',
   'AI monitors literature and sends personalized alerts on relevant publications',
   'Stay current with 90% less manual search time, never miss key publications',
   'easy', 'high', '1-3 months',
   ARRAY['PubMed API', 'ML classification', 'Personalization engine']),

  ('OPP-WF-001', 'Streamlined Approval Workflows', 'workflow',
   'Intelligent routing and parallel review to accelerate material approvals',
   'Reduce approval time from 2-4 weeks to 3-5 days',
   'moderate', 'high', '3-6 months',
   ARRAY['Workflow engine', 'MLR integration', 'Version control']),

  ('OPP-WF-002', 'Standardized Process Templates', 'workflow',
   'Pre-built templates and checklists for common MSL workflows',
   'Reduce time on routine tasks by 40%, improve consistency',
   'easy', 'medium', '1-3 months',
   ARRAY['Template library', 'Workflow automation', 'Training materials']),

  ('OPP-WF-003', 'Unified Field Insights Platform', 'workflow',
   'Centralized platform for capturing, categorizing, and sharing KOL insights',
   'Democratize insights access, reduce redundant data collection by 60%',
   'moderate', 'high', '3-6 months',
   ARRAY['Insights database', 'Tagging system', 'Search and analytics']),

  ('OPP-INSIGHT-001', 'KOL Intelligence Dashboard', 'insight',
   'Real-time dashboard showing KOL engagement history, influence, and trends',
   'Data-driven KOL prioritization and engagement strategy',
   'moderate', 'medium', '3-6 months',
   ARRAY['KOL data aggregation', 'Influence algorithms', 'Visualization']),

  ('OPP-INSIGHT-002', 'Predictive HCP Engagement Recommendations', 'insight',
   'AI predicts best next actions and engagement opportunities with each HCP',
   'Increase meaningful interactions by 30%, optimize territory coverage',
   'difficult', 'high', '6-12 months',
   ARRAY['Predictive ML models', 'CRM data', 'Behavioral analytics']),

  ('OPP-INSIGHT-003', 'Cross-Functional Intelligence Hub', 'insight',
   'Unified view of all stakeholder interactions across Medical, Commercial, HEOR',
   'Eliminate information silos, improve coordination, consistent messaging',
   'difficult', 'high', '6-12 months',
   ARRAY['Data integration', 'Deduplication', 'Access controls']),

  ('OPP-TRAIN-001', 'AI-Powered Learning Companion', 'training',
   'Personalized learning paths with AI tutor for therapeutic areas and products',
   'Reduce onboarding time by 50%, continuous upskilling',
   'moderate', 'medium', '3-6 months',
   ARRAY['LMS integration', 'Adaptive learning', 'Assessment engine']),

  ('OPP-TRAIN-002', 'On-Demand Expert Access', 'training',
   'Quick access to internal experts via AI-routed Q&A platform',
   'Reduce time to answer from days to hours, democratize expertise',
   'easy', 'medium', '1-3 months',
   ARRAY['Expert directory', 'Routing logic', 'Knowledge base']),

  ('OPP-TRAIN-003', 'Scenario-Based Simulation Training', 'training',
   'Interactive simulations for complex scenarios (HCP objections, AE handling)',
   'Build confidence and competence in high-stakes situations',
   'moderate', 'medium', '3-6 months',
   ARRAY['Simulation engine', 'Branching scenarios', 'Performance tracking']),

  ('OPP-INTEG-001', 'Single Source of Truth Platform', 'integration',
   'Unified data layer integrating CRM, medical database, trials, publications',
   'Eliminate duplicate data entry, ensure data consistency, 360-degree view',
   'difficult', 'high', '6-12 months',
   ARRAY['API integrations', 'Master data management', 'Real-time sync']),

  ('OPP-INTEG-002', 'Mobile-First Field Tools', 'integration',
   'Native mobile apps with offline capabilities for field work',
   'Enable productive work from anywhere, reduce laptop dependency',
   'moderate', 'high', '3-6 months',
   ARRAY['Mobile development', 'Offline sync', 'Responsive design']),

  ('OPP-INTEG-003', 'Compliance Automation Suite', 'integration',
   'Automated compliance checks, documentation, and audit trail generation',
   'Reduce compliance overhead by 50%, minimize violation risk',
   'moderate', 'high', '3-6 months',
   ARRAY['Rules engine', 'Automated documentation', 'Audit logging']);

-- Map pain points to opportunities
INSERT INTO pain_point_opportunities (pain_point_id, opportunity_id, resolution_effectiveness, implementation_effort, roi_estimate)
SELECT
  pp.id,
  opp.id,
  CASE
    WHEN pp.unique_id = 'PP-PROC-001' THEN 9.0 -- Manual data entry → CRM auto-population
    WHEN pp.unique_id = 'PP-PROC-002' THEN 9.5 -- Meeting prep → Intelligent assistant
    WHEN pp.unique_id = 'PP-PROC-008' THEN 10.0 -- Literature search → Automated monitoring
    WHEN pp.unique_id = 'PP-PROC-010' THEN 8.5 -- Meeting documentation → CRM auto-population
    ELSE 7.0
  END,
  CASE
    WHEN opp.implementation_complexity = 'easy' THEN 'low'
    WHEN opp.implementation_complexity = 'moderate' THEN 'medium'
    ELSE 'high'
  END,
  'High - significant time savings and quality improvement'
FROM ref_pain_points pp
CROSS JOIN ref_opportunities opp
WHERE
  (pp.unique_id IN ('PP-PROC-001', 'PP-PROC-010', 'PP-TECH-001') AND opp.unique_id = 'OPP-AUTO-001') OR
  (pp.unique_id IN ('PP-PROC-002', 'PP-RES-001') AND opp.unique_id = 'OPP-AUTO-002') OR
  (pp.unique_id IN ('PP-PROC-008', 'PP-KNOW-001') AND opp.unique_id = 'OPP-AUTO-003') OR
  (pp.unique_id IN ('PP-PROC-003', 'PP-COMP-004') AND opp.unique_id = 'OPP-WF-001') OR
  (pp.unique_id IN ('PP-PROC-007', 'PP-KNOW-006') AND opp.unique_id = 'OPP-WF-002') OR
  (pp.unique_id IN ('PP-PROC-005', 'PP-PROC-006', 'PP-COMM-005') AND opp.unique_id = 'OPP-WF-003') OR
  (pp.unique_id IN ('PP-COMM-001', 'PP-KNOW-007') AND opp.unique_id = 'OPP-INSIGHT-001') OR
  (pp.unique_id IN ('PP-COMM-010', 'PP-RES-003') AND opp.unique_id = 'OPP-INSIGHT-002') OR
  (pp.unique_id IN ('PP-COMM-002', 'PP-TECH-009', 'PP-ORG-007') AND opp.unique_id = 'OPP-INSIGHT-003') OR
  (pp.unique_id IN ('PP-KNOW-004', 'PP-KNOW-009') AND opp.unique_id = 'OPP-TRAIN-001') OR
  (pp.unique_id IN ('PP-RES-004', 'PP-COMM-008') AND opp.unique_id = 'OPP-TRAIN-002') OR
  (pp.unique_id IN ('PP-KNOW-010', 'PP-COMP-003') AND opp.unique_id = 'OPP-TRAIN-003') OR
  (pp.unique_id IN ('PP-TECH-002', 'PP-TECH-009', 'PP-PROC-006') AND opp.unique_id = 'OPP-INTEG-001') OR
  (pp.unique_id IN ('PP-TECH-003') AND opp.unique_id = 'OPP-INTEG-002') OR
  (pp.unique_id IN ('PP-COMP-001', 'PP-COMP-006', 'PP-COMP-008') AND opp.unique_id = 'OPP-INTEG-003');

-- =====================================================================
-- PHASE 7: SHARED PAIN POINTS (Cross-Role)
-- =====================================================================

-- Create materialized view for shared pain points analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_shared_pain_points AS
SELECT
  pp.unique_id,
  pp.pain_point_name,
  pp.pain_category,
  pp.is_systemic,
  pp.solvability,
  -- Will be populated once personas are linked
  0 AS affected_role_count,
  ARRAY[]::TEXT[] AS affected_roles,
  ARRAY[]::TEXT[] AS affected_archetypes,
  0.0 AS avg_severity_score,
  pp.created_at
FROM ref_pain_points pp
WHERE pp.is_systemic = true;

COMMENT ON MATERIALIZED VIEW mv_shared_pain_points IS
'Refresh after persona_pain_points updates to identify high-value cross-role pain points';

-- =====================================================================
-- PHASE 8: INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_pain_points_category ON ref_pain_points(pain_category);
CREATE INDEX IF NOT EXISTS idx_pain_points_systemic ON ref_pain_points(is_systemic);
CREATE INDEX IF NOT EXISTS idx_pain_points_solvability ON ref_pain_points(solvability);
CREATE INDEX IF NOT EXISTS idx_archetype_pain_weights_category ON archetype_pain_weights(pain_category);
CREATE INDEX IF NOT EXISTS idx_vpanes_baselines_category ON vpanes_category_baselines(pain_category);

-- =====================================================================
-- PHASE 9: HELPER VIEWS
-- =====================================================================

-- View: Pain points by category with opportunity counts
CREATE OR REPLACE VIEW v_pain_points_with_opportunities AS
SELECT
  pp.unique_id,
  pp.pain_point_name,
  pp.pain_category,
  pp.impact_area,
  pp.is_systemic,
  pp.solvability,
  COUNT(DISTINCT ppo.opportunity_id) AS opportunity_count,
  ARRAY_AGG(DISTINCT o.opportunity_type) FILTER (WHERE o.opportunity_type IS NOT NULL) AS solution_types,
  MAX(ppo.resolution_effectiveness) AS max_resolution_effectiveness
FROM ref_pain_points pp
LEFT JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
LEFT JOIN ref_opportunities o ON ppo.opportunity_id = o.id
GROUP BY pp.id, pp.unique_id, pp.pain_point_name, pp.pain_category, pp.impact_area, pp.is_systemic, pp.solvability
ORDER BY pp.pain_category, pp.unique_id;

-- View: Archetype pain sensitivity matrix
CREATE OR REPLACE VIEW v_archetype_pain_sensitivity AS
SELECT
  a.archetype_name,
  apw.pain_category,
  apw.weight_multiplier,
  apw.rationale,
  CASE
    WHEN apw.weight_multiplier >= 1.8 THEN 'EXTREME'
    WHEN apw.weight_multiplier >= 1.5 THEN 'HIGH'
    WHEN apw.weight_multiplier >= 1.2 THEN 'MODERATE'
    WHEN apw.weight_multiplier >= 0.9 THEN 'NORMAL'
    ELSE 'LOW'
  END AS sensitivity_level
FROM archetype_pain_weights apw
JOIN ref_archetypes a ON apw.archetype_id = a.id
ORDER BY a.archetype_name, apw.pain_category;

-- View: VPANES scoring guide
CREATE OR REPLACE VIEW v_vpanes_scoring_guide AS
SELECT
  pain_category,
  visibility_baseline AS visibility_0_10,
  pain_baseline AS pain_intensity_0_10,
  actions_baseline AS actions_taken_0_10,
  needs_baseline AS need_urgency_0_10,
  emotions_baseline AS emotional_charge_0_10,
  scenarios_baseline AS scenario_specificity_0_10,
  (visibility_baseline + pain_baseline + actions_baseline +
   needs_baseline + emotions_baseline + scenarios_baseline) AS total_vpanes_score,
  rationale
FROM vpanes_category_baselines
ORDER BY
  (visibility_baseline + pain_baseline + actions_baseline +
   needs_baseline + emotions_baseline + scenarios_baseline) DESC;

-- =====================================================================
-- PHASE 10: VERIFICATION QUERIES
-- =====================================================================

-- Count pain points by category
SELECT
  pain_category,
  COUNT(*) AS pain_point_count,
  COUNT(*) FILTER (WHERE is_systemic = true) AS systemic_count,
  COUNT(*) FILTER (WHERE pharma_specific = true) AS pharma_specific_count
FROM ref_pain_points
GROUP BY pain_category
ORDER BY pain_category;

-- Show archetype sensitivity differences
SELECT
  pain_category,
  MAX(CASE WHEN archetype_name = 'AUTOMATOR' THEN weight_multiplier END) AS automator_weight,
  MAX(CASE WHEN archetype_name = 'ORCHESTRATOR' THEN weight_multiplier END) AS orchestrator_weight,
  MAX(CASE WHEN archetype_name = 'LEARNER' THEN weight_multiplier END) AS learner_weight,
  MAX(CASE WHEN archetype_name = 'SKEPTIC' THEN weight_multiplier END) AS skeptic_weight,
  MAX(weight_multiplier) - MIN(weight_multiplier) AS weight_variance
FROM v_archetype_pain_sensitivity
GROUP BY pain_category
ORDER BY weight_variance DESC;

-- Opportunity coverage analysis
SELECT
  o.opportunity_type,
  COUNT(DISTINCT ppo.pain_point_id) AS pain_points_addressed,
  ARRAY_AGG(DISTINCT pp.pain_category) AS categories_covered
FROM ref_opportunities o
LEFT JOIN pain_point_opportunities ppo ON o.id = ppo.opportunity_id
LEFT JOIN ref_pain_points pp ON ppo.pain_point_id = pp.id
GROUP BY o.opportunity_type
ORDER BY COUNT(DISTINCT ppo.pain_point_id) DESC;

-- =====================================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE ref_pain_points IS 'Master taxonomy of 60+ pain points across Medical Affairs roles';
COMMENT ON TABLE ref_pain_point_categories IS 'Hierarchical categorization: PROCESS, TECHNOLOGY, COMMUNICATION, COMPLIANCE, RESOURCE, KNOWLEDGE, ORGANIZATIONAL';
COMMENT ON TABLE archetype_pain_weights IS 'Archetype-specific pain sensitivity multipliers (0.8 - 2.0)';
COMMENT ON TABLE vpanes_category_baselines IS 'VPANES baseline scoring (0-10) by pain category for engagement potential';
COMMENT ON VIEW v_pain_points_with_opportunities IS 'Pain points mapped to solution opportunities';
COMMENT ON VIEW v_archetype_pain_sensitivity IS 'Archetype pain sensitivity matrix with severity levels';
COMMENT ON VIEW v_vpanes_scoring_guide IS 'VPANES scoring framework for user engagement assessment';

-- =====================================================================
-- END OF PAIN POINTS TAXONOMY SEED
-- =====================================================================

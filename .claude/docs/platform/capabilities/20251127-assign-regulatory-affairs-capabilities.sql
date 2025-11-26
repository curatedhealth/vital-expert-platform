-- ============================================================================
-- Regulatory Affairs: Agent Capability Assignments
-- File: 20251127-assign-regulatory-affairs-capabilities.sql
-- Purpose: Assign 50 capabilities to ~80 Regulatory Affairs agents
-- ============================================================================

-- Seed Capabilities (50)
INSERT INTO capabilities (id, name, description, category, created_at, updated_at)
VALUES
-- Leadership (4)
('CAP-RA-001', 'Chief Regulatory Officer Leadership', 'Executive-level regulatory leadership across enterprise', 'Leadership', NOW(), NOW()),
('CAP-RA-002', 'VP Regulatory Affairs Strategy', 'Regional/global regulatory strategy execution', 'Leadership', NOW(), NOW()),
('CAP-RA-003', 'Regulatory Affairs Directorate', 'Leading regulatory affairs for TA or region', 'Leadership', NOW(), NOW()),
('CAP-RA-004', 'Regulatory Project Management', 'Managing complex regulatory projects', 'Leadership', NOW(), NOW()),

-- Submissions (7)
('CAP-RA-005', 'IND/CTA Preparation & Management', 'Preparing IND/CTA applications', 'Submissions', NOW(), NOW()),
('CAP-RA-006', 'NDA/BLA Preparation & Submission', 'Preparing NDA/BLA submissions', 'Submissions', NOW(), NOW()),
('CAP-RA-007', 'MAA/Centralised Procedure Preparation', 'Preparing MAA for EMA', 'Submissions', NOW(), NOW()),
('CAP-RA-008', 'Global Registration Strategy', 'Multi-market registration strategy', 'Submissions', NOW(), NOW()),
('CAP-RA-009', 'Supplements & Variation Management', 'Managing post-approval changes', 'Submissions', NOW(), NOW()),
('CAP-RA-010', 'Orphan Drug Designation & Pediatric Plans', 'ODD and PIP/PSP preparation', 'Submissions', NOW(), NOW()),
('CAP-RA-011', 'Breakthrough & Expedited Pathways', 'Navigating expedited pathways', 'Submissions', NOW(), NOW()),

-- CMC Regulatory (5)
('CAP-RA-012', 'CMC Regulatory Strategy & Documentation', 'Module 3 CMC strategy', 'CMC', NOW(), NOW()),
('CAP-RA-013', 'Manufacturing & Facility Registration', 'Facility registration and DMFs', 'CMC', NOW(), NOW()),
('CAP-RA-014', 'Pharmaceutical Development & Specifications', 'Development justification and specs', 'CMC', NOW(), NOW()),
('CAP-RA-015', 'Comparability & Lifecycle Management (CMC)', 'CMC change management', 'CMC', NOW(), NOW()),
('CAP-RA-016', 'Biologics & Advanced Therapy Regulatory', 'Biologics and ATMP regulatory', 'CMC', NOW(), NOW()),

-- Labeling (4)
('CAP-RA-017', 'Core Labeling Development', 'Developing product labeling', 'Labeling', NOW(), NOW()),
('CAP-RA-018', 'Labeling Negotiation & Defense', 'Negotiating labeling with agencies', 'Labeling', NOW(), NOW()),
('CAP-RA-019', 'Global Labeling Harmonization', 'Harmonizing global labeling', 'Labeling', NOW(), NOW()),
('CAP-RA-020', 'Safety Labeling Updates', 'Managing safety labeling updates', 'Labeling', NOW(), NOW()),

-- Health Authority (4)
('CAP-RA-021', 'Pre-Submission Meetings & Scientific Advice', 'FDA/EMA meeting preparation', 'Agency', NOW(), NOW()),
('CAP-RA-022', 'Agency Query Response & Negotiation', 'Responding to agency queries', 'Agency', NOW(), NOW()),
('CAP-RA-023', 'Advisory Committee Preparation', 'Preparing for FDA AdComm', 'Agency', NOW(), NOW()),
('CAP-RA-024', 'Inspection Management & Agency Audit Support', 'Managing regulatory inspections', 'Agency', NOW(), NOW()),

-- Intelligence & Compliance (4)
('CAP-RA-025', 'Regulatory Intelligence & Horizon Scanning', 'Monitoring regulatory landscape', 'Intelligence', NOW(), NOW()),
('CAP-RA-026', 'Regulatory Compliance Monitoring', 'Monitoring ongoing compliance', 'Compliance', NOW(), NOW()),
('CAP-RA-027', 'Regulatory Policy & Advocacy', 'Engaging with policy development', 'Intelligence', NOW(), NOW()),
('CAP-RA-028', 'Regulatory Training & SOP Development', 'Developing regulatory training', 'Compliance', NOW(), NOW()),

-- Lifecycle (3)
('CAP-RA-029', 'Product Lifecycle Management (Regulatory)', 'Managing regulatory lifecycle', 'Lifecycle', NOW(), NOW()),
('CAP-RA-030', 'Post-Approval Commitments & Studies', 'Managing PMRs/PMCs', 'Lifecycle', NOW(), NOW()),
('CAP-RA-031', 'Regulatory Maintenance & Annual Reporting', 'Maintaining regulatory approvals', 'Lifecycle', NOW(), NOW()),

-- Risk Management (4)
('CAP-RA-032', 'Risk Management Planning (RMP/REMS)', 'Developing RMPs and REMS', 'Risk', NOW(), NOW()),
('CAP-RA-033', 'Regulatory Safety Reporting', 'Regulatory safety compliance', 'Risk', NOW(), NOW()),
('CAP-RA-034', 'Benefit-Risk Assessment (Regulatory)', 'Conducting benefit-risk assessments', 'Risk', NOW(), NOW()),
('CAP-RA-035', 'Crisis Management & Regulatory Issues', 'Managing regulatory crises', 'Risk', NOW(), NOW()),

-- Cross-Cutting (15)
('CAP-RA-036', 'Strategic Regulatory Thinking', 'Strategic regulatory thinking', 'Strategic', NOW(), NOW()),
('CAP-RA-037', 'Cross-Functional Regulatory Leadership', 'Regulatory leadership across functions', 'Strategic', NOW(), NOW()),
('CAP-RA-038', 'Regulatory Budget & Resource Management', 'Managing regulatory budgets', 'Strategic', NOW(), NOW()),
('CAP-RA-039', 'Regulatory Science & Guidelines Expertise', 'ICH and regulatory science expertise', 'Technical', NOW(), NOW()),
('CAP-RA-040', 'Regulatory Document Writing & Review', 'Regulatory writing excellence', 'Technical', NOW(), NOW()),
('CAP-RA-041', 'Clinical-Regulatory Integration', 'Integrating clinical and regulatory', 'Technical', NOW(), NOW()),
('CAP-RA-042', 'Data Analysis & Regulatory Interpretation', 'Analyzing data for regulatory', 'Technical', NOW(), NOW()),
('CAP-RA-043', 'Agency Communication & Relationship Management', 'Building agency relationships', 'Communication', NOW(), NOW()),
('CAP-RA-044', 'Regulatory Presentation & Advocacy', 'Presenting regulatory positions', 'Communication', NOW(), NOW()),
('CAP-RA-045', 'Global Regulatory Coordination', 'Coordinating global regulatory', 'Communication', NOW(), NOW()),
('CAP-RA-046', 'Regulatory Consulting & Advisory Services', 'Providing regulatory consultation', 'Communication', NOW(), NOW()),
('CAP-RA-047', 'Regulatory Systems & Technology Proficiency', 'Using regulatory systems', 'Operations', NOW(), NOW()),
('CAP-RA-048', 'Regulatory Quality & Compliance Assurance', 'Ensuring submission quality', 'Operations', NOW(), NOW()),
('CAP-RA-049', 'Regulatory Process Optimization', 'Optimizing regulatory processes', 'Operations', NOW(), NOW()),
('CAP-RA-050', 'Timeline Management & Critical Path', 'Managing regulatory timelines', 'Operations', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW();

-- Role-Based Assignments
DELETE FROM agent_capabilities WHERE agent_id IN (SELECT id FROM agents WHERE function_name = 'Regulatory Affairs');

-- Leadership Roles
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'expert'::expertise_level, true, NOW()
FROM agents a
CROSS JOIN UNNEST(ARRAY['CAP-RA-001', 'CAP-RA-036', 'CAP-RA-037', 'CAP-RA-038', 'CAP-RA-039', 'CAP-RA-043']) cap
WHERE a.function_name = 'Regulatory Affairs' AND a.role_name ILIKE '%Chief%' AND a.status = 'active';

-- Submissions Specialists
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'advanced'::expertise_level, true, NOW()
FROM agents a
CROSS JOIN UNNEST(ARRAY['CAP-RA-005', 'CAP-RA-006', 'CAP-RA-007', 'CAP-RA-039', 'CAP-RA-040', 'CAP-RA-047', 'CAP-RA-048', 'CAP-RA-050']) cap
WHERE a.function_name = 'Regulatory Affairs' 
  AND (a.role_name ILIKE '%Submission%' OR a.role_name ILIKE '%NDA%' OR a.role_name ILIKE '%IND%')
  AND a.status = 'active';

-- CMC Regulatory
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'advanced'::expertise_level, true, NOW()
FROM agents a
CROSS JOIN UNNEST(ARRAY['CAP-RA-012', 'CAP-RA-013', 'CAP-RA-014', 'CAP-RA-015', 'CAP-RA-039', 'CAP-RA-040', 'CAP-RA-048']) cap
WHERE a.function_name = 'Regulatory Affairs' AND a.role_name ILIKE '%CMC%' AND a.status = 'active';

-- Labeling Specialists
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'advanced'::expertise_level, true, NOW()
FROM agents a
CROSS JOIN UNNEST(ARRAY['CAP-RA-017', 'CAP-RA-018', 'CAP-RA-019', 'CAP-RA-020', 'CAP-RA-040', 'CAP-RA-043', 'CAP-RA-048']) cap
WHERE a.function_name = 'Regulatory Affairs' AND a.role_name ILIKE '%Label%' AND a.status = 'active';

-- L2 EXPERT Cross-Cutting
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'expert'::expertise_level, false, NOW()
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN UNNEST(ARRAY['CAP-RA-039', 'CAP-RA-040', 'CAP-RA-041', 'CAP-RA-043', 'CAP-RA-044']) cap
WHERE a.function_name = 'Regulatory Affairs' AND al.level_number = 2 AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- L3 SPECIALIST Cross-Cutting
INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary, created_at)
SELECT a.id, cap, 'advanced'::expertise_level, false, NOW()
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
CROSS JOIN UNNEST(ARRAY['CAP-RA-039', 'CAP-RA-040', 'CAP-RA-047', 'CAP-RA-048', 'CAP-RA-050']) cap
WHERE a.function_name = 'Regulatory Affairs' AND al.level_number = 3 AND a.status = 'active'
ON CONFLICT DO NOTHING;

-- Verification
DO $$
DECLARE
    total_agents INTEGER;
    agents_with_caps INTEGER;
    avg_caps NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_agents FROM agents WHERE function_name = 'Regulatory Affairs' AND status = 'active';
    SELECT COUNT(DISTINCT agent_id) INTO agents_with_caps 
    FROM agent_capabilities ac JOIN agents a ON ac.agent_id = a.id 
    WHERE a.function_name = 'Regulatory Affairs' AND a.status = 'active';
    SELECT AVG(cap_count) INTO avg_caps
    FROM (SELECT COUNT(*) as cap_count FROM agent_capabilities ac JOIN agents a ON ac.agent_id = a.id 
          WHERE a.function_name = 'Regulatory Affairs' AND a.status = 'active' GROUP BY ac.agent_id) sub;
    
    RAISE NOTICE '=== Regulatory Affairs Capability Assignment ===';
    RAISE NOTICE 'Total Agents: %', total_agents;
    RAISE NOTICE 'Agents with Capabilities: %', agents_with_caps;
    RAISE NOTICE 'Coverage: % %%', ROUND((agents_with_caps::NUMERIC / NULLIF(total_agents,0) * 100), 2);
    RAISE NOTICE 'Average Capabilities per Agent: %', ROUND(avg_caps, 1);
END $$;


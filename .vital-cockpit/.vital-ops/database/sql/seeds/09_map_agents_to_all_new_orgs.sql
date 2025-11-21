-- ============================================================================
-- MAP AGENTS TO ALL 5 NEW ORGANIZATIONS
-- Biotech, MedTech, Payers, Consulting, Individual
-- ============================================================================

-- Part 1: Map Agents → Biotech Roles
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{biotech_role_id}',
    to_jsonb(best_match.role_id::text)
)
FROM (
    SELECT DISTINCT ON (a2.id)
        a2.id as agent_id,
        r2.id as role_id
    FROM agents a2
    CROSS JOIN org_roles r2
    WHERE a2.is_active = true
        AND r2.unique_id LIKE 'ROLE-BIOTECH-%'
        AND (
            (a2.name LIKE '%biolog%' AND r2.role_name LIKE '%Biologist%')
            OR (a2.name LIKE '%protein%' AND r2.role_name = 'Protein Engineering Scientist')
            OR (a2.name LIKE '%cell%' AND r2.role_name = 'Cell Biology Scientist')
            OR (a2.name LIKE '%upstream%' AND r2.role_name = 'Upstream Process Engineer')
            OR (a2.name LIKE '%downstream%' AND r2.role_name = 'Downstream Process Engineer')
            OR (a2.name LIKE '%purification%' AND r2.role_name = 'Downstream Process Engineer')
            OR (a2.name LIKE '%analytical%' AND r2.role_name = 'Analytical Development Scientist')
            OR (a2.name LIKE '%cmc%' AND r2.role_name = 'Regulatory CMC Specialist')
            OR (a2.name LIKE '%biologic%' AND r2.role_name LIKE '%Biologics%')
            OR (a2.name LIKE '%mab%' AND r2.role_name = 'Protein Engineering Scientist')
            OR (a2.name LIKE '%antibody%' AND r2.role_name = 'Protein Engineering Scientist')
        )
    ORDER BY a2.id, r2.seniority_level DESC
) AS best_match
WHERE a.id = best_match.agent_id;

-- Part 2: Map Agents → MedTech Roles
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{medtech_role_id}',
    to_jsonb(best_match.role_id::text)
)
FROM (
    SELECT DISTINCT ON (a2.id)
        a2.id as agent_id,
        r2.id as role_id
    FROM agents a2
    CROSS JOIN org_roles r2
    WHERE a2.is_active = true
        AND r2.unique_id LIKE 'ROLE-MEDTECH-%'
        AND (
            (a2.name LIKE '%device%' AND r2.role_name LIKE '%Medical Device%')
            OR (a2.name LIKE '%biomedical%' AND r2.role_name = 'Biomedical Engineer')
            OR (a2.name LIKE '%mechanical%' AND r2.role_name = 'Mechanical Engineer')
            OR (a2.name LIKE '%electrical%' AND r2.role_name = 'Electrical Engineer')
            OR (a2.name LIKE '%510k%' AND r2.role_name LIKE '%Regulatory Affairs Manager - Devices%')
            OR (a2.name LIKE '%pma%' AND r2.role_name LIKE '%Regulatory%')
            OR (a2.name LIKE '%ce%mark%' AND r2.role_name LIKE '%Regulatory%')
            OR (a2.name LIKE '%design%control%' AND r2.role_name = 'Design Quality Engineer')
            OR (a2.name LIKE '%iso%13485%' AND r2.role_name = 'Quality Assurance Manager')
            OR (a2.name LIKE '%usability%' AND r2.role_name = 'Human Factors Engineer')
            OR (a2.name LIKE '%human%factor%' AND r2.role_name = 'Human Factors Engineer')
            OR (a2.name LIKE '%complaint%' AND r2.role_name = 'Complaints & Vigilance Specialist')
            OR (a2.name LIKE '%vigilance%' AND r2.role_name = 'Complaints & Vigilance Specialist')
            OR (a2.name LIKE '%capa%' AND r2.role_name = 'CAPA Specialist')
            OR (a2.name LIKE '%validation%' AND r2.role_name = 'Validation Engineer')
            OR (a2.name LIKE '%reimbursement%' AND r2.role_name = 'Reimbursement Specialist')
        )
    ORDER BY a2.id, r2.seniority_level DESC
) AS best_match
WHERE a.id = best_match.agent_id;

-- Part 3: Map Agents → Payer Roles
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{payer_role_id}',
    to_jsonb(best_match.role_id::text)
)
FROM (
    SELECT DISTINCT ON (a2.id)
        a2.id as agent_id,
        r2.id as role_id
    FROM agents a2
    CROSS JOIN org_roles r2
    WHERE a2.is_active = true
        AND r2.unique_id LIKE 'ROLE-PAYER-%'
        AND (
            (a2.name LIKE '%payer%' AND r2.role_name LIKE '%Medical Director%')
            OR (a2.name LIKE '%pharmacy%' AND r2.role_name LIKE '%Pharmacy%')
            OR (a2.name LIKE '%formulary%' AND r2.role_name = 'Clinical Pharmacist')
            OR (a2.name LIKE '%pbm%' AND r2.role_name = 'Pharmacy Director')
            OR (a2.name LIKE '%medical%policy%' AND r2.role_name = 'Medical Policy Writer')
            OR (a2.name LIKE '%heor%' AND r2.role_name = 'HEOR Director')
            OR (a2.name LIKE '%value%assessment%' AND r2.role_name = 'Value Assessment Manager')
            OR (a2.name LIKE '%pricing%' AND r2.role_name = 'Pricing Analyst')
            OR (a2.name LIKE '%contract%' AND r2.role_name = 'Contracting Manager - Pharma')
            OR (a2.name LIKE '%prior%auth%' AND r2.role_name = 'Prior Authorization Nurse')
            OR (a2.name LIKE '%utilization%' AND r2.role_name LIKE '%Utilization Management%')
            OR (a2.name LIKE '%claims%' AND r2.role_name = 'Claims Data Analyst')
            OR (a2.name LIKE '%actuarial%' AND r2.role_name = 'Actuarial Analyst')
            OR (a2.name LIKE '%hedis%' AND r2.role_name = 'Quality & Accreditation Manager')
        )
    ORDER BY a2.id, r2.seniority_level DESC
) AS best_match
WHERE a.id = best_match.agent_id;

-- Part 4: Map Agents → Consulting Roles
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{consulting_role_id}',
    to_jsonb(best_match.role_id::text)
)
FROM (
    SELECT DISTINCT ON (a2.id)
        a2.id as agent_id,
        r2.id as role_id
    FROM agents a2
    CROSS JOIN org_roles r2
    WHERE a2.is_active = true
        AND r2.unique_id LIKE 'ROLE-CONSULT-%'
        AND (
            (a2.name LIKE '%consult%' AND r2.role_name LIKE '%Consultant%')
            OR (a2.name LIKE '%advisor%' AND r2.role_name LIKE '%Consultant%')
            OR (a2.name LIKE '%strategy%' AND r2.role_name = 'Strategy Consultant')
            OR (a2.name LIKE '%business%development%' AND r2.role_name = 'Business Development Consultant')
            OR (a2.name LIKE '%market%access%' AND r2.role_name = 'Market Access Consultant')
            OR (a2.name LIKE '%heor%' AND r2.role_name = 'HEOR Director')
            OR (a2.name LIKE '%value%dossier%' AND r2.role_name = 'Value Dossier Lead')
            OR (a2.name LIKE '%regulatory%' AND r2.role_name LIKE '%Regulatory%Consultant%')
            OR (a2.name LIKE '%clinical%' AND r2.role_name = 'Clinical Strategy Consultant')
            OR (a2.name LIKE '%digital%health%' AND r2.role_name = 'Digital Health Strategy Consultant')
            OR (a2.name LIKE '%dtx%' AND r2.role_name = 'Digital Health Strategy Consultant')
            OR (a2.name LIKE '%rwe%' AND r2.role_name = 'RWE Consultant')
            OR (a2.name LIKE '%real%world%' AND r2.role_name = 'RWE Consultant')
            OR (a2.name LIKE '%data%science%' AND r2.role_name = 'Data Science Consultant')
            OR (a2.name LIKE '%quality%' AND r2.role_name = 'Quality Systems Consultant')
        )
    ORDER BY a2.id, r2.seniority_level DESC
) AS best_match
WHERE a.id = best_match.agent_id;

-- Part 5: Map Agents → Individual/Freelance Roles
UPDATE agents a
SET metadata = jsonb_set(
    COALESCE(a.metadata, '{}'::jsonb),
    '{individual_role_id}',
    to_jsonb(best_match.role_id::text)
)
FROM (
    SELECT DISTINCT ON (a2.id)
        a2.id as agent_id,
        r2.id as role_id
    FROM agents a2
    CROSS JOIN org_roles r2
    WHERE a2.is_active = true
        AND r2.unique_id LIKE 'ROLE-IND-%'
        AND (
            (a2.name LIKE '%freelance%' AND r2.role_name LIKE '%Freelance%')
            OR (a2.name LIKE '%contract%' AND r2.role_name LIKE '%Contract%')
            OR (a2.name LIKE '%independent%' AND r2.role_name LIKE '%Consultant%')
            OR (a2.name LIKE '%cra%' AND r2.role_name = 'CRA / Data Monitor')
            OR (a2.name LIKE '%medical%writer%' AND r2.role_name LIKE '%Medical Writer%')
            OR (a2.name LIKE '%biostatistic%' AND r2.role_name = 'Biostatistician - Freelance')
            OR (a2.name LIKE '%data%manager%' AND r2.role_name = 'Clinical Data Manager')
            OR (a2.name LIKE '%sas%' AND r2.role_name = 'SAS Programmer')
            OR (a2.name LIKE '%programmer%' AND r2.role_name = 'SAS Programmer')
            OR (a2.name LIKE '%regulatory%' AND r2.role_name = 'Regulatory Affairs Freelancer')
            OR (a2.name LIKE '%safety%' AND r2.role_name = 'Safety Scientist - Contract')
            OR (a2.name LIKE '%project%manager%' AND r2.role_name = 'Project Manager - Contract')
            OR (a2.name LIKE '%qa%' AND r2.role_name = 'QA Auditor')
            OR (a2.name LIKE '%interim%' AND r2.role_name = 'Interim Manager')
        )
    ORDER BY a2.id, r2.seniority_level DESC
) AS best_match
WHERE a.id = best_match.agent_id;

-- Final Summary
SELECT 
    '✅ ALL 5 ORGANIZATIONS MAPPED' as status,
    COUNT(*) FILTER (WHERE metadata->>'biotech_role_id' IS NOT NULL) as biotech_mapped,
    COUNT(*) FILTER (WHERE metadata->>'medtech_role_id' IS NOT NULL) as medtech_mapped,
    COUNT(*) FILTER (WHERE metadata->>'payer_role_id' IS NOT NULL) as payer_mapped,
    COUNT(*) FILTER (WHERE metadata->>'consulting_role_id' IS NOT NULL) as consulting_mapped,
    COUNT(*) FILTER (WHERE metadata->>'individual_role_id' IS NOT NULL) as individual_mapped,
    COUNT(*) as total_agents
FROM agents
WHERE is_active = true;


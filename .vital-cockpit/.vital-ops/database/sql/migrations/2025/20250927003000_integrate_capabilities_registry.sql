-- Integrate Capabilities Registry with Agents
-- Migrate from TEXT[] capabilities to proper agent_capabilities relationships

-- First, let's populate some essential healthcare capabilities if they don't exist
INSERT INTO capabilities (
    name, display_name, description, category, domain, complexity_level, status, icon, color
) VALUES
    -- Clinical Assessment Capabilities
    ('comprehensive_health_assessment', 'Comprehensive Health Assessment',
     'Conduct thorough health evaluations including:\n• Complete medical history review\n• Physical examination interpretation\n• Risk factor analysis\n• Diagnostic test recommendations\n• Care plan development',
     'clinical', 'healthcare', 'advanced', 'active', '🏥', 'text-medical-blue'),

    ('symptom_evaluation', 'Symptom Evaluation & Triage',
     'Systematically evaluate symptoms and provide guidance:\n• Symptom pattern analysis\n• Severity assessment\n• Red flag identification\n• Triage recommendations\n• Differential diagnosis support',
     'clinical', 'healthcare', 'advanced', 'active', '🔍', 'text-diagnostic-green'),

    ('medical_information_provision', 'Medical Information Provision',
     'Provide evidence-based medical information:\n• Current medical literature synthesis\n• Treatment option explanations\n• Drug information and interactions\n• Medical procedure explanations\n• Patient education materials',
     'education', 'healthcare', 'intermediate', 'active', '📚', 'text-education-purple'),

    ('treatment_guidance', 'Treatment Guidance & Recommendations',
     'Evidence-based treatment recommendations:\n• Clinical guideline compliance\n• Personalized treatment plans\n• Medication management\n• Therapy recommendations\n• Follow-up care planning',
     'clinical', 'healthcare', 'expert', 'active', '💊', 'text-treatment-orange'),

    ('preventive_care_planning', 'Preventive Care Planning',
     'Comprehensive preventive healthcare strategies:\n• Screening recommendations\n• Vaccination schedules\n• Lifestyle modification plans\n• Risk reduction strategies\n• Health maintenance protocols',
     'prevention', 'healthcare', 'intermediate', 'active', '🛡️', 'text-prevention-teal'),

    ('health_education', 'Health Education & Counseling',
     'Patient and provider education:\n• Health literacy improvement\n• Disease process explanation\n• Self-management training\n• Behavioral change support\n• Educational resource curation',
     'education', 'healthcare', 'intermediate', 'active', '🎓', 'text-education-blue'),

    ('care_coordination', 'Care Coordination & Management',
     'Comprehensive care coordination:\n• Multi-provider communication\n• Care transition management\n• Resource allocation\n• Follow-up scheduling\n• Care plan synchronization',
     'coordination', 'healthcare', 'advanced', 'active', '🤝', 'text-coordination-green'),

    ('risk_stratification', 'Risk Stratification & Assessment',
     'Clinical and population health risk analysis:\n• Risk factor quantification\n• Population health metrics\n• Predictive modeling\n• Risk mitigation strategies\n• Outcome prediction',
     'analytics', 'healthcare', 'expert', 'active', '📊', 'text-analytics-red'),

    ('wellness_counseling', 'Wellness & Lifestyle Counseling',
     'Holistic wellness guidance:\n• Nutrition counseling\n• Exercise prescription\n• Stress management\n• Sleep optimization\n• Behavioral health support',
     'wellness', 'healthcare', 'intermediate', 'active', '🌟', 'text-wellness-green'),

    ('chronic_disease_management', 'Chronic Disease Management',
     'Comprehensive chronic condition support:\n• Disease monitoring protocols\n• Medication adherence support\n• Symptom tracking\n• Complication prevention\n• Quality of life optimization',
     'chronic_care', 'healthcare', 'expert', 'active', '📈', 'text-chronic-blue'),

    -- Regulatory Capabilities
    ('fda_regulatory_guidance', 'FDA Regulatory Guidance',
     'Expert FDA regulatory consultation:\n• Pathway determination (510k, PMA, De Novo)\n• Submission strategy development\n• Predicate device analysis\n• Clinical trial requirements\n• Post-market obligations',
     'regulatory', 'medical_devices', 'expert', 'active', '🏛️', 'text-regulatory-blue'),

    ('clinical_trial_design', 'Clinical Trial Design & Management',
     'Comprehensive clinical research support:\n• Protocol development\n• Endpoint selection\n• Statistical planning\n• Regulatory compliance\n• Quality management',
     'research', 'clinical_trials', 'expert', 'active', '🔬', 'text-research-purple'),

    ('digital_health_validation', 'Digital Health Solution Validation',
     'DTx and digital health expertise:\n• Evidence generation strategies\n• Clinical validation design\n• User engagement optimization\n• Regulatory pathway guidance\n• Market access planning',
     'digital_health', 'technology', 'expert', 'active', '📱', 'text-digital-teal'),

    ('hipaa_compliance_management', 'HIPAA Compliance Management',
     'Comprehensive privacy and security:\n• PHI protection protocols\n• Risk assessment procedures\n• Incident response planning\n• Training program development\n• Audit compliance',
     'compliance', 'privacy', 'expert', 'active', '🔒', 'text-security-red'),

    ('health_economics_analysis', 'Health Economics & Outcomes Research',
     'HEOR and market access expertise:\n• Cost-effectiveness analysis\n• Budget impact modeling\n• Real-world evidence generation\n• Value proposition development\n• Payer engagement strategy',
     'economics', 'market_access', 'expert', 'active', '💰', 'text-economics-gold')

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Create a function to migrate agent capabilities from TEXT[] to relationships
CREATE OR REPLACE FUNCTION migrate_agent_capabilities_to_registry()
RETURNS INTEGER AS $$
DECLARE
    agent_rec RECORD;
    capability_name TEXT;
    capability_id UUID;
    links_created INTEGER := 0;
BEGIN
    -- Loop through all agents that have capabilities as TEXT[]
    FOR agent_rec IN
        SELECT id, name, display_name, capabilities
        FROM agents
        WHERE capabilities IS NOT NULL AND array_length(capabilities, 1) > 0
    LOOP
        -- Process each capability in the array
        FOREACH capability_name IN ARRAY agent_rec.capabilities
        LOOP
            -- Find the capability ID from the registry
            SELECT id INTO capability_id
            FROM capabilities
            WHERE name = capability_name
            AND status = 'active';

            -- If capability exists in registry, create the relationship
            IF capability_id IS NOT NULL THEN
                INSERT INTO agent_capabilities (agent_id, capability_id, proficiency_level, is_primary)
                VALUES (agent_rec.id, capability_id, 'advanced', true)
                ON CONFLICT (agent_id, capability_id) DO NOTHING;

                links_created := links_created + 1;
            ELSE
                -- Log missing capabilities for manual review
                RAISE NOTICE 'Capability not found in registry: % for agent %', capability_name, agent_rec.name;
            END IF;
        END LOOP;
    END LOOP;

    RETURN links_created;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_agent_capabilities_to_registry() as capabilities_migrated;

-- Create function to get agent capabilities with full details
CREATE OR REPLACE FUNCTION get_agent_capabilities_detailed(agent_name_param TEXT)
RETURNS TABLE (
    capability_id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    category TEXT,
    domain TEXT,
    complexity_level TEXT,
    proficiency_level TEXT,
    is_primary BOOLEAN,
    icon TEXT,
    color TEXT,
    bullet_points TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id as capability_id,
        c.name,
        c.display_name,
        c.description,
        c.category,
        c.domain,
        c.complexity_level,
        ac.proficiency_level,
        ac.is_primary,
        c.icon,
        c.color,
        -- Extract bullet points from description
        CASE
            WHEN c.description LIKE '%•%' THEN
                string_to_array(
                    regexp_replace(c.description, '.*:\n', ''),
                    '\n• '
                )
            ELSE
                ARRAY[c.description]
        END as bullet_points
    FROM capabilities c
    INNER JOIN agent_capabilities ac ON c.id = ac.capability_id
    INNER JOIN agents a ON ac.agent_id = a.id
    WHERE (a.name = agent_name_param OR a.display_name = agent_name_param)
    AND c.status = 'active'
    ORDER BY ac.is_primary DESC, c.complexity_level, c.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all available capabilities for selection
CREATE OR REPLACE FUNCTION get_available_capabilities()
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    category TEXT,
    domain TEXT,
    complexity_level TEXT,
    icon TEXT,
    color TEXT,
    bullet_points TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.display_name,
        c.description,
        c.category,
        c.domain,
        c.complexity_level,
        c.icon,
        c.color,
        -- Extract bullet points from description
        CASE
            WHEN c.description LIKE '%•%' THEN
                string_to_array(
                    regexp_replace(c.description, '.*:\n', ''),
                    '\n• '
                )
            ELSE
                ARRAY[c.description]
        END as bullet_points
    FROM capabilities c
    WHERE c.status = 'active'
    ORDER BY c.category, c.complexity_level, c.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy capability management
CREATE OR REPLACE VIEW agent_capabilities_detailed_view AS
SELECT
    a.id as agent_id,
    a.name as agent_name,
    a.display_name as agent_display_name,
    a.tier,
    CASE
        WHEN a.tier = 0 THEN 'Core'
        WHEN a.tier = 1 THEN 'Tier 1'
        WHEN a.tier = 2 THEN 'Tier 2'
        WHEN a.tier = 3 THEN 'Tier 3'
        ELSE 'Unknown'
    END as tier_label,
    a.status as lifecycle_stage,
    c.id as capability_id,
    c.name as capability_name,
    c.display_name as capability_display_name,
    c.description,
    c.category,
    c.domain,
    c.complexity_level,
    ac.proficiency_level,
    ac.is_primary,
    c.icon,
    c.color,
    ac.usage_count,
    ac.success_rate,
    ac.created_at as linked_at
FROM agents a
INNER JOIN agent_capabilities ac ON a.id = ac.agent_id
INNER JOIN capabilities c ON ac.capability_id = c.id
WHERE a.status = 'active' AND c.status = 'active'
ORDER BY a.name, ac.is_primary DESC, c.category, c.display_name;

-- Grant permissions
GRANT SELECT ON agent_capabilities_detailed_view TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_capabilities_detailed(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_capabilities() TO authenticated, anon;

-- Add comments
COMMENT ON FUNCTION get_agent_capabilities_detailed(TEXT) IS 'Get detailed capabilities for a specific agent with bullet points';
COMMENT ON FUNCTION get_available_capabilities() IS 'Get all available capabilities for agent assignment';
COMMENT ON VIEW agent_capabilities_detailed_view IS 'Comprehensive view of agent-capability relationships';

-- Show summary
SELECT
    'Migration Summary' as summary,
    COUNT(DISTINCT agent_id) as agents_with_capabilities,
    COUNT(*) as total_capability_links,
    COUNT(DISTINCT capability_id) as unique_capabilities_used
FROM agent_capabilities;
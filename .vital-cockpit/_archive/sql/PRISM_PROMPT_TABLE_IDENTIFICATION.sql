-- ============================================================================
-- PRISM Prompt View - Complete Table Identification Query
-- Purpose: Identify all tables and their relationships behind the PRISM Prompt view
-- Date: November 2, 2025
-- ============================================================================

-- ============================================================================
-- 1. CORE PRISM PROMPT TABLES
-- ============================================================================

-- Main prompts table with PRISM enhancements
SELECT 
    'prompts' as table_name,
    'Core prompt definitions with PRISM™ framework support' as description,
    COUNT(*) as row_count
FROM prompts
UNION ALL

-- Prompt systems (PRISM™ Acronym, VITAL Path AI Agents, Digital Health Structured)
SELECT 
    'prompt_systems' as table_name,
    'Different prompt systems (PRISM™ Acronym, VITAL Path, etc.)' as description,
    COUNT(*) as row_count
FROM prompt_systems
UNION ALL

-- Prompt domains (Healthcare domains)
SELECT 
    'prompt_domains' as table_name,
    'Healthcare domains (Medical Affairs, Compliance, Commercial, etc.)' as description,
    COUNT(*) as row_count
FROM prompt_domains
UNION ALL

-- Complexity levels
SELECT 
    'complexity_levels' as table_name,
    'Complexity levels with time estimates and user requirements' as description,
    COUNT(*) as row_count
FROM complexity_levels
UNION ALL

-- Prompt categories (subcategories within domains)
SELECT 
    'prompt_categories' as table_name,
    'Subcategories within domains for better organization' as description,
    COUNT(*) as row_count
FROM prompt_categories
UNION ALL

-- Prompt variables (dynamic placeholders)
SELECT 
    'prompt_variables' as table_name,
    'Variable placeholders for dynamic prompt generation' as description,
    COUNT(*) as row_count
FROM prompt_variables
UNION ALL

-- Prompt relationships (dependencies)
SELECT 
    'prompt_relationships' as table_name,
    'Relationships between prompts (prerequisites, follow-ups, etc.)' as description,
    COUNT(*) as row_count
FROM prompt_relationships
UNION ALL

-- Prompt templates (reusable components)
SELECT 
    'prompt_templates' as table_name,
    'Reusable components for building prompts' as description,
    COUNT(*) as row_count
FROM prompt_templates
UNION ALL

-- Prompt usage analytics
SELECT 
    'prompt_usage_analytics' as table_name,
    'Analytics and feedback for prompt usage' as description,
    COUNT(*) as row_count
FROM prompt_usage_analytics;

-- ============================================================================
-- 2. EXTENDED PRISM TABLES (from RAG schema)
-- ============================================================================

-- PRISM prompts table (from RAG schema if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prism_prompts') THEN
        RAISE NOTICE 'prism_prompts table exists - specialized PRISM prompt library';
    END IF;
END $$;

-- ============================================================================
-- 3. DETAILED COLUMN STRUCTURE FOR MAIN PROMPTS TABLE
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'id' THEN 'Primary key'
        WHEN column_name = 'name' THEN 'Unique prompt identifier'
        WHEN column_name = 'display_name' THEN 'User-friendly name'
        WHEN column_name = 'description' THEN 'Prompt description'
        WHEN column_name = 'domain' THEN 'Healthcare domain'
        WHEN column_name = 'acronym' THEN 'PRISM™ acronym (e.g., PLAN, WRITE, REVIEW)'
        WHEN column_name = 'system_prompt' THEN 'System-level instructions'
        WHEN column_name = 'user_prompt_template' THEN 'User-facing prompt template'
        WHEN column_name = 'framework_components' THEN 'JSONB - Analysis steps, deliverables, etc.'
        WHEN column_name = 'target_users' THEN 'Array of target user types'
        WHEN column_name = 'use_cases' THEN 'Array of primary use cases'
        WHEN column_name = 'prompt_system_id' THEN 'FK to prompt_systems'
        WHEN column_name = 'domain_id' THEN 'FK to prompt_domains'
        WHEN column_name = 'category_id' THEN 'FK to prompt_categories'
        WHEN column_name = 'complexity_level_id' THEN 'FK to complexity_levels'
        ELSE ''
    END as prism_description
FROM information_schema.columns
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. FOREIGN KEY RELATIONSHIPS
-- ============================================================================

SELECT 
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN (
    'prompts',
    'prompt_systems',
    'prompt_domains',
    'prompt_categories',
    'complexity_levels',
    'prompt_variables',
    'prompt_relationships',
    'prompt_templates',
    'prompt_usage_analytics'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 5. SAMPLE PRISM PROMPT QUERY
-- ============================================================================

-- Get all PRISM™ prompts with full metadata
SELECT 
    p.id,
    p.name,
    p.display_name,
    p.acronym as prism_acronym,
    p.domain,
    ps.display_name as prompt_system,
    pd.display_name as domain_name,
    pc.display_name as category_name,
    cl.display_name as complexity,
    cl.typical_time_min,
    cl.typical_time_max,
    p.target_users,
    p.use_cases,
    p.regulatory_requirements,
    p.is_active,
    p.version,
    p.created_at
FROM prompts p
LEFT JOIN prompt_systems ps ON p.prompt_system_id = ps.id
LEFT JOIN prompt_domains pd ON p.domain_id = pd.id
LEFT JOIN prompt_categories pc ON p.category_id = pc.id
LEFT JOIN complexity_levels cl ON p.complexity_level_id = cl.id
WHERE p.acronym IS NOT NULL -- Filter for PRISM™ acronym prompts
ORDER BY p.domain, p.name
LIMIT 20;

-- ============================================================================
-- 6. PRISM PROMPT WITH VARIABLES
-- ============================================================================

-- Get a specific PRISM™ prompt with all its variables
SELECT 
    p.name as prompt_name,
    p.display_name,
    p.acronym as prism_acronym,
    pv.variable_name,
    pv.display_name as variable_display_name,
    pv.variable_type,
    pv.is_required,
    pv.default_value,
    pv.description as variable_description,
    pv.options
FROM prompts p
INNER JOIN prompt_variables pv ON p.id = pv.prompt_id
WHERE p.acronym = 'PLAN' -- Example: PRISM PLAN
ORDER BY pv.sort_order;

-- ============================================================================
-- 7. PRISM PROMPT RELATIONSHIPS
-- ============================================================================

-- Get prompt relationships (prerequisites, follow-ups, etc.)
SELECT 
    p1.name as parent_prompt,
    p1.display_name as parent_display_name,
    pr.relationship_type,
    p2.name as child_prompt,
    p2.display_name as child_display_name,
    pr.is_required,
    pr.description
FROM prompt_relationships pr
INNER JOIN prompts p1 ON pr.parent_prompt_id = p1.id
INNER JOIN prompts p2 ON pr.child_prompt_id = p2.id
WHERE p1.acronym IS NOT NULL OR p2.acronym IS NOT NULL
ORDER BY p1.name, pr.relationship_type;

-- ============================================================================
-- 8. PRISM USAGE ANALYTICS
-- ============================================================================

-- Get usage statistics for PRISM™ prompts
SELECT 
    p.name,
    p.display_name,
    p.acronym as prism_acronym,
    COUNT(pua.id) as usage_count,
    AVG(pua.success_rating) as avg_rating,
    AVG(pua.execution_time_seconds) as avg_execution_time,
    COUNT(CASE WHEN pua.completion_status = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN pua.completion_status = 'failed' THEN 1 END) as failed_count
FROM prompts p
LEFT JOIN prompt_usage_analytics pua ON p.id = pua.prompt_id
WHERE p.acronym IS NOT NULL
GROUP BY p.id, p.name, p.display_name, p.acronym
ORDER BY usage_count DESC
LIMIT 20;

-- ============================================================================
-- 9. COMPREHENSIVE PRISM VIEW QUERY
-- ============================================================================

-- This query recreates the complete PRISM prompt view structure
SELECT 
    p.id,
    p.name,
    p.display_name,
    p.description,
    p.acronym,
    
    -- System and Domain
    ps.name as prompt_system,
    ps.display_name as prompt_system_display,
    pd.name as domain,
    pd.display_name as domain_display,
    pc.name as category,
    pc.display_name as category_display,
    
    -- Complexity
    cl.name as complexity,
    cl.display_name as complexity_display,
    cl.typical_time_min,
    cl.typical_time_max,
    cl.user_level,
    
    -- Prompt Content
    p.system_prompt,
    p.user_prompt_template,
    p.input_schema,
    p.output_schema,
    
    -- PRISM Framework
    p.framework_components,
    p.target_users,
    p.use_cases,
    p.regulatory_requirements,
    p.integration_points,
    p.customization_guide,
    p.quality_assurance,
    
    -- Quality Metrics
    p.success_criteria,
    p.validation_rules,
    p.estimated_tokens,
    p.estimated_duration_hours,
    
    -- Prerequisites
    p.prerequisite_capabilities,
    p.prerequisite_prompts,
    p.model_requirements,
    
    -- Metadata
    p.compliance_tags,
    p.tags,
    p.version,
    p.is_active,
    p.created_at,
    p.updated_at,
    
    -- Variable Count
    (SELECT COUNT(*) FROM prompt_variables WHERE prompt_id = p.id) as variable_count,
    
    -- Relationship Counts
    (SELECT COUNT(*) FROM prompt_relationships WHERE parent_prompt_id = p.id) as child_prompt_count,
    (SELECT COUNT(*) FROM prompt_relationships WHERE child_prompt_id = p.id) as parent_prompt_count,
    
    -- Usage Stats
    (SELECT COUNT(*) FROM prompt_usage_analytics WHERE prompt_id = p.id) as total_usages,
    (SELECT AVG(success_rating) FROM prompt_usage_analytics WHERE prompt_id = p.id) as avg_rating
    
FROM prompts p
LEFT JOIN prompt_systems ps ON p.prompt_system_id = ps.id
LEFT JOIN prompt_domains pd ON p.domain_id = pd.id
LEFT JOIN prompt_categories pc ON p.category_id = pc.id
LEFT JOIN complexity_levels cl ON p.complexity_level_id = cl.id
WHERE p.is_active = true
ORDER BY p.domain, p.name;

-- ============================================================================
-- 10. TABLE INDEXES FOR PRISM PROMPTS
-- ============================================================================

-- List all indexes on PRISM-related tables
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'prompts',
    'prompt_systems',
    'prompt_domains',
    'prompt_categories',
    'complexity_levels',
    'prompt_variables',
    'prompt_relationships',
    'prompt_templates',
    'prompt_usage_analytics'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- 11. QUICK REFERENCE QUERIES
-- ============================================================================

-- Count of prompts by system
SELECT 
    ps.display_name as system,
    COUNT(p.id) as prompt_count
FROM prompt_systems ps
LEFT JOIN prompts p ON ps.id = p.prompt_system_id
GROUP BY ps.id, ps.display_name
ORDER BY prompt_count DESC;

-- Count of prompts by domain
SELECT 
    pd.display_name as domain,
    COUNT(p.id) as prompt_count
FROM prompt_domains pd
LEFT JOIN prompts p ON pd.id = p.domain_id
GROUP BY pd.id, pd.display_name
ORDER BY prompt_count DESC;

-- Count of prompts by complexity
SELECT 
    cl.display_name as complexity,
    cl.typical_time_min,
    cl.typical_time_max,
    COUNT(p.id) as prompt_count
FROM complexity_levels cl
LEFT JOIN prompts p ON cl.id = p.complexity_level_id
GROUP BY cl.id, cl.display_name, cl.typical_time_min, cl.typical_time_max
ORDER BY cl.sort_order;

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
PRISM PROMPT VIEW STRUCTURE:

Core Tables (9):
1. prompts - Main prompt definitions with PRISM™ enhancements
2. prompt_systems - Different prompt systems (PRISM™ Acronym, VITAL Path AI, etc.)
3. prompt_domains - Healthcare domains (Medical Affairs, Compliance, etc.)
4. prompt_categories - Subcategories within domains
5. complexity_levels - Complexity levels with time estimates
6. prompt_variables - Variable placeholders for dynamic prompts
7. prompt_relationships - Dependencies between prompts
8. prompt_templates - Reusable prompt components
9. prompt_usage_analytics - Usage statistics and feedback

Key PRISM™-Specific Columns in prompts table:
- acronym: PRISM™ acronym (PLAN, WRITE, REVIEW, etc.)
- framework_components: JSON structure for analysis steps
- target_users: Array of target user types
- use_cases: Array of primary use cases
- regulatory_requirements: Compliance requirements
- integration_points: System integration details

Foreign Key Relationships:
- prompts.prompt_system_id → prompt_systems.id
- prompts.domain_id → prompt_domains.id
- prompts.category_id → prompt_categories.id
- prompts.complexity_level_id → complexity_levels.id
- prompt_variables.prompt_id → prompts.id
- prompt_relationships.parent_prompt_id → prompts.id
- prompt_relationships.child_prompt_id → prompts.id
- prompt_usage_analytics.prompt_id → prompts.id

Indexes:
- Primary key indexes on all tables
- Foreign key indexes for relationships
- GIN indexes on array columns (target_users, use_cases, etc.)
- Performance indexes on frequently queried columns

RLS (Row-Level Security):
- Enabled on all tables
- Public read access to active prompts
- Authenticated users can create/update their own prompts
- Admin policies for system management
*/


-- ============================================================================
-- Map PROMPTS™ Framework to Organizational Structure
-- ============================================================================
-- Purpose: Link prompt suites/sub-suites to business functions and departments
-- Version: 1.0.0
-- Date: 2025-01-17
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CREATE JUNCTION TABLES
-- ----------------------------------------------------------------------------

-- Link Prompt Suites to Business Functions
CREATE TABLE IF NOT EXISTS suite_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,

    is_primary BOOLEAN DEFAULT FALSE,
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(suite_id, function_id)
);

CREATE INDEX idx_suite_functions_suite ON suite_functions(suite_id);
CREATE INDEX idx_suite_functions_function ON suite_functions(function_id);

-- Link Prompt Suites to Departments
CREATE TABLE IF NOT EXISTS suite_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,

    is_primary BOOLEAN DEFAULT FALSE,
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(suite_id, department_id)
);

CREATE INDEX idx_suite_departments_suite ON suite_departments(suite_id);
CREATE INDEX idx_suite_departments_department ON suite_departments(department_id);

-- Link Prompt Sub-Suites to Business Functions
CREATE TABLE IF NOT EXISTS sub_suite_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_suite_id UUID NOT NULL REFERENCES prompt_sub_suites(id) ON DELETE CASCADE,
    function_id UUID NOT NULL REFERENCES org_functions(id) ON DELETE CASCADE,

    is_primary BOOLEAN DEFAULT FALSE,
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(sub_suite_id, function_id)
);

CREATE INDEX idx_sub_suite_functions_sub_suite ON sub_suite_functions(sub_suite_id);
CREATE INDEX idx_sub_suite_functions_function ON sub_suite_functions(function_id);

-- Link Prompt Sub-Suites to Departments
CREATE TABLE IF NOT EXISTS sub_suite_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sub_suite_id UUID NOT NULL REFERENCES prompt_sub_suites(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,

    is_primary BOOLEAN DEFAULT FALSE,
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(sub_suite_id, department_id)
);

CREATE INDEX idx_sub_suite_departments_sub_suite ON sub_suite_departments(sub_suite_id);
CREATE INDEX idx_sub_suite_departments_department ON sub_suite_departments(department_id);

-- ----------------------------------------------------------------------------
-- 2. CREATE HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to get suite ID by code
CREATE OR REPLACE FUNCTION get_suite_id(suite_code_param TEXT)
RETURNS UUID AS $$
DECLARE
    suite_uuid UUID;
BEGIN
    SELECT id INTO suite_uuid
    FROM prompt_suites
    WHERE suite_code = suite_code_param;
    RETURN suite_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get function ID by slug
CREATE OR REPLACE FUNCTION get_function_id(function_slug_param TEXT)
RETURNS UUID AS $$
DECLARE
    function_uuid UUID;
BEGIN
    SELECT id INTO function_uuid
    FROM org_functions
    WHERE slug = function_slug_param
    LIMIT 1;
    RETURN function_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get department ID by slug
CREATE OR REPLACE FUNCTION get_department_id(department_slug_param TEXT)
RETURNS UUID AS $$
DECLARE
    department_uuid UUID;
BEGIN
    SELECT id INTO department_uuid
    FROM org_departments
    WHERE slug = department_slug_param
    LIMIT 1;
    RETURN department_uuid;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. POPULATE SUITE-TO-FUNCTION MAPPINGS
-- ----------------------------------------------------------------------------

-- RULES™ → Regulatory
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('RULES'),
    get_function_id('regulatory-compliance'),
    TRUE,
    10
WHERE get_suite_id('RULES') IS NOT NULL AND get_function_id('regulatory-compliance') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- RULES™ → Quality (secondary)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('RULES'),
    get_function_id('quality'),
    FALSE,
    8
WHERE get_suite_id('RULES') IS NOT NULL AND get_function_id('quality') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- TRIALS™ → Clinical
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('TRIALS'),
    get_function_id('clinical'),
    TRUE,
    10
WHERE get_suite_id('TRIALS') IS NOT NULL AND get_function_id('clinical') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- TRIALS™ → Research & Development (secondary)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('TRIALS'),
    get_function_id('research-and-development'),
    FALSE,
    8
WHERE get_suite_id('TRIALS') IS NOT NULL AND get_function_id('research-and-development') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- GUARD™ → Medical Affairs
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('GUARD'),
    get_function_id('medical-affairs'),
    TRUE,
    10
WHERE get_suite_id('GUARD') IS NOT NULL AND get_function_id('medical-affairs') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- VALUE™ → Market Access
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('VALUE'),
    get_function_id('market-access'),
    TRUE,
    10
WHERE get_suite_id('VALUE') IS NOT NULL AND get_function_id('market-access') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- VALUE™ → Commercial (secondary)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('VALUE'),
    get_function_id('commercial'),
    FALSE,
    7
WHERE get_suite_id('VALUE') IS NOT NULL AND get_function_id('commercial') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- BRIDGE™ → Medical Affairs
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('BRIDGE'),
    get_function_id('medical-affairs'),
    TRUE,
    10
WHERE get_suite_id('BRIDGE') IS NOT NULL AND get_function_id('medical-affairs') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- PROOF™ → Clinical
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROOF'),
    get_function_id('clinical'),
    TRUE,
    9
WHERE get_suite_id('PROOF') IS NOT NULL AND get_function_id('clinical') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- PROOF™ → Market Access (secondary)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROOF'),
    get_function_id('market-access'),
    FALSE,
    9
WHERE get_suite_id('PROOF') IS NOT NULL AND get_function_id('market-access') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- CRAFT™ → Medical Affairs
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('CRAFT'),
    get_function_id('medical-affairs'),
    TRUE,
    9
WHERE get_suite_id('CRAFT') IS NOT NULL AND get_function_id('medical-affairs') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- CRAFT™ → Regulatory (secondary)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('CRAFT'),
    get_function_id('regulatory-compliance'),
    FALSE,
    8
WHERE get_suite_id('CRAFT') IS NOT NULL AND get_function_id('regulatory-compliance') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- SCOUT™ → Commercial
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('SCOUT'),
    get_function_id('commercial'),
    TRUE,
    10
WHERE get_suite_id('SCOUT') IS NOT NULL AND get_function_id('commercial') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- PROJECT™ → Operations
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROJECT'),
    get_function_id('operations'),
    TRUE,
    10
WHERE get_suite_id('PROJECT') IS NOT NULL AND get_function_id('operations') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- PROJECT™ → Clinical (secondary - for clinical operations)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROJECT'),
    get_function_id('clinical'),
    FALSE,
    8
WHERE get_suite_id('PROJECT') IS NOT NULL AND get_function_id('clinical') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- FORGE™ → IT/Digital
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('FORGE'),
    get_function_id('it-digital-pharma'),
    TRUE,
    10
WHERE get_suite_id('FORGE') IS NOT NULL AND get_function_id('it-digital-pharma') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- FORGE™ → Regulatory (secondary - for SaMD regulatory)
INSERT INTO suite_functions (suite_id, function_id, is_primary, relevance_score)
SELECT
    get_suite_id('FORGE'),
    get_function_id('regulatory-compliance'),
    FALSE,
    7
WHERE get_suite_id('FORGE') IS NOT NULL AND get_function_id('regulatory-compliance') IS NOT NULL
ON CONFLICT (suite_id, function_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. POPULATE SUITE-TO-DEPARTMENT MAPPINGS
-- ----------------------------------------------------------------------------

-- RULES™ → Regulatory Affairs departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('RULES'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('regulatory-affairs', 'regulatory', 'cmc-regulatory-affairs')
AND get_suite_id('RULES') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- TRIALS™ → Clinical Operations departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('TRIALS'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('clinical-operations', 'pharma-clinical-ops', 'dh-clinical-operations', 'biostatistics', 'pharma-biostats')
AND get_suite_id('TRIALS') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- GUARD™ → Safety departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('GUARD'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('clinical-safety', 'pharmacovigilance', 'drug-safety', 'safety')
AND get_suite_id('GUARD') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- VALUE™ → Market Access departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('VALUE'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('market-access', 'heor', 'pricing-reimbursement', 'payer-relations')
AND get_suite_id('VALUE') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- BRIDGE™ → Medical Affairs departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('BRIDGE'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('medical-affairs', 'msl', 'medical-science-liaison', 'medical-information')
AND get_suite_id('BRIDGE') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- PROOF™ → Data Analytics and HEOR departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROOF'),
    id,
    TRUE,
    9
FROM org_departments
WHERE slug IN ('data-analytics', 'biostatistics', 'pharma-biostats', 'heor', 'clinical-data-management')
AND get_suite_id('PROOF') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- CRAFT™ → Medical Writing departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('CRAFT'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('medical-writing', 'regulatory-writing', 'scientific-communications', 'publications')
AND get_suite_id('CRAFT') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- SCOUT™ → Competitive Intelligence departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('SCOUT'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('competitive-intelligence', 'strategic-planning', 'business-insights', 'market-research')
AND get_suite_id('SCOUT') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- PROJECT™ → Project Management departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('PROJECT'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('project-management', 'clinical-operations-support', 'program-management')
AND get_suite_id('PROJECT') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- FORGE™ → Digital Health departments
INSERT INTO suite_departments (suite_id, department_id, is_primary, relevance_score)
SELECT
    get_suite_id('FORGE'),
    id,
    TRUE,
    10
FROM org_departments
WHERE slug IN ('digital-health', 'product-development', 'software-development', 'clinical-validation')
AND get_suite_id('FORGE') IS NOT NULL
ON CONFLICT (suite_id, department_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. CREATE VIEWS FOR EASY QUERYING
-- ----------------------------------------------------------------------------

-- View: Suite to Function mapping with names
CREATE OR REPLACE VIEW v_suite_function_mappings AS
SELECT
    ps.suite_code,
    ps.suite_name,
    of.name AS function_name,
    of.slug AS function_slug,
    sf.is_primary,
    sf.relevance_score
FROM suite_functions sf
JOIN prompt_suites ps ON sf.suite_id = ps.id
JOIN org_functions of ON sf.function_id = of.id
ORDER BY ps.suite_code, sf.relevance_score DESC;

-- View: Suite to Department mapping with names
CREATE OR REPLACE VIEW v_suite_department_mappings AS
SELECT
    ps.suite_code,
    ps.suite_name,
    od.name AS department_name,
    od.slug AS department_slug,
    sd.is_primary,
    sd.relevance_score
FROM suite_departments sd
JOIN prompt_suites ps ON sd.suite_id = ps.id
JOIN org_departments od ON sd.department_id = od.id
ORDER BY ps.suite_code, sd.relevance_score DESC;

-- View: Complete organizational mapping for suites
CREATE OR REPLACE VIEW v_suite_organizational_mapping AS
SELECT DISTINCT
    ps.suite_code,
    ps.suite_name,
    ps.icon,
    ps.tagline,
    COALESCE(
        (SELECT json_agg(json_build_object('name', of.name, 'slug', of.slug, 'is_primary', sf.is_primary, 'relevance', sf.relevance_score))
         FROM suite_functions sf
         JOIN org_functions of ON sf.function_id = of.id
         WHERE sf.suite_id = ps.id),
        '[]'::json
    ) AS functions,
    COALESCE(
        (SELECT json_agg(json_build_object('name', od.name, 'slug', od.slug, 'is_primary', sd.is_primary, 'relevance', sd.relevance_score))
         FROM suite_departments sd
         JOIN org_departments od ON sd.department_id = od.id
         WHERE sd.suite_id = ps.id),
        '[]'::json
    ) AS departments
FROM prompt_suites ps
ORDER BY ps.sort_order;

-- ----------------------------------------------------------------------------
-- 6. COMPLETION
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    suite_function_count INTEGER;
    suite_department_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO suite_function_count FROM suite_functions;
    SELECT COUNT(*) INTO suite_department_count FROM suite_departments;

    RAISE NOTICE '✅ Organizational Mapping Complete';
    RAISE NOTICE '   - Suite to Function mappings: %', suite_function_count;
    RAISE NOTICE '   - Suite to Department mappings: %', suite_department_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '   - v_suite_function_mappings';
    RAISE NOTICE '   - v_suite_department_mappings';
    RAISE NOTICE '   - v_suite_organizational_mapping';
END $$;

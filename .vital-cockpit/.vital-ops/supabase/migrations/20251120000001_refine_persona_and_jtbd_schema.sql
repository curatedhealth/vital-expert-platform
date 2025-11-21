-- Migration: Refine Persona and JTBD Schema
-- Created: 2025-11-20
-- Description: This migration refines the persona and JTBD schema to be fully normalized and to properly map personas to business functions, departments, roles, and JTBDs.

-- =====================================================================
-- 1. NORMALIZE JSONB COLUMNS
-- =====================================================================

-- Drop the metadata columns from the organizational structure tables
ALTER TABLE org_departments DROP COLUMN IF EXISTS metadata;
ALTER TABLE org_roles DROP COLUMN IF EXISTS metadata;
ALTER TABLE org_responsibilities DROP COLUMN IF EXISTS metadata;

-- Drop the jsonb columns from the jtbd_core table
ALTER TABLE jtbd_core DROP COLUMN IF EXISTS pain_points;
ALTER TABLE jtbd_core DROP COLUMN IF EXISTS current_solutions;
ALTER TABLE jtbd_core DROP COLUMN IF EXISTS success_criteria;
ALTER TABLE jtbd_core DROP COLUMN IF EXISTS metadata;

-- Create new tables for the normalized data
CREATE TABLE IF NOT EXISTS pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS current_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS success_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction tables to link the normalized data to the jtbd_core table
CREATE TABLE IF NOT EXISTS jtbd_pain_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    pain_point_id UUID NOT NULL REFERENCES pain_points(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, pain_point_id)
);

CREATE TABLE IF NOT EXISTS jtbd_current_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    current_solution_id UUID NOT NULL REFERENCES current_solutions(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, current_solution_id)
);

CREATE TABLE IF NOT EXISTS jtbd_success_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    success_criterion_id UUID NOT NULL REFERENCES success_criteria(id) ON DELETE CASCADE,
    UNIQUE(jtbd_id, success_criterion_id)
);

-- =====================================================================
-- 2. CREATE PERSONA AND ROLE ATTRIBUTE TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction tables to link the attributes to personas and roles
CREATE TABLE IF NOT EXISTS persona_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    UNIQUE(persona_id, goal_id)
);

CREATE TABLE IF NOT EXISTS persona_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(persona_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS persona_motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES motivations(id) ON DELETE CASCADE,
    UNIQUE(persona_id, motivation_id)
);

CREATE TABLE IF NOT EXISTS role_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    UNIQUE(role_id, goal_id)
);

CREATE TABLE IF NOT EXISTS role_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    UNIQUE(role_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS role_motivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    motivation_id UUID NOT NULL REFERENCES motivations(id) ON DELETE CASCADE,
    UNIQUE(role_id, motivation_id)
);

-- =====================================================================
-- 3. REFINE PERSONA AND JTBD MAPPING
-- =====================================================================

-- Drop the target_personas column from the jtbd_core table
ALTER TABLE jtbd_core DROP COLUMN IF EXISTS target_personas;

-- Create a persona_jtbd junction table
CREATE TABLE IF NOT EXISTS persona_jtbd (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    jtbd_id UUID NOT NULL REFERENCES jtbd_core(id) ON DELETE CASCADE,
    UNIQUE(persona_id, jtbd_id)
);

-- =====================================================================
-- 4. ENSURE HIERARCHICAL MAPPING
-- =====================================================================

-- Add tenant_id to all tables
ALTER TABLE org_functions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_departments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE org_responsibilities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE jtbd_core ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE pain_points ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE current_solutions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE success_criteria ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE motivations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Update foreign key constraints to ensure the hierarchy
-- A persona belongs to a role, which belongs to a department, which belongs to a function, which belongs to a tenant.
-- A JTBD is associated with a persona.

-- Ensure that a persona's function, department, and role are inherited from its role.
-- The trigger created in 20251119000000_update_personas_from_roles.sql already handles this.

-- =====================================================================
-- 5. Comments for Documentation
-- =====================================================================

COMMENT ON TABLE pain_points IS 'Normalized table for pain points';
COMMENT ON TABLE current_solutions IS 'Normalized table for current solutions';
COMMENT ON TABLE success_criteria IS 'Normalized table for success criteria';
COMMENT ON TABLE jtbd_pain_points IS 'Junction table to link JTBDs to pain points';
COMMENT ON TABLE jtbd_current_solutions IS 'Junction table to link JTBDs to current solutions';
COMMENT ON TABLE jtbd_success_criteria IS 'Junction table to link JTBDs to success criteria';
COMMENT ON TABLE goals IS 'Normalized table for goals';
COMMENT ON TABLE challenges IS 'Normalized table for challenges';
COMMENT ON TABLE motivations IS 'Normalized table for motivations';
COMMENT ON TABLE persona_goals IS 'Junction table to link personas to goals';
COMMENT ON TABLE persona_challenges IS 'Junction table to link personas to challenges';
COMMENT ON TABLE persona_motivations IS 'Junction table to link personas to motivations';
COMMENT ON TABLE role_goals IS 'Junction table to link roles to goals';
COMMENT ON TABLE role_challenges IS 'Junction table to link roles to challenges';
COMMENT ON TABLE role_motivations IS 'Junction table to link roles to motivations';
COMMENT ON TABLE persona_jtbd IS 'Junction table to link personas to JTBDs';


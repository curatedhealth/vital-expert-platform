-- =====================================================================
-- GOLD STANDARD SCHEMA FOR MEDICAL AFFAIRS PERSONAS
-- =====================================================================
-- Version: 1.0.0
-- Created: 2025-11-27
-- Purpose: Schema-only migration (no data seeding)
-- =====================================================================

-- =====================================================================
-- PHASE 1: EXTEND org_roles TABLE WITH PERSONA FIELDS
-- =====================================================================

-- Pharmaceutical context fields
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS gxp_critical BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS gxp_types VARCHAR(50)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS patient_facing BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS hcp_facing BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS safety_critical BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS geographic_scope VARCHAR(20);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS leadership_level VARCHAR(50);

-- Work environment fields
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS remote_eligible BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS oncall_required BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_work_schedule VARCHAR(100);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS work_location_type VARCHAR(100);

-- Career context fields
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_time_in_role_months INTEGER;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS advancement_potential VARCHAR(20);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS is_entry_point BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS career_path_from VARCHAR(255)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS career_path_to VARCHAR(255)[] DEFAULT '{}';

-- Structured metadata (JSONB)
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS role_kpis JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS clinical_competencies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS soft_skills VARCHAR(255)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS technical_skills VARCHAR(255)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_deliverables JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS daily_activities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS systems_used JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS stakeholder_interactions JSONB DEFAULT '[]'::jsonb;

-- Persona-specific fields
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_goals VARCHAR(500)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS common_challenges VARCHAR(500)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS key_motivations VARCHAR(500)[] DEFAULT '{}';
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS top_responsibilities VARCHAR(500)[] DEFAULT '{}';

-- Training fields
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS gxp_training JSONB DEFAULT '[]'::jsonb;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS role_specific_training JSONB DEFAULT '[]'::jsonb;

-- Data quality metadata
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS data_quality_score DECIMAL(3,2);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS last_validated TIMESTAMP;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS validated_by VARCHAR(255);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS enrichment_notes TEXT;

-- =====================================================================
-- PHASE 2: REFERENCE TABLES
-- =====================================================================

-- Skills Reference Table
CREATE TABLE IF NOT EXISTS ref_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100),
  description TEXT,
  pharma_specific BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Competencies Reference Table
CREATE TABLE IF NOT EXISTS ref_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  competency_name VARCHAR(255) NOT NULL,
  competency_category VARCHAR(100),
  description TEXT,
  proficiency_levels JSONB DEFAULT '["Basic","Intermediate","Advanced","Expert"]'::jsonb,
  typical_development_time_months INTEGER,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Certifications Reference Table
CREATE TABLE IF NOT EXISTS ref_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  certification_name VARCHAR(255) NOT NULL,
  issuing_organization VARCHAR(255),
  renewal_required BOOLEAN DEFAULT false,
  renewal_frequency_months INTEGER,
  pharma_specific BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Regulatory Frameworks Reference Table
CREATE TABLE IF NOT EXISTS ref_regulatory_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  framework_name VARCHAR(255) NOT NULL,
  framework_type VARCHAR(50),
  description TEXT,
  applies_to_gxp BOOLEAN DEFAULT false,
  reference_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- KPIs Reference Table
CREATE TABLE IF NOT EXISTS ref_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  kpi_name VARCHAR(255) NOT NULL,
  kpi_category VARCHAR(100),
  measurement_unit VARCHAR(50),
  typical_frequency VARCHAR(50),
  pharma_specific BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Therapeutic Areas Reference Table
CREATE TABLE IF NOT EXISTS ref_therapeutic_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  area_name VARCHAR(255) NOT NULL,
  description TEXT,
  typical_trial_phases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Training Programs Reference Table
CREATE TABLE IF NOT EXISTS ref_training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_type VARCHAR(100),
  is_mandatory BOOLEAN DEFAULT false,
  frequency VARCHAR(50),
  estimated_hours INTEGER,
  gxp_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- =====================================================================
-- PHASE 3: JUNCTION TABLES
-- =====================================================================
-- Note: Using DROP + CREATE to ensure correct schema. Adjust if data exists.

-- role_skills: Links roles to skills with proficiency requirements
DROP TABLE IF EXISTS role_skills CASCADE;
CREATE TABLE role_skills (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES ref_skills(id) ON DELETE CASCADE,
  proficiency_required VARCHAR(20),
  is_required BOOLEAN DEFAULT true,
  PRIMARY KEY (role_id, skill_id)
);

-- role_competencies: Links roles to competencies with development time
DROP TABLE IF EXISTS role_competencies CASCADE;
CREATE TABLE role_competencies (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES ref_competencies(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20),
  years_to_develop INTEGER,
  is_critical BOOLEAN DEFAULT false,
  PRIMARY KEY (role_id, competency_id)
);

-- role_certifications: Links roles to required/preferred certifications
DROP TABLE IF EXISTS role_certifications CASCADE;
CREATE TABLE role_certifications (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  certification_id UUID REFERENCES ref_certifications(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false,
  PRIMARY KEY (role_id, certification_id)
);

-- role_regulatory_frameworks: Links roles to applicable regulations
DROP TABLE IF EXISTS role_regulatory_frameworks CASCADE;
CREATE TABLE role_regulatory_frameworks (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES ref_regulatory_frameworks(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20),
  applies_to_role BOOLEAN DEFAULT true,
  PRIMARY KEY (role_id, framework_id)
);

-- role_kpis_junction: Links roles to KPIs with targets
DROP TABLE IF EXISTS role_kpis_junction CASCADE;
CREATE TABLE role_kpis_junction (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  kpi_id UUID REFERENCES ref_kpis(id) ON DELETE CASCADE,
  target_value VARCHAR(100),
  measurement_frequency VARCHAR(50),
  data_source VARCHAR(255),
  PRIMARY KEY (role_id, kpi_id)
);

-- role_therapeutic_areas: Links roles to therapeutic areas
DROP TABLE IF EXISTS role_therapeutic_areas CASCADE;
CREATE TABLE role_therapeutic_areas (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  therapeutic_area_id UUID REFERENCES ref_therapeutic_areas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (role_id, therapeutic_area_id)
);

-- role_training: Links roles to required training programs
DROP TABLE IF EXISTS role_training CASCADE;
CREATE TABLE role_training (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  training_id UUID REFERENCES ref_training_programs(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  PRIMARY KEY (role_id, training_id)
);

-- role_gxp_requirements: Links roles to GxP compliance requirements
DROP TABLE IF EXISTS role_gxp_requirements CASCADE;
CREATE TABLE role_gxp_requirements (
  role_id UUID REFERENCES org_roles(id) ON DELETE CASCADE,
  gxp_type VARCHAR(20) NOT NULL,
  is_critical BOOLEAN DEFAULT true,
  training_frequency VARCHAR(50),
  PRIMARY KEY (role_id, gxp_type)
);

-- =====================================================================
-- PHASE 4: PERSONAS TABLE
-- =====================================================================

-- Drop existing personas table to recreate with correct schema
DROP TABLE IF EXISTS personas CASCADE;

CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  persona_name VARCHAR(255) NOT NULL,
  persona_type VARCHAR(100),
  source_role_id UUID REFERENCES org_roles(id),

  -- Core attributes
  title VARCHAR(255),
  description TEXT NOT NULL,
  avatar_url TEXT,

  -- Demographics
  age_range VARCHAR(20),
  experience_level VARCHAR(50),
  education_level VARCHAR(100),

  -- Professional context
  department VARCHAR(100),
  function_area VARCHAR(100),
  geographic_scope VARCHAR(50),

  -- Behavioral attributes
  goals JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  motivations JSONB DEFAULT '[]'::jsonb,
  frustrations JSONB DEFAULT '[]'::jsonb,

  -- Work patterns
  daily_activities JSONB DEFAULT '[]'::jsonb,
  tools_used JSONB DEFAULT '[]'::jsonb,
  communication_preferences JSONB DEFAULT '[]'::jsonb,

  -- Skills
  skills JSONB DEFAULT '[]'::jsonb,
  competencies JSONB DEFAULT '[]'::jsonb,
  success_metrics JSONB DEFAULT '[]'::jsonb,

  -- Qualitative
  sample_quotes TEXT[],
  typical_scenarios JSONB DEFAULT '[]'::jsonb,

  -- Pharma-specific
  gxp_requirements JSONB DEFAULT '[]'::jsonb,
  regulatory_context JSONB DEFAULT '[]'::jsonb,
  therapeutic_areas VARCHAR(100)[],

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  data_quality_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR(255),
  validated_by VARCHAR(255),
  last_validated TIMESTAMP
);

-- =====================================================================
-- PHASE 5: INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_org_roles_geographic_scope ON org_roles(geographic_scope);
CREATE INDEX IF NOT EXISTS idx_org_roles_gxp_critical ON org_roles(gxp_critical);
CREATE INDEX IF NOT EXISTS idx_personas_persona_type ON personas(persona_type);
CREATE INDEX IF NOT EXISTS idx_personas_source_role_id ON personas(source_role_id);
CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active);

-- =====================================================================
-- PHASE 6: ROW LEVEL SECURITY (DISABLED FOR NOW)
-- =====================================================================
-- RLS policies commented out - add custom roles first, then enable
-- ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Super admin full access" ON personas FOR ALL TO super_admin USING (true) WITH CHECK (true);

-- =====================================================================
-- PHASE 7: COMMENTS
-- =====================================================================

COMMENT ON TABLE personas IS 'Role-based personas for Medical Affairs';
COMMENT ON TABLE ref_skills IS 'Skills taxonomy reference';
COMMENT ON TABLE ref_competencies IS 'Competency framework reference';
COMMENT ON TABLE ref_regulatory_frameworks IS 'Regulatory frameworks (FDA, ICH, PhRMA)';
COMMENT ON COLUMN org_roles.gxp_critical IS 'Role requires GxP compliance';
COMMENT ON COLUMN org_roles.geographic_scope IS 'Global/Regional/Local scope';
COMMENT ON COLUMN personas.data_quality_score IS 'Quality score 0-1';

-- =====================================================================
-- PHASE 4: Create Unified Workflow System
-- =====================================================================
-- Purpose: Consolidate 4 fragmented workflow systems into one canonical model
-- - jtbd_workflow_stages + jtbd_workflow_activities
-- - process_activities + activity_* tables
-- - task_steps
-- - Workflow engine tables
-- 
-- Result: Single normalized workflow model linked to JTBDs

-- =====================================================================
-- Drop existing tables to ensure clean schema
-- =====================================================================
DROP TABLE IF EXISTS public.workflow_task_pain_points CASCADE;
DROP TABLE IF EXISTS public.workflow_task_data_requirements CASCADE;
DROP TABLE IF EXISTS public.workflow_task_skills CASCADE;
DROP TABLE IF EXISTS public.workflow_task_tools CASCADE;
DROP TABLE IF EXISTS public.workflow_tasks CASCADE;
DROP TABLE IF EXISTS public.workflow_stages CASCADE;
DROP TABLE IF EXISTS public.workflow_templates CASCADE;

-- =====================================================================
-- Workflow Templates (Top Level)
-- =====================================================================
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jtbd_id UUID,  -- Optional link to JTBD
  
  -- Template identity
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT CHECK (workflow_type IN ('standard', 'conditional', 'parallel', 'sequential')),
  
  -- Metadata
  version TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  
  -- Estimates
  estimated_duration_hours NUMERIC,
  complexity_level TEXT CHECK (complexity_level IN ('low', 'medium', 'high', 'very_high')),
  
  -- Multi-tenant
  tenant_id UUID,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_jtbd ON workflow_templates(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_code ON workflow_templates(code);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_status ON workflow_templates(status);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tenant ON workflow_templates(tenant_id);

COMMENT ON TABLE workflow_templates IS 'Unified workflow templates (consolidates 4 fragmented workflow systems)';

-- =====================================================================
-- Workflow Stages (Major Phases)
-- =====================================================================
CREATE TABLE public.workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  
  -- Stage identity
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  description TEXT,
  
  -- Stage metadata
  is_mandatory BOOLEAN DEFAULT TRUE,
  can_skip BOOLEAN DEFAULT FALSE,
  estimated_duration_hours NUMERIC,
  
  -- Dependencies
  depends_on_stage_id UUID REFERENCES workflow_stages(id),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(template_id, stage_number),
  UNIQUE(template_id, stage_name)
);

CREATE INDEX IF NOT EXISTS idx_workflow_stages_template ON workflow_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_number ON workflow_stages(stage_number);

COMMENT ON TABLE workflow_stages IS 'Major workflow stages within a template';

-- =====================================================================
-- Workflow Tasks (Granular Steps)
-- =====================================================================
CREATE TABLE public.workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
  
  -- Task identity
  task_number INTEGER NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('manual', 'automated', 'decision', 'review', 'approval')),
  
  -- Task details
  is_mandatory BOOLEAN DEFAULT TRUE,
  estimated_duration_minutes INTEGER,
  
  -- Execution hints
  instructions TEXT,
  success_criteria TEXT,
  
  -- Dependencies
  depends_on_task_id UUID REFERENCES workflow_tasks(id),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(stage_id, task_number)
);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_stage ON workflow_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_type ON workflow_tasks(task_type);

COMMENT ON TABLE workflow_tasks IS 'Granular tasks within workflow stages';

-- =====================================================================
-- Workflow Task → Tools (Normalized)
-- =====================================================================
CREATE TABLE public.workflow_task_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id),
  tool_name TEXT NOT NULL,  -- Cached for performance
  
  is_required BOOLEAN DEFAULT TRUE,
  proficiency_required TEXT CHECK (proficiency_required IN ('basic', 'intermediate', 'advanced', 'expert')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_tools_task ON workflow_task_tools(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_tools_tool ON workflow_task_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_tools_name ON workflow_task_tools(tool_name);

COMMENT ON TABLE workflow_task_tools IS 'Tools required for workflow tasks (normalized, no arrays)';

-- =====================================================================
-- Workflow Task → Skills (Normalized)
-- =====================================================================
CREATE TABLE public.workflow_task_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id),
  skill_name TEXT NOT NULL,  -- Cached for performance
  
  required_level TEXT CHECK (required_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_mandatory BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_skills_task ON workflow_task_skills(task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_skills_skill ON workflow_task_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_workflow_task_skills_name ON workflow_task_skills(skill_name);

COMMENT ON TABLE workflow_task_skills IS 'Skills required for workflow tasks (normalized, no arrays)';

-- =====================================================================
-- Workflow Task → Data Requirements (Normalized)
-- =====================================================================
CREATE TABLE public.workflow_task_data_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  
  data_name TEXT NOT NULL,
  data_type TEXT,
  data_format TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  source_system TEXT,
  access_requirements TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_data_task ON workflow_task_data_requirements(task_id);

COMMENT ON TABLE workflow_task_data_requirements IS 'Data requirements for workflow tasks (normalized, no arrays)';

-- =====================================================================
-- Workflow Task → Pain Points (Normalized)
-- =====================================================================
CREATE TABLE public.workflow_task_pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id) ON DELETE CASCADE,
  
  pain_point_text TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  frequency TEXT CHECK (frequency IN ('rare', 'occasional', 'frequent', 'constant')),
  impact_description TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_task_pain_task ON workflow_task_pain_points(task_id);

COMMENT ON TABLE workflow_task_pain_points IS 'Pain points associated with workflow tasks';

-- =====================================================================
-- Auto-sync triggers for cached names
-- =====================================================================
CREATE OR REPLACE FUNCTION sync_workflow_task_tool_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tool_id IS NOT NULL AND (NEW.tool_name IS NULL OR NEW.tool_name = '') THEN
    SELECT tool_name INTO NEW.tool_name
    FROM tools
    WHERE id = NEW.tool_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_workflow_task_tool_name ON workflow_task_tools;
CREATE TRIGGER trigger_sync_workflow_task_tool_name
  BEFORE INSERT OR UPDATE OF tool_id ON workflow_task_tools
  FOR EACH ROW
  EXECUTE FUNCTION sync_workflow_task_tool_name();

CREATE OR REPLACE FUNCTION sync_workflow_task_skill_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.skill_id IS NOT NULL AND (NEW.skill_name IS NULL OR NEW.skill_name = '') THEN
    SELECT skill_name INTO NEW.skill_name
    FROM skills
    WHERE id = NEW.skill_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_workflow_task_skill_name ON workflow_task_skills;
CREATE TRIGGER trigger_sync_workflow_task_skill_name
  BEFORE INSERT OR UPDATE OF skill_id ON workflow_task_skills
  FOR EACH ROW
  EXECUTE FUNCTION sync_workflow_task_skill_name();

DO $$
BEGIN
  RAISE NOTICE '=== UNIFIED WORKFLOW SYSTEM CREATED ===';
  RAISE NOTICE '✓ workflow_templates table created';
  RAISE NOTICE '✓ workflow_stages table created';
  RAISE NOTICE '✓ workflow_tasks table created';
  RAISE NOTICE '✓ workflow_task_tools table created (normalized)';
  RAISE NOTICE '✓ workflow_task_skills table created (normalized)';
  RAISE NOTICE '✓ workflow_task_data_requirements table created (normalized)';
  RAISE NOTICE '✓ workflow_task_pain_points table created (normalized)';
  RAISE NOTICE '✓ Auto-sync triggers enabled for tool/skill names';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Migrate data from old workflow tables (jtbd_workflow_*, process_activities, etc.)';
  RAISE NOTICE '2. Update application code to use new unified model';
  RAISE NOTICE '3. Archive or drop old fragmented workflow tables';
END $$;


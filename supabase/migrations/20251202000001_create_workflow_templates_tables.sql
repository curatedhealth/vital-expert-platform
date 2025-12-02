-- Migration: 20251202000001_create_workflow_templates_tables.sql
-- Purpose: Create workflow templates hierarchy tables for the VITAL System
-- 
-- HIERARCHY:
--   L1: workflow_templates  (Workflow - top container)
--   L2: workflow_stages     (Phase - major deliverable grouping)
--   L4: workflow_tasks      (Task - discrete unit of work)

-- ============================================================================
-- DROP EXISTING OBJECTS IF THEY EXIST (to handle re-runs)
-- ============================================================================

DROP VIEW IF EXISTS v_workflow_summary CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS workflow_tasks CASCADE;
DROP TABLE IF EXISTS workflow_activities CASCADE;
DROP TABLE IF EXISTS workflow_stages CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;

-- ============================================================================
-- L1: workflow_templates - Top-level workflow definitions
-- ============================================================================

CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT CHECK (workflow_type IN ('standard', 'conditional', 'parallel', 'sequential')) DEFAULT 'sequential',
  work_mode TEXT CHECK (work_mode IN ('routine', 'project', 'adhoc')) DEFAULT 'project',
  estimated_duration_hours NUMERIC(6,2),
  complexity_level TEXT CHECK (complexity_level IN ('low', 'medium', 'high', 'very_high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('draft', 'active', 'deprecated', 'archived')) DEFAULT 'active',
  version TEXT DEFAULT '1.0',
  jtbd_id UUID,
  tenant_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workflow_templates_code ON workflow_templates(code);
CREATE INDEX idx_workflow_templates_status ON workflow_templates(status);

-- ============================================================================
-- L2: workflow_stages - Major phases within a workflow
-- ============================================================================

CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  estimated_duration_hours NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, stage_number)
);

CREATE INDEX idx_workflow_stages_template ON workflow_stages(template_id);

-- ============================================================================
-- L4: workflow_tasks - Discrete units of work
-- ============================================================================

CREATE TABLE workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
  activity_id UUID,
  task_number INTEGER NOT NULL,
  task_code TEXT UNIQUE,
  task_name TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('manual', 'automated', 'decision', 'review', 'approval')) DEFAULT 'manual',
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_tasks_stage ON workflow_tasks(stage_id);

-- ============================================================================
-- VIEW: v_workflow_summary - Summary view for workflow listing
-- ============================================================================

CREATE VIEW v_workflow_summary AS
SELECT 
  wt.id as template_id,
  wt.code,
  wt.name as workflow_name,
  wt.description,
  wt.workflow_type,
  wt.work_mode,
  wt.estimated_duration_hours,
  wt.complexity_level,
  wt.status,
  wt.version,
  COUNT(DISTINCT ws.id) as stage_count,
  COUNT(DISTINCT wta.id) as task_count
FROM workflow_templates wt
LEFT JOIN workflow_stages ws ON ws.template_id = wt.id
LEFT JOIN workflow_tasks wta ON wta.stage_id = ws.id
WHERE wt.deleted_at IS NULL
GROUP BY wt.id, wt.code, wt.name, wt.description, wt.workflow_type, wt.work_mode, 
         wt.estimated_duration_hours, wt.complexity_level, wt.status, wt.version;

-- ============================================================================
-- SEED DATA: Sample workflow templates
-- ============================================================================

INSERT INTO workflow_templates (code, name, description, workflow_type, work_mode, estimated_duration_hours, complexity_level, status, version)
VALUES 
  ('WF-DH-001', 'Digital Therapeutics Clinical Validation Workflow', 
   'End-to-end workflow for validating pharmaceutical-grade digital therapeutics including clinical evidence generation, regulatory framework alignment, and market preparation',
   'sequential', 'project', 160, 'high', 'active', '1.0'),
  ('WF-DH-002', 'DTx Payer Coverage Strategy Workflow',
   'Comprehensive workflow for securing payer coverage for digital therapeutics including value demonstration, HEOR evidence, and payer engagement',
   'sequential', 'project', 120, 'high', 'active', '1.0'),
  ('WF-DH-003', 'Decentralized Clinical Trial Setup Workflow',
   'Workflow for implementing decentralized/hybrid clinical trials with digital endpoints, remote monitoring, and ePRO systems',
   'conditional', 'project', 200, 'high', 'active', '1.0'),
  ('WF-DH-004', 'SaMD Regulatory Submission Workflow',
   'Regulatory submission workflow for Software as Medical Device including 510(k), De Novo, or PMA pathway preparation',
   'sequential', 'project', 240, 'high', 'active', '1.0'),
  ('WF-MAI-001', 'KOL Engagement Analysis Workflow',
   'When evaluating field medical impact, analyze KOL engagement patterns and outcomes to optimize MSL territory strategies',
   'sequential', 'routine', 8, 'medium', 'active', '1.0'),
  ('WF-MAI-002', 'Scientific Literature Monitoring Workflow',
   'Systematically monitor and analyze scientific publications and congress data to identify trends and opportunities',
   'sequential', 'routine', 12, 'medium', 'active', '1.0'),
  ('WF-MAI-003', 'Medical Affairs ROI Measurement Workflow',
   'Quantify the impact of medical activities on business outcomes to justify investments and optimize resource allocation',
   'sequential', 'project', 40, 'high', 'active', '1.0'),
  ('WF-FME-001', 'Field Medical Education Program Workflow',
   'Design and deliver field medical education programs for MSLs and medical science liaisons',
   'sequential', 'project', 80, 'medium', 'active', '1.0'),
  ('WF-RSR-001', 'Regulatory Strategy Review Workflow',
   'Comprehensive regulatory strategy review for pharmaceutical and digital health products',
   'sequential', 'project', 60, 'high', 'active', '1.0'),
  ('WF-RWE-001', 'Real-World Evidence Generation Workflow',
   'Generate real-world evidence from healthcare data sources to support regulatory and market access decisions',
   'conditional', 'project', 120, 'very_high', 'active', '1.0');

-- Insert sample stages for WF-DH-001
INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Clinical Evidence Planning', 'Define clinical validation strategy, endpoints, and study design', true, 32),
  (2, 'Study Protocol Development', 'Develop and finalize clinical study protocol with IRB submission', true, 40),
  (3, 'Clinical Data Collection', 'Execute clinical study and collect validation data', true, 48),
  (4, 'Analysis & Reporting', 'Analyze clinical data and generate validation report', true, 24),
  (5, 'Regulatory Alignment', 'Prepare regulatory submission package and pre-submission meetings', true, 16)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-DH-001';

-- Insert sample stages for WF-MAI-001
INSERT INTO workflow_stages (template_id, stage_number, stage_name, description, is_mandatory, estimated_duration_hours)
SELECT wt.id, s.stage_number, s.stage_name, s.description, s.is_mandatory, s.duration
FROM workflow_templates wt
CROSS JOIN (VALUES
  (1, 'Data Collection & Preparation', 'Gather and prepare KOL interaction data from CRM and meeting notes', true, 2),
  (2, 'Engagement Analysis', 'Analyze engagement patterns, frequency, and quality metrics', true, 3),
  (3, 'Insight Generation', 'Generate actionable insights from engagement data', true, 2),
  (4, 'Report & Recommendations', 'Compile findings and strategic recommendations', true, 1)
) AS s(stage_number, stage_name, description, is_mandatory, duration)
WHERE wt.code = 'WF-MAI-001';

-- Insert sample tasks for WF-MAI-001 Stage 1
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'MAI001-S1-T1', 'Extract CRM Interaction Records', 'Pull KOL interaction data from Veeva CRM', 'automated', 20),
  (2, 'MAI001-S1-T2', 'Extract HCP Profile Data', 'Pull HCP demographics and specialty info', 'automated', 15),
  (3, 'MAI001-S1-T3', 'Process Meeting Notes', 'Parse and categorize MSL meeting notes', 'manual', 45),
  (4, 'MAI001-S1-T4', 'Data Validation', 'Validate completeness and accuracy of collected data', 'review', 30)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-MAI-001' AND ws.stage_number = 1;

-- Insert sample tasks for WF-DH-001 Stage 1
INSERT INTO workflow_tasks (stage_id, task_number, task_code, task_name, description, task_type, estimated_duration_minutes)
SELECT ws.id, t.task_number, t.task_code, t.task_name, t.description, t.task_type, t.duration
FROM workflow_stages ws
JOIN workflow_templates wt ON ws.template_id = wt.id
CROSS JOIN (VALUES
  (1, 'DH001-S1-T1', 'Define Clinical Objectives', 'Establish primary and secondary clinical objectives', 'manual', 60),
  (2, 'DH001-S1-T2', 'Literature Review', 'Review existing clinical evidence for similar DTx', 'manual', 120),
  (3, 'DH001-S1-T3', 'Endpoint Selection', 'Select and justify clinical endpoints', 'review', 90),
  (4, 'DH001-S1-T4', 'Study Design Draft', 'Draft initial study design framework', 'manual', 180)
) AS t(task_number, task_code, task_name, description, task_type, duration)
WHERE wt.code = 'WF-DH-001' AND ws.stage_number = 1;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to workflow_templates" ON workflow_templates;
DROP POLICY IF EXISTS "Allow read access to workflow_stages" ON workflow_stages;
DROP POLICY IF EXISTS "Allow read access to workflow_tasks" ON workflow_tasks;

-- Allow read access to all users
CREATE POLICY "Allow read access to workflow_templates" ON workflow_templates
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to workflow_stages" ON workflow_stages
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to workflow_tasks" ON workflow_tasks
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON workflow_templates TO authenticated, anon;
GRANT SELECT ON workflow_stages TO authenticated, anon;
GRANT SELECT ON workflow_tasks TO authenticated, anon;
GRANT SELECT ON v_workflow_summary TO authenticated, anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'workflow_templates' as table_name, COUNT(*) as count FROM workflow_templates
UNION ALL
SELECT 'workflow_stages', COUNT(*) FROM workflow_stages
UNION ALL
SELECT 'workflow_tasks', COUNT(*) FROM workflow_tasks;

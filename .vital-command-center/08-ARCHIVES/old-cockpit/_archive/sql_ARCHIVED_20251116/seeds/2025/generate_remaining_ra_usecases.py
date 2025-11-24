#!/usr/bin/env python3
"""
Generate remaining RA use case SQL files (UC_RA_004 through UC_RA_010)
Based on the working UC_RA_001 template
"""

import os

# Base template header
TEMPLATE_HEADER = """-- =====================================================================================
-- {uc_code}: {title} - COMPLETE SEED FILE
-- =====================================================================================
-- Purpose: {purpose}
-- Complexity: {complexity}
-- =====================================================================================

-- Setup session_config for tenant lookup
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
  DELETE FROM session_config;
  INSERT INTO session_config (tenant_id, tenant_slug)
  SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';
  SELECT tenant_id INTO v_tenant_id FROM session_config;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Tenant "digital-health-startup" not found'; END IF;
  RAISE NOTICE '✓ Using tenant_id: %', v_tenant_id;
END $$;
"""

# Use case definitions
USE_CASES = {
    "UC_RA_004": {
        "title": "Pre-Submission Meeting Preparation",
        "purpose": "Prepare comprehensive FDA Pre-Sub meeting package with questions and supporting data",
        "complexity": "ADVANCED",
        "tasks": 4,
    },
    "UC_RA_005": {
        "title": "Clinical Evaluation Report (CER)",
        "purpose": "Develop comprehensive Clinical Evaluation Report for medical device submissions",
        "complexity": "EXPERT",
        "tasks": 6,
    },
    "UC_RA_006": {
        "title": "FDA Breakthrough Designation Strategy",
        "purpose": "Develop strategy and application for FDA Breakthrough Device Designation",
        "complexity": "ADVANCED",
        "tasks": 5,
    },
    "UC_RA_007": {
        "title": "International Harmonization Strategy",
        "purpose": "Develop multi-region regulatory strategy (FDA, EMA, PMDA, Health Canada)",
        "complexity": "EXPERT",
        "tasks": 7,
    },
    "UC_RA_008": {
        "title": "Cybersecurity Documentation (FDA)",
        "purpose": "Prepare FDA cybersecurity documentation per 2023 guidance",
        "complexity": "ADVANCED",
        "tasks": 5,
    },
    "UC_RA_009": {
        "title": "Software Validation Documentation",
        "purpose": "Develop software validation and verification documentation package",
        "complexity": "ADVANCED",
        "tasks": 6,
    },
    "UC_RA_010": {
        "title": "Post-Market Surveillance Planning",
        "purpose": "Design post-market surveillance plan for FDA medical devices",
        "complexity": "INTERMEDIATE",
        "tasks": 5,
    },
}

def generate_use_case_file(uc_code, details):
    """Generate a single use case SQL file"""
    uc_num = uc_code.split('_')[2]  # Get 004, 005, etc.
    unique_id = f"USC-RA-{uc_num}"
    wfl_id = f"WFL-RA-{uc_num}-001"
    
    content = TEMPLATE_HEADER.format(
        uc_code=uc_code,
        title=details["title"],
        purpose=details["purpose"],
        complexity=details["complexity"]
    )
    
    # Add USE CASE section
    content += f"""
-- USE CASE
INSERT INTO dh_use_case (tenant_id, domain_id, code, unique_id, title, summary, complexity, metadata)
SELECT sc.tenant_id, d.id, '{uc_code}', '{unique_id}', '{details["title"]}',
  '{details["purpose"]}', '{details["complexity"]}',
  jsonb_build_object('estimated_duration_minutes', 90, 
    'prerequisites', json_build_array('TBD'), 
    'deliverables', json_build_array('TBD'))
FROM session_config sc CROSS JOIN dh_domain d WHERE d.code = 'RA' AND d.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary;

-- WORKFLOW
INSERT INTO dh_workflow (tenant_id, use_case_id, name, unique_id, description, position, metadata)
SELECT sc.tenant_id, uc.id, '{details["title"]} Workflow', '{wfl_id}',
  '{details["purpose"]}', 1, jsonb_build_object('duration_minutes', 90, 'complexity', '{details["complexity"]}')
FROM session_config sc CROSS JOIN dh_use_case uc WHERE uc.code = '{uc_code}' AND uc.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET name = EXCLUDED.name;

-- TASKS (Placeholder - {details["tasks"]} tasks)
INSERT INTO dh_task (tenant_id, workflow_id, code, unique_id, title, objective, position, extra)
SELECT sc.tenant_id, wf.id, task_data.code, task_data.unique_id, task_data.title, task_data.objective, task_data.position, task_data.extra
FROM session_config sc CROSS JOIN (VALUES
"""
    
    # Generate placeholder tasks
    for i in range(1, details["tasks"] + 1):
        task_code = f"TSK-RA-{uc_num}-{i:02d}"
        content += f"  ('{task_code}', '{task_code}', 'Task {i}', 'Objective for task {i}', {i}, '{{}}'::jsonb)"
        if i < details["tasks"]:
            content += ",\n"
    
    content += f"""
) AS task_data(code, unique_id, title, objective, position, extra)
CROSS JOIN dh_workflow wf WHERE wf.unique_id = '{wfl_id}' AND wf.tenant_id = sc.tenant_id
ON CONFLICT (tenant_id, unique_id) DO UPDATE SET title = EXCLUDED.title;

-- DEPENDENCIES (Sequential)
INSERT INTO dh_task_dependency (tenant_id, task_id, depends_on_task_id)
SELECT sc.tenant_id, t_curr.id, t_prev.id FROM session_config sc CROSS JOIN (VALUES
"""
    
    # Generate dependencies
    for i in range(2, details["tasks"] + 1):
        prev_task = f"TSK-RA-{uc_num}-{i-1:02d}"
        curr_task = f"TSK-RA-{uc_num}-{i:02d}"
        content += f"  ('{curr_task}', '{prev_task}')"
        if i < details["tasks"]:
            content += ",\n"
    
    content += f"""
) AS dep_data(task_code, prev_task_code)
INNER JOIN dh_task t_curr ON t_curr.code = dep_data.task_code AND t_curr.tenant_id = sc.tenant_id
INNER JOIN dh_task t_prev ON t_prev.code = dep_data.prev_task_code AND t_prev.tenant_id = sc.tenant_id
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING;

-- VERIFICATION
DO $$
DECLARE v_task_count INT;
BEGIN
  SELECT COUNT(DISTINCT t.id) INTO v_task_count
  FROM dh_use_case uc CROSS JOIN dh_workflow wf LEFT JOIN dh_task t ON t.workflow_id = wf.id
  WHERE uc.code = '{uc_code}' AND wf.use_case_id = uc.id AND uc.tenant_id = (SELECT tenant_id FROM session_config);
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '{uc_code}: {details["title"]}';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tasks: %', v_task_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ {uc_code} seeded successfully!';
  RAISE NOTICE '';
END $$;
"""
    
    return content

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Generating {len(USE_CASES)} RA use case SQL files...\n")
    
    for uc_code, details in USE_CASES.items():
        filename = f"{uc_code}.sql"
        filepath = os.path.join(script_dir, filename)
        
        content = generate_use_case_file(uc_code, details)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Created: {filename}")
    
    print(f"\n{'='*60}")
    print(f"✅ All {len(USE_CASES)} files created successfully!")
    print(f"{'='*60}")
    print("\nFiles ready for execution:")
    for uc_code in USE_CASES.keys():
        print(f"  - {uc_code}.sql")

if __name__ == '__main__':
    main()


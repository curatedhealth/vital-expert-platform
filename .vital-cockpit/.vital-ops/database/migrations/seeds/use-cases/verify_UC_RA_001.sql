-- =====================================================================================
-- Verify UC_RA_001 Seeding
-- =====================================================================================

SELECT 
  'UC_RA_001: FDA Software Classification' as use_case,
  COUNT(DISTINCT uc.id) as use_cases,
  COUNT(DISTINCT wf.id) as workflows,
  COUNT(DISTINCT t.id) as tasks,
  COUNT(DISTINCT td.id) as dependencies,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments,
  COUNT(DISTINCT tt.id) as tool_assignments,
  COUNT(DISTINCT tr.id) as rag_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_dependency td ON td.task_id = t.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_001';

-- Show all tasks
SELECT 
  t.code,
  t.title,
  t.position,
  COUNT(DISTINCT ta.id) as agents,
  COUNT(DISTINCT tp.id) as personas,
  COUNT(DISTINCT tt.id) as tools,
  COUNT(DISTINCT tr.id) as rags
FROM dh_use_case uc
JOIN dh_workflow wf ON wf.use_case_id = uc.id
JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_001'
GROUP BY t.code, t.title, t.position
ORDER BY t.position;


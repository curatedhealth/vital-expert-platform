-- Update roles with department and function mappings
BEGIN;

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-001'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-001';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-001'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-002';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-001'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-004';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-001'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-003';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-001'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-005';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-002'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-007';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-002'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-006';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-002'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-009';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-002'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-008';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-002'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-010';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-003'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-011';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-003'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-012';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-003'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-014';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-003'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-013';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-003'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-001')
WHERE unique_id = 'ROLE-015';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-004'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-016';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-004'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-017';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-004'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-018';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-004'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-019';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-004'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-020';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-005'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-022';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-005'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-021';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-005'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-023';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-005'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-024';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-005'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-025';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-006'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-026';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-006'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-027';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-006'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-028';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-006'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-029';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-007'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-030';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-007'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-031';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-007'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-033';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-007'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-002')
WHERE unique_id = 'ROLE-032';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-008'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-034';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-008'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-035';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-008'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-037';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-008'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-036';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-009'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-038';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-009'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-040';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-009'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-039';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-010'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-041';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-010'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-042';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-010'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-003')
WHERE unique_id = 'ROLE-043';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-011'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-044';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-011'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-045';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-011'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-046';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-011'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-047';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-012'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-048';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-012'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-049';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-012'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-050';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-013'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-052';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-012'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-051';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-013'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-053';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-013'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-054';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-013'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-004')
WHERE unique_id = 'ROLE-055';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-014'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-057';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-014'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-056';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-014'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-058';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-015'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-060';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-014'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-059';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-015'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-062';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-015'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-061';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-016'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-064';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-015'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-063';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-016'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-065';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-017'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-067';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-016'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-005')
WHERE unique_id = 'ROLE-066';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-017'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-069';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-017'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-068';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-018'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-070';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-018'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-071';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-018'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-072';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-019'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-074';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-019'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-073';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-019'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-006')
WHERE unique_id = 'ROLE-075';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-020'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-076';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-020'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-077';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-020'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-078';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-021'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-080';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-020'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-079';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-021'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-081';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-021'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-082';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-022'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-083';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-022'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-084';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-022'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-007')
WHERE unique_id = 'ROLE-085';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-023'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-086';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-023'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-087';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-023'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-088';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-023'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-089';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-023'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-090';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-024'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-091';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-024'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-092';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-024'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-093';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-024'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-094';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-025'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-096';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-025'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-095';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-025'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-097';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-026'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-099';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-025'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-098';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-026'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-101';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-026'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-100';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-026'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-008')
WHERE unique_id = 'ROLE-102';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-027'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-103';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-027'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-104';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-027'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-105';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-027'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-106';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-028'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-107';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-028'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-108';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-028'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-009')
WHERE unique_id = 'ROLE-109';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-110';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-111';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-112';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-113';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-115';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-029'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-010')
WHERE unique_id = 'ROLE-114';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-030'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011')
WHERE unique_id = 'ROLE-117';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-030'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011')
WHERE unique_id = 'ROLE-116';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-030'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011')
WHERE unique_id = 'ROLE-118';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-030'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011')
WHERE unique_id = 'ROLE-119';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-030'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-011')
WHERE unique_id = 'ROLE-120';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-121';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-122';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-124';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-123';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-126';

UPDATE org_roles SET 
  department_id = (SELECT id FROM org_departments WHERE unique_id = 'DEPT-031'),
  function_id = (SELECT id FROM org_functions WHERE unique_id = 'FUNC-012')
WHERE unique_id = 'ROLE-125';

COMMIT;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Roles updated with department and function mappings';
END $$;

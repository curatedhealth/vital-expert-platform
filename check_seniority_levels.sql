-- Check seniority_level values in org_roles
SELECT DISTINCT seniority_level FROM org_roles ORDER BY seniority_level;

-- Check the column type
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'org_roles' AND column_name = 'seniority_level';


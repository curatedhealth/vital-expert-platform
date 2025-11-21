-- Migration: Seed organizational structure with sample data
-- Created: 2025-10-05
-- Description: Add sample functions, departments, and roles

-- Insert sample business functions
INSERT INTO public.org_functions (name, department_name, description, healthcare_category) VALUES
('Regulatory Affairs', 'Regulatory Affairs', 'Manage regulatory submissions and compliance', 'Regulatory'),
('Clinical Development', 'Clinical Development', 'Clinical trial design and execution', 'Clinical'),
('Medical Affairs', 'Medical Affairs', 'Medical information and scientific communication', 'Medical'),
('Market Access', 'Market Access', 'Reimbursement and health economics', 'Commercial'),
('Pharmacovigilance', 'Pharmacovigilance', 'Drug safety and adverse event monitoring', 'Safety')
ON CONFLICT (name) DO NOTHING;

-- Insert sample departments
INSERT INTO public.org_departments (name, department_name, function_id, description)
SELECT
    'Regulatory Submissions',
    'Regulatory Submissions',
    id,
    'Handle FDA and EMA submissions'
FROM public.org_functions WHERE name = 'Regulatory Affairs'
ON CONFLICT (department_name) DO NOTHING;

INSERT INTO public.org_departments (name, department_name, function_id, description)
SELECT
    'Clinical Operations',
    'Clinical Operations',
    id,
    'Manage clinical trial operations'
FROM public.org_functions WHERE name = 'Clinical Development'
ON CONFLICT (department_name) DO NOTHING;

-- Insert sample roles
INSERT INTO public.org_roles (name, role_name, department_id, function_id, description, competency_level)
SELECT
    'Regulatory Affairs Manager',
    'Regulatory Affairs Manager',
    d.id,
    f.id,
    'Manage regulatory submissions and strategy',
    'Senior'
FROM public.org_functions f
JOIN public.org_departments d ON d.function_id = f.id
WHERE f.name = 'Regulatory Affairs'
LIMIT 1
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO public.org_roles (name, role_name, department_id, function_id, description, competency_level)
SELECT
    'Clinical Research Associate',
    'Clinical Research Associate',
    d.id,
    f.id,
    'Monitor clinical trial sites',
    'Mid-Level'
FROM public.org_functions f
JOIN public.org_departments d ON d.function_id = f.id
WHERE f.name = 'Clinical Development'
LIMIT 1
ON CONFLICT (role_name) DO NOTHING;

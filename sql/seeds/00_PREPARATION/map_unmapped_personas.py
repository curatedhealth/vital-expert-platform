#!/usr/bin/env python3
"""
Map unmapped Medical Affairs personas to roles based on title matching
"""

# Persona Title → Role Name mapping
PERSONA_ROLE_MAPPING = {
    # Exact matches
    'Chief Medical Officer': 'Chief Medical Officer',
    'Medical Science Liaison': 'Medical Science Liaison',
    'Medical Director': 'Medical Director',
    'Epidemiologist': 'Epidemiologist',
    'Field Medical Trainer': 'Field Medical Trainer',
    'Medical Librarian': 'Medical Librarian',
    'Medical Education Director': 'Medical Education Director',
    'Medical Communications Manager': 'Medical Communications Manager',
    'Medical Content Manager': 'Medical Content Manager',

    # Pattern matches
    'Congress & Events Manager': 'Congress Manager',
    'Head of Field Medical': 'Head of Field Medical',
    'Head of Medical Communications': 'Head Medical Communications',
    'Head of Medical Information': 'Head of Medical Information',
    'Medical Information Manager': 'Medical Info Manager',
    'Medical Information Specialist': 'Medical Info Specialist',
    'Medical Writer - Publications': 'Medical Writer Publications',
    'Medical Writer - Regulatory': 'Medical Writer Regulatory',
    'Medical Writer - Scientific': 'Medical Writer Scientific',
    'Medical Editor': 'Medical Writer',  # Generic medical writer

    # Additional mappings
    'Observational Studies Lead': 'RWE Specialist',
    'Patient Services Director': 'Medical Business Partner',
    'Patient Services Manager': 'Medical Business Partner',
    'Product Data Scientist': 'RWE Specialist',
    'Professional Education Manager': 'Medical Training Manager',
    'Regional Medical Liaison': 'Senior Medical Science Liaison',
    'Regulatory Medical Writer': 'Medical Writer Regulatory',
    'Research Grants Manager': 'Medical Operations Manager',
    'Scientific Communications Lead': 'Scientific Publications Manager',
    'Scientific Platform Lead': 'Publication Strategy Lead',
    'Therapeutic Area Lead': 'TA MSL Lead',
    'Therapeutic Area Medical Lead': 'TA MSL Lead',
}

# Generate SQL to get unmapped personas
print("-- Script to map unmapped Medical Affairs personas to roles")
print("-- Generated: 2025-11-17\n")

print("-- Step 1: Get unmapped personas and their titles")
print("""
SELECT
  p.id as persona_id,
  p.title as persona_title,
  p.slug as persona_slug
FROM personas p
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.role_id IS NULL
ORDER BY p.title;
""")

print("\n-- Step 2: Get all Medical Affairs roles")
print("""
SELECT
  r.id as role_id,
  r.name as role_name,
  r.slug as role_slug
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
ORDER BY r.name;
""")

print("\n-- Step 3: Update statements (manual mapping based on title patterns)")
print("BEGIN;\n")

# For each mapping, generate an UPDATE statement template
for persona_title, role_name in sorted(PERSONA_ROLE_MAPPING.items()):
    print(f"""-- Map '{persona_title}' → '{role_name}'
UPDATE personas p
SET role_id = (
  SELECT r.id
  FROM org_roles r
  WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
    AND r.name = '{role_name}'
  LIMIT 1
),
updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = '{persona_title}'
  AND p.role_id IS NULL;
""")

print("\nCOMMIT;\n")

print("""
-- Step 4: Verify mapping
SELECT
  CASE
    WHEN p.role_id IS NULL THEN 'UNMAPPED'
    ELSE 'MAPPED'
  END as status,
  COUNT(*) as count
FROM personas p
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
GROUP BY status;
""")

print("\n-- Check remaining unmapped personas")
print("""
SELECT
  p.title,
  COUNT(*) as count
FROM personas p
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.role_id IS NULL
GROUP BY p.title
ORDER BY count DESC, p.title;
""")

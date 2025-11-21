#!/usr/bin/env node

/**
 * Map Personas to Roles from JSON
 * 
 * This script reads BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json
 * and generates SQL to map personas to their corresponding roles, functions, and departments.
 */

const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = '/Users/hichamnaim/Downloads/BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json';
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Collect all personas with their role/function/department info
const personaMappings = [];

// Extract from business_functions structure
if (jsonData.business_functions) {
  jsonData.business_functions.forEach(func => {
    const functionName = func.name;
    
    if (func.departments) {
      func.departments.forEach(dept => {
        const departmentName = dept.name;
        
        if (dept.roles) {
          dept.roles.forEach(role => {
            const roleName = role.name;
            
            if (role.personas) {
              role.personas.forEach(persona => {
                personaMappings.push({
                  personaName: persona.name,
                  personaId: persona.persona_id,
                  roleName: roleName,
                  departmentName: departmentName,
                  functionName: functionName
                });
              });
            }
          });
        }
      });
    }
  });
}

// Also extract from the flat personas array (in case there are differences)
if (jsonData.personas) {
  jsonData.personas.forEach(persona => {
    // Check if we already have this persona
    const existing = personaMappings.find(p => p.personaId === persona.persona_id);
    if (!existing) {
      personaMappings.push({
        personaName: persona.name,
        personaId: persona.persona_id,
        roleName: persona.role,
        departmentName: persona.department,
        functionName: persona.function
      });
    }
  });
}

console.log(`Found ${personaMappings.length} personas to map`);

// Generate SQL
const sqlStatements = [];

sqlStatements.push(`-- =====================================================================`);
sqlStatements.push(`-- MAP PERSONAS TO ROLES, FUNCTIONS, AND DEPARTMENTS`);
sqlStatements.push(`-- Generated from BUSINESS_FULL_CONSOLIDATED_FUNCTION_DEPT_ROLE_PERSONA_JTBD.json`);
sqlStatements.push(`-- Total personas: ${personaMappings.length}`);
sqlStatements.push(`-- =====================================================================`);
sqlStatements.push(``);
sqlStatements.push(`BEGIN;`);
sqlStatements.push(``);
sqlStatements.push(`DO $$`);
sqlStatements.push(`DECLARE`);
sqlStatements.push(`    pharma_tenant_id uuid;`);
sqlStatements.push(`    persona_record RECORD;`);
sqlStatements.push(`    matched_role_id uuid;`);
sqlStatements.push(`    matched_function_id uuid;`);
sqlStatements.push(`    matched_department_id uuid;`);
sqlStatements.push(`    personas_updated INTEGER := 0;`);
sqlStatements.push(`    personas_not_found INTEGER := 0;`);
sqlStatements.push(`    roles_not_found INTEGER := 0;`);
sqlStatements.push(`    update_count INTEGER;`);
sqlStatements.push(`    has_name_col boolean;`);
sqlStatements.push(`    has_slug_col boolean;`);
sqlStatements.push(`    query_str text;`);
sqlStatements.push(`BEGIN`);
sqlStatements.push(`    -- Get Pharmaceuticals tenant ID`);
sqlStatements.push(`    SELECT id INTO pharma_tenant_id`);
sqlStatements.push(`    FROM public.tenants`);
sqlStatements.push(`    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'`);
sqlStatements.push(`    LIMIT 1;`);
sqlStatements.push(``);
sqlStatements.push(`    IF pharma_tenant_id IS NULL THEN`);
sqlStatements.push(`        RAISE EXCEPTION 'Pharmaceuticals tenant not found';`);
sqlStatements.push(`    END IF;`);
sqlStatements.push(``);
sqlStatements.push(`    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;`);
sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(`    RAISE NOTICE '=== MAPPING PERSONAS TO ROLES ===';`);
sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(``);
sqlStatements.push(`    -- Check which columns exist in personas table`);
sqlStatements.push(`    SELECT EXISTS (`);
sqlStatements.push(`        SELECT 1 FROM information_schema.columns`);
sqlStatements.push(`        WHERE table_schema = 'public'`);
sqlStatements.push(`          AND table_name = 'personas'`);
sqlStatements.push(`          AND column_name = 'name'`);
sqlStatements.push(`    ) INTO has_name_col;`);
sqlStatements.push(``);
sqlStatements.push(`    SELECT EXISTS (`);
sqlStatements.push(`        SELECT 1 FROM information_schema.columns`);
sqlStatements.push(`        WHERE table_schema = 'public'`);
sqlStatements.push(`          AND table_name = 'personas'`);
sqlStatements.push(`          AND column_name = 'slug'`);
sqlStatements.push(`    ) INTO has_slug_col;`);
sqlStatements.push(``);
sqlStatements.push(`    -- Check org_roles column structure`);
sqlStatements.push(`    -- We'll use dynamic matching in the loop`);
sqlStatements.push(``);

// Generate the mapping logic for each persona
personaMappings.forEach((persona, index) => {
  const personaNameEscaped = persona.personaName.replace(/'/g, "''");
  const roleNameEscaped = persona.roleName.replace(/'/g, "''");
  const functionNameEscaped = persona.functionName.replace(/'/g, "''");
  const departmentNameEscaped = persona.departmentName.replace(/'/g, "''");
  const personaIdEscaped = persona.personaId.replace(/'/g, "''");
  
  sqlStatements.push(`    -- Persona: ${personaNameEscaped}`);
  sqlStatements.push(`    -- Role: ${roleNameEscaped}, Function: ${functionNameEscaped}, Department: ${departmentNameEscaped}`);
  
  // Find the role - try exact match first, then partial match
  // Use r.name::text (role_name column doesn't exist in org_roles)
  sqlStatements.push(`    SELECT r.id INTO matched_role_id`);
  sqlStatements.push(`    FROM public.org_roles r`);
  sqlStatements.push(`    WHERE r.tenant_id = pharma_tenant_id`);
  sqlStatements.push(`      AND (`);
  sqlStatements.push(`        r.name::text ILIKE '${roleNameEscaped}'`);
  sqlStatements.push(`        OR r.name::text ILIKE '%${roleNameEscaped}%'`);
  sqlStatements.push(`      )`);
  sqlStatements.push(`    ORDER BY CASE`);
  sqlStatements.push(`        WHEN r.name::text ILIKE '${roleNameEscaped}' THEN 1`);
  sqlStatements.push(`        ELSE 2`);
  sqlStatements.push(`    END`);
  sqlStatements.push(`    LIMIT 1;`);
  sqlStatements.push(``);
  
  // If role found, get function and department from the role
  sqlStatements.push(`    IF matched_role_id IS NOT NULL THEN`);
  sqlStatements.push(`        SELECT r.function_id, r.department_id`);
  sqlStatements.push(`        INTO matched_function_id, matched_department_id`);
  sqlStatements.push(`        FROM public.org_roles r`);
  sqlStatements.push(`        WHERE r.id = matched_role_id;`);
  sqlStatements.push(``);
  sqlStatements.push(`        -- Update persona by name or slug`);
  sqlStatements.push(`        IF has_slug_col THEN`);
  sqlStatements.push(`            UPDATE public.personas`);
  sqlStatements.push(`            SET`);
  sqlStatements.push(`                role_id = matched_role_id,`);
  sqlStatements.push(`                function_id = matched_function_id,`);
  sqlStatements.push(`                department_id = matched_department_id,`);
  sqlStatements.push(`                updated_at = NOW()`);
  sqlStatements.push(`            WHERE slug = '${personaIdEscaped}'`);
  sqlStatements.push(`               OR (name ILIKE '%${personaNameEscaped}%' AND slug IS NULL);`);
  sqlStatements.push(`        ELSIF has_name_col THEN`);
  sqlStatements.push(`            UPDATE public.personas`);
  sqlStatements.push(`            SET`);
  sqlStatements.push(`                role_id = matched_role_id,`);
  sqlStatements.push(`                function_id = matched_function_id,`);
  sqlStatements.push(`                department_id = matched_department_id,`);
  sqlStatements.push(`                updated_at = NOW()`);
  sqlStatements.push(`            WHERE name ILIKE '%${personaNameEscaped}%';`);
  sqlStatements.push(`        END IF;`);
  sqlStatements.push(``);
  sqlStatements.push(`                GET DIAGNOSTICS update_count = ROW_COUNT;`);
        sqlStatements.push(`        IF update_count > 0 THEN`);
        sqlStatements.push(`            personas_updated := personas_updated + update_count;`);
        sqlStatements.push(`            IF personas_updated % 10 = 0 OR personas_updated <= 5 THEN`);
        sqlStatements.push(`                RAISE NOTICE '  ✅ Mapped persona: "${personaNameEscaped}" -> "${roleNameEscaped}"';`);
        sqlStatements.push(`            END IF;`);
        sqlStatements.push(`        ELSE`);
        sqlStatements.push(`            personas_not_found := personas_not_found + 1;`);
        sqlStatements.push(`            IF personas_not_found <= 10 THEN`);
        sqlStatements.push(`                RAISE NOTICE '  ⚠️  Persona not found: "${personaNameEscaped}"';`);
        sqlStatements.push(`            END IF;`);
        sqlStatements.push(`        END IF;`);
  sqlStatements.push(`    ELSE`);
  sqlStatements.push(`        roles_not_found := roles_not_found + 1;`);
  sqlStatements.push(`        IF roles_not_found <= 10 THEN`);
  sqlStatements.push(`            RAISE NOTICE '  ❌ Role not found for persona "${personaNameEscaped}": "${roleNameEscaped}"';`);
  sqlStatements.push(`        END IF;`);
  sqlStatements.push(`    END IF;`);
  sqlStatements.push(``);
});

sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(`    RAISE NOTICE '=== MAPPING COMPLETE ===';`);
sqlStatements.push(`    RAISE NOTICE 'Summary:';`);
sqlStatements.push(`    RAISE NOTICE '  - Total personas processed: %', ${personaMappings.length};`);
sqlStatements.push(`    RAISE NOTICE '  - Personas updated: %', personas_updated;`);
sqlStatements.push(`    RAISE NOTICE '  - Personas not found in DB: %', personas_not_found;`);
sqlStatements.push(`    RAISE NOTICE '  - Roles not found: %', roles_not_found;`);
sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(`    RAISE NOTICE '✅ Persona mapping process finished.';`);
sqlStatements.push(`END $$;`);
sqlStatements.push(``);
sqlStatements.push(`COMMIT;`);

// Write the SQL file
const outputPath = path.join(__dirname, 'map_personas_to_roles_generated.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf8');

console.log(`\n✅ Generated SQL script: ${outputPath}`);
console.log(`   Total personas to map: ${personaMappings.length}`);
console.log(`\nNext steps:`);
console.log(`1. Review the generated SQL file`);
console.log(`2. Run it in your Supabase SQL editor`);


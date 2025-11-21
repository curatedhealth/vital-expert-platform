#!/usr/bin/env node

/**
 * Map Roles from JSON File
 * 
 * This script:
 * 1. Parses PHARMA_ROLE_SCOPE_NORMALIZED.json
 * 2. Identifies missing roles (in JSON but not in DB)
 * 3. Generates SQL to map all roles to correct function/department
 * 4. Creates missing roles
 */

const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = '/Users/hichamnaim/Downloads/PHARMA_ROLE_SCOPE_NORMALIZED.json';
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Extract unique roles (ignoring scope variations)
const uniqueRoles = new Map();

jsonData.forEach(item => {
    const key = `${item.function}|${item.department}|${item.role}`;
    if (!uniqueRoles.has(key)) {
        uniqueRoles.set(key, {
            function: item.function,
            department: item.department,
            role: item.role,
            scopes: []
        });
    }
    uniqueRoles.get(key).scopes.push(item.scope);
});

// Generate SQL script
const sqlStatements = [];

sqlStatements.push(`-- =====================================================================`);
sqlStatements.push(`-- MAP ROLES FROM JSON FILE`);
sqlStatements.push(`-- Generated from: PHARMA_ROLE_SCOPE_NORMALIZED.json`);
sqlStatements.push(`-- Total unique roles: ${uniqueRoles.size}`);
sqlStatements.push(`-- =====================================================================`);
sqlStatements.push(``);
sqlStatements.push(`BEGIN;`);
sqlStatements.push(``);
sqlStatements.push(`DO $$`);
sqlStatements.push(`DECLARE`);
sqlStatements.push(`    pharma_tenant_id uuid;`);
sqlStatements.push(`    matched_function_id uuid;`);
sqlStatements.push(`    matched_department_id uuid;`);
sqlStatements.push(`    existing_role_id uuid;`);
sqlStatements.push(`    roles_created INTEGER := 0;`);
sqlStatements.push(`    roles_updated INTEGER := 0;`);
sqlStatements.push(`    roles_mapped INTEGER := 0;`);
sqlStatements.push(`    roles_unmapped INTEGER := 0;`);
sqlStatements.push(`    slug_value text;`);
sqlStatements.push(`    unique_id_value text;`);
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
sqlStatements.push(`    RAISE NOTICE '=== MAPPING ROLES FROM JSON ===';`);
sqlStatements.push(`    RAISE NOTICE '';`);

// Generate role mapping statements
const roleEntries = Array.from(uniqueRoles.values());

roleEntries.forEach((roleData, index) => {
    const { function: funcName, department: deptName, role: roleName } = roleData;
    
    // Generate slug
    const slug = roleName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    sqlStatements.push(`    -- Role ${index + 1}/${roleEntries.length}: ${roleName}`);
    sqlStatements.push(`    -- Function: ${funcName}, Department: ${deptName}`);
    sqlStatements.push(`    `);
    sqlStatements.push(`    -- Get function ID`);
    sqlStatements.push(`    SELECT id INTO matched_function_id`);
    sqlStatements.push(`    FROM public.org_functions`);
    sqlStatements.push(`    WHERE tenant_id = pharma_tenant_id`);
    sqlStatements.push(`      AND name::text = '${funcName.replace(/'/g, "''")}'`);
    sqlStatements.push(`    LIMIT 1;`);
    sqlStatements.push(`    `);
    sqlStatements.push(`    -- Get department ID`);
    sqlStatements.push(`    IF matched_function_id IS NOT NULL THEN`);
    sqlStatements.push(`        SELECT id INTO matched_department_id`);
    sqlStatements.push(`        FROM public.org_departments`);
    sqlStatements.push(`        WHERE tenant_id = pharma_tenant_id`);
    sqlStatements.push(`          AND function_id = matched_function_id`);
    sqlStatements.push(`          AND name = '${deptName.replace(/'/g, "''")}'`);
    sqlStatements.push(`        LIMIT 1;`);
    sqlStatements.push(`    END IF;`);
    sqlStatements.push(`    `);
    sqlStatements.push(`    -- Check if role exists`);
    sqlStatements.push(`    SELECT id INTO existing_role_id`);
    sqlStatements.push(`    FROM public.org_roles`);
    sqlStatements.push(`    WHERE tenant_id = pharma_tenant_id`);
    sqlStatements.push(`      AND LOWER(TRIM(role_name)) = LOWER(TRIM('${roleName.replace(/'/g, "''")}'))`);
    sqlStatements.push(`    LIMIT 1;`);
    sqlStatements.push(`    `);
    sqlStatements.push(`    -- Create or update role`);
    sqlStatements.push(`    IF existing_role_id IS NULL THEN`);
    sqlStatements.push(`        -- Create new role`);
    sqlStatements.push(`        unique_id_value := 'role-' || '${slug}' || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);`);
    sqlStatements.push(`        `);
    sqlStatements.push(`        INSERT INTO public.org_roles (`);
    sqlStatements.push(`            unique_id,`);
    sqlStatements.push(`            role_name,`);
    sqlStatements.push(`            tenant_id,`);
    sqlStatements.push(`            function_id,`);
    sqlStatements.push(`            department_id,`);
    sqlStatements.push(`            is_active,`);
    sqlStatements.push(`            created_at,`);
    sqlStatements.push(`            updated_at`);
    sqlStatements.push(`        )`);
    sqlStatements.push(`        VALUES (`);
    sqlStatements.push(`            unique_id_value,`);
    sqlStatements.push(`            '${roleName.replace(/'/g, "''")}',`);
    sqlStatements.push(`            pharma_tenant_id,`);
    sqlStatements.push(`            matched_function_id,`);
    sqlStatements.push(`            matched_department_id,`);
    sqlStatements.push(`            true,`);
    sqlStatements.push(`            NOW(),`);
    sqlStatements.push(`            NOW()`);
    sqlStatements.push(`        )`);
    sqlStatements.push(`        ON CONFLICT (unique_id) DO NOTHING`);
    sqlStatements.push(`        RETURNING id INTO existing_role_id;`);
    sqlStatements.push(`        `);
    sqlStatements.push(`        IF existing_role_id IS NOT NULL THEN`);
    sqlStatements.push(`            roles_created := roles_created + 1;`);
    sqlStatements.push(`            RAISE NOTICE '  ✅ Created role: "%" -> Function: "%", Department: "%"',`);
    sqlStatements.push(`                '${roleName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                '${funcName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                '${deptName.replace(/'/g, "''")}';`);
    sqlStatements.push(`        END IF;`);
    sqlStatements.push(`    ELSE`);
    sqlStatements.push(`        -- Update existing role`);
    sqlStatements.push(`        UPDATE public.org_roles`);
    sqlStatements.push(`        SET `);
    sqlStatements.push(`            function_id = matched_function_id,`);
    sqlStatements.push(`            department_id = matched_department_id,`);
    sqlStatements.push(`            updated_at = NOW()`);
    sqlStatements.push(`        WHERE id = existing_role_id;`);
    sqlStatements.push(`        `);
    sqlStatements.push(`        GET DIAGNOSTICS roles_updated = ROW_COUNT;`);
    sqlStatements.push(`        IF roles_updated > 0 THEN`);
    sqlStatements.push(`            roles_mapped := roles_mapped + 1;`);
    sqlStatements.push(`            IF matched_department_id IS NOT NULL THEN`);
    sqlStatements.push(`                RAISE NOTICE '  ✅ Mapped role "%" to Function: "%", Department: "%"',`);
    sqlStatements.push(`                    '${roleName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                    '${funcName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                    '${deptName.replace(/'/g, "''")}';`);
    sqlStatements.push(`            ELSE`);
    sqlStatements.push(`                RAISE NOTICE '  ⚠️  Mapped role "%" to Function: "%" (department not found: "%")',`);
    sqlStatements.push(`                    '${roleName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                    '${funcName.replace(/'/g, "''")}',`);
    sqlStatements.push(`                    '${deptName.replace(/'/g, "''")}';`);
    sqlStatements.push(`            END IF;`);
    sqlStatements.push(`        END IF;`);
    sqlStatements.push(`    END IF;`);
    sqlStatements.push(`    `);
});

sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(`    RAISE NOTICE '=== SUMMARY ===';`);
sqlStatements.push(`    RAISE NOTICE '  - Total roles processed: %', ${roleEntries.length};`);
sqlStatements.push(`    RAISE NOTICE '  - Roles created: %', roles_created;`);
sqlStatements.push(`    RAISE NOTICE '  - Roles mapped: %', roles_mapped;`);
sqlStatements.push(`    RAISE NOTICE '';`);
sqlStatements.push(`    RAISE NOTICE '✅ Role mapping complete.';`);
sqlStatements.push(`END $$;`);
sqlStatements.push(``);
sqlStatements.push(`COMMIT;`);

// Write SQL file
const outputPath = path.join(__dirname, 'map_roles_from_json_generated.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n'));

console.log(`✅ Generated SQL script: ${outputPath}`);
console.log(`   Total unique roles: ${uniqueRoles.size}`);
console.log(`   Total JSON entries: ${jsonData.length}`);

// Also create a summary report
const summary = {
    totalJsonEntries: jsonData.length,
    uniqueRoles: uniqueRoles.size,
    rolesByFunction: {},
    rolesByDepartment: {}
};

roleEntries.forEach(role => {
    // Count by function
    summary.rolesByFunction[role.function] = (summary.rolesByFunction[role.function] || 0) + 1;
    
    // Count by department
    const deptKey = `${role.function} > ${role.department}`;
    summary.rolesByDepartment[deptKey] = (summary.rolesByDepartment[deptKey] || 0) + 1;
});

const summaryPath = path.join(__dirname, 'role_mapping_summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`✅ Generated summary: ${summaryPath}`);


const fetch = require('node-fetch').default;
const fs = require('fs');
const csv = require('csv-parser');

async function importAllDepartmentsFromCSV() {
  console.log('🚀 Importing all departments from CSV and creating comprehensive mappings...\n');

  try {
    // Step 1: Read and parse the CSV file
    console.log('📖 Reading CSV file...');
    const csvData = [];
    const csvPath = 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv';
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.Department_Name && row.Department_Name.trim() !== '') {
            csvData.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✅ Found ${csvData.length} departments in CSV\n`);

    // Step 2: Get current data from API
    console.log('📊 Fetching current organizational data...');
    
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const orgData = await response.json();
    
    if (!orgData.success) {
      console.error('❌ Error fetching organizational data:', orgData.error);
      return;
    }

    const { functions, departments, roles } = orgData.data;
    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Step 3: Create lookup maps
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    const departmentMap = new Map();
    departments?.forEach(dept => {
      departmentMap.set(dept.department_name, dept.id);
    });

    // Step 4: Analyze CSV data and create comprehensive mappings
    console.log('📋 Analyzing CSV departments and their function mappings...\n');
    
    const departmentMappings = [];
    const missingDepartments = [];
    const missingFunctions = [];

    csvData.forEach(row => {
      const deptName = row.Department_Name.trim();
      const functionName = row['🏫 Functions']?.trim();
      
      if (deptName && functionName) {
        // Clean up function name (remove Notion links)
        const cleanFunctionName = functionName.replace(/\(https:\/\/www\.notion\.so\/[^)]+\)/g, '').trim();
        
        const existingDept = departmentMap.get(deptName);
        const functionId = functionMap.get(cleanFunctionName);
        
        if (existingDept && functionId) {
          departmentMappings.push({
            dept: deptName,
            deptId: existingDept,
            func: cleanFunctionName,
            funcId: functionId,
            status: 'EXISTS'
          });
        } else if (existingDept && !functionId) {
          missingFunctions.push({
            dept: deptName,
            func: cleanFunctionName,
            status: 'MISSING_FUNCTION'
          });
        } else if (!existingDept && functionId) {
          missingDepartments.push({
            dept: deptName,
            func: cleanFunctionName,
            funcId: functionId,
            status: 'MISSING_DEPARTMENT'
          });
        } else {
          missingDepartments.push({
            dept: deptName,
            func: cleanFunctionName,
            status: 'MISSING_BOTH'
          });
        }
      }
    });

    console.log('📊 MAPPING ANALYSIS:');
    console.log('===================');
    console.log(`✅ Departments that exist and can be mapped: ${departmentMappings.length}`);
    console.log(`⚠️  Departments missing from database: ${missingDepartments.length}`);
    console.log(`⚠️  Functions missing from database: ${missingFunctions.length}\n`);

    // Step 5: Create comprehensive SQL script
    console.log('📝 Creating comprehensive SQL mapping script...\n');

    const sqlScript = `-- Comprehensive Organizational Structure Mapping Script
-- Generated from CSV data analysis
-- Run this in your Supabase SQL editor

-- =====================================================================
-- 1. DEPARTMENT TO FUNCTION MAPPINGS (Existing Departments)
-- =====================================================================

${departmentMappings.map(mapping => 
  `UPDATE org_departments SET function_id = '${mapping.funcId}' WHERE id = '${mapping.deptId}'; -- ${mapping.dept} → ${mapping.func}`
).join('\n')}

-- =====================================================================
-- 2. MISSING DEPARTMENTS (Need to be created)
-- =====================================================================

${missingDepartments.filter(d => d.status === 'MISSING_DEPARTMENT' || d.status === 'MISSING_BOTH').map(dept => {
  const funcId = dept.funcId || 'NULL';
  return `-- TODO: Create department "${dept.dept}" and map to function "${dept.func}" (function_id: ${funcId})`;
}).join('\n')}

-- =====================================================================
-- 3. MISSING FUNCTIONS (Need to be created)
-- =====================================================================

${missingFunctions.map(func => 
  `-- TODO: Create function "${func.func}" for department "${func.dept}"`
).join('\n')}

-- =====================================================================
-- 4. ROLE TO DEPARTMENT MAPPINGS (Based on CSV data)
-- =====================================================================

${csvData.map(row => {
  const deptName = row.Department_Name?.trim();
  const functionName = row['🏫 Functions']?.replace(/\(https:\/\/www\.notion\.so\/[^)]+\)/g, '').trim();
  const rolesText = row.Roles;
  
  if (deptName && functionName && rolesText) {
    const roleMatches = rolesText.match(/[^(]+\([^)]+\)/g) || [];
    const deptId = departmentMap.get(deptName);
    const funcId = functionMap.get(functionName);
    
    if (deptId && funcId && roleMatches.length > 0) {
      return `-- Roles for ${deptName} (${deptId}) → ${functionName} (${funcId}):
${roleMatches.slice(0, 5).map(roleText => {
  const roleName = roleText.split('(')[0].trim();
  const role = roles?.find(r => r.role_name === roleName);
  if (role) {
    return `UPDATE org_roles SET department_id = '${deptId}', function_id = '${funcId}' WHERE id = '${role.id}'; -- ${roleName}`;
  }
  return `-- TODO: Create role "${roleName}" for department "${deptName}"`;
}).join('\n')}`;
    }
  }
  return null;
}).filter(Boolean).join('\n\n')}

-- =====================================================================
-- 5. VERIFICATION QUERIES
-- =====================================================================

-- Check department mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

-- Check role mappings
SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

-- Show hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;

-- Show missing departments
SELECT 
  'Missing departments' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NULL;
`;

    // Write the comprehensive SQL script
    fs.writeFileSync('scripts/comprehensive-organizational-mappings.sql', sqlScript);
    
    console.log('✅ Created comprehensive-organizational-mappings.sql script');
    console.log('📝 This script contains all mappings for existing departments and TODOs for missing ones\n');

    // Step 6: Create detailed analysis report
    console.log('📊 DETAILED ANALYSIS REPORT:');
    console.log('============================\n');

    console.log('✅ EXISTING DEPARTMENTS (Can be mapped immediately):');
    departmentMappings.forEach(mapping => {
      console.log(`  - ${mapping.dept} → ${mapping.func}`);
    });

    console.log('\n⚠️  MISSING DEPARTMENTS (Need to be created):');
    missingDepartments.forEach(dept => {
      console.log(`  - ${dept.dept} → ${dept.func} (${dept.status})`);
    });

    console.log('\n⚠️  MISSING FUNCTIONS (Need to be created):');
    missingFunctions.forEach(func => {
      console.log(`  - ${func.func} (for ${func.dept})`);
    });

    // Step 7: Create department creation script
    const createDepartmentsScript = `-- Create Missing Departments Script
-- Run this after creating missing functions

${missingDepartments.filter(d => d.funcId).map(dept => {
  return `INSERT INTO org_departments (id, department_name, function_id, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '${dept.dept}',
  '${dept.funcId}',
  'Department created from CSV import',
  NOW(),
  NOW()
); -- ${dept.dept} → ${dept.func}`;
}).join('\n')}`;

    fs.writeFileSync('scripts/create-missing-departments.sql', createDepartmentsScript);

    console.log('\n📁 FILES CREATED:');
    console.log('================');
    console.log('1. scripts/comprehensive-organizational-mappings.sql - Main mapping script');
    console.log('2. scripts/create-missing-departments.sql - Script to create missing departments');
    console.log('3. This analysis report');

    console.log('\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Review the analysis report above');
    console.log('2. Create missing functions in Supabase if needed');
    console.log('3. Run create-missing-departments.sql to create missing departments');
    console.log('4. Run comprehensive-organizational-mappings.sql to establish all mappings');
    console.log('5. Verify the organizational structure API');

  } catch (error) {
    console.error('❌ Fatal error during comprehensive import:', error);
  }
}

// Run the comprehensive import
importAllDepartmentsFromCSV()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

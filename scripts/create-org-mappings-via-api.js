const fetch = require('node-fetch').default;

async function createOrganizationalMappings() {
  console.log('🚀 Creating organizational structure mappings via API...\n');

  try {
    // Step 1: Get current organizational data
    console.log('📊 Fetching current organizational data...');
    
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const orgData = await response.json();
    
    if (!orgData.success) {
      console.error('❌ Error fetching organizational data:', orgData.error);
      return;
    }

    const { functions, departments, roles } = orgData.data;
    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Step 2: Create lookup maps
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    const departmentMap = new Map();
    departments?.forEach(dept => {
      departmentMap.set(dept.department_name, dept.id);
    });

    const roleMap = new Map();
    roles?.forEach(role => {
      roleMap.set(role.role_name, role.id);
    });

    console.log('📋 Available Functions:');
    functions?.forEach(func => console.log(`  - ${func.department_name} (${func.id})`));
    console.log('\n📋 Available Departments:');
    departments?.forEach(dept => console.log(`  - ${dept.department_name} (${dept.id})`));
    console.log('\n📋 Available Roles (first 10):');
    roles?.slice(0, 10).forEach(role => console.log(`  - ${role.role_name} (${role.id})`));
    console.log(`  ... and ${roles?.length - 10} more roles\n`);

    // Step 3: Department to Function mappings based on actual data
    console.log('🏢 Creating department-to-function mappings...');
    
    const departmentMappings = [
      // Research & Development
      { dept: 'Drug Discovery', func: 'Research & Development' },
      { dept: 'Preclinical Development', func: 'Research & Development' },
      { dept: 'Translational Medicine', func: 'Research & Development' },
      
      // Clinical Development
      { dept: 'Clinical Operations', func: 'Clinical Development' },
      { dept: 'Clinical Development', func: 'Clinical Development' },
      { dept: 'Data Management', func: 'Clinical Development' },
      { dept: 'Biostatistics', func: 'Clinical Development' },
      
      // Regulatory Affairs
      { dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { dept: 'Regulatory CMC', func: 'Regulatory Affairs' },
      { dept: 'Regulatory Intelligence', func: 'Regulatory Affairs' },
      
      // Manufacturing
      { dept: 'Drug Substance', func: 'Manufacturing' },
      { dept: 'Drug Product', func: 'Manufacturing' },
      { dept: 'Supply Chain', func: 'Manufacturing' },
      
      // Quality
      { dept: 'Quality Assurance', func: 'Quality' },
      { dept: 'Quality Control', func: 'Quality' },
      { dept: 'Quality Compliance', func: 'Quality' },
      
      // Medical Affairs
      { dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      { dept: 'Medical Information', func: 'Medical Affairs' },
      { dept: 'Medical Communications', func: 'Medical Affairs' },
      
      // Pharmacovigilance
      { dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { dept: 'Risk Management', func: 'Pharmacovigilance' },
      { dept: 'Epidemiology', func: 'Pharmacovigilance' },
      
      // Commercial
      { dept: 'Marketing', func: 'Commercial' },
      { dept: 'Sales', func: 'Commercial' },
      { dept: 'Market Access', func: 'Commercial' },
      { dept: 'HEOR', func: 'Commercial' },
      
      // Business Development
      { dept: 'BD&L', func: 'Business Development' },
      { dept: 'Strategic Planning', func: 'Business Development' },
      
      // Legal
      { dept: 'Legal Affairs', func: 'Legal' },
      
      // Finance
      { dept: 'Finance & Accounting', func: 'Finance' },
      
      // IT/Digital
      { dept: 'Information Technology', func: 'IT/Digital' }
    ];

    // Filter to only include departments that exist in the database
    const existingDepartmentMappings = departmentMappings.filter(mapping => 
      departmentMap.has(mapping.dept) && functionMap.has(mapping.func)
    );

    console.log(`📋 Found ${existingDepartmentMappings.length} existing department mappings to create\n`);

    // Create a comprehensive mapping script that can be run manually
    console.log('📝 Creating mapping script for manual execution...\n');

    const mappingScript = `
-- Organizational Structure Mapping Script
-- Run this in your Supabase SQL editor

-- Department to Function Mappings
${existingDepartmentMappings.map(mapping => {
  const deptId = departmentMap.get(mapping.dept);
  const funcId = functionMap.get(mapping.func);
  return `UPDATE org_departments SET function_id = '${funcId}' WHERE id = '${deptId}'; -- ${mapping.dept} → ${mapping.func}`;
}).join('\n')}

-- Role to Department Mappings (sample - you can expand this)
-- These are based on the CSV data structure
${roles?.slice(0, 20).map(role => {
  // Try to match role to department based on common patterns
  let department = null;
  let functionName = null;
  
  if (role.role_name.includes('Clinical') || role.role_name.includes('Medical')) {
    department = 'Clinical Development';
    functionName = 'Clinical Development';
  } else if (role.role_name.includes('Regulatory')) {
    department = 'Global Regulatory';
    functionName = 'Regulatory Affairs';
  } else if (role.role_name.includes('Quality') || role.role_name.includes('QA')) {
    department = 'Quality Assurance';
    functionName = 'Quality';
  } else if (role.role_name.includes('Marketing') || role.role_name.includes('Sales')) {
    department = 'Marketing';
    functionName = 'Commercial';
  } else if (role.role_name.includes('Finance') || role.role_name.includes('CFO')) {
    department = 'Finance & Accounting';
    functionName = 'Finance';
  } else if (role.role_name.includes('IT') || role.role_name.includes('CIO')) {
    department = 'Information Technology';
    functionName = 'IT/Digital';
  } else if (role.role_name.includes('Legal') || role.role_name.includes('Counsel')) {
    department = 'Legal Affairs';
    functionName = 'Legal';
  } else if (role.role_name.includes('Business') || role.role_name.includes('Strategy')) {
    department = 'Strategic Planning';
    functionName = 'Business Development';
  }
  
  if (department && functionName) {
    const deptId = departmentMap.get(department);
    const funcId = functionMap.get(functionName);
    if (deptId && funcId) {
      return `UPDATE org_roles SET department_id = '${deptId}', function_id = '${funcId}' WHERE id = '${role.id}'; -- ${role.role_name} → ${department} → ${functionName}`;
    }
  }
  return null;
}).filter(Boolean).join('\n')}

-- Agent to Role Mappings (sample)
-- Update agents with their corresponding roles and departments
UPDATE agents SET 
  business_function = 'Research & Development',
  department = 'Drug Discovery',
  role = 'Principal Scientist'
WHERE name ILIKE '%scientist%' OR name ILIKE '%research%';

UPDATE agents SET 
  business_function = 'Clinical Development',
  department = 'Clinical Operations',
  role = 'Clinical Trial Manager'
WHERE name ILIKE '%clinical%' OR name ILIKE '%trial%';

UPDATE agents SET 
  business_function = 'Regulatory Affairs',
  department = 'Global Regulatory',
  role = 'Regulatory Affairs Manager'
WHERE name ILIKE '%regulatory%' OR name ILIKE '%compliance%';

UPDATE agents SET 
  business_function = 'Quality',
  department = 'Quality Assurance',
  role = 'QA Manager'
WHERE name ILIKE '%quality%' OR name ILIKE '%qa%';

UPDATE agents SET 
  business_function = 'Commercial',
  department = 'Marketing',
  role = 'Marketing Manager'
WHERE name ILIKE '%marketing%' OR name ILIKE '%commercial%';

UPDATE agents SET 
  business_function = 'Finance',
  department = 'Finance & Accounting',
  role = 'Finance Director'
WHERE name ILIKE '%finance%' OR name ILIKE '%accounting%';

UPDATE agents SET 
  business_function = 'IT/Digital',
  department = 'Information Technology',
  role = 'IT Director'
WHERE name ILIKE '%it%' OR name ILIKE '%digital%' OR name ILIKE '%technology%';

UPDATE agents SET 
  business_function = 'Legal',
  department = 'Legal Affairs',
  role = 'General Counsel'
WHERE name ILIKE '%legal%' OR name ILIKE '%counsel%';

-- Verify the mappings
SELECT 
  'Departments mapped to functions' as type,
  COUNT(*) as count
FROM org_departments 
WHERE function_id IS NOT NULL;

SELECT 
  'Roles mapped to departments' as type,
  COUNT(*) as count
FROM org_roles 
WHERE department_id IS NOT NULL;

SELECT 
  'Agents with business_function' as type,
  COUNT(*) as count
FROM agents 
WHERE business_function IS NOT NULL;

-- Show sample hierarchical structure
SELECT 
  f.department_name as function_name,
  d.department_name,
  COUNT(r.id) as role_count
FROM org_functions f
LEFT JOIN org_departments d ON d.function_id = f.id
LEFT JOIN org_roles r ON r.department_id = d.id
GROUP BY f.id, f.department_name, d.id, d.department_name
ORDER BY f.department_name, d.department_name;
`;

    // Write the mapping script to a file
    const fs = require('fs');
    fs.writeFileSync('scripts/organizational-mappings.sql', mappingScript);
    
    console.log('✅ Created organizational-mappings.sql script');
    console.log('📝 This script contains all the SQL commands needed to establish the mappings');
    console.log('🔧 You can run this script in your Supabase SQL editor to create all the mappings\n');

    // Also create a summary of what we found
    console.log('📊 Summary of Available Data:');
    console.log('============================');
    console.log(`Functions: ${functions?.length || 0}`);
    console.log(`Departments: ${departments?.length || 0}`);
    console.log(`Roles: ${roles?.length || 0}`);
    console.log(`Department mappings to create: ${existingDepartmentMappings.length}`);
    console.log(`Role mappings to create: ${roles?.length || 0} (sample in script)`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run the organizational-mappings.sql script in Supabase SQL editor');
    console.log('2. Verify the mappings using the verification queries in the script');
    console.log('3. Test the organizational structure API to see the hierarchical data');

  } catch (error) {
    console.error('❌ Fatal error during mapping creation:', error);
  }
}

// Run the mapping creation
createOrganizationalMappings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

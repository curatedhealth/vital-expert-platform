const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importOrganizationalData() {
  console.log('🚀 Starting organizational data import from CSV...\n');

  try {
    // First, let's check what's currently in the database
    console.log('📊 Checking current database state...');
    
    const { data: currentFunctions, error: funcError } = await supabase
      .from('org_functions')
      .select('*');
    
    const { data: currentDepartments, error: deptError } = await supabase
      .from('org_departments')
      .select('*');
    
    const { data: currentRoles, error: roleError } = await supabase
      .from('org_roles')
      .select('*');

    console.log(`Current functions: ${currentFunctions?.length || 0}`);
    console.log(`Current departments: ${currentDepartments?.length || 0}`);
    console.log(`Current roles: ${currentRoles?.length || 0}\n`);

    // Read and parse the CSV file
    const csvData = [];
    const csvPath = 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv';
    
    console.log('📖 Reading CSV file...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Only process rows that have meaningful data
          if (row.Department_Name && row.Department_Name.trim() !== '') {
            csvData.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${csvData.length} departments in CSV\n`);

    // Extract unique functions from the CSV
    const functionMap = new Map();
    csvData.forEach(row => {
      if (row['🏫 Functions'] && row['🏫 Functions'].trim() !== '') {
        const functionName = row['🏫 Functions'].trim();
        const functionId = row.Mapped_to_Functions || `FUNC-${functionName.replace(/\s+/g, '-').toUpperCase()}`;
        
        if (!functionMap.has(functionId)) {
          functionMap.set(functionId, {
            id: functionId,
            name: functionName,
            department_name: functionName, // Use function name as department_name for org_functions
            description: `Function: ${functionName}`,
            healthcare_category: 'Pharmaceutical'
          });
        }
      }
    });

    console.log(`📋 Found ${functionMap.size} unique functions:`);
    Array.from(functionMap.values()).forEach(func => {
      console.log(`  - ${func.name} (${func.id})`);
    });
    console.log('');

    // Import functions first
    console.log('🏢 Importing functions...');
    const functionsToInsert = Array.from(functionMap.values());
    
    const { data: insertedFunctions, error: insertFuncError } = await supabase
      .from('org_functions')
      .upsert(functionsToInsert, { 
        onConflict: 'department_name',
        ignoreDuplicates: false 
      })
      .select();

    if (insertFuncError) {
      console.error('❌ Error inserting functions:', insertFuncError);
      return;
    }

    console.log(`✅ Successfully imported ${insertedFunctions?.length || 0} functions\n`);

    // Get the function IDs from the database for mapping
    const { data: dbFunctions, error: dbFuncError } = await supabase
      .from('org_functions')
      .select('id, department_name');

    if (dbFuncError) {
      console.error('❌ Error fetching functions:', dbFuncError);
      return;
    }

    const functionIdMap = new Map();
    dbFunctions?.forEach(func => {
      functionIdMap.set(func.department_name, func.id);
    });

    // Prepare departments data
    console.log('🏢 Preparing departments data...');
    const departmentsToInsert = [];
    
    csvData.forEach((row, index) => {
      if (row.Department_Name && row.Department_Name.trim() !== '') {
        const functionName = row['🏫 Functions']?.trim();
        const functionId = functionIdMap.get(functionName);
        
        if (functionId) {
          departmentsToInsert.push({
            name: row.Department_Name.trim(),
            department_name: row.Department_Name.trim(),
            function_id: functionId,
            description: row.Description || `Department: ${row.Department_Name.trim()}`,
            department_type: row.Department_Type || 'Department',
            unique_id: row.Unique_ID || `DEPT-${String(index + 1).padStart(3, '0')}`,
            compliance_requirements: row.Compliance_Requirements || null,
            data_classification: row.Data_Classification || null,
            critical_systems: row.Critical_Systems || null
          });
        } else {
          console.log(`⚠️  Warning: No function found for department "${row.Department_Name}" with function "${functionName}"`);
        }
      }
    });

    console.log(`📋 Prepared ${departmentsToInsert.length} departments for import\n`);

    // Import departments
    console.log('🏢 Importing departments...');
    const { data: insertedDepartments, error: insertDeptError } = await supabase
      .from('org_departments')
      .upsert(departmentsToInsert, { 
        onConflict: 'department_name',
        ignoreDuplicates: false 
      })
      .select();

    if (insertDeptError) {
      console.error('❌ Error inserting departments:', insertDeptError);
      return;
    }

    console.log(`✅ Successfully imported ${insertedDepartments?.length || 0} departments\n`);

    // Get department IDs for role mapping
    const { data: dbDepartments, error: dbDeptError } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id');

    if (dbDeptError) {
      console.error('❌ Error fetching departments:', dbDeptError);
      return;
    }

    const departmentIdMap = new Map();
    dbDepartments?.forEach(dept => {
      departmentIdMap.set(dept.department_name, dept);
    });

    // Prepare roles data
    console.log('👤 Preparing roles data...');
    const rolesToInsert = [];
    
    csvData.forEach((row, index) => {
      if (row.Department_Name && row.Department_Name.trim() !== '' && row.Roles) {
        const departmentName = row.Department_Name.trim();
        const department = departmentIdMap.get(departmentName);
        
        if (department) {
          // Parse roles from the Roles column
          const rolesText = row.Roles;
          const roleMatches = rolesText.match(/[^(]+\([^)]+\)/g) || [];
          
          roleMatches.forEach((roleText, roleIndex) => {
            const roleName = roleText.split('(')[0].trim();
            const roleUrl = roleText.match(/\(([^)]+)\)/)?.[1];
            
            if (roleName) {
              rolesToInsert.push({
                name: roleName,
                role_name: roleName,
                department_id: department.id,
                function_id: department.function_id,
                description: `Role: ${roleName} in ${departmentName}`,
                competency_level: 'Professional',
                required_skills: [],
                unique_id: row.Mapped_to_Roles ? 
                  row.Mapped_to_Roles.split(',')[roleIndex]?.trim() : 
                  `ROLE-${String(rolesToInsert.length + 1).padStart(3, '0')}`
              });
            }
          });
        }
      }
    });

    console.log(`📋 Prepared ${rolesToInsert.length} roles for import\n`);

    // Import roles
    console.log('👤 Importing roles...');
    const { data: insertedRoles, error: insertRoleError } = await supabase
      .from('org_roles')
      .upsert(rolesToInsert, { 
        onConflict: 'role_name',
        ignoreDuplicates: false 
      })
      .select();

    if (insertRoleError) {
      console.error('❌ Error inserting roles:', insertRoleError);
      return;
    }

    console.log(`✅ Successfully imported ${insertedRoles?.length || 0} roles\n`);

    // Final summary
    console.log('📊 Final Summary:');
    console.log('================');
    console.log(`Functions: ${insertedFunctions?.length || 0}`);
    console.log(`Departments: ${insertedDepartments?.length || 0}`);
    console.log(`Roles: ${insertedRoles?.length || 0}`);
    console.log('\n🎉 Organizational data import completed successfully!');

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
}

// Run the import
importOrganizationalData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

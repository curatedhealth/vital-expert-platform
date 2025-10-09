const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importOrganizationalStructure() {
  console.log('🚀 Starting comprehensive organizational structure import...\n');

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

    // Step 2: Create function mappings from CSV data
    console.log('🏢 Creating function mappings...');
    const functionMap = new Map();
    
    csvData.forEach(row => {
      if (row['🏫 Functions'] && row['🏫 Functions'].trim() !== '') {
        const functionName = row['🏫 Functions'].trim();
        const functionId = row.Mapped_to_Functions || `FUNC-${functionName.replace(/\s+/g, '-').toUpperCase()}`;
        
        if (!functionMap.has(functionId)) {
          functionMap.set(functionId, {
            id: functionId,
            unique_id: functionId,
            department_name: functionName,
            description: `Function: ${functionName}`,
            healthcare_category: 'Pharmaceutical'
          });
        }
      }
    });

    console.log(`📋 Found ${functionMap.size} unique functions:`);
    Array.from(functionMap.values()).forEach(func => {
      console.log(`  - ${func.department_name} (${func.unique_id})`);
    });
    console.log('');

    // Step 3: Upsert functions
    console.log('🏢 Upserting functions...');
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

    console.log(`✅ Successfully upserted ${insertedFunctions?.length || 0} functions\n`);

    // Step 4: Get function IDs from database for mapping
    const { data: dbFunctions, error: dbFuncError } = await supabase
      .from('org_functions')
      .select('id, department_name, unique_id');

    if (dbFuncError) {
      console.error('❌ Error fetching functions:', dbFuncError);
      return;
    }

    const functionIdMap = new Map();
    dbFunctions?.forEach(func => {
      functionIdMap.set(func.department_name, func.id);
    });

    console.log(`📊 Function ID mapping created for ${functionIdMap.size} functions\n`);

    // Step 5: Prepare and upsert departments with proper function mappings
    console.log('🏢 Preparing departments with function mappings...');
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

    console.log(`📋 Prepared ${departmentsToInsert.length} departments for upsert\n`);

    // Step 6: Upsert departments
    console.log('🏢 Upserting departments...');
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

    console.log(`✅ Successfully upserted ${insertedDepartments?.length || 0} departments\n`);

    // Step 7: Get department IDs for role mapping
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

    console.log(`📊 Department ID mapping created for ${departmentIdMap.size} departments\n`);

    // Step 8: Prepare and upsert roles with proper department and function mappings
    console.log('👤 Preparing roles with department and function mappings...');
    const rolesToInsert = [];
    let roleCounter = 1;
    
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
                required_skills: [],
                unique_id: row.Mapped_to_Roles ? 
                  row.Mapped_to_Roles.split(',')[roleIndex]?.trim() : 
                  `ROLE-${String(roleCounter++).padStart(3, '0')}`
              });
            }
          });
        }
      }
    });

    console.log(`📋 Prepared ${rolesToInsert.length} roles for upsert\n`);

    // Step 9: Upsert roles
    console.log('👤 Upserting roles...');
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

    console.log(`✅ Successfully upserted ${insertedRoles?.length || 0} roles\n`);

    // Step 10: Verify the hierarchical structure
    console.log('🔍 Verifying hierarchical structure...');
    
    const { data: finalFunctions } = await supabase
      .from('org_functions')
      .select('id, department_name');
    
    const { data: finalDepartments } = await supabase
      .from('org_departments')
      .select('id, department_name, function_id');
    
    const { data: finalRoles } = await supabase
      .from('org_roles')
      .select('id, role_name, department_id, function_id');

    // Count mappings
    const departmentsWithFunctions = finalDepartments?.filter(d => d.function_id).length || 0;
    const rolesWithDepartments = finalRoles?.filter(r => r.department_id).length || 0;
    const rolesWithFunctions = finalRoles?.filter(r => r.function_id).length || 0;

    console.log('\n📊 Final Verification Results:');
    console.log('================================');
    console.log(`Functions: ${finalFunctions?.length || 0}`);
    console.log(`Departments: ${finalDepartments?.length || 0}`);
    console.log(`Roles: ${finalRoles?.length || 0}`);
    console.log(`Departments mapped to functions: ${departmentsWithFunctions}`);
    console.log(`Roles mapped to departments: ${rolesWithDepartments}`);
    console.log(`Roles mapped to functions: ${rolesWithFunctions}`);

    // Show sample hierarchical structure
    console.log('\n🏗️  Sample Hierarchical Structure:');
    console.log('===================================');
    
    const sampleFunction = finalFunctions?.[0];
    if (sampleFunction) {
      console.log(`\n📋 Function: ${sampleFunction.department_name}`);
      
      const functionDepartments = finalDepartments?.filter(d => d.function_id === sampleFunction.id) || [];
      console.log(`  📁 Departments (${functionDepartments.length}):`);
      functionDepartments.slice(0, 3).forEach(dept => {
        console.log(`    - ${dept.department_name}`);
        
        const departmentRoles = finalRoles?.filter(r => r.department_id === dept.id) || [];
        console.log(`      👥 Roles (${departmentRoles.length}):`);
        departmentRoles.slice(0, 2).forEach(role => {
          console.log(`        • ${role.role_name}`);
        });
        if (departmentRoles.length > 2) {
          console.log(`        • ... and ${departmentRoles.length - 2} more roles`);
        }
      });
      if (functionDepartments.length > 3) {
        console.log(`    - ... and ${functionDepartments.length - 3} more departments`);
      }
    }

    console.log('\n🎉 Organizational structure import completed successfully!');
    console.log('✅ All hierarchical relationships have been established');

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
  }
}

// Run the import
importOrganizationalStructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

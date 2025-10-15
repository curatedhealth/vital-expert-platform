#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function mapping from CSV to database
const functionMapping = {
  'FUNC-001': 'Research & Development',
  'FUNC-002': 'Clinical Development', 
  'FUNC-003': 'Regulatory Affairs',
  'FUNC-004': 'Manufacturing',
  'FUNC-005': 'Quality',
  'FUNC-006': 'Medical Affairs',
  'FUNC-007': 'Pharmacovigilance',
  'FUNC-008': 'Commercial',
  'FUNC-009': 'Business Development',
  'FUNC-010': 'Legal',
  'FUNC-011': 'Finance',
  'FUNC-012': 'IT/Digital'
};

async function importDepartmentsFromCSV() {
  console.log('🔄 Importing Departments from CSV...');
  console.log('=====================================');

  try {
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📄 Found ${lines.length - 1} departments in CSV`);

    // First, ensure all functions exist
    console.log('\n🏢 Creating/Updating Functions...');
    const functions = [];
    
    for (const [funcId, funcName] of Object.entries(functionMapping)) {
      const { data: existingFunction, error: fetchError } = await supabase
        .from('org_functions')
        .select('id')
        .eq('name', funcName)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`❌ Error checking function ${funcName}:`, fetchError);
        continue;
      }

      if (!existingFunction) {
        const { data: newFunction, error: createError } = await supabase
          .from('org_functions')
          .insert({
            name: funcName,
            department_name: funcName,
            description: `${funcName} business function`,
            healthcare_category: 'pharmaceutical'
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Error creating function ${funcName}:`, createError);
          continue;
        }

        functions.push({ id: newFunction.id, name: funcName, funcId });
        console.log(`✅ Created function: ${funcName}`);
      } else {
        functions.push({ id: existingFunction.id, name: funcName, funcId });
        console.log(`✅ Function exists: ${funcName}`);
      }
    }

    // Create function ID mapping
    const functionIdMap = {};
    functions.forEach(func => {
      functionIdMap[func.funcId] = func.id;
    });

    // Now process departments
    console.log('\n🏬 Creating/Updating Departments...');
    const departments = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      const department = {
        name: values[0]?.replace(/"/g, '') || '',
        description: values[8]?.replace(/"/g, '') || '',
        functionArea: values[10]?.replace(/"/g, '') || '',
        mappedToFunctions: values[11]?.replace(/"/g, '') || '',
        roles: values[14]?.replace(/"/g, '') || '',
        uniqueId: values[15]?.replace(/"/g, '') || '',
        departmentId: values[6]?.replace(/"/g, '') || ''
      };

      if (!department.name || !department.mappedToFunctions) {
        console.log(`⚠️ Skipping department ${department.name} - missing required fields`);
        continue;
      }

      // Find the function ID
      const functionId = functionIdMap[department.mappedToFunctions];
      if (!functionId) {
        console.log(`⚠️ Skipping department ${department.name} - function ${department.mappedToFunctions} not found`);
        continue;
      }

      // Check if department already exists
      const { data: existingDept, error: fetchError } = await supabase
        .from('org_departments')
        .select('id')
        .eq('department_name', department.name)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`❌ Error checking department ${department.name}:`, fetchError);
        continue;
      }

      if (!existingDept) {
        const { data: newDept, error: createError } = await supabase
          .from('org_departments')
          .insert({
            name: department.name,
            department_name: department.name,
            function_id: functionId,
            description: department.description
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Error creating department ${department.name}:`, createError);
          continue;
        }

        departments.push({ 
          id: newDept.id, 
          name: department.name, 
          functionId: functionId,
          roles: department.roles,
          uniqueId: department.uniqueId
        });
        console.log(`✅ Created department: ${department.name}`);
      } else {
        departments.push({ 
          id: existingDept.id, 
          name: department.name, 
          functionId: functionId,
          roles: department.roles,
          uniqueId: department.uniqueId
        });
        console.log(`✅ Department exists: ${department.name}`);
      }
    }

    // Create department ID mapping
    const departmentIdMap = {};
    departments.forEach(dept => {
      departmentIdMap[dept.uniqueId] = dept.id;
    });

    // Now process roles
    console.log('\n👥 Creating/Updating Roles...');
    let totalRoles = 0;

    for (const dept of departments) {
      if (!dept.roles) continue;

      // Parse roles from the roles field
      const roleMatches = dept.roles.match(/[^,]+\([^)]+\)/g) || [];
      
      for (const roleText of roleMatches) {
        const roleName = roleText.split('(')[0].trim();
        const roleUrl = roleText.match(/\(([^)]+)\)/)?.[1] || '';
        
        if (!roleName) continue;

        // Check if role already exists
        const { data: existingRole, error: fetchError } = await supabase
          .from('org_roles')
          .select('id')
          .eq('role_name', roleName)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error(`❌ Error checking role ${roleName}:`, fetchError);
          continue;
        }

        if (!existingRole) {
          const { data: newRole, error: createError } = await supabase
            .from('org_roles')
            .insert({
              name: roleName,
              role_name: roleName,
              department_id: dept.id,
              function_id: dept.functionId,
              description: `Role in ${dept.name}`,
              competency_level: 'intermediate',
              required_skills: []
            })
            .select()
            .single();

          if (createError) {
            console.error(`❌ Error creating role ${roleName}:`, createError);
            continue;
          }

          totalRoles++;
          console.log(`✅ Created role: ${roleName} in ${dept.name}`);
        } else {
          totalRoles++;
          console.log(`✅ Role exists: ${roleName} in ${dept.name}`);
        }
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log('==================');
    console.log(`✅ Functions: ${functions.length}`);
    console.log(`✅ Departments: ${departments.length}`);
    console.log(`✅ Roles: ${totalRoles}`);

    // Verify the structure
    console.log('\n🔍 Verifying Structure...');
    
    const { data: finalFunctions } = await supabase
      .from('org_functions')
      .select('id, name, (org_departments(id, department_name, (org_roles(id, role_name))))')
      .order('name');

    console.log('\n📋 Final Structure:');
    finalFunctions?.forEach(func => {
      console.log(`\n🏢 ${func.name}:`);
      func.org_departments?.forEach(dept => {
        console.log(`  📁 ${dept.department_name} (${dept.org_roles?.length || 0} roles)`);
        dept.org_roles?.forEach(role => {
          console.log(`    👤 ${role.role_name}`);
        });
      });
    });

    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importDepartmentsFromCSV();

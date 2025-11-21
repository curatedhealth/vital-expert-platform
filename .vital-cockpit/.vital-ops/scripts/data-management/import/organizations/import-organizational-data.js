#!/usr/bin/env node

/**
 * Import Organizational Data from CSV files
 * Imports Functions, Departments, Roles, and Responsibilities
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
);

// Helper function to parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^﻿/, '')); // Remove BOM

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || null;
    });
    return obj;
  });
}

// Helper function to parse array fields
function parseArrayField(value) {
  if (!value) return [];
  return value.split(',').map(v => v.trim()).filter(v => v);
}

// Helper function to extract ID from Notion link
function extractNotionId(text) {
  if (!text) return null;
  const match = text.match(/([A-Z]+-\d+)/);
  return match ? match[1] : null;
}

async function importFunctions() {
  console.log('\n📊 Importing Functions...');

  const functionsData = parseCSV(path.join(__dirname, '../docs/Functions 2753dedf985680178336f15f9342a9a7_all.csv'));

  const functions = functionsData.map(row => ({
    unique_id: row['Unique_ID'],
    department_name: row['Department_Name'],
    description: row['Description'],
    migration_ready: row['Migration_Ready'] === 'Yes',
    created_by: row['Updated_By'] || 'System',
    updated_by: row['Updated_By'] || 'System'
  }));

  const { data, error} = await supabase
    .from('org_functions')
    .upsert(functions, { onConflict: 'unique_id' })
    .select();

  if (error) {
    console.error('❌ Error importing functions:', error);
    return null;
  }

  console.log(`✅ Imported ${data.length} functions`);
  return data;
}

async function importDepartments(functionsMap) {
  console.log('\n🏢 Importing Departments...');

  const departmentsData = parseCSV(path.join(__dirname, '../docs/Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv'));

  const departments = departmentsData.map(row => {
    const functionId = functionsMap[row['Mapped_to_Functions']];

    return {
      unique_id: row['Unique_ID'] || row['Department_ID'],
      department_id: row['Department_ID'],
      department_name: row['Department_Name'],
      department_type: row['Department_Type'],
      description: row['Description'],
      function_area: row['Function_Area'],
      compliance_requirements: parseArrayField(row['Compliance_Requirements']),
      critical_systems: parseArrayField(row['Critical_Systems']),
      data_classification: row['Data_Classification'],
      migration_ready: row['Migration_Ready'] === 'Yes',
      export_format: row['Export_Format'],
      function_id: functionId,
      created_by: row['Created_By'] || 'System',
      updated_by: row['Updated_By'] || 'System'
    };
  });

  const { data, error } = await supabase
    .from('org_departments')
    .upsert(departments, { onConflict: 'department_id' })
    .select();

  if (error) {
    console.error('❌ Error importing departments:', error);
    return null;
  }

  console.log(`✅ Imported ${data.length} departments`);
  return data;
}

async function importRoles(departmentsMap, functionsMap) {
  console.log('\n👥 Importing Roles...');

  const rolesData = parseCSV(path.join(__dirname, '../docs/Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv'));

  const roles = rolesData.map(row => {
    // Try to find department and function
    const departmentId = departmentsMap[row['Department_Name']];
    const functionId = functionsMap[row['Function']];

    // Determine seniority level from role title
    let seniority = 'Mid';
    const title = row['Role_Name'] || '';
    if (title.includes('Chief') || title.includes('VP') || title.includes('President')) {
      seniority = 'Executive';
    } else if (title.includes('Director') || title.includes('Head')) {
      seniority = 'Senior';
    } else if (title.includes('Manager') || title.includes('Lead')) {
      seniority = 'Senior';
    } else if (title.includes('Senior')) {
      seniority = 'Senior';
    } else if (title.includes('Junior') || title.includes('Associate')) {
      seniority = 'Junior';
    }

    return {
      unique_id: row['Unique_ID'],
      role_name: row['Role_Name'],
      role_title: row['Role_Name'],
      description: row['Description'],
      seniority_level: seniority,
      function_area: row['Function'],
      department_name: row['Department_Name'],
      required_skills: parseArrayField(row['Key_Skills']),
      required_certifications: parseArrayField(row['Certifications']),
      years_experience_min: parseInt(row['Min_Experience']) || null,
      years_experience_max: parseInt(row['Max_Experience']) || null,
      migration_ready: row['Migration_Ready'] === 'Yes',
      is_active: true,
      function_id: functionId,
      department_id: departmentId,
      created_by: row['Created_By'] || 'System',
      updated_by: row['Updated_By'] || 'System'
    };
  });

  const { data, error } = await supabase
    .from('org_roles')
    .upsert(roles, { onConflict: 'unique_id' })
    .select();

  if (error) {
    console.error('❌ Error importing roles:', error);
    return null;
  }

  console.log(`✅ Imported ${data.length} roles`);
  return data;
}

async function importResponsibilities() {
  console.log('\n📋 Importing Responsibilities...');

  const responsibilitiesData = parseCSV(path.join(__dirname, '../docs/Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv'));

  const responsibilities = responsibilitiesData.map(row => ({
    unique_id: row['Unique_ID'],
    name: row['Name'],
    description: row['Description'],
    mapped_to_use_cases: parseArrayField(row['Mapped_to_VITAL_Path_Use_Cases']),
    is_active: true
  }));

  const { data, error } = await supabase
    .from('org_responsibilities')
    .upsert(responsibilities, { onConflict: 'unique_id' })
    .select();

  if (error) {
    console.error('❌ Error importing responsibilities:', error);
    return null;
  }

  console.log(`✅ Imported ${data.length} responsibilities`);
  return data;
}

async function createRelationships(rolesData, responsibilitiesData, departmentsData, functionsData) {
  console.log('\n🔗 Creating Relationships...');

  // Parse CSV files again to get relationship data
  const rolesCSV = parseCSV(path.join(__dirname, '../docs/Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv'));
  const responsibilitiesCSV = parseCSV(path.join(__dirname, '../docs/Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv'));
  const departmentsCSV = parseCSV(path.join(__dirname, '../docs/Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv'));

  // Create maps for quick lookup
  const rolesMap = {};
  rolesData.forEach(role => {
    rolesMap[role.unique_id] = role.id;
  });

  const responsibilitiesMap = {};
  responsibilitiesData.forEach(resp => {
    responsibilitiesMap[resp.unique_id] = resp.id;
  });

  const departmentsMapByName = {};
  departmentsData.forEach(dept => {
    departmentsMapByName[dept.department_name] = dept.id;
  });

  // Create role-responsibility relationships
  const roleResponsibilities = [];
  responsibilitiesCSV.forEach(row => {
    const rolesList = row['Roles'];
    if (!rolesList) return;

    // Extract role IDs from Notion links
    const roleMatches = rolesList.match(/ROLE-\d+/g);
    if (!roleMatches) return;

    roleMatches.forEach(roleId => {
      const mappedRoleId = rolesMap[roleId];
      const responsibilityId = responsibilitiesMap[row['Unique_ID']];

      if (mappedRoleId && responsibilityId) {
        roleResponsibilities.push({
          role_id: mappedRoleId,
          responsibility_id: responsibilityId,
          is_primary: true,
          weight: 1.0
        });
      }
    });
  });

  if (roleResponsibilities.length > 0) {
    const { data: rrData, error: rrError } = await supabase
      .from('org_role_responsibilities')
      .upsert(roleResponsibilities, { onConflict: 'role_id,responsibility_id', ignoreDuplicates: true });

    if (rrError) {
      console.error('❌ Error creating role-responsibility relationships:', rrError);
    } else {
      console.log(`✅ Created ${roleResponsibilities.length} role-responsibility relationships`);
    }
  }

  // Create department-role relationships
  const departmentRoles = [];
  rolesCSV.forEach(row => {
    const deptName = row['Department_Name'];
    const roleId = rolesMap[row['Unique_ID']];
    const deptId = departmentsMapByName[deptName];

    if (deptId && roleId) {
      departmentRoles.push({
        department_id: deptId,
        role_id: roleId,
        headcount: 1
      });
    }
  });

  if (departmentRoles.length > 0) {
    const { data: drData, error: drError } = await supabase
      .from('org_department_roles')
      .upsert(departmentRoles, { onConflict: 'department_id,role_id', ignoreDuplicates: true });

    if (drError) {
      console.error('❌ Error creating department-role relationships:', drError);
    } else {
      console.log(`✅ Created ${departmentRoles.length} department-role relationships`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Organizational Data Import...\n');

  try {
    // Import in order due to foreign key dependencies
    const functionsData = await importFunctions();
    if (!functionsData) {
      console.error('Failed to import functions. Aborting.');
      process.exit(1);
    }

    // Create function lookup map
    const functionsMap = {};
    functionsData.forEach(func => {
      functionsMap[func.department_name] = func.id;
      functionsMap[func.unique_id] = func.id;
    });

    const departmentsData = await importDepartments(functionsMap);
    if (!departmentsData) {
      console.error('Failed to import departments. Aborting.');
      process.exit(1);
    }

    // Create department lookup map
    const departmentsMap = {};
    departmentsData.forEach(dept => {
      departmentsMap[dept.department_name] = dept.id;
      if (dept.unique_id) departmentsMap[dept.unique_id] = dept.id;
      if (dept.department_id) departmentsMap[dept.department_id] = dept.id;
    });

    const rolesData = await importRoles(departmentsMap, functionsMap);
    if (!rolesData) {
      console.error('Failed to import roles. Aborting.');
      process.exit(1);
    }

    const responsibilitiesData = await importResponsibilities();
    if (!responsibilitiesData) {
      console.error('Failed to import responsibilities. Aborting.');
      process.exit(1);
    }

    await createRelationships(rolesData, responsibilitiesData, departmentsData, functionsData);

    console.log('\n✨ Organizational Data Import Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Functions: ${functionsData.length}`);
    console.log(`   - Departments: ${departmentsData.length}`);
    console.log(`   - Roles: ${rolesData.length}`);
    console.log(`   - Responsibilities: ${responsibilitiesData.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

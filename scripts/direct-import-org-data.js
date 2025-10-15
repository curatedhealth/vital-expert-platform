#!/usr/bin/env node

/**
 * Direct Import Organizational Data using SQL INSERT
 * Bypasses PostgREST API cache issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

// Helper to escape SQL strings
function escapeSQLString(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

// Helper to format arrays for PostgreSQL
function formatArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  const escaped = arr.map(item => escapeSQLString(item.trim()));
  return `ARRAY[${escaped.join(', ')}]`;
}

async function importFunctions() {
  console.log('\n📊 Importing Functions...');

  const functionsData = parseCSV(path.join(__dirname, '../docs/Functions 2753dedf985680178336f15f9342a9a7_all.csv'));

  let sql = `INSERT INTO org_functions (unique_id, department_name, description, migration_ready, created_by, updated_by) VALUES\n`;

  const values = functionsData.map(row => {
    return `(
      ${escapeSQLString(row['Unique_ID'])},
      ${escapeSQLString(row['Department_Name'])},
      ${escapeSQLString(row['Description'])},
      ${row['Migration_Ready'] === 'Yes'},
      ${escapeSQLString(row['Updated_By'] || 'System')},
      ${escapeSQLString(row['Updated_By'] || 'System')}
    )`;
  });

  sql += values.join(',\n');
  sql += ' ON CONFLICT (unique_id) DO UPDATE SET department_name = EXCLUDED.department_name, description = EXCLUDED.description, updated_at = NOW();';

  try {
    console.log('Inserting functions one by one...');
    let successCount = 0;

    for (const row of functionsData) {
      const { error: insertError } = await supabase.from('org_functions').upsert({
        unique_id: row['Unique_ID'],
        department_name: row['Department_Name'],
        description: row['Description'],
        migration_ready: row['Migration_Ready'] === 'Yes',
        created_by: row['Updated_By'] || 'System',
        updated_by: row['Updated_By'] || 'System'
      }, { onConflict: 'unique_id' });

      if (insertError) {
        console.error('Error inserting function:', insertError);
      } else {
        successCount++;
      }
    }

    console.log(`✅ Imported ${successCount}/${functionsData.length} functions`);
    return functionsData;
  } catch (err) {
    console.error('❌ Error importing functions:', err);
    return null;
  }
}

async function importDepartments(functionsData) {
  console.log('\n🏢 Importing Departments...');

  const departmentsData = parseCSV(path.join(__dirname, '../docs/Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv'));

  // Get function IDs
  const { data: functionsFromDB } = await supabase.from('org_functions').select('id, department_name');
  const functionsMap = {};
  if (functionsFromDB) {
    functionsFromDB.forEach(f => {
      functionsMap[f.department_name] = f.id;
    });
  }

  let successCount = 0;
  for (const row of departmentsData) {
    const functionId = functionsMap[row['Function']];
    const compReq = row['Compliance_Requirements'] ? row['Compliance_Requirements'].split(',').map(s => s.trim()) : [];
    const critSys = row['Critical_Systems'] ? row['Critical_Systems'].split(',').map(s => s.trim()) : [];

    const uniqueId = row['Unique_ID'] || row['Department_ID'];
    if (!uniqueId) {
      console.error(`Skipping department ${row['Department_Name']}: no unique_id`);
      continue;
    }

    const { error } = await supabase.from('org_departments').upsert({
      unique_id: uniqueId,
      department_id: row['Department_ID'],
      department_name: row['Department_Name'],
      department_type: row['Department_Type'],
      description: row['Description'],
      function_area: row['Function_Area'],
      compliance_requirements: compReq,
      critical_systems: critSys,
      data_classification: row['Data_Classification'],
      migration_ready: row['Migration_Ready'] === 'Yes',
      export_format: row['Export_Format'],
      function_id: functionId,
      created_by: row['Created_By'] || 'System',
      updated_by: row['Updated_By'] || 'System'
    }, { onConflict: 'unique_id' });

    if (error) {
      console.error(`Error importing department ${row['Department_Name']}:`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`✅ Imported ${successCount}/${departmentsData.length} departments`);
  return departmentsData;
}

async function importRoles(departmentsData) {
  console.log('\n👥 Importing Roles...');

  const rolesData = parseCSV(path.join(__dirname, '../docs/Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv'));

  // Get department IDs
  const { data: departmentsFromDB } = await supabase.from('org_departments').select('id, department_name');
  const departmentsMap = {};
  if (departmentsFromDB) {
    departmentsFromDB.forEach(d => {
      departmentsMap[d.department_name] = d.id;
    });
  }

  let successCount = 0;
  for (const row of rolesData) {
    // Use 'Name' field from CSV, not 'Role_Name'
    const roleName = row['Name'];
    if (!roleName || !row['Unique_ID']) {
      console.error(`Skipping role: missing name or unique_id`);
      continue;
    }

    const departmentId = departmentsMap[row['Department_Name']];

    // Determine seniority
    let seniority = 'Mid';
    const title = roleName || '';
    if (title.includes('Chief') || title.includes('VP') || title.includes('President')) {
      seniority = 'Executive';
    } else if (title.includes('Director') || title.includes('Head')) {
      seniority = 'Senior';
    } else if (title.includes('Manager') || title.includes('Lead') || title.includes('Senior')) {
      seniority = 'Senior';
    } else if (title.includes('Junior') || title.includes('Associate')) {
      seniority = 'Junior';
    }

    const { error } = await supabase.from('org_roles').upsert({
      unique_id: row['Unique_ID'],
      role_name: roleName,
      role_title: roleName,
      description: row['Description'],
      seniority_level: seniority,
      function_area: row['Mapped_to_Functions'],
      department_name: row['Mapped_to_Departments'],
      migration_ready: true,
      is_active: true,
      department_id: departmentId,
      created_by: 'System',
      updated_by: 'System'
    }, { onConflict: 'unique_id' });

    if (error) {
      console.error(`Error importing role ${roleName}:`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`✅ Imported ${successCount}/${rolesData.length} roles`);
  return rolesData;
}

async function importResponsibilities() {
  console.log('\n📋 Importing Responsibilities...');

  const responsibilitiesData = parseCSV(path.join(__dirname, '../docs/Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv'));

  let successCount = 0;
  for (const row of responsibilitiesData) {
    const useCases = row['Mapped_to_VITAL_Path_Use_Cases'] ?
      row['Mapped_to_VITAL_Path_Use_Cases'].split(',').map(s => s.trim()) : [];

    const { error } = await supabase.from('org_responsibilities').upsert({
      unique_id: row['Unique_ID'],
      name: row['Name'],
      description: row['Description'],
      mapped_to_use_cases: useCases,
      is_active: true
    }, { onConflict: 'unique_id' });

    if (error) {
      console.error(`Error importing responsibility ${row['Name']}:`, error.message);
    } else {
      successCount++;
    }
  }

  console.log(`✅ Imported ${successCount}/${responsibilitiesData.length} responsibilities`);
  return responsibilitiesData;
}

async function main() {
  console.log('🚀 Starting Direct Organizational Data Import...\n');

  try {
    const functionsData = await importFunctions();
    if (!functionsData) {
      console.error('Failed to import functions');
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

    const departmentsData = await importDepartments(functionsData);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const rolesData = await importRoles(departmentsData);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responsibilitiesData = await importResponsibilities();

    console.log('\n✨ Organizational Data Import Complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

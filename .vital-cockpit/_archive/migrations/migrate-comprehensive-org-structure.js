const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to upload data in batches
async function uploadTableData(tableName, data, batchSize = 50) {
  console.log(`📋 Uploading ${data.length} records to ${tableName}...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'unique_id' });
      
      if (error) {
        console.error(`❌ Error uploading batch ${Math.floor(i/batchSize) + 1} to ${tableName}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} uploaded to ${tableName}`);
      }
    } catch (err) {
      console.error(`❌ Exception uploading batch to ${tableName}:`, err.message);
      errorCount += batch.length;
    }
  }
  
  console.log(`📊 ${tableName} upload complete: ${successCount} success, ${errorCount} errors`);
  return { successCount, errorCount };
}

// Helper function to clear table
async function clearTable(tableName) {
  console.log(`🗑️  Clearing ${tableName}...`);
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
  
  if (error) {
    console.error(`❌ Error clearing ${tableName}:`, error.message);
    throw error;
  }
  console.log(`✅ ${tableName} cleared`);
}

// Parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
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
      obj[header.trim()] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
    });
    
    return obj;
  });
}

// Process Functions data
function processFunctions(csvData) {
  return csvData.map(row => ({
    unique_id: row.Unique_ID,
    department_name: row.Department_Name, // Note: functions table uses department_name column
    description: row.Description,
    migration_ready: row.Migration_Ready === 'Yes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

// Process Departments data
function processDepartments(csvData) {
  return csvData.map(row => ({
    unique_id: row.Unique_ID,
    department_id: row.Department_ID || '',
    department_name: row.Department_Name,
    description: row.Description,
    department_type: row.Department_Type || '',
    function_area: row.Function_Area || '',
    migration_ready: row.Migration_Ready === 'Yes',
    compliance_requirements: row.Compliance_Requirements ? row.Compliance_Requirements.split(',').map(s => s.trim()) : [],
    critical_systems: row.Critical_Systems ? row.Critical_Systems.split(',').map(s => s.trim()) : [],
    data_classification: row.Data_Classification || 'Internal',
    export_format: row.Export_Format || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

// Process Roles data
function processRoles(csvData) {
  return csvData.map(row => ({
    unique_id: row.Unique_ID,
    role_name: row.Name,
    description: row.Description,
    function_area: row.Mapped_to_Functions || '',
    department_name: row.Mapped_to_Departments || '',
    migration_ready: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

// Process Responsibilities data
function processResponsibilities(csvData) {
  return csvData.map(row => ({
    unique_id: row.Unique_ID,
    name: row.Name, // Note: responsibilities table uses 'name' column, not 'responsibility_name'
    description: row.Description,
    mapped_to_use_cases: row.Mapped_to_VITAL_Path_Use_Cases ? [row.Mapped_to_VITAL_Path_Use_Cases] : [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

async function migrateComprehensiveOrgStructure() {
  try {
    console.log('🚀 Starting comprehensive organizational structure migration...');
    
    // Read CSV files
    console.log('📋 Step 1: Reading CSV files...');
    
    const functionsCSV = fs.readFileSync('Functions 2753dedf985680178336f15f9342a9a7_all.csv', 'utf8');
    const departmentsCSV = fs.readFileSync('Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv', 'utf8');
    const rolesCSV = fs.readFileSync('Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv', 'utf8');
    const responsibilitiesCSV = fs.readFileSync('Responsibilities 2753dedf985680ae9c33d5dea3d5a0cf_all.csv', 'utf8');
    
    console.log('✅ CSV files read successfully');
    
    // Parse CSV data
    console.log('📋 Step 2: Parsing CSV data...');
    
    const functionsData = parseCSV(functionsCSV);
    const departmentsData = parseCSV(departmentsCSV);
    const rolesData = parseCSV(rolesCSV);
    const responsibilitiesData = parseCSV(responsibilitiesCSV);
    
    console.log(`✅ Parsed data: ${functionsData.length} functions, ${departmentsData.length} departments, ${rolesData.length} roles, ${responsibilitiesData.length} responsibilities`);
    
    // Process data
    console.log('📋 Step 3: Processing data...');
    
    const processedFunctions = processFunctions(functionsData);
    const processedDepartments = processDepartments(departmentsData);
    const processedRoles = processRoles(rolesData);
    const processedResponsibilities = processResponsibilities(responsibilitiesData);
    
    console.log('✅ Data processing complete');
    
    // Clear existing data
    console.log('📋 Step 4: Clearing existing organizational structure data...');
    
    await clearTable('org_responsibilities');
    await clearTable('org_roles');
    await clearTable('org_departments');
    await clearTable('org_functions');
    
    console.log('✅ Existing data cleared');
    
    // Upload new data
    console.log('📋 Step 5: Uploading comprehensive organizational structure...');
    
    const functionsResult = await uploadTableData('org_functions', processedFunctions, 25);
    const departmentsResult = await uploadTableData('org_departments', processedDepartments, 25);
    const rolesResult = await uploadTableData('org_roles', processedRoles, 25);
    const responsibilitiesResult = await uploadTableData('org_responsibilities', processedResponsibilities, 25);
    
    console.log('✅ Data upload complete');
    
    // Final verification
    console.log('📋 Step 6: Verifying upload...');
    
    const { data: finalFunctions } = await supabase.from('org_functions').select('count', { count: 'exact' });
    const { data: finalDepartments } = await supabase.from('org_departments').select('count', { count: 'exact' });
    const { data: finalRoles } = await supabase.from('org_roles').select('count', { count: 'exact' });
    const { data: finalResponsibilities } = await supabase.from('org_responsibilities').select('count', { count: 'exact' });
    
    console.log('\n🎉 COMPREHENSIVE ORGANIZATIONAL STRUCTURE MIGRATION COMPLETE!');
    console.log('======================================================================');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Functions: ${finalFunctions?.length || 0} records`);
    console.log(`   ✅ Departments: ${finalDepartments?.length || 0} records`);
    console.log(`   ✅ Roles: ${finalRoles?.length || 0} records`);
    console.log(`   ✅ Responsibilities: ${finalResponsibilities?.length || 0} records`);
    console.log('\n🚀 Your comprehensive organizational structure is now in Supabase Cloud!');
    
    // Summary statistics
    const totalSuccess = functionsResult.successCount + departmentsResult.successCount + 
                        rolesResult.successCount + responsibilitiesResult.successCount;
    const totalErrors = functionsResult.errorCount + departmentsResult.errorCount + 
                       rolesResult.errorCount + responsibilitiesResult.errorCount;
    
    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Total successful uploads: ${totalSuccess}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📊 Success rate: ${((totalSuccess / (totalSuccess + totalErrors)) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateComprehensiveOrgStructure();

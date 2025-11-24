/**
 * Import Organizational Roles from CSV
 * Imports all 100+ human job roles from the Roles CSV into organizational_roles table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function importOrganizationalRoles() {
  console.log('📋 Importing organizational roles from CSV...\n');

  const csvPath = path.join(__dirname, '..', 'Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log('📊 CSV Headers:', header.join(', '));

  const nameIndex = header.indexOf('Name');
  const descriptionIndex = header.indexOf('Description');
  const deptMappingIndex = header.indexOf('Mapped_to_Departments');
  const funcMappingIndex = header.indexOf('Mapped_to_Functions');
  const respIndex = header.indexOf('Responsibilities');
  const uniqueIdIndex = header.indexOf('Unique_ID');

  // Get departments and functions mapping
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name');

  const { data: functions } = await supabase
    .from('business_functions')
    .select('id, code, name');

  const deptMap = new Map(departments?.map(d => [d.name, d.id]) || []);
  const funcCodeMap = new Map(functions?.map(f => [f.code, f.id]) || []);

  const roles = [];
  let imported = 0;
  let errors = 0;

  // Parse roles (skip header)
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    const name = fields[nameIndex]?.replace(/^["']|["']$/g, '');
    const description = fields[descriptionIndex]?.replace(/^["']|["']$/g, '');
    const deptMapping = fields[deptMappingIndex]?.replace(/^["']|["']$/g, '');
    const funcMapping = fields[funcMappingIndex]?.replace(/^["']|["']$/g, '');
    const responsibilities = fields[respIndex]?.replace(/^["']|["']$/g, '');
    const uniqueId = fields[uniqueIdIndex]?.replace(/^["']|["']$/g, '');

    if (!name || name === 'Name') continue;

    // Extract department ID
    let departmentId = null;
    if (deptMapping) {
      const deptCode = deptMapping.split(',')[0]?.trim();
      // Try to find department by matching name from the responsibilities/description
      for (const [deptName, deptId] of deptMap.entries()) {
        if (description?.toLowerCase().includes(deptName.toLowerCase()) ||
            name.toLowerCase().includes(deptName.toLowerCase())) {
          departmentId = deptId;
          break;
        }
      }
    }

    // Extract business function ID
    let businessFunctionId = null;
    if (funcMapping) {
      const funcCode = funcMapping.split(',')[0]?.trim();
      if (funcCodeMap.has(funcCode)) {
        businessFunctionId = funcCodeMap.get(funcCode);
      }
    }

    // Determine level from name
    let level = 'Senior';
    if (name.includes('Chief') || name.includes('VP') || name.includes('Head of')) {
      level = 'Executive';
    } else if (name.includes('Director')) {
      level = 'Director';
    } else if (name.includes('Manager')) {
      level = 'Manager';
    } else if (name.includes('Lead')) {
      level = 'Lead';
    } else if (name.includes('Senior')) {
      level = 'Senior';
    } else if (name.includes('Principal')) {
      level = 'Principal';
    } else if (name.includes('Specialist') || name.includes('Scientist')) {
      level = 'Specialist';
    }

    // Parse responsibilities
    let responsibilitiesArray = [];
    if (responsibilities) {
      const respMatches = responsibilities.match(/([^(]+)\s*\(https:\/\/[^)]+\)/g);
      if (respMatches) {
        responsibilitiesArray = respMatches.map(r => r.split('(')[0].trim());
      }
    }

    const role = {
      name,
      description: description || `${name} role in pharmaceutical organization`,
      department_id: departmentId,
      business_function_id: businessFunctionId,
      level,
      responsibilities: responsibilitiesArray.length > 0 ? responsibilitiesArray : null,
      sort_order: i
    };

    roles.push(role);
  }

  console.log(`\n📊 Parsed ${roles.length} roles from CSV\n`);

  // Remove duplicates by name (keep first occurrence)
  const uniqueRoles = [];
  const seenNames = new Set();

  for (const role of roles) {
    if (!seenNames.has(role.name)) {
      seenNames.add(role.name);
      uniqueRoles.push(role);
    } else {
      console.log(`⚠️  Skipping duplicate: ${role.name}`);
    }
  }

  console.log(`📊 Importing ${uniqueRoles.length} unique roles (removed ${roles.length - uniqueRoles.length} duplicates)\n`);

  // Bulk insert
  const { data, error } = await supabase
    .from('organizational_roles')
    .upsert(uniqueRoles, { onConflict: 'name' })
    .select();

  if (error) {
    console.error('❌ Error importing roles:', error);
    return;
  }

  console.log(`✅ Successfully imported ${data.length} organizational roles\n`);

  // Show summary by level
  const { data: summary } = await supabase
    .from('organizational_roles')
    .select('level')
    .order('level');

  if (summary) {
    const levelCounts = summary.reduce((acc, r) => {
      acc[r.level] = (acc[r.level] || 0) + 1;
      return acc;
    }, {});

    console.log('📈 Roles by Level:');
    Object.entries(levelCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([level, count]) => {
        console.log(`   ${level}: ${count}`);
      });
  }

  // Show sample roles
  const { data: sampleRoles } = await supabase
    .from('organizational_roles')
    .select('name, level, description')
    .limit(10);

  console.log('\n📋 Sample Organizational Roles:');
  sampleRoles?.forEach(role => {
    console.log(`   - ${role.name} (${role.level})`);
  });

  return data;
}

async function main() {
  console.log('🚀 Starting organizational roles import...\n');

  const roles = await importOrganizationalRoles();

  console.log('\n✅ Import complete!');
}

main().catch(console.error);

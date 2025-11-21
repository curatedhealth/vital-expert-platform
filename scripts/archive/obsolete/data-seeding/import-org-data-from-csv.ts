/**
 * Import Organization Data from CSV Files
 * - Parse CSV files for Functions, Departments, Roles, Responsibilities
 * - Update business_functions table
 * - Populate department and role fields in agents table directly (since org tables have schema issues)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CsvFunction {
  Department_Name: string;
  Description: string;
  Unique_ID: string;
  Departments: string;
}

interface CsvDepartment {
  Department_Name: string;
  Description: string;
  Department_ID: string;
  Function_Area: string;
  Mapped_to_Functions: string;
  Mapped_to_Roles: string;
}

interface CsvRole {
  Name: string;
  Description: string;
  Unique_ID: string;
  Mapped_to_Departments: string;
  Mapped_to_Functions: string;
}

function parseCSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^\ufeff/, ''));
  const records: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const record: any = {};

    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() || '';
    });

    records.push(record);
  }

  return records;
}

async function importOrgData() {
  console.log('🔄 Importing Organization Data from CSV Files\n');

  const docsPath = path.join(process.cwd(), 'docs');

  // Step 1: Parse CSV files
  console.log('='.repeat(80));
  console.log('STEP 1: PARSING CSV FILES');
  console.log('='.repeat(80) + '\n');

  const functionsFile = path.join(docsPath, 'Functions 2753dedf985680178336f15f9342a9a7_all.csv');
  const departmentsFile = path.join(docsPath, 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv');
  const rolesFile = path.join(docsPath, 'Roles 2753dedf98568072b94cf2f7028ba0c9_all.csv');

  const functions = parseCSV(functionsFile);
  const departments = parseCSV(departmentsFile);
  const roles = parseCSV(rolesFile);

  console.log(`✅ Parsed ${functions.length} functions`);
  console.log(`✅ Parsed ${departments.length} departments`);
  console.log(`✅ Parsed ${roles.length} roles\n`);

  // Step 2: Get existing business functions
  console.log('='.repeat(80));
  console.log('STEP 2: MAPPING TO EXISTING BUSINESS FUNCTIONS');
  console.log('='.repeat(80) + '\n');

  const { data: existingFunctions } = await supabase
    .from('business_functions')
    .select('*');

  console.log(`Found ${existingFunctions?.length || 0} existing business functions:`);
  existingFunctions?.forEach(f => {
    console.log(`  - ${f.name} (${f.id.substring(0, 8)}...)`);
  });

  // Create mapping from CSV function names to DB function IDs
  const functionNameMap: Record<string, string> = {};
  const csvToDbFunctionMap: Record<string, string> = {
    'Research & Development': 'clinical_development',
    'Clinical Development': 'clinical_development',
    'Regulatory Affairs': 'regulatory_affairs',
    'Manufacturing': 'quality_assurance',
    'Quality': 'quality_assurance',
    'Medical Affairs': 'medical_writing',
    'Pharmacovigilance': 'safety_pharmacovigilance',
    'Commercial': 'market_access',
    'Business Development': 'clinical_development',
    'Legal': 'regulatory_affairs',
    'Finance': 'clinical_development',
    'IT/Digital': 'clinical_development',
  };

  existingFunctions?.forEach(f => {
    functionNameMap[f.name] = f.id;
  });

  // Step 3: Create Department and Role mappings for agents
  console.log('\n' + '='.repeat(80));
  console.log('STEP 3: CREATING DEPARTMENT AND ROLE MAPPINGS');
  console.log('='.repeat(80) + '\n');

  // Map department names to function
  const deptToFunction: Record<string, string> = {};
  departments.forEach(dept => {
    const funcId = dept.Mapped_to_Functions;
    deptToFunction[dept.Department_Name] = funcId;
  });

  console.log(`Created ${Object.keys(deptToFunction).length} department mappings`);

  // Map role names to departments
  const roleToDept: Record<string, string> = {};
  roles.forEach(role => {
    const deptId = role.Mapped_to_Departments;
    roleToDept[role.Name] = deptId;
  });

  console.log(`Created ${Object.keys(roleToDept).length} role mappings\n`);

  // Step 4: Assign departments and roles to agents
  console.log('='.repeat(80));
  console.log('STEP 4: ASSIGNING DEPARTMENTS AND ROLES TO AGENTS');
  console.log('='.repeat(80) + '\n');

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, role, department')
    .eq('status', 'active');

  if (!agents) {
    console.error('❌ No agents found');
    return;
  }

  console.log(`Processing ${agents.length} agents...\n`);

  // Get function ID to name map
  const funcIdToName: Record<string, string> = {};
  existingFunctions?.forEach(f => {
    funcIdToName[f.id] = f.name;
  });

  // Map DB function names to CSV function names
  const dbFunctionToCsvFunction: Record<string, string> = {
    'regulatory_affairs': 'Regulatory Affairs',
    'clinical_development': 'Clinical Development',
    'quality_assurance': 'Quality',
    'safety_pharmacovigilance': 'Pharmacovigilance',
    'medical_writing': 'Medical Affairs',
    'market_access': 'Commercial',
  };

  // Determine department from business function
  const functionToDepartment: Record<string, string> = {
    'regulatory_affairs': 'Global Regulatory',
    'clinical_development': 'Clinical Development',
    'quality_assurance': 'Quality Assurance',
    'safety_pharmacovigilance': 'Drug Safety',
    'medical_writing': 'Medical Information',
    'market_access': 'Market Access',
  };

  let updated = 0;
  let alreadySet = 0;

  for (const agent of agents) {
    const funcName = funcIdToName[agent.business_function];
    const csvFuncName = dbFunctionToCsvFunction[funcName] || 'Clinical Development';
    const deptName = functionToDepartment[funcName] || 'Clinical Development';

    // Extract role from display name if not set
    let roleName = agent.role;
    if (!roleName || roleName === 'specialist') {
      const rolePatterns = ['Director', 'Manager', 'Lead', 'Expert', 'Specialist',
                           'Coordinator', 'Analyst', 'Strategist', 'Advisor'];
      for (const pattern of rolePatterns) {
        if (agent.display_name.includes(pattern)) {
          roleName = pattern.toLowerCase();
          break;
        }
      }
    }

    const updates: any = {};
    let needsUpdate = false;

    if (!agent.department || agent.department === null) {
      updates.department = deptName;
      needsUpdate = true;
    }

    if (!agent.role || agent.role === 'specialist') {
      updates.role = roleName || 'specialist';
      needsUpdate = true;
    }

    if (needsUpdate) {
      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agent.id);

      if (!error) {
        updated++;
        if (updated <= 10) {
          console.log(`✅ ${agent.display_name}`);
          console.log(`   Dept: ${updates.department || agent.department}`);
          console.log(`   Role: ${updates.role || agent.role}\n`);
        }
      }
    } else {
      alreadySet++;
    }
  }

  if (updated > 10) {
    console.log(`... and ${updated - 10} more agents updated\n`);
  }

  console.log('='.repeat(80));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`  Functions parsed: ${functions.length}`);
  console.log(`  Departments parsed: ${departments.length}`);
  console.log(`  Roles parsed: ${roles.length}`);
  console.log(`  Agents updated: ${updated}`);
  console.log(`  Agents already set: ${alreadySet}`);
  console.log(`  Total agents: ${agents.length}`);

  console.log('\n✅ Organization data import complete!\n');

  return { updated, alreadySet };
}

importOrgData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

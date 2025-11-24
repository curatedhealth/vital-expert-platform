import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateOrgStructure() {
  console.log('\n=== POPULATING ORGANIZATIONAL STRUCTURE ===\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.resolve(__dirname, '../database/sql/migrations/2025/20251001120000_populate_org_structure.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Executing SQL migration...\n');

    // Execute the SQL using the Supabase client's RPC function
    // Note: We'll need to split this into smaller chunks as Supabase has query size limits

    // First, let's try a simpler approach - manually insert the data using the JS client

    // 1. Insert Business Functions
    console.log('1. Inserting Business Functions...');
    const { data: functions, error: funcError } = await supabase
      .from('org_functions')
      .upsert([
        { unique_id: 'regulatory-affairs', department_name: 'Regulatory Affairs', description: 'FDA, EMA, and global regulatory guidance and submissions', migration_ready: true },
        { unique_id: 'clinical-development', department_name: 'Clinical Development', description: 'Clinical trial design, execution, and management', migration_ready: true },
        { unique_id: 'medical-affairs', department_name: 'Medical Affairs', description: 'Medical information, medical writing, publications, and MSL activities', migration_ready: true },
        { unique_id: 'commercial', department_name: 'Commercial', description: 'Market access, HEOR, payer relations, and commercialization strategies', migration_ready: true },
        { unique_id: 'safety', department_name: 'Safety', description: 'Pharmacovigilance, drug safety, signal detection, and risk management', migration_ready: true },
        { unique_id: 'quality', department_name: 'Quality', description: 'QMS, quality control, compliance, and GMP standards', migration_ready: true },
      ], { onConflict: 'unique_id' })
      .select();

    if (funcError) {
      console.error('Error inserting functions:', funcError);
    } else {
      console.log(`✅ Inserted ${functions?.length || 0} business functions`);
    }

    // Get function IDs for reference
    const { data: allFunctions } = await supabase
      .from('org_functions')
      .select('id, unique_id');

    const functionMap = new Map(allFunctions?.map(f => [f.unique_id, f.id]) || []);

    // 2. Insert Departments
    console.log('\n2. Inserting Departments...');
    const departments = [
      // Regulatory Affairs
      { unique_id: 'reg-strategy', department_name: 'Regulatory Strategy', function_area: 'Regulatory Affairs', function_id: functionMap.get('regulatory-affairs'), description: 'Strategic regulatory planning', migration_ready: true },
      { unique_id: 'reg-operations', department_name: 'Regulatory Operations', function_area: 'Regulatory Affairs', function_id: functionMap.get('regulatory-affairs'), description: 'Regulatory submissions and filings', migration_ready: true },
      { unique_id: 'reg-intelligence', department_name: 'Regulatory Intelligence', function_area: 'Regulatory Affairs', function_id: functionMap.get('regulatory-affairs'), description: 'Competitive intelligence', migration_ready: true },
      // Clinical Development
      { unique_id: 'clinical-ops', department_name: 'Clinical Operations', function_area: 'Clinical Development', function_id: functionMap.get('clinical-development'), description: 'Clinical trial execution', migration_ready: true },
      { unique_id: 'clinical-science', department_name: 'Clinical Science', function_area: 'Clinical Development', function_id: functionMap.get('clinical-development'), description: 'Medical monitoring', migration_ready: true },
      { unique_id: 'biostatistics', department_name: 'Biostatistics', function_area: 'Clinical Development', function_id: functionMap.get('clinical-development'), description: 'Statistical analysis', migration_ready: true },
      { unique_id: 'data-mgmt', department_name: 'Data Management', function_area: 'Clinical Development', function_id: functionMap.get('clinical-development'), description: 'Clinical data management', migration_ready: true },
      // Medical Affairs
      { unique_id: 'med-info', department_name: 'Medical Information', function_area: 'Medical Affairs', function_id: functionMap.get('medical-affairs'), description: 'Medical information support', migration_ready: true },
      { unique_id: 'med-writing', department_name: 'Medical Writing', function_area: 'Medical Affairs', function_id: functionMap.get('medical-affairs'), description: 'Medical document preparation', migration_ready: true },
      { unique_id: 'publications', department_name: 'Publications', function_area: 'Medical Affairs', function_id: functionMap.get('medical-affairs'), description: 'Scientific publications', migration_ready: true },
      { unique_id: 'msl', department_name: 'Medical Science Liaison', function_area: 'Medical Affairs', function_id: functionMap.get('medical-affairs'), description: 'Field medical education', migration_ready: true },
      // Commercial
      { unique_id: 'market-access', department_name: 'Market Access', function_area: 'Commercial', function_id: functionMap.get('commercial'), description: 'Market access strategy', migration_ready: true },
      { unique_id: 'heor', department_name: 'HEOR', function_area: 'Commercial', function_id: functionMap.get('commercial'), description: 'Health economics research', migration_ready: true },
      { unique_id: 'payer-relations', department_name: 'Payer Relations', function_area: 'Commercial', function_id: functionMap.get('commercial'), description: 'Payer contracting', migration_ready: true },
      { unique_id: 'value-access', department_name: 'Value & Access', function_area: 'Commercial', function_id: functionMap.get('commercial'), description: 'Value dossiers', migration_ready: true },
      // Safety
      { unique_id: 'pharmacovigilance', department_name: 'Pharmacovigilance', function_area: 'Safety', function_id: functionMap.get('safety'), description: 'Adverse event monitoring', migration_ready: true },
      { unique_id: 'drug-safety', department_name: 'Drug Safety', function_area: 'Safety', function_id: functionMap.get('safety'), description: 'Drug safety assessment', migration_ready: true },
      { unique_id: 'signal-detection', department_name: 'Signal Detection', function_area: 'Safety', function_id: functionMap.get('safety'), description: 'Safety signal identification', migration_ready: true },
      { unique_id: 'risk-mgmt', department_name: 'Risk Management', function_area: 'Safety', function_id: functionMap.get('safety'), description: 'Risk management planning', migration_ready: true },
      // Quality
      { unique_id: 'qms', department_name: 'Quality Management Systems', function_area: 'Quality', function_id: functionMap.get('quality'), description: 'QMS architecture', migration_ready: true },
      { unique_id: 'qc', department_name: 'Quality Control', function_area: 'Quality', function_id: functionMap.get('quality'), description: 'Quality control testing', migration_ready: true },
      { unique_id: 'compliance-audit', department_name: 'Compliance & Auditing', function_area: 'Quality', function_id: functionMap.get('quality'), description: 'Compliance oversight', migration_ready: true },
      { unique_id: 'qa', department_name: 'Quality Assurance', function_area: 'Quality', function_id: functionMap.get('quality'), description: 'Quality assurance', migration_ready: true },
    ];

    const { data: deptData, error: deptError } = await supabase
      .from('org_departments')
      .upsert(departments, { onConflict: 'unique_id' })
      .select();

    if (deptError) {
      console.error('Error inserting departments:', deptError);
    } else {
      console.log(`✅ Inserted ${deptData?.length || 0} departments`);
    }

    // Get department IDs
    const { data: allDepartments } = await supabase
      .from('org_departments')
      .select('id, unique_id, function_id');

    const departmentMap = new Map(allDepartments?.map(d => [d.unique_id, { id: d.id, function_id: d.function_id }]) || []);

    // 3. Insert Roles (sample - you can add more)
    console.log('\n3. Inserting Roles...');

    const roles = [
      // Regulatory Affairs - Strategy
      { unique_id: 'reg-strategy-director', role_name: 'Strategy Director', function_area: 'Regulatory Affairs', department_name: 'Regulatory Strategy', function_id: departmentMap.get('reg-strategy')?.function_id, department_id: departmentMap.get('reg-strategy')?.id, seniority_level: 'Executive', is_active: true },
      { unique_id: 'reg-strategist', role_name: 'Regulatory Strategist', function_area: 'Regulatory Affairs', department_name: 'Regulatory Strategy', function_id: departmentMap.get('reg-strategy')?.function_id, department_id: departmentMap.get('reg-strategy')?.id, seniority_level: 'Senior', is_active: true },
      { unique_id: 'sr-reg-mgr', role_name: 'Senior Regulatory Affairs Manager', function_area: 'Regulatory Affairs', department_name: 'Regulatory Strategy', function_id: departmentMap.get('reg-strategy')?.function_id, department_id: departmentMap.get('reg-strategy')?.id, seniority_level: 'Senior', is_active: true },
      // Add key roles for each department
      { unique_id: 'clinical-ops-mgr', role_name: 'Clinical Operations Manager', function_area: 'Clinical Development', department_name: 'Clinical Operations', function_id: departmentMap.get('clinical-ops')?.function_id, department_id: departmentMap.get('clinical-ops')?.id, seniority_level: 'Senior', is_active: true },
      { unique_id: 'medical-writer', role_name: 'Medical Writer', function_area: 'Medical Affairs', department_name: 'Medical Writing', function_id: departmentMap.get('med-writing')?.function_id, department_id: departmentMap.get('med-writing')?.id, seniority_level: 'Mid', is_active: true },
      { unique_id: 'heor-director', role_name: 'HEOR Director', function_area: 'Commercial', department_name: 'HEOR', function_id: departmentMap.get('heor')?.function_id, department_id: departmentMap.get('heor')?.id, seniority_level: 'Executive', is_active: true },
      { unique_id: 'pv-director', role_name: 'Pharmacovigilance Director', function_area: 'Safety', department_name: 'Pharmacovigilance', function_id: departmentMap.get('pharmacovigilance')?.function_id, department_id: departmentMap.get('pharmacovigilance')?.id, seniority_level: 'Executive', is_active: true },
      { unique_id: 'qms-architect', role_name: 'QMS Architect', function_area: 'Quality', department_name: 'Quality Management Systems', function_id: departmentMap.get('qms')?.function_id, department_id: departmentMap.get('qms')?.id, seniority_level: 'Senior', is_active: true },
    ];

    const { data: roleData, error: roleError } = await supabase
      .from('org_roles')
      .upsert(roles, { onConflict: 'unique_id' })
      .select();

    if (roleError) {
      console.error('Error inserting roles:', roleError);
    } else {
      console.log(`✅ Inserted ${roleData?.length || 0} roles`);
    }

    // Verify final counts
    console.log('\n=== VERIFICATION ===');
    const { count: funcCount } = await supabase.from('org_functions').select('*', { count: 'exact', head: true });
    const { count: deptCount } = await supabase.from('org_departments').select('*', { count: 'exact', head: true });
    const { count: roleCount } = await supabase.from('org_roles').select('*', { count: 'exact', head: true });

    console.log(`\nFinal Counts:`);
    console.log(`  Functions: ${funcCount}`);
    console.log(`  Departments: ${deptCount}`);
    console.log(`  Roles: ${roleCount}`);

    console.log('\n✅ Organization structure population complete!\n');

  } catch (error) {
    console.error('\n❌ Error populating organization structure:', error);
    process.exit(1);
  }
}

populateOrgStructure().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

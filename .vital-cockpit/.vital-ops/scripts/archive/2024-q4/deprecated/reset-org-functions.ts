import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔗 Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Definitive list of 12 business functions (matching org_functions schema)
const BUSINESS_FUNCTIONS = [
  {
    unique_id: 'BF-001',
    department_name: 'Research & Development',
    description: 'Drug discovery, preclinical and translational research activities focused on identifying and developing new therapeutic candidates',
    migration_ready: true
  },
  {
    unique_id: 'BF-002',
    department_name: 'Clinical Development',
    description: 'Planning, execution, and management of clinical trials from Phase I through Phase IV',
    migration_ready: true
  },
  {
    unique_id: 'BF-003',
    department_name: 'Regulatory Affairs',
    description: 'Regulatory strategy, submissions, compliance, and interaction with global health authorities',
    migration_ready: true
  },
  {
    unique_id: 'BF-004',
    department_name: 'Manufacturing',
    description: 'Drug substance and product manufacturing, supply chain management, and distribution',
    migration_ready: true
  },
  {
    unique_id: 'BF-005',
    department_name: 'Quality',
    description: 'Quality assurance, quality control, compliance, and validation across all GxP areas',
    migration_ready: true
  },
  {
    unique_id: 'BF-006',
    department_name: 'Medical Affairs',
    description: 'Scientific engagement, medical information, publications, and KOL management',
    migration_ready: true
  },
  {
    unique_id: 'BF-007',
    department_name: 'Pharmacovigilance',
    description: 'Drug safety monitoring, signal detection, risk management, and adverse event reporting',
    migration_ready: true
  },
  {
    unique_id: 'BF-008',
    department_name: 'Commercial',
    description: 'Marketing, sales, market access, pricing, reimbursement, and health economics',
    migration_ready: true
  },
  {
    unique_id: 'BF-009',
    department_name: 'Business Development',
    description: 'Licensing, partnerships, M&A, portfolio management, and strategic planning',
    migration_ready: true
  },
  {
    unique_id: 'BF-010',
    department_name: 'Legal',
    description: 'Legal affairs, intellectual property, contracts, compliance, and litigation management',
    migration_ready: true
  },
  {
    unique_id: 'BF-011',
    department_name: 'Finance',
    description: 'Financial planning, accounting, treasury, budgeting, and financial reporting',
    migration_ready: true
  },
  {
    unique_id: 'BF-012',
    department_name: 'IT/Digital',
    description: 'Information technology, digital transformation, data analytics, and cybersecurity',
    migration_ready: true
  }
];

async function resetBusinessFunctions() {
  console.log('🔄 Resetting Business Functions to 12 definitive functions...\n');

  try {
    // 1. Delete all existing functions
    console.log('1. Clearing existing business functions...');
    const { error: deleteError } = await supabase
      .from('org_functions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Error deleting existing functions:', deleteError);
      throw deleteError;
    }
    console.log('✅ Cleared existing functions\n');

    // 2. Insert the 12 definitive functions
    console.log('2. Inserting 12 definitive business functions...');
    const { data: insertedFunctions, error: insertError } = await supabase
      .from('org_functions')
      .insert(BUSINESS_FUNCTIONS)
      .select();

    if (insertError) {
      console.error('❌ Error inserting functions:', insertError);
      throw insertError;
    }
    console.log(`✅ Inserted ${insertedFunctions?.length || 0} business functions\n`);

    // 3. Verify the result
    console.log('3. Verification...');
    const { data: functions, error: verifyError } = await supabase
      .from('org_functions')
      .select('*')
      .order('department_name');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      throw verifyError;
    }

    console.log(`\n✅ Total Business Functions: ${functions?.length || 0}\n`);
    console.log('📋 Business Functions in Database:\n');
    functions?.forEach((func, i) => {
      console.log(`${i + 1}. ${func.department_name}`);
      console.log(`   ID: ${func.unique_id}`);
      console.log(`   Description: ${func.description.substring(0, 80)}...`);
      console.log('');
    });

    console.log('✅ Business Functions reset complete!');
    console.log('\n💡 These 12 functions are now the single source of truth for all dropdowns.');

  } catch (error) {
    console.error('❌ Failed to reset business functions:', error);
    process.exit(1);
  }
}

resetBusinessFunctions();

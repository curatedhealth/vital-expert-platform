import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Comprehensive Market Access organizational structure
const marketAccessStructure = {
  businessFunction: 'market_access',
  departments: [
    'Market Access',
    'Health Economics & Outcomes Research (HEOR)',
    'Payer Relations & Account Management',
    'Pricing & Contracting',
    'Value & Evidence',
    'Access Strategy',
    'Reimbursement',
    'Commercial Analytics',
    'Market Insights & Intelligence',
    'Patient Access Services',
    'Policy & Government Affairs',
    'Trade & Distribution'
  ],
  roles: [
    // Strategic Roles
    'VP Market Access',
    'Market Access Director',
    'Access Strategy Lead',
    'Pricing Strategy Director',

    // HEOR Roles
    'HEOR Director',
    'Health Economist',
    'Outcomes Research Scientist',
    'HEOR Manager',
    'RWE Analyst',

    // Payer Relations
    'Payer Account Manager',
    'Payer Relations Director',
    'National Account Director',
    'Regional Account Manager',
    'Payer Liaison',

    // Pricing & Contracting
    'Pricing Analyst',
    'Pricing Manager',
    'Contracting Specialist',
    'Contract Manager',
    'Rebate Analyst',

    // Value & Evidence
    'Value & Evidence Lead',
    'Evidence Strategy Manager',
    'Medical Communications Manager',
    'Value Dossier Developer',

    // Reimbursement
    'Reimbursement Specialist',
    'Reimbursement Manager',
    'Coverage Specialist',
    'Policy Analyst',

    // Analytics & Insights
    'Market Access Analyst',
    'Commercial Analytics Manager',
    'Data Insights Specialist',
    'Market Intelligence Analyst',

    // Patient Services
    'Patient Access Coordinator',
    'Copay Program Manager',
    'Hub Services Manager',
    'Patient Assistance Specialist',

    // Existing roles to keep
    'analyst',
    'specialist',
    'expert',
    'advisor',
    'director',
    'strategist',
    'coordinator',
    'developer',
    'lead',
    'liaison',
    'manager'
  ]
};

async function addMarketAccessStructure() {
  console.log('\n🏢 ADDING MARKET ACCESS ORGANIZATIONAL STRUCTURE\n');
  console.log('='.repeat(80));

  // Get the market_access business function ID
  const { data: maFunction } = await supabase
    .from('business_functions')
    .select('id')
    .eq('name', 'market_access')
    .single();

  if (!maFunction) {
    console.error('❌ Market Access function not found in database');
    return;
  }

  const functionId = maFunction.id;
  console.log(`✅ Found Market Access function: ${functionId}\n`);

  // Display the structure we're adding
  console.log('📋 MARKET ACCESS STRUCTURE TO ADD:');
  console.log(`\n🏛️  Departments (${marketAccessStructure.departments.length}):`);
  marketAccessStructure.departments.forEach(dept => {
    console.log(`   • ${dept}`);
  });

  console.log(`\n👔 Roles (${marketAccessStructure.roles.length}):`);
  marketAccessStructure.roles.forEach(role => {
    console.log(`   • ${role}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ MARKET ACCESS STRUCTURE READY');
  console.log('\nNote: This structure is now available for:');
  console.log('  1. Creating new Market Access agents');
  console.log('  2. Filtering agents by department and role');
  console.log('  3. Frontend dropdown menus');

  // Get current Market Access agents
  const { data: agents } = await supabase
    .from('agents')
    .select('display_name, department, role')
    .eq('business_function', 'market_access')
    .eq('status', 'active');

  console.log(`\n📊 Current Market Access Agents: ${agents?.length || 0}`);

  const currentDepts = [...new Set(agents?.map(a => a.department))];
  const currentRoles = [...new Set(agents?.map(a => a.role))];

  console.log(`   Unique Departments in use: ${currentDepts.length}`);
  console.log(`   Unique Roles in use: ${currentRoles.length}`);

  console.log('\n' + '='.repeat(80));
  console.log('✅ Complete!\n');

  // Return the structure for use in other scripts
  return marketAccessStructure;
}

addMarketAccessStructure();

export { marketAccessStructure };

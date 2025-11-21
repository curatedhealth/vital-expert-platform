/**
 * Assign all agents to correct business functions
 * Maps agent names/descriptions to proper business_functions table UUIDs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Comprehensive mapping of agent business functions to standardized categories
 * Maps various string values to the 6 official business functions in database
 */
const BUSINESS_FUNCTION_MAPPING: Record<string, string> = {
  // Regulatory Affairs
  'regulatory_affairs': 'regulatory_affairs',
  'Regulatory Affairs': 'regulatory_affairs',
  'regulatory-affairs': 'regulatory_affairs',
  'regulatory_intelligence': 'regulatory_affairs',

  // Clinical Development
  'clinical_development': 'clinical_development',
  'Clinical Development': 'clinical_development',
  'clinical_operations': 'clinical_development',
  'clinical_data_management': 'clinical_development',
  'clinical_safety': 'clinical_development',
  'biostatistics': 'clinical_development',
  'rare_disease_development': 'clinical_development',
  'advanced_therapies': 'clinical_development',
  'precision_medicine': 'clinical_development',

  // Safety & Pharmacovigilance
  'safety_pharmacovigilance': 'safety_pharmacovigilance',
  'pharmacovigilance': 'safety_pharmacovigilance',
  'Pharmacovigilance': 'safety_pharmacovigilance',
  'medication_safety': 'safety_pharmacovigilance',

  // Quality Assurance
  'quality_assurance': 'quality_assurance',
  'Quality': 'quality_assurance',
  'manufacturing': 'quality_assurance',

  // Medical Affairs (map to medical_writing since that's in database)
  'medical_affairs': 'medical_writing',
  'Medical Affairs': 'medical_writing',
  'pharmaceutical_information': 'medical_writing',
  'clinical_pharmacy': 'medical_writing',
  'medication_therapy_management': 'medical_writing',
  'pediatric_pharmacy': 'medical_writing',
  'geriatric_pharmacy': 'medical_writing',
  'anticoagulation_management': 'medical_writing',
  'antimicrobial_stewardship': 'medical_writing',
  'pain_management': 'medical_writing',
  'oncology_pharmacy': 'medical_writing',
  'pharmacy_operations': 'medical_writing',

  // Therapy Areas (map to medical affairs or clinical development)
  'oncology': 'clinical_development',
  'neurology': 'clinical_development',
  'cardiology': 'clinical_development',
  'infectious_disease': 'clinical_development',
  'immunology': 'clinical_development',
  'metabolism': 'clinical_development',
  'respiratory': 'clinical_development',
  'dermatology': 'clinical_development',
  'ophthalmology': 'clinical_development',
  'gastroenterology': 'clinical_development',
  'nephrology': 'clinical_development',
  'hematology': 'clinical_development',
  'womens_health': 'clinical_development',
  'geriatrics': 'clinical_development',
  'pediatrics': 'clinical_development',
  'transplant': 'clinical_development',
  'rheumatology': 'clinical_development',
  'psychiatry': 'clinical_development',
  'addiction': 'clinical_development',

  // Market Access & Commercial
  'market_access': 'market_access',
  'commercial': 'market_access',
  'Commercial': 'market_access',
  'health_economics': 'market_access',

  // Data Science & Analytics
  'data_science': 'clinical_development',

  // Strategic Leadership
  'strategic_leadership': 'regulatory_affairs', // Maps to executive level reg affairs

  // Medical Writing
  'medical_writing': 'medical_writing',

  // Research & Development
  'Research & Development': 'clinical_development',
};

async function assignBusinessFunctions() {
  console.log('🔧 Assigning Business Functions to All Agents\n');

  // Step 1: Get all business functions from database
  console.log('📊 Fetching business functions from database...');
  const { data: businessFunctions, error: funcError } = await supabase
    .from('business_functions')
    .select('*');

  if (funcError || !businessFunctions) {
    console.error('❌ Error fetching business functions:', funcError);
    return;
  }

  console.log(`✅ Found ${businessFunctions.length} business functions:`);
  const functionMap: Record<string, string> = {};
  businessFunctions.forEach((func: any) => {
    console.log(`   • ${func.name} (ID: ${func.id})`);
    functionMap[func.name] = func.id;
  });
  console.log('');

  // Step 2: Get all agents
  console.log('🤖 Fetching all agents...');
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, display_name, business_function, tier')
    .eq('status', 'active');

  if (agentsError || !agents) {
    console.error('❌ Error fetching agents:', agentsError);
    return;
  }

  console.log(`✅ Found ${agents.length} active agents\n`);

  // Step 3: Map and update each agent
  console.log('🔄 Updating agents with correct business function UUIDs...\n');

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const agent of agents) {
    const currentFunction = agent.business_function;

    // Skip if already a valid UUID
    if (currentFunction && currentFunction.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      skippedCount++;
      continue;
    }

    // Map current string to standardized function
    const mappedFunction = currentFunction ? BUSINESS_FUNCTION_MAPPING[currentFunction] : null;
    const functionId = mappedFunction ? functionMap[mappedFunction] : null;

    if (!functionId) {
      console.log(`⚠️  ${agent.display_name}: No mapping for '${currentFunction}'`);
      errorCount++;
      continue;
    }

    // Update agent
    const { error: updateError } = await supabase
      .from('agents')
      .update({ business_function: functionId })
      .eq('id', agent.id);

    if (updateError) {
      console.error(`❌ ${agent.display_name}: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`✅ ${agent.display_name}: ${currentFunction} → ${mappedFunction}`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 Update Summary:');
  console.log('='.repeat(80));
  console.log(`  ✅ Successfully Updated: ${successCount} agents`);
  console.log(`  ⏭️  Already Correct (UUID): ${skippedCount} agents`);
  console.log(`  ❌ Errors: ${errorCount} agents`);
  console.log(`  📊 Total Processed: ${agents.length} agents`);
  console.log('='.repeat(80));
}

assignBusinessFunctions()
  .then(() => {
    console.log('\n✅ Business function assignment complete!');
    console.log('Run verify script to confirm: npx tsx scripts/verify-agents.ts\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

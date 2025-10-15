/**
 * Map departments and functions from CSV to agents based on their domain expertise and roles
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping of domain expertise and agent roles to departments
const departmentMapping = {
  // R&D Departments
  'Drug Discovery': ['discovery', 'research', 'medicinal-chemistry', 'molecular-biology'],
  'Preclinical Development': ['preclinical', 'toxicology', 'pharmacology', 'dmpk'],
  'Translational Medicine': ['translational', 'biomarker', 'pharmacogenomics'],

  // Clinical Development
  'Clinical Operations': ['clinical-operations', 'trial-management', 'site-management'],
  'Clinical Development': ['clinical-development', 'protocol', 'medical-monitoring'],
  'Data Management': ['data-management', 'clinical-data', 'cdisc'],
  'Biostatistics': ['biostatistics', 'statistical-analysis', 'sas-programming'],

  // Regulatory
  'Global Regulatory': ['regulatory-affairs', 'regulatory-strategy', 'submissions'],
  'Regulatory CMC': ['cmc-regulatory', 'cmc-documentation'],
  'Regulatory Intelligence': ['regulatory-intelligence', 'competitive-intelligence'],

  // Manufacturing
  'Drug Substance': ['api-manufacturing', 'process-development'],
  'Drug Product': ['formulation', 'drug-product', 'packaging', 'analytical'],
  'Supply Chain': ['supply-chain', 'demand-planning', 'logistics'],

  // Quality
  'Quality Assurance': ['quality-assurance', 'qa', 'validation', 'audits'],
  'Quality Control': ['quality-control', 'qc', 'laboratory', 'testing'],
  'Quality Compliance': ['compliance', 'gxp', 'data-integrity'],

  // Medical Affairs
  'Medical Science Liaisons': ['msl', 'kol-engagement', 'medical-liaison'],
  'Medical Information': ['medical-information', 'medical-inquiry'],
  'Medical Communications': ['medical-communications', 'publication', 'congress'],

  // Pharmacovigilance
  'Drug Safety': ['pharmacovigilance', 'drug-safety', 'adverse-events'],
  'Risk Management': ['risk-management', 'rems', 'safety-planning'],
  'Epidemiology': ['epidemiology', 'real-world-evidence', 'observational'],

  // Commercial
  'Marketing': ['marketing', 'brand-strategy', 'digital-marketing', 'launch-planning'],
  'Sales': ['sales', 'territory-management', 'account-management'],
  'Market Access': ['market-access', 'pricing', 'reimbursement', 'payer'],
  'HEOR': ['heor', 'health-economics', 'outcomes-research', 'hta'],

  // Business Development
  'BD&L': ['business-development', 'licensing', 'partnerships', 'alliances'],
  'Strategic Planning': ['strategy', 'portfolio-planning', 'competitive-analysis'],

  // Support Functions
  'Legal Affairs': ['legal', 'patent', 'ip', 'contracts'],
  'Finance & Accounting': ['finance', 'accounting', 'fp&a', 'treasury'],
  'Information Technology': ['it', 'digital', 'data-analytics', 'cybersecurity']
};

// Function area mapping
const functionMapping = {
  'Research & Development': ['discovery', 'preclinical', 'translational', 'research'],
  'Clinical Development': ['clinical', 'trial', 'protocol', 'biostatistics', 'data-management'],
  'Regulatory Affairs': ['regulatory', 'submissions', 'compliance'],
  'Manufacturing': ['manufacturing', 'api', 'formulation', 'supply-chain', 'production'],
  'Quality': ['quality', 'qa', 'qc', 'validation', 'gxp'],
  'Medical Affairs': ['medical-affairs', 'msl', 'medical-information', 'medical-communications'],
  'Pharmacovigilance': ['pharmacovigilance', 'safety', 'risk-management', 'epidemiology'],
  'Commercial': ['commercial', 'marketing', 'sales', 'market-access', 'heor'],
  'Business Development': ['business-development', 'strategy', 'licensing'],
  'Legal': ['legal', 'patent', 'ip'],
  'Finance': ['finance', 'accounting', 'fp&a'],
  'IT/Digital': ['it', 'digital', 'data-analytics', 'cybersecurity']
};

/**
 * Determine department based on agent name and domain expertise
 */
function getDepartment(agentName, domainExpertise, role) {
  const searchStr = `${agentName} ${domainExpertise || ''} ${role || ''}`.toLowerCase();

  for (const [dept, keywords] of Object.entries(departmentMapping)) {
    if (keywords.some(keyword => searchStr.includes(keyword))) {
      return dept;
    }
  }

  return null; // No match found
}

/**
 * Determine function area based on agent characteristics
 */
function getFunctionArea(agentName, domainExpertise, role) {
  const searchStr = `${agentName} ${domainExpertise || ''} ${role || ''}`.toLowerCase();

  for (const [func, keywords] of Object.entries(functionMapping)) {
    if (keywords.some(keyword => searchStr.includes(keyword))) {
      return func;
    }
  }

  return null; // No match found
}

async function mapDepartmentsToAgents() {
  console.log('🏢 Starting department mapping...\n');

  // Fetch all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, domain_expertise, role');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`📊 Found ${agents.length} agents\n`);

  let mapped = 0;
  let unmapped = 0;
  const updates = [];

  for (const agent of agents) {
    const department = getDepartment(agent.name, agent.domain_expertise, agent.role);
    const functionArea = getFunctionArea(agent.name, agent.domain_expertise, agent.role);

    if (department || functionArea) {
      updates.push({
        id: agent.id,
        department,
        function_area: functionArea
      });

      mapped++;
      console.log(`✅ ${agent.display_name || agent.name}`);
      console.log(`   Department: ${department || 'N/A'}`);
      console.log(`   Function: ${functionArea || 'N/A'}\n`);
    } else {
      unmapped++;
      console.log(`⚠️  ${agent.display_name || agent.name} - No mapping found\n`);
    }
  }

  // Update agents with department and function area
  console.log(`\n📝 Updating ${updates.length} agents...`);

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        department: update.department,
        // Store function_area in metadata for now since column may not exist
        metadata: supabase.rpc('jsonb_set', {
          target: 'metadata',
          path: '{function_area}',
          new_value: JSON.stringify(update.function_area)
        })
      })
      .eq('id', update.id);

    if (updateError) {
      console.error(`❌ Error updating agent ${update.id}:`, updateError);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Mapped: ${mapped}`);
  console.log(`⚠️  Unmapped: ${unmapped}`);
  console.log(`📈 Success Rate: ${((mapped / agents.length) * 100).toFixed(1)}%`);
}

mapDepartmentsToAgents().catch(console.error);

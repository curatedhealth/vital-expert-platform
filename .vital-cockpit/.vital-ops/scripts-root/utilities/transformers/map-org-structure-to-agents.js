/**
 * Map organizational structure (functions, departments, roles) to agents from CSV data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mapping data extracted from CSVs
const FUNCTIONS = {
  'FUNC-001': { name: 'Research & Development', keywords: ['research', 'development', 'discovery', 'preclinical', 'translational', 'r&d', 'scientific'] },
  'FUNC-002': { name: 'Clinical Development', keywords: ['clinical', 'trial', 'protocol', 'biostatistics', 'data management', 'medical monitor'] },
  'FUNC-003': { name: 'Regulatory Affairs', keywords: ['regulatory', 'fda', 'submissions', 'compliance', 'cmc', 'intelligence'] },
  'FUNC-004': { name: 'Manufacturing', keywords: ['manufacturing', 'production', 'api', 'formulation', 'supply chain', 'drug substance', 'drug product'] },
  'FUNC-005': { name: 'Quality', keywords: ['quality', 'qa', 'qc', 'validation', 'gxp', 'compliance'] },
  'FUNC-006': { name: 'Medical Affairs', keywords: ['medical affairs', 'msl', 'medical information', 'medical communications', 'publication'] },
  'FUNC-007': { name: 'Pharmacovigilance', keywords: ['pharmacovigilance', 'safety', 'drug safety', 'risk management', 'epidemiology', 'adverse'] },
  'FUNC-008': { name: 'Commercial', keywords: ['commercial', 'marketing', 'sales', 'market access', 'heor', 'pricing', 'reimbursement'] },
  'FUNC-009': { name: 'Business Development', keywords: ['business development', 'licensing', 'strategy', 'partnerships', 'bd&l', 'm&a'] },
  'FUNC-010': { name: 'Legal', keywords: ['legal', 'patent', 'ip', 'intellectual property', 'contract', 'compliance lawyer'] },
  'FUNC-011': { name: 'Finance', keywords: ['finance', 'accounting', 'fp&a', 'treasury', 'cfo', 'controller'] },
  'FUNC-012': { name: 'IT/Digital', keywords: ['it', 'digital', 'information technology', 'data analytics', 'cybersecurity', 'cio'] }
};

const DEPARTMENTS = {
  // R&D
  'Drug Discovery': ['discovery', 'medicinal', 'molecular', 'target'],
  'Preclinical Development': ['preclinical', 'toxicology', 'pharmacology', 'dmpk'],
  'Translational Medicine': ['translational', 'biomarker', 'pharmacogenomics'],

  // Clinical
  'Clinical Operations': ['clinical operations', 'trial manager', 'cra', 'study coordinator'],
  'Clinical Development': ['clinical development', 'protocol', 'medical monitor', 'therapeutic area'],
  'Data Management': ['data management', 'clinical data', 'edcCDISC'],
  'Biostatistics': ['biostatistics', 'statistical', 'sas programmer'],

  // Regulatory
  'Global Regulatory': ['regulatory strategy', 'regulatory affairs', 'submissions'],
  'Regulatory CMC': ['cmc regulatory', 'cmc'],
  'Regulatory Intelligence': ['regulatory intelligence', 'policy analyst'],

  // Manufacturing
  'Drug Substance': ['api', 'drug substance', 'process engineer'],
  'Drug Product': ['formulation', 'drug product', 'packaging', 'analytical'],
  'Supply Chain': ['supply chain', 'demand planning', 'logistics'],

  // Quality
  'Quality Assurance': ['quality assurance', 'qa manager', 'validation'],
  'Quality Control': ['quality control', 'qc', 'laboratory', 'microbiologist'],
  'Quality Compliance': ['compliance', 'gxp', 'data integrity'],

  // Medical Affairs
  'Medical Science Liaisons': ['msl', 'medical science liaison', 'kol'],
  'Medical Information': ['medical information', 'medical inquiry'],
  'Medical Communications': ['medical communications', 'publication', 'congress'],

  // Pharmacovigilance
  'Drug Safety': ['drug safety', 'pharmacovigilance', 'adverse event'],
  'Risk Management': ['risk management', 'rems'],
  'Epidemiology': ['epidemiology', 'real-world evidence'],

  // Commercial
  'Marketing': ['marketing', 'brand', 'digital marketing'],
  'Sales': ['sales', 'territory', 'account management'],
  'Market Access': ['market access', 'pricing', 'reimbursement', 'payer'],
  'HEOR': ['heor', 'health economics', 'outcomes research', 'hta'],

  // Support
  'BD&L': ['business development', 'licensing', 'partnerships'],
  'Strategic Planning': ['strategy', 'strategic planning', 'portfolio'],
  'Legal Affairs': ['legal', 'patent attorney', 'ip specialist'],
  'Finance & Accounting': ['finance', 'accounting', 'fp&a'],
  'Information Technology': ['it', 'information technology', 'data scientist', 'cybersecurity']
};

/**
 * Find matching function for agent based on keywords
 */
function findFunction(agentName, description, role) {
  const searchStr = `${agentName} ${description} ${role || ''}`.toLowerCase();

  let bestMatch = null;
  let maxMatches = 0;

  for (const [funcId, funcData] of Object.entries(FUNCTIONS)) {
    const matches = funcData.keywords.filter(keyword =>
      searchStr.includes(keyword.toLowerCase())
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = funcData.name;
    }
  }

  return bestMatch;
}

/**
 * Find matching department for agent based on keywords
 */
function findDepartment(agentName, description, role) {
  const searchStr = `${agentName} ${description} ${role || ''}`.toLowerCase();

  for (const [dept, keywords] of Object.entries(DEPARTMENTS)) {
    if (keywords.some(keyword => searchStr.includes(keyword.toLowerCase()))) {
      return dept;
    }
  }

  return null;
}

/**
 * Determine role based on agent name and description
 */
function findRole(agentName, description) {
  const searchStr = `${agentName} ${description}`.toLowerCase();

  // Common role patterns
  const rolePatterns = {
    'Chief Scientific Officer': ['chief scientific officer', 'cso'],
    'Chief Medical Officer': ['chief medical officer', 'cmo'],
    'VP Regulatory Affairs': ['vp regulatory', 'regulatory vp'],
    'VP Quality': ['vp quality', 'quality vp'],
    'Medical Writer': ['medical writer', 'medical writing'],
    'Clinical Trial Designer': ['clinical trial design', 'trial designer', 'protocol writer'],
    'FDA Regulatory Strategist': ['fda regulatory', 'regulatory strategist'],
    'Reimbursement Strategist': ['reimbursement strategist', 'reimbursement strategy'],
    'HIPAA Compliance Officer': ['hipaa compliance', 'compliance officer'],
    'Data Scientist': ['data scientist', 'data analytics'],
    'Biostatistician': ['biostatistician', 'biostatistics'],
    'Clinical Data Manager': ['clinical data manager', 'data management'],
    'Pharmacovigilance': ['pharmacovigilance', 'drug safety'],
    'MSL': ['msl', 'medical science liaison'],
    'Market Access': ['market access manager', 'market access'],
    'Health Economist': ['health economist', 'heor']
  };

  for (const [role, patterns] of Object.entries(rolePatterns)) {
    if (patterns.some(pattern => searchStr.includes(pattern))) {
      return role;
    }
  }

  return null;
}

async function mapOrgStructure() {
  console.log('\n🏢 Starting organizational structure mapping...\n');
  console.log('=' .repeat(80));

  // Fetch all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, display_name, description, role, business_function, department');

  if (error) {
    console.error('❌ Error fetching agents:', error);
    return;
  }

  console.log(`\n📊 Found ${agents.length} agents to process\n`);

  const updates = [];
  let functionsMatched = 0;
  let departmentsMatched = 0;
  let rolesMatched = 0;

  for (const agent of agents) {
    const functionMatch = findFunction(agent.name, agent.description, agent.role);
    const departmentMatch = findDepartment(agent.name, agent.description, agent.role);
    const roleMatch = findRole(agent.name, agent.description) || agent.role;

    if (functionMatch || departmentMatch || roleMatch !== agent.role) {
      updates.push({
        id: agent.id,
        business_function: functionMatch || agent.business_function,
        department: departmentMatch || agent.department,
        role: roleMatch
      });

      if (functionMatch) functionsMatched++;
      if (departmentMatch) departmentsMatched++;
      if (roleMatch && roleMatch !== agent.role) rolesMatched++;

      console.log(`✅ ${agent.display_name || agent.name}`);
      if (functionMatch) console.log(`   Function: ${functionMatch}`);
      if (departmentMatch) console.log(`   Department: ${departmentMatch}`);
      if (roleMatch) console.log(`   Role: ${roleMatch}`);
      console.log('');
    }
  }

  console.log('=' .repeat(80));
  console.log(`\n📝 Updating ${updates.length} agents...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        business_function: update.business_function,
        department: update.department,
        role: update.role
      })
      .eq('id', update.id);

    if (updateError) {
      console.error(`❌ Error updating agent ${update.id}:`, updateError.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 MAPPING SUMMARY:\n');
  console.log(`✅ Successfully updated: ${successCount} agents`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`\n📈 Matches Found:`);
  console.log(`   - Functions: ${functionsMatched}`);
  console.log(`   - Departments: ${departmentsMatched}`);
  console.log(`   - Roles: ${rolesMatched}`);
  console.log(`\n📈 Success Rate: ${((successCount / agents.length) * 100).toFixed(1)}%`);
  console.log('\n' + '='.repeat(80) + '\n');
}

mapOrgStructure().catch(console.error);

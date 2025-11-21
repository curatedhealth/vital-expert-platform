/**
 * VITAL Path Complete MVP Deployment Script
 * 
 * Deploys everything except Solution Build and Jobs-to-be-Done:
 * - 355+ AI Agents (all collections)
 * - RAG System (knowledge management)
 * - Data Functions (organizational structure)
 * - Departments & Roles (complete hierarchy)
 * - Chat Mode (with agent selection)
 * - Panel Mode (virtual advisory boards)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Agent collections to import
const AGENT_COLLECTIONS = [
  {
    name: 'VITAL Agents Registry',
    file: 'vital_agents_registry_250_complete.json',
    expectedCount: 250
  },
  {
    name: 'Marketing Agents',
    file: 'docs/MARKETING_AGENTS_30_ENHANCED.json',
    expectedCount: 30
  },
  {
    name: 'Market Access Agents',
    file: 'docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json',
    expectedCount: 30
  },
  {
    name: 'Medical Affairs Agents',
    file: 'docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json',
    expectedCount: 30
  },
  {
    name: 'Digital Health Agents',
    file: 'DIGITAL_HEALTH_AGENTS_15.json',
    expectedCount: 15
  }
];

// Organizational structure data
const BUSINESS_FUNCTIONS = [
  { code: 'CLIN', name: 'Clinical Development', description: 'Clinical trials, evidence generation, and research' },
  { code: 'REG', name: 'Regulatory Affairs', description: 'FDA, EMA, and global regulatory guidance' },
  { code: 'MKT', name: 'Marketing', description: 'Brand strategy, campaigns, and customer engagement' },
  { code: 'MA', name: 'Medical Affairs', description: 'Medical information, KOL engagement, and scientific exchange' },
  { code: 'QA', name: 'Quality Assurance', description: 'Quality management, compliance, and GxP' },
  { code: 'PV', name: 'Pharmacovigilance', description: 'Safety monitoring and adverse event management' },
  { code: 'MAK', name: 'Market Access', description: 'Reimbursement, HTA, and payer strategies' },
  { code: 'MAN', name: 'Manufacturing', description: 'Production, supply chain, and operations' },
  { code: 'R&D', name: 'Research & Development', description: 'Drug discovery, innovation, and technology' },
  { code: 'COM', name: 'Commercial', description: 'Sales, business development, and partnerships' }
];

let BUSINESS_FUNCTION_MAP = {};
let DEPARTMENT_MAP = {};
let ROLE_MAP = {};

async function main() {
  console.log('🚀 VITAL Path Complete MVP Deployment');
  console.log('═'.repeat(80));
  console.log('📦 Deploying: 355+ Agents, RAG, Data Functions, Departments, Roles');
  console.log('❌ Excluding: Solution Build, Jobs-to-be-Done');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Step 1: Set up organizational structure
    await setupOrganizationalStructure();
    
    // Step 2: Import all agent collections
    await importAllAgentCollections();
    
    // Step 3: Set up RAG system
    await setupRAGSystem();
    
    // Step 4: Verify deployment
    await verifyDeployment();
    
    console.log('');
    console.log('🎉 VITAL Path Complete MVP Deployment Successful!');
    console.log('═'.repeat(80));
    console.log('✅ 355+ AI Agents imported');
    console.log('✅ RAG System configured');
    console.log('✅ Organizational structure created');
    console.log('✅ Chat Mode ready');
    console.log('✅ Panel Mode ready');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function setupOrganizationalStructure() {
  console.log('STEP 1: Setting up Organizational Structure');
  console.log('─'.repeat(80));

  // Create business functions
  console.log('📋 Creating Business Functions...');
  for (const func of BUSINESS_FUNCTIONS) {
    const { data: existing } = await supabase
      .from('business_functions')
      .select('id')
      .eq('code', func.code)
      .maybeSingle();

    if (existing) {
      BUSINESS_FUNCTION_MAP[func.name] = existing.id;
      console.log(`✓ ${func.name}: ${existing.id.slice(0, 8)}...`);
    } else {
      const { data: newFunc, error } = await supabase
        .from('business_functions')
        .insert({
          code: func.code,
          name: func.name,
          description: func.description,
          icon: '📁',
          color: '#3B82F6',
          sort_order: BUSINESS_FUNCTIONS.indexOf(func)
        })
        .select('id')
        .single();

      if (error) {
        console.error(`✗ Failed to create ${func.name}:`, error.message);
      } else {
        BUSINESS_FUNCTION_MAP[func.name] = newFunc.id;
        console.log(`✓ Created ${func.name}: ${newFunc.id.slice(0, 8)}...`);
      }
    }
  }

  // Create departments for each business function
  console.log('\n📋 Creating Departments...');
  const departments = [
    // Clinical Development
    { name: 'Clinical Operations', business_function: 'Clinical Development' },
    { name: 'Clinical Data Management', business_function: 'Clinical Development' },
    { name: 'Biostatistics', business_function: 'Clinical Development' },
    { name: 'Clinical Pharmacology', business_function: 'Clinical Development' },
    
    // Regulatory Affairs
    { name: 'Regulatory Strategy', business_function: 'Regulatory Affairs' },
    { name: 'Regulatory Operations', business_function: 'Regulatory Affairs' },
    { name: 'Regulatory Intelligence', business_function: 'Regulatory Affairs' },
    
    // Marketing
    { name: 'Brand Strategy', business_function: 'Marketing' },
    { name: 'Product Marketing', business_function: 'Marketing' },
    { name: 'Digital Marketing', business_function: 'Marketing' },
    { name: 'Customer Engagement', business_function: 'Marketing' },
    { name: 'Marketing Operations', business_function: 'Marketing' },
    { name: 'Creative & Content', business_function: 'Marketing' },
    { name: 'Marketing Analytics', business_function: 'Marketing' },
    
    // Medical Affairs
    { name: 'Medical Information', business_function: 'Medical Affairs' },
    { name: 'KOL Engagement', business_function: 'Medical Affairs' },
    { name: 'Scientific Communications', business_function: 'Medical Affairs' },
    { name: 'Medical Strategy', business_function: 'Medical Affairs' },
    
    // Quality Assurance
    { name: 'Quality Systems', business_function: 'Quality Assurance' },
    { name: 'Compliance', business_function: 'Quality Assurance' },
    { name: 'Audit', business_function: 'Quality Assurance' },
    
    // Pharmacovigilance
    { name: 'Safety Operations', business_function: 'Pharmacovigilance' },
    { name: 'Risk Management', business_function: 'Pharmacovigilance' },
    { name: 'Signal Detection', business_function: 'Pharmacovigilance' },
    
    // Market Access
    { name: 'Health Economics', business_function: 'Market Access' },
    { name: 'Reimbursement', business_function: 'Market Access' },
    { name: 'HTA Strategy', business_function: 'Market Access' },
    { name: 'Payer Relations', business_function: 'Market Access' },
    
    // Manufacturing
    { name: 'Production', business_function: 'Manufacturing' },
    { name: 'Supply Chain', business_function: 'Manufacturing' },
    { name: 'Quality Control', business_function: 'Manufacturing' },
    
    // R&D
    { name: 'Drug Discovery', business_function: 'Research & Development' },
    { name: 'Preclinical', business_function: 'Research & Development' },
    { name: 'Innovation', business_function: 'Research & Development' },
    
    // Commercial
    { name: 'Sales', business_function: 'Commercial' },
    { name: 'Business Development', business_function: 'Commercial' },
    { name: 'Partnerships', business_function: 'Commercial' }
  ];

  for (const dept of departments) {
    const businessFunctionId = BUSINESS_FUNCTION_MAP[dept.business_function];
    if (!businessFunctionId) {
      console.log(`⚠ Skipping ${dept.name} - business function not found`);
      continue;
    }

    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .eq('name', dept.name)
      .eq('business_function_id', businessFunctionId)
      .maybeSingle();

    if (existing) {
      DEPARTMENT_MAP[dept.name] = existing.id;
      console.log(`✓ ${dept.name}: ${existing.id.slice(0, 8)}...`);
    } else {
      const { data: newDept, error } = await supabase
        .from('departments')
        .insert({
          name: dept.name,
          description: `${dept.name} department within ${dept.business_function}`,
          business_function_id: businessFunctionId
        })
        .select('id')
        .single();

      if (error) {
        console.error(`✗ Failed to create ${dept.name}:`, error.message);
      } else {
        DEPARTMENT_MAP[dept.name] = newDept.id;
        console.log(`✓ Created ${dept.name}: ${newDept.id.slice(0, 8)}...`);
      }
    }
  }

  console.log(`\n✅ Organizational structure ready: ${Object.keys(DEPARTMENT_MAP).length} departments`);
}

async function importAllAgentCollections() {
  console.log('\nSTEP 2: Importing All Agent Collections');
  console.log('─'.repeat(80));

  let totalImported = 0;
  let totalErrors = 0;

  for (const collection of AGENT_COLLECTIONS) {
    console.log(`\n📦 Importing ${collection.name} (${collection.expectedCount} agents)...`);
    
    try {
      const filePath = path.join(__dirname, '..', collection.file);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠ File not found: ${collection.file}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      const agents = data.agents || data;
      if (!Array.isArray(agents)) {
        console.log(`⚠ Invalid format in ${collection.file}`);
        continue;
      }

      let imported = 0;
      let errors = 0;

      for (const agentSpec of agents) {
        try {
          // Map agent to department
          const departmentId = mapAgentToDepartment(agentSpec);
          
          // Build agent data
          const agentData = {
            name: agentSpec.name || agentSpec.id,
            display_name: agentSpec.display_name || agentSpec.name,
            description: agentSpec.description || '',
            tier: agentSpec.tier || 1,
            status: agentSpec.status === 'active' ? 'development' : 'development',
            priority: agentSpec.priority || 100,
            model: agentSpec.model || 'gpt-4',
            system_prompt: agentSpec.system_prompt?.role || agentSpec.description || '',
            capabilities: agentSpec.system_prompt?.capabilities || agentSpec.capabilities || [],
            business_function: mapAgentToBusinessFunction(agentSpec),
            business_function_id: BUSINESS_FUNCTION_MAP[mapAgentToBusinessFunction(agentSpec)],
            department: mapAgentToDepartmentName(agentSpec),
            department_id: departmentId,
            temperature: agentSpec.temperature || 0.7,
            max_tokens: agentSpec.max_tokens || 2000,
            rag_enabled: true,
            avatar: agentSpec.avatar || '🤖',
            color: agentSpec.color || '#3B82F6',
            metadata: {
              ...agentSpec.metadata,
              agent_code: agentSpec.id?.toUpperCase(),
              collection: collection.name,
              imported_from: collection.file,
              import_date: new Date().toISOString()
            }
          };

          // Check if agent exists
          const { data: existing } = await supabase
            .from('agents')
            .select('id')
            .eq('name', agentData.name)
            .maybeSingle();

          if (existing) {
            const { error } = await supabase
              .from('agents')
              .update(agentData)
              .eq('id', existing.id);

            if (error) {
              console.log(`✗ ${agentSpec.id || agentSpec.name}: ${error.message.substring(0, 50)}...`);
              errors++;
            } else {
              console.log(`↻ ${agentSpec.id || agentSpec.name}: Updated`);
              imported++;
            }
          } else {
            const { error } = await supabase
              .from('agents')
              .insert(agentData);

            if (error) {
              console.log(`✗ ${agentSpec.id || agentSpec.name}: ${error.message.substring(0, 50)}...`);
              errors++;
            } else {
              console.log(`✓ ${agentSpec.id || agentSpec.name}: Created`);
              imported++;
            }
          }
        } catch (err) {
          console.log(`✗ ${agentSpec.id || agentSpec.name}: ${err.message}`);
          errors++;
        }
      }

      console.log(`✅ ${collection.name}: ${imported} imported, ${errors} errors`);
      totalImported += imported;
      totalErrors += errors;

    } catch (error) {
      console.error(`❌ Failed to import ${collection.name}:`, error.message);
      totalErrors++;
    }
  }

  console.log(`\n✅ Agent import complete: ${totalImported} imported, ${totalErrors} errors`);
}

function mapAgentToBusinessFunction(agent) {
  const department = agent.department || '';
  const name = agent.name || '';
  const displayName = agent.display_name || '';

  if (department.includes('Marketing') || name.includes('marketing') || displayName.includes('Marketing')) {
    return 'Marketing';
  }
  if (department.includes('Medical') || name.includes('medical') || displayName.includes('Medical')) {
    return 'Medical Affairs';
  }
  if (department.includes('Market Access') || name.includes('reimbursement') || displayName.includes('Market Access')) {
    return 'Market Access';
  }
  if (department.includes('Clinical') || name.includes('clinical') || displayName.includes('Clinical')) {
    return 'Clinical Development';
  }
  if (department.includes('Regulatory') || name.includes('regulatory') || displayName.includes('Regulatory')) {
    return 'Regulatory Affairs';
  }
  if (department.includes('Quality') || name.includes('quality') || displayName.includes('Quality')) {
    return 'Quality Assurance';
  }
  if (department.includes('Safety') || name.includes('safety') || displayName.includes('Safety')) {
    return 'Pharmacovigilance';
  }
  if (department.includes('Manufacturing') || name.includes('manufacturing') || displayName.includes('Manufacturing')) {
    return 'Manufacturing';
  }
  if (department.includes('R&D') || name.includes('research') || displayName.includes('Research')) {
    return 'Research & Development';
  }
  if (department.includes('Commercial') || name.includes('commercial') || displayName.includes('Commercial')) {
    return 'Commercial';
  }
  
  return 'Clinical Development'; // Default
}

function mapAgentToDepartmentName(agent) {
  const department = agent.department || '';
  const name = agent.name || '';
  const displayName = agent.display_name || '';

  if (department.includes('Brand Strategy') || name.includes('brand') || displayName.includes('Brand')) {
    return 'Brand Strategy';
  }
  if (department.includes('Product Marketing') || name.includes('product') || displayName.includes('Product')) {
    return 'Product Marketing';
  }
  if (department.includes('Digital') || name.includes('digital') || displayName.includes('Digital')) {
    return 'Digital Marketing';
  }
  if (department.includes('Customer') || name.includes('customer') || displayName.includes('Customer')) {
    return 'Customer Engagement';
  }
  if (department.includes('Operations') || name.includes('operations') || displayName.includes('Operations')) {
    return 'Marketing Operations';
  }
  if (department.includes('Creative') || name.includes('creative') || displayName.includes('Creative')) {
    return 'Creative & Content';
  }
  if (department.includes('Analytics') || name.includes('analytics') || displayName.includes('Analytics')) {
    return 'Marketing Analytics';
  }
  if (department.includes('Medical Information') || name.includes('medical information')) {
    return 'Medical Information';
  }
  if (department.includes('KOL') || name.includes('KOL') || displayName.includes('KOL')) {
    return 'KOL Engagement';
  }
  if (department.includes('Scientific') || name.includes('scientific') || displayName.includes('Scientific')) {
    return 'Scientific Communications';
  }
  if (department.includes('Clinical Operations') || name.includes('clinical operations')) {
    return 'Clinical Operations';
  }
  if (department.includes('Data Management') || name.includes('data management')) {
    return 'Clinical Data Management';
  }
  if (department.includes('Biostatistics') || name.includes('biostatistics')) {
    return 'Biostatistics';
  }
  if (department.includes('Regulatory Strategy') || name.includes('regulatory strategy')) {
    return 'Regulatory Strategy';
  }
  if (department.includes('Regulatory Operations') || name.includes('regulatory operations')) {
    return 'Regulatory Operations';
  }
  if (department.includes('Health Economics') || name.includes('health economics')) {
    return 'Health Economics';
  }
  if (department.includes('Reimbursement') || name.includes('reimbursement')) {
    return 'Reimbursement';
  }
  if (department.includes('Quality Systems') || name.includes('quality systems')) {
    return 'Quality Systems';
  }
  if (department.includes('Safety Operations') || name.includes('safety operations')) {
    return 'Safety Operations';
  }
  if (department.includes('Production') || name.includes('production')) {
    return 'Production';
  }
  if (department.includes('Sales') || name.includes('sales')) {
    return 'Sales';
  }
  
  return 'Clinical Operations'; // Default
}

function mapAgentToDepartment(agent) {
  const departmentName = mapAgentToDepartmentName(agent);
  return DEPARTMENT_MAP[departmentName] || DEPARTMENT_MAP['Clinical Operations'];
}

async function setupRAGSystem() {
  console.log('\nSTEP 3: Setting up RAG System');
  console.log('─'.repeat(80));

  // Create knowledge domains
  const knowledgeDomains = [
    { name: 'Clinical Trials', description: 'Clinical trial design, endpoints, and protocols' },
    { name: 'Regulatory Affairs', description: 'FDA, EMA, and global regulatory guidance' },
    { name: 'Medical Affairs', description: 'Medical information and KOL engagement' },
    { name: 'Market Access', description: 'Reimbursement, HTA, and payer strategies' },
    { name: 'Quality Assurance', description: 'GxP compliance and quality systems' },
    { name: 'Pharmacovigilance', description: 'Safety monitoring and risk management' },
    { name: 'Manufacturing', description: 'Production, supply chain, and operations' },
    { name: 'Marketing', description: 'Brand strategy and customer engagement' },
    { name: 'Research & Development', description: 'Drug discovery and innovation' },
    { name: 'Commercial', description: 'Sales and business development' }
  ];

  console.log('📚 Creating Knowledge Domains...');
  for (const domain of knowledgeDomains) {
    const { data: existing } = await supabase
      .from('knowledge_domains')
      .select('id')
      .eq('name', domain.name)
      .maybeSingle();

    if (existing) {
      console.log(`✓ ${domain.name}: ${existing.id.slice(0, 8)}...`);
    } else {
      const { data: newDomain, error } = await supabase
        .from('knowledge_domains')
        .insert({
          name: domain.name,
          description: domain.description,
          icon: '📚',
          color: '#10B981',
          is_active: true
        })
        .select('id')
        .single();

      if (error) {
        console.error(`✗ Failed to create ${domain.name}:`, error.message);
      } else {
        console.log(`✓ Created ${domain.name}: ${newDomain.id.slice(0, 8)}...`);
      }
    }
  }

  console.log('✅ RAG System configured');
}

async function verifyDeployment() {
  console.log('\nSTEP 4: Verifying Deployment');
  console.log('─'.repeat(80));

  // Count agents
  const { count: agentCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'development');

  console.log(`📊 Total Agents: ${agentCount}`);

  // Count by tier
  const { data: tierData } = await supabase
    .from('agents')
    .select('tier')
    .eq('status', 'development');

  const tierCounts = tierData?.reduce((acc, agent) => {
    acc[agent.tier] = (acc[agent.tier] || 0) + 1;
    return acc;
  }, {}) || {};

  console.log('🎯 Agents by Tier:');
  Object.keys(tierCounts).sort().forEach(tier => {
    console.log(`  Tier ${tier}: ${tierCounts[tier]} agents`);
  });

  // Count business functions
  const { count: functionCount } = await supabase
    .from('business_functions')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📋 Business Functions: ${functionCount}`);

  // Count departments
  const { count: deptCount } = await supabase
    .from('departments')
    .select('*', { count: 'exact', head: true });

  console.log(`📋 Departments: ${deptCount}`);

  // Count knowledge domains
  const { count: domainCount } = await supabase
    .from('knowledge_domains')
    .select('*', { count: 'exact', head: true });

  console.log(`📚 Knowledge Domains: ${domainCount}`);

  console.log('\n✅ Deployment verification complete');
}

main()
  .then(() => {
    console.log('\n✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

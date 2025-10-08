const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping rules based on agent names and roles
const agentOrgMapping = {
  // Research & Development Functions
  'research': { function: 'Research & Development', department: 'Drug Discovery' },
  'discovery': { function: 'Research & Development', department: 'Drug Discovery' },
  'scientist': { function: 'Research & Development', department: 'Drug Discovery' },
  'chemist': { function: 'Research & Development', department: 'Drug Discovery' },
  'biologist': { function: 'Research & Development', department: 'Drug Discovery' },
  'preclinical': { function: 'Research & Development', department: 'Preclinical Development' },
  'toxicology': { function: 'Research & Development', department: 'Preclinical Development' },
  'pharmacology': { function: 'Research & Development', department: 'Preclinical Development' },
  'dmpk': { function: 'Research & Development', department: 'Preclinical Development' },
  'formulation': { function: 'Research & Development', department: 'Preclinical Development' },
  'translational': { function: 'Research & Development', department: 'Translational Medicine' },
  'biomarker': { function: 'Research & Development', department: 'Translational Medicine' },
  'pharmacogenomics': { function: 'Research & Development', department: 'Translational Medicine' },
  'systems_biology': { function: 'Research & Development', department: 'Translational Medicine' },
  
  // Clinical Development Functions
  'clinical': { function: 'Clinical Development', department: 'Clinical Operations' },
  'trial': { function: 'Clinical Development', department: 'Clinical Operations' },
  'cmo': { function: 'Clinical Development', department: 'Clinical Development' },
  'medical_monitor': { function: 'Clinical Development', department: 'Clinical Development' },
  'protocol': { function: 'Clinical Development', department: 'Clinical Development' },
  'data_management': { function: 'Clinical Development', department: 'Data Management' },
  'biostatistics': { function: 'Clinical Development', department: 'Biostatistics' },
  'sas': { function: 'Clinical Development', department: 'Biostatistics' },
  'statistical': { function: 'Clinical Development', department: 'Biostatistics' },
  
  // Regulatory Affairs Functions
  'regulatory': { function: 'Regulatory Affairs', department: 'Global Regulatory' },
  'submission': { function: 'Regulatory Affairs', department: 'Global Regulatory' },
  'cmc': { function: 'Regulatory Affairs', department: 'Regulatory CMC' },
  'intelligence': { function: 'Regulatory Affairs', department: 'Regulatory Intelligence' },
  'policy': { function: 'Regulatory Affairs', department: 'Regulatory Intelligence' },
  
  // Manufacturing Functions
  'manufacturing': { function: 'Manufacturing', department: 'Drug Substance' },
  'api': { function: 'Manufacturing', department: 'Drug Substance' },
  'production': { function: 'Manufacturing', department: 'Drug Substance' },
  'process': { function: 'Manufacturing', department: 'Drug Substance' },
  'drug_product': { function: 'Manufacturing', department: 'Drug Product' },
  'packaging': { function: 'Manufacturing', department: 'Drug Product' },
  'analytical': { function: 'Manufacturing', department: 'Drug Product' },
  'supply_chain': { function: 'Manufacturing', department: 'Supply Chain' },
  'logistics': { function: 'Manufacturing', department: 'Supply Chain' },
  
  // Quality Functions
  'quality': { function: 'Quality', department: 'Quality Assurance' },
  'qa': { function: 'Quality', department: 'Quality Assurance' },
  'qc': { function: 'Quality', department: 'Quality Control' },
  'validation': { function: 'Quality', department: 'Quality Assurance' },
  'compliance': { function: 'Quality', department: 'Quality Compliance' },
  'microbiology': { function: 'Quality', department: 'Quality Control' },
  'data_integrity': { function: 'Quality', department: 'Quality Compliance' },
  
  // Medical Affairs Functions
  'medical_affairs': { function: 'Medical Affairs', department: 'Medical Science Liaisons' },
  'msl': { function: 'Medical Affairs', department: 'Medical Science Liaisons' },
  'medical_information': { function: 'Medical Affairs', department: 'Medical Information' },
  'publication': { function: 'Medical Affairs', department: 'Medical Communications' },
  'congress': { function: 'Medical Affairs', department: 'Medical Communications' },
  'medical_writer': { function: 'Medical Affairs', department: 'Medical Information' },
  
  // Pharmacovigilance Functions
  'safety': { function: 'Pharmacovigilance', department: 'Drug Safety' },
  'pharmacovigilance': { function: 'Pharmacovigilance', department: 'Drug Safety' },
  'adverse': { function: 'Pharmacovigilance', department: 'Drug Safety' },
  'risk_management': { function: 'Pharmacovigilance', department: 'Risk Management' },
  'rems': { function: 'Pharmacovigilance', department: 'Risk Management' },
  'epidemiology': { function: 'Pharmacovigilance', department: 'Epidemiology' },
  'real_world': { function: 'Pharmacovigilance', department: 'Epidemiology' },
  
  // Commercial Functions
  'marketing': { function: 'Commercial', department: 'Marketing' },
  'brand': { function: 'Commercial', department: 'Marketing' },
  'product_manager': { function: 'Commercial', department: 'Marketing' },
  'digital_marketing': { function: 'Commercial', department: 'Marketing' },
  'sales': { function: 'Commercial', department: 'Sales' },
  'territory': { function: 'Commercial', department: 'Sales' },
  'market_access': { function: 'Commercial', department: 'Market Access' },
  'pricing': { function: 'Commercial', department: 'Market Access' },
  'reimbursement': { function: 'Commercial', department: 'Market Access' },
  'heor': { function: 'Commercial', department: 'HEOR' },
  'health_economics': { function: 'Commercial', department: 'HEOR' },
  'hta': { function: 'Commercial', department: 'HEOR' },
  
  // Business Development Functions
  'business_development': { function: 'Business Development', department: 'BD&L' },
  'licensing': { function: 'Business Development', department: 'BD&L' },
  'alliance': { function: 'Business Development', department: 'BD&L' },
  'strategic_planning': { function: 'Business Development', department: 'Strategic Planning' },
  'strategy': { function: 'Business Development', department: 'Strategic Planning' },
  
  // Legal Functions
  'legal': { function: 'Legal', department: 'Legal Affairs' },
  'patent': { function: 'Legal', department: 'Legal Affairs' },
  'contract': { function: 'Legal', department: 'Legal Affairs' },
  'ip': { function: 'Legal', department: 'Legal Affairs' },
  
  // Finance Functions
  'finance': { function: 'Finance', department: 'Finance & Accounting' },
  'accounting': { function: 'Finance', department: 'Finance & Accounting' },
  'fp&a': { function: 'Finance', department: 'Finance & Accounting' },
  'cost': { function: 'Finance', department: 'Finance & Accounting' },
  
  // IT/Digital Functions
  'it': { function: 'IT/Digital', department: 'Information Technology' },
  'digital': { function: 'IT/Digital', department: 'Information Technology' },
  'data_science': { function: 'IT/Digital', department: 'Information Technology' },
  'cybersecurity': { function: 'IT/Digital', department: 'Information Technology' },
  'system_architect': { function: 'IT/Digital', department: 'Information Technology' }
};

// Function to determine organizational mapping for an agent
function getAgentOrgMapping(agentName, agentRole, agentDescription) {
  const name = agentName.toLowerCase();
  const role = agentRole ? agentRole.toLowerCase() : '';
  const description = agentDescription ? agentDescription.toLowerCase() : '';
  
  // Check for exact matches first
  for (const [keyword, mapping] of Object.entries(agentOrgMapping)) {
    if (name.includes(keyword) || role.includes(keyword) || description.includes(keyword)) {
      return mapping;
    }
  }
  
  // Default mapping for unmatched agents
  return { function: 'IT/Digital', department: 'Information Technology' };
}

// Function to get appropriate role from organizational structure
function getMatchingRole(agentName, agentRole, functionName, departmentName) {
  // Get all roles for the department
  const departmentRoles = {
    'Drug Discovery': ['Chief Scientific Officer', 'Head of Discovery', 'Principal Scientist', 'Medicinal Chemist', 'Molecular Biologist'],
    'Preclinical Development': ['Head of Preclinical', 'Toxicologist', 'Pharmacologist', 'DMPK Scientist', 'Formulation Scientist'],
    'Translational Medicine': ['Head of Translational Medicine', 'Translational Scientist', 'Biomarker Specialist', 'Pharmacogenomics Scientist', 'Systems Biologist'],
    'Clinical Operations': ['VP Clinical Operations', 'Clinical Trial Manager', 'Clinical Research Associate', 'Study Coordinator', 'Clinical Supply Manager'],
    'Clinical Development': ['Chief Medical Officer', 'Therapeutic Area Head', 'Clinical Scientist', 'Medical Monitor', 'Protocol Writer'],
    'Data Management': ['Head of Data Management', 'Clinical Data Manager', 'Database Programmer', 'Data Standards Specialist'],
    'Biostatistics': ['Head of Biostatistics', 'Principal Biostatistician', 'Statistical Programmer', 'SAS Programmer'],
    'Global Regulatory': ['VP Regulatory Affairs', 'Regulatory Strategy Director', 'Regulatory Affairs Manager', 'Regulatory Writer'],
    'Regulatory CMC': ['CMC Regulatory Head', 'CMC Regulatory Manager', 'Technical Writer'],
    'Regulatory Intelligence': ['Regulatory Intelligence Lead', 'Intelligence Analyst', 'Policy Analyst'],
    'Drug Substance': ['Head of API Manufacturing', 'Process Engineer', 'Production Manager', 'Process Development Scientist'],
    'Drug Product': ['Head of Formulation', 'Formulation Scientist', 'Packaging Engineer', 'Analytical Scientist'],
    'Supply Chain': ['Supply Chain Director', 'Demand Planner', 'Supply Planner', 'Logistics Manager'],
    'Quality Assurance': ['VP Quality', 'QA Director', 'QA Manager', 'Validation Specialist'],
    'Quality Control': ['QC Director', 'QC Lab Manager', 'QC Analyst', 'Microbiologist'],
    'Quality Compliance': ['Compliance Director', 'Compliance Manager', 'Data Integrity Specialist'],
    'Medical Science Liaisons': ['MSL Director', 'Senior MSL', 'Regional MSL'],
    'Medical Information': ['Medical Information Manager', 'Medical Information Specialist', 'Medical Writer'],
    'Medical Communications': ['Medical Communications Director', 'Publication Manager', 'Congress Manager'],
    'Drug Safety': ['Chief Safety Officer', 'Pharmacovigilance Director', 'Drug Safety Scientist', 'Safety Physician'],
    'Risk Management': ['Risk Management Director', 'Risk Management Scientist', 'REMS Specialist'],
    'Epidemiology': ['Head of Epidemiology', 'Epidemiologist', 'Real-World Evidence Scientist'],
    'Marketing': ['VP Marketing', 'Brand Director', 'Product Manager', 'Marketing Manager', 'Digital Marketing Specialist'],
    'Sales': ['VP Sales', 'National Sales Director', 'Regional Sales Manager', 'Territory Manager'],
    'Market Access': ['Market Access Director', 'Pricing Manager', 'Reimbursement Specialist', 'Payer Relations Manager'],
    'HEOR': ['HEOR Director', 'Health Economist', 'Outcomes Research Scientist', 'HTA Specialist'],
    'BD&L': ['Chief Business Officer', 'BD Director', 'Licensing Manager', 'Alliance Manager'],
    'Strategic Planning': ['Strategy Director', 'Strategic Planner', 'Business Analyst'],
    'Legal Affairs': ['General Counsel', 'Patent Attorney', 'Regulatory Attorney', 'Contract Manager', 'Compliance Lawyer', 'IP Specialist'],
    'Finance & Accounting': ['CFO', 'Finance Director', 'Controller', 'FP&A Manager', 'Cost Accountant'],
    'Information Technology': ['CIO', 'IT Director', 'System Architect', 'Data Scientist', 'Cybersecurity Specialist', 'Digital Transformation Lead']
  };
  
  const availableRoles = departmentRoles[departmentName] || ['Specialist'];
  
  // Try to match based on agent name or role
  const name = agentName.toLowerCase();
  const role = agentRole ? agentRole.toLowerCase() : '';
  
  for (const availableRole of availableRoles) {
    const roleLower = availableRole.toLowerCase();
    if (name.includes(roleLower.split(' ')[0]) || role.includes(roleLower.split(' ')[0])) {
      return availableRole;
    }
  }
  
  // Return the first available role as default
  return availableRoles[0];
}

async function createAgentOrgMapping() {
  try {
    console.log('🚀 CREATING COMPREHENSIVE AGENT-ORGANIZATIONAL STRUCTURE MAPPING');
    console.log('======================================================================\n');
    
    // Step 1: Get all agents
    console.log('📋 Step 1: Fetching all agents...');
    const { data: agentsData, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, role, description');
    
    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError.message);
      return;
    }
    
    console.log(`✅ Found ${agentsData.length} agents to map\n`);
    
    // Step 2: Get organizational structure data
    console.log('📋 Step 2: Fetching organizational structure...');
    const { data: functionsData } = await supabase
      .from('org_functions')
      .select('id, unique_id, department_name');
    
    const { data: departmentsData } = await supabase
      .from('org_departments')
      .select('id, unique_id, department_name, function_area');
    
    const { data: rolesData } = await supabase
      .from('org_roles')
      .select('id, unique_id, role_name, function_area, department_name');
    
    console.log(`✅ Found ${functionsData.length} functions, ${departmentsData.length} departments, ${rolesData.length} roles\n`);
    
    // Step 3: Create mapping for each agent
    console.log('📋 Step 3: Creating agent-organizational mappings...');
    
    const agentUpdates = [];
    const agentRoleMappings = [];
    const agentResponsibilityMappings = [];
    
    for (const agent of agentsData) {
      // Get organizational mapping
      const orgMapping = getAgentOrgMapping(agent.name, agent.role, agent.description);
      
      // Find matching function
      const functionRecord = functionsData.find(f => f.department_name === orgMapping.function);
      
      // Find matching department
      const departmentRecord = departmentsData.find(d => d.department_name === orgMapping.department);
      
      // Get appropriate role
      const matchingRole = getMatchingRole(agent.name, agent.role, orgMapping.function, orgMapping.department);
      const roleRecord = rolesData.find(r => r.role_name === matchingRole);
      
      // Prepare agent update
      const agentUpdate = {
        id: agent.id,
        function_area: orgMapping.function,
        department: orgMapping.department,
        role: matchingRole,
        org_function_id: functionRecord?.id || null,
        org_department_id: departmentRecord?.id || null,
        org_role_id: roleRecord?.id || null
      };
      
      agentUpdates.push(agentUpdate);
      
      // Create role mapping
      if (roleRecord) {
        agentRoleMappings.push({
          agent_id: agent.id,
          role_id: roleRecord.id,
          is_primary: true,
          weight: 1.0
        });
      }
      
      console.log(`   ✅ ${agent.display_name || agent.name} → ${orgMapping.function} / ${orgMapping.department} / ${matchingRole}`);
    }
    
    console.log(`\n✅ Created mappings for ${agentUpdates.length} agents\n`);
    
    // Step 4: Update agents with organizational mapping
    console.log('📋 Step 4: Updating agents with organizational structure...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of agentUpdates) {
      try {
        const { error } = await supabase
          .from('agents')
          .update({
            function_area: update.function_area,
            department: update.department,
            role: update.role,
            org_function_id: update.org_function_id,
            org_department_id: update.org_department_id,
            org_role_id: update.org_role_id
          })
          .eq('id', update.id);
        
        if (error) {
          console.error(`❌ Error updating ${update.id}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception updating ${update.id}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Updated ${successCount} agents, ${errorCount} errors\n`);
    
    // Step 5: Create agent-role relationships
    console.log('📋 Step 5: Creating agent-role relationships...');
    
    if (agentRoleMappings.length > 0) {
      const { data: roleMappings, error: roleMappingError } = await supabase
        .from('org_role_responsibilities')
        .select('role_id, responsibility_id');
      
      if (!roleMappingError && roleMappings) {
        // Create agent-responsibility mappings based on role-responsibility relationships
        for (const agentRole of agentRoleMappings) {
          const roleResponsibilities = roleMappings.filter(rm => rm.role_id === agentRole.role_id);
          
          for (const roleResp of roleResponsibilities) {
            agentResponsibilityMappings.push({
              agent_id: agentRole.agent_id,
              responsibility_id: roleResp.responsibility_id,
              is_primary: true,
              weight: 0.8
            });
          }
        }
        
        console.log(`✅ Created ${agentResponsibilityMappings.length} agent-responsibility mappings\n`);
      }
    }
    
    // Step 6: Final verification
    console.log('📋 Step 6: Verifying mappings...');
    
    const { data: updatedAgents } = await supabase
      .from('agents')
      .select('id, name, display_name, function_area, department, role')
      .not('function_area', 'is', null);
    
    const mappedCount = updatedAgents?.length || 0;
    const totalCount = agentsData.length;
    
    console.log(`✅ Verification complete: ${mappedCount}/${totalCount} agents mapped (${((mappedCount/totalCount)*100).toFixed(1)}%)\n`);
    
    console.log('🎉 AGENT-ORGANIZATIONAL STRUCTURE MAPPING COMPLETE!');
    console.log('======================================================================');
    console.log(`📊 Final Results:`);
    console.log(`   ✅ Agents mapped: ${mappedCount}/${totalCount}`);
    console.log(`   🏢 Functions: ${functionsData.length}`);
    console.log(`   🏬 Departments: ${departmentsData.length}`);
    console.log(`   👥 Roles: ${rolesData.length}`);
    console.log(`   🔗 Agent-role relationships: ${agentRoleMappings.length}`);
    console.log(`   📋 Agent-responsibility relationships: ${agentResponsibilityMappings.length}`);
    console.log('\n🚀 All agents are now mapped to the organizational structure!');
    
  } catch (error) {
    console.error('❌ Mapping failed:', error.message);
  }
}

createAgentOrgMapping();

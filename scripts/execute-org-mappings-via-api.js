const fetch = require('node-fetch').default;

async function executeOrganizationalMappings() {
  console.log('🚀 Executing organizational structure mappings via API...\n');

  try {
    // Step 1: Get current organizational data
    console.log('📊 Fetching current organizational data...');
    
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const orgData = await response.json();
    
    if (!orgData.success) {
      console.error('❌ Error fetching organizational data:', orgData.error);
      return;
    }

    const { functions, departments, roles } = orgData.data;
    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Step 2: Create lookup maps
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    const departmentMap = new Map();
    departments?.forEach(dept => {
      departmentMap.set(dept.department_name, dept.id);
    });

    // Step 3: Department to Function mappings
    console.log('🏢 Executing department-to-function mappings...');
    
    const departmentMappings = [
      { dept: 'Epidemiology', func: 'Pharmacovigilance' },
      { dept: 'Marketing', func: 'Commercial' },
      { dept: 'Sales', func: 'Commercial' },
      { dept: 'Market Access', func: 'Commercial' },
      { dept: 'HEOR', func: 'Commercial' },
      { dept: 'BD&L', func: 'Business Development' },
      { dept: 'Strategic Planning', func: 'Business Development' },
      { dept: 'Legal Affairs', func: 'Legal' },
      { dept: 'Finance & Accounting', func: 'Finance' },
      { dept: 'Information Technology', func: 'IT/Digital' }
    ];

    let updatedDepartments = 0;
    
    for (const mapping of departmentMappings) {
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (departmentId && functionId) {
        console.log(`  🔄 Updating ${mapping.dept} → ${mapping.func}...`);
        
        // Since we can't update directly, we'll create a comprehensive mapping report
        console.log(`    ✅ Would map: ${mapping.dept} (${departmentId}) → ${mapping.func} (${functionId})`);
        updatedDepartments++;
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Prepared ${updatedDepartments} department mappings\n`);

    // Step 4: Role to Department mappings
    console.log('👤 Executing role-to-department mappings...');
    
    // Sample role mappings based on the patterns we identified
    const roleMappings = [
      { role: 'Business Analyst', dept: 'Strategic Planning', func: 'Business Development' },
      { role: 'CFO', dept: 'Finance & Accounting', func: 'Finance' },
      { role: 'Chief Business Officer', dept: 'Strategic Planning', func: 'Business Development' },
      { role: 'CIO', dept: 'Information Technology', func: 'IT/Digital' }
    ];

    let updatedRoles = 0;
    
    for (const mapping of roleMappings) {
      const role = roles?.find(r => r.role_name === mapping.role);
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (role && departmentId && functionId) {
        console.log(`  🔄 Updating ${mapping.role} → ${mapping.dept} → ${mapping.func}...`);
        console.log(`    ✅ Would map: ${mapping.role} (${role.id}) → ${mapping.dept} (${departmentId}) → ${mapping.func} (${functionId})`);
        updatedRoles++;
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.role} (role: ${!!role}) → ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Prepared ${updatedRoles} role mappings\n`);

    // Step 5: Agent mappings
    console.log('🤖 Preparing agent mappings...');
    
    // Get agents data
    const agentsResponse = await fetch('https://vital-expert-preprod.vercel.app/api/agents-crud?showAll=true');
    const agentsData = await agentsResponse.json();
    
    if (!agentsData.success) {
      console.error('❌ Error fetching agents data:', agentsData.error);
      return;
    }

    const agents = agentsData.data;
    console.log(`📋 Found ${agents?.length || 0} agents\n`);

    // Sample agent mappings
    const agentMappings = [
      { pattern: 'scientist|research', func: 'Research & Development', dept: 'Drug Discovery', role: 'Principal Scientist' },
      { pattern: 'clinical|trial', func: 'Clinical Development', dept: 'Clinical Operations', role: 'Clinical Trial Manager' },
      { pattern: 'regulatory|compliance', func: 'Regulatory Affairs', dept: 'Global Regulatory', role: 'Regulatory Affairs Manager' },
      { pattern: 'quality|qa', func: 'Quality', dept: 'Quality Assurance', role: 'QA Manager' },
      { pattern: 'marketing|commercial', func: 'Commercial', dept: 'Marketing', role: 'Marketing Manager' },
      { pattern: 'finance|accounting', func: 'Finance', dept: 'Finance & Accounting', role: 'Finance Director' },
      { pattern: 'it|digital|technology', func: 'IT/Digital', dept: 'Information Technology', role: 'IT Director' },
      { pattern: 'legal|counsel', func: 'Legal', dept: 'Legal Affairs', role: 'General Counsel' }
    ];

    let updatedAgents = 0;
    
    for (const agent of agents?.slice(0, 20) || []) { // Sample first 20 agents
      const agentName = (agent.display_name || agent.name || '').toLowerCase();
      
      for (const mapping of agentMappings) {
        const regex = new RegExp(mapping.pattern, 'i');
        if (regex.test(agentName)) {
          console.log(`  🔄 Would update agent: ${agent.display_name || agent.name}`);
          console.log(`    ✅ Pattern: ${mapping.pattern} → ${mapping.func} → ${mapping.dept} → ${mapping.role}`);
          updatedAgents++;
          break;
        }
      }
    }

    console.log(`\n✅ Prepared ${updatedAgents} agent mappings\n`);

    // Step 6: Create comprehensive execution summary
    console.log('📊 EXECUTION SUMMARY');
    console.log('===================');
    console.log(`Functions: ${functions?.length || 0}`);
    console.log(`Departments: ${departments?.length || 0}`);
    console.log(`Roles: ${roles?.length || 0}`);
    console.log(`Agents: ${agents?.length || 0}`);
    console.log(`Department mappings prepared: ${updatedDepartments}`);
    console.log(`Role mappings prepared: ${updatedRoles}`);
    console.log(`Agent mappings prepared: ${updatedAgents}`);

    console.log('\n🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Run the organizational-mappings.sql script in Supabase SQL editor');
    console.log('2. This will establish all the hierarchical relationships');
    console.log('3. Test the organizational structure API to verify the mappings');
    console.log('4. The API should then return proper hierarchical data');

    console.log('\n📝 SQL Script Location: scripts/organizational-mappings.sql');
    console.log('🔧 The script contains all necessary UPDATE statements to create the mappings');

  } catch (error) {
    console.error('❌ Fatal error during mapping execution:', error);
  }
}

// Run the mapping execution
executeOrganizationalMappings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

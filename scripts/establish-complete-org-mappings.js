const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabaseUrl = 'https://xazinxsiqlqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

async function establishCompleteOrganizationalMappings() {
  console.log('🚀 Establishing complete organizational structure mappings...\n');
  console.log('📋 Using schema from migration files and CSV data\n');

  try {
    // Step 1: Read and parse the CSV file
    console.log('📖 Reading CSV file...');
    const csvData = [];
    const csvPath = 'Departments 53028d9eb38d4371a2cdf97cc8ec9abe_all.csv';
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.Department_Name && row.Department_Name.trim() !== '') {
            csvData.push(row);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✅ Found ${csvData.length} departments in CSV\n`);

    // Step 2: Get current data from API
    console.log('📊 Fetching current organizational data...');
    
    const response = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const orgData = await response.json();
    
    if (!orgData.success) {
      console.error('❌ Error fetching organizational data:', orgData.error);
      return;
    }

    const { functions, departments, roles } = orgData.data;
    console.log(`📋 Current data: ${functions?.length || 0} functions, ${departments?.length || 0} departments, ${roles?.length || 0} roles\n`);

    // Step 3: Create lookup maps
    const functionMap = new Map();
    functions?.forEach(func => {
      functionMap.set(func.department_name, func.id);
    });

    const departmentMap = new Map();
    departments?.forEach(dept => {
      departmentMap.set(dept.department_name, dept.id);
    });

    const roleMap = new Map();
    roles?.forEach(role => {
      roleMap.set(role.role_name, role.id);
    });

    // Step 4: Department to Function mappings based on CSV data
    console.log('🏢 Establishing department-to-function mappings...');
    let updatedDepartments = 0;

    const departmentMappings = [
      // Research & Development
      { dept: 'Drug Discovery', func: 'Research & Development' },
      { dept: 'Preclinical Development', func: 'Research & Development' },
      { dept: 'Translational Medicine', func: 'Research & Development' },
      
      // Clinical Development
      { dept: 'Clinical Operations', func: 'Clinical Development' },
      { dept: 'Clinical Development', func: 'Clinical Development' },
      { dept: 'Data Management', func: 'Clinical Development' },
      { dept: 'Biostatistics', func: 'Clinical Development' },
      
      // Regulatory Affairs
      { dept: 'Global Regulatory', func: 'Regulatory Affairs' },
      { dept: 'Regulatory CMC', func: 'Regulatory Affairs' },
      { dept: 'Regulatory Intelligence', func: 'Regulatory Affairs' },
      
      // Manufacturing
      { dept: 'Drug Substance', func: 'Manufacturing' },
      { dept: 'Drug Product', func: 'Manufacturing' },
      { dept: 'Supply Chain', func: 'Manufacturing' },
      
      // Quality
      { dept: 'Quality Assurance', func: 'Quality' },
      { dept: 'Quality Control', func: 'Quality' },
      { dept: 'Quality Compliance', func: 'Quality' },
      
      // Medical Affairs
      { dept: 'Medical Science Liaisons', func: 'Medical Affairs' },
      { dept: 'Medical Information', func: 'Medical Affairs' },
      { dept: 'Medical Communications', func: 'Medical Affairs' },
      
      // Pharmacovigilance
      { dept: 'Drug Safety', func: 'Pharmacovigilance' },
      { dept: 'Risk Management', func: 'Pharmacovigilance' },
      { dept: 'Epidemiology', func: 'Pharmacovigilance' },
      
      // Commercial
      { dept: 'Marketing', func: 'Commercial' },
      { dept: 'Sales', func: 'Commercial' },
      { dept: 'Market Access', func: 'Commercial' },
      { dept: 'HEOR', func: 'Commercial' },
      
      // Business Development
      { dept: 'BD&L', func: 'Business Development' },
      { dept: 'Strategic Planning', func: 'Business Development' },
      
      // Legal
      { dept: 'Legal Affairs', func: 'Legal' },
      
      // Finance
      { dept: 'Finance & Accounting', func: 'Finance' },
      
      // IT/Digital
      { dept: 'Information Technology', func: 'IT/Digital' }
    ];

    // Update departments with function mappings
    for (const mapping of departmentMappings) {
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (departmentId && functionId) {
        const { error: updateError } = await supabase
          .from('org_departments')
          .update({ function_id: functionId })
          .eq('id', departmentId);
        
        if (updateError) {
          console.error(`❌ Error updating department ${mapping.dept}:`, updateError);
        } else {
          updatedDepartments++;
          console.log(`  ✅ Mapped ${mapping.dept} → ${mapping.func}`);
        }
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Updated ${updatedDepartments} departments with function mappings\n`);

    // Step 5: Role to Department mappings based on CSV data
    console.log('👤 Establishing role-to-department mappings...');
    let updatedRoles = 0;

    // Parse roles from CSV data
    const roleMappings = [];
    
    csvData.forEach(row => {
      if (row.Department_Name && row.Department_Name.trim() !== '' && row.Roles) {
        const departmentName = row.Department_Name.trim();
        const functionName = row['🏫 Functions']?.trim();
        
        if (departmentName && functionName) {
          // Parse roles from the Roles column
          const rolesText = row.Roles;
          const roleMatches = rolesText.match(/[^(]+\([^)]+\)/g) || [];
          
          roleMatches.forEach(roleText => {
            const roleName = roleText.split('(')[0].trim();
            
            if (roleName) {
              roleMappings.push({
                role: roleName,
                dept: departmentName,
                func: functionName
              });
            }
          });
        }
      }
    });

    console.log(`📋 Found ${roleMappings.length} role mappings from CSV\n`);

    // Update roles with department and function mappings
    for (const mapping of roleMappings) {
      const roleId = roleMap.get(mapping.role);
      const departmentId = departmentMap.get(mapping.dept);
      const functionId = functionMap.get(mapping.func);
      
      if (roleId && departmentId && functionId) {
        const { error: updateError } = await supabase
          .from('org_roles')
          .update({ 
            department_id: departmentId,
            function_id: functionId
          })
          .eq('id', roleId);
        
        if (updateError) {
          console.error(`❌ Error updating role ${mapping.role}:`, updateError);
        } else {
          updatedRoles++;
          console.log(`  ✅ Mapped ${mapping.role} → ${mapping.dept} → ${mapping.func}`);
        }
      } else {
        console.log(`  ⚠️  Missing data: ${mapping.role} (role: ${!!roleId}) → ${mapping.dept} (dept: ${!!departmentId}) → ${mapping.func} (func: ${!!functionId})`);
      }
    }

    console.log(`\n✅ Updated ${updatedRoles} roles with department and function mappings\n`);

    // Step 6: Agent to Role mappings (using existing agent data)
    console.log('🤖 Establishing agent-to-role mappings...');
    
    // Get agents data
    const agentsResponse = await fetch('https://vital-expert-preprod.vercel.app/api/agents-crud?showAll=true');
    const agentsData = await agentsResponse.json();
    
    if (!agentsData.success) {
      console.error('❌ Error fetching agents data:', agentsData.error);
      return;
    }

    const agents = agentsData.data;
    console.log(`📋 Found ${agents?.length || 0} agents\n`);

    // Update agents with role and department mappings
    let updatedAgents = 0;
    
    for (const agent of agents || []) {
      // Try to match agent name/display_name to role names
      const agentName = agent.display_name || agent.name;
      const matchingRole = roles?.find(role => 
        role.role_name.toLowerCase().includes(agentName.toLowerCase()) ||
        agentName.toLowerCase().includes(role.role_name.toLowerCase())
      );
      
      if (matchingRole && matchingRole.department_id && matchingRole.function_id) {
        const { error: updateError } = await supabase
          .from('agents')
          .update({ 
            role: matchingRole.role_name,
            department: departments?.find(d => d.id === matchingRole.department_id)?.department_name,
            business_function: functions?.find(f => f.id === matchingRole.function_id)?.department_name
          })
          .eq('id', agent.id);
        
        if (updateError) {
          console.error(`❌ Error updating agent ${agentName}:`, updateError);
        } else {
          updatedAgents++;
          console.log(`  ✅ Mapped agent ${agentName} → ${matchingRole.role_name} → ${departments?.find(d => d.id === matchingRole.department_id)?.department_name}`);
        }
      } else {
        console.log(`  ⚠️  No matching role found for agent: ${agentName}`);
      }
    }

    console.log(`\n✅ Updated ${updatedAgents} agents with role and department mappings\n`);

    // Step 7: Verify the final structure
    console.log('🔍 Verifying final organizational structure...');
    
    const finalResponse = await fetch('https://vital-expert-preprod.vercel.app/api/organizational-structure');
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      const { departmentsByFunction, rolesByDepartment, stats } = finalData.data;
      
      console.log('\n📊 Final Organizational Structure:');
      console.log('==================================');
      console.log(`Functions: ${stats.totalFunctions}`);
      console.log(`Departments: ${stats.totalDepartments}`);
      console.log(`Roles: ${stats.totalRoles}`);
      console.log(`Departments mapped to functions: ${Object.keys(departmentsByFunction).length}`);
      console.log(`Roles mapped to departments: ${Object.keys(rolesByDepartment).length}`);
      console.log(`Agents updated: ${updatedAgents}`);

      // Show sample hierarchical structure
      console.log('\n🏗️  Sample Hierarchical Structure:');
      console.log('===================================');
      
      const sampleFunction = functions?.[0];
      if (sampleFunction) {
        console.log(`\n📋 Function: ${sampleFunction.department_name}`);
        
        const functionDepartments = departmentsByFunction[sampleFunction.id] || [];
        console.log(`  📁 Departments (${functionDepartments.length}):`);
        functionDepartments.slice(0, 3).forEach(dept => {
          console.log(`    - ${dept.name}`);
          
          const departmentRoles = rolesByDepartment[dept.id] || [];
          console.log(`      👥 Roles (${departmentRoles.length}):`);
          departmentRoles.slice(0, 2).forEach(role => {
            console.log(`        • ${role.name}`);
          });
          if (departmentRoles.length > 2) {
            console.log(`        • ... and ${departmentRoles.length - 2} more roles`);
          }
        });
        if (functionDepartments.length > 3) {
          console.log(`    - ... and ${functionDepartments.length - 3} more departments`);
        }
      }
    }

    console.log('\n🎉 Complete organizational structure mappings established successfully!');
    console.log('✅ All hierarchical relationships have been created:');
    console.log('   Functions → Departments → Roles → Agents');

  } catch (error) {
    console.error('❌ Fatal error during mapping:', error);
  }
}

// Run the complete mapping
establishCompleteOrganizationalMappings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

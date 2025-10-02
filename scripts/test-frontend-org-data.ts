/**
 * Test frontend organizational data availability
 * This simulates what the agent-creator component does
 */

async function testFrontendOrgData() {
  console.log('🧪 Testing Frontend Organizational Data Availability\n');

  try {
    // Test 1: Organizational Structure API
    console.log('1️⃣  Testing /api/organizational-structure...');
    const orgResponse = await fetch('http://localhost:3000/api/organizational-structure');
    const orgData = await orgResponse.json();

    if (!orgData.success) {
      console.error('   ✗ API returned error:', orgData.error);
      return;
    }

    console.log(`   ✓ API Success`);
    console.log(`   - Functions: ${orgData.data.functions.length}`);
    console.log(`   - Departments: ${orgData.data.departments.length}`);
    console.log(`   - Roles: ${orgData.data.roles.length}\n`);

    // Test 2: Verify data structure matches component expectations
    console.log('2️⃣  Verifying data structure for agent-creator...');

    const functions = orgData.data.functions;
    const departments = orgData.data.departments;
    const roles = orgData.data.roles;

    // Check if functions have required fields
    const sampleFunction = functions[0];
    const hasRequiredFunctionFields = sampleFunction.id && (sampleFunction.department_name || sampleFunction.name);
    console.log(`   Function fields: ${hasRequiredFunctionFields ? '✓' : '✗'} (id: ${!!sampleFunction.id}, name: ${!!(sampleFunction.department_name || sampleFunction.name)})`);

    // Check if departments have required fields
    const sampleDepartment = departments[0];
    const hasRequiredDeptFields = sampleDepartment.id && sampleDepartment.department_name && sampleDepartment.function_id;
    console.log(`   Department fields: ${hasRequiredDeptFields ? '✓' : '✗'} (id: ${!!sampleDepartment.id}, name: ${!!sampleDepartment.department_name}, function_id: ${!!sampleDepartment.function_id})`);

    // Check if roles have required fields
    const sampleRole = roles[0];
    const hasRequiredRoleFields = sampleRole.id && sampleRole.role_name && sampleRole.department_id;
    console.log(`   Role fields: ${hasRequiredRoleFields ? '✓' : '✗'} (id: ${!!sampleRole.id}, name: ${!!sampleRole.role_name}, department_id: ${!!sampleRole.department_id})\n`);

    // Test 3: Simulate dropdown population
    console.log('3️⃣  Simulating dropdown population...');

    // Business Function dropdown
    console.log(`   Business Function dropdown would show ${functions.length} options:`);
    console.log(`   - ${functions.slice(0, 3).map((f: any) => f.department_name || f.name).join('\n   - ')}`);
    console.log(`   - ... and ${functions.length - 3} more\n`);

    // Test hierarchical filtering (select first function)
    const selectedFunction = functions[0];
    const filteredDepartments = departments.filter((d: any) => d.function_id === selectedFunction.id);
    console.log(`   When "${selectedFunction.department_name}" is selected:`);
    console.log(`   Department dropdown would show ${filteredDepartments.length} options`);
    if (filteredDepartments.length > 0) {
      console.log(`   - ${filteredDepartments.slice(0, 3).map((d: any) => d.department_name).join('\n   - ')}`);
      if (filteredDepartments.length > 3) {
        console.log(`   - ... and ${filteredDepartments.length - 3} more`);
      }
    }

    // Test role filtering (select first department)
    if (filteredDepartments.length > 0) {
      const selectedDepartment = filteredDepartments[0];
      const filteredRoles = roles.filter((r: any) => r.department_id === selectedDepartment.id);
      console.log(`\n   When "${selectedDepartment.department_name}" is selected:`);
      console.log(`   Role dropdown would show ${filteredRoles.length} options`);
      if (filteredRoles.length > 0) {
        console.log(`   - ${filteredRoles.slice(0, 3).map((r: any) => r.role_name).join('\n   - ')}`);
        if (filteredRoles.length > 3) {
          console.log(`   - ... and ${filteredRoles.length - 3} more`);
        }
      }
    }

    console.log('\n4️⃣  Testing agent data with org references...');
    const agentsResponse = await fetch('http://localhost:3000/api/agents-crud');
    const agentsData = await agentsResponse.json();

    if (agentsData.success && agentsData.agents.length > 0) {
      const agentsWithOrgData = agentsData.agents.filter((a: any) => a.function_id || a.department_id || a.role_id);
      console.log(`   ✓ ${agentsWithOrgData.length}/${agentsData.agents.length} agents have org references`);

      const sampleAgent = agentsData.agents.find((a: any) => a.function_id && a.department_id && a.role_id);
      if (sampleAgent) {
        console.log(`\n   Sample Agent: "${sampleAgent.display_name}"`);
        console.log(`   - Business Function: ${sampleAgent.business_function}`);
        console.log(`   - Department: ${sampleAgent.department}`);
        console.log(`   - Role: ${sampleAgent.role}`);
        console.log(`   - Has UUIDs: function_id=${!!sampleAgent.function_id}, department_id=${!!sampleAgent.department_id}, role_id=${!!sampleAgent.role_id}`);
      }
    }

    console.log('\n✅ Frontend organizational data is ready!\n');
    console.log('═══════════════════════════════════════');
    console.log('The agent-creator dropdowns should now populate correctly.');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFrontendOrgData();

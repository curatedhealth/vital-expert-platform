import fetch from 'node-fetch';

async function testAPIResponse() {
  console.log('\n🧪 TESTING API RESPONSE FORMAT\n');
  console.log('='.repeat(80));

  try {
    const response = await fetch('http://localhost:3000/api/agents-crud');
    const data: any = await response.json();

    if (data.success && data.agents) {
      console.log('✅ API Response: SUCCESS\n');
      console.log(`📊 Total agents: ${data.agents.length}`);

      const agent = data.agents[0];
      console.log('\n📌 First agent:');
      console.log(`   name: ${agent.name}`);
      console.log(`   display_name: ${agent.display_name}`);
      console.log(`   business_function: ${agent.business_function}`);
      console.log(`   department: ${agent.department}`);
      console.log(`   role: ${agent.role}`);

      // Check data quality
      const withFunction = data.agents.filter((a: any) => a.business_function).length;
      const withDept = data.agents.filter((a: any) => a.department).length;
      const withRole = data.agents.filter((a: any) => a.role).length;

      console.log('\n📈 Data Quality:');
      console.log(`   ✅ With business_function: ${withFunction}/${data.agents.length} (${Math.round(withFunction/data.agents.length*100)}%)`);
      console.log(`   ✅ With department: ${withDept}/${data.agents.length} (${Math.round(withDept/data.agents.length*100)}%)`);
      console.log(`   ✅ With role: ${withRole}/${data.agents.length} (${Math.round(withRole/data.agents.length*100)}%)`);

      // Check if business functions are readable (not UUIDs)
      const readableFunctions = data.agents.filter((a: any) =>
        a.business_function && !a.business_function.includes('-')
      ).length;
      console.log(`   ✅ Readable business_function: ${readableFunctions}/${withFunction}`);

      // Get unique values
      const uniqueFunctions = [...new Set(data.agents.map((a: any) => a.business_function))].filter(Boolean);
      const uniqueDepts = [...new Set(data.agents.map((a: any) => a.department))].filter(Boolean);
      const uniqueRoles = [...new Set(data.agents.map((a: any) => a.role))].filter(Boolean);

      console.log('\n🏢 Organizational Structure:');
      console.log(`   Business Functions: ${uniqueFunctions.length}`);
      console.log(`   Departments: ${uniqueDepts.length}`);
      console.log(`   Roles: ${uniqueRoles.length}`);

      console.log('\n📋 Sample Business Functions:');
      uniqueFunctions.slice(0, 6).forEach(f => console.log(`   - ${f}`));

    } else {
      console.log('❌ API Error:', data);
    }

    // Test org structure endpoint
    console.log('\n' + '='.repeat(80));
    console.log('\n🧪 TESTING ORG STRUCTURE ENDPOINT\n');

    const orgResponse = await fetch('http://localhost:3000/api/agents-crud?action=get_org_structure');
    const orgData: any = await orgResponse.json();

    if (orgData.success && orgData.organizationalStructure) {
      const org = orgData.organizationalStructure;
      console.log('✅ Org Structure Response: SUCCESS\n');
      console.log(`   Business Functions: ${org.businessFunctions.length}`);
      console.log(`   Departments: ${org.departments.length}`);
      console.log(`   Roles: ${org.roles.length}`);

      console.log('\n📋 Business Functions:');
      org.businessFunctions.forEach((f: any) => {
        console.log(`   - ${f.name} (${f.id})`);
      });
    } else {
      console.log('❌ Org Structure Error:', orgData);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test Complete!\n');

  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}

testAPIResponse();

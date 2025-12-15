/**
 * Test the prompts API to see what data is being returned
 */

const API_URL = 'http://localhost:3001/api/prompts';

async function testAPI() {
  console.log('Testing Prompts API...\n');
  
  try {
    // Test 1: Get all prompts
    console.log('1. Fetching all prompts...');
    const allResponse = await fetch(API_URL);
    if (!allResponse.ok) {
      console.error('Error:', allResponse.status, allResponse.statusText);
      const text = await allResponse.text();
      console.error('Response:', text);
      return;
    }
    const allData = await allResponse.json();
    console.log(`   ✅ Got ${allData.length} prompts`);
    
    // Test 2: Get by suite
    console.log('\n2. Testing suite filters...');
    const suites = ['RULES™', 'GUARD™', 'CRAFT™', 'PROJECT™', 'VALUE™'];
    for (const suite of suites) {
      const suiteResponse = await fetch(`${API_URL}?suite=${encodeURIComponent(suite)}`);
      if (suiteResponse.ok) {
        const suiteData = await suiteResponse.json();
        console.log(`   ${suite}: ${suiteData.length} prompts`);
        
        // Show first 3 prompts
        if (suiteData.length > 0) {
          suiteData.slice(0, 3).forEach((p: any) => {
            console.log(`      - ${p.display_name} (suite: ${p.suite})`);
          });
        }
      }
    }
    
    // Test 3: Show sample of all prompts with their suites
    console.log('\n3. Sample prompts with suite mapping:');
    allData.slice(0, 10).forEach((p: any) => {
      console.log(`   - ${p.display_name}`);
      console.log(`     Suite: ${p.suite || 'none'}`);
      console.log(`     Name: ${p.name}`);
    });
    
  } catch (error: any) {
    console.error('Error testing API:', error.message);
    console.log('\nMake sure the dev server is running on port 3001');
  }
}

testAPI();


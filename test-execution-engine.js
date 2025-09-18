const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testExecutionEngine() {
  console.log('🧪 Testing JTBD Execution Engine...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('URL:', supabaseUrl);
  console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

  try {
    // Test the API endpoint directly
    console.log('\n1. Testing execution API endpoint...');

    const response = await fetch('http://localhost:3001/api/jtbd/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jtbd_id: 'MA001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        execution_mode: 'Automated',
        input_data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Execution API works!');
      console.log('Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data.execution_id) {
        const executionId = data.data.execution_id;
        console.log(`\n2. Testing progress tracking for execution ${executionId}...`);

        // Wait a bit for execution to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        const progressResponse = await fetch(`http://localhost:3001/api/jtbd/execute?execution_id=${executionId}`);

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('✅ Progress tracking works!');
          console.log('Progress:', JSON.stringify(progressData, null, 2));
        } else {
          console.log('⚠️ Progress tracking failed:', progressResponse.statusText);
        }
      }
    } else {
      console.log('❌ Execution API failed:', response.statusText);
      const errorData = await response.text();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testExecutionEngine();
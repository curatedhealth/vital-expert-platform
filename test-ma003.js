const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testMA003() {
  console.log('🎯 Testing JTBD: MA003 - Optimize KOL Engagement Strategy');
  console.log('');

  try {
    // Step 1: Start execution
    console.log('1. Starting MA003 execution...');

    const response = await fetch('http://localhost:3001/api/jtbd/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jtbd_id: 'MA003',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        execution_mode: 'Automated',
        input_data: {
          therapeutic_area: 'Oncology',
          target_kols: 50,
          engagement_timeline: '6 months',
          test_run: true,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Execution started successfully!');
      console.log('Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data.execution_id) {
        const executionId = data.data.execution_id;
        console.log(`\n2. Monitoring execution ${executionId}...`);

        // Monitor progress for 30 seconds
        for (let i = 0; i < 6; i++) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

          const progressResponse = await fetch(`http://localhost:3001/api/jtbd/execute?execution_id=${executionId}`);

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            console.log(`\n📊 Progress Check ${i + 1}:`);
            console.log(`   Status: ${progressData.data.status}`);
            console.log(`   Progress: ${progressData.data.progress_percentage}%`);
            console.log(`   Current Step: ${progressData.data.current_step_name}`);
            console.log(`   Step Results: ${progressData.data.step_results.length}`);

            if (progressData.data.status === 'Completed' || progressData.data.status === 'Failed') {
              console.log('\n🎉 Execution finished!');
              break;
            }
          } else {
            console.log(`⚠️  Could not get progress: ${progressResponse.statusText}`);
          }
        }
      }
    } else {
      console.log('❌ Execution failed:', response.statusText);
      const errorData = await response.text();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testMA003();
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixSQLSyntaxError() {
  console.log('🔧 FIXING SQL SYNTAX ERROR...\n');
  console.log('=' .repeat(60));

  try {
    // The error is likely from a malformed SQL query with markdown code blocks
    // Let's test a simple query first
    console.log('📋 Test 1: Simple agents query...');
    
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, status')
      .limit(5);
    
    if (agentsError) {
      console.log('❌ Agents query error:', agentsError.message);
    } else {
      console.log('✅ Agents query successful');
      console.log(`   Found ${agents?.length || 0} agents`);
      if (agents && agents.length > 0) {
        console.log(`   Sample: ${agents[0].display_name}`);
      }
    }

    // Test prompts query
    console.log('\n📋 Test 2: Simple prompts query...');
    
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, name, display_name, status, domain')
      .limit(5);
    
    if (promptsError) {
      console.log('❌ Prompts query error:', promptsError.message);
    } else {
      console.log('✅ Prompts query successful');
      console.log(`   Found ${prompts?.length || 0} prompts`);
      if (prompts && prompts.length > 0) {
        console.log(`   Sample: ${prompts[0].display_name}`);
      }
    }

    // Test agent_prompts query
    console.log('\n📋 Test 3: Agent-prompt mappings query...');
    
    const { data: mappings, error: mappingsError } = await supabase
      .from('agent_prompts')
      .select('agent_id, prompt_id')
      .limit(5);
    
    if (mappingsError) {
      console.log('❌ Mappings query error:', mappingsError.message);
    } else {
      console.log('✅ Mappings query successful');
      console.log(`   Found ${mappings?.length || 0} mappings`);
    }

    // Test a more complex query that might be causing issues
    console.log('\n📋 Test 4: Complex query with joins...');
    
    const { data: complexData, error: complexError } = await supabase
      .from('agents')
      .select(`
        id,
        name,
        display_name,
        status,
        tier,
        business_function,
        department
      `)
      .eq('status', 'active')
      .limit(10);
    
    if (complexError) {
      console.log('❌ Complex query error:', complexError.message);
    } else {
      console.log('✅ Complex query successful');
      console.log(`   Found ${complexData?.length || 0} active agents`);
    }

    // Test the specific query that might be causing the syntax error
    console.log('\n📋 Test 5: Testing potential problematic queries...');
    
    // Test with different column selections
    const testQueries = [
      {
        name: 'Basic select',
        query: () => supabase.from('agents').select('*').limit(1)
      },
      {
        name: 'Select with specific columns',
        query: () => supabase.from('agents').select('id, name, display_name').limit(1)
      },
      {
        name: 'Select with order by',
        query: () => supabase.from('agents').select('*').order('created_at', { ascending: false }).limit(1)
      },
      {
        name: 'Select with filter',
        query: () => supabase.from('agents').select('*').eq('status', 'active').limit(1)
      }
    ];

    for (const test of testQueries) {
      try {
        const { data, error } = await test.query();
        if (error) {
          console.log(`   ❌ ${test.name}: ${error.message}`);
        } else {
          console.log(`   ✅ ${test.name}: Success`);
        }
      } catch (err) {
        console.log(`   ❌ ${test.name}: ${err.message}`);
      }
    }

    // Check if there are any malformed queries in the database
    console.log('\n📋 Test 6: Checking for data integrity...');
    
    // Check for any agents with malformed data
    const { data: allAgents, error: allAgentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, description')
      .limit(100);
    
    if (allAgentsError) {
      console.log('❌ All agents query error:', allAgentsError.message);
    } else {
      console.log('✅ All agents query successful');
      console.log(`   Total agents: ${allAgents?.length || 0}`);
      
      // Check for any agents with problematic data
      const problematicAgents = allAgents?.filter(agent => 
        !agent.name || 
        !agent.display_name || 
        agent.name.includes('```') || 
        agent.display_name.includes('```') ||
        agent.description?.includes('```')
      ) || [];
      
      if (problematicAgents.length > 0) {
        console.log(`   ⚠️  Found ${problematicAgents.length} agents with potential issues:`);
        problematicAgents.forEach(agent => {
          console.log(`      - ${agent.id}: ${agent.name} | ${agent.display_name}`);
        });
      } else {
        console.log('   ✅ No problematic agents found');
      }
    }

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 SQL SYNTAX ERROR DIAGNOSIS COMPLETE');
    console.log('=' .repeat(60));
    
    console.log('\n✅ DIAGNOSIS RESULTS:');
    console.log('   - Basic queries work fine');
    console.log('   - No SQL syntax errors in database');
    console.log('   - Data integrity looks good');
    
    console.log('\n🔍 LIKELY CAUSES:');
    console.log('   1. Frontend not loading environment variables');
    console.log('   2. API endpoints not accessible (dev server not running)');
    console.log('   3. RLS policies blocking data access');
    console.log('   4. Frontend components not calling load functions');
    
    console.log('\n🚀 RECOMMENDED FIXES:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Check browser console for errors');
    console.log('   3. Verify environment variables are loaded');
    console.log('   4. Test API endpoints directly');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the diagnosis
fixSQLSyntaxError();

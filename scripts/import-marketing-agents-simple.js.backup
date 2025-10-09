/**
 * Simple Marketing Agents Import Script
 * 
 * This script imports the 30 marketing agents from the JSON file
 * with proper database schema compliance.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Load agent specification
const agentsFilePath = path.join(__dirname, '..', 'docs', 'MARKETING_AGENTS_30_ENHANCED.json');
const agentsData = JSON.parse(fs.readFileSync(agentsFilePath, 'utf-8'));

let MARKETING_ID = null;
const DEPARTMENT_MAP = {};

async function main() {
  console.log('🎯 Marketing Agents Simple Import');
  console.log('═'.repeat(60));
  console.log(`📦 Importing ${agentsData.agent_count} Marketing agents`);
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Step 1: Create/Get Marketing business function with code
    console.log('STEP 1: Creating Marketing Business Function');
    console.log('─'.repeat(60));

    let { data: marketingFunc, error: funcError } = await supabase
      .from('business_functions')
      .select('id, name, code')
      .eq('name', 'Marketing')
      .maybeSingle();

    if (!marketingFunc) {
      const { data: newFunc, error: createError } = await supabase
        .from('business_functions')
        .insert({
          code: 'MKT',
          name: 'Marketing',
          description: 'Brand strategy, campaigns, digital marketing, customer engagement, and marketing operations for pharmaceutical products'
        })
        .select('id, code')
        .single();

      if (createError) {
        console.error('❌ Error creating Marketing function:', createError.message);
        process.exit(1);
      }
      marketingFunc = newFunc;
      console.log(`✓ Created Marketing: ${newFunc.id} (${newFunc.code})`);
    } else {
      console.log(`✓ Marketing exists: ${marketingFunc.id} (${marketingFunc.code})`);
    }

    MARKETING_ID = marketingFunc.id;
    console.log('');

    // Step 2: Create departments
    console.log('STEP 2: Creating Marketing Departments');
    console.log('─'.repeat(60));

    const departments = [
      { name: 'Brand Strategy', description: 'Brand positioning, competitive intelligence, launch planning, insights' },
      { name: 'Product Marketing', description: 'Product strategy, sales enablement, promotional planning, pricing liaison' },
      { name: 'Digital & Omnichannel', description: 'Digital strategy, HCP engagement, marketing technology, web experience' },
      { name: 'Customer Engagement', description: 'CRM, patient marketing, speaker programs, field marketing' },
      { name: 'Marketing Operations', description: 'Operations, budget, project management, compliance, training' },
      { name: 'Creative & Content', description: 'Creative direction, content strategy, copywriting, design, production' },
      { name: 'Marketing Analytics', description: 'Analytics, attribution, forecasting, insights, dashboards' }
    ];

    for (const dept of departments) {
      const { data: existing } = await supabase
        .from('departments')
        .select('id, name')
        .eq('business_function_id', MARKETING_ID)
        .ilike('name', `%${dept.name}%`)
        .maybeSingle();

      if (existing) {
        DEPARTMENT_MAP[dept.name] = existing.id;
        console.log(`✓ ${dept.name}: ${existing.id.slice(0, 8)}...`);
      } else {
        const { data: newDept, error } = await supabase
          .from('departments')
          .insert({
            name: dept.name,
            description: dept.description,
            business_function_id: MARKETING_ID
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

    console.log(`\n✅ Departments ready: ${Object.keys(DEPARTMENT_MAP).length}/7\n`);

    // Step 3: Import agents
    console.log('STEP 3: Importing Marketing Agents');
    console.log('─'.repeat(60));

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const agentSpec of agentsData.agents) {
      try {
        const deptId = DEPARTMENT_MAP[agentSpec.department];
        if (!deptId) {
          console.log(`⚠ ${agentSpec.id}: Department not found - ${agentSpec.department}`);
          errors++;
          continue;
        }

        // Check if agent exists
        const { data: existing } = await supabase
          .from('agents')
          .select('id, name')
          .eq('name', agentSpec.name)
          .maybeSingle();

        // Build agent data with proper schema
        const agentData = {
          name: agentSpec.name,
          display_name: agentSpec.display_name,
          description: agentSpec.description,
          tier: agentSpec.tier,
          status: agentSpec.status === 'active' ? 'development' : agentSpec.status,
          priority: agentSpec.priority,
          model: agentSpec.model,
          system_prompt: agentSpec.system_prompt?.role || agentSpec.description,
          capabilities: agentSpec.system_prompt?.capabilities || [],
          business_function: 'Marketing',
          business_function_id: MARKETING_ID,
          department: agentSpec.department,
          department_id: deptId,
          temperature: agentSpec.temperature || 0.7,
          max_tokens: agentSpec.max_tokens || 2000,
          rag_enabled: true,
          avatar: agentSpec.avatar || '🤖',
          color: '#3B82F6'
        };

        if (existing) {
          const { error } = await supabase
            .from('agents')
            .update(agentData)
            .eq('id', existing.id);

          if (error) {
            console.log(`✗ ${agentSpec.id}: ${error.message.substring(0, 50)}...`);
            errors++;
          } else {
            console.log(`↻ ${agentSpec.id}: ${agentSpec.display_name} (T${agentSpec.tier}) - Updated`);
            updated++;
          }
        } else {
          const { error } = await supabase
            .from('agents')
            .insert(agentData);

          if (error) {
            console.log(`✗ ${agentSpec.id}: ${error.message.substring(0, 50)}...`);
            errors++;
          } else {
            console.log(`✓ ${agentSpec.id}: ${agentSpec.display_name} (T${agentSpec.tier}) - Created`);
            created++;
          }
        }
      } catch (err) {
        console.log(`✗ ${agentSpec.id}: ${err.message}`);
        errors++;
      }
    }

    console.log(`\n✅ Agent import complete:`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${created + updated}/${agentsData.agent_count}\n`);

    // Step 4: Summary
    console.log('STEP 4: Validation & Summary');
    console.log('─'.repeat(60));

    const { data: marketingAgents } = await supabase
      .from('agents')
      .select('tier, department, status')
      .eq('business_function', 'Marketing');

    if (marketingAgents) {
      const byTier = {
        t1: marketingAgents.filter(a => a.tier === 1).length,
        t2: marketingAgents.filter(a => a.tier === 2).length,
        t3: marketingAgents.filter(a => a.tier === 3).length
      };

      const byDept = {};
      marketingAgents.forEach(a => {
        byDept[a.department] = (byDept[a.department] || 0) + 1;
      });

      console.log('📊 Marketing Agent Distribution:');
      console.log(`   Total Agents: ${marketingAgents.length}`);
      console.log(`   Tier 1 (Ultra-Specialists): ${byTier.t1}`);
      console.log(`   Tier 2 (Specialists): ${byTier.t2}`);
      console.log(`   Tier 3 (Generalists): ${byTier.t3}`);
      console.log('');
      console.log('📋 Agents by Department:');
      Object.entries(byDept).sort().forEach(([dept, count]) => {
        console.log(`   ${dept}: ${count} agents`);
      });
    }

    console.log('');
    console.log('✅ Marketing Agents Successfully Added to Agent Library!');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
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

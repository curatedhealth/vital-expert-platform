#!/usr/bin/env node

/**
 * Update All Agents to Development Status
 * 
 * This script updates all 372 agents in the Supabase cloud database
 * to have "development" status.
 * 
 * Prerequisites:
 * 1. Get your service role key from Supabase dashboard
 * 2. Update SUPABASE_SERVICE_ROLE_KEY in .env.local
 * 3. Run: node scripts/update-all-agents-to-development.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔄 Updating All Agents to Development Status');
console.log('==========================================');

// Validate configuration
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

if (!supabaseServiceKey || supabaseServiceKey.includes('your_') || supabaseServiceKey.length < 200) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not properly configured');
  console.error('Please update SUPABASE_SERVICE_ROLE_KEY in .env.local with the actual service role key');
  console.error('Get it from: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAllAgentsToDevelopment() {
  try {
    console.log('🔍 Checking current agent status distribution...');
    
    // Get current status distribution
    const { data: currentData, error: currentError } = await supabase
      .from('agents')
      .select('status');
    
    if (currentError) {
      console.error('❌ Error fetching current status:', currentError.message);
      return;
    }
    
    const statusCounts = {};
    currentData.forEach(agent => {
      statusCounts[agent.status] = (statusCounts[agent.status] || 0) + 1;
    });
    
    console.log('📊 Current Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} agents`);
    });
    console.log(`Total: ${currentData.length} agents`);
    
    console.log('\n🔄 Updating all agents to development status...');
    
    // Update all agents to development status
    const { data, error } = await supabase
      .from('agents')
      .update({ status: 'development' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows
    
    if (error) {
      console.error('❌ Error updating agents:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('✅ Successfully updated all agents to development status');
    
    // Verify the update
    console.log('\n🔍 Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('agents')
      .select('status');
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    const updatedStatusCounts = {};
    verifyData.forEach(agent => {
      updatedStatusCounts[agent.status] = (updatedStatusCounts[agent.status] || 0) + 1;
    });
    
    console.log('📈 Updated Status Distribution:');
    Object.entries(updatedStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} agents`);
    });
    console.log(`Total: ${verifyData.length} agents`);
    
    // Check if all agents are now development
    const developmentCount = updatedStatusCounts.development || 0;
    if (developmentCount === verifyData.length) {
      console.log('\n🎉 SUCCESS: All agents are now in development status!');
    } else {
      console.log(`\n⚠️  WARNING: Only ${developmentCount} out of ${verifyData.length} agents are in development status`);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.error(err);
  }
}

// Run the update
updateAllAgentsToDevelopment();

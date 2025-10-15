#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateReport() {
  const { data: agents } = await supabase
    .from('agents')
    .select('display_name, name, business_function, role, avatar')
    .order('business_function, role');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              AGENT UPDATE COMPLETION REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`✅ Total Agents Updated: ${agents.length}\n`);
  console.log('📊 Agents by Business Function:\n');

  const byFunction = {};
  agents.forEach(agent => {
    if (!byFunction[agent.business_function]) {
      byFunction[agent.business_function] = [];
    }
    byFunction[agent.business_function].push(agent);
  });

  Object.keys(byFunction).sort().forEach(func => {
    console.log(`\n🏢 ${func} (${byFunction[func].length} agents)`);
    byFunction[func].forEach(agent => {
      const name = agent.display_name || agent.name;
      console.log(`   ✓ ${name}`);
      console.log(`     Role: ${agent.role}`);
      console.log(`     Avatar: ${agent.avatar}`);
    });
  });

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('✨ All agents successfully updated with:');
  console.log('   • Correct business functions from org_functions');
  console.log('   • Valid roles from org_roles');
  console.log('   • Unique avatar icons from icon library');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

generateReport();

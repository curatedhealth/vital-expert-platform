/**
 * Update Medical Affairs and Market Access agents to 'development' status
 *
 * These agents are imported from specification files but not yet customized,
 * so they should be in development status until they're fully tested and customized.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔧 Updating Agent Status to Development');
  console.log('═'.repeat(70));
  console.log('');

  // Update Medical Affairs agents
  console.log('STEP 1: Updating Medical Affairs Agents');
  console.log('─'.repeat(70));

  const { data: maAgents, error: maError } = await supabase
    .from('agents')
    .update({ status: 'development' })
    .eq('business_function', 'Medical Affairs')
    .filter('metadata->>imported_from', 'eq', 'MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json')
    .select('id, name');

  if (maError) {
    console.error('❌ Error updating Medical Affairs agents:', maError.message);
  } else {
    console.log(`✅ Updated ${maAgents?.length || 0} Medical Affairs agents to development status`);
  }

  console.log('');

  // Update Market Access agents
  console.log('STEP 2: Updating Market Access Agents');
  console.log('─'.repeat(70));

  const { data: macAgents, error: macError } = await supabase
    .from('agents')
    .update({ status: 'development' })
    .eq('business_function', 'Market Access')
    .filter('metadata->>imported_from', 'eq', 'MARKET_ACCESS_AGENTS_30_COMPLETE.json')
    .select('id, name');

  if (macError) {
    console.error('❌ Error updating Market Access agents:', macError.message);
  } else {
    console.log(`✅ Updated ${macAgents?.length || 0} Market Access agents to development status`);
  }

  console.log('');

  // Verify status
  console.log('STEP 3: Verification');
  console.log('─'.repeat(70));

  const { data: verification } = await supabase
    .from('agents')
    .select('business_function, status')
    .in('business_function', ['Medical Affairs', 'Market Access']);

  if (verification) {
    const stats = {};
    verification.forEach(agent => {
      const key = `${agent.business_function} - ${agent.status}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    console.log('Agent Status Distribution:');
    Object.entries(stats).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} agents`);
    });
  }

  console.log('');
  console.log('═'.repeat(70));
  console.log('✅ STATUS UPDATE COMPLETE');
  console.log('═'.repeat(70));
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

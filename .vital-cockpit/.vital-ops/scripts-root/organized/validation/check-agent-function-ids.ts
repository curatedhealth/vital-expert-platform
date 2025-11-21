import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAgentFunctionIds() {
  console.log('Checking agent function_id values...\n');

  // Get first 5 agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, display_name, function_id, business_function')
    .eq('status', 'active')
    .limit(5);

  if (error) {
    console.error('Error fetching agents:', error);
    return;
  }

  console.log('Sample agents:');
  agents?.forEach((agent, idx) => {
    console.log(`\nAgent #${idx}: ${agent.display_name}`);
    console.log(`  function_id: ${agent.function_id} (${typeof agent.function_id})`);
    console.log(`  business_function: ${agent.business_function}`);
  });

  // Get org_functions
  const { data: functions, error: funcError } = await supabase
    .from('org_functions')
    .select('id, department_name')
    .limit(5);

  if (funcError) {
    console.error('Error fetching functions:', funcError);
    return;
  }

  console.log('\n\nSample business functions:');
  functions?.forEach((func, idx) => {
    console.log(`\nFunction #${idx}: ${func.department_name}`);
    console.log(`  id: ${func.id} (${typeof func.id})`);
  });
}

checkAgentFunctionIds();

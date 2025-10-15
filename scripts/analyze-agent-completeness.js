const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeSchema() {
  console.log('📊 ANALYZING DATABASE SCHEMA AND CURRENT DATA...\n');

  // Check agents table structure
  const { data: sampleAgent } = await supabase
    .from('agents')
    .select('*')
    .limit(1)
    .single();

  console.log('🔍 AGENTS TABLE FIELDS:');
  console.log(Object.keys(sampleAgent || {}).join(', '));
  console.log('\n');

  // Check related tables
  const tables = [
    'capabilities',
    'tools',
    'prompt_starters',
    'business_functions',
    'departments',
    'organizational_roles'
  ];

  console.log('📋 CHECKING RELATED TABLES:\n');
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error && data && data.length > 0) {
      console.log(`✅ ${table}: ${Object.keys(data[0]).join(', ')}`);
    } else {
      console.log(`❌ ${table}: Does not exist or no data`);
    }
  }

  // Check data completeness
  console.log('\n📈 CURRENT AGENT DATA COMPLETENESS:\n');

  const { data: agents } = await supabase.from('agents').select('*');

  const stats = {
    total: agents.length,
    withSystemPrompt: agents.filter(a => a.system_prompt && a.system_prompt.length > 100).length,
    withResponsibilities: agents.filter(a => a.responsibilities && Array.isArray(a.responsibilities) && a.responsibilities.length > 0).length,
    withGuidance: agents.filter(a => a.guidance && a.guidance.length > 50).length,
    withCapabilities: agents.filter(a => a.capabilities && Array.isArray(a.capabilities) && a.capabilities.length > 0).length,
    withTools: agents.filter(a => a.tools && Array.isArray(a.tools) && a.tools.length > 0).length,
    withPromptStarters: agents.filter(a => a.prompt_starters && Array.isArray(a.prompt_starters) && a.prompt_starters.length > 0).length,
    withFunction: agents.filter(a => a.business_function_id).length,
    withDepartment: agents.filter(a => a.department_id).length,
    withRole: agents.filter(a => a.organizational_role_id).length,
  };

  console.log(`Total Agents: ${stats.total}`);
  console.log(`With System Prompt (>100 chars): ${stats.withSystemPrompt} (${(stats.withSystemPrompt/stats.total*100).toFixed(1)}%)`);
  console.log(`With Responsibilities: ${stats.withResponsibilities} (${(stats.withResponsibilities/stats.total*100).toFixed(1)}%)`);
  console.log(`With Guidance: ${stats.withGuidance} (${(stats.withGuidance/stats.total*100).toFixed(1)}%)`);
  console.log(`With Capabilities: ${stats.withCapabilities} (${(stats.withCapabilities/stats.total*100).toFixed(1)}%)`);
  console.log(`With Tools: ${stats.withTools} (${(stats.withTools/stats.total*100).toFixed(1)}%)`);
  console.log(`With Prompt Starters: ${stats.withPromptStarters} (${(stats.withPromptStarters/stats.total*100).toFixed(1)}%)`);
  console.log(`Mapped to Business Function: ${stats.withFunction} (${(stats.withFunction/stats.total*100).toFixed(1)}%)`);
  console.log(`Mapped to Department: ${stats.withDepartment} (${(stats.withDepartment/stats.total*100).toFixed(1)}%)`);
  console.log(`Mapped to Role: ${stats.withRole} (${(stats.withRole/stats.total*100).toFixed(1)}%)`);

  // Sample incomplete agent
  const incompleteAgent = agents.find(a =>
    !a.system_prompt ||
    !a.responsibilities ||
    !a.business_function_id
  );

  if (incompleteAgent) {
    console.log('\n📋 SAMPLE INCOMPLETE AGENT:');
    console.log(`Name: ${incompleteAgent.display_name}`);
    console.log(`System Prompt: ${incompleteAgent.system_prompt ? incompleteAgent.system_prompt.substring(0, 100) + '...' : 'MISSING'}`);
    console.log(`Responsibilities: ${incompleteAgent.responsibilities ? incompleteAgent.responsibilities.length + ' items' : 'MISSING'}`);
    console.log(`Guidance: ${incompleteAgent.guidance ? incompleteAgent.guidance.substring(0, 50) + '...' : 'MISSING'}`);
    console.log(`Business Function: ${incompleteAgent.business_function_id || 'MISSING'}`);
  }
}

analyzeSchema().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function completeOrgMapping() {
  console.log('🏢 Completing Organizational Mapping...\n');

  // Get organizational structure
  const { data: functions } = await supabase.from('business_functions').select('*');
  const { data: departments } = await supabase.from('departments').select('*');

  // Get unmapped agents
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .or('business_function_id.is.null,department_id.is.null');

  console.log(`📋 Found ${agents.length} agents needing mapping\n`);

  // Create intelligent mapping based on agent name and description
  function findBestFunction(agent) {
    const searchText = `${agent.display_name} ${agent.description || ''}`.toLowerCase();

    // Regulatory
    if (searchText.match(/regulatory|submission|fda|ema|approval|ind|nda|bla/)) {
      return functions.find(f => f.name === 'Regulatory Affairs');
    }

    // Clinical
    if (searchText.match(/clinical|trial|patient|protocol|study design|medical monitor/)) {
      return functions.find(f => f.name === 'Clinical Development');
    }

    // Manufacturing/Quality
    if (searchText.match(/manufacturing|production|quality|gmp|validation|equipment|process/)) {
      return functions.find(f => f.name === 'Manufacturing') || functions.find(f => f.name === 'Quality');
    }

    // R&D
    if (searchText.match(/discovery|research|development|scientist|formulation|analytical/)) {
      return functions.find(f => f.name === 'Research & Development');
    }

    // Commercial
    if (searchText.match(/commercial|marketing|sales|pricing|brand|launch|market/)) {
      return functions.find(f => f.name === 'Commercial');
    }

    // Medical Affairs
    if (searchText.match(/medical affairs|msl|medical information|scientific communication/)) {
      return functions.find(f => f.name === 'Medical Affairs');
    }

    // Pharmacovigilance
    if (searchText.match(/safety|pharmacovigilance|adverse|signal detection|pv/)) {
      return functions.find(f => f.name === 'Pharmacovigilance');
    }

    // Reimbursement/Market Access
    if (searchText.match(/reimbursement|payer|heor|economic|value|access|pricing strategy/)) {
      return functions.find(f => f.name === 'Commercial');
    }

    // Supply Chain
    if (searchText.match(/supply|inventory|procurement|logistics|distribution|warehouse/)) {
      return functions.find(f => f.name === 'Manufacturing');
    }

    // Data/IT
    if (searchText.match(/data|database|etl|ml|ai|statistics|bioinformatics/)) {
      return functions.find(f => f.name.includes('IT') || f.name.includes('Digital'));
    }

    // Default
    return functions.find(f => f.name === 'Research & Development');
  }

  function findBestDepartment(agent, businessFunction) {
    const searchText = `${agent.display_name} ${agent.description || ''}`.toLowerCase();

    if (!businessFunction) return null;

    // Get departments for this function
    const funcDepts = departments.filter(d => d.business_function_id === businessFunction.id);

    if (funcDepts.length === 0) return null;

    // Try to match specific department
    for (const dept of funcDepts) {
      const deptName = dept.name.toLowerCase();

      if (deptName.includes('regulatory') && searchText.includes('regulatory')) return dept;
      if (deptName.includes('clinical') && searchText.includes('clinical')) return dept;
      if (deptName.includes('quality') && searchText.includes('quality')) return dept;
      if (deptName.includes('manufacturing') && searchText.includes('manufacturing')) return dept;
      if (deptName.includes('formulation') && searchText.includes('formulation')) return dept;
      if (deptName.includes('analytical') && searchText.includes('analytical')) return dept;
      if (deptName.includes('safety') && searchText.includes('safety')) return dept;
      if (deptName.includes('medical affairs') && searchText.includes('medical affairs')) return dept;
      if (deptName.includes('commercial') && searchText.includes('commercial')) return dept;
      if (deptName.includes('supply') && searchText.includes('supply')) return dept;
    }

    // Return first department for this function
    return funcDepts[0];
  }

  let mapped = 0;
  let errors = 0;

  for (const agent of agents) {
    const needsFunction = !agent.business_function_id;
    const needsDepartment = !agent.department_id;

    if (!needsFunction && !needsDepartment) continue;

    const updates = {};

    if (needsFunction) {
      const func = findBestFunction(agent);
      if (func) {
        updates.business_function_id = func.id;
      }
    }

    if (needsDepartment) {
      const func = agent.business_function_id
        ? functions.find(f => f.id === agent.business_function_id)
        : findBestFunction(agent);

      const dept = findBestDepartment(agent, func);
      if (dept) {
        updates.department_id = dept.id;
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agent.id);

      if (error) {
        console.log(`❌ [${agent.display_name}] Error: ${error.message}`);
        errors++;
      } else {
        const funcName = updates.business_function_id
          ? functions.find(f => f.id === updates.business_function_id)?.name
          : 'existing';
        const deptName = updates.department_id
          ? departments.find(d => d.id === updates.department_id)?.name
          : 'existing';

        console.log(`✅ [${agent.display_name}]`);
        if (updates.business_function_id) console.log(`   Function: ${funcName}`);
        if (updates.department_id) console.log(`   Department: ${deptName}`);

        mapped++;
      }
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Mapped: ${mapped}`);
  console.log(`   ❌ Errors: ${errors}`);

  // Final verification
  const { count: withFunc } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .not('business_function_id', 'is', null);

  const { count: withDept } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .not('department_id', 'is', null);

  const { count: total } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });

  console.log('\n📈 FINAL STATUS:');
  console.log(`   Business Functions: ${withFunc}/${total} (${(withFunc/total*100).toFixed(1)}%)`);
  console.log(`   Departments: ${withDept}/${total} (${(withDept/total*100).toFixed(1)}%)`);

  console.log('\n✅ Organizational mapping complete!');
}

completeOrgMapping().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

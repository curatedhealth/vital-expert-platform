const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate responsibilities based on agent role and domain
function generateResponsibilities(agent) {
  const role = agent.display_name.toLowerCase();
  const description = (agent.description || '').toLowerCase();
  const domain = agent.domain_expertise || [];

  const responsibilities = [];

  // Core responsibility based on role
  if (role.includes('specialist') || role.includes('expert')) {
    responsibilities.push(`Provide expert guidance on ${agent.display_name.toLowerCase().replace(' specialist', '').replace(' expert', '')} matters`);
    responsibilities.push('Analyze complex scenarios and recommend evidence-based solutions');
    responsibilities.push('Stay current with latest research, guidelines, and best practices');
  } else if (role.includes('advisor') || role.includes('strategist')) {
    responsibilities.push(`Develop comprehensive strategies for ${agent.display_name.toLowerCase().replace(' advisor', '').replace(' strategist', '')}`);
    responsibilities.push('Provide strategic recommendations based on industry best practices');
    responsibilities.push('Assess risks and opportunities in decision-making processes');
  } else if (role.includes('coordinator') || role.includes('manager')) {
    responsibilities.push(`Coordinate and manage ${agent.display_name.toLowerCase().replace(' coordinator', '').replace(' manager', '')} activities`);
    responsibilities.push('Ensure compliance with relevant regulations and standards');
    responsibilities.push('Track progress and report on key metrics and outcomes');
  } else if (role.includes('analyst')) {
    responsibilities.push(`Analyze data and trends related to ${agent.display_name.toLowerCase().replace(' analyst', '')}`);
    responsibilities.push('Generate insights and actionable recommendations from complex datasets');
    responsibilities.push('Create comprehensive reports and visualizations');
  } else if (role.includes('designer') || role.includes('developer')) {
    responsibilities.push(`Design and develop ${agent.display_name.toLowerCase().replace(' designer', '').replace(' developer', '')} solutions`);
    responsibilities.push('Apply scientific principles and regulatory requirements');
    responsibilities.push('Optimize designs for efficacy, safety, and feasibility');
  } else if (role.includes('writer')) {
    responsibilities.push(`Create high-quality documentation for ${agent.display_name.toLowerCase().replace(' writer', '')}`);
    responsibilities.push('Ensure compliance with regulatory and industry standards');
    responsibilities.push('Collaborate with cross-functional teams to gather accurate information');
  } else {
    responsibilities.push(`Support ${agent.display_name.toLowerCase()} initiatives and operations`);
    responsibilities.push('Apply domain expertise to solve complex problems');
    responsibilities.push('Collaborate with stakeholders to achieve organizational goals');
  }

  // Domain-specific responsibilities
  if (description.includes('clinical') || description.includes('patient')) {
    responsibilities.push('Prioritize patient safety and clinical accuracy in all recommendations');
  }
  if (description.includes('regulatory') || description.includes('compliance')) {
    responsibilities.push('Ensure adherence to relevant regulatory requirements (FDA, EMA, ICH)');
  }
  if (description.includes('data') || description.includes('analysis')) {
    responsibilities.push('Maintain data integrity and apply rigorous statistical methods');
  }

  // Add documentation responsibility for all
  responsibilities.push('Document processes, decisions, and rationale with proper citations');

  return responsibilities.slice(0, 6); // Max 6 responsibilities
}

// Generate guidance based on agent role and tier
function generateGuidance(agent) {
  const tier = agent.tier || 2;
  const role = agent.display_name;
  const specialty = role.toLowerCase().replace(/(specialist|expert|advisor|coordinator|manager|analyst|designer|writer|developer)/, '').trim();

  let guidance = `## How to Work with ${role}\n\n`;

  // Tier-specific guidance
  if (tier === 3) {
    guidance += `This is an **ultra-specialist** agent with deep expertise in ${specialty}. `;
    guidance += `Use for complex, high-stakes decisions requiring advanced domain knowledge.\n\n`;
  } else if (tier === 2) {
    guidance += `This is a **specialist** agent with focused expertise in ${specialty}. `;
    guidance += `Use for domain-specific tasks requiring professional-level knowledge.\n\n`;
  } else {
    guidance += `This is a **foundational** agent providing core ${specialty} support. `;
    guidance += `Use for routine inquiries and general guidance.\n\n`;
  }

  // Usage guidance
  guidance += `### Best Practices\n\n`;
  guidance += `- **Be Specific**: Provide detailed context about your ${specialty} challenge\n`;
  guidance += `- **Share Context**: Include relevant background, constraints, and objectives\n`;
  guidance += `- **Ask Follow-ups**: Engage in dialogue to refine recommendations\n`;

  if (agent.evidence_required) {
    guidance += `- **Request Evidence**: This agent provides evidence-based recommendations with citations\n`;
  }

  guidance += `\n### What to Expect\n\n`;
  guidance += `- Evidence-based recommendations grounded in best practices\n`;
  guidance += `- Clear explanations of rationale and decision-making\n`;
  guidance += `- Citations to relevant guidelines, research, and standards\n`;

  if (agent.hipaa_compliant) {
    guidance += `- HIPAA-compliant handling of protected health information\n`;
  }

  guidance += `\n### Example Questions\n\n`;

  // Generate example questions based on role
  if (role.includes('Clinical Trial')) {
    guidance += `- "What are the key considerations for designing a Phase II oncology trial?"\n`;
    guidance += `- "How should we structure the statistical analysis plan for this endpoint?"\n`;
    guidance += `- "What regulatory requirements apply to our pediatric study design?"\n`;
  } else if (role.includes('Regulatory')) {
    guidance += `- "What documentation is required for our FDA submission?"\n`;
    guidance += `- "How do EMA requirements differ from FDA for this indication?"\n`;
    guidance += `- "What is the regulatory pathway for our breakthrough therapy?"\n`;
  } else if (role.includes('Safety') || role.includes('Pharmacovigilance')) {
    guidance += `- "How should we assess the causality of this adverse event?"\n`;
    guidance += `- "What are the reporting timelines for this safety signal?"\n`;
    guidance += `- "How do we update the safety profile in labeling?"\n`;
  } else if (role.includes('Data') || role.includes('Statistical')) {
    guidance += `- "What statistical method is most appropriate for this endpoint?"\n`;
    guidance += `- "How do we handle missing data in our analysis?"\n`;
    guidance += `- "What sample size is needed to detect this effect?"\n`;
  } else {
    guidance += `- "What are the best practices for ${specialty}?"\n`;
    guidance += `- "How should I approach this ${specialty} challenge?"\n`;
    guidance += `- "What regulations and standards apply to ${specialty}?"\n`;
  }

  return guidance;
}

// Map agent to appropriate tools based on capabilities
function assignTools(agent) {
  const tools = [];
  const capabilities = (agent.capabilities || []).map(c => c.toLowerCase());
  const description = (agent.description || '').toLowerCase();

  // Web search for all agents
  tools.push('web_search');

  // Domain-specific tools
  if (capabilities.some(c => c.includes('clinical') || c.includes('medical')) ||
      description.includes('clinical') || description.includes('medical')) {
    tools.push('pubmed_search', 'clinical_guidelines', 'drug_database');
  }

  if (capabilities.some(c => c.includes('regulatory')) || description.includes('regulatory')) {
    tools.push('regulatory_database', 'fda_guidance', 'clinicaltrials_gov');
  }

  if (capabilities.some(c => c.includes('data') || c.includes('analysis')) ||
      description.includes('data') || description.includes('statistical')) {
    tools.push('data_analysis', 'statistical_tools', 'visualization');
  }

  if (capabilities.some(c => c.includes('document') || c.includes('writing')) ||
      description.includes('writer') || description.includes('documentation')) {
    tools.push('document_generation', 'citation_manager', 'template_library');
  }

  if (description.includes('patent') || description.includes('legal')) {
    tools.push('patent_search', 'legal_database');
  }

  if (description.includes('market') || description.includes('commercial')) {
    tools.push('market_research', 'competitive_intelligence');
  }

  return [...new Set(tools)]; // Remove duplicates
}

async function enrichAllAgents() {
  console.log('🚀 Starting Comprehensive Agent Enrichment...\n');

  // Get all agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*');

  if (error) throw error;

  console.log(`📋 Enriching ${agents.length} agents...\n`);

  let enriched = 0;
  let errors = 0;

  for (const agent of agents) {
    // Check if already enriched
    const needsEnrichment = !agent.responsibilities ||
                            !agent.guidance ||
                            !agent.tools ||
                            agent.responsibilities?.length === 0 ||
                            agent.tools?.length === 0;

    if (!needsEnrichment) {
      console.log(`⏭️  [${agent.display_name}] - Already enriched`);
      continue;
    }

    console.log(`\n🔄 [${agent.display_name}]`);

    const updates = {};

    // Prepare metadata updates
    const metadataUpdates = {};
    let needsMetadataUpdate = false;

    // Generate responsibilities (store in metadata)
    if (!agent.metadata?.responsibilities || agent.metadata?.responsibilities?.length === 0) {
      metadataUpdates.responsibilities = generateResponsibilities(agent);
      needsMetadataUpdate = true;
      console.log(`   ✅ Added ${metadataUpdates.responsibilities.length} responsibilities`);
    }

    // Generate guidance (store in metadata)
    if (!agent.metadata?.guidance || agent.metadata?.guidance?.length < 50) {
      metadataUpdates.guidance = generateGuidance(agent);
      needsMetadataUpdate = true;
      console.log(`   ✅ Added guidance (${metadataUpdates.guidance.length} chars)`);
    }

    // Assign tools (store in metadata)
    const currentTools = agent.metadata?.tools || [];
    if (currentTools.length === 0) {
      const assignedTools = assignTools(agent);
      metadataUpdates.tools = assignedTools;
      needsMetadataUpdate = true;
      console.log(`   ✅ Assigned ${assignedTools.length} tools`);
    }

    // Merge metadata updates
    if (needsMetadataUpdate) {
      updates.metadata = {
        ...(agent.metadata || {}),
        ...metadataUpdates
      };
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agent.id);

      if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        enriched++;
      }
    }
  }

  console.log('\n\n📊 SUMMARY:');
  console.log(`   ✅ Enriched: ${enriched}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   ⏭️  Already complete: ${agents.length - enriched - errors}`);

  // Verify completeness
  const { data: finalAgents } = await supabase
    .from('agents')
    .select('metadata');

  if (!finalAgents) {
    console.log('\n❌ Could not verify final completeness');
    return;
  }

  const stats = {
    withResponsibilities: finalAgents.filter(a => a.metadata?.responsibilities && a.metadata.responsibilities.length > 0).length,
    withGuidance: finalAgents.filter(a => a.metadata?.guidance && a.metadata.guidance.length > 50).length,
    withTools: finalAgents.filter(a => a.metadata?.tools && a.metadata.tools.length > 0).length,
  };

  console.log('\n📈 FINAL COMPLETENESS:');
  console.log(`   Responsibilities: ${stats.withResponsibilities}/${finalAgents.length} (${(stats.withResponsibilities/finalAgents.length*100).toFixed(1)}%)`);
  console.log(`   Guidance: ${stats.withGuidance}/${finalAgents.length} (${(stats.withGuidance/finalAgents.length*100).toFixed(1)}%)`);
  console.log(`   Tools: ${stats.withTools}/${finalAgents.length} (${(stats.withTools/finalAgents.length*100).toFixed(1)}%)`);

  console.log('\n✅ Agent enrichment complete!');
}

enrichAllAgents().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

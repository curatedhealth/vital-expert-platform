/**
 * Update Digital Health Agents with Complete Data
 * Ensures all 15 agents have comprehensive data from DIGITAL_HEALTH_AGENTS_15.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load the complete agent data from JSON file
const agentsDataPath = path.join(__dirname, '..', 'DIGITAL_HEALTH_AGENTS_15.json');
const agentsData = JSON.parse(fs.readFileSync(agentsDataPath, 'utf8'));

async function updateAgentsWithCompleteData() {
  console.log('🔄 Updating Digital Health Agents with Complete Data...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const agentSpec of agentsData.agents) {
    try {
      console.log(`📝 Updating: ${agentSpec.display_name}`);

      // Map all fields from JSON to database schema
      const updateData = {
        // Core identification
        display_name: agentSpec.display_name,
        description: agentSpec.description,
        avatar: `/icons/png/avatars/${agentSpec.avatar}.png`,
        color: agentSpec.color,
        version: agentSpec.version,

        // Model configuration
        model: agentSpec.model,
        system_prompt: agentSpec.system_prompt,
        temperature: agentSpec.temperature,
        max_tokens: agentSpec.max_tokens,
        context_window: agentSpec.context_window,
        response_format: agentSpec.response_format,

        // RAG and capabilities
        rag_enabled: agentSpec.rag_enabled,
        capabilities: agentSpec.capabilities,
        knowledge_domains: agentSpec.knowledge_domains,

        // Performance and metrics
        tier: agentSpec.tier,
        priority: agentSpec.priority,
        implementation_phase: agentSpec.implementation_phase,

        // Compliance and regulatory
        hipaa_compliant: agentSpec.hipaa_compliant,
        gdpr_compliant: agentSpec.gdpr_compliant,
        audit_trail_enabled: agentSpec.audit_trail_enabled,
        data_classification: agentSpec.data_classification,

        // Medical/clinical fields
        medical_specialty: agentSpec.medical_specialty,
        pharma_enabled: agentSpec.pharma_enabled,
        verify_enabled: agentSpec.verify_enabled,

        // Status and availability
        status: agentSpec.status,
        availability_status: agentSpec.availability_status,

        // Performance metrics
        error_rate: agentSpec.error_rate,
        average_response_time: agentSpec.average_response_time,
        total_interactions: agentSpec.total_interactions,
        last_health_check: agentSpec.last_health_check,

        // Store complex data in metadata
        metadata: {
          model_justification: agentSpec.model_justification,
          model_citation: agentSpec.model_citation,
          competency_levels: agentSpec.competency_levels,
          knowledge_sources: agentSpec.knowledge_sources,
          tool_configurations: agentSpec.tool_configurations,
          business_function: agentSpec.business_function,
          role: agentSpec.role,
          cost_per_query: agentSpec.cost_per_query,
          target_users: agentSpec.target_users,
          validation_status: agentSpec.validation_status,
          validation_metadata: agentSpec.validation_metadata,
          performance_metrics: agentSpec.performance_metrics,
          accuracy_score: agentSpec.accuracy_score,
          evidence_required: agentSpec.evidence_required,
          regulatory_context: agentSpec.regulatory_context,
          compliance_tags: agentSpec.compliance_tags,
          required_permissions: agentSpec.required_permissions,
          dependencies: agentSpec.dependencies,
          domain_expertise: agentSpec.domain_expertise
        },

        // Update timestamp
        updated_at: new Date().toISOString()
      };

      // Upsert agent by name (insert or update)
      const { data, error } = await supabase
        .from('agents')
        .upsert(
          { name: agentSpec.name, ...updateData },
          { onConflict: 'name', ignoreDuplicates: false }
        )
        .select('id, display_name, tier, model')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Agent not found');
      }

      console.log(`✅ Updated: ${data.display_name} (Tier ${data.tier}, ${data.model})`);
      successCount++;

    } catch (error) {
      console.error(`❌ Failed to update ${agentSpec.display_name}:`, error.message);
      errors.push({
        agent: agentSpec.display_name,
        error: error.message
      });
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Update Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📋 Total: ${agentsData.agents.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ agent, error }) => {
      console.log(`  • ${agent}: ${error}`);
    });
  }

  // Display summary of updated agents
  if (successCount > 0) {
    console.log('\n✨ Successfully Updated Agents:');
    console.log('─'.repeat(60));

    const { data: updatedAgents } = await supabase
      .from('agents')
      .select('display_name, tier, model, avatar')
      .in('name', agentsData.agents.map(a => a.name))
      .order('tier', { ascending: false })
      .order('priority', { ascending: true });

    if (updatedAgents) {
      updatedAgents.forEach(agent => {
        console.log(`  ${agent.display_name}`);
        console.log(`    Tier: ${agent.tier} | Model: ${agent.model}`);
        console.log(`    Avatar: ${agent.avatar}`);
      });
    }
  }
}

updateAgentsWithCompleteData()
  .then(() => {
    console.log('\n✨ Complete data update finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

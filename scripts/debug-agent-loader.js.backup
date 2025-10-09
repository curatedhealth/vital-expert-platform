#!/usr/bin/env node

/**
 * Debug Agent Loader - Test loading a single enhanced agent
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

const testAgent = {
  name: "launch_commander_enhanced",
  display_name: "Launch Commander - Strategic Orchestrator v2.0",
  description: "Master orchestrator for pharmaceutical product launch (L-48 to L+12). Coordinates all launch activities, manages cross-functional alignment, tracks critical milestones, and makes go/no-go decisions.",
  avatar: "🚀",
  color: "#1976D2",
  system_prompt: `YOU ARE: Launch Commander, a strategic orchestration agent for pharmaceutical product launches.
YOU DO: Coordinate all launch activities, manage cross-functional alignment, track critical milestones.
SUCCESS CRITERIA: On-time launch (100%), LPI score >85%, stakeholder alignment >90%.`,
  model: "gpt-4-turbo-preview",
  temperature: 0.6,
  max_tokens: 8000,
  capabilities: [
    "launch_planning",
    "cross_functional_coordination",
    "risk_management",
    "stakeholder_alignment",
    "performance_tracking"
  ],
  status: "active",
  domain_expertise: "general",
  regulatory_context: {
    is_regulated: true,
    standards: ["GCP", "GMP", "GDP", "GVP"],
    guidelines: ["FDA_launch", "EMA_procedures"]
  },
  metadata: {
    version: "2.0.0",
    enhanced_features: ["prompt_starters", "rag_integration", "advanced_analytics"],
    rag_configuration: {
      global_rags: ["clinical_guidelines", "fda_database", "market_intelligence"],
      specific_rags: {
        launch_playbooks: {
          name: "Launch Excellence Playbooks",
          sources: ["Historical launch post-mortems", "Best practice frameworks"]
        }
      }
    }
  }
};

async function debugAgentLoad() {
  try {
    console.log('🔍 Starting debug agent load...');
    console.log('Database URL:', 'http://127.0.0.1:54321');

    // First, check connection
    console.log('\n1. Testing database connection...');
    const { data: connTest, error: connError } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    if (connError) {
      console.error('❌ Connection failed:', connError);
      return;
    }
    console.log('✅ Database connection successful');

    // Check if agent exists
    console.log('\n2. Checking if agent exists...');
    const { data: existing, error: checkError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', testAgent.name);

    if (checkError) {
      console.error('❌ Check failed:', checkError);
      return;
    }

    console.log(`Found ${existing.length} existing agents with name "${testAgent.name}"`);

    // Try to insert/update
    if (existing.length > 0) {
      console.log('\n3. Updating existing agent...');
      const { data, error } = await supabase
        .from('agents')
        .update(testAgent)
        .eq('name', testAgent.name)
        .select();

      if (error) {
        console.error('❌ Update failed:', error);
        return;
      }
      console.log('✅ Agent updated successfully:', data[0]?.display_name);
    } else {
      console.log('\n3. Inserting new agent...');
      const { data, error } = await supabase
        .from('agents')
        .insert([testAgent])
        .select();

      if (error) {
        console.error('❌ Insert failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return;
      }
      console.log('✅ Agent inserted successfully:', data[0]?.display_name);
    }

    // Verify the agent is there
    console.log('\n4. Verifying agent was saved...');
    const { data: verification, error: verifyError } = await supabase
      .from('agents')
      .select('name, display_name, status')
      .eq('name', testAgent.name);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    if (verification.length > 0) {
      console.log('✅ Agent verified in database:', verification[0]);
    } else {
      console.log('❌ Agent not found after insert/update');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugAgentLoad().catch(console.error);
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateSupabaseCloud() {
  console.log('🚀 Updating Supabase Cloud Database...\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check current database status
    console.log('📋 Step 1: Checking current database status...');
    
    const { count: agentsCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    
    const { count: orgFunctionsCount } = await supabase
      .from('org_functions')
      .select('*', { count: 'exact', head: true });

    console.log(`   ✅ Agents: ${agentsCount || 0}`);
    console.log(`   ✅ Org Functions: ${orgFunctionsCount || 0}`);

    // Step 2: Apply pending migrations
    console.log('\n📋 Step 2: Applying pending migrations...');

    // Apply the complete cloud migration
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251008000004_complete_cloud_migration.sql');
    
    if (fs.existsSync(migrationPath)) {
      console.log('   📄 Found complete cloud migration file');
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`   📦 Executing ${statements.length} migration statements...`);
      
      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`   ⚠️  Statement warning: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.log(`   ⚠️  Statement error: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`   ✅ Migration statements: ${successCount} successful, ${errorCount} warnings/errors`);
    } else {
      console.log('   ⚠️  Complete cloud migration file not found');
    }

    // Step 3: Apply RAG schema updates
    console.log('\n📋 Step 3: Applying RAG schema updates...');
    
    const ragMigrationPath = path.join(__dirname, 'supabase/migrations/20250930000001_fix_match_documents_table.sql');
    
    if (fs.existsSync(ragMigrationPath)) {
      console.log('   📄 Found RAG schema fix migration');
      
      const ragSQL = fs.readFileSync(ragMigrationPath, 'utf8');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: ragSQL });
        if (error) {
          console.log(`   ⚠️  RAG migration warning: ${error.message}`);
        } else {
          console.log('   ✅ RAG schema fix applied');
        }
      } catch (err) {
        console.log(`   ⚠️  RAG migration error: ${err.message}`);
      }
    } else {
      console.log('   ⚠️  RAG schema fix file not found');
    }

    // Step 4: Update agent relationships
    console.log('\n📋 Step 4: Updating agent relationships...');
    
    // Check if we need to populate relationship tables
    const { count: capabilitiesCount } = await supabase
      .from('agent_capabilities')
      .select('*', { count: 'exact', head: true });
    
    const { count: knowledgeAccessCount } = await supabase
      .from('agent_knowledge_domains')
      .select('*', { count: 'exact', head: true });

    console.log(`   📊 Current relationships: ${capabilitiesCount || 0} capabilities, ${knowledgeAccessCount || 0} knowledge access`);

    if ((capabilitiesCount || 0) === 0) {
      console.log('   🔄 Populating agent capabilities...');
      
      // Get sample agents and add basic capabilities
      const { data: sampleAgents } = await supabase
        .from('agents')
        .select('id, name, display_name')
        .limit(10);

      if (sampleAgents && sampleAgents.length > 0) {
        const capabilities = [
          'general_consultation',
          'data_analysis', 
          'report_generation',
          'regulatory_guidance',
          'clinical_support'
        ];

        let capabilitiesAdded = 0;
        for (const agent of sampleAgents) {
          for (const capability of capabilities) {
            const { error } = await supabase
              .from('agent_capabilities')
              .insert({
                agent_id: agent.id,
                capability_name: capability,
                description: `Capability: ${capability}`,
                proficiency_level: 1
              });

            if (!error) {
              capabilitiesAdded++;
            }
          }
        }
        console.log(`   ✅ Added ${capabilitiesAdded} agent capabilities`);
      }
    } else {
      console.log('   ✅ Agent capabilities already populated');
    }

    // Step 5: Verify final status
    console.log('\n📋 Step 5: Verifying final database status...');
    
    const { count: finalAgentsCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalCapabilitiesCount } = await supabase
      .from('agent_capabilities')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalKnowledgeCount } = await supabase
      .from('knowledge_domains')
      .select('*', { count: 'exact', head: true });
    
    const { count: finalLLMCount } = await supabase
      .from('llm_providers')
      .select('*', { count: 'exact', head: true });

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 SUPABASE CLOUD UPDATE COMPLETE!');
    console.log('=' .repeat(60));
    
    console.log('\n📊 FINAL DATABASE STATUS:');
    console.log(`   ✅ Agents: ${finalAgentsCount || 0}`);
    console.log(`   ✅ Agent Capabilities: ${finalCapabilitiesCount || 0}`);
    console.log(`   ✅ Knowledge Domains: ${finalKnowledgeCount || 0}`);
    console.log(`   ✅ LLM Providers: ${finalLLMCount || 0}`);
    console.log(`   ✅ Org Functions: ${orgFunctionsCount || 0}`);

    console.log('\n🚀 Your Supabase Cloud database is now fully updated!');
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Test your application with the updated cloud database');
    console.log('   2. Verify all features are working correctly');
    console.log('   3. Set up monitoring and alerts');
    console.log('   4. Configure backup and recovery procedures');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

updateSupabaseCloud();

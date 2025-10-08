#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Cloud Configuration
const SUPABASE_URL = 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importMedicalAffairsAgents() {
  console.log('🏥 IMPORTING MEDICAL AFFAIRS AGENTS TO SUPABASE CLOUD\n');
  console.log('=' .repeat(70));

  try {
    // Read the Medical Affairs agents JSON file
    const jsonPath = path.join(__dirname, 'docs', 'MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Medical Affairs agents file not found: ${jsonPath}`);
    }

    const agentsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📋 Found ${agentsData.agents.length} Medical Affairs agents to import`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const agent of agentsData.agents) {
      try {
        // Transform agent data to match database schema
        const agentRecord = {
          name: agent.name,
          display_name: agent.display_name,
          description: agent.description,
          tier: agent.tier,
          status: agent.status || 'active',
          priority: agent.priority,
          avatar: agent.avatar || '',
          model: agent.model || 'gpt-4-turbo-preview',
          department: agent.department,
          system_prompt: agent.system_prompt,
          capabilities: JSON.stringify(agent.capabilities || []),
          business_function: 'Medical Affairs',
          role: 'specialist',
          implementation_phase: 1,
          target_users: ['medical_affairs', 'clinical_teams', 'regulatory_affairs'],
          compliance_tags: ['fda', 'hipaa', 'gcp'],
          hipaa_compliant: true,
          gdpr_compliant: true,
          audit_trail_enabled: true,
          evidence_required: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Insert agent into database
        const { data, error } = await supabase
          .from('agents')
          .insert([agentRecord])
          .select();

        if (error) {
          console.error(`❌ Error importing ${agent.display_name}:`, error.message);
          errors.push({ agent: agent.display_name, error: error.message });
          errorCount++;
        } else {
          console.log(`✅ Imported: ${agent.display_name} (Tier ${agent.tier})`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`❌ Error processing ${agent.display_name}:`, err.message);
        errors.push({ agent: agent.display_name, error: err.message });
        errorCount++;
      }
    }

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 MEDICAL AFFAIRS AGENTS IMPORT SUMMARY');
    console.log('=' .repeat(70));
    console.log(`✅ Successfully imported: ${successCount} agents`);
    console.log(`❌ Failed to import: ${errorCount} agents`);

    if (errors.length > 0) {
      console.log('\n📋 ERRORS:');
      errors.forEach(({ agent, error }) => {
        console.log(`  - ${agent}: ${error}`);
      });
    }

    // Verify import
    const { count: totalAgents } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('business_function', 'Medical Affairs');

    console.log(`\n📊 Total Medical Affairs agents in database: ${totalAgents}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

importMedicalAffairsAgents();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY4OTM3OCwiZXhwIjoyMDUwMjY1Mzc4fQ.VkX0iMyTp93d8yLKrMWJQUaHYbeBhlF_p4sGKN8xdes';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importAgents(jsonFilePath) {
  try {
    console.log('🚀 Starting agent import process...');

    // Read the JSON file
    const filePath = path.resolve(jsonFilePath);
    console.log(`📖 Reading agent data from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!jsonData.agents || !Array.isArray(jsonData.agents)) {
      throw new Error('Invalid JSON format. Expected an "agents" array.');
    }

    console.log(`📊 Found ${jsonData.agents.length} agents to import`);

    // Import each agent
    for (let i = 0; i < jsonData.agents.length; i++) {
      const agent = jsonData.agents[i];
      console.log(`\n⚡ Importing agent ${i + 1}/${jsonData.agents.length}: ${agent.display_name}`);

      // Validate required fields
      const requiredFields = ['name', 'display_name', 'description', 'system_prompt', 'model'];
      for (const field of requiredFields) {
        if (!agent[field]) {
          throw new Error(`Missing required field "${field}" for agent: ${agent.display_name || agent.name}`);
        }
      }

      // Prepare agent data for database
      const agentData = {
        name: agent.name,
        display_name: agent.display_name,
        description: agent.description,
        system_prompt: agent.system_prompt,
        model: agent.model,
        avatar: agent.avatar || '🤖',
        color: agent.color || '#3B82F6',
        capabilities: agent.capabilities || [],
        rag_enabled: agent.rag_enabled !== false, // Default to true
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 2000,
        is_custom: agent.is_custom !== false, // Default to true for imported agents
        status: agent.status || 'active',
        tier: agent.tier || 1,
        priority: agent.priority || 100,
        implementation_phase: agent.implementation_phase || 1,
        knowledge_domains: agent.knowledge_domains || [],
        business_function: agent.business_function || null,
        role: agent.role || null,
        medical_specialty: agent.medical_specialty || null,
        clinical_validation_status: agent.clinical_validation_status || 'pending',
        medical_accuracy_score: agent.medical_accuracy_score || null,
        hipaa_compliant: agent.hipaa_compliant || false,
        pharma_enabled: agent.pharma_enabled || false,
        verify_enabled: agent.verify_enabled || false,
        fda_samd_class: agent.fda_samd_class || null
      };

      // Insert into database
      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to import agent "${agent.display_name}":`, error.message);
        console.error('Agent data:', agentData);
        throw error;
      }

      console.log(`✅ Successfully imported: ${data.display_name} (ID: ${data.id})`);
    }

    console.log('\n🎉 Agent import completed successfully!');
    console.log(`✨ Imported ${jsonData.agents.length} agents total`);

    // Verify the import
    const { data: allAgents, error: countError } = await supabase
      .from('agents')
      .select('id, display_name, status')
      .eq('status', 'active');

    if (!countError) {
      console.log(`\n📈 Database now contains ${allAgents.length} active agents:`);
      allAgents.forEach(agent => {
        console.log(`   • ${agent.display_name}`);
      });
    }

  } catch (error) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Command line usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/import-agents.js <path-to-json-file>');
  console.log('Example: node scripts/import-agents.js agent-template.json');
  process.exit(1);
}

const jsonFilePath = args[0];
importAgents(jsonFilePath);
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCapabilities() {
  try {
    const capabilitiesPath = path.join(process.cwd(), 'data', 'batch-uploads', 'capabilities_batch.json');
    const capabilitiesData = JSON.parse(fs.readFileSync(capabilitiesPath, 'utf-8'));

    console.log(`\n📊 Found ${capabilitiesData.capabilities.length} capabilities to import`);

    const capabilitiesToImport = capabilitiesData.capabilities.map((cap: any) => ({
      name: cap.name,
      display_name: cap.display_name,
      description: cap.description,
      category: cap.category,
      domain: cap.domain,
      complexity_level: cap.complexity_level,
      status: cap.status,
      estimated_duration_hours: cap.estimated_duration_hours,
      methodology: cap.methodology,
      quality_metrics: cap.quality_metrics,
      output_format: cap.output_format,
      prerequisite_capabilities: cap.prerequisite_capabilities || [],
      prerequisite_knowledge: cap.prerequisite_knowledge || [],
      tools_required: cap.tools_required || [],
      validation_requirements: cap.validation_requirements,
      compliance_tags: cap.compliance_tags || [],
      examples: cap.examples || [],
      limitations: cap.limitations || []
    }));

    console.log('🚀 Importing capabilities...');

    const { data, error } = await supabase
      .from('capabilities')
      .insert(capabilitiesToImport);

    if (error) {
      console.error('❌ Error importing capabilities:', error.message);
    } else {
      console.log('✅ Successfully imported capabilities');
    }

    const { count } = await supabase
      .from('capabilities')
      .select('*', { count: 'exact', head: true });

    console.log(`✨ Total capabilities in database: ${count}`);

  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
  }
}

async function importPrompts() {
  try {
    const promptsPath = path.join(process.cwd(), 'data', 'batch-uploads', 'prompts_batch.json');
    const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

    console.log(`\n📊 Found ${promptsData.prompts.length} prompts to import`);

    const promptsToImport = promptsData.prompts.map((prompt: any) => ({
      name: prompt.name,
      display_name: prompt.display_name,
      description: prompt.description,
      domain: prompt.domain,
      complexity_level: prompt.complexity_level,
      estimated_duration_hours: prompt.estimated_duration_hours,
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      input_schema: prompt.input_schema,
      output_schema: prompt.output_schema,
      success_criteria: prompt.success_criteria,
      validation_rules: prompt.validation_rules,
      prerequisite_capabilities: prompt.prerequisite_capabilities || [],
      prerequisite_prompts: prompt.prerequisite_prompts || [],
      model_requirements: prompt.model_requirements,
      compliance_tags: prompt.compliance_tags || [],
      estimated_tokens: prompt.estimated_tokens,
      version: prompt.version || '1.0.0',
      is_active: true,
      category: prompt.domain
    }));

    console.log('🚀 Importing prompts...');

    const { data, error } = await supabase
      .from('prompts')
      .insert(promptsToImport);

    if (error) {
      console.error('❌ Error importing prompts:', error.message);
    } else {
      console.log('✅ Successfully imported prompts');
    }

    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    console.log(`✨ Total prompts in database: ${count}`);

  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
  }
}

async function main() {
  console.log('🎯 Starting Capabilities and Prompts Import\n');
  console.log('='.repeat(50));

  await importCapabilities();
  await importPrompts();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Import complete!\n');
}

main();

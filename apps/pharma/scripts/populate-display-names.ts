/**
 * Script to populate display_name in metadata for agents that don't have it
 * This converts agent names like "accelerated_approval_strategist" to "Accelerated Approval Strategist"
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Convert snake_case or kebab-case to Title Case
 * Example: "accelerated_approval_strategist" -> "Accelerated Approval Strategist"
 */
function toDisplayName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function populateDisplayNames() {
  console.log('🔄 Populating display_name for agents...\n');

  try {
    // Fetch all agents (only select columns that definitely exist)
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, metadata');

    if (fetchError) {
      throw new Error(`Failed to fetch agents: ${fetchError.message}`);
    }

    if (!agents || agents.length === 0) {
      console.log('⚠️  No agents found');
      return;
    }

    console.log(`📊 Found ${agents.length} agents\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const agent of agents) {
      const metadata = agent.metadata || {};
      const existingDisplayName = metadata.display_name;

      // Skip if display_name already exists in metadata
      if (existingDisplayName && existingDisplayName !== agent.name) {
        console.log(`⏭️  Skipping ${agent.name} - already has display_name: "${existingDisplayName}"`);
        skippedCount++;
        continue;
      }

      // Generate display name from agent name
      const displayName = toDisplayName(agent.name);

      // Update metadata with display_name
      const updatedMetadata = {
        ...metadata,
        display_name: displayName,
      };

      // Update agent - only update metadata (display_name column may not exist)
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          metadata: updatedMetadata,
        })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Failed to update ${agent.name}:`, updateError.message);
        continue;
      }

      console.log(`✅ Updated ${agent.name}: "${displayName}"`);
      updatedCount++;
    }

    console.log(`\n✅ Complete! Updated ${updatedCount} agents, skipped ${skippedCount} agents`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
populateDisplayNames().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


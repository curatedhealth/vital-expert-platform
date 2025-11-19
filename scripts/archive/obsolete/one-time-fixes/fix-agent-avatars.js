const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get list of available PNG avatars
const avatarsDir = path.join(__dirname, '../public/icons/png/avatars');
const availableAvatars = fs.readdirSync(avatarsDir)
  .filter(file => file.endsWith('.png'))
  .sort();

console.log(`Found ${availableAvatars.length} PNG avatars`);

async function fixAgentAvatars() {
  try {
    // Fetch all agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, display_name, avatar');

    if (error) throw error;

    console.log(`\nFound ${agents.length} agents to update\n`);

    let updateCount = 0;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      // Skip if already has a valid PNG path
      if (agent.avatar && agent.avatar.includes('/icons/png/avatars/')) {
        console.log(`✓ ${agent.display_name}: Already has PNG avatar`);
        continue;
      }

      // Assign a PNG avatar cyclically
      const avatarIndex = i % availableAvatars.length;
      const avatarFilename = availableAvatars[avatarIndex];
      const avatarPath = `/icons/png/avatars/${avatarFilename}`;

      // Update the agent
      const { error: updateError } = await supabase
        .from('agents')
        .update({ avatar: avatarPath })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`✗ Error updating ${agent.display_name}:`, updateError.message);
      } else {
        console.log(`✓ Updated ${agent.display_name}: ${avatarPath}`);
        updateCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${updateCount} out of ${agents.length} agents`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAgentAvatars();

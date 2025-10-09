const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function updateIconsTo4Digit() {
  console.log('🔄 Updating icons table to use 4-digit avatar naming...');

  try {
    // Get all avatar icons
    const { data: icons, error } = await supabase
      .from('icons')
      .select('*')
      .eq('category', 'avatar');

    if (error) {
      console.error('Error fetching icons:', error);
      return;
    }

    console.log(`Found ${icons.length} avatar icons to update`);

    // Update each icon
    for (const icon of icons) {
      // Convert from avatar_001 to avatar_0001 format
      if (icon.name.match(/^avatar_\d{3}$/)) {
        const oldName = icon.name;
        const num = oldName.replace('avatar_', '');
        const newName = `avatar_${num.padStart(4, '0')}`;

        // Update file paths to use 4-digit format
        const newFilePath = icon.file_path.replace(oldName, newName);
        const newFileUrl = icon.file_url.replace(oldName, newName);

        const { error: updateError } = await supabase
          .from('icons')
          .update({
            name: newName,
            file_path: newFilePath,
            file_url: newFileUrl
          })
          .eq('id', icon.id);

        if (updateError) {
          console.error(`Error updating ${oldName}:`, updateError);
        } else {
          console.log(`✅ Updated ${oldName} -> ${newName}`);
        }
      }
    }

    // Also update any agents that have 3-digit avatar references
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .like('avatar', 'avatar_%');

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      return;
    }

    console.log(`\nFound ${agents.length} agents to update`);

    for (const agent of agents) {
      if (agent.avatar && agent.avatar.match(/^avatar_\d{3}$/)) {
        const oldAvatar = agent.avatar;
        const num = oldAvatar.replace('avatar_', '');
        const newAvatar = `avatar_${num.padStart(4, '0')}`;

        const { error: updateError } = await supabase
          .from('agents')
          .update({ avatar: newAvatar })
          .eq('id', agent.id);

        if (updateError) {
          console.error(`Error updating agent ${agent.name}:`, updateError);
        } else {
          console.log(`✅ Updated agent ${agent.name}: ${oldAvatar} -> ${newAvatar}`);
        }
      }
    }

    console.log('\n🎉 Icons and agents updated to 4-digit format successfully!');

  } catch (err) {
    console.error('Script error:', err);
  }
}

updateIconsTo4Digit().catch(console.error);
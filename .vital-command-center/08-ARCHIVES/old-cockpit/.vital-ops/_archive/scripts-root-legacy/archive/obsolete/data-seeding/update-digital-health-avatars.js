/**
 * Update Digital Health Agents with Avatar Icons
 * Maps each agent to an appropriate avatar from the public/icons/png/avatars folder
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping of agent names to avatar file paths
const avatarMappings = {
  'digital-therapeutic-advisor': '/icons/png/avatars/avatar_0050.png', // Medical/therapeutic theme
  'remote-patient-monitoring-specialist': '/icons/png/avatars/avatar_0085.png', // Monitoring/data
  'ai-ml-medical-device-compliance': '/icons/png/avatars/avatar_0120.png', // AI/tech
  'clinical-decision-support-designer': '/icons/png/avatars/avatar_0045.png', // Clinical/medical
  'telehealth-program-manager': '/icons/png/avatars/avatar_0078.png', // Digital/connectivity
  'mhealth-app-strategist': '/icons/png/avatars/avatar_0092.png', // Mobile/apps
  'wearable-device-integration-specialist': '/icons/png/avatars/avatar_0110.png', // Wearable tech
  'patient-engagement-platform-advisor': '/icons/png/avatars/avatar_0065.png', // Patient/people
  'digital-health-data-scientist': '/icons/png/avatars/avatar_0130.png', // Data/analytics
  'interoperability-architect': '/icons/png/avatars/avatar_0140.png', // Integration/systems
  'digital-biomarker-specialist': '/icons/png/avatars/avatar_0055.png', // Biomarker/science
  'cybersecurity-for-medical-devices': '/icons/png/avatars/avatar_0150.png', // Security
  'digital-health-equity-advisor': '/icons/png/avatars/avatar_0070.png', // Equity/balance
  'digital-health-business-model-advisor': '/icons/png/avatars/avatar_0095.png', // Business
  'clinical-ai-implementation-specialist': '/icons/png/avatars/avatar_0125.png', // AI implementation
};

async function updateAvatars() {
  console.log('🎨 Updating Digital Health Agent Avatars...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const [agentName, avatarPath] of Object.entries(avatarMappings)) {
    try {
      console.log(`📝 Updating: ${agentName}`);

      const { data, error } = await supabase
        .from('agents')
        .update({ avatar: avatarPath })
        .eq('name', agentName)
        .select('id, display_name, avatar')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Agent not found');
      }

      console.log(`✅ Updated: ${data.display_name} -> ${avatarPath}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Failed to update ${agentName}:`, error.message);
      errors.push({
        agent: agentName,
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
  console.log(`📋 Total: ${Object.keys(avatarMappings).length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ agent, error }) => {
      console.log(`  • ${agent}: ${error}`);
    });
  }
}

updateAvatars()
  .then(() => {
    console.log('\n✨ Avatar update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

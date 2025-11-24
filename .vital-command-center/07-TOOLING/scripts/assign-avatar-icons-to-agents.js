const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const MAX_ASSIGNMENTS_PER_AVATAR = 3;

// Function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Function to get avatar assignment counts
async function getAvatarAssignmentCounts() {
  const { data: agents, error } = await supabase
    .from('agents')
    .select('avatar');
  
  if (error) {
    throw new Error(`Error fetching agents: ${error.message}`);
  }
  
  const assignmentCounts = {};
  agents?.forEach(agent => {
    if (agent.avatar) {
      assignmentCounts[agent.avatar] = (assignmentCounts[agent.avatar] || 0) + 1;
    }
  });
  
  return assignmentCounts;
}

// Function to get available avatars (not at max capacity)
async function getAvailableAvatars() {
  const { data: avatars, error } = await supabase
    .from('icons')
    .select('id, name, display_name, file_url')
    .eq('category', 'avatar')
    .eq('is_active', true);
  
  if (error) {
    throw new Error(`Error fetching avatars: ${error.message}`);
  }
  
  const assignmentCounts = await getAvatarAssignmentCounts();
  
  // Filter avatars that haven't reached max capacity
  const availableAvatars = avatars?.filter(avatar => {
    const currentCount = assignmentCounts[avatar.id] || 0;
    return currentCount < MAX_ASSIGNMENTS_PER_AVATAR;
  }) || [];
  
  return availableAvatars;
}

// Function to assign avatars to agents
async function assignAvatarsToAgents() {
  console.log('🚀 Starting avatar assignment to agents...\n');
  
  try {
    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, display_name, avatar')
      .order('name');
    
    if (agentsError) {
      throw new Error(`Error fetching agents: ${agentsError.message}`);
    }
    
    console.log(`👥 Found ${agents?.length || 0} agents`);
    
    // Get available avatars
    const availableAvatars = await getAvailableAvatars();
    console.log(`🎭 Found ${availableAvatars.length} available avatars`);
    
    if (availableAvatars.length === 0) {
      console.log('❌ No available avatars (all at max capacity)');
      return;
    }
    
    // Shuffle avatars for random assignment
    const shuffledAvatars = shuffleArray(availableAvatars);
    
    let assignmentCount = 0;
    let avatarIndex = 0;
    const assignments = [];
    
    // Assign avatars to agents
    for (const agent of agents || []) {
      // Skip if agent already has an avatar and we want to keep it
      // Or assign new avatar if we want to reassign all
      const shouldAssign = true; // Set to false if you want to keep existing avatars
      
      if (shouldAssign) {
        // Get next available avatar
        let selectedAvatar = null;
        let attempts = 0;
        const maxAttempts = shuffledAvatars.length;
        
        while (!selectedAvatar && attempts < maxAttempts) {
          const candidateAvatar = shuffledAvatars[avatarIndex % shuffledAvatars.length];
          
          // Check if this avatar is still available (not at max capacity)
          const currentAssignments = await getAvatarAssignmentCounts();
          const currentCount = currentAssignments[candidateAvatar.id] || 0;
          
          if (currentCount < MAX_ASSIGNMENTS_PER_AVATAR) {
            selectedAvatar = candidateAvatar;
          } else {
            avatarIndex++;
            attempts++;
          }
        }
        
        if (selectedAvatar) {
          assignments.push({
            agentId: agent.id,
            agentName: agent.display_name || agent.name,
            avatarId: selectedAvatar.id,
            avatarName: selectedAvatar.display_name,
            currentAvatar: agent.avatar
          });
          
          avatarIndex++;
          assignmentCount++;
        }
      }
    }
    
    console.log(`\n📊 Assignment Plan:`);
    console.log(`  - Agents to update: ${assignments.length}`);
    console.log(`  - Available avatars: ${availableAvatars.length}`);
    console.log(`  - Max assignments per avatar: ${MAX_ASSIGNMENTS_PER_AVATAR}`);
    
    // Show sample assignments
    console.log(`\n🎯 Sample assignments:`);
    assignments.slice(0, 10).forEach((assignment, index) => {
      console.log(`  ${index + 1}. ${assignment.agentName} → ${assignment.avatarName}`);
    });
    
    if (assignments.length > 10) {
      console.log(`  ... and ${assignments.length - 10} more assignments`);
    }
    
    // Execute assignments in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`\n🔄 Executing assignments in batches of ${batchSize}...`);
    
    for (let i = 0; i < assignments.length; i += batchSize) {
      const batch = assignments.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(assignments.length / batchSize)} (${batch.length} assignments)`);
      
      const batchPromises = batch.map(async (assignment) => {
        try {
          const { error: updateError } = await supabase
            .from('agents')
            .update({ 
              avatar: assignment.avatarId,
              updated_at: new Date().toISOString()
            })
            .eq('id', assignment.agentId);
          
          if (updateError) {
            throw new Error(`Update failed: ${updateError.message}`);
          }
          
          console.log(`✅ ${assignment.agentName} → ${assignment.avatarName}`);
          successCount++;
          return { success: true, assignment };
          
        } catch (error) {
          console.error(`❌ ${assignment.agentName}: ${error.message}`);
          errors.push({ assignment, error: error.message });
          errorCount++;
          return { success: false, assignment, error: error.message };
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + batchSize < assignments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n📊 Assignment Summary:`);
    console.log(`✅ Successfully assigned: ${successCount} avatars`);
    console.log(`❌ Failed: ${errorCount} assignments`);
    
    if (errors.length > 0) {
      console.log(`\n❌ Errors:`);
      errors.slice(0, 5).forEach(({ assignment, error }) => {
        console.log(`  - ${assignment.agentName}: ${error}`);
      });
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more errors`);
      }
    }
    
    // Verify final assignment distribution
    console.log(`\n🔍 Verifying assignment distribution...`);
    const finalAssignmentCounts = await getAvatarAssignmentCounts();
    const usedAvatars = Object.keys(finalAssignmentCounts).length;
    const maxAssignments = Math.max(...Object.values(finalAssignmentCounts));
    const minAssignments = Math.min(...Object.values(finalAssignmentCounts));
    
    console.log(`📈 Final Distribution:`);
    console.log(`  - Avatars used: ${usedAvatars}`);
    console.log(`  - Max assignments per avatar: ${maxAssignments}`);
    console.log(`  - Min assignments per avatar: ${minAssignments}`);
    console.log(`  - Average assignments per avatar: ${(Object.values(finalAssignmentCounts).reduce((a, b) => a + b, 0) / usedAvatars).toFixed(2)}`);
    
    // Show avatars with max assignments
    const maxedOutAvatars = Object.entries(finalAssignmentCounts)
      .filter(([_, count]) => count === MAX_ASSIGNMENTS_PER_AVATAR)
      .map(([avatarId, count]) => ({ avatarId, count }));
    
    if (maxedOutAvatars.length > 0) {
      console.log(`\n🎭 Avatars at max capacity (${MAX_ASSIGNMENTS_PER_AVATAR} assignments):`);
      maxedOutAvatars.slice(0, 10).forEach(({ avatarId, count }) => {
        console.log(`  - Avatar ${avatarId}: ${count} assignments`);
      });
      if (maxedOutAvatars.length > 10) {
        console.log(`  ... and ${maxedOutAvatars.length - 10} more`);
      }
    }
    
    console.log(`\n🎉 Avatar assignment completed!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run assignment
assignAvatarsToAgents().catch(console.error);

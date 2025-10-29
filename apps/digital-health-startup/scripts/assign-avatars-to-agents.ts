/**
 * Script to assign avatars to all agents from Supabase icons table
 * Ensures each avatar icon is used at most 3 times
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

interface AvatarIcon {
  name: string;
  display_name: string;
}

interface Agent {
  id: string;
  name: string;
  metadata: any;
}

/**
 * Normalize avatar name to ensure consistent format
 * Handles multiple formats:
 * - "avatar_001" or "avatar_0001" → "avatar_0001"
 * - "avatar-011" → "avatar_0011"
 * - "01arab_male..." → Extract number and convert to "avatar_0001"
 * - Other formats → Use as-is
 */
function normalizeAvatarName(avatarName: string): string {
  if (!avatarName) return avatarName;

  // Handle "avatar_001" or "avatar_0001" format
  const avatarUnderScoreMatch = avatarName.match(/^avatar_(\d{1,4})$/);
  if (avatarUnderScoreMatch) {
    const num = avatarUnderScoreMatch[1];
    const paddedNum = num.padStart(4, '0');
    return `avatar_${paddedNum}`;
  }

  // Handle "avatar-011" format
  const avatarDashMatch = avatarName.match(/^avatar-(\d{1,4})$/);
  if (avatarDashMatch) {
    const num = avatarDashMatch[1];
    const paddedNum = num.padStart(4, '0');
    return `avatar_${paddedNum}`;
  }

  // Handle "01arab..." or "001arab..." format - extract leading numbers
  const leadingNumMatch = avatarName.match(/^(\d{1,4})/);
  if (leadingNumMatch) {
    const num = leadingNumMatch[1];
    const paddedNum = num.padStart(4, '0');
    return `avatar_${paddedNum}`;
  }

  // Return as-is if no pattern matches
  return avatarName;
}

async function assignAvatarsToAgents() {
  console.log('🔄 Assigning avatars to agents from Supabase icons table...\n');

  try {
    // Step 1: Fetch all active avatar icons from icons table
    console.log('📥 Fetching avatar icons from icons table...');
    const { data: avatarIcons, error: iconsError } = await supabase
      .from('icons')
      .select('name, display_name')
      .eq('category', 'avatar')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (iconsError) {
      throw new Error(`Failed to fetch icons: ${iconsError.message}`);
    }

    if (!avatarIcons || avatarIcons.length === 0) {
      throw new Error('No avatar icons found in icons table');
    }

    console.log(`✅ Found ${avatarIcons.length} avatar icons\n`);

    // Step 2: Fetch all agents
    console.log('📥 Fetching agents...');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, metadata');

    if (agentsError) {
      throw new Error(`Failed to fetch agents: ${agentsError.message}`);
    }

    if (!agents || agents.length === 0) {
      console.log('⚠️  No agents found');
      return;
    }

    console.log(`✅ Found ${agents.length} agents\n`);

    // Step 3: Normalize and prepare avatar list
    const normalizedAvatars: AvatarIcon[] = avatarIcons.map(icon => ({
      name: normalizeAvatarName(icon.name),
      display_name: icon.display_name,
    }));

    // Remove duplicates by name
    const uniqueAvatars = Array.from(
      new Map(normalizedAvatars.map(avatar => [avatar.name, avatar])).values()
    );

    console.log(`📊 Using ${uniqueAvatars.length} unique avatar icons\n`);

    // Check if we have enough avatars
    const maxAgentsPerAvatar = 3;
    const maxAgents = uniqueAvatars.length * maxAgentsPerAvatar;
    if (agents.length > maxAgents) {
      console.warn(
        `⚠️  Warning: You have ${agents.length} agents but only ${maxAgents} total avatar slots (${uniqueAvatars.length} avatars × ${maxAgentsPerAvatar} uses each)\n`
      );
    }

    // Step 4: Count current avatar usage
    const avatarUsageCount = new Map<string, number>();
    uniqueAvatars.forEach(avatar => {
      avatarUsageCount.set(avatar.name, 0);
    });

    // Count existing avatar assignments
    agents.forEach(agent => {
      const metadata = agent.metadata || {};
      const currentAvatar = metadata.avatar;
      if (currentAvatar) {
        const normalizedCurrent = normalizeAvatarName(currentAvatar);
        if (avatarUsageCount.has(normalizedCurrent)) {
          avatarUsageCount.set(
            normalizedCurrent,
            (avatarUsageCount.get(normalizedCurrent) || 0) + 1
          );
        }
      }
    });

    // Step 5: Assign avatars to agents
    console.log('🎨 Assigning avatars to agents...\n');

    let assignedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const assignmentLog: Array<{ agentName: string; avatarName: string }> = [];

    // Create a pool of avatars that haven't reached max usage
    const getAvailableAvatars = (): AvatarIcon[] => {
      return uniqueAvatars.filter(
        avatar => (avatarUsageCount.get(avatar.name) || 0) < maxAgentsPerAvatar
      );
    };

    // Sort agents for consistent assignment
    const sortedAgents = [...agents].sort((a, b) => a.name.localeCompare(b.name));

    for (const agent of sortedAgents) {
      const metadata = agent.metadata || {};
      const currentAvatar = metadata.avatar;
      
      // Skip if agent already has an avatar assigned and it's within usage limits
      if (currentAvatar) {
        const normalizedCurrent = normalizeAvatarName(currentAvatar);
        const currentUsage = avatarUsageCount.get(normalizedCurrent) || 0;
        
        // If avatar exists and is within limits, keep it
        if (avatarUsageCount.has(normalizedCurrent) && currentUsage < maxAgentsPerAvatar) {
          console.log(`⏭️  Skipping ${agent.name} - already has valid avatar: "${normalizedCurrent}"`);
          skippedCount++;
          continue;
        }
        // If avatar is over limit or doesn't exist, reassign
      }

      // Get available avatars
      const availableAvatars = getAvailableAvatars();

      if (availableAvatars.length === 0) {
        console.warn(
          `⚠️  No available avatars remaining (all used ${maxAgentsPerAvatar} times). Agent "${agent.name}" will keep existing avatar or default.`
        );
        skippedCount++;
        continue;
      }

      // Round-robin: use the least-used avatar
      const sortedAvailable = availableAvatars.sort((a, b) => {
        const usageA = avatarUsageCount.get(a.name) || 0;
        const usageB = avatarUsageCount.get(b.name) || 0;
        return usageA - usageB;
      });

      const assignedAvatar = sortedAvailable[0];
      const avatarName = assignedAvatar.name;

      // Update avatar usage count
      avatarUsageCount.set(
        avatarName,
        (avatarUsageCount.get(avatarName) || 0) + 1
      );

      // Update agent metadata
      const updatedMetadata = {
        ...metadata,
        avatar: avatarName,
      };

      const { error: updateError } = await supabase
        .from('agents')
        .update({
          metadata: updatedMetadata,
        })
        .eq('id', agent.id);

      if (updateError) {
        console.error(`❌ Failed to update ${agent.name}:`, updateError.message);
        // Rollback usage count
        avatarUsageCount.set(
          avatarName,
          (avatarUsageCount.get(avatarName) || 0) - 1
        );
        continue;
      }

      assignmentLog.push({
        agentName: agent.name,
        avatarName: avatarName,
      });

      const usage = avatarUsageCount.get(avatarName) || 0;
      console.log(
        `✅ Assigned "${avatarName}" to ${agent.name} (${usage}/${maxAgentsPerAvatar} uses)`
      );
      assignedCount++;
      updatedCount++;
    }

    // Step 6: Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 ASSIGNMENT SUMMARY');
    console.log('='.repeat(80));

    console.log(`\n✅ Successfully assigned: ${assignedCount} agents`);
    console.log(`⏭️  Skipped (already valid): ${skippedCount} agents`);
    console.log(`📝 Total updated: ${updatedCount} agents`);
    console.log(`🎨 Total unique avatars used: ${Array.from(avatarUsageCount.values()).filter(count => count > 0).length}`);

    console.log('\n📈 Avatar Usage Distribution:');
    const usageStats = new Map<number, number>();
    avatarUsageCount.forEach(count => {
      if (count > 0) {
        usageStats.set(count, (usageStats.get(count) || 0) + 1);
      }
    });

    [...usageStats.entries()]
      .sort((a, b) => a[0] - b[0])
      .forEach(([usage, avatarCount]) => {
        console.log(`   ${usage} uses: ${avatarCount} avatars`);
      });

    console.log('\n✨ Assignment complete!');

    // Log any avatars that are over the limit (shouldn't happen, but good to check)
    const overLimitAvatars: string[] = [];
    avatarUsageCount.forEach((count, avatarName) => {
      if (count > maxAgentsPerAvatar) {
        overLimitAvatars.push(`${avatarName} (${count} uses)`);
      }
    });

    if (overLimitAvatars.length > 0) {
      console.warn('\n⚠️  WARNING: Some avatars exceed max usage:');
      overLimitAvatars.forEach(avatar => console.warn(`   ${avatar}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
assignAvatarsToAgents()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });


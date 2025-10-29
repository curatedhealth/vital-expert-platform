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
  originalName?: string;
}

interface Agent {
  id: string;
  name: string;
  metadata: any;
}

/**
 * Extract icon name in the format expected by the API: avatar_XXXX (3-4 digits)
 * The API's resolveAvatarUrl expects pattern: /^avatar_(\d{3,4})$/
 * 
 * Handles multiple formats from icons table:
 * - "avatar_001" or "avatar_0001" → "avatar_0001" (4 digits preferred)
 * - "avatar-011" → "avatar_0011"
 * - "avatar_png_0118" → Extract "0118" → "avatar_0118"
 * - "01arab_male..." → Extract "01" → "avatar_0001"
 * - If icon name is in icons table format, use the name as-is if it matches pattern
 */
function normalizeAvatarNameForStorage(iconName: string): string | null {
  if (!iconName) return null;

  // Perfect format already: "avatar_0001" or "avatar_001" (3-4 digits)
  const perfectMatch = iconName.match(/^avatar_(\d{3,4})$/);
  if (perfectMatch) {
    const num = perfectMatch[1];
    // Keep as 3-4 digits (API accepts both)
    return `avatar_${num}`;
  }

  // Format: "avatar-011" → "avatar_0011"
  const dashMatch = iconName.match(/^avatar-(\d{1,4})$/);
  if (dashMatch) {
    const num = dashMatch[1];
    // Use 3-4 digits
    return num.length >= 3 ? `avatar_${num}` : `avatar_${num.padStart(3, '0')}`;
  }

  // Format: "avatar_png_0118" → Extract number → "avatar_0118"
  const pngMatch = iconName.match(/^avatar_png_(\d{3,4})$/);
  if (pngMatch) {
    const num = pngMatch[1];
    return `avatar_${num}`;
  }

  // Extract leading numbers: "01arab..." → "avatar_0001"
  const leadingNumMatch = iconName.match(/^(\d{1,4})/);
  if (leadingNumMatch) {
    const num = leadingNumMatch[1];
    // Use 3-4 digits
    return num.length >= 3 ? `avatar_${num}` : `avatar_${num.padStart(3, '0')}`;
  }

  // If it contains "avatar" but doesn't match patterns, try to extract
  if (iconName.toLowerCase().includes('avatar')) {
    // Try to find any number sequence
    const anyNumMatch = iconName.match(/(\d{3,4})/);
    if (anyNumMatch) {
      return `avatar_${anyNumMatch[1]}`;
    }
  }

  // Can't normalize - return null (will skip this icon)
  return null;
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

    // Step 3: Prepare avatar list
    // Use the actual icon name from the database, but normalize for grouping/usage tracking
    // The API will resolve the icon name from the icons table
    const processedAvatars: Array<AvatarIcon & { originalName: string; normalizedForLookup: string }> = avatarIcons
      .map(icon => {
        // Try to normalize to see if it matches API pattern
        const normalizedForLookup = normalizeAvatarNameForStorage(icon.name);
        // Use original icon name for storage (API will look it up)
        // But track by normalized name for usage counting
        return {
          name: icon.name, // Store original name from icons table
          display_name: icon.display_name,
          originalName: icon.name,
          normalizedForLookup: normalizedForLookup || icon.name, // For usage tracking
        };
      })
      .filter(avatar => {
        // Only keep icons that can potentially be resolved (have numeric patterns)
        return avatar.normalizedForLookup && /^avatar_(\d{3,4})$/.test(avatar.normalizedForLookup);
      });

    // Group by normalized name for usage tracking, but keep all original names
    const groupedByNormalized = new Map<string, Array<AvatarIcon & { originalName: string; normalizedForLookup: string }>>();
    processedAvatars.forEach(avatar => {
      const key = avatar.normalizedForLookup;
      if (!groupedByNormalized.has(key)) {
        groupedByNormalized.set(key, []);
      }
      groupedByNormalized.get(key)!.push(avatar);
    });

    // For each normalized group, use the first original icon name
    const uniqueAvatars: Array<AvatarIcon & { normalizedForLookup: string }> = Array.from(
      groupedByNormalized.entries()
    ).map(([normalized, originals]) => ({
      name: originals[0].name, // Use first original name in group
      display_name: originals[0].display_name,
      normalizedForLookup: normalized,
    }));

    console.log(`📊 Using ${uniqueAvatars.length} unique avatar icons (from ${processedAvatars.length} total icons)\n`);
    
    if (uniqueAvatars.length === 0) {
      throw new Error('No valid avatar icons found after normalization. Check icon naming in database.');
    }

    // Check if we have enough avatars
    const maxAgentsPerAvatar = 3;
    const maxAgents = uniqueAvatars.length * maxAgentsPerAvatar;
    if (agents.length > maxAgents) {
      console.warn(
        `⚠️  Warning: You have ${agents.length} agents but only ${maxAgents} total avatar slots (${uniqueAvatars.length} avatars × ${maxAgentsPerAvatar} uses each)\n`
      );
    }

    // Step 4: Count current avatar usage
    // Track usage by normalized name for the 3-use limit, but store original icon name
    const avatarUsageCount = new Map<string, number>();
    uniqueAvatars.forEach(avatar => {
      avatarUsageCount.set(avatar.normalizedForLookup, 0);
    });

    // Map normalized names to original icon names
    const normalizedToOriginal = new Map<string, string>();
    uniqueAvatars.forEach(avatar => {
      normalizedToOriginal.set(avatar.normalizedForLookup, avatar.name);
    });

    // Count existing avatar assignments
    agents.forEach(agent => {
      const metadata = agent.metadata || {};
      const currentAvatar = metadata.avatar;
      if (currentAvatar) {
        // Try to normalize current avatar to check usage
        const normalizedCurrent = normalizeAvatarNameForStorage(currentAvatar);
        if (normalizedCurrent && avatarUsageCount.has(normalizedCurrent)) {
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
    const getAvailableAvatars = (): Array<AvatarIcon & { normalizedForLookup: string }> => {
      return uniqueAvatars.filter(
        avatar => (avatarUsageCount.get(avatar.normalizedForLookup) || 0) < maxAgentsPerAvatar
      );
    };

    // Sort agents for consistent assignment
    const sortedAgents = [...agents].sort((a, b) => a.name.localeCompare(b.name));

    for (const agent of sortedAgents) {
      const metadata = agent.metadata || {};
      const currentAvatar = metadata.avatar;
      
      // Skip if agent already has an avatar assigned and it's within usage limits
      if (currentAvatar) {
        // Normalize current avatar to check usage
        const normalizedCurrent = normalizeAvatarNameForStorage(currentAvatar);
        const currentUsage = normalizedCurrent ? (avatarUsageCount.get(normalizedCurrent) || 0) : 0;
        
        // If avatar can be normalized, exists in our pool, and is within limits, keep it
        if (normalizedCurrent && avatarUsageCount.has(normalizedCurrent) && currentUsage < maxAgentsPerAvatar) {
          console.log(`⏭️  Skipping ${agent.name} - already has valid avatar: "${currentAvatar}" (normalized: ${normalizedCurrent})`);
          skippedCount++;
          continue;
        }
        // If avatar is over limit, wrong format, or doesn't exist, reassign
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

      // Round-robin: use the least-used avatar (by normalized name)
      const sortedAvailable = availableAvatars.sort((a, b) => {
        const usageA = avatarUsageCount.get(a.normalizedForLookup) || 0;
        const usageB = avatarUsageCount.get(b.normalizedForLookup) || 0;
        return usageA - usageB;
      });

      const assignedAvatar = sortedAvailable[0];
      // Store the ORIGINAL icon name from the icons table (not normalized)
      // The API will look this up in the icons table
      const avatarNameToStore = assignedAvatar.name;
      const normalizedForTracking = assignedAvatar.normalizedForLookup;

      // Update avatar usage count (track by normalized name)
      avatarUsageCount.set(
        normalizedForTracking,
        (avatarUsageCount.get(normalizedForTracking) || 0) + 1
      );

      // Update agent metadata with ORIGINAL icon name
      const updatedMetadata = {
        ...metadata,
        avatar: avatarNameToStore, // Store original icon name from icons table
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
          normalizedForTracking,
          (avatarUsageCount.get(normalizedForTracking) || 0) - 1
        );
        continue;
      }

      assignmentLog.push({
        agentName: agent.name,
        avatarName: avatarNameToStore,
      });

      const usage = avatarUsageCount.get(normalizedForTracking) || 0;
      console.log(
        `✅ Assigned "${avatarNameToStore}" to ${agent.name} (${usage}/${maxAgentsPerAvatar} uses, normalized: ${normalizedForTracking})`
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


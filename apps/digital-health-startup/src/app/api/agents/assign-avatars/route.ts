/**
 * TAG: AVATAR_ICON_ASSIGNMENT
 * 
 * API to automatically assign avatar icons to agents
 * - Ensures no more than 3 agents share the same icon
 * - Balances icon distribution across all agents
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Available avatar icons (diverse and professional)
const AVATAR_ICONS = [
  '🤖', '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '💊', '🏥', '🔬', '📊', '🧬',
  '🩺', '💉', '🧪', '📈', '🏛️', '⚖️', '📝', '🔍', '💼', '👨‍💼',
  '👩‍💼', '🎯', '🚀', '⚡', '🌟', '🧠', '💡', '🔧', '⚙️', '📋'
];

const MAX_AGENTS_PER_ICON = 3;

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get all agents
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, display_name, metadata, avatar')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Failed to fetch agents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: error.message },
        { status: 500 }
      );
    }
    
    if (!agents || agents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No agents to update',
        updated: 0
      });
    }
    
    // Count icon usage
    const iconUsage: Record<string, number> = {};
    const agentsToUpdate: Array<{ id: string; newAvatar: string }> = [];
    
    // First pass: count existing icons
    agents.forEach(agent => {
      const currentAvatar = agent.metadata?.avatar || agent.avatar || '🤖';
      iconUsage[currentAvatar] = (iconUsage[currentAvatar] || 0) + 1;
    });
    
    // Second pass: reassign icons if needed
    agents.forEach(agent => {
      const currentAvatar = agent.metadata?.avatar || agent.avatar || '🤖';
      
      // If icon is overused, reassign
      if (iconUsage[currentAvatar] > MAX_AGENTS_PER_ICON) {
        // Find an icon with lowest usage
        let bestIcon = AVATAR_ICONS[0];
        let lowestUsage = iconUsage[bestIcon] || 0;
        
        for (const icon of AVATAR_ICONS) {
          const usage = iconUsage[icon] || 0;
          if (usage < lowestUsage && usage < MAX_AGENTS_PER_ICON) {
            bestIcon = icon;
            lowestUsage = usage;
          }
        }
        
        // Assign new icon
        agentsToUpdate.push({
          id: agent.id,
          newAvatar: bestIcon
        });
        
        // Update usage counts
        iconUsage[currentAvatar]--;
        iconUsage[bestIcon] = (iconUsage[bestIcon] || 0) + 1;
      }
    });
    
    // Update agents with new avatars
    const updatePromises = agentsToUpdate.map(async ({ id, newAvatar }) => {
      const agent = agents.find(a => a.id === id);
      if (!agent) return null;
      
      const metadata = agent.metadata || {};
      const updatedMetadata = {
        ...metadata,
        avatar: newAvatar
      };
      
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        console.error(`Failed to update agent ${id}:`, updateError);
        return null;
      }
      
      return { id, name: agent.name, newAvatar };
    });
    
    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(r => r !== null);
    
    // Return summary
    const iconDistribution = Object.entries(iconUsage)
      .map(([icon, count]) => ({ icon, count }))
      .sort((a, b) => b.count - a.count);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${successfulUpdates.length} agents`,
      updated: successfulUpdates.length,
      totalAgents: agents.length,
      updates: successfulUpdates,
      iconDistribution,
      maxPerIcon: MAX_AGENTS_PER_ICON
    });
    
  } catch (error) {
    console.error('Avatar assignment error:', error);
    return NextResponse.json(
      {
        error: 'Failed to assign avatars',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET: View current icon distribution
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, display_name, metadata, avatar');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: error.message },
        { status: 500 }
      );
    }
    
    // Count icon usage
    const iconUsage: Record<string, Array<{ id: string; name: string }>> = {};
    
    (agents || []).forEach(agent => {
      const currentAvatar = agent.metadata?.avatar || agent.avatar || '🤖';
      if (!iconUsage[currentAvatar]) {
        iconUsage[currentAvatar] = [];
      }
      iconUsage[currentAvatar].push({
        id: agent.id,
        name: agent.display_name || agent.name
      });
    });
    
    // Format distribution
    const distribution = Object.entries(iconUsage)
      .map(([icon, agentList]) => ({
        icon,
        count: agentList.length,
        agents: agentList,
        isOverused: agentList.length > MAX_AGENTS_PER_ICON
      }))
      .sort((a, b) => b.count - a.count);
    
    const overusedIcons = distribution.filter(d => d.isOverused);
    
    return NextResponse.json({
      totalAgents: agents?.length || 0,
      uniqueIcons: distribution.length,
      maxPerIcon: MAX_AGENTS_PER_ICON,
      distribution,
      overusedIcons: overusedIcons.length > 0 ? overusedIcons : undefined,
      needsRebalancing: overusedIcons.length > 0
    });
    
  } catch (error) {
    console.error('Error getting icon distribution:', error);
    return NextResponse.json(
      {
        error: 'Failed to get icon distribution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


import { NextResponse, NextRequest } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';
import { withAgentAuth, type AgentPermissionContext } from '@/middleware/agent-auth';
import { createLogger } from '@/lib/services/observability/structured-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/[id]/agents - Get agents that have a specific skill
 */
export const GET = withAgentAuth(async (
  request: NextRequest,
  context: AgentPermissionContext,
  { params }: RouteParams
) => {
  const logger = createLogger();
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const operationId = `skill_agents_get_${Date.now()}`;

  try {
    const supabase = getServiceSupabaseClient();

    logger.info('skill_agents_get_started', {
      operationId,
      skillId: id,
      userId: context.user.id,
    });

    // First, find the skill by ID or slug
    let skillQuery = supabase.from('skills').select('id, name, slug');

    // UUID regex to determine if id is UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      skillQuery = skillQuery.eq('id', id);
    } else {
      skillQuery = skillQuery.eq('slug', id);
    }

    const { data: skill, error: skillError } = await skillQuery.single();

    if (skillError || !skill) {
      logger.info('skill_not_found', { operationId, skillId: id });
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Fetch agents that have this skill via the agent_skills junction table
    const { data: agentSkills, error: agentSkillsError } = await supabase
      .from('agent_skills')
      .select(`
        agent_id,
        proficiency_level,
        is_primary,
        usage_frequency,
        is_required,
        configuration,
        created_at,
        agents!inner (
          id,
          name,
          display_name,
          slug,
          tier,
          status,
          avatar_url,
          description,
          knowledge_domains,
          is_active
        )
      `)
      .eq('skill_id', skill.id);

    if (agentSkillsError) {
      logger.error('skill_agents_query_error', new Error(agentSkillsError.message), {
        operationId,
        code: agentSkillsError.code,
      });
      return NextResponse.json(
        { error: 'Failed to fetch agents for skill', details: agentSkillsError.message },
        { status: 500 }
      );
    }

    // Transform the data
    const agents = (agentSkills || []).map((as: any) => ({
      id: as.agents.id,
      name: as.agents.name,
      display_name: as.agents.display_name,
      slug: as.agents.slug,
      tier: as.agents.tier,
      status: as.agents.status,
      avatar_url: as.agents.avatar_url,
      description: as.agents.description,
      knowledge_domains: as.agents.knowledge_domains,
      is_active: as.agents.is_active,
      // Skill-specific data
      proficiency_level: as.proficiency_level,
      is_primary: as.is_primary,
      usage_frequency: as.usage_frequency,
      is_required: as.is_required,
      configuration: as.configuration,
      assigned_at: as.created_at,
    }));

    // Calculate statistics
    const proficiencyDistribution = agents.reduce((acc: Record<string, number>, agent: any) => {
      const level = agent.proficiency_level || 'unspecified';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const usageFrequencyDistribution = agents.reduce((acc: Record<string, number>, agent: any) => {
      const freq = agent.usage_frequency || 'unspecified';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {});

    const tierDistribution = agents.reduce((acc: Record<string, number>, agent: any) => {
      const tier = agent.tier || 'unspecified';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total_agents: agents.length,
      primary_agents: agents.filter((a: any) => a.is_primary).length,
      required_by: agents.filter((a: any) => a.is_required).length,
      active_agents: agents.filter((a: any) => a.is_active).length,
      proficiency_distribution: proficiencyDistribution,
      usage_frequency_distribution: usageFrequencyDistribution,
      tier_distribution: tierDistribution,
    };

    logger.info('skill_agents_get_success', {
      operationId,
      skillId: skill.id,
      agentCount: agents.length,
    });

    return NextResponse.json({
      skill: {
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
      },
      agents,
      stats,
    });
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error('Unknown error');
    logger.error('skill_agents_get_exception', errorObj, { operationId });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

/**
 * API Route: GET /api/personas/[id]
 * Fetches detailed persona information including JTBDs, workflows, and tasks
 */

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const supabase = getServiceSupabaseClient();

    console.log('🔍 Fetching persona details for ID:', id);
    console.log('🔍 ID type:', typeof id);
    console.log('🔍 ID length:', id?.length);

    // Try to fetch from dh_personas first
    const { data: dhPersona, error: dhError } = await supabase
      .from('dh_personas')
      .select(`
        *,
        industry:industries(id, industry_name, industry_code),
        primary_role:org_roles(
          id,
          org_role,
          department:org_departments(
            id,
            org_department,
            function:org_functions(id, org_function)
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    console.log('🔍 dh_personas query result:', {
      found: !!dhPersona,
      error: dhError?.message,
      errorDetails: dhError
    });

    let persona = null;
    let source = '';

    if (dhPersona && !dhError) {
      persona = { ...dhPersona, source: 'dh_personas' };
      source = 'dh_personas';
      console.log('✅ Found persona in dh_personas');
    } else {
      // Try org_personas
      console.log('🔍 Not found in dh_personas, trying org_personas...');
      const { data: orgPersona, error: orgError } = await supabase
        .from('org_personas')
        .select(`
          *,
          industry:industries(id, industry_name, industry_code),
          primary_role:org_roles(
            id,
            org_role,
            department:org_departments(
              id,
              org_department,
              function:org_functions(id, org_function)
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      console.log('🔍 org_personas query result:', {
        found: !!orgPersona,
        error: orgError?.message,
        errorDetails: orgError
      });

      if (orgPersona && !orgError) {
        persona = { ...orgPersona, source: 'org_personas' };
        source = 'org_personas';
        console.log('✅ Found persona in org_personas');
      } else {
        console.error('❌ Persona not found in either table', { dhError, orgError });
        return NextResponse.json(
          {
            success: false,
            error: 'Persona not found',
            details: dhError?.message || orgError?.message || 'No persona found with this ID',
          },
          { status: 404 }
        );
      }
    }

    // Fetch related JTBDs
    const { data: jtbds, error: jtbdsError } = await supabase
      .from('jtbd_org_persona_mapping')
      .select(`
        *,
        jtbd:jtbd_library(
          id,
          jtbd_code,
          title,
          statement,
          goal,
          description,
          frequency,
          importance,
          satisfaction,
          opportunity_score,
          success_metrics,
          category,
          industry:industries(id, industry_name)
        )
      `)
      .or(`persona_id.eq.${id},persona_dh_id.eq.${id}`)
      .order('relevance_score', { ascending: false, nullsFirst: false });

    if (jtbdsError) {
      console.error('Error fetching JTBDs:', jtbdsError);
    }

    console.log(`✅ Fetched ${jtbds?.length || 0} JTBDs for persona`);

    // Fetch related workflows (all workflows for now, can be filtered later)
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select(`
        id,
        code,
        name,
        description,
        status,
        complexity,
        estimated_duration,
        use_case_id,
        created_at,
        use_case:dh_use_case(
          id,
          code,
          title,
          description,
          domain,
          complexity,
          strategic_pillar
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (workflowsError) {
      console.error('Error fetching workflows:', workflowsError);
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflows`);

    // Fetch related tasks (all tasks for now, can be filtered later)
    const { data: tasks, error: tasksError } = await supabase
      .from('dh_task')
      .select(`
        id,
        code,
        name,
        description,
        task_type,
        status,
        complexity,
        estimated_duration,
        workflow_id,
        agent_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks`);

    // Calculate detailed statistics
    const highOpportunityJtbds = jtbds?.filter((j: any) => j.jtbd?.opportunity_score >= 15) || [];
    const avgImportance = jtbds?.length
      ? jtbds.reduce((sum: number, j: any) => sum + (j.jtbd?.importance || 0), 0) / jtbds.length
      : 0;
    const avgSatisfaction = jtbds?.length
      ? jtbds.reduce((sum: number, j: any) => sum + (j.jtbd?.satisfaction || 0), 0) / jtbds.length
      : 0;

    // Score breakdown
    const scoreBreakdown = {
      value_score: persona.value_score || 0,
      pain_score: persona.pain_score || 0,
      adoption_score: persona.adoption_score || 0,
      ease_score: persona.ease_score || 0,
      strategic_score: persona.strategic_score || 0,
      network_score: persona.network_score || 0,
      priority_score: persona.priority_score || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        persona,
        jtbds: jtbds || [],
        workflows: workflows || [],
        tasks: tasks || [],
        stats: {
          jtbd_count: jtbds?.length || 0,
          workflow_count: workflows?.length || 0,
          task_count: tasks?.length || 0,
          high_opportunity_jtbds: highOpportunityJtbds.length,
          avg_jtbd_importance: Math.round(avgImportance * 10) / 10,
          avg_jtbd_satisfaction: Math.round(avgSatisfaction * 10) / 10,
          pain_points_count: Array.isArray(persona.pain_points) ? persona.pain_points.length : 0,
          responsibilities_count: Array.isArray(persona.responsibilities) ? persona.responsibilities.length : 0,
          goals_count: Array.isArray(persona.goals) ? persona.goals.length : 0,
        },
        scoreBreakdown,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching persona details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch persona details',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: GET /api/workflows/usecases
 * Fetches all use cases with workflow statistics
 */

import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    console.log('Fetching use cases from Supabase...');

    // Fetch all use cases
    const { data: useCases, error: useCasesError } = await supabase
      .from('dh_use_case')
      .select('*')
      .order('code', { ascending: true });

    if (useCasesError) {
      console.error('Use cases fetch error:', useCasesError);
      throw useCasesError;
    }

    console.log(`✅ Fetched ${useCases?.length || 0} use cases`);

    // Add domain field extracted from code (UC_CD_001 -> CD, UC_MA_001 -> MA)
    const useCasesWithDomain = useCases?.map(uc => ({
      ...uc,
      domain: uc.code?.split('_')[1] || 'UNKNOWN' // Extract CD, MA, RA, etc. from UC_CD_001
    })) || [];

    console.log('✅ Added domain field to use cases:', useCasesWithDomain.slice(0, 2));

    // Fetch workflow counts
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select('id, use_case_id');

    if (workflowsError) {
      console.error('Workflows fetch error:', workflowsError);
      throw workflowsError;
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflows`);

    // Fetch task counts
    const { data: tasks, error: tasksError } = await supabase
      .from('dh_task')
      .select('id, workflow_id');

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError);
      throw tasksError;
    }

    console.log(`✅ Fetched ${tasks?.length || 0} tasks`);

    // Calculate statistics
    const stats = {
      total_workflows: workflows?.length || 0,
      total_tasks: tasks?.length || 0,
      by_domain: useCasesWithDomain.reduce((acc: Record<string, number>, uc: any) => {
        acc[uc.domain] = (acc[uc.domain] || 0) + 1;
        return acc;
      }, {}),
      by_complexity: useCasesWithDomain.reduce((acc: Record<string, number>, uc: any) => {
        acc[uc.complexity] = (acc[uc.complexity] || 0) + 1;
        return acc;
      }, {}),
    };

    console.log('✅ Stats calculated:', JSON.stringify(stats, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        useCases: useCasesWithDomain,
        stats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching use cases:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch use cases',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


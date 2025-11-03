import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = getServiceSupabaseClient();

    console.log('Fetching use case:', code);

    // Fetch use case
    const { data: useCase, error: useCaseError } = await supabase
      .from('dh_use_case')
      .select('*')
      .eq('code', code)
      .single();

    if (useCaseError) {
      console.error('Use case fetch error:', useCaseError);
      throw useCaseError;
    }

    if (!useCase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Use case not found',
        },
        { status: 404 }
      );
    }

    console.log(`✅ Fetched use case: ${useCase.code}`);

    // Add domain field extracted from code
    const useCaseWithDomain = {
      ...useCase,
      domain: useCase.code?.split('_')[1] || 'UNKNOWN'
    };

    // Fetch workflows for this use case
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select('*')
      .eq('use_case_id', useCase.id)
      .order('position', { ascending: true });

    if (workflowsError) {
      console.error('Workflows fetch error:', workflowsError);
      throw workflowsError;
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflows`);

    return NextResponse.json({
      success: true,
      data: {
        useCase: useCaseWithDomain,
        workflows: workflows || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching use case:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch use case',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


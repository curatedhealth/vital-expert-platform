import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = getServiceSupabaseClient();

    console.log('Fetching use case/JTBD:', code);

    let useCase: any = null;
    let isJTBD = false;

    // Try fetching from dh_use_case first
    const { data: dhUseCase, error: useCaseError } = await supabase
      .from('dh_use_case')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (dhUseCase) {
      useCase = {
        ...dhUseCase,
        domain: dhUseCase.code?.split('_')[1] || 'UNKNOWN',
        source: 'Digital Health Use Cases',
      };
    } else {
      // Try fetching from jtbd_library (Medical Affairs)
      console.log('Trying to fetch JTBD with code:', code);

      const { data: jtbd, error: jtbdError } = await supabase
        .from('jtbd_library')
        .select('*')
        .eq('jtbd_code', code)
        .maybeSingle();

      console.log('JTBD query result:', { jtbd, jtbdError });

      // If not found by jtbd_code, try by id (only if it looks like a UUID)
      if (!jtbd && !jtbdError && isValidUuid(code)) {
        console.log('JTBD not found by jtbd_code, trying by id (UUID)...');
        const { data: jtbdById, error: jtbdByIdError } = await supabase
          .from('jtbd_library')
          .select('*')
          .eq('id', code)
          .maybeSingle();

        console.log('JTBD by id result:', { jtbdById, jtbdByIdError });

        if (jtbdById) {
          isJTBD = true;
          useCase = {
            id: jtbdById.id,
            code: jtbdById.jtbd_code || code,
            unique_id: jtbdById.unique_id,
            title: jtbdById.title || jtbdById.statement || 'Untitled JTBD',
            description: jtbdById.description || jtbdById.goal || '',
            domain: 'MA',
            complexity: jtbdById.complexity || 'INTERMEDIATE',
            strategic_pillar: jtbdById.function || 'Uncategorized',
            source: 'Medical Affairs JTBD Library',
            category: jtbdById.category,
            importance: jtbdById.importance,
            frequency: jtbdById.frequency,
            sector: 'Pharma',
            industry: 'Pharma',
            deliverables: [],
            prerequisites: [],
          };
        }
      }

      if (jtbd) {
        isJTBD = true;
        useCase = {
          id: jtbd.id,
          code: jtbd.jtbd_code || code,
          unique_id: jtbd.unique_id,
          title: jtbd.title || jtbd.statement || 'Untitled JTBD',
          description: jtbd.description || jtbd.goal || '',
          domain: 'MA', // Medical Affairs
          complexity: jtbd.complexity || 'INTERMEDIATE',
          strategic_pillar: jtbd.function || 'Uncategorized',
          source: 'Medical Affairs JTBD Library',
          category: jtbd.category,
          importance: jtbd.importance,
          frequency: jtbd.frequency,
          sector: 'Pharma',
          industry: 'Pharma',
          deliverables: [],
          prerequisites: [],
        };
      }
    }

    if (!useCase) {
      console.log(`❌ Use case/JTBD not found: ${code}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Use case not found',
          details: `No use case or JTBD found with code: ${code}`,
          debugInfo: {
            code,
            checkedTables: ['dh_use_case', 'jtbd_library'],
          },
        },
        { status: 404 }
      );
    }

    console.log(`✅ Fetched ${isJTBD ? 'JTBD' : 'use case'}: ${useCase.code} from ${useCase.source}`);

    // Fetch workflows for this use case/JTBD
    const { data: workflows, error: workflowsError } = await supabase
      .from('dh_workflow')
      .select('*')
      .eq('use_case_id', useCase.id)
      .order('position', { ascending: true });

    if (workflowsError) {
      console.error('Workflows fetch error:', workflowsError);
      // Don't throw - just return empty workflows for JTBDs
    }

    console.log(`✅ Fetched ${workflows?.length || 0} workflows`);

    // Fetch tasks if we have workflows
    let tasks: any[] = [];
    if (workflows && workflows.length > 0) {
      const workflowIds = workflows.map((w: any) => w.id);
      const { data: tasksData } = await supabase
        .from('dh_task')
        .select('*')
        .in('workflow_id', workflowIds)
        .order('position', { ascending: true });

      tasks = tasksData || [];
      console.log(`✅ Fetched ${tasks.length} tasks across ${workflows.length} workflows`);
    }

    return NextResponse.json({
      success: true,
      data: {
        useCase,
        workflows: workflows || [],
        tasks: tasks || [],
        isJTBD,
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
        debugInfo: {
          message: error instanceof Error ? error.message : 'Unknown',
          code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
          details: error && typeof error === 'object' && 'details' in error ? error.details : undefined,
          hint: error && typeof error === 'object' && 'hint' in error ? error.hint : undefined,
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to validate UUID format
function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

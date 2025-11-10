import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/services/observability/structured-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { suiteId: string } }
) {
  const logger = createLogger();
  const operationId = `prompt_subsuites_get_${Date.now()}`;

  try {
    const supabase = await createClient();
    const { suiteId } = params;

    logger.info('prompt_subsuites_get_started', {
      operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
      operationId,
      suiteId,
    });

    // Fetch the suite from unified prompt_suites table
    const { data: suite, error: suiteError } = await supabase
      .from('prompt_suites')
      .select('*')
      .eq('unique_id', suiteId)
      .single();

    if (suiteError || !suite) {
      return NextResponse.json(
        { success: false, error: 'Suite not found' },
        { status: 404 }
      );
    }

    // Fetch all prompts for this suite to extract unique subsuites
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('subsuite')
      .eq('suite', suite.name)
      .not('subsuite', 'is', null)
      .eq('status', 'active');

    if (promptsError) {
      logger.error(
        'subsuites_fetch_error',
        new Error(promptsError.message),
        { suiteId, errorCode: promptsError.code }
      );

      return NextResponse.json(
        { success: false, error: 'Failed to fetch subsuites' },
        { status: 500 }
      );
    }

    // Extract unique subsuites and count prompts for each
    const subsuiteMap = new Map<string, number>();
    (prompts || []).forEach((p: any) => {
      if (p.subsuite) {
        subsuiteMap.set(p.subsuite, (subsuiteMap.get(p.subsuite) || 0) + 1);
      }
    });

    // Convert to array with statistics
    const subsuitesWithStats = Array.from(subsuiteMap.entries())
      .map(([name, count], index) => ({
        id: `${suite.id}-${index}`,
        unique_id: `SUBSUITE-${suite.acronym || 'UNKNOWN'}-${name.replace(/\s+/g, '-').toUpperCase()}`,
        name: name,
        description: `${name} prompts for ${suite.name}`,
        tags: [],
        metadata: {},
        position: index,
        statistics: {
          promptCount: count,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    logger.info('prompt_subsuites_get_completed', {
      operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
      operationId,
      suiteId,
      count: subsuitesWithStats.length,
    });

    return NextResponse.json({
      success: true,
      suite: {
        id: suite.id,
        unique_id: suite.unique_id,
        name: suite.name,
        description: suite.description,
        metadata: suite.metadata,
      },
      subsuites: subsuitesWithStats,
    });
  } catch (error) {
    logger.error(
      'prompt_subsuites_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts/suites/[suiteId]/subsuites',
        operationId,
      }
    );

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/services/observability/structured-logger';

export async function GET(request: NextRequest) {
  const logger = createLogger();
  const operationId = `prompt_suites_get_${Date.now()}`;

  try {
    const supabase = await createClient();

    logger.info('prompt_suites_get_started', {
      operation: 'GET /api/prompts/suites',
      operationId,
    });

    // Fetch all suites from unified prompt_suites table
    const { data: suites, error: suitesError } = await supabase
      .from('prompt_suites')
      .select('*')
      .eq('is_active', true)
      .order('position');

    if (suitesError) {
      logger.error('prompt_suites_fetch_error', suitesError, { operationId });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch suites' },
        { status: 500 }
      );
    }

    // Fetch all active prompts from unified prompts table
    const { data: allPrompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, suite, subsuite')
      .eq('status', 'active');

    if (promptsError) {
      logger.warn('prompts_fetch_error', { error: promptsError });
    }

    // Calculate statistics for each suite
    const suitesWithStats = (suites || []).map((suite: any) => {
      // Count prompts for this suite
      const suitePrompts = (allPrompts || []).filter(
        (p: any) => p.suite === suite.name
      );

      // Count unique subsuites
      const uniqueSubsuites = new Set(
        suitePrompts
          .filter((p: any) => p.subsuite)
          .map((p: any) => p.subsuite)
      ).size;

      return {
        id: suite.id,
        name: suite.name,
        description: suite.description,
        color: suite.color,
        category: suite.category,
        function: suite.function,
        statistics: {
          totalPrompts: suitePrompts.length,
          subsuites: uniqueSubsuites,
        },
        metadata: {
          acronym: suite.acronym,
          uniqueId: suite.unique_id,
          tagline: suite.tagline,
          domain: suite.domain,
        },
      };
    });

    logger.info('prompt_suites_get_completed', {
      operation: 'GET /api/prompts/suites',
      operationId,
      count: suitesWithStats.length,
    });

    return NextResponse.json({
      success: true,
      suites: suitesWithStats,
    });
  } catch (error) {
    logger.error(
      'prompt_suites_get_error',
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: 'GET /api/prompts/suites',
        operationId,
      }
    );

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

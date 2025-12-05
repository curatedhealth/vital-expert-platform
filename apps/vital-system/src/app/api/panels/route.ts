import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/service-client';

/**
 * GET /api/panels
 * List all available panel templates
 */
export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    console.log('[API] Fetching panels list...');
    const startTime = Date.now();

    // Build query
    let query = supabase
      .from('panels')
      .select('*')
      .order('name');

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: panels, error } = await query;

    if (error) {
      console.error('[API] Panels fetch error:', error);
      throw error;
    }

    // Get stats
    const stats = {
      total: panels?.length || 0,
      by_category: {} as Record<string, number>,
      by_mode: {} as Record<string, number>,
    };

    panels?.forEach(panel => {
      stats.by_category[panel.category] = (stats.by_category[panel.category] || 0) + 1;
      stats.by_mode[panel.mode] = (stats.by_mode[panel.mode] || 0) + 1;
    });

    const elapsed = Date.now() - startTime;
    console.log(`[API] ✅ Fetched ${panels?.length || 0} panels in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      data: {
        panels: panels || [],
        stats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] ❌ Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch panels',
        details: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: {
          message: error instanceof Error ? error.message : 'Unknown',
          code: (error as any)?.code,
        }
      },
      { status: 500 }
    );
  }
}

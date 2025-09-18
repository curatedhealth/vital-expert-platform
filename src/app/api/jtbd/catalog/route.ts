import { NextRequest, NextResponse } from 'next/server';
import { JTBDService, type JTBDFilters } from '@/lib/jtbd/jtbd-service';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Create server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create JTBD service with server-side client
    const jtbdService = new JTBDService(supabase);

    // Parse filters from query parameters
    const filters: JTBDFilters = {};

    if (searchParams.get('function')) {
      filters.function = searchParams.get('function')!;
    }

    if (searchParams.get('complexity')) {
      filters.complexity = searchParams.get('complexity')!;
    }

    if (searchParams.get('time_to_value')) {
      filters.time_to_value = searchParams.get('time_to_value')!;
    }

    if (searchParams.get('workshop_potential')) {
      filters.workshop_potential = searchParams.get('workshop_potential')!;
    }

    if (searchParams.get('tags')) {
      filters.tags = searchParams.get('tags')!.split(',').map(tag => tag.trim());
    }

    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    console.log('=== Fetching JTBD catalog ===');
    console.log('Filters applied:', filters);

    const jtbds = await jtbdService.getJTBDs(filters);

    console.log(`Found ${jtbds.length} JTBDs matching filters`);

    return NextResponse.json({
      success: true,
      data: jtbds,
      count: jtbds.length,
      filters: filters
    });

  } catch (error) {
    console.error('JTBD catalog API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch JTBD catalog',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
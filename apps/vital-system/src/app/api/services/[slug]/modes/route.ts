/**
 * Service Modes API
 * Manage service modes and configurations
 * 
 * Routes:
 *   GET /api/services/:slug/modes - List modes for a service
 *   GET /api/modes/:code - Get mode details
 *   GET /api/modes/:code/config - Get mode configuration
 *   GET /api/modes/:code/templates - Get templates for mode
 *   POST /api/modes/:code/templates - Link template to mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/services/[slug]/modes
 * List all modes for a service
 */
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { slug } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get service
    const { data: service, error: serviceError } = await supabase
      .from('services_registry')
      .select('id, service_name, display_name')
      .eq('service_slug', slug)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Get modes for service
    const { data: modes, error: modesError } = await supabase
      .from('service_modes')
      .select(`
        *,
        templates:service_mode_templates(
          id,
          template:template_id(id, template_name, display_name)
        )
      `)
      .eq('service_id', service.id)
      .is('deleted_at', null)
      .eq('is_enabled', true)
      .order('display_order');

    if (modesError) {
      console.error('Modes query error:', modesError);
      return NextResponse.json(
        { error: 'Failed to fetch modes', details: modesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      service: {
        id: service.id,
        name: service.service_name,
        displayName: service.display_name
      },
      modes: modes || [],
      count: modes?.length || 0
    });

  } catch (error) {
    console.error('Service modes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


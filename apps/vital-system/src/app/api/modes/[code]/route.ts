/**
 * Mode Details API
 * Get specific mode details and configuration
 * 
 * Routes:
 *   GET /api/modes/[code] - Get mode details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Params = {
  params: Promise<{
    code: string;
  }>;
};

/**
 * GET /api/modes/[code]
 * Get mode details with service and templates
 */
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { code } = await params;

    const { data, error } = await supabase
      .from('service_modes')
      .select(`
        *,
        service:service_id(
          id,
          service_name,
          display_name,
          icon,
          service_category
        ),
        templates:service_mode_templates(
          id,
          template_role,
          is_default,
          config_override,
          template:template_id(
            id,
            template_name,
            display_name,
            template_type,
            content,
            variables
          )
        ),
        workflow_template:workflow_template_id(
          id,
          name,
          description
        )
      `)
      .eq('mode_code', code)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Mode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mode: data
    });

  } catch (error) {
    console.error('Mode details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


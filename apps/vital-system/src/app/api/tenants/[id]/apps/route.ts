import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const tenantId = params.id;

    // Fetch tenant apps
    const { data, error } = await supabase
      .from('tenant_apps')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[Tenant Apps API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenant apps', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[Tenant Apps API] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

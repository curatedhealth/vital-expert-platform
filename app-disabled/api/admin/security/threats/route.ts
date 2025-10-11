import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth-middleware';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const severity = searchParams.get('severity');
      const type = searchParams.get('type');
      const resolved = searchParams.get('resolved');

      let query = supabase
        .from('threat_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (resolved !== null) {
        query = query.eq('resolved', resolved === 'true');
      }

      const { data: threats, error } = await query;

      if (error) {
        console.error('Error fetching threats:', error);
        return NextResponse.json(
          { error: 'Failed to fetch threats' },
          { status: 500 }
        );
      }

      return NextResponse.json({ threats: threats || [] });

    } catch (error) {
      console.error('Error fetching threats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch threats' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { threatId, action, notes } = body;

      if (!threatId || !action) {
        return NextResponse.json(
          { error: 'Missing required fields: threatId, action' },
          { status: 400 }
        );
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (action === 'resolve') {
        updateData = {
          ...updateData,
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: notes
        };
      } else if (action === 'mark_false_positive') {
        updateData = {
          ...updateData,
          false_positive: true,
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: notes
        };
      } else if (action === 'reopen') {
        updateData = {
          ...updateData,
          resolved: false,
          false_positive: false,
          resolved_at: null,
          resolved_by: null,
          resolution_notes: notes
        };
      } else {
        return NextResponse.json(
          { error: 'Invalid action. Must be: resolve, mark_false_positive, or reopen' },
          { status: 400 }
        );
      }

      const { data, error: updateError } = await supabase
        .from('threat_events')
        .update(updateData)
        .eq('id', threatId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating threat:', updateError);
        return NextResponse.json(
          { error: 'Failed to update threat' },
          { status: 500 }
        );
      }

      return NextResponse.json({ threat: data });

    } catch (error) {
      console.error('Error updating threat:', error);
      return NextResponse.json(
        { error: 'Failed to update threat' },
        { status: 500 }
      );
    }
  });
}

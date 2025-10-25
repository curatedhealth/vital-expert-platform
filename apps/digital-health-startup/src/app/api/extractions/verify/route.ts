import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  checkRateLimit,
  createVerificationAuditLog
} from '@/lib/middleware/verification-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/extractions/verify
 *
 * Handle entity verification actions (approve, reject, flag)
 *
 * Request body:
 * {
 *   entity_id: string;
 *   action: 'approve' | 'reject' | 'flag';
 *   notes?: string;
 * }
 *
 * Requires authentication with appropriate permissions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body first to determine required permission
    const body = await request.json();
    const { entity_id, action, notes } = body;

    if (!entity_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_id, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'flag'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: approve, reject, or flag' },
        { status: 400 }
      );
    }

    // Map action to required permission
    const permissionMap = {
      approve: 'canApprove',
      reject: 'canReject',
      flag: 'canFlag'
    } as const;

    const requiredPermission = permissionMap[action as keyof typeof permissionMap];

    // Check authentication and permissions
    const authResult = await requireAuth(request, requiredPermission);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check rate limit
    const rateLimit = checkRateLimit(user.id, 100, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimit.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60)
          }
        }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Map action to verification status
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged'
    } as const;

    const verification_status = statusMap[action as keyof typeof statusMap];

    // Update entity verification status
    const { data: entity, error: updateError } = await supabase
      .from('extracted_entities')
      .update({
        verification_status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', entity_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update entity:', updateError);
      return NextResponse.json(
        { error: 'Failed to update entity', details: updateError.message },
        { status: 500 }
      );
    }

    // Create audit log entry using middleware helper
    await createVerificationAuditLog({
      entityId: entity_id,
      action: action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'flagged',
      user,
      changes: {
        verification_status: {
          from: 'pending',
          to: verification_status
        }
      },
      reason: notes
    });

    // Remove from verification queue if exists
    const { error: queueError } = await supabase
      .from('entity_verification_queue')
      .update({
        status: 'completed',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', entity_id)
      .eq('status', 'pending');

    if (queueError) {
      console.warn('Failed to update verification queue:', queueError);
    }

    return NextResponse.json({
      success: true,
      entity,
      message: `Entity ${action}d successfully`
    });

  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process verification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/extractions/verify
 *
 * Get pending entities for verification
 *
 * Query params:
 * - priority: filter by priority (low, normal, high, urgent)
 * - limit: number of entities to return (default 50)
 * - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get pending entities from verification queue
    let query = supabase
      .from('entity_verification_queue')
      .select(`
        *,
        entity:extracted_entities(*)
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: queueItems, error } = await query;

    if (error) {
      console.error('Failed to fetch verification queue:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verification queue', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('entity_verification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (countError) {
      console.warn('Failed to get total count:', countError);
    }

    return NextResponse.json({
      success: true,
      items: queueItems || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Verification queue API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch verification queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

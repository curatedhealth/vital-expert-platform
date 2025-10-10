import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userEmail, scope, action } = await request.json();

    if (!userEmail || !scope || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Test the check_user_permission function
    const { data, error } = await supabase.rpc('check_user_permission', {
      user_email: userEmail,
      permission_scope: scope,
      permission_action: action
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return NextResponse.json({
      success: data,
      userEmail,
      scope,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Permission test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing userEmail parameter' },
        { status: 400 }
      );
    }

    // Test the get_user_role function
    const { data: role, error: roleError } = await supabase.rpc('get_user_role', {
      user_email: userEmail
    });

    // Test the is_admin_user function
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user', {
      user_email: userEmail
    });

    if (roleError) {
      return NextResponse.json({
        role: null,
        isAdmin: null,
        error: roleError.message,
        details: roleError
      });
    }

    if (adminError) {
      return NextResponse.json({
        role,
        isAdmin: null,
        error: adminError.message,
        details: adminError
      });
    }

    return NextResponse.json({
      role,
      isAdmin,
      userEmail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Role test error:', error);
    return NextResponse.json(
      { 
        role: null,
        isAdmin: null,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

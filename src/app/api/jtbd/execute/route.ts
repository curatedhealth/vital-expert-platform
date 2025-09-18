import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { JTBDExecutionEngine } from '@/lib/jtbd/execution-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jtbd_id, user_id, execution_mode, input_data } = body;

    if (!jtbd_id || !user_id || !execution_mode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: jtbd_id, user_id, execution_mode'
        },
        { status: 400 }
      );
    }

    console.log('=== Starting JTBD Execution ===');
    console.log('JTBD ID:', jtbd_id);
    console.log('User ID:', user_id);
    console.log('Mode:', execution_mode);

    // Create server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create execution engine with server-side client
    const executionEngine = new JTBDExecutionEngine(supabase);

    // Start execution
    const result = await executionEngine.startExecution({
      jtbd_id,
      user_id,
      execution_mode,
      input_data
    });

    console.log(`✅ Execution started with ID: ${result.execution_id}`);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'JTBD execution started successfully'
    });

  } catch (error) {
    console.error('JTBD execution API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start JTBD execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const execution_id = searchParams.get('execution_id');

    if (!execution_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing execution_id parameter'
        },
        { status: 400 }
      );
    }

    console.log(`=== Getting execution progress for ID: ${execution_id} ===`);

    // Create server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create execution engine with server-side client
    const executionEngine = new JTBDExecutionEngine(supabase);

    // Get execution progress
    const progress = await executionEngine.getExecutionProgress(parseInt(execution_id));

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Execution not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('JTBD execution progress API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get execution progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Check for duplicate agent IDs
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from('agents')
      .select('id')
      .order('id');

    if (duplicateError) {
      return NextResponse.json({
        error: 'Failed to check for duplicates',
        details: duplicateError.message
      }, { status: 500 });
    }

    // Count occurrences of each ID
    const idCounts = duplicateCheck?.reduce((acc, agent) => {
      acc[agent.id] = (acc[agent.id] || 0) + 1;
      return acc;
    }, { /* TODO: implement */ } as Record<string, number>) || { /* TODO: implement */ };

    const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);

    // Also test a simple update query to see what happens
    const testId = duplicateCheck?.[0]?.id;
    if (testId) {
      const { data: testUpdate, error: testUpdateError } = await supabase
        .from('agents')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId)
        .select()
        .single();

      return NextResponse.json({
        totalAgents: duplicateCheck?.length || 0,
        duplicates: duplicates,
        testUpdateResult: testUpdateError ? {
          error: testUpdateError.message,
          code: testUpdateError.code,
          details: testUpdateError.details
        } : {
          success: true,
          data: testUpdate
        }
      });
    }

    return NextResponse.json({
      totalAgents: duplicateCheck?.length || 0,
      duplicates: duplicates,
      testUpdateResult: 'No agents found to test'
    });

  } catch (error) {
    console.error('Debug agents error:', error);
    return NextResponse.json(
      { error: 'Failed to debug agents', details: String(error) },
      { status: 500 }
    );
  }
}
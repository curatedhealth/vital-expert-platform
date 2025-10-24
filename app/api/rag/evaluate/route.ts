/**
 * RAG Evaluation API Endpoint
 * Implements RAGAs evaluation framework for automated quality metrics
 */

import { NextRequest, NextResponse } from 'next/server';

import { RAGASEvaluator, BatchRAGEvaluator, RAGEvaluationInput } from '@/features/rag/evaluation/ragas-evaluator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      answer, 
      contexts, 
      ground_truth, 
      retrieval_strategy, 
      response_time_ms, 
      session_id, 
      user_id,
      batch_evaluation = false,
      batch_inputs = []
    } = body;

    // Validate required fields
    if (!query || !answer || !contexts || !retrieval_strategy || !response_time_ms) {
      return NextResponse.json(
        { error: 'Missing required fields: query, answer, contexts, retrieval_strategy, response_time_ms' },
        { status: 400 }
      );
    }

    if (batch_evaluation && batch_inputs.length > 0) {
      // Batch evaluation
      const batchEvaluator = new BatchRAGEvaluator();
      const result = await batchEvaluator.evaluateBatch(batch_inputs);
      
      return NextResponse.json({
        success: true,
        type: 'batch',
        result
      });
    } else {
      // Single evaluation
      const evaluator = new RAGASEvaluator();
      
      const evaluationInput: RAGEvaluationInput = {
        query,
        answer,
        contexts: contexts.map((ctx: any) => ({
          pageContent: ctx.content || ctx.pageContent,
          metadata: ctx.metadata || {}
        })),
        ground_truth,
        retrieval_strategy,
        response_time_ms,
        session_id,
        user_id
      };

      const result = await evaluator.evaluate(evaluationInput);
      
      return NextResponse.json({
        success: true,
        type: 'single',
        result
      });
    }
  } catch (error) {
    console.error('RAG evaluation error:', error);
    return NextResponse.json(
      { 
        error: 'RAG evaluation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timePeriod = searchParams.get('time_period') || 'day';
    const daysBack = parseInt(searchParams.get('days_back') || '7');
    const strategy = searchParams.get('strategy');
    const action = searchParams.get('action') || 'summary';

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (action) {
      case 'summary':
        // Get performance summary
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_rag_performance_summary', {
            time_period: timePeriod,
            days_back: daysBack
          });

        if (summaryError) throw summaryError;

        return NextResponse.json({
          success: true,
          action: 'summary',
          data: summaryData
        });

      case 'strategy_comparison':
        // Get strategy comparison
        const { data: strategyData, error: strategyError } = await supabase
          .rpc('compare_retrieval_strategies', {
            days_back: daysBack
          });

        if (strategyError) throw strategyError;

        return NextResponse.json({
          success: true,
          action: 'strategy_comparison',
          data: strategyData
        });

      case 'alerts':
        // Get performance alerts
        const { data: alertsData, error: alertsError } = await supabase
          .rpc('check_rag_performance_alerts');

        if (alertsError) throw alertsError;

        return NextResponse.json({
          success: true,
          action: 'alerts',
          data: alertsData
        });

      case 'dashboard':
        // Get dashboard data
        let query = supabase
          .from('rag_performance_dashboard')
          .select('*')
          .order('hour', { ascending: false })
          .limit(24);

        if (strategy) {
          query = query.eq('retrieval_strategy', strategy);
        }

        const { data: dashboardData, error: dashboardError } = await query;

        if (dashboardError) throw dashboardError;

        return NextResponse.json({
          success: true,
          action: 'dashboard',
          data: dashboardData
        });

      case 'recent_evaluations':
        // Get recent evaluations
        let recentQuery = supabase
          .from('rag_evaluations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (strategy) {
          recentQuery = recentQuery.eq('retrieval_strategy', strategy);
        }

        const { data: recentData, error: recentError } = await recentQuery;

        if (recentError) throw recentError;

        return NextResponse.json({
          success: true,
          action: 'recent_evaluations',
          data: recentData
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: summary, strategy_comparison, alerts, dashboard, recent_evaluations' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('RAG evaluation GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch RAG evaluation data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

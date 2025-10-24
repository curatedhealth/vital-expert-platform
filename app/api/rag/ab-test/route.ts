/**
 * A/B Testing API Endpoint
 * Enables systematic comparison of RAG strategies
 */

import { NextRequest, NextResponse } from 'next/server';

import { abTestingFramework, ABTestConfig } from '@/features/rag/testing/ab-testing-framework';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...config } = body;

    switch (action) {
      case 'create_test':
        return await createABTest(config);
      case 'get_results':
        return await getTestResults(config.testId);
      case 'list_tests':
        return await listTests();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: create_test, get_results, list_tests' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B testing API error:', error);
    return NextResponse.json(
      { 
        error: 'A/B testing operation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function createABTest(config: ABTestConfig) {
  try {
    // Validate required fields
    if (!config.testName || !config.strategies || !config.testQueries) {
      return NextResponse.json(
        { error: 'Missing required fields: testName, strategies, testQueries' },
        { status: 400 }
      );
    }

    // Set defaults
    const testConfig: ABTestConfig = {
      testName: config.testName,
      description: config.description || '',
      strategies: config.strategies,
      testQueries: config.testQueries,
      sampleSize: config.sampleSize || 50,
      confidenceLevel: config.confidenceLevel || 0.95,
      maxDuration: config.maxDuration || 24,
      evaluationMetrics: config.evaluationMetrics || ['overall_score', 'response_time', 'precision', 'recall'],
    };

    const testId = await abTestingFramework.createABTest(testConfig);

    return NextResponse.json({
      success: true,
      testId,
      message: `A/B test '${testConfig.testName}' created successfully`
    });
  } catch (error) {
    console.error('Failed to create A/B test:', error);
    return NextResponse.json(
      { error: 'Failed to create A/B test', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getTestResults(testId: string) {
  try {
    if (!testId) {
      return NextResponse.json(
        { error: 'Missing testId parameter' },
        { status: 400 }
      );
    }

    const results = await abTestingFramework.getTestResults(testId);

    if (!results) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Failed to get test results:', error);
    return NextResponse.json(
      { error: 'Failed to get test results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function listTests() {
  try {
    const tests = await abTestingFramework.listTests();

    return NextResponse.json({
      success: true,
      tests
    });
  } catch (error) {
    console.error('Failed to list tests:', error);
    return NextResponse.json(
      { error: 'Failed to list tests', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const action = searchParams.get('action') || 'list_tests';

    switch (action) {
      case 'get_results':
        if (!testId) {
          return NextResponse.json(
            { error: 'Missing testId parameter' },
            { status: 400 }
          );
        }
        return await getTestResults(testId);
      case 'list_tests':
        return await listTests();
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: get_results, list_tests' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B testing GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch A/B testing data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

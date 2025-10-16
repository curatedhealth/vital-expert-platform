// CRITICAL: Enhanced route with detailed error logging
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { NextRequest, NextResponse } from 'next/server';

/**
 * Comprehensive diagnostic endpoint
 * Tests all dependencies and provides detailed error information
 */
export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {
      imports: { status: 'pending', errors: [] },
      environment: { status: 'pending', errors: [], variables: {} },
      services: { status: 'pending', errors: [] },
      dependencies: { status: 'pending', errors: [] }
    }
  };

  // Test 1: Import Tests
  try {
    console.log('🧪 Testing imports...');
    
    // Test core Next.js imports
    const { NextResponse: TestNextResponse } = await import('next/server');
    diagnostics.tests.imports.nextjs = '✅ Working';
    
    // Test LangChain imports
    try {
      const { BaseMessage } = await import('@langchain/core/messages');
      diagnostics.tests.imports.langchain_core = '✅ Working';
    } catch (e: any) {
      diagnostics.tests.imports.langchain_core = `❌ Failed: ${e.message}`;
      diagnostics.tests.imports.errors.push(`LangChain Core: ${e.message}`);
    }
    
    // Test LangGraph imports
    try {
      const { StateGraph } = await import('@langchain/langgraph');
      diagnostics.tests.imports.langgraph = '✅ Working';
    } catch (e: any) {
      diagnostics.tests.imports.langgraph = `❌ Failed: ${e.message}`;
      diagnostics.tests.imports.errors.push(`LangGraph: ${e.message}`);
    }
    
    // Test Supabase imports
    try {
      const { createClient } = await import('@supabase/supabase-js');
      diagnostics.tests.imports.supabase = '✅ Working';
    } catch (e: any) {
      diagnostics.tests.imports.supabase = `❌ Failed: ${e.message}`;
      diagnostics.tests.imports.errors.push(`Supabase: ${e.message}`);
    }
    
    // Test workflow imports
    try {
      const { streamModeAwareWorkflow } = await import('@/features/chat/services/ask-expert-graph');
      diagnostics.tests.imports.workflow = '✅ Working';
    } catch (e: any) {
      diagnostics.tests.imports.workflow = `❌ Failed: ${e.message}`;
      diagnostics.tests.imports.errors.push(`Workflow: ${e.message}`);
    }
    
    diagnostics.tests.imports.status = diagnostics.tests.imports.errors.length === 0 ? 'passed' : 'failed';
  } catch (error: any) {
    diagnostics.tests.imports.status = 'failed';
    diagnostics.tests.imports.errors.push(`Import test failed: ${error.message}`);
  }

  // Test 2: Environment Variables
  try {
    console.log('🧪 Testing environment variables...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY'
    ];
    
    const optionalVars = [
      'LANGCHAIN_API_KEY',
      'LANGCHAIN_PROJECT',
      'LANGCHAIN_TRACING_V2'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      diagnostics.tests.environment.variables[varName] = {
        present: !!value,
        length: value ? value.length : 0,
        masked: value ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` : 'NOT SET'
      };
      
      if (!value) {
        diagnostics.tests.environment.errors.push(`Missing required variable: ${varName}`);
      }
    });
    
    optionalVars.forEach(varName => {
      const value = process.env[varName];
      diagnostics.tests.environment.variables[varName] = {
        present: !!value,
        optional: true
      };
    });
    
    diagnostics.tests.environment.status = diagnostics.tests.environment.errors.length === 0 ? 'passed' : 'failed';
  } catch (error: any) {
    diagnostics.tests.environment.status = 'failed';
    diagnostics.tests.environment.errors.push(`Environment test failed: ${error.message}`);
  }

  // Test 3: Service Initialization
  try {
    console.log('🧪 Testing service initialization...');
    
    // Test Supabase connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // Test connection with a simple query
        const { error } = await supabase.from('agents').select('count').limit(1);
        
        if (error) {
          diagnostics.tests.services.supabase = `❌ Connection failed: ${error.message}`;
          diagnostics.tests.services.errors.push(`Supabase: ${error.message}`);
        } else {
          diagnostics.tests.services.supabase = '✅ Connected';
        }
      } catch (e: any) {
        diagnostics.tests.services.supabase = `❌ Failed: ${e.message}`;
        diagnostics.tests.services.errors.push(`Supabase initialization: ${e.message}`);
      }
    } else {
      diagnostics.tests.services.supabase = '⚠️ Skipped (missing env vars)';
    }
    
    diagnostics.tests.services.status = diagnostics.tests.services.errors.length === 0 ? 'passed' : 'failed';
  } catch (error: any) {
    diagnostics.tests.services.status = 'failed';
    diagnostics.tests.services.errors.push(`Service test failed: ${error.message}`);
  }

  // Test 4: Dependency Versions
  try {
    console.log('🧪 Checking dependency versions...');
    
    const packageJson = await import('../../../../package.json');
    
    diagnostics.tests.dependencies.versions = {
      '@langchain/core': packageJson.dependencies?.['@langchain/core'] || 'not installed',
      '@langchain/langgraph': packageJson.dependencies?.['@langchain/langgraph'] || 'not installed',
      '@langchain/openai': packageJson.dependencies?.['@langchain/openai'] || 'not installed',
      '@supabase/supabase-js': packageJson.dependencies?.['@supabase/supabase-js'] || 'not installed',
      'next': packageJson.dependencies?.['next'] || 'unknown'
    };
    
    diagnostics.tests.dependencies.status = 'passed';
  } catch (error: any) {
    diagnostics.tests.dependencies.status = 'failed';
    diagnostics.tests.dependencies.errors.push(`Dependency check failed: ${error.message}`);
  }

  // Overall status
  const allTestsPassed = Object.values(diagnostics.tests).every(
    (test: any) => test.status === 'passed'
  );
  
  diagnostics.overall_status = allTestsPassed ? '✅ All systems operational' : '❌ Issues detected';
  diagnostics.can_process_requests = allTestsPassed;

  // Return comprehensive diagnostics
  return NextResponse.json(diagnostics, {
    status: allTestsPassed ? 200 : 500,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use GET method for diagnostics' },
    { status: 405 }
  );
}

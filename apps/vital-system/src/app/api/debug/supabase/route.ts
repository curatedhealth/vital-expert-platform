import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Connection Diagnostic Endpoint
 * Tests all aspects of Supabase connectivity
 * 
 * Usage: GET /api/debug/supabase
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    tests: {},
    errors: [],
    warnings: [],
    recommendations: [],
  };

  try {
    // Test 1: Check Environment Variables
    diagnostics.tests.environment_variables = {
      status: 'checking',
      details: {},
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    diagnostics.tests.environment_variables.details = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? '✅ Set' : '❌ Missing',
    };

    if (!supabaseUrl || !supabaseAnonKey) {
      diagnostics.tests.environment_variables.status = 'failed';
      diagnostics.errors.push('Missing required environment variables');
      diagnostics.recommendations.push(
        'Create .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
      diagnostics.status = 'failed';
      return NextResponse.json(diagnostics, { status: 500 });
    }

    diagnostics.tests.environment_variables.status = 'passed';

    // Test 2: Create Supabase Client (Anon Key)
    diagnostics.tests.anon_client = {
      status: 'checking',
      details: {},
    };

    let anonClient;
    try {
      anonClient = createClient(supabaseUrl, supabaseAnonKey);
      diagnostics.tests.anon_client.status = 'passed';
      diagnostics.tests.anon_client.details.client_created = '✅ Success';
    } catch (error) {
      diagnostics.tests.anon_client.status = 'failed';
      diagnostics.tests.anon_client.details.error = error instanceof Error ? error.message : String(error);
      diagnostics.errors.push(`Failed to create anon client: ${error}`);
    }

    // Test 3: Test Database Connection (Simple Query)
    if (anonClient) {
      diagnostics.tests.database_connection = {
        status: 'checking',
        details: {},
      };

      try {
        // Try a simple query that should work even with RLS
        const { data, error, status, statusText } = await anonClient
          .from('agents')
          .select('count', { count: 'exact', head: true });

        if (error) {
          diagnostics.tests.database_connection.status = 'failed';
          diagnostics.tests.database_connection.details = {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          };
          diagnostics.errors.push(`Database query failed: ${error.message}`);
          
          if (error.code === 'PGRST116') {
            diagnostics.warnings.push('Table "agents" may not exist in database');
            diagnostics.recommendations.push('Run database migrations to create agents table');
          } else if (error.code === '42501') {
            diagnostics.warnings.push('RLS (Row Level Security) may be blocking access');
            diagnostics.recommendations.push('Check RLS policies on agents table');
          }
        } else {
          diagnostics.tests.database_connection.status = 'passed';
          diagnostics.tests.database_connection.details = {
            connection: '✅ Connected',
            http_status: status,
            status_text: statusText,
          };
        }
      } catch (error) {
        diagnostics.tests.database_connection.status = 'failed';
        diagnostics.tests.database_connection.details.error = 
          error instanceof Error ? error.message : String(error);
        diagnostics.errors.push(`Connection test failed: ${error}`);
      }
    }

    // Test 4: Query Agents Table
    if (anonClient && diagnostics.tests.database_connection?.status === 'passed') {
      diagnostics.tests.agents_query = {
        status: 'checking',
        details: {},
      };

      try {
        const { data: agents, error, count } = await anonClient
          .from('agents')
          .select('id, name, status', { count: 'exact' })
          .limit(5);

        if (error) {
          diagnostics.tests.agents_query.status = 'failed';
          diagnostics.tests.agents_query.details = {
            error: error.message,
            code: error.code,
          };
          diagnostics.errors.push(`Agents query failed: ${error.message}`);
          
          if (error.message.includes('permission denied') || error.code === '42501') {
            diagnostics.recommendations.push(
              'RLS is blocking access. You may need to:\n' +
              '1. Be logged in as a user\n' +
              '2. Have proper RLS policies\n' +
              '3. Use service role key for admin operations'
            );
          }
        } else {
          diagnostics.tests.agents_query.status = 'passed';
          diagnostics.tests.agents_query.details = {
            total_count: count,
            sample_agents: agents?.length || 0,
            agents_sample: agents?.map(a => ({ id: a.id, name: a.name, status: a.status })),
          };

          if (count === 0) {
            diagnostics.warnings.push('No agents found in database');
            diagnostics.recommendations.push('Seed database with agents using migration scripts');
          }
        }
      } catch (error) {
        diagnostics.tests.agents_query.status = 'failed';
        diagnostics.tests.agents_query.details.error = 
          error instanceof Error ? error.message : String(error);
        diagnostics.errors.push(`Query execution failed: ${error}`);
      }
    }

    // Test 5: Service Role Key (Optional)
    if (supabaseServiceKey) {
      diagnostics.tests.service_role = {
        status: 'checking',
        details: {},
      };

      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: agents, error } = await adminClient
          .from('agents')
          .select('id, name')
          .limit(1);

        if (error) {
          diagnostics.tests.service_role.status = 'failed';
          diagnostics.tests.service_role.details = {
            error: error.message,
          };
          diagnostics.warnings.push('Service role key may be invalid');
        } else {
          diagnostics.tests.service_role.status = 'passed';
          diagnostics.tests.service_role.details = {
            connection: '✅ Service role working',
            bypasses_rls: true,
            agents_accessible: agents?.length || 0,
          };
        }
      } catch (error) {
        diagnostics.tests.service_role.status = 'failed';
        diagnostics.tests.service_role.details.error = 
          error instanceof Error ? error.message : String(error);
      }
    }

    // Overall Status
    const failedTests = Object.values(diagnostics.tests).filter(
      (test: any) => test.status === 'failed'
    ).length;

    if (failedTests === 0) {
      diagnostics.status = 'healthy';
    } else if (failedTests < Object.keys(diagnostics.tests).length) {
      diagnostics.status = 'degraded';
    } else {
      diagnostics.status = 'failed';
    }

    // Summary
    diagnostics.summary = {
      total_tests: Object.keys(diagnostics.tests).length,
      passed: Object.values(diagnostics.tests).filter((t: any) => t.status === 'passed').length,
      failed: failedTests,
      warnings: diagnostics.warnings.length,
    };

    return NextResponse.json(diagnostics, { 
      status: diagnostics.status === 'healthy' ? 200 : 500 
    });

  } catch (error) {
    diagnostics.status = 'error';
    diagnostics.errors.push(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json(diagnostics, { status: 500 });
  }
}


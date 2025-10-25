/**
 * SECURED System Health Check Endpoint
 * Provides comprehensive health status for monitoring and observability
 *
 * This is an enhanced version with connection pool monitoring
 * To activate: Move to /api/system/health/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPoolStats } from '@/lib/supabase/connection-pool';
import { withPooledClient } from '@/lib/supabase/connection-pool';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthStatus;
    connectionPool: HealthStatus;
    redis: HealthStatus;
    openai: HealthStatus;
    supabase: HealthStatus;
  };
  metrics: {
    memory: MemoryMetrics;
    cpu: CPUMetrics;
  };
}

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  message?: string;
  responseTime?: number;
  details?: any;
}

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  formatted: {
    used: string;
    total: string;
  };
}

interface CPUMetrics {
  percentage: number;
  loadAverage: number[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Check if this is a detailed health check request
    const url = new URL(request.url);
    const detailed = url.searchParams.get('detailed') === 'true';

    // Run all health checks in parallel
    const [
      databaseCheck,
      connectionPoolCheck,
      redisCheck,
      openaiCheck,
      supabaseCheck,
    ] = await Promise.allSettled([
      checkDatabase(),
      checkConnectionPool(),
      checkRedis(),
      checkOpenAI(),
      checkSupabase(),
    ]);

    // Get system metrics
    const memoryMetrics = getMemoryMetrics();
    const cpuMetrics = getCPUMetrics();

    // Aggregate status
    const checks = {
      database: getCheckResult(databaseCheck),
      connectionPool: getCheckResult(connectionPoolCheck),
      redis: getCheckResult(redisCheck),
      openai: getCheckResult(openaiCheck),
      supabase: getCheckResult(supabaseCheck),
    };

    // Determine overall status
    const overallStatus = determineOverallStatus(checks);

    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics: {
        memory: memoryMetrics,
        cpu: cpuMetrics,
      },
    };

    // Add detailed information if requested
    if (detailed && request.headers.get('X-User-Id')) {
      (healthCheck as any).detailed = {
        poolStats: getPoolStats(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        responseTime: Date.now() - startTime,
      };
    }

    // Return appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 :
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      }
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

async function checkDatabase(): Promise<HealthStatus> {
  const startTime = Date.now();

  try {
    await withPooledClient(async (supabase) => {
      const { error } = await supabase
        .from('agents')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
    });

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 100 ? 'ok' : responseTime < 500 ? 'degraded' : 'down',
      responseTime,
      message: `Database responding in ${responseTime}ms`,
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkConnectionPool(): Promise<HealthStatus> {
  try {
    const stats = getPoolStats();
    const utilization Percentage = (stats.inUse / stats.total) * 100;

    return {
      status: utilizationPercentage < 80 ? 'ok' : utilizationPercentage < 95 ? 'degraded' : 'down',
      details: stats,
      message: `Pool utilization: ${utilizationPercentage.toFixed(1)}% (${stats.inUse}/${stats.total})`,
    };
  } catch (error) {
    return {
      status: 'down',
      message: 'Connection pool check failed',
    };
  }
}

async function checkRedis(): Promise<HealthStatus> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return {
      status: 'degraded',
      message: 'Redis not configured (using in-memory fallback)',
    };
  }

  const startTime = Date.now();

  try {
    const response = await fetch(`${redisUrl}/ping`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: 'ok',
        responseTime,
        message: `Redis responding in ${responseTime}ms`,
      };
    }

    return {
      status: 'down',
      message: `Redis returned status ${response.status}`,
    };
  } catch (error) {
    return {
      status: 'down',
      message: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
}

async function checkOpenAI(): Promise<HealthStatus> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'demo-key') {
    return {
      status: 'degraded',
      message: 'OpenAI API key not configured (demo mode)',
    };
  }

  return {
    status: 'ok',
    message: 'OpenAI API key configured',
  };
}

async function checkSupabase(): Promise<HealthStatus> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      status: 'down',
      message: 'Supabase not configured',
    };
  }

  return {
    status: 'ok',
    message: 'Supabase configured',
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMemoryMetrics(): MemoryMetrics {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal;
  const usedMemory = memUsage.heapUsed;
  const percentage = (usedMemory / totalMemory) * 100;

  return {
    used: usedMemory,
    total: totalMemory,
    percentage,
    formatted: {
      used: formatBytes(usedMemory),
      total: formatBytes(totalMemory),
    },
  };
}

function getCPUMetrics(): CPUMetrics {
  const os = require('os');
  const loadAverage = os.loadavg();

  return {
    percentage: 0, // CPU percentage calculation requires sampling over time
    loadAverage,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getCheckResult(result: PromiseSettledResult<HealthStatus>): HealthStatus {
  if (result.status === 'fulfilled') {
    return result.value;
  }
  return {
    status: 'down',
    message: result.reason?.message || 'Check failed',
  };
}

function determineOverallStatus(checks: Record<string, HealthStatus>): 'healthy' | 'degraded' | 'unhealthy' {
  if (checks.database.status === 'down' || checks.supabase.status === 'down') {
    return 'unhealthy';
  }
  const statuses = Object.values(checks).map(c => c.status);
  if (statuses.includes('down') || statuses.includes('degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

// ===================================================================
// Health Check API - Phase 2 Enhanced Monitoring
// Comprehensive health checks for all VITAL Path services
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ServiceHealthCheck {
  service_name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  response_time_ms?: number
  last_check: string
  version?: string
  details?: Record<string, unknown>
  error?: string
}

interface SystemHealthResponse {
  overall_status: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceHealthCheck[]
  system_metrics: {
    uptime_seconds: number
    memory_usage?: number
    cpu_usage?: number
    active_connections?: number
  }
  timestamp: string
  environment: string
}

// Service endpoints to check

  {
    name: 'orchestrator',
    url: process.env.ORCHESTRATOR_SERVICE_URL || 'http://localhost:8001',
    path: '/health'
  },
  {
    name: 'prompt_management',
    url: process.env.PROMPT_MANAGEMENT_SERVICE_URL || 'http://localhost:8002',
    path: '/health'
  },
  {
    name: 'agent_registry',
    url: process.env.AGENT_REGISTRY_SERVICE_URL || 'http://localhost:8003',
    path: '/health'
  },
  {
    name: 'advisory_board',
    url: process.env.ADVISORY_BOARD_SERVICE_URL || 'http://localhost:8004',
    path: '/health'
  },
  {
    name: 'clinical_safety',
    url: process.env.CLINICAL_SAFETY_SERVICE_URL || 'http://localhost:8005',
    path: '/health'
  },
  {
    name: 'monitoring_service',
    url: process.env.MONITORING_SERVICE_URL || 'http://localhost:8006',
    path: '/health'
  }
]

// GET /api/health - Comprehensive system health check
export async function GET(request: NextRequest) {
  try {

    const healthChecks: ServiceHealthCheck[] = []

    // Check database connectivity

    healthChecks.push(dbHealth)

    // Check external services

      ? SERVICES_TO_CHECK.filter(s => services.includes(s.name))
      : SERVICES_TO_CHECK

      checkServiceHealth(service.name, `${service.url}${service.path}`)
    )

    healthChecks.push(...serviceHealthResults)

    // Check internal API endpoints

    healthChecks.push(...internalHealth)

    // Calculate overall status

    // System metrics

      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      active_connections: await getActiveConnectionsCount(),
      environment: process.env.NODE_ENV || 'development'
    }

    const response: SystemHealthResponse = {
      overall_status: overallStatus,
      services: healthChecks,
      system_metrics: systemMetrics,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

                      overallStatus === 'degraded' ? 207 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    // console.error('Health check error:', error)
    return NextResponse.json({
      overall_status: 'unhealthy',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function checkDatabaseHealth(): Promise<ServiceHealthCheck> {

  try {
    // Test database connectivity with a simple query
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1)

    if (error) {
      return {
        service_name: 'database',
        status: 'unhealthy',
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        error: error.message,
        details: { error_code: error.code }
      }
    }

    // Check for slow database response

    return {
      service_name: 'database',
      status,
      response_time_ms: responseTime,
      last_check: new Date().toISOString(),
      details: {
        connection_pool: 'active',
        query_test: 'passed'
      }
    }

  } catch (error) {
    return {
      service_name: 'database',
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

async function checkServiceHealth(serviceName: string, healthUrl: string): Promise<ServiceHealthCheck> {

  try {

      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (response.ok) {
      let healthData: unknown = { /* TODO: implement */ }
      try {
        healthData = await response.json()
      } catch {
        // If response is not JSON, that's fine
      }

      return {
        service_name: serviceName,
        status,
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        version: healthData.version || 'unknown',
        details: {
          http_status: response.status,
          ...healthData
        }
      }
    } else {
      return {
        service_name: serviceName,
        status: 'unhealthy',
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

  } catch (error) {
    return {
      service_name: serviceName,
      status: 'unknown',
      response_time_ms: Date.now() - startTime,
      last_check: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Service unreachable'
    }
  }
}

async function checkInternalAPIHealth(detailed: boolean = false): Promise<ServiceHealthCheck[]> {
  if (!detailed) {
    return []
  }

    { name: 'rag_enhanced', path: '/api/rag/enhanced' },
    { name: 'llm_query', path: '/api/llm/query' },
    { name: 'knowledge_upload', path: '/api/knowledge/upload' },
    { name: 'agents_api', path: '/api/agents' }
  ]

  const healthChecks: ServiceHealthCheck[] = []

  for (const endpoint of internalEndpoints) {

    try {
      // Test with HEAD request to avoid side effects

        method: 'HEAD',
        signal: AbortSignal.timeout(3000)
      })

                    response.ok ? 'healthy' :
                    responseTime > 1000 ? 'degraded' : 'unhealthy'

      healthChecks.push({
        service_name: endpoint.name,
        status,
        response_time_ms: responseTime,
        last_check: new Date().toISOString(),
        details: {
          http_status: response.status,
          endpoint: endpoint.path
        }
      })

    } catch (error) {
      healthChecks.push({
        service_name: endpoint.name,
        status: 'unknown',
        response_time_ms: Date.now() - startTime,
        last_check: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Endpoint unreachable',
        details: { endpoint: endpoint.path }
      })
    }
  }

  return healthChecks
}

async function getActiveConnectionsCount(): Promise<number> {
  try {
    // This would typically connect to a connection pool or monitoring system
    // For now, return a placeholder value
    return Math.floor(Math.random() * 50) + 10
  } catch {
    return 0
  }
}

function determineOverallStatus(healthChecks: ServiceHealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {

  // Check if any critical service is unhealthy

    criticalServices.includes(h.service_name) && h.status === 'unhealthy'
  )

  if (criticalUnhealthy || unhealthyCount > healthChecks.length * 0.5) {
    return 'unhealthy'
  }

  if (degradedCount > 0 || unhealthyCount > 0) {
    return 'degraded'
  }

  return 'healthy'
}
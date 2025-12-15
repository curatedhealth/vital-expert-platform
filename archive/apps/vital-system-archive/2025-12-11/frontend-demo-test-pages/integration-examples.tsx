/**
 * UnifiedAnalyticsService Integration Example
 * 
 * This file demonstrates how to integrate the UnifiedAnalyticsService
 * into your RAG query services, agent execution services, and other
 * platform components.
 */

import { useState } from 'react';
import { getAnalyticsService } from '@/lib/analytics/UnifiedAnalyticsService';

// Placeholder functions - replace with your actual implementations
declare function yourRagQueryFunction(query: string): Promise<{
  llm_usage?: { model: string; prompt_tokens: number; completion_tokens: number };
  request_id: string;
  quality_score?: number;
  total_cost?: number;
  total_tokens?: number;
  text: string;
}>;
declare function yourDocumentProcessingFunction(file: File): Promise<{
  embedding_tokens?: number;
}>;
declare function yourWorkflowExecutionFunction(params: {
  tenant_id: string;
  user_id: string;
  workflow_id: string;
  input_data: unknown;
}): Promise<{
  steps_completed: number;
  output_data: unknown;
}>;

// ============================================================================
// EXAMPLE 1: RAG Query Service Integration
// ============================================================================

/**
 * Example: Tracking a RAG query from start to finish
 */
export async function executeRAGQueryWithAnalytics(params: {
  tenant_id: string;
  user_id: string;
  session_id: string;
  query: string;
  agent_id: string;
}) {
  const analytics = getAnalyticsService();
  const startTime = Date.now();
  
  try {
    // Track query submission event
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      session_id: params.session_id,
      event_type: 'query_submitted',
      event_category: 'user_behavior',
      event_data: {
        query: params.query,
        query_length: params.query.length,
        agent_id: params.agent_id,
      },
      source: 'ask_expert',
    });
    
    // Execute RAG query (your existing logic)
    const response = await yourRagQueryFunction(params.query);
    
    // Track LLM usage
    if (response.llm_usage) {
      await analytics.trackLLMUsage({
        tenant_id: params.tenant_id,
        user_id: params.user_id,
        session_id: params.session_id,
        model: response.llm_usage.model,
        prompt_tokens: response.llm_usage.prompt_tokens,
        completion_tokens: response.llm_usage.completion_tokens,
        agent_id: params.agent_id,
        request_id: response.request_id,
      });
    }
    
    // Track agent execution
    const executionTime = Date.now() - startTime;
    await analytics.trackAgentExecution({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      session_id: params.session_id,
      agent_id: params.agent_id,
      agent_type: 'ask_expert',
      execution_time_ms: executionTime,
      success: true,
      quality_score: response.quality_score,
      cost_usd: response.total_cost,
      total_tokens: response.total_tokens,
      query_length: params.query.length,
      response_length: response.text.length,
    });
    
    return response;
  } catch (err) {
    // Track failure
    const error = err as Error;
    const executionTime = Date.now() - startTime;
    await analytics.trackAgentExecution({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      session_id: params.session_id,
      agent_id: params.agent_id,
      agent_type: 'ask_expert',
      execution_time_ms: executionTime,
      success: false,
      error_type: error.name || 'UnknownError',
      error_message: error.message,
    });

    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Document Upload Service Integration
// ============================================================================

/**
 * Example: Tracking document uploads and processing
 */
export async function uploadDocumentWithAnalytics(params: {
  tenant_id: string;
  user_id: string;
  file: File;
}) {
  const analytics = getAnalyticsService();
  
  try {
    // Track upload event
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      event_type: 'document_uploaded',
      event_category: 'user_behavior',
      event_data: {
        file_name: params.file.name,
        file_size: params.file.size,
        file_type: params.file.type,
      },
    });
    
    // Process document (your existing logic)
    const result = await yourDocumentProcessingFunction(params.file);
    
    // Track embedding cost
    if (result.embedding_tokens) {
      await analytics.trackCost({
        tenant_id: params.tenant_id,
        user_id: params.user_id,
        cost_type: 'embedding',
        cost_usd: (result.embedding_tokens / 1000) * 0.0001, // ada-002 pricing
        quantity: result.embedding_tokens,
        service: 'openai',
        service_tier: 'text-embedding-ada-002',
      });
    }
    
    // Track storage cost
    await analytics.trackCost({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      cost_type: 'storage',
      cost_usd: (params.file.size / 1_000_000_000) * 0.02, // $0.02 per GB
      quantity: params.file.size,
      service: 'supabase',
      service_tier: 'storage',
    });
    
    return result;
  } catch (err) {
    // Track error
    const error = err as Error;
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      event_type: 'document_upload_failed',
      event_category: 'system_health',
      event_data: {
        error: error.message,
        file_name: params.file.name,
      },
    });

    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Workflow Execution Integration
// ============================================================================

/**
 * Example: Tracking workflow executions
 */
export async function executeWorkflowWithAnalytics(params: {
  tenant_id: string;
  user_id: string;
  workflow_id: string;
  input_data: any;
}) {
  const analytics = getAnalyticsService();
  const startTime = Date.now();
  
  try {
    // Track workflow start
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      event_type: 'workflow_started',
      event_category: 'business_metric',
      event_data: {
        workflow_id: params.workflow_id,
        input_data: params.input_data,
      },
    });
    
    // Execute workflow (your existing logic)
    const result = await yourWorkflowExecutionFunction(params);
    
    // Track workflow completion
    const executionTime = Date.now() - startTime;
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      event_type: 'workflow_completed',
      event_category: 'business_metric',
      event_data: {
        workflow_id: params.workflow_id,
        execution_time_ms: executionTime,
        steps_completed: result.steps_completed,
        output_data: result.output_data,
      },
    });
    
    return result;
  } catch (err) {
    // Track workflow failure
    const error = err as Error;
    await analytics.trackEvent({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      event_type: 'workflow_failed',
      event_category: 'system_health',
      event_data: {
        workflow_id: params.workflow_id,
        error: error.message,
        execution_time_ms: Date.now() - startTime,
      },
    });

    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: User Authentication Tracking
// ============================================================================

/**
 * Example: Tracking user login and session events
 */
export async function trackUserLogin(params: {
  tenant_id: string;
  user_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: params.tenant_id,
    user_id: params.user_id,
    session_id: params.session_id,
    event_type: 'user_login',
    event_category: 'user_behavior',
    event_data: {
      login_method: 'email',
    },
    ip_address: params.ip_address,
    user_agent: params.user_agent,
  });
}

/**
 * Example: Tracking user logout
 */
export async function trackUserLogout(params: {
  tenant_id: string;
  user_id: string;
  session_id: string;
  session_duration_ms: number;
}) {
  const analytics = getAnalyticsService();
  
  await analytics.trackEvent({
    tenant_id: params.tenant_id,
    user_id: params.user_id,
    session_id: params.session_id,
    event_type: 'user_logout',
    event_category: 'user_behavior',
    event_data: {
      session_duration_ms: params.session_duration_ms,
    },
  });
}

// ============================================================================
// EXAMPLE 5: API Route Integration (Next.js)
// ============================================================================

/**
 * Example: Next.js API route with analytics tracking
 */
export async function POST(request: Request) {
  const analytics = getAnalyticsService();
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { tenant_id, user_id, session_id, query } = body;
    
    // Track API request
    await analytics.trackEvent({
      tenant_id,
      user_id,
      session_id,
      event_type: 'api_request',
      event_category: 'system_health',
      event_data: {
        endpoint: '/api/query',
        method: 'POST',
        query,
      },
    });
    
    // Execute query
    const result = await executeRAGQueryWithAnalytics({
      tenant_id,
      user_id,
      session_id,
      query,
      agent_id: 'default-agent',
    });
    
    // Track API response
    await analytics.trackEvent({
      tenant_id,
      user_id,
      session_id,
      event_type: 'api_response',
      event_category: 'system_health',
      event_data: {
        endpoint: '/api/query',
        status: 200,
        response_time_ms: Date.now() - startTime,
      },
    });
    
    return Response.json(result);
  } catch (err) {
    // Track API error
    const error = err as Error;
    await analytics.trackEvent({
      tenant_id: 'unknown',
      event_type: 'api_error',
      event_category: 'system_health',
      event_data: {
        endpoint: '/api/query',
        error: error.message,
        response_time_ms: Date.now() - startTime,
      },
    });

    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// EXAMPLE 6: React Component Integration
// ============================================================================

/**
 * Example: React component with user interaction tracking
 */
export function QueryComponent() {
  const [query, setQuery] = useState('');
  const analytics = getAnalyticsService();
  
  const handleSubmit = async () => {
    // Track button click
    await analytics.trackEvent({
      tenant_id: 'current-tenant',
      user_id: 'current-user',
      session_id: 'current-session',
      event_type: 'button_clicked',
      event_category: 'user_behavior',
      event_data: {
        button_id: 'submit-query',
        component: 'QueryComponent',
      },
    });
    
    // Execute query
    await executeRAGQueryWithAnalytics({
      tenant_id: 'current-tenant',
      user_id: 'current-user',
      session_id: 'current-session',
      query,
      agent_id: 'default-agent',
    });
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

// ============================================================================
// HELPER: Get Current Context (Tenant, User, Session)
// ============================================================================

/**
 * Helper to get current context from your auth system
 */
export async function getCurrentContext() {
  // Your auth logic here
  return {
    tenant_id: 'b8026534-02a7-4d24-bf4c-344591964e02', // Digital Health Startup
    user_id: 'current-user-id',
    session_id: 'current-session-id',
  };
}

// ============================================================================
// CLEANUP: Flush on Server Shutdown
// ============================================================================

/**
 * Example: Graceful shutdown with analytics flush
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, flushing analytics...');
  const analytics = getAnalyticsService();
  await analytics.flush();
  console.log('Analytics flushed, exiting...');
  process.exit(0);
});

// ============================================================================
// NOTES
// ============================================================================

/**
 * Key Integration Points:
 * 
 * 1. RAG Query Services
 *    - Track query submission
 *    - Track LLM usage with automatic cost calculation
 *    - Track agent execution with quality metrics
 * 
 * 2. Document Processing
 *    - Track document uploads
 *    - Track embedding costs
 *    - Track storage costs
 * 
 * 3. Workflow Execution
 *    - Track workflow start/completion/failure
 *    - Track execution time
 *    - Track step completion
 * 
 * 4. User Authentication
 *    - Track login/logout events
 *    - Track session duration
 *    - Track IP and user agent
 * 
 * 5. API Routes
 *    - Track API requests/responses
 *    - Track response times
 *    - Track errors
 * 
 * 6. React Components
 *    - Track user interactions (clicks, inputs)
 *    - Track component lifecycle events
 * 
 * Performance Considerations:
 * - Events are buffered (100 items or 5 seconds)
 * - Async operations don't block user requests
 * - Automatic retry on failure
 * - Graceful degradation if analytics unavailable
 */


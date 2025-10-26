// ===================================================================
// Event-Driven Architecture API - Phase 1 Integration
// Real-time event streaming and workflow orchestration
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface EventPublishRequest {
  stream_name: string
  event_type: string
  event_data: unknown
  correlation_id?: string
  causation_id?: string
  aggregate_id?: string
  aggregate_type?: string
  metadata?: any
}

interface WorkflowTriggerRequest {
  workflow_name: string
  input_data: unknown
  trigger_event?: any
  priority?: 'low' | 'medium' | 'high' | 'critical'
  expected_completion?: string
}

interface WebSocketSubscriptionRequest {
  subscription_name: string
  event_types: string[]
  filter_conditions?: any
  delivery_options?: any
}

// POST /api/events/stream - Publish event to stream
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const body: EventPublishRequest = await request.json()
    const {
      stream_name,
      event_type,
      event_data,
      correlation_id,
      causation_id,
      aggregate_id,
      aggregate_type,
      metadata = { /* TODO: implement */ }
    } = body

    // Authentication and organization context

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication'
      }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 })
    }

    // Validate stream exists
    const { data: stream, error: streamError } = await supabase
      .from('event_streams')
      .select('id, schema_definition, is_active')
      .eq('stream_name', stream_name)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (streamError || !stream) {
      return NextResponse.json({
        success: false,
        error: 'Event stream not found or inactive'
      }, { status: 404 })
    }

    if (!stream.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Event stream is inactive'
      }, { status: 400 })
    }

    // Validate event data against schema (simplified validation)

    if (!schemaValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Schema validation failed: ${schemaValidation.errors.join(', ')}`
      }, { status: 400 })
    }

    // Generate event ID and partition key

    // Publish event to event log
    const { data: publishedEvent, error: publishError } = await supabase
      .from('event_log')
      .insert({
        organization_id: userProfile.organization_id,
        stream_id: stream.id,
        event_id: eventId,
        event_type,
        source_system: 'vital_path_api',
        source_user: user.user.id,
        correlation_id,
        causation_id,
        aggregate_id,
        aggregate_type,
        event_payload: event_data,
        metadata: {
          ...metadata,
          api_version: '1.0',
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        },
        partition_key: partitionKey,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (publishError) {
      // console.error('Event publish error:', publishError)
      return NextResponse.json({
        success: false,
        error: 'Failed to publish event'
      }, { status: 500 })
    }

    // Trigger workflows if applicable
    await triggerEventWorkflows(
      userProfile.organization_id,
      event_type,
      publishedEvent.id,
      event_data
    )

    // Log analytics
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'event_published',
        resource_type: 'event_stream',
        resource_id: stream.id,
        metrics: {
          stream_name,
          event_type,
          event_size_bytes: JSON.stringify(event_data).length,
          workflows_triggered: triggeredWorkflows.length
        }
      })

    return NextResponse.json({
      success: true,
      event: {
        event_id: eventId,
        stream_name,
        event_type,
        published_at: publishedEvent.timestamp_recorded,
        partition_key: partitionKey,
        processing_status: publishedEvent.processing_status,
        workflows_triggered: triggeredWorkflows
      }
    })

  } catch (error) {
    // console.error('Event stream API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/events/stream - Get event streams and recent events
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url)

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user.user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid authentication'
      }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 })
    }

    // Get available event streams
    const { data: streams, error: streamsError } = await supabase
      .from('event_streams')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .eq('is_active', true)
      .order('stream_name')

    if (streamsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch event streams'
      }, { status: 500 })
    }

    // Get recent events
    let eventsQuery = supabase
      .from('event_log')
      .select(`
        *,
        event_streams!inner(stream_name, stream_type)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('timestamp_occurred', { ascending: false })
      .limit(limit);

    if (streamName) {
      eventsQuery = eventsQuery.eq('event_streams.stream_name', streamName)
    }

    if (since) {
      eventsQuery = eventsQuery.gte('timestamp_occurred', since)
    }

    const { data: recentEvents, error: eventsError } = await eventsQuery

    if (eventsError) {
      // console.error('Recent events error:', eventsError)
    }

    // Get stream statistics
    const streamStats = await Promise.all(
      (streams || []).map(async (stream: any) => {
        const { data: stats } = await supabase
          .from('event_log')
          .select('processing_status')
          .eq('stream_id', stream.id)
          .gte('timestamp_occurred', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

        const totalEvents = stats?.length || 0;
        const pendingEvents = stats?.filter((e: any) => e.processing_status === 'pending').length || 0;
        const failedEvents = stats?.filter((e: any) => e.processing_status === 'failed').length || 0;

        return {
          stream_id: stream.id,
          stream_name: stream.stream_name,
          stream_type: stream.stream_type,
          events_24h: totalEvents,
          pending_events: pendingEvents,
          failed_events: failedEvents,
          success_rate: totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) : 1.0
        }
      })
    );

    return NextResponse.json({
      success: true,
      streams: streams || [],
      recent_events: recentEvents || [],
      stream_statistics: streamStats,
      system_status: {
        total_streams: streams?.length || 0,
        active_streams: streams?.filter((s: any) => s.is_active).length || 0,
        total_events_24h: streamStats.reduce((sum, s) => sum + s.events_24h, 0),
        overall_success_rate: streamStats.length > 0
          ? streamStats.reduce((sum, s) => sum + s.success_rate, 0) / streamStats.length
          : 1.0
      }
    })

  } catch (error) {
    // console.error('Event stream GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Helper function to validate event schema
function validateEventSchema(eventData: unknown, schemaDefinition: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  try {

    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in eventData)) {
          errors.push(`Required field '${field}' is missing`)
        }
      }
    }

    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (field in eventData) {
          // Basic type validation (would use proper JSON Schema validator in production)
          // eslint-disable-next-line security/detect-object-injection

          if (expectedType === 'string' && typeof fieldValue !== 'string') {
            errors.push(`Field '${field}' should be a string`)
          } else if (expectedType === 'number' && typeof fieldValue !== 'number') {
            errors.push(`Field '${field}' should be a number`)
          } else if (expectedType === 'object' && (typeof fieldValue !== 'object' || Array.isArray(fieldValue))) {
            errors.push(`Field '${field}' should be an object`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  } catch (error) {
    return {
      valid: false,
      errors: ['Schema validation failed']
    }
  }
}

// Helper function to trigger workflows
async function triggerWorkflowsForEvent(
  organizationId: string,
  eventType: string,
  eventId: string,
  eventData: unknown
): Promise<unknown[]> {
  try {
    // Find workflows that should be triggered by this event
    const { data: workflows, error } = await supabase
      .from('workflow_definitions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('trigger_events', [eventType])

    if (error || !workflows || workflows.length === 0) {
      return []
    }

    for (const workflow of workflows) {
      // Create workflow execution

      const { data: execution, error: executionError } = await supabase
        .from('workflow_executions')
        .insert({
          organization_id: organizationId,
          workflow_id: workflow.id,
          execution_id: executionId,
          trigger_event_id: eventId,
          input_data: eventData,
          execution_status: 'running',
          execution_context: {
            triggered_by_event: eventType,
            trigger_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (!executionError && execution) {
        triggeredWorkflows.push({
          workflow_id: workflow.id,
          workflow_name: workflow.workflow_name,
          execution_id: executionId,
          status: execution.execution_status
        })
      }
    }

    return triggeredWorkflows
  } catch (error) {
    // console.error('Workflow trigger error:', error)
    return []
  }
}
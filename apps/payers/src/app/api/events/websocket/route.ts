// ===================================================================
// WebSocket Management API - Phase 1 Integration
// Real-time connection and subscription management
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface ConnectionRequest {
  connection_id: string
  socket_endpoint: string
  client_info?: any
}

interface SubscriptionRequest {
  connection_id: string
  subscription_name: string
  event_types: string[]
  filter_conditions?: any
  delivery_options?: any
}

// POST /api/events/websocket - Register WebSocket connection
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


    const body: ConnectionRequest = await request.json()
    const {
      connection_id,
      socket_endpoint,
      client_info = { /* TODO: implement */ }
    } = body

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

    // Register WebSocket connection
    const { data: connection, error: connectionError } = await supabase
      .from('websocket_connections')
      .upsert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        connection_id,
        socket_endpoint,
        client_info: {
          ...client_info,
          user_agent: request.headers.get('user-agent'),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          connected_at: new Date().toISOString()
        },
        connection_state: 'connected',
        last_heartbeat: new Date().toISOString(),
        rate_limit_remaining: 1000,
        rate_limit_reset_time: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      })
      .select()
      .single()

    if (connectionError) {
      // console.error('WebSocket connection registration error:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to register WebSocket connection'
      }, { status: 500 })
    }

    // Clean up old connections
    await supabase.rpc('cleanup_websocket_connections')

    // Log connection analytics
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'websocket_connected',
        resource_type: 'websocket_connection',
        resource_id: connection.id,
        metrics: {
          connection_id,
          socket_endpoint,
          client_info
        }
      })

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        connection_id,
        connection_state: connection.connection_state,
        rate_limit_remaining: connection.rate_limit_remaining,
        rate_limit_reset_time: connection.rate_limit_reset_time,
        connected_at: connection.created_at
      }
    })

  } catch (error) {
    // console.error('WebSocket registration API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/events/websocket - Update connection heartbeat
export async function PUT(request: NextRequest) {
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



    const {
      connection_id,
      connection_quality = { /* TODO: implement */ },
      bandwidth_usage = 0
    } = body

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

    // Update connection heartbeat and metrics
    const { data: updatedConnection, error: updateError } = await supabase
      .from('websocket_connections')
      .update({
        last_heartbeat: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        connection_quality,
        bandwidth_usage: bandwidth_usage
      })
      .eq('connection_id', connection_id)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.user.id)
      .select()
      .single()

    if (updateError) {
      // console.error('WebSocket heartbeat update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update connection heartbeat'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      connection: {
        connection_id,
        last_heartbeat: updatedConnection.last_heartbeat,
        connection_state: updatedConnection.connection_state,
        rate_limit_remaining: updatedConnection.rate_limit_remaining
      }
    })

  } catch (error) {
    // console.error('WebSocket heartbeat API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/events/websocket - Disconnect WebSocket
export async function DELETE(request: NextRequest) {
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

    if (!connectionId) {
      return NextResponse.json({
        success: false,
        error: 'connection_id parameter required'
      }, { status: 400 })
    }

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

    // Mark connection as disconnected
    const { data: disconnectedConnection, error: disconnectError } = await supabase
      .from('websocket_connections')
      .update({
        connection_state: 'disconnected',
        disconnected_at: new Date().toISOString()
      })
      .eq('connection_id', connectionId)
      .eq('organization_id', userProfile.organization_id)
      .eq('user_id', user.user.id)
      .select()
      .single()

    if (disconnectError) {
      // console.error('WebSocket disconnection error:', disconnectError)
      return NextResponse.json({
        success: false,
        error: 'Failed to disconnect WebSocket'
      }, { status: 500 })
    }

    // Clean up associated subscriptions
    const { error: subscriptionCleanupError } = await supabase
      .from('event_subscriptions')
      .update({
        subscription_state: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('connection_id', disconnectedConnection.id)

    if (subscriptionCleanupError) {
      // console.error('Subscription cleanup error:', subscriptionCleanupError)
    }

    // Log disconnection analytics
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'websocket_disconnected',
        resource_type: 'websocket_connection',
        resource_id: disconnectedConnection.id,
        metrics: {
          connection_id: connectionId,
          session_duration_ms: disconnectedConnection.disconnected_at
            ? new Date(disconnectedConnection.disconnected_at).getTime() - new Date(disconnectedConnection.created_at).getTime()
            : 0,
          total_messages_sent: disconnectedConnection.total_messages_sent,
          total_messages_received: disconnectedConnection.total_messages_received
        }
      })

    return NextResponse.json({
      success: true,
      message: 'WebSocket connection disconnected successfully'
    })

  } catch (error) {
    // console.error('WebSocket disconnection API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/events/websocket - Get active connections and status
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

    // Get active connections
    const { data: activeConnections, error: connectionsError } = await supabase
      .from('websocket_connections')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .eq('connection_state', 'connected')
      .order('created_at', { ascending: false })

    if (connectionsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch active connections'
      }, { status: 500 })
    }

    // Get user's active connections

    // Get subscriptions for user's connections

    let subscriptions: unknown[] = []

    if (connectionIds.length > 0) {
      const { data: activeSubscriptions, error: subscriptionsError } = await supabase
        .from('event_subscriptions')
        .select('*')
        .in('connection_id', connectionIds)
        .eq('subscription_state', 'active')
        .order('created_at', { ascending: false })

      if (!subscriptionsError) {
        subscriptions = activeSubscriptions || []
      }
    }

    // Calculate connection statistics
    const connectionStats = {
      total_active_connections: activeConnections?.length || 0,
      user_active_connections: userConnections.length,
      user_active_subscriptions: subscriptions.length,
      average_connection_quality: userConnections.length > 0
        ? userConnections.reduce((sum, c) => sum + (c.connection_quality?.latency || 0), 0) / userConnections.length
        : 0,
      total_bandwidth_usage: userConnections.reduce((sum, c) => sum + (c.bandwidth_usage || 0), 0)
    }

    return NextResponse.json({
      success: true,
      active_connections: userConnections,
      subscriptions,
      connection_statistics: connectionStats,
      system_status: {
        websocket_enabled: true,
        max_connections_per_user: 10, // Configuration value
        rate_limit_per_hour: 1000,
        supported_event_types: [
          'clinical_observations',
          'dtx_engagement',
          'safety_monitoring',
          'workflow_updates',
          'system_notifications'
        ]
      }
    })

  } catch (error) {
    // console.error('WebSocket status API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
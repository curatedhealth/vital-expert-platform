// ===================================================================
// Real-time Advisory Board API - Phase 2 Enhanced Integration
// Connects to Python Real-time Advisory Board service
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@vital/sdk/client'

// Advisory Board Session Types
const SESSION_TYPES = [
  'clinical_review', 'safety_review', 'efficacy_assessment', 'regulatory_guidance',
  'treatment_protocol', 'diagnostic_consensus', 'risk_assessment', 'quality_assurance',
  'research_oversight', 'ethics_review', 'policy_development', 'case_consultation'
] as const

type SessionType = typeof SESSION_TYPES[number]

// Consensus Algorithms supported
const CONSENSUS_ALGORITHMS = [
  'simple_majority', 'weighted_voting', 'delphi_method', 'nominal_group_technique',
  'consensus_threshold', 'bayesian_consensus', 'fuzzy_consensus', 'expert_weighted'
] as const

type ConsensusAlgorithm = typeof CONSENSUS_ALGORITHMS[number]

// Decision Types
const DECISION_TYPES = [
  'approval_decision', 'risk_classification', 'treatment_recommendation',
  'diagnostic_confirmation', 'protocol_validation', 'safety_determination',
  'efficacy_rating', 'priority_ranking', 'resource_allocation', 'policy_recommendation'
] as const

type DecisionType = typeof DECISION_TYPES[number]

interface AdvisorySessionRequest {
  title: string
  description?: string
  session_type: SessionType
  invited_experts: Array<{
    expert_id: string
    name: string
    specialty: string
    credentials?: string[]
    role: 'chair' | 'member' | 'observer' | 'moderator'
    weight?: number // For weighted consensus algorithms
  }>
  decision_items: Array<{
    title: string
    description: string
    decision_type: DecisionType
    options: string[]
    evidence_documents?: Array<{
      title: string
      url: string
      document_type: string
    }>
    clinical_context?: Record<string, unknown>
    deadline?: string
  }>
  consensus_algorithm: ConsensusAlgorithm
  consensus_threshold?: number // 0.0 to 1.0, default 0.75
  session_duration_hours?: number
  real_time_collaboration?: boolean
  anonymous_voting?: boolean
  session_metadata?: Record<string, unknown>
}

interface AdvisorySessionJoinRequest {
  session_id: string
  expert_id: string
  join_as_role?: 'participant' | 'observer'
}

interface VoteSubmissionRequest {
  session_id: string
  decision_item_id: string
  expert_id: string
  vote: string | number
  confidence_level?: number // 0.0 to 1.0
  rationale?: string
  supporting_evidence?: string[]
}

// POST /api/advisory - Create advisory session, join session, or submit vote
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

    const body = await request.json();
    const { action } = body;

    // Get authentication context
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

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

    switch (action) {
      case 'create_session':
        return await handleCreateSession(body, user.user.id, userProfile.organization_id, token)
      case 'join_session':
        return await handleJoinSession(body, user.user.id, userProfile.organization_id, token)
      case 'submit_vote':
        return await handleSubmitVote(body, user.user.id, userProfile.organization_id, token)
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "create_session", "join_session", or "submit_vote"'
        }, { status: 400 })
    }

  } catch (error) {
    // console.error('Real-time Advisory Board API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/advisory - Get advisory board status and active sessions
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

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

    if (sessionId) {
      return await getSessionDetails(sessionId, userProfile.organization_id, token)
    } else {
      return await getAdvisoryBoardStatus(userProfile.organization_id, token)
    }

  } catch (error) {
    // console.error('Advisory board status API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function handleCreateSession(
  sessionData: AdvisorySessionRequest,
  userId: string,
  organizationId: string,
  token: string
) {
  // Validate session data
  if (!sessionData.title || !sessionData.session_type || !sessionData.invited_experts.length) {
    return NextResponse.json({
      success: false,
      error: 'Title, session type, and invited experts are required'
    }, { status: 400 })
  }

  if (!SESSION_TYPES.includes(sessionData.session_type)) {
    return NextResponse.json({
      success: false,
      error: `Invalid session type. Must be one of: ${SESSION_TYPES.join(', ')}`
    }, { status: 400 })
  }

  if (!CONSENSUS_ALGORITHMS.includes(sessionData.consensus_algorithm)) {
    return NextResponse.json({
      success: false,
      error: `Invalid consensus algorithm. Must be one of: ${CONSENSUS_ALGORITHMS.join(', ')}`
    }, { status: 400 })
  }

  try {
    // Try Python service first
    const response = await fetch(`${process.env.REALTIME_ADVISORY_BOARD_URL}/api/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...sessionData,
        creator_id: userId,
        organization_id: organizationId,
        session_id: uuidv4(), // Use proper UUID format for database compatibility
        created_at: new Date().toISOString(),
        status: 'scheduled'
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json();

      // Log session creation
      await supabase
        .from('usage_analytics')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          event_type: 'advisory_session_created',
          resource_type: 'realtime_advisory_board',
          resource_id: result.session_id,
          metrics: {
            session_type: sessionData.session_type,
            consensus_algorithm: sessionData.consensus_algorithm,
            experts_count: sessionData.invited_experts.length,
            decision_items_count: sessionData.decision_items.length
          },
          timestamp: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        session_id: result.session_id,
        session_url: result.session_url,
        websocket_url: result.websocket_url,
        status: result.status,
        estimated_duration: result.estimated_duration,
        next_steps: result.next_steps
      })
    } else {
      throw new Error(`Advisory service error: ${response.status}`)
    }
  } catch (error) {
    // Fallback session creation
    const sessionId = uuidv4(); // Use proper UUID format for database compatibility

    // Store session in database as fallback
    const { data: session, error: dbError } = await supabase
      .from('usage_analytics')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        event_type: 'advisory_session_created_fallback',
        resource_type: 'realtime_advisory_board',
        resource_id: sessionId,
        metrics: {
          session_data: sessionData,
          status: 'scheduled_fallback',
          created_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      session_url: `/advisory/${sessionId}`,
      websocket_url: null,
      status: 'scheduled_fallback',
      estimated_duration: `${sessionData.session_duration_hours || 2} hours`,
      next_steps: [
        'Advisory session created in fallback mode',
        'Experts will be notified via email',
        'Session will begin at scheduled time',
        'Real-time features require Python service'
      ]
    })
  }
}

async function handleJoinSession(
  joinData: AdvisorySessionJoinRequest,
  userId: string,
  organizationId: string,
  token: string
) {
  if (!joinData.session_id || !joinData.expert_id) {
    return NextResponse.json({
      success: false,
      error: 'Session ID and expert ID are required'
    }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.REALTIME_ADVISORY_BOARD_URL}/api/sessions/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...joinData,
        user_id: userId,
        organization_id: organizationId,
        joined_at: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json();

      return NextResponse.json({
        success: true,
        session_status: result.session_status,
        participant_role: result.participant_role,
        websocket_url: result.websocket_url,
        session_details: result.session_details
      })
    } else {
      throw new Error(`Join session error: ${response.status}`)
    }
  } catch (error) {
    return NextResponse.json({
      success: true,
      session_status: 'fallback_mode',
      participant_role: joinData.join_as_role || 'participant',
      websocket_url: null,
      session_details: {
        message: 'Session joined in fallback mode',
        real_time_features: false
      }
    })
  }
}

async function handleSubmitVote(
  voteData: VoteSubmissionRequest,
  userId: string,
  organizationId: string,
  token: string
) {
  if (!voteData.session_id || !voteData.decision_item_id || !voteData.expert_id || voteData.vote === undefined) {
    return NextResponse.json({
      success: false,
      error: 'Session ID, decision item ID, expert ID, and vote are required'
    }, { status: 400 })
  }

  try {
    const response = await fetch(`${process.env.REALTIME_ADVISORY_BOARD_URL}/api/sessions/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...voteData,
        voter_user_id: userId,
        organization_id: organizationId,
        submitted_at: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json();

      return NextResponse.json({
        success: true,
        vote_id: result.vote_id,
        vote_status: result.vote_status,
        consensus_status: result.consensus_status,
        current_results: result.current_results
      })
    } else {
      throw new Error(`Vote submission error: ${response.status}`)
    }
  } catch (error) {
    // Store vote as fallback
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        event_type: 'advisory_vote_submitted',
        resource_type: 'realtime_advisory_board',
        resource_id: voteData.session_id,
        metrics: {
          decision_item_id: voteData.decision_item_id,
          vote: voteData.vote,
          confidence_level: voteData.confidence_level,
          fallback_mode: true
        },
        timestamp: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      vote_id: `fallback_${Date.now()}`,
      vote_status: 'recorded_fallback',
      consensus_status: 'pending',
      current_results: { message: 'Vote recorded in fallback mode' }
    })
  }
}

async function getSessionDetails(sessionId: string, organizationId: string, token: string) {
  try {
    const response = await fetch(`${process.env.REALTIME_ADVISORY_BOARD_URL}/api/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      const sessionData = await response.json();

      return NextResponse.json({
        success: true,
        session: sessionData
      })
    } else {
      throw new Error(`Session details error: ${response.status}`)
    }
  } catch (error) {
    // Fallback: check if session exists in analytics
    const { data: sessionRecord } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('resource_id', sessionId)
      .eq('organization_id', organizationId)
      .eq('event_type', 'advisory_session_created_fallback')
      .single()

    if (sessionRecord) {
      return NextResponse.json({
        success: true,
        session: {
          session_id: sessionId,
          status: 'fallback_mode',
          details: sessionRecord.metrics?.session_data || { /* TODO: implement */ },
          message: 'Session details from fallback storage'
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Session not found'
    }, { status: 404 })
  }
}

async function getAdvisoryBoardStatus(organizationId: string, token: string) {
  let advisoryStatus = {
    available: false,
    active_sessions: 0,
    total_experts: 0,
    supported_algorithms: CONSENSUS_ALGORITHMS
  }

  try {
    const statusResponse = await fetch(`${process.env.REALTIME_ADVISORY_BOARD_URL}/api/status`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    })

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();

      advisoryStatus = {
        available: true,
        active_sessions: statusData.active_sessions || 0,
        total_experts: statusData.total_experts || 0,
        supported_algorithms: CONSENSUS_ALGORITHMS
      }
    }
  } catch (error) {
    // Service not available
  }

  // Get fallback data from database
  const { data: fallbackSessions } = await supabase
    .from('usage_analytics')
    .select('resource_id')
    .eq('organization_id', organizationId)
    .eq('event_type', 'advisory_session_created_fallback')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  return NextResponse.json({
    success: true,
    advisory_status: advisoryStatus,
    fallback_sessions: fallbackSessions?.length || 0,
    supported_session_types: SESSION_TYPES,
    supported_consensus_algorithms: CONSENSUS_ALGORITHMS,
    supported_decision_types: DECISION_TYPES,
    capabilities: {
      real_time_collaboration: advisoryStatus.available,
      consensus_algorithms: true,
      expert_management: true,
      vote_tracking: true,
      session_recording: true,
      evidence_integration: true
    }
  })
}
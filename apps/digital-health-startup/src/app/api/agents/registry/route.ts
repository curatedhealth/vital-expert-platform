// ===================================================================
// Clinical Agent Registry API - Phase 2 Enhanced Integration
// Connects to Python Clinical Agent Registry service
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Medical Specialties supported by the Clinical Agent Registry
const MEDICAL_SPECIALTIES = [
  'cardiology', 'oncology', 'neurology', 'psychiatry', 'endocrinology',
  'gastroenterology', 'pulmonology', 'nephrology', 'rheumatology', 'dermatology',
  'ophthalmology', 'otolaryngology', 'urology', 'orthopedics', 'pediatrics',
  'geriatrics', 'emergency_medicine', 'family_medicine', 'internal_medicine',
  'radiology', 'pathology', 'anesthesiology', 'surgery', 'infectious_disease',
  'hematology', 'allergy_immunology', 'pain_management', 'palliative_care'
] as const

type MedicalSpecialty = typeof MEDICAL_SPECIALTIES[number]

interface AgentRegistrationRequest {
  name: string
  primary_specialty: MedicalSpecialty
  secondary_specialties?: MedicalSpecialty[]
  credentials: Array<{
    credential_type: string
    issuing_authority: string
    credential_number: string
    expiration_date?: string
    verification_status?: 'verified' | 'pending' | 'expired'
  }>
  expertise_domains: Array<{
    domain_name: string
    specialty: MedicalSpecialty
    expertise_level: 'novice' | 'competent' | 'proficient' | 'expert'
    years_experience: number
    certification_details?: Record<string, unknown>
  }>
  availability_schedule?: {
    timezone: string
    weekly_hours: number
    preferred_hours?: Array<{
      day: string
      start_time: string
      end_time: string
    }>
  }
  performance_metrics?: {
    response_time_avg_minutes?: number
    case_success_rate?: number
    patient_satisfaction_score?: number
    peer_rating_average?: number
  }
}

interface AgentRoutingRequest {
  case_description: string
  primary_specialty_needed: MedicalSpecialty
  secondary_specialties_needed?: MedicalSpecialty[]
  required_expertise_level: 'novice' | 'competent' | 'proficient' | 'expert'
  case_complexity: 'low' | 'medium' | 'high' | 'critical'
  urgency_level: 'routine' | 'urgent' | 'emergent' | 'critical'
  routing_strategy?: 'availability_based' | 'expertise_based' | 'performance_based' | 'hybrid'
  max_agents?: number
  exclude_agent_ids?: string[]
}

// POST /api/agents/registry - Register new clinical agent or route to existing agents
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

    if (action === 'register') {
      return await handleAgentRegistration(body, user.user.id, userProfile.organization_id, token)
    } else if (action === 'route') {
      return await handleAgentRouting(body, user.user.id, userProfile.organization_id, token)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "register" or "route"'
      }, { status: 400 })
    }

  } catch (error) {
    // console.error('Clinical Agent Registry API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/agents/registry - Get agent registry status and available agents
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

    // Try to get registry status from Python service
    let registryStatus = {
      available: false,
      total_agents: 0,
      active_agents: 0,
      specialties_coverage: { /* TODO: implement */ }
    }

    try {
      const statusResponse = await fetch(`${process.env.PYTHON_AI_SERVICE_URL}/api/agents/registry/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        registryStatus = {
          available: true,
          total_agents: statusData.total_agents || 0,
          active_agents: statusData.active_agents || 0,
          specialties_coverage: statusData.specialties_coverage || { /* TODO: implement */ }
        }
      }
    } catch (error) {
      // Python service not available, will use fallback
      // console.warn('Python AI service not available:', error);
    }

    // Get agents from database as fallback
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, type, enabled, metadata')
      .eq('organization_id', userProfile.organization_id)

    return NextResponse.json({
      success: true,
      registry_status: registryStatus,
      fallback_agents: agents || [],
      supported_specialties: MEDICAL_SPECIALTIES,
      capabilities: {
        credential_verification: true,
        performance_tracking: true,
        real_time_routing: true,
        expertise_matching: true,
        availability_scheduling: true
      }
    })

  } catch (error) {
    // console.error('Agent registry status API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function handleAgentRegistration(
  registrationData: AgentRegistrationRequest,
  userId: string,
  organizationId: string,
  token: string
) {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate registration data
  if (!registrationData.name || !registrationData.primary_specialty) {
    return NextResponse.json({
      success: false,
      error: 'Name and primary specialty are required'
    }, { status: 400 })
  }

  if (!MEDICAL_SPECIALTIES.includes(registrationData.primary_specialty)) {
    return NextResponse.json({
      success: false,
      error: `Invalid specialty. Must be one of: ${MEDICAL_SPECIALTIES.join(', ')}`
    }, { status: 400 })
  }

  try {
    // Try Python service first
    const response = await fetch(`${process.env.PYTHON_AI_SERVICE_URL}/api/agents/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...registrationData,
        user_id: userId,
        organization_id: organizationId,
        timestamp: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json();

      // Log registration
      await supabase
        .from('usage_analytics')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          event_type: 'agent_registration',
          resource_type: 'clinical_agent_registry',
          resource_id: result.agent_id,
          metrics: {
            specialty: registrationData.primary_specialty,
            credentials_count: registrationData.credentials.length,
            expertise_domains_count: registrationData.expertise_domains.length
          },
          timestamp: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        agent_id: result.agent_id,
        registration_status: result.status,
        verification_status: result.verification_status,
        next_steps: result.next_steps
      })
    } else {
      throw new Error(`Registration service error: ${response.status}`)
    }
  } catch (error) {
    // Fallback registration to database
    // console.warn('Using fallback registration:', error);
    const { data: agent, error: dbError } = await supabase
      .from('agents')
      .insert({
        organization_id: organizationId,
        name: registrationData.name,
        type: 'clinical_expert',
        description: `Clinical expert in ${registrationData.primary_specialty}`,
        enabled: true,
        metadata: {
          primary_specialty: registrationData.primary_specialty,
          secondary_specialties: registrationData.secondary_specialties || [],
          credentials: registrationData.credentials,
          expertise_domains: registrationData.expertise_domains,
          availability_schedule: registrationData.availability_schedule,
          performance_metrics: registrationData.performance_metrics || { /* TODO: implement */ },
          registration_date: new Date().toISOString(),
          verification_status: 'pending'
        }
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      agent_id: agent.id,
      registration_status: 'registered_fallback',
      verification_status: 'pending',
      next_steps: [
        'Credential verification will be processed',
        'Agent profile will be activated upon verification',
        'Training materials will be provided'
      ]
    })
  }
}

async function handleAgentRouting(
  routingData: AgentRoutingRequest,
  userId: string,
  organizationId: string,
  token: string
) {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate routing data
  if (!routingData.case_description || !routingData.primary_specialty_needed) {
    return NextResponse.json({
      success: false,
      error: 'Case description and primary specialty are required'
    }, { status: 400 })
  }

  if (!MEDICAL_SPECIALTIES.includes(routingData.primary_specialty_needed)) {
    return NextResponse.json({
      success: false,
      error: `Invalid specialty. Must be one of: ${MEDICAL_SPECIALTIES.join(', ')}`
    }, { status: 400 })
  }

  try {
    // Try Python service first
    const response = await fetch(`${process.env.PYTHON_AI_SERVICE_URL}/api/agents/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...routingData,
        requester_id: userId,
        organization_id: organizationId,
        routing_request_id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(30000)
    })

    if (response.ok) {
      const result = await response.json();

      // Log routing request
      await supabase
        .from('usage_analytics')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          event_type: 'agent_routing',
          resource_type: 'clinical_agent_registry',
          resource_id: result.routing_id,
          metrics: {
            specialty: routingData.primary_specialty_needed,
            complexity: routingData.case_complexity,
            urgency: routingData.urgency_level,
            agents_matched: result.matched_agents?.length || 0
          },
          timestamp: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        routing_id: result.routing_id,
        matched_agents: result.matched_agents,
        routing_strategy_used: result.routing_strategy_used,
        estimated_response_time: result.estimated_response_time,
        confidence_score: result.confidence_score
      })
    } else {
      throw new Error(`Routing service error: ${response.status}`)
    }
  } catch (error) {
    // Fallback routing using database
    // console.warn('Using fallback routing:', error);
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('enabled', true)
      .limit(routingData.max_agents || 5)

    const matchedAgents = (agents || []).filter((agent: any) => {
      const metadata = agent.metadata as any;
      return metadata.primary_specialty === routingData.primary_specialty_needed ||
             metadata.secondary_specialties?.includes(routingData.primary_specialty_needed)
    }) || []

    return NextResponse.json({
      success: true,
      routing_id: `fallback_${Date.now()}`,
      matched_agents: matchedAgents.map((agent: any) => ({
        agent_id: agent.id,
        name: agent.name,
        specialty: agent.metadata?.primary_specialty,
        expertise_level: agent.metadata?.expertise_domains?.[0]?.expertise_level || 'competent',
        availability_status: 'available',
        estimated_response_time: '15 minutes'
      })),
      routing_strategy_used: 'fallback_specialty_match',
      estimated_response_time: '15 minutes',
      confidence_score: 0.7
    })
  }
}
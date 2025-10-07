// ===================================================================
// Individual Intervention Management API - Phase 1 Integration
// Detailed intervention operations and lifecycle management
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface InterventionUpdateRequest {
  name?: string
  description?: string
  therapeutic_area?: string[]
  target_population?: any
  clinical_evidence?: any
  regulatory_status?: 'development' | 'submitted' | 'approved' | 'marketed'
  technology_stack?: any
  delivery_modalities?: string[]
  dosing_regimen?: any
  clinical_endpoints?: unknown[]
  safety_profile?: any
  user_engagement_metrics?: any
  interoperability?: any
  privacy_security?: any
  health_economics?: any
  development_stage?: 'concept' | 'prototype' | 'pilot' | 'pivotal' | 'commercial'
  version?: string
}

// GET /api/interventions/[id] - Get specific intervention details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get intervention details
    const { data: intervention, error: interventionError } = await supabase
      .from('digital_interventions')
      .select('*')
      .eq('id', interventionId)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (interventionError || !intervention) {
      return NextResponse.json({
        success: false,
        error: 'Intervention not found'
      }, { status: 404 })
    }

    // Get lifecycle phases
    const { data: lifecyclePhases, error: lifecycleError } = await supabase
      .from('intervention_lifecycle')
      .select('*')
      .eq('intervention_id', interventionId)
      .order('created_at')

    if (lifecycleError) {
      // console.error('Lifecycle phases error:', lifecycleError)
    }

    // Get clinical trial designs
    const { data: clinicalTrials, error: trialsError } = await supabase
      .from('clinical_trial_designs')
      .select('*')
      .eq('intervention_id', interventionId)
      .order('created_at', { ascending: false })

    if (trialsError) {
      // console.error('Clinical trials error:', trialsError)
    }

    // Get safety events
    const { data: safetyEvents, error: safetyError } = await supabase
      .from('safety_events')
      .select('*')
      .eq('intervention_id', interventionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (safetyError) {
      // console.error('Safety events error:', safetyError)
    }

    // Get FHIR medication record if DTx

    if (intervention.intervention_type === 'dtx') {
      const { data: medication, error: medicationError } = await supabase
        .from('fhir_medications')
        .select('*')
        .eq('fhir_id', `dtx-${interventionId}`)
        .eq('organization_id', userProfile.organization_id)
        .single()

      if (!medicationError && medication) {
        fhirMedication = medication
      }
    }

    // Calculate lifecycle metrics

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('usage_analytics')
      .select('event_type, metrics, timestamp')
      .eq('organization_id', userProfile.organization_id)
      .eq('resource_id', interventionId)
      .order('timestamp', { ascending: false })
      .limit(20)

    if (activityError) {
      // console.error('Recent activity error:', activityError)
    }

    // Safety assessment
    const safetyAssessment = {
      total_events: safetyEvents?.length || 0,
      high_severity_events: safetyEvents?.filter(e => ['severe', 'life_threatening'].includes(e.severity)).length || 0,
      recent_events_7d: safetyEvents?.filter(e =>
        new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0,
      risk_level: calculateRiskLevel(safetyEvents || [])
    }

    return NextResponse.json({
      success: true,
      intervention: {
        ...intervention,
        lifecycle_phases: lifecyclePhases || [],
        lifecycle_metrics: lifecycleMetrics,
        clinical_trials: clinicalTrials || [],
        safety_events: safetyEvents || [],
        safety_assessment: safetyAssessment,
        fhir_medication: fhirMedication,
        recent_activity: recentActivity || []
      }
    })

  } catch (error) {
    // console.error('Intervention details API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/interventions/[id] - Update intervention
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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



    const body: InterventionUpdateRequest = await request.json()

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

    // Update intervention
    const { data: updatedIntervention, error: updateError } = await supabase
      .from('digital_interventions')
      .update(body)
      .eq('id', interventionId)
      .eq('organization_id', userProfile.organization_id)
      .select()
      .single()

    if (updateError) {
      // console.error('Intervention update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update intervention'
      }, { status: 500 })
    }

    // Update FHIR medication if DTx and relevant fields changed
    if (updatedIntervention.intervention_type === 'dtx' &&
        (body.therapeutic_area || body.regulatory_status || body.delivery_modalities)) {
      const updateData: unknown = { /* TODO: implement */ }

      if (body.therapeutic_area) {
        updateData.therapeutic_area = body.therapeutic_area
      }

      if (body.regulatory_status) {
        updateData.regulatory_status = {
          status: body.regulatory_status,
          pathway: updatedIntervention.regulatory_pathway
        }
      }

      if (body.delivery_modalities) {
        updateData.delivery_mechanism = {
          modalities: body.delivery_modalities,
          technology: body.technology_stack || updatedIntervention.technology_stack
        }
      }

      const { error: fhirUpdateError } = await supabase
        .from('fhir_medications')
        .update(updateData)
        .eq('fhir_id', `dtx-${interventionId}`)
        .eq('organization_id', userProfile.organization_id)

      if (fhirUpdateError) {
        // console.error('FHIR medication update error:', fhirUpdateError)
      }
    }

    // Log update activity
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'intervention_updated',
        resource_type: 'digital_intervention',
        resource_id: interventionId,
        metrics: {
          updated_fields: Object.keys(body),
          development_stage: body.development_stage || updatedIntervention.development_stage,
          regulatory_status: body.regulatory_status || updatedIntervention.regulatory_status
        }
      })

    return NextResponse.json({
      success: true,
      intervention: updatedIntervention
    })

  } catch (error) {
    // console.error('Intervention update API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/interventions/[id] - Delete intervention
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if intervention exists and has dependent records
    const { data: intervention, error: checkError } = await supabase
      .from('digital_interventions')
      .select(`
        *,
        intervention_lifecycle(id),
        clinical_trial_designs(id),
        safety_events(id)
      `)
      .eq('id', interventionId)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (checkError || !intervention) {
      return NextResponse.json({
        success: false,
        error: 'Intervention not found'
      }, { status: 404 })
    }

    // Prevent deletion if intervention has safety events or active trials
    const hasActiveRecords =
      (intervention.safety_events && intervention.safety_events.length > 0) ||
      (intervention.clinical_trial_designs && intervention.clinical_trial_designs.length > 0)

    if (hasActiveRecords) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete intervention with existing safety events or clinical trials. Please archive instead.'
      }, { status: 400 })
    }

    // Delete related records first
    await supabase
      .from('intervention_lifecycle')
      .delete()
      .eq('intervention_id', interventionId)
      .eq('organization_id', userProfile.organization_id)

    await supabase
      .from('fhir_medications')
      .delete()
      .eq('fhir_id', `dtx-${interventionId}`)
      .eq('organization_id', userProfile.organization_id)

    // Delete intervention
    const { error: deleteError } = await supabase
      .from('digital_interventions')
      .delete()
      .eq('id', interventionId)
      .eq('organization_id', userProfile.organization_id)

    if (deleteError) {
      // console.error('Intervention deletion error:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete intervention'
      }, { status: 500 })
    }

    // Log deletion activity
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'intervention_deleted',
        resource_type: 'digital_intervention',
        resource_id: interventionId,
        metrics: {
          intervention_name: intervention.name,
          intervention_type: intervention.intervention_type,
          development_stage: intervention.development_stage
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Intervention deleted successfully'
    })

  } catch (error) {
    // console.error('Intervention deletion API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Helper functions
function calculateLifecycleMetrics(lifecyclePhases: any[]) {
  const totalPhases = lifecyclePhases.length;
  const completedPhases = lifecyclePhases.filter((p: any) => p.status === 'completed').length;
  const activePhases = lifecyclePhases.filter((p: any) => p.status === 'active').length;
  const blockedPhases = lifecyclePhases.filter((p: any) => p.status === 'blocked').length;
  const currentPhase = lifecyclePhases.find((p: any) => p.status === 'active');
  const overdueMilestones = lifecyclePhases.filter((p: any) =>
    p.target_completion_date &&
    new Date(p.target_completion_date) < new Date() &&
    p.status !== 'completed'
  ).length;

  return {
    total_phases: totalPhases,
    completed_phases: completedPhases,
    active_phases: activePhases,
    blocked_phases: blockedPhases,
    progress_percentage: totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0,
    current_phase: currentPhase?.phase || 'unknown',
    current_stage: currentPhase?.stage || 'unknown',
    overdue_tasks: overdueTasks,
    estimated_completion: estimateCompletion(lifecyclePhases)
  }
}

function calculateRiskLevel(safetyEvents: any[]): 'low' | 'medium' | 'high' | 'critical' {
  if (safetyEvents.length === 0) return 'low'

  const criticalEvents = safetyEvents.filter((e: any) => e.severity === 'life_threatening').length;
  const severeEvents = safetyEvents.filter((e: any) => e.severity === 'severe').length;
  const recentEvents = safetyEvents.filter((e: any) =>
    new Date(e.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  );

  if (criticalEvents > 0) return 'critical'
  if (severeEvents > 2 || recentEvents.length > 10) return 'high'
  if (severeEvents > 0 || recentEvents.length > 5) return 'medium'
  return 'low'
}

function estimateCompletion(lifecyclePhases: unknown[]): string | null {
  // Simple estimation based on current progress and average phase duration
  const activePhase = lifecyclePhases.find((p: any) => p.status === 'active');
  const completedPhases = lifecyclePhases.filter((p: any) => p.status === 'completed');

  if (!activePhase || completedPhases.length === 0) return null

  // Calculate average phase duration from completed phases
  const avgPhaseDuration = completedPhases.reduce((sum: number, phase: any) => {
    if (phase.actual_completion_date && phase.start_date) {
      const duration = new Date(phase.actual_completion_date).getTime() - new Date(phase.start_date).getTime();
      return sum + duration
    }
    return sum + (30 * 24 * 60 * 60 * 1000) // Default 30 days if no data
  }, 0) / Math.max(completedPhases.length, 1);

  const estimatedCompletionTime = new Date(Date.now() + avgPhaseDuration * (lifecyclePhases.length - completedPhases.length));

  return estimatedCompletionTime.toISOString()
}
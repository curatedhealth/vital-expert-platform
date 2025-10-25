// ===================================================================
// Clinical Safety Monitoring API - Phase 1 Integration
// Real-time safety signal detection and adverse event tracking
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface SafetyEventRequest {
  intervention_id?: string
  patient_reference?: any
  event_type: 'adverse_event' | 'device_malfunction' | 'usability_issue' | 'data_anomaly'
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  event_description: string
  onset_datetime?: string
  clinical_impact?: any
  technical_factors?: any
  reporter_id?: string
}

interface SafetySignalRequest {
  intervention_id?: string
  time_window?: string // ISO 8601 duration
  signal_types?: string[]
}

// POST /api/clinical/safety - Report safety event
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


    const body: SafetyEventRequest = await request.json()
    const {
      intervention_id,
      patient_reference,
      event_type,
      severity,
      event_description,
      onset_datetime,
      clinical_impact = { /* TODO: implement */ },
      technical_factors = { /* TODO: implement */ },
      reporter_id
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

    // Create safety event record
    const { data: safetyEvent, error: eventError } = await supabase
      .from('safety_events')
      .insert({
        organization_id: userProfile.organization_id,
        intervention_id,
        patient_reference,
        event_type,
        severity,
        event_description,
        onset_datetime: onset_datetime ? new Date(onset_datetime).toISOString() : new Date().toISOString(),
        clinical_impact,
        technical_factors,
        reported_by: reporter_id || user.user.id,
        status: 'open'
      })
      .select()
      .single()

    if (eventError) {
      // console.error('Safety event creation error:', eventError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create safety event'
      }, { status: 500 })
    }

    // Trigger immediate safety signal detection if critical

    if (severity === 'severe' || severity === 'life_threatening') {
      const { data: analysis } = await supabase
        .rpc('detect_safety_signals', {
          org_id: userProfile.organization_id,
          intervention_id: intervention_id,
          time_window: '24 hours'
        })

      signalAnalysis = analysis

      // Auto-create safety signal if high risk detected
      if (analysis?.risk_level === 'high' || analysis?.signal_detected) {
        await supabase
          .from('safety_signal_detection')
          .insert({
            organization_id: userProfile.organization_id,
            signal_id: `AUTO_${Date.now()}`,
            signal_type: event_type,
            detection_method: 'automated',
            signal_strength: analysis.risk_level === 'high' ? 'strong' : 'moderate',
            clinical_significance: severity === 'life_threatening' ? 'critical' : 'high',
            signal_description: `Automated signal detection triggered by ${severity} ${event_type}`,
            affected_interventions: intervention_id ? [intervention_id] : [],
            statistical_evidence: analysis,
            signal_priority: severity === 'life_threatening' ? 1 : 10,
            investigation_status: 'detected',
            detected_by: 'automated_system'
          })
      }
    }

    // Log safety event in analytics
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'safety_event_reported',
        resource_type: 'safety_event',
        resource_id: safetyEvent.id,
        metrics: {
          event_type,
          severity,
          intervention_id,
          automated_signal_detection: !!signalAnalysis,
          signal_detected: signalAnalysis?.signal_detected || false
        }
      })

    return NextResponse.json({
      success: true,
      safety_event: {
        id: safetyEvent.id,
        event_type,
        severity,
        status: safetyEvent.status,
        created_at: safetyEvent.created_at,
        signal_analysis: signalAnalysis
      }
    })

  } catch (error) {
    // console.error('Safety event API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/clinical/safety - Get safety signals and events
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

    // Run safety signal analysis
    const { data: signalAnalysis, error: analysisError } = await supabase
      .rpc('detect_safety_signals', {
        org_id: userProfile.organization_id,
        intervention_id: interventionId,
        time_window: timeWindow
      })

    if (analysisError) {
      // console.error('Safety signal analysis error:', analysisError)
    }

    // Get active safety signals
    let signalQuery = supabase
      .from('safety_signal_detection')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .in('investigation_status', ['detected', 'investigating'])
      .order('signal_priority', { ascending: true })

    if (interventionId) {
      signalQuery = signalQuery.contains('affected_interventions', [interventionId])
    }

    if (signalTypes.length > 0) {
      signalQuery = signalQuery.in('signal_type', signalTypes)
    }

    const { data: activeSignals, error: signalsError } = await signalQuery

    if (signalsError) {
      // console.error('Active signals error:', signalsError)
    }

    // Get recent safety events

    timeWindowStart.setDate(timeWindowStart.getDate() - 7) // Default 7 days

      .from('safety_events')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .gte('created_at', timeWindowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (interventionId) {
      eventsQuery = eventsQuery.eq('intervention_id', interventionId)
    }

    const { data: recentEvents, error: eventsError } = await eventsQuery

    if (eventsError) {
      // console.error('Recent events error:', eventsError)
    }

    // Generate safety dashboard summary
    const dashboardSummary = {
      overall_risk_level: signalAnalysis?.risk_level || 'minimal',
      total_active_signals: activeSignals?.length || 0,
      critical_signals: activeSignals?.filter(s => s.clinical_significance === 'critical').length || 0,
      recent_events_count: recentEvents?.length || 0,
      high_severity_events: recentEvents?.filter(e => ['severe', 'life_threatening'].includes(e.severity)).length || 0,
      trending_event_types: { /* TODO: implement */ } // Would implement trend analysis
    }

    return NextResponse.json({
      success: true,
      analysis: signalAnalysis || {
        analysis_period: timeWindow,
        intervention_scope: interventionId || 'all_interventions',
        signal_detected: false,
        risk_level: 'minimal',
        analysis_timestamp: new Date().toISOString()
      },
      active_signals: activeSignals || [],
      recent_events: recentEvents || [],
      safety_dashboard: safetyDashboard
    })

  } catch (error) {
    // console.error('Safety signals API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/clinical/safety - Update safety signal investigation
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
      signal_id,
      investigation_status,
      investigation_findings = { /* TODO: implement */ },
      mitigation_actions = [],
      investigator_notes
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

    // Update safety signal
    const updateData: unknown = {
      investigation_status,
      last_updated_at: new Date().toISOString(),
      investigated_by: user.user.id
    }

    if (investigation_findings && Object.keys(investigation_findings).length > 0) {
      updateData.preliminary_findings = investigation_findings
    }

    if (mitigation_actions.length > 0) {
      updateData.risk_mitigation_measures = mitigation_actions
    }

    if (investigation_status === 'resolved' || investigation_status === 'refuted') {
      updateData.resolved_at = new Date().toISOString()
      updateData.final_assessment = investigation_findings
    }

    const { data: updatedSignal, error: updateError } = await supabase
      .from('safety_signal_detection')
      .update(updateData)
      .eq('signal_id', signal_id)
      .eq('organization_id', userProfile.organization_id)
      .select()
      .single()

    if (updateError) {
      // console.error('Signal update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update safety signal'
      }, { status: 500 })
    }

    // Log investigation activity
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'safety_signal_investigation',
        resource_type: 'safety_signal',
        resource_id: updatedSignal.id,
        metrics: {
          signal_id,
          investigation_status,
          has_findings: Object.keys(investigation_findings).length > 0,
          has_mitigations: mitigation_actions.length > 0
        }
      })

    return NextResponse.json({
      success: true,
      updated_signal: updatedSignal
    })

  } catch (error) {
    // console.error('Safety signal update API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
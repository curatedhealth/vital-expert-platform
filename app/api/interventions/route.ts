// ===================================================================
// Digital Health Interventions API - Phase 1 Integration
// Comprehensive intervention management and lifecycle tracking
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface InterventionRequest {
  name: string
  description?: string
  intervention_type: 'dtx' | 'app' | 'device' | 'platform' | 'hybrid'
  therapeutic_area: string[]
  target_population?: any
  clinical_evidence?: any
  regulatory_pathway?: 'fda_510k' | 'fda_de_novo' | 'ce_mark' | 'none'
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

interface LifecycleUpdateRequest {
  intervention_id: string
  phase: 'design' | 'build' | 'test' | 'deploy' | 'monitor'
  stage: string
  status: 'pending' | 'active' | 'completed' | 'blocked' | 'cancelled'
  deliverables?: unknown[]
  success_criteria?: unknown[]
  risks?: unknown[]
  mitigation_strategies?: unknown[]
  resources_required?: any
  compliance_requirements?: unknown[]
  quality_gates?: unknown[]
}

interface ClinicalTrialRequest {
  intervention_id: string
  trial_name: string
  trial_type: 'rct' | 'single_arm' | 'observational' | 'registry'
  phase?: 'phase_i' | 'phase_ii' | 'phase_iii' | 'phase_iv'
  study_design: unknown
  primary_endpoint: unknown
  secondary_endpoints?: unknown[]
  inclusion_criteria?: unknown[]
  exclusion_criteria?: unknown[]
  sample_size_calculation?: any
  statistical_plan?: any
  digital_endpoints?: unknown[]
  biomarker_strategy?: any
  data_collection_plan?: any
  regulatory_strategy?: any
  quality_assurance?: any
  risk_management?: any
}

// POST /api/interventions - Create new digital health intervention
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


    const body: InterventionRequest = await request.json()
    const {
      name,
      description,
      intervention_type,
      therapeutic_area,
      target_population = { /* TODO: implement */ },
      clinical_evidence = { /* TODO: implement */ },
      regulatory_pathway = 'none',
      regulatory_status = 'development',
      technology_stack = { /* TODO: implement */ },
      delivery_modalities = [],
      dosing_regimen = { /* TODO: implement */ },
      clinical_endpoints = [],
      safety_profile = { /* TODO: implement */ },
      user_engagement_metrics = { /* TODO: implement */ },
      interoperability = { /* TODO: implement */ },
      privacy_security = { /* TODO: implement */ },
      health_economics = { /* TODO: implement */ },
      development_stage = 'concept',
      version = '1.0.0'
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

    // Create digital intervention
    const { data: intervention, error: interventionError } = await supabase
      .from('digital_interventions')
      .insert({
        organization_id: userProfile.organization_id,
        name,
        description,
        intervention_type,
        therapeutic_area,
        target_population,
        clinical_evidence,
        regulatory_pathway,
        regulatory_status,
        technology_stack,
        delivery_modalities,
        dosing_regimen,
        clinical_endpoints,
        safety_profile,
        user_engagement_metrics,
        interoperability,
        privacy_security,
        health_economics,
        development_stage,
        version,
        created_by: user.user.id
      })
      .select()
      .single()

    if (interventionError) {
      // console.error('Intervention creation error:', interventionError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create digital health intervention'
      }, { status: 500 })
    }

    // Initialize lifecycle phases
    const initialLifecyclePhases = [
      {
        phase: 'design',
        stage: 'requirements',
        status: 'active',
        deliverables: ['Requirements Document', 'User Research', 'Clinical Workflow Analysis'],
        success_criteria: ['Stakeholder approval', 'Clinical validation', 'Regulatory pathway confirmation']
      },
      {
        phase: 'build',
        stage: 'architecture',
        status: 'pending',
        deliverables: ['Technical Architecture', 'Security Framework', 'Interoperability Design'],
        success_criteria: ['Technical review approval', 'Security assessment', 'Performance benchmarks']
      },
      {
        phase: 'test',
        stage: 'validation',
        status: 'pending',
        deliverables: ['Clinical Validation', 'Usability Testing', 'Safety Assessment'],
        success_criteria: ['Clinical efficacy demonstrated', 'Usability benchmarks met', 'Safety profile established']
      },
      {
        phase: 'deploy',
        stage: 'pilot',
        status: 'pending',
        deliverables: ['Pilot Deployment', 'Provider Training', 'Outcome Monitoring'],
        success_criteria: ['Successful pilot', 'Provider adoption', 'Outcome targets met']
      },
      {
        phase: 'monitor',
        stage: 'surveillance',
        status: 'pending',
        deliverables: ['Post-Market Surveillance', 'Ongoing Monitoring', 'Performance Analytics'],
        success_criteria: ['Safety monitoring', 'Efficacy maintenance', 'User satisfaction']
      }
    ]

    // Create lifecycle records
    const { data: lifecycleRecords, error: lifecycleError } = await supabase
      .from('intervention_lifecycle')
      .insert(
        lifecyclePhases.map(phase => ({
          organization_id: userProfile.organization_id,
          intervention_id: intervention.id,
          ...phase,
          created_by: user.user.id
        }))
      )
      .select()

    if (lifecycleError) {
      // console.error('Lifecycle creation error:', lifecycleError)
    }

    // Create initial FHIR Medication record for DTx
    if (intervention_type === 'dtx') {
      const { error: medicationError } = await supabase
        .from('fhir_medications')
        .insert({
          organization_id: userProfile.organization_id,
          fhir_id: `dtx-${intervention.id}`,
          code: {
            coding: [{
              system: 'http://vital-path.ai/fhir/CodeSystem/digital-therapeutics',
              code: intervention.id,
              display: name
            }]
          },
          status: 'active',
          dtx_type: intervention_type,
          therapeutic_area,
          clinical_evidence,
          regulatory_status: { status: regulatory_status, pathway: regulatory_pathway },
          delivery_mechanism: { modalities: delivery_modalities, technology: technology_stack },
          dosing_protocol: dosing_regimen,
          contraindications: safety_profile.contraindications || [],
          interactions: safety_profile.interactions || []
        })

      if (medicationError) {
        // console.error('FHIR Medication creation error:', medicationError)
      }
    }

    // Log intervention creation
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'intervention_created',
        resource_type: 'digital_intervention',
        resource_id: intervention.id,
        metrics: {
          intervention_type,
          therapeutic_area,
          development_stage,
          regulatory_pathway,
          lifecycle_phases_initialized: lifecycleRecords?.length || 0
        }
      })

    return NextResponse.json({
      success: true,
      intervention: {
        id: intervention.id,
        name: intervention.name,
        intervention_type: intervention.intervention_type,
        therapeutic_area: intervention.therapeutic_area,
        development_stage: intervention.development_stage,
        regulatory_status: intervention.regulatory_status,
        created_at: intervention.created_at,
        lifecycle_phases: lifecycleRecords?.length || 0
      }
    })

  } catch (error) {
    // console.error('Intervention creation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/interventions - List digital health interventions
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

    // Build query with filters
    const query = supabase
      .from('digital_interventions')
      .select(`
        *,
        intervention_lifecycle!inner(
          phase,
          stage,
          status,
          target_completion_date,
          actual_completion_date
        )
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (interventionType) {
      interventionsQuery = interventionsQuery.eq('intervention_type', interventionType)
    }

    if (therapeuticArea) {
      interventionsQuery = interventionsQuery.contains('therapeutic_area', [therapeuticArea])
    }

    if (developmentStage) {
      interventionsQuery = interventionsQuery.eq('development_stage', developmentStage)
    }

    if (regulatoryStatus) {
      interventionsQuery = interventionsQuery.eq('regulatory_status', regulatoryStatus)
    }

    const { data: interventions, error: interventionsError } = await interventionsQuery

    if (interventionsError) {
      // console.error('Interventions query error:', interventionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch interventions'
      }, { status: 500 })
    }

    // Get intervention statistics
    const { data: stats, error: statsError } = await supabase
      .from('digital_interventions')
      .select('intervention_type, development_stage, regulatory_status')
      .eq('organization_id', userProfile.organization_id);

    const interventionStats = {
      total_interventions: 0,
      by_type: {} as Record<string, number>,
      by_development_stage: {} as Record<string, number>,
      by_regulatory_status: {} as Record<string, number>
    };

    if (!statsError && stats) {
      interventionStats.total_interventions = stats.length
      interventionStats.by_type = stats.reduce((acc: unknown, item: unknown) => {
        acc[item.intervention_type] = (acc[item.intervention_type] || 0) + 1
        return acc
      }, { /* TODO: implement */ })
      interventionStats.by_development_stage = stats.reduce((acc: unknown, item: unknown) => {
        acc[item.development_stage] = (acc[item.development_stage] || 0) + 1
        return acc
      }, { /* TODO: implement */ })
      interventionStats.by_regulatory_status = stats.reduce((acc: unknown, item: unknown) => {
        acc[item.regulatory_status] = (acc[item.regulatory_status] || 0) + 1
        return acc
      }, { /* TODO: implement */ })
    }

    // Process interventions with lifecycle summary
    const processedInterventions = (interventions || []).map((intervention: any) => {
      const lifecyclePhases = intervention.intervention_lifecycle || [];
      const completedPhases = lifecyclePhases.filter((p: any) => p.status === 'completed').length;
      const totalPhases = lifecyclePhases.length;
      const currentPhase = lifecyclePhases.find((p: any) => p.status === 'active');

      return {
        id: intervention.id,
        name: intervention.name,
        description: intervention.description,
        intervention_type: intervention.intervention_type,
        therapeutic_area: intervention.therapeutic_area,
        development_stage: intervention.development_stage,
        regulatory_status: intervention.regulatory_status,
        regulatory_pathway: intervention.regulatory_pathway,
        version: intervention.version,
        created_at: intervention.created_at,
        updated_at: intervention.updated_at,
        lifecycle_progress: {
          completed_phases: completedPhases,
          total_phases: totalPhases,
          progress_percentage: totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0,
          current_phase: currentPhase?.phase || 'unknown',
          current_stage: currentPhase?.stage || 'unknown',
          current_status: currentPhase?.status || 'unknown'
        },
        target_population: intervention.target_population,
        delivery_modalities: intervention.delivery_modalities,
        safety_profile: intervention.safety_profile
      }
    });

    return NextResponse.json({
      success: true,
      interventions: processedInterventions,
      pagination: {
        limit,
        offset,
        total: interventionStats.total_interventions,
        has_more: processedInterventions.length === limit
      },
      statistics: interventionStats,
      filters: {
        intervention_types: ['dtx', 'app', 'device', 'platform', 'hybrid'],
        therapeutic_areas: ['cardiology', 'diabetes', 'mental_health', 'oncology', 'neurology', 'respiratory'],
        development_stages: ['concept', 'prototype', 'pilot', 'pivotal', 'commercial'],
        regulatory_statuses: ['development', 'submitted', 'approved', 'marketed']
      }
    })

  } catch (error) {
    // console.error('Interventions list API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
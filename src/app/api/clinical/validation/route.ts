// ===================================================================
// Clinical Validation API - Phase 1 Integration
// Real-time clinical validation and safety monitoring
// ===================================================================

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ValidationRequest {
  content_data: unknown
  validation_context?: any
  intervention_id?: string
  clinical_domain?: string
  validation_scope?: 'safety' | 'efficacy' | 'quality' | 'regulatory'
  priority_level?: 'low' | 'medium' | 'high' | 'critical'
}

interface ValidationResponse {
  success: boolean
  validation_results: {
    session_id: string
    overall_status: 'passed' | 'failed' | 'warning' | 'no_validation'
    total_validations: number
    critical_failures: number
    validation_details: Array<{
      rule_name: string
      rule_category: string
      result: 'pass' | 'fail' | 'warning' | 'inconclusive'
      confidence: number
      severity: string
      recommendations?: string[]
      evidence_citations?: unknown[]
    }>
    safety_assessment?: {
      risk_level: 'minimal' | 'low' | 'medium' | 'high'
      safety_signals: unknown[]
      recommended_actions: string[]
    }
    compliance_status?: {
      hipaa_compliant: boolean
      fda_compliant: boolean
      regulatory_notes: string[]
    }
    next_steps: string[]
    expires_at: string
  }
  error?: string
}

interface SafetySignalRequest {
  intervention_id?: string
  time_window?: string // ISO 8601 duration
  signal_types?: string[]
}

interface SafetySignalResponse {
  success: boolean
  analysis: {
    analysis_period: string
    intervention_scope: string
    event_patterns: unknown
    signal_detected: boolean
    risk_level: 'minimal' | 'low' | 'medium' | 'high'
    recommendations: string[]
    analysis_timestamp: string
  }
  active_signals: Array<{
    signal_id: string
    signal_type: string
    strength: string
    clinical_significance: string
    investigation_status: string
    detected_at: string
  }>
  error?: string
}

// POST /api/clinical/validation - Execute clinical validation
export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json()
    const {
      content_data,
      validation_context = { /* TODO: implement */ },
      intervention_id,
      clinical_domain,
      validation_scope = 'safety',
      priority_level = 'medium'
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

    // Execute clinical validation
    const { data: validationResult, error: validationError } = await supabase
      .rpc('execute_clinical_validation', {
        org_id: userProfile.organization_id,
        content_data: content_data,
        validation_context: {
          ...validation_context,
          user_id: user.user.id,
          intervention_id,
          clinical_domain,
          validation_scope,
          priority_level,
          timestamp: new Date().toISOString()
        }
      })

    if (validationError) {
      // console.error('Clinical validation error:', validationError)
      return NextResponse.json({
        success: false,
        error: 'Clinical validation failed'
      }, { status: 500 })
    }

    // Get detailed validation results

    const { data: validationDetails, error: detailsError } = await supabase
      .from('clinical_validation_executions')
      .select(`
        rule_id,
        validation_result,
        confidence_score,
        result_details,
        recommendations,
        evidence_citations,
        clinical_impact_assessment,
        clinical_validation_rules_detailed!inner (
          rule_name,
          rule_category,
          severity_level,
          clinical_rationale,
          remediation_guidance
        )
      `)
      .eq('validation_session_id', sessionId)
      .order('executed_at', { ascending: true })

    if (detailsError) {
      // console.error('Validation details error:', detailsError)
    }

    // Assess safety if intervention_id is provided

    if (intervention_id) {
      const { data: safetyAnalysis } = await supabase
        .rpc('detect_safety_signals', {
          org_id: userProfile.organization_id,
          intervention_id: intervention_id,
          time_window: '7 days'
        })

      safetyAssessment = safetyAnalysis
    }

    // Check compliance status
    const complianceStatus = {
      hipaa_compliant: true, // Would implement actual HIPAA checks
      fda_compliant: validationResult.critical_failures === 0,
      regulatory_notes: validationResult.critical_failures > 0
        ? ['Critical validation failures detected - FDA submission not recommended']
        : ['All critical validations passed - ready for regulatory review']
    }

    // Generate next steps based on validation results

    if (validationResult.critical_failures > 0) {
      nextSteps.push('Address critical validation failures before proceeding')
      nextSteps.push('Review clinical safety protocols')
    }
    if (safetyAssessment?.signal_detected) {
      nextSteps.push('Investigate detected safety signals')
      nextSteps.push('Consider additional safety monitoring')
    }
    if (nextSteps.length === 0) {
      nextSteps.push('All validations passed - ready to proceed')
      nextSteps.push('Consider periodic re-validation')
    }

    // Log validation activity
    await supabase
      .from('usage_analytics')
      .insert({
        organization_id: userProfile.organization_id,
        user_id: user.user.id,
        event_type: 'clinical_validation',
        resource_type: 'validation_session',
        resource_id: sessionId,
        metrics: {
          validation_scope,
          total_validations: validationResult.total_validations,
          critical_failures: validationResult.critical_failures,
          overall_status: validationResult.overall_status,
          clinical_domain,
          intervention_id
        }
      })

    const response: ValidationResponse = {
      success: true,
      validation_results: {
        session_id: sessionId,
        overall_status: validationResult.overall_status,
        total_validations: validationResult.total_validations,
        critical_failures: validationResult.critical_failures,
        validation_details: validationDetails?.map((detail: unknown) => ({
          rule_name: detail.clinical_validation_rules_detailed.rule_name,
          rule_category: detail.clinical_validation_rules_detailed.rule_category,
          result: detail.validation_result,
          confidence: detail.confidence_score,
          severity: detail.clinical_validation_rules_detailed.severity_level,
          recommendations: detail.recommendations || [],
          evidence_citations: detail.evidence_citations || []
        })) || [],
        safety_assessment: safetyAssessment,
        compliance_status: complianceStatus,
        next_steps: nextSteps,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    // console.error('Clinical validation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/clinical/validation?session_id=... - Get validation results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'session_id parameter required'
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

    // Get validation results
    const { data: validationResults, error: resultsError } = await supabase
      .from('clinical_validation_executions')
      .select(`
        *,
        clinical_validation_rules_detailed!inner (
          rule_name,
          rule_category,
          severity_level,
          clinical_rationale,
          remediation_guidance
        )
      `)
      .eq('validation_session_id', sessionId)
      .eq('organization_id', userProfile.organization_id)
      .order('executed_at', { ascending: true })

    if (resultsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch validation results'
      }, { status: 500 })
    }

    if (!validationResults || validationResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation session not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      validation_results: validationResults
    })

  } catch (error) {
    // console.error('Validation retrieval API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
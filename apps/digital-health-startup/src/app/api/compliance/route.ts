/**
 * HIPAA Compliance Monitoring API
 * GET /api/compliance - Get compliance dashboard data
 * POST /api/compliance/validate - Validate data for HIPAA compliance
 */

import { NextRequest, NextResponse } from 'next/server';

import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import { HIPAAComplianceManager } from '@/lib/compliance/hipaa-compliance';

// Initialize services
let orchestrator: ComplianceAwareOrchestrator | null = null;
let complianceManager: HIPAAComplianceManager | null = null;

async function getOrchestrator(): Promise<ComplianceAwareOrchestrator> {
  if (!orchestrator) {
    orchestrator = new ComplianceAwareOrchestrator();
    await orchestrator.initializeWithCompliance();
  }
  return orchestrator;
}

function getComplianceManager(): HIPAAComplianceManager {
  if (!complianceManager) {
    complianceManager = new HIPAAComplianceManager();
  }
  return complianceManager;
}

/**
 * GET /api/compliance
 * Returns compliance dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const days = parseInt(searchParams.get('days') || '30');

    const orch = await getOrchestrator();

    // Calculate time range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };

    // Get compliance dashboard data
    const dashboard = orch.getComplianceDashboard(timeRange);

    // Get user-specific data if requested
    let userAuditTrail = null;
    let userViolations = false;

    if (userId) {
      userAuditTrail = orch.getUserAuditTrail(userId, days);
      userViolations = orch.hasUserViolations(userId, 7);
    }

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        user_specific: userId ? {
          user_id: userId,
          audit_trail: userAuditTrail,
          recent_violations: userViolations,
          access_count: userAuditTrail?.length || 0
        } : null,
        time_range: timeRange
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch compliance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/validate
 * Validate data for HIPAA compliance before processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.data_content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: 'user_id and data_content are required'
        },
        { status: 400 }
      );
    }

    const complianceManager = getComplianceManager();

    // Detect PHI in the provided data
    const phiDetection = complianceManager.detectPHI(body.data_content);

    // Validate compliance for the data processing request
    const dataProcessingRequest = {
      user_id: body.user_id,
      resource_type: body.resource_type || 'data',
      resource_id: body.resource_id || 'validation_request',
      action: body.action || 'read',
      purpose: body.purpose || 'Data validation for compliance',
      data_content: body.data_content,
      context: {
        user_id: body.user_id,
        session_id: body.session_id || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        compliance_level: body.compliance_level || 'high',
        audit_required: true
      }
    };

    const validationResult = await complianceManager.validateCompliance(dataProcessingRequest);

    // Create compliance record
    const complianceRecord = await complianceManager.createComplianceRecord(
      dataProcessingRequest,
      validationResult
    );

    return NextResponse.json({
      success: true,
      data: {
        validation_result: validationResult,
        phi_detection: {
          contains_phi: phiDetection.containsPHI,
          phi_types: phiDetection.phiTypes,
          confidence: phiDetection.confidence,
          redacted_content: phiDetection.redactedContent
        },
        compliance_record: {
          audit_trail_id: complianceRecord.audit_trail_id,
          timestamp: complianceRecord.timestamp,
          authorization_basis: complianceRecord.authorization_basis
        },
        recommendations: validationResult.recommendations
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error validating compliance:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Compliance validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
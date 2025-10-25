/**
 * VITAL Path Core Processing API
 * Main entry point for enhanced Phase 1 functionality
 */

import { NextRequest, NextResponse } from 'next/server';

import { VitalPathRequest } from '@/core/VitalPathCore';

export async function POST(request: NextRequest) {
  try {

    // // Parse request body

    const {
      query,
      type = 'query',
      domain = 'general',
      userId,
      userRole,
      context = { /* TODO: implement */ },
      metadata = { /* TODO: implement */ }
    } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Extract request metadata

                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Create VITAL Path request
    const vitalRequest: VitalPathRequest = {
      id: generateRequestId(),
      type,
      query,
      userId,
      userRole,
      domain,
      context: {
        urgency: context.urgency || 'normal',
        complexity: context.complexity || 'moderate',
        dataType: context.dataType || 'public',
        location: context.location,
        sessionId: context.sessionId
      },
      metadata: {
        ...metadata,
        clientIP,
        userAgent,
        apiVersion: '2.0.0',
        timestamp: new Date().toISOString()
      }
    };

    // // Process through VITAL Path Core

    // Log processing results
    // // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: response.id,
        requestId: response.requestId,
        response: response.response,
        workflowId: response.workflowId,
        evidence: response.evidence?.slice(0, 5), // Limit evidence in API response
        metrics: {
          processingTime: response.metrics.processingTime,
          llmLatency: response.metrics.llmLatency,
          ragLatency: response.metrics.ragLatency,
          providerUsed: response.metrics.providerUsed,
          totalCost: response.metrics.totalCost
        },
        compliance: {
          compliant: response.compliance.compliant,
          riskLevel: response.compliance.riskLevel,
          violationCount: response.compliance.violations.length
        },
        traceId: response.traceId,
        timestamp: response.timestamp
      },
      metadata: {
        apiVersion: '2.0.0',
        processingNode: 'vital-path-core',
        totalLatency: Date.now() - startTime
      }
    });

  } catch (error) {
    // console.error('VITAL Path Core API error:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal processing error',
        details: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          apiVersion: '2.0.0',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // // Get system health

    return NextResponse.json({
      success: true,
      data: {
        status: health.overall,
        services: health.services,
        metrics: health.metrics,
        timestamp: health.timestamp
      },
      metadata: {
        apiVersion: '2.0.0',
        endpoint: 'health-check'
      }
    });

  } catch (error) {
    // console.error('VITAL Path Core health check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateRequestId(): string {

  return `req_${timestamp}_${random}`;
}
/**
 * VITAL Path Healthcare API Middleware
 * Comprehensive middleware for healthcare compliance, validation, and security
 */

import { NextRequest, NextResponse } from 'next/server';

import { auditLogger } from './audit-logger.middleware';
import { authenticateRequest } from './auth.middleware';
import { validateHIPAACompliance } from './hipaa-validator.middleware';
import { rateLimit } from './rate-limiter.middleware';
// import { sanitizeInput } from './input-sanitizer.middleware';

// Healthcare-specific rate limits

  // Critical medical endpoints require stricter limits
  '/api/agents/clinical-*': { requests: 10, window: 60000 }, // 10 requests per minute
  '/api/agents/safety-*': { requests: 5, window: 60000 }, // 5 requests per minute
  '/api/agents/regulatory-*': { requests: 15, window: 60000 }, // 15 requests per minute

  // General healthcare endpoints
  '/api/agents/*': { requests: 30, window: 60000 }, // 30 requests per minute
  '/api/events/websocket': { requests: 100, window: 60000 }, // 100 connections per minute
  '/api/knowledge/*': { requests: 50, window: 60000 }, // 50 requests per minute

  // LLM endpoints with higher limits for AI processing
  '/api/llm/*': { requests: 100, window: 60000 }, // 100 requests per minute

  // Default fallback
  '*': { requests: 60, window: 60000 } // 60 requests per minute
};

// Medical safety keywords that require additional validation

  'emergency', 'urgent', 'critical', 'life-threatening', 'cardiac arrest',
  'stroke', 'chest pain', 'difficulty breathing', 'overdose', 'suicide',
  'bleeding', 'unconscious', 'severe pain', 'allergic reaction',
  'poisoning', 'trauma', 'heart attack', 'anaphylaxis'
];

// PHI (Protected Health Information) detection patterns

  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{10,15}\b/, // Phone numbers
  /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // Dates (potential DOB)
  /\bMRN[:\s]*\d+\b/i, // Medical Record Number
  /\bpatient[:\s]+[a-z\s]+\b/i, // Patient names
];

interface HealthcareAPIContext {
  agentType?: string;
  medicalDomain?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  requiresSpecialistReview?: boolean;
  auditLevel?: 'basic' | 'detailed' | 'comprehensive';
}

export async function healthcareAPIMiddleware(
  request: NextRequest,
  context?: HealthcareAPIContext
): Promise<NextResponse | null> {

  try {
    // 1. Basic request validation and sanitization
    // TODO: Re-implement input sanitization without JSDOM for Edge Runtime compatibility

    // const _sanitizedRequest = await sanitizeInput(request);
    // if (!sanitizedRequest) {
    //   return createErrorResponse('Invalid request format', 400, requestId);
    // }

    // 2. Authentication and authorization

    if (!authResult.success) {
      await auditLogger.logSecurityEvent('AUTH_FAILURE', {
        requestId,
        ip: sanitizedRequest.ip,
        path: sanitizedRequest.nextUrl.pathname,
        reason: authResult.error
      });
      return createErrorResponse('Unauthorized access', 401, requestId);
    }

    // 3. Rate limiting with healthcare-specific rules

    if (!rateLimitResult.success) {
      await auditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        requestId,
        userId: authResult.user?.id,
        ip: sanitizedRequest.ip,
        path: sanitizedRequest.nextUrl.pathname,
        limit: rateLimitResult.limit,
        current: rateLimitResult.current
      });
      return createErrorResponse(
        `Rate limit exceeded. Try again in ${rateLimitResult.resetTime}ms`,
        429,
        requestId
      );
    }

    // 4. HIPAA compliance validation

    if (!hipaaValidation.compliant) {
      await auditLogger.logComplianceViolation('HIPAA_VIOLATION', {
        requestId,
        userId: authResult.user?.id,
        violations: hipaaValidation.violations.map((v: any) => `${v.type}: ${v.description}`),
        endpoint: sanitizedRequest.nextUrl.pathname
      });
      return createErrorResponse(
        'Request violates HIPAA compliance requirements',
        400,
        requestId,
        { violations: hipaaValidation.violations }
      );
    }

    // 5. Medical safety validation

    if (!safetyValidation.safe) {
      await auditLogger.logMedicalSafetyAlert('SAFETY_CONCERN', {
        requestId,
        userId: authResult.user?.id,
        concerns: safetyValidation.concerns,
        riskLevel: safetyValidation.riskLevel,
        requiresReview: safetyValidation.requiresSpecialistReview
      });

      // For critical safety concerns, block the request
      if (safetyValidation.riskLevel === 'critical') {
        return createErrorResponse(
          'Request flagged for medical safety concerns. Please consult a healthcare professional.',
          403,
          requestId,
          {
            safetyNotice: 'For medical emergencies, please call 911 or contact your local emergency services.',
            concerns: safetyValidation.concerns
          }
        );
      }
    }

    // 6. Content validation for healthcare agents
    if (sanitizedRequest.nextUrl.pathname.includes('/api/agents/')) {

      if (!contentValidation.valid) {
        return createErrorResponse(
          'Content validation failed',
          400,
          requestId,
          { issues: contentValidation.issues }
        );
      }
    }

    // 7. Log successful request for audit trail
    await auditLogger.logAPIRequest('success', {
      requestId,
      userId: authResult.user?.id,
      path: sanitizedRequest.nextUrl.pathname,
      method: sanitizedRequest.method,
      agentType: context?.agentType,
      riskLevel: context?.riskLevel || safetyValidation.riskLevel,
      processingTime: Date.now() - startTime
    });

    // 8. Add healthcare headers to response

    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Healthcare-Compliance', 'HIPAA-Validated');
    response.headers.set('X-Medical-Safety-Level', safetyValidation.riskLevel);
    response.headers.set('X-Processing-Time', `${Date.now() - startTime}ms`);

    if (safetyValidation.requiresSpecialistReview) {
      response.headers.set('X-Specialist-Review-Required', 'true');
    }

    return response;

  } catch (error) {
    // Log middleware errors
    await auditLogger.logSystemError('MIDDLEWARE_ERROR', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: request.nextUrl.pathname,
      processingTime: Date.now() - startTime
    });

    return createErrorResponse(
      'Internal server error during request processing',
      500,
      requestId
    );
  }
}

async function applyHealthcareRateLimit(request: NextRequest) {

  // Find matching rate limit rule

  for (const [pattern, limit] of Object.entries(HEALTHCARE_RATE_LIMITS)) {
    if (pattern !== '*' && matchesPattern(path, pattern)) {
      ruleKey = pattern;
      rule = limit;
      break;
    }
  }

  return await rateLimit({
    key: `${ip}:${ruleKey}`,
    limit: rule.requests,
    window: rule.window
  });
}

async function validateMedicalSafety(
  body: unknown,
  context?: HealthcareAPIContext
): Promise<{
  safe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  concerns: string[];
  requiresSpecialistReview: boolean;
}> {
  const concerns: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (!body || typeof body !== 'object') {
    return { safe: true, riskLevel: 'low', concerns: [], requiresSpecialistReview: false };
  }

  // Check for medical emergency keywords

    textContent.includes(keyword.toLowerCase())
  );

  if (emergencyKeywords.length > 0) {
    concerns.push(`Contains medical emergency keywords: ${emergencyKeywords.join(', ')}`);
    riskLevel = 'critical';
    requiresSpecialistReview = true;
  }

  // Check for medication-related queries that need pharmacist review

    textContent.includes(keyword)
  );

  if (hasMedicationContent) {
    concerns.push('Contains medication-related content requiring specialist review');
    riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    requiresSpecialistReview = true;
  }

  // Check for diagnostic-related content

    textContent.includes(keyword)
  );

  if (hasDiagnosticContent && riskLevel === 'low') {
    concerns.push('Contains diagnostic-related content');
    riskLevel = 'medium';
  }

  return {
    safe: riskLevel !== 'critical',
    riskLevel,
    concerns,
    requiresSpecialistReview
  };
}

async function validateHealthcareContent(
  body: unknown,
  context?: HealthcareAPIContext
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  if (!body || typeof body !== 'object') {
    issues.push('Invalid request body format');
    return { valid: false, issues };
  }

  // Validate required healthcare agent fields
  if (body.agentType && !isValidHealthcareAgentType(body.agentType)) {
    issues.push(`Invalid healthcare agent type: ${body.agentType}`);
  }

  // Validate query content
  if (body.query && typeof body.query === 'string') {
    if (body.query.length < 10) {
      issues.push('Query too short for meaningful healthcare analysis');
    }
    if (body.query.length > 10000) {
      issues.push('Query exceeds maximum length for healthcare processing');
    }
  }

  // Validate medical context if provided
  if (body.medicalContext) {

    if (!contextValidation.valid) {
      issues.push(...contextValidation.issues);
    }
  }

  return { valid: issues.length === 0, issues };
}

async function validateMedicalContext(context: unknown): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  if (typeof context !== 'object') {
    issues.push('Medical context must be an object');
    return { valid: false, issues };
  }

  // Validate specialty field
  if (context.specialty && !isValidMedicalSpecialty(context.specialty)) {
    issues.push(`Invalid medical specialty: ${context.specialty}`);
  }

  // Validate urgency level
  if (context.urgency && !['low', 'medium', 'high', 'critical'].includes(context.urgency)) {
    issues.push(`Invalid urgency level: ${context.urgency}`);
  }

  return { valid: issues.length === 0, issues };
}

function isValidHealthcareAgentType(agentType: string): boolean {

    'digital-therapeutics-expert',
    'fda-regulatory-strategist',
    'clinical-trial-designer',
    'medical-safety-officer',
    'ai-ml-clinical-specialist',
    'health-economics-analyst',
    'biomedical-informatics-specialist',
    'clinical-data-scientist',
    'pharmaceutical-rd-director',
    'market-access-strategist',
    'regulatory-affairs-manager',
    'clinical-research-coordinator',
    'medical-device-engineer',
    'healthcare-compliance-officer',
    'precision-medicine-specialist'
  ];
  return validTypes.includes(agentType);
}

function isValidMedicalSpecialty(specialty: string): boolean {

    'cardiology', 'oncology', 'neurology', 'psychiatry', 'endocrinology',
    'gastroenterology', 'pulmonology', 'nephrology', 'rheumatology',
    'dermatology', 'ophthalmology', 'otolaryngology', 'orthopedics',
    'emergency-medicine', 'family-medicine', 'internal-medicine',
    'pediatrics', 'geriatrics', 'radiology', 'pathology', 'anesthesiology',
    'surgery', 'obstetrics-gynecology', 'urology', 'infectious-disease'
  ];
  return validSpecialties.includes(specialty);
}

async function getRequestBody(request: NextRequest): Promise<unknown> {
  try {
    if (request.method === 'GET') return { /* TODO: implement */ };

    return body;
  } catch {
    return { /* TODO: implement */ };
  }
}

function matchesPattern(path: string, pattern: string): boolean {
  // Convert pattern to regex (simple implementation)

    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  return regex.test(path);
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createErrorResponse(
  message: string,
  status: number,
  requestId: string,
  additionalData?: unknown
): NextResponse {

    error: {
      message,
      status,
      requestId,
      timestamp: new Date().toISOString(),
      ...additionalData
    }
  };

  return NextResponse.json(errorResponse, {
    status,
    headers: {
      'X-Request-ID': requestId,
      'X-Healthcare-Error': 'true',
      'Content-Type': 'application/json'
    }
  });
}

// Export individual middleware functions for testing
export {
  applyHealthcareRateLimit,
  validateMedicalSafety,
  validateHealthcareContent,
  validateMedicalContext,
  isValidHealthcareAgentType,
  isValidMedicalSpecialty
};
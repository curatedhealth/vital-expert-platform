/**
 * VITAL Path Input Sanitizer Middleware
 * Sanitizes and validates all input data for healthcare compliance
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { NextRequest } from 'next/server';

// Initialize DOMPurify for server-side use

// Healthcare-specific dangerous patterns

  // SQL Injection patterns
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(;\s*--)|(--\s*$)/gi,
    /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/gi
  ],

  // XSS patterns
  XSS_INJECTION: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi
  ],

  // Command injection
  COMMAND_INJECTION: [
    /[;&|`$(){ /* TODO: implement */ }[\]]/g,
    /\b(rm|del|format|shutdown|reboot)\b/gi,
    /\b(curl|wget|nc|netcat)\b/gi
  ],

  // LDAP injection
  LDAP_INJECTION: [
    /[*()\\]/g,
    /\b(objectClass|cn|uid|mail)\b/gi
  ],

  // Path traversal
  PATH_TRAVERSAL: [
    /\.\.[\/\\]/g,
    /[\/\\]etc[\/\\]/gi,
    /[\/\\]proc[\/\\]/gi,
    /[\/\\]sys[\/\\]/gi
  ],

  // Medical code injection (specific to healthcare)
  MEDICAL_CODE_INJECTION: [
    /\b(ICD-10|ICD-9|CPT|HCPCS)\b.*[;&|`]/gi,
    /\bLOINC\b.*[<>]/gi,
    /\bSNOMED\b.*[()]/gi
  ]
};

// Maximum input lengths for different types

  QUERY: 10000,
  NAME: 100,
  EMAIL: 254,
  PHONE: 20,
  ADDRESS: 500,
  DESCRIPTION: 5000,
  MEDICAL_HISTORY: 10000,
  MEDICATION: 200,
  ALLERGY: 200
};

// Allowed characters for different input types

  ALPHANUMERIC: /^[a-zA-Z0-9\s\-_.]+$/,
  ALPHA: /^[a-zA-Z\s\-']+$/,
  NUMERIC: /^[0-9\-+().]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  MEDICAL_CODE: /^[A-Z0-9\-.:]+$/,
  MEDICAL_TEXT: /^[a-zA-Z0-9\s\-_.,;:()'"/&%\n\r]+$/
};

interface SanitizationResult {
  sanitized: unknown;
  warnings: string[];
  blocked: boolean;
  reason?: string;
}

export async function sanitizeInput(request: NextRequest): Promise<NextRequest | null> {
  try {
    // Clone request for modification

    // Sanitize URL parameters

    url.search = sanitizedParams.toString();

    // Sanitize headers

    // For methods with body, sanitize the body
    let sanitizedBody: unknown = null;
    if (request.method !== 'GET' && request.method !== 'DELETE') {
      try {

        if (bodyResult.blocked) {
          return null; // Block dangerous requests
        }

        sanitizedBody = bodyResult.sanitized;
      } catch {
        // Not JSON body, handle as text or form data
        try {

          if (textResult.blocked) {
            return null;
          }

          sanitizedBody = textResult.sanitized;
        } catch {
          // Unable to parse body, proceed without sanitization
        }
      }
    }

    // Create new request with sanitized data

      method: request.method,
      headers: sanitizedHeaders,
      body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined
    });

    return sanitizedRequest;

  } catch (error) {
    // console.error('Input sanitization error:', error);
    return null; // Block request on sanitization error
  }
}

function sanitizeQueryParams(params: URLSearchParams): URLSearchParams {

  for (const [key, value] of params.entries()) {
    // Sanitize parameter key

    // Sanitize parameter value

    // Only add if both key and value are clean
    // eslint-disable-next-line security/detect-object-injection
    if (cleanKey && cleanValue && !detectDangerousPatterns(cleanValue).blocked) {
      sanitized.append(cleanKey, cleanValue);
    }
  }

  return sanitized;
}

function sanitizeHeaders(headers: Headers): Headers {

  // List of safe headers to preserve

    'content-type',
    'accept',
    'authorization',
    'user-agent',
    'x-request-id',
    'x-healthcare-session',
    'x-api-version'
  ];

  for (const [key, value] of headers.entries()) {

    // eslint-disable-next-line security/detect-object-injection
    if (safeHeaders.includes(lowerKey)) {
      // Additional sanitization for specific headers

      // eslint-disable-next-line security/detect-object-injection
      if (lowerKey === 'authorization') {
        // Basic sanitization for auth header
        cleanValue = value.replace(/[<>'"]/g, '');
      // eslint-disable-next-line security/detect-object-injection
      } else if (lowerKey === 'user-agent') {
        // Limit user agent length and remove dangerous characters
        cleanValue = value.substring(0, 200).replace(/[<>'"]/g, '');
      }

      sanitized.set(key, cleanValue);
    }
  }

  return sanitized;
}

function sanitizeRequestBody(body: unknown): SanitizationResult {
  if (!body || typeof body !== 'object') {
    return { sanitized: body, warnings: [], blocked: false };
  }

  const warnings: string[] = [];

  let reason: string | undefined;

  // Recursively sanitize object properties

  // Check for dangerous patterns in the entire object

  if (dangerCheck.blocked) {
    blocked = true;
    reason = dangerCheck.reason;
  }

  return { sanitized, warnings, blocked, reason };
}

function sanitizeObjectRecursive(obj: unknown, warnings: string[]): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: any) => sanitizeObjectRecursive(item, warnings));
  }

  if (typeof obj === 'object') {
    const sanitized: unknown = { /* TODO: implement */ };

    for (const [key, value] of Object.entries(obj)) {
      // Sanitize property key

      if (typeof value === 'string') {
        // Determine appropriate sanitization based on key name

        if (result.warnings.length > 0) {
          warnings.push(...result.warnings.map((w: any) => `${key}: ${w}`));
        }

        // eslint-disable-next-line security/detect-object-injection
        sanitized[cleanKey] = result.sanitized;
      } else {
        // eslint-disable-next-line security/detect-object-injection
        sanitized[cleanKey] = sanitizeObjectRecursive(value, warnings);
      }
    }

    return sanitized;
  }

  return obj;
}

function sanitizeText(
  text: string,
  type: keyof typeof INPUT_LIMITS | keyof typeof ALLOWED_PATTERNS = 'QUERY'
): SanitizationResult {
  if (!text || typeof text !== 'string') {
    return { sanitized: text, warnings: [], blocked: false };
  }

  const warnings: string[] = [];

  let reason: string | undefined;

  // Check input length
  // eslint-disable-next-line security/detect-object-injection

  if (limit && text.length > limit) {
    warnings.push(`Input truncated from ${text.length} to ${limit} characters`);
    sanitized = text.substring(0, limit);
  }

  // Check for dangerous patterns

  if (dangerCheck.blocked) {
    blocked = true;
    reason = dangerCheck.reason;
    return { sanitized: '', warnings, blocked, reason };
  }

  // Apply HTML sanitization
  sanitized = purify.sanitize(sanitized);

  // Apply pattern-based sanitization
  // eslint-disable-next-line security/detect-object-injection

  if (pattern && !pattern.test(sanitized)) {
    if (type === 'MEDICAL_TEXT' || type === 'QUERY') {
      // For medical text and queries, be more permissive but clean dangerous chars
      sanitized = sanitized.replace(/[<>'"]/g, '');
      warnings.push('Removed potentially dangerous characters');
    } else {
      // For stricter types, remove non-matching characters
      sanitized = sanitized.replace(new RegExp(`[^${pattern.source.slice(2, -2)}]`, 'g'), '');
      warnings.push(`Removed characters not matching ${type} pattern`);
    }
  }

  // Additional healthcare-specific sanitization
  if (type === 'MEDICAL_TEXT' || type === 'QUERY') {
    sanitized = sanitizeMedicalContent(sanitized);
  }

  return { sanitized, warnings, blocked, reason };
}

function detectDangerousPatterns(input: string): { blocked: boolean; reason?: string } {
  // eslint-disable-next-line security/detect-object-injection
  for (const [category, patterns] of Object.entries(DANGEROUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        return {
          blocked: true,
          reason: `Detected ${category.toLowerCase().replace('_', ' ')} pattern`
        };
      }
    }
  }

  return { blocked: false };
}

function determineSanitizationType(key: string): keyof typeof INPUT_LIMITS | keyof typeof ALLOWED_PATTERNS {

  if (keyLower.includes('email')) return 'EMAIL';
  if (keyLower.includes('phone')) return 'PHONE';
  if (keyLower.includes('name')) return 'ALPHA';
  if (keyLower.includes('code') && (keyLower.includes('icd') || keyLower.includes('cpt'))) return 'MEDICAL_CODE';
  if (keyLower.includes('medical') || keyLower.includes('history') || keyLower.includes('symptom')) return 'MEDICAL_TEXT';
  if (keyLower.includes('query') || keyLower.includes('message') || keyLower.includes('content')) return 'QUERY';

  return 'QUERY'; // Default to most permissive
}

function sanitizeMedicalContent(text: string): string {

  // Remove potential PHI patterns while preserving medical context
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]');
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]');

  // Preserve medical codes but sanitize format
  sanitized = sanitized.replace(/\b(ICD-?10?)[:\s]*([A-Z0-9.-]+)\b/gi, '$1: $2');
  sanitized = sanitized.replace(/\b(CPT)[:\s]*([0-9]{5})\b/gi, '$1: $2');

  return sanitized;
}

// Export utility functions for testing
export {
  DANGEROUS_PATTERNS,
  INPUT_LIMITS,
  ALLOWED_PATTERNS,
  detectDangerousPatterns,
  sanitizeText,
  sanitizeMedicalContent
};
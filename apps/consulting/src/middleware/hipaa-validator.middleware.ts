/**
 * VITAL Path HIPAA Compliance Validator
 * Ensures all healthcare data processing complies with HIPAA regulations
 */

// PHI (Protected Health Information) identifiers as defined by HIPAA

  // Direct identifiers
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  PHONE: /\b(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Medical identifiers
  MRN: /\b(?:MRN|Medical\s+Record\s+Number)[:\s]*([A-Z0-9-]+)\b/gi,
  ACCOUNT_NUMBER: /\b(?:Account\s+Number|Acct\s*#)[:\s]*([A-Z0-9-]+)\b/gi,
  HEALTH_PLAN_ID: /\b(?:Health\s+Plan\s+ID|Insurance\s+ID)[:\s]*([A-Z0-9-]+)\b/gi,

  // Dates that could identify patients
  SPECIFIC_DATES: /\b(?:DOB|Date\s+of\s+Birth|Born\s+on)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/gi,

  // Names in medical context
  PATIENT_NAMES: /\b(?:Patient|Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,

  // Addresses
  STREET_ADDRESS: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
  ZIP_CODE: /\b\d{5}(?:-\d{4})?\b/g,

  // Biometric identifiers
  DEVICE_SERIAL: /\b(?:Serial\s+Number|S\/N)[:\s]*([A-Z0-9-]+)\b/gi,

  // Web URLs that might contain PHI
  WEB_URLS: /\bhttps?:\/\/[^\s]+/gi,

  // Certificate/License numbers
  CERTIFICATE_NUMBER: /\b(?:Certificate|License|Cert\s*#|Lic\s*#)[:\s]*([A-Z0-9-]+)\b/gi
};

// HIPAA-safe geographical subdivisions (populations > 20,000)

  'united states', 'california', 'texas', 'florida', 'new york', 'pennsylvania',
  'illinois', 'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey',
  'virginia', 'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana',
  'maryland', 'missouri', 'wisconsin', 'colorado', 'minnesota', 'south carolina',
  'alabama', 'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut',
  'utah', 'iowa', 'nevada', 'arkansas', 'mississippi', 'kansas', 'new mexico',
  'nebraska', 'west virginia', 'idaho', 'hawaii', 'new hampshire', 'maine',
  'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota',
  'alaska', 'vermont', 'wyoming'
]);

interface HIPAAValidationResult {
  compliant: boolean;
  violations: HIPAAViolation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent?: any;
}

interface HIPAAViolation {
  type: string;
  pattern: string;
  matches: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export async function validateHIPAACompliance(
  content: unknown,
  endpoint?: string
): Promise<HIPAAValidationResult> {
  if (!content) {
    return {
      compliant: true,
      violations: [],
      riskLevel: 'low'
    };
  }

  // Convert content to searchable string

    ? content
    : JSON.stringify(content, null, 2);

  const violations: HIPAAViolation[] = [];

  // Check for each PHI pattern
  for (const [patternName, regex] of Object.entries(PHI_PATTERNS)) {

    if (matches.length > 0) {

      violations.push({
        type: patternName,
        pattern: regex.source,
        matches: matchedText,
        severity: getSeverityForPattern(patternName),
        description: getDescriptionForPattern(patternName),
        recommendation: getRecommendationForPattern(patternName)
      });
    }
  }

  // Check for location information that might be too specific

  violations.push(...locationViolations);

  // Determine overall risk level

  // Determine compliance status

  return {
    compliant,
    violations,
    riskLevel,
    sanitizedContent: compliant ? content : await sanitizeContent(content, violations)
  };
}

function getSeverityForPattern(patternName: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    SSN: 'critical',
    MRN: 'critical',
    ACCOUNT_NUMBER: 'high',
    HEALTH_PLAN_ID: 'high',
    PATIENT_NAMES: 'high',
    PHONE: 'medium',
    EMAIL: 'medium',
    SPECIFIC_DATES: 'medium',
    STREET_ADDRESS: 'medium',
    ZIP_CODE: 'low',
    DEVICE_SERIAL: 'low',
    WEB_URLS: 'low',
    CERTIFICATE_NUMBER: 'medium'
  };

  // eslint-disable-next-line security/detect-object-injection
  return severityMap[patternName] || 'low';
}

function getDescriptionForPattern(patternName: string): string {
  const descriptions: Record<string, string> = {
    SSN: 'Social Security Number detected - direct HIPAA identifier',
    MRN: 'Medical Record Number detected - direct HIPAA identifier',
    ACCOUNT_NUMBER: 'Account number detected - potential HIPAA identifier',
    HEALTH_PLAN_ID: 'Health plan identifier detected - direct HIPAA identifier',
    PATIENT_NAMES: 'Patient name detected - direct HIPAA identifier',
    PHONE: 'Phone number detected - potential HIPAA identifier',
    EMAIL: 'Email address detected - potential HIPAA identifier',
    SPECIFIC_DATES: 'Specific date detected - potential birth date',
    STREET_ADDRESS: 'Street address detected - geographic identifier',
    ZIP_CODE: 'ZIP code detected - may need population verification',
    DEVICE_SERIAL: 'Device serial number detected - potential identifier',
    WEB_URLS: 'Web URL detected - may contain identifying information',
    CERTIFICATE_NUMBER: 'Certificate/license number detected'
  };

  // eslint-disable-next-line security/detect-object-injection
  return descriptions[patternName] || 'Potential PHI detected';
}

function getRecommendationForPattern(patternName: string): string {
  const recommendations: Record<string, string> = {
    SSN: 'Remove or redact Social Security Number completely',
    MRN: 'Replace with anonymized patient identifier',
    ACCOUNT_NUMBER: 'Replace with generic account reference',
    HEALTH_PLAN_ID: 'Remove or replace with plan type only',
    PATIENT_NAMES: 'Replace with generic patient reference (e.g., "Patient A")',
    PHONE: 'Remove phone number or use generic format',
    EMAIL: 'Remove email or use domain-only reference',
    SPECIFIC_DATES: 'Use age ranges or relative dates instead',
    STREET_ADDRESS: 'Use city/state only or remove completely',
    ZIP_CODE: 'Verify population > 20,000 or use 3-digit ZIP',
    DEVICE_SERIAL: 'Replace with device type only',
    WEB_URLS: 'Remove URLs or ensure they contain no PHI',
    CERTIFICATE_NUMBER: 'Replace with certification type only'
  };

  // eslint-disable-next-line security/detect-object-injection
  return recommendations[patternName] || 'Review and redact if containing PHI';
}

async function checkLocationCompliance(content: string): Promise<HIPAAViolation[]> {
  const violations: HIPAAViolation[] = [];

  // Look for ZIP codes and verify they represent populations > 20,000

  if (zipMatches) {
    for (const zip of zipMatches) {

      if (!isCompliant) {
        violations.push({
          type: 'SMALL_POPULATION_ZIP',
          pattern: zip,
          matches: [zip],
          severity: 'medium',
          description: 'ZIP code may represent population < 20,000',
          recommendation: 'Use 3-digit ZIP code or city/state only'
        });
      }
    }
  }

  return violations;
}

async function checkZipCodeCompliance(zipCode: string): Promise<boolean> {
  // In production, this would query a demographic database
  // For now, implement basic heuristics

  // Rural state ZIP codes more likely to be small populations

  if (ruralStateZips.includes(firstTwo)) {
    return false; // Potentially non-compliant
  }

  // Urban area ZIP codes generally safe
  return true;
}

function determineRiskLevel(violations: HIPAAViolation[]): 'low' | 'medium' | 'high' | 'critical' {
  if (violations.length === 0) return 'low';

    switch (v.severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }));

  switch (maxSeverity) {
    case 4: return 'critical';
    case 3: return 'high';
    case 2: return 'medium';
    default: return 'low';
  }
}

function isHealthcareEndpoint(endpoint?: string): boolean {
  if (!endpoint) return false;

    '/api/agents/',
    '/api/clinical/',
    '/api/medical/',
    '/api/healthcare/'
  ];

  return healthcareEndpoints.some(path => endpoint.includes(path));
}

async function sanitizeContent(content: unknown, violations: HIPAAViolation[]): Promise<unknown> {
  if (typeof content === 'string') {

    for (const violation of violations) {
      for (const match of violation.matches) {
        switch (violation.type) {
          case 'SSN':
            sanitized = sanitized.replace(match, 'XXX-XX-XXXX');
            break;
          case 'MRN':
            sanitized = sanitized.replace(match, 'MRN: [REDACTED]');
            break;
          case 'PATIENT_NAMES':
            sanitized = sanitized.replace(match, match.split(' ')[0] + ' [PATIENT NAME REDACTED]');
            break;
          case 'PHONE':
            sanitized = sanitized.replace(match, 'XXX-XXX-XXXX');
            break;
          case 'EMAIL':

            sanitized = sanitized.replace(match, `[REDACTED]@${domain}`);
            break;
          default:
            sanitized = sanitized.replace(match, '[REDACTED]');
        }
      }
    }

    return sanitized;
  } else if (typeof content === 'object') {
    // Deep sanitization for objects
    return await sanitizeObjectContent(content, violations);
  }

  return content;
}

async function sanitizeObjectContent(obj: unknown, violations: HIPAAViolation[]): Promise<unknown> {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: unknown = Array.isArray(obj) ? [] : { /* TODO: implement */ };

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // eslint-disable-next-line security/detect-object-injection
      sanitized[key] = await sanitizeContent(value, violations);
    } else if (typeof value === 'object') {
      // eslint-disable-next-line security/detect-object-injection
      sanitized[key] = await sanitizeObjectContent(value, violations);
    } else {
      // eslint-disable-next-line security/detect-object-injection
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// Export utility functions for testing
export {
  PHI_PATTERNS,
  getSeverityForPattern,
  getDescriptionForPattern,
  getRecommendationForPattern,
  checkLocationCompliance,
  determineRiskLevel,
  sanitizeContent
};
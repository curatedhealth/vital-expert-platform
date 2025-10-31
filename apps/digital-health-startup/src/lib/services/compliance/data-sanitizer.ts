/**
 * Data Sanitization Service
 * Removes PII, PHI, and sensitive data to ensure compliance
 */

export interface SanitizationResult {
  sanitized: boolean;
  originalLength: number;
  sanitizedLength: number;
  removedContent: RemovedContent[];
  piiDetected: PIIDetection[];
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  sanitizedContent: string;
  needsReview: boolean;
}

export interface RemovedContent {
  type: string; // 'pii', 'phi', 'sensitive', 'credit_card', 'ssn', etc.
  location: string; // Page number or section
  originalText: string; // Original content (truncated)
  replacement: string; // Replacement text
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PIIDetection {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'dob' | 'mrn' | 'ip_address' | 'license_plate';
  confidence: number; // 0-1
  location: string;
  snippet: string; // Detected text snippet
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SanitizationOptions {
  removePII?: boolean;
  removePHI?: boolean;
  removeCreditCards?: boolean;
  removeSSN?: boolean;
  removeEmail?: boolean;
  removePhone?: boolean;
  removeAddress?: boolean;
  removeNames?: boolean;
  redactionMode?: 'mask' | 'remove' | 'hash'; // How to handle detected content
  preserveFormat?: boolean; // Keep structure but remove sensitive data
  logRemovals?: boolean; // Log what was removed for audit
}

export class DataSanitizer {
  // PII Patterns
  private readonly emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private readonly phonePattern = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  private readonly ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  private readonly creditCardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  private readonly ipAddressPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

  // PHI Patterns (Healthcare)
  private readonly mrnPattern = /\bMRN:?\s*\d{6,}\b/gi;
  private readonly dobPattern = /\b(?:dob|date of birth|birth date):\s*\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/gi;
  private readonly licensePlatePattern = /\b[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,2}\b/g;

  // Address Patterns
  private readonly addressPattern = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Pl|Way)\b/gi;

  // Name Patterns (common names - more sophisticated would use NER)
  private readonly namePattern = /\b(?:Mr|Ms|Mrs|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;

  /**
   * Sanitize content to remove PII, PHI, and sensitive data
   */
  async sanitizeContent(
    content: string,
    options: SanitizationOptions = {}
  ): Promise<SanitizationResult> {
    const {
      removePII = true,
      removePHI = true,
      removeCreditCards = true,
      removeSSN = true,
      removeEmail = true,
      removePhone = true,
      removeAddress = true,
      removeNames = false, // More conservative - names might be needed for citations
      redactionMode = 'mask',
      logRemovals = true,
    } = options;

    let sanitizedContent = content;
    const removedContent: RemovedContent[] = [];
    const piiDetected: PIIDetection[] = [];
    let riskLevel: SanitizationResult['riskLevel'] = 'none';

    // Detect and remove emails
    if (removeEmail || removePII) {
      const emailMatches = content.match(this.emailPattern);
      if (emailMatches) {
        for (const email of emailMatches) {
          piiDetected.push({
            type: 'email',
            confidence: 0.95,
            location: this.findLocation(content, email),
            snippet: email,
            severity: 'medium',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            email,
            '[EMAIL REDACTED]',
            redactionMode,
            removedContent,
            'email'
          );
        }
      }
    }

    // Detect and remove phone numbers
    if (removePhone || removePII) {
      const phoneMatches = content.match(this.phonePattern);
      if (phoneMatches) {
        for (const phone of phoneMatches) {
          piiDetected.push({
            type: 'phone',
            confidence: 0.9,
            location: this.findLocation(content, phone),
            snippet: phone,
            severity: 'medium',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            phone,
            '[PHONE REDACTED]',
            redactionMode,
            removedContent,
            'phone'
          );
        }
      }
    }

    // Detect and remove SSN
    if (removeSSN || removePII) {
      const ssnMatches = content.match(this.ssnPattern);
      if (ssnMatches) {
        for (const ssn of ssnMatches) {
          piiDetected.push({
            type: 'ssn',
            confidence: 0.98,
            location: this.findLocation(content, ssn),
            snippet: ssn,
            severity: 'critical',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            ssn,
            '[SSN REDACTED]',
            redactionMode,
            removedContent,
            'ssn'
          );
        }
      }
    }

    // Detect and remove credit cards
    if (removeCreditCards || removePII) {
      const cardMatches = content.match(this.creditCardPattern);
      if (cardMatches) {
        for (const card of cardMatches) {
          piiDetected.push({
            type: 'credit_card',
            confidence: 0.85,
            location: this.findLocation(content, card),
            snippet: this.maskCard(card),
            severity: 'critical',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            card,
            '[CREDIT CARD REDACTED]',
            redactionMode,
            removedContent,
            'credit_card'
          );
        }
      }
    }

    // Detect and remove MRN (Medical Record Number) - PHI
    if (removePHI) {
      const mrnMatches = content.match(this.mrnPattern);
      if (mrnMatches) {
        for (const mrn of mrnMatches) {
          piiDetected.push({
            type: 'mrn',
            confidence: 0.95,
            location: this.findLocation(content, mrn),
            snippet: mrn,
            severity: 'critical',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            mrn,
            '[MRN REDACTED]',
            redactionMode,
            removedContent,
            'phi'
          );
        }
      }

      // Detect and remove DOB
      const dobMatches = content.match(this.dobPattern);
      if (dobMatches) {
        for (const dob of dobMatches) {
          piiDetected.push({
            type: 'dob',
            confidence: 0.9,
            location: this.findLocation(content, dob),
            snippet: dob,
            severity: 'high',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            dob,
            '[DATE OF BIRTH REDACTED]',
            redactionMode,
            removedContent,
            'phi'
          );
        }
      }
    }

    // Detect and remove IP addresses
    if (removePII) {
      const ipMatches = content.match(this.ipAddressPattern);
      if (ipMatches) {
        for (const ip of ipMatches) {
          // Filter out common non-PII IPs (like 127.0.0.1)
          if (!ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
            piiDetected.push({
              type: 'ip_address',
              confidence: 0.8,
              location: this.findLocation(content, ip),
              snippet: ip,
              severity: 'medium',
            });

            sanitizedContent = this.redactContent(
              sanitizedContent,
              ip,
              '[IP ADDRESS REDACTED]',
              redactionMode,
              removedContent,
              'ip_address'
            );
          }
        }
      }
    }

    // Detect and remove addresses
    if (removeAddress || removePII) {
      const addressMatches = content.match(this.addressPattern);
      if (addressMatches) {
        for (const address of addressMatches) {
          piiDetected.push({
            type: 'address',
            confidence: 0.75,
            location: this.findLocation(content, address),
            snippet: address,
            severity: 'high',
          });

          sanitizedContent = this.redactContent(
            sanitizedContent,
            address,
            '[ADDRESS REDACTED]',
            redactionMode,
            removedContent,
            'address'
          );
        }
      }
    }

    // Detect names (optional - can be too aggressive)
    if (removeNames) {
      const nameMatches = content.match(this.namePattern);
      if (nameMatches) {
        for (const name of nameMatches) {
          // Don't redact common titles or professional titles in citations
          if (!name.includes('Dr.') && !name.includes('Prof.') && !name.includes('Mr.') && !name.includes('Ms.')) {
            sanitizedContent = this.redactContent(
              sanitizedContent,
              name,
              '[NAME REDACTED]',
              redactionMode,
              removedContent,
              'name'
            );
          }
        }
      }
    }

    // Determine risk level
    const criticalCount = piiDetected.filter(p => p.severity === 'critical').length;
    const highCount = piiDetected.filter(p => p.severity === 'high').length;

    if (criticalCount > 0) {
      riskLevel = 'critical';
    } else if (highCount > 2) {
      riskLevel = 'high';
    } else if (piiDetected.length > 5) {
      riskLevel = 'medium';
    } else if (piiDetected.length > 0) {
      riskLevel = 'low';
    }

    const needsReview = riskLevel === 'critical' || riskLevel === 'high' || criticalCount > 0;

    return {
      sanitized: removedContent.length > 0,
      originalLength: content.length,
      sanitizedLength: sanitizedContent.length,
      removedContent: logRemovals ? removedContent : [],
      piiDetected,
      riskLevel,
      sanitizedContent,
      needsReview,
    };
  }

  /**
   * Redact content based on mode
   */
  private redactContent(
    content: string,
    original: string,
    replacement: string,
    mode: 'mask' | 'remove' | 'hash',
    removedContent: RemovedContent[],
    type: string
  ): string {
    let newContent = content;
    let finalReplacement = replacement;

    switch (mode) {
      case 'mask':
        finalReplacement = replacement;
        break;
      case 'remove':
        finalReplacement = '';
        break;
      case 'hash':
        finalReplacement = `[${type.toUpperCase()}_HASH:${this.hashString(original)}]`;
        break;
    }

    newContent = newContent.replace(original, finalReplacement);

    removedContent.push({
      type,
      location: this.findLocation(content, original),
      originalText: original.length > 50 ? original.substring(0, 50) + '...' : original,
      replacement: finalReplacement,
      severity: this.getSeverityForType(type),
    });

    return newContent;
  }

  /**
   * Find approximate location of text in content
   */
  private findLocation(content: string, text: string): string {
    const index = content.indexOf(text);
    if (index === -1) return 'unknown';

    // Calculate approximate line number
    const lineNumber = content.substring(0, index).split('\n').length;
    const charInLine = index - content.lastIndexOf('\n', index);

    return `Line ${lineNumber}, character ${charInLine}`;
  }

  /**
   * Get severity for PII type
   */
  private getSeverityForType(type: string): RemovedContent['severity'] {
    const criticalTypes = ['ssn', 'credit_card', 'mrn', 'phi'];
    const highTypes = ['address', 'dob'];
    const mediumTypes = ['email', 'phone'];

    if (criticalTypes.includes(type)) return 'critical';
    if (highTypes.includes(type)) return 'high';
    if (mediumTypes.includes(type)) return 'medium';
    return 'low';
  }

  /**
   * Mask credit card (show only last 4 digits)
   */
  private maskCard(card: string): string {
    const digits = card.replace(/\D/g, '');
    if (digits.length >= 4) {
      return '****-****-****-' + digits.slice(-4);
    }
    return '****';
  }

  /**
   * Hash string for reference tracking
   */
  private hashString(str: string): string {
    // Simple hash - in production, use crypto.createHash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }
}

// Export singleton instance
export const dataSanitizer = new DataSanitizer();


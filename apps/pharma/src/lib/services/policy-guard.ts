/**
 * Policy Guard Service
 * GDPR/AI Act compliance checks and PHI/PII detection
 * Based on LangGraph Implementation Guide for Pharma
 */

export interface PolicyCheckResult {
  action: 'block' | 'warn' | 'ok';
  riskTags: string[];
  notes: string;
  remediationTips?: string[];
}

export type PolicyProfile = 'MEDICAL' | 'COMMERCIAL' | 'R&D';

export class PolicyGuard {
  /**
   * Check text for policy violations
   */
  async check(text: string, profile: PolicyProfile = 'MEDICAL'): Promise<PolicyCheckResult> {
    const riskTags: string[] = [];
    const remediationTips: string[] = [];

    // Check for missing citations
    if (!this.hasCitations(text)) {
      riskTags.push('Missing Citations');
      remediationTips.push('Add Harvard-style citations for all factual claims');
    }

    // Check for PHI/PII
    const phiDetected = this.detectPHI(text);
    if (phiDetected.length > 0) {
      riskTags.push('PHI/PII Detected');
      remediationTips.push(`Remove personal identifiers: ${phiDetected.join(', ')}`);
    }

    // Check for promotional language (Commercial profile)
    if (profile === 'COMMERCIAL') {
      if (this.detectPromotionalClaims(text)) {
        riskTags.push('Promotional Language');
        remediationTips.push('Ensure claims are evidence-based and not promotional');
      }
    }

    // Check for benefit-risk imbalance (Medical profile)
    if (profile === 'MEDICAL') {
      if (this.detectImbalancedClaims(text)) {
        riskTags.push('Benefit-Risk Imbalance');
        remediationTips.push('Balance efficacy claims with safety considerations');
      }
    }

    // Determine action
    let action: 'block' | 'warn' | 'ok' = 'ok';
    if (phiDetected.length > 0) {
      action = 'block'; // Always block PHI
    } else if (riskTags.length > 0) {
      action = 'warn';
    }

    return {
      action,
      riskTags,
      notes: this.generateNotes(riskTags),
      remediationTips: remediationTips.length > 0 ? remediationTips : undefined
    };
  }

  /**
   * Check for citations in text
   */
  private hasCitations(text: string): boolean {
    const citationPatterns = [
      /\([A-Z][a-z]+\s+\d{4}\)/,  // (Smith 2024)
      /\[\d+\]/,                   // [1]
      /\([A-Z]+\s+\d{4}\)/         // (EMA 2024)
    ];

    return citationPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect PHI/PII in text
   */
  private detectPHI(text: string): string[] {
    const detected: string[] = [];

    // Email addresses
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
      detected.push('email address');
    }

    // Phone numbers
    if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text)) {
      detected.push('phone number');
    }

    // SSN-like patterns
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
      detected.push('SSN-like identifier');
    }

    // Patient names (very simplified)
    if (/patient\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i.test(text)) {
      detected.push('patient name');
    }

    return detected;
  }

  /**
   * Detect promotional language
   */
  private detectPromotionalClaims(text: string): boolean {
    const promotionalTerms = [
      /\bbest\b/i,
      /\bsuperior\b/i,
      /\bguarantee/i,
      /\bbreakthrough\b/i,
      /\bmiraculous\b/i
    ];

    return promotionalTerms.some(term => term.test(text));
  }

  /**
   * Detect imbalanced benefit-risk claims
   */
  private detectImbalancedClaims(text: string): boolean {
    const benefitTerms = ['effective', 'benefit', 'efficacy', 'improvement'];
    const riskTerms = ['risk', 'adverse', 'safety', 'side effect'];

    const benefitCount = benefitTerms.filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    const riskCount = riskTerms.filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    // Flag if benefits mentioned without any safety considerations
    return benefitCount > 2 && riskCount === 0;
  }

  /**
   * Generate notes for policy check
   */
  private generateNotes(riskTags: string[]): string {
    if (riskTags.length === 0) {
      return 'Content passes policy checks';
    }

    return `Policy concerns identified: ${riskTags.join(', ')}. Please review and remediate before proceeding.`;
  }

  /**
   * Redact PHI/PII from text
   */
  redactPHI(text: string): string {
    let redacted = text;

    // Redact emails
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL REDACTED]'
    );

    // Redact phone numbers
    redacted = redacted.replace(
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      '[PHONE REDACTED]'
    );

    // Redact SSN-like
    redacted = redacted.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      '[SSN REDACTED]'
    );

    return redacted;
  }
}

// Singleton instance
export const policyGuard = new PolicyGuard();

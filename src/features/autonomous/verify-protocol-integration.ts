import { VERIFYProtocol, MedicalCapability } from '../../types/healthcare-compliance';
import { Evidence, EvidenceType } from './autonomous-state';
import { evidenceVerifier } from './evidence-verifier';

/**
 * VERIFY Protocol Integration for Autonomous Agents
 * 
 * This module integrates the existing VERIFY protocol framework with the autonomous
 * evidence verification system, ensuring medical-grade validation for autonomous tasks.
 */

export interface AutonomousVERIFYConfig {
  minImpactFactor: number;
  requiredGuidelines: string[];
  expertThreshold: number;
  citationFormat: string;
  evidenceRequirements: string;
  medicalDomain: string;
}

export interface VERIFYValidationResult {
  isValid: boolean;
  confidence: number;
  violations: string[];
  recommendations: string[];
  requiresExpertReview: boolean;
  evidenceQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class AutonomousVERIFYIntegration {
  private verifyConfig: AutonomousVERIFYConfig;
  private medicalCapabilities: Map<string, MedicalCapability> = new Map();

  constructor(verifyConfig: AutonomousVERIFYConfig) {
    this.verifyConfig = verifyConfig;
  }

  /**
   * Register medical capabilities for VERIFY protocol validation
   */
  registerMedicalCapability(capability: MedicalCapability): void {
    this.medicalCapabilities.set(capability.id, capability);
  }

  /**
   * Apply VERIFY protocol to autonomous evidence verification
   */
  async applyVERIFYProtocol(
    evidence: Evidence[],
    medicalDomain: string = 'general'
  ): Promise<VERIFYValidationResult> {
    console.log('🔬 [AutonomousVERIFY] Applying VERIFY protocol to evidence');

    const violations: string[] = [];
    const recommendations: string[] = [];
    let totalConfidence = 0;
    let validEvidenceCount = 0;

    // Apply VERIFY protocol to each piece of evidence
    for (const ev of evidence) {
      const validation = await this.validateEvidence(ev, medicalDomain);
      
      if (validation.isValid) {
        validEvidenceCount++;
        totalConfidence += validation.confidence;
      } else {
        violations.push(...validation.violations);
      }
      
      recommendations.push(...validation.recommendations);
    }

    const avgConfidence = validEvidenceCount > 0 ? totalConfidence / validEvidenceCount : 0;
    const evidenceQuality = this.assessEvidenceQuality(avgConfidence, validEvidenceCount, evidence.length);
    const requiresExpertReview = avgConfidence < this.verifyConfig.expertThreshold;

    const result: VERIFYValidationResult = {
      isValid: validEvidenceCount === evidence.length && avgConfidence >= 0.7,
      confidence: avgConfidence,
      violations: [...new Set(violations)], // Remove duplicates
      recommendations: [...new Set(recommendations)],
      requiresExpertReview,
      evidenceQuality
    };

    console.log('✅ [AutonomousVERIFY] VERIFY protocol validation complete:', {
      isValid: result.isValid,
      confidence: result.confidence,
      quality: result.evidenceQuality,
      requiresExpertReview: result.requiresExpertReview
    });

    return result;
  }

  /**
   * Validate individual evidence against VERIFY protocol
   */
  private async validateEvidence(
    evidence: Evidence,
    medicalDomain: string
  ): Promise<{
    isValid: boolean;
    confidence: number;
    violations: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // 1. Validate source credibility (VERIFY: Evidence)
    const sourceCredibility = this.checkSourceCredibility(evidence.source);
    if (sourceCredibility < 0.7) {
      violations.push(`Source credibility below threshold: ${evidence.source} (${sourceCredibility.toFixed(2)})`);
      recommendations.push('Use peer-reviewed sources with Impact Factor >3.0');
    }

    // 2. Validate evidence type (VERIFY: Evidence)
    if (!this.isValidEvidenceType(evidence.type, medicalDomain)) {
      violations.push(`Invalid evidence type for ${medicalDomain}: ${evidence.type}`);
      recommendations.push('Use primary sources (clinical trials, systematic reviews) for medical claims');
    }

    // 3. Validate content quality (VERIFY: Fact-check)
    const contentQuality = this.assessContentQuality(evidence.content);
    if (contentQuality < 0.6) {
      violations.push(`Content quality below threshold: ${contentQuality.toFixed(2)}`);
      recommendations.push('Ensure content includes specific data, statistics, and clinical details');
    }

    // 4. Validate citations (VERIFY: Evidence)
    if (evidence.citations.length === 0) {
      violations.push('No citations provided for medical evidence');
      recommendations.push('Include proper citations in required format');
    }

    // 5. Validate confidence score (VERIFY: Yield)
    if (evidence.confidence < 0.6) {
      violations.push(`Evidence confidence below threshold: ${evidence.confidence.toFixed(2)}`);
      recommendations.push('Increase evidence quality or seek additional sources');
    }

    // 6. Check for medical disclaimers (VERIFY: Identify)
    if (this.requiresMedicalDisclaimer(evidence.content, medicalDomain)) {
      recommendations.push('Include appropriate medical disclaimers and limitations');
    }

    const isValid = violations.length === 0;
    const confidence = this.calculateOverallConfidence(evidence, sourceCredibility, contentQuality);

    return {
      isValid,
      confidence,
      violations,
      recommendations
    };
  }

  /**
   * Check source credibility against VERIFY protocol standards
   */
  private checkSourceCredibility(source: string): number {
    const sourceLower = source.toLowerCase();
    
    // High credibility sources (Impact Factor >3.0)
    if (sourceLower.includes('pubmed') || sourceLower.includes('ncbi')) return 0.95;
    if (sourceLower.includes('nejm') || sourceLower.includes('lancet')) return 0.9;
    if (sourceLower.includes('jama') || sourceLower.includes('bmj')) return 0.9;
    if (sourceLower.includes('cochrane') || sourceLower.includes('systematic review')) return 0.85;
    
    // Regulatory sources
    if (sourceLower.includes('fda.gov') || sourceLower.includes('ema.europa.eu')) return 0.95;
    if (sourceLower.includes('clinicaltrials.gov')) return 0.85;
    
    // Medical databases
    if (sourceLower.includes('uptodate') || sourceLower.includes('dynamed')) return 0.8;
    if (sourceLower.includes('mayoclinic') || sourceLower.includes('webmd')) return 0.6;
    
    // Low credibility sources
    if (sourceLower.includes('wikipedia')) return 0.4;
    if (sourceLower.includes('blog') || sourceLower.includes('forum')) return 0.2;
    
    return 0.5; // Default
  }

  /**
   * Validate evidence type for medical domain
   */
  private isValidEvidenceType(type: EvidenceType, medicalDomain: string): boolean {
    const validTypes: Record<string, EvidenceType[]> = {
      'clinical': ['primary', 'clinical_data', 'regulatory'],
      'regulatory': ['regulatory', 'primary', 'clinical_data'],
      'research': ['primary', 'secondary', 'literature'],
      'general': ['primary', 'secondary', 'expert_opinion', 'clinical_data', 'regulatory', 'literature']
    };

    const allowedTypes = validTypes[medicalDomain] || validTypes['general'];
    return allowedTypes.includes(type);
  }

  /**
   * Assess content quality for medical evidence
   */
  private assessContentQuality(content: any): number {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const contentLower = contentStr.toLowerCase();

    let quality = 0.5; // Base quality

    // Length and detail
    if (contentStr.length > 100) quality += 0.1;
    if (contentStr.length > 500) quality += 0.1;

    // Medical terminology
    const medicalTerms = ['clinical', 'trial', 'study', 'patient', 'treatment', 'efficacy', 'safety'];
    const termCount = medicalTerms.filter(term => contentLower.includes(term)).length;
    quality += (termCount / medicalTerms.length) * 0.2;

    // Statistical data
    if (/\d+%/.test(contentStr) || /\d+\.\d+/.test(contentStr)) quality += 0.1;

    // References and citations
    if (/\[.*\]/.test(contentStr) || /doi:|pmid:/i.test(contentStr)) quality += 0.1;

    return Math.min(1.0, quality);
  }

  /**
   * Check if medical disclaimer is required
   */
  private requiresMedicalDisclaimer(content: any, medicalDomain: string): boolean {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const contentLower = contentStr.toLowerCase();

    const disclaimerTriggers = [
      'treatment', 'therapy', 'medication', 'drug', 'diagnosis', 'prognosis',
      'recommend', 'suggest', 'advise', 'prescribe', 'dosage'
    ];

    return disclaimerTriggers.some(trigger => contentLower.includes(trigger));
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(
    evidence: Evidence,
    sourceCredibility: number,
    contentQuality: number
  ): number {
    const typeWeight = this.getEvidenceTypeWeight(evidence.type);
    const baseConfidence = evidence.confidence;
    
    return (baseConfidence * 0.4 + sourceCredibility * 0.4 + contentQuality * 0.2) * typeWeight;
  }

  /**
   * Get evidence type weight for confidence calculation
   */
  private getEvidenceTypeWeight(type: EvidenceType): number {
    const weights: Record<EvidenceType, number> = {
      'primary': 1.0,
      'clinical_data': 0.95,
      'regulatory': 0.9,
      'secondary': 0.8,
      'literature': 0.7,
      'expert_opinion': 0.6
    };

    return weights[type] || 0.5;
  }

  /**
   * Assess overall evidence quality
   */
  private assessEvidenceQuality(
    avgConfidence: number,
    validCount: number,
    totalCount: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const validityRate = validCount / totalCount;

    if (avgConfidence >= 0.9 && validityRate >= 0.95) return 'excellent';
    if (avgConfidence >= 0.8 && validityRate >= 0.8) return 'good';
    if (avgConfidence >= 0.6 && validityRate >= 0.6) return 'fair';
    return 'poor';
  }

  /**
   * Generate VERIFY protocol recommendations for autonomous agents
   */
  generateVERIFYRecommendations(validationResult: VERIFYValidationResult): string[] {
    const recommendations: string[] = [];

    if (validationResult.requiresExpertReview) {
      recommendations.push('⚠️ Expert medical review required due to low confidence');
    }

    if (validationResult.evidenceQuality === 'poor') {
      recommendations.push('🔍 Evidence quality is poor - seek additional high-quality sources');
    }

    if (validationResult.violations.length > 0) {
      recommendations.push('❌ VERIFY protocol violations detected - address before proceeding');
    }

    if (validationResult.confidence < 0.8) {
      recommendations.push('📊 Consider cross-referencing with additional sources');
    }

    return recommendations;
  }

  /**
   * Create VERIFY protocol summary for autonomous execution
   */
  createVERIFYSummary(validationResult: VERIFYValidationResult): string {
    const status = validationResult.isValid ? '✅ PASSED' : '❌ FAILED';
    const quality = validationResult.evidenceQuality.toUpperCase();
    const expertReview = validationResult.requiresExpertReview ? ' (Expert Review Required)' : '';

    return `VERIFY Protocol Validation: ${status}
Evidence Quality: ${quality}${expertReview}
Confidence Score: ${(validationResult.confidence * 100).toFixed(1)}%
Violations: ${validationResult.violations.length}
Recommendations: ${validationResult.recommendations.length}`;
  }
}

/**
 * Default VERIFY configuration for autonomous agents
 */
export const defaultAutonomousVERIFYConfig: AutonomousVERIFYConfig = {
  minImpactFactor: 3.0,
  requiredGuidelines: ['FDA', 'EMA', 'WHO'],
  expertThreshold: 0.8,
  citationFormat: 'APA',
  evidenceRequirements: 'Peer-reviewed sources with Impact Factor >3.0',
  medicalDomain: 'general'
};

/**
 * Create VERIFY protocol integration instance
 */
export function createAutonomousVERIFYIntegration(
  config: Partial<AutonomousVERIFYConfig> = {}
): AutonomousVERIFYIntegration {
  const finalConfig = { ...defaultAutonomousVERIFYConfig, ...config };
  return new AutonomousVERIFYIntegration(finalConfig);
}

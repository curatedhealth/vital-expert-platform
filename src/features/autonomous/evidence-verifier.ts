import { Evidence, Proof, Task, Goal } from './autonomous-state';
import { createHash } from 'crypto';

export type EvidenceType = 'primary' | 'secondary' | 'expert_opinion' | 'clinical_data' | 'regulatory' | 'literature';

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  credibilityScore: number;
  sourceVerified: boolean;
  contradictions: string[];
  verificationMethod: string;
  timestamp: Date;
}

export interface CrossReferenceResult {
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  consensusScore: number;
  reliabilityScore: number;
  crossReferenceCount: number;
}

export interface Contradiction {
  evidenceA: Evidence;
  evidenceB: Evidence;
  conflictType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface EvidenceChain {
  id: string;
  goalId: string;
  evidences: Evidence[];
  chainHash: string;
  verificationProof: string;
  createdAt: Date;
  confidence: number;
}

export interface ReasoningProof {
  id: string;
  goalId: string;
  tasks: Task[];
  reasoningPath: string[];
  evidenceChain: EvidenceChain;
  conclusion: string;
  confidence: number;
  proofHash: string;
  createdAt: Date;
}

export interface EvidenceSynthesis {
  summary: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  consensus: string;
  confidence: number;
  citations: string[];
  recommendations: string[];
}

export class EvidenceVerifier {
  private evidenceDatabase: Map<string, Evidence>;
  private verificationCache: Map<string, VerificationResult>;
  private sourceCredibility: Map<string, number>;

  constructor() {
    this.evidenceDatabase = new Map();
    this.verificationCache = new Map();
    this.sourceCredibility = new Map();
    
    // Initialize source credibility scores
    this.initializeSourceCredibility();
  }

  /**
   * Evidence Collection
   */

  collectEvidence(taskResult: any, task: Task): Evidence[] {
    console.log('📋 [EvidenceVerifier] Collecting evidence from task:', task.id);

    const evidences: Evidence[] = [];

    // Extract evidence from different parts of task result
    if (taskResult.sources && Array.isArray(taskResult.sources)) {
      taskResult.sources.forEach((source: any, index: number) => {
        const evidence: Evidence = {
          id: this.generateEvidenceId(),
          taskId: task.id,
          type: this.classifyEvidenceType(source),
          source: typeof source === 'string' ? source : source.url || source.title || 'Unknown',
          content: typeof source === 'string' ? source : JSON.stringify(source),
          confidence: this.calculateInitialConfidence(source),
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: this.createCryptographicHash(source),
          citations: [`[${index + 1}]`]
        };
        evidences.push(evidence);
      });
    }

    // Extract evidence from citations
    if (taskResult.citations && Array.isArray(taskResult.citations)) {
      taskResult.citations.forEach((citation: string, index: number) => {
        const evidence: Evidence = {
          id: this.generateEvidenceId(),
          taskId: task.id,
          type: 'literature',
          source: citation,
          content: citation,
          confidence: 0.8, // Citations are generally reliable
          verificationStatus: 'unverified',
          timestamp: new Date(),
          hash: this.createCryptographicHash(citation),
          citations: [`[${index + 1}]`]
        };
        evidences.push(evidence);
      });
    }

    // Extract evidence from synthesis or answer
    if (taskResult.synthesis || taskResult.answer) {
      const content = taskResult.synthesis || taskResult.answer;
      const evidence: Evidence = {
        id: this.generateEvidenceId(),
        taskId: task.id,
        type: 'secondary',
        source: 'task_synthesis',
        content: content,
        confidence: this.calculateInitialConfidence(content),
        verificationStatus: 'unverified',
        timestamp: new Date(),
        hash: this.createCryptographicHash(content),
        citations: []
      };
      evidences.push(evidence);
    }

    // Store evidences in database
    evidences.forEach(evidence => {
      this.evidenceDatabase.set(evidence.id, evidence);
    });

    console.log('✅ [EvidenceVerifier] Collected', evidences.length, 'pieces of evidence');
    return evidences;
  }

  classifyEvidenceType(evidence: any): EvidenceType {
    if (typeof evidence === 'string') {
      const evidenceStr = evidence.toLowerCase();
      
      if (evidenceStr.includes('pubmed') || evidenceStr.includes('clinical trial')) {
        return 'clinical_data';
      }
      if (evidenceStr.includes('fda') || evidenceStr.includes('regulatory')) {
        return 'regulatory';
      }
      if (evidenceStr.includes('expert') || evidenceStr.includes('opinion')) {
        return 'expert_opinion';
      }
      if (evidenceStr.includes('study') || evidenceStr.includes('research')) {
        return 'primary';
      }
      if (evidenceStr.includes('review') || evidenceStr.includes('meta-analysis')) {
        return 'secondary';
      }
    }

    // Default classification based on source
    if (evidence.url) {
      const url = evidence.url.toLowerCase();
      if (url.includes('pubmed') || url.includes('clinicaltrials.gov')) {
        return 'clinical_data';
      }
      if (url.includes('fda.gov') || url.includes('ema.europa.eu')) {
        return 'regulatory';
      }
      if (url.includes('wikipedia') || url.includes('webmd')) {
        return 'secondary';
      }
    }

    return 'secondary'; // Default fallback
  }

  generateEvidenceId(): string {
    return `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  linkEvidenceToGoal(evidence: Evidence, goalId: string): void {
    console.log('🔗 [EvidenceVerifier] Linking evidence to goal:', evidence.id, '->', goalId);
    
    evidence.goalId = goalId;
    this.evidenceDatabase.set(evidence.id, evidence);
  }

  /**
   * Evidence Verification
   */

  verifyEvidence(evidence: Evidence): VerificationResult {
    console.log('🔍 [EvidenceVerifier] Verifying evidence:', evidence.id);

    // Check cache first
    const cacheKey = `${evidence.id}_${evidence.hash}`;
    if (this.verificationCache.has(cacheKey)) {
      return this.verificationCache.get(cacheKey)!;
    }

    const credibilityScore = this.checkSourceCredibility(evidence.source);
    const sourceVerified = this.verifySource(evidence.source);
    const contradictions = this.detectContradictions([evidence]);
    
    const confidence = this.calculateConfidence(evidence);
    const verified = confidence > 0.3 && credibilityScore > 0.3 && sourceVerified;

    const result: VerificationResult = {
      verified,
      confidence,
      credibilityScore,
      sourceVerified,
      contradictions: contradictions.map(c => c.description),
      verificationMethod: this.determineVerificationMethod(evidence),
      timestamp: new Date()
    };

    // Cache the result
    this.verificationCache.set(cacheKey, result);

    console.log('✅ [EvidenceVerifier] Evidence verification complete:', {
      verified: result.verified,
      confidence: result.confidence,
      credibility: result.credibilityScore
    });

    return result;
  }

  crossReferenceEvidence(evidenceList: Evidence[]): CrossReferenceResult {
    console.log('🔍 [EvidenceVerifier] Cross-referencing', evidenceList.length, 'pieces of evidence');

    const supportingEvidence: Evidence[] = [];
    const contradictingEvidence: Evidence[] = [];
    const contradictions: Contradiction[] = [];

    // Check for contradictions
    for (let i = 0; i < evidenceList.length; i++) {
      for (let j = i + 1; j < evidenceList.length; j++) {
        const contradiction = this.findContradiction(evidenceList[i], evidenceList[j]);
        if (contradiction) {
          contradictions.push(contradiction);
          contradictingEvidence.push(evidenceList[i], evidenceList[j]);
        }
      }
    }

    // Identify supporting evidence (non-contradicting)
    evidenceList.forEach(evidence => {
      if (!contradictingEvidence.some(e => e.id === evidence.id)) {
        supportingEvidence.push(evidence);
      }
    });

    const consensusScore = this.calculateConsensusScore(supportingEvidence, contradictions);
    const reliabilityScore = this.calculateReliabilityScore(evidenceList);

    const result: CrossReferenceResult = {
      supportingEvidence,
      contradictingEvidence: [...new Set(contradictingEvidence)], // Remove duplicates
      consensusScore,
      reliabilityScore,
      crossReferenceCount: evidenceList.length
    };

    console.log('✅ [EvidenceVerifier] Cross-reference complete:', {
      supporting: supportingEvidence.length,
      contradicting: contradictingEvidence.length,
      consensus: consensusScore,
      reliability: reliabilityScore
    });

    return result;
  }

  checkSourceCredibility(source: string): number {
    // Check if we have a cached credibility score
    if (this.sourceCredibility.has(source)) {
      return this.sourceCredibility.get(source)!;
    }

    // Calculate credibility based on source characteristics
    let credibility = 0.5; // Base credibility

    const sourceLower = source.toLowerCase();

    // High credibility sources
    if (sourceLower.includes('pubmed') || sourceLower.includes('ncbi')) {
      credibility = 0.9;
    } else if (sourceLower.includes('fda.gov') || sourceLower.includes('ema.europa.eu')) {
      credibility = 0.95;
    } else if (sourceLower.includes('clinicaltrials.gov')) {
      credibility = 0.85;
    } else if (sourceLower.includes('nejm') || sourceLower.includes('lancet')) {
      credibility = 0.9;
    } else if (sourceLower.includes('cochrane') || sourceLower.includes('systematic review')) {
      credibility = 0.85;
    } else if (sourceLower.includes('wikipedia')) {
      credibility = 0.6;
    } else if (sourceLower.includes('webmd') || sourceLower.includes('mayoclinic')) {
      credibility = 0.7;
    } else if (sourceLower.includes('expert') || sourceLower.includes('opinion')) {
      credibility = 0.6;
    }

    // Cache the result
    this.sourceCredibility.set(source, credibility);
    return credibility;
  }

  detectContradictions(evidenceList: Evidence[]): Contradiction[] {
    const contradictions: Contradiction[] = [];

    for (let i = 0; i < evidenceList.length; i++) {
      for (let j = i + 1; j < evidenceList.length; j++) {
        const contradiction = this.findContradiction(evidenceList[i], evidenceList[j]);
        if (contradiction) {
          contradictions.push(contradiction);
        }
      }
    }

    return contradictions;
  }

  /**
   * Proof Generation
   */

  generateProof(evidence: Evidence[]): Proof {
    console.log('🔐 [EvidenceVerifier] Generating proof for', evidence.length, 'pieces of evidence');

    const evidenceHashes = evidence.map(e => e.hash).sort();
    const proofHash = this.createCryptographicHash(evidenceHashes.join('|'));
    const timestamp = new Date();

    const proof: Proof = {
      id: `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      evidenceIds: evidence.map(e => e.id),
      proofHash,
      verificationChain: evidenceHashes,
      timestamp,
      verified: true,
      confidence: this.aggregateConfidence(evidence)
    };

    console.log('✅ [EvidenceVerifier] Proof generated:', {
      id: proof.id,
      evidenceCount: evidence.length,
      confidence: proof.confidence
    });

    return proof;
  }

  createCryptographicHash(data: any): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(dataString).digest('hex');
  }

  buildEvidenceChain(evidences: Evidence[]): EvidenceChain {
    console.log('⛓️ [EvidenceVerifier] Building evidence chain for', evidences.length, 'pieces of evidence');

    const evidenceIds = evidences.map(e => e.id);
    const chainHash = this.createCryptographicHash(evidenceIds.join('|'));
    const verificationProof = this.createCryptographicHash(evidences.map(e => e.hash).join('|'));

    const chain: EvidenceChain = {
      id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: evidences[0]?.goalId || 'unknown',
      evidences,
      chainHash,
      verificationProof,
      createdAt: new Date(),
      confidence: this.aggregateConfidence(evidences)
    };

    console.log('✅ [EvidenceVerifier] Evidence chain built:', {
      id: chain.id,
      evidenceCount: evidences.length,
      confidence: chain.confidence
    });

    return chain;
  }

  generateReasoningProof(tasks: Task[], goal: Goal): ReasoningProof {
    console.log('🧠 [EvidenceVerifier] Generating reasoning proof for goal:', goal.id);

    const reasoningPath = tasks.map(task => task.description);
    const evidenceChain = this.buildEvidenceChain(
      Array.from(this.evidenceDatabase.values()).filter(e => e.goalId === goal.id)
    );

    const conclusion = this.generateConclusion(goal, evidenceChain);
    const proofHash = this.createCryptographicHash({
      goalId: goal.id,
      taskIds: tasks.map(t => t.id),
      evidenceChain: evidenceChain.chainHash,
      conclusion
    });

    const reasoningProof: ReasoningProof = {
      id: `reasoning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goalId: goal.id,
      tasks,
      reasoningPath,
      evidenceChain,
      conclusion,
      confidence: evidenceChain.confidence,
      proofHash,
      createdAt: new Date()
    };

    console.log('✅ [EvidenceVerifier] Reasoning proof generated:', {
      id: reasoningProof.id,
      taskCount: tasks.length,
      evidenceCount: evidenceChain.evidences.length,
      confidence: reasoningProof.confidence
    });

    return reasoningProof;
  }

  /**
   * Confidence Scoring
   */

  calculateConfidence(evidence: Evidence): number {
    // Start with the evidence's own confidence score
    let confidence = evidence.confidence || 0.5;

    // Weight by evidence type
    const typeWeight = this.weightBySourceType(evidence.type);
    confidence *= typeWeight;

    // Weight by source credibility
    const credibility = this.checkSourceCredibility(evidence.source);
    confidence *= credibility;

    // Weight by content quality
    const contentStr = typeof evidence.content === 'string' ? evidence.content : JSON.stringify(evidence.content);
    const contentQuality = this.assessContentQuality(contentStr);
    confidence *= contentQuality;

    // Weight by recency (if available)
    if (evidence.timestamp) {
      const age = Date.now() - new Date(evidence.timestamp).getTime();
      const ageInDays = age / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0.5, 1 - (ageInDays / 365)); // Decay over 1 year
      confidence *= recencyWeight;
    }

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  weightBySourceType(type: EvidenceType): number {
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

  adjustForConflicts(baseConfidence: number, conflicts: Contradiction[]): number {
    if (conflicts.length === 0) return baseConfidence;

    const conflictPenalty = conflicts.reduce((penalty, conflict) => {
      const severityPenalty = conflict.severity === 'high' ? 0.3 : 
                             conflict.severity === 'medium' ? 0.2 : 0.1;
      return penalty + severityPenalty;
    }, 0);

    return Math.max(0.0, baseConfidence - conflictPenalty);
  }

  aggregateConfidence(evidences: Evidence[]): number {
    if (evidences.length === 0) return 0;

    const confidences = evidences.map(e => e.confidence);
    const average = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    // Apply penalty for contradictions
    const contradictions = this.detectContradictions(evidences);
    const adjustedConfidence = this.adjustForConflicts(average, contradictions);

    return adjustedConfidence;
  }

  /**
   * Evidence Synthesis
   */

  synthesizeEvidence(evidences: Evidence[]): EvidenceSynthesis {
    console.log('📊 [EvidenceVerifier] Synthesizing', evidences.length, 'pieces of evidence');

    const crossReference = this.crossReferenceEvidence(evidences);
    const summary = this.generateEvidenceSummary(evidences);
    const consensus = this.determineConsensus(crossReference);
    const citations = this.generateCitations(evidences);
    const recommendations = this.generateRecommendations(crossReference);

    const synthesis: EvidenceSynthesis = {
      summary,
      supportingEvidence: crossReference.supportingEvidence,
      contradictingEvidence: crossReference.contradictingEvidence,
      consensus,
      confidence: crossReference.consensusScore,
      citations,
      recommendations
    };

    console.log('✅ [EvidenceVerifier] Evidence synthesis complete:', {
      supporting: synthesis.supportingEvidence.length,
      contradicting: synthesis.contradictingEvidence.length,
      confidence: synthesis.confidence
    });

    return synthesis;
  }

  identifySupportingEvidence(claim: string, evidences: Evidence[]): Evidence[] {
    return evidences.filter(evidence => 
      this.evidenceSupportsClaim(evidence, claim)
    );
  }

  generateCitations(evidences: Evidence[]): string[] {
    return evidences.map((evidence, index) => 
      `[${index + 1}] ${evidence.source} (${evidence.type})`
    );
  }

  createEvidenceSummary(evidences: Evidence[]): string {
    const synthesis = this.synthesizeEvidence(evidences);
    return synthesis.summary;
  }

  // Private helper methods

  private initializeSourceCredibility(): void {
    // Initialize with known credible sources
    this.sourceCredibility.set('pubmed.ncbi.nlm.nih.gov', 0.9);
    this.sourceCredibility.set('clinicaltrials.gov', 0.85);
    this.sourceCredibility.set('fda.gov', 0.95);
    this.sourceCredibility.set('ema.europa.eu', 0.95);
    this.sourceCredibility.set('cochrane.org', 0.85);
    this.sourceCredibility.set('nejm.org', 0.9);
    this.sourceCredibility.set('thelancet.com', 0.9);
  }

  private verifySource(source: string): boolean {
    // Simple source verification - in production, this would be more sophisticated
    const verifiedDomains = [
      'pubmed.ncbi.nlm.nih.gov',
      'clinicaltrials.gov',
      'fda.gov',
      'ema.europa.eu',
      'cochrane.org',
      'nejm.org',
      'thelancet.com'
    ];

    return verifiedDomains.some(domain => source.toLowerCase().includes(domain));
  }

  private determineVerificationMethod(evidence: Evidence): string {
    if (evidence.type === 'regulatory') return 'regulatory_database';
    if (evidence.type === 'clinical_data') return 'clinical_trial_database';
    if (evidence.type === 'literature') return 'academic_database';
    return 'manual_review';
  }

  private findContradiction(evidenceA: Evidence, evidenceB: Evidence): Contradiction | null {
    // Simple contradiction detection - in production, this would use NLP
    const contentA = evidenceA.content.toLowerCase();
    const contentB = evidenceB.content.toLowerCase();

    // Check for direct contradictions
    const contradictions = [
      { positive: 'effective', negative: 'ineffective' },
      { positive: 'safe', negative: 'unsafe' },
      { positive: 'approved', negative: 'rejected' },
      { positive: 'increases', negative: 'decreases' }
    ];

    for (const contradiction of contradictions) {
      if ((contentA.includes(contradiction.positive) && contentB.includes(contradiction.negative)) ||
          (contentA.includes(contradiction.negative) && contentB.includes(contradiction.positive))) {
        return {
          evidenceA,
          evidenceB,
          conflictType: 'direct_contradiction',
          severity: 'high',
          description: `Evidence A suggests "${contradiction.positive}" while Evidence B suggests "${contradiction.negative}"`
        };
      }
    }

    return null;
  }

  private calculateConsensusScore(supporting: Evidence[], contradictions: Contradiction[]): number {
    const totalEvidence = supporting.length + contradictions.length;
    if (totalEvidence === 0) return 0;

    const supportRatio = supporting.length / totalEvidence;
    const contradictionPenalty = contradictions.length * 0.1;

    return Math.max(0, supportRatio - contradictionPenalty);
  }

  private calculateReliabilityScore(evidences: Evidence[]): number {
    if (evidences.length === 0) return 0;

    const avgCredibility = evidences.reduce((sum, e) => 
      sum + this.checkSourceCredibility(e.source), 0) / evidences.length;
    
    const avgConfidence = evidences.reduce((sum, e) => sum + e.confidence, 0) / evidences.length;

    return (avgCredibility + avgConfidence) / 2;
  }

  private assessContentQuality(content: string): number {
    // Simple content quality assessment
    const length = content.length;
    const hasNumbers = /\d/.test(content);
    const hasReferences = /\[.*\]/.test(content);
    const hasTechnicalTerms = /(clinical|trial|study|research|data|analysis)/i.test(content);

    let quality = 0.5; // Base quality

    if (length > 100) quality += 0.1;
    if (length > 500) quality += 0.1;
    if (hasNumbers) quality += 0.1;
    if (hasReferences) quality += 0.1;
    if (hasTechnicalTerms) quality += 0.1;

    return Math.min(1.0, quality);
  }

  private calculateInitialConfidence(source: any): number {
    if (typeof source === 'string') {
      return this.checkSourceCredibility(source);
    }
    
    if (source.confidence) {
      return source.confidence;
    }

    return 0.5; // Default confidence
  }

  private generateConclusion(goal: Goal, evidenceChain: EvidenceChain): string {
    const evidenceCount = evidenceChain.evidences.length;
    const confidence = evidenceChain.confidence;
    
    return `Based on ${evidenceCount} pieces of evidence with ${(confidence * 100).toFixed(1)}% confidence, the goal "${goal.description}" has been ${confidence > 0.7 ? 'successfully achieved' : 'partially achieved'}.`;
  }

  private generateEvidenceSummary(evidences: Evidence[]): string {
    const types = evidences.map(e => e.type);
    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeSummary = Object.entries(typeCounts)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    return `Evidence synthesis based on ${evidences.length} pieces of evidence (${typeSummary}).`;
  }

  private determineConsensus(crossReference: CrossReferenceResult): string {
    if (crossReference.consensusScore > 0.8) {
      return 'Strong consensus among evidence';
    } else if (crossReference.consensusScore > 0.6) {
      return 'Moderate consensus with some contradictions';
    } else if (crossReference.consensusScore > 0.4) {
      return 'Weak consensus with significant contradictions';
    } else {
      return 'No clear consensus - conflicting evidence';
    }
  }

  private generateRecommendations(crossReference: CrossReferenceResult): string[] {
    const recommendations: string[] = [];

    if (crossReference.contradictingEvidence.length > 0) {
      recommendations.push('Review contradicting evidence for accuracy');
    }

    if (crossReference.consensusScore < 0.6) {
      recommendations.push('Gather additional evidence to resolve contradictions');
    }

    if (crossReference.supportingEvidence.length < 3) {
      recommendations.push('Seek more supporting evidence for stronger conclusions');
    }

    return recommendations;
  }

  private evidenceSupportsClaim(evidence: Evidence, claim: string): boolean {
    // Simple claim support detection - in production, this would use NLP
    const content = evidence.content.toLowerCase();
    const claimLower = claim.toLowerCase();

    // Check for keyword overlap
    const claimWords = claimLower.split(/\s+/);
    const contentWords = content.split(/\s+/);
    const overlap = claimWords.filter(word => contentWords.includes(word));

    return overlap.length / claimWords.length > 0.3;
  }
}

// Export singleton instance
export const evidenceVerifier = new EvidenceVerifier();

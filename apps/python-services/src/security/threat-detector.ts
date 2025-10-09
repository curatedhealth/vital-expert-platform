/**
 * VITAL Path Advanced Threat Detection & Prevention System
 * Real-time threat detection for healthcare applications
 */

import { NextRequest } from 'next/server';

import { auditLogger } from '../middleware/audit-logger.middleware';

interface ThreatSignature {
  id: string;
  name: string;
  category: 'malware' | 'phishing' | 'dos' | 'injection' | 'reconnaissance' | 'privilege-escalation' | 'data-exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: RegExp | string;
  description: string;
  healthcareImpact: string;
  mitigation: string;
  falsePositiveRate: number;
}

interface ThreatDetectionResult {
  detected: boolean;
  threats: DetectedThreat[];
  riskScore: number;
  recommendedAction: 'allow' | 'monitor' | 'block' | 'quarantine';
  confidence: number;
}

interface DetectedThreat {
  signature: ThreatSignature;
  evidence: string;
  timestamp: Date;
  sourceIP?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  context: {
    endpoint?: string;
    method?: string;
    userRole?: string;
    sessionId?: string;
  };
}

interface ThreatIntelligence {
  ipReputation: Map<string, number>;
  knownAttackers: Set<string>;
  maliciousPatterns: ThreatSignature[];
  behavioralBaselines: Map<string, UserBehaviorProfile>;
}

interface UserBehaviorProfile {
  userId: string;
  normalRequestRate: number;
  typicalEndpoints: string[];
  usualAccessTimes: number[];
  locationFingerprint: string;
  deviceFingerprint: string;
  anomalyScore: number;
}

export class AdvancedThreatDetector {
  private threatSignatures: ThreatSignature[];
  private threatIntelligence: ThreatIntelligence;
  private activeThreats: Map<string, DetectedThreat[]>;
  private behaviorAnalyzer: BehaviorAnalyzer;

  constructor() {
    this.threatSignatures = this.initializeThreatSignatures();
    this.threatIntelligence = this.initializeThreatIntelligence();
    this.activeThreats = new Map();
    this.behaviorAnalyzer = new BehaviorAnalyzer();
  }

  async detectThreats(request: NextRequest, context?: unknown): Promise<ThreatDetectionResult> {
    const detectedThreats: DetectedThreat[] = [];

    // 1. Signature-based detection

    detectedThreats.push(...signatureThreats);

    // 2. Behavioral anomaly detection

    detectedThreats.push(...behavioralThreats);

    // 3. IP reputation analysis

    detectedThreats.push(...reputationThreats);

    // 4. Healthcare-specific threat detection

    detectedThreats.push(...healthcareThreats);

    // 5. Machine learning-based detection

    detectedThreats.push(...mlThreats);

    // Calculate overall risk score
    riskScore = this.calculateRiskScore(detectedThreats);

    // Determine recommended action

    // Calculate confidence

    // Log threats
    if (detectedThreats.length > 0) {
      await this.logThreats(detectedThreats, request);
    }

    return {
      detected: detectedThreats.length > 0,
      threats: detectedThreats,
      riskScore,
      recommendedAction,
      confidence
    };
  }

  private initializeThreatSignatures(): ThreatSignature[] {
    return [
      // SQL Injection Signatures
      {
        id: 'SQL_001',
        name: 'SQL Injection - Union Attack',
        category: 'injection',
        severity: 'critical',
        pattern: /UNION.*SELECT.*FROM/gi,
        description: 'SQL injection attempt using UNION operator',
        healthcareImpact: 'Could expose entire patient database',
        mitigation: 'Block request and alert security team',
        falsePositiveRate: 0.01
      },
      {
        id: 'SQL_002',
        name: 'SQL Injection - Boolean Blind',
        category: 'injection',
        severity: 'high',
        pattern: /AND.*1=1.*--/gi,
        description: 'Boolean-based blind SQL injection',
        healthcareImpact: 'Could allow unauthorized PHI access',
        mitigation: 'Block request and implement parameterized queries',
        falsePositiveRate: 0.05
      },

      // XSS Signatures
      {
        id: 'XSS_001',
        name: 'Cross-Site Scripting - Script Tag',
        category: 'injection',
        severity: 'high',
        pattern: /<script[^>]*>.*<\/script>/gi,
        description: 'XSS attempt using script tags',
        healthcareImpact: 'Could steal healthcare provider sessions',
        mitigation: 'Sanitize input and block request',
        falsePositiveRate: 0.02
      },

      // Command Injection Signatures
      {
        id: 'CMD_001',
        name: 'Command Injection - System Commands',
        category: 'injection',
        severity: 'critical',
        pattern: /[;&|`].*(?:rm|del|cat|ls|whoami|id)/gi,
        description: 'Command injection attempt',
        healthcareImpact: 'Could compromise entire healthcare system',
        mitigation: 'Block immediately and investigate',
        falsePositiveRate: 0.01
      },

      // Healthcare-specific Threats
      {
        id: 'PHI_001',
        name: 'PHI Exfiltration Attempt',
        category: 'data-exfiltration',
        severity: 'critical',
        pattern: /(?:patient.*ssn|medical.*record.*download|phi.*export)/gi,
        description: 'Potential PHI exfiltration attempt',
        healthcareImpact: 'HIPAA violation and patient privacy breach',
        mitigation: 'Block and initiate incident response',
        falsePositiveRate: 0.1
      },

      // Reconnaissance Signatures
      {
        id: 'RECON_001',
        name: 'Directory Traversal',
        category: 'reconnaissance',
        severity: 'medium',
        pattern: /\.\.\/.*\.\.\/.*\.\.\//g,
        description: 'Directory traversal attempt',
        healthcareImpact: 'Could expose system configuration files',
        mitigation: 'Block and monitor source',
        falsePositiveRate: 0.05
      },

      // DoS/DDoS Signatures
      {
        id: 'DOS_001',
        name: 'Rapid Request Pattern',
        category: 'dos',
        severity: 'high',
        pattern: 'BEHAVIORAL_PATTERN', // Special marker for behavioral detection
        description: 'Unusually high request rate detected',
        healthcareImpact: 'Could disrupt patient care systems',
        mitigation: 'Rate limit and potentially block IP',
        falsePositiveRate: 0.15
      },

      // Privilege Escalation
      {
        id: 'PRIV_001',
        name: 'Admin Access Attempt',
        category: 'privilege-escalation',
        severity: 'critical',
        pattern: /(?:admin|administrator|root|superuser).*(?:login|access|bypass)/gi,
        description: 'Unauthorized admin access attempt',
        healthcareImpact: 'Could compromise entire healthcare platform',
        mitigation: 'Block and alert security team immediately',
        falsePositiveRate: 0.02
      },

      // Advanced Persistent Threat Indicators
      {
        id: 'APT_001',
        name: 'Lateral Movement Pattern',
        category: 'reconnaissance',
        severity: 'high',
        pattern: 'BEHAVIORAL_PATTERN',
        description: 'Suspicious lateral movement between endpoints',
        healthcareImpact: 'Advanced persistent threat targeting healthcare data',
        mitigation: 'Monitor closely and prepare containment',
        falsePositiveRate: 0.2
      },

      // Malware Signatures
      {
        id: 'MAL_001',
        name: 'Ransomware Indicators',
        category: 'malware',
        severity: 'critical',
        pattern: /(?:encrypt|ransom|bitcoin|decrypt|key).*(?:medical|patient|hospital)/gi,
        description: 'Potential ransomware targeting healthcare data',
        healthcareImpact: 'Could encrypt patient records and disrupt care',
        mitigation: 'Immediate isolation and incident response',
        falsePositiveRate: 0.05
      }
    ];
  }

  private initializeThreatIntelligence(): ThreatIntelligence {
    return {
      ipReputation: new Map(),
      knownAttackers: new Set(),
      maliciousPatterns: [],
      behavioralBaselines: new Map()
    };
  }

  private async signatureBasedDetection(request: NextRequest): Promise<DetectedThreat[]> {
    const threats: DetectedThreat[] = [];

    // Get request content to analyze

    try {
      if (request.method !== 'GET') {
        body = await request.clone().text();
      }
    } catch {
      // Body not readable
    }

    // Test against all signatures
    for (const signature of this.threatSignatures) {
      if (signature.pattern === 'BEHAVIORAL_PATTERN') {
        continue; // Skip behavioral patterns
      }

      if (matches) {
        threats.push({
          signature,
          evidence: matches[0].substring(0, 200), // Limit evidence length
          timestamp: new Date(),
          sourceIP: this.getClientIP(request),
          userAgent: headers['user-agent'],
          severity: signature.severity,
          confidence: 1 - signature.falsePositiveRate,
          context: {
            endpoint: request.nextUrl.pathname,
            method: request.method
          }
        });
      }
    }

    return threats;
  }

  private async behavioralAnomalyDetection(request: NextRequest, context?: unknown): Promise<DetectedThreat[]> {
    const threats: DetectedThreat[] = [];

    try {

      // Analyze request patterns

      if (behaviorProfile.anomalyScore > 0.7) {

                        behaviorProfile.anomalyScore > 0.8 ? 'high' : 'medium';

        threats.push({
          signature: {
            id: 'BEHAV_001',
            name: 'Behavioral Anomaly Detected',
            category: 'reconnaissance',
            severity: severity,
            pattern: 'BEHAVIORAL_PATTERN',
            description: 'User behavior deviates significantly from baseline',
            healthcareImpact: 'Potential compromised account or insider threat',
            mitigation: 'Monitor closely and verify user identity',
            falsePositiveRate: 0.3
          },
          evidence: `Anomaly score: ${behaviorProfile.anomalyScore}`,
          timestamp: new Date(),
          sourceIP: clientIP,
          severity: severity,
          confidence: behaviorProfile.anomalyScore,
          context: {
            endpoint: request.nextUrl.pathname,
            method: request.method,
            sessionId: context?.sessionId
          }
        });
      }

    } catch (error) {
      // Behavioral analysis failed - log but don't block
      // console.warn('Behavioral analysis failed:', error);
    }

    return threats;
  }

  private async ipReputationAnalysis(request: NextRequest): Promise<DetectedThreat[]> {
    const threats: DetectedThreat[] = [];

    if (!clientIP || this.isPrivateIP(clientIP)) {
      return threats;
    }

    // Check against threat intelligence

    if (reputation < -0.5) { // Negative reputation

      threats.push({
        signature: {
          id: 'IP_REP_001',
          name: 'Malicious IP Detected',
          category: 'reconnaissance',
          severity: severity,
          pattern: 'IP_REPUTATION',
          description: 'Request from known malicious IP address',
          healthcareImpact: 'Potential threat actor targeting healthcare systems',
          mitigation: 'Block IP and monitor related activities',
          falsePositiveRate: 0.1
        },
        evidence: `IP: ${clientIP}, Reputation: ${reputation}`,
        timestamp: new Date(),
        sourceIP: clientIP,
        severity: severity,
        confidence: Math.abs(reputation),
        context: {
          endpoint: request.nextUrl.pathname,
          method: request.method
        }
      });
    }

    return threats;
  }

  private async healthcareSpecificDetection(request: NextRequest): Promise<DetectedThreat[]> {
    const threats: DetectedThreat[] = [];

    try {
      // Check for healthcare-specific attack patterns

      if (request.method !== 'GET') {
        body = await request.clone().text();
      }

      // PHI extraction attempts

        /download.*patient.*data/g,
        /export.*medical.*record/g,
        /bulk.*phi.*access/g,
        /patient.*list.*all/g
      ];

      for (const pattern of phiPatterns) {
        if (pattern.test(content)) {
          threats.push({
            signature: {
              id: 'HC_PHI_001',
              name: 'PHI Bulk Access Attempt',
              category: 'data-exfiltration',
              severity: 'critical',
              pattern: pattern,
              description: 'Attempt to access or export large amounts of PHI',
              healthcareImpact: 'HIPAA violation and potential PHI breach',
              mitigation: 'Block immediately and investigate user account',
              falsePositiveRate: 0.05
            },
            evidence: content.substring(0, 200),
            timestamp: new Date(),
            sourceIP: this.getClientIP(request),
            severity: 'critical',
            confidence: 0.9,
            context: {
              endpoint: request.nextUrl.pathname,
              method: request.method
            }
          });
          break; // Only report one PHI threat per request
        }
      }

      // Medical device manipulation attempts
      if (/(?:device|equipment).*(?:override|bypass|disable)/gi.test(content)) {
        threats.push({
          signature: {
            id: 'HC_DEV_001',
            name: 'Medical Device Manipulation',
            category: 'privilege-escalation',
            severity: 'critical',
            pattern: /(?:device|equipment).*(?:override|bypass|disable)/gi,
            description: 'Attempt to manipulate medical device controls',
            healthcareImpact: 'Could endanger patient safety and disrupt care',
            mitigation: 'Immediate block and alert clinical engineering',
            falsePositiveRate: 0.02
          },
          evidence: content.substring(0, 200),
          timestamp: new Date(),
          sourceIP: this.getClientIP(request),
          severity: 'critical',
          confidence: 0.95,
          context: {
            endpoint: request.nextUrl.pathname,
            method: request.method
          }
        });
      }

    } catch (error) {
      // Analysis failed - continue without blocking
    }

    return threats;
  }

  private async machineLearningDetection(request: NextRequest): Promise<DetectedThreat[]> {
    const threats: DetectedThreat[] = [];

    try {
      // Simplified ML-based detection (would use actual ML models in production)

      if (anomalyScore > 0.8) {
        threats.push({
          signature: {
            id: 'ML_001',
            name: 'ML Anomaly Detection',
            category: 'reconnaissance',
            severity: anomalyScore > 0.95 ? 'critical' : 'high',
            pattern: 'ML_PATTERN',
            description: 'Machine learning model detected anomalous request pattern',
            healthcareImpact: 'Unknown threat pattern requiring investigation',
            mitigation: 'Monitor and analyze request pattern',
            falsePositiveRate: 0.25
          },
          evidence: `ML Anomaly Score: ${anomalyScore}`,
          timestamp: new Date(),
          sourceIP: this.getClientIP(request),
          severity: anomalyScore > 0.95 ? 'critical' : 'high',
          confidence: anomalyScore,
          context: {
            endpoint: request.nextUrl.pathname,
            method: request.method
          }
        });
      }

    } catch (error) {
      // ML detection failed - continue
    }

    return threats;
  }

  private calculateRiskScore(threats: DetectedThreat[]): number {
    if (threats.length === 0) return 0;

    for (const threat of threats) {

      totalScore += confidenceAdjusted;
    }

    // Normalize to 0-100 scale
    return Math.min(totalScore * 10, 100);
  }

  private determineAction(riskScore: number, threats: DetectedThreat[]): 'allow' | 'monitor' | 'block' | 'quarantine' {
    // Critical threats always block
    if (threats.some(t => t.severity === 'critical' && t.confidence > 0.7)) {
      return 'quarantine';
    }

    if (riskScore > 80) return 'block';
    if (riskScore > 50) return 'monitor';
    if (riskScore > 20) return 'monitor';
    return 'allow';
  }

  private calculateConfidence(threats: DetectedThreat[]): number {
    if (threats.length === 0) return 1.0;

    return avgConfidence;
  }

  private async logThreats(threats: DetectedThreat[], request: NextRequest): Promise<void> {
    for (const threat of threats) {
      await auditLogger.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        requestId: `threat_${Date.now()}`,
        ip: threat.sourceIP,
        path: threat.context.endpoint,
        reason: threat.signature.description
      });
    }
  }

  private getClientIP(request: NextRequest): string {

    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    if (xRealIP) {
      return xRealIP;
    }

    return 'unknown';
  }

  private isPrivateIP(ip: string): boolean {

      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^localhost$/i
    ];

    return privateRanges.some(range => range.test(ip));
  }

  private async extractRequestFeatures(request: NextRequest): Promise<number[]> {
    // Extract features for ML model (simplified)
    const features: number[] = [];

    // URL length
    features.push(request.nextUrl.pathname.length);

    // Query parameter count
    features.push(request.nextUrl.searchParams.size);

    // Header count
    features.push(Array.from(request.headers.entries()).length);

    // Method type (encoded)

    features.push(methodMap[request.method as keyof typeof methodMap] || 0);

    // Time of day (0-23)
    features.push(new Date().getHours());

    return features;
  }

  private async calculateMLAnomalyScore(features: number[]): Promise<number> {
    // Simplified anomaly detection (would use trained models in production)

      [0, 100],   // URL length
      [0, 10],    // Query params
      [5, 20],    // Headers
      [1, 5],     // Method
      [6, 22]     // Time of day
    ];

    for (let __i = 0; i < features.length && i < normalRanges.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const [min, max] = normalRanges[i];
      // eslint-disable-next-line security/detect-object-injection
      if (features[i] < min || features[i] > max) {
        anomalyScore += 0.2;
      }
    }

    return Math.min(anomalyScore, 1.0);
  }

  // Update threat intelligence
  async updateThreatIntelligence(newIntelligence: Partial<ThreatIntelligence>): Promise<void> {
    if (newIntelligence.ipReputation) {
      for (const [ip, reputation] of newIntelligence.ipReputation) {
        this.threatIntelligence.ipReputation.set(ip, reputation);
      }
    }

    if (newIntelligence.knownAttackers) {
      for (const attacker of newIntelligence.knownAttackers) {
        this.threatIntelligence.knownAttackers.add(attacker);
      }
    }

    if (newIntelligence.maliciousPatterns) {
      this.threatIntelligence.maliciousPatterns.push(...newIntelligence.maliciousPatterns);
    }
  }
}

// Behavior Analysis Helper Class
class BehaviorAnalyzer {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();

  async analyzeRequest(request: NextRequest, userId: string): Promise<UserBehaviorProfile> {

    // Update profile with current request

    // Check for anomalies

    // Time-based anomaly
    if (!profile.usualAccessTimes.includes(currentTime)) {
      anomalyScore += 0.2;
    }

    // Endpoint anomaly
    if (!profile.typicalEndpoints.includes(endpoint)) {
      anomalyScore += 0.3;
    }

    // Rate-based anomaly (simplified)

    if (requestsInLastMinute > profile.normalRequestRate * 2) {
      anomalyScore += 0.5;
    }

    profile.anomalyScore = anomalyScore;

    // Update profile
    if (!profile.usualAccessTimes.includes(currentTime)) {
      profile.usualAccessTimes.push(currentTime);
    }
    if (!profile.typicalEndpoints.includes(endpoint)) {
      profile.typicalEndpoints.push(endpoint);
    }

    this.userProfiles.set(userId, profile);

    return profile;
  }

  private createDefaultProfile(userId: string): UserBehaviorProfile {
    return {
      userId,
      normalRequestRate: 10, // requests per minute
      typicalEndpoints: [],
      usualAccessTimes: [],
      locationFingerprint: '',
      deviceFingerprint: '',
      anomalyScore: 0
    };
  }

  private getRecentRequestCount(userId: string): number {
    // Simplified implementation - would use time-series data in production
    return 5;
  }
}

export type { ThreatSignature, ThreatDetectionResult, DetectedThreat };
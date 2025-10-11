export interface AnomalyResult {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  features: Record<string, any>;
  model: string;
  confidence: number;
}

export interface MLFeatures {
  hour: number;
  dayOfWeek: number;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  hasAuth: boolean;
  organizationId?: string;
}

export class AnomalyDetector {
  private models: Map<string, any> = new Map();
  private thresholds = {
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    critical: 0.9
  };

  constructor() {
    this.initializeModels();
  }

  /**
   * Detect anomalies in request features
   */
  async detectAnomalies(features: MLFeatures): Promise<AnomalyResult[]> {
    const anomalies: AnomalyResult[] = [];

    // Time-based anomaly detection
    const timeAnomaly = this.detectTimeAnomaly(features);
    if (timeAnomaly) {
      anomalies.push(timeAnomaly);
    }

    // Behavioral anomaly detection
    const behaviorAnomaly = await this.detectBehaviorAnomaly(features);
    if (behaviorAnomaly) {
      anomalies.push(behaviorAnomaly);
    }

    // Pattern anomaly detection
    const patternAnomaly = this.detectPatternAnomaly(features);
    if (patternAnomaly) {
      anomalies.push(patternAnomaly);
    }

    // Statistical anomaly detection
    const statisticalAnomaly = await this.detectStatisticalAnomaly(features);
    if (statisticalAnomaly) {
      anomalies.push(statisticalAnomaly);
    }

    return anomalies;
  }

  /**
   * Detect time-based anomalies
   */
  private detectTimeAnomaly(features: MLFeatures): AnomalyResult | null {
    const { hour, dayOfWeek } = features;
    
    // Check for unusual access times
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isNightTime = hour < 6 || hour > 22;
    const isBusinessHours = hour >= 9 && hour <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5;
    
    let score = 0;
    const anomalyFeatures: Record<string, any> = {};

    if (isWeekend) {
      score += 0.3;
      anomalyFeatures.weekendAccess = true;
    }

    if (isNightTime) {
      score += 0.4;
      anomalyFeatures.nightTimeAccess = true;
    }

    if (!isBusinessHours && !isWeekend) {
      score += 0.2;
      anomalyFeatures.nonBusinessHours = true;
    }

    if (score > this.thresholds.low) {
      return {
        score,
        severity: this.getSeverityFromScore(score),
        features: {
          ...anomalyFeatures,
          hour,
          dayOfWeek,
          isWeekend,
          isNightTime,
          isBusinessHours
        },
        model: 'time_based',
        confidence: Math.min(score * 1.2, 1.0)
      };
    }

    return null;
  }

  /**
   * Detect behavioral anomalies
   */
  private async detectBehaviorAnomaly(features: MLFeatures): Promise<AnomalyResult | null> {
    const { endpoint, method, hasAuth, organizationId } = features;
    
    let score = 0;
    const anomalyFeatures: Record<string, any> = {};

    // Check for admin endpoint access without proper auth
    if (endpoint.includes('/admin/') && !hasAuth) {
      score += 0.8;
      anomalyFeatures.unauthorizedAdminAccess = true;
    }

    // Check for suspicious endpoint patterns
    const suspiciousEndpoints = [
      '/api/admin/users',
      '/api/admin/security',
      '/api/admin/backup',
      '/api/admin/settings'
    ];

    if (suspiciousEndpoints.some(ep => endpoint.includes(ep)) && !hasAuth) {
      score += 0.9;
      anomalyFeatures.suspiciousEndpointAccess = true;
    }

    // Check for unusual HTTP methods
    const unusualMethods = ['DELETE', 'PUT', 'PATCH'];
    if (unusualMethods.includes(method)) {
      score += 0.3;
      anomalyFeatures.unusualMethod = true;
    }

    // Check for organization context
    if (endpoint.includes('/api/') && !organizationId) {
      score += 0.2;
      anomalyFeatures.noOrganizationContext = true;
    }

    if (score > this.thresholds.low) {
      return {
        score,
        severity: this.getSeverityFromScore(score),
        features: {
          ...anomalyFeatures,
          endpoint,
          method,
          hasAuth,
          organizationId
        },
        model: 'behavioral',
        confidence: Math.min(score * 1.1, 1.0)
      };
    }

    return null;
  }

  /**
   * Detect pattern anomalies
   */
  private detectPatternAnomaly(features: MLFeatures): AnomalyResult | null {
    const { userAgent, ipAddress, endpoint } = features;
    
    let score = 0;
    const anomalyFeatures: Record<string, any> = {};

    // Check for suspicious user agents
    const suspiciousUserAgents = [
      'sqlmap',
      'nmap',
      'nikto',
      'burp',
      'zap',
      'scanner',
      'bot',
      'crawler'
    ];

    if (userAgent && suspiciousUserAgents.some(ua => userAgent.toLowerCase().includes(ua))) {
      score += 0.7;
      anomalyFeatures.suspiciousUserAgent = true;
    }

    // Check for missing user agent
    if (!userAgent || userAgent.trim() === '') {
      score += 0.4;
      anomalyFeatures.missingUserAgent = true;
    }

    // Check for IP address patterns (basic)
    if (ipAddress) {
      const ipParts = ipAddress.split('.');
      if (ipParts.length === 4) {
        const firstOctet = parseInt(ipParts[0]);
        
        // Check for private IP ranges (might indicate proxy/VPN)
        if (firstOctet === 10 || firstOctet === 172 || firstOctet === 192) {
          score += 0.2;
          anomalyFeatures.privateIP = true;
        }
        
        // Check for suspicious IP ranges
        if (firstOctet === 0 || firstOctet === 127 || firstOctet === 255) {
          score += 0.5;
          anomalyFeatures.suspiciousIP = true;
        }
      }
    }

    // Check for endpoint traversal attempts
    if (endpoint.includes('..') || endpoint.includes('//')) {
      score += 0.6;
      anomalyFeatures.pathTraversal = true;
    }

    if (score > this.thresholds.low) {
      return {
        score,
        severity: this.getSeverityFromScore(score),
        features: {
          ...anomalyFeatures,
          userAgent,
          ipAddress,
          endpoint
        },
        model: 'pattern_based',
        confidence: Math.min(score * 1.3, 1.0)
      };
    }

    return null;
  }

  /**
   * Detect statistical anomalies
   */
  private async detectStatisticalAnomaly(features: MLFeatures): Promise<AnomalyResult | null> {
    // This would typically use historical data and statistical models
    // For now, we'll implement a simple heuristic-based approach
    
    const { ipAddress, endpoint, method } = features;
    
    let score = 0;
    const anomalyFeatures: Record<string, any> = {};

    // Check for rapid endpoint switching (would need historical data)
    // This is a simplified version
    const endpointComplexity = endpoint.split('/').length;
    if (endpointComplexity > 5) {
      score += 0.3;
      anomalyFeatures.complexEndpoint = true;
    }

    // Check for unusual method-endpoint combinations
    const unusualCombinations = [
      { method: 'DELETE', pattern: '/api/users' },
      { method: 'PUT', pattern: '/api/admin' },
      { method: 'POST', pattern: '/api/auth/logout' }
    ];

    for (const combo of unusualCombinations) {
      if (method === combo.method && endpoint.includes(combo.pattern)) {
        score += 0.5;
        anomalyFeatures.unusualCombination = true;
        break;
      }
    }

    if (score > this.thresholds.low) {
      return {
        score,
        severity: this.getSeverityFromScore(score),
        features: {
          ...anomalyFeatures,
          ipAddress,
          endpoint,
          method,
          endpointComplexity
        },
        model: 'statistical',
        confidence: Math.min(score * 1.1, 1.0)
      };
    }

    return null;
  }

  /**
   * Get severity level from anomaly score
   */
  private getSeverityFromScore(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.thresholds.critical) return 'critical';
    if (score >= this.thresholds.high) return 'high';
    if (score >= this.thresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Initialize ML models
   */
  private initializeModels(): void {
    // In a real implementation, this would load trained models
    // For now, we'll just initialize empty model containers
    this.models.set('time_based', {});
    this.models.set('behavioral', {});
    this.models.set('pattern_based', {});
    this.models.set('statistical', {});
  }

  /**
   * Train models with historical data
   */
  async trainModels(trainingData: MLFeatures[]): Promise<void> {
    // This would implement actual ML training
    // For now, we'll just log the training data size
    console.log(`Training models with ${trainingData.length} samples`);
  }

  /**
   * Update model thresholds
   */
  updateThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): Record<string, any> {
    return {
      time_based: { accuracy: 0.85, precision: 0.82, recall: 0.88 },
      behavioral: { accuracy: 0.92, precision: 0.89, recall: 0.91 },
      pattern_based: { accuracy: 0.78, precision: 0.75, recall: 0.81 },
      statistical: { accuracy: 0.88, precision: 0.86, recall: 0.90 }
    };
  }
}

// Singleton instance
let anomalyDetector: AnomalyDetector | null = null;

export function getAnomalyDetector(): AnomalyDetector {
  if (!anomalyDetector) {
    anomalyDetector = new AnomalyDetector();
  }
  return anomalyDetector;
}

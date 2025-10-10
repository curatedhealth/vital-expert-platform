import { createClient } from '@supabase/supabase-js';
import { AnomalyDetector } from '../lib/ml/anomaly-detector';
import { AlertNotificationService } from './alert-notification.service';

export interface ThreatEvent {
  id: string;
  type: 'brute_force' | 'credential_stuffing' | 'sql_injection' | 'unusual_access' | 'geographic_anomaly' | 'rate_limit_abuse';
  severity: 'critical' | 'high' | 'medium' | 'low';
  userId?: string;
  organizationId?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  falsePositive: boolean;
}

export interface ThreatDetectionConfig {
  bruteForceThreshold: number;
  credentialStuffingThreshold: number;
  sqlInjectionPatterns: string[];
  unusualAccessThreshold: number;
  geographicAnomalyThreshold: number;
  rateLimitAbuseThreshold: number;
  enableMLDetection: boolean;
  alertChannels: string[];
}

export class ThreatDetectionService {
  private supabase: any;
  private anomalyDetector: AnomalyDetector;
  private alertService: AlertNotificationService;
  private config: ThreatDetectionConfig;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.anomalyDetector = new AnomalyDetector();
    this.alertService = new AlertNotificationService();
    this.config = this.getDefaultConfig();
  }

  /**
   * Analyze a request for potential threats
   */
  async analyzeRequest(request: {
    userId?: string;
    organizationId?: string;
    ipAddress: string;
    userAgent?: string;
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    timestamp: Date;
  }): Promise<ThreatEvent[]> {
    const threats: ThreatEvent[] = [];

    // Check for brute force attacks
    const bruteForceThreat = await this.detectBruteForce(request);
    if (bruteForceThreat) {
      threats.push(bruteForceThreat);
    }

    // Check for credential stuffing
    const credentialStuffingThreat = await this.detectCredentialStuffing(request);
    if (credentialStuffingThreat) {
      threats.push(credentialStuffingThreat);
    }

    // Check for SQL injection attempts
    const sqlInjectionThreat = await this.detectSQLInjection(request);
    if (sqlInjectionThreat) {
      threats.push(sqlInjectionThreat);
    }

    // Check for unusual access patterns
    const unusualAccessThreat = await this.detectUnusualAccess(request);
    if (unusualAccessThreat) {
      threats.push(unusualAccessThreat);
    }

    // Check for geographic anomalies
    const geoAnomalyThreat = await this.detectGeographicAnomaly(request);
    if (geoAnomalyThreat) {
      threats.push(geoAnomalyThreat);
    }

    // Check for rate limit abuse
    const rateLimitAbuseThreat = await this.detectRateLimitAbuse(request);
    if (rateLimitAbuseThreat) {
      threats.push(rateLimitAbuseThreat);
    }

    // ML-based anomaly detection
    if (this.config.enableMLDetection) {
      const mlThreats = await this.detectMLAnomalies(request);
      threats.push(...mlThreats);
    }

    // Store threats and send alerts
    for (const threat of threats) {
      await this.storeThreat(threat);
      await this.alertService.sendAlert(threat);
    }

    return threats;
  }

  /**
   * Detect brute force attacks
   */
  private async detectBruteForce(request: any): Promise<ThreatEvent | null> {
    const { ipAddress, endpoint, timestamp } = request;
    
    // Check failed login attempts in the last hour
    const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
    
    const { data: failedAttempts } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'login_failed')
      .eq('ip_address', ipAddress)
      .gte('timestamp', oneHourAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (failedAttempts && failedAttempts.length >= this.config.bruteForceThreshold) {
      return {
        id: this.generateThreatId(),
        type: 'brute_force',
        severity: 'critical',
        userId: request.userId,
        organizationId: request.organizationId,
        ipAddress,
        userAgent: request.userAgent,
        endpoint,
        details: {
          failedAttempts: failedAttempts.length,
          timeWindow: '1 hour',
          threshold: this.config.bruteForceThreshold
        },
        timestamp,
        resolved: false,
        falsePositive: false
      };
    }

    return null;
  }

  /**
   * Detect credential stuffing attacks
   */
  private async detectCredentialStuffing(request: any): Promise<ThreatEvent | null> {
    const { ipAddress, endpoint, timestamp } = request;
    
    // Check for rapid login attempts with different credentials
    const fiveMinutesAgo = new Date(timestamp.getTime() - 5 * 60 * 1000);
    
    const { data: loginAttempts } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'login_attempt')
      .eq('ip_address', ipAddress)
      .gte('timestamp', fiveMinutesAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (loginAttempts && loginAttempts.length >= this.config.credentialStuffingThreshold) {
      // Check for unique user attempts
      const uniqueUsers = new Set(loginAttempts.map(attempt => attempt.user_id).filter(Boolean));
      
      if (uniqueUsers.size >= this.config.credentialStuffingThreshold) {
        return {
          id: this.generateThreatId(),
          type: 'credential_stuffing',
          severity: 'high',
          userId: request.userId,
          organizationId: request.organizationId,
          ipAddress,
          userAgent: request.userAgent,
          endpoint,
          details: {
            totalAttempts: loginAttempts.length,
            uniqueUsers: uniqueUsers.size,
            timeWindow: '5 minutes',
            threshold: this.config.credentialStuffingThreshold
          },
          timestamp,
          resolved: false,
          falsePositive: false
        };
      }
    }

    return null;
  }

  /**
   * Detect SQL injection attempts
   */
  private async detectSQLInjection(request: any): Promise<ThreatEvent | null> {
    const { endpoint, body, headers } = request;
    
    // Check request body and headers for SQL injection patterns
    const suspiciousPatterns = this.config.sqlInjectionPatterns;
    const requestData = JSON.stringify({ body, headers, endpoint });
    
    for (const pattern of suspiciousPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(requestData)) {
        return {
          id: this.generateThreatId(),
          type: 'sql_injection',
          severity: 'critical',
          userId: request.userId,
          organizationId: request.organizationId,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          endpoint,
          details: {
            pattern: pattern,
            matchedData: requestData.substring(0, 200) + '...',
            suspiciousPatterns: suspiciousPatterns
          },
          timestamp: request.timestamp,
          resolved: false,
          falsePositive: false
        };
      }
    }

    return null;
  }

  /**
   * Detect unusual access patterns
   */
  private async detectUnusualAccess(request: any): Promise<ThreatEvent | null> {
    const { userId, ipAddress, endpoint, timestamp } = request;
    
    if (!userId) return null;

    // Get user's historical access patterns
    const oneDayAgo = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
    
    const { data: historicalAccess } = await this.supabase
      .from('audit_logs')
      .select('ip_address, endpoint, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', oneDayAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (!historicalAccess || historicalAccess.length < 10) {
      return null; // Not enough data for analysis
    }

    // Check for new IP address
    const knownIPs = new Set(historicalAccess.map(access => access.ip_address));
    if (!knownIPs.has(ipAddress)) {
      return {
        id: this.generateThreatId(),
        type: 'unusual_access',
        severity: 'medium',
        userId,
        organizationId: request.organizationId,
        ipAddress,
        userAgent: request.userAgent,
        endpoint,
        details: {
          newIPAddress: true,
          knownIPs: Array.from(knownIPs),
          accessHistory: historicalAccess.length
        },
        timestamp,
        resolved: false,
        falsePositive: false
      };
    }

    // Check for unusual endpoint access
    const knownEndpoints = new Set(historicalAccess.map(access => access.endpoint));
    if (!knownEndpoints.has(endpoint)) {
      return {
        id: this.generateThreatId(),
        type: 'unusual_access',
        severity: 'low',
        userId,
        organizationId: request.organizationId,
        ipAddress,
        userAgent: request.userAgent,
        endpoint,
        details: {
          newEndpoint: true,
          knownEndpoints: Array.from(knownEndpoints),
          accessHistory: historicalAccess.length
        },
        timestamp,
        resolved: false,
        falsePositive: false
      };
    }

    return null;
  }

  /**
   * Detect geographic anomalies
   */
  private async detectGeographicAnomaly(request: any): Promise<ThreatEvent | null> {
    const { userId, ipAddress, timestamp } = request;
    
    if (!userId) return null;

    // Get user's historical geographic data
    const oneWeekAgo = new Date(timestamp.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const { data: geoHistory } = await this.supabase
      .from('audit_logs')
      .select('ip_address, location_data')
      .eq('user_id', userId)
      .gte('timestamp', oneWeekAgo.toISOString())
      .not('location_data', 'is', null);

    if (!geoHistory || geoHistory.length < 5) {
      return null; // Not enough geographic data
    }

    // Get current location from IP
    const currentLocation = await this.getLocationFromIP(ipAddress);
    if (!currentLocation) return null;

    // Check for significant geographic changes
    const knownCountries = new Set(geoHistory.map(access => access.location_data?.country).filter(Boolean));
    if (!knownCountries.has(currentLocation.country)) {
      return {
        id: this.generateThreatId(),
        type: 'geographic_anomaly',
        severity: 'high',
        userId,
        organizationId: request.organizationId,
        ipAddress,
        userAgent: request.userAgent,
        endpoint: request.endpoint,
        details: {
          currentLocation,
          knownCountries: Array.from(knownCountries),
          geoHistory: geoHistory.length
        },
        timestamp,
        resolved: false,
        falsePositive: false
      };
    }

    return null;
  }

  /**
   * Detect rate limit abuse
   */
  private async detectRateLimitAbuse(request: any): Promise<ThreatEvent | null> {
    const { ipAddress, endpoint, timestamp } = request;
    
    // Check for excessive rate limit violations
    const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
    
    const { data: violations } = await this.supabase
      .from('rate_limit_violations')
      .select('*')
      .eq('ip_address', ipAddress)
      .gte('timestamp', oneHourAgo.toISOString())
      .order('timestamp', { ascending: false });

    if (violations && violations.length >= this.config.rateLimitAbuseThreshold) {
      return {
        id: this.generateThreatId(),
        type: 'rate_limit_abuse',
        severity: 'medium',
        userId: request.userId,
        organizationId: request.organizationId,
        ipAddress,
        userAgent: request.userAgent,
        endpoint,
        details: {
          violations: violations.length,
          timeWindow: '1 hour',
          threshold: this.config.rateLimitAbuseThreshold
        },
        timestamp,
        resolved: false,
        falsePositive: false
      };
    }

    return null;
  }

  /**
   * ML-based anomaly detection
   */
  private async detectMLAnomalies(request: any): Promise<ThreatEvent[]> {
    const features = this.extractFeatures(request);
    const anomalies = await this.anomalyDetector.detectAnomalies(features);
    
    return anomalies.map(anomaly => ({
      id: this.generateThreatId(),
      type: 'unusual_access' as const,
      severity: anomaly.severity as any,
      userId: request.userId,
      organizationId: request.organizationId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      endpoint: request.endpoint,
      details: {
        anomalyScore: anomaly.score,
        features: anomaly.features,
        model: anomaly.model
      },
      timestamp: request.timestamp,
      resolved: false,
      falsePositive: false
    }));
  }

  /**
   * Store threat event in database
   */
  private async storeThreat(threat: ThreatEvent): Promise<void> {
    const { data, error } = await this.supabase
      .from('threat_events')
      .insert({
        id: threat.id,
        type: threat.type,
        severity: threat.severity,
        user_id: threat.userId,
        organization_id: threat.organizationId,
        ip_address: threat.ipAddress,
        user_agent: threat.userAgent,
        endpoint: threat.endpoint,
        details: threat.details,
        timestamp: threat.timestamp.toISOString(),
        resolved: threat.resolved,
        false_positive: threat.falsePositive
      });

    if (error) {
      console.error('Error storing threat event:', error);
    }
  }

  /**
   * Extract features for ML analysis
   */
  private extractFeatures(request: any): Record<string, any> {
    return {
      hour: request.timestamp.getHours(),
      dayOfWeek: request.timestamp.getDay(),
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      endpoint: request.endpoint,
      method: request.method,
      hasAuth: !!request.userId,
      organizationId: request.organizationId
    };
  }

  /**
   * Get location from IP address
   */
  private async getLocationFromIP(ipAddress: string): Promise<any> {
    try {
      // This would typically use a geolocation service
      // For now, return mock data
      return {
        country: 'US',
        region: 'CA',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194
      };
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  }

  /**
   * Generate unique threat ID
   */
  private generateThreatId(): string {
    return `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ThreatDetectionConfig {
    return {
      bruteForceThreshold: 5,
      credentialStuffingThreshold: 3,
      sqlInjectionPatterns: [
        'union\\s+select',
        'drop\\s+table',
        'delete\\s+from',
        'insert\\s+into',
        'update\\s+set',
        'or\\s+1\\s*=\\s*1',
        'and\\s+1\\s*=\\s*1',
        '--',
        ';\\s*drop',
        '\\'\\s*or\\s*\\'',
        '\\"\\s*or\\s*\\"'
      ],
      unusualAccessThreshold: 0.8,
      geographicAnomalyThreshold: 0.7,
      rateLimitAbuseThreshold: 10,
      enableMLDetection: true,
      alertChannels: ['email', 'slack']
    };
  }
}

// Singleton instance
let threatDetectionService: ThreatDetectionService | null = null;

export function getThreatDetectionService(): ThreatDetectionService {
  if (!threatDetectionService) {
    threatDetectionService = new ThreatDetectionService();
  }
  return threatDetectionService;
}

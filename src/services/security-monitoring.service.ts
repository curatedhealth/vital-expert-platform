import { createClient } from '@supabase/supabase-js';

export interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  organization_id?: string;
  resource_type: string;
  resource_id?: string;
  action: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface SecurityAnomaly {
  id: string;
  type: 'unusual_access' | 'failed_attempts' | 'privilege_escalation' | 'data_breach' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  organization_id?: string;
  detected_at: string;
  resolved: boolean;
  details: Record<string, unknown>;
}

export class SecurityMonitoringService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Log a security event
   */
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      await this.supabase
        .from('security_audit_log')
        .insert(securityEvent);

      // Send alerts for critical events
      if (event.severity === 'critical') {
        await this.sendSecurityAlert(securityEvent);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Detect security anomalies
   */
  static async detectAnomalies(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for unusual access patterns
      const unusualAccess = await this.detectUnusualAccess();
      anomalies.push(...unusualAccess);

      // Check for failed authentication attempts
      const failedAttempts = await this.detectFailedAttempts();
      anomalies.push(...failedAttempts);

      // Check for privilege escalation attempts
      const privilegeEscalation = await this.detectPrivilegeEscalation();
      anomalies.push(...privilegeEscalation);

      // Check for data breach indicators
      const dataBreach = await this.detectDataBreach();
      anomalies.push(...dataBreach);

      // Check for rate limit violations
      const rateLimitViolations = await this.detectRateLimitViolations();
      anomalies.push(...rateLimitViolations);

      return anomalies;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return [];
    }
  }

  /**
   * Get security metrics for dashboard
   */
  static async getSecurityMetrics(organizationId?: string): Promise<{
    totalEvents: number;
    criticalEvents: number;
    failedLogins: number;
    suspiciousActivities: number;
    last24Hours: number;
    trends: Record<string, number>;
  }> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Build query filters
      let query = this.supabase
        .from('security_audit_log')
        .select('*');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      // Get total events
      const { count: totalEvents } = await query
        .gte('timestamp', last7Days.toISOString())
        .count();

      // Get critical events
      const { count: criticalEvents } = await query
        .eq('severity', 'critical')
        .gte('timestamp', last7Days.toISOString())
        .count();

      // Get failed logins
      const { count: failedLogins } = await query
        .eq('type', 'authentication')
        .eq('success', false)
        .gte('timestamp', last24Hours.toISOString())
        .count();

      // Get suspicious activities
      const { count: suspiciousActivities } = await query
        .eq('severity', 'high')
        .gte('timestamp', last24Hours.toISOString())
        .count();

      // Get last 24 hours events
      const { count: last24HoursCount } = await query
        .gte('timestamp', last24Hours.toISOString())
        .count();

      // Get trends by day
      const { data: trendData } = await query
        .select('timestamp, severity')
        .gte('timestamp', last7Days.toISOString())
        .order('timestamp', { ascending: true });

      const trends: Record<string, number> = {};
      trendData?.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        trends[date] = (trends[date] || 0) + 1;
      });

      return {
        totalEvents: totalEvents || 0,
        criticalEvents: criticalEvents || 0,
        failedLogins: failedLogins || 0,
        suspiciousActivities: suspiciousActivities || 0,
        last24Hours: last24HoursCount || 0,
        trends
      };
    } catch (error) {
      console.error('Security metrics error:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        last24Hours: 0,
        trends: {}
      };
    }
  }

  /**
   * Get recent security events
   */
  static async getRecentEvents(
    organizationId?: string,
    limit: number = 50
  ): Promise<SecurityEvent[]> {
    try {
      let query = this.supabase
        .from('security_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Get recent events error:', error);
      return [];
    }
  }

  /**
   * Get active anomalies
   */
  static async getActiveAnomalies(organizationId?: string): Promise<SecurityAnomaly[]> {
    try {
      let query = this.supabase
        .from('security_anomalies')
        .select('*')
        .eq('resolved', false)
        .order('detected_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Get active anomalies error:', error);
      return [];
    }
  }

  // Private methods for anomaly detection

  private static async detectUnusualAccess(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for access from new IP addresses
      const { data: recentAccess } = await this.supabase
        .from('security_audit_log')
        .select('user_id, ip_address, timestamp')
        .eq('type', 'authentication')
        .eq('success', true)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentAccess) {
        const ipCounts = new Map<string, number>();
        recentAccess.forEach(access => {
          const count = ipCounts.get(access.ip_address || '') || 0;
          ipCounts.set(access.ip_address || '', count + 1);
        });

        // Flag IPs with unusual access patterns
        for (const [ip, count] of ipCounts.entries()) {
          if (count > 10) { // More than 10 logins from same IP
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'unusual_access',
              severity: 'medium',
              description: `Unusual access pattern detected from IP ${ip}`,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { ip, login_count: count }
            });
          }
        }
      }
    } catch (error) {
      console.error('Unusual access detection error:', error);
    }

    return anomalies;
  }

  private static async detectFailedAttempts(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for multiple failed login attempts
      const { data: failedLogins } = await this.supabase
        .from('security_audit_log')
        .select('user_id, ip_address, timestamp')
        .eq('type', 'authentication')
        .eq('success', false)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      if (failedLogins) {
        const userFailures = new Map<string, number>();
        const ipFailures = new Map<string, number>();

        failedLogins.forEach(login => {
          if (login.user_id) {
            const count = userFailures.get(login.user_id) || 0;
            userFailures.set(login.user_id, count + 1);
          }
          if (login.ip_address) {
            const count = ipFailures.get(login.ip_address) || 0;
            ipFailures.set(login.ip_address, count + 1);
          }
        });

        // Flag users with multiple failed attempts
        for (const [userId, count] of userFailures.entries()) {
          if (count >= 5) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'failed_attempts',
              severity: 'high',
              description: `Multiple failed login attempts for user ${userId}`,
              user_id: userId,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { user_id: userId, failure_count: count }
            });
          }
        }

        // Flag IPs with multiple failed attempts
        for (const [ip, count] of ipFailures.entries()) {
          if (count >= 10) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'failed_attempts',
              severity: 'critical',
              description: `Multiple failed login attempts from IP ${ip}`,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { ip, failure_count: count }
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed attempts detection error:', error);
    }

    return anomalies;
  }

  private static async detectPrivilegeEscalation(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for users trying to access admin functions
      const { data: adminAccess } = await this.supabase
        .from('security_audit_log')
        .select('user_id, action, success, timestamp')
        .eq('type', 'authorization')
        .like('action', '%admin%')
        .eq('success', false)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (adminAccess) {
        const userAttempts = new Map<string, number>();
        adminAccess.forEach(access => {
          const count = userAttempts.get(access.user_id || '') || 0;
          userAttempts.set(access.user_id || '', count + 1);
        });

        for (const [userId, count] of userAttempts.entries()) {
          if (count >= 3) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'privilege_escalation',
              severity: 'high',
              description: `Potential privilege escalation attempt by user ${userId}`,
              user_id: userId,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { user_id: userId, attempt_count: count }
            });
          }
        }
      }
    } catch (error) {
      console.error('Privilege escalation detection error:', error);
    }

    return anomalies;
  }

  private static async detectDataBreach(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for unusual data access patterns
      const { data: dataAccess } = await this.supabase
        .from('security_audit_log')
        .select('user_id, resource_type, action, timestamp')
        .eq('type', 'data_access')
        .eq('success', true)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (dataAccess) {
        const userAccess = new Map<string, Set<string>>();
        dataAccess.forEach(access => {
          if (access.user_id) {
            const resources = userAccess.get(access.user_id) || new Set();
            resources.add(access.resource_type);
            userAccess.set(access.user_id, resources);
          }
        });

        // Flag users accessing many different resource types
        for (const [userId, resources] of userAccess.entries()) {
          if (resources.size > 10) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'data_breach',
              severity: 'medium',
              description: `Unusual data access pattern by user ${userId}`,
              user_id: userId,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { user_id: userId, resource_types: Array.from(resources) }
            });
          }
        }
      }
    } catch (error) {
      console.error('Data breach detection error:', error);
    }

    return anomalies;
  }

  private static async detectRateLimitViolations(): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];

    try {
      // Check for rate limit violations
      const { data: violations } = await this.supabase
        .from('rate_limit_violations')
        .select('user_id, ip_address, scope, created_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

      if (violations) {
        const userViolations = new Map<string, number>();
        const ipViolations = new Map<string, number>();

        violations.forEach(violation => {
          if (violation.user_id) {
            const count = userViolations.get(violation.user_id) || 0;
            userViolations.set(violation.user_id, count + 1);
          }
          if (violation.ip_address) {
            const count = ipViolations.get(violation.ip_address) || 0;
            ipViolations.set(violation.ip_address, count + 1);
          }
        });

        // Flag users with multiple rate limit violations
        for (const [userId, count] of userViolations.entries()) {
          if (count >= 5) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'rate_limit_exceeded',
              severity: 'medium',
              description: `Multiple rate limit violations by user ${userId}`,
              user_id: userId,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { user_id: userId, violation_count: count }
            });
          }
        }

        // Flag IPs with multiple rate limit violations
        for (const [ip, count] of ipViolations.entries()) {
          if (count >= 10) {
            anomalies.push({
              id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'rate_limit_exceeded',
              severity: 'high',
              description: `Multiple rate limit violations from IP ${ip}`,
              detected_at: new Date().toISOString(),
              resolved: false,
              details: { ip, violation_count: count }
            });
          }
        }
      }
    } catch (error) {
      console.error('Rate limit violation detection error:', error);
    }

    return anomalies;
  }

  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // In a real implementation, this would send alerts via email, Slack, etc.
      console.warn('CRITICAL SECURITY EVENT:', {
        type: event.type,
        severity: event.severity,
        user_id: event.user_id,
        action: event.action,
        timestamp: event.timestamp
      });

      // Store alert in database
      await this.supabase
        .from('security_alerts')
        .insert({
          event_id: event.id,
          type: event.type,
          severity: event.severity,
          user_id: event.user_id,
          organization_id: event.organization_id,
          message: `Critical security event: ${event.action}`,
          details: event.details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }
}

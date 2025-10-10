import { createClient } from '@supabase/supabase-js';

// Types
export interface RateLimitConfig {
  id: string;
  name: string;
  scope: 'global' | 'tenant' | 'user' | 'ip' | 'endpoint';
  scopeId?: string;
  endpoint?: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  windowSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RateLimitViolation {
  id: string;
  configId: string;
  scope: string;
  scopeId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  requestCount: number;
  limitExceeded: number;
  violationTime: string;
  isBlocked: boolean;
  blockedUntil?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface IPAccessRule {
  id: string;
  ipAddress: string;
  cidr?: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface AbusePattern {
  id: string;
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number; // in minutes
  isActive: boolean;
  autoBlock: boolean;
  blockDuration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface SecurityIncident {
  id: string;
  type: 'rate_limit_violation' | 'abuse_pattern' | 'ip_blocked' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  ipAddress?: string;
  userId?: string;
  tenantId?: string;
  metadata: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export class RateLimitManagerService {
  private supabase: any;
  private violationCache: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Rate Limit Configuration Management
  async getRateLimitConfigs(scope?: string, scopeId?: string): Promise<RateLimitConfig[]> {
    const { data, error } = await this.supabase
      .from('rate_limit_configs')
      .select('*')
      .eq(scope ? 'scope' : 'scope', scope || null)
      .eq(scopeId ? 'scope_id' : 'scope_id', scopeId || null)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createRateLimitConfig(config: Omit<RateLimitConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RateLimitConfig> {
    const { data, error } = await this.supabase
      .from('rate_limit_configs')
      .insert({
        ...config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRateLimitConfig(id: string, updates: Partial<RateLimitConfig>): Promise<RateLimitConfig> {
    const { data, error } = await this.supabase
      .from('rate_limit_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRateLimitConfig(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('rate_limit_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Rate Limit Checking
  async checkRateLimit(
    scope: string,
    scopeId: string | undefined,
    endpoint: string,
    ipAddress: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; config: RateLimitConfig | null }> {
    // Get applicable rate limit configs
    const configs = await this.getRateLimitConfigs(scope, scopeId);
    
    // Find the most specific config for this endpoint
    let applicableConfig = configs.find(c => c.endpoint === endpoint) || 
                          configs.find(c => c.endpoint === '*') ||
                          configs.find(c => c.scope === scope);

    if (!applicableConfig) {
      return { allowed: true, remaining: Infinity, resetTime: 0, config: null };
    }

    const key = `${scope}:${scopeId || 'global'}:${endpoint}:${ipAddress}`;
    const now = Date.now();
    const windowMs = applicableConfig.windowSize * 1000; // Convert to milliseconds

    // Get current count from cache
    const cached = this.violationCache.get(key);
    const resetTime = cached ? cached.resetTime : now + windowMs;
    
    if (now > resetTime) {
      // Reset window
      this.violationCache.set(key, { count: 0, resetTime: now + windowMs });
    }

    const current = this.violationCache.get(key) || { count: 0, resetTime: now + windowMs };
    const limit = this.getLimitForTimeframe(applicableConfig, windowMs);
    
    if (current.count >= limit) {
      // Record violation
      await this.recordViolation(applicableConfig, scope, scopeId, ipAddress, endpoint, current.count, limit);
      return { allowed: false, remaining: 0, resetTime: current.resetTime, config: applicableConfig };
    }

    // Increment count
    this.violationCache.set(key, { count: current.count + 1, resetTime: current.resetTime });
    
    return { 
      allowed: true, 
      remaining: limit - current.count - 1, 
      resetTime: current.resetTime, 
      config: applicableConfig 
    };
  }

  private getLimitForTimeframe(config: RateLimitConfig, windowMs: number): number {
    const windowMinutes = windowMs / (1000 * 60);
    const windowHours = windowMs / (1000 * 60 * 60);
    const windowDays = windowMs / (1000 * 60 * 60 * 24);

    if (windowMinutes <= 1) return config.requestsPerMinute;
    if (windowHours <= 1) return config.requestsPerHour;
    if (windowDays <= 1) return config.requestsPerDay;
    return config.requestsPerDay;
  }

  // Violation Management
  async recordViolation(
    config: RateLimitConfig,
    scope: string,
    scopeId: string | undefined,
    ipAddress: string,
    endpoint: string,
    requestCount: number,
    limit: number
  ): Promise<void> {
    const violation: Omit<RateLimitViolation, 'id'> = {
      configId: config.id,
      scope,
      scopeId,
      ipAddress,
      userAgent: 'Unknown', // Would be passed from request
      endpoint,
      requestCount,
      limitExceeded: requestCount - limit,
      violationTime: new Date().toISOString(),
      isBlocked: false
    };

    await this.supabase
      .from('rate_limit_violations')
      .insert(violation);

    // Check if IP should be blocked
    await this.checkAbusePatterns(ipAddress, scope, scopeId, endpoint);
  }

  async getViolations(
    filters: {
      scope?: string;
      scopeId?: string;
      ipAddress?: string;
      isBlocked?: boolean;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<RateLimitViolation[]> {
    let query = this.supabase
      .from('rate_limit_violations')
      .select('*')
      .order('violation_time', { ascending: false });

    if (filters.scope) query = query.eq('scope', filters.scope);
    if (filters.scopeId) query = query.eq('scope_id', filters.scopeId);
    if (filters.ipAddress) query = query.eq('ip_address', filters.ipAddress);
    if (filters.isBlocked !== undefined) query = query.eq('is_blocked', filters.isBlocked);
    if (filters.startDate) query = query.gte('violation_time', filters.startDate);
    if (filters.endDate) query = query.lte('violation_time', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // IP Access Control
  async getIPAccessRules(): Promise<IPAccessRule[]> {
    const { data, error } = await this.supabase
      .from('ip_access_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createIPAccessRule(rule: Omit<IPAccessRule, 'id' | 'createdAt'>): Promise<IPAccessRule> {
    const { data, error } = await this.supabase
      .from('ip_access_rules')
      .insert({
        ...rule,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateIPAccessRule(id: string, updates: Partial<IPAccessRule>): Promise<IPAccessRule> {
    const { data, error } = await this.supabase
      .from('ip_access_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIPAccessRule(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ip_access_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async checkIPAccess(ipAddress: string): Promise<{ allowed: boolean; reason?: string; rule?: IPAccessRule }> {
    const rules = await this.getIPAccessRules();
    
    for (const rule of rules) {
      if (this.isIPInRange(ipAddress, rule.ipAddress, rule.cidr)) {
        return {
          allowed: rule.type === 'whitelist',
          reason: rule.reason,
          rule
        };
      }
    }

    return { allowed: true }; // Default allow if no rules match
  }

  private isIPInRange(ip: string, ruleIP: string, cidr?: string): boolean {
    if (cidr) {
      // Simple CIDR check (would need proper implementation in production)
      return ip.startsWith(ruleIP.split('/')[0]);
    }
    return ip === ruleIP;
  }

  // Abuse Pattern Detection
  async getAbusePatterns(): Promise<AbusePattern[]> {
    const { data, error } = await this.supabase
      .from('abuse_patterns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createAbusePattern(pattern: Omit<AbusePattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbusePattern> {
    const { data, error } = await this.supabase
      .from('abuse_patterns')
      .insert({
        ...pattern,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkAbusePatterns(
    ipAddress: string,
    scope: string,
    scopeId: string | undefined,
    endpoint: string
  ): Promise<void> {
    const patterns = await this.getAbusePatterns();
    
    for (const pattern of patterns) {
      const violations = await this.getViolations({
        ipAddress,
        startDate: new Date(Date.now() - pattern.timeWindow * 60 * 1000).toISOString()
      });

      if (violations.length >= pattern.threshold) {
        await this.createSecurityIncident({
          type: 'abuse_pattern',
          severity: pattern.severity,
          title: `Abuse pattern detected: ${pattern.description}`,
          description: `IP ${ipAddress} triggered abuse pattern "${pattern.pattern}" with ${violations.length} violations in ${pattern.timeWindow} minutes`,
          source: 'rate_limit_manager',
          ipAddress,
          metadata: { patternId: pattern.id, violationCount: violations.length },
          status: 'open'
        });

        if (pattern.autoBlock) {
          await this.createIPAccessRule({
            ipAddress,
            type: 'blacklist',
            reason: `Auto-blocked due to abuse pattern: ${pattern.description}`,
            isActive: true,
            expiresAt: new Date(Date.now() + pattern.blockDuration * 60 * 1000).toISOString(),
            createdBy: 'system'
          });
        }
      }
    }
  }

  // Security Incident Management
  async createSecurityIncident(incident: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityIncident> {
    const { data, error } = await this.supabase
      .from('security_incidents')
      .insert({
        ...incident,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSecurityIncidents(
    filters: {
      type?: string;
      severity?: string;
      status?: string;
      assignedTo?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<SecurityIncident[]> {
    let query = this.supabase
      .from('security_incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateSecurityIncident(id: string, updates: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const { data, error } = await this.supabase
      .from('security_incidents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Statistics and Monitoring
  async getSecurityStats(): Promise<{
    totalViolations: number;
    activeIncidents: number;
    blockedIPs: number;
    violationsToday: number;
    topViolatingIPs: Array<{ ip: string; count: number }>;
    violationsByType: Array<{ type: string; count: number }>;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [violations, incidents, ipRules, todayViolations] = await Promise.all([
      this.getViolations(),
      this.getSecurityIncidents({ status: 'open' }),
      this.getIPAccessRules(),
      this.getViolations({ startDate: today })
    ]);

    // Get top violating IPs
    const ipCounts = violations.reduce((acc, v) => {
      acc[v.ipAddress] = (acc[v.ipAddress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topViolatingIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get violations by type
    const violationsByType = violations.reduce((acc, v) => {
      const type = v.endpoint.split('/')[1] || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalViolations: violations.length,
      activeIncidents: incidents.length,
      blockedIPs: ipRules.filter(r => r.type === 'blacklist').length,
      violationsToday: todayViolations.length,
      topViolatingIPs,
      violationsByType: Object.entries(violationsByType).map(([type, count]) => ({ type, count }))
    };
  }
}

export const rateLimitManagerService = new RateLimitManagerService();

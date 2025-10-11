import { RedisRateLimitStore, RateLimitResult } from './redis-store';
import { createClient } from '@supabase/supabase-js';

export interface OrganizationRateLimitConfig {
  organizationId: string;
  endpointPattern?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  customLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    burstLimit?: number;
  };
}

export interface OrganizationRateLimitStats {
  organization: {
    minute: RateLimitResult;
    hour: RateLimitResult;
    day: RateLimitResult;
  };
  users: Array<{
    userId: string;
    userEmail: string;
    stats: {
      minute: RateLimitResult;
      hour: RateLimitResult;
      day: RateLimitResult;
    };
  }>;
  totalRequests: {
    minute: number;
    hour: number;
    day: number;
  };
}

export class OrganizationRateLimiter {
  private redisStore: RedisRateLimitStore;
  private supabase: any;

  constructor() {
    this.redisStore = new RedisRateLimitStore();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Check if an organization request is allowed
   */
  async checkOrganizationRateLimit(config: OrganizationRateLimitConfig): Promise<RateLimitResult> {
    const { organizationId, endpointPattern, subscriptionTier, customLimits } = config;
    
    // Get organization details
    const organization = await this.getOrganization(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Apply subscription-based limits
    const limits = this.getLimitsForSubscription(subscriptionTier || 'free', customLimits);
    
    // Check organization-level rate limit
    return await this.redisStore.checkRateLimit(
      'organization',
      organizationId,
      endpointPattern,
      'hour'
    );
  }

  /**
   * Get organization rate limit status without incrementing
   */
  async getOrganizationRateLimitStatus(config: OrganizationRateLimitConfig): Promise<RateLimitResult> {
    const { organizationId, endpointPattern } = config;
    
    return await this.redisStore.getRateLimitStatus(
      'organization',
      organizationId,
      endpointPattern,
      'hour'
    );
  }

  /**
   * Reset organization rate limits
   */
  async resetOrganizationRateLimits(organizationId: string, endpointPattern?: string): Promise<void> {
    await this.redisStore.resetRateLimit('organization', organizationId, endpointPattern);
  }

  /**
   * Get comprehensive rate limit statistics for an organization
   */
  async getOrganizationRateLimitStats(organizationId: string, endpointPattern?: string): Promise<OrganizationRateLimitStats> {
    // Get organization stats
    const orgStats = await this.redisStore.getRateLimitStats(
      'organization',
      organizationId,
      endpointPattern
    );

    // Get all users in the organization
    const users = await this.getOrganizationUsers(organizationId);
    
    // Get individual user stats
    const userStats = await Promise.all(
      users.map(async (user) => {
        const stats = await this.redisStore.getRateLimitStats(
          'user',
          user.id,
          endpointPattern
        );
        return {
          userId: user.id,
          userEmail: user.email,
          stats
        };
      })
    );

    // Calculate total requests across all users
    const totalRequests = {
      minute: userStats.reduce((sum, user) => sum + (user.stats.minute.remaining || 0), 0),
      hour: userStats.reduce((sum, user) => sum + (user.stats.hour.remaining || 0), 0),
      day: userStats.reduce((sum, user) => sum + (user.stats.day.remaining || 0), 0)
    };

    return {
      organization: orgStats,
      users: userStats,
      totalRequests
    };
  }

  /**
   * Check if organization has exceeded burst limit
   */
  async checkOrganizationBurstLimit(organizationId: string, endpointPattern?: string): Promise<boolean> {
    const minuteStatus = await this.redisStore.getRateLimitStatus(
      'organization',
      organizationId,
      endpointPattern,
      'minute'
    );

    // Check if organization is approaching burst limit (80% of minute limit)
    const burstThreshold = Math.floor(minuteStatus.remaining * 0.2);
    return minuteStatus.remaining <= burstThreshold;
  }

  /**
   * Get rate limit headers for API responses
   */
  async getOrganizationRateLimitHeaders(
    organizationId: string,
    endpointPattern?: string
  ): Promise<Record<string, string>> {
    const status = await this.getOrganizationRateLimitStatus({ organizationId, endpointPattern });
    
    return {
      'X-RateLimit-Limit': status.remaining.toString(),
      'X-RateLimit-Remaining': status.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(status.resetTime / 1000).toString(),
      ...(status.retryAfter && {
        'Retry-After': status.retryAfter.toString()
      })
    };
  }

  /**
   * Get organization usage analytics
   */
  async getOrganizationUsageAnalytics(
    organizationId: string,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    totalRequests: number;
    uniqueUsers: number;
    topEndpoints: Array<{ endpoint: string; requests: number }>;
    peakUsage: { time: string; requests: number };
    averageRequestsPerUser: number;
  }> {
    const users = await this.getOrganizationUsers(organizationId);
    const userCount = users.length;
    
    // This would typically come from a more sophisticated analytics system
    // For now, we'll simulate some basic analytics
    const totalRequests = Math.floor(Math.random() * 10000) + 1000;
    const uniqueUsers = Math.min(userCount, Math.floor(Math.random() * userCount) + 1);
    
    const topEndpoints = [
      { endpoint: '/api/agents', requests: Math.floor(totalRequests * 0.3) },
      { endpoint: '/api/workflows', requests: Math.floor(totalRequests * 0.25) },
      { endpoint: '/api/analytics', requests: Math.floor(totalRequests * 0.2) },
      { endpoint: '/api/admin', requests: Math.floor(totalRequests * 0.15) },
      { endpoint: '/api/orchestrator', requests: Math.floor(totalRequests * 0.1) }
    ];

    const peakUsage = {
      time: '14:00-15:00',
      requests: Math.floor(totalRequests * 0.15)
    };

    return {
      totalRequests,
      uniqueUsers,
      topEndpoints,
      peakUsage,
      averageRequestsPerUser: Math.floor(totalRequests / uniqueUsers)
    };
  }

  /**
   * Set custom rate limits for an organization
   */
  async setCustomRateLimits(
    organizationId: string,
    limits: {
      requestsPerMinute?: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
      burstLimit?: number;
    },
    endpointPattern?: string
  ): Promise<void> {
    // This would typically update the database configuration
    // For now, we'll just log the action
    console.log(`Setting custom rate limits for organization ${organizationId}:`, limits);
    
    // In a real implementation, you would:
    // 1. Update the rate_limit_config table
    // 2. Invalidate any cached configurations
    // 3. Log the change for audit purposes
  }

  private async getOrganization(organizationId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('id, name, subscription_tier')
      .eq('id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }

    return data;
  }

  private async getOrganizationUsers(organizationId: string): Promise<Array<{ id: string; email: string }>> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('id, email')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }

    return data || [];
  }

  private getLimitsForSubscription(
    tier: 'free' | 'pro' | 'enterprise',
    customLimits?: any
  ): any {
    const baseLimits = {
      free: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000,
        burstLimit: 2000
      },
      pro: {
        requestsPerMinute: 2000,
        requestsPerHour: 20000,
        requestsPerDay: 200000,
        burstLimit: 4000
      },
      enterprise: {
        requestsPerMinute: 5000,
        requestsPerHour: 50000,
        requestsPerDay: 500000,
        burstLimit: 10000
      }
    };

    return {
      ...baseLimits[tier],
      ...customLimits
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.redisStore.close();
  }
}

// Singleton instance
let orgRateLimiter: OrganizationRateLimiter | null = null;

export function getOrganizationRateLimiter(): OrganizationRateLimiter {
  if (!orgRateLimiter) {
    orgRateLimiter = new OrganizationRateLimiter();
  }
  return orgRateLimiter;
}

import { createClient } from '@supabase/supabase-js';

import { RedisRateLimitStore, RateLimitResult } from './redis-store';

export interface UserRateLimitConfig {
  userId: string;
  endpointPattern?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  customLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    burstLimit?: number;
  };
}

export class UserRateLimiter {
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
   * Check if a user request is allowed
   */
  async checkUserRateLimit(config: UserRateLimitConfig): Promise<RateLimitResult> {
    const { userId, endpointPattern, subscriptionTier, customLimits } = config;
    
    // Get user's organization for organization-level limits
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    // Apply subscription-based limits
    const limits = this.getLimitsForSubscription(subscriptionTier || 'free', customLimits);
    
    // Check user-level rate limit
    const userResult = await this.redisStore.checkRateLimit(
      'user',
      userId,
      endpointPattern,
      'hour'
    );

    if (!userResult.allowed) {
      return userResult;
    }

    // Check organization-level rate limit if user belongs to an organization
    if (userProfile.organization_id) {
      const orgResult = await this.redisStore.checkRateLimit(
        'organization',
        userProfile.organization_id,
        endpointPattern,
        'hour'
      );

      if (!orgResult.allowed) {
        return {
          ...orgResult,
          remaining: Math.min(userResult.remaining, orgResult.remaining)
        };
      }
    }

    return userResult;
  }

  /**
   * Get user rate limit status without incrementing
   */
  async getUserRateLimitStatus(config: UserRateLimitConfig): Promise<{
    user: RateLimitResult;
    organization?: RateLimitResult;
    overall: RateLimitResult;
  }> {
    const { userId, endpointPattern } = config;
    
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const userStatus = await this.redisStore.getRateLimitStatus(
      'user',
      userId,
      endpointPattern,
      'hour'
    );

    let orgStatus: RateLimitResult | undefined;
    let overallStatus = userStatus;

    if (userProfile.organization_id) {
      orgStatus = await this.redisStore.getRateLimitStatus(
        'organization',
        userProfile.organization_id,
        endpointPattern,
        'hour'
      );

      // Overall status is the most restrictive
      overallStatus = {
        allowed: userStatus.allowed && orgStatus.allowed,
        remaining: Math.min(userStatus.remaining, orgStatus.remaining),
        resetTime: Math.max(userStatus.resetTime, orgStatus.resetTime),
        retryAfter: userStatus.retryAfter || orgStatus.retryAfter
      };
    }

    return {
      user: userStatus,
      organization: orgStatus,
      overall: overallStatus
    };
  }

  /**
   * Reset user rate limits
   */
  async resetUserRateLimits(userId: string, endpointPattern?: string): Promise<void> {
    await this.redisStore.resetRateLimit('user', userId, endpointPattern);
  }

  /**
   * Get comprehensive rate limit statistics for a user
   */
  async getUserRateLimitStats(userId: string, endpointPattern?: string): Promise<{
    user: {
      minute: RateLimitResult;
      hour: RateLimitResult;
      day: RateLimitResult;
    };
    organization?: {
      minute: RateLimitResult;
      hour: RateLimitResult;
      day: RateLimitResult;
    };
  }> {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const userStats = await this.redisStore.getRateLimitStats(
      'user',
      userId,
      endpointPattern
    );

    let orgStats;
    if (userProfile.organization_id) {
      orgStats = await this.redisStore.getRateLimitStats(
        'organization',
        userProfile.organization_id,
        endpointPattern
      );
    }

    return {
      user: userStats,
      organization: orgStats
    };
  }

  /**
   * Check if user has exceeded burst limit
   */
  async checkBurstLimit(userId: string, endpointPattern?: string): Promise<boolean> {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const minuteStatus = await this.redisStore.getRateLimitStatus(
      'user',
      userId,
      endpointPattern,
      'minute'
    );

    // Check if user is approaching burst limit (80% of minute limit)
    const burstThreshold = Math.floor(minuteStatus.remaining * 0.2);
    return minuteStatus.remaining <= burstThreshold;
  }

  /**
   * Get rate limit headers for API responses
   */
  async getRateLimitHeaders(
    userId: string,
    endpointPattern?: string
  ): Promise<Record<string, string>> {
    const status = await this.getUserRateLimitStatus({ userId, endpointPattern });
    
    return {
      'X-RateLimit-Limit': status.overall.remaining.toString(),
      'X-RateLimit-Remaining': status.overall.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(status.overall.resetTime / 1000).toString(),
      ...(status.overall.retryAfter && {
        'Retry-After': status.overall.retryAfter.toString()
      })
    };
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('id, organization_id, role, subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  private getLimitsForSubscription(
    tier: 'free' | 'pro' | 'enterprise',
    customLimits?: any
  ): any {
    const baseLimits = {
      free: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 100
      },
      pro: {
        requestsPerMinute: 120,
        requestsPerHour: 2000,
        requestsPerDay: 20000,
        burstLimit: 200
      },
      enterprise: {
        requestsPerMinute: 300,
        requestsPerHour: 5000,
        requestsPerDay: 50000,
        burstLimit: 500
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
let userRateLimiter: UserRateLimiter | null = null;

export function getUserRateLimiter(): UserRateLimiter {
  if (!userRateLimiter) {
    userRateLimiter = new UserRateLimiter();
  }
  return userRateLimiter;
}

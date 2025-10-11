import { NextRequest, NextResponse } from 'next/server';
import { getUserRateLimiter, UserRateLimiter } from './user-rate-limiter';
import { getOrganizationRateLimiter, OrganizationRateLimiter } from './org-rate-limiter';
import { createClient } from '@supabase/supabase-js';

export interface RateLimitOptions {
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  onLimitReached?: (request: NextRequest, result: any) => void;
}

export class RateLimitMiddleware {
  private userRateLimiter: UserRateLimiter;
  private orgRateLimiter: OrganizationRateLimiter;
  private supabase: any;

  constructor() {
    this.userRateLimiter = getUserRateLimiter();
    this.orgRateLimiter = getOrganizationRateLimiter();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Apply rate limiting to an API route
   */
  async applyRateLimit(
    request: NextRequest,
    options: RateLimitOptions = {}
  ): Promise<NextResponse | null> {
    try {
      // Extract user information from request
      const user = await this.extractUserFromRequest(request);
      if (!user) {
        // No user context, skip rate limiting
        return null;
      }

      // Generate endpoint pattern
      const endpointPattern = this.generateEndpointPattern(request);
      
      // Check user rate limit
      const userResult = await this.userRateLimiter.checkUserRateLimit({
        userId: user.id,
        endpointPattern,
        subscriptionTier: user.subscription_tier
      });

      if (!userResult.allowed) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: userResult.retryAfter
          },
          { status: 429 }
        );

        // Add rate limit headers
        const headers = await this.userRateLimiter.getRateLimitHeaders(user.id, endpointPattern);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        // Call limit reached callback
        if (options.onLimitReached) {
          options.onLimitReached(request, userResult);
        }

        return response;
      }

      // Check organization rate limit if user belongs to an organization
      if (user.organization_id) {
        const orgResult = await this.orgRateLimiter.checkOrganizationRateLimit({
          organizationId: user.organization_id,
          endpointPattern,
          subscriptionTier: user.subscription_tier
        });

        if (!orgResult.allowed) {
          const response = NextResponse.json(
            {
              error: 'Organization rate limit exceeded',
              message: 'Organization has exceeded its rate limit. Please try again later.',
              retryAfter: orgResult.retryAfter
            },
            { status: 429 }
          );

          // Add rate limit headers
          const headers = await this.orgRateLimiter.getOrganizationRateLimitHeaders(
            user.organization_id,
            endpointPattern
          );
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });

          // Call limit reached callback
          if (options.onLimitReached) {
            options.onLimitReached(request, orgResult);
          }

          return response;
        }
      }

      // Rate limit passed, continue with request
      return null;

    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      return null;
    }
  }

  /**
   * Apply rate limiting with custom key generation
   */
  async applyCustomRateLimit(
    request: NextRequest,
    keyGenerator: (request: NextRequest) => string,
    options: RateLimitOptions = {}
  ): Promise<NextResponse | null> {
    try {
      const key = keyGenerator(request);
      
      // Use Redis directly for custom rate limiting
      const { getRedisStore } = await import('./redis-store');
      const redisStore = getRedisStore();
      
      const result = await redisStore.checkRateLimit('global', key, undefined, 'hour');
      
      if (!result.allowed) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: result.retryAfter
          },
          { status: 429 }
        );

        response.headers.set('X-RateLimit-Limit', result.remaining.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
        
        if (result.retryAfter) {
          response.headers.set('Retry-After', result.retryAfter.toString());
        }

        if (options.onLimitReached) {
          options.onLimitReached(request, result);
        }

        return response;
      }

      return null;

    } catch (error) {
      console.error('Custom rate limiting error:', error);
      return null;
    }
  }

  /**
   * Get rate limit status for a user
   */
  async getRateLimitStatus(userId: string, endpointPattern?: string): Promise<any> {
    return await this.userRateLimiter.getUserRateLimitStatus({
      userId,
      endpointPattern
    });
  }

  /**
   * Get rate limit status for an organization
   */
  async getOrganizationRateLimitStatus(organizationId: string, endpointPattern?: string): Promise<any> {
    return await this.orgRateLimiter.getOrganizationRateLimitStatus({
      organizationId,
      endpointPattern
    });
  }

  /**
   * Reset rate limits for a user
   */
  async resetUserRateLimits(userId: string, endpointPattern?: string): Promise<void> {
    await this.userRateLimiter.resetUserRateLimits(userId, endpointPattern);
  }

  /**
   * Reset rate limits for an organization
   */
  async resetOrganizationRateLimits(organizationId: string, endpointPattern?: string): Promise<void> {
    await this.orgRateLimiter.resetOrganizationRateLimits(organizationId, endpointPattern);
  }

  private async extractUserFromRequest(request: NextRequest): Promise<any> {
    try {
      // Try to get user from Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Verify JWT token and extract user info
        const { data: { user }, error } = await this.supabase.auth.getUser(token);
        if (error || !user) {
          return null;
        }

        // Get user profile with organization info
        const { data: profile } = await this.supabase
          .from('user_profiles')
          .select('id, organization_id, role, subscription_tier')
          .eq('id', user.id)
          .single();

        return profile;
      }

      // Try to get user from cookies (for web requests)
      const supabaseAccessToken = request.cookies.get('sb-access-token')?.value;
      if (supabaseAccessToken) {
        const { data: { user }, error } = await this.supabase.auth.getUser(supabaseAccessToken);
        if (error || !user) {
          return null;
        }

        const { data: profile } = await this.supabase
          .from('user_profiles')
          .select('id, organization_id, role, subscription_tier')
          .eq('id', user.id)
          .single();

        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error extracting user from request:', error);
      return null;
    }
  }

  private generateEndpointPattern(request: NextRequest): string {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Convert dynamic segments to patterns
    let pattern = pathname
      .replace(/\/[0-9a-f-]{36}/g, '/:id') // UUIDs
      .replace(/\/\d+/g, '/:id') // Numbers
      .replace(/\/[^/]+$/g, '/:slug'); // Other dynamic segments
    
    // Add method prefix
    const method = request.method.toLowerCase();
    return `${method}:${pattern}`;
  }
}

// Singleton instance
let rateLimitMiddleware: RateLimitMiddleware | null = null;

export function getRateLimitMiddleware(): RateLimitMiddleware {
  if (!rateLimitMiddleware) {
    rateLimitMiddleware = new RateLimitMiddleware();
  }
  return rateLimitMiddleware;
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = getRateLimitMiddleware();
    const rateLimitResponse = await middleware.applyRateLimit(request, options);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request);
  };
}

/**
 * Higher-order function for custom rate limiting
 */
export function withCustomRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  keyGenerator: (request: NextRequest) => string,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = getRateLimitMiddleware();
    const rateLimitResponse = await middleware.applyCustomRateLimit(request, keyGenerator, options);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request);
  };
}

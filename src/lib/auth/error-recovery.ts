import { AUTH_CONFIG } from './config';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
}

export class AuthErrorRecovery {
  private static instance: AuthErrorRecovery;
  private retryCounts = new Map<string, number>();

  static getInstance(): AuthErrorRecovery {
    if (!AuthErrorRecovery.instance) {
      AuthErrorRecovery.instance = new AuthErrorRecovery();
    }
    return AuthErrorRecovery.instance;
  }

  // Retry a failed operation with exponential backoff
  async retry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = AUTH_CONFIG.retryAttempts,
      delay = AUTH_CONFIG.retryDelay,
      backoffMultiplier = 2
    } = options;

    const currentCount = this.retryCounts.get(operationName) || 0;
    
    if (currentCount >= maxAttempts) {
      this.retryCounts.delete(operationName);
      throw new Error(`Operation '${operationName}' failed after ${maxAttempts} attempts`);
    }

    try {
      const result = await operation();
      this.retryCounts.delete(operationName);
      return result;
    } catch (error) {
      console.warn(`${operationName} failed (attempt ${currentCount + 1}/${maxAttempts}):`, error);
      
      this.retryCounts.set(operationName, currentCount + 1);
      
      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(backoffMultiplier, currentCount);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      return this.retry(operation, operationName, options);
    }
  }

  // Handle network errors gracefully
  isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const networkErrorPatterns = [
      'network error',
      'fetch failed',
      'connection refused',
      'timeout',
      'offline',
      'no internet',
      'connection lost'
    ];
    
    return networkErrorPatterns.some(pattern => message.includes(pattern));
  }

  // Handle auth-specific errors
  isAuthError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message?.toLowerCase() || '';
    const authErrorPatterns = [
      'invalid credentials',
      'user not found',
      'invalid token',
      'session expired',
      'unauthorized',
      'forbidden',
      'authentication failed'
    ];
    
    return authErrorPatterns.some(pattern => message.includes(pattern));
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: any): string {
    if (!error) return 'An unexpected error occurred';
    
    if (this.isNetworkError(error)) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (this.isAuthError(error)) {
      const message = error.message?.toLowerCase() || '';
      
      if (message.includes('invalid credentials') || message.includes('invalid email')) {
        return 'Invalid email or password. Please check your credentials and try again.';
      }
      
      if (message.includes('user not found')) {
        return 'No account found with this email address. Please sign up first.';
      }
      
      if (message.includes('session expired') || message.includes('invalid token')) {
        return 'Your session has expired. Please sign in again.';
      }
      
      if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'You do not have permission to perform this action.';
      }
      
      return 'Authentication failed. Please try again.';
    }
    
    // Return original message for other errors
    return error.message || 'An unexpected error occurred';
  }

  // Clear retry count for an operation
  clearRetryCount(operationName: string): void {
    this.retryCounts.delete(operationName);
  }

  // Get current retry count for an operation
  getRetryCount(operationName: string): number {
    return this.retryCounts.get(operationName) || 0;
  }

  // Reset all retry counts
  resetAllRetryCounts(): void {
    this.retryCounts.clear();
  }
}

// Export singleton instance
export const authErrorRecovery = AuthErrorRecovery.getInstance();

// Utility function for easy retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options?: RetryOptions
): Promise<T> {
  return authErrorRecovery.retry(operation, operationName, options);
}

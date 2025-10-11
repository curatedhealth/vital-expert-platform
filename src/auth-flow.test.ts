import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../auth-provider';
import { ReactNode } from 'react';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
};

vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock session sync
vi.mock('../session-sync', () => ({
  sessionSync: {
    subscribe: vi.fn(() => vi.fn())
  }
}));

// Mock error recovery
vi.mock('../error-recovery', () => ({
  authErrorRecovery: {
    retry: vi.fn((fn) => fn()),
    getUserFriendlyMessage: vi.fn((error) => error?.message || 'Unknown error')
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Auth Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with no user when no session exists', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });

    it('should initialize with user when session exists', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      };

      const mockSession = {
        user: mockUser,
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer'
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Mock user profile fetch
      const mockSupabaseQuery = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: {
                  role: 'user',
                  is_active: true,
                  avatar_url: null,
                  organization_id: null,
                  job_title: null,
                  preferences: {}
                },
                error: null
              })
            }))
          }))
        }))
      };

      vi.doMock('@/lib/supabase/client', () => ({
        supabase: {
          ...mockSupabase,
          ...mockSupabaseQuery
        }
      }));

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.session).toBeTruthy();
      expect(result.current.loading).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };

      const mockSession = {
        user: mockUser,
        access_token: 'test-token'
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle sign in errors gracefully', async () => {
      const errorMessage = 'Invalid credentials';
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: errorMessage }
      });

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch (error) {
          expect(error.message).toBe(errorMessage);
        }
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Session Refresh', () => {
    it('should refresh session successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };

      const mockSession = {
        user: mockUser,
        access_token: 'new-token'
      };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        await result.current.refreshSession();
      });

      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockSupabase.auth.getSession.mockRejectedValue(networkError);

      const { result } = renderHook(() => {
        const { useAuth } = require('../auth-provider');
        return useAuth();
      }, { wrapper });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.user).toBeNull();
    });
  });
});

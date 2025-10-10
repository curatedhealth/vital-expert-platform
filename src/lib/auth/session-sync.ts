import { supabase } from '@/lib/supabase/client';

export class SessionSync {
  private static instance: SessionSync;
  private listeners: Set<() => void> = new Set();
  private isListening = false;

  static getInstance(): SessionSync {
    if (!SessionSync.instance) {
      SessionSync.instance = new SessionSync();
    }
    return SessionSync.instance;
  }

  // Subscribe to session changes across tabs
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    if (!this.isListening) {
      this.startListening();
    }

    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopListening();
      }
    };
  }

  private startListening() {
    if (this.isListening) return;
    
    this.isListening = true;

    // Listen for storage events (tab changes)
    window.addEventListener('storage', this.handleStorageChange);
    
    // Listen for focus events (tab focus)
    window.addEventListener('focus', this.handleFocus);
    
    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          this.notifyListeners();
        }
      }
    );

    // Store subscription for cleanup
    (this as any).authSubscription = subscription;
  }

  private stopListening() {
    if (!this.isListening) return;
    
    this.isListening = false;
    
    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('focus', this.handleFocus);
    
    if ((this as any).authSubscription) {
      (this as any).authSubscription.unsubscribe();
      (this as any).authSubscription = null;
    }
  }

  private handleStorageChange = (event: StorageEvent) => {
    // Only handle auth-related storage changes
    if (event.key?.includes('supabase') || event.key?.includes('auth')) {
      this.notifyListeners();
    }
  };

  private handleFocus = () => {
    // Refresh session when tab gains focus
    this.refreshSession();
  };

  private async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Session refresh failed:', error);
      } else if (session) {
        this.notifyListeners();
      }
    } catch (error) {
      console.warn('Session refresh error:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Session sync callback error:', error);
      }
    });
  }

  // Force sync across all tabs
  async syncAcrossTabs() {
    try {
      // Trigger a storage event to notify other tabs
      const event = new StorageEvent('storage', {
        key: 'supabase-sync',
        newValue: Date.now().toString(),
        url: window.location.href
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Cross-tab sync failed:', error);
    }
  }
}

// Export singleton instance
export const sessionSync = SessionSync.getInstance();

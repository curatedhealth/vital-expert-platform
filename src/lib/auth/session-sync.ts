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
    this.startListening();
    return () => this.unsubscribe(callback);
  }

  // Unsubscribe from session changes
  unsubscribe(callback: () => void): void {
    this.listeners.delete(callback);
    if (this.listeners.size === 0) {
      this.stopListening();
    }
  }

  // Start listening for storage events
  private startListening(): void {
    if (this.isListening) return;
    
    this.isListening = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
      window.addEventListener('focus', this.handleFocus);
    }
  }

  // Stop listening for storage events
  private stopListening(): void {
    if (!this.isListening) return;
    
    this.isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
      window.removeEventListener('focus', this.handleFocus);
    }
  }

  // Handle storage changes (cross-tab sync)
  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === 'supabase-sync') {
      this.notifyListeners();
    }
  };

  // Handle window focus (refresh session)
  private handleFocus = (): void => {
    this.notifyListeners();
  };

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Session sync callback error:', error);
      }
    });
  }

  // Force sync across all tabs
  async syncAcrossTabs(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Trigger a storage event to notify other tabs
        const event = new StorageEvent('storage', {
          key: 'supabase-sync',
          newValue: Date.now().toString(),
          url: window.location.href
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn('Cross-tab sync failed:', error);
    }
  }
}

// Export singleton instance
export const sessionSync = SessionSync.getInstance();

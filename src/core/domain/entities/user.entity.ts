/**
 * User Entity - Core domain entity for users
 * 
 * Represents a user with preferences, permissions, and activity tracking.
 * This entity manages user-specific data and access control.
 */

export interface UserPreferences {
  defaultMode: 'manual' | 'automatic';
  preferredAgents: string[];
  notificationSettings: {
    email: boolean;
    push: boolean;
    chatUpdates: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface UserPermissions {
  canCreateAgents: boolean;
  canAccessAdvancedFeatures: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  maxConcurrentChats: number;
  maxTokensPerMonth: number;
}

export interface UserActivity {
  lastLogin: Date;
  totalChats: number;
  totalMessages: number;
  totalTokensUsed: number;
  favoriteAgents: string[];
  recentSearches: string[];
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly preferences: UserPreferences,
    public readonly permissions: UserPermissions,
    public readonly activity: UserActivity,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Update user preferences
   */
  updatePreferences(newPreferences: Partial<UserPreferences>): User {
    const updatedPreferences = { ...this.preferences, ...newPreferences };
    
    return new User(
      this.id,
      this.email,
      this.name,
      updatedPreferences,
      this.permissions,
      this.activity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update user permissions
   */
  updatePermissions(newPermissions: Partial<UserPermissions>): User {
    const updatedPermissions = { ...this.permissions, ...newPermissions };
    
    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      updatedPermissions,
      this.activity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Record user activity
   */
  recordActivity(activity: Partial<UserActivity>): User {
    const updatedActivity = {
      ...this.activity,
      ...activity,
      lastLogin: new Date()
    };
    
    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      updatedActivity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add a favorite agent
   */
  addFavoriteAgent(agentId: string): User {
    if (this.activity.favoriteAgents.includes(agentId)) {
      return this; // Already a favorite
    }

    const updatedActivity = {
      ...this.activity,
      favoriteAgents: [...this.activity.favoriteAgents, agentId]
    };

    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      updatedActivity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Remove a favorite agent
   */
  removeFavoriteAgent(agentId: string): User {
    const updatedActivity = {
      ...this.activity,
      favoriteAgents: this.activity.favoriteAgents.filter(id => id !== agentId)
    };

    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      updatedActivity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add a recent search
   */
  addRecentSearch(searchTerm: string): User {
    const recentSearches = [
      searchTerm,
      ...this.activity.recentSearches.filter(term => term !== searchTerm)
    ].slice(0, 10); // Keep only last 10 searches

    const updatedActivity = {
      ...this.activity,
      recentSearches
    };

    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      updatedActivity,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Check if user can perform an action
   */
  canPerformAction(action: keyof UserPermissions): boolean {
    return this.permissions[action] === true;
  }

  /**
   * Check if user has reached token limit
   */
  hasReachedTokenLimit(): boolean {
    return this.activity.totalTokensUsed >= this.permissions.maxTokensPerMonth;
  }

  /**
   * Check if user has reached chat limit
   */
  hasReachedChatLimit(currentChatCount: number): boolean {
    return currentChatCount >= this.permissions.maxConcurrentChats;
  }

  /**
   * Get user's preferred agents
   */
  getPreferredAgents(): string[] {
    return this.preferences.preferredAgents;
  }

  /**
   * Check if agent is in user's favorites
   */
  isAgentFavorite(agentId: string): boolean {
    return this.activity.favoriteAgents.includes(agentId);
  }

  /**
   * Get user's activity summary
   */
  getActivitySummary(): {
    isActive: boolean;
    daysSinceLastLogin: number;
    totalActivity: number;
    mostUsedAgents: string[];
  } {
    const now = new Date();
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - this.activity.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      isActive: this.isActive && daysSinceLastLogin < 30,
      daysSinceLastLogin,
      totalActivity: this.activity.totalChats + this.activity.totalMessages,
      mostUsedAgents: this.activity.favoriteAgents.slice(0, 5)
    };
  }

  /**
   * Deactivate user account
   */
  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      this.activity,
      false,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Reactivate user account
   */
  reactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.preferences,
      this.permissions,
      this.activity,
      true,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      preferences: this.preferences,
      permissions: this.permissions,
      activity: {
        ...this.activity,
        lastLogin: this.activity.lastLogin.toISOString()
      },
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Create a copy with updated fields
   */
  withUpdates(updates: Partial<Pick<User, 'name' | 'preferences' | 'permissions' | 'activity' | 'isActive'>>): User {
    return new User(
      this.id,
      this.email,
      updates.name ?? this.name,
      updates.preferences ?? this.preferences,
      updates.permissions ?? this.permissions,
      updates.activity ?? this.activity,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Validate user data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === '') {
      errors.push('User ID is required');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('User name is required');
    }

    if (this.permissions.maxConcurrentChats < 1) {
      errors.push('Max concurrent chats must be at least 1');
    }

    if (this.permissions.maxTokensPerMonth < 1000) {
      errors.push('Max tokens per month must be at least 1000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

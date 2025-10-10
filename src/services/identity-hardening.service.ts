import { createClient } from '@supabase/supabase-js';
import { AuditLogger, AuditAction, AuditSeverity } from '@/lib/security/audit-logger';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'scim';
  isActive: boolean;
  configuration: SSOConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOConfiguration {
  entityId: string;
  ssoUrl: string;
  x509Certificate: string;
  nameIdFormat: string;
  attributeMapping: Record<string, string>;
  groupMapping: Record<string, string>;
  autoProvisioning: boolean;
  defaultRole: string;
  allowedDomains?: string[];
}

export interface MFAConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  methods: MFAMethod[];
  enforcementLevel: 'optional' | 'required' | 'conditional';
  riskThreshold: number;
  sessionTimeout: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'hardware_key' | 'biometric';
  isEnabled: boolean;
  priority: number;
  configuration: Record<string, any>;
}

export interface SessionRisk {
  userId: string;
  sessionId: string;
  riskScore: number; // 0-100
  factors: RiskFactor[];
  lastCalculated: Date;
  requiresStepUp: boolean;
}

export interface RiskFactor {
  type: 'location' | 'device' | 'time' | 'behavior' | 'network';
  score: number;
  description: string;
  confidence: number;
}

export interface AccessReview {
  id: string;
  name: string;
  description: string;
  targetUsers: string[];
  targetRoles: string[];
  reviewers: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  createdBy: string;
  results?: AccessReviewResult[];
}

export interface AccessReviewResult {
  userId: string;
  reviewerId: string;
  decision: 'approve' | 'revoke' | 'modify';
  comments: string;
  reviewedAt: Date;
  modifications?: {
    roles: string[];
    permissions: string[];
  };
}

export interface ImpersonationSession {
  id: string;
  adminUserId: string;
  targetUserId: string;
  reason: string;
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
  consentBannerShown: boolean;
  actions: ImpersonationAction[];
}

export interface ImpersonationAction {
  id: string;
  action: string;
  resource: string;
  timestamp: Date;
  details: Record<string, any>;
}

export class IdentityHardeningService {
  private supabase;
  private auditLogger: AuditLogger;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.auditLogger = AuditLogger.getInstance();
  }

  /**
   * Get current user's profile and role
   */
  async getCurrentUser(): Promise<{ user: any; profile: any; isSuperAdmin: boolean }> {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const isSuperAdmin = profile.role === 'super_admin';

    return { user, profile, isSuperAdmin };
  }

  /**
   * Get SSO providers
   */
  async getSSOProviders(): Promise<SSOProvider[]> {
    try {
      const { data, error } = await this.supabase
        .from('sso_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch SSO providers: ${error.message}`);
      }

      return (data || []).map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        isActive: provider.is_active,
        configuration: provider.configuration || {},
        createdAt: new Date(provider.created_at),
        updatedAt: new Date(provider.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching SSO providers:', error);
      return [];
    }
  }

  /**
   * Create SSO provider
   */
  async createSSOProvider(
    providerData: Omit<SSOProvider, 'id' | 'createdAt' | 'updatedAt'>,
    currentUserId: string
  ): Promise<SSOProvider> {
    try {
      const { data, error } = await this.supabase
        .from('sso_providers')
        .insert({
          name: providerData.name,
          type: providerData.type,
          is_active: providerData.isActive,
          configuration: providerData.configuration,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create SSO provider: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'sso_provider',
        resourceId: data.id,
        newValues: {
          name: providerData.name,
          type: providerData.type,
          isActive: providerData.isActive
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'sso_provider_created',
          createdBy: currentUserId
        }
      });

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        isActive: data.is_active,
        configuration: data.configuration || {},
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Error creating SSO provider:', error);
      throw error;
    }
  }

  /**
   * Get MFA configuration
   */
  async getMFAConfig(): Promise<MFAConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('mfa_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch MFA configs: ${error.message}`);
      }

      return (data || []).map(config => ({
        id: config.id,
        name: config.name,
        isEnabled: config.is_enabled,
        methods: config.methods || [],
        enforcementLevel: config.enforcement_level,
        riskThreshold: config.risk_threshold,
        sessionTimeout: config.session_timeout,
        createdAt: new Date(config.created_at),
        updatedAt: new Date(config.updated_at)
      }));
    } catch (error) {
      console.error('Error fetching MFA configs:', error);
      return [];
    }
  }

  /**
   * Update MFA configuration
   */
  async updateMFAConfig(
    configId: string,
    updates: Partial<MFAConfig>,
    currentUserId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mfa_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', configId);

      if (error) {
        throw new Error(`Failed to update MFA config: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'mfa_config',
        resourceId: configId,
        newValues: updates,
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'mfa_config_updated',
          updatedBy: currentUserId
        }
      });
    } catch (error) {
      console.error('Error updating MFA config:', error);
      throw error;
    }
  }

  /**
   * Calculate session risk score
   */
  async calculateSessionRisk(userId: string, sessionId: string): Promise<SessionRisk> {
    try {
      // This would integrate with actual risk calculation services
      // For now, return mock risk assessment
      const factors: RiskFactor[] = [
        {
          type: 'location',
          score: 20,
          description: 'Login from new location',
          confidence: 0.8
        },
        {
          type: 'device',
          score: 10,
          description: 'Known device',
          confidence: 0.9
        },
        {
          type: 'time',
          score: 5,
          description: 'Normal business hours',
          confidence: 0.7
        },
        {
          type: 'behavior',
          score: 15,
          description: 'Unusual access pattern',
          confidence: 0.6
        }
      ];

      const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
      const riskScore = Math.min(100, totalScore);

      const sessionRisk: SessionRisk = {
        userId,
        sessionId,
        riskScore,
        factors,
        lastCalculated: new Date(),
        requiresStepUp: riskScore > 70
      };

      // Store risk assessment
      await this.supabase
        .from('session_risks')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          risk_score: riskScore,
          factors: factors,
          last_calculated: new Date().toISOString(),
          requires_step_up: sessionRisk.requiresStepUp
        });

      return sessionRisk;
    } catch (error) {
      console.error('Error calculating session risk:', error);
      throw error;
    }
  }

  /**
   * Get access reviews
   */
  async getAccessReviews(): Promise<AccessReview[]> {
    try {
      const { data, error } = await this.supabase
        .from('access_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch access reviews: ${error.message}`);
      }

      return (data || []).map(review => ({
        id: review.id,
        name: review.name,
        description: review.description,
        targetUsers: review.target_users || [],
        targetRoles: review.target_roles || [],
        reviewers: review.reviewers || [],
        status: review.status,
        dueDate: new Date(review.due_date),
        createdAt: new Date(review.created_at),
        createdBy: review.created_by,
        results: review.results || []
      }));
    } catch (error) {
      console.error('Error fetching access reviews:', error);
      return [];
    }
  }

  /**
   * Create access review
   */
  async createAccessReview(
    reviewData: Omit<AccessReview, 'id' | 'createdAt' | 'createdBy'>,
    currentUserId: string
  ): Promise<AccessReview> {
    try {
      const { data, error } = await this.supabase
        .from('access_reviews')
        .insert({
          name: reviewData.name,
          description: reviewData.description,
          target_users: reviewData.targetUsers,
          target_roles: reviewData.targetRoles,
          reviewers: reviewData.reviewers,
          status: reviewData.status,
          due_date: reviewData.dueDate.toISOString(),
          created_at: new Date().toISOString(),
          created_by: currentUserId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create access review: ${error.message}`);
      }

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'access_review',
        resourceId: data.id,
        newValues: {
          name: reviewData.name,
          targetUsers: reviewData.targetUsers.length,
          targetRoles: reviewData.targetRoles.length,
          reviewers: reviewData.reviewers.length
        },
        success: true,
        severity: AuditSeverity.MEDIUM,
        metadata: {
          action: 'access_review_created',
          createdBy: currentUserId
        }
      });

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        targetUsers: data.target_users || [],
        targetRoles: data.target_roles || [],
        reviewers: data.reviewers || [],
        status: data.status,
        dueDate: new Date(data.due_date),
        createdAt: new Date(data.created_at),
        createdBy: data.created_by
      };
    } catch (error) {
      console.error('Error creating access review:', error);
      throw error;
    }
  }

  /**
   * Start impersonation session
   */
  async startImpersonation(
    targetUserId: string,
    reason: string,
    adminUserId: string
  ): Promise<ImpersonationSession> {
    try {
      const sessionId = `imp-${Date.now()}`;
      
      const impersonationSession: ImpersonationSession = {
        id: sessionId,
        adminUserId,
        targetUserId,
        reason,
        startedAt: new Date(),
        isActive: true,
        consentBannerShown: true,
        actions: []
      };

      // Store impersonation session
      await this.supabase
        .from('impersonation_sessions')
        .insert({
          id: sessionId,
          admin_user_id: adminUserId,
          target_user_id: targetUserId,
          reason: reason,
          started_at: new Date().toISOString(),
          is_active: true,
          consent_banner_shown: true,
          actions: []
        });

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'impersonation_session',
        resourceId: sessionId,
        newValues: {
          targetUserId,
          reason,
          adminUserId
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'impersonation_started',
          adminUserId,
          targetUserId
        }
      });

      return impersonationSession;
    } catch (error) {
      console.error('Error starting impersonation:', error);
      throw error;
    }
  }

  /**
   * End impersonation session
   */
  async endImpersonation(
    sessionId: string,
    adminUserId: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('impersonation_sessions')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('admin_user_id', adminUserId);

      // Log audit event
      await this.auditLogger.log({
        action: AuditAction.SYSTEM_ACTION,
        resourceType: 'impersonation_session',
        resourceId: sessionId,
        newValues: {
          isActive: false,
          endedAt: new Date()
        },
        success: true,
        severity: AuditSeverity.HIGH,
        metadata: {
          action: 'impersonation_ended',
          adminUserId
        }
      });
    } catch (error) {
      console.error('Error ending impersonation:', error);
      throw error;
    }
  }

  /**
   * Get active impersonation sessions
   */
  async getActiveImpersonationSessions(): Promise<ImpersonationSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('impersonation_sessions')
        .select('*')
        .eq('is_active', true)
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch impersonation sessions: ${error.message}`);
      }

      return (data || []).map(session => ({
        id: session.id,
        adminUserId: session.admin_user_id,
        targetUserId: session.target_user_id,
        reason: session.reason,
        startedAt: new Date(session.started_at),
        endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
        isActive: session.is_active,
        consentBannerShown: session.consent_banner_shown,
        actions: session.actions || []
      }));
    } catch (error) {
      console.error('Error fetching impersonation sessions:', error);
      return [];
    }
  }
}

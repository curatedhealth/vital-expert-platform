// Multi-Tenant SaaS Infrastructure Types

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  tier: SubscriptionTier;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  billing: BillingInfo;
  created: Date;
  modified: Date;
  owner: string;
  members: OrganizationMember[];
  usage: UsageMetrics;
  limits: OrganizationLimits;
}

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise' | 'custom';
export type OrganizationStatus = 'active' | 'suspended' | 'trial' | 'cancelled';

export interface OrganizationSettings {
  branding: BrandingConfig;
  security: SecurityConfig;
  integrations: IntegrationConfig;
  features: FeatureFlags;
  compliance: ComplianceSettings;
}

export interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  customCss?: string;
  customDomain?: string;
  whiteLabel: boolean;
}

export interface SecurityConfig {
  ssoEnabled: boolean;
  ssoProvider?: 'okta' | 'auth0' | 'azure_ad' | 'google';
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicy;
  ipWhitelist: string[];
  sessionTimeout: number;
  auditLogging: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays?: number;
}

export interface IntegrationConfig {
  apiKeysEnabled: boolean;
  webhooksEnabled: boolean;
  maxApiCalls: number;
  rateLimitPerMinute: number;
  allowedOrigins: string[];
}

export interface FeatureFlags {
  [featureName: string]: boolean;
}

export interface ComplianceSettings {
  hipaaEnabled: boolean;
  gdprEnabled: boolean;
  dataRetentionDays: number;
  encryptionAtRest: boolean;
  auditTrail: boolean;
}

export interface BillingInfo {
  customerId: string;
  subscriptionId: string;
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'annual';
  status: BillingStatus;
  nextBillingDate: Date;
  paymentMethod: PaymentMethod;
  invoices: Invoice[];
}

export type BillingStatus = 'active' | 'past_due' | 'cancelled' | 'unpaid';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number; // GB
  maxApiCalls: number;
  maxIntegrations: number;
}

export interface PaymentMethod {
  type: 'card' | 'bank_account' | 'invoice';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  dueDate: Date;
  paidDate?: Date;
  downloadUrl: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  permissions: Permission[];
  status: MemberStatus;
  joinedDate: Date;
  lastActive?: Date;
  invitedBy?: string;
}

export type OrganizationRole = 'owner' | 'admin' | 'developer' | 'clinical_expert' | 'viewer';
export type MemberStatus = 'active' | 'pending' | 'suspended';

export interface Permission {
  resource: string;
  actions: PermissionAction[];
  conditions?: PermissionCondition[];
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'deploy' | 'test' | 'admin';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'not_in';
  value: unknown;
}

export interface UsageMetrics {
  currentPeriod: UsagePeriod;
  historical: UsagePeriod[];
}

export interface UsagePeriod {
  startDate: Date;
  endDate: Date;
  metrics: {
    activeUsers: number;
    apiCalls: number;
    storageUsed: number; // GB
    projectsCreated: number;
    deploymentsCount: number;
    testRuns: number;
  };
}

export interface OrganizationLimits {
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxApiCalls: number;
  rateLimit: RateLimit;
  features: FeatureLimit[];
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface FeatureLimit {
  feature: string;
  limit: number;
  used: number;
}

// API Key Management
export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  key: string; // hashed
  permissions: Permission[];
  rateLimit: RateLimit;
  status: 'active' | 'revoked';
  createdBy: string;
  created: Date;
  lastUsed?: Date;
  expiresAt?: Date;
}

// Tenant Isolation Types
export interface TenantContext {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  permissions: Permission[];
  limits: OrganizationLimits;
  settings: OrganizationSettings;
}

export interface DataIsolation {
  tenantId: string;
  partitionKey: string;
  encryptionKey: string;
  accessPolicy: AccessPolicy;
}

export interface AccessPolicy {
  rules: AccessRule[];
  defaultAction: 'allow' | 'deny';
}

export interface AccessRule {
  resource: string;
  action: PermissionAction;
  condition: string;
  effect: 'allow' | 'deny';
}

// Invitation System
export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  permissions: Permission[];
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

// Audit Logging
export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata: { [key: string]: any };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: 'success' | 'failure';
  errorMessage?: string;
}

// Multi-tenant Database Schema
export interface TenantData {
  tenantId: string;
  schemaName: string;
  connectionString: string;
  encryptionConfig: EncryptionConfig;
  backupConfig: BackupConfig;
}

export interface EncryptionConfig {
  algorithm: string;
  keyId: string;
  rotationSchedule: string;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: string;
  retention: number;
  crossRegion: boolean;
}
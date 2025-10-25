// Integration Marketplace Types

export interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: IntegrationCategory;
  subcategory: string;
  provider: IntegrationProvider;
  version: string;
  status: IntegrationStatus;
  pricing: PricingModel;
  compatibility: CompatibilityInfo;
  authentication: AuthenticationConfig;
  endpoints: APIEndpoint[];
  webhooks: WebhookConfig[];
  documentation: DocumentationLinks;
  support: SupportInfo;
  ratings: RatingInfo;
  installation: InstallationConfig;
  configuration: ConfigurationSchema;
  metadata: IntegrationMetadata;
  created: Date;
  modified: Date;
}

export type IntegrationCategory =
  | 'ehr_systems'
  | 'his_systems'
  | 'laboratory_systems'
  | 'imaging_systems'
  | 'pharmacy_systems'
  | 'billing_systems'
  | 'clinical_decision_support'
  | 'patient_engagement'
  | 'telehealth'
  | 'wearables_iot'
  | 'analytics_bi'
  | 'regulatory_compliance'
  | 'cloud_services'
  | 'communication'
  | 'workflow_automation'
  | 'data_management'
  | 'security'
  | 'custom';

export interface IntegrationProvider {
  id: string;
  name: string;
  website: string;
  contactEmail: string;
  supportEmail: string;
  logo: string;
  verified: boolean;
  partnerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedDate: Date;
}

export type IntegrationStatus =
  | 'active'
  | 'beta'
  | 'deprecated'
  | 'maintenance'
  | 'coming_soon';

export interface PricingModel {
  type: 'free' | 'freemium' | 'paid' | 'enterprise' | 'usage_based';
  baseCost: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'annually' | 'per_use';
  tiers: PricingTier[];
  freeTrialDays?: number;
  setupFee?: number;
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limits: { [key: string]: number };
  description: string;
}

export interface CompatibilityInfo {
  platformVersions: string[];
  requiredFeatures: string[];
  optionalFeatures: string[];
  dependencies: Dependency[];
  conflicts: string[];
  supportedRegions: string[];
}

export interface Dependency {
  name: string;
  version: string;
  type: 'required' | 'optional';
  description: string;
}

export interface AuthenticationConfig {
  methods: AuthMethod[];
  scopes: AuthScope[];
  tokenExpiry: number;
  refreshToken: boolean;
  webhookAuth: boolean;
  ipWhitelist: boolean;
}

export interface AuthMethod {
  type: 'oauth2' | 'api_key' | 'basic_auth' | 'certificate' | 'saml' | 'jwt';
  name: string;
  description: string;
  configuration: { [key: string]: any };
  required: boolean;
}

export interface AuthScope {
  name: string;
  description: string;
  permissions: string[];
  required: boolean;
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: APIParameter[];
  requestBody?: RequestBodySchema;
  responses: APIResponse[];
  rateLimit: RateLimitConfig;
  authentication: string[];
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  location: 'query' | 'path' | 'header' | 'cookie';
  type: string;
  required: boolean;
  description: string;
  default?: any;
  validation?: ValidationRule[];
}

export interface RequestBodySchema {
  contentType: string;
  schema: JSONSchema;
  required: boolean;
  examples: unknown[];
}

export interface APIResponse {
  statusCode: number;
  description: string;
  schema?: JSONSchema;
  examples: unknown[];
  headers?: { [key: string]: string };
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  quotaReset: 'fixed' | 'sliding';
}

export interface APIExample {
  name: string;
  description: string;
  request: unknown;
  response: unknown;
  curl?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  description: string;
  events: WebhookEvent[];
  payloadSchema: JSONSchema;
  authentication: WebhookAuth;
  retryPolicy: RetryPolicy;
  examples: WebhookExample[];
}

export interface WebhookEvent {
  name: string;
  description: string;
  triggerConditions: string[];
  frequency: 'real_time' | 'batched' | 'scheduled';
}

export interface WebhookAuth {
  type: 'none' | 'signature' | 'token' | 'basic';
  configuration: { [key: string]: any };
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  retryConditions: string[];
}

export interface WebhookExample {
  event: string;
  payload: unknown;
  headers: { [key: string]: string };
}

export interface DocumentationLinks {
  apiReference: string;
  quickStart: string;
  tutorials: TutorialLink[];
  sdks: SDKLink[];
  changelog: string;
  faq: string;
}

export interface TutorialLink {
  title: string;
  description: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
}

export interface SDKLink {
  language: string;
  name: string;
  version: string;
  downloadUrl: string;
  documentationUrl: string;
}

export interface SupportInfo {
  channels: SupportChannel[];
  sla: ServiceLevelAgreement;
  knowledgeBase: string;
  communityForum: string;
}

export interface SupportChannel {
  type: 'email' | 'phone' | 'chat' | 'ticket' | 'forum';
  contact: string;
  availability: string;
  responseTime: string;
  languages: string[];
}

export interface ServiceLevelAgreement {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  resolution: {
    critical: string;
    high: string;
    medium: string;
    low: string;
  };
}

export interface RatingInfo {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  organizationId: string;
  rating: number;
  title: string;
  comment: string;
  pros: string[];
  cons: string[];
  useCases: string[];
  verified: boolean;
  helpful: number;
  created: Date;
  modified?: Date;
}

export interface InstallationConfig {
  method: InstallationMethod;
  requirements: SystemRequirement[];
  steps: InstallationStep[];
  estimatedTime: number; // minutes
  complexity: 'simple' | 'moderate' | 'complex';
  reversible: boolean;
}

export type InstallationMethod =
  | 'one_click'
  | 'guided_setup'
  | 'manual_configuration'
  | 'api_integration'
  | 'custom_deployment';

export interface SystemRequirement {
  type: 'hardware' | 'software' | 'network' | 'permissions' | 'compliance';
  name: string;
  description: string;
  required: boolean;
  version?: string;
  alternatives?: string[];
}

export interface InstallationStep {
  order: number;
  title: string;
  description: string;
  action: StepAction;
  validation: StepValidation;
  errorHandling: ErrorHandling;
  estimatedTime: number;
}

export interface StepAction {
  type: 'manual' | 'automated' | 'api_call' | 'user_input' | 'verification';
  instructions: string;
  code?: string;
  parameters?: { [key: string]: any };
}

export interface StepValidation {
  checks: ValidationCheck[];
  successMessage: string;
  failureMessage: string;
}

export interface ValidationCheck {
  type: 'api_test' | 'connection_test' | 'permission_check' | 'data_validation';
  condition: string;
  expected: unknown;
}

export interface ErrorHandling {
  commonErrors: CommonError[];
  troubleshooting: string[];
  supportContact: string;
}

export interface CommonError {
  code: string;
  message: string;
  cause: string;
  solution: string;
}

export interface ConfigurationSchema {
  schema: JSONSchema;
  uiSchema: UISchema;
  defaultValues: { [key: string]: any };
  validation: ValidationRule[];
  sections: ConfigSection[];
}

export interface JSONSchema {
  type: string;
  properties: { [key: string]: SchemaProperty };
  required: string[];
  additionalProperties: boolean;
}

export interface SchemaProperty {
  type: string;
  title: string;
  description: string;
  enum?: unknown[];
  items?: SchemaProperty;
  properties?: { [key: string]: SchemaProperty };
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: any;
}

export interface UISchema {
  [key: string]: UISchemaElement;
}

export interface UISchemaElement {
  'ui:widget'?: string;
  'ui:options'?: { [key: string]: any };
  'ui:order'?: string[];
  'ui:title'?: string;
  'ui:description'?: string;
  'ui:help'?: string;
  'ui:placeholder'?: string;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  params?: { [key: string]: any };
}

export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  fields: string[];
  required: boolean;
  collapsible: boolean;
  order: number;
}

export interface IntegrationMetadata {
  tags: string[];
  industries: string[];
  useCases: string[];
  dataTypes: string[];
  protocols: string[];
  standards: string[];
  certifications: string[];
  lastTested: Date;
  testResults: TestResult[];
}

export interface TestResult {
  type: 'functionality' | 'performance' | 'security' | 'compliance';
  status: 'passed' | 'failed' | 'warning';
  score?: number;
  details: string;
  timestamp: Date;
}

// Marketplace Management Types
export interface MarketplaceStore {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  settings: StoreSettings;
  categories: CategoryConfig[];
  featured: string[]; // integration IDs
  promoted: string[]; // integration IDs
  blocked: string[]; // integration IDs
  analytics: StoreAnalytics;
}

export interface StoreSettings {
  visibility: 'public' | 'private' | 'organization';
  approval: 'automatic' | 'manual' | 'disabled';
  allowThirdParty: boolean;
  requireTesting: boolean;
  customBranding: boolean;
  supportContact: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  visible: boolean;
  integrationCount: number;
}

export interface StoreAnalytics {
  totalIntegrations: number;
  activeInstallations: number;
  popularIntegrations: PopularIntegration[];
  categoryStats: CategoryStats[];
  installationTrends: TrendData[];
  userFeedback: FeedbackSummary;
}

export interface PopularIntegration {
  integrationId: string;
  name: string;
  installations: number;
  rating: number;
  category: string;
}

export interface CategoryStats {
  category: string;
  integrationCount: number;
  installationCount: number;
  averageRating: number;
}

export interface TrendData {
  date: Date;
  installations: number;
  uninstallations: number;
  activeUsers: number;
}

export interface FeedbackSummary {
  totalReviews: number;
  averageRating: number;
  sentimentScore: number;
  commonIssues: string[];
  topFeatureRequests: string[];
}

// Integration Instance Types
export interface IntegrationInstance {
  id: string;
  organizationId: string;
  integrationId: string;
  name: string;
  status: InstanceStatus;
  configuration: { [key: string]: any };
  credentials: EncryptedCredentials;
  settings: InstanceSettings;
  monitoring: MonitoringConfig;
  usage: UsageStats;
  health: HealthStatus;
  logs: LogEntry[];
  created: Date;
  modified: Date;
  lastSync?: Date;
}

export type InstanceStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'configuring'
  | 'testing'
  | 'suspended';

export interface EncryptedCredentials {
  keyId: string;
  encryptedData: string;
  algorithm: string;
  lastRotated: Date;
}

export interface InstanceSettings {
  autoUpdate: boolean;
  syncFrequency: number; // minutes
  retryAttempts: number;
  errorNotifications: boolean;
  loggingLevel: 'error' | 'warning' | 'info' | 'debug';
  customMappings: DataMapping[];
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  dashboardUrl?: string;
}

export interface AlertConfig {
  condition: string;
  threshold: number;
  notification: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'webhook' | 'sms' | 'slack';
  target: string;
  template?: string;
}

export interface UsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  dataTransferred: number; // bytes
  lastActivity: Date;
  dailyStats: DailyUsageStats[];
}

export interface DailyUsageStats {
  date: Date;
  calls: number;
  errors: number;
  dataTransferred: number;
  avgResponseTime: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  checks: HealthCheck[];
  lastChecked: Date;
  uptime: number; // percentage
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: Date;
  duration: number; // milliseconds
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  metadata: { [key: string]: any };
  correlationId?: string;
}

// Integration Builder Types
export interface IntegrationBuilder {
  id: string;
  name: string;
  description: string;
  template: BuilderTemplate;
  components: BuilderComponent[];
  connections: ComponentConnection[];
  testing: TestingConfig;
  deployment: DeploymentConfig;
  version: string;
  status: 'draft' | 'testing' | 'published' | 'deprecated';
}

export interface BuilderTemplate {
  type: 'rest_api' | 'graphql' | 'webhook' | 'file_transfer' | 'database' | 'message_queue';
  framework: string;
  language: string;
  runtime: string;
  dependencies: string[];
}

export interface BuilderComponent {
  id: string;
  type: ComponentType;
  name: string;
  configuration: { [key: string]: any };
  position: Position;
  connections: string[]; // connected component IDs
}

export type ComponentType =
  | 'data_source'
  | 'data_transformer'
  | 'data_validator'
  | 'api_client'
  | 'webhook_handler'
  | 'error_handler'
  | 'logger'
  | 'scheduler'
  | 'condition'
  | 'loop'
  | 'custom_code';

export interface Position {
  x: number;
  y: number;
}

export interface ComponentConnection {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'error';
  configuration?: { [key: string]: any };
}

export interface TestingConfig {
  testSuites: TestSuite[];
  mockData: MockDataSet[];
  environments: TestEnvironment[];
  automation: TestAutomation;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  setup: TestStep[];
  teardown: TestStep[];
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedResults: ExpectedResult[];
  timeout: number;
}

export interface TestStep {
  action: string;
  parameters: { [key: string]: any };
  validation?: string;
}

export interface ExpectedResult {
  condition: string;
  value: unknown;
  tolerance?: number;
}

export interface MockDataSet {
  id: string;
  name: string;
  description: string;
  data: unknown[];
  schema: JSONSchema;
}

export interface TestEnvironment {
  id: string;
  name: string;
  description: string;
  configuration: { [key: string]: any };
  isolated: boolean;
}

export interface TestAutomation {
  enabled: boolean;
  triggers: AutomationTrigger[];
  schedule: string; // cron expression
  notifications: NotificationConfig[];
}

export interface AutomationTrigger {
  event: 'code_change' | 'deployment' | 'schedule' | 'manual';
  condition?: string;
}

export interface DeploymentConfig {
  strategy: 'blue_green' | 'rolling' | 'canary' | 'immediate';
  environments: DeploymentEnvironment[];
  pipeline: DeploymentStage[];
  rollback: RollbackConfig;
}

export interface DeploymentEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production';
  configuration: { [key: string]: any };
  approvals: ApprovalConfig[];
}

export interface ApprovalConfig {
  required: boolean;
  approvers: string[];
  timeout: number; // minutes
}

export interface DeploymentStage {
  name: string;
  actions: DeploymentAction[];
  conditions: DeploymentCondition[];
  rollbackTriggers: string[];
}

export interface DeploymentAction {
  type: 'build' | 'test' | 'deploy' | 'verify' | 'notify';
  configuration: { [key: string]: any };
}

export interface DeploymentCondition {
  type: 'manual' | 'automatic' | 'time_based' | 'metric_based';
  configuration: { [key: string]: any };
}

export interface RollbackConfig {
  automatic: boolean;
  triggers: string[];
  strategy: 'previous_version' | 'specific_version' | 'custom';
  timeout: number;
}
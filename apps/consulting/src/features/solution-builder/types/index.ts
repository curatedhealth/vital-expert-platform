// Digital Health Solution Builder Types
export interface SolutionProject {
  id: string;
  name: string;
  description: string;
  type: SolutionType;
  status: ProjectStatus;
  owner: string;
  team: TeamMember[];
  createdDate: Date;
  lastModified: Date;
  version: string;
  deployments: Deployment[];
  testResults: TestResult[];
}

export type SolutionType =
  | 'digital_therapeutic'
  | 'remote_monitoring'
  | 'telemedicine_platform'
  | 'clinical_trial_platform'
  | 'patient_engagement'
  | 'decision_support'
  | 'biomarker_analytics'
  | 'disease_management';

export type ProjectStatus =
  | 'design'
  | 'development'
  | 'testing'
  | 'regulatory_review'
  | 'deployment'
  | 'maintenance'
  | 'deprecated';

export interface TeamMember {
  id: string;
  name: string;
  role: 'developer' | 'designer' | 'clinical_expert' | 'regulatory_specialist' | 'qa_engineer';
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'deploy' | 'test')[];
}

// Design Canvas Types
export interface DesignCanvas {
  id: string;
  projectId: string;
  name: string;
  components: DesignComponent[];
  connections: ComponentConnection[];
  layout: CanvasLayout;
  validationResults: ValidationResult[];
}

export interface DesignComponent {
  id: string;
  type: ComponentType;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: ComponentProperties;
  constraints: ComponentConstraint[];
  validated: boolean;
}

export type ComponentType =
  | 'data_input'
  | 'data_processor'
  | 'algorithm'
  | 'ui_component'
  | 'api_endpoint'
  | 'database'
  | 'notification_service'
  | 'integration_point'
  | 'compliance_check'
  | 'security_layer';

export interface ComponentProperties {
  [key: string]: any;
  required_fields?: string[];
  validation_rules?: ValidationRule[];
  security_requirements?: SecurityRequirement[];
  compliance_standards?: ComplianceStandard[];
}

export interface ComponentConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'data_flow' | 'api_call' | 'event_trigger' | 'dependency';
  properties: ConnectionProperties;
}

export interface ConnectionProperties {
  dataType: string;
  encryption: boolean;
  rateLimiting?: RateLimit;
  authentication: AuthenticationType;
}

// Development Framework Types
export interface DevelopmentTemplate {
  id: string;
  name: string;
  description: string;
  solutionType: SolutionType;
  framework: TechFramework;
  components: TemplateComponent[];
  dependencies: Dependency[];
  configurationOptions: ConfigOption[];
  complianceLevel: ComplianceLevel;
}

export interface TechFramework {
  frontend: 'react' | 'vue' | 'angular' | 'native_mobile';
  backend: 'node_js' | 'python' | 'java' | 'dotnet';
  database: 'postgresql' | 'mongodb' | 'mysql' | 'fhir_server';
  deployment: 'aws' | 'azure' | 'gcp' | 'on_premise';
  security: SecurityFramework;
}

export interface SecurityFramework {
  authentication: 'oauth2' | 'saml' | 'custom';
  encryption: 'aes_256' | 'rsa' | 'end_to_end';
  compliance: ComplianceStandard[];
  auditLogging: boolean;
}

export interface TemplateComponent {
  name: string;
  type: ComponentType;
  codeTemplate: string;
  testTemplate: string;
  documentation: string;
  customizable: boolean;
}

// Testing Framework Types
export interface TestSuite {
  id: string;
  projectId: string;
  name: string;
  type: TestType;
  tests: TestCase[];
  configuration: TestConfiguration;
  lastRun: Date;
  results: TestResult[];
}

export type TestType =
  | 'unit'
  | 'integration'
  | 'end_to_end'
  | 'performance'
  | 'security'
  | 'compliance'
  | 'usability'
  | 'clinical_validation';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestType;
  steps: TestStep[];
  expectedResult: ExpectedResult;
  actualResult?: ActualResult;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  environment: TestEnvironment;
}

export interface TestStep {
  id: string;
  description: string;
  action: TestAction;
  parameters: { [key: string]: any };
  validation: ValidationCriteria;
}

export interface TestAction {
  type: 'api_call' | 'ui_interaction' | 'data_validation' | 'compliance_check' | 'performance_measure';
  target: string;
  method?: string;
  payload?: any;
}

// Deployment Types
export interface Deployment {
  id: string;
  projectId: string;
  environment: DeploymentEnvironment;
  version: string;
  status: DeploymentStatus;
  deployedDate: Date;
  configuration: DeploymentConfig;
  monitoring: MonitoringConfig;
  rollbackPlan: RollbackPlan;
}

export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'clinical_trial';

export type DeploymentStatus = 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';

export interface DeploymentConfig {
  infrastructure: InfrastructureConfig;
  security: SecurityConfig;
  scaling: ScalingConfig;
  backup: BackupConfig;
  compliance: ComplianceConfig;
}

export interface InfrastructureConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'on_premise';
  region: string;
  instances: InstanceConfig[];
  networking: NetworkConfig;
  storage: StorageConfig;
}

// Validation & Compliance Types
export interface ValidationResult {
  id: string;
  componentId: string;
  type: ValidationType;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  fixable: boolean;
}

export type ValidationType =
  | 'syntax'
  | 'logic'
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'hipaa_compliance'
  | 'fda_compliance'
  | 'gdpr_compliance'
  | 'api_compatibility'
  | 'data_integrity';

export interface ComplianceStandard {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  certificationNeeded: boolean;
  auditFrequency: string;
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  implementationGuide: string;
  testCriteria: TestCriteria[];
}

// Code Generation Types
export interface CodeGenerator {
  id: string;
  name: string;
  description: string;
  inputSchema: GeneratorSchema;
  outputTemplates: CodeTemplate[];
  supportedFrameworks: TechFramework[];
  customizable: boolean;
}

export interface CodeTemplate {
  id: string;
  name: string;
  language: ProgrammingLanguage;
  framework: string;
  template: string;
  variables: TemplateVariable[];
  dependencies: string[];
}

export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'swift'
  | 'kotlin'
  | 'sql';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
}

// Monitoring & Analytics Types
export interface ProjectAnalytics {
  projectId: string;
  metrics: ProjectMetric[];
  trends: TrendAnalysis[];
  recommendations: AnalyticsRecommendation[];
  lastUpdated: Date;
}

export interface ProjectMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  threshold: AlertThreshold;
}

export interface TrendAnalysis {
  metric: string;
  timeframe: string;
  dataPoints: DataPoint[];
  prediction: PredictionModel;
  insights: string[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: { [key: string]: any };
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: SessionParticipant[];
  type: 'design_review' | 'code_review' | 'testing_session' | 'deployment_planning';
  startTime: Date;
  endTime?: Date;
  activities: CollaborationActivity[];
  decisions: SessionDecision[];
}

export interface SessionParticipant {
  userId: string;
  role: TeamMember['role'];
  joinTime: Date;
  permissions: Permission[];
  active: boolean;
}

export interface CollaborationActivity {
  id: string;
  timestamp: Date;
  userId: string;
  type: 'comment' | 'edit' | 'annotation' | 'vote' | 'decision';
  target: string;
  content: unknown;
  metadata?: { [key: string]: any };
}

// Marketplace Types
export interface SolutionTemplate {
  id: string;
  name: string;
  description: string;
  category: SolutionType;
  author: string;
  rating: number;
  downloads: number;
  price: number;
  license: LicenseType;
  components: MarketplaceComponent[];
  documentation: Documentation;
  support: SupportLevel;
}

export interface MarketplaceComponent {
  name: string;
  type: ComponentType;
  description: string;
  codeSnippet: string;
  dependencies: string[];
  configuration: ComponentConfig;
  tested: boolean;
  compliant: ComplianceStandard[];
}

// Helper Types
export interface ValidationRule {
  type: string;
  parameters: { [key: string]: any };
  errorMessage: string;
}

export interface SecurityRequirement {
  type: string;
  level: 'basic' | 'enhanced' | 'strict';
  implementation: string;
}

export type ComplianceLevel = 'basic' | 'healthcare' | 'fda_regulated' | 'enterprise';

export interface RateLimit {
  requests: number;
  timeWindow: number;
  burst: number;
}

export type AuthenticationType = 'none' | 'api_key' | 'oauth2' | 'certificate';

export interface Dependency {
  name: string;
  version: string;
  type: 'runtime' | 'build' | 'test';
  optional: boolean;
}

export interface ConfigOption {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  defaultValue: unknown;
  options?: string[];
  validation?: ValidationRule;
}

export interface CanvasLayout {
  zoom: number;
  pan: { x: number; y: number };
  gridSize: number;
  snapToGrid: boolean;
}

export interface ComponentConstraint {
  type: 'size' | 'position' | 'connection' | 'data' | 'security';
  rule: string;
  message: string;
}

export interface TestConfiguration {
  timeout: number;
  retries: number;
  parallel: boolean;
  environment: TestEnvironment;
  dataSeeding: boolean;
}

export interface TestEnvironment {
  name: string;
  url: string;
  credentials: { [key: string]: string };
  configuration: { [key: string]: any };
}

export interface ExpectedResult {
  type: 'exact' | 'range' | 'pattern' | 'condition';
  value: unknown;
  tolerance?: number;
}

export interface ActualResult {
  value: unknown;
  timestamp: Date;
  metadata: { [key: string]: any };
}

export interface ValidationCriteria {
  conditions: ValidationCondition[];
  operator: 'and' | 'or';
}

export interface ValidationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'matches';
  value: unknown;
}

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'error' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: { [key: string]: any };
}

export interface InstanceConfig {
  type: string;
  count: number;
  specifications: { [key: string]: any };
}

export interface NetworkConfig {
  vpc: string;
  subnets: string[];
  securityGroups: string[];
  loadBalancer?: LoadBalancerConfig;
}

export interface LoadBalancerConfig {
  type: 'application' | 'network';
  scheme: 'internet-facing' | 'internal';
  listeners: ListenerConfig[];
}

export interface ListenerConfig {
  port: number;
  protocol: string;
  certificates?: string[];
}

export interface StorageConfig {
  type: 'ssd' | 'hdd' | 's3' | 'blob';
  size: number;
  encrypted: boolean;
  backup: boolean;
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthConfig;
  authorization: AuthzConfig;
  monitoring: SecurityMonitoringConfig;
}

export interface EncryptionConfig {
  inTransit: boolean;
  atRest: boolean;
  keyManagement: 'aws_kms' | 'azure_keyvault' | 'custom';
}

export interface AuthConfig {
  provider: 'cognito' | 'auth0' | 'okta' | 'custom';
  multiFactorAuth: boolean;
  sessionTimeout: number;
}

export interface AuthzConfig {
  model: 'rbac' | 'abac' | 'custom';
  policies: PolicyConfig[];
}

export interface PolicyConfig {
  name: string;
  rules: PolicyRule[];
  effect: 'allow' | 'deny';
}

export interface PolicyRule {
  resource: string;
  action: string;
  condition?: string;
}

export interface SecurityMonitoringConfig {
  intrustionDetection: boolean;
  anomalyDetection: boolean;
  auditLogging: boolean;
  alerting: AlertConfig[];
}

export interface AlertConfig {
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: NotificationConfig[];
}

export interface NotificationConfig {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  target: string;
}

export interface ScalingConfig {
  autoScaling: boolean;
  minInstances: number;
  maxInstances: number;
  scalingPolicies: ScalingPolicy[];
}

export interface ScalingPolicy {
  metric: string;
  threshold: number;
  action: 'scale_up' | 'scale_down';
  cooldown: number;
}

export interface BackupConfig {
  automated: boolean;
  frequency: string;
  retention: number;
  crossRegion: boolean;
}

export interface ComplianceConfig {
  standards: ComplianceStandard[];
  auditing: AuditConfig;
  dataGovernance: DataGovernanceConfig;
}

export interface AuditConfig {
  enabled: boolean;
  logRetention: number;
  reporting: ReportingConfig;
}

export interface ReportingConfig {
  frequency: string;
  recipients: string[];
  format: 'pdf' | 'json' | 'csv';
}

export interface DataGovernanceConfig {
  dataClassification: boolean;
  dataRetention: RetentionPolicy[];
  dataPrivacy: PrivacyConfig;
}

export interface RetentionPolicy {
  dataType: string;
  retentionPeriod: number;
  archivalRules: ArchivalRule[];
}

export interface ArchivalRule {
  condition: string;
  action: 'archive' | 'delete' | 'anonymize';
  schedule: string;
}

export interface PrivacyConfig {
  piiDetection: boolean;
  dataAnonymization: boolean;
  consentManagement: boolean;
}

export interface MonitoringConfig {
  metrics: MetricConfig[];
  logging: LoggingConfig;
  alerting: AlertingConfig;
  dashboards: DashboardConfig[];
}

export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];
  aggregation: string[];
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  retention: number;
  centralized: boolean;
}

export interface AlertingConfig {
  rules: AlertRule[];
  channels: AlertChannel[];
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  configuration: { [key: string]: any };
}

export interface DashboardConfig {
  name: string;
  widgets: WidgetConfig[];
  layout: DashboardLayout;
}

export interface WidgetConfig {
  type: 'metric' | 'chart' | 'table' | 'text';
  configuration: { [key: string]: any };
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
}

export interface RollbackPlan {
  strategy: 'blue_green' | 'canary' | 'rolling' | 'immediate';
  triggers: RollbackTrigger[];
  steps: RollbackStep[];
  approval: ApprovalConfig;
}

export interface RollbackTrigger {
  condition: string;
  automatic: boolean;
  timeout: number;
}

export interface RollbackStep {
  name: string;
  action: string;
  parameters: { [key: string]: any };
  rollbackCondition: string;
}

export interface ApprovalConfig {
  required: boolean;
  approvers: string[];
  timeout: number;
}

export interface GeneratorSchema {
  properties: SchemaProperty[];
  required: string[];
  dependencies: SchemaDependency[];
}

export interface SchemaProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  validation: ValidationRule[];
  ui: UIConfig;
}

export interface UIConfig {
  type: 'input' | 'select' | 'checkbox' | 'textarea' | 'file' | 'custom';
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface SchemaDependency {
  property: string;
  dependsOn: string[];
  condition: string;
}

export interface AlertThreshold {
  warning: number;
  critical: number;
  operator: 'greater' | 'less' | 'equals';
}

export interface PredictionModel {
  algorithm: string;
  confidence: number;
  predictions: Prediction[];
}

export interface Prediction {
  timestamp: Date;
  value: number;
  confidence: number;
}

export interface AnalyticsRecommendation {
  type: 'performance' | 'security' | 'cost' | 'usability' | 'compliance';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: string;
}

export interface SessionDecision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  selectedOption: string;
  decisionDate: Date;
  decisionMaker: string;
  rationale: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  impact: ImpactAssessment;
}

export interface ImpactAssessment {
  technical: 'low' | 'medium' | 'high';
  business: 'low' | 'medium' | 'high';
  timeline: number; // in days
  resources: number; // effort in person-days
  risk: 'low' | 'medium' | 'high';
}

export type LicenseType = 'mit' | 'apache' | 'gpl' | 'commercial' | 'proprietary';

export interface Documentation {
  readme: string;
  apiDocs: string;
  tutorials: Tutorial[];
  examples: CodeExample[];
  changelog: ChangelogEntry[];
}

export interface Tutorial {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  steps: TutorialStep[];
}

export interface TutorialStep {
  title: string;
  description: string;
  code?: string;
  image?: string;
  video?: string;
}

export interface CodeExample {
  title: string;
  description: string;
  language: ProgrammingLanguage;
  code: string;
  runnable: boolean;
}

export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: ChangeEntry[];
}

export interface ChangeEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
}

export type SupportLevel = 'community' | 'basic' | 'premium' | 'enterprise';

export interface ComponentConfig {
  settings: ConfigSetting[];
  validation: ValidationRule[];
  dependencies: string[];
}

export interface ConfigSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue: unknown;
  description: string;
  options?: string[];
}

export interface TestCriteria {
  description: string;
  testMethod: string;
  acceptanceCriteria: string;
  automated: boolean;
}
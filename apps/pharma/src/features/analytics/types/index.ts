// Advanced Analytics & Reporting Types

export interface AnalyticsDashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: DashboardCategory;
  widgets: Widget[];
  layout: DashboardLayout;
  filters: FilterConfig[];
  permissions: DashboardPermission[];
  isDefault: boolean;
  created: Date;
  modified: Date;
  createdBy: string;
}

export type DashboardCategory =
  | 'business_intelligence'
  | 'clinical_metrics'
  | 'compliance_reporting'
  | 'usage_analytics'
  | 'financial_reporting'
  | 'operational_metrics'
  | 'custom';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  dataSource: DataSource;
  visualization: VisualizationConfig;
  filters: FilterConfig[];
  refreshInterval: number; // seconds
  lastUpdated?: Date;
}

export type WidgetType =
  | 'metric_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'table'
  | 'funnel'
  | 'gauge'
  | 'sankey'
  | 'treemap';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  responsive: boolean;
  breakpoints: { [key: string]: number };
}

export interface DataSource {
  id: string;
  type: DataSourceType;
  connection: DataConnection;
  query: DataQuery;
  transformation?: DataTransformation[];
  cache: CacheConfig;
}

export type DataSourceType =
  | 'database'
  | 'api'
  | 'file'
  | 'realtime_stream'
  | 'webhook'
  | 'custom_function';

export interface DataConnection {
  type: string;
  config: { [key: string]: any };
  authentication?: AuthConfig;
  timeout: number;
  retries: number;
}

export interface DataQuery {
  type: 'sql' | 'nosql' | 'graphql' | 'rest' | 'custom';
  query: string;
  parameters: QueryParameter[];
  pagination?: PaginationConfig;
}

export interface QueryParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  value: unknown;
  required: boolean;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  maxRows: number;
}

export interface DataTransformation {
  type: 'filter' | 'aggregate' | 'join' | 'pivot' | 'sort' | 'calculate' | 'format';
  config: { [key: string]: any };
  order: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  strategy: 'memory' | 'redis' | 'file';
}

export interface VisualizationConfig {
  chartOptions: ChartOptions;
  colorScheme: ColorScheme;
  legend: LegendConfig;
  axes: AxesConfig;
  formatting: FormattingOptions;
  interactions: InteractionConfig[];
}

export interface ChartOptions {
  responsive: boolean;
  animation: boolean;
  theme: string;
  customStyles?: { [key: string]: any };
}

export interface ColorScheme {
  type: 'categorical' | 'sequential' | 'diverging';
  colors: string[];
  opacity?: number;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface AxesConfig {
  x: AxisConfig;
  y: AxisConfig;
  secondary?: AxisConfig;
}

export interface AxisConfig {
  show: boolean;
  title?: string;
  scale: 'linear' | 'logarithmic' | 'time';
  min?: number;
  max?: number;
  tickFormat?: string;
  gridLines: boolean;
}

export interface FormattingOptions {
  numberFormat: string;
  dateFormat: string;
  currency: string;
  locale: string;
}

export interface InteractionConfig {
  type: 'click' | 'hover' | 'zoom' | 'brush' | 'tooltip';
  enabled: boolean;
  action: InteractionAction;
}

export interface InteractionAction {
  type: 'filter' | 'navigate' | 'highlight' | 'export' | 'custom';
  config: { [key: string]: any };
}

export interface FilterConfig {
  id: string;
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: unknown;
  options?: FilterOption[];
  required: boolean;
  visible: boolean;
}

export type FilterType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'range'
  | 'daterange'
  | 'boolean';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

export interface FilterOption {
  label: string;
  value: unknown;
}

export interface DashboardPermission {
  userId?: string;
  role?: string;
  permissions: Permission[];
}

export interface Permission {
  action: 'view' | 'edit' | 'delete' | 'share' | 'export';
  granted: boolean;
}

// Report Types
export interface Report {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  template: ReportTemplate;
  schedule: ReportSchedule;
  recipients: ReportRecipient[];
  status: ReportStatus;
  created: Date;
  modified: Date;
  createdBy: string;
  lastGenerated?: Date;
  nextGeneration?: Date;
}

export type ReportType =
  | 'dashboard_snapshot'
  | 'data_export'
  | 'compliance_report'
  | 'usage_summary'
  | 'financial_report'
  | 'custom_report';

export type ReportCategory =
  | 'regulatory'
  | 'financial'
  | 'operational'
  | 'clinical'
  | 'technical'
  | 'executive';

export interface ReportTemplate {
  id: string;
  name: string;
  format: ReportFormat;
  sections: ReportSection[];
  styling: ReportStyling;
  parameters: ReportParameter[];
}

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'custom';
  content: ReportContent;
  order: number;
}

export interface ReportContent {
  dataSource?: DataSource;
  template?: string;
  static?: any;
}

export interface ReportStyling {
  theme: string;
  fonts: FontConfig;
  colors: ColorConfig;
  layout: LayoutConfig;
  branding: BrandingConfig;
}

export interface FontConfig {
  primary: string;
  secondary: string;
  sizes: { [key: string]: number };
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface LayoutConfig {
  margins: number[];
  spacing: number;
  columnsPerRow: number;
}

export interface BrandingConfig {
  logo?: string;
  watermark?: string;
  header?: string;
  footer?: string;
}

export interface ReportParameter {
  name: string;
  type: string;
  defaultValue: unknown;
  required: boolean;
  description?: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  interval: number;
  timeOfDay?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
  startDate?: Date;
  endDate?: Date;
}

export type ScheduleFrequency =
  | 'immediate'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'custom';

export interface ReportRecipient {
  type: 'email' | 'webhook' | 'file_storage' | 'api';
  target: string;
  format: ReportFormat;
  options?: { [key: string]: any };
}

export type ReportStatus =
  | 'draft'
  | 'scheduled'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Analytics Engine Types
export interface AnalyticsEngine {
  id: string;
  name: string;
  type: EngineType;
  configuration: EngineConfig;
  capabilities: EngineCapability[];
  status: EngineStatus;
}

export type EngineType =
  | 'sql_engine'
  | 'nosql_engine'
  | 'stream_processor'
  | 'ml_engine'
  | 'graph_engine';

export interface EngineConfig {
  resources: ResourceConfig;
  performance: PerformanceConfig;
  security: SecurityConfig;
}

export interface ResourceConfig {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

export interface PerformanceConfig {
  caching: boolean;
  indexing: boolean;
  parallelization: number;
  optimization: string[];
}

export interface SecurityConfig {
  encryption: boolean;
  authentication: boolean;
  authorization: boolean;
  auditing: boolean;
}

export interface EngineCapability {
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}

export type EngineStatus =
  | 'online'
  | 'offline'
  | 'maintenance'
  | 'error';

// Data Export Types
export interface DataExport {
  id: string;
  organizationId: string;
  name: string;
  type: ExportType;
  source: ExportSource;
  format: ExportFormat;
  compression: CompressionType;
  encryption: EncryptionConfig;
  filters: FilterConfig[];
  schedule: ExportSchedule;
  destination: ExportDestination;
  status: ExportStatus;
  created: Date;
  completed?: Date;
  fileSize?: number;
  recordCount?: number;
  error?: string;
}

export type ExportType =
  | 'full_export'
  | 'incremental_export'
  | 'filtered_export'
  | 'aggregated_export';

export interface ExportSource {
  type: 'database' | 'api' | 'dashboard' | 'report';
  identifier: string;
  parameters?: { [key: string]: any };
}

export type ExportFormat =
  | 'csv'
  | 'json'
  | 'xml'
  | 'parquet'
  | 'excel'
  | 'avro';

export type CompressionType =
  | 'none'
  | 'gzip'
  | 'zip'
  | 'bzip2';

export interface EncryptionConfig {
  enabled: boolean;
  algorithm?: string;
  keyId?: string;
}

export interface ExportSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  interval: number;
  nextRun?: Date;
}

export interface ExportDestination {
  type: 'download' | 'email' | 's3' | 'ftp' | 'api_callback';
  config: { [key: string]: any };
}

export type ExportStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Business Intelligence Types
export interface BusinessIntelligence {
  insights: Insight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  alerts: Alert[];
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: InsightData;
  generated: Date;
  expiresAt?: Date;
}

export type InsightType =
  | 'trend_analysis'
  | 'anomaly_detection'
  | 'correlation'
  | 'pattern_recognition'
  | 'comparative_analysis';

export interface InsightData {
  metrics: { [key: string]: any };
  visualizations: VisualizationRef[];
  supportingData: unknown[];
}

export interface VisualizationRef {
  type: string;
  config: { [key: string]: any };
  data: unknown[];
}

export interface Prediction {
  id: string;
  model: string;
  target: string;
  value: number;
  confidence: number;
  timeframe: string;
  factors: PredictionFactor[];
  generated: Date;
}

export interface PredictionFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  impact: Impact;
  actions: RecommendedAction[];
  generated: Date;
}

export type RecommendationCategory =
  | 'performance'
  | 'cost_optimization'
  | 'security'
  | 'compliance'
  | 'user_experience'
  | 'business_growth';

export interface Impact {
  financial?: number;
  operational?: string;
  timeline?: string;
  resources?: string;
}

export interface RecommendedAction {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  timeline: string;
}

export interface Alert {
  id: string;
  rule: AlertRule;
  status: AlertStatus;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data: { [key: string]: any };
  triggered: Date;
  acknowledged?: Date;
  resolved?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  operator: string;
  timeWindow: number;
  enabled: boolean;
}

export type AlertStatus =
  | 'active'
  | 'acknowledged'
  | 'resolved'
  | 'suppressed';

// Custom Analytics Types
export interface CustomAnalytic {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: AnalyticType;
  algorithm: Algorithm;
  inputs: AnalyticInput[];
  outputs: AnalyticOutput[];
  validation: ValidationConfig;
  status: 'development' | 'testing' | 'production' | 'deprecated';
  created: Date;
  modified: Date;
  version: string;
}

export type AnalyticType =
  | 'descriptive'
  | 'diagnostic'
  | 'predictive'
  | 'prescriptive';

export interface Algorithm {
  type: 'statistical' | 'machine_learning' | 'rule_based' | 'hybrid';
  implementation: string;
  parameters: { [key: string]: any };
  training?: TrainingConfig;
}

export interface TrainingConfig {
  dataset: string;
  features: string[];
  target: string;
  method: string;
  hyperparameters: { [key: string]: any };
}

export interface AnalyticInput {
  name: string;
  type: string;
  source: string;
  transformation?: string;
  validation: InputValidation;
}

export interface InputValidation {
  required: boolean;
  format?: string;
  range?: [number, number];
  allowedValues?: unknown[];
}

export interface AnalyticOutput {
  name: string;
  type: string;
  format: string;
  description: string;
}

export interface ValidationConfig {
  rules: ValidationRule[];
  testCases: TestCase[];
  benchmarks: Benchmark[];
}

export interface ValidationRule {
  field: string;
  condition: string;
  message: string;
}

export interface TestCase {
  name: string;
  inputs: { [key: string]: any };
  expectedOutput: { [key: string]: any };
  tolerance?: number;
}

export interface Benchmark {
  metric: string;
  target: number;
  threshold: number;
}

// Usage Analytics Types
export interface UsageAnalytics {
  organizationId: string;
  period: AnalyticsPeriod;
  metrics: UsageMetrics;
  trends: UsageTrend[];
  segments: UsageSegment[];
  cohorts: CohortAnalysis[];
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface UsageMetrics {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  features: FeatureUsage[];
  performance: PerformanceMetrics;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  users: number;
  trend: number;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
}

export interface UsageTrend {
  metric: string;
  data: DataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: { [key: string]: any };
}

export interface UsageSegment {
  name: string;
  criteria: SegmentCriteria;
  size: number;
  metrics: { [key: string]: number };
}

export interface SegmentCriteria {
  filters: FilterConfig[];
  logic: 'and' | 'or';
}

export interface CohortAnalysis {
  cohort: string;
  period: string;
  retention: RetentionData[];
  revenue: RevenueData[];
}

export interface RetentionData {
  period: number;
  users: number;
  rate: number;
}

export interface RevenueData {
  period: number;
  revenue: number;
  arpu: number; // Average Revenue Per User
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  credentials: { [key: string]: string };
}
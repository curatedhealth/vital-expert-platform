// Universal Testing Framework Types
export interface TestingProtocol {
  id: string;
  name: string;
  version: string;
  type: 'clinical-trial' | 'diagnostic' | 'therapeutic' | 'safety' | 'efficacy';
  category: 'phase-i' | 'phase-ii' | 'phase-iii' | 'phase-iv' | 'post-market';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'terminated';

  // Protocol Definition
  objectives: string[];
  primaryEndpoints: Endpoint[];
  secondaryEndpoints: Endpoint[];
  inclusionCriteria: Criteria[];
  exclusionCriteria: Criteria[];

  // Study Design
  studyDesign: StudyDesign;
  blinding: 'open-label' | 'single-blind' | 'double-blind' | 'triple-blind';
  randomization: RandomizationConfig;

  // Timing and Logistics
  phases: StudyPhase[];
  timeline: Timeline;
  locations: StudyLocation[];

  // Regulatory
  regulatoryStatus: RegulatoryStatus[];
  ethics: EthicsApproval[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  principalInvestigator: string;
}

export interface Endpoint {
  id: string;
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'exploratory';
  measurementType: 'continuous' | 'categorical' | 'time-to-event' | 'binary';
  unit: string;
  timepoint: string;
  statisticalMethod: string;
}

export interface Criteria {
  id: string;
  description: string;
  type: 'inclusion' | 'exclusion';
  category: 'demographic' | 'medical-history' | 'current-condition' | 'medication' | 'laboratory';
  isCritical: boolean;
}

export interface StudyDesign {
  type: 'rct' | 'cohort' | 'case-control' | 'cross-sectional' | 'case-series';
  allocation: 'randomized' | 'non-randomized' | 'single-group';
  intervention: 'experimental' | 'active-comparator' | 'placebo' | 'no-intervention';
  masking: 'none' | 'single' | 'double' | 'triple' | 'quadruple';
  assignment: 'parallel' | 'crossover' | 'factorial' | 'single-group';
}

export interface RandomizationConfig {
  method: 'simple' | 'block' | 'stratified' | 'cluster' | 'adaptive';
  blockSize?: number;
  stratificationFactors?: string[];
  allocationRatio: string;
}

export interface StudyPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  visits: StudyVisit[];
  procedures: StudyProcedure[];
  assessments: Assessment[];
}

export interface StudyVisit {
  id: string;
  name: string;
  type: 'screening' | 'baseline' | 'treatment' | 'follow-up' | 'end-of-study';
  day: number;
  window: { before: number; after: number };
  procedures: string[];
}

export interface StudyProcedure {
  id: string;
  name: string;
  type: 'laboratory' | 'imaging' | 'questionnaire' | 'physical-exam' | 'vital-signs';
  category: string;
  instructions: string;
  frequency: string;
}

export interface Assessment {
  id: string;
  name: string;
  type: 'efficacy' | 'safety' | 'pharmacokinetic' | 'quality-of-life' | 'biomarker';
  instrument: string;
  scoring: string;
  interpretation: string;
}

export interface StudyLocation {
  id: string;
  name: string;
  type: 'site' | 'virtual' | 'home-based' | 'mobile-unit';
  address: Address;
  principalInvestigator: string;
  capacity: number;
  status: 'active' | 'inactive' | 'screening' | 'recruiting' | 'completed';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  recruitmentStart: Date;
  recruitmentEnd: Date;
  lastPatientLastVisit: Date;
  dataLockPoint: Date;
  reportDate: Date;
}

export interface RegulatoryStatus {
  authority: 'fda' | 'ema' | 'pmda' | 'hc' | 'tga' | 'other';
  type: 'ind' | 'cta' | 'ide' | 'marketing-authorization' | 'orphan-designation';
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'withdrawn';
  submissionDate: Date;
  approvalDate?: Date;
  conditions?: string[];
}

export interface EthicsApproval {
  committee: string;
  type: 'irb' | 'iec' | 'rec' | 'other';
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'expired';
  approvalDate?: Date;
  expiryDate?: Date;
  amendments?: Amendment[];
}

export interface Amendment {
  id: string;
  version: string;
  description: string;
  type: 'substantial' | 'non-substantial' | 'administrative';
  submissionDate: Date;
  approvalDate?: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

// Digital Therapeutic Trial Types
export interface DigitalTherapeuticTrial extends TestingProtocol {
  digitalComponents: DigitalComponent[];
  dataCollection: DataCollectionConfig;
  remoteMonitoring: RemoteMonitoringConfig;
  patientApp: PatientAppConfig;
  adherenceTracking: AdherenceConfig;
}

export interface DigitalComponent {
  id: string;
  name: string;
  type: 'app' | 'device' | 'platform' | 'algorithm' | 'ai-model';
  version: string;
  description: string;
  indications: string[];
  contraindications: string[];
  technicalSpecs: TechnicalSpecification[];
}

export interface TechnicalSpecification {
  parameter: string;
  value: string;
  unit?: string;
  tolerance?: string;
}

export interface DataCollectionConfig {
  sources: DataSource[];
  frequency: string;
  realTimeMonitoring: boolean;
  dataTypes: string[];
  qualityChecks: QualityCheck[];
}

export interface DataSource {
  id: string;
  name: string;
  type: 'wearable' | 'mobile-app' | 'ehr' | 'laboratory' | 'patient-reported';
  format: 'hl7-fhir' | 'json' | 'xml' | 'csv' | 'proprietary';
  frequency: string;
}

export interface QualityCheck {
  parameter: string;
  rule: string;
  action: 'flag' | 'reject' | 'query' | 'auto-correct';
}

export interface RemoteMonitoringConfig {
  enabled: boolean;
  alerts: AlertConfig[];
  dashboards: DashboardConfig[];
  notifications: NotificationConfig;
}

export interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  escalation: EscalationRule[];
}

export interface EscalationRule {
  timeDelay: number; // minutes
  recipient: string;
  method: 'email' | 'sms' | 'phone' | 'push';
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  refreshInterval: number;
  permissions: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'alert' | 'map';
  title: string;
  dataSource: string;
  configuration: Record<string, unknown>;
  position: { x: number; y: number; width: number; height: number };
}

export interface NotificationConfig {
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
  preferences: UserNotificationPreference[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app' | 'webhook';
  configuration: Record<string, unknown>;
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
  variables: string[];
}

export interface UserNotificationPreference {
  userId: string;
  channels: string[];
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  categories: string[];
}

export interface PatientAppConfig {
  features: AppFeature[];
  design: AppDesignConfig;
  integration: IntegrationConfig;
  offline: OfflineConfig;
}

export interface AppFeature {
  id: string;
  name: string;
  type: 'assessment' | 'intervention' | 'education' | 'communication' | 'tracking';
  enabled: boolean;
  configuration: Record<string, unknown>;
}

export interface AppDesignConfig {
  theme: string;
  branding: BrandingConfig;
  accessibility: AccessibilityConfig;
  localization: LocalizationConfig;
}

export interface BrandingConfig {
  logo: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

export interface AccessibilityConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  features: string[];
}

export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  rtlSupport: boolean;
}

export interface IntegrationConfig {
  ehr: EHRIntegration[];
  wearables: WearableIntegration[];
  apis: APIIntegration[];
}

export interface EHRIntegration {
  system: string;
  type: 'hl7-fhir' | 'hl7-v2' | 'cda' | 'proprietary';
  endpoints: string[];
  authentication: AuthenticationConfig;
}

export interface WearableIntegration {
  device: string;
  manufacturer: string;
  dataTypes: string[];
  syncFrequency: string;
}

export interface APIIntegration {
  name: string;
  version: string;
  baseUrl: string;
  authentication: AuthenticationConfig;
  rateLimits: RateLimit[];
}

export interface AuthenticationConfig {
  type: 'oauth2' | 'api-key' | 'jwt' | 'basic' | 'certificate';
  configuration: Record<string, unknown>;
}

export interface RateLimit {
  endpoint: string;
  limit: number;
  window: string;
}

export interface OfflineConfig {
  enabled: boolean;
  syncStrategy: 'immediate' | 'batch' | 'manual';
  storageLimit: number; // MB
  conflictResolution: 'server-wins' | 'client-wins' | 'manual' | 'timestamp';
}

export interface AdherenceConfig {
  metrics: AdherenceMetric[];
  thresholds: AdherenceThreshold[];
  interventions: AdherenceIntervention[];
}

export interface AdherenceMetric {
  id: string;
  name: string;
  type: 'medication' | 'appointment' | 'assessment' | 'exercise' | 'diet';
  calculation: string;
  unit: string;
}

export interface AdherenceThreshold {
  metric: string;
  operator: '<' | '<=' | '=' | '>=' | '>';
  value: number;
  severity: 'low' | 'medium' | 'high';
  action: string;
}

export interface AdherenceIntervention {
  id: string;
  name: string;
  trigger: string;
  type: 'reminder' | 'education' | 'counseling' | 'incentive' | 'escalation';
  configuration: Record<string, unknown>;
}

// Decentralized Clinical Trial Types
export interface DecentralizedTrial extends TestingProtocol {
  virtualComponents: VirtualComponent[];
  homeHealthConfig: HomeHealthConfig;
  mobileHealthUnits: MobileHealthUnit[];
  telehealth: TelehealthConfig;
  directToPatient: DirectToPatientConfig;
}

export interface VirtualComponent {
  id: string;
  name: string;
  type: 'e-consent' | 'remote-assessment' | 'telemedicine' | 'home-monitoring' | 'digital-biomarker';
  platform: string;
  requirements: TechnicalRequirement[];
}

export interface TechnicalRequirement {
  type: 'hardware' | 'software' | 'network' | 'skill';
  specification: string;
  mandatory: boolean;
}

export interface HomeHealthConfig {
  services: HomeHealthService[];
  providers: HealthcareProvider[];
  scheduling: SchedulingConfig;
}

export interface HomeHealthService {
  id: string;
  name: string;
  type: 'nursing' | 'phlebotomy' | 'imaging' | 'therapy' | 'monitoring';
  duration: number;
  requirements: string[];
}

export interface HealthcareProvider {
  id: string;
  name: string;
  type: 'nurse' | 'phlebotomist' | 'therapist' | 'technician' | 'physician';
  qualifications: string[];
  coverage: GeographicCoverage;
}

export interface GeographicCoverage {
  regions: string[];
  radius: number; // km
  travelTime: number; // minutes
}

export interface SchedulingConfig {
  window: TimeWindow;
  advance: number; // days
  cancellation: number; // hours
  rescheduling: boolean;
}

export interface TimeWindow {
  start: string; // HH:MM
  end: string; // HH:MM
  days: string[];
}

export interface MobileHealthUnit {
  id: string;
  name: string;
  type: 'van' | 'truck' | 'trailer' | 'container';
  equipment: Equipment[];
  capacity: number;
  route: Route;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  calibration: CalibrationRecord[];
}

export interface CalibrationRecord {
  date: Date;
  technician: string;
  results: string;
  nextDue: Date;
}

export interface Route {
  locations: RouteLocation[];
  schedule: RouteSchedule[];
  duration: number; // days
}

export interface RouteLocation {
  id: string;
  name: string;
  address: Address;
  duration: number; // hours
  capacity: number;
}

export interface RouteSchedule {
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export interface TelehealthConfig {
  platforms: TelehealthPlatform[];
  appointments: AppointmentConfig;
  documentation: DocumentationConfig;
}

export interface TelehealthPlatform {
  id: string;
  name: string;
  vendor: string;
  features: string[];
  integration: boolean;
  hipaaCompliant: boolean;
}

export interface AppointmentConfig {
  types: AppointmentType[];
  scheduling: SchedulingRule[];
  reminders: ReminderConfig[];
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  participants: string[];
  requirements: string[];
}

export interface SchedulingRule {
  type: string;
  advance: { min: number; max: number };
  duration: { min: number; max: number };
  availability: AvailabilityRule[];
}

export interface AvailabilityRule {
  role: string;
  timeZone: string;
  schedule: WeeklySchedule[];
}

export interface WeeklySchedule {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  capacity: number;
}

export interface ReminderConfig {
  enabled: boolean;
  timing: number[]; // hours before
  channels: string[];
  templates: string[];
}

export interface DocumentationConfig {
  templates: DocumentTemplate[];
  workflows: DocumentWorkflow[];
  storage: StorageConfig;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  fields: DocumentField[];
}

export interface DocumentField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'file';
  required: boolean;
  validation: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  value: unknown;
  message: string;
}

export interface DocumentWorkflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approve' | 'sign' | 'archive';
  role: string;
  timeLimit?: number; // hours
}

export interface StorageConfig {
  location: 'local' | 'cloud' | 'hybrid';
  encryption: boolean;
  backup: BackupConfig;
  retention: RetentionConfig;
}

export interface BackupConfig {
  frequency: string;
  location: string;
  encryption: boolean;
}

export interface RetentionConfig {
  duration: number; // years
  policy: 'delete' | 'archive' | 'anonymize';
}

export interface DirectToPatientConfig {
  shipping: ShippingConfig;
  inventory: InventoryConfig;
  returns: ReturnConfig;
}

export interface ShippingConfig {
  carriers: ShippingCarrier[];
  methods: ShippingMethod[];
  tracking: boolean;
  insurance: boolean;
}

export interface ShippingCarrier {
  name: string;
  services: string[];
  regions: string[];
}

export interface ShippingMethod {
  name: string;
  carrier: string;
  speed: string;
  cost: number;
  tracking: boolean;
}

export interface InventoryConfig {
  items: InventoryItem[];
  locations: InventoryLocation[];
  management: InventoryManagement;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'medication' | 'device' | 'kit' | 'supply';
  sku: string;
  description: string;
  specifications: Record<string, unknown>;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'pharmacy' | 'depot';
  address: Address;
  capacity: number;
}

export interface InventoryManagement {
  tracking: 'lot' | 'serial' | 'expiry' | 'all';
  reorderPoint: number;
  reorderQuantity: number;
  alerts: InventoryAlert[];
}

export interface InventoryAlert {
  type: 'low-stock' | 'expiry' | 'recall' | 'damage';
  threshold: number;
  recipients: string[];
}

export interface ReturnConfig {
  policy: ReturnPolicy;
  process: ReturnProcess[];
  disposal: DisposalConfig;
}

export interface ReturnPolicy {
  timeLimit: number; // days
  conditions: string[];
  refund: boolean;
}

export interface ReturnProcess {
  step: number;
  description: string;
  responsible: string;
  timeLimit?: number; // hours
}

export interface DisposalConfig {
  method: 'incineration' | 'autoclaving' | 'chemical' | 'return-to-manufacturer';
  vendor: string;
  documentation: boolean;
}
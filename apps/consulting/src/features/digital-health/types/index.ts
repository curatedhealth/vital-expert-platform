// Enhanced Phase 4: Digital Health Types
export interface DigitalHealthEcosystem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: Date;
  metrics: EcosystemMetrics;
}

export interface EcosystemMetrics {
  totalPatients: number;
  activeProviders: number;
  dtxPrescriptions: number;
  telemedicineVisits: number;
  clinicalTrials: number;
  satisfactionScore: number;
  uptimePercentage: number;
}

// Digital Therapeutics Types
export interface DigitalTherapeutic {
  id: string;
  name: string;
  fdaClearanceNumber?: string;
  category: DTxCategory;
  indication: string;
  dosing: DTxDosing;
  status: 'approved' | 'investigational' | 'cleared' | 'pending';
  evidenceLevel: 'A' | 'B' | 'C';
  manufacturer: string;
  lastUpdated: Date;
}

export type DTxCategory =
  | 'cognitive_behavioral_therapy'
  | 'addiction_management'
  | 'mental_health'
  | 'chronic_pain'
  | 'diabetes_management'
  | 'hypertension_control'
  | 'respiratory_disease'
  | 'cardiovascular_rehab'
  | 'pre_diabetes'
  | 'smoking_cessation'
  | 'weight_management'
  | 'sleep_disorders';

export interface DTxDosing {
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  duration: number; // in weeks
  adherenceRequirement: number; // percentage
  sessionLength?: number; // in minutes
}

export interface DTxPrescription {
  id: string;
  patientId: string;
  providerId: string;
  dtxId: string;
  prescribedDate: Date;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'discontinued' | 'paused';
  adherence: number;
  outcomes: DTxOutcome[];
  notes: string;
}

export interface DTxOutcome {
  id: string;
  metric: string;
  baseline: number;
  current: number;
  target: number;
  unit: string;
  assessmentDate: Date;
  trend: 'improving' | 'stable' | 'declining';
}

// Remote Patient Monitoring Types
export interface RemoteMonitoringDevice {
  id: string;
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  patientId: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastReading: Date;
  batteryLevel?: number;
  connectivity: 'bluetooth' | 'wifi' | 'cellular' | 'zigbee';
}

export type DeviceType =
  | 'blood_pressure_cuff'
  | 'glucose_meter'
  | 'pulse_oximeter'
  | 'smart_scale'
  | 'heart_rate_monitor'
  | 'activity_tracker'
  | 'continuous_glucose_monitor'
  | 'cardiac_monitor'
  | 'spirometer'
  | 'thermometer'
  | 'smart_inhaler';

export interface VitalReading {
  id: string;
  patientId: string;
  deviceId: string;
  type: VitalType;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  flags: VitalFlag[];
  location?: 'home' | 'clinic' | 'hospital' | 'mobile';
}

export type VitalType =
  | 'heart_rate'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'oxygen_saturation'
  | 'blood_glucose'
  | 'weight'
  | 'temperature'
  | 'respiratory_rate'
  | 'peak_flow'
  | 'step_count'
  | 'sleep_duration';

export interface VitalFlag {
  type: 'critical' | 'warning' | 'info';
  message: string;
  actionRequired: boolean;
  escalated: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// Telemedicine Types
export interface TelemedicineSession {
  id: string;
  patientId: string;
  providerId: string;
  scheduledDate: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'routine' | 'follow_up' | 'urgent' | 'consultation';
  platform: 'zoom' | 'webex' | 'teams' | 'custom';
  quality: SessionQuality;
  notes: string;
  prescriptions: string[];
  followUpRequired: boolean;
}

export interface SessionQuality {
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  connectionStability: 'stable' | 'intermittent' | 'unstable';
  overallRating: number; // 1-5 scale
}

// Decentralized Clinical Trial Types
export interface DecentralizedTrial {
  id: string;
  title: string;
  sponsor: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  indication: string;
  status: 'recruiting' | 'active' | 'completed' | 'terminated' | 'suspended';
  virtualComponents: VirtualComponent[];
  enrollmentTarget: number;
  currentEnrollment: number;
  retentionRate: number;
  startDate: Date;
  estimatedCompletionDate: Date;
}

export interface VirtualComponent {
  type: 'virtual_visits' | 'remote_monitoring' | 'ecoa' | 'home_health' | 'direct_to_patient';
  description: string;
  frequency: string;
  required: boolean;
  technology: string;
}

export interface VirtualEnrollment {
  id: string;
  trialId: string;
  patientId: string;
  enrollmentDate: Date;
  status: 'screened' | 'consented' | 'enrolled' | 'active' | 'completed' | 'withdrawn';
  consentMethod: 'electronic' | 'video' | 'in_person';
  baselineCompleted: boolean;
  complianceScore: number;
  nextVisit?: Date;
}

// Digital Biomarker Types
export interface DigitalBiomarker {
  id: string;
  name: string;
  category: BiomarkerCategory;
  source: BiomarkerSource;
  algorithm: string;
  validationLevel: 'analytical' | 'clinical' | 'regulatory';
  clinicalEvidence: EvidenceLevel;
  measuringDevice: string[];
  samplingFrequency: string;
  dataType: 'continuous' | 'periodic' | 'event_driven';
}

export type BiomarkerCategory =
  | 'activity_mobility'
  | 'physiological_signals'
  | 'cognitive_behavioral'
  | 'environmental_context'
  | 'speech_voice'
  | 'digital_behavior';

export type BiomarkerSource =
  | 'wearables'
  | 'smartphone'
  | 'ambient_sensors'
  | 'medical_devices'
  | 'smart_home'
  | 'vehicle_sensors';

export type EvidenceLevel = 'high' | 'moderate' | 'low' | 'emerging';

export interface BiomarkerReading {
  id: string;
  biomarkerId: string;
  patientId: string;
  value: number | string | object;
  timestamp: Date;
  confidence: number;
  context: BiomarkerContext;
  anomalyScore?: number;
  interpretation: 'normal' | 'abnormal' | 'borderline' | 'indeterminate';
}

export interface BiomarkerContext {
  location: string;
  activity: string;
  environment: string;
  medication: string[];
  symptoms: string[];
}

// Disease Management Types
export interface DiseaseManagementProgram {
  id: string;
  name: string;
  condition: ChronicCondition;
  objectives: string[];
  interventions: Intervention[];
  targetPopulation: string;
  duration: number; // in months
  successMetrics: SuccessMetric[];
  status: 'active' | 'pilot' | 'completed' | 'paused';
}

export type ChronicCondition =
  | 'diabetes_t1'
  | 'diabetes_t2'
  | 'hypertension'
  | 'heart_failure'
  | 'copd'
  | 'asthma'
  | 'depression'
  | 'anxiety'
  | 'chronic_kidney_disease'
  | 'obesity'
  | 'osteoporosis';

export interface Intervention {
  type: 'educational' | 'behavioral' | 'medication' | 'monitoring' | 'coaching';
  description: string;
  frequency: string;
  delivery: 'app' | 'sms' | 'email' | 'call' | 'video' | 'in_person';
  personalized: boolean;
  triggers: string[];
}

export interface SuccessMetric {
  name: string;
  target: number;
  unit: string;
  currentValue: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

// Clinical Provider Dashboard Types
export interface ProviderDashboard {
  providerId: string;
  patientPanelSize: number;
  activeMonitoring: number;
  pendingAlerts: Alert[];
  todaysAppointments: TelemedicineSession[];
  dtxPrescriptions: DTxPrescription[];
  recentVitals: VitalReading[];
  qualityMetrics: QualityMetric[];
}

export interface Alert {
  id: string;
  patientId: string;
  type: 'critical' | 'warning' | 'info';
  source: 'vitals' | 'medication' | 'appointment' | 'dtx' | 'device';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  escalated: boolean;
  actionTaken?: string;
}

export interface QualityMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  benchmark: number;
  trend: 'up' | 'down' | 'stable';
}

// Integration Types
export interface SystemIntegration {
  id: string;
  name: string;
  type: 'EHR' | 'pharmacy' | 'lab' | 'imaging' | 'device' | 'payer';
  vendor: string;
  standard: 'FHIR' | 'HL7' | 'DICOM' | 'proprietary';
  status: 'active' | 'testing' | 'inactive' | 'error';
  lastSync: Date;
  dataFlowRate: number;
  errorRate: number;
}

// Analytics Types
export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'population_health' | 'clinical_outcomes' | 'utilization' | 'quality' | 'cost';
  timeframe: string;
  data: AnalyticsData[];
  insights: string[];
  recommendations: string[];
  generatedDate: Date;
}

export interface AnalyticsData {
  metric: string;
  value: number;
  comparison: number;
  trend: 'improving' | 'stable' | 'declining';
  significance: 'high' | 'medium' | 'low';
}
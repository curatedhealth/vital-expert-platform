'use client';

import { motion } from 'framer-motion';
import {
  Smartphone,
  Activity,
  Heart,
  Shield,
  Zap,
  Users,
  BarChart3,
  Settings,
  Play,
  Bell,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Database,
  Wifi,
  Target
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { DigitalTherapeuticTrial } from '../../types';

interface DigitalTherapeuticPlatformProps {
  className?: string;
}

interface DTxMetrics {
  activeTrials: number;
  totalPatients: number;
  averageAdherence: number;
  dataPointsCollected: number;
  alertsTriggered: number;
  interventionsDelivered: number;
}

interface PatientEngagement {
  appUsage: number;
  adherenceRate: number;
  satisfactionScore: number;
  completionRate: number;
}

const DigitalTherapeuticPlatform: React.FC<DigitalTherapeuticPlatformProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trials' | 'monitoring' | 'interventions' | 'analytics'>('overview');
  const [dtxTrials, setDtxTrials] = useState<DigitalTherapeuticTrial[]>([]);
  const [metrics, setMetrics] = useState<DTxMetrics>({
    activeTrials: 0,
    totalPatients: 0,
    averageAdherence: 0,
    dataPointsCollected: 0,
    alertsTriggered: 0,
    interventionsDelivered: 0
  });
  const [engagement, setEngagement] = useState<PatientEngagement>({
    appUsage: 0,
    adherenceRate: 0,
    satisfactionScore: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState<unknown[]>([]);

  useEffect(() => {
    loadDTxData();

    return () => clearInterval(interval);
  }, []);

    try {
      setLoading(true);

      // Simulate loading DTx data
      setTimeout(() => {
        const mockDTxTrials: DigitalTherapeuticTrial[] = [
          {
            id: 'dtx-001',
            name: 'Diabetes Management DTx Trial',
            version: '2.1',
            type: 'therapeutic',
            category: 'phase-iii',
            status: 'active',
            objectives: ['Improve glycemic control', 'Enhance medication adherence', 'Reduce hospital readmissions'],
            primaryEndpoints: [
              {
                id: 'ep-001',
                name: 'HbA1c Reduction',
                description: 'Change in HbA1c from baseline to week 24',
                type: 'primary',
                measurementType: 'continuous',
                unit: '%',
                timepoint: 'Week 24',
                statisticalMethod: 'Mixed Model Repeated Measures'
              }
            ],
            secondaryEndpoints: [
              {
                id: 'ep-002',
                name: 'Medication Adherence',
                description: 'Proportion of days covered by medication',
                type: 'secondary',
                measurementType: 'continuous',
                unit: '%',
                timepoint: 'Week 24',
                statisticalMethod: 'ANCOVA'
              }
            ],
            inclusionCriteria: [
              {
                id: 'inc-001',
                description: 'Type 2 Diabetes Mellitus diagnosis',
                type: 'inclusion',
                category: 'current-condition',
                isCritical: true
              },
              {
                id: 'inc-002',
                description: 'HbA1c 7.0-11.0%',
                type: 'inclusion',
                category: 'laboratory',
                isCritical: true
              }
            ],
            exclusionCriteria: [
              {
                id: 'exc-001',
                description: 'Type 1 Diabetes',
                type: 'exclusion',
                category: 'medical-history',
                isCritical: true
              }
            ],
            studyDesign: {
              type: 'rct',
              allocation: 'randomized',
              intervention: 'experimental',
              masking: 'single',
              assignment: 'parallel'
            },
            blinding: 'single-blind',
            randomization: {
              method: 'stratified',
              stratificationFactors: ['baseline_hba1c', 'age_group'],
              allocationRatio: '1:1'
            },
            phases: [
              {
                id: 'phase-001',
                name: 'Digital Onboarding',
                description: 'Patient app setup and baseline data collection',
                duration: 14,
                visits: [
                  {
                    id: 'visit-001',
                    name: 'Virtual Enrollment',
                    type: 'baseline',
                    day: 0,
                    window: { before: 0, after: 3 },
                    procedures: ['e-consent', 'app-setup', 'baseline-assessment']
                  }
                ],
                procedures: [
                  {
                    id: 'proc-001',
                    name: 'Digital Consent',
                    type: 'questionnaire',
                    category: 'regulatory',
                    instructions: 'Electronic informed consent via mobile app',
                    frequency: 'once'
                  }
                ],
                assessments: [
                  {
                    id: 'assess-001',
                    name: 'Digital Biomarker Collection',
                    type: 'biomarker',
                    instrument: 'Continuous Glucose Monitor + Mobile App',
                    scoring: 'Automated real-time',
                    interpretation: 'AI-powered glucose pattern analysis'
                  }
                ]
              }
            ],
            timeline: {
              startDate: new Date('2024-03-01'),
              endDate: new Date('2024-12-31'),
              recruitmentStart: new Date('2024-03-15'),
              recruitmentEnd: new Date('2024-09-15'),
              lastPatientLastVisit: new Date('2024-12-15'),
              dataLockPoint: new Date('2024-12-20'),
              reportDate: new Date('2024-12-31')
            },
            locations: [
              {
                id: 'loc-001',
                name: 'Virtual Site - North America',
                type: 'virtual',
                address: {
                  street: 'Cloud Infrastructure',
                  city: 'Virtual',
                  state: 'Global',
                  zipCode: '00000',
                  country: 'Multi-national'
                },
                principalInvestigator: 'Dr. Emma Thompson',
                capacity: 500,
                status: 'recruiting'
              }
            ],
            regulatoryStatus: [
              {
                authority: 'fda',
                type: 'ide',
                status: 'approved',
                submissionDate: new Date('2024-01-15'),
                approvalDate: new Date('2024-02-28'),
                conditions: ['Quarterly safety reports', 'Real-time adverse event reporting']
              }
            ],
            ethics: [
              {
                committee: 'Digital Health IRB',
                type: 'irb',
                status: 'approved',
                approvalDate: new Date('2024-02-15'),
                expiryDate: new Date('2025-02-15'),
                amendments: []
              }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-03-10'),
            createdBy: 'Dr. Sarah Chen',
            principalInvestigator: 'Dr. Emma Thompson',

            // DTx-specific properties
            digitalComponents: [
              {
                id: 'dtx-comp-001',
                name: 'VITAL Path Diabetes Manager',
                type: 'app',
                version: '3.2.1',
                description: 'Comprehensive diabetes management mobile application',
                indications: ['Type 2 Diabetes Mellitus', 'Prediabetes'],
                contraindications: ['Type 1 Diabetes', 'Severe cognitive impairment'],
                technicalSpecs: [
                  {
                    parameter: 'Platform Compatibility',
                    value: 'iOS 14.0+, Android 8.0+',
                    unit: 'OS Version'
                  },
                  {
                    parameter: 'Data Transmission',
                    value: 'Real-time',
                    unit: 'Frequency'
                  },
                  {
                    parameter: 'Offline Capability',
                    value: '72 hours',
                    unit: 'Duration'
                  }
                ]
              },
              {
                id: 'dtx-comp-002',
                name: 'Continuous Glucose Monitor Integration',
                type: 'device',
                version: '1.5.0',
                description: 'FDA-approved CGM with real-time data streaming',
                indications: ['Diabetes monitoring', 'Glucose trend analysis'],
                contraindications: ['MRI incompatible', 'Severe skin allergies'],
                technicalSpecs: [
                  {
                    parameter: 'Measurement Range',
                    value: '40-400',
                    unit: 'mg/dL'
                  },
                  {
                    parameter: 'Accuracy',
                    value: '±15',
                    unit: '% or mg/dL'
                  }
                ]
              }
            ],

            dataCollection: {
              sources: [
                {
                  id: 'source-001',
                  name: 'VITAL Path Mobile App',
                  type: 'mobile-app',
                  format: 'json',
                  frequency: 'real-time'
                },
                {
                  id: 'source-002',
                  name: 'Continuous Glucose Monitor',
                  type: 'wearable',
                  format: 'hl7-fhir',
                  frequency: 'every-minute'
                },
                {
                  id: 'source-003',
                  name: 'Patient Reported Outcomes',
                  type: 'patient-reported',
                  format: 'json',
                  frequency: 'daily'
                }
              ],
              frequency: 'continuous',
              realTimeMonitoring: true,
              dataTypes: ['glucose-levels', 'medication-adherence', 'physical-activity', 'sleep-quality', 'mood', 'symptoms'],
              qualityChecks: [
                {
                  parameter: 'glucose-reading',
                  rule: 'between 40 and 400 mg/dL',
                  action: 'flag'
                },
                {
                  parameter: 'data-completeness',
                  rule: 'minimum 70% daily coverage',
                  action: 'query'
                }
              ]
            },

            remoteMonitoring: {
              enabled: true,
              alerts: [
                {
                  id: 'alert-001',
                  name: 'Severe Hypoglycemia',
                  condition: 'glucose < 54 mg/dL for > 15 minutes',
                  severity: 'critical',
                  recipients: ['clinical-team@vitalpath.com', 'emergency-contact'],
                  escalation: [
                    {
                      timeDelay: 5,
                      recipient: 'emergency-services',
                      method: 'phone'
                    }
                  ]
                },
                {
                  id: 'alert-002',
                  name: 'Poor Medication Adherence',
                  condition: 'adherence < 80% for 3 consecutive days',
                  severity: 'medium',
                  recipients: ['care-team@vitalpath.com'],
                  escalation: [
                    {
                      timeDelay: 60,
                      recipient: 'clinical-pharmacist',
                      method: 'email'
                    }
                  ]
                }
              ],
              dashboards: [
                {
                  id: 'dash-001',
                  name: 'Real-Time Patient Dashboard',
                  widgets: [
                    {
                      id: 'widget-001',
                      type: 'chart',
                      title: 'Glucose Trends',
                      dataSource: 'cgm-data',
                      configuration: { chartType: 'line', timeRange: '24h', thresholds: [70, 180] },
                      position: { x: 0, y: 0, width: 8, height: 4 }
                    },
                    {
                      id: 'widget-002',
                      type: 'metric',
                      title: 'Time in Range',
                      dataSource: 'glucose-analytics',
                      configuration: { target: 70, format: 'percentage' },
                      position: { x: 8, y: 0, width: 4, height: 2 }
                    }
                  ],
                  refreshInterval: 60,
                  permissions: ['clinical-team', 'investigators', 'data-monitors']
                }
              ],
              notifications: {
                channels: [
                  {
                    type: 'push',
                    configuration: { service: 'firebase', priority: 'high' },
                    enabled: true
                  },
                  {
                    type: 'sms',
                    configuration: { provider: 'twilio', shortCode: '88888' },
                    enabled: true
                  }
                ],
                templates: [
                  {
                    id: 'template-001',
                    name: 'Hypoglycemia Alert',
                    channel: 'push',
                    subject: 'Low Glucose Alert',
                    body: 'Your glucose is {{glucoseValue}} mg/dL. Please take action immediately.',
                    variables: ['glucoseValue', 'timestamp', 'patientName']
                  }
                ],
                preferences: [
                  {
                    userId: 'patient-001',
                    channels: ['push', 'sms'],
                    frequency: 'real-time',
                    categories: ['critical', 'high', 'medium']
                  }
                ]
              }
            },

            patientApp: {
              features: [
                {
                  id: 'feature-001',
                  name: 'Glucose Monitoring',
                  type: 'tracking',
                  enabled: true,
                  configuration: {
                    autoSync: true,
                    alertThresholds: { low: 70, high: 180 },
                    trendAlerts: true
                  }
                },
                {
                  id: 'feature-002',
                  name: 'Medication Reminders',
                  type: 'intervention',
                  enabled: true,
                  configuration: {
                    reminderTimes: ['08:00', '20:00'],
                    snoozeOptions: [5, 15, 30],
                    escalationEnabled: true
                  }
                },
                {
                  id: 'feature-003',
                  name: 'Lifestyle Coaching',
                  type: 'education',
                  enabled: true,
                  configuration: {
                    personalizedContent: true,
                    adaptiveLearning: true,
                    gamification: true
                  }
                }
              ],
              design: {
                theme: 'diabetes-focused',
                branding: {
                  logo: '/assets/vital-path-diabetes-logo.png',
                  colors: {
                    primary: '#2563eb',
                    secondary: '#64748b',
                    success: '#16a34a',
                    warning: '#eab308',
                    danger: '#dc2626'
                  },
                  fonts: { primary: 'Inter', secondary: 'system-ui' }
                },
                accessibility: {
                  wcagLevel: 'AA',
                  features: ['voice-navigation', 'high-contrast', 'large-text', 'glucose-color-coding']
                },
                localization: {
                  defaultLanguage: 'en',
                  supportedLanguages: ['en', 'es', 'fr'],
                  rtlSupport: false
                }
              },
              integration: {
                ehr: [
                  {
                    system: 'Epic MyChart',
                    type: 'hl7-fhir',
                    endpoints: ['https://fhir.epic.com/interconnect-fhir-oauth'],
                    authentication: {
                      type: 'oauth2',
                      configuration: {
                        clientId: 'vital-path-diabetes',
                        scope: ['patient/*.read', 'patient/*.write']
                      }
                    }
                  }
                ],
                wearables: [
                  {
                    device: 'Dexcom G7',
                    manufacturer: 'Dexcom',
                    dataTypes: ['glucose', 'trends', 'alerts'],
                    syncFrequency: 'real-time'
                  },
                  {
                    device: 'Apple Watch',
                    manufacturer: 'Apple',
                    dataTypes: ['activity', 'heart-rate', 'sleep'],
                    syncFrequency: 'hourly'
                  }
                ],
                apis: [
                  {
                    name: 'VITAL Path Clinical API',
                    version: 'v2',
                    baseUrl: 'https://api.vitalpath.com/v2',
                    authentication: {
                      type: 'jwt',
                      configuration: { issuer: 'vitalpath-auth', audience: 'clinical-trial' }
                    },
                    rateLimits: [
                      {
                        endpoint: '/glucose-data',
                        limit: 1000,
                        window: '1h'
                      }
                    ]
                  }
                ]
              },
              offline: {
                enabled: true,
                syncStrategy: 'immediate',
                storageLimit: 500,
                conflictResolution: 'timestamp'
              }
            },

            adherenceTracking: {
              metrics: [
                {
                  id: 'adh-001',
                  name: 'Medication Adherence',
                  type: 'medication',
                  calculation: '(doses_taken / doses_prescribed) * 100',
                  unit: '%'
                },
                {
                  id: 'adh-002',
                  name: 'App Engagement',
                  type: 'assessment',
                  calculation: '(days_active / total_days) * 100',
                  unit: '%'
                },
                {
                  id: 'adh-003',
                  name: 'CGM Wear Time',
                  type: 'appointment',
                  calculation: '(hours_worn / total_hours) * 100',
                  unit: '%'
                }
              ],
              thresholds: [
                {
                  metric: 'medication-adherence',
                  operator: '<',
                  value: 80,
                  severity: 'high',
                  action: 'trigger-intervention'
                },
                {
                  metric: 'app-engagement',
                  operator: '<',
                  value: 50,
                  severity: 'medium',
                  action: 'send-reminder'
                }
              ],
              interventions: [
                {
                  id: 'int-001',
                  name: 'Personalized Medication Reminder',
                  trigger: 'low-medication-adherence',
                  type: 'reminder',
                  configuration: {
                    frequency: 'adaptive',
                    method: 'push-notification',
                    personalization: 'ml-optimized'
                  }
                },
                {
                  id: 'int-002',
                  name: 'Educational Content Delivery',
                  trigger: 'low-app-engagement',
                  type: 'education',
                  configuration: {
                    contentType: 'interactive',
                    difficulty: 'adaptive',
                    gamification: true
                  }
                }
              ]
            }
          }
        ];

        setDtxTrials(mockDTxTrials);
        setMetrics({
          activeTrials: mockDTxTrials.length,
          totalPatients: 847,
          averageAdherence: 84.2,
          dataPointsCollected: 2845920,
          alertsTriggered: 156,
          interventionsDelivered: 3420
        });
        setEngagement({
          appUsage: 76.8,
          adherenceRate: 84.2,
          satisfactionScore: 4.3,
          completionRate: 91.5
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading DTx data:', error);
      setLoading(false);
    }
  };

    // Simulate real-time data updates

      timestamp: new Date(),
      glucoseReading: Math.floor(Math.random() * 200) + 80,
      adherenceRate: Math.random() * 100,
      appEngagement: Math.random() * 100
    };
    setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Therapeutic Platform</h1>
          <p className="text-gray-600 mt-2">Advanced DTx trial management and patient monitoring</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Play className="h-4 w-4 mr-2" />
            Start Trial
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active DTx Trials</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.activeTrials}</p>
            </div>
            <Smartphone className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalPatients.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Adherence</p>
              <p className="text-2xl font-bold text-green-600">{metrics.averageAdherence}%</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-teal-600">{(metrics.dataPointsCollected / 1000000).toFixed(1)}M</p>
            </div>
            <Database className="h-8 w-8 text-teal-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alerts Triggered</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.alertsTriggered}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interventions</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.interventionsDelivered.toLocaleString()}</p>
            </div>
            <Zap className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Platform Overview', icon: BarChart3 },
            { key: 'trials', label: 'DTx Trials', icon: Smartphone },
            { key: 'monitoring', label: 'Real-time Monitoring', icon: Activity },
            { key: 'interventions', label: 'Smart Interventions', icon: Zap },
            { key: 'analytics', label: 'Advanced Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as unknown)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Platform Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DTx Platform Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">FDA-compliant DTx infrastructure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Real-time patient monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">AI-powered interventions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">Digital biomarker collection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Wifi className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">Multi-device integration</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Engagement Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">App Usage Rate</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${engagement.appUsage}%`}}></div>
                    </div>
                    <span className="font-medium">{engagement.appUsage}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Adherence Rate</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${engagement.adherenceRate}%`}}></div>
                    </div>
                    <span className="font-medium">{engagement.adherenceRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Satisfaction Score</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(engagement.satisfactionScore) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <span className="ml-2 font-medium">{engagement.satisfactionScore}/5</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${engagement.completionRate}%`}}></div>
                    </div>
                    <span className="font-medium">{engagement.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
            <div className="space-y-3">
              {[
                { type: 'success', message: 'Patient DTX-2847 achieved 95% medication adherence this week', time: '5 minutes ago' },
                { type: 'warning', message: 'Low glucose alert triggered for 3 patients in DTX-001 trial', time: '12 minutes ago' },
                { type: 'info', message: 'New digital biomarker pattern detected in diabetes cohort', time: '1 hour ago' },
                { type: 'success', message: 'AI intervention successfully improved adherence for 15 patients', time: '2 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {activity.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                  {activity.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {activity.type === 'info' && <Activity className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trials' && (
        <div className="space-y-6">
          {dtxTrials.map((trial) => (
            <div key={trial.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{trial.name}</h3>
                  <p className="text-gray-600 mt-1">Version {trial.version} • {trial.type} • {trial.category}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trial.status === 'active' ? 'bg-green-100 text-green-800' :
                    trial.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trial.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">Digital Components</span>
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-900">{trial.digitalComponents.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">Data Sources</span>
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-900">{trial.dataCollection.sources.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600 font-medium">Active Alerts</span>
                    <Bell className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-purple-900">{trial.remoteMonitoring.alerts.length}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-600 font-medium">App Features</span>
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-900">{trial.patientApp.features.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Digital Components</h4>
                  <div className="space-y-2">
                    {trial.digitalComponents.map((component) => (
                      <div key={component.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded">
                            {component.type === 'app' ? <Smartphone className="h-4 w-4 text-blue-600" /> :
                             component.type === 'device' ? <Heart className="h-4 w-4 text-red-600" /> :
                             <Activity className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{component.name}</p>
                            <p className="text-sm text-gray-600">v{component.version}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Monitoring Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Real-time Monitoring</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trial.remoteMonitoring.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trial.remoteMonitoring.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Alert Conditions</span>
                      <span className="text-sm font-medium text-gray-900">{trial.remoteMonitoring.alerts.length} configured</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dashboard Widgets</span>
                      <span className="text-sm font-medium text-gray-900">
                        {trial.remoteMonitoring.dashboards.reduce((total, dashboard) => total + dashboard.widgets.length, 0)} active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Offline Support</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trial.patientApp.offline.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trial.patientApp.offline.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  View Details
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Monitor Patients
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional tabs would be implemented similarly with monitoring, interventions, and analytics content */}
    </div>
  );
};

export default DigitalTherapeuticPlatform;
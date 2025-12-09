// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import {
  FlaskConical,
  Shield,
  Activity,
  Clock,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Upload,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  BarChart3,
  Globe,
  Smartphone,
  Stethoscope
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { TestingProtocol, DigitalTherapeuticTrial, DecentralizedTrial } from '../../types';

interface UniversalTestingPlatformProps {
  className?: string;
}

interface TestingDashboardStats {
  totalProtocols: number;
  activeTrials: number;
  completedTrials: number;
  participantsEnrolled: number;
  digitalTrials: number;
  decentralizedTrials: number;
}

const UniversalTestingPlatform: React.FC<UniversalTestingPlatformProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'protocols' | 'trials' | 'participants' | 'analytics'>('overview');
  const [protocols, setProtocols] = useState<TestingProtocol[]>([]);
  const [digitalTrials, setDigitalTrials] = useState<DigitalTherapeuticTrial[]>([]);
  const [decentralizedTrials, setDecentralizedTrials] = useState<DecentralizedTrial[]>([]);
  const [stats, setStats] = useState<TestingDashboardStats>({
    totalProtocols: 0,
    activeTrials: 0,
    completedTrials: 0,
    participantsEnrolled: 0,
    digitalTrials: 0,
    decentralizedTrials: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProtocolType, setSelectedProtocolType] = useState<'all' | 'clinical-trial' | 'diagnostic' | 'therapeutic'>('all');

  useEffect(() => {
    loadTestingData();
  }, []);

    try {
      setLoading(true);

      // Simulate loading testing protocols and trials
      setTimeout(() => {
        const mockProtocols: TestingProtocol[] = [
          {
            id: 'proto-001',
            name: 'Digital Biomarker Validation Study',
            version: '1.2',
            type: 'diagnostic',
            category: 'phase-ii',
            status: 'active',
            objectives: ['Validate digital biomarkers for early detection', 'Establish reference ranges'],
            primaryEndpoints: [
              {
                id: 'ep-001',
                name: 'Sensitivity',
                description: 'Diagnostic sensitivity of digital biomarker',
                type: 'primary',
                measurementType: 'continuous',
                unit: '%',
                timepoint: 'Week 12',
                statisticalMethod: 'ROC Analysis'
              }
            ],
            secondaryEndpoints: [
              {
                id: 'ep-002',
                name: 'Specificity',
                description: 'Diagnostic specificity of digital biomarker',
                type: 'secondary',
                measurementType: 'continuous',
                unit: '%',
                timepoint: 'Week 12',
                statisticalMethod: 'ROC Analysis'
              }
            ],
            inclusionCriteria: [
              {
                id: 'inc-001',
                description: 'Age 18-75 years',
                type: 'inclusion',
                category: 'demographic',
                isCritical: true
              }
            ],
            exclusionCriteria: [
              {
                id: 'exc-001',
                description: 'Pregnancy',
                type: 'exclusion',
                category: 'medical-history',
                isCritical: true
              }
            ],
            studyDesign: {
              type: 'cohort',
              allocation: 'non-randomized',
              intervention: 'no-intervention',
              masking: 'none',
              assignment: 'single-group'
            },
            blinding: 'open-label',
            randomization: {
              method: 'simple',
              allocationRatio: '1:1'
            },
            phases: [
              {
                id: 'phase-001',
                name: 'Screening',
                description: 'Patient screening and enrollment',
                duration: 7,
                visits: [
                  {
                    id: 'visit-001',
                    name: 'Screening Visit',
                    type: 'screening',
                    day: 0,
                    window: { before: 0, after: 3 },
                    procedures: ['consent', 'demographics', 'medical-history']
                  }
                ],
                procedures: [
                  {
                    id: 'proc-001',
                    name: 'Informed Consent',
                    type: 'questionnaire',
                    category: 'regulatory',
                    instructions: 'Review and obtain signed informed consent',
                    frequency: 'once'
                  }
                ],
                assessments: [
                  {
                    id: 'assess-001',
                    name: 'Baseline Assessment',
                    type: 'efficacy',
                    instrument: 'Digital Biomarker Panel',
                    scoring: 'Automated',
                    interpretation: 'Reference to normal ranges'
                  }
                ]
              }
            ],
            timeline: {
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-12-15'),
              recruitmentStart: new Date('2024-02-01'),
              recruitmentEnd: new Date('2024-08-01'),
              lastPatientLastVisit: new Date('2024-11-01'),
              dataLockPoint: new Date('2024-11-15'),
              reportDate: new Date('2024-12-15')
            },
            locations: [
              {
                id: 'loc-001',
                name: 'Digital Health Research Center',
                type: 'site',
                address: {
                  street: '123 Innovation Drive',
                  city: 'San Francisco',
                  state: 'CA',
                  zipCode: '94107',
                  country: 'USA'
                },
                principalInvestigator: 'Dr. Sarah Chen',
                capacity: 200,
                status: 'recruiting'
              }
            ],
            regulatoryStatus: [
              {
                authority: 'fda',
                type: 'ide',
                status: 'approved',
                submissionDate: new Date('2023-10-01'),
                approvalDate: new Date('2023-12-01'),
                conditions: ['Monthly safety reports required']
              }
            ],
            ethics: [
              {
                committee: 'Central IRB',
                type: 'irb',
                status: 'approved',
                approvalDate: new Date('2023-11-15'),
                expiryDate: new Date('2024-11-15'),
                amendments: []
              }
            ],
            createdAt: new Date('2023-09-01'),
            updatedAt: new Date('2024-01-10'),
            createdBy: 'Dr. Michael Rodriguez',
            principalInvestigator: 'Dr. Sarah Chen'
          }
        ];

        const mockDigitalTrials: DigitalTherapeuticTrial[] = [
          {
            ...mockProtocols[0],
            digitalComponents: [
              {
                id: 'dtx-001',
                name: 'VITAL Path DTx Platform',
                type: 'platform',
                version: '2.1.0',
                description: 'Comprehensive digital therapeutic platform for chronic disease management',
                indications: ['Type 2 Diabetes', 'Hypertension', 'Obesity'],
                contraindications: ['Severe cognitive impairment', 'Inability to use smartphone'],
                technicalSpecs: [
                  {
                    parameter: 'Minimum iOS Version',
                    value: '14.0'
                  },
                  {
                    parameter: 'Minimum Android Version',
                    value: '8.0'
                  }
                ]
              }
            ],
            dataCollection: {
              sources: [
                {
                  id: 'source-001',
                  name: 'Patient Mobile App',
                  type: 'mobile-app',
                  format: 'json',
                  frequency: 'real-time'
                },
                {
                  id: 'source-002',
                  name: 'Wearable Device',
                  type: 'wearable',
                  format: 'hl7-fhir',
                  frequency: 'continuous'
                }
              ],
              frequency: 'continuous',
              realTimeMonitoring: true,
              dataTypes: ['vitals', 'activity', 'medication-adherence', 'symptoms'],
              qualityChecks: [
                {
                  parameter: 'heart-rate',
                  rule: 'between 40 and 200 bpm',
                  action: 'flag'
                }
              ]
            },
            remoteMonitoring: {
              enabled: true,
              alerts: [
                {
                  id: 'alert-001',
                  name: 'Critical Vital Signs',
                  condition: 'heart_rate > 150 OR blood_pressure_systolic > 180',
                  severity: 'critical',
                  recipients: ['clinical-team@vitalpath.com'],
                  escalation: [
                    {
                      timeDelay: 15,
                      recipient: 'emergency-team@vitalpath.com',
                      method: 'phone'
                    }
                  ]
                }
              ],
              dashboards: [
                {
                  id: 'dash-001',
                  name: 'Real-Time Patient Monitoring',
                  widgets: [
                    {
                      id: 'widget-001',
                      type: 'chart',
                      title: 'Vital Signs Trends',
                      dataSource: 'patient-vitals',
                      configuration: { chartType: 'line', timeRange: '24h' },
                      position: { x: 0, y: 0, width: 6, height: 4 }
                    }
                  ],
                  refreshInterval: 300,
                  permissions: ['clinical-team', 'investigators']
                }
              ],
              notifications: {
                channels: [
                  {
                    type: 'email',
                    configuration: { server: 'smtp.vitalpath.com' },
                    enabled: true
                  }
                ],
                templates: [
                  {
                    id: 'template-001',
                    name: 'Critical Alert',
                    channel: 'email',
                    subject: 'URGENT: Patient {{patientId}} Critical Alert',
                    body: 'Patient {{patientId}} has triggered a critical alert: {{alertDescription}}',
                    variables: ['patientId', 'alertDescription']
                  }
                ],
                preferences: [
                  {
                    userId: 'user-001',
                    channels: ['email', 'sms'],
                    frequency: 'real-time',
                    categories: ['critical', 'high']
                  }
                ]
              }
            },
            patientApp: {
              features: [
                {
                  id: 'feature-001',
                  name: 'Medication Tracking',
                  type: 'tracking',
                  enabled: true,
                  configuration: { reminderFrequency: 'daily' }
                },
                {
                  id: 'feature-002',
                  name: 'Symptom Assessment',
                  type: 'assessment',
                  enabled: true,
                  configuration: { frequency: 'weekly' }
                }
              ],
              design: {
                theme: 'healthcare-professional',
                branding: {
                  logo: '/assets/vitalpath-logo.png',
                  colors: { primary: '#2563eb', secondary: '#64748b' },
                  fonts: { primary: 'Inter', secondary: 'system-ui' }
                },
                accessibility: {
                  wcagLevel: 'AA',
                  features: ['voice-navigation', 'high-contrast', 'large-text']
                },
                localization: {
                  defaultLanguage: 'en',
                  supportedLanguages: ['en', 'es', 'fr', 'de'],
                  rtlSupport: false
                }
              },
              integration: {
                ehr: [
                  {
                    system: 'Epic',
                    type: 'hl7-fhir',
                    endpoints: ['https://api.epic.com/fhir/r4'],
                    authentication: {
                      type: 'oauth2',
                      configuration: { clientId: 'vital-path-app' }
                    }
                  }
                ],
                wearables: [
                  {
                    device: 'Apple Watch',
                    manufacturer: 'Apple',
                    dataTypes: ['heart-rate', 'activity', 'sleep'],
                    syncFrequency: 'hourly'
                  }
                ],
                apis: [
                  {
                    name: 'VITAL Path API',
                    version: 'v1',
                    baseUrl: 'https://api.vitalpath.com/v1',
                    authentication: {
                      type: 'api-key',
                      configuration: { keyLocation: 'header' }
                    },
                    rateLimits: [
                      {
                        endpoint: '/data',
                        limit: 1000,
                        window: '1h'
                      }
                    ]
                  }
                ]
              },
              offline: {
                enabled: true,
                syncStrategy: 'batch',
                storageLimit: 100,
                conflictResolution: 'server-wins'
              }
            },
            adherenceTracking: {
              metrics: [
                {
                  id: 'adh-001',
                  name: 'Medication Adherence',
                  type: 'medication',
                  calculation: 'doses_taken / doses_prescribed * 100',
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
                }
              ],
              interventions: [
                {
                  id: 'int-001',
                  name: 'Adherence Reminder',
                  trigger: 'low-adherence',
                  type: 'reminder',
                  configuration: { frequency: 'daily', method: 'push-notification' }
                }
              ]
            }
          }
        ];

        setProtocols(mockProtocols);
        setDigitalTrials(mockDigitalTrials);
        setStats({
          totalProtocols: mockProtocols.length,
          activeTrials: mockProtocols.filter((p: any) => p.status === 'active').length,
          completedTrials: mockProtocols.filter((p: any) => p.status === 'completed').length,
          participantsEnrolled: 1250,
          digitalTrials: mockDigitalTrials.length,
          decentralizedTrials: 0
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
//       console.error('Error loading testing data:', error);
      setLoading(false);
    }
  };

                         protocol.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.principalInvestigator.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && matchesType;
  });

    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'terminated': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-neutral-600" />;
    }
  };

    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
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
          <h1 className="text-3xl font-bold text-neutral-900">Universal Testing Platform</h1>
          <p className="text-neutral-600 mt-2">Comprehensive clinical trial and testing infrastructure</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Protocol
          </button>
          <button className="flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Protocols</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalProtocols}</p>
            </div>
            <FlaskConical className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active Trials</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeTrials}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completed Trials</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completedTrials}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Participants</p>
              <p className="text-2xl font-bold text-purple-600">{stats.participantsEnrolled.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Digital Trials</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.digitalTrials}</p>
            </div>
            <Smartphone className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">DCT Trials</p>
              <p className="text-2xl font-bold text-teal-600">{stats.decentralizedTrials}</p>
            </div>
            <Globe className="h-8 w-8 text-teal-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'protocols', label: 'Protocols', icon: FileText },
            { key: 'trials', label: 'Digital Trials', icon: Smartphone },
            { key: 'participants', label: 'Participants', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as unknown)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Protocols */}
            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Recent Protocols</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {protocols.slice(0, 3).map((protocol) => (
                  <div key={protocol.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(protocol.status)}
                      <div>
                        <p className="font-medium text-neutral-900">{protocol.name}</p>
                        <p className="text-sm text-neutral-600">{protocol.principalInvestigator}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(protocol.status)}`}>
                      {protocol.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Capabilities */}
            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Platform Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">HIPAA Compliant Infrastructure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span className="text-neutral-700">Digital Therapeutic Trials</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span className="text-neutral-700">Decentralized Clinical Trials</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span className="text-neutral-700">Real-World Evidence Generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <span className="text-neutral-700">Real-Time Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'protocols' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search protocols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedProtocolType}
                onChange={(e) => setSelectedProtocolType(e.target.value as unknown)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="clinical-trial">Clinical Trials</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="therapeutic">Therapeutic</option>
              </select>
              <button className="flex items-center px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Protocols List */}
          <div className="bg-canvas-surface rounded-lg border border-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Protocol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      PI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredProtocols.map((protocol) => (
                    <tr key={protocol.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{protocol.name}</div>
                          <div className="text-sm text-neutral-500">Version {protocol.version}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {protocol.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {protocol.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(protocol.status)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(protocol.status)}`}>
                            {protocol.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {protocol.principalInvestigator}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                          <button className="text-neutral-600 hover:text-neutral-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Archive</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trials' && (
        <div className="space-y-6">
          <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Digital Therapeutic Trials</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {digitalTrials.map((trial) => (
                <div key={trial.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-neutral-900">{trial.name}</h4>
                      <p className="text-sm text-neutral-600 mt-1">Digital Components: {trial.digitalComponents.length}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trial.status)}`}>
                      {trial.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Activity className="h-4 w-4 mr-2" />
                      Real-time monitoring: {trial.remoteMonitoring.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Patient app features: {trial.patientApp.features.length}
                    </div>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Shield className="h-4 w-4 mr-2" />
                      Data sources: {trial.dataCollection.sources.length}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Monitor
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50">
                      Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional tabs would be implemented similarly */}
    </div>
  );
};

export default UniversalTestingPlatform;
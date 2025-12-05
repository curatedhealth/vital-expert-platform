'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Target,
  Database,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Bell,
  Pill,
  Stethoscope,
  MonitorSpeaker,
  Workflow,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface ClinicalDecisionSupportProps {
  className?: string;
}

interface CDSMetrics {
  totalRules: number;
  activeAlerts: number;
  accuracyRate: number;
  responseTime: number;
  userAdoption: number;
  falsePositiveRate: number;
  clinicalImpact: number;
  costSavings: number;
}

interface CDSRule {
  id: string;
  name: string;
  category: 'drug-interaction' | 'dosing' | 'allergy' | 'diagnosis' | 'protocol' | 'safety' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'testing' | 'deprecated';
  accuracy: number;
  usage: number;
  lastUpdated: Date;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  source: string;
  description: string;
  conditions: CDSCondition[];
  actions: CDSAction[];
  performance: RulePerformance;
}

interface CDSCondition {
  id: string;
  type: 'patient-data' | 'lab-value' | 'medication' | 'diagnosis' | 'vital-sign' | 'age' | 'gender';
  parameter: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals' | 'between';
  value: unknown;
  unit?: string;
}

interface CDSAction {
  id: string;
  type: 'alert' | 'recommendation' | 'order-set' | 'reminder' | 'documentation' | 'consultation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  actionable: boolean;
  autoExecute: boolean;
}

interface RulePerformance {
  triggered: number;
  accepted: number;
  overridden: number;
  falsePositives: number;
  truePositives: number;
  sensitivity: number;
  specificity: number;
  ppv: number; // Positive Predictive Value
  npv: number; // Negative Predictive Value
}

interface CDSAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  patientId: string;
  patientName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  triggered: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'overridden';
  clinician?: string;
  response?: string;
  responseTime?: number;
  outcome?: 'accepted' | 'modified' | 'rejected' | 'ignored';
}

interface CDSIntegration {
  id: string;
  name: string;
  type: 'ehr' | 'cpoe' | 'pharmacy' | 'lab' | 'imaging' | 'monitoring';
  vendor: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  version: string;
  lastSync: Date;
  dataPoints: number;
  latency: number;
  reliability: number;
}

const ClinicalDecisionSupport: React.FC<ClinicalDecisionSupportProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'alerts' | 'performance' | 'integrations'>('overview');
  const [rules, setRules] = useState<CDSRule[]>([]);
  const [alerts, setAlerts] = useState<CDSAlert[]>([]);
  const [integrations, setIntegrations] = useState<CDSIntegration[]>([]);
  const [metrics, setMetrics] = useState<CDSMetrics>({
    totalRules: 0,
    activeAlerts: 0,
    accuracyRate: 0,
    responseTime: 0,
    userAdoption: 0,
    falsePositiveRate: 0,
    clinicalImpact: 0,
    costSavings: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  useEffect(() => {
    loadCDSData();
  }, []);

    try {
      setLoading(true);

      setTimeout(() => {
        const mockRules: CDSRule[] = [
          {
            id: 'rule-001',
            name: 'Drug-Drug Interaction: Warfarin + NSAIDs',
            category: 'drug-interaction',
            severity: 'high',
            status: 'active',
            accuracy: 94.7,
            usage: 1247,
            lastUpdated: new Date('2024-09-20'),
            evidenceLevel: 'A',
            source: 'FDA Drug Interaction Database',
            description: 'Alert for potential bleeding risk when warfarin is prescribed with NSAIDs',
            conditions: [
              {
                id: 'cond-001',
                type: 'medication',
                parameter: 'active_medication',
                operator: 'contains',
                value: 'warfarin'
              },
              {
                id: 'cond-002',
                type: 'medication',
                parameter: 'new_prescription',
                operator: 'contains',
                value: 'NSAID'
              }
            ],
            actions: [
              {
                id: 'act-001',
                type: 'alert',
                priority: 'high',
                message: 'High risk of bleeding: Warfarin + NSAID interaction detected. Consider alternative pain management.',
                actionable: true,
                autoExecute: false
              },
              {
                id: 'act-002',
                type: 'recommendation',
                priority: 'medium',
                message: 'Recommend acetaminophen as safer alternative for pain management',
                actionable: true,
                autoExecute: false
              }
            ],
            performance: {
              triggered: 1247,
              accepted: 892,
              overridden: 355,
              falsePositives: 78,
              truePositives: 1169,
              sensitivity: 94.7,
              specificity: 89.3,
              ppv: 93.7,
              npv: 91.2
            }
          },
          {
            id: 'rule-002',
            name: 'Renal Dosing Adjustment for Elderly',
            category: 'dosing',
            severity: 'medium',
            status: 'active',
            accuracy: 87.4,
            usage: 2156,
            lastUpdated: new Date('2024-09-18'),
            evidenceLevel: 'A',
            source: 'Beers Criteria 2023',
            description: 'Recommend dosing adjustment for nephrotoxic drugs in elderly patients with reduced renal function',
            conditions: [
              {
                id: 'cond-003',
                type: 'age',
                parameter: 'patient_age',
                operator: 'greater_than',
                value: 65
              },
              {
                id: 'cond-004',
                type: 'lab-value',
                parameter: 'creatinine_clearance',
                operator: 'less_than',
                value: 60,
                unit: 'mL/min'
              },
              {
                id: 'cond-005',
                type: 'medication',
                parameter: 'new_prescription',
                operator: 'contains',
                value: 'nephrotoxic_drug'
              }
            ],
            actions: [
              {
                id: 'act-003',
                type: 'recommendation',
                priority: 'medium',
                message: 'Consider dose reduction for renal impairment (CrCl < 60 mL/min)',
                actionable: true,
                autoExecute: false
              }
            ],
            performance: {
              triggered: 2156,
              accepted: 1784,
              overridden: 372,
              falsePositives: 156,
              truePositives: 2000,
              sensitivity: 87.4,
              specificity: 91.8,
              ppv: 92.8,
              npv: 85.6
            }
          },
          {
            id: 'rule-003',
            name: 'Sepsis Early Warning Score (NEWS2)',
            category: 'diagnosis',
            severity: 'critical',
            status: 'active',
            accuracy: 91.2,
            usage: 3847,
            lastUpdated: new Date('2024-09-22'),
            evidenceLevel: 'A',
            source: 'Royal College of Physicians',
            description: 'Early identification of patients at risk of sepsis based on vital signs deterioration',
            conditions: [
              {
                id: 'cond-006',
                type: 'vital-sign',
                parameter: 'news2_score',
                operator: 'greater_than',
                value: 7
              }
            ],
            actions: [
              {
                id: 'act-004',
                type: 'alert',
                priority: 'urgent',
                message: 'CRITICAL: NEWS2 score >7. Immediate clinical assessment required for possible sepsis',
                actionable: true,
                autoExecute: true
              },
              {
                id: 'act-005',
                type: 'order-set',
                priority: 'urgent',
                message: 'Activate sepsis protocol order set',
                actionable: true,
                autoExecute: false
              }
            ],
            performance: {
              triggered: 3847,
              accepted: 3456,
              overridden: 391,
              falsePositives: 287,
              truePositives: 3560,
              sensitivity: 91.2,
              specificity: 88.7,
              ppv: 92.5,
              npv: 86.8
            }
          }
        ];

        const mockAlerts: CDSAlert[] = [
          {
            id: 'alert-001',
            ruleId: 'rule-003',
            ruleName: 'Sepsis Early Warning Score (NEWS2)',
            patientId: 'patient-4521',
            patientName: 'Sarah Johnson',
            severity: 'critical',
            category: 'diagnosis',
            message: 'CRITICAL: NEWS2 score 9. Immediate clinical assessment required for possible sepsis',
            triggered: new Date('2024-09-24T10:15:00Z'),
            status: 'active',
            clinician: 'Dr. Michael Rodriguez',
            responseTime: 3.2,
            outcome: 'accepted'
          },
          {
            id: 'alert-002',
            ruleId: 'rule-001',
            ruleName: 'Drug-Drug Interaction: Warfarin + NSAIDs',
            patientId: 'patient-7834',
            patientName: 'Robert Chen',
            severity: 'high',
            category: 'drug-interaction',
            message: 'High risk of bleeding: Warfarin + NSAID interaction detected',
            triggered: new Date('2024-09-24T09:45:00Z'),
            status: 'acknowledged',
            clinician: 'Dr. Lisa Thompson',
            response: 'Switched to acetaminophen per recommendation',
            responseTime: 8.7,
            outcome: 'accepted'
          },
          {
            id: 'alert-003',
            ruleId: 'rule-002',
            ruleName: 'Renal Dosing Adjustment for Elderly',
            patientId: 'patient-2967',
            patientName: 'Margaret Davis',
            severity: 'medium',
            category: 'dosing',
            message: 'Consider dose reduction for renal impairment (CrCl 45 mL/min)',
            triggered: new Date('2024-09-24T08:30:00Z'),
            status: 'resolved',
            clinician: 'Dr. James Wilson',
            response: 'Dose adjusted to 50% per protocol',
            responseTime: 12.3,
            outcome: 'modified'
          }
        ];

        const mockIntegrations: CDSIntegration[] = [
          {
            id: 'int-001',
            name: 'Epic EHR System',
            type: 'ehr',
            vendor: 'Epic Systems',
            status: 'connected',
            version: '2023.1',
            lastSync: new Date('2024-09-24T10:45:00Z'),
            dataPoints: 45623,
            latency: 120,
            reliability: 99.7
          },
          {
            id: 'int-002',
            name: 'Cerner PowerChart',
            type: 'cpoe',
            vendor: 'Oracle Cerner',
            status: 'connected',
            version: '2023.2',
            lastSync: new Date('2024-09-24T10:43:00Z'),
            dataPoints: 32187,
            latency: 89,
            reliability: 99.4
          },
          {
            id: 'int-003',
            name: 'Omnicell Pharmacy System',
            type: 'pharmacy',
            vendor: 'Omnicell',
            status: 'connected',
            version: '15.2',
            lastSync: new Date('2024-09-24T10:40:00Z'),
            dataPoints: 18954,
            latency: 156,
            reliability: 98.9
          },
          {
            id: 'int-004',
            name: 'Philips Patient Monitor',
            type: 'monitoring',
            vendor: 'Philips Healthcare',
            status: 'connected',
            version: '3.1.4',
            lastSync: new Date('2024-09-24T10:46:00Z'),
            dataPoints: 67812,
            latency: 45,
            reliability: 99.8
          }
        ];

        setRules(mockRules);
        setAlerts(mockAlerts);
        setIntegrations(mockIntegrations);
        setMetrics({
          totalRules: mockRules.length,
          activeAlerts: mockAlerts.filter((a: any) => a.status === 'active').length,
          accuracyRate: 91.2,
          responseTime: 8.1,
          userAdoption: 87.4,
          falsePositiveRate: 8.3,
          clinicalImpact: 23.7,
          costSavings: 2.8
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading CDS data:', error);
      setLoading(false);
    }
  };

    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-neutral-600" />;
    }
  };

    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

    switch (category) {
      case 'drug-interaction': return <Pill className="h-5 w-5 text-red-600" />;
      case 'dosing': return <Target className="h-5 w-5 text-blue-600" />;
      case 'allergy': return <Shield className="h-5 w-5 text-orange-600" />;
      case 'diagnosis': return <Stethoscope className="h-5 w-5 text-green-600" />;
      case 'protocol': return <FileText className="h-5 w-5 text-purple-600" />;
      case 'safety': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'quality': return <Star className="h-5 w-5 text-teal-600" />;
      default: return <Activity className="h-5 w-5 text-neutral-600" />;
    }
  };

    switch (type) {
      case 'ehr': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'cpoe': return <Pill className="h-5 w-5 text-green-600" />;
      case 'pharmacy': return <Pill className="h-5 w-5 text-purple-600" />;
      case 'lab': return <Target className="h-5 w-5 text-orange-600" />;
      case 'imaging': return <Eye className="h-5 w-5 text-teal-600" />;
      case 'monitoring': return <MonitorSpeaker className="h-5 w-5 text-red-600" />;
      default: return <Database className="h-5 w-5 text-neutral-600" />;
    }
  };

    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-neutral-600';
      case 'error': return 'text-red-600';
      case 'maintenance': return 'text-yellow-600';
      default: return 'text-neutral-600';
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
          <h1 className="text-3xl font-bold text-neutral-900">Clinical Decision Support</h1>
          <p className="text-neutral-600 mt-2">AI-powered clinical intelligence and safety alerts</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </button>
          <button className="flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Rules</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.totalRules}</p>
            </div>
            <Brain className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm text-neutral-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.activeAlerts}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
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
              <p className="text-sm text-neutral-600">Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{metrics.accuracyRate}%</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
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
              <p className="text-sm text-neutral-600">Response Time</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.responseTime}m</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
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
              <p className="text-sm text-neutral-600">User Adoption</p>
              <p className="text-2xl font-bold text-teal-600">{metrics.userAdoption}%</p>
            </div>
            <Users className="h-8 w-8 text-teal-600" />
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
              <p className="text-sm text-neutral-600">False Positive</p>
              <p className="text-2xl font-bold text-red-600">{metrics.falsePositiveRate}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Clinical Impact</p>
              <p className="text-2xl font-bold text-indigo-600">+{metrics.clinicalImpact}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-canvas-surface rounded-lg border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Cost Savings</p>
              <p className="text-2xl font-bold text-pink-600">${metrics.costSavings}M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-pink-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'CDS Overview', icon: Brain },
            { key: 'rules', label: 'Decision Rules', icon: FileText },
            { key: 'alerts', label: 'Active Alerts', icon: Bell },
            { key: 'performance', label: 'Performance Analytics', icon: BarChart3 },
            { key: 'integrations', label: 'System Integrations', icon: Database }
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
          {/* CDS Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">CDS System Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="text-neutral-700">AI-powered clinical intelligence engine</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-neutral-700">Real-time safety monitoring and alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Pill className="h-5 w-5 text-purple-600" />
                  <span className="text-neutral-700">Drug interaction and dosing guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-5 w-5 text-red-600" />
                  <span className="text-neutral-700">Evidence-based diagnostic support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Workflow className="h-5 w-5 text-teal-600" />
                  <span className="text-neutral-700">Integrated clinical workflow optimization</span>
                </div>
              </div>
            </div>

            <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Performance</h3>
              <div className="space-y-4">
                {[
                  { label: 'Rule Accuracy', value: 91.2, color: 'bg-green-600' },
                  { label: 'User Acceptance Rate', value: 87.4, color: 'bg-blue-600' },
                  { label: 'System Reliability', value: 99.7, color: 'bg-purple-600' },
                  { label: 'Clinical Impact Score', value: 85.3, color: 'bg-orange-600' },
                  { label: 'Alert Relevance', value: 82.1, color: 'bg-teal-600' }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-neutral-600">{metric.label}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-neutral-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${metric.color}`}
                          style={{width: `${metric.value}%`}}
                        ></div>
                      </div>
                      <span className="font-medium">{metric.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent High-Priority Alerts */}
          <div className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent High-Priority Interventions</h3>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-medium text-neutral-900">{alert.ruleName}</p>
                      <p className="text-sm text-neutral-600 mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                        <span>Patient: {alert.patientName}</span>
                        <span>Clinician: {alert.clinician}</span>
                        <span>Response: {alert.responseTime}m</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.outcome === 'accepted' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                    {alert.outcome === 'rejected' && <ThumbsDown className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="flex items-center px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-canvas-surface rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {getCategoryIcon(rule.category)}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">{rule.name}</h3>
                      <p className="text-neutral-600 mt-1">{rule.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rule.status === 'active' ? 'bg-green-100 text-green-800' :
                      rule.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      {rule.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-600 font-medium">Accuracy</p>
                    <p className="text-lg font-bold text-blue-900">{rule.accuracy}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-600 font-medium">Usage</p>
                    <p className="text-lg font-bold text-green-900">{rule.usage.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-purple-600 font-medium">Evidence Level</p>
                    <p className="text-lg font-bold text-purple-900">{rule.evidenceLevel}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-orange-600 font-medium">PPV</p>
                    <p className="text-lg font-bold text-orange-900">{rule.performance.ppv}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-3">Conditions</h4>
                    <div className="space-y-2">
                      {rule.conditions.map((condition) => (
                        <div key={condition.id} className="text-sm bg-neutral-50 p-2 rounded">
                          <span className="font-medium">{condition.parameter}</span>
                          <span className="mx-2 text-neutral-500">{condition.operator}</span>
                          <span>{condition.value} {condition.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-900 mb-3">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-neutral-50 p-2 rounded">
                        <p className="text-neutral-600">Sensitivity</p>
                        <p className="font-medium">{rule.performance.sensitivity}%</p>
                      </div>
                      <div className="bg-neutral-50 p-2 rounded">
                        <p className="text-neutral-600">Specificity</p>
                        <p className="font-medium">{rule.performance.specificity}%</p>
                      </div>
                      <div className="bg-neutral-50 p-2 rounded">
                        <p className="text-neutral-600">Accepted</p>
                        <p className="font-medium">{rule.performance.accepted}</p>
                      </div>
                      <div className="bg-neutral-50 p-2 rounded">
                        <p className="text-neutral-600">Override Rate</p>
                        <p className="font-medium">{Math.round((rule.performance.overridden / rule.performance.triggered) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50">
                    Edit Rule
                  </button>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional tabs would be implemented similarly */}
    </div>
  );
};

export default ClinicalDecisionSupport;
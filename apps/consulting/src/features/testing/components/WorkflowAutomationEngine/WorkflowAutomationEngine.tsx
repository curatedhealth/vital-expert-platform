'use client';

import { motion } from 'framer-motion';
import {
  Workflow,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  Search,
  Filter,
  GitBranch,
  ArrowRight,
  BarChart3,
  TrendingUp,
  FileText,
  Database,
  Activity,
  Timer,
  Bot,
  Brain,
  Shield,
  MonitorSpeaker,
  Code,
  Stethoscope
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface WorkflowAutomationEngineProps {
  className?: string;
}

interface AutomationMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  executionsToday: number;
  successRate: number;
  avgExecutionTime: number;
  timeSaved: number;
  errorReduction: number;
  costSavings: number;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: 'clinical' | 'administrative' | 'quality' | 'safety' | 'regulatory' | 'research';
  status: 'active' | 'inactive' | 'testing' | 'error';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  schedule?: WorkflowSchedule;
  performance: WorkflowPerformance;
  createdAt: Date;
  lastModified: Date;
  createdBy: string;
}

interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'data' | 'api' | 'condition';
  source: string;
  condition?: string;
  frequency?: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'delay' | 'notification' | 'integration' | 'approval';
  action: string;
  parameters: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  onError?: 'stop' | 'continue' | 'retry' | 'escalate';
  dependencies?: string[];
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

interface WorkflowSchedule {
  type: 'once' | 'recurring' | 'cron';
  startDate: Date;
  endDate?: Date;
  frequency?: string;
  cronExpression?: string;
  timezone: string;
}

interface WorkflowPerformance {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  lastExecution?: Date;
  nextExecution?: Date;
  errorRate: number;
  timeSaved: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'pending';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggeredBy: string;
  currentStep?: string;
  progress: number;
  logs: ExecutionLog[];
  error?: string;
}

interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  step: string;
  message: string;
  data?: any;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'advanced';
  estimatedSetupTime: number;
  benefits: string[];
  requirements: string[];
  popularity: number;
  version: string;
}

const WorkflowAutomationEngine: React.FC<WorkflowAutomationEngineProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'executions' | 'templates' | 'analytics'>('overview');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    executionsToday: 0,
    successRate: 0,
    avgExecutionTime: 0,
    timeSaved: 0,
    errorReduction: 0,
    costSavings: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAutomationData();
  }, []);

    try {
      setLoading(true);

      setTimeout(() => {
        const mockWorkflows: WorkflowDefinition[] = [
          {
            id: 'wf-001',
            name: 'Automated Patient Enrollment Screening',
            description: 'Automatically screen patients for trial eligibility based on inclusion/exclusion criteria',
            category: 'clinical',
            status: 'active',
            trigger: {
              type: 'event',
              source: 'EHR New Patient Registration',
              condition: 'patient.age >= 18 AND patient.diagnosis IN eligibility_conditions'
            },
            steps: [
              {
                id: 'step-001',
                name: 'Extract Patient Data',
                type: 'integration',
                action: 'get_patient_data',
                parameters: { source: 'ehr', fields: ['demographics', 'diagnoses', 'medications', 'lab_results'] },
                timeout: 30,
                retryCount: 3,
                onError: 'retry'
              },
              {
                id: 'step-002',
                name: 'Apply Inclusion Criteria',
                type: 'condition',
                action: 'evaluate_criteria',
                parameters: { criteria_set: 'inclusion', threshold: 'all' },
                onError: 'continue'
              },
              {
                id: 'step-003',
                name: 'Apply Exclusion Criteria',
                type: 'condition',
                action: 'evaluate_criteria',
                parameters: { criteria_set: 'exclusion', threshold: 'any' },
                onError: 'continue'
              },
              {
                id: 'step-004',
                name: 'Generate Eligibility Score',
                type: 'action',
                action: 'calculate_eligibility',
                parameters: { algorithm: 'weighted_scoring' },
                onError: 'escalate'
              },
              {
                id: 'step-005',
                name: 'Notify Clinical Team',
                type: 'notification',
                action: 'send_notification',
                parameters: {
                  recipients: ['clinical-coordinator@vitalpath.com'],
                  template: 'patient_eligibility_alert',
                  priority: 'medium'
                },
                onError: 'continue'
              }
            ],
            conditions: [
              {
                id: 'cond-001',
                field: 'patient.age',
                operator: 'greater_than',
                value: 18
              },
              {
                id: 'cond-002',
                field: 'patient.consent_status',
                operator: 'equals',
                value: 'obtained',
                logicalOperator: 'AND'
              }
            ],
            performance: {
              totalExecutions: 1247,
              successfulExecutions: 1189,
              failedExecutions: 58,
              avgExecutionTime: 45.3,
              lastExecution: new Date('2024-09-24T09:30:00Z'),
              nextExecution: new Date('2024-09-24T12:00:00Z'),
              errorRate: 4.7,
              timeSaved: 623
            },
            createdAt: new Date('2024-08-15'),
            lastModified: new Date('2024-09-20'),
            createdBy: 'Dr. Sarah Chen'
          },
          {
            id: 'wf-002',
            name: 'Regulatory Document Auto-Generation',
            description: 'Automatically generate regulatory submission documents based on study data',
            category: 'regulatory',
            status: 'active',
            trigger: {
              type: 'scheduled',
              source: 'system_scheduler',
              frequency: 'weekly'
            },
            steps: [
              {
                id: 'step-006',
                name: 'Collect Study Data',
                type: 'integration',
                action: 'aggregate_study_data',
                parameters: { timeframe: '1_week', format: 'structured' },
                timeout: 120,
                retryCount: 2,
                onError: 'retry'
              },
              {
                id: 'step-007',
                name: 'Generate Safety Report',
                type: 'action',
                action: 'create_safety_report',
                parameters: { template: 'fda_psur', format: 'pdf' },
                onError: 'escalate'
              },
              {
                id: 'step-008',
                name: 'Quality Review',
                type: 'approval',
                action: 'request_approval',
                parameters: {
                  approver: 'regulatory-manager@vitalpath.com',
                  timeout: '24_hours',
                  escalation: 'auto_approve_low_risk'
                },
                onError: 'escalate'
              },
              {
                id: 'step-009',
                name: 'Submit to Regulatory Authority',
                type: 'integration',
                action: 'submit_document',
                parameters: { authority: 'fda', portal: 'fda_gateway', priority: 'standard' },
                onError: 'escalate'
              }
            ],
            conditions: [
              {
                id: 'cond-003',
                field: 'study.status',
                operator: 'equals',
                value: 'active'
              },
              {
                id: 'cond-004',
                field: 'study.patient_count',
                operator: 'greater_than',
                value: 10,
                logicalOperator: 'AND'
              }
            ],
            schedule: {
              type: 'recurring',
              startDate: new Date('2024-09-01'),
              frequency: 'weekly',
              timezone: 'UTC'
            },
            performance: {
              totalExecutions: 16,
              successfulExecutions: 15,
              failedExecutions: 1,
              avgExecutionTime: 234.7,
              lastExecution: new Date('2024-09-23T10:00:00Z'),
              nextExecution: new Date('2024-09-30T10:00:00Z'),
              errorRate: 6.3,
              timeSaved: 48
            },
            createdAt: new Date('2024-08-20'),
            lastModified: new Date('2024-09-15'),
            createdBy: 'Michael Rodriguez'
          },
          {
            id: 'wf-003',
            name: 'Adverse Event Processing Pipeline',
            description: 'Automated detection, classification, and reporting of adverse events',
            category: 'safety',
            status: 'active',
            trigger: {
              type: 'event',
              source: 'Patient Safety System',
              condition: 'new_adverse_event_report'
            },
            steps: [
              {
                id: 'step-010',
                name: 'Parse AE Report',
                type: 'action',
                action: 'parse_ae_data',
                parameters: { format: 'structured', validate: true },
                timeout: 15,
                onError: 'retry'
              },
              {
                id: 'step-011',
                name: 'Classify Severity',
                type: 'action',
                action: 'classify_severity',
                parameters: { algorithm: 'ctcae_v5', confidence_threshold: 0.8 },
                onError: 'escalate'
              },
              {
                id: 'step-012',
                name: 'Assess Causality',
                type: 'action',
                action: 'assess_causality',
                parameters: { method: 'who_umc', factors: ['temporal', 'biological', 'pharmacological'] },
                onError: 'continue'
              },
              {
                id: 'step-013',
                name: 'Generate SUSAR Alert',
                type: 'condition',
                action: 'check_susar_criteria',
                parameters: { criteria: 'serious_unexpected', auto_alert: true },
                onError: 'escalate'
              },
              {
                id: 'step-014',
                name: 'Update Safety Database',
                type: 'integration',
                action: 'update_safety_db',
                parameters: { database: 'argus', validation: 'strict' },
                onError: 'retry'
              }
            ],
            conditions: [
              {
                id: 'cond-005',
                field: 'ae_report.status',
                operator: 'equals',
                value: 'new'
              }
            ],
            performance: {
              totalExecutions: 347,
              successfulExecutions: 334,
              failedExecutions: 13,
              avgExecutionTime: 18.9,
              lastExecution: new Date('2024-09-24T11:15:00Z'),
              errorRate: 3.7,
              timeSaved: 174
            },
            createdAt: new Date('2024-07-10'),
            lastModified: new Date('2024-09-18'),
            createdBy: 'Dr. Lisa Thompson'
          }
        ];

        const mockExecutions: WorkflowExecution[] = [
          {
            id: 'exec-001',
            workflowId: 'wf-001',
            workflowName: 'Automated Patient Enrollment Screening',
            status: 'running',
            startTime: new Date('2024-09-24T11:45:00Z'),
            triggeredBy: 'system_event',
            currentStep: 'step-003',
            progress: 60,
            logs: [
              {
                timestamp: new Date('2024-09-24T11:45:00Z'),
                level: 'info',
                step: 'step-001',
                message: 'Successfully extracted patient data from EHR',
                data: { patient_id: 'P-4521', record_count: 145 }
              },
              {
                timestamp: new Date('2024-09-24T11:45:30Z'),
                level: 'info',
                step: 'step-002',
                message: 'Inclusion criteria evaluation completed',
                data: { criteria_met: 8, criteria_total: 10, score: 0.8 }
              },
              {
                timestamp: new Date('2024-09-24T11:46:00Z'),
                level: 'warning',
                step: 'step-003',
                message: 'Processing exclusion criteria - potential conflict detected',
                data: { conflict: 'concurrent_medication', severity: 'medium' }
              }
            ]
          },
          {
            id: 'exec-002',
            workflowId: 'wf-003',
            workflowName: 'Adverse Event Processing Pipeline',
            status: 'completed',
            startTime: new Date('2024-09-24T10:30:00Z'),
            endTime: new Date('2024-09-24T10:31:15Z'),
            duration: 75,
            triggeredBy: 'ae_report_submission',
            currentStep: 'completed',
            progress: 100,
            logs: [
              {
                timestamp: new Date('2024-09-24T10:30:00Z'),
                level: 'info',
                step: 'step-010',
                message: 'AE report parsed successfully',
                data: { ae_id: 'AE-2024-0892', severity: 'moderate' }
              },
              {
                timestamp: new Date('2024-09-24T10:30:45Z'),
                level: 'info',
                step: 'step-014',
                message: 'Safety database updated',
                data: { database_id: 'ARG-001', sync_status: 'complete' }
              }
            ]
          }
        ];

        const mockTemplates: AutomationTemplate[] = [
          {
            id: 'template-001',
            name: 'Patient Recruitment Automation',
            description: 'Automate patient identification and recruitment for clinical trials',
            category: 'clinical',
            complexity: 'medium',
            estimatedSetupTime: 120,
            benefits: ['50% faster recruitment', 'Reduced manual screening', 'Improved eligibility accuracy'],
            requirements: ['EHR integration', 'Inclusion/exclusion criteria database', 'Email notification system'],
            popularity: 89,
            version: '2.1.0'
          },
          {
            id: 'template-002',
            name: 'Regulatory Submission Pipeline',
            description: 'Streamline regulatory document generation and submission process',
            category: 'regulatory',
            complexity: 'advanced',
            estimatedSetupTime: 240,
            benefits: ['80% time reduction', 'Improved compliance', 'Automated quality checks'],
            requirements: ['Document management system', 'Regulatory database access', 'Approval workflow'],
            popularity: 76,
            version: '1.8.2'
          },
          {
            id: 'template-003',
            name: 'Data Quality Monitoring',
            description: 'Continuous monitoring and validation of clinical trial data',
            category: 'quality',
            complexity: 'simple',
            estimatedSetupTime: 60,
            benefits: ['Real-time validation', '90% error reduction', 'Automated corrections'],
            requirements: ['EDC system access', 'Data validation rules', 'Alert configuration'],
            popularity: 94,
            version: '3.0.1'
          }
        ];

        setWorkflows(mockWorkflows);
        setExecutions(mockExecutions);
        setTemplates(mockTemplates);
        setMetrics({
          totalWorkflows: mockWorkflows.length,
          activeWorkflows: mockWorkflows.filter(w => w.status === 'active').length,
          executionsToday: 47,
          successRate: 94.3,
          avgExecutionTime: 62.8,
          timeSaved: 845,
          errorReduction: 67.2,
          costSavings: 1.2
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading automation data:', error);
      setLoading(false);
    }
  };

    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-600" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-600" />;
      case 'testing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    switch (category) {
      case 'clinical': return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case 'administrative': return <FileText className="h-5 w-5 text-green-600" />;
      case 'quality': return <Shield className="h-5 w-5 text-purple-600" />;
      case 'safety': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'regulatory': return <FileText className="h-5 w-5 text-orange-600" />;
      case 'research': return <Brain className="h-5 w-5 text-teal-600" />;
      default: return <Workflow className="h-5 w-5 text-gray-600" />;
    }
  };

    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Workflow Automation Engine</h1>
          <p className="text-gray-600 mt-2">Intelligent process automation for clinical operations</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.totalWorkflows}</p>
            </div>
            <Workflow className="h-8 w-8 text-blue-600" />
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
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeWorkflows}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
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
              <p className="text-sm text-gray-600">Executions Today</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.executionsToday}</p>
            </div>
            <Play className="h-8 w-8 text-purple-600" />
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
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-teal-600">{metrics.successRate}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-600" />
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
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.avgExecutionTime}s</p>
            </div>
            <Timer className="h-8 w-8 text-orange-600" />
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
              <p className="text-sm text-gray-600">Time Saved</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.timeSaved}h</p>
            </div>
            <Clock className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Error Reduction</p>
              <p className="text-2xl font-bold text-pink-600">{metrics.errorReduction}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-pink-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-red-600">${metrics.costSavings}M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Automation Overview', icon: Workflow },
            { key: 'workflows', label: 'Active Workflows', icon: GitBranch },
            { key: 'executions', label: 'Live Executions', icon: Activity },
            { key: 'templates', label: 'Automation Templates', icon: Code },
            { key: 'analytics', label: 'Performance Analytics', icon: BarChart3 }
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
          {/* Automation Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Intelligent process automation with AI</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Complex workflow orchestration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Multi-system integration and data flow</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">Compliance-aware automation rules</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MonitorSpeaker className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">Real-time monitoring and alerting</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Efficiency Gains</h3>
              <div className="space-y-4">
                {[
                  { label: 'Time Savings', value: 78.3, color: 'bg-green-600', metric: '845 hours' },
                  { label: 'Error Reduction', value: 67.2, color: 'bg-blue-600', metric: '67.2%' },
                  { label: 'Process Speed', value: 85.7, color: 'bg-purple-600', metric: '3.2x faster' },
                  { label: 'Cost Efficiency', value: 71.4, color: 'bg-orange-600', metric: '$1.2M saved' },
                  { label: 'User Satisfaction', value: 89.1, color: 'bg-teal-600', metric: '4.5/5 rating' }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{metric.label}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${metric.color}`}
                          style={{width: `${metric.value}%`}}
                        ></div>
                      </div>
                      <span className="font-medium text-sm w-16">{metric.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Workflow Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Impact Automations</h3>
            <div className="space-y-3">
              {[
                {
                  workflow: 'Patient Enrollment Screening - Diabetes Trial',
                  impact: '47 patients processed automatically',
                  timeSaved: '12.3 hours',
                  status: 'completed',
                  time: '2 hours ago'
                },
                {
                  workflow: 'Regulatory Document Generation - Weekly Safety Report',
                  impact: 'FDA submission auto-generated and submitted',
                  timeSaved: '8.7 hours',
                  status: 'completed',
                  time: '4 hours ago'
                },
                {
                  workflow: 'Adverse Event Classification Pipeline',
                  impact: '15 AE reports processed and classified',
                  timeSaved: '3.2 hours',
                  status: 'running',
                  time: 'Ongoing'
                },
                {
                  workflow: 'Data Quality Validation - Oncology Study',
                  impact: '234 data queries resolved automatically',
                  timeSaved: '18.9 hours',
                  status: 'completed',
                  time: '1 day ago'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="font-medium text-gray-900">{activity.workflow}</p>
                      <p className="text-sm text-green-600 font-medium">{activity.impact}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Time saved: {activity.timeSaved} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="clinical">Clinical</option>
                <option value="regulatory">Regulatory</option>
                <option value="safety">Safety</option>
                <option value="quality">Quality</option>
                <option value="administrative">Administrative</option>
              </select>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>

          {/* Workflows List */}
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {getCategoryIcon(workflow.category)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                      <p className="text-gray-600 mt-1">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(workflow.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-600 font-medium">Executions</p>
                    <p className="text-lg font-bold text-blue-900">{workflow.performance.totalExecutions.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-600 font-medium">Success Rate</p>
                    <p className="text-lg font-bold text-green-900">
                      {Math.round((workflow.performance.successfulExecutions / workflow.performance.totalExecutions) * 100)}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-purple-600 font-medium">Avg Time</p>
                    <p className="text-lg font-bold text-purple-900">{workflow.performance.avgExecutionTime}s</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-orange-600 font-medium">Time Saved</p>
                    <p className="text-lg font-bold text-orange-900">{workflow.performance.timeSaved}h</p>
                  </div>
                </div>

                {/* Workflow Steps Preview */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Workflow Steps ({workflow.steps.length})</h4>
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {workflow.steps.slice(0, 4).map((step, index) => (
                      <React.Fragment key={step.id}>
                        <div className="flex-shrink-0 bg-gray-100 rounded-lg p-2 min-w-[120px]">
                          <p className="text-xs font-medium text-gray-700">{step.name}</p>
                          <p className="text-xs text-gray-500">{step.type}</p>
                        </div>
                        {index < Math.min(workflow.steps.length - 1, 3) && (
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                    {workflow.steps.length > 4 && (
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        +{workflow.steps.length - 4} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <span>Created by {workflow.createdBy} • </span>
                    <span>Last modified {workflow.lastModified.toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-3">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    <button className="text-green-600 hover:text-green-800 font-medium">Run Now</button>
                    <button className="text-gray-600 hover:text-gray-800 font-medium">View Logs</button>
                  </div>
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

export default WorkflowAutomationEngine;
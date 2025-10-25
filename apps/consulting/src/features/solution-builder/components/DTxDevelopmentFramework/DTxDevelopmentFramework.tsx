'use client';

import React, { useState, useEffect } from 'react';

import {
  SolutionProject,
  TestSuite,
  ValidationResult
} from '../../types';

interface DTxDevelopmentFrameworkProps {
  projectId: string;
}

const DTxDevelopmentFramework: React.FC<DTxDevelopmentFrameworkProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<'design' | 'develop' | 'test' | 'validate' | 'regulatory_optimizer'>('design');
  const [project, setProject] = useState<SolutionProject | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  useEffect(() => {
    // Mock project data
    const mockProject: SolutionProject = {
      id: projectId,
      name: 'Diabetes DTx Solution',
      description: 'AI-powered digital therapeutic for Type 2 diabetes management',
      type: 'digital_therapeutic',
      status: 'development',
      owner: 'user-1',
      team: [],
      createdDate: new Date(),
      lastModified: new Date(),
      version: '1.0.0',
      deployments: [],
      testResults: []
    };

    const mockTestSuites: TestSuite[] = [
      {
        id: 'test-suite-1',
        projectId,
        name: 'FDA Compliance Tests',
        type: 'compliance',
        tests: [
          {
            id: 'test-1',
            name: 'Data Privacy Validation',
            description: 'Verify HIPAA compliance for patient data handling',
            type: 'compliance',
            steps: [
              {
                id: 'step-1',
                description: 'Test data encryption at rest',
                action: { type: 'compliance_check', target: 'data_storage' },
                parameters: { standard: 'HIPAA', requirement: 'encryption' },
                validation: { conditions: [{ field: 'encrypted', operator: 'equals', value: true }], operator: 'and' }
              }
            ],
            expectedResult: { type: 'exact', value: 'compliant' },
            status: 'passed',
            environment: {
              name: 'compliance_test',
              url: 'https://compliance-test.example.com',
              credentials: { /* TODO: implement */ },
              configuration: { /* TODO: implement */ }
            }
          },
          {
            id: 'test-2',
            name: 'Clinical Evidence Requirements',
            description: 'Validate clinical evidence meets FDA standards',
            type: 'clinical_validation',
            steps: [],
            expectedResult: { type: 'exact', value: 'sufficient_evidence' },
            status: 'pending',
            environment: {
              name: 'clinical_validation',
              url: 'https://clinical-test.example.com',
              credentials: { /* TODO: implement */ },
              configuration: { /* TODO: implement */ }
            }
          }
        ],
        configuration: {
          timeout: 30000,
          retries: 3,
          parallel: false,
          environment: {
            name: 'test',
            url: 'https://test.example.com',
            credentials: { /* TODO: implement */ },
            configuration: { /* TODO: implement */ }
          },
          dataSeeding: true
        },
        lastRun: new Date(),
        results: []
      }
    ];

    const mockValidationResults: ValidationResult[] = [
      {
        id: 'val-1',
        componentId: 'comp-1',
        type: 'fda_compliance',
        status: 'passed',
        message: 'DTx meets FDA de novo pathway requirements',
        severity: 'medium',
        recommendation: 'Continue with pre-submission preparation',
        fixable: false
      },
      {
        id: 'val-2',
        componentId: 'comp-2',
        type: 'security',
        status: 'warning',
        message: 'Consider implementing additional authentication factors',
        severity: 'medium',
        recommendation: 'Add biometric authentication for sensitive data access',
        fixable: true
      }
    ];

    setProject(mockProject);
    setTestSuites(mockTestSuites);
    setValidationResults(mockValidationResults);
  }, [projectId]);

      'patient_onboarding': `
// DTx Patient Onboarding Component
import React, { useState } from 'react';
import { validatePatientData, encryptSensitiveData } from '@/utils/hipaa-compliance';

export const __PatientOnboarding = () => {
  const [patientData, setPatientData] = useState({
    demographics: { /* TODO: implement */ },
    medicalHistory: { /* TODO: implement */ },
    consentStatus: false
  });

    // HIPAA-compliant data validation

    if (validationResult.isValid) {
      // Encrypt sensitive data

      // Submit to secure backend
      await submitPatientData(encryptedData);
    }
  };

  return (
    <div className="patient-onboarding">
      <h2>Welcome to Your Diabetes Management Program</h2>
      {/* Onboarding forms with HIPAA compliance */}
    </div>
  );
};
      `,
      'intervention_engine': `
// DTx Intervention Engine
import { calculateGlucoseTarget, assessRisk } from '@/algorithms/diabetes-management';

export class InterventionEngine {
  constructor(patientProfile) {
    this.patientProfile = patientProfile;
    this.interventionHistory = [];
  }

  async generateIntervention(currentData) {
    // FDA-compliant algorithm for intervention recommendation

      type: this.determineInterventionType(riskAssessment),
      intensity: this.calculateIntensity(riskAssessment),
      timing: this.optimizeTiming(currentData.timeOfDay),
      personalization: this.personalizeContent(this.patientProfile)
    };

    // Log for clinical evidence collection
    this.logIntervention(intervention);

    return intervention;
  }

  // Clinical evidence tracking for FDA submission
  logIntervention(intervention) {
    this.interventionHistory.push({
      ...intervention,
      timestamp: new Date(),
      patientId: this.patientProfile.id,
      clinicalContext: this.getClinicalContext()
    });
  }
}
      `,
      'outcome_tracking': `
// DTx Outcome Measurement System
export class OutcomeTracker {
  constructor(validatedInstruments) {
    this.instruments = validatedInstruments; // FDA-validated outcome measures
  }

  async collectOutcomeData(patientId, instrumentType) {

    // Use validated clinical instruments (e.g., HbA1c, SMBG)

    return {
      patientId,
      instrumentType,
      value: measurement.value,
      timestamp: new Date(),
      reliability: measurement.reliability,
      clinicalSignificance: this.assessClinicalSignificance(measurement)
    };
  }

  // Real-world evidence generation
  generateRWE(cohortData) {
    return {
      primaryEndpoint: this.analyzePrimaryEndpoint(cohortData),
      secondaryEndpoints: this.analyzeSecondaryEndpoints(cohortData),
      safetyProfile: this.assessSafety(cohortData),
      statisticalSignificance: this.performStatisticalAnalysis(cohortData)
    };
  }
}
      `
    };

    setGeneratedCode(templates[component as keyof typeof templates] || '// Select a component to generate code');
  };

    // Simulate running compliance validation
    const newResults: ValidationResult[] = [
      {
        id: 'val-new-1',
        componentId: 'comp-intervention',
        type: 'fda_compliance',
        status: 'passed',
        message: 'Algorithm meets Class II medical device software requirements',
        severity: 'high',
        recommendation: 'Ready for 510(k) pre-submission',
        fixable: false
      },
      {
        id: 'val-new-2',
        componentId: 'comp-data',
        type: 'hipaa_compliance',
        status: 'passed',
        message: 'Data handling complies with HIPAA Security Rule',
        severity: 'critical',
        recommendation: 'Maintain current security controls',
        fixable: false
      }
    ];

    setValidationResults([...validationResults, ...newResults]);
  };

    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!project) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">DTx Development Framework</h1>
          <p className="text-gray-600 mt-1">{project.name} - FDA-Compliant Digital Therapeutic</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'design', label: '🎨 Design', desc: 'Architecture & Components' },
              { key: 'develop', label: '💻 Develop', desc: 'Code Generation & Templates' },
              { key: 'test', label: '🧪 Test', desc: 'Clinical & Technical Testing' },
              { key: 'validate', label: '✅ Validate', desc: 'FDA & HIPAA Compliance' },
              { key: 'regulatory_optimizer', label: '🚀 Regulatory AI', desc: 'Pathway Optimization' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs text-gray-400">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'design' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">DTx Architecture Components</h2>

              <div className="space-y-4">
                {[
                  { name: 'Patient Onboarding', status: 'complete', compliance: 'HIPAA Ready' },
                  { name: 'Intervention Engine', status: 'development', compliance: 'FDA Class II' },
                  { name: 'Outcome Tracking', status: 'complete', compliance: 'RWE Compatible' },
                  { name: 'Safety Monitoring', status: 'design', compliance: 'FDA Required' }
                ].map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{component.name}</div>
                      <div className="text-sm text-green-600">{component.compliance}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      component.status === 'complete' ? 'bg-green-100 text-green-800' :
                      component.status === 'development' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {component.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">FDA Requirements Checklist</h2>

              <div className="space-y-3">
                {[
                  { requirement: 'Clinical Evidence Generation', status: 'complete' },
                  { requirement: 'Risk Management (ISO 14971)', status: 'complete' },
                  { requirement: 'Software Lifecycle Process (IEC 62304)', status: 'in_progress' },
                  { requirement: 'Usability Engineering (IEC 62366)', status: 'pending' },
                  { requirement: 'Cybersecurity Controls', status: 'complete' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.status === 'complete' ? 'bg-green-500' :
                      item.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700">{item.requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'develop' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Generation</h2>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => generateDTxCode('patient_onboarding')}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Patient Onboarding Component</div>
                  <div className="text-sm text-gray-600">HIPAA-compliant data collection</div>
                </button>

                <button
                  onClick={() => generateDTxCode('intervention_engine')}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Intervention Engine</div>
                  <div className="text-sm text-gray-600">FDA-compliant therapeutic algorithm</div>
                </button>

                <button
                  onClick={() => generateDTxCode('outcome_tracking')}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">Outcome Tracking</div>
                  <div className="text-sm text-gray-600">Real-world evidence collection</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Code</h2>

              <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-96 overflow-y-auto">
                <pre>{generatedCode || '// Select a component to generate code'}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Clinical & Technical Testing</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Run All Tests
              </button>
            </div>

            {testSuites.map(suite => (
              <div key={suite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{suite.name}</h3>
                    <p className="text-sm text-gray-600">{suite.type} • {suite.tests.length} tests</p>
                  </div>
                  <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                    Run Suite
                  </button>
                </div>

                <div className="space-y-3">
                  {suite.tests.map(test => (
                    <div key={test.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-600">{test.description}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'validate' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Regulatory Compliance Validation</h2>
              <button
                onClick={runComplianceValidation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Run Validation
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResults.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Results</h3>

              <div className="space-y-4">
                {validationResults.map(result => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{result.type.replace('_', ' ').toUpperCase()}</div>
                        <div className={`text-sm font-medium ${getSeverityColor(result.severity)}`}>
                          {result.severity.toUpperCase()} SEVERITY
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    <p className="text-sm text-blue-600">{result.recommendation}</p>

                    {result.fixable && (
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        Auto-Fix Available
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'regulatory_optimizer' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">🚀 AI-Powered Regulatory Pathway Optimization</h2>

            {/* Regulatory Strategy Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Optimized Regulatory Strategy</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">De Novo</div>
                  <div className="text-sm text-gray-600">Recommended Pathway</div>
                  <div className="text-xs text-blue-600 mt-1">87% Success Rate</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">14-16</div>
                  <div className="text-sm text-gray-600">Months to Clearance</div>
                  <div className="text-xs text-green-600 mt-1">3 months faster</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">$2.1M</div>
                  <div className="text-sm text-gray-600">Total Regulatory Cost</div>
                  <div className="text-xs text-purple-600 mt-1">15% below average</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">AI Optimization Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Clinical evidence package optimized for FDA expectations</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Pre-submission strategy aligned with similar approvals</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <span className="text-gray-700">Risk mitigation plan based on 15,000+ regulatory decisions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Automated Regulatory Planning */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Automated Regulatory Plan</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Pre-Submission Meeting</div>
                        <div className="text-sm text-gray-600">Q-Sub with FDA CDRH</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Month 6</div>
                      <div className="text-xs text-gray-500">Optimal timing</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Clinical Study Completion</div>
                        <div className="text-sm text-gray-600">RCT with HEOR endpoints</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">Month 12</div>
                      <div className="text-xs text-gray-500">Evidence package</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">De Novo Submission</div>
                        <div className="text-sm text-gray-600">Complete regulatory dossier</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">Month 18</div>
                      <div className="text-xs text-gray-500">FDA submission</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 text-sm font-bold">4</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">FDA Clearance</div>
                        <div className="text-sm text-gray-600">Device authorization</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">Month 28</div>
                      <div className="text-xs text-gray-500">Target approval</div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Generate Detailed Regulatory Plan
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Risk Optimization</h3>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Clinical Evidence Risk</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Current study design may not meet FDA expectations for novel algorithm
                    </div>
                    <div className="text-xs text-red-600">
                      <strong>AI Recommendation:</strong> Add 3-month extension with biomarker validation arm
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Cybersecurity Requirements</h4>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      New FDA cybersecurity guidelines require enhanced documentation
                    </div>
                    <div className="text-xs text-yellow-600">
                      <strong>AI Recommendation:</strong> Implement security framework early in development
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Predicate Device Strategy</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Low</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Strong predicate devices identified for substantial equivalence
                    </div>
                    <div className="text-xs text-green-600">
                      <strong>AI Insight:</strong> Consider 510(k) pathway as backup option
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Run Risk Assessment AI
                </button>
              </div>
            </div>

            {/* Real-time Regulatory Intelligence */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Real-time Regulatory Intelligence</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">FDA Activity Monitor</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• 3 new AI/ML guidance documents released</div>
                    <div>• 12 similar device approvals this quarter</div>
                    <div>• 2 relevant FDA workshops scheduled</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Competitive Analysis</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• 4 competitors in clinical trials</div>
                    <div>• 2 recent De Novo approvals in space</div>
                    <div>• Average approval time: 16.2 months</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Success Predictions</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• 87% probability of first-round approval</div>
                    <div>• 94% chance of eventual clearance</div>
                    <div>• 73% likelihood of premium pricing</div>
                  </div>
                </div>
              </div>

              {/* AI-Powered Action Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 AI-Generated Action Items</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Update software bill of materials for cybersecurity submission</span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High Priority</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Schedule pre-submission meeting with FDA CDRH</span>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Medium Priority</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Begin clinical protocol optimization based on FDA feedback patterns</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Low Priority</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold">
                  🚀 Launch AI Regulatory Optimizer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DTxDevelopmentFramework;
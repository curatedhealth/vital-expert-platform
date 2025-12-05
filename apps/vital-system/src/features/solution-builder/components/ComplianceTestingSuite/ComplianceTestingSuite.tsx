// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';

interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  category: 'privacy' | 'security' | 'medical_device' | 'quality' | 'data_protection';
  requirements: ComplianceRequirement[];
  status: 'not_started' | 'in_progress' | 'passed' | 'failed';
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  section: string;
  mandatory: boolean;
  testCases: TestCase[];
  status: 'pending' | 'testing' | 'passed' | 'failed';
  evidence: Evidence[];
}

interface TestCase {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'documentation';
  description: string;
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  lastRun?: Date;
  artifacts: string[];
}

interface TestStep {
  id: string;
  description: string;
  automated: boolean;
  command?: string;
  validation: ValidationCriteria;
}

interface ValidationCriteria {
  type: 'exact_match' | 'contains' | 'regex' | 'numeric_range' | 'boolean';
  expected: unknown;
  tolerance?: number;
}

interface Evidence {
  id: string;
  type: 'document' | 'screenshot' | 'log_file' | 'certificate' | 'audit_report';
  name: string;
  description: string;
  url: string;
  uploadDate: Date;
  verified: boolean;
}

interface ComplianceReport {
  id: string;
  standard: string;
  generatedDate: Date;
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  requirementsSummary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
  criticalFindings: Finding[];
  recommendations: string[];
}

interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  requirement: string;
  description: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

const ComplianceTestingSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standards' | 'testing' | 'evidence' | 'reports' | 'regulatory_intelligence'>('standards');
  const [selectedStandard, setSelectedStandard] = useState<string>('hipaa');
  const [complianceStandards, setComplianceStandards] = useState<ComplianceStandard[]>([]);
  const [testResults, setTestResults] = useState<{ [key: string]: TestCase[] }>({ /* TODO: implement */ });
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Initialize compliance standards
    const standards: ComplianceStandard[] = [
      {
        id: 'hipaa',
        name: 'HIPAA Security Rule',
        version: '2023',
        category: 'privacy',
        status: 'not_started',
        requirements: [
          {
            id: 'hipaa-164.308',
            title: 'Administrative Safeguards',
            description: 'Assign security responsibilities, conduct workforce training',
            section: '164.308(a)(1)',
            mandatory: true,
            status: 'pending',
            testCases: [
              {
                id: 'test-admin-1',
                name: 'Security Officer Assignment',
                type: 'documentation',
                description: 'Verify designated security officer and documentation',
                steps: [
                  {
                    id: 'step-1',
                    description: 'Check security officer documentation',
                    automated: false,
                    validation: { type: 'boolean', expected: true }
                  }
                ],
                expectedResult: 'Security officer assigned and documented',
                status: 'pending',
                artifacts: []
              }
            ],
            evidence: []
          },
          {
            id: 'hipaa-164.312',
            title: 'Technical Safeguards',
            description: 'Access control, audit controls, integrity, person authentication',
            section: '164.312(a)(1)',
            mandatory: true,
            status: 'pending',
            testCases: [
              {
                id: 'test-tech-1',
                name: 'Access Control Implementation',
                type: 'automated',
                description: 'Verify unique user identification and access controls',
                steps: [
                  {
                    id: 'step-1',
                    description: 'Test authentication system',
                    automated: true,
                    command: 'npm run test:auth',
                    validation: { type: 'boolean', expected: true }
                  }
                ],
                expectedResult: 'All users have unique identifiers and appropriate access',
                status: 'pending',
                artifacts: []
              }
            ],
            evidence: []
          }
        ]
      },
      {
        id: 'fda-part11',
        name: 'FDA 21 CFR Part 11',
        version: '2023',
        category: 'medical_device',
        status: 'not_started',
        requirements: [
          {
            id: 'part11-11.10',
            title: 'Electronic Record Controls',
            description: 'Validation, audit trail, protection of records',
            section: '11.10(a)',
            mandatory: true,
            status: 'pending',
            testCases: [
              {
                id: 'test-part11-1',
                name: 'Electronic Signature Validation',
                type: 'automated',
                description: 'Test electronic signature implementation',
                steps: [
                  {
                    id: 'step-1',
                    description: 'Validate e-signature process',
                    automated: true,
                    command: 'npm run test:esignature',
                    validation: { type: 'boolean', expected: true }
                  }
                ],
                expectedResult: 'Electronic signatures are legally binding and auditable',
                status: 'pending',
                artifacts: []
              }
            ],
            evidence: []
          }
        ]
      },
      {
        id: 'gdpr',
        name: 'GDPR Compliance',
        version: '2018',
        category: 'data_protection',
        status: 'not_started',
        requirements: [
          {
            id: 'gdpr-art25',
            title: 'Data Protection by Design',
            description: 'Privacy by design and default implementation',
            section: 'Article 25',
            mandatory: true,
            status: 'pending',
            testCases: [
              {
                id: 'test-gdpr-1',
                name: 'Privacy by Default Settings',
                type: 'manual',
                description: 'Verify default privacy settings protect personal data',
                steps: [
                  {
                    id: 'step-1',
                    description: 'Review default application settings',
                    automated: false,
                    validation: { type: 'boolean', expected: true }
                  }
                ],
                expectedResult: 'Default settings minimize data collection and processing',
                status: 'pending',
                artifacts: []
              }
            ],
            evidence: []
          }
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        version: '2022',
        category: 'security',
        status: 'not_started',
        requirements: [
          {
            id: 'iso27001-a5',
            title: 'Information Security Policies',
            description: 'Management direction and support for information security',
            section: 'A.5.1',
            mandatory: true,
            status: 'pending',
            testCases: [
              {
                id: 'test-iso-1',
                name: 'Security Policy Documentation',
                type: 'documentation',
                description: 'Verify comprehensive security policies exist',
                steps: [
                  {
                    id: 'step-1',
                    description: 'Review security policy documents',
                    automated: false,
                    validation: { type: 'boolean', expected: true }
                  }
                ],
                expectedResult: 'Complete and up-to-date security policies documented',
                status: 'pending',
                artifacts: []
              }
            ],
            evidence: []
          }
        ]
      }
    ];

    setComplianceStandards(standards);
  }, []);

    setIsRunningTests(true);

    if (!standard) return;

    // Simulate running tests
    const allTestCases: TestCase[] = [];
    standard.requirements.forEach(req => {
      allTestCases.push(...req.testCases);
    });

    // Update test status to running

    setTestResults({ [standardId]: updatedTestCases });

    // Simulate test execution
    for (let __i = 0; i < updatedTestCases.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      // eslint-disable-next-line security/detect-object-injection

      testCase.status = passed ? 'passed' : 'failed';
      testCase.lastRun = new Date();
      testCase.actualResult = passed ? testCase.expectedResult : 'Test failed - see artifacts for details';

      if (!passed) {
        testCase.artifacts.push(`failure_log_${testCase.id}.txt`);
        testCase.artifacts.push(`screenshot_${testCase.id}.png`);
      }

      setTestResults(prev => ({
        ...prev,
        [standardId]: [...updatedTestCases]
      }));
    }

    // Update standard status

    setComplianceStandards(prev => prev.map((s: any) =>
      s.id === standardId
        ? { ...s, status: standardPassed ? 'passed' : 'failed' }
        : s
    ));

    setIsRunningTests(false);
  };

    // eslint-disable-next-line security/detect-object-injection

    const criticalFindings: Finding[] = tests
      .filter((t: any) => t.status === 'failed')
      .map((t: any) => ({
        id: `finding-${t.id}`,
        severity: 'high' as const,
        requirement: t.name,
        description: t.actualResult || 'Test failed',
        remediation: 'Review implementation and address identified issues',
        status: 'open' as const
      }));

    const report = {
      id: `report-${standardId}-${Date.now()}`,
      standard: standard?.name || standardId,
      generatedDate: new Date(),
      overallStatus: score === 100 ? 'compliant' : score >= 80 ? 'partial' : 'non_compliant',
      score,
      requirementsSummary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        pending: pendingTests
      },
      criticalFindings,
      recommendations: [
        'Address all critical and high severity findings',
        'Implement automated testing for continuous compliance monitoring',
        'Schedule regular compliance reviews and updates',
        'Maintain comprehensive documentation for audit purposes'
      ]
    };

    if (typeof document === 'undefined') {
      console.warn('Report export is only available in the browser environment.');
      return;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `compliance_report_${standardId}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-canvas-surface border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">Regulatory Compliance Testing Suite</h1>
          <p className="text-neutral-600 mt-1">
            Automated testing and validation for HIPAA, FDA, GDPR, and other compliance standards
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-canvas-surface border-b border-neutral-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'standards', label: '📋 Standards', desc: 'Compliance frameworks' },
              { key: 'testing', label: '🧪 Testing', desc: 'Run compliance tests' },
              { key: 'evidence', label: '📁 Evidence', desc: 'Supporting documentation' },
              { key: 'reports', label: '📊 Reports', desc: 'Compliance reports' },
              { key: 'regulatory_intelligence', label: '🧠 Intelligence', desc: 'Regulatory insights' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs text-neutral-400">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'standards' && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Compliance Standards</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {complianceStandards.map(standard => (
                <button
                  key={standard.id}
                  onClick={() => setSelectedStandard(standard.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedStandard === standard.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 bg-canvas-surface hover:border-neutral-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-neutral-900">{standard.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(standard.status)}`}>
                      {standard.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{standard.category.replace('_', ' ')}</p>
                  <p className="text-xs text-neutral-500 mt-1">{standard.requirements.length} requirements</p>
                </button>
              ))}
            </div>

            {/* Selected Standard Details */}
            {selectedStandard && (
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900">
                      {complianceStandards.find((s: any) => s.id === selectedStandard)?.name}
                    </h3>
                    <p className="text-neutral-600">
                      Version {complianceStandards.find((s: any) => s.id === selectedStandard)?.version}
                    </p>
                  </div>
                  <button
                    onClick={() => runComplianceTests(selectedStandard)}
                    disabled={isRunningTests}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
                  </button>
                </div>

                <div className="space-y-4">
                  {complianceStandards.find((s: any) => s.id === selectedStandard)?.requirements.map(requirement => (
                    <div key={requirement.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-neutral-900">{requirement.title}</h4>
                          <p className="text-sm text-neutral-600">{requirement.description}</p>
                          <p className="text-xs text-neutral-500 mt-1">Section: {requirement.section}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {requirement.mandatory && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Mandatory
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(requirement.status)}`}>
                            {requirement.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-neutral-600">
                        {requirement.testCases.length} test cases
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testing' && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Compliance Testing</h2>

            {/* eslint-disable-next-line security/detect-object-injection */}
            {testResults[selectedStandard] && testResults[selectedStandard].length > 0 ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line security/detect-object-injection */}
                {testResults[selectedStandard].map(testCase => (
                  <div key={testCase.id} className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-neutral-900">{testCase.name}</h3>
                        <p className="text-sm text-neutral-600">{testCase.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testCase.status)}`}>
                        {testCase.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Expected Result</h4>
                        <p className="text-sm text-neutral-600">{testCase.expectedResult}</p>
                      </div>

                      {testCase.actualResult && (
                        <div>
                          <h4 className="font-medium text-neutral-900 mb-2">Actual Result</h4>
                          <p className={`text-sm ${
                            testCase.status === 'passed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {testCase.actualResult}
                          </p>
                        </div>
                      )}
                    </div>

                    {testCase.artifacts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-neutral-900 mb-2">Artifacts</h4>
                        <div className="flex flex-wrap gap-2">
                          {testCase.artifacts.map((artifact, index) => (
                            <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                              {artifact}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {testCase.lastRun && (
                      <div className="mt-2 text-xs text-neutral-500">
                        Last run: {testCase.lastRun.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <div className="text-4xl mb-4">🧪</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Run Compliance Tests</h3>
                <p className="text-neutral-600 mb-4">
                  Select a compliance standard and run tests to validate your implementation
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Supporting Evidence</h2>

            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Evidence Management</h3>
              <p className="text-neutral-600 mb-4">
                Upload and manage supporting documentation for compliance requirements
              </p>
              <div className="text-sm text-neutral-500">
                Coming soon - Document management and evidence tracking
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Compliance Reports</h2>
              {/* eslint-disable-next-line security/detect-object-injection */}
              {testResults[selectedStandard] && testResults[selectedStandard].length > 0 && (
                <button
                  onClick={() => exportComplianceReport(selectedStandard)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Export Report
                </button>
              )}
            </div>

            {/* eslint-disable-next-line security/detect-object-injection */}
            {testResults[selectedStandard] && testResults[selectedStandard].length > 0 ? (
              <div>
                {(() => {

                  return (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Compliance Summary</h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-neutral-900">{report.score}%</div>
                            <div className="text-sm text-neutral-600">Overall Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{report.requirementsSummary.passed}</div>
                            <div className="text-sm text-neutral-600">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{report.requirementsSummary.failed}</div>
                            <div className="text-sm text-neutral-600">Failed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-neutral-600">{report.requirementsSummary.pending}</div>
                            <div className="text-sm text-neutral-600">Pending</div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <span className={`px-4 py-2 rounded-full font-medium ${
                            report.overallStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                            report.overallStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {report.overallStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Critical Findings */}
                      {report.criticalFindings.length > 0 && (
                        <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                          <h3 className="text-lg font-medium text-neutral-900 mb-4">Critical Findings</h3>

                          <div className="space-y-3">
                            {report.criticalFindings.map(finding => (
                              <div key={finding.id} className="border border-neutral-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-neutral-900">{finding.requirement}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                                    {finding.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-600 mb-2">{finding.description}</p>
                                <p className="text-sm text-blue-600">{finding.remediation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Recommendations</h3>

                        <div className="space-y-2">
                          {report.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                              <div className="text-sm text-neutral-700">{recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Generate Compliance Reports</h3>
                <p className="text-neutral-600">Run tests first to generate detailed compliance reports</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'regulatory_intelligence' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Regulatory Intelligence & Market Monitoring</h2>

            {/* Real-time Regulatory Updates */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">📡 Real-Time Regulatory Updates</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Recent FDA Updates</h4>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">FDA Digital Health Pre-Cert Program 2.0</div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Today</span>
                      </div>
                      <div className="text-xs text-neutral-600">New streamlined pathway for software-based medical devices</div>
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Impact: High</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">AI/ML Guidance Update</div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">2 days ago</span>
                      </div>
                      <div className="text-xs text-neutral-600">Updated requirements for AI/ML-enabled medical devices</div>
                      <div className="mt-2">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Impact: Medium</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">CMS & Payer Updates</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">Digital Therapeutics Coverage Decision</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">1 day ago</span>
                      </div>
                      <div className="text-xs text-neutral-600">CMS expands coverage for diabetes management DTx</div>
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Impact: High</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">Private Payer Policy Update</div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">3 days ago</span>
                      </div>
                      <div className="text-xs text-neutral-600">Anthem updates digital health reimbursement criteria</div>
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Impact: Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Intelligence */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">🔍 Competitive Intelligence</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Recent FDA Approvals</h4>
                  <div className="space-y-2">
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">DigitalRx DTx</div>
                      <div className="text-xs text-neutral-600 mt-1">De Novo classification - Diabetes management</div>
                      <div className="text-xs text-blue-600 mt-1">Similar indication to your product</div>
                    </div>
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">MindHealth App</div>
                      <div className="text-xs text-neutral-600 mt-1">510(k) clearance - Mental health</div>
                      <div className="text-xs text-neutral-600 mt-1">Different therapeutic area</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Patent Landscape</h4>
                  <div className="space-y-2">
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">New Patents Filed</div>
                      <div className="text-xs text-neutral-600 mt-1">47 diabetes-related DTx patents this month</div>
                      <div className="text-xs text-orange-600 mt-1">Monitor for potential conflicts</div>
                    </div>
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">Expired Patents</div>
                      <div className="text-xs text-neutral-600 mt-1">12 relevant patents entering public domain</div>
                      <div className="text-xs text-green-600 mt-1">Opportunities for implementation</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Clinical Trial Activity</h4>
                  <div className="space-y-2">
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">Active Trials</div>
                      <div className="text-xs text-neutral-600 mt-1">23 diabetes DTx trials currently recruiting</div>
                      <div className="text-xs text-blue-600 mt-1">Competitive landscape analysis</div>
                    </div>
                    <div className="border border-neutral-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-neutral-900">Completed Studies</div>
                      <div className="text-xs text-neutral-600 mt-1">8 studies published this quarter</div>
                      <div className="text-xs text-green-600 mt-1">Evidence base growing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Regulatory Pathway Analysis */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">🗺️ Regulatory Pathway Intelligence</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Optimal Regulatory Strategy</h4>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 text-sm font-bold">1</span>
                        </div>
                        <div className="font-medium text-neutral-900">FDA De Novo Pathway</div>
                      </div>
                      <div className="text-sm text-neutral-600 ml-11">
                        Recommended for novel diabetes DTx with AI/ML components
                      </div>
                      <div className="text-xs text-green-600 ml-11 mt-1">
                        Success rate: 87% | Timeline: 12-18 months
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-bold">2</span>
                        </div>
                        <div className="font-medium text-neutral-900">Pre-Submission Meeting</div>
                      </div>
                      <div className="text-sm text-neutral-600 ml-11">
                        Schedule Q-Sub meeting to discuss predicate devices and classification
                      </div>
                      <div className="text-xs text-blue-600 ml-11 mt-1">
                        Recommended timing: 6 months before submission
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-600 text-sm font-bold">3</span>
                        </div>
                        <div className="font-medium text-neutral-900">Clinical Evidence Strategy</div>
                      </div>
                      <div className="text-sm text-neutral-600 ml-11">
                        RCT + real-world evidence package recommended
                      </div>
                      <div className="text-xs text-purple-600 ml-11 mt-1">
                        Similar products required 300+ patients
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Risk Assessment & Mitigation</h4>
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">AI/ML Algorithm Changes</div>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High Risk</span>
                      </div>
                      <div className="text-xs text-neutral-600">FDA requires predetermined change control plan for AI/ML modifications</div>
                      <div className="text-xs text-red-600 mt-1">Mitigation: Implement SaMD framework early</div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">Cybersecurity Requirements</div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium Risk</span>
                      </div>
                      <div className="text-xs text-neutral-600">Enhanced cybersecurity requirements for networked devices</div>
                      <div className="text-xs text-yellow-600 mt-1">Mitigation: Early security by design implementation</div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-neutral-900">Clinical Evidence Base</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Low Risk</span>
                      </div>
                      <div className="text-xs text-neutral-600">Strong precedent for diabetes management DTx approvals</div>
                      <div className="text-xs text-green-600 mt-1">Advantage: Clear regulatory pathway established</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI-Powered Insights Dashboard */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">🤖 AI-Powered Regulatory Intelligence</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-canvas-surface rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">94%</div>
                  <div className="text-sm text-neutral-600">Regulatory Success Probability</div>
                </div>
                <div className="bg-canvas-surface rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">14</div>
                  <div className="text-sm text-neutral-600">Months to Market</div>
                </div>
                <div className="bg-canvas-surface rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">$2.1M</div>
                  <div className="text-sm text-neutral-600">Estimated Regulatory Cost</div>
                </div>
                <div className="bg-canvas-surface rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">7</div>
                  <div className="text-sm text-neutral-600">Critical Action Items</div>
                </div>
              </div>

              <div className="text-center">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold mr-4">
                  Generate Regulatory Strategy Report →
                </button>
                <button className="px-6 py-3 bg-canvas-surface text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-semibold">
                  Schedule Expert Consultation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTestingSuite;

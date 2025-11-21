// @ts-nocheck
'use client';

import React, { useState } from 'react';

interface TrialDesign {
  id: string;
  title: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  indication: string;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  sampleSize: number;
  duration: number; // in months
  sites: number;
  virtualComponents: VirtualComponent[];
  statisticalDesign: StatisticalDesign;
  riskAssessment: RiskAssessment;
}

interface VirtualComponent {
  name: string;
  type: 'virtual_visits' | 'remote_monitoring' | 'ecoa' | 'home_health' | 'telemedicine';
  frequency: string;
  technology: string;
  cost: number;
  feasibility: 'high' | 'medium' | 'low';
}

interface StatisticalDesign {
  type: 'superiority' | 'non_inferiority' | 'equivalence';
  power: number;
  alpha: number;
  effect_size: number;
  dropout_rate: number;
  interim_analyses: number;
}

interface RiskAssessment {
  enrollment_risk: 'low' | 'medium' | 'high';
  retention_risk: 'low' | 'medium' | 'high';
  technology_risk: 'low' | 'medium' | 'high';
  regulatory_risk: 'low' | 'medium' | 'high';
  overall_risk: 'low' | 'medium' | 'high';
}

interface SimulationResult {
  enrollment_timeline: SimulationDataPoint[];
  cost_projection: SimulationDataPoint[];
  success_probability: number;
  risk_factors: RiskFactor[];
  recommendations: string[];
}

interface SimulationDataPoint {
  month: number;
  value: number;
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
}

interface RiskFactor {
  category: string;
  risk: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

const ClinicalTrialDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design' | 'simulate' | 'optimize' | 'market_access' | 'export'>('design');
  const [trialDesign, setTrialDesign] = useState<TrialDesign>({
    id: 'trial-1',
    title: 'Digital Therapeutics Efficacy Study',
    phase: 'II',
    indication: 'Type 2 Diabetes',
    primaryEndpoint: 'Change in HbA1c from baseline at 12 weeks',
    secondaryEndpoints: [
      'Time to glucose target achievement',
      'Patient adherence to digital intervention',
      'Quality of life scores (SF-36)'
    ],
    inclusionCriteria: [
      'Adults aged 18-65',
      'Diagnosed with Type 2 diabetes',
      'HbA1c 7.0-10.0%',
      'Smartphone ownership'
    ],
    exclusionCriteria: [
      'Type 1 diabetes',
      'Severe comorbidities',
      'Pregnancy',
      'Inability to use smartphone'
    ],
    sampleSize: 300,
    duration: 6,
    sites: 5,
    virtualComponents: [
      {
        name: 'Virtual Baseline Visit',
        type: 'virtual_visits',
        frequency: 'Once',
        technology: 'Video conferencing + RPM devices',
        cost: 150,
        feasibility: 'high'
      },
      {
        name: 'Remote Glucose Monitoring',
        type: 'remote_monitoring',
        frequency: 'Daily',
        technology: 'Continuous Glucose Monitor + App',
        cost: 200,
        feasibility: 'high'
      },
      {
        name: 'Digital PRO Collection',
        type: 'ecoa',
        frequency: 'Weekly',
        technology: 'Mobile app questionnaires',
        cost: 50,
        feasibility: 'high'
      }
    ],
    statisticalDesign: {
      type: 'superiority',
      power: 0.8,
      alpha: 0.05,
      effect_size: 0.5,
      dropout_rate: 0.15,
      interim_analyses: 1
    },
    riskAssessment: {
      enrollment_risk: 'medium',
      retention_risk: 'low',
      technology_risk: 'low',
      regulatory_risk: 'medium',
      overall_risk: 'medium'
    }
  });

  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);

    // Simulate trial execution
    const enrollmentTimeline: SimulationDataPoint[] = [];
    const costProjection: SimulationDataPoint[] = [];

    for (let __month = 1; month <= trialDesign.duration + 6; month++) {
      // Enrollment simulation based on sites and virtual components

        trialDesign.sampleSize,
        (month * trialDesign.sites * 15) // 15 patients per site per month
      );

      enrollmentTimeline.push({
        month,
        value: Math.round(baseEnrollment * 0.8), // pessimistic
        scenario: 'pessimistic'
      });
      enrollmentTimeline.push({
        month,
        value: Math.round(baseEnrollment), // realistic
        scenario: 'realistic'
      });
      enrollmentTimeline.push({
        month,
        value: Math.round(baseEnrollment * 1.2), // optimistic
        scenario: 'optimistic'
      });

      // Cost projection

      costProjection.push({
        month,
        value: baseCost + virtualCost * 1.3, // pessimistic
        scenario: 'pessimistic'
      });
      costProjection.push({
        month,
        value: baseCost + virtualCost, // realistic
        scenario: 'realistic'
      });
      costProjection.push({
        month,
        value: baseCost + virtualCost * 0.8, // optimistic
        scenario: 'optimistic'
      });
    }

    const mockResults: SimulationResult = {
      enrollment_timeline: enrollmentTimeline,
      cost_projection: costProjection,
      success_probability: 0.78,
      risk_factors: [
        {
          category: 'Enrollment',
          risk: 'Slow patient recruitment in virtual sites',
          impact: 'medium',
          mitigation: 'Expand digital outreach, partner with telemedicine providers'
        },
        {
          category: 'Technology',
          risk: 'Device connectivity issues',
          impact: 'low',
          mitigation: 'Provide 24/7 tech support, backup devices'
        },
        {
          category: 'Regulatory',
          risk: 'FDA questions on digital endpoints',
          impact: 'medium',
          mitigation: 'Pre-submission meeting to align on endpoints'
        }
      ],
      recommendations: [
        'Consider adding 2 additional virtual sites to meet enrollment targets',
        'Implement patient incentive program to improve retention',
        'Add interim futility analysis at 50% enrollment',
        'Develop comprehensive digital literacy training materials'
      ]
    };

    setSimulationResults(mockResults);
  };

    switch (optimization) {
      case 'reduce_cost':
        setTrialDesign({
          ...trialDesign,
          sites: Math.max(3, trialDesign.sites - 1),
          virtualComponents: trialDesign.virtualComponents.map(comp => ({
            ...comp,
            cost: Math.round(comp.cost * 0.9)
          }))
        });
        break;
      case 'improve_enrollment':
        setTrialDesign({
          ...trialDesign,
          sites: trialDesign.sites + 2,
          virtualComponents: [
            ...trialDesign.virtualComponents,
            {
              name: 'Social Media Recruitment',
              type: 'virtual_visits',
              frequency: 'Continuous',
              technology: 'Digital advertising + screening',
              cost: 100,
              feasibility: 'high'
            }
          ]
        });
        break;
      case 'reduce_risk':
        setTrialDesign({
          ...trialDesign,
          statisticalDesign: {
            ...trialDesign.statisticalDesign,
            interim_analyses: 2,
            dropout_rate: 0.1
          }
        });
        break;
    }
  };

      title: trialDesign.title,
      phase: trialDesign.phase,
      design_summary: {
        primary_endpoint: trialDesign.primaryEndpoint,
        sample_size: trialDesign.sampleSize,
        duration: `${trialDesign.duration} months`,
        sites: trialDesign.sites,
        virtual_components: trialDesign.virtualComponents.length
      },
      statistical_plan: trialDesign.statisticalDesign,
      risk_mitigation: simulationResults?.risk_factors || [],
      estimated_cost: simulationResults?.cost_projection.find((p: any) => p.scenario === 'realistic' && p.month === trialDesign.duration)?.value || 0,
      success_probability: simulationResults?.success_probability || 0
    };

    if (typeof document === 'undefined') {
      console.warn('Protocol export is only available in the browser environment.');
      return;
    }

    const blob = new Blob([JSON.stringify(protocol, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${trialDesign.title.replace(/\s+/g, '_')}_protocol.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Clinical Trial Design & Simulation</h1>
          <p className="text-gray-600 mt-1">
            Design, simulate, and optimize digital clinical trials with AI-powered insights
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'design', label: '🎨 Design', desc: 'Protocol Development' },
              { key: 'simulate', label: '📊 Simulate', desc: 'Predictive Modeling' },
              { key: 'optimize', label: '⚡ Optimize', desc: 'AI Recommendations' },
              { key: 'market_access', label: '💰 Market Access', desc: 'Reimbursement Strategy' },
              { key: 'export', label: '📄 Export', desc: 'Protocol & Documentation' }
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
            {/* Trial Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trial Overview</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={trialDesign.title}
                    onChange={(e) => setTrialDesign({ ...trialDesign, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                    <select
                      value={trialDesign.phase}
                      onChange={(e) => setTrialDesign({ ...trialDesign, phase: e.target.value as unknown })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="I">Phase I</option>
                      <option value="II">Phase II</option>
                      <option value="III">Phase III</option>
                      <option value="IV">Phase IV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
                    <input
                      type="number"
                      value={trialDesign.sampleSize}
                      onChange={(e) => setTrialDesign({ ...trialDesign, sampleSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Endpoint</label>
                  <textarea
                    value={trialDesign.primaryEndpoint}
                    onChange={(e) => setTrialDesign({ ...trialDesign, primaryEndpoint: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Virtual Components */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Virtual Components</h2>

              <div className="space-y-3">
                {trialDesign.virtualComponents.map((component, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{component.name}</div>
                        <div className="text-sm text-gray-600">{component.technology}</div>
                      </div>
                      <div className="text-sm text-gray-600">${component.cost}</div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{component.frequency}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        component.feasibility === 'high' ? 'bg-green-100 text-green-800' :
                        component.feasibility === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {component.feasibility} feasibility
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400">
                + Add Virtual Component
              </button>
            </div>
          </div>
        )}

        {activeTab === 'simulate' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Trial Simulation</h2>
              <button
                onClick={runTrialSimulation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Run Simulation
              </button>
            </div>

            {simulationResults && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(simulationResults.success_probability * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Probability</div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${(simulationResults.cost_projection.find((p: any) => p.scenario === 'realistic' && p.month === trialDesign.duration)?.value / 1000000 || 0).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600">Estimated Cost</div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {trialDesign.duration + 3}
                    </div>
                    <div className="text-sm text-gray-600">Timeline (Months)</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>

                  <div className="space-y-4">
                    {simulationResults.risk_factors.map((risk, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{risk.category}</div>
                            <div className="text-sm text-gray-600">{risk.risk}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            risk.impact === 'high' ? 'bg-red-100 text-red-800' :
                            risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.impact} impact
                          </div>
                        </div>
                        <div className="text-sm text-blue-600">{risk.mitigation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">AI-Powered Optimizations</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reduce Cost</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Optimize site selection and virtual components to reduce overall trial cost by 15-25%
                </p>
                <button
                  onClick={() => optimizeTrial('reduce_cost')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Apply Optimization
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Improve Enrollment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add digital recruitment strategies and expand site network to accelerate enrollment
                </p>
                <button
                  onClick={() => optimizeTrial('improve_enrollment')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Optimization
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reduce Risk</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add interim analyses and improve retention strategies to minimize trial risk
                </p>
                <button
                  onClick={() => optimizeTrial('reduce_risk')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Apply Optimization
                </button>
              </div>
            </div>

            {simulationResults && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>

                <div className="space-y-2">
                  {simulationResults.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="text-sm text-gray-700">{recommendation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'market_access' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Market Access & Reimbursement Strategy</h2>

            {/* Market Access Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Payer Landscape</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Target Payers</div>
                    <div className="text-xs text-gray-600 mt-1">
                      CMS Medicare, Private Insurance, Health Systems
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Coverage Gap</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Digital therapeutics coverage varies by region
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Market Size</div>
                    <div className="text-xs text-gray-600 mt-1">
                      $2.4B addressable market for diabetes DTx
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Health Economics</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Cost-Effectiveness</div>
                    <div className="text-xs text-gray-600 mt-1">
                      ICER: $15,400/QALY (Well below threshold)
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Budget Impact</div>
                    <div className="text-xs text-gray-600 mt-1">
                      $847 PMPM savings vs. standard of care
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">ROI Timeline</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Positive ROI within 8 months
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xl">⚖️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Regulatory Path</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">FDA Designation</div>
                    <div className="text-xs text-gray-600 mt-1">
                      De Novo pathway recommended
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Evidence Requirements</div>
                    <div className="text-xs text-gray-600 mt-1">
                      RCT + Real-world evidence needed
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900">Timeline</div>
                    <div className="text-xs text-gray-600 mt-1">
                      18-24 months to market access
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reimbursement Strategy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reimbursement Strategy Framework</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Evidence Generation Plan</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Clinical efficacy endpoints aligned with payer priorities</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Health economic outcomes measurement</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Patient-reported outcomes integration</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Real-world evidence collection plan</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payer Engagement Strategy</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Early payer advisory board establishment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Value proposition development</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">CPT code strategy planning</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">Coverage policy development support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HEOR Study Design */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Economic Outcomes Research (HEOR) Integration</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Primary Economic Endpoints</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900">Healthcare Utilization</div>
                      <div className="text-xs text-gray-600 mt-1">
                        • Emergency department visits<br/>
                        • Hospital admissions<br/>
                        • Specialist consultations<br/>
                        • Medication adherence
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900">Cost Outcomes</div>
                      <div className="text-xs text-gray-600 mt-1">
                        • Direct medical costs<br/>
                        • Indirect costs (productivity)<br/>
                        • Cost per quality-adjusted life year<br/>
                        • Budget impact modeling
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Market Access Milestones</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-900">Phase II Completion</div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Month 18</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Early payer discussions & value framework</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-900">Phase III Readout</div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Month 36</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Health economic data publication</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-900">FDA Clearance</div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Month 42</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Coverage determination submissions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Proposition Canvas */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Value Proposition Canvas</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Clinical Value</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 1.2% HbA1c reduction vs. SOC</li>
                    <li>• 40% improvement in adherence</li>
                    <li>• 25% reduction in hypoglycemic events</li>
                    <li>• Enhanced quality of life scores</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Economic Value</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• $2,400 annual cost savings per patient</li>
                    <li>• 30% reduction in ER visits</li>
                    <li>• 20% decrease in specialist visits</li>
                    <li>• Positive ROI within 8 months</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Operational Value</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Scalable digital delivery model</li>
                    <li>• Integration with existing EHRs</li>
                    <li>• Real-time patient monitoring</li>
                    <li>• Reduced provider burden</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold">
                  Generate Market Access Plan →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Export Protocol & Documentation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Protocol Documents</h3>

                <div className="space-y-3">
                  <button
                    onClick={exportTrialProtocol}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="font-medium">📄 Clinical Trial Protocol</div>
                    <div className="text-sm text-gray-600">Complete protocol with statistical plan</div>
                  </button>

                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">📊 Statistical Analysis Plan</div>
                    <div className="text-sm text-gray-600">Detailed SAP with interim analyses</div>
                  </button>

                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">⚠️ Risk Management Plan</div>
                    <div className="text-sm text-gray-600">Risk assessment and mitigation strategies</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regulatory Submissions</h3>

                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">🏛️ FDA IND Application</div>
                    <div className="text-sm text-gray-600">Ready-to-submit IND package</div>
                  </button>

                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">🌍 EMA CTA Submission</div>
                    <div className="text-sm text-gray-600">Clinical Trial Authorization for EU</div>
                  </button>

                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="font-medium">🏥 IRB/EC Package</div>
                    <div className="text-sm text-gray-600">Ethics committee submission materials</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalTrialDesigner;

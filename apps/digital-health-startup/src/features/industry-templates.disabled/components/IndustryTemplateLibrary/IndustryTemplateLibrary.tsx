'use client';

import React, { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subcategory: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number; // hours
  components: TemplateComponent[];
  features: string[];
  compliance: string[];
  useCases: string[];
  rating: number;
  downloads: number;
  preview?: string;
  documentation: string;
}

interface TemplateComponent {
  name: string;
  type: string;
  description: string;
  configurable: boolean;
}

type TemplateCategory =
  | 'chronic_disease'
  | 'mental_health'
  | 'medication_adherence'
  | 'clinical_decision_support'
  | 'population_health'
  | 'telemedicine'
  | 'clinical_trials'
  | 'patient_engagement';

interface Props {
  organizationId: string;
}

const IndustryTemplateLibrary: React.FC<Props> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-templates' | 'custom' | 'security'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  // Mock templates data
  const templates: Template[] = [
    {
      id: 'template-001',
      name: 'Diabetes Management Platform',
      description: 'Comprehensive digital solution for Type 2 diabetes monitoring and management',
      category: 'chronic_disease',
      subcategory: 'Diabetes',
      complexity: 'intermediate',
      estimatedTime: 4,
      components: [
        { name: 'Patient Dashboard', type: 'UI Component', description: 'Real-time glucose monitoring interface', configurable: true },
        { name: 'Medication Tracker', type: 'Feature Module', description: 'Track insulin and medication schedules', configurable: true },
        { name: 'Care Team Portal', type: 'Web App', description: 'Healthcare provider interface', configurable: false },
        { name: 'Alert System', type: 'Service', description: 'Automated alerts for critical values', configurable: true },
        { name: 'Data Export', type: 'Integration', description: 'Export data to EHR systems', configurable: true }
      ],
      features: [
        'Continuous glucose monitoring integration',
        'Medication adherence tracking',
        'Care team collaboration',
        'Automated risk alerts',
        'Progress analytics'
      ],
      compliance: ['HIPAA', 'FDA 21 CFR Part 11', 'ISO 27001'],
      useCases: [
        'Remote patient monitoring',
        'Chronic disease management',
        'Care coordination',
        'Population health analytics'
      ],
      rating: 4.8,
      downloads: 1247,
      preview: '/previews/diabetes-template.png',
      documentation: 'https://docs.vital.com/templates/diabetes'
    },
    {
      id: 'template-002',
      name: 'Mental Health Assessment Suite',
      description: 'Complete mental health screening and monitoring platform with validated instruments',
      category: 'mental_health',
      subcategory: 'Assessment',
      complexity: 'advanced',
      estimatedTime: 6,
      components: [
        { name: 'Assessment Builder', type: 'Tool', description: 'Create custom psychological assessments', configurable: true },
        { name: 'PHQ-9 Integration', type: 'Assessment', description: 'Validated depression screening', configurable: false },
        { name: 'GAD-7 Integration', type: 'Assessment', description: 'Anxiety disorder screening', configurable: false },
        { name: 'Crisis Detection', type: 'AI Module', description: 'Automated risk assessment', configurable: true },
        { name: 'Provider Dashboard', type: 'Analytics', description: 'Clinical insights and trends', configurable: true }
      ],
      features: [
        'Validated assessment instruments',
        'Automated scoring and interpretation',
        'Crisis intervention protocols',
        'Longitudinal tracking',
        'Provider reporting'
      ],
      compliance: ['HIPAA', '42 CFR Part 2', 'GDPR'],
      useCases: [
        'Mental health screening',
        'Treatment monitoring',
        'Crisis intervention',
        'Population mental health'
      ],
      rating: 4.9,
      downloads: 892,
      preview: '/previews/mental-health-template.png',
      documentation: 'https://docs.vital.com/templates/mental-health'
    },
    {
      id: 'template-003',
      name: 'Medication Adherence Tracker',
      description: 'Smart medication management with reminders, tracking, and clinical insights',
      category: 'medication_adherence',
      subcategory: 'Adherence',
      complexity: 'basic',
      estimatedTime: 2,
      components: [
        { name: 'Medication Calendar', type: 'UI Component', description: 'Visual medication schedule', configurable: true },
        { name: 'Smart Reminders', type: 'Notification Service', description: 'Personalized medication alerts', configurable: true },
        { name: 'Adherence Analytics', type: 'Analytics Module', description: 'Track adherence patterns', configurable: false },
        { name: 'Pharmacy Integration', type: 'API Integration', description: 'Connect with pharmacy systems', configurable: true }
      ],
      features: [
        'Smart pill reminders',
        'Adherence analytics',
        'Pharmacy integration',
        'Side effect tracking',
        'Refill notifications'
      ],
      compliance: ['HIPAA', 'FDA'],
      useCases: [
        'Medication management',
        'Chronic disease care',
        'Post-discharge care',
        'Clinical trials'
      ],
      rating: 4.6,
      downloads: 2156,
      preview: '/previews/medication-template.png',
      documentation: 'https://docs.vital.com/templates/medication'
    }
  ];

    { key: 'all', label: 'All Templates', count: templates.length },
    { key: 'chronic_disease', label: 'Chronic Disease', count: templates.filter((t: any) => t.category === 'chronic_disease').length },
    { key: 'mental_health', label: 'Mental Health', count: templates.filter((t: any) => t.category === 'mental_health').length },
    { key: 'medication_adherence', label: 'Medication Adherence', count: templates.filter((t: any) => t.category === 'medication_adherence').length },
    { key: 'clinical_decision_support', label: 'Clinical Decision Support', count: 0 },
    { key: 'population_health', label: 'Population Health', count: 0 },
    { key: 'telemedicine', label: 'Telemedicine', count: 0 }
  ];

    { key: 'browse', label: 'Browse Templates', icon: '📚' },
    { key: 'my-templates', label: 'My Templates', icon: '🏠' },
    { key: 'custom', label: 'Custom Builder', icon: '🔧' },
    { key: 'security', label: 'Security Center', icon: '🔒' }
  ];

    ? templates
    : templates.filter(template => template.category === selectedCategory);

    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Industry Template Library</h1>
              <p className="text-gray-600 mt-1">
                Pre-built solutions for specific healthcare use cases with industry best practices
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Request Template
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Create Custom
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'browse' && (
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key as unknown)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category.key
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        <span className="text-xs text-gray-400">{category.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Templates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular</h3>
                <div className="space-y-3">
                  {templates.slice(0, 3).map(template => (
                    <div key={template.id} className="text-sm">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="mr-2">{formatRating(template.rating)}</span>
                        <span>{template.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search templates..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Complexity</option>
                    <option>Basic</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Compliance</option>
                    <option>HIPAA</option>
                    <option>FDA</option>
                    <option>GDPR</option>
                  </select>
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{template.name}</h3>
                          <p className="text-gray-600 mb-3">{template.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <span className="text-sm text-yellow-500 mr-2">
                          {formatRating(template.rating)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({template.downloads.toLocaleString()} downloads)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                          {template.complexity}
                        </span>
                        <span className="text-sm text-gray-600">⏱️ {template.estimatedTime}h setup</span>
                      </div>

                      {/* Components Preview */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Key Components:</h4>
                        <div className="space-y-1">
                          {template.components.slice(0, 3).map((component, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                              {component.name}
                            </div>
                          ))}
                          {template.components.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{template.components.length - 3} more components
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compliance Badges */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.compliance.map(standard => (
                          <span key={standard} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                            ✓ {standard}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                          Use Template
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                          Preview
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">🛡️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Security Score</p>
                    <p className="text-2xl font-semibold text-green-600">98%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🔐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Threats</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-sm">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Vulnerabilities</p>
                    <p className="text-2xl font-semibold text-yellow-600">3</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Compliance</p>
                    <p className="text-2xl font-semibold text-green-600">100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Threat Detection',
                  description: 'AI-powered threat detection and real-time security monitoring',
                  icon: '🔍',
                  status: 'active',
                  features: ['Real-time monitoring', 'Behavioral analytics', 'Threat intelligence', 'Incident response']
                },
                {
                  title: 'Vulnerability Scanning',
                  description: 'Automated security vulnerability assessment and remediation',
                  icon: '🔧',
                  status: 'active',
                  features: ['Automated scanning', 'Risk prioritization', 'Patch management', 'Compliance reporting']
                },
                {
                  title: 'Penetration Testing',
                  description: 'Professional security testing and vulnerability assessment',
                  icon: '🎯',
                  status: 'available',
                  features: ['Ethical hacking', 'Security assessment', 'Risk analysis', 'Remediation guidance']
                },
                {
                  title: 'Security Audit Logs',
                  description: 'Comprehensive audit trail and security event logging',
                  icon: '📝',
                  status: 'active',
                  features: ['Complete audit trail', 'Event correlation', 'Compliance reporting', 'Forensic analysis']
                },
                {
                  title: 'Access Control',
                  description: 'Advanced identity and access management with MFA',
                  icon: '🔑',
                  status: 'active',
                  features: ['Multi-factor auth', 'Role-based access', 'Session management', 'Identity verification']
                },
                {
                  title: 'Data Protection',
                  description: 'End-to-end encryption and data loss prevention',
                  icon: '🔒',
                  status: 'active',
                  features: ['Data encryption', 'DLP policies', 'Backup security', 'Key management']
                }
              ].map(feature => (
                <div key={feature.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{feature.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.features.map((item: any) => (
                      <div key={item} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                    {feature.status === 'active' ? 'Configure' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>

            {/* Security Compliance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { standard: 'HIPAA', status: 'compliant', score: 100, lastAudit: '2024-01-15' },
                  { standard: 'SOC 2 Type II', status: 'compliant', score: 98, lastAudit: '2024-02-01' },
                  { standard: 'ISO 27001', status: 'compliant', score: 96, lastAudit: '2024-01-30' },
                  { standard: 'GDPR', status: 'compliant', score: 100, lastAudit: '2024-02-10' }
                ].map(compliance => (
                  <div key={compliance.standard} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{compliance.standard}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        compliance.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {compliance.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-medium text-gray-900">{compliance.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${compliance.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last audit: {new Date(compliance.lastAudit).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Update Password Policy',
                    description: 'Implement stronger password requirements including special characters',
                    priority: 'medium',
                    effort: 'low'
                  },
                  {
                    title: 'Enable Advanced Threat Protection',
                    description: 'Add behavioral analytics for enhanced threat detection',
                    priority: 'high',
                    effort: 'medium'
                  },
                  {
                    title: 'Schedule Penetration Testing',
                    description: 'Annual penetration testing recommended for compliance',
                    priority: 'low',
                    effort: 'high'
                  }
                ].map((recommendation, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {recommendation.priority} priority
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {recommendation.effort} effort
                        </span>
                      </div>
                    </div>
                    <button className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                      Implement
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryTemplateLibrary;
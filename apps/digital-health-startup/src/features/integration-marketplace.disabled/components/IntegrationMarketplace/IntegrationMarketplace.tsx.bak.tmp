'use client';

import React, { useState, useEffect } from 'react';

import { Integration, IntegrationCategory, IntegrationInstance } from '../../types';

interface Props {
  organizationId: string;
}

const IntegrationMarketplace: React.FC<Props> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'installed' | 'custom' | 'builder'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [installedIntegrations, setInstalledIntegrations] = useState<IntegrationInstance[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: 'int-001',
        name: 'Epic MyChart Integration',
        slug: 'epic-mychart',
        description: 'Connect with Epic MyChart for comprehensive EHR data access',
        longDescription: 'Full-featured integration with Epic MyChart providing patient data, appointments, and clinical records access.',
        category: 'ehr_systems',
        subcategory: 'Epic Systems',
        provider: {
          id: 'epic-systems',
          name: 'Epic Systems Corporation',
          website: 'https://epic.com',
          contactEmail: 'contact@epic.com',
          supportEmail: 'support@epic.com',
          logo: '/logos/epic.png',
          verified: true,
          partnerTier: 'platinum',
          joinedDate: new Date('2020-01-01')
        },
        version: '2.1.0',
        status: 'active',
        pricing: {
          type: 'enterprise',
          baseCost: 5000,
          currency: 'USD',
          billingCycle: 'monthly',
          tiers: [
            {
              name: 'Basic',
              price: 5000,
              features: ['Read-only access', 'Basic patient data', 'Standard support'],
              limits: { 'api_calls_per_month': 100000 },
              description: 'Essential EHR connectivity'
            }
          ]
        },
        compatibility: {
          platformVersions: ['4.0+'],
          requiredFeatures: ['HIPAA compliance', 'Data encryption'],
          optionalFeatures: ['Real-time sync'],
          dependencies: [],
          conflicts: [],
          supportedRegions: ['US', 'CA']
        },
        authentication: {
          methods: [
            {
              type: 'oauth2',
              name: 'OAuth 2.0',
              description: 'Industry standard OAuth 2.0 authentication',
              configuration: { /* TODO: implement */ },
              required: true
            }
          ],
          scopes: [
            {
              name: 'patient.read',
              description: 'Read patient demographic and clinical data',
              permissions: ['read'],
              required: true
            }
          ],
          tokenExpiry: 3600,
          refreshToken: true,
          webhookAuth: true,
          ipWhitelist: false
        },
        endpoints: [],
        webhooks: [],
        documentation: {
          apiReference: 'https://docs.epic.com/api',
          quickStart: 'https://docs.epic.com/quickstart',
          tutorials: [],
          sdks: [],
          changelog: 'https://docs.epic.com/changelog',
          faq: 'https://docs.epic.com/faq'
        },
        support: {
          channels: [
            {
              type: 'email',
              contact: 'support@epic.com',
              availability: '24/7',
              responseTime: '2 hours',
              languages: ['en']
            }
          ],
          sla: {
            uptime: 99.9,
            responseTime: 200,
            resolution: {
              critical: '4 hours',
              high: '8 hours',
              medium: '24 hours',
              low: '72 hours'
            }
          },
          knowledgeBase: 'https://kb.epic.com',
          communityForum: 'https://community.epic.com'
        },
        ratings: {
          averageRating: 4.5,
          totalReviews: 89,
          ratingDistribution: { 5: 45, 4: 30, 3: 10, 2: 3, 1: 1 },
          reviews: []
        },
        installation: {
          method: 'guided_setup',
          requirements: [
            {
              type: 'compliance',
              name: 'HIPAA BAA',
              description: 'Business Associate Agreement required',
              required: true
            }
          ],
          steps: [],
          estimatedTime: 120,
          complexity: 'complex',
          reversible: true
        },
        configuration: {
          schema: {
            type: 'object',
            properties: { /* TODO: implement */ },
            required: [],
            additionalProperties: false
          },
          uiSchema: { /* TODO: implement */ },
          defaultValues: { /* TODO: implement */ },
          validation: [],
          sections: []
        },
        metadata: {
          tags: ['EHR', 'Epic', 'Healthcare', 'FHIR'],
          industries: ['Healthcare'],
          useCases: ['Patient Data Access', 'Clinical Integration'],
          dataTypes: ['Patient Demographics', 'Clinical Records'],
          protocols: ['FHIR R4', 'OAuth 2.0'],
          standards: ['HIPAA', 'HL7'],
          certifications: ['HIPAA', 'SOC 2'],
          lastTested: new Date(),
          testResults: []
        },
        created: new Date('2020-01-01'),
        modified: new Date()
      },
      {
        id: 'int-002',
        name: 'Cerner PowerChart Integration',
        slug: 'cerner-powerchart',
        description: 'Seamless integration with Cerner PowerChart EHR system',
        longDescription: 'Connect your applications with Cerner PowerChart for comprehensive healthcare data management.',
        category: 'ehr_systems',
        subcategory: 'Cerner',
        provider: {
          id: 'cerner',
          name: 'Cerner Corporation',
          website: 'https://cerner.com',
          contactEmail: 'contact@cerner.com',
          supportEmail: 'support@cerner.com',
          logo: '/logos/cerner.png',
          verified: true,
          partnerTier: 'gold',
          joinedDate: new Date('2020-06-01')
        },
        version: '1.8.5',
        status: 'active',
        pricing: {
          type: 'paid',
          baseCost: 3500,
          currency: 'USD',
          billingCycle: 'monthly',
          tiers: [
            {
              name: 'Professional',
              price: 3500,
              features: ['Full API access', 'Webhook support', 'Priority support'],
              limits: { 'api_calls_per_month': 75000 },
              description: 'Complete Cerner integration'
            }
          ]
        },
        compatibility: {
          platformVersions: ['4.0+'],
          requiredFeatures: ['HIPAA compliance'],
          optionalFeatures: [],
          dependencies: [],
          conflicts: [],
          supportedRegions: ['US']
        },
        authentication: {
          methods: [
            {
              type: 'oauth2',
              name: 'OAuth 2.0',
              description: 'Standard OAuth 2.0 flow',
              configuration: { /* TODO: implement */ },
              required: true
            }
          ],
          scopes: [],
          tokenExpiry: 7200,
          refreshToken: true,
          webhookAuth: false,
          ipWhitelist: true
        },
        endpoints: [],
        webhooks: [],
        documentation: {
          apiReference: 'https://docs.cerner.com/api',
          quickStart: 'https://docs.cerner.com/start',
          tutorials: [],
          sdks: [],
          changelog: 'https://docs.cerner.com/changes',
          faq: 'https://docs.cerner.com/help'
        },
        support: {
          channels: [
            {
              type: 'ticket',
              contact: 'https://support.cerner.com',
              availability: 'Business hours',
              responseTime: '4 hours',
              languages: ['en']
            }
          ],
          sla: {
            uptime: 99.5,
            responseTime: 300,
            resolution: {
              critical: '8 hours',
              high: '24 hours',
              medium: '48 hours',
              low: '5 days'
            }
          },
          knowledgeBase: 'https://kb.cerner.com',
          communityForum: ''
        },
        ratings: {
          averageRating: 4.2,
          totalReviews: 52,
          ratingDistribution: { 5: 22, 4: 20, 3: 8, 2: 2, 1: 0 },
          reviews: []
        },
        installation: {
          method: 'manual_configuration',
          requirements: [],
          steps: [],
          estimatedTime: 180,
          complexity: 'complex',
          reversible: true
        },
        configuration: {
          schema: {
            type: 'object',
            properties: { /* TODO: implement */ },
            required: [],
            additionalProperties: false
          },
          uiSchema: { /* TODO: implement */ },
          defaultValues: { /* TODO: implement */ },
          validation: [],
          sections: []
        },
        metadata: {
          tags: ['EHR', 'Cerner', 'Healthcare'],
          industries: ['Healthcare'],
          useCases: ['Clinical Data', 'Patient Management'],
          dataTypes: ['Clinical Records', 'Orders'],
          protocols: ['FHIR', 'HL7'],
          standards: ['HIPAA'],
          certifications: ['HIPAA'],
          lastTested: new Date(),
          testResults: []
        },
        created: new Date('2020-06-01'),
        modified: new Date()
      }
    ];

    const mockInstalledIntegrations: IntegrationInstance[] = [
      {
        id: 'inst-001',
        organizationId: organizationId,
        integrationId: 'int-001',
        name: 'Epic MyChart - Production',
        status: 'active',
        configuration: { /* TODO: implement */ },
        credentials: {
          keyId: 'key-001',
          encryptedData: 'encrypted_credentials_data',
          algorithm: 'AES-256',
          lastRotated: new Date()
        },
        settings: {
          autoUpdate: true,
          syncFrequency: 60,
          retryAttempts: 3,
          errorNotifications: true,
          loggingLevel: 'info',
          customMappings: []
        },
        monitoring: {
          enabled: true,
          metrics: ['response_time', 'error_rate', 'throughput'],
          alerts: []
        },
        usage: {
          totalCalls: 45678,
          successfulCalls: 44892,
          failedCalls: 786,
          averageResponseTime: 245,
          dataTransferred: 1024000,
          lastActivity: new Date(),
          dailyStats: []
        },
        health: {
          overall: 'healthy',
          checks: [
            {
              name: 'API Connectivity',
              status: 'pass',
              message: 'API endpoint responding normally',
              timestamp: new Date(),
              duration: 120
            },
            {
              name: 'Authentication',
              status: 'pass',
              message: 'OAuth token valid',
              timestamp: new Date(),
              duration: 50
            }
          ],
          lastChecked: new Date(),
          uptime: 99.8
        },
        logs: [],
        created: new Date('2024-01-01'),
        modified: new Date(),
        lastSync: new Date()
      }
    ];

    setIntegrations(mockIntegrations);
    setInstalledIntegrations(mockInstalledIntegrations);
    setLoading(false);
  }, [organizationId]);

    { key: 'all', label: 'All Categories', count: integrations.length },
    { key: 'ehr_systems', label: 'EHR Systems', count: integrations.filter(i => i.category === 'ehr_systems').length },
    { key: 'laboratory_systems', label: 'Laboratory', count: 0 },
    { key: 'imaging_systems', label: 'Medical Imaging', count: 0 },
    { key: 'wearables_iot', label: 'Wearables & IoT', count: 0 },
    { key: 'analytics_bi', label: 'Analytics & BI', count: 0 },
    { key: 'cloud_services', label: 'Cloud Services', count: 0 }
  ];

    { key: 'browse', label: 'Browse', icon: '🔍' },
    { key: 'installed', label: 'Installed', icon: '✅' },
    { key: 'custom', label: 'Custom', icon: '🔧' },
    { key: 'builder', label: 'Builder', icon: '🏗️' }
  ];

    ? integrations
    : integrations.filter(integration => integration.category === selectedCategory);

    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    if (pricing.type === 'free') return 'Free';
    if (pricing.type === 'enterprise') return 'Enterprise';
    return `$${pricing.baseCost}/${pricing.billingCycle}`;
  };

    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Integration Marketplace</h1>
              <p className="text-gray-600 mt-1">
                Connect your platform with healthcare systems, APIs, and third-party services
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Request Integration
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Build Custom
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
                {tab.key === 'installed' && installedIntegrations.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {installedIntegrations.length}
                  </span>
                )}
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

              {/* Popular Integrations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Popular</h3>
                <div className="space-y-3">
                  {integrations.slice(0, 3).map(integration => (
                    <div key={integration.id} className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-xs font-medium">
                          {integration.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatRating(integration.ratings.averageRating)} ({integration.ratings.totalReviews})
                        </p>
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
                      placeholder="Search integrations..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Providers</option>
                    <option>Verified Only</option>
                    <option>Enterprise Partners</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Pricing</option>
                    <option>Free</option>
                    <option>Paid</option>
                    <option>Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Integration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredIntegrations.map(integration => (
                  <div key={integration.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg font-bold">
                              {integration.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-600">{integration.provider.name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                      <div className="flex items-center mb-4">
                        <span className="text-sm text-yellow-500 mr-2">
                          {formatRating(integration.ratings.averageRating)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({integration.ratings.totalReviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-4">💰 {getPricingLabel(integration.pricing)}</span>
                          <span>📊 v{integration.version}</span>
                        </div>
                        {integration.provider.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {integration.metadata.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                          Install
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

        {activeTab === 'installed' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Installed Integrations</h2>
              <div className="text-sm text-gray-500">
                {installedIntegrations.length} active integrations
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {installedIntegrations.map(instance => {

                return (
                  <div key={instance.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-lg font-bold">
                              {instance.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{instance.name}</h3>
                            <p className="text-sm text-gray-600">{integration?.provider.name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          instance.status === 'active' ? 'bg-green-100 text-green-800' :
                          instance.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {instance.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Health Status</span>
                          <span className={`font-medium ${
                            instance.health.overall === 'healthy' ? 'text-green-600' :
                            instance.health.overall === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {instance.health.overall === 'healthy' ? '🟢' :
                             instance.health.overall === 'warning' ? '🟡' : '🔴'} {instance.health.overall}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-medium">{instance.health.uptime}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">API Calls</span>
                          <span className="font-medium">{instance.usage.totalCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Sync</span>
                          <span className="font-medium">
                            {instance.lastSync?.toLocaleDateString() || 'Never'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                          Configure
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                          Monitor
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Integrations</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Build custom integrations tailored to your specific needs. Connect with proprietary systems, legacy databases, or unique API requirements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Builder</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag-and-drop interface to create integrations without coding
                  </p>
                  <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                    Launch Builder
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-3xl mb-3">💻</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Templates</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start with pre-built templates and customize with your own code
                  </p>
                  <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                    Browse Templates
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-3xl mb-3">🤝</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Services</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Let our experts build a custom integration for your organization
                  </p>
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Integration Builder</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Create powerful integrations with our visual builder. No coding required for most common integration patterns.
              </p>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'REST API Integration', icon: '🌐', description: 'Connect to RESTful web services' },
                        { name: 'Database Connector', icon: '🗃️', description: 'Sync data with databases' },
                        { name: 'Webhook Handler', icon: '📡', description: 'Process incoming webhooks' },
                        { name: 'File Transfer', icon: '📁', description: 'Automated file synchronization' },
                        { name: 'Message Queue', icon: '📬', description: 'Async message processing' }
                      ].map(template => (
                        <div key={template.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                          <span className="text-2xl mr-3">{template.icon}</span>
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                            <p className="text-xs text-gray-600">{template.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Builder Features</h3>
                    <div className="space-y-4">
                      {[
                        { feature: 'Visual Flow Designer', icon: '🎨' },
                        { feature: 'Data Transformation', icon: '⚡' },
                        { feature: 'Error Handling', icon: '🛡️' },
                        { feature: 'Testing & Debugging', icon: '🧪' },
                        { feature: 'Deployment Pipeline', icon: '🚀' },
                        { feature: 'Monitoring & Alerts', icon: '📊' }
                      ].map(item => (
                        <div key={item.feature} className="flex items-center">
                          <span className="text-xl mr-3">{item.icon}</span>
                          <span className="text-sm text-gray-900">{item.feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <button className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Launch Integration Builder
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

export default IntegrationMarketplace;
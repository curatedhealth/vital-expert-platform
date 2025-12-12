'use client';

import React, { useState, useEffect } from 'react';

import { Organization, OrganizationMember, SubscriptionTier, OrganizationStatus } from '../../types';

interface Props {
  organizationId?: string;
  userRole: 'super_admin' | 'organization_admin' | 'member';
}

const TenantManagementDashboard: React.FC<Props> = ({ organizationId, userRole }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'billing' | 'settings' | 'security' | 'usage'>('overview');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockOrganization: Organization = {
      id: 'org-123',
      name: 'HealthTech Solutions Inc.',
      slug: 'healthtech-solutions',
      domain: 'healthtech.com',
      tier: 'enterprise',
      status: 'active',
      settings: {
        branding: {
          primaryColor: '#0066cc',
          secondaryColor: '#f0f9ff',
          whiteLabel: true
        },
        security: {
          ssoEnabled: true,
          ssoProvider: 'okta',
          mfaRequired: true,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          ipWhitelist: [],
          sessionTimeout: 480,
          auditLogging: true
        },
        integrations: {
          apiKeysEnabled: true,
          webhooksEnabled: true,
          maxApiCalls: 100000,
          rateLimitPerMinute: 1000,
          allowedOrigins: ['https://healthtech.com']
        },
        features: {
          'advanced_analytics': true,
          'custom_integrations': true,
          'white_label': true,
          'priority_support': true
        },
        compliance: {
          hipaaEnabled: true,
          gdprEnabled: true,
          dataRetentionDays: 2555,
          encryptionAtRest: true,
          auditTrail: true
        }
      },
      billing: {
        customerId: 'cust_123',
        subscriptionId: 'sub_123',
        plan: {
          id: 'plan_enterprise',
          name: 'Enterprise Plan',
          tier: 'enterprise',
          price: 2500,
          currency: 'USD',
          features: [
            { name: 'Unlimited Projects', description: 'Create unlimited solution projects', included: true },
            { name: 'Advanced Analytics', description: 'Business intelligence dashboards', included: true },
            { name: 'Custom Integrations', description: 'Connect to any system via APIs', included: true },
            { name: 'White Label', description: 'Full platform customization', included: true },
            { name: 'Priority Support', description: '24/7 dedicated support team', included: true }
          ],
          limits: {
            maxUsers: 500,
            maxProjects: -1,
            maxStorage: 1000,
            maxApiCalls: 1000000,
            maxIntegrations: 100
          }
        },
        billingCycle: 'annual',
        status: 'active',
        nextBillingDate: new Date('2025-01-15'),
        paymentMethod: {
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2027
        },
        invoices: []
      },
      created: new Date('2024-01-15'),
      modified: new Date(),
      owner: 'user-456',
      members: [],
      usage: {
        currentPeriod: {
          startDate: new Date('2024-12-01'),
          endDate: new Date('2024-12-31'),
          metrics: {
            activeUsers: 45,
            apiCalls: 125000,
            storageUsed: 85.5,
            projectsCreated: 12,
            deploymentsCount: 48,
            testRuns: 892
          }
        },
        historical: []
      },
      limits: {
        maxUsers: 500,
        maxProjects: -1,
        maxStorage: 1000,
        maxApiCalls: 1000000,
        rateLimit: {
          requestsPerMinute: 1000,
          requestsPerHour: 50000,
          burstLimit: 2000
        },
        features: [
          { feature: 'projects', limit: -1, used: 12 },
          { feature: 'storage_gb', limit: 1000, used: 85 },
          { feature: 'api_calls', limit: 1000000, used: 125000 }
        ]
      }
    };

    const mockMembers: OrganizationMember[] = [
      {
        id: 'member-1',
        userId: 'user-456',
        organizationId: 'org-123',
        role: 'owner',
        permissions: [],
        status: 'active',
        joinedDate: new Date('2024-01-15'),
        lastActive: new Date()
      },
      {
        id: 'member-2',
        userId: 'user-789',
        organizationId: 'org-123',
        role: 'admin',
        permissions: [],
        status: 'active',
        joinedDate: new Date('2024-02-01'),
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setOrganization(mockOrganization);
    setMembers(mockMembers);
    setLoading(false);
  }, []);

  if (loading || !organization) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading tenant management...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'members', label: 'Members', icon: '👥' },
    { key: 'billing', label: 'Billing', icon: '💳' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
    { key: 'security', label: 'Security', icon: '🔐' },
    { key: 'usage', label: 'Usage', icon: '📈' }
  ];

  const getStatusColor = (status: OrganizationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'starter': return 'bg-neutral-100 text-neutral-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gold-100 text-gold-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-canvas-surface border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{organization.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(organization.status)}`}>
                  {organization.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(organization.tier)}`}>
                  {organization.tier.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-neutral-500">
                  {organization.usage.currentPeriod.metrics.activeUsers} active users
                </span>
              </div>
            </div>

            {userRole === 'organization_admin' && (
              <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-canvas-surface border border-neutral-300 rounded-md hover:bg-neutral-50">
                  Export Data
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-canvas-surface border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Active Users</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {organization.usage.currentPeriod.metrics.activeUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Projects</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {organization.usage.currentPeriod.metrics.projectsCreated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🚀</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Deployments</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {organization.usage.currentPeriod.metrics.deploymentsCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-sm">🔧</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Test Runs</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {organization.usage.currentPeriod.metrics.testRuns}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Resource Usage</h3>
              <div className="space-y-4">
                {organization.limits.features.map(feature => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-700">
                          {feature.feature.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {feature.used.toLocaleString()} / {feature.limit === -1 ? 'Unlimited' : feature.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateUsagePercentage(feature.used, feature.limit)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Members Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Organization Members</h2>
              {userRole === 'organization_admin' && (
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Invite Member
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-canvas-surface divide-y divide-neutral-200">
                  {members.map((member: any) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-neutral-700">
                                {member.userId.slice(-2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              User {member.userId.slice(-3)}
                            </div>
                            <div className="text-sm text-neutral-500">
                              user{member.userId.slice(-3)}@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {member.lastActive ? formatDate(member.lastActive) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Current Plan</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-semibold text-neutral-900">{organization.billing.plan.name}</h4>
                  <p className="text-neutral-600">
                    {formatCurrency(organization.billing.plan.price, organization.billing.plan.currency)} /
                    {organization.billing.billingCycle}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Next billing date: {formatDate(organization.billing.nextBillingDate)}
                  </p>
                </div>
                <div className="text-right">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                    Change Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Plan Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organization.billing.plan.features.map(feature => (
                  <div key={feature.name} className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">{feature.name}</p>
                      <p className="text-xs text-neutral-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Payment Method</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      •••• •••• •••• {organization.billing.paymentMethod.last4}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Expires {organization.billing.paymentMethod.expiryMonth}/{organization.billing.paymentMethod.expiryYear}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 rounded-md hover:bg-neutral-100">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Organization Settings */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Organization Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Organization Name</label>
                    <input
                      type="text"
                      value={organization.name}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Domain</label>
                    <input
                      type="text"
                      value={organization.domain || ''}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Branding</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Primary Color</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        value={organization.settings.branding.primaryColor}
                        className="h-10 w-20 border border-neutral-300 rounded-md"
                        readOnly
                      />
                      <span className="ml-3 text-sm text-neutral-600">
                        {organization.settings.branding.primaryColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Secondary Color</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        value={organization.settings.branding.secondaryColor}
                        className="h-10 w-20 border border-neutral-300 rounded-md"
                        readOnly
                      />
                      <span className="ml-3 text-sm text-neutral-600">
                        {organization.settings.branding.secondaryColor}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={organization.settings.branding.whiteLabel}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                    readOnly
                  />
                  <label className="ml-2 block text-sm text-neutral-900">Enable White Label</label>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Feature Flags</h3>
              <div className="space-y-3">
                {Object.entries(organization.settings.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-neutral-900">
                        {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enabled ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* SSO Configuration */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Single Sign-On (SSO)</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">SSO Status</p>
                    <p className="text-sm text-neutral-500">Enable SSO for your organization</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    organization.settings.security.ssoEnabled ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {organization.settings.security.ssoEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {organization.settings.security.ssoEnabled && (
                  <div>
                    <p className="text-sm font-medium text-neutral-900">SSO Provider</p>
                    <p className="text-sm text-neutral-500 capitalize">
                      {organization.settings.security.ssoProvider?.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Factor Authentication */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Multi-Factor Authentication</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">MFA Required</p>
                  <p className="text-sm text-neutral-500">Require MFA for all organization members</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  organization.settings.security.mfaRequired ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {organization.settings.security.mfaRequired ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>

            {/* Password Policy */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Password Policy</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Minimum Length</p>
                    <p className="text-sm text-neutral-500">{organization.settings.security.passwordPolicy.minLength} characters</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Session Timeout</p>
                    <p className="text-sm text-neutral-500">{organization.settings.security.sessionTimeout} minutes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'requireUppercase', label: 'Uppercase letters' },
                    { key: 'requireLowercase', label: 'Lowercase letters' },
                    { key: 'requireNumbers', label: 'Numbers' },
                    { key: 'requireSpecialChars', label: 'Special characters' }
                  ].map(requirement => (
                    <div key={requirement.key} className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          organization.settings.security.passwordPolicy[requirement.key as keyof typeof organization.settings.security.passwordPolicy]
                            ? 'bg-green-100 text-green-600'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}>
                          <span className="text-xs">
                            {organization.settings.security.passwordPolicy[requirement.key as keyof typeof organization.settings.security.passwordPolicy] ? '✓' : '○'}
                          </span>
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-neutral-700">{requirement.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audit Logging */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Audit Logging</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Audit Trail</p>
                  <p className="text-sm text-neutral-500">Log all user actions and system events</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  organization.settings.security.auditLogging ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {organization.settings.security.auditLogging ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'API Calls', value: organization.usage.currentPeriod.metrics.apiCalls, limit: organization.limits.maxApiCalls, unit: '' },
                { label: 'Storage', value: organization.usage.currentPeriod.metrics.storageUsed, limit: organization.limits.maxStorage, unit: 'GB' },
                { label: 'Projects', value: organization.usage.currentPeriod.metrics.projectsCreated, limit: organization.limits.maxProjects, unit: '' }
              ].map(metric => (
                <div key={metric.label} className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                  <h4 className="text-sm font-medium text-neutral-500 mb-2">{metric.label}</h4>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-neutral-900">
                      {metric.value.toLocaleString()}{metric.unit}
                    </p>
                    <p className="text-sm text-neutral-500 ml-2">
                      / {metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}{metric.unit}
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          calculateUsagePercentage(metric.value, metric.limit) > 80
                            ? 'bg-red-600'
                            : calculateUsagePercentage(metric.value, metric.limit) > 60
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${calculateUsagePercentage(metric.value, metric.limit)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {calculateUsagePercentage(metric.value, metric.limit).toFixed(1)}% used
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Usage Chart Placeholder */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Usage Trends</h3>
              <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-neutral-500">Usage analytics chart would be displayed here</p>
                  <p className="text-sm text-neutral-400">Showing API calls, storage, and project activity over time</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantManagementDashboard;
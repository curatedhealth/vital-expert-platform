'use client';

import React, { useState, useEffect } from 'react';

import { AnalyticsDashboard as DashboardType, Report, BusinessIntelligence, UsageAnalytics } from '../../types';

interface Props {
  organizationId: string;
  dashboardId?: string;
}

// Format number utility function
function formatNumber(
  value: number,
  format: 'number' | 'currency' | 'percentage' = 'number'
): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (format === 'percentage') {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value / 100);
  }
  
  return new Intl.NumberFormat('en-US').format(value);
}

const AnalyticsDashboard: React.FC<Props> = ({ organizationId, dashboardId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboards' | 'reports' | 'insights' | 'usage' | 'exports'>('overview');
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [insights, setInsights] = useState<BusinessIntelligence | null>(null);
  const [usageData, setUsageData] = useState<UsageAnalytics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockDashboard: DashboardType = {
      id: 'dash-001',
      organizationId: organizationId,
      name: 'Executive Overview',
      description: 'Key performance indicators and business metrics',
      category: 'business_intelligence',
      widgets: [
        {
          id: 'widget-001',
          type: 'metric_card',
          title: 'Total Revenue',
          position: { x: 0, y: 0 },
          size: { width: 3, height: 2 },
          dataSource: {
            id: 'ds-001',
            type: 'database',
            connection: { type: 'postgresql', config: { /* TODO: implement */ }, timeout: 5000, retries: 3 },
            query: { type: 'sql', query: 'SELECT SUM(amount) FROM revenue WHERE date >= NOW() - INTERVAL \'30 days\'', parameters: [] },
            cache: { enabled: true, ttl: 300, strategy: 'memory' }
          },
          visualization: {
            chartOptions: { responsive: true, animation: true, theme: 'default' },
            colorScheme: { type: 'categorical', colors: ['#22c55e'] },
            legend: { show: false, position: 'top', align: 'center' },
            axes: { x: { show: false, scale: 'linear', gridLines: false }, y: { show: false, scale: 'linear', gridLines: false } },
            formatting: { numberFormat: '$,.2f', dateFormat: 'MM/DD/YYYY', currency: 'USD', locale: 'en-US' },
            interactions: []
          },
          filters: [],
          refreshInterval: 300
        },
        {
          id: 'widget-002',
          type: 'line_chart',
          title: 'Revenue Trend',
          position: { x: 3, y: 0 },
          size: { width: 6, height: 4 },
          dataSource: {
            id: 'ds-002',
            type: 'database',
            connection: { type: 'postgresql', config: { /* TODO: implement */ }, timeout: 5000, retries: 3 },
            query: { type: 'sql', query: 'SELECT date, SUM(amount) as revenue FROM revenue WHERE date >= NOW() - INTERVAL \'90 days\' GROUP BY date ORDER BY date', parameters: [] },
            cache: { enabled: true, ttl: 600, strategy: 'memory' }
          },
          visualization: {
            chartOptions: { responsive: true, animation: true, theme: 'default' },
            colorScheme: { type: 'categorical', colors: ['#3b82f6'] },
            legend: { show: true, position: 'top', align: 'center' },
            axes: {
              x: { show: true, scale: 'time', gridLines: true, title: 'Date' },
              y: { show: true, scale: 'linear', gridLines: true, title: 'Revenue ($)' }
            },
            formatting: { numberFormat: '$,.0f', dateFormat: 'MM/DD', currency: 'USD', locale: 'en-US' },
            interactions: [
              { type: 'tooltip', enabled: true, action: { type: 'highlight', config: { /* TODO: implement */ } } }
            ]
          },
          filters: [],
          refreshInterval: 600
        }
      ],
      layout: {
        columns: 12,
        rowHeight: 60,
        margin: [10, 10],
        containerPadding: [20, 20],
        responsive: true,
        breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 }
      },
      filters: [],
      permissions: [],
      isDefault: true,
      created: new Date('2024-01-01'),
      modified: new Date(),
      createdBy: 'user-001'
    };

    const mockInsights: BusinessIntelligence = {
      insights: [
        {
          id: 'insight-001',
          type: 'trend_analysis',
          title: 'Revenue Growth Acceleration',
          description: 'Monthly revenue has increased by 23% over the past quarter, with strongest growth in Enterprise segment.',
          significance: 'high',
          confidence: 0.89,
          data: {
            metrics: { growthRate: 0.23, segment: 'Enterprise', period: '90 days' },
            visualizations: [],
            supportingData: []
          },
          generated: new Date()
        },
        {
          id: 'insight-002',
          type: 'anomaly_detection',
          title: 'Unusual API Usage Spike',
          description: 'API calls increased by 300% yesterday, primarily from healthcare integrations.',
          significance: 'medium',
          confidence: 0.94,
          data: {
            metrics: { increase: 3.0, source: 'healthcare_integrations', date: 'yesterday' },
            visualizations: [],
            supportingData: []
          },
          generated: new Date()
        }
      ],
      predictions: [
        {
          id: 'pred-001',
          model: 'revenue_forecast_v2',
          target: 'monthly_revenue',
          value: 1250000,
          confidence: 0.78,
          timeframe: 'next_30_days',
          factors: [
            { name: 'seasonal_trend', impact: 0.15, direction: 'positive' },
            { name: 'new_customers', impact: 0.08, direction: 'positive' },
            { name: 'churn_rate', impact: -0.03, direction: 'negative' }
          ],
          generated: new Date()
        }
      ],
      recommendations: [
        {
          id: 'rec-001',
          category: 'cost_optimization',
          title: 'Optimize Database Query Performance',
          description: 'Several dashboard queries are taking >5 seconds. Implementing indexes could reduce costs by 30%.',
          priority: 'high',
          impact: {
            financial: -1200,
            operational: 'Improved response times',
            timeline: '2 weeks',
            resources: '1 engineer'
          },
          actions: [
            {
              title: 'Add database indexes',
              description: 'Create indexes on frequently queried columns',
              effort: 'medium',
              complexity: 'moderate',
              timeline: '1 week'
            },
            {
              title: 'Implement query caching',
              description: 'Cache results for commonly used queries',
              effort: 'low',
              complexity: 'simple',
              timeline: '3 days'
            }
          ],
          generated: new Date()
        }
      ],
      alerts: []
    };

    const mockUsageData: UsageAnalytics = {
      organizationId: organizationId,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
        granularity: 'day'
      },
      metrics: {
        activeUsers: 1247,
        newUsers: 89,
        sessions: 3421,
        pageViews: 18756,
        features: [
          { feature: 'Solution Designer', usage: 2341, users: 456, trend: 0.12 },
          { feature: 'Clinical Trial Designer', usage: 1876, users: 234, trend: 0.08 },
          { feature: 'Compliance Suite', usage: 1234, users: 189, trend: 0.15 },
          { feature: 'Analytics Dashboard', usage: 987, users: 145, trend: 0.22 }
        ],
        performance: {
          avgResponseTime: 245,
          errorRate: 0.02,
          uptime: 99.97,
          throughput: 1247
        }
      },
      trends: [],
      segments: [],
      cohorts: []
    };

    const mockReports: Report[] = [
      {
        id: 'report-001',
        organizationId: organizationId,
        name: 'Monthly Executive Summary',
        description: 'Comprehensive monthly report for executive team',
        type: 'custom_report',
        category: 'executive',
        template: {
          id: 'template-exec',
          name: 'Executive Template',
          format: 'pdf',
          sections: [],
          styling: {
            theme: 'professional',
            fonts: { primary: 'Arial', secondary: 'Helvetica', sizes: { /* TODO: implement */ } },
            colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6', text: '#111827', background: '#ffffff' },
            layout: { margins: [20, 20, 20, 20], spacing: 16, columnsPerRow: 2 },
            branding: { logo: '/logo.png' }
          },
          parameters: []
        },
        schedule: {
          enabled: true,
          frequency: 'monthly',
          interval: 1,
          timeOfDay: '09:00',
          dayOfMonth: 1,
          timezone: 'UTC'
        },
        recipients: [
          { type: 'email', target: 'executives@company.com', format: 'pdf' }
        ],
        status: 'scheduled',
        created: new Date('2024-01-01'),
        modified: new Date(),
        createdBy: 'user-001',
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextGeneration: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000)
      }
    ];

    setDashboard(mockDashboard);
    setInsights(mockInsights);
    setUsageData(mockUsageData);
    setReports(mockReports);
    setLoading(false);
  }, [organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'dashboards', label: 'Dashboards', icon: '📋' },
    { key: 'reports', label: 'Reports', icon: '📄' },
    { key: 'insights', label: 'Insights', icon: '💡' },
    { key: 'usage', label: 'Usage', icon: '📈' },
    { key: 'exports', label: 'Exports', icon: '📤' }
  ];

  const formatValue = (num: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
      case 'percentage':
        return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(num);
      default:
        return new Intl.NumberFormat('en-US').format(num);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-canvas-surface border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Analytics & Reporting</h1>
              <p className="text-neutral-600 mt-1">
                Business intelligence, reports, and insights for data-driven decisions
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 bg-canvas-surface border border-neutral-300 rounded-md hover:bg-neutral-50">
                Create Dashboard
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                New Report
              </button>
            </div>
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
                onClick={() => setActiveTab(tab.key as 'overview' | 'dashboards' | 'reports' | 'insights' | 'usage' | 'exports')}
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
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Revenue (30d)</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {formatNumber(1125000, 'currency')}
                    </p>
                    <p className="text-sm text-green-600">↗ +12.3%</p>
                  </div>
                </div>
              </div>

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
                      {formatNumber(usageData?.metrics.activeUsers || 0)}
                    </p>
                    <p className="text-sm text-blue-600">↗ +5.7%</p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">API Calls</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {formatNumber(2340000)}
                    </p>
                    <p className="text-sm text-purple-600">↗ +18.2%</p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-sm">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Uptime</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {formatNumber(usageData?.metrics.performance.uptime || 0, 'percentage')}
                    </p>
                    <p className="text-sm text-orange-600">↗ SLA: 99.9%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Insights</h3>
              <div className="space-y-4">
                {insights?.insights.slice(0, 3).map(insight => (
                  <div key={insight.id} className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(insight.significance)}`}>
                        {insight.significance.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-neutral-900">{insight.title}</h4>
                      <p className="text-sm text-neutral-600">{insight.description}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Confidence: {formatNumber(insight.confidence, 'percentage')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Usage */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Feature Usage</h3>
              <div className="space-y-4">
                {usageData?.metrics.features.map(feature => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">{feature.feature}</h4>
                      <p className="text-sm text-neutral-500">
                        {formatNumber(feature.usage)} uses by {formatNumber(feature.users)} users
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        feature.trend > 0 ? 'text-green-600' : feature.trend < 0 ? 'text-red-600' : 'text-neutral-600'
                      }`}>
                        {feature.trend > 0 ? '↗' : feature.trend < 0 ? '↘' : '→'} {formatNumber(Math.abs(feature.trend), 'percentage')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboards' && (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Analytics Dashboards</h2>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Create Dashboard
              </button>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">Executive Overview</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Default
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Key performance indicators and business metrics for executive team
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-500">
                    <span className="mr-1">📊</span>
                    {dashboard?.widgets.length} widgets
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Dashboard
                  </button>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6 opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">Clinical Metrics</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Clinical trial outcomes, patient metrics, and regulatory compliance
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-500">
                    <span className="mr-1">🏥</span>
                    Clinical focus
                  </div>
                  <button className="text-neutral-400 text-sm font-medium" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6 opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">Financial Analytics</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                  Revenue tracking, cost analysis, and profitability metrics
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-500">
                    <span className="mr-1">💰</span>
                    Financial focus
                  </div>
                  <button className="text-neutral-400 text-sm font-medium" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Dashboard Widgets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard?.widgets.map(widget => (
                  <div key={widget.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-neutral-900">{widget.title}</h4>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                        {widget.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="h-24 bg-neutral-50 rounded flex items-center justify-center">
                      <div className="text-center text-neutral-500">
                        <div className="text-2xl mb-1">
                          {widget.type === 'metric_card' ? '📊' :
                           widget.type === 'line_chart' ? '📈' : '📋'}
                        </div>
                        <p className="text-xs">
                          {widget.type === 'metric_card' ? 'Metric Display' :
                           widget.type === 'line_chart' ? 'Trend Analysis' : 'Data Visualization'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Automated Reports</h2>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Create Report
              </button>
            </div>

            {/* Reports List */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Last Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-canvas-surface divide-y divide-neutral-200">
                  {reports.map(report => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{report.name}</div>
                          <div className="text-sm text-neutral-500">{report.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {report.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {report.schedule.enabled ?
                          `${report.schedule.frequency} at ${report.schedule.timeOfDay}` :
                          'Manual'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {report.lastGenerated ? formatDate(report.lastGenerated) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Generate</button>
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Report Templates */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Report Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Executive Summary', description: 'High-level business metrics and KPIs', icon: '📊' },
                  { name: 'Compliance Report', description: 'Regulatory compliance status and audits', icon: '⚖️' },
                  { name: 'Usage Analytics', description: 'Platform usage and user engagement', icon: '📈' },
                  { name: 'Financial Report', description: 'Revenue, costs, and profitability', icon: '💰' },
                  { name: 'Clinical Outcomes', description: 'Clinical trial results and patient data', icon: '🏥' },
                  { name: 'Custom Report', description: 'Build your own report template', icon: '🔧' }
                ].map(template => (
                  <div key={template.name} className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{template.icon}</span>
                      <h4 className="text-sm font-medium text-neutral-900">{template.name}</h4>
                    </div>
                    <p className="text-sm text-neutral-600">{template.description}</p>
                    <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">AI-Powered Insights</h3>
              <div className="space-y-4">
                {insights?.insights.map(insight => (
                  <div key={insight.id} className="border border-neutral-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">{insight.title}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(insight.significance)} mt-1`}>
                          {insight.significance.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Confidence</p>
                        <p className="text-sm font-medium text-neutral-900">
                          {formatNumber(insight.confidence, 'percentage')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{insight.description}</p>
                    <p className="text-xs text-neutral-400">Generated: {formatDate(insight.generated)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Predictions</h3>
              <div className="space-y-4">
                {insights?.predictions.map(prediction => (
                  <div key={prediction.id} className="border border-neutral-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">
                          {prediction.target.replace('_', ' ').toUpperCase()}
                        </h4>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatNumber(prediction.value, prediction.target.includes('revenue') ? 'currency' : 'number')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Confidence</p>
                        <p className="text-sm font-medium text-neutral-900">
                          {formatNumber(prediction.confidence, 'percentage')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">
                      Forecast for {prediction.timeframe.replace('_', ' ')}
                    </p>

                    {/* Prediction Factors */}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-neutral-700 mb-2">Key Factors:</p>
                      <div className="space-y-1">
                        {prediction.factors.map(factor => (
                          <div key={factor.name} className="flex items-center justify-between text-xs">
                            <span className="text-neutral-600">{factor.name.replace('_', ' ')}</span>
                            <span className={`font-medium ${
                              factor.direction === 'positive' ? 'text-green-600' :
                              factor.direction === 'negative' ? 'text-red-600' :
                              'text-neutral-600'
                            }`}>
                              {factor.direction === 'positive' ? '↗' : factor.direction === 'negative' ? '↘' : '→'}
                              {formatNumber(Math.abs(factor.impact), 'percentage')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                {insights?.recommendations.map(rec => (
                  <div key={rec.id} className="border border-neutral-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">{rec.title}</h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)} mt-1`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {rec.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{rec.description}</p>

                    {/* Impact */}
                    <div className="bg-neutral-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-neutral-700 mb-1">Expected Impact:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                        {rec.impact.financial && (
                          <div>
                            <span className="font-medium">Financial:</span> {formatNumber(rec.impact.financial, 'currency')}
                          </div>
                        )}
                        {rec.impact.timeline && (
                          <div>
                            <span className="font-medium">Timeline:</span> {rec.impact.timeline}
                          </div>
                        )}
                        {rec.impact.operational && (
                          <div>
                            <span className="font-medium">Operational:</span> {rec.impact.operational}
                          </div>
                        )}
                        {rec.impact.resources && (
                          <div>
                            <span className="font-medium">Resources:</span> {rec.impact.resources}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-xs font-medium text-neutral-700 mb-2">Recommended Actions:</p>
                      <div className="space-y-2">
                        {rec.actions.map((action, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                              <span className="text-blue-600 text-xs">•</span>
                            </div>
                            <div className="ml-2">
                              <p className="text-xs font-medium text-neutral-900">{action.title}</p>
                              <p className="text-xs text-neutral-600">{action.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-1 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600">
                                  {action.effort} effort
                                </span>
                                <span className="px-1 py-0.5 rounded text-xs bg-neutral-100 text-neutral-600">
                                  {action.complexity}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {action.timeline}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Usage Overview */}
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
                      {formatNumber(usageData?.metrics.activeUsers || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">📱</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Sessions</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {formatNumber(usageData?.metrics.sessions || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">📄</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Page Views</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {formatNumber(usageData?.metrics.pageViews || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-sm">⚡</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">Avg Response</p>
                    <p className="text-2xl font-semibold text-neutral-900">
                      {usageData?.metrics.performance.avgResponseTime}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Usage Chart */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Feature Usage Trends</h3>
              <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-neutral-500">Feature usage chart would be displayed here</p>
                  <p className="text-sm text-neutral-400">Interactive chart showing feature adoption and usage trends</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">System Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Average Response Time</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {usageData?.metrics.performance.avgResponseTime}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Error Rate</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatNumber(usageData?.metrics.performance.errorRate || 0, 'percentage')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Uptime</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatNumber(usageData?.metrics.performance.uptime || 0, 'percentage')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Throughput</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatNumber(usageData?.metrics.performance.throughput || 0)} req/min
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">User Engagement</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">New Users</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatNumber(usageData?.metrics.newUsers || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Session Duration</span>
                      <span className="text-sm font-medium text-neutral-900">
                        12.5 min avg
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Bounce Rate</span>
                      <span className="text-sm font-medium text-neutral-900">
                        23.4%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Feature Adoption</span>
                      <span className="text-sm font-medium text-green-600">
                        87.2%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exports' && (
          <div className="space-y-6">
            {/* Export Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Data Exports</h2>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                New Export
              </button>
            </div>

            {/* Quick Export Options */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Exports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'User Data', description: 'Export all user information and activity', format: 'CSV', icon: '👥' },
                  { name: 'Usage Analytics', description: 'Platform usage statistics and metrics', format: 'JSON', icon: '📊' },
                  { name: 'Financial Data', description: 'Revenue, billing, and financial records', format: 'Excel', icon: '💰' },
                  { name: 'Audit Logs', description: 'Complete audit trail and security logs', format: 'JSON', icon: '🔒' },
                  { name: 'Project Data', description: 'All project files and configurations', format: 'ZIP', icon: '📁' },
                  { name: 'Compliance Reports', description: 'Regulatory compliance documentation', format: 'PDF', icon: '⚖️' }
                ].map(exportOption => (
                  <div key={exportOption.name} className="border border-neutral-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{exportOption.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900">{exportOption.name}</h4>
                        <span className="text-xs text-blue-600 font-medium">{exportOption.format}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{exportOption.description}</p>
                    <button className="w-full px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                      Export Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Export History */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Export History</h3>
              <div className="space-y-3">
                {[
                  { name: 'Monthly Usage Report', format: 'CSV', size: '2.4 MB', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'completed' },
                  { name: 'User Analytics Export', format: 'JSON', size: '856 KB', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed' },
                  { name: 'Financial Summary', format: 'PDF', size: '1.2 MB', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: 'completed' }
                ].map((export_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">{export_.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{export_.format}</span>
                        <span>•</span>
                        <span>{export_.size}</span>
                        <span>•</span>
                        <span>{formatDate(export_.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {export_.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Settings */}
            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Export Settings</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Default Format</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>CSV</option>
                      <option>JSON</option>
                      <option>Excel</option>
                      <option>PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Compression</label>
                    <select className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>None</option>
                      <option>ZIP</option>
                      <option>GZIP</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-neutral-900">
                    Encrypt exports with organization key
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-neutral-900">
                    Email notification when export is ready
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
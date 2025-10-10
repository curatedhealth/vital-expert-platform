'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface ThreatEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  resolved: boolean;
  falsePositive: boolean;
}

interface SecurityTrend {
  hour: string;
  threatCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

interface ThreatAnalyticsProps {
  trends: SecurityTrend[];
  threats: ThreatEvent[];
  className?: string;
}

export function ThreatAnalytics({ trends, threats, className = '' }: ThreatAnalyticsProps) {
  // Process threat data for charts
  const threatTypeData = threats.reduce((acc, threat) => {
    const type = threat.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.count++;
      if (threat.severity === 'critical') existing.critical++;
      if (threat.severity === 'high') existing.high++;
      if (threat.severity === 'medium') existing.medium++;
      if (threat.severity === 'low') existing.low++;
    } else {
      acc.push({
        type,
        count: 1,
        critical: threat.severity === 'critical' ? 1 : 0,
        high: threat.severity === 'high' ? 1 : 0,
        medium: threat.severity === 'medium' ? 1 : 0,
        low: threat.severity === 'low' ? 1 : 0
      });
    }
    return acc;
  }, [] as Array<{ type: string; count: number; critical: number; high: number; medium: number; low: number }>);

  const severityData = [
    { name: 'Critical', value: threats.filter(t => t.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: threats.filter(t => t.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: threats.filter(t => t.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: threats.filter(t => t.severity === 'low').length, color: '#22c55e' }
  ];

  const resolvedData = [
    { name: 'Resolved', value: threats.filter(t => t.resolved).length, color: '#22c55e' },
    { name: 'Open', value: threats.filter(t => !t.resolved).length, color: '#ef4444' },
    { name: 'False Positive', value: threats.filter(t => t.falsePositive).length, color: '#6b7280' }
  ];

  // Process trends data for line chart
  const trendData = trends.map(trend => ({
    hour: new Date(trend.hour).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    total: trend.threatCount,
    critical: trend.criticalCount,
    high: trend.highCount,
    medium: trend.mediumCount,
    low: trend.lowCount
  })).reverse(); // Show chronological order

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Threat Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Trends (24 Hours)</CardTitle>
          <CardDescription>
            Security threats over time by severity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Critical"
                />
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="High"
                />
                <Line 
                  type="monotone" 
                  dataKey="medium" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  name="Medium"
                />
                <Line 
                  type="monotone" 
                  dataKey="low" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Low"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Threat Types */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Types</CardTitle>
            <CardDescription>
              Distribution of threats by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={threatTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>
              Threats by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Resolution Status */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Resolution Status</CardTitle>
          <CardDescription>
            Current status of detected threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolvedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resolvedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Threat Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Type Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of threats by type and severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threatTypeData.map((threat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{threat.type}</span>
                  <Badge variant="outline">{threat.count} total</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Critical: {threat.critical}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>High: {threat.high}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium: {threat.medium}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Low: {threat.low}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

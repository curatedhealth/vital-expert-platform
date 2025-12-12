'use client';

import React, { useState, useEffect } from 'react';

import {
  ProviderDashboard
} from '../../types';

interface DigitalHealthDashboardProps {
  providerId: string;
}

const DigitalHealthDashboard: React.FC<DigitalHealthDashboardProps> = ({ providerId }) => {
  const [dashboard, setDashboard] = useState<ProviderDashboard | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning'>('all');

  useEffect(() => {
    // Simulate loading dashboard data
    const mockDashboard: ProviderDashboard = {
      providerId,
      patientPanelSize: 247,
      activeMonitoring: 89,
      pendingAlerts: [
        {
          id: 'alert-1',
          patientId: 'patient-123',
          type: 'critical',
          source: 'vitals',
          message: 'Blood pressure reading 180/110 mmHg - immediate attention required',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          acknowledged: false,
          escalated: false
        },
        {
          id: 'alert-2',
          patientId: 'patient-456',
          type: 'warning',
          source: 'medication',
          message: 'Medication adherence dropped to 65% for diabetes management',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          acknowledged: false,
          escalated: false
        },
        {
          id: 'alert-3',
          patientId: 'patient-789',
          type: 'warning',
          source: 'dtx',
          message: 'DTx engagement score below 40% for CBT program',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          acknowledged: true,
          escalated: false
        }
      ],
      todaysAppointments: [
        {
          id: 'appt-1',
          patientId: 'patient-101',
          providerId,
          scheduledDate: new Date(Date.now() + 60 * 60 * 1000),
          status: 'scheduled',
          type: 'routine',
          platform: 'zoom',
          quality: {
            videoQuality: 'good',
            audioQuality: 'excellent',
            connectionStability: 'stable',
            overallRating: 4.2
          },
          notes: '',
          prescriptions: [],
          followUpRequired: false
        }
      ],
      dtxPrescriptions: [
        {
          id: 'dtx-1',
          patientId: 'patient-202',
          providerId,
          dtxId: 'dtx-cbt-anxiety',
          prescribedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 7 * 24 * 60 * 60 * 1000),
          status: 'active',
          adherence: 78,
          outcomes: [],
          notes: 'Initial response positive'
        }
      ],
      recentVitals: [],
      qualityMetrics: [
        {
          name: 'Patient Satisfaction',
          value: 4.6,
          target: 4.5,
          unit: 'score',
          period: 'monthly',
          benchmark: 4.2,
          trend: 'up'
        },
        {
          name: 'Medication Adherence',
          value: 84,
          target: 85,
          unit: '%',
          period: 'monthly',
          benchmark: 78,
          trend: 'stable'
        }
      ]
    };

    setDashboard(mockDashboard);
  }, [providerId]);

  const handleAlertAcknowledge = (alertId: string) => {
    if (!dashboard) return;

    const updatedAlerts = dashboard.pendingAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );

    setDashboard({ ...dashboard, pendingAlerts: updatedAlerts });
  };

  const filteredAlerts = dashboard?.pendingAlerts.filter(alert => {
    if (alertFilter === 'all') return true;
    return alert.type === alertFilter;
  }) || [];

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-neutral-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Digital Health Dashboard</h1>
        <p className="text-neutral-600">Provider ID: {providerId}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dashboard.patientPanelSize}</div>
            <div className="text-sm text-neutral-600">Total Patients</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dashboard.activeMonitoring}</div>
            <div className="text-sm text-neutral-600">Active Monitoring</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {filteredAlerts.filter((a: any) => !a.acknowledged).length}
            </div>
            <div className="text-sm text-neutral-600">Pending Alerts</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{dashboard.todaysAppointments.length}</div>
            <div className="text-sm text-neutral-600">Today's Visits</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Panel */}
        <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Patient Alerts</h2>
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value as unknown)}
              className="text-sm border border-neutral-300 rounded-md px-2 py-1"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.type === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                } ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.type === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.type}
                    </div>
                    <p className="text-sm text-neutral-900 mt-1">{alert.message}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Patient ID: {alert.patientId} • {alert.source}
                    </p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAlertAcknowledge(alert.id)}
                      className="ml-4 px-3 py-1 bg-canvas-surface border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Today's Telemedicine Visits</h2>

          <div className="space-y-3">
            {dashboard.todaysAppointments.map(appointment => (
              <div key={appointment.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-neutral-900">
                      Patient ID: {appointment.patientId}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {appointment.scheduledDate.toLocaleTimeString()} • {appointment.type}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Platform: {appointment.platform}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'in_progress'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {appointment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DTx Prescriptions & Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DTx Prescriptions */}
        <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Digital Therapeutics</h2>

          <div className="space-y-3">
            {dashboard.dtxPrescriptions.map(prescription => (
              <div key={prescription.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-neutral-900">
                      DTx ID: {prescription.dtxId}
                    </div>
                    <div className="text-sm text-neutral-600">
                      Patient: {prescription.patientId}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Prescribed: {prescription.prescribedDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prescription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {prescription.status}
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      Adherence: {prescription.adherence}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quality Metrics</h2>

          <div className="space-y-4">
            {dashboard.qualityMetrics.map((metric, index) => (
              <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-neutral-900">{metric.name}</div>
                    <div className="text-sm text-neutral-600">{metric.period}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-neutral-900">
                      {metric.value}{metric.unit}
                    </div>
                    <div className={`text-xs ${
                      metric.value >= metric.target
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      Target: {metric.target}{metric.unit}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    Benchmark: {metric.benchmark}{metric.unit}
                  </span>
                  <span className={`flex items-center ${
                    metric.trend === 'up'
                      ? 'text-green-600'
                      : metric.trend === 'down'
                      ? 'text-red-600'
                      : 'text-neutral-600'
                  }`}>
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalHealthDashboard;
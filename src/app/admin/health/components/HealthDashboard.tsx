'use client';

import { useState, useEffect } from 'react';
import { HealthMonitoringService, HealthMetrics, HealthStatus, SLOConfig, Incident } from '@/services/health-monitoring.service';
import ServiceHealthCard from './ServiceHealthCard';
import SLOTracker from './SLOTracker';
import IncidentBanner from './IncidentBanner';
import AlertConfigPanel from './AlertConfigPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Activity } from 'lucide-react';

interface HealthDashboardProps {
  initialMetrics: HealthMetrics;
  initialServiceHealth: HealthStatus[];
  initialSLOStatus: SLOConfig[];
  initialIncidents: Incident[];
}

export default function HealthDashboard({
  initialMetrics,
  initialServiceHealth,
  initialSLOStatus,
  initialIncidents,
}: HealthDashboardProps) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [serviceHealth, setServiceHealth] = useState(initialServiceHealth);
  const [sloStatus, setSLOStatus] = useState(initialSLOStatus);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const healthService = new HealthMonitoringService();

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [newMetrics, newServiceHealth, newSLOStatus, newIncidents] = await Promise.all([
        healthService.getHealthMetrics(),
        healthService.getServiceHealth(),
        healthService.getSLOStatus(),
        healthService.getActiveIncidents()
      ]);

      setMetrics(newMetrics);
      setServiceHealth(newServiceHealth);
      setSLOStatus(newSLOStatus);
      setIncidents(newIncidents);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Incidents Banner */}
      {incidents.length > 0 && (
        <IncidentBanner incidents={incidents} />
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Service Health Cards */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Service Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceHealth.map((service) => (
            <ServiceHealthCard
              key={service.service}
              service={service}
              onRefresh={() => refreshData()}
            />
          ))}
        </div>
      </div>

      {/* SLO Tracking */}
      {sloStatus.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">SLO Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sloStatus.map((slo) => (
              <SLOTracker
                key={slo.service}
                slo={slo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alert Configuration */}
      {showAlertConfig && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Alert Configuration</h2>
          <AlertConfigPanel />
        </div>
      )}

      {/* System Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.averageLatency}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.errorRate.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.servicesHealthy}
              </div>
              <div className="text-sm text-muted-foreground">Healthy Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metrics.servicesTotal}
              </div>
              <div className="text-sm text-muted-foreground">Total Services</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { HealthMonitoringService } from '@/services/health-monitoring.service';
import HealthDashboard from './components/HealthDashboard';

export default async function HealthPage() {
  
  const healthService = new HealthMonitoringService();
  const [metrics, serviceHealth, sloStatus, incidents] = await Promise.all([
    healthService.getHealthMetrics(),
    healthService.getServiceHealth(),
    healthService.getSLOStatus(),
    healthService.getActiveIncidents()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Health & Reliability</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor system health, SLOs, and manage incidents across all services.
        </p>
      </div>

      {/* Overall Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  metrics.overallHealth === 'healthy' ? 'bg-green-500' :
                  metrics.overallHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm font-medium">H</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overall Health</dt>
                  <dd className={`text-lg font-medium ${
                    metrics.overallHealth === 'healthy' ? 'text-green-600' :
                    metrics.overallHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.overallHealth.charAt(0).toUpperCase() + metrics.overallHealth.slice(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Services</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.servicesHealthy}/{metrics.servicesTotal}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Uptime</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.uptime.toFixed(2)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">I</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Incidents</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.activeIncidents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Dashboard */}
      <HealthDashboard 
        initialMetrics={metrics}
        initialServiceHealth={serviceHealth}
        initialSLOStatus={sloStatus}
        initialIncidents={incidents}
      />
    </div>
  );
}

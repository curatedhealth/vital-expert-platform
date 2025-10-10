import { NextRequest, NextResponse } from 'next/server';
import { HealthMonitoringService } from '@/services/health-monitoring.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const type = searchParams.get('type') || 'all';

      const healthService = new HealthMonitoringService();

      switch (type) {
        case 'metrics':
          const metrics = await healthService.getHealthMetrics();
          return NextResponse.json(metrics);
        
        case 'services':
          const services = await healthService.getServiceHealth();
          return NextResponse.json(services);
        
        case 'slo':
          const sloStatus = await healthService.getSLOStatus();
          return NextResponse.json(sloStatus);
        
        case 'incidents':
          const incidents = await healthService.getActiveIncidents();
          return NextResponse.json(incidents);
        
        case 'alerts':
          const alerts = await healthService.getAlertConfigs();
          return NextResponse.json(alerts);
        
        default:
          const [allMetrics, allServices, allSloStatus, allIncidents] = await Promise.all([
            healthService.getHealthMetrics(),
            healthService.getServiceHealth(),
            healthService.getSLOStatus(),
            healthService.getActiveIncidents()
          ]);
          
          return NextResponse.json({
            metrics: allMetrics,
            services: allServices,
            sloStatus: allSloStatus,
            incidents: allIncidents
          });
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch health data' },
        { status: 500 }
      );
    }
  });
}

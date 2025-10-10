import { createClient } from '@supabase/supabase-js';

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  timestamp: Date;
  latency: number;
  details: Record<string, any>;
  dependencies: string[];
}

export interface SLOConfig {
  service: string;
  target: number; // 99.9 = 99.9%
  window: number; // in minutes
  errorBudget: number; // remaining budget
  burnRate: number; // current burn rate
}

export interface AlertConfig {
  id: string;
  service: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  enabled: boolean;
  notificationChannels: string[];
  cooldown: number; // in minutes
}

export interface Incident {
  id: string;
  title: string;
  status: 'active' | 'resolved' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
  services: string[];
  startedAt: Date;
  resolvedAt?: Date;
  description: string;
  assignee?: string;
}

export interface HealthMetrics {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  servicesHealthy: number;
  servicesTotal: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  activeIncidents: number;
}

export class HealthMonitoringService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get overall system health metrics
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      // Get health checks from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: healthChecks, error } = await this.supabase
        .from('health_checks')
        .select('*')
        .gte('timestamp', oneHourAgo)
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch health checks: ${error.message}`);
      }

      // Calculate metrics
      const services = new Set(healthChecks?.map(check => check.service) || []);
      const servicesTotal = services.size;
      
      const latestChecks = new Map();
      healthChecks?.forEach(check => {
        if (!latestChecks.has(check.service) || 
            new Date(check.timestamp) > new Date(latestChecks.get(check.service).timestamp)) {
          latestChecks.set(check.service, check);
        }
      });

      const servicesHealthy = Array.from(latestChecks.values())
        .filter(check => check.status === 'healthy').length;

      const averageLatency = latestChecks.size > 0 
        ? Array.from(latestChecks.values())
            .reduce((sum, check) => sum + (check.latency_ms || 0), 0) / latestChecks.size
        : 0;

      const errorRate = servicesTotal > 0 
        ? ((servicesTotal - servicesHealthy) / servicesTotal) * 100 
        : 0;

      // Determine overall health
      let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (errorRate > 50) {
        overallHealth = 'unhealthy';
      } else if (errorRate > 10) {
        overallHealth = 'degraded';
      }

      // Calculate uptime (simplified - in real implementation, this would be more complex)
      const uptime = servicesHealthy / servicesTotal * 100;

      // Get active incidents
      const { data: incidents } = await this.supabase
        .from('incidents')
        .select('id')
        .eq('status', 'active');

      return {
        overallHealth,
        servicesHealthy,
        servicesTotal,
        averageLatency: Math.round(averageLatency),
        errorRate: Math.round(errorRate * 100) / 100,
        uptime: Math.round(uptime * 100) / 100,
        activeIncidents: incidents?.length || 0
      };
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return {
        overallHealth: 'unknown',
        servicesHealthy: 0,
        servicesTotal: 0,
        averageLatency: 0,
        errorRate: 100,
        uptime: 0,
        activeIncidents: 0
      };
    }
  }

  /**
   * Get health status for all services
   */
  async getServiceHealth(): Promise<HealthStatus[]> {
    try {
      const { data: healthChecks, error } = await this.supabase
        .from('health_checks')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch service health: ${error.message}`);
      }

      // Get latest check for each service
      const latestChecks = new Map();
      healthChecks?.forEach(check => {
        if (!latestChecks.has(check.service) || 
            new Date(check.timestamp) > new Date(latestChecks.get(check.service).timestamp)) {
          latestChecks.set(check.service, check);
        }
      });

      return Array.from(latestChecks.values()).map(check => ({
        service: check.service,
        status: check.status === 'healthy' ? 'healthy' : 
                check.status === 'degraded' ? 'degraded' : 'unhealthy',
        timestamp: new Date(check.timestamp),
        latency: check.latency_ms || 0,
        details: check.details || {},
        dependencies: check.dependencies || []
      }));
    } catch (error) {
      console.error('Error fetching service health:', error);
      return [];
    }
  }

  /**
   * Get SLO configurations and current status
   */
  async getSLOStatus(): Promise<SLOConfig[]> {
    try {
      const { data: sloConfigs, error } = await this.supabase
        .from('slo_configs')
        .select('*')
        .eq('enabled', true);

      if (error) {
        throw new Error(`Failed to fetch SLO configs: ${error.message}`);
      }

      // In a real implementation, you would calculate actual SLO metrics
      // For now, return mock data
      return (sloConfigs || []).map(config => ({
        service: config.service,
        target: config.target_percentage,
        window: config.window_minutes,
        errorBudget: Math.random() * 100, // Mock data
        burnRate: Math.random() * 10 // Mock data
      }));
    } catch (error) {
      console.error('Error fetching SLO status:', error);
      return [];
    }
  }

  /**
   * Get active incidents
   */
  async getActiveIncidents(): Promise<Incident[]> {
    try {
      const { data: incidents, error } = await this.supabase
        .from('incidents')
        .select('*')
        .in('status', ['active', 'investigating'])
        .order('started_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch incidents: ${error.message}`);
      }

      return (incidents || []).map(incident => ({
        id: incident.id,
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
        services: incident.affected_services || [],
        startedAt: new Date(incident.started_at),
        resolvedAt: incident.resolved_at ? new Date(incident.resolved_at) : undefined,
        description: incident.description,
        assignee: incident.assignee
      }));
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  }

  /**
   * Get alert configurations
   */
  async getAlertConfigs(): Promise<AlertConfig[]> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('alert_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch alert configs: ${error.message}`);
      }

      return (alerts || []).map(alert => ({
        id: alert.id,
        service: alert.service,
        metric: alert.metric,
        threshold: alert.threshold,
        operator: alert.operator,
        enabled: alert.enabled,
        notificationChannels: alert.notification_channels || [],
        cooldown: alert.cooldown_minutes
      }));
    } catch (error) {
      console.error('Error fetching alert configs:', error);
      return [];
    }
  }

  /**
   * Update alert configuration
   */
  async updateAlertConfig(
    alertId: string,
    updates: Partial<AlertConfig>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('alert_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        throw new Error(`Failed to update alert config: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating alert config:', error);
      throw error;
    }
  }

  /**
   * Create new alert configuration
   */
  async createAlertConfig(config: Omit<AlertConfig, 'id'>): Promise<AlertConfig> {
    try {
      const { data, error } = await this.supabase
        .from('alert_configs')
        .insert({
          service: config.service,
          metric: config.metric,
          threshold: config.threshold,
          operator: config.operator,
          enabled: config.enabled,
          notification_channels: config.notificationChannels,
          cooldown_minutes: config.cooldown,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create alert config: ${error.message}`);
      }

      return {
        id: data.id,
        service: data.service,
        metric: data.metric,
        threshold: data.threshold,
        operator: data.operator,
        enabled: data.enabled,
        notificationChannels: data.notification_channels || [],
        cooldown: data.cooldown_minutes
      };
    } catch (error) {
      console.error('Error creating alert config:', error);
      throw error;
    }
  }

  /**
   * Get health check history for a specific service
   */
  async getServiceHealthHistory(
    service: string,
    hours: number = 24
  ): Promise<HealthStatus[]> {
    try {
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const { data: healthChecks, error } = await this.supabase
        .from('health_checks')
        .select('*')
        .eq('service', service)
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch health history: ${error.message}`);
      }

      return (healthChecks || []).map(check => ({
        service: check.service,
        status: check.status === 'healthy' ? 'healthy' : 
                check.status === 'degraded' ? 'degraded' : 'unhealthy',
        timestamp: new Date(check.timestamp),
        latency: check.latency_ms || 0,
        details: check.details || {},
        dependencies: check.dependencies || []
      }));
    } catch (error) {
      console.error('Error fetching health history:', error);
      return [];
    }
  }
}

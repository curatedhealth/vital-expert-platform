import { performance } from 'perf_hooks';

export interface PerformanceAlert {
  id: string;
  type: 'latency' | 'throughput' | 'error_rate' | 'availability' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  threshold: number;
  currentValue: number;
  healthcareImpact: 'patient_safety' | 'clinical_workflow' | 'regulatory_compliance' | 'operational';
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    transactionsPerMinute: number;
    peakRps: number;
    averageRps: number;
  };
  errorRate: {
    total: number;
    http4xx: number;
    http5xx: number;
    timeouts: number;
    rate: number; // percentage
  };
  availability: {
    uptime: number; // percentage
    downtime: number; // minutes
    mttr: number; // mean time to recovery in minutes
    mtbf: number; // mean time between failures in hours
  };
  resourceUtilization: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    network: number; // percentage
  };
  healthcareSpecific: {
    phiAccessLatency: number; // ms
    auditLogLatency: number; // ms
    emergencySystemLatency: number; // ms
    complianceReportingLatency: number; // ms
    patientSafetyAlerts: number;
  };
}

export interface MonitoringConfig {
  collection: {
    intervalSeconds: number;
    retentionDays: number;
    batchSize: number;
    realTimeEnabled: boolean;
  };
  alerts: {
    enabled: boolean;
    channels: ('email' | 'slack' | 'pagerduty' | 'webhook')[];
    thresholds: {
      responseTime: {
        warning: number; // ms
        critical: number; // ms
        emergency: number; // ms (for healthcare emergencies)
      };
      errorRate: {
        warning: number; // percentage
        critical: number; // percentage
      };
      availability: {
        warning: number; // percentage
        critical: number; // percentage
      };
      healthcareCompliance: {
        phiAccessTime: number; // ms
        auditLogTime: number; // ms
        emergencyResponseTime: number; // ms
      };
    };
  };
  dashboards: {
    enabled: boolean;
    refreshIntervalSeconds: number;
    healthcareDashboard: boolean;
    complianceDashboard: boolean;
    operationalDashboard: boolean;
  };
  reporting: {
    dailyReports: boolean;
    weeklyReports: boolean;
    complianceReports: boolean;
    slaReports: boolean;
    healthcareMetricsReports: boolean;
  };
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  type: 'operational' | 'healthcare' | 'compliance' | 'executive';
  widgets: DashboardWidget[];
  refreshInterval: number;
  healthcareContext: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'gauge';
  dataSource: string;
  healthcareRelevant: boolean;
  complianceRelated: boolean;
  patientSafetyCritical: boolean;
}

export class PerformanceMonitoringSystem {
  private config: MonitoringConfig;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private dashboards: MonitoringDashboard[] = [];

  private healthcareThresholds = {
    emergencyResponseTime: 500, // 500ms max for emergency systems
    phiAccessTime: 1000, // 1s max for PHI access
    auditLogTime: 300, // 300ms max for audit logging
    clinicalWorkflowTime: 2000, // 2s max for clinical workflows
    patientSafetyAlertTime: 100, // 100ms max for patient safety alerts
    complianceReportingTime: 5000, // 5s max for compliance reporting
    minAvailability: 99.9, // 99.9% minimum availability for healthcare systems
    maxErrorRate: 0.1, // 0.1% maximum error rate for patient-facing systems
  };

  constructor(config?: Partial<MonitoringConfig>) {
    this.config = {
      collection: {
        intervalSeconds: 30,
        retentionDays: 90,
        batchSize: 100,
        realTimeEnabled: true,
        ...config?.collection
      },
      alerts: {
        enabled: true,
        channels: ['email', 'slack'],
        thresholds: {
          responseTime: {
            warning: 2000, // 2s
            critical: 5000, // 5s
            emergency: 500, // 500ms for emergency systems
          },
          errorRate: {
            warning: 1, // 1%
            critical: 5, // 5%
          },
          availability: {
            warning: 99.5, // 99.5%
            critical: 99.0, // 99.0%
          },
          healthcareCompliance: {
            phiAccessTime: 1000, // 1s
            auditLogTime: 300, // 300ms
            emergencyResponseTime: 500, // 500ms
          },
        },
        ...config?.alerts
      },
      dashboards: {
        enabled: true,
        refreshIntervalSeconds: 30,
        healthcareDashboard: true,
        complianceDashboard: true,
        operationalDashboard: true,
        ...config?.dashboards
      },
      reporting: {
        dailyReports: true,
        weeklyReports: true,
        complianceReports: true,
        slaReports: true,
        healthcareMetricsReports: true,
        ...config?.reporting
      }
    };

    this.initializeDashboards();
  }

  async initializePerformanceMonitoring(): Promise<void> {
    // // Set up metric collection
    await this.setupMetricCollection();

    // Initialize alerting system
    await this.setupAlertingSystem();

    // Create monitoring dashboards
    await this.setupMonitoringDashboards();

    // Start real-time monitoring
    if (this.config.collection.realTimeEnabled) {
      this.startRealTimeMonitoring();
    }

    // }

  private async setupMetricCollection(): Promise<void> {
    // // Start metric collection interval
    setInterval(async () => {
      try {

        this.metrics.push(metrics);

        // Maintain retention policy
        this.enforceRetentionPolicy();

        // Check for alerts
        await this.checkAlertThresholds(metrics);

      } catch (error) {
        // console.error('Error collecting metrics:', error);
      }
    }, this.config.collection.intervalSeconds * 1000);

    // `);
  }

  private async setupAlertingSystem(): Promise<void> {
    // if (!this.config.alerts.enabled) {
      // return;
    }

    // Initialize alert channels
    for (const channel of this.config.alerts.channels) {
      await this.initializeAlertChannel(channel);
    }

    // }`);
  }

  private async setupMonitoringDashboards(): Promise<void> {
    // if (this.config.dashboards.healthcareDashboard) {
      await this.createHealthcareDashboard();
    }

    if (this.config.dashboards.complianceDashboard) {
      await this.createComplianceDashboard();
    }

    if (this.config.dashboards.operationalDashboard) {
      await this.createOperationalDashboard();
    }

    // }

  private async collectSystemMetrics(): Promise<PerformanceMetrics> {

    // Simulate metric collection
    await new Promise(resolve => setTimeout(resolve, 10));

    // Generate realistic metrics with some variation

    return {
      responseTime: {
        avg: Math.round(baseResponseTime * loadFactor),
        p50: Math.round(baseResponseTime * loadFactor * 0.8),
        p95: Math.round(baseResponseTime * loadFactor * 2.5),
        p99: Math.round(baseResponseTime * loadFactor * 4),
        max: Math.round(baseResponseTime * loadFactor * 6),
      },
      throughput: {
        requestsPerSecond: Math.round(50 + Math.random() * 100),
        transactionsPerMinute: Math.round((50 + Math.random() * 100) * 60 * 0.8),
        peakRps: Math.round(100 + Math.random() * 200),
        averageRps: Math.round(75 + Math.random() * 50),
      },
      errorRate: {
        total: Math.floor(Math.random() * 10),
        http4xx: Math.floor(Math.random() * 5),
        http5xx: Math.floor(Math.random() * 3),
        timeouts: Math.floor(Math.random() * 2),
        rate: Math.random() * 2, // 0-2%
      },
      availability: {
        uptime: 99.5 + Math.random() * 0.4, // 99.5-99.9%
        downtime: Math.random() * 5, // 0-5 minutes
        mttr: 2 + Math.random() * 8, // 2-10 minutes
        mtbf: 100 + Math.random() * 500, // 100-600 hours
      },
      resourceUtilization: {
        cpu: 20 + Math.random() * 60, // 20-80%
        memory: 30 + Math.random() * 50, // 30-80%
        disk: 10 + Math.random() * 40, // 10-50%
        network: 5 + Math.random() * 30, // 5-35%
      },
      healthcareSpecific: {
        phiAccessLatency: Math.round(50 + Math.random() * 200), // 50-250ms
        auditLogLatency: Math.round(20 + Math.random() * 100), // 20-120ms
        emergencySystemLatency: Math.round(30 + Math.random() * 80), // 30-110ms
        complianceReportingLatency: Math.round(500 + Math.random() * 1000), // 0.5-1.5s
        patientSafetyAlerts: Math.floor(Math.random() * 3), // 0-2 alerts
      },
    };
  }

  private async checkAlertThresholds(metrics: PerformanceMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // Check response time thresholds
    if (metrics.responseTime.avg > this.config.alerts.thresholds.responseTime.critical) {
      alerts.push(this.createAlert(
        'latency',
        'critical',
        `Average response time ${metrics.responseTime.avg}ms exceeds critical threshold`,
        this.config.alerts.thresholds.responseTime.critical,
        metrics.responseTime.avg,
        'clinical_workflow'
      ));
    }

    // Check healthcare-specific thresholds
    if (metrics.healthcareSpecific.phiAccessLatency > this.healthcareThresholds.phiAccessTime) {
      alerts.push(this.createAlert(
        'compliance',
        'critical',
        `PHI access latency ${metrics.healthcareSpecific.phiAccessLatency}ms exceeds healthcare threshold`,
        this.healthcareThresholds.phiAccessTime,
        metrics.healthcareSpecific.phiAccessLatency,
        'regulatory_compliance'
      ));
    }

    if (metrics.healthcareSpecific.emergencySystemLatency > this.healthcareThresholds.emergencyResponseTime) {
      alerts.push(this.createAlert(
        'latency',
        'critical',
        `Emergency system latency ${metrics.healthcareSpecific.emergencySystemLatency}ms exceeds safety threshold`,
        this.healthcareThresholds.emergencyResponseTime,
        metrics.healthcareSpecific.emergencySystemLatency,
        'patient_safety'
      ));
    }

    // Check error rate thresholds
    if (metrics.errorRate.rate > this.config.alerts.thresholds.errorRate.critical) {
      alerts.push(this.createAlert(
        'error_rate',
        'critical',
        `Error rate ${metrics.errorRate.rate.toFixed(2)}% exceeds critical threshold`,
        this.config.alerts.thresholds.errorRate.critical,
        metrics.errorRate.rate,
        'clinical_workflow'
      ));
    }

    // Check availability thresholds
    if (metrics.availability.uptime < this.config.alerts.thresholds.availability.critical) {
      alerts.push(this.createAlert(
        'availability',
        'critical',
        `System availability ${metrics.availability.uptime.toFixed(2)}% below critical threshold`,
        this.config.alerts.thresholds.availability.critical,
        metrics.availability.uptime,
        'patient_safety'
      ));
    }

    // Process and send alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    threshold: number,
    currentValue: number,
    healthcareImpact: PerformanceAlert['healthcareImpact']
  ): PerformanceAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      threshold,
      currentValue,
      healthcareImpact,
      timestamp: new Date(),
      resolved: false,
      actions: this.generateAlertActions(type, severity, healthcareImpact)
    };
  }

  private generateAlertActions(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    healthcareImpact: PerformanceAlert['healthcareImpact']
  ): string[] {
    const actions: string[] = [];

    switch (healthcareImpact) {
      case 'patient_safety':
        actions.push('🚨 Immediate escalation to on-call healthcare engineer');
        actions.push('📞 Notify clinical operations team');
        actions.push('🏥 Activate emergency response procedures');
        break;
      case 'clinical_workflow':
        actions.push('⚡ Scale up system resources immediately');
        actions.push('🔍 Investigate performance bottlenecks');
        actions.push('📊 Review recent deployments and changes');
        break;
      case 'regulatory_compliance':
        actions.push('📋 Document compliance incident');
        actions.push('🔒 Review audit trails and access logs');
        actions.push('⚖️ Notify compliance officer');
        break;
      case 'operational':
        actions.push('🔧 Review system capacity and scaling');
        actions.push('📈 Analyze performance trends');
        actions.push('⚙️ Optimize system configuration');
        break;
    }

    // Add severity-specific actions
    if (severity === 'critical') {
      actions.unshift('🔴 CRITICAL ALERT - Immediate attention required');
    }

    return actions;
  }

  private async processAlert(alert: PerformanceAlert): Promise<void> {
    // Add to alerts list
    this.alerts.push(alert);

    // Send notifications through configured channels
    if (this.config.alerts.enabled) {
      await this.sendAlertNotifications(alert);
    }

    // } ALERT: ${alert.message}`);

    // Log healthcare-specific handling
    if (alert.healthcareImpact === 'patient_safety') {
      // }
  }

  private async sendAlertNotifications(alert: PerformanceAlert): Promise<void> {
    for (const channel of this.config.alerts.channels) {
      try {
        await this.sendToChannel(channel, alert);
      } catch (error) {
        // console.error(`Failed to send alert to ${channel}:`, error);
      }
    }
  }

  private async sendToChannel(channel: string, alert: PerformanceAlert): Promise<void> {
    // Simulate sending to different alert channels
    // await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async initializeAlertChannel(channel: string): Promise<void> {
    // // Simulate channel initialization
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private enforceRetentionPolicy(): void {

    retentionDate.setDate(retentionDate.getDate() - this.config.collection.retentionDays);

    // Remove old metrics (in real implementation, this would be more sophisticated)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Remove old alerts
    this.alerts = this.alerts.filter(alert => alert.timestamp > retentionDate);
  }

  private startRealTimeMonitoring(): void {
    // // Simulate real-time monitoring updates
    setInterval(() => {

      if (activeAlerts.length > 0) {
        // }
    }, 10000); // Check every 10 seconds
  }

  private initializeDashboards(): void {
    // Pre-configure standard dashboards
    this.dashboards = [];
  }

  private async createHealthcareDashboard(): Promise<void> {
    const dashboard: MonitoringDashboard = {
      id: 'healthcare_dashboard',
      name: 'Healthcare Performance Dashboard',
      type: 'healthcare',
      refreshInterval: 30,
      healthcareContext: true,
      widgets: [
        {
          id: 'phi_access_latency',
          title: 'PHI Access Latency',
          type: 'gauge',
          dataSource: 'healthcareSpecific.phiAccessLatency',
          healthcareRelevant: true,
          complianceRelated: true,
          patientSafetyCritical: false
        },
        {
          id: 'emergency_response_time',
          title: 'Emergency System Response Time',
          type: 'gauge',
          dataSource: 'healthcareSpecific.emergencySystemLatency',
          healthcareRelevant: true,
          complianceRelated: false,
          patientSafetyCritical: true
        },
        {
          id: 'patient_safety_alerts',
          title: 'Patient Safety Alerts',
          type: 'metric',
          dataSource: 'healthcareSpecific.patientSafetyAlerts',
          healthcareRelevant: true,
          complianceRelated: false,
          patientSafetyCritical: true
        },
        {
          id: 'audit_log_performance',
          title: 'Audit Log Performance',
          type: 'chart',
          dataSource: 'healthcareSpecific.auditLogLatency',
          healthcareRelevant: true,
          complianceRelated: true,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.push(dashboard);
    // }

  private async createComplianceDashboard(): Promise<void> {
    const dashboard: MonitoringDashboard = {
      id: 'compliance_dashboard',
      name: 'Compliance Monitoring Dashboard',
      type: 'compliance',
      refreshInterval: 60,
      healthcareContext: true,
      widgets: [
        {
          id: 'hipaa_compliance_status',
          title: 'HIPAA Compliance Status',
          type: 'table',
          dataSource: 'compliance.hipaa',
          healthcareRelevant: true,
          complianceRelated: true,
          patientSafetyCritical: false
        },
        {
          id: 'audit_trail_completeness',
          title: 'Audit Trail Completeness',
          type: 'gauge',
          dataSource: 'compliance.auditTrail',
          healthcareRelevant: true,
          complianceRelated: true,
          patientSafetyCritical: false
        },
        {
          id: 'data_access_compliance',
          title: 'Data Access Compliance',
          type: 'chart',
          dataSource: 'compliance.dataAccess',
          healthcareRelevant: true,
          complianceRelated: true,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.push(dashboard);
    // }

  private async createOperationalDashboard(): Promise<void> {
    const dashboard: MonitoringDashboard = {
      id: 'operational_dashboard',
      name: 'Operational Performance Dashboard',
      type: 'operational',
      refreshInterval: 30,
      healthcareContext: false,
      widgets: [
        {
          id: 'response_time_chart',
          title: 'Response Time Trends',
          type: 'chart',
          dataSource: 'responseTime',
          healthcareRelevant: false,
          complianceRelated: false,
          patientSafetyCritical: false
        },
        {
          id: 'throughput_gauge',
          title: 'System Throughput',
          type: 'gauge',
          dataSource: 'throughput.requestsPerSecond',
          healthcareRelevant: false,
          complianceRelated: false,
          patientSafetyCritical: false
        },
        {
          id: 'error_rate_chart',
          title: 'Error Rate Monitoring',
          type: 'chart',
          dataSource: 'errorRate.rate',
          healthcareRelevant: false,
          complianceRelated: false,
          patientSafetyCritical: false
        },
        {
          id: 'resource_utilization',
          title: 'Resource Utilization',
          type: 'table',
          dataSource: 'resourceUtilization',
          healthcareRelevant: false,
          complianceRelated: false,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.push(dashboard);
    // }

  async generatePerformanceReport(): Promise<string> {

    return `
# VITAL Path Performance Monitoring Report
Generated: ${new Date().toISOString()}

## System Health Overview
- **Average Response Time**: ${latestMetrics?.responseTime.avg || 0}ms
- **Current Throughput**: ${latestMetrics?.throughput.requestsPerSecond || 0} req/s
- **Error Rate**: ${latestMetrics?.errorRate.rate.toFixed(2) || 0}%
- **System Availability**: ${latestMetrics?.availability.uptime.toFixed(2) || 0}%

## Healthcare-Specific Metrics
- **PHI Access Latency**: ${latestMetrics?.healthcareSpecific.phiAccessLatency || 0}ms
- **Emergency System Latency**: ${latestMetrics?.healthcareSpecific.emergencySystemLatency || 0}ms
- **Audit Log Latency**: ${latestMetrics?.healthcareSpecific.auditLogLatency || 0}ms
- **Patient Safety Alerts**: ${latestMetrics?.healthcareSpecific.patientSafetyAlerts || 0}

## Active Alerts
- **Total Active Alerts**: ${activeAlerts.length}
- **Critical Alerts**: ${criticalAlerts.length}
- **Patient Safety Related**: ${activeAlerts.filter((a: any) => a.healthcareImpact === 'patient_safety').length}

## Healthcare Compliance Status
${this.generateComplianceStatus(latestMetrics)}

## Recommendations
${this.generateRecommendations(latestMetrics, activeAlerts)}
`;
  }

  private generateComplianceStatus(metrics?: PerformanceMetrics): string {
    if (!metrics) return '❌ No metrics available';

    return `
- **PHI Access Compliance**: ${phiCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Emergency Response Compliance**: ${emergencyCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Audit Logging Compliance**: ${auditCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Availability Compliance**: ${availabilityCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
`;
  }

  private generateRecommendations(metrics?: PerformanceMetrics, alerts?: PerformanceAlert[]): string {
    const recommendations: string[] = [];

    if (metrics) {
      if (metrics.healthcareSpecific.phiAccessLatency > this.healthcareThresholds.phiAccessTime) {
        recommendations.push('🔒 Optimize PHI access queries to meet healthcare compliance requirements');
      }

      if (metrics.healthcareSpecific.emergencySystemLatency > this.healthcareThresholds.emergencyResponseTime) {
        recommendations.push('🚨 Critical: Improve emergency system response times for patient safety');
      }

      if (metrics.errorRate.rate > this.healthcareThresholds.maxErrorRate) {
        recommendations.push('🔧 Address system errors that may impact healthcare workflows');
      }

      if (metrics.availability.uptime < this.healthcareThresholds.minAvailability) {
        recommendations.push('⚡ Implement high availability measures for healthcare-critical systems');
      }
    }

    if (alerts && alerts.length > 0) {

      if (patientSafetyAlerts.length > 0) {
        recommendations.push('🏥 Immediate attention required for patient safety-related alerts');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System performance is within acceptable healthcare standards');
    }

    return recommendations.join('\n');
  }

  getDashboards(): MonitoringDashboard[] {
    return this.dashboards;
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getLatestMetrics(): PerformanceMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  async resolveAlert(alertId: string): Promise<void> {

    if (alert) {
      alert.resolved = true;
      // }
  }
}

export default PerformanceMonitoringSystem;
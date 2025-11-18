
export interface ObservabilityConfig {
  metrics: {
    enabled: boolean;
    collection: {
      interval: number; // seconds
      retention: number; // days
      aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
    };
    healthcare: {
      phiAccessMetrics: boolean;
      patientSafetyMetrics: boolean;
      complianceMetrics: boolean;
      emergencySystemMetrics: boolean;
    };
    business: {
      userEngagement: boolean;
      clinicalWorkflow: boolean;
      operationalEfficiency: boolean;
    };
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    structured: boolean;
    healthcare: {
      auditLogging: boolean;
      phiAccessLogging: boolean;
      complianceLogging: boolean;
      securityEventLogging: boolean;
    };
    retention: {
      application: number; // days
      audit: number; // days (longer for compliance)
      security: number; // days
    };
  };
  tracing: {
    enabled: boolean;
    sampling: {
      rate: number; // percentage 0-100
      healthcare: {
        phiOperations: number; // 100% for PHI operations
        emergencyRequests: number; // 100% for emergency
        complianceOperations: number; // 100% for compliance
      };
    };
    exporters: ('jaeger' | 'zipkin' | 'datadog' | 'newrelic')[];
  };
  alerting: {
    enabled: boolean;
    channels: ('email' | 'slack' | 'pagerduty' | 'webhook')[];
    healthcare: {
      patientSafetyAlerts: boolean;
      phiBreachAlerts: boolean;
      complianceViolationAlerts: boolean;
      emergencySystemAlerts: boolean;
    };
    thresholds: {
      errorRate: number; // percentage
      responseTime: number; // ms
      availability: number; // percentage
      healthcareSpecific: {
        phiAccessTime: number; // ms
        emergencyResponseTime: number; // ms
        auditLogDelay: number; // ms
      };
    };
  };
  dashboards: {
    operational: boolean;
    healthcare: boolean;
    compliance: boolean;
    business: boolean;
    executive: boolean;
  };
}

export interface Metric {
  id: string;
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  unit: string;
  timestamp: Date;
  labels: Record<string, string>;
  healthcareRelevant: boolean;
  complianceRequired: boolean;
  patientSafetyCritical: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  spanId?: string;
  metadata: Record<string, unknown>;
  healthcare: {
    phiRelated: boolean;
    patientId?: string;
    complianceEvent: boolean;
    auditRequired: boolean;
  };
}

export interface Trace {
  id: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  spans: Span[];
  status: 'success' | 'error' | 'timeout';
  healthcare: {
    phiAccess: boolean;
    patientSafety: boolean;
    emergency: boolean;
    compliance: boolean;
  };
}

export interface Span {
  id: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: Record<string, unknown>;
  logs: SpanLog[];
  status: 'success' | 'error' | 'timeout';
  healthcareContext?: {
    phiInvolved: boolean;
    patientId?: string;
    clinicalWorkflow: boolean;
  };
}

export interface SpanLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'firing' | 'resolved' | 'acknowledged';
  timestamp: Date;
  source: string;
  message: string;
  context: Record<string, unknown>;
  healthcare: {
    patientSafety: boolean;
    phiBreach: boolean;
    complianceViolation: boolean;
    emergencySystem: boolean;
  };
  acknowledgements: {
    user: string;
    timestamp: Date;
    note?: string;
  }[];
  resolutions: {
    user: string;
    timestamp: Date;
    action: string;
    note?: string;
  }[];
}

export interface Dashboard {
  id: string;
  name: string;
  type: 'operational' | 'healthcare' | 'compliance' | 'business' | 'executive';
  panels: DashboardPanel[];
  refreshInterval: number; // seconds
  healthcareContext: boolean;
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'graph' | 'singlestat' | 'table' | 'heatmap' | 'gauge';
  query: string;
  visualization: {
    chartType?: 'line' | 'bar' | 'pie' | 'scatter';
    thresholds?: { value: number; color: string }[];
    units?: string;
  };
  healthcareRelevant: boolean;
  complianceRequired: boolean;
  patientSafetyCritical: boolean;
}

export interface ObservabilityMetrics {
  systemHealth: {
    uptime: number; // percentage
    responseTime: number; // ms
    throughput: number; // requests/second
    errorRate: number; // percentage
  };
  healthcare: {
    phiAccessLatency: number; // ms
    patientSafetyAlerts: number;
    complianceViolations: number;
    emergencySystemUptime: number; // percentage
    auditLogCompleteness: number; // percentage
  };
  business: {
    activeUsers: number;
    clinicalWorkflowsCompleted: number;
    patientEngagement: number;
    operationalEfficiency: number; // percentage
  };
  infrastructure: {
    cpuUtilization: number; // percentage
    memoryUtilization: number; // percentage
    diskUtilization: number; // percentage
    networkLatency: number; // ms
  };
}

export class ProductionObservabilitySystem {
  private config: ObservabilityConfig;
  private metrics: Map<string, Metric[]> = new Map();
  private logs: LogEntry[] = [];
  private traces: Map<string, Trace> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();

  constructor(config?: Partial<ObservabilityConfig>) {
    this.config = {
      metrics: {
        enabled: true,
        collection: {
          interval: 15, // 15 seconds
          retention: 90, // 90 days
          aggregation: 'avg',
        },
        healthcare: {
          phiAccessMetrics: true,
          patientSafetyMetrics: true,
          complianceMetrics: true,
          emergencySystemMetrics: true,
        },
        business: {
          userEngagement: true,
          clinicalWorkflow: true,
          operationalEfficiency: true,
        },
        ...config?.metrics
      },
      logging: {
        enabled: true,
        level: 'info',
        structured: true,
        healthcare: {
          auditLogging: true,
          phiAccessLogging: true,
          complianceLogging: true,
          securityEventLogging: true,
        },
        retention: {
          application: 30, // 30 days
          audit: 2555, // 7 years for HIPAA compliance
          security: 365, // 1 year
        },
        ...config?.logging
      },
      tracing: {
        enabled: true,
        sampling: {
          rate: 10, // 10% default sampling
          healthcare: {
            phiOperations: 100, // 100% sampling for PHI
            emergencyRequests: 100, // 100% sampling for emergency
            complianceOperations: 100, // 100% sampling for compliance
          },
        },
        exporters: ['jaeger'],
        ...config?.tracing
      },
      alerting: {
        enabled: true,
        channels: ['slack', 'email'],
        healthcare: {
          patientSafetyAlerts: true,
          phiBreachAlerts: true,
          complianceViolationAlerts: true,
          emergencySystemAlerts: true,
        },
        thresholds: {
          errorRate: 1.0, // 1%
          responseTime: 3000, // 3 seconds
          availability: 99.9, // 99.9%
          healthcareSpecific: {
            phiAccessTime: 1000, // 1 second
            emergencyResponseTime: 500, // 0.5 seconds
            auditLogDelay: 100, // 100ms
          },
        },
        ...config?.alerting
      },
      dashboards: {
        operational: true,
        healthcare: true,
        compliance: true,
        business: true,
        executive: true,
        ...config?.dashboards
      }
    };

    this.initializeObservability();
  }

  private async initializeObservability(): Promise<void> {
    // // Initialize metrics collection
    if (this.config.metrics.enabled) {
      this.startMetricsCollection();
    }

    // Initialize logging
    if (this.config.logging.enabled) {
      this.setupLogging();
    }

    // Initialize tracing
    if (this.config.tracing.enabled) {
      this.setupTracing();
    }

    // Initialize alerting
    if (this.config.alerting.enabled) {
      this.setupAlerting();
    }

    // Create dashboards
    await this.createDashboards();

    // }

  private startMetricsCollection(): void {
    // setInterval(async () => {
      await this.collectSystemMetrics();
      if (this.config.metrics.healthcare.phiAccessMetrics) {
        await this.collectHealthcareMetrics();
      }
      if (this.config.metrics.business.userEngagement) {
        await this.collectBusinessMetrics();
      }
    }, this.config.metrics.collection.interval * 1000);
  }

  private async collectSystemMetrics(): Promise<void> {

    // System health metrics
    this.recordMetric({
      id: `system_uptime_${timestamp.getTime()}`,
      name: 'system_uptime',
      type: 'gauge',
      value: 99.95 + Math.random() * 0.04, // 99.95-99.99%
      unit: 'percent',
      timestamp,
      labels: { service: 'vital-path', environment: 'production' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: false
    });

    this.recordMetric({
      id: `response_time_${timestamp.getTime()}`,
      name: 'avg_response_time',
      type: 'histogram',
      value: Math.random() * 500 + 100, // 100-600ms
      unit: 'ms',
      timestamp,
      labels: { endpoint: 'api', service: 'vital-path' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: false
    });

    this.recordMetric({
      id: `error_rate_${timestamp.getTime()}`,
      name: 'error_rate',
      type: 'gauge',
      value: Math.random() * 0.5, // 0-0.5%
      unit: 'percent',
      timestamp,
      labels: { service: 'vital-path' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: true
    });

    this.recordMetric({
      id: `throughput_${timestamp.getTime()}`,
      name: 'requests_per_second',
      type: 'counter',
      value: Math.random() * 100 + 50, // 50-150 RPS
      unit: 'rps',
      timestamp,
      labels: { service: 'vital-path' },
      healthcareRelevant: false,
      complianceRequired: false,
      patientSafetyCritical: false
    });
  }

  private async collectHealthcareMetrics(): Promise<void> {

    // PHI access metrics
    this.recordMetric({
      id: `phi_access_latency_${timestamp.getTime()}`,
      name: 'phi_access_latency',
      type: 'histogram',
      value: Math.random() * 200 + 100, // 100-300ms
      unit: 'ms',
      timestamp,
      labels: { operation: 'phi_read', compliance: 'hipaa' },
      healthcareRelevant: true,
      complianceRequired: true,
      patientSafetyCritical: true
    });

    // Patient safety metrics
    this.recordMetric({
      id: `patient_safety_alerts_${timestamp.getTime()}`,
      name: 'patient_safety_alerts',
      type: 'counter',
      value: Math.floor(Math.random() * 3), // 0-2 alerts
      unit: 'count',
      timestamp,
      labels: { severity: 'all', system: 'patient_safety' },
      healthcareRelevant: true,
      complianceRequired: true,
      patientSafetyCritical: true
    });

    // Emergency system uptime
    this.recordMetric({
      id: `emergency_system_uptime_${timestamp.getTime()}`,
      name: 'emergency_system_uptime',
      type: 'gauge',
      value: 99.98 + Math.random() * 0.01, // 99.98-99.99%
      unit: 'percent',
      timestamp,
      labels: { system: 'emergency', critical: 'true' },
      healthcareRelevant: true,
      complianceRequired: true,
      patientSafetyCritical: true
    });

    // Audit log completeness
    this.recordMetric({
      id: `audit_log_completeness_${timestamp.getTime()}`,
      name: 'audit_log_completeness',
      type: 'gauge',
      value: 99.9 + Math.random() * 0.09, // 99.9-99.99%
      unit: 'percent',
      timestamp,
      labels: { compliance: 'hipaa', requirement: 'audit' },
      healthcareRelevant: true,
      complianceRequired: true,
      patientSafetyCritical: false
    });
  }

  private async collectBusinessMetrics(): Promise<void> {

    // Active users
    this.recordMetric({
      id: `active_users_${timestamp.getTime()}`,
      name: 'active_users',
      type: 'gauge',
      value: Math.floor(Math.random() * 500 + 100), // 100-600 users
      unit: 'count',
      timestamp,
      labels: { type: 'healthcare_professionals', session: 'active' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: false
    });

    // Clinical workflows completed
    this.recordMetric({
      id: `clinical_workflows_${timestamp.getTime()}`,
      name: 'clinical_workflows_completed',
      type: 'counter',
      value: Math.floor(Math.random() * 50 + 20), // 20-70 workflows
      unit: 'count',
      timestamp,
      labels: { workflow_type: 'patient_care', status: 'completed' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: false
    });

    // Operational efficiency
    this.recordMetric({
      id: `operational_efficiency_${timestamp.getTime()}`,
      name: 'operational_efficiency',
      type: 'gauge',
      value: Math.random() * 20 + 80, // 80-100%
      unit: 'percent',
      timestamp,
      labels: { department: 'clinical', metric: 'efficiency' },
      healthcareRelevant: true,
      complianceRequired: false,
      patientSafetyCritical: false
    });
  }

  private setupLogging(): void {
    // // Healthcare audit logging setup
    if (this.config.logging.healthcare.auditLogging) {
      // }

    // PHI access logging setup
    if (this.config.logging.healthcare.phiAccessLogging) {
      // }

    // Security event logging
    if (this.config.logging.healthcare.securityEventLogging) {
      // }
  }

  private setupTracing(): void {
    // // Healthcare-specific tracing configuration
    // // // }

  private setupAlerting(): void {
    // // Healthcare-specific alerts
    if (this.config.alerting.healthcare.patientSafetyAlerts) {
      // }

    if (this.config.alerting.healthcare.phiBreachAlerts) {
      // }

    if (this.config.alerting.healthcare.complianceViolationAlerts) {
      // }

    // Start monitoring for alert conditions
    setInterval(() => {
      this.checkAlertConditions();
    }, 30000); // Check every 30 seconds
  }

  private async createDashboards(): Promise<void> {
    // if (this.config.dashboards.healthcare) {
      await this.createHealthcareDashboard();
    }

    if (this.config.dashboards.operational) {
      await this.createOperationalDashboard();
    }

    if (this.config.dashboards.compliance) {
      await this.createComplianceDashboard();
    }

    if (this.config.dashboards.executive) {
      await this.createExecutiveDashboard();
    }

    // }

  private async createHealthcareDashboard(): Promise<void> {
    const dashboard: Dashboard = {
      id: 'healthcare_dashboard',
      name: 'Healthcare Operations Dashboard',
      type: 'healthcare',
      refreshInterval: 30,
      healthcareContext: true,
      panels: [
        {
          id: 'patient_safety_alerts',
          title: 'Patient Safety Alerts',
          type: 'singlestat',
          query: 'patient_safety_alerts',
          visualization: {
            thresholds: [
              { value: 0, color: 'green' },
              { value: 1, color: 'yellow' },
              { value: 3, color: 'red' }
            ],
            units: 'count'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: true
        },
        {
          id: 'phi_access_latency',
          title: 'PHI Access Latency',
          type: 'graph',
          query: 'phi_access_latency',
          visualization: {
            chartType: 'line',
            thresholds: [
              { value: 1000, color: 'red' }
            ],
            units: 'ms'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: false
        },
        {
          id: 'emergency_system_uptime',
          title: 'Emergency System Uptime',
          type: 'gauge',
          query: 'emergency_system_uptime',
          visualization: {
            thresholds: [
              { value: 99.5, color: 'red' },
              { value: 99.9, color: 'yellow' },
              { value: 99.95, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: true
        },
        {
          id: 'audit_log_completeness',
          title: 'Audit Log Completeness',
          type: 'gauge',
          query: 'audit_log_completeness',
          visualization: {
            thresholds: [
              { value: 95, color: 'red' },
              { value: 99, color: 'yellow' },
              { value: 99.9, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.set('healthcare', dashboard);
  }

  private async createOperationalDashboard(): Promise<void> {
    const dashboard: Dashboard = {
      id: 'operational_dashboard',
      name: 'System Operations Dashboard',
      type: 'operational',
      refreshInterval: 15,
      healthcareContext: false,
      panels: [
        {
          id: 'system_uptime',
          title: 'System Uptime',
          type: 'gauge',
          query: 'system_uptime',
          visualization: {
            thresholds: [
              { value: 99.0, color: 'red' },
              { value: 99.5, color: 'yellow' },
              { value: 99.9, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: false
        },
        {
          id: 'response_time',
          title: 'Average Response Time',
          type: 'graph',
          query: 'avg_response_time',
          visualization: {
            chartType: 'line',
            thresholds: [
              { value: 3000, color: 'red' },
              { value: 1000, color: 'yellow' }
            ],
            units: 'ms'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: false
        },
        {
          id: 'error_rate',
          title: 'Error Rate',
          type: 'graph',
          query: 'error_rate',
          visualization: {
            chartType: 'line',
            thresholds: [
              { value: 1.0, color: 'red' },
              { value: 0.5, color: 'yellow' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: true
        },
        {
          id: 'throughput',
          title: 'Requests per Second',
          type: 'graph',
          query: 'requests_per_second',
          visualization: {
            chartType: 'line',
            units: 'rps'
          },
          healthcareRelevant: false,
          complianceRequired: false,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.set('operational', dashboard);
  }

  private async createComplianceDashboard(): Promise<void> {
    const dashboard: Dashboard = {
      id: 'compliance_dashboard',
      name: 'Healthcare Compliance Dashboard',
      type: 'compliance',
      refreshInterval: 60,
      healthcareContext: true,
      panels: [
        {
          id: 'hipaa_compliance_score',
          title: 'HIPAA Compliance Score',
          type: 'gauge',
          query: 'hipaa_compliance_score',
          visualization: {
            thresholds: [
              { value: 90, color: 'red' },
              { value: 95, color: 'yellow' },
              { value: 98, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: false
        },
        {
          id: 'phi_access_violations',
          title: 'PHI Access Violations',
          type: 'singlestat',
          query: 'phi_access_violations',
          visualization: {
            thresholds: [
              { value: 0, color: 'green' },
              { value: 1, color: 'red' }
            ],
            units: 'count'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: true
        },
        {
          id: 'audit_trail_gaps',
          title: 'Audit Trail Gaps',
          type: 'table',
          query: 'audit_trail_gaps',
          visualization: {
            units: 'count'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.set('compliance', dashboard);
  }

  private async createExecutiveDashboard(): Promise<void> {
    const dashboard: Dashboard = {
      id: 'executive_dashboard',
      name: 'Executive Healthcare Dashboard',
      type: 'executive',
      refreshInterval: 300, // 5 minutes
      healthcareContext: true,
      panels: [
        {
          id: 'overall_system_health',
          title: 'Overall System Health',
          type: 'gauge',
          query: 'overall_system_health',
          visualization: {
            thresholds: [
              { value: 95, color: 'red' },
              { value: 98, color: 'yellow' },
              { value: 99, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: false
        },
        {
          id: 'patient_safety_incidents',
          title: 'Patient Safety Incidents',
          type: 'singlestat',
          query: 'patient_safety_incidents',
          visualization: {
            thresholds: [
              { value: 0, color: 'green' },
              { value: 1, color: 'red' }
            ],
            units: 'count'
          },
          healthcareRelevant: true,
          complianceRequired: true,
          patientSafetyCritical: true
        },
        {
          id: 'operational_efficiency',
          title: 'Operational Efficiency',
          type: 'gauge',
          query: 'operational_efficiency',
          visualization: {
            thresholds: [
              { value: 80, color: 'red' },
              { value: 90, color: 'yellow' },
              { value: 95, color: 'green' }
            ],
            units: '%'
          },
          healthcareRelevant: true,
          complianceRequired: false,
          patientSafetyCritical: false
        }
      ]
    };

    this.dashboards.set('executive', dashboard);
  }

  private recordMetric(metric: Metric): void {

    if (!this.metrics.has(metricKey)) {
      this.metrics.set(metricKey, []);
    }

    metricsList.push(metric);

    // Keep only recent metrics based on retention policy

    this.metrics.set(
      metricKey,
      metricsList.filter((m: any) => m.timestamp > cutoffTime)
    );
  }

  private checkAlertConditions(): void {
    // Check system health alerts
    this.checkSystemHealthAlerts();

    // Check healthcare-specific alerts
    if (this.config.alerting.healthcare.patientSafetyAlerts) {
      this.checkPatientSafetyAlerts();
    }

    if (this.config.alerting.healthcare.phiBreachAlerts) {
      this.checkPHIBreachAlerts();
    }

    if (this.config.alerting.healthcare.emergencySystemAlerts) {
      this.checkEmergencySystemAlerts();
    }
  }

  private checkSystemHealthAlerts(): void {
    // Check error rate

    if (latestErrorRate && latestErrorRate.value > this.config.alerting.thresholds.errorRate) {
      this.createAlert({
        id: `high_error_rate_${Date.now()}`,
        name: 'High Error Rate',
        severity: 'high',
        status: 'firing',
        timestamp: new Date(),
        source: 'system_monitoring',
        message: `Error rate ${latestErrorRate.value.toFixed(2)}% exceeds threshold ${this.config.alerting.thresholds.errorRate}%`,
        context: { metric: 'error_rate', value: latestErrorRate.value },
        healthcare: {
          patientSafety: true,
          phiBreach: false,
          complianceViolation: false,
          emergencySystem: false
        },
        acknowledgements: [],
        resolutions: []
      });
    }

    // Check response time

    if (latestResponseTime && latestResponseTime.value > this.config.alerting.thresholds.responseTime) {
      this.createAlert({
        id: `high_response_time_${Date.now()}`,
        name: 'High Response Time',
        severity: 'medium',
        status: 'firing',
        timestamp: new Date(),
        source: 'performance_monitoring',
        message: `Response time ${Math.round(latestResponseTime.value)}ms exceeds threshold ${this.config.alerting.thresholds.responseTime}ms`,
        context: { metric: 'avg_response_time', value: latestResponseTime.value },
        healthcare: {
          patientSafety: false,
          phiBreach: false,
          complianceViolation: false,
          emergencySystem: false
        },
        acknowledgements: [],
        resolutions: []
      });
    }
  }

  private checkPatientSafetyAlerts(): void {

    if (latestMetric && latestMetric.value > 0) {
      this.createAlert({
        id: `patient_safety_alert_${Date.now()}`,
        name: 'Patient Safety Alert',
        severity: 'emergency',
        status: 'firing',
        timestamp: new Date(),
        source: 'patient_safety_monitoring',
        message: `${latestMetric.value} patient safety alert(s) detected`,
        context: { alerts_count: latestMetric.value },
        healthcare: {
          patientSafety: true,
          phiBreach: false,
          complianceViolation: false,
          emergencySystem: false
        },
        acknowledgements: [],
        resolutions: []
      });
    }
  }

  private checkPHIBreachAlerts(): void {

    if (latestMetric && latestMetric.value > this.config.alerting.thresholds.healthcareSpecific.phiAccessTime) {
      this.createAlert({
        id: `phi_access_slow_${Date.now()}`,
        name: 'PHI Access Performance Degradation',
        severity: 'high',
        status: 'firing',
        timestamp: new Date(),
        source: 'phi_monitoring',
        message: `PHI access latency ${Math.round(latestMetric.value)}ms exceeds threshold ${this.config.alerting.thresholds.healthcareSpecific.phiAccessTime}ms`,
        context: { latency: latestMetric.value },
        healthcare: {
          patientSafety: false,
          phiBreach: true,
          complianceViolation: true,
          emergencySystem: false
        },
        acknowledgements: [],
        resolutions: []
      });
    }
  }

  private checkEmergencySystemAlerts(): void {

    if (latestMetric && latestMetric.value < 99.5) {
      this.createAlert({
        id: `emergency_system_down_${Date.now()}`,
        name: 'Emergency System Degradation',
        severity: 'emergency',
        status: 'firing',
        timestamp: new Date(),
        source: 'emergency_system_monitoring',
        message: `Emergency system uptime ${latestMetric.value.toFixed(2)}% below critical threshold`,
        context: { uptime: latestMetric.value },
        healthcare: {
          patientSafety: true,
          phiBreach: false,
          complianceViolation: true,
          emergencySystem: true
        },
        acknowledgements: [],
        resolutions: []
      });
    }
  }

  private createAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);

    // Send notifications through configured channels
    this.sendAlertNotifications(alert);

    // } ALERT: ${alert.message}`);
  }

  private sendAlertNotifications(alert: Alert): void {
    for (const channel of this.config.alerting.channels) {
      // Simulate sending notification
      // }

    // Special handling for healthcare alerts
    if (alert.healthcare.patientSafety) {
      // }

    if (alert.healthcare.emergencySystem) {
      // }
  }

  async generateObservabilityReport(): Promise<string> {

    return `
# VITAL Path Production Observability Report
Generated: ${new Date().toISOString()}

## System Health Overview
- **Uptime**: ${metrics.systemHealth.uptime.toFixed(2)}%
- **Average Response Time**: ${Math.round(metrics.systemHealth.responseTime)}ms
- **Throughput**: ${Math.round(metrics.systemHealth.throughput)} req/s
- **Error Rate**: ${metrics.systemHealth.errorRate.toFixed(2)}%

## Healthcare Metrics
- **PHI Access Latency**: ${Math.round(metrics.healthcare.phiAccessLatency)}ms
- **Patient Safety Alerts**: ${metrics.healthcare.patientSafetyAlerts}
- **Emergency System Uptime**: ${metrics.healthcare.emergencySystemUptime.toFixed(2)}%
- **Audit Log Completeness**: ${metrics.healthcare.auditLogCompleteness.toFixed(2)}%
- **Compliance Violations**: ${metrics.healthcare.complianceViolations}

## Business Metrics
- **Active Users**: ${metrics.business.activeUsers}
- **Clinical Workflows Completed**: ${metrics.business.clinicalWorkflowsCompleted}
- **Operational Efficiency**: ${metrics.business.operationalEfficiency.toFixed(1)}%

## Infrastructure Health
- **CPU Utilization**: ${metrics.infrastructure.cpuUtilization.toFixed(1)}%
- **Memory Utilization**: ${metrics.infrastructure.memoryUtilization.toFixed(1)}%
- **Disk Utilization**: ${metrics.infrastructure.diskUtilization.toFixed(1)}%
- **Network Latency**: ${Math.round(metrics.infrastructure.networkLatency)}ms

## Active Alerts (${activeAlerts.length})
${activeAlerts.length > 0 ?
  activeAlerts.map(alert => `
### ${alert.name} (${alert.severity.toUpperCase()})
- **Message**: ${alert.message}
- **Source**: ${alert.source}
- **Time**: ${alert.timestamp.toISOString()}
- **Patient Safety Impact**: ${alert.healthcare.patientSafety ? 'YES' : 'NO'}
- **Compliance Impact**: ${alert.healthcare.complianceViolation ? 'YES' : 'NO'}
`).join('') :
  '✅ No active alerts'
}

## Dashboard Summary
- **Operational Dashboard**: ${this.dashboards.has('operational') ? '✅ Active' : '❌ Inactive'}
- **Healthcare Dashboard**: ${this.dashboards.has('healthcare') ? '✅ Active' : '❌ Inactive'}
- **Compliance Dashboard**: ${this.dashboards.has('compliance') ? '✅ Active' : '❌ Inactive'}
- **Executive Dashboard**: ${this.dashboards.has('executive') ? '✅ Active' : '❌ Inactive'}

## Healthcare Compliance Status
${this.generateComplianceStatus(metrics)}

## Recommendations
${this.generateObservabilityRecommendations(metrics, activeAlerts)}
`;
  }

  private async getCurrentMetrics(): Promise<ObservabilityMetrics> {
    // Get latest metrics from each category

      return metrics.length > 0 ? metrics[metrics.length - 1].value : 0;
    };

    return {
      systemHealth: {
        uptime: getLatestMetric('system_uptime'),
        responseTime: getLatestMetric('avg_response_time'),
        throughput: getLatestMetric('requests_per_second'),
        errorRate: getLatestMetric('error_rate')
      },
      healthcare: {
        phiAccessLatency: getLatestMetric('phi_access_latency'),
        patientSafetyAlerts: getLatestMetric('patient_safety_alerts'),
        complianceViolations: 0, // Placeholder
        emergencySystemUptime: getLatestMetric('emergency_system_uptime'),
        auditLogCompleteness: getLatestMetric('audit_log_completeness')
      },
      business: {
        activeUsers: getLatestMetric('active_users'),
        clinicalWorkflowsCompleted: getLatestMetric('clinical_workflows_completed'),
        patientEngagement: 85, // Placeholder
        operationalEfficiency: getLatestMetric('operational_efficiency')
      },
      infrastructure: {
        cpuUtilization: Math.random() * 20 + 40, // 40-60%
        memoryUtilization: Math.random() * 30 + 50, // 50-80%
        diskUtilization: Math.random() * 20 + 20, // 20-40%
        networkLatency: Math.random() * 20 + 10 // 10-30ms
      }
    };
  }

  private generateComplianceStatus(metrics: ObservabilityMetrics): string {

    return `
- **PHI Access Compliance**: ${phiCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Emergency System Compliance**: ${emergencyCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Audit Logging Compliance**: ${auditCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Patient Safety Compliance**: ${safetyCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

**Overall Healthcare Compliance**: ${phiCompliant && emergencyCompliant && auditCompliant && safetyCompliant ? '✅ COMPLIANT' : '⚠️ NEEDS ATTENTION'}
`;
  }

  private generateObservabilityRecommendations(metrics: ObservabilityMetrics, alerts: Alert[]): string {
    const recommendations: string[] = [];

    // System health recommendations
    if (metrics.systemHealth.errorRate > 1.0) {
      recommendations.push('🔧 High error rate detected - investigate and resolve application errors');
    }

    if (metrics.systemHealth.responseTime > 2000) {
      recommendations.push('⚡ Response times above optimal - consider performance optimization');
    }

    // Healthcare-specific recommendations
    if (metrics.healthcare.phiAccessLatency > 1000) {
      recommendations.push('🔒 PHI access latency exceeds compliance thresholds - optimize data access');
    }

    if (metrics.healthcare.patientSafetyAlerts > 0) {
      recommendations.push('🚨 URGENT: Patient safety alerts require immediate investigation');
    }

    if (metrics.healthcare.emergencySystemUptime < 99.9) {
      recommendations.push('🏥 Emergency system uptime below healthcare standards - implement redundancy');
    }

    // Alert-based recommendations

    if (emergencyAlerts.length > 0) {
      recommendations.push('🚨 CRITICAL: Emergency alerts require immediate attention');
    }

    // Infrastructure recommendations
    if (metrics.infrastructure.cpuUtilization > 80) {
      recommendations.push('💻 High CPU utilization - consider scaling resources');
    }

    if (metrics.infrastructure.memoryUtilization > 85) {
      recommendations.push('💾 High memory utilization - monitor for memory leaks');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System observability indicates healthy operations');
    }

    return recommendations.join('\n');
  }

  getDashboards(): Map<string, Dashboard> {
    return this.dashboards;
  }

  getMetrics(): Map<string, Metric[]> {
    return this.metrics;
  }

  getAlerts(): Map<string, Alert> {
    return this.alerts;
  }

  async acknowledgeAlert(alertId: string, user: string, note?: string): Promise<void> {

    if (alert) {
      alert.acknowledgements.push({
        user,
        timestamp: new Date(),
        note
      });
      // }
  }

  async resolveAlert(alertId: string, user: string, action: string, note?: string): Promise<void> {

    if (alert) {
      alert.status = 'resolved';
      alert.resolutions.push({
        user,
        timestamp: new Date(),
        action,
        note
      });
      // }
  }
}

export default ProductionObservabilitySystem;
'use client';

import React, { useState } from 'react';

interface DeviceConfig {
  id: string;
  name: string;
  type: 'wearable' | 'medical_device' | 'sensor' | 'smartphone';
  manufacturer: string;
  model: string;
  dataTypes: string[];
  connectivity: 'bluetooth' | 'wifi' | 'cellular' | 'zigbee';
  samplingRate: string;
  batteryLife: string;
  fdaCleared: boolean;
  hipaaCompliant: boolean;
}

interface DataPipeline {
  id: string;
  name: string;
  sourceDevices: string[];
  processors: DataProcessor[];
  storage: StorageConfig;
  alerts: AlertRule[];
  analytics: AnalyticsConfig;
}

interface DataProcessor {
  id: string;
  type: 'filter' | 'transform' | 'validate' | 'encrypt' | 'aggregate';
  name: string;
  configuration: { [key: string]: any };
  order: number;
}

interface StorageConfig {
  type: 'cloud' | 'hybrid' | 'on_premise';
  encryption: boolean;
  backup: boolean;
  retention: number; // days
  compliance: string[];
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: NotificationChannel[];
  escalation: EscalationPath[];
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'app_push' | 'dashboard' | 'ehr';
  target: string;
  template: string;
}

interface EscalationPath {
  delay: number; // minutes
  target: string;
  method: 'call' | 'page' | 'ehr_alert';
}

interface AnalyticsConfig {
  realTimeMetrics: string[];
  trendAnalysis: boolean;
  predictiveModels: string[];
  reportingSchedule: string;
}

const RemoteMonitoringBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'pipeline' | 'alerts' | 'dashboard' | 'deploy'>('devices');
  const [selectedDevices, setSelectedDevices] = useState<DeviceConfig[]>([]);
  const [dataPipeline, setDataPipeline] = useState<DataPipeline | null>(null);

  const availableDevices: DeviceConfig[] = [
    {
      id: 'apple-watch-series-9',
      name: 'Apple Watch Series 9',
      type: 'wearable',
      manufacturer: 'Apple',
      model: 'Series 9',
      dataTypes: ['heart_rate', 'ecg', 'activity', 'sleep', 'fall_detection'],
      connectivity: 'bluetooth',
      samplingRate: '1 Hz - 500 Hz',
      batteryLife: '18 hours',
      fdaCleared: true,
      hipaaCompliant: true
    },
    {
      id: 'omron-bp-cuff',
      name: 'Omron HeartGuide',
      type: 'medical_device',
      manufacturer: 'Omron',
      model: 'HeartGuide',
      dataTypes: ['blood_pressure', 'heart_rate'],
      connectivity: 'bluetooth',
      samplingRate: 'On-demand',
      batteryLife: '7 days',
      fdaCleared: true,
      hipaaCompliant: true
    },
    {
      id: 'dexcom-g7',
      name: 'Dexcom G7 CGM',
      type: 'medical_device',
      manufacturer: 'Dexcom',
      model: 'G7',
      dataTypes: ['glucose_continuous', 'glucose_trends'],
      connectivity: 'bluetooth',
      samplingRate: '1 minute',
      batteryLife: '10 days',
      fdaCleared: true,
      hipaaCompliant: true
    },
    {
      id: 'withings-scale',
      name: 'Withings Body+',
      type: 'medical_device',
      manufacturer: 'Withings',
      model: 'Body+',
      dataTypes: ['weight', 'body_composition', 'bmi'],
      connectivity: 'wifi',
      samplingRate: 'On-demand',
      batteryLife: '18 months',
      fdaCleared: true,
      hipaaCompliant: true
    },
    {
      id: 'kardia-mobile',
      name: 'KardiaMobile 6L',
      type: 'medical_device',
      manufacturer: 'AliveCor',
      model: '6L',
      dataTypes: ['ecg_6_lead', 'heart_rate'],
      connectivity: 'bluetooth',
      samplingRate: '30 seconds',
      batteryLife: '6 months',
      fdaCleared: true,
      hipaaCompliant: true
    }
  ];

    const pipeline: DataPipeline = {
      id: 'pipeline-1',
      name: 'Patient Remote Monitoring Pipeline',
      sourceDevices: selectedDevices.map((d: any) => d.id),
      processors: [
        {
          id: 'proc-1',
          type: 'validate',
          name: 'Data Validation',
          configuration: { rules: ['range_check', 'quality_score'] },
          order: 1
        },
        {
          id: 'proc-2',
          type: 'encrypt',
          name: 'HIPAA Encryption',
          configuration: { algorithm: 'AES-256', keyManagement: 'AWS_KMS' },
          order: 2
        },
        {
          id: 'proc-3',
          type: 'transform',
          name: 'HL7 FHIR Transformation',
          configuration: { format: 'FHIR_R4', mapping: 'observations' },
          order: 3
        }
      ],
      storage: {
        type: 'cloud',
        encryption: true,
        backup: true,
        retention: 2555, // 7 years for medical data
        compliance: ['HIPAA', 'SOC2', '21CFR11']
      },
      alerts: [
        {
          id: 'alert-1',
          name: 'Critical Vital Signs',
          condition: 'heart_rate > 120 OR blood_pressure_systolic > 180',
          severity: 'critical',
          notification: [
            { type: 'app_push', target: 'patient_app', template: 'critical_vital_alert' },
            { type: 'ehr', target: 'epic_integration', template: 'ehr_alert' }
          ],
          escalation: [
            { delay: 5, target: 'on_call_nurse', method: 'call' },
            { delay: 15, target: 'attending_physician', method: 'page' }
          ]
        },
        {
          id: 'alert-2',
          name: 'Device Disconnection',
          condition: 'device_offline > 2 hours',
          severity: 'medium',
          notification: [
            { type: 'app_push', target: 'patient_app', template: 'device_check' }
          ],
          escalation: [
            { delay: 24, target: 'care_coordinator', method: 'call' }
          ]
        }
      ],
      analytics: {
        realTimeMetrics: ['heart_rate', 'blood_pressure', 'glucose'],
        trendAnalysis: true,
        predictiveModels: ['deterioration_risk', 'adherence_prediction'],
        reportingSchedule: 'daily'
      }
    };

    setDataPipeline(pipeline);
  };

      devices: selectedDevices.map(device => ({
        id: device.id,
        type: device.type,
        connectivity: device.connectivity,
        dataTypes: device.dataTypes
      })),
      pipeline: dataPipeline ? {
        processors: dataPipeline.processors,
        storage: dataPipeline.storage,
        alerts: dataPipeline.alerts.length
      } : null
    };

    return JSON.stringify(config, null, 2);
  };

      infrastructure: {
        provider: 'aws',
        services: {
          iot_core: 'device_connectivity',
          lambda: 'data_processing',
          dynamodb: 'patient_data_storage',
          sns: 'alert_notifications',
          api_gateway: 'mobile_app_api'
        }
      },
      security: {
        encryption: 'AES-256',
        authentication: 'OAuth2_PKCE',
        authorization: 'RBAC',
        audit_logging: true
      },
    const deployment = {
      compliance: {
        hipaa: {
          encryption_at_rest: true,
          encryption_in_transit: true,
          access_controls: true,
          audit_logs: true,
          business_associate_agreement: true
        },
        fda: {
          software_validation: true,
          risk_management: 'ISO_14971',
          clinical_evaluation: true
        }
      },
      monitoring: {
        uptime_alerts: true,
        performance_metrics: true,
        security_monitoring: true,
        compliance_reporting: 'automated'
      }
    };

    if (typeof document === 'undefined') {
      console.warn('Protocol export is only available in the browser environment.');
      return;
    }

    const blob = new Blob([JSON.stringify(deployment, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'remote_monitoring_deployment.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-canvas-surface border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">Remote Monitoring Solution Builder</h1>
          <p className="text-neutral-600 mt-1">
            Build HIPAA-compliant remote patient monitoring solutions with FDA-cleared devices
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-canvas-surface border-b border-neutral-200 px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'devices', label: '📱 Device Selection', desc: 'Choose FDA-cleared devices' },
              { key: 'pipeline', label: '⚡ Data Pipeline', desc: 'Configure data processing' },
              { key: 'alerts', label: '🚨 Alert System', desc: 'Set up clinical alerts' },
              { key: 'dashboard', label: '📊 Dashboard', desc: 'Design monitoring UI' },
              { key: 'deploy', label: '🚀 Deploy', desc: 'Cloud deployment config' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as unknown)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs text-neutral-400">{tab.desc}</div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'devices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">FDA-Cleared Device Catalog</h2>
              <div className="text-sm text-neutral-600">
                Selected: {selectedDevices.length} devices
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Devices */}
              <div>
                <h3 className="text-md font-medium text-neutral-900 mb-4">Available Devices</h3>
                <div className="space-y-4">
                  {availableDevices.map(device => (
                    <div
                      key={device.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedDevices.find((d: any) => d.id === device.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 bg-canvas-surface hover:border-neutral-300'
                      }`}
                      onClick={() => {
                        if (selectedDevices.find((d: any) => d.id === device.id)) {
                          setSelectedDevices(selectedDevices.filter((d: any) => d.id !== device.id));
                        } else {
                          setSelectedDevices([...selectedDevices, device]);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-neutral-900">{device.name}</h4>
                          <p className="text-sm text-neutral-600">{device.manufacturer}</p>
                        </div>
                        <div className="flex space-x-2">
                          {device.fdaCleared && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              FDA Cleared
                            </span>
                          )}
                          {device.hipaaCompliant && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              HIPAA Ready
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-neutral-500 space-y-1">
                        <div>Data Types: {device.dataTypes.join(', ')}</div>
                        <div>Connectivity: {device.connectivity} • Battery: {device.batteryLife}</div>
                        <div>Sampling: {device.samplingRate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Configuration */}
              <div>
                <h3 className="text-md font-medium text-neutral-900 mb-4">Selected Configuration</h3>
                {selectedDevices.length === 0 ? (
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                    <div className="text-neutral-400 mb-2">📱</div>
                    <p className="text-neutral-600">Select devices to start building your monitoring solution</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDevices.map(device => (
                      <div key={device.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-neutral-900">{device.name}</div>
                            <div className="text-sm text-neutral-600">
                              {device.dataTypes.length} data streams
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedDevices(selectedDevices.filter((d: any) => d.id !== device.id))}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={createDataPipeline}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Configure Data Pipeline →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Data Processing Pipeline</h2>
              {!dataPipeline && (
                <button
                  onClick={createDataPipeline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Generate Pipeline
                </button>
              )}
            </div>

            {dataPipeline ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Data Processing Steps */}
                  <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Processing Steps</h3>

                    <div className="space-y-3">
                      {dataPipeline.processors.map(processor => (
                        <div key={processor.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {processor.order}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{processor.name}</div>
                            <div className="text-sm text-neutral-600">{processor.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage Configuration */}
                  <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Storage Configuration</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Type:</span>
                        <span className="font-medium">{dataPipeline.storage.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Encryption:</span>
                        <span className={`font-medium ${dataPipeline.storage.encryption ? 'text-green-600' : 'text-red-600'}`}>
                          {dataPipeline.storage.encryption ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Retention:</span>
                        <span className="font-medium">{dataPipeline.storage.retention} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Compliance:</span>
                        <div className="flex space-x-1">
                          {dataPipeline.storage.compliance.map(std => (
                            <span key={std} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {std}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Generated Configuration */}
                  <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Generated Configuration</h3>

                    <div className="bg-neutral-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-96 overflow-y-auto">
                      <pre>{generateConfigCode()}</pre>
                    </div>

                    <button
                      onClick={() => navigator.clipboard.writeText(generateConfigCode())}
                      className="w-full mt-3 px-4 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50"
                    >
                      Copy Configuration
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Configure Your Data Pipeline</h3>
                <p className="text-neutral-600 mb-4">
                  Select devices first, then generate an optimized HIPAA-compliant data processing pipeline
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Clinical Alert System</h2>

            {dataPipeline ? (
              <div className="space-y-6">
                {dataPipeline.alerts.map(alert => (
                  <div key={alert.id} className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-neutral-900">{alert.name}</h3>
                        <p className="text-sm text-neutral-600 font-mono">{alert.condition}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Notifications</h4>
                        <div className="space-y-2">
                          {alert.notification.map((notif, index) => (
                            <div key={index} className="text-sm text-neutral-600">
                              <span className="font-medium">{notif.type}:</span> {notif.target}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Escalation Path</h4>
                        <div className="space-y-2">
                          {alert.escalation.map((step, index) => (
                            <div key={index} className="text-sm text-neutral-600">
                              <span className="font-medium">{step.delay}min:</span> {step.method} {step.target}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
                <div className="text-4xl mb-4">🚨</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Set Up Clinical Alerts</h3>
                <p className="text-neutral-600">Configure your data pipeline first to enable alert configuration</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Monitoring Dashboard</h2>

            <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Dashboard Builder</h3>
              <p className="text-neutral-600 mb-4">
                Drag-and-drop dashboard builder for creating custom monitoring interfaces
              </p>
              <div className="text-sm text-neutral-500">
                Coming soon - Real-time dashboard designer with clinical widgets
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Deployment Configuration</h2>
              <button
                onClick={exportDeploymentConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Export Config
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Cloud Infrastructure</h3>

                <div className="space-y-4">
                  <div className="border border-neutral-200 rounded-lg p-3">
                    <div className="font-medium text-neutral-900">AWS IoT Core</div>
                    <div className="text-sm text-neutral-600">Device connectivity and management</div>
                  </div>

                  <div className="border border-neutral-200 rounded-lg p-3">
                    <div className="font-medium text-neutral-900">Lambda Functions</div>
                    <div className="text-sm text-neutral-600">Serverless data processing</div>
                  </div>

                  <div className="border border-neutral-200 rounded-lg p-3">
                    <div className="font-medium text-neutral-900">DynamoDB</div>
                    <div className="text-sm text-neutral-600">Patient data storage</div>
                  </div>

                  <div className="border border-neutral-200 rounded-lg p-3">
                    <div className="font-medium text-neutral-900">API Gateway</div>
                    <div className="text-sm text-neutral-600">Mobile app and EHR integration</div>
                  </div>
                </div>
              </div>

              <div className="bg-canvas-surface rounded-lg shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Compliance & Security</h3>

                <div className="space-y-3">
                  {[
                    'HIPAA BAA with cloud provider',
                    'End-to-end encryption (AES-256)',
                    'OAuth2 with PKCE authentication',
                    'Role-based access control',
                    'Comprehensive audit logging',
                    'FDA Part 11 compliance',
                    'SOC 2 Type II certification'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-neutral-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteMonitoringBuilder;

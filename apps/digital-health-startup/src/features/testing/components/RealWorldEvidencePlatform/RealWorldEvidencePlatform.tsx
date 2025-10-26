'use client';

import { motion } from 'framer-motion';
import {
  Database,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Activity,
  BarChart3,
  Brain,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap,
  Search,
  Filter,
  Upload,
  Plus,
  Heart,
  Pill,
  Stethoscope,
  Building
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface RealWorldEvidencePlatformProps {
  className?: string;
}

interface RWEMetrics {
  totalPatients: number;
  activeStudies: number;
  dataPoints: number;
  realWorldOutcomes: number;
  safetySignals: number;
  effectivenessAnalyses: number;
  registryConnections: number;
  timeToInsight: number;
}

interface RWEStudy {
  id: string;
  name: string;
  type: 'registry' | 'claims' | 'ehr' | 'patient-reported' | 'hybrid';
  status: 'active' | 'completed' | 'planned' | 'paused';
  population: number;
  dataSources: string[];
  primaryOutcome: string;
  studyPeriod: {
    start: Date;
    end: Date;
  };
  therapeuticArea: string;
  endpoints: RWEEndpoint[];
  dataQuality: number;
  completeness: number;
}

interface RWEEndpoint {
  id: string;
  name: string;
  type: 'effectiveness' | 'safety' | 'quality-of-life' | 'economic' | 'utilization';
  definition: string;
  dataSource: string;
  collectonFrequency: string;
  validationStatus: 'validated' | 'pending' | 'failed';
}

interface DataSource {
  id: string;
  name: string;
  type: 'ehr' | 'claims' | 'registry' | 'wearable' | 'patient-app' | 'lab' | 'pharmacy';
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  patients: number;
  lastUpdate: Date;
  dataQuality: number;
  coverage: {
    geographic: string[];
    demographic: string[];
    clinical: string[];
  };
}

const RealWorldEvidencePlatform: React.FC<RealWorldEvidencePlatformProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'studies' | 'data-sources' | 'analytics' | 'outcomes'>('overview');
  const [rweStudies, setRweStudies] = useState<RWEStudy[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [metrics, setMetrics] = useState<RWEMetrics>({
    totalPatients: 0,
    activeStudies: 0,
    dataPoints: 0,
    realWorldOutcomes: 0,
    safetySignals: 0,
    effectivenessAnalyses: 0,
    registryConnections: 0,
    timeToInsight: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTherapeuticArea, setSelectedTherapeuticArea] = useState('all');

  useEffect(() => {
    loadRWEData();
  }, []);

    try {
      setLoading(true);

      setTimeout(() => {
        const mockDataSources: DataSource[] = [
          {
            id: 'ds-001',
            name: 'Epic EHR Network',
            type: 'ehr',
            provider: 'Epic Systems',
            status: 'connected',
            patients: 1250000,
            lastUpdate: new Date('2024-09-24T08:30:00Z'),
            dataQuality: 94.2,
            coverage: {
              geographic: ['United States', 'Canada'],
              demographic: ['Adults 18-85', 'Pediatric 2-17', 'Elderly 65+'],
              clinical: ['Cardiology', 'Oncology', 'Diabetes', 'Neurology', 'Psychiatry']
            }
          },
          {
            id: 'ds-002',
            name: 'Medicare Claims Database',
            type: 'claims',
            provider: 'CMS',
            status: 'connected',
            patients: 2100000,
            lastUpdate: new Date('2024-09-24T06:00:00Z'),
            dataQuality: 89.7,
            coverage: {
              geographic: ['United States'],
              demographic: ['Adults 65+', 'Disabled Adults'],
              clinical: ['All ICD-10 Codes', 'CPT Procedures', 'HCPCS', 'DME']
            }
          },
          {
            id: 'ds-003',
            name: 'FDA Sentinel System',
            type: 'registry',
            provider: 'FDA',
            status: 'connected',
            patients: 850000,
            lastUpdate: new Date('2024-09-24T07:15:00Z'),
            dataQuality: 96.8,
            coverage: {
              geographic: ['United States'],
              demographic: ['All Ages'],
              clinical: ['Drug Safety', 'Adverse Events', 'Medical Devices']
            }
          },
          {
            id: 'ds-004',
            name: 'Flatiron Health Oncology',
            type: 'ehr',
            provider: 'Flatiron Health',
            status: 'connected',
            patients: 420000,
            lastUpdate: new Date('2024-09-24T09:00:00Z'),
            dataQuality: 91.5,
            coverage: {
              geographic: ['United States'],
              demographic: ['Cancer Patients All Ages'],
              clinical: ['Oncology', 'Hematology', 'Radiation Oncology']
            }
          },
          {
            id: 'ds-005',
            name: 'Apple HealthKit Integration',
            type: 'wearable',
            provider: 'Apple Inc.',
            status: 'connected',
            patients: 680000,
            lastUpdate: new Date('2024-09-24T10:45:00Z'),
            dataQuality: 87.3,
            coverage: {
              geographic: ['Global'],
              demographic: ['Tech-enabled Adults'],
              clinical: ['Activity', 'Heart Rate', 'Sleep', 'Symptoms']
            }
          }
        ];

        const mockRWEStudies: RWEStudy[] = [
          {
            id: 'rwe-001',
            name: 'Real-World Effectiveness of Digital Therapeutics in Type 2 Diabetes',
            type: 'hybrid',
            status: 'active',
            population: 15420,
            dataSources: ['Epic EHR Network', 'Apple HealthKit Integration', 'VITAL Path Patient App'],
            primaryOutcome: 'Change in HbA1c from baseline to 6 months',
            studyPeriod: {
              start: new Date('2024-01-15'),
              end: new Date('2024-12-15')
            },
            therapeuticArea: 'Endocrinology',
            endpoints: [
              {
                id: 'ep-001',
                name: 'Glycemic Control',
                type: 'effectiveness',
                definition: 'Proportion of patients achieving HbA1c < 7.0%',
                dataSource: 'Epic EHR Network',
                collectonFrequency: 'Quarterly',
                validationStatus: 'validated'
              },
              {
                id: 'ep-002',
                name: 'Medication Adherence',
                type: 'effectiveness',
                definition: 'Proportion of days covered (PDC) ≥ 80%',
                dataSource: 'VITAL Path Patient App',
                collectonFrequency: 'Daily',
                validationStatus: 'validated'
              },
              {
                id: 'ep-003',
                name: 'Hypoglycemic Events',
                type: 'safety',
                definition: 'Incidence of severe hypoglycemia requiring medical intervention',
                dataSource: 'Epic EHR Network',
                collectonFrequency: 'Continuous',
                validationStatus: 'validated'
              },
              {
                id: 'ep-004',
                name: 'Quality of Life',
                type: 'quality-of-life',
                definition: 'Change in EQ-5D-5L score from baseline',
                dataSource: 'VITAL Path Patient App',
                collectonFrequency: 'Monthly',
                validationStatus: 'pending'
              }
            ],
            dataQuality: 92.1,
            completeness: 88.7
          },
          {
            id: 'rwe-002',
            name: 'Post-Market Safety Surveillance of Novel Oncology Therapy',
            type: 'registry',
            status: 'active',
            population: 8750,
            dataSources: ['Flatiron Health Oncology', 'FDA Sentinel System'],
            primaryOutcome: 'Incidence of grade 3+ adverse events',
            studyPeriod: {
              start: new Date('2023-06-01'),
              end: new Date('2025-06-01')
            },
            therapeuticArea: 'Oncology',
            endpoints: [
              {
                id: 'ep-005',
                name: 'Serious Adverse Events',
                type: 'safety',
                definition: 'Grade 3+ AEs per CTCAE v5.0',
                dataSource: 'Flatiron Health Oncology',
                collectonFrequency: 'Continuous',
                validationStatus: 'validated'
              },
              {
                id: 'ep-006',
                name: 'Overall Survival',
                type: 'effectiveness',
                definition: 'Time from treatment initiation to death',
                dataSource: 'Flatiron Health Oncology',
                collectonFrequency: 'Monthly',
                validationStatus: 'validated'
              },
              {
                id: 'ep-007',
                name: 'Treatment Discontinuation',
                type: 'safety',
                definition: 'Proportion discontinuing due to adverse events',
                dataSource: 'Flatiron Health Oncology',
                collectonFrequency: 'Continuous',
                validationStatus: 'validated'
              }
            ],
            dataQuality: 94.8,
            completeness: 91.3
          },
          {
            id: 'rwe-003',
            name: 'Healthcare Utilization and Costs in Elderly with Multiple Comorbidities',
            type: 'claims',
            status: 'completed',
            population: 45200,
            dataSources: ['Medicare Claims Database'],
            primaryOutcome: 'Total healthcare costs per patient per year',
            studyPeriod: {
              start: new Date('2022-01-01'),
              end: new Date('2023-12-31')
            },
            therapeuticArea: 'Geriatrics',
            endpoints: [
              {
                id: 'ep-008',
                name: 'Total Healthcare Costs',
                type: 'economic',
                definition: 'Sum of medical and pharmacy costs per patient per year',
                dataSource: 'Medicare Claims Database',
                collectonFrequency: 'Annual',
                validationStatus: 'validated'
              },
              {
                id: 'ep-009',
                name: 'Hospital Readmissions',
                type: 'utilization',
                definition: '30-day all-cause readmission rate',
                dataSource: 'Medicare Claims Database',
                collectonFrequency: 'Continuous',
                validationStatus: 'validated'
              },
              {
                id: 'ep-010',
                name: 'Emergency Department Visits',
                type: 'utilization',
                definition: 'Number of ED visits per patient per year',
                dataSource: 'Medicare Claims Database',
                collectonFrequency: 'Continuous',
                validationStatus: 'validated'
              }
            ],
            dataQuality: 88.4,
            completeness: 95.7
          }
        ];

        setDataSources(mockDataSources);
        setRweStudies(mockRWEStudies);
        setMetrics({
          totalPatients: mockDataSources.reduce((sum, ds) => sum + ds.patients, 0),
          activeStudies: mockRWEStudies.filter((s: any) => s.status === 'active').length,
          dataPoints: 47200000,
          realWorldOutcomes: 156,
          safetySignals: 23,
          effectivenessAnalyses: 89,
          registryConnections: mockDataSources.filter(ds => ds.type === 'registry').length,
          timeToInsight: 6.2
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
//       console.error('Error loading RWE data:', error);
      setLoading(false);
    }
  };

    switch (status) {
      case 'active': return <Activity className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'planned': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    switch (type) {
      case 'ehr': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'claims': return <Database className="h-5 w-5 text-green-600" />;
      case 'registry': return <Building className="h-5 w-5 text-purple-600" />;
      case 'wearable': return <Heart className="h-5 w-5 text-red-600" />;
      case 'patient-app': return <Stethoscope className="h-5 w-5 text-teal-600" />;
      case 'lab': return <Target className="h-5 w-5 text-orange-600" />;
      case 'pharmacy': return <Pill className="h-5 w-5 text-pink-600" />;
      default: return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-World Evidence Platform</h1>
          <p className="text-gray-600 mt-2">Generate insights from real-world healthcare data</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Study
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">{(metrics.totalPatients / 1000000).toFixed(1)}M</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Studies</p>
              <p className="text-2xl font-bold text-green-600">{metrics.activeStudies}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-purple-600">{(metrics.dataPoints / 1000000).toFixed(1)}M</p>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">RW Outcomes</p>
              <p className="text-2xl font-bold text-teal-600">{metrics.realWorldOutcomes}</p>
            </div>
            <Target className="h-8 w-8 text-teal-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Safety Signals</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.safetySignals}</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Effectiveness</p>
              <p className="text-2xl font-bold text-indigo-600">{metrics.effectivenessAnalyses}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registries</p>
              <p className="text-2xl font-bold text-pink-600">{metrics.registryConnections}</p>
            </div>
            <Building className="h-8 w-8 text-pink-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Time to Insight</p>
              <p className="text-2xl font-bold text-red-600">{metrics.timeToInsight} wks</p>
            </div>
            <Zap className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'RWE Overview', icon: BarChart3 },
            { key: 'studies', label: 'Active Studies', icon: FileText },
            { key: 'data-sources', label: 'Data Sources', icon: Database },
            { key: 'analytics', label: 'Analytics & Insights', icon: Brain },
            { key: 'outcomes', label: 'Real-World Outcomes', icon: Target }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as unknown)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Platform Capabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RWE Platform Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Multi-source data integration (EHR, Claims, Registry)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">AI-powered outcome prediction and analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Automated safety signal detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">Real-time effectiveness monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-teal-600" />
                  <span className="text-gray-700">Global regulatory submission support</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality & Coverage</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Data Quality</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Geographic Coverage</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                    <span className="font-medium">78%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Completeness</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Regulatory Readiness</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-teal-600 h-2 rounded-full" style={{width: '94%'}}></div>
                    </div>
                    <span className="font-medium">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Studies */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed Analyses</h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Comparative effectiveness of DTx vs traditional care in diabetes',
                  outcome: '23% improvement in HbA1c control',
                  time: '2 weeks ago',
                  type: 'effectiveness'
                },
                {
                  title: 'Safety profile analysis of novel oncology combination therapy',
                  outcome: '15% reduction in grade 3+ adverse events',
                  time: '1 week ago',
                  type: 'safety'
                },
                {
                  title: 'Healthcare utilization patterns in elderly with heart failure',
                  outcome: '31% reduction in hospital readmissions',
                  time: '3 days ago',
                  type: 'utilization'
                },
                {
                  title: 'Long-term outcomes of personalized medicine approach',
                  outcome: '42% improvement in quality-adjusted life years',
                  time: '1 day ago',
                  type: 'outcomes'
                }
              ].map((analysis, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {analysis.type === 'effectiveness' && <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />}
                    {analysis.type === 'safety' && <Shield className="h-5 w-5 text-blue-600 mt-0.5" />}
                    {analysis.type === 'utilization' && <Activity className="h-5 w-5 text-purple-600 mt-0.5" />}
                    {analysis.type === 'outcomes' && <Target className="h-5 w-5 text-orange-600 mt-0.5" />}
                    <div>
                      <p className="font-medium text-gray-900">{analysis.title}</p>
                      <p className="text-sm text-green-600 font-medium">{analysis.outcome}</p>
                      <p className="text-xs text-gray-500 mt-1">{analysis.time}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'studies' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search studies..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTherapeuticArea}
                onChange={(e) => setSelectedTherapeuticArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Therapeutic Areas</option>
                <option value="endocrinology">Endocrinology</option>
                <option value="oncology">Oncology</option>
                <option value="geriatrics">Geriatrics</option>
                <option value="cardiology">Cardiology</option>
              </select>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Studies List */}
          <div className="space-y-4">
            {rweStudies.map((study) => (
              <div key={study.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{study.name}</h3>
                    <p className="text-gray-600 mt-1">
                      {study.therapeuticArea} • {study.population.toLocaleString()} patients • {study.type}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(study.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(study.status)}`}>
                      {study.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">Data Sources</span>
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-blue-900">{study.dataSources.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">Endpoints</span>
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-green-900">{study.endpoints.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600 font-medium">Data Quality</span>
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-lg font-bold text-purple-900">{study.dataQuality}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-600 font-medium">Completeness</span>
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-lg font-bold text-orange-900">{study.completeness}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Primary Outcome</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {study.primaryOutcome}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Endpoints</h4>
                    <div className="space-y-2">
                      {study.endpoints.slice(0, 2).map((endpoint) => (
                        <div key={endpoint.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{endpoint.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            endpoint.validationStatus === 'validated' ? 'bg-green-100 text-green-800' :
                            endpoint.validationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.validationStatus}
                          </span>
                        </div>
                      ))}
                      {study.endpoints.length > 2 && (
                        <p className="text-sm text-gray-500">+{study.endpoints.length - 2} more endpoints</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    View Analytics
                  </button>
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Generate Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'data-sources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <div key={source.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getDataSourceIcon(source.type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{source.name}</h3>
                      <p className="text-sm text-gray-600">{source.provider}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor(source.status)} ${
                    source.status === 'connected' ? 'bg-green-600' :
                    source.status === 'error' ? 'bg-red-600' : 'bg-gray-400'
                  }`}></div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Patients</span>
                    <span className="font-medium">{source.patients.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Quality</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-1 mr-2">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{width: `${source.dataQuality}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{source.dataQuality}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm font-medium">
                      {source.lastUpdate.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage</h4>
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600">
                      <strong>Geographic:</strong> {source.coverage.geographic.slice(0, 2).join(', ')}
                      {source.coverage.geographic.length > 2 && ` +${source.coverage.geographic.length - 2}`}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Clinical:</strong> {source.coverage.clinical.slice(0, 2).join(', ')}
                      {source.coverage.clinical.length > 2 && ` +${source.coverage.clinical.length - 2}`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Configure
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Data
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional tabs would be implemented similarly */}
    </div>
  );
};

export default RealWorldEvidencePlatform;
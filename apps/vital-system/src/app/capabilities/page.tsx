'use client';

import React from 'react';
import {
  Search,
  Plus,
  Settings,
  Zap,
  Target,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  MoreVertical,
  Eye,
  Upload,
  Database,
  Shield,
  BarChart3,
  FileText,
  Brain,
  TestTube,
  Globe,
  Star,
  Bookmark,
  Award,
  Network,
  Heart,
  Smartphone,
  BookOpen,
  Lock,
  Monitor
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Separator } from '@vital/ui';
import { Skeleton } from '@vital/ui';
import { Tabs, TabsList, TabsTrigger } from '@vital/ui';

interface Capability {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  maturity_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  domain: string;
  status: 'active' | 'development' | 'deprecated';
  complexity_level: 'low' | 'medium' | 'high';
  compliance_level: string;
  icon: unknown;
  color: string;
  success_rate: number;
  usage_count: number;
  avg_response_time: number;
  accuracy_target: number;
  requires_training: boolean;
  requires_validation: boolean;
  is_premium: boolean;
  version: string;
  last_updated: string;
  supported_agents: string[];
  prerequisites: string[];
  features: string[];
  technical_specs: {
    performance: string[];
    compliance: string[];
  };
  validation_status: 'validated' | 'pending' | 'in_review';
  examples: string[];
  roadmap_quarter: string;
  dependencies: string[];
}

const maturityLevels = [
  { level: 'L1', name: 'Foundation', description: 'Core infrastructure & compliance', color: 'bg-stone-100 text-stone-800' },
  { level: 'L2', name: 'Essential', description: 'Basic healthcare workflows', color: 'bg-blue-100 text-blue-800' },
  { level: 'L3', name: 'Advanced', description: 'AI-powered intelligence', color: 'bg-green-100 text-green-800' },
  { level: 'L4', name: 'Optimized', description: 'Predictive & prescriptive analytics', color: 'bg-purple-100 text-purple-800' },
  { level: 'L5', name: 'Innovative', description: 'Next-gen healthcare transformation', color: 'bg-orange-100 text-orange-800' }
];

const comprehensiveCapabilities: Capability[] = [
  // L1 - Foundation Capabilities
  {
    id: '1',
    name: 'audit-compliance-management',
    display_name: 'Audit & Compliance Management',
    description: 'Immutable audit trail with blockchain-backed logging and real-time compliance monitoring',
    category: 'Compliance',
    maturity_level: 'L1',
    domain: 'Healthcare',
    status: 'active',
    complexity_level: 'medium',
    compliance_level: '21 CFR Part 11, HIPAA',
    icon: Shield,
    color: '#1E40AF',
    success_rate: 99.8,
    usage_count: 892,
    avg_response_time: 0.8,
    accuracy_target: 100,
    requires_training: false,
    requires_validation: true,
    is_premium: false,
    version: '2.1.0',
    last_updated: '2024-03-18',
    supported_agents: ['HIPAA Compliance Officer', 'QMS Architect'],
    prerequisites: ['security-fundamentals'],
    features: ['Immutable Audit Trail', 'Access Control Matrix', 'Consent Management', 'Data Lineage', 'Compliance Dashboard'],
    technical_specs: {
      performance: ['Response Time: <1 second', 'Uptime: 99.9%', 'Audit Volume: Unlimited'],
      compliance: ['21 CFR Part 11', 'HIPAA', 'SOX', 'GDPR']
    },
    validation_status: 'validated',
    examples: ['SOX compliance monitoring', 'HIPAA audit preparation', 'FDA inspection readiness'],
    roadmap_quarter: 'Q1 2024',
    dependencies: ['security-infrastructure']
  },

  // L2 - Essential Capabilities
  {
    id: '2',
    name: 'ehr-emr-integration',
    display_name: 'EHR/EMR Integration Suite',
    description: 'Native integration with major EHR systems using HL7 FHIR R4 standards',
    category: 'Integration',
    maturity_level: 'L2',
    domain: 'Healthcare',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'HL7 FHIR R4',
    icon: Database,
    color: '#059669',
    success_rate: 96.2,
    usage_count: 1247,
    avg_response_time: 1.2,
    accuracy_target: 95,
    requires_training: true,
    requires_validation: true,
    is_premium: false,
    version: '3.0.0',
    last_updated: '2024-03-20',
    supported_agents: ['Clinical Decision Support', 'Patient Journey Orchestrator'],
    prerequisites: ['fhir-standards', 'healthcare-workflows'],
    features: ['Epic Integration', 'Cerner Connectivity', 'FHIR R4 Support', 'Real-time Sync', 'Bulk Data Export'],
    technical_specs: {
      performance: ['Throughput: 10K records/min', 'Sync Latency: <2 seconds', 'Error Rate: <0.1%'],
      compliance: ['HL7 FHIR R4', 'HIPAA', 'Direct Trust']
    },
    validation_status: 'validated',
    examples: ['Epic MyChart integration', 'Cerner PowerChart sync', 'Allscripts connectivity'],
    roadmap_quarter: 'Q2 2024',
    dependencies: ['audit-compliance-management']
  },

  {
    id: '3',
    name: 'clinical-dashboard-suite',
    display_name: 'Clinical Dashboard Suite',
    description: 'Comprehensive dashboard system with executive, clinical, research, and quality metrics',
    category: 'User Experience',
    maturity_level: 'L2',
    domain: 'Healthcare',
    status: 'active',
    complexity_level: 'medium',
    compliance_level: 'Section 508, WCAG 2.1',
    icon: Monitor,
    color: '#7C2D12',
    success_rate: 94.1,
    usage_count: 567,
    avg_response_time: 1.8,
    accuracy_target: 92,
    requires_training: false,
    requires_validation: false,
    is_premium: false,
    version: '1.5.0',
    last_updated: '2024-03-15',
    supported_agents: ['All Agents'],
    prerequisites: ['data-platform'],
    features: ['Executive Dashboard', 'Clinical Metrics', 'Research Tracking', 'Quality Monitoring', 'Mobile Responsive'],
    technical_specs: {
      performance: ['Load Time: <2 seconds', 'Concurrent Users: 1000+', 'Data Refresh: Real-time'],
      compliance: ['Section 508', 'WCAG 2.1 AA', 'HIPAA']
    },
    validation_status: 'validated',
    examples: ['C-suite KPI monitoring', 'Clinical performance tracking', 'Quality dashboard'],
    roadmap_quarter: 'Q2 2024',
    dependencies: ['audit-compliance-management']
  },

  // L3 - Advanced Capabilities
  {
    id: '4',
    name: 'multi-llm-orchestration',
    display_name: 'Multi-LLM Orchestration System',
    description: 'Intelligent routing and consensus engine for specialized medical agents with confidence scoring',
    category: 'Core Intelligence',
    maturity_level: 'L3',
    domain: 'AI/ML',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'FDA SaMD Class II',
    icon: Brain,
    color: '#7C3AED',
    success_rate: 97.8,
    usage_count: 2341,
    avg_response_time: 1.5,
    accuracy_target: 95,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '4.2.0',
    last_updated: '2024-03-22',
    supported_agents: ['All Medical Agents'],
    prerequisites: ['llm-infrastructure', 'medical-validation'],
    features: ['Agent Router', 'Parallel Processing', 'Consensus Engine', 'Confidence Scoring', 'Fallback Mechanism'],
    technical_specs: {
      performance: ['Response Time: <2 seconds', 'Concurrent Agents: Up to 10', 'Token Limit: 32K per agent', 'Accuracy: >95%'],
      compliance: ['HIPAA', 'FDA 21 CFR Part 11', 'EU MDR Class IIa']
    },
    validation_status: 'validated',
    examples: ['Multi-agent clinical consultation', 'Consensus-based diagnosis', 'Expert system routing'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['ehr-emr-integration', 'audit-compliance-management']
  },

  {
    id: '5',
    name: 'clinical-trial-intelligence',
    display_name: 'Clinical Trial Intelligence',
    description: 'AI-powered trial design, site selection, patient matching, and safety monitoring',
    category: 'Clinical',
    maturity_level: 'L3',
    domain: 'Clinical Research',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'GCP/ICH Guidelines',
    icon: TestTube,
    color: '#059669',
    success_rate: 92.4,
    usage_count: 156,
    avg_response_time: 3.2,
    accuracy_target: 90,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '2.3.0',
    last_updated: '2024-03-19',
    supported_agents: ['Clinical Trial Designer'],
    prerequisites: ['biostatistics', 'gcp-guidelines', 'regulatory-framework'],
    features: ['Protocol Optimizer', 'Site Selection', 'Patient Matching', 'Enrollment Predictor', 'Safety Signal Detection'],
    technical_specs: {
      performance: ['Protocol Analysis: 92% accuracy', 'Site Ranking: 87% accuracy', 'Patient Matching: 94% accuracy', 'Safety Monitoring: 96% accuracy'],
      compliance: ['GCP', 'ICH E6', 'FDA Guidelines', 'EMA Guidelines']
    },
    validation_status: 'validated',
    examples: ['Pivotal trial optimization', 'Investigator site selection', 'Patient recruitment'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['multi-llm-orchestration', 'ehr-emr-integration']
  },

  {
    id: '6',
    name: 'regulatory-intelligence-engine',
    display_name: 'Regulatory Intelligence Engine',
    description: 'Global regulatory guidance interpretation, submission planning, and change tracking',
    category: 'Regulatory',
    maturity_level: 'L3',
    domain: 'Regulatory Affairs',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'Global Regulatory Standards',
    icon: Globe,
    color: '#EA580C',
    success_rate: 94.7,
    usage_count: 423,
    avg_response_time: 2.1,
    accuracy_target: 95,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '3.1.0',
    last_updated: '2024-03-21',
    supported_agents: ['FDA Regulatory Strategist'],
    prerequisites: ['regulatory-framework', 'global-standards'],
    features: ['Guidance Interpreter', 'Submission Planner', 'Gap Analysis', 'Change Tracker', 'Document Generator'],
    technical_specs: {
      performance: ['Document Analysis: <5 minutes', 'Global Coverage: 50+ countries', 'Update Frequency: Real-time'],
      compliance: ['FDA', 'EMA', 'Health Canada', 'Japan PMDA', 'China NMPA']
    },
    validation_status: 'validated',
    examples: ['510(k) pathway analysis', 'EU MDR compliance', 'Global submission strategy'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['multi-llm-orchestration']
  },

  {
    id: '7',
    name: 'medical-literature-synthesis',
    display_name: 'Medical Literature Synthesis',
    description: 'Automated systematic reviews, evidence grading, and meta-analysis capabilities',
    category: 'Research',
    maturity_level: 'L3',
    domain: 'Evidence-Based Medicine',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'Evidence-Based Medicine Standards',
    icon: BookOpen,
    color: '#0891B2',
    success_rate: 91.6,
    usage_count: 289,
    avg_response_time: 4.5,
    accuracy_target: 92,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '2.0.0',
    last_updated: '2024-03-17',
    supported_agents: ['Medical Literature Expert'],
    prerequisites: ['evidence-standards', 'systematic-review'],
    features: ['Systematic Review Engine', 'Evidence Grading', 'Citation Management', 'Contradiction Detection', 'Meta-Analysis Tools'],
    technical_specs: {
      performance: ['Literature Search: 100K+ articles/min', 'GRADE Implementation: Full', 'Citation Formats: Vancouver/AMA'],
      compliance: ['PRISMA Guidelines', 'Cochrane Standards', 'GRADE Methodology']
    },
    validation_status: 'validated',
    examples: ['Systematic literature review', 'Meta-analysis generation', 'Evidence synthesis'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['multi-llm-orchestration']
  },

  {
    id: '8',
    name: 'clinical-decision-support',
    display_name: 'Clinical Decision Support System',
    description: 'Evidence-based diagnostic assistance, treatment recommendations, and risk stratification',
    category: 'Clinical',
    maturity_level: 'L3',
    domain: 'Clinical Care',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'FDA SaMD Framework',
    icon: Heart,
    color: '#DC2626',
    success_rate: 96.3,
    usage_count: 1876,
    avg_response_time: 1.1,
    accuracy_target: 96,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '3.2.1',
    last_updated: '2024-03-23',
    supported_agents: ['Clinical Decision Support Agent'],
    prerequisites: ['clinical-guidelines', 'evidence-base'],
    features: ['Diagnostic Assistant', 'Treatment Recommender', 'Drug Interaction Checker', 'Risk Stratification', 'Alert Management'],
    technical_specs: {
      performance: ['Diagnostic Accuracy: >95%', 'Response Time: <2 seconds', 'Alert Fatigue Reduction: 40%'],
      compliance: ['FDA SaMD', 'Clinical Guidelines', 'Medical Standards']
    },
    validation_status: 'validated',
    examples: ['Differential diagnosis support', 'Treatment pathway guidance', 'Drug safety alerts'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['multi-llm-orchestration', 'ehr-emr-integration']
  },

  {
    id: '9',
    name: 'healthcare-knowledge-graph',
    display_name: 'Healthcare Knowledge Graph',
    description: 'Medical concept disambiguation, relationship mapping, and temporal reasoning engine',
    category: 'Data & Analytics',
    maturity_level: 'L3',
    domain: 'Knowledge Management',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'Medical Ontology Standards',
    icon: Network,
    color: '#16A34A',
    success_rate: 93.8,
    usage_count: 734,
    avg_response_time: 0.9,
    accuracy_target: 94,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '2.4.0',
    last_updated: '2024-03-20',
    supported_agents: ['Knowledge Management Agent'],
    prerequisites: ['medical-ontologies', 'graph-databases'],
    features: ['Entity Resolution', 'Relationship Mapping', 'Temporal Reasoning', 'Inference Engine', 'Version Control'],
    technical_specs: {
      performance: ['Query Response: <1 second', 'Entity Coverage: 10M+ concepts', 'Relationship Accuracy: 94%'],
      compliance: ['SNOMED CT', 'ICD-10/11', 'RxNorm', 'LOINC', 'CPT', 'MeSH']
    },
    validation_status: 'validated',
    examples: ['Medical concept linking', 'Drug-disease associations', 'Temporal medical reasoning'],
    roadmap_quarter: 'Q3 2024',
    dependencies: ['multi-llm-orchestration']
  },

  {
    id: '10',
    name: 'privacy-preserving-analytics',
    display_name: 'Privacy-Preserving Analytics',
    description: 'Differential privacy, federated learning, and homomorphic encryption for secure analytics',
    category: 'Security',
    maturity_level: 'L4',
    domain: 'Data Privacy',
    status: 'development',
    complexity_level: 'high',
    compliance_level: 'HIPAA De-identification',
    icon: Lock,
    color: '#7C2D12',
    success_rate: 88.9,
    usage_count: 123,
    avg_response_time: 5.2,
    accuracy_target: 90,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '1.1.0',
    last_updated: '2024-03-16',
    supported_agents: ['Privacy Analytics Agent'],
    prerequisites: ['cryptography', 'privacy-engineering'],
    features: ['Differential Privacy', 'Federated Learning', 'Homomorphic Encryption', 'Synthetic Data Generation', 'Re-identification Risk Assessment'],
    technical_specs: {
      performance: ['Privacy Budget: Configurable ε', 'Synthetic Data Quality: >85%', 'Re-ID Risk: <0.01%'],
      compliance: ['HIPAA Safe Harbor', 'GDPR', 'Differential Privacy Standards']
    },
    validation_status: 'in_review',
    examples: ['Multi-site research', 'Privacy-safe data sharing', 'Federated analytics'],
    roadmap_quarter: 'Q4 2024',
    dependencies: ['healthcare-knowledge-graph', 'audit-compliance-management']
  },

  // Additional capabilities for comprehensive coverage
  {
    id: '11',
    name: 'real-world-evidence-platform',
    display_name: 'Real-World Evidence Platform',
    description: 'Multi-source data harmonization, cohort building, and comparative effectiveness research',
    category: 'Data & Analytics',
    maturity_level: 'L4',
    domain: 'Real-World Evidence',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'FDA RWE Framework',
    icon: BarChart3,
    color: '#8B5CF6',
    success_rate: 89.7,
    usage_count: 298,
    avg_response_time: 3.8,
    accuracy_target: 88,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '2.1.0',
    last_updated: '2024-03-18',
    supported_agents: ['RWE Analytics Agent'],
    prerequisites: ['data-harmonization', 'causal-inference'],
    features: ['Data Harmonization', 'Cohort Builder', 'Outcome Analytics', 'Signal Detection', 'External Control Arms'],
    technical_specs: {
      performance: ['Data Sources: 50+ integrated', 'Cohort Size: Up to 1M patients', 'Analysis Speed: <1 hour'],
      compliance: ['FDA RWE Guidelines', '21 CFR Part 11', 'HIPAA']
    },
    validation_status: 'validated',
    examples: ['Post-market surveillance', 'Comparative effectiveness', 'Regulatory submissions'],
    roadmap_quarter: 'Q4 2024',
    dependencies: ['healthcare-knowledge-graph', 'privacy-preserving-analytics']
  },

  {
    id: '12',
    name: 'predictive-analytics-suite',
    display_name: 'Predictive Analytics Suite',
    description: 'Clinical and operational ML models for readmission, progression, and outcome prediction',
    category: 'Advanced Analytics',
    maturity_level: 'L4',
    domain: 'Predictive Medicine',
    status: 'active',
    complexity_level: 'high',
    compliance_level: 'FDA AI/ML Guidance',
    icon: TrendingUp,
    color: '#059669',
    success_rate: 87.2,
    usage_count: 445,
    avg_response_time: 2.3,
    accuracy_target: 85,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '1.8.0',
    last_updated: '2024-03-19',
    supported_agents: ['Predictive Analytics Agent'],
    prerequisites: ['machine-learning', 'clinical-data'],
    features: ['Readmission Risk (AUC 0.85)', 'Disease Progression', 'Treatment Response', 'Adverse Event Risk', 'Operational Forecasting'],
    technical_specs: {
      performance: ['Model Accuracy: 85-90%', 'Prediction Horizon: 30-365 days', 'Feature Space: 10K+ variables'],
      compliance: ['FDA AI/ML Guidelines', 'Model Validation Standards', 'Bias Testing']
    },
    validation_status: 'validated',
    examples: ['30-day readmission prediction', 'Disease progression modeling', 'Treatment response forecasting'],
    roadmap_quarter: 'Q4 2024',
    dependencies: ['real-world-evidence-platform', 'clinical-decision-support']
  },

  {
    id: '13',
    name: 'digital-biomarkers-platform',
    display_name: 'Digital Biomarkers Platform',
    description: 'Wearable data integration, signal processing, and disease signature detection',
    category: 'Innovation',
    maturity_level: 'L5',
    domain: 'Digital Health',
    status: 'development',
    complexity_level: 'high',
    compliance_level: 'FDA Digital Health',
    icon: Smartphone,
    color: '#EC4899',
    success_rate: 78.4,
    usage_count: 67,
    avg_response_time: 6.1,
    accuracy_target: 80,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '0.9.0',
    last_updated: '2024-03-15',
    supported_agents: ['Digital Biomarkers Agent'],
    prerequisites: ['signal-processing', 'wearable-integration'],
    features: ['Wearable Data Integration', 'Signal Processing', 'Pattern Recognition', 'Validation Framework', 'Real-time Monitoring'],
    technical_specs: {
      performance: ['Device Support: 20+ manufacturers', 'Sampling Rate: Up to 1000Hz', 'Latency: <100ms'],
      compliance: ['FDA Digital Health Guidelines', 'Medical Device Standards', 'Data Privacy']
    },
    validation_status: 'pending',
    examples: ['Continuous glucose monitoring', 'Cardiac rhythm analysis', 'Gait pattern assessment'],
    roadmap_quarter: 'Q1 2025',
    dependencies: ['predictive-analytics-suite', 'privacy-preserving-analytics']
  },

  {
    id: '14',
    name: 'federated-research-network',
    display_name: 'Federated Research Network',
    description: 'Distributed queries, privacy-preserving compute, and collaborative research platform',
    category: 'Innovation',
    maturity_level: 'L5',
    domain: 'Collaborative Research',
    status: 'development',
    complexity_level: 'high',
    compliance_level: 'Multi-site IRB',
    icon: Globe,
    color: '#7C3AED',
    success_rate: 82.1,
    usage_count: 34,
    avg_response_time: 8.7,
    accuracy_target: 85,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '0.7.0',
    last_updated: '2024-03-12',
    supported_agents: ['Federated Research Agent'],
    prerequisites: ['federated-learning', 'multi-party-compute'],
    features: ['Distributed Queries', 'Privacy-Preserving Compute', 'Harmonization Engine', 'Collaborative Analytics', 'Result Aggregation'],
    technical_specs: {
      performance: ['Network Nodes: Up to 100', 'Query Latency: <30 seconds', 'Data Privacy: Guaranteed'],
      compliance: ['Multi-site IRB', 'HIPAA', 'International Privacy Laws']
    },
    validation_status: 'pending',
    examples: ['Multi-site clinical studies', 'Rare disease research', 'Global health initiatives'],
    roadmap_quarter: 'Q1 2025',
    dependencies: ['digital-biomarkers-platform', 'privacy-preserving-analytics']
  },

  {
    id: '15',
    name: 'ai-model-marketplace',
    display_name: 'AI Model Marketplace',
    description: 'Validated AI model catalog with performance monitoring and explainability tools',
    category: 'Innovation',
    maturity_level: 'L5',
    domain: 'AI Governance',
    status: 'development',
    complexity_level: 'high',
    compliance_level: 'FDA AI/ML Framework',
    icon: Award,
    color: '#F59E0B',
    success_rate: 85.3,
    usage_count: 89,
    avg_response_time: 3.4,
    accuracy_target: 88,
    requires_training: true,
    requires_validation: true,
    is_premium: true,
    version: '0.8.0',
    last_updated: '2024-03-14',
    supported_agents: ['Model Governance Agent'],
    prerequisites: ['model-validation', 'explainable-ai'],
    features: ['Model Registry', 'Performance Monitoring', 'A/B Testing', 'Explainability Tools', 'Continuous Learning'],
    technical_specs: {
      performance: ['Model Catalog: 500+ validated models', 'Drift Detection: Real-time', 'Explainability: SHAP/LIME'],
      compliance: ['FDA AI/ML Framework', 'Model Validation Standards', 'Algorithmic Transparency']
    },
    validation_status: 'in_review',
    examples: ['Clinical prediction models', 'Diagnostic AI models', 'Treatment optimization models'],
    roadmap_quarter: 'Q1 2025',
    dependencies: ['federated-research-network', 'predictive-analytics-suite']
  }
];

const categories = [
  'All Categories',
  'Core Intelligence',
  'Clinical',
  'Regulatory',
  'Compliance',
  'Data & Analytics',
  'Security',
  'Integration',
  'User Experience',
  'Advanced Analytics',
  'Innovation',
  'Research'
];

const domains = [
  'All Domains',
  'Healthcare',
  'AI/ML',
  'Clinical Research',
  'Regulatory Affairs',
  'Data Privacy',
  'Digital Health',
  'Evidence-Based Medicine',
  'Knowledge Management',
  'Clinical Care',
  'Real-World Evidence',
  'Predictive Medicine',
  'Collaborative Research',
  'AI Governance'
];

export default function CapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [selectedMaturity, setSelectedMaturity] = useState('All Levels');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('usage');
  const [viewMode, setViewMode] = useState<'grid' | 'roadmap'>('grid');
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);

  useEffect(() => {
    setCapabilities(comprehensiveCapabilities);
    setLoading(false);
  }, []);

  const filteredCapabilities = capabilities.filter(capability => {
    const matchesSearch = capability.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capability.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         capability.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All Categories' || capability.category === selectedCategory;
    const matchesDomain = selectedDomain === 'All Domains' || capability.domain === selectedDomain;
    const matchesMaturity = selectedMaturity === 'All Levels' || capability.maturity_level === selectedMaturity;
    const matchesStatus = capability.status === statusFilter;

    return matchesSearch && matchesCategory && matchesDomain && matchesMaturity && matchesStatus;
  });

  const sortedCapabilities = [...filteredCapabilities].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.usage_count - a.usage_count;
      case 'success':
        return b.success_rate - a.success_rate;
      case 'maturity':
        return a.maturity_level.localeCompare(b.maturity_level);
      case 'name':
        return a.display_name.localeCompare(b.display_name);
      default:
        return 0;
    }
  });

  const getMaturityColor = (level: string) => {
    const maturity = maturityLevels.find((m: any) => m.level === level);
    return maturity?.color || 'bg-stone-100 text-stone-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const CapabilityCard = ({ capability }: { capability: Capability }) => {
    const IconComponent = capability.icon as any;

    return (
      <Card className="cursor-pointer transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${capability.color}20` }}>
                <IconComponent className="h-5 w-5" style={{ color: capability.color }} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {capability.display_name}
                  {capability.is_premium && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {capability.description}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className={getMaturityColor(capability.maturity_level)}>
              {capability.maturity_level}
            </Badge>
            <Badge variant="secondary">{capability.category}</Badge>
            <Badge className={getComplexityColor(capability.complexity_level)}>
              {capability.complexity_level}
            </Badge>
            <Badge className={getStatusColor(capability.status)}>
              {capability.status}
            </Badge>
            {capability.requires_validation && (
              <Badge variant="outline" className="text-xs">
                Validation Required
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={capability.success_rate} className="w-16 h-2" />
                <span className="font-medium">{capability.success_rate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Usage</span>
                </div>
                <div className="font-medium">{capability.usage_count}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Avg Time</span>
                </div>
                <div className="font-medium">{capability.avg_response_time}s</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span className="text-xs">Target</span>
                </div>
                <div className="font-medium">{capability.accuracy_target}%</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Compliance:</strong> {capability.compliance_level}
            </div>

            <div className="flex flex-wrap gap-1">
              {capability.supported_agents.slice(0, 2).map((agent: any) => (
                <Badge key={agent} variant="outline" className="text-xs">
                  {agent}
                </Badge>
              ))}
              {capability.supported_agents.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{capability.supported_agents.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedCapability(capability)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RoadmapView = () => (
    <div className="space-y-8">
      {maturityLevels.map(level => {
        const levelCapabilities = sortedCapabilities.filter(cap => cap.maturity_level === level.level);

        return (
          <div key={level.level} className="space-y-4">
            <div className="border-l-4 pl-4" style={{ borderColor: level.color.includes('gray') ? '#6B7280' :
              level.color.includes('blue') ? '#3B82F6' :
              level.color.includes('green') ? '#10B981' :
              level.color.includes('purple') ? '#8B5CF6' : '#F59E0B' }}>
              <h3 className="text-xl font-bold">{level.level}: {level.name}</h3>
              <p className="text-muted-foreground">{level.description}</p>
              <Badge className={level.color} variant="secondary">{levelCapabilities.length} capabilities</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {levelCapabilities.map(capability => (
                <CapabilityCard key={capability.id} capability={capability} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏥 VITAL Path Capabilities Library</h1>
            <p className="text-muted-foreground mt-2">
              Digital Health AI Platform - Complete Feature Catalog
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏥 VITAL Path Capabilities Library</h1>
          <p className="text-muted-foreground mt-2">
            Digital Health AI Platform - Complete Feature Catalog v1.0
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Capability
          </Button>
        </div>
      </div>

      {/* Capability Maturity Model Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Capability Maturity Model</CardTitle>
          <CardDescription>Healthcare Intelligence Platform Maturity Levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {maturityLevels.map(level => (
              <div key={level.level} className="text-center space-y-2">
                <Badge className={level.color} variant="secondary">{level.level}</Badge>
                <div className="font-semibold">{level.name}</div>
                <div className="text-xs text-muted-foreground">{level.description}</div>
                <div className="text-sm font-medium">
                  {capabilities.filter((c: any) => c.maturity_level === level.level).length} capabilities
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Total Capabilities</div>
                <div className="text-2xl font-bold">{capabilities.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-bold">
                  {capabilities.filter((c: any) => c.status === 'active').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Premium</div>
                <div className="text-2xl font-bold">
                  {capabilities.filter((c: any) => c.is_premium).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
                <div className="text-2xl font-bold">
                  {(capabilities.reduce((sum, c) => sum + c.success_rate, 0) / capabilities.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDomain} onValueChange={setSelectedDomain}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((domain: any) => (
              <SelectItem key={domain} value={domain}>
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMaturity} onValueChange={setSelectedMaturity}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Maturity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Levels">All Levels</SelectItem>
            {maturityLevels.map(level => (
              <SelectItem key={level.level} value={level.level}>
                {level.level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usage">Usage</SelectItem>
            <SelectItem value="success">Success Rate</SelectItem>
            <SelectItem value="maturity">Maturity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({capabilities.filter((c: any) => c.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="development">
              Development ({capabilities.filter((c: any) => c.status === 'development').length})
            </TabsTrigger>
            <TabsTrigger value="deprecated">
              Deprecated ({capabilities.filter((c: any) => c.status === 'deprecated').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'roadmap' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('roadmap')}
          >
            Roadmap View
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'roadmap' ? (
        <RoadmapView />
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Capabilities ({sortedCapabilities.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCapabilities.map(capability => (
              <CapabilityCard key={capability.id} capability={capability} />
            ))}
          </div>

          {sortedCapabilities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No capabilities found matching your criteria.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Capability Detail Dialog */}
      <Dialog open={!!selectedCapability} onOpenChange={() => setSelectedCapability(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedCapability && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {React.createElement(selectedCapability.icon as any, {
                    className: "h-6 w-6",
                    style: { color: selectedCapability.color }
                  })}
                  {selectedCapability.display_name}
                  {selectedCapability.is_premium && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </DialogTitle>
                <DialogDescription>
                  {selectedCapability.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getMaturityColor(selectedCapability.maturity_level)}>
                    {selectedCapability.maturity_level} - {maturityLevels.find((m: any) => m.level === selectedCapability.maturity_level)?.name}
                  </Badge>
                  <Badge variant="secondary">{selectedCapability.category}</Badge>
                  <Badge className={getComplexityColor(selectedCapability.complexity_level)}>
                    {selectedCapability.complexity_level} complexity
                  </Badge>
                  <Badge className={getStatusColor(selectedCapability.status)}>
                    {selectedCapability.status}
                  </Badge>
                  <Badge variant="outline">{selectedCapability.domain}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Usage Count</div>
                    <div className="text-2xl font-bold">{selectedCapability.usage_count}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                    <div className="text-2xl font-bold">{selectedCapability.success_rate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg Response</div>
                    <div className="text-2xl font-bold">{selectedCapability.avg_response_time}s</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Version</div>
                    <div className="text-2xl font-bold">{selectedCapability.version}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">🏛️ Compliance Framework</h3>
                  <Badge variant="outline" className="text-sm">{selectedCapability.compliance_level}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🚀 Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCapability.features.map(feature => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📊 Technical Specifications</h3>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Performance:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedCapability.technical_specs.performance.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Compliance:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedCapability.technical_specs.compliance.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🤖 Supported Agents</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCapability.supported_agents.map((agent: any) => (
                      <Badge key={agent} variant="outline">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedCapability.prerequisites.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">📋 Prerequisites</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCapability.prerequisites.map(prereq => (
                        <Badge key={prereq} variant="secondary">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">💡 Use Case Examples</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {selectedCapability.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Use Capability
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
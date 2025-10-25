'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Shield, Activity, Brain,
  UserCheck, AlertCircle, Clock, Users, Stethoscope,
  CheckCircle, XCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';

// Clinical Safety Interfaces
interface ClinicalSafetyMetrics {
  medicalAccuracy: number;
  citationAccuracy: number;
  hallucinationRate: number;
  safetyScore: number;
  pharmaValidation: number;
  verifyCompliance: number;
  expertValidationStatus: 'pending' | 'validated' | 'requires_review';
  lastValidated: Date;
  validatedBy?: string;
}

interface MedicalAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'safety' | 'interaction' | 'contraindication' | 'dosage' | 'allergy';
  title: string;
  description: string;
  evidence: Citation[];
  requiresAcknowledgment: boolean;
  timestamp: Date;
  expiresAt?: Date;
}

interface ClinicalConfidence {
  overall: number;
  components: {
    evidenceQuality: number;
    clinicalRelevance: number;
    safetyAssurance: number;
    regulatoryCompliance: number;
  };
  uncertainties: string[];
  knowledgeGaps: string[];
}

interface ExpertReviewItem {
  id: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  specialty: string;
  description: string;
  estimatedTime: number;
  requestedAt: Date;
  status: 'pending' | 'in_review' | 'completed';
  assignedExpert?: string;
}

interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  source: string;
  qualityScore: number;
}

interface PatientContext {
  patientId: string;
  age: number;
  gender: string;
  primaryDiagnosis: string;
  riskScore: number;
}

interface ClinicalRecommendation {
  id: string;
  type: 'treatment' | 'diagnostic' | 'monitoring';
  recommendation: string;
  evidence: Citation[];
  confidence: number;
  contraindications: string[];
  warnings: string[];
}

interface ComplianceStatus {
  hipaa?: boolean;
  fda?: boolean;
  gdpr?: boolean;
  soc2?: boolean;
  lastHipaaAudit?: string;
  lastFdaAudit?: string;
  lastGdprAudit?: string;
  lastSoc2Audit?: string;
  auditEventsToday?: number;
  lastFullAudit?: string;
}

interface ClinicalStreamData {
  accuracy?: number;
  responseTime?: number;
  safetyScore?: number;
  activeQueries?: number;
  accuracyTrend?: string;
  responseTimeTrend?: string;
  safetyTrend?: string;
  recentEvents?: ClinicalEvent[];
}

interface ClinicalEvent {
  id: string;
  timestamp: Date;
  type: 'query' | 'alert' | 'validation' | 'review';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  userId?: string;
}

interface AlertConfiguration {
  accuracyThreshold?: number;
  latencyThreshold?: number;
  safetyThreshold?: number;
}

interface PHARMAScore {
  purpose: number;
  hypothesis: number;
  audience: number;
  requirements: number;
  metrics: number;
  actionable: number;
  overall: number;
}

interface VERIFYStatus {
  sourcesValidated: boolean;
  citationsComplete: boolean;
  confidenceProvided: boolean;
  gapsIdentified: boolean;
  factsChecked: boolean;
  expertReviewStatus?: string;
  validSourceCount?: number;
  totalSources?: number;
}

// Main Clinical Safety Dashboard Component
export const ClinicalSafetyDashboard: React.FC = () => {
  const [safetyMetrics, setSafetyMetrics] = useState<ClinicalSafetyMetrics>({
    medicalAccuracy: 0.97,
    citationAccuracy: 0.99,
    hallucinationRate: 0.02,
    safetyScore: 0.98,
    pharmaValidation: 0.95,
    verifyCompliance: 0.96,
    expertValidationStatus: 'validated',
    lastValidated: new Date(),
    validatedBy: 'Dr. Sarah Johnson, MD'
  });

  const [activeAlerts, setActiveAlerts] = useState<MedicalAlert[]>([
    {
      id: '1',
      severity: 'warning',
      type: 'interaction',
      title: 'Drug Interaction Detected',
      description: 'Potential interaction between Warfarin and Aspirin',
      evidence: [],
      requiresAcknowledgment: true,
      timestamp: new Date()
    }
  ]);

  const [confidenceData, setConfidenceData] = useState<ClinicalConfidence>({
    overall: 0.91,
    components: {
      evidenceQuality: 0.94,
      clinicalRelevance: 0.89,
      safetyAssurance: 0.96,
      regulatoryCompliance: 0.85
    },
    uncertainties: ['Limited long-term safety data'],
    knowledgeGaps: ['Pediatric dosing guidelines unclear']
  });

  const [expertReviewQueue, setExpertReviewQueue] = useState<ExpertReviewItem[]>([
    {
      id: '1',
      priority: 'high',
      specialty: 'Cardiology',
      description: 'Review new treatment protocol for acute MI',
      estimatedTime: 30,
      requestedAt: new Date(),
      status: 'pending'
    }
  ]);

  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [currentPatient] = useState<PatientContext>({
    patientId: 'PT-001',
    age: 65,
    gender: 'Male',
    primaryDiagnosis: 'Acute Myocardial Infarction',
    riskScore: 7
  });

  const [complianceStatus] = useState<ComplianceStatus>({
    hipaa: true,
    fda: true,
    gdpr: true,
    soc2: true,
    lastHipaaAudit: '2024-01-15',
    auditEventsToday: 247,
    lastFullAudit: '2024-01-15'
  });

  const [clinicalStream] = useState<ClinicalStreamData>({
    accuracy: 0.97,
    responseTime: 450,
    safetyScore: 0.98,
    activeQueries: 23,
    accuracyTrend: 'stable',
    responseTimeTrend: 'improving',
    safetyTrend: 'stable',
    recentEvents: [
      {
        id: '1',
        timestamp: new Date(),
        type: 'query',
        severity: 'info',
        description: 'Medical query processed successfully'
      }
    ]
  });

  const [alertConfig] = useState<AlertConfiguration>({
    accuracyThreshold: 0.95,
    latencyThreshold: 1000,
    safetyThreshold: 0.98
  });

  // Real-time safety monitoring
  useEffect(() => {

      // Check for critical safety thresholds
      if (safetyMetrics.medicalAccuracy < 0.95 || safetyMetrics.safetyScore < 0.98) {
        // Trigger safety alert
        // }
    }, 5000);

    return () => clearInterval(safetyMonitor);
  }, [safetyMetrics]);

    // };

    setActiveAlerts(alerts => alerts.filter(alert => alert.id !== alertId));
  };

    setExpertReviewQueue(queue =>
      queue.map(item =>
        item.id === itemId
          ? { ...item, status: 'in_review' as const, assignedExpert: expertId }
          : item
      )
    );
  };

    // };

    // };

  return (
    <div className="clinical-safety-dashboard min-h-screen bg-gray-50">
      {/* Emergency Mode Banner */}
      <AnimatePresence>
        {isEmergencyMode && (
          <EmergencyBanner onDeactivate={() => setIsEmergencyMode(false)} />
        )}
      </AnimatePresence>

      {/* Clinical Safety Header */}
      <ClinicalSafetyHeader
        metrics={safetyMetrics}
        onEmergencyActivate={() => setIsEmergencyMode(true)}
      />

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">

          {/* Medical Accuracy Panel */}
          <div className="col-span-12 lg:col-span-4">
            <MedicalAccuracyPanel
              accuracy={safetyMetrics.medicalAccuracy}
              confidence={confidenceData}
              onRequestExpertReview={handleExpertReview}
            />
          </div>

          {/* Active Medical Alerts */}
          <div className="col-span-12 lg:col-span-4">
            <MedicalAlertsPanel
              alerts={activeAlerts}
              onAcknowledge={handleAlertAcknowledgment}
            />
          </div>

          {/* Expert Review Queue */}
          <div className="col-span-12 lg:col-span-4">
            <ExpertReviewPanel
              queue={expertReviewQueue}
              onAssignExpert={handleExpertAssignment}
            />
          </div>

          {/* Clinical Decision Support */}
          <div className="col-span-12 lg:col-span-8">
            <ClinicalDecisionSupport
              patientContext={currentPatient}
              onGenerateRecommendation={handleCDSRecommendation}
            />
          </div>

          {/* Regulatory Compliance Status */}
          <div className="col-span-12 lg:col-span-4">
            <ComplianceStatusPanel
              compliance={complianceStatus}
              onGenerateReport={handleComplianceReport}
            />
          </div>

          {/* Real-time Clinical Monitoring */}
          <div className="col-span-12">
            <RealTimeClinicalMonitor
              streamData={clinicalStream}
              alertThresholds={alertConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Clinical Safety Header Component
const ClinicalSafetyHeader: React.FC<{
  metrics: ClinicalSafetyMetrics;
  onEmergencyActivate: () => void;
}> = ({ metrics, onEmergencyActivate }) => {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinical Safety Dashboard</h1>
              <p className="text-sm text-gray-600">Real-time medical safety monitoring & validation</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  metrics.medicalAccuracy >= 0.98 ? 'text-green-600' :
                  metrics.medicalAccuracy >= 0.95 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(metrics.medicalAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Medical Accuracy</div>
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  metrics.safetyScore >= 0.98 ? 'text-green-600' :
                  metrics.safetyScore >= 0.95 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(metrics.safetyScore * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Safety Score</div>
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  metrics.hallucinationRate < 0.01 ? 'text-green-600' :
                  metrics.hallucinationRate < 0.05 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(metrics.hallucinationRate * 100).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500">Hallucination Rate</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge
              variant={metrics.expertValidationStatus === 'validated' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {metrics.expertValidationStatus.replace('_', ' ')}
            </Badge>

            <Button
              onClick={onEmergencyActivate}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Emergency Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Medical Accuracy Panel with PHARMA Validation
const MedicalAccuracyPanel: React.FC<{
  accuracy: number;
  confidence?: ClinicalConfidence;
  onRequestExpertReview: () => void;
}> = ({ accuracy, confidence, onRequestExpertReview }) => {

    if (acc >= 0.98) return 'text-green-600';
    if (acc >= 0.95) return 'text-yellow-600';
    return 'text-red-600';
  };

    if (!confidence) return 0;

      purpose: confidence.components.clinicalRelevance,
      hypothesis: confidence.components.evidenceQuality,
      audience: 0.95,
      requirements: confidence.components.regulatoryCompliance,
      metrics: accuracy,
      actionable: confidence.overall
    };

    return Object.values(pharmaComponents).reduce((a, b) => a + b, 0) / 6;
  };

  return (
    <Card className="border-l-4 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-blue-500" />
            Medical Accuracy
          </div>
          <Button
            onClick={onRequestExpertReview}
            variant="outline"
            size="sm"
          >
            <UserCheck className="mr-1 h-4 w-4" />
            Request Review
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Accuracy Gauge */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Accuracy</span>
            <span className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
              {(accuracy * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={accuracy * 100} className="h-3" />
        </div>

        {/* PHARMA Framework Score */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-3">
            PHARMA Validation Score
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>Purpose: {((confidence?.components.clinicalRelevance || 0) * 100).toFixed(0)}%</div>
            <div>Hypothesis: {((confidence?.components.evidenceQuality || 0) * 100).toFixed(0)}%</div>
            <div>Audience: 95%</div>
            <div>Requirements: {((confidence?.components.regulatoryCompliance || 0) * 100).toFixed(0)}%</div>
            <div>Metrics: {(accuracy * 100).toFixed(0)}%</div>
            <div>Actionable: {((confidence?.overall || 0) * 100).toFixed(0)}%</div>
          </div>
          <div className="font-semibold text-blue-900">
            Overall PHARMA: {(getPHARMAScore() * 100).toFixed(1)}%
          </div>
        </div>

        {/* Confidence Breakdown */}
        {confidence && (
          <div className="space-y-2">
            <ConfidenceIndicator
              label="Evidence Quality"
              value={confidence.components.evidenceQuality}
              threshold={0.9}
            />
            <ConfidenceIndicator
              label="Clinical Relevance"
              value={confidence.components.clinicalRelevance}
              threshold={0.85}
            />
            <ConfidenceIndicator
              label="Safety Assurance"
              value={confidence.components.safetyAssurance}
              threshold={0.98}
            />
            <ConfidenceIndicator
              label="Regulatory Compliance"
              value={confidence.components.regulatoryCompliance}
              threshold={1.0}
            />
          </div>
        )}

        {/* Knowledge Gaps Alert */}
        {confidence?.knowledgeGaps && confidence.knowledgeGaps.length > 0 && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Knowledge Gaps Identified</div>
              <ul className="text-sm list-disc list-inside">
                {confidence.knowledgeGaps.map((gap, idx) => (
                  <li key={idx}>{gap}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Confidence Indicator Component
const ConfidenceIndicator: React.FC<{
  label: string;
  value: number;
  threshold: number;
}> = ({ label, value, threshold }) => {

    if (value >= threshold) return 'bg-green-500';
    if (value >= threshold * 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getColor()}`}
            style={{ width: `${value * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">
          {(value * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

// Medical Alerts Panel Component
const MedicalAlertsPanel: React.FC<{
  alerts: MedicalAlert[];
  onAcknowledge: (alertId: string) => void;
}> = ({ alerts, onAcknowledge }) => {

    // eslint-disable-next-line security/detect-object-injection
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card className="border-l-4 border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Medical Alerts ({alerts.length})
          </div>
          {alerts.some(a => a.severity === 'critical') && (
            <Badge variant="destructive" className="animate-pulse">
              CRITICAL
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedAlerts.map((alert) => (
            <MedicalAlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => onAcknowledge(alert.id)}
            />
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="mx-auto h-12 w-12 mb-2" />
              <p className="text-sm">No active medical alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Individual Medical Alert Card
const MedicalAlertCard: React.FC<{
  alert: MedicalAlert;
  onAcknowledge: () => void;
}> = ({ alert, onAcknowledge }) => {

    // eslint-disable-next-line security/detect-object-injection
    switch (alert.severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

    // eslint-disable-next-line security/detect-object-injection
    switch (alert.type) {
      case 'interaction':
        return '💊';
      case 'contraindication':
        return '⚠️';
      case 'dosage':
        return '⚖️';
      case 'allergy':
        return '🚨';
      default:
        return '⚡';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${getSeverityStyles()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-lg mr-2">{getAlertIcon()}</span>
            <span className="font-semibold text-sm">{alert.title}</span>
          </div>
          <p className="text-xs mb-2">{alert.description}</p>

          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {alert.requiresAcknowledgment && (
          <Button
            onClick={onAcknowledge}
            variant="outline"
            size="sm"
          >
            Acknowledge
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Expert Review Panel Component
const ExpertReviewPanel: React.FC<{
  queue: ExpertReviewItem[];
  onAssignExpert: (itemId: string, expertId: string) => void;
}> = ({ queue, onAssignExpert }) => {

    // eslint-disable-next-line security/detect-object-injection
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

    // Mock expert assignment
    onAssignExpert(itemId, 'Dr. Michael Chen');
  };

  return (
    <Card className="border-l-4 border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-purple-500" />
            Expert Review Queue
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {queue.filter(item => item.status === 'pending').length} Pending
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {prioritizedQueue.map((item) => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge
                    variant={item.priority === 'urgent' ? 'destructive' :
                            item.priority === 'high' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                  <span className="ml-2 text-sm font-medium">{item.specialty}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {item.estimatedTime} min
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{item.description}</p>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Requested: {new Date(item.requestedAt).toLocaleTimeString()}
                </div>

                {item.status === 'pending' && (
                  <Button
                    onClick={() => handleExpertSelection(item.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Assign Expert
                  </Button>
                )}

                {item.status === 'in_review' && (
                  <div className="flex items-center text-xs text-purple-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
                    In Review by {item.assignedExpert}
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reviewed
                  </div>
                )}
              </div>
            </div>
          ))}

          {queue.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 mb-2" />
              <p className="text-sm">No items pending expert review</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Clinical Decision Support Component
const ClinicalDecisionSupport: React.FC<{
  patientContext: PatientContext;
  onGenerateRecommendation: () => void;
}> = ({ patientContext, onGenerateRecommendation }) => {
  const [recommendations] = useState<ClinicalRecommendation[]>([
    {
      id: '1',
      type: 'treatment',
      recommendation: 'Consider dual antiplatelet therapy with aspirin and clopidogrel',
      evidence: [],
      confidence: 0.91,
      contraindications: ['Active bleeding', 'Recent surgery'],
      warnings: ['Monitor for bleeding complications']
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Stethoscope className="mr-2 h-5 w-5 text-indigo-500" />
            Clinical Decision Support
          </div>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGenerating ? 'Generating...' : 'Generate Recommendations'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Patient Context Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Patient ID:</span>
              <p className="font-medium">{patientContext.patientId}</p>
            </div>
            <div>
              <span className="text-gray-600">Age/Gender:</span>
              <p className="font-medium">{patientContext.age}y / {patientContext.gender}</p>
            </div>
            <div>
              <span className="text-gray-600">Primary Diagnosis:</span>
              <p className="font-medium">{patientContext.primaryDiagnosis}</p>
            </div>
            <div>
              <span className="text-gray-600">Risk Score:</span>
              <p className="font-medium text-orange-600">{patientContext.riskScore}/10</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <ClinicalRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Clinical Recommendation Card
const ClinicalRecommendationCard: React.FC<{
  recommendation: ClinicalRecommendation;
}> = ({ recommendation }) => {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline" className="capitalize">
          {recommendation.type}
        </Badge>
        <div className="text-sm text-gray-600">
          Confidence: {(recommendation.confidence * 100).toFixed(0)}%
        </div>
      </div>

      <p className="text-sm font-medium mb-3">{recommendation.recommendation}</p>

      {recommendation.contraindications.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-red-800 mb-1">Contraindications:</div>
          <ul className="text-xs text-red-700 list-disc list-inside">
            {recommendation.contraindications.map((contra, idx) => (
              <li key={idx}>{contra}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendation.warnings.length > 0 && (
        <div>
          <div className="text-xs font-medium text-yellow-800 mb-1">Warnings:</div>
          <ul className="text-xs text-yellow-700 list-disc list-inside">
            {recommendation.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Emergency Banner Component
const EmergencyBanner: React.FC<{ onDeactivate: () => void }> = ({ onDeactivate }) => {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="bg-red-600 text-white"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 mr-3 animate-pulse" />
          <span className="font-bold text-lg">EMERGENCY MODE ACTIVE</span>
          <span className="ml-4">All safety protocols engaged • Expert review prioritized • Audit logging enhanced</span>
        </div>
        <Button
          onClick={onDeactivate}
          variant="outline"
          className="bg-red-700 hover:bg-red-800 border-red-500"
        >
          Deactivate
        </Button>
      </div>
    </motion.div>
  );
};

// Compliance Status Panel
const ComplianceStatusPanel: React.FC<{
  compliance: ComplianceStatus;
  onGenerateReport: () => void;
}> = ({ compliance, onGenerateReport }) => {
  return (
    <Card className="border-l-4 border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-green-500" />
            Regulatory Compliance
          </div>
          <Button
            onClick={onGenerateReport}
            variant="outline"
            size="sm"
          >
            Generate Report
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <ComplianceIndicator
          regulation="HIPAA"
          status={compliance.hipaa || false}
          lastAudit={compliance.lastHipaaAudit}
        />
        <ComplianceIndicator
          regulation="FDA 21 CFR Part 11"
          status={compliance.fda || false}
          lastAudit={compliance.lastFdaAudit}
        />
        <ComplianceIndicator
          regulation="GDPR"
          status={compliance.gdpr || false}
          lastAudit={compliance.lastGdprAudit}
        />
        <ComplianceIndicator
          regulation="SOC 2 Type II"
          status={compliance.soc2 || false}
          lastAudit={compliance.lastSoc2Audit}
        />

        {/* Audit Trail Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-medium mb-2">Audit Trail</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Events Today: {compliance.auditEventsToday || 0}</div>
            <div>Last Audit: {compliance.lastFullAudit || 'N/A'}</div>
            <div>Retention: 7 years</div>
            <div>Encryption: AES-256</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compliance Indicator Component
const ComplianceIndicator: React.FC<{
  regulation: string;
  status: boolean;
  lastAudit?: string;
}> = ({ regulation, status, lastAudit }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-medium">{regulation}</div>
        {lastAudit && (
          <div className="text-xs text-gray-500">Last audit: {lastAudit}</div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className={status ? 'text-green-700' : 'text-red-700'}>
          {status ? 'Compliant' : 'Non-Compliant'}
        </span>
      </div>
    </div>
  );
};

// Real-time Clinical Monitor
const RealTimeClinicalMonitor: React.FC<{
  streamData: ClinicalStreamData;
  alertThresholds: AlertConfiguration;
}> = ({ streamData, alertThresholds }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-blue-500" />
          Real-Time Clinical Monitoring
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Medical Accuracy"
            value={streamData.accuracy || 0}
            unit="%"
            trend={streamData.accuracyTrend || 'stable'}
            threshold={alertThresholds.accuracyThreshold || 0.95}
            criticalThreshold={0.95}
          />
          <MetricCard
            title="Response Time"
            value={streamData.responseTime || 0}
            unit="ms"
            trend={streamData.responseTimeTrend || 'stable'}
            threshold={alertThresholds.latencyThreshold || 1000}
            criticalThreshold={1000}
          />
          <MetricCard
            title="Safety Score"
            value={streamData.safetyScore || 0}
            unit="%"
            trend={streamData.safetyTrend || 'stable'}
            threshold={alertThresholds.safetyThreshold || 0.98}
            criticalThreshold={0.98}
          />
          <MetricCard
            title="Active Queries"
            value={streamData.activeQueries || 0}
            unit=""
            trend="stable"
            threshold={100}
            criticalThreshold={150}
          />
        </div>

        {/* Clinical Event Stream */}
        <div>
          <h4 className="font-medium mb-3">Recent Clinical Events</h4>
          <ClinicalEventStream events={streamData.recentEvents || []} />
        </div>
      </CardContent>
    </Card>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  trend: string;
  threshold: number;
  criticalThreshold: number;
}> = ({ title, value, unit, trend, criticalThreshold }) => {

    if (unit === 'ms') {
      return value <= criticalThreshold ? 'text-green-600' : 'text-red-600';
    }
    if (unit === '%') {

      return percentage >= criticalThreshold ? 'text-green-600' : 'text-red-600';
    }
    return 'text-blue-600';
  };

    if (unit === '%' && value <= 1) {
      return (value * 100).toFixed(1);
    }
    return value.toString();
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${getStatusColor()}`}>
        {formatValue()}{unit}
      </div>
      <div className="text-xs text-gray-500 capitalize">{trend}</div>
    </div>
  );
};

// Clinical Event Stream Component
const ClinicalEventStream: React.FC<{ events: ClinicalEvent[] }> = ({ events }) => {
  return (
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {events.map((event) => (
        <div key={event.id} className="flex items-center space-x-3 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            event.severity === 'critical' ? 'bg-red-500' :
            event.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          }`} />
          <span className="text-xs text-gray-500">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          <span className="flex-1">{event.description}</span>
          <Badge variant="outline" className="text-xs capitalize">
            {event.type}
          </Badge>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          No recent events
        </div>
      )}
    </div>
  );
};

export default ClinicalSafetyDashboard;
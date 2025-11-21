import { Shield, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import React from 'react';

import { ClinicalValidationStatus, FDASaMDClass } from '@/shared/types/agent.types';

import { Badge } from './badge';

interface HealthcareComplianceBadgeProps {
  type: 'hipaa' | 'fda' | 'clinical' | 'pharma' | 'verify' | 'medical_accuracy';
  status?: boolean | ClinicalValidationStatus | FDASaMDClass | number;
  className?: string;
}

type BadgeVariant = "default" | "regulatory" | "clinical" | "secondary" | "market" | "destructive" | "outline";

export function HealthcareComplianceBadge({
  type,
  status,
  className
}: HealthcareComplianceBadgeProps) {
  const getBadgeContent = () => {
    switch (type) {
      case 'hipaa':
        return {
          icon: Shield,
          text: status ? 'HIPAA Compliant' : 'HIPAA Non-Compliant',
          variant: status ? 'default' : 'destructive' as const,
          color: status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        };

      case 'fda':
        if (!status) {
          return {
            icon: Shield,
            text: 'No FDA Classification',
            variant: 'secondary' as const,
            color: 'bg-gray-100 text-gray-800'
          };
        }
        return {
          icon: Shield,
          text: `FDA SaMD Class ${status}`,
          variant: 'default' as const,
          color: 'bg-blue-100 text-blue-800'
        };

      case 'clinical':
        const clinicalStatus = status as ClinicalValidationStatus;
        switch (clinicalStatus) {
          case ClinicalValidationStatus.VALIDATED:
            return {
              icon: CheckCircle,
              text: 'Clinically Validated',
              variant: 'default' as const,
              color: 'bg-green-100 text-green-800'
            };
          case ClinicalValidationStatus.IN_REVIEW:
            return {
              icon: Clock,
              text: 'Under Clinical Review',
              variant: 'secondary' as const,
              color: 'bg-yellow-100 text-yellow-800'
            };
          case ClinicalValidationStatus.REJECTED:
            return {
              icon: X,
              text: 'Clinical Validation Rejected',
              variant: 'destructive' as const,
              color: 'bg-red-100 text-red-800'
            };
          default:
            return {
              icon: Clock,
              text: 'Pending Clinical Validation',
              variant: 'outline' as const,
              color: 'bg-gray-100 text-gray-800'
            };
        }

      case 'pharma':
        return {
          icon: Shield,
          text: status ? 'Pharma Enabled' : 'Pharma Disabled',
          variant: status ? 'default' : 'secondary' as const,
          color: status ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        };

      case 'verify':
        return {
          icon: CheckCircle,
          text: status ? 'Verification Required' : 'No Verification',
          variant: status ? 'default' : 'secondary' as const,
          color: status ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
        };

      case 'medical_accuracy':
        const accuracy = typeof status === 'number' ? status : 0;
        const isHighAccuracy = accuracy >= 0.90;
        return {
          icon: isHighAccuracy ? CheckCircle : AlertTriangle,
          text: `Medical Accuracy: ${(accuracy * 100).toFixed(1)}%`,
          variant: isHighAccuracy ? 'default' : 'destructive' as const,
          color: isHighAccuracy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        };

      default:
        return {
          icon: Shield,
          text: 'Unknown',
          variant: 'secondary' as const,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const { icon: Icon, text, variant, color } = getBadgeContent();

  return (
    <Badge
      variant={variant}
      className={`${color} flex items-center gap-1 ${className}`}
    >
      <Icon className="w-3 h-3" />
      {text}
    </Badge>
  );
}

interface HealthcareCompliancePanelProps {
  agent: {
    hipaa_compliant?: boolean;
    fda_samd_class?: FDASaMDClass;
    clinical_validation_status?: ClinicalValidationStatus;
    pharma_enabled?: boolean;
    verify_enabled?: boolean;
    medical_accuracy_score?: number;
    medical_error_rate?: number;
    hallucination_rate?: number;
    citation_accuracy?: number;
  };
  className?: string;
}

export function HealthcareCompliancePanel({ agent, className }: HealthcareCompliancePanelProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900">Healthcare Compliance</h4>
      <div className="flex flex-wrap gap-2">
        <HealthcareComplianceBadge
          type="hipaa"
          status={agent.hipaa_compliant}
        />

        {agent.fda_samd_class && (
          <HealthcareComplianceBadge
            type="fda"
            status={agent.fda_samd_class}
          />
        )}

        {agent.clinical_validation_status && (
          <HealthcareComplianceBadge
            type="clinical"
            status={agent.clinical_validation_status}
          />
        )}

        <HealthcareComplianceBadge
          type="pharma"
          status={agent.pharma_enabled}
        />

        <HealthcareComplianceBadge
          type="verify"
          status={agent.verify_enabled}
        />

        {agent.medical_accuracy_score !== undefined && (
          <HealthcareComplianceBadge
            type="medical_accuracy"
            status={agent.medical_accuracy_score}
          />
        )}
      </div>

      {(agent.medical_error_rate !== undefined ||
        agent.hallucination_rate !== undefined ||
        agent.citation_accuracy !== undefined) && (
        <div className="mt-3 text-xs text-gray-600">
          <div className="font-medium mb-1">Performance Metrics:</div>
          {agent.medical_error_rate !== undefined && (
            <div>Medical Error Rate: {(agent.medical_error_rate * 100).toFixed(2)}%</div>
          )}
          {agent.hallucination_rate !== undefined && (
            <div>Hallucination Rate: {(agent.hallucination_rate * 100).toFixed(2)}%</div>
          )}
          {agent.citation_accuracy !== undefined && (
            <div>Citation Accuracy: {(agent.citation_accuracy * 100).toFixed(1)}%</div>
          )}
        </div>
      )}
    </div>
  );
}
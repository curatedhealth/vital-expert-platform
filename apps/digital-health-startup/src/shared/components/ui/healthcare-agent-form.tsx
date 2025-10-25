import React from 'react';

import { ClinicalValidationStatus, FDASaMDClass } from '@/shared/types/agent.types';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ClinicalValidationSelector } from './clinical-validation-selector';
import { FDASaMDSelector } from './fda-samd-selector';
import { HealthcareCompliancePanel } from './healthcare-compliance-badge';
import { Input } from './input';
import { Label } from './label';
import { MedicalSpecialtySelector } from './medical-specialty-selector';
import { Separator } from './separator';
import { Switch } from './switch';
import { Textarea } from './textarea';

interface HealthcareAgentFormData {
  // Basic fields
  name: string;
  description: string;

  // Healthcare-specific fields
  medical_specialty?: string;
  clinical_validation_status?: ClinicalValidationStatus;
  medical_accuracy_score?: number;
  citation_accuracy?: number;
  hallucination_rate?: number;
  hipaa_compliant?: boolean;
  pharma_enabled?: boolean;
  verify_enabled?: boolean;
  fda_samd_class?: FDASaMDClass;
  medical_error_rate?: number;
  medical_reviewer_id?: string;
}

interface HealthcareAgentFormProps {
  data: HealthcareAgentFormData;
  onChange: (data: Partial<HealthcareAgentFormData>) => void;
  mode?: 'create' | 'edit' | 'view';
  className?: string;
}

export function HealthcareAgentForm({
  data,
  onChange,
  mode = 'create',
  className
}: HealthcareAgentFormProps) {
  const isReadOnly = mode === 'view';

  const handleChange = (field: keyof HealthcareAgentFormData, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter agent name"
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the agent's purpose and capabilities"
              disabled={isReadOnly}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medical Specialization */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Specialization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Medical Specialty</Label>
            <MedicalSpecialtySelector
              value={data.medical_specialty}
              onValueChange={(value) => handleChange('medical_specialty', value)}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinical Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Validation Status</Label>
            <ClinicalValidationSelector
              value={data.clinical_validation_status}
              onValueChange={(value) => handleChange('clinical_validation_status', value)}
              disabled={isReadOnly}
              showDescription={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medical_accuracy">Medical Accuracy Score (0-1)</Label>
              <Input
                id="medical_accuracy"
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={data.medical_accuracy_score || ''}
                onChange={(e) => handleChange('medical_accuracy_score', parseFloat(e.target.value) || 0)}
                placeholder="0.95"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="citation_accuracy">Citation Accuracy (0-1)</Label>
              <Input
                id="citation_accuracy"
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={data.citation_accuracy || ''}
                onChange={(e) => handleChange('citation_accuracy', parseFloat(e.target.value) || 0)}
                placeholder="0.98"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="hallucination_rate">Hallucination Rate (0-1)</Label>
              <Input
                id="hallucination_rate"
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={data.hallucination_rate || ''}
                onChange={(e) => handleChange('hallucination_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.05"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="medical_error_rate">Medical Error Rate (0-1)</Label>
              <Input
                id="medical_error_rate"
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={data.medical_error_rate || ''}
                onChange={(e) => handleChange('medical_error_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.02"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medical_reviewer">Medical Reviewer ID</Label>
            <Input
              id="medical_reviewer"
              value={data.medical_reviewer_id || ''}
              onChange={(e) => handleChange('medical_reviewer_id', e.target.value)}
              placeholder="UUID of medical reviewer"
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>FDA SaMD Classification</Label>
            <FDASaMDSelector
              value={data.fda_samd_class}
              onValueChange={(value) => handleChange('fda_samd_class', value)}
              disabled={isReadOnly}
              showDescription={true}
              showRiskLevel={true}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>HIPAA Compliant</Label>
                <p className="text-sm text-gray-500">
                  Agent meets HIPAA privacy and security requirements
                </p>
              </div>
              <Switch
                checked={data.hipaa_compliant || false}
                onCheckedChange={(checked) => handleChange('hipaa_compliant', checked)}
                disabled={isReadOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Pharma Enabled</Label>
                <p className="text-sm text-gray-500">
                  Agent can handle pharmaceutical industry use cases
                </p>
              </div>
              <Switch
                checked={data.pharma_enabled || false}
                onCheckedChange={(checked) => handleChange('pharma_enabled', checked)}
                disabled={isReadOnly}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Verification Required</Label>
                <p className="text-sm text-gray-500">
                  Agent responses require human verification
                </p>
              </div>
              <Switch
                checked={data.verify_enabled || false}
                onCheckedChange={(checked) => handleChange('verify_enabled', checked)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      {mode !== 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthcareCompliancePanel agent={data} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export type { HealthcareAgentFormData };
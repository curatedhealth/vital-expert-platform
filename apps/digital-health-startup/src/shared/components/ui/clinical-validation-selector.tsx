import { CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import React from 'react';

import { ClinicalValidationStatus } from '@/shared/types/agent.types';

import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const VALIDATION_OPTIONS = [
  {
    value: ClinicalValidationStatus.PENDING,
    label: 'Pending',
    description: 'Awaiting clinical validation',
    icon: Clock,
    color: 'bg-gray-100 text-gray-800'
  },
  {
    value: ClinicalValidationStatus.IN_REVIEW,
    label: 'In Review',
    description: 'Currently under clinical review',
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: ClinicalValidationStatus.VALIDATED,
    label: 'Validated',
    description: 'Clinically validated and approved',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800'
  },
  {
    value: ClinicalValidationStatus.REJECTED,
    label: 'Rejected',
    description: 'Clinical validation rejected',
    icon: X,
    color: 'bg-red-100 text-red-800'
  }
];

interface ClinicalValidationSelectorProps {
  value?: ClinicalValidationStatus;
  onValueChange: (value: ClinicalValidationStatus) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showDescription?: boolean;
}

export function ClinicalValidationSelector({
  value,
  onValueChange,
  placeholder = "Select validation status",
  className,
  disabled,
  showDescription = false
}: ClinicalValidationSelectorProps) {

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder}>
            {selectedOption && (
              <div className="flex items-center gap-2">
                <selectedOption.icon className="w-4 h-4" />
                {selectedOption.label}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CLINICAL_VALIDATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="w-4 h-4" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  {showDescription && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedOption && showDescription && (
        <Badge className={`${selectedOption.color} flex items-center gap-1 w-fit`}>
          <selectedOption.icon className="w-3 h-3" />
          {selectedOption.description}
        </Badge>
      )}
    </div>
  );
}

export { VALIDATION_OPTIONS as CLINICAL_VALIDATION_OPTIONS };
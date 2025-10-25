import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';

import { FDASaMDClass } from '@/shared/types/agent.types';

import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const SAMD_OPTIONS = [
  {
    value: FDASaMDClass.NONE,
    label: 'No Classification',
    description: 'Not classified as medical device software',
    icon: Shield,
    color: 'bg-gray-100 text-gray-800',
    riskLevel: 'None'
  },
  {
    value: FDASaMDClass.CLASS_I,
    label: 'Class I',
    description: 'Low risk - General controls',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    riskLevel: 'Low'
  },
  {
    value: FDASaMDClass.CLASS_II,
    label: 'Class II',
    description: 'Moderate risk - Special controls',
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800',
    riskLevel: 'Moderate'
  },
  {
    value: FDASaMDClass.CLASS_III,
    label: 'Class III',
    description: 'High risk - Premarket approval',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800',
    riskLevel: 'High'
  },
  {
    value: FDASaMDClass.CLASS_IV,
    label: 'Class IV',
    description: 'Highest risk - Strict premarket approval',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800',
    riskLevel: 'Critical'
  }
];

interface FDASaMDSelectorProps {
  value?: FDASaMDClass;
  onValueChange: (value: FDASaMDClass) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showDescription?: boolean;
  showRiskLevel?: boolean;
}

export function FDASaMDSelector({
  value,
  onValueChange,
  placeholder = "Select FDA SaMD classification",
  className,
  disabled,
  showDescription = false,
  showRiskLevel = false
}: FDASaMDSelectorProps) {

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder}>
            {selectedOption && (
              <div className="flex items-center gap-2">
                <selectedOption.icon className="w-4 h-4" />
                {selectedOption.label}
                {showRiskLevel && (
                  <span className="text-xs text-gray-500">
                    ({selectedOption.riskLevel} Risk)
                  </span>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {FDA_SAMD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="w-4 h-4" />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {option.label}
                    <span className="text-xs text-gray-500">
                      ({option.riskLevel} Risk)
                    </span>
                  </div>
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

      {selectedOption && selectedOption.value !== FDASaMDClass.NONE && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded-md">
          <div className="font-medium text-blue-800 mb-1">FDA SaMD Class {selectedOption.value} Requirements:</div>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            {selectedOption.value === FDASaMDClass.CLASS_I && (
              <>
                <li>General controls apply</li>
                <li>Quality management system requirements</li>
                <li>Software validation documentation</li>
              </>
            )}
            {selectedOption.value === FDASaMDClass.CLASS_II && (
              <>
                <li>General and special controls apply</li>
                <li>510(k) premarket notification may be required</li>
                <li>Clinical evaluation may be needed</li>
                <li>Enhanced software validation</li>
              </>
            )}
            {(selectedOption.value === FDASaMDClass.CLASS_III || selectedOption.value === FDASaMDClass.CLASS_IV) && (
              <>
                <li>Premarket approval (PMA) required</li>
                <li>Extensive clinical data required</li>
                <li>Comprehensive risk management</li>
                <li>Post-market surveillance mandatory</li>
                <li>Quality system regulation compliance</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export { FDA_SAMD_OPTIONS };
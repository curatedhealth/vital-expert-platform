/**
 * useProtocolValidation Hook
 * 
 * React hook for real-time Protocol validation.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  validateWorkflow,
  validateWorkflowCreate,
  validateExpertRequest,
  validateNode,
  validateEdge,
  type ValidationResult,
} from '../protocol/validation';

export type ValidationType = 
  | 'workflow'
  | 'workflowCreate'
  | 'expertRequest'
  | 'node'
  | 'edge';

const validators: Record<ValidationType, (data: unknown) => ValidationResult> = {
  workflow: validateWorkflow,
  workflowCreate: validateWorkflowCreate,
  expertRequest: validateExpertRequest,
  node: validateNode,
  edge: validateEdge,
};

export interface UseProtocolValidationOptions {
  type: ValidationType;
  validateOnChange?: boolean;
}

export interface UseProtocolValidationReturn {
  validate: (data: unknown) => ValidationResult;
  result: ValidationResult | null;
  isValid: boolean;
  errors: Array<{ path: string; message: string }>;
  reset: () => void;
}

export function useProtocolValidation({
  type,
  validateOnChange = false,
}: UseProtocolValidationOptions): UseProtocolValidationReturn {
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validator = useMemo(() => validators[type], [type]);

  const validate = useCallback((data: unknown): ValidationResult => {
    const validationResult = validator(data);
    setResult(validationResult);
    return validationResult;
  }, [validator]);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  const isValid = result?.success ?? false;
  const errors = result?.errors ?? [];

  return {
    validate,
    result,
    isValid,
    errors,
    reset,
  };
}













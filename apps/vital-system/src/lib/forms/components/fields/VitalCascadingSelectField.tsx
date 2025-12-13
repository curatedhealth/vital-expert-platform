/**
 * VitalCascadingSelectField - Hierarchical select fields with dependent loading
 *
 * Used for Organization context (Function → Department → Role) and
 * Suite context (Suite → Sub-Suite).
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller, useWatch } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VitalCascadingOption {
  id: string;
  name: string;
  display_name?: string;
  parent_id?: string;
}

// Alias for backward compatibility
export type CascadingOption = VitalCascadingOption;

interface VitalCascadingSelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  /** Field name for the ID value */
  name: FieldPath<TFieldValues>;
  /** Optional field name for storing the display name */
  nameField?: FieldPath<TFieldValues>;
  /** Parent field to watch for changes */
  parentField?: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  disabledPlaceholder?: string;
  required?: boolean;
  className?: string;
  /** Options to display (static) */
  options?: VitalCascadingOption[];
  /** Function to fetch options (dynamic) */
  fetchOptions?: (parentValue?: string) => Promise<VitalCascadingOption[]>;
  /** Callback when value changes */
  onValueChange?: (value: string, option?: VitalCascadingOption) => void;
  /** Fields to reset when this field changes */
  resetFields?: FieldPath<TFieldValues>[];
}

export function VitalCascadingSelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  nameField,
  parentField,
  label,
  description,
  icon: Icon,
  placeholder = 'Select an option',
  disabledPlaceholder = 'Select parent first',
  required,
  className,
  options: staticOptions,
  fetchOptions,
  onValueChange,
  resetFields,
}: VitalCascadingSelectFieldProps<TFieldValues>) {
  const { control, formState: { errors }, setValue } = useFormContext<TFieldValues>();
  const error = errors[name];

  // Watch parent field value
  const parentValue = parentField ? useWatch({ control, name: parentField }) : undefined;

  // State for dynamically loaded options
  const [options, setOptions] = React.useState<VitalCascadingOption[]>(staticOptions || []);
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch options when parent value changes
  React.useEffect(() => {
    if (fetchOptions) {
      // If we have a parent field but no parent value, clear options
      if (parentField && !parentValue) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      fetchOptions(parentValue as string | undefined)
        .then((data) => {
          setOptions(data);
        })
        .catch((err) => {
          console.error('Error fetching cascading options:', err);
          setOptions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [fetchOptions, parentField, parentValue]);

  // Update static options if they change
  React.useEffect(() => {
    if (staticOptions) {
      setOptions(staticOptions);
    }
  }, [staticOptions]);

  const isDisabled = parentField ? !parentValue || options.length === 0 : false;

  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            'flex items-center gap-2',
            error && 'text-destructive'
          )}
        >
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ''}
            onValueChange={(value) => {
              const selectedOption = options.find((opt) => opt.id === value);
              const actualValue = value === '__empty__' ? '' : value;

              // Update the ID field
              field.onChange(actualValue);

              // Update the name field if provided
              if (nameField && selectedOption) {
                setValue(
                  nameField,
                  (selectedOption.display_name || selectedOption.name) as TFieldValues[typeof nameField]
                );
              } else if (nameField && !actualValue) {
                setValue(nameField, '' as TFieldValues[typeof nameField]);
              }

              // Reset dependent fields
              if (resetFields) {
                resetFields.forEach((resetField) => {
                  setValue(resetField, '' as TFieldValues[typeof resetField]);
                });
              }

              // Callback
              onValueChange?.(actualValue, selectedOption);
            }}
            disabled={isDisabled || isLoading}
          >
            <SelectTrigger
              id={name}
              className={cn(
                error && 'border-destructive focus:ring-destructive',
                className
              )}
              aria-invalid={!!error}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <SelectValue
                  placeholder={isDisabled ? disabledPlaceholder : placeholder}
                />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty__">None</SelectItem>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.display_name || option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Alias for backward compatibility
export const CascadingSelectField = VitalCascadingSelectField;

// =============================================================================
// Preset Cascading Configs
// =============================================================================

/** Fetch functions API wrapper */
export const fetchFunctions = async (): Promise<VitalCascadingOption[]> => {
  const res = await fetch('/api/functions');
  if (!res.ok) return [];
  const data = await res.json();
  return data.functions || [];
};

/** Fetch departments for a function */
export const fetchDepartments = async (functionId?: string): Promise<VitalCascadingOption[]> => {
  if (!functionId) return [];
  const res = await fetch(`/api/departments?function_id=${functionId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.departments || [];
};

/** Fetch roles for a department */
export const fetchRoles = async (departmentId?: string): Promise<VitalCascadingOption[]> => {
  if (!departmentId) return [];
  const res = await fetch(`/api/roles?department_id=${departmentId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.roles || [];
};

/** Fetch agents */
export const fetchAgents = async (): Promise<VitalCascadingOption[]> => {
  const res = await fetch('/api/agents?limit=500');
  if (!res.ok) return [];
  const data = await res.json();
  return (data.agents || []).map((a: Record<string, unknown>) => ({
    id: a.id,
    name: a.name,
    display_name: a.display_name,
  }));
};

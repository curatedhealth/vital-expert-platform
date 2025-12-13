/**
 * VitalCheckboxField - Checkbox with React Hook Form integration
 *
 * Supports single checkbox (boolean) and checkbox groups (array of values).
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// =============================================================================
// Single Checkbox Field
// =============================================================================

interface VitalCheckboxFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function VitalCheckboxField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
}: VitalCheckboxFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('flex items-start space-x-3', className)}>
          <Checkbox
            id={name}
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={!!error}
            className="mt-0.5"
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor={name}
              className={cn(
                'cursor-pointer font-normal',
                error && 'text-destructive'
              )}
            >
              {label}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
}

// =============================================================================
// Checkbox Group Field (for arrays)
// =============================================================================

export interface VitalCheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface VitalCheckboxGroupFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  options: VitalCheckboxOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  columns?: 1 | 2 | 3 | 4;
}

export function VitalCheckboxGroupField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  options,
  disabled,
  className,
  orientation = 'vertical',
  columns,
}: VitalCheckboxGroupFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  const gridClass = columns
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
      }[columns]
    : orientation === 'horizontal'
    ? 'flex flex-wrap gap-4'
    : 'flex flex-col gap-2';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const handleCheckboxChange = (optionValue: string, checked: boolean) => {
          if (checked) {
            field.onChange([...values, optionValue]);
          } else {
            field.onChange(values.filter((v) => v !== optionValue));
          }
        };

        return (
          <div className={cn('space-y-3', className)}>
            {label && (
              <Label className={cn(error && 'text-destructive')}>
                {label}
              </Label>
            )}

            {description && !error && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            <div className={cn(columns ? 'grid gap-3' : '', gridClass)}>
              {options.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`${name}-${option.value}`}
                    checked={values.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(option.value, checked as boolean)
                    }
                    disabled={disabled || option.disabled}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor={`${name}-${option.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                    {option.description && (
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}

// Aliases for backward compatibility
export const CheckboxField = VitalCheckboxField;
export const CheckboxGroupField = VitalCheckboxGroupField;

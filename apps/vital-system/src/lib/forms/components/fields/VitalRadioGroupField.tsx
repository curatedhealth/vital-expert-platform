/**
 * VitalRadioGroupField - Radio button group with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface VitalRadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface VitalRadioGroupFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  options: VitalRadioOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
}

export function VitalRadioGroupField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  options,
  disabled,
  className,
  orientation = 'vertical',
  required,
}: VitalRadioGroupFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('space-y-3', className)}>
          {label && (
            <Label className={cn(error && 'text-destructive')}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}

          {description && !error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          <RadioGroup
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
            className={cn(
              orientation === 'horizontal'
                ? 'flex flex-wrap gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
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
          </RadioGroup>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error.message as string}
            </p>
          )}
        </div>
      )}
    />
  );
}

// Alias for backward compatibility
export const RadioGroupField = VitalRadioGroupField;

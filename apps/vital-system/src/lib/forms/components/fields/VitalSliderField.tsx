/**
 * VitalSliderField - Slider/range input with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VitalSliderFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  formatValue?: (value: number) => string;
  marks?: { value: number; label: string }[];
}

export function VitalSliderField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '',
  formatValue,
  marks,
}: VitalSliderFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  const displayValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return `${valuePrefix}${value}${valueSuffix}`;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = typeof field.value === 'number' ? field.value : min;

        return (
          <div className={cn('space-y-3', className)}>
            {(label || showValue) && (
              <div className="flex items-center justify-between">
                {label && (
                  <Label
                    htmlFor={name}
                    className={cn(error && 'text-destructive')}
                  >
                    {label}
                  </Label>
                )}
                {showValue && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {displayValue(value)}
                  </span>
                )}
              </div>
            )}

            <Slider
              value={[value]}
              onValueChange={([newValue]) => field.onChange(newValue)}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={cn(error && 'opacity-75')}
            />

            {marks && marks.length > 0 && (
              <div className="relative w-full h-4">
                {marks.map((mark) => {
                  const position = ((mark.value - min) / (max - min)) * 100;
                  return (
                    <span
                      key={mark.value}
                      className="absolute text-xs text-muted-foreground transform -translate-x-1/2"
                      style={{ left: `${position}%` }}
                    >
                      {mark.label}
                    </span>
                  );
                })}
              </div>
            )}

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
      }}
    />
  );
}

// =============================================================================
// Range Slider Field (for min-max ranges)
// =============================================================================

interface VitalRangeSliderFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  formatValue?: (value: [number, number]) => string;
}

export function VitalRangeSliderField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '',
  formatValue,
}: VitalRangeSliderFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  const displayValue = (value: [number, number]) => {
    if (formatValue) return formatValue(value);
    return `${valuePrefix}${value[0]}${valueSuffix} - ${valuePrefix}${value[1]}${valueSuffix}`;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value: [number, number] = Array.isArray(field.value)
          ? field.value
          : [min, max];

        return (
          <div className={cn('space-y-3', className)}>
            {(label || showValue) && (
              <div className="flex items-center justify-between">
                {label && (
                  <Label
                    htmlFor={name}
                    className={cn(error && 'text-destructive')}
                  >
                    {label}
                  </Label>
                )}
                {showValue && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {displayValue(value)}
                  </span>
                )}
              </div>
            )}

            <Slider
              value={value}
              onValueChange={(newValue) => field.onChange(newValue as [number, number])}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={cn(error && 'opacity-75')}
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
      }}
    />
  );
}

// Aliases for backward compatibility
export const SliderField = VitalSliderField;
export const RangeSliderField = VitalRangeSliderField;

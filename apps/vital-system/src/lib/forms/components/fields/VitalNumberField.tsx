/**
 * VitalNumberField - Number input with React Hook Form integration
 *
 * Features increment/decrement buttons, min/max validation, and formatting.
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalNumberFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Show increment/decrement buttons */
  showButtons?: boolean;
  /** Prefix text (e.g., "$") */
  prefix?: string;
  /** Suffix text (e.g., "%", "kg") */
  suffix?: string;
  /** Allow decimal values */
  allowDecimal?: boolean;
  /** Number of decimal places */
  decimalPlaces?: number;
}

export function VitalNumberField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  placeholder,
  min,
  max,
  step = 1,
  required,
  disabled,
  className,
  showButtons = false,
  prefix,
  suffix,
  allowDecimal = false,
  decimalPlaces = 2,
}: VitalNumberFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  const parseValue = (value: string): number | undefined => {
    if (!value || value === '') return undefined;
    const parsed = allowDecimal ? parseFloat(value) : parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
    if (allowDecimal && decimalPlaces > 0) {
      return value.toFixed(decimalPlaces);
    }
    return value.toString();
  };

  const clampValue = (value: number): number => {
    let result = value;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const numValue = typeof field.value === 'number' ? field.value : parseValue(field.value);

        const handleIncrement = () => {
          const current = numValue ?? min ?? 0;
          const newValue = clampValue(current + step);
          field.onChange(newValue);
        };

        const handleDecrement = () => {
          const current = numValue ?? min ?? 0;
          const newValue = clampValue(current - step);
          field.onChange(newValue);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;

          // Allow empty input
          if (inputValue === '') {
            field.onChange(undefined);
            return;
          }

          // Validate input format
          const regex = allowDecimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
          if (!regex.test(inputValue)) return;

          const parsed = parseValue(inputValue);
          if (parsed !== undefined) {
            field.onChange(clampValue(parsed));
          }
        };

        const canDecrement = min === undefined || (numValue ?? 0) > min;
        const canIncrement = max === undefined || (numValue ?? 0) < max;

        return (
          <div className={cn('space-y-2', className)}>
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

            <div className="flex items-center gap-2">
              {showButtons && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleDecrement}
                  disabled={disabled || !canDecrement}
                  aria-label="Decrease value"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}

              <div className="relative flex-1">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {prefix}
                  </span>
                )}
                <Input
                  id={name}
                  type="text"
                  inputMode={allowDecimal ? 'decimal' : 'numeric'}
                  value={numValue !== undefined ? formatValue(numValue) : ''}
                  onChange={handleChange}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    prefix && 'pl-8',
                    suffix && 'pr-10',
                    error && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-invalid={!!error}
                />
                {suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {suffix}
                  </span>
                )}
              </div>

              {showButtons && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleIncrement}
                  disabled={disabled || !canIncrement}
                  aria-label="Increase value"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

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

// Alias for backward compatibility
export const NumberField = VitalNumberField;

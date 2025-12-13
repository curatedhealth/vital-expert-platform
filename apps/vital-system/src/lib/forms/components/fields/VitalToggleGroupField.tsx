/**
 * VitalToggleGroupField - Toggle group with React Hook Form integration
 *
 * Visual toggle buttons for single or multiple selection.
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface VitalToggleOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface VitalToggleGroupFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  options: VitalToggleOption[];
  /** Single selection (string) or multiple selection (string[]) */
  type?: 'single' | 'multiple';
  disabled?: boolean;
  className?: string;
  required?: boolean;
  /** Size of toggle items */
  size?: 'default' | 'sm' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'outline';
}

export function VitalToggleGroupField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  options,
  type = 'single',
  disabled,
  className,
  required,
  size = 'default',
  variant = 'outline',
}: VitalToggleGroupFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('space-y-2', className)}>
          {label && (
            <Label className={cn(error && 'text-destructive')}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}

          {type === 'single' ? (
            <ToggleGroup
              type="single"
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value)}
              disabled={disabled}
              variant={variant}
              size={size}
              className="justify-start"
            >
              {options.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  aria-label={option.label}
                  className="gap-2"
                >
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <ToggleGroup
              type="multiple"
              value={Array.isArray(field.value) ? field.value : []}
              onValueChange={(value) => field.onChange(value)}
              disabled={disabled}
              variant={variant}
              size={size}
              className="justify-start flex-wrap"
            >
              {options.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  aria-label={option.label}
                  className="gap-2"
                >
                  {option.icon && <option.icon className="h-4 w-4" />}
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
      )}
    />
  );
}

// Alias for backward compatibility
export const ToggleGroupField = VitalToggleGroupField;

/**
 * VitalSwitchField - Toggle switch with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VitalSwitchFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'card';
}

export function VitalSwitchField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
  className,
  variant = 'default',
}: VitalSwitchFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  if (variant === 'card') {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            className={cn(
              'flex items-center justify-between p-3 bg-muted/50 rounded-lg',
              error && 'border border-destructive',
              className
            )}
          >
            <div className="space-y-0.5">
              <Label
                htmlFor={name}
                className={cn('cursor-pointer', error && 'text-destructive')}
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
            <Switch
              id={name}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!error}
            />
          </div>
        )}
      />
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn('flex items-center space-x-2', className)}>
          <Switch
            id={name}
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={!!error}
          />
          <div className="space-y-0.5">
            <Label
              htmlFor={name}
              className={cn('cursor-pointer', error && 'text-destructive')}
            >
              {label}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
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
export const SwitchField = VitalSwitchField;

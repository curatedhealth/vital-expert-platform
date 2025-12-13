/**
 * VitalInputField - Text input with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VitalInputFieldProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function VitalInputField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  className,
  required,
  ...props
}: VitalInputFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

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
          <div className="relative">
            {Icon && props.type !== 'hidden' && (
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            )}
            <Input
              {...field}
              {...props}
              id={name}
              value={field.value ?? ''}
              className={cn(
                Icon && 'pl-10',
                error && 'border-destructive focus-visible:ring-destructive',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : description ? `${name}-desc` : undefined}
            />
          </div>
        )}
      />

      {description && !error && (
        <p id={`${name}-desc`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={`${name}-error`} className="text-xs text-destructive" role="alert">
          {error.message as string}
        </p>
      )}
    </div>
  );
}

// Alias for backward compatibility
export const InputField = VitalInputField;

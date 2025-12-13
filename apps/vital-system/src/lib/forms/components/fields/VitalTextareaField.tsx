/**
 * VitalTextareaField - Multiline text input with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VitalTextareaFieldProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showCharCount?: boolean;
  maxLength?: number;
}

export function VitalTextareaField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  className,
  required,
  showCharCount,
  maxLength,
  rows = 4,
  ...props
}: VitalTextareaFieldProps<TFieldValues>) {
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
            <Textarea
              {...field}
              {...props}
              id={name}
              rows={rows}
              maxLength={maxLength}
              value={field.value ?? ''}
              className={cn(
                'font-mono text-sm',
                error && 'border-destructive focus-visible:ring-destructive',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : description ? `${name}-desc` : undefined}
            />
            {showCharCount && maxLength && (
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {(field.value?.length || 0)} / {maxLength}
              </span>
            )}
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
export const TextareaField = VitalTextareaField;

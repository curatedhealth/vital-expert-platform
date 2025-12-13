/**
 * VitalSelectField - Dropdown select with React Hook Form integration
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface VitalSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

// Alias for backward compatibility
export type SelectOption = VitalSelectOption;

interface VitalSelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: VitalSelectOption[] | readonly string[] | readonly VitalSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function VitalSelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  options,
  placeholder = 'Select an option',
  required,
  disabled,
  className,
  allowEmpty = true,
  emptyLabel = 'None',
}: VitalSelectFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];

  // Normalize options to VitalSelectOption[]
  const normalizedOptions: VitalSelectOption[] = React.useMemo(() => {
    if (!options) return [];
    return (options as (string | VitalSelectOption)[]).map((opt) => {
      if (typeof opt === 'string') {
        return {
          value: opt,
          label: opt.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        };
      }
      return opt;
    });
  }, [options]);

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
            onValueChange={(value) => field.onChange(value === '__empty__' ? '' : value)}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={cn(
                error && 'border-destructive focus:ring-destructive',
                className
              )}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {allowEmpty && (
                <SelectItem value="__empty__">{emptyLabel}</SelectItem>
              )}
              {normalizedOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.description ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  ) : (
                    option.label
                  )}
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
export const SelectField = VitalSelectField;

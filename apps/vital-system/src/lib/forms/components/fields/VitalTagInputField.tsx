/**
 * VitalTagInputField - Comma-separated tags input with React Hook Form integration
 *
 * Stores data as an array but displays as comma-separated text for easy editing.
 * Shows visual badges for entered tags.
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalTagInputFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  showBadges?: boolean;
}

export function VitalTagInputField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  placeholder = 'Enter tags separated by commas',
  required,
  disabled,
  className,
  maxTags,
  allowDuplicates = false,
  showBadges = true,
}: VitalTagInputFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];
  const [inputValue, setInputValue] = React.useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const tags: string[] = Array.isArray(field.value) ? field.value : [];

        // Sync input value with tags on mount
        React.useEffect(() => {
          setInputValue(tags.join(', '));
        }, []);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setInputValue(value);

          // Parse tags from comma-separated input
          let newTags = value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          // Remove duplicates if not allowed
          if (!allowDuplicates) {
            newTags = [...new Set(newTags)];
          }

          // Enforce max tags limit
          if (maxTags && newTags.length > maxTags) {
            newTags = newTags.slice(0, maxTags);
          }

          field.onChange(newTags);
        };

        const removeTag = (indexToRemove: number) => {
          const newTags = tags.filter((_, index) => index !== indexToRemove);
          field.onChange(newTags);
          setInputValue(newTags.join(', '));
        };

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
                {label}
                {required && <span className="text-destructive">*</span>}
                {maxTags && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({tags.length}/{maxTags})
                  </span>
                )}
              </Label>
            )}

            <Input
              id={name}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
              className={cn(
                error && 'border-destructive focus-visible:ring-destructive',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : description ? `${name}-desc` : undefined}
            />

            {showBadges && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <Badge
                    key={`${tag}-${index}`}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    {tag}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            )}

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
      }}
    />
  );
}

// Alias for backward compatibility
export const TagInputField = VitalTagInputField;

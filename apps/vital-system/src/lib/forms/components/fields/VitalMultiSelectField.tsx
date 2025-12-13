/**
 * VitalMultiSelectField - Multi-select combobox with React Hook Form integration
 *
 * Allows selecting multiple options with search and badge display.
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface VitalMultiSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface VitalMultiSelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: VitalMultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Maximum number of selections */
  maxSelections?: number;
  /** Show badges for selected items */
  showBadges?: boolean;
  /** For async loading */
  isLoading?: boolean;
  /** Callback when search changes (for async search) */
  onSearchChange?: (search: string) => void;
}

export function VitalMultiSelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  options,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  required,
  disabled,
  className,
  maxSelections,
  showBadges = true,
  isLoading,
  onSearchChange,
}: VitalMultiSelectFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedValues: string[] = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));
        const canSelectMore = !maxSelections || selectedValues.length < maxSelections;

        const handleSelect = (value: string) => {
          if (selectedValues.includes(value)) {
            // Remove
            field.onChange(selectedValues.filter((v) => v !== value));
          } else if (canSelectMore) {
            // Add
            field.onChange([...selectedValues, value]);
          }
        };

        const handleRemove = (value: string) => {
          field.onChange(selectedValues.filter((v) => v !== value));
        };

        return (
          <div className={cn('space-y-2', className)}>
            {label && (
              <Label
                className={cn(
                  'flex items-center gap-2',
                  error && 'text-destructive'
                )}
              >
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                {label}
                {required && <span className="text-destructive">*</span>}
                {maxSelections && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedValues.length}/{maxSelections})
                  </span>
                )}
              </Label>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={!!error}
                  disabled={disabled}
                  className={cn(
                    'w-full justify-between font-normal min-h-[2.5rem] h-auto',
                    selectedValues.length === 0 && 'text-muted-foreground',
                    error && 'border-destructive'
                  )}
                >
                  <span className="truncate">
                    {selectedValues.length === 0
                      ? placeholder
                      : `${selectedValues.length} selected`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    onValueChange={onSearchChange}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                          {options.map((option) => {
                            const isSelected = selectedValues.includes(option.value);
                            const isDisabled =
                              option.disabled || (!isSelected && !canSelectMore);

                            return (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                disabled={isDisabled}
                                onSelect={() => handleSelect(option.value)}
                              >
                                <div
                                  className={cn(
                                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible'
                                  )}
                                >
                                  <Check className="h-3 w-3" />
                                </div>
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {showBadges && selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    {option.label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemove(option.value)}
                        className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        aria-label={`Remove ${option.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
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

// Alias for backward compatibility
export const MultiSelectField = VitalMultiSelectField;

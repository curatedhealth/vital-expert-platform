/**
 * VitalComboboxField - Searchable select (combobox) with React Hook Form integration
 *
 * Uses Command component for search functionality within a Popover.
 */
'use client';

import * as React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export interface VitalComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface VitalComboboxFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  options: VitalComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  /** For async loading */
  isLoading?: boolean;
  /** Callback when search changes (for async search) */
  onSearchChange?: (search: string) => void;
}

export function VitalComboboxField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  icon: Icon,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  required,
  disabled,
  className,
  allowEmpty = true,
  emptyLabel = 'None',
  isLoading,
  onSearchChange,
}: VitalComboboxFieldProps<TFieldValues>) {
  const { control, formState: { errors } } = useFormContext<TFieldValues>();
  const error = errors[name];
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedOption = options.find((opt) => opt.value === field.value);

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

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={!!error}
                  disabled={disabled}
                  className={cn(
                    'w-full justify-between font-normal',
                    !field.value && 'text-muted-foreground',
                    error && 'border-destructive'
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                      <selectedOption.icon className="h-4 w-4 shrink-0" />
                    )}
                    {selectedOption?.label || placeholder}
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
                          {allowEmpty && (
                            <CommandItem
                              value=""
                              onSelect={() => {
                                field.onChange('');
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  !field.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span className="text-muted-foreground">{emptyLabel}</span>
                            </CommandItem>
                          )}
                          {options.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              disabled={option.disabled}
                              onSelect={() => {
                                field.onChange(option.value);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === option.value ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                {option.icon && <option.icon className="h-4 w-4 shrink-0" />}
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

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
export const ComboboxField = VitalComboboxField;

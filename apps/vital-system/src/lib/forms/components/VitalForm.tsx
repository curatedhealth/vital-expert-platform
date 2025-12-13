/**
 * VitalForm - React Hook Form wrapper with Zod integration
 *
 * Provides a standardized form context with validation, error handling,
 * and consistent styling across the application.
 */
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  UseFormProps,
  FormProvider,
  useFormContext,
  FieldPath,
  FieldError,
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
} from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// =============================================================================
// Form Hook
// =============================================================================

/**
 * Custom hook that wraps useForm with Zod resolver
 */
export function useVitalForm<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  });
}

// Alias for backward compatibility
export const useZodForm = useVitalForm;

// =============================================================================
// Form Context
// =============================================================================

interface VitalFormContextValue<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
}

const VitalFormContext = React.createContext<VitalFormContextValue | null>(null);

export function useVitalFormField<TFieldValues extends FieldValues = FieldValues>() {
  const context = React.useContext(VitalFormContext) as VitalFormContextValue<TFieldValues> | null;
  if (!context) {
    throw new Error('useVitalFormField must be used within a VitalForm');
  }
  return context.form;
}

// Alias for backward compatibility
export const useFormField = useVitalFormField;

// =============================================================================
// VitalForm Root Component
// =============================================================================

interface VitalFormProps<TFieldValues extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
}

export function VitalForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: VitalFormProps<TFieldValues>) {
  return (
    <VitalFormContext.Provider value={{ form: form as UseFormReturn<FieldValues> }}>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('space-y-4', className)}
          {...props}
        >
          {children}
        </form>
      </FormProvider>
    </VitalFormContext.Provider>
  );
}

// Alias for backward compatibility
export const Form = VitalForm;

// =============================================================================
// VitalFormField Component
// =============================================================================

interface VitalFormFieldContextValue {
  name: string;
  error?: FieldError;
}

const VitalFormFieldContext = React.createContext<VitalFormFieldContextValue | null>(null);

export function useVitalFormFieldContext() {
  const context = React.useContext(VitalFormFieldContext);
  if (!context) {
    throw new Error('useVitalFormFieldContext must be used within a VitalFormField');
  }
  return context;
}

// Alias for backward compatibility
export const useFormFieldContext = useVitalFormFieldContext;

interface VitalFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children:
    | React.ReactNode
    | ((props: {
        field: ControllerRenderProps<TFieldValues, TName>;
        fieldState: ControllerFieldState;
      }) => React.ReactElement | null);
}

export function VitalFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  description,
  required,
  className,
  icon: Icon,
  children,
}: VitalFormFieldProps<TFieldValues, TName>) {
  const form = useFormContext<TFieldValues>();
  const error = form.formState.errors[name] as FieldError | undefined;

  return (
    <VitalFormFieldContext.Provider value={{ name, error }}>
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

        {typeof children === 'function' ? (
          <Controller
            name={name}
            control={form.control}
            render={({ field, fieldState }) => children({ field, fieldState }) ?? <></>}
          />
        ) : (
          children
        )}

        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error.message}
          </p>
        )}
      </div>
    </VitalFormFieldContext.Provider>
  );
}

// Alias for backward compatibility
export const FormField = VitalFormField;

// =============================================================================
// VitalFormSection Component
// =============================================================================

interface VitalFormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function VitalFormSection({
  title,
  description,
  children,
  className,
}: VitalFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Alias for backward compatibility
export const FormSection = VitalFormSection;

// =============================================================================
// VitalFormGrid Component
// =============================================================================

interface VitalFormGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export function VitalFormGrid({ columns = 2, children, className }: VitalFormGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

// Alias for backward compatibility
export const FormGrid = VitalFormGrid;

// =============================================================================
// VitalFormActions Component
// =============================================================================

interface VitalFormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function VitalFormActions({
  children,
  className,
  align = 'right',
}: VitalFormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn('flex items-center gap-2', alignClass[align], className)}>
      {children}
    </div>
  );
}

// Alias for backward compatibility
export const FormActions = VitalFormActions;

// =============================================================================
// VitalFormMessage Component (for global errors/success)
// =============================================================================

interface VitalFormMessageProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
}

export function VitalFormMessage({ type, message, className }: VitalFormMessageProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    success: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  };

  return (
    <div
      className={cn('p-3 rounded-lg border text-sm', styles[type], className)}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}

// Alias for backward compatibility
export const FormMessage = VitalFormMessage;

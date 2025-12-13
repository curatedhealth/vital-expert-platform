/**
 * Vital Form Components
 *
 * React Hook Form components with Zod validation support.
 */

// Core Form components (Vital prefix + backward compatible aliases)
export {
  VitalForm,
  Form,
  VitalFormField,
  FormField,
  VitalFormSection,
  FormSection,
  VitalFormGrid,
  FormGrid,
  VitalFormActions,
  FormActions,
  VitalFormMessage,
  FormMessage,
  useVitalForm,
  useZodForm,
  useVitalFormField,
  useFormField,
  useVitalFormFieldContext,
  useFormFieldContext,
} from './VitalForm';

// Field components
export * from './fields';

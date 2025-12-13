/**
 * Vital Forms Library
 *
 * Shared form system using React Hook Form with Zod validation.
 * All components use the "Vital" prefix for consistency.
 *
 * @example
 * ```tsx
 * import { useVitalForm, VitalForm, VitalInputField, VitalSelectField } from '@/lib/forms';
 * import { promptSchema, type Prompt } from '@/lib/forms/schemas';
 *
 * function PromptForm() {
 *   const form = useVitalForm(promptSchema, {
 *     defaultValues: { name: '', status: 'active' }
 *   });
 *
 *   const onSubmit = (data: Prompt) => {
 *     console.log(data);
 *   };
 *
 *   return (
 *     <VitalForm form={form} onSubmit={onSubmit}>
 *       <VitalInputField name="name" label="Name" required />
 *       <VitalSelectField name="status" label="Status" options={STATUS_OPTIONS} />
 *       <button type="submit">Save</button>
 *     </VitalForm>
 *   );
 * }
 * ```
 */

// Components
export * from './components';

// Schemas
export * from './schemas';

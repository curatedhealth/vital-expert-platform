/**
 * Vital Form Field Components
 *
 * Reusable field components with React Hook Form integration.
 * All components use the "Vital" prefix with backward-compatible aliases.
 */

// Text inputs
export { VitalInputField, InputField } from './VitalInputField';
export { VitalTextareaField, TextareaField } from './VitalTextareaField';
export { VitalNumberField, NumberField } from './VitalNumberField';

// Select fields
export { VitalSelectField, SelectField, type VitalSelectOption, type SelectOption } from './VitalSelectField';
export { VitalComboboxField, ComboboxField, type VitalComboboxOption } from './VitalComboboxField';
export { VitalMultiSelectField, MultiSelectField, type VitalMultiSelectOption } from './VitalMultiSelectField';
export {
  VitalCascadingSelectField,
  CascadingSelectField,
  fetchFunctions,
  fetchDepartments,
  fetchRoles,
  fetchAgents,
  type VitalCascadingOption,
  type CascadingOption,
} from './VitalCascadingSelectField';

// Boolean/Toggle fields
export { VitalSwitchField, SwitchField } from './VitalSwitchField';
export {
  VitalCheckboxField,
  CheckboxField,
  VitalCheckboxGroupField,
  CheckboxGroupField,
  type VitalCheckboxOption,
} from './VitalCheckboxField';
export { VitalRadioGroupField, RadioGroupField, type VitalRadioOption } from './VitalRadioGroupField';
export { VitalToggleGroupField, ToggleGroupField, type VitalToggleOption } from './VitalToggleGroupField';

// Range/Slider fields
export {
  VitalSliderField,
  SliderField,
  VitalRangeSliderField,
  RangeSliderField,
} from './VitalSliderField';

// Array/Tag fields
export { VitalTagInputField, TagInputField } from './VitalTagInputField';

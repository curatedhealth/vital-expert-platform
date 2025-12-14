import { Textarea } from '../textarea';

export interface HITLFeedbackInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function HITLFeedbackInput({ placeholder, value, onChange }: HITLFeedbackInputProps) {
  return (
    <Textarea
      placeholder={placeholder ?? 'Add feedback or instructions...'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

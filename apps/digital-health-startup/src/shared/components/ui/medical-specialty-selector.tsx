import React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const MEDICAL_SPECIALTIES = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'endocrinology', label: 'Endocrinology' },
  { value: 'gastroenterology', label: 'Gastroenterology' },
  { value: 'hematology', label: 'Hematology' },
  { value: 'infectious-disease', label: 'Infectious Disease' },
  { value: 'nephrology', label: 'Nephrology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'pulmonology', label: 'Pulmonology' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'rheumatology', label: 'Rheumatology' },
  { value: 'emergency-medicine', label: 'Emergency Medicine' },
  { value: 'family-medicine', label: 'Family Medicine' },
  { value: 'internal-medicine', label: 'Internal Medicine' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'pharmacology', label: 'Pharmacology' },
  { value: 'preventive-medicine', label: 'Preventive Medicine' },
  { value: 'rehabilitation-medicine', label: 'Rehabilitation Medicine' },
  { value: 'urology', label: 'Urology' },
  { value: 'obstetrics-gynecology', label: 'Obstetrics & Gynecology' },
  { value: 'otolaryngology', label: 'Otolaryngology' },
  { value: 'plastic-surgery', label: 'Plastic Surgery' },
  { value: 'sports-medicine', label: 'Sports Medicine' },
  { value: 'pain-management', label: 'Pain Management' },
  { value: 'critical-care', label: 'Critical Care' },
  { value: 'geriatrics', label: 'Geriatrics' },
  { value: 'medical-genetics', label: 'Medical Genetics' },
  { value: 'nuclear-medicine', label: 'Nuclear Medicine' },
  { value: 'occupational-medicine', label: 'Occupational Medicine' },
  { value: 'aerospace-medicine', label: 'Aerospace Medicine' },
  { value: 'allergy-immunology', label: 'Allergy & Immunology' },
  { value: 'clinical-research', label: 'Clinical Research' },
  { value: 'digital-health', label: 'Digital Health' },
  { value: 'telemedicine', label: 'Telemedicine' },
  { value: 'health-informatics', label: 'Health Informatics' },
  { value: 'biomedical-engineering', label: 'Biomedical Engineering' },
  { value: 'medical-writing', label: 'Medical Writing' },
  { value: 'regulatory-affairs', label: 'Regulatory Affairs' },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance' },
  { value: 'medical-affairs', label: 'Medical Affairs' },
  { value: 'clinical-data-management', label: 'Clinical Data Management' },
  { value: 'biostatistics', label: 'Biostatistics' },
  { value: 'health-economics', label: 'Health Economics' },
  { value: 'market-access', label: 'Market Access' }
];

interface MedicalSpecialtySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MedicalSpecialtySelector({
  value,
  onValueChange,
  placeholder = "Select medical specialty",
  className,
  disabled
}: MedicalSpecialtySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {MEDICAL_SPECIALTIES.map((specialty) => (
          <SelectItem key={specialty.value} value={specialty.value}>
            {specialty.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { MEDICAL_SPECIALTIES };
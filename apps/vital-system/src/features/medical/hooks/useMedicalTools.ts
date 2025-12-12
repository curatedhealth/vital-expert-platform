import { useState, useCallback } from 'react';

export interface MedicalCalculation {
  id: string;
  name: string;
  category: 'cardiovascular' | 'nephrology' | 'endocrinology' | 'general' | 'drug-dosing';
  inputs: Array<{
    id: string;
    label: string;
    type: 'number' | 'select' | 'boolean';
    unit?: string;
    options?: string[];
    required: boolean;
    value?: any;
  }>;
  result?: {
    value: number | string;
    unit?: string;
    interpretation?: string;
    recommendations?: string[];
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface MedicalReference {
  id: string;
  title: string;
  category: 'guidelines' | 'drug-info' | 'lab-values' | 'calculators';
  content: string;
  source: string;
  lastUpdated: Date;
  tags: string[];
}

const medicalCalculators: Omit<MedicalCalculation, 'id' | 'result'>[] = [
  {
    name: 'eGFR (CKD-EPI)',
    category: 'nephrology',
    inputs: [
      { id: 'creatinine', label: 'Serum Creatinine', type: 'number', unit: 'mg/dL', required: true },
      { id: 'age', label: 'Age', type: 'number', unit: 'years', required: true },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
      { id: 'race', label: 'Race', type: 'select', options: ['African American', 'Other'], required: true }
    ]
  },
  {
    name: 'ASCVD Risk Calculator',
    category: 'cardiovascular',
    inputs: [
      { id: 'age', label: 'Age', type: 'number', unit: 'years', required: true },
      { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
      { id: 'race', label: 'Race', type: 'select', options: ['White', 'African American', 'Other'], required: true },
      { id: 'totalCholesterol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', required: true },
      { id: 'hdl', label: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', required: true },
      { id: 'systolicBP', label: 'Systolic BP', type: 'number', unit: 'mmHg', required: true },
      { id: 'diabetes', label: 'Diabetes', type: 'boolean', required: true },
      { id: 'smoker', label: 'Current Smoker', type: 'boolean', required: true },
      { id: 'bpTreatment', label: 'On BP Treatment', type: 'boolean', required: true }
    ]
  },
  {
    name: 'BMI Calculator',
    category: 'general',
    inputs: [
      { id: 'weight', label: 'Weight', type: 'number', unit: 'kg', required: true },
      { id: 'height', label: 'Height', type: 'number', unit: 'cm', required: true }
    ]
  },
  {
    name: 'HbA1c to Average Glucose',
    category: 'endocrinology',
    inputs: [
      { id: 'hba1c', label: 'HbA1c', type: 'number', unit: '%', required: true }
    ]
  }
];

interface UseMedicalToolsOptions {
  onCalculationComplete?: (calculation: MedicalCalculation) => void;
  onError?: (error: Error) => void;
}

export function useMedicalTools(options: UseMedicalToolsOptions = {}) {
  const [activeCalculations, setActiveCalculations] = useState<MedicalCalculation[]>([]);
  const [references, setReferences] = useState<MedicalReference[]>([]);
  const [searchResults, setSearchResults] = useState<MedicalReference[]>([]);

  const createCalculation = useCallback((calculatorName: string) => {
    const template = medicalCalculators.find(c => c.name === calculatorName);

    if (!template) {
      throw new Error(`Calculator '${calculatorName}' not found`);
    }

    const calculation: MedicalCalculation = {
      id: `calc_${Date.now()}`,
      ...template,
      inputs: template.inputs.map(input => ({ ...input, value: undefined }))
    };

    setActiveCalculations(prev => [...prev, calculation]);
    return calculation.id;
  }, []);

  const updateCalculationInput = useCallback((calculationId: string, inputId: string, value: any) => {
    setActiveCalculations(prev => prev.map(calc => {
      if (calc.id !== calculationId) return calc;

      const updatedInputs = calc.inputs.map(input =>
        input.id === inputId ? { ...input, value } : input
      );

      return { ...calc, inputs: updatedInputs };
    }));
  }, []);

  const performCalculation = useCallback((calculationId: string) => {
    const calculation = activeCalculations.find(c => c.id === calculationId);

    if (!calculation) {
      throw new Error('Calculation not found');
    }

    try {
      // Validate all required inputs are filled
      const missingInputs = calculation.inputs.filter(i => i.required && i.value === undefined);

      if (missingInputs.length > 0) {
        throw new Error(`Missing required inputs: ${missingInputs.map((i: any) => i.label).join(', ')}`);
      }

      let result: MedicalCalculation['result'];

      switch (calculation.name) {
        case 'eGFR (CKD-EPI)':
          result = calculateEGFR(calculation.inputs);
          break;
        case 'ASCVD Risk Calculator':
          result = calculateASCVDRisk(calculation.inputs);
          break;
        case 'BMI Calculator':
          result = calculateBMI(calculation.inputs);
          break;
        case 'HbA1c to Average Glucose':
          result = calculateAverageGlucose(calculation.inputs);
          break;
        default:
          throw new Error('Calculation not implemented');
      }

      // Update calculation with result
      setActiveCalculations(prev => prev.map(calc =>
        calc.id === calculationId ? { ...calc, result } : calc
      ));

      const completedCalculation = { ...calculation, result };
      options.onCalculationComplete?.(completedCalculation);

      return result;

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Calculation failed');
      options.onError?.(err);
      throw err;
    }
  }, [activeCalculations, options]);

  const searchMedicalReferences = useCallback(async (query: string, category?: string) => {
    try {
      const response = await fetch('/api/medical/references/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const results: MedicalReference[] = await response.json();
      setSearchResults(results);
      return results;

    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Search failed'));
      return [];
    }
  }, [options]);

  const getAvailableCalculators = useCallback(() => {
    return medicalCalculators.map(calc => ({
      name: calc.name,
      category: calc.category
    }));
  }, []);

  return {
    activeCalculations,
    createCalculation,
    updateCalculationInput,
    performCalculation,
    searchMedicalReferences,
    searchResults,
    references,
    getAvailableCalculators,
  };
}

// Helper calculation functions
function calculateEGFR(inputs: MedicalCalculation['inputs']) {
  const creatinine = inputs.find(i => i.id === 'creatinine')?.value as number;
  const age = inputs.find(i => i.id === 'age')?.value as number;
  const gender = inputs.find(i => i.id === 'gender')?.value as string;
  const race = inputs.find(i => i.id === 'race')?.value as string;

  const kappa = gender === 'Female' ? 0.7 : 0.9;
  const alpha = gender === 'Female' ? -0.329 : -0.411;
  const genderMultiplier = gender === 'Female' ? 1.018 : 1;
  const raceMultiplier = race === 'African American' ? 1.159 : 1;

  const eGFR = 141 * Math.min(creatinine / kappa, 1) ** alpha *
               Math.pow(Math.max(creatinine / kappa, 1), -1.209) *
               Math.pow(0.993, age) * genderMultiplier * raceMultiplier;

  let interpretation = '';
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (eGFR >= 90) {
    interpretation = 'Normal kidney function';
    riskLevel = 'low';
  } else if (eGFR >= 60) {
    interpretation = 'Mild decrease in kidney function';
    riskLevel = 'low';
  } else if (eGFR >= 30) {
    interpretation = 'Moderate decrease in kidney function';
    riskLevel = 'medium';
  } else if (eGFR >= 15) {
    interpretation = 'Severe decrease in kidney function';
    riskLevel = 'high';
  } else {
    interpretation = 'Kidney failure';
    riskLevel = 'critical';
  }

  return {
    value: Math.round(eGFR),
    unit: 'mL/min/1.73m²',
    interpretation,
    riskLevel,
    recommendations: eGFR < 60 ? [
      'Consider nephrology referral',
      'Monitor kidney function regularly',
      'Adjust medications for kidney function'
    ] : []
  };
}

function calculateASCVDRisk(inputs: MedicalCalculation['inputs']) {
  const age = inputs.find(i => i.id === 'age')?.value as number;
  const systolicBP = inputs.find(i => i.id === 'systolicBP')?.value as number;
  const totalCholesterol = inputs.find(i => i.id === 'totalCholesterol')?.value as number;
  const hdl = inputs.find(i => i.id === 'hdl')?.value as number;
  const diabetes = inputs.find(i => i.id === 'diabetes')?.value as boolean;
  const smoker = inputs.find(i => i.id === 'smoker')?.value as boolean;

  // Simplified ASCVD risk calculation (actual formula is more complex)
  let risk = (age - 40) * 0.5;
  risk += (totalCholesterol - 200) * 0.02;
  risk += (200 - hdl) * 0.05;
  if (systolicBP > 140) risk += 10;
  if (diabetes) risk += 15;
  if (smoker) risk += 10;

  risk = Math.max(0, Math.min(risk, 100)); // Cap between 0-100%

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (risk >= 20) riskLevel = 'high';
  else if (risk >= 7.5) riskLevel = 'medium';

  return {
    value: Math.round(risk * 10) / 10,
    unit: '%',
    interpretation: `${risk.toFixed(1)}% 10-year ASCVD risk`,
    riskLevel,
    recommendations: risk >= 7.5 ? [
      'Consider statin therapy',
      'Lifestyle modifications recommended',
      'Regular cardiovascular monitoring'
    ] : ['Continue lifestyle modifications']
  };
}

function calculateBMI(inputs: MedicalCalculation['inputs']) {
  const weight = inputs.find(i => i.id === 'weight')?.value as number;
  const height = inputs.find(i => i.id === 'height')?.value as number;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let interpretation = '';
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (bmi < 18.5) {
    interpretation = 'Underweight';
    riskLevel = 'medium';
  } else if (bmi < 25) {
    interpretation = 'Normal weight';
    riskLevel = 'low';
  } else if (bmi < 30) {
    interpretation = 'Overweight';
    riskLevel = 'medium';
  } else {
    interpretation = 'Obese';
    riskLevel = 'high';
  }

  return {
    value: Math.round(bmi * 10) / 10,
    unit: 'kg/m²',
    interpretation,
    riskLevel,
    recommendations: bmi >= 25 ? [
      'Consider weight management program',
      'Increase physical activity',
      'Nutritional counseling'
    ] : []
  };
}

function calculateAverageGlucose(inputs: MedicalCalculation['inputs']) {
  const hba1c = inputs.find(i => i.id === 'hba1c')?.value as number;

  // eAG = 28.7 × HbA1c − 46.7
  const avgGlucose = 28.7 * hba1c - 46.7;

  let interpretation = '';
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (hba1c < 5.7) {
    interpretation = 'Normal glucose metabolism';
    riskLevel = 'low';
  } else if (hba1c < 6.5) {
    interpretation = 'Prediabetes';
    riskLevel = 'medium';
  } else {
    interpretation = 'Diabetes range';
    riskLevel = 'high';
  }

  return {
    value: Math.round(avgGlucose),
    unit: 'mg/dL',
    interpretation,
    riskLevel,
    recommendations: hba1c >= 5.7 ? [
      'Consider diabetes screening',
      'Lifestyle modifications',
      'Regular glucose monitoring'
    ] : []
  };
}

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

export function useMedicalTools(options: UseMedicalToolsOptions = { /* TODO: implement */ }) {
  const [activeCalculations, setActiveCalculations] = useState<MedicalCalculation[]>([]);
  const [references, setReferences] = useState<MedicalReference[]>([]);
  const [searchResults, setSearchResults] = useState<MedicalReference[]>([]);

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

    setActiveCalculations(prev => prev.map(calc => {
      if (calc.id !== calculationId) return calc;

        input.id === inputId ? { ...input, value } : input
      );

      return { ...calc, inputs: updatedInputs };
    }));
  }, []);

    if (!calculation) {
      throw new Error('Calculation not found');
    }

    try {
      // Validate all required inputs are filled

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

      options.onCalculationComplete?.(completedCalculation);

      return result;

    } catch (error) {

      options.onError?.(err);
      throw err;
    }
  }, [activeCalculations, options]);

    try {

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

                Math.pow(Math.max(creatinine / kappa, 1), -1.209) *
                Math.pow(0.993, age) * genderMultiplier * raceMultiplier;

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
  // Simplified ASCVD risk calculation (actual formula is more complex)

  if (systolicBP > 140) risk += 10;
  if (diabetes) risk += 15;
  if (smoker) risk += 10;

  risk = Math.min(risk, 100); // Cap at 100%

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
/**
 * Meditron Demo Service
 * Provides demo responses when API key is not available
 */

export interface MeditronResponse {
  generated_text: string;
  model: string;
  latency: number;
  accuracy_score: number;
  medical_specialties: string[];
}

export interface MeditronTestResult {
  success: boolean;
  response?: MeditronResponse;
  error?: string;
  latency: number;
  demo_mode: boolean;
}

const DEMO_RESPONSES = {
  'meditron-7b': {
    'What is insulin?': `Insulin is a hormone produced by the pancreas that regulates blood glucose levels. It allows cells to absorb glucose from the bloodstream and use it for energy. In type 1 diabetes, the pancreas produces little or no insulin, while in type 2 diabetes, the body becomes resistant to insulin's effects.`,

    'What is diabetes?': `Diabetes is a group of metabolic disorders characterized by persistently high blood glucose levels (hyperglycemia). The two main types are Type 1 diabetes, where the pancreas fails to produce insulin, and Type 2 diabetes, where the body develops insulin resistance. Proper management includes medication, diet, and lifestyle modifications.`,

    'What are the symptoms of hypertension?': `Hypertension (high blood pressure) is often called the "silent killer" because it typically has no symptoms in early stages. When symptoms do occur, they may include headaches, shortness of breath, nosebleeds, chest pain, visual changes, and dizziness. Regular monitoring is essential for early detection.`,

    'Explain heart failure': `Heart failure is a condition where the heart cannot pump blood effectively to meet the body's needs. It can affect the left side, right side, or both sides of the heart. Symptoms include shortness of breath, fatigue, swelling in legs and ankles, and fluid retention. Treatment involves medications, lifestyle changes, and sometimes devices or surgery.`
  },

  'meditron-70b': {
    'What is insulin?': `Insulin is a critical peptide hormone secreted by beta cells in the pancreatic islets of Langerhans. It plays a fundamental role in glucose homeostasis by facilitating cellular glucose uptake, promoting glycogen synthesis in the liver and muscle, and inhibiting gluconeogenesis. Insulin deficiency or resistance leads to diabetes mellitus, requiring careful therapeutic management through exogenous insulin administration, oral hypoglycemic agents, or lifestyle interventions depending on the specific pathophysiology involved.`,

    'What is diabetes?': `Diabetes mellitus represents a heterogeneous group of metabolic disorders characterized by chronic hyperglycemia resulting from defects in insulin secretion, insulin action, or both. Type 1 diabetes involves autoimmune destruction of pancreatic beta cells, leading to absolute insulin deficiency. Type 2 diabetes is characterized by insulin resistance and relative insulin deficiency. Gestational diabetes occurs during pregnancy. Complications include diabetic retinopathy, nephropathy, neuropathy, and increased cardiovascular risk. Management requires a multidisciplinary approach including glycemic control, blood pressure management, lipid optimization, and regular screening for complications.`,

    'What are the symptoms of hypertension?': `Hypertension is predominantly asymptomatic in its early stages, earning the designation "silent killer." When symptoms manifest, they typically indicate target organ damage and may include occipital headaches, epistaxis, visual disturbances including scotomata or diplopia, dyspnea on exertion, chest pain, and neurological symptoms such as confusion or seizures in hypertensive emergencies. Physical examination may reveal arteriovenous nicking on fundoscopy, S4 gallop, or signs of left ventricular hypertrophy. Regular blood pressure monitoring remains the cornerstone of diagnosis and management.`,

    'Explain heart failure': `Heart failure is a complex clinical syndrome resulting from structural or functional cardiac abnormalities that impair ventricular filling or ejection. It can be classified by ejection fraction (preserved, reduced, or mid-range), by symptoms (NYHA Class I-IV), or by stage (AHA/ACC Stage A-D). Pathophysiology involves neurohormonal activation including the renin-angiotensin-aldosterone system and sympathetic nervous system. Clinical presentation includes dyspnea, orthopnea, paroxysmal nocturnal dyspnea, peripheral edema, and fatigue. Diagnostic evaluation includes echocardiography, BNP/NT-proBNP, and assessment for underlying etiology. Treatment follows evidence-based guidelines with ACE inhibitors/ARBs, beta-blockers, and mineralocorticoid receptor antagonists as foundational therapy.`
  }
};

export class MeditronDemoService {

  static async testModel(modelName: string, prompt: string): Promise<MeditronTestResult> {
    const startTime = Date.now();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    const latency = Date.now() - startTime;

    try {
      const modelResponses = DEMO_RESPONSES[modelName as keyof typeof DEMO_RESPONSES];

      if (!modelResponses) {
        return {
          success: false,
          error: `Demo responses not available for model: ${modelName}`,
          latency,
          demo_mode: true
        };
      }

      // Find the best matching response
      let responseText = '';
      const promptLower = prompt.toLowerCase();

      for (const [key, value] of Object.entries(modelResponses)) {
        if (promptLower.includes(key.toLowerCase().split(' ')[2]) || // Match key words
            promptLower.includes(key.toLowerCase().split(' ')[1])) {
          responseText = value;
          break;
        }
      }

      // Fallback to first response if no match
      if (!responseText) {
        responseText = Object.values(modelResponses)[0];
      }

      const response: MeditronResponse = {
        generated_text: `${prompt} ${responseText}`,
        model: modelName,
        latency,
        accuracy_score: modelName === 'meditron-70b' ? 95.0 : 92.0,
        medical_specialties: modelName === 'meditron-70b' ?
          ['general_medicine', 'clinical_reasoning', 'medical_qa', 'differential_diagnosis'] :
          ['general_medicine', 'clinical_reasoning', 'medical_qa']
      };

      return {
        success: true,
        response,
        latency,
        demo_mode: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in demo mode',
        latency,
        demo_mode: true
      };
    }
  }

  static async testAllModels(): Promise<Record<string, MeditronTestResult>> {
    const models = ['meditron-7b', 'meditron-70b'];
    const testPrompt = 'What is the primary function of insulin in the human body?';

    const results: Record<string, MeditronTestResult> = { /* TODO: implement */ };

    for (const model of models) {
      // Validate model to prevent object injection
      if (typeof model !== 'string' || model.length === 0) {
        continue;
      }
      // Use switch statement to avoid object injection
      switch (model) {
        case 'meditron-7b':
          results['meditron-7b'] = await this.testModel('meditron-7b', testPrompt);
          break;
        case 'meditron-70b':
          results['meditron-70b'] = await this.testModel('meditron-70b', testPrompt);
          break;
        default:
          // Skip unknown models
          break;
      }
    }

    return results;
  }

  static getDemoStatus(): { isDemoMode: boolean; reason: string } {
    return {
      isDemoMode: true,
      reason: 'Invalid or missing Hugging Face API key - running in demo mode'
    };
  }
}
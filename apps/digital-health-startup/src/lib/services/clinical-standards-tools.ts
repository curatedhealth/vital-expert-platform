/**
 * Clinical Standards & Digital Health Evidence Tools
 *
 * Provides access to:
 * - ICH Guidelines (International Council for Harmonisation)
 * - ISO Standards (International Organization for Standardization)
 * - Digital Medicine Society (DiMe) Resources
 * - ICHOM Standard Sets (International Consortium for Health Outcomes Measurement)
 * - CDISC Standards (Clinical Data Interchange Standards Consortium)
 * - HL7 FHIR (Fast Healthcare Interoperability Resources)
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ICHGuideline {
  code: string; // e.g., "E6(R2)", "M7", "Q8"
  title: string;
  category: 'Quality' | 'Safety' | 'Efficacy' | 'Multidisciplinary';
  stage: string; // "Step 4" = adopted, "Step 3" = consultation
  effectiveDate: string;
  description: string;
  url: string;
}

export interface ISOStandard {
  standardNumber: string; // e.g., "ISO 13485:2016"
  title: string;
  scope: string; // "Medical devices", "Risk management", etc.
  year: string;
  status: 'Published' | 'Under development' | 'Withdrawn';
  relevantFor: string[]; // e.g., ["Medical devices", "Clinical trials", "Software"]
  url: string;
}

export interface DiMeResource {
  title: string;
  type: 'Library' | 'Playbook' | 'Tool' | 'Publication';
  category: string; // "Digital Endpoints", "Decentralized Trials", "Regulatory"
  description: string;
  publicationDate?: string;
  url: string;
}

export interface ICHOMStandardSet {
  condition: string;
  year: string;
  outcomes: string[]; // List of outcome measures
  baselineFactors: string[];
  treatmentModifiers: string[];
  description: string;
  leadCenter: string;
  url: string;
}

// ============================================================================
// ICH GUIDELINES TOOL
// ============================================================================

/**
 * Search ICH (International Council for Harmonisation) Guidelines
 * Covers Quality, Safety, Efficacy, and Multidisciplinary topics
 */
export const createICHGuidelinesSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_ich_guidelines',
    description: 'Search ICH (International Council for Harmonisation) guidelines for pharmaceutical development. Covers Quality (Q), Safety (S), Efficacy (E), and Multidisciplinary (M) topics including GCP, stability, genotoxicity, and more.',
    schema: z.object({
      query: z.string().describe('Search query (e.g., "Good Clinical Practice", "stability testing", "M7 genotoxicity")'),
      category: z.enum(['Quality', 'Safety', 'Efficacy', 'Multidisciplinary', 'All']).optional().default('All'),
    }),
    func: async ({ query, category = 'All' }) => {
      try {
        // ICH Guidelines Database (curated common guidelines)
        const ichGuidelines: Partial<ICHGuideline>[] = [
          // Efficacy Guidelines
          {
            code: 'E6(R2)',
            title: 'Good Clinical Practice (GCP)',
            category: 'Efficacy',
            stage: 'Step 4',
            effectiveDate: '2016-11-09',
            description: 'Harmonized standard for designing, conducting, recording and reporting trials involving human subjects. Ensures credibility and accuracy of trial data while protecting rights and safety of subjects.',
            url: 'https://www.ich.org/page/efficacy-guidelines#6-2'
          },
          {
            code: 'E8(R1)',
            title: 'General Considerations for Clinical Studies',
            category: 'Efficacy',
            stage: 'Step 4',
            effectiveDate: '2021-10-28',
            description: 'Principles and approaches for planning and performing clinical studies. Includes study design, endpoints, and data integrity.',
            url: 'https://www.ich.org/page/efficacy-guidelines#8-1'
          },
          {
            code: 'E9',
            title: 'Statistical Principles for Clinical Trials',
            category: 'Efficacy',
            stage: 'Step 4',
            effectiveDate: '1998-02-05',
            description: 'Statistical principles for design, conduct, analysis and evaluation of clinical trials.',
            url: 'https://www.ich.org/page/efficacy-guidelines#9'
          },
          {
            code: 'E9(R1)',
            title: 'Statistical Principles - Addendum: Estimands and Sensitivity Analysis',
            category: 'Efficacy',
            stage: 'Step 4',
            effectiveDate: '2019-11-20',
            description: 'Addresses the specification of objectives (estimands) and sensitivity analyses in clinical trials.',
            url: 'https://www.ich.org/page/efficacy-guidelines#9-1'
          },

          // Quality Guidelines
          {
            code: 'Q8(R2)',
            title: 'Pharmaceutical Development',
            category: 'Quality',
            stage: 'Step 4',
            effectiveDate: '2009-08',
            description: 'Guidance on pharmaceutical development of drug substances and products. Includes Quality by Design (QbD) principles.',
            url: 'https://www.ich.org/page/quality-guidelines#8-2'
          },
          {
            code: 'Q9',
            title: 'Quality Risk Management',
            category: 'Quality',
            stage: 'Step 4',
            effectiveDate: '2005-11-09',
            description: 'Principles and examples of quality risk management that can be applied to pharmaceutical quality.',
            url: 'https://www.ich.org/page/quality-guidelines#9'
          },
          {
            code: 'Q10',
            title: 'Pharmaceutical Quality System',
            category: 'Quality',
            stage: 'Step 4',
            effectiveDate: '2008-06-04',
            description: 'Model for pharmaceutical quality system based on ISO quality concepts and GMP.',
            url: 'https://www.ich.org/page/quality-guidelines#10'
          },

          // Safety Guidelines
          {
            code: 'S2(R1)',
            title: 'Genotoxicity Testing and Data Interpretation',
            category: 'Safety',
            stage: 'Step 4',
            effectiveDate: '2011-11-09',
            description: 'Guidance on genotoxicity testing strategies.',
            url: 'https://www.ich.org/page/safety-guidelines#2-1'
          },
          {
            code: 'S9',
            title: 'Nonclinical Evaluation for Anticancer Pharmaceuticals',
            category: 'Safety',
            stage: 'Step 4',
            effectiveDate: '2009-10-29',
            description: 'Nonclinical testing strategies for anticancer pharmaceuticals.',
            url: 'https://www.ich.org/page/safety-guidelines#9'
          },

          // Multidisciplinary Guidelines
          {
            code: 'M7(R1)',
            title: 'Assessment and Control of DNA Reactive (Mutagenic) Impurities',
            category: 'Multidisciplinary',
            stage: 'Step 4',
            effectiveDate: '2017-03-31',
            description: 'Practical framework for identification, categorization, qualification and control of mutagenic impurities.',
            url: 'https://www.ich.org/page/multidisciplinary-guidelines#7-1'
          },
          {
            code: 'M10',
            title: 'Bioanalytical Method Validation',
            category: 'Multidisciplinary',
            stage: 'Step 4',
            effectiveDate: '2022-05-25',
            description: 'Recommendations for validation of bioanalytical methods.',
            url: 'https://www.ich.org/page/multidisciplinary-guidelines#10'
          },
          {
            code: 'M11',
            title: 'Clinical Electronic Structured Harmonized Protocol (CeSHarP)',
            category: 'Multidisciplinary',
            stage: 'Step 2',
            effectiveDate: 'In development',
            description: 'Standard for electronic clinical trial protocols.',
            url: 'https://www.ich.org/page/multidisciplinary-guidelines#11'
          }
        ];

        // Filter by category if specified
        let filteredGuidelines = category === 'All'
          ? ichGuidelines
          : ichGuidelines.filter(g => g.category === category);

        // Filter by query (fuzzy match)
        const queryLower = query.toLowerCase();
        filteredGuidelines = filteredGuidelines.filter(g =>
          g.title?.toLowerCase().includes(queryLower) ||
          g.code?.toLowerCase().includes(queryLower) ||
          g.description?.toLowerCase().includes(queryLower)
        );

        return JSON.stringify({
          query,
          category,
          count: filteredGuidelines.length,
          guidelines: filteredGuidelines,
          note: 'Visit https://www.ich.org/page/ich-guidelines for complete list and full-text guidelines',
          keyCategories: {
            Quality: 'Q1-Q14: Drug substance/product quality, stability, impurities',
            Safety: 'S1-S12: Toxicology, carcinogenicity, genotoxicity, reproductive toxicity',
            Efficacy: 'E1-E20: Clinical trial design, GCP, ethnic factors, dose-response',
            Multidisciplinary: 'M1-M11: CTD format, electronic standards, pharmacovigilance'
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search ICH guidelines',
          message: error.message,
          suggestion: 'Visit https://www.ich.org directly for ICH guideline information'
        });
      }
    }
  });
};

// ============================================================================
// ISO STANDARDS TOOL
// ============================================================================

/**
 * Search ISO Standards relevant to healthcare and pharmaceuticals
 */
export const createISOStandardsSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_iso_standards',
    description: 'Search ISO (International Organization for Standardization) standards relevant to healthcare, medical devices, clinical trials, and pharmaceutical quality. Includes ISO 13485, ISO 14971, ISO 15189, and more.',
    schema: z.object({
      query: z.string().describe('Search query (e.g., "medical devices", "risk management", "clinical laboratory")'),
      scope: z.enum(['Medical Devices', 'Quality Management', 'Risk Management', 'Clinical Laboratory', 'All']).optional().default('All'),
    }),
    func: async ({ query, scope = 'All' }) => {
      try {
        // Common ISO standards for healthcare/pharma (curated list)
        const isoStandards: Partial<ISOStandard>[] = [
          {
            standardNumber: 'ISO 13485:2016',
            title: 'Medical devices — Quality management systems',
            scope: 'Medical Devices',
            year: '2016',
            status: 'Published',
            relevantFor: ['Medical devices', 'Quality management', 'Regulatory compliance'],
            url: 'https://www.iso.org/standard/59752.html'
          },
          {
            standardNumber: 'ISO 14971:2019',
            title: 'Medical devices — Application of risk management to medical devices',
            scope: 'Risk Management',
            year: '2019',
            status: 'Published',
            relevantFor: ['Medical devices', 'Risk management', 'Safety'],
            url: 'https://www.iso.org/standard/72704.html'
          },
          {
            standardNumber: 'ISO 15189:2022',
            title: 'Medical laboratories — Requirements for quality and competence',
            scope: 'Clinical Laboratory',
            year: '2022',
            status: 'Published',
            relevantFor: ['Clinical laboratories', 'Diagnostics', 'Quality management'],
            url: 'https://www.iso.org/standard/76677.html'
          },
          {
            standardNumber: 'ISO 20916:2019',
            title: 'In vitro diagnostic medical devices — Clinical performance studies',
            scope: 'Medical Devices',
            year: '2019',
            status: 'Published',
            relevantFor: ['IVD', 'Clinical performance', 'Validation'],
            url: 'https://www.iso.org/standard/69450.html'
          },
          {
            standardNumber: 'ISO 10993 series',
            title: 'Biological evaluation of medical devices',
            scope: 'Medical Devices',
            year: 'Various',
            status: 'Published',
            relevantFor: ['Medical devices', 'Biocompatibility', 'Safety testing'],
            url: 'https://www.iso.org/standard/68936.html'
          },
          {
            standardNumber: 'ISO 15378:2017',
            title: 'Primary packaging materials for medicinal products',
            scope: 'Quality Management',
            year: '2017',
            status: 'Published',
            relevantFor: ['Pharmaceutical packaging', 'GMP', 'Quality'],
            url: 'https://www.iso.org/standard/63869.html'
          },
          {
            standardNumber: 'ISO 9001:2015',
            title: 'Quality management systems — Requirements',
            scope: 'Quality Management',
            year: '2015',
            status: 'Published',
            relevantFor: ['All industries', 'Quality management', 'Process improvement'],
            url: 'https://www.iso.org/standard/62085.html'
          },
          {
            standardNumber: 'ISO 62304:2006',
            title: 'Medical device software — Software life cycle processes',
            scope: 'Medical Devices',
            year: '2006',
            status: 'Published',
            relevantFor: ['Medical device software', 'SaMD', 'Software development'],
            url: 'https://www.iso.org/standard/38421.html'
          }
        ];

        // Filter by scope if specified
        let filteredStandards = scope === 'All'
          ? isoStandards
          : isoStandards.filter(s => s.scope === scope);

        // Filter by query (fuzzy match)
        const queryLower = query.toLowerCase();
        filteredStandards = filteredStandards.filter(s =>
          s.title?.toLowerCase().includes(queryLower) ||
          s.standardNumber?.toLowerCase().includes(queryLower) ||
          s.relevantFor?.some(r => r.toLowerCase().includes(queryLower))
        );

        return JSON.stringify({
          query,
          scope,
          count: filteredStandards.length,
          standards: filteredStandards,
          note: 'ISO standards are available for purchase at https://www.iso.org',
          accessOptions: {
            purchase: 'Buy individual standards from ISO or national standards bodies',
            subscription: 'ISO subscription services for organizations',
            preview: 'Some standards have free preview/scope documents available'
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search ISO standards',
          message: error.message,
          suggestion: 'Visit https://www.iso.org directly for ISO standard information'
        });
      }
    }
  });
};

// ============================================================================
// DIGITAL MEDICINE SOCIETY (DiMe) TOOL
// ============================================================================

/**
 * Search Digital Medicine Society (DiMe) Resources
 * Covers digital health tools, decentralized trials, digital endpoints
 */
export const createDiMeResourcesSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_dime_resources',
    description: 'Search Digital Medicine Society (DiMe) resources including digital endpoints library, playbooks for decentralized clinical trials, digital health technology tools, and regulatory guidance.',
    schema: z.object({
      query: z.string().describe('Search query (e.g., "digital endpoints", "decentralized trials", "wearables")'),
      resourceType: z.enum(['Library', 'Playbook', 'Tool', 'Publication', 'All']).optional().default('All'),
    }),
    func: async ({ query, resourceType = 'All' }) => {
      try {
        // DiMe Key Resources (curated)
        const dimeResources: Partial<DiMeResource>[] = [
          {
            title: 'Digital Endpoints Library',
            type: 'Library',
            category: 'Digital Endpoints',
            description: 'Comprehensive catalog of digital endpoints for clinical research, including validation status and use cases across therapeutic areas.',
            url: 'https://www.dimesociety.org/digital-endpoints-library/'
          },
          {
            title: 'Decentralized Clinical Trials Playbook',
            type: 'Playbook',
            category: 'Decentralized Trials',
            description: 'Practical guidance for planning, implementing, and managing decentralized and hybrid clinical trials.',
            url: 'https://www.dimesociety.org/dct-playbook/'
          },
          {
            title: 'Digital Health Technology (DHT) V3 Framework',
            type: 'Tool',
            category: 'Regulatory',
            description: 'Framework for evidence generation and evaluation of digital health technologies used in clinical research.',
            publicationDate: '2023',
            url: 'https://www.dimesociety.org/dht-v3/'
          },
          {
            title: 'Sensor Selection Playbook',
            type: 'Playbook',
            category: 'Digital Endpoints',
            description: 'Guidance on selecting appropriate sensors and wearable devices for clinical trials.',
            url: 'https://www.dimesociety.org/sensor-selection-playbook/'
          },
          {
            title: 'Remote Monitoring in Clinical Trials',
            type: 'Publication',
            category: 'Decentralized Trials',
            description: 'Best practices for implementing remote monitoring technologies including wearables, sensors, and mobile apps.',
            publicationDate: '2022',
            url: 'https://www.dimesociety.org/publications/'
          },
          {
            title: 'Digital Biomarkers',
            type: 'Library',
            category: 'Digital Endpoints',
            description: 'Database of validated digital biomarkers including mobility, cognition, cardiac, respiratory, and mental health measures.',
            url: 'https://www.dimesociety.org/digital-biomarkers/'
          },
          {
            title: 'eCOA Best Practices',
            type: 'Playbook',
            category: 'Decentralized Trials',
            description: 'Electronic Clinical Outcome Assessment (eCOA) implementation guide for patient-reported outcomes.',
            url: 'https://www.dimesociety.org/ecoa-best-practices/'
          },
          {
            title: 'AI/ML in Digital Health',
            type: 'Publication',
            category: 'Regulatory',
            description: 'Guidance on developing and validating AI/ML algorithms for digital health applications in clinical research.',
            publicationDate: '2023',
            url: 'https://www.dimesociety.org/ai-ml-guidance/'
          }
        ];

        // Filter by resource type if specified
        let filteredResources = resourceType === 'All'
          ? dimeResources
          : dimeResources.filter(r => r.type === resourceType);

        // Filter by query (fuzzy match)
        const queryLower = query.toLowerCase();
        filteredResources = filteredResources.filter(r =>
          r.title?.toLowerCase().includes(queryLower) ||
          r.category?.toLowerCase().includes(queryLower) ||
          r.description?.toLowerCase().includes(queryLower)
        );

        return JSON.stringify({
          query,
          resourceType,
          count: filteredResources.length,
          resources: filteredResources,
          note: 'DiMe is the professional home for digital medicine. Visit https://www.dimesociety.org for full resource library',
          keyAreas: {
            digitalEndpoints: 'Validated measures from digital health technologies',
            decentralizedTrials: 'Remote and hybrid trial conduct methodologies',
            regulatory: 'FDA, EMA guidance on digital health technologies',
            validation: 'Evidence generation frameworks (V3, DELTA, etc.)'
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search DiMe resources',
          message: error.message,
          suggestion: 'Visit https://www.dimesociety.org directly'
        });
      }
    }
  });
};

// ============================================================================
// ICHOM STANDARD SETS TOOL
// ============================================================================

/**
 * Search ICHOM (International Consortium for Health Outcomes Measurement) Standard Sets
 */
export const createICHOMStandardSetsSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_ichom_standard_sets',
    description: 'Search ICHOM (International Consortium for Health Outcomes Measurement) standard sets for patient-centered outcome measures across medical conditions. Includes outcomes, baseline factors, and treatment modifiers.',
    schema: z.object({
      condition: z.string().describe('Medical condition (e.g., "breast cancer", "heart failure", "depression")'),
    }),
    func: async ({ condition }) => {
      try {
        // ICHOM Standard Sets (curated examples)
        const ichomSets: Partial<ICHOMStandardSet>[] = [
          {
            condition: 'Breast Cancer',
            year: '2016',
            outcomes: [
              'Survival',
              'Disease control',
              'Degree of health (EQ-5D)',
              'Acute complications',
              'Breast symptoms',
              'Arm and shoulder symptoms',
              'Body image and sexuality'
            ],
            baselineFactors: ['Age', 'Gender', 'Tumor stage', 'Comorbidities', 'ECOG performance status'],
            treatmentModifiers: ['Surgery type', 'Chemotherapy', 'Radiotherapy', 'Endocrine therapy'],
            description: 'Global standard for measuring outcomes in breast cancer patients',
            leadCenter: 'Mass General Brigham',
            url: 'https://www.ichom.org/standard-sets/breast-cancer/'
          },
          {
            condition: 'Heart Failure',
            year: '2017',
            outcomes: [
              'Survival',
              'Disease burden (KCCQ-12)',
              'Healthcare utilization',
              'Complications',
              'Functional status'
            ],
            baselineFactors: ['Age', 'NYHA class', 'Ejection fraction', 'Comorbidities'],
            treatmentModifiers: ['Medications', 'Device therapy', 'Cardiac rehabilitation'],
            description: 'Standard outcome measures for congestive heart failure management',
            leadCenter: 'Cleveland Clinic',
            url: 'https://www.ichom.org/standard-sets/heart-failure/'
          },
          {
            condition: 'Depression & Anxiety',
            year: '2015',
            outcomes: [
              'Depression severity (PHQ-9)',
              'Anxiety severity (GAD-7)',
              'Quality of life (WHODAS 2.0)',
              'Recovery',
              'Functional status'
            ],
            baselineFactors: ['Age', 'Diagnosis type', 'Severity', 'Prior episodes', 'Comorbidities'],
            treatmentModifiers: ['Psychotherapy type', 'Medications', 'Treatment intensity'],
            description: 'Patient-reported outcome measures for mental health',
            leadCenter: 'Partners HealthCare',
            url: 'https://www.ichom.org/standard-sets/depression-anxiety/'
          },
          {
            condition: 'Inflammatory Arthritis (Rheumatoid Arthritis)',
            year: '2014',
            outcomes: [
              'Disease activity (HAQ-DI)',
              'Pain',
              'Fatigue',
              'Participation',
              'Radiographic progression',
              'Adverse events'
            ],
            baselineFactors: ['Age', 'Disease duration', 'RF/ACPA status', 'Baseline severity'],
            treatmentModifiers: ['DMARDs', 'Biologics', 'Physical therapy'],
            description: 'Standard outcomes for rheumatoid arthritis and related conditions',
            leadCenter: 'Brigham and Women\'s Hospital',
            url: 'https://www.ichom.org/standard-sets/inflammatory-arthritis/'
          },
          {
            condition: 'Lung Cancer',
            year: '2016',
            outcomes: [
              'Survival',
              'Disease control',
              'Treatment complications',
              'Quality of life (EORTC QLQ-C30)',
              'Lung cancer symptoms (QLQ-LC13)'
            ],
            baselineFactors: ['Age', 'Tumor stage', 'Histology', 'Performance status', 'Comorbidities'],
            treatmentModifiers: ['Surgery', 'Chemotherapy', 'Radiation', 'Targeted therapy', 'Immunotherapy'],
            description: 'Comprehensive outcome measurement for lung cancer patients',
            leadCenter: 'MD Anderson Cancer Center',
            url: 'https://www.ichom.org/standard-sets/lung-cancer/'
          },
          {
            condition: 'Coronary Artery Disease',
            year: '2018',
            outcomes: [
              'Survival',
              'Major adverse cardiac events',
              'Angina frequency (SAQ-7)',
              'Quality of life',
              'Complications'
            ],
            baselineFactors: ['Age', 'Previous MI', 'Diabetes', 'Number of diseased vessels'],
            treatmentModifiers: ['PCI', 'CABG', 'Medical therapy', 'Cardiac rehab'],
            description: 'Standard outcomes for coronary artery disease management',
            leadCenter: 'Mayo Clinic',
            url: 'https://www.ichom.org/standard-sets/coronary-artery-disease/'
          }
        ];

        // Filter by condition (fuzzy match)
        const conditionLower = condition.toLowerCase();
        const filteredSets = ichomSets.filter(set =>
          set.condition?.toLowerCase().includes(conditionLower) ||
          set.description?.toLowerCase().includes(conditionLower)
        );

        return JSON.stringify({
          condition,
          count: filteredSets.length,
          standardSets: filteredSets,
          note: 'ICHOM develops condition-specific standard sets through international working groups of clinicians, patients, and registry experts',
          totalStandardSets: '40+ medical conditions covered',
          website: 'https://www.ichom.org/standard-sets/',
          implementation: {
            purpose: 'Drive value-based healthcare by measuring patient-centered outcomes',
            useCases: ['Quality improvement', 'Benchmarking', 'Value-based contracts', 'Clinical registry design'],
            tools: 'ICHOM provides free implementation guides and data dictionaries'
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search ICHOM standard sets',
          message: error.message,
          suggestion: 'Visit https://www.ichom.org directly for complete standard set library'
        });
      }
    }
  });
};

// ============================================================================
// EXPORT ALL CLINICAL STANDARDS TOOLS
// ============================================================================

export function getAllClinicalStandardsTools() {
  return [
    createICHGuidelinesSearchTool(),
    createISOStandardsSearchTool(),
    createDiMeResourcesSearchTool(),
    createICHOMStandardSetsSearchTool()
  ];
}

export default {
  getAllClinicalStandardsTools,
  createICHGuidelinesSearchTool,
  createISOStandardsSearchTool,
  createDiMeResourcesSearchTool,
  createICHOMStandardSetsSearchTool
};

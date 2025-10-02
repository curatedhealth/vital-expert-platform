/**
 * Evidence-Based Model Performance Benchmarks
 *
 * This file contains validated benchmark results from published research,
 * official model cards, and industry-standard evaluations.
 *
 * All data is cited with sources for transparency and verification.
 */

import type { BenchmarkResult } from '../services/model-fitness-scorer';

/**
 * Model Benchmark Database
 *
 * Sources:
 * - OpenAI GPT-4 Technical Report: https://arxiv.org/abs/2303.08774
 * - Anthropic Claude 3 Model Card: https://www.anthropic.com/claude
 * - BioGPT Research Paper: https://doi.org/10.1093/bib/bbac409
 * - PubMedBERT Paper: https://arxiv.org/abs/2007.15779
 * - HumanEval Benchmark: https://github.com/openai/human-eval
 * - MMLU Benchmark: https://arxiv.org/abs/2009.03300
 */

export const MODEL_BENCHMARKS: Record<string, BenchmarkResult[]> = {
  // ========================================
  // OpenAI GPT-4
  // ========================================
  'gpt-4': [
    {
      benchmark_name: 'MMLU',
      score: 0.864,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2023,
      citation: 'OpenAI (2023). GPT-4 Technical Report',
      source_url: 'https://arxiv.org/abs/2303.08774'
    },
    {
      benchmark_name: 'MedQA (USMLE)',
      score: 0.867,
      metric: 'accuracy',
      dataset: 'Medical Question Answering (US Medical Licensing Exam)',
      year: 2023,
      citation: 'OpenAI (2023). GPT-4 Technical Report',
      source_url: 'https://arxiv.org/abs/2303.08774'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.67,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2023,
      citation: 'OpenAI (2023). GPT-4 Technical Report',
      source_url: 'https://arxiv.org/abs/2303.08774'
    },
    {
      benchmark_name: 'GSM8K',
      score: 0.92,
      metric: 'accuracy',
      dataset: 'Grade School Math 8K',
      year: 2023,
      citation: 'OpenAI (2023). GPT-4 Technical Report',
      source_url: 'https://arxiv.org/abs/2303.08774'
    }
  ],

  'gpt-4-turbo': [
    {
      benchmark_name: 'MMLU',
      score: 0.86,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2024,
      citation: 'OpenAI (2024). GPT-4 Turbo Technical Documentation',
      source_url: 'https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.69,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2024,
      citation: 'OpenAI (2024). GPT-4 Turbo Technical Documentation',
      source_url: 'https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4'
    }
  ],

  'gpt-3.5-turbo': [
    {
      benchmark_name: 'MMLU',
      score: 0.70,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2023,
      citation: 'OpenAI (2023). GPT-3.5 Model Documentation',
      source_url: 'https://platform.openai.com/docs/models/gpt-3-5-turbo'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.48,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2023,
      citation: 'OpenAI (2023). GPT-3.5 Model Documentation',
      source_url: 'https://platform.openai.com/docs/models/gpt-3-5-turbo'
    }
  ],

  // ========================================
  // Anthropic Claude 3
  // ========================================
  'claude-3-opus': [
    {
      benchmark_name: 'MMLU',
      score: 0.868,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    },
    {
      benchmark_name: 'GPQA',
      score: 0.596,
      metric: 'accuracy',
      dataset: 'Graduate-Level Google-Proof Q&A',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.845,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    },
    {
      benchmark_name: 'GSM8K',
      score: 0.951,
      metric: 'accuracy',
      dataset: 'Grade School Math 8K',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    }
  ],

  'claude-3-sonnet': [
    {
      benchmark_name: 'MMLU',
      score: 0.788,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.73,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    }
  ],

  'claude-3-haiku': [
    {
      benchmark_name: 'MMLU',
      score: 0.752,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.752,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2024,
      citation: 'Anthropic (2024). Claude 3 Model Card',
      source_url: 'https://www.anthropic.com/claude'
    }
  ],

  // ========================================
  // Medical/Biomedical Models
  // ========================================
  'microsoft/biogpt': [
    {
      benchmark_name: 'BC5CDR (Disease)',
      score: 0.849,
      metric: 'F1',
      dataset: 'BioCreative V Chemical-Disease Relation',
      year: 2022,
      citation: 'Luo et al. (2022). BioGPT: generative pre-trained transformer for biomedical text generation and mining',
      doi: '10.1093/bib/bbac409',
      source_url: 'https://academic.oup.com/bib/article/23/6/bbac409/6713511'
    },
    {
      benchmark_name: 'BC5CDR (Chemical)',
      score: 0.939,
      metric: 'F1',
      dataset: 'BioCreative V Chemical-Disease Relation',
      year: 2022,
      citation: 'Luo et al. (2022). BioGPT: generative pre-trained transformer for biomedical text generation and mining',
      doi: '10.1093/bib/bbac409',
      source_url: 'https://academic.oup.com/bib/article/23/6/bbac409/6713511'
    },
    {
      benchmark_name: 'KD-DTI',
      score: 0.721,
      metric: 'F1',
      dataset: 'Kinase-Drug Target Interaction',
      year: 2022,
      citation: 'Luo et al. (2022). BioGPT',
      doi: '10.1093/bib/bbac409',
      source_url: 'https://academic.oup.com/bib/article/23/6/bbac409/6713511'
    },
    {
      benchmark_name: 'PubMedQA',
      score: 0.812,
      metric: 'accuracy',
      dataset: 'PubMed Question Answering',
      year: 2022,
      citation: 'Luo et al. (2022). BioGPT',
      doi: '10.1093/bib/bbac409',
      source_url: 'https://academic.oup.com/bib/article/23/6/bbac409/6713511'
    }
  ],

  'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext': [
    {
      benchmark_name: 'BLURB (Avg)',
      score: 0.813,
      metric: 'average score',
      dataset: 'Biomedical Language Understanding and Reasoning Benchmark',
      year: 2020,
      citation: 'Gu et al. (2020). Domain-Specific Language Model Pretraining for Biomedical NLP',
      source_url: 'https://arxiv.org/abs/2007.15779'
    },
    {
      benchmark_name: 'BC5CDR-disease',
      score: 0.858,
      metric: 'F1',
      dataset: 'BioCreative V Chemical-Disease Relation',
      year: 2020,
      citation: 'Gu et al. (2020). PubMedBERT',
      source_url: 'https://arxiv.org/abs/2007.15779'
    },
    {
      benchmark_name: 'ChemProt',
      score: 0.772,
      metric: 'F1',
      dataset: 'Chemical-Protein Interaction',
      year: 2020,
      citation: 'Gu et al. (2020). PubMedBERT',
      source_url: 'https://arxiv.org/abs/2007.15779'
    }
  ],

  'emilyalsentzer/Bio_ClinicalBERT': [
    {
      benchmark_name: 'i2b2 2010',
      score: 0.90,
      metric: 'F1',
      dataset: 'i2b2/VA 2010 Medical Concepts',
      year: 2019,
      citation: 'Alsentzer et al. (2019). Publicly Available Clinical BERT Embeddings',
      source_url: 'https://arxiv.org/abs/1904.03323'
    },
    {
      benchmark_name: 'i2b2 2012',
      score: 0.884,
      metric: 'F1',
      dataset: 'i2b2 2012 Temporal Relations',
      year: 2019,
      citation: 'Alsentzer et al. (2019). ClinicalBERT',
      source_url: 'https://arxiv.org/abs/1904.03323'
    }
  ],

  // ========================================
  // Code Generation Models
  // ========================================
  'codellama/CodeLlama-34b-Instruct-hf': [
    {
      benchmark_name: 'HumanEval',
      score: 0.48,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2023,
      citation: 'Meta (2023). Code Llama: Open Foundation Models for Code',
      source_url: 'https://arxiv.org/abs/2308.12950'
    },
    {
      benchmark_name: 'MBPP',
      score: 0.56,
      metric: 'pass@1',
      dataset: 'Mostly Basic Python Problems',
      year: 2023,
      citation: 'Meta (2023). Code Llama',
      source_url: 'https://arxiv.org/abs/2308.12950'
    }
  ],

  // ========================================
  // Open Source Models
  // ========================================
  'meta-llama/Llama-2-70b-chat-hf': [
    {
      benchmark_name: 'MMLU',
      score: 0.689,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2023,
      citation: 'Touvron et al. (2023). Llama 2: Open Foundation and Fine-Tuned Chat Models',
      source_url: 'https://arxiv.org/abs/2307.09288'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.29,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2023,
      citation: 'Meta (2023). Llama 2',
      source_url: 'https://arxiv.org/abs/2307.09288'
    }
  ],

  'mistralai/Mistral-7B-Instruct-v0.2': [
    {
      benchmark_name: 'MMLU',
      score: 0.606,
      metric: 'accuracy',
      dataset: 'Massive Multitask Language Understanding',
      year: 2023,
      citation: 'Mistral AI (2023). Mistral 7B Technical Report',
      source_url: 'https://mistral.ai/news/announcing-mistral-7b/'
    },
    {
      benchmark_name: 'HumanEval',
      score: 0.40,
      metric: 'pass@1',
      dataset: 'Python code generation benchmark',
      year: 2023,
      citation: 'Mistral AI (2023). Mistral 7B',
      source_url: 'https://mistral.ai/news/announcing-mistral-7b/'
    }
  ]
};

/**
 * Model Citations and Official Documentation
 */
export const MODEL_CITATIONS: Record<string, {
  model_card?: string;
  technical_report?: string;
  papers?: string[];
  homepage?: string;
}> = {
  'gpt-4': {
    model_card: 'https://platform.openai.com/docs/models/gpt-4',
    technical_report: 'https://arxiv.org/abs/2303.08774',
    papers: ['https://arxiv.org/abs/2303.08774'],
    homepage: 'https://openai.com/gpt-4'
  },
  'gpt-4-turbo': {
    model_card: 'https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4',
    homepage: 'https://openai.com/gpt-4'
  },
  'gpt-3.5-turbo': {
    model_card: 'https://platform.openai.com/docs/models/gpt-3-5-turbo',
    homepage: 'https://openai.com/'
  },
  'claude-3-opus': {
    model_card: 'https://www.anthropic.com/claude',
    technical_report: 'https://www.anthropic.com/news/claude-3-family',
    homepage: 'https://www.anthropic.com'
  },
  'claude-3-sonnet': {
    model_card: 'https://www.anthropic.com/claude',
    technical_report: 'https://www.anthropic.com/news/claude-3-family',
    homepage: 'https://www.anthropic.com'
  },
  'claude-3-haiku': {
    model_card: 'https://www.anthropic.com/claude',
    technical_report: 'https://www.anthropic.com/news/claude-3-family',
    homepage: 'https://www.anthropic.com'
  },
  'microsoft/biogpt': {
    papers: ['https://academic.oup.com/bib/article/23/6/bbac409/6713511'],
    homepage: 'https://github.com/microsoft/BioGPT'
  },
  'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext': {
    papers: ['https://arxiv.org/abs/2007.15779'],
    homepage: 'https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext'
  },
  'emilyalsentzer/Bio_ClinicalBERT': {
    papers: ['https://arxiv.org/abs/1904.03323'],
    homepage: 'https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT'
  },
  'codellama/CodeLlama-34b-Instruct-hf': {
    papers: ['https://arxiv.org/abs/2308.12950'],
    homepage: 'https://github.com/facebookresearch/codellama'
  },
  'meta-llama/Llama-2-70b-chat-hf': {
    papers: ['https://arxiv.org/abs/2307.09288'],
    homepage: 'https://llama.meta.com/'
  },
  'mistralai/Mistral-7B-Instruct-v0.2': {
    homepage: 'https://mistral.ai/news/announcing-mistral-7b/'
  }
};

/**
 * Get benchmarks for a specific model
 */
export function getModelBenchmarks(modelId: string): BenchmarkResult[] {
  return MODEL_BENCHMARKS[modelId] || [];
}

/**
 * Get citations for a specific model
 */
export function getModelCitations(modelId: string) {
  return MODEL_CITATIONS[modelId] || {};
}

/**
 * Get relevant benchmarks for an agent profile
 */
export function getRelevantBenchmarks(agentProfile: {
  requiresMedicalKnowledge?: boolean;
  requiresCodeGeneration?: boolean;
  requiresHighAccuracy?: boolean;
}): string[] {
  const relevant: string[] = [];

  if (agentProfile.requiresMedicalKnowledge) {
    relevant.push('MedQA (USMLE)', 'PubMedQA', 'BC5CDR', 'BLURB', 'i2b2 2010');
  }

  if (agentProfile.requiresCodeGeneration) {
    relevant.push('HumanEval', 'MBPP');
  }

  if (agentProfile.requiresHighAccuracy) {
    relevant.push('MMLU', 'GPQA', 'GSM8K');
  }

  // General benchmarks always relevant
  if (relevant.length === 0) {
    relevant.push('MMLU');
  }

  return relevant;
}

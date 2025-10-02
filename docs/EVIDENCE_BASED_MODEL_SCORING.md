# Evidence-Based LLM Model Scoring & Recommendations

## Overview

The VITAL Path platform uses an evidence-based approach to LLM model selection, grounding all recommendations in published research, validated benchmarks, and official model documentation. This document explains the methodology, data sources, and how to interpret the evidence provided.

## Table of Contents

1. [Methodology](#methodology)
2. [Benchmark Data Sources](#benchmark-data-sources)
3. [Citation Standards](#citation-standards)
4. [Model Performance Database](#model-performance-database)
5. [Evidence-Based Recommendations](#evidence-based-recommendations)
6. [How to Verify Claims](#how-to-verify-claims)
7. [Limitations & Caveats](#limitations--caveats)

---

## Methodology

### Scoring Approach

The system uses a **6-dimensional weighted scoring** algorithm:

| Dimension | Weight | Evidence Source |
|-----------|--------|----------------|
| Role Match | 25% | Model capabilities + domain benchmarks |
| Capability Match | 25% | Technical specifications + benchmark performance |
| Performance Match | 15% | Published accuracy metrics (MMLU, MedQA, etc.) |
| Cost Efficiency | 10% | Official pricing + performance-per-dollar analysis |
| Context Size Match | 15% | Technical specifications + agent requirements |
| Compliance Match | 10% | Official compliance documentation |

### Data Quality Standards

All benchmark data must meet these criteria:

✅ **Published in peer-reviewed journals** OR
✅ **Official model cards from providers** OR
✅ **Industry-standard benchmark leaderboards**

❌ **NO** unverified claims
❌ **NO** marketing materials without citations
❌ **NO** anecdotal evidence

---

## Benchmark Data Sources

### Medical/Biomedical Benchmarks

#### MedQA (USMLE)
- **What it measures**: Medical knowledge and clinical reasoning
- **Dataset**: US Medical Licensing Exam questions
- **Citation**: Jin et al. (2021). "What Disease does this Patient Have? A Large-scale Open Domain Question Answering Dataset from Medical Exams"
- **Why it matters**: Passing threshold is ~60%. Models scoring 85%+ demonstrate physician-level medical knowledge.

**Model Performance**:
```
GPT-4:        86.7% ✅ (OpenAI Technical Report, 2023)
GPT-3.5:      ~50%  ⚠️  (Estimated from MMLU medical subset)
```

#### BC5CDR (BioCreative V)
- **What it measures**: Biomedical named entity recognition
- **Dataset**: Chemical-Disease Relation extraction from PubMed
- **Citation**: Li et al. (2016). "BioCreative V CDR task corpus"
- **Why it matters**: Tests ability to extract medical entities from scientific literature.

**Model Performance**:
```
BioGPT:       F1 0.849 (Disease), F1 0.939 (Chemical) ✅
              Luo et al. (2022), DOI:10.1093/bib/bbac409
PubMedBERT:   F1 0.858 (Disease) ✅
              Gu et al. (2020), arXiv:2007.15779
```

#### PubMedQA
- **What it measures**: Question answering on biomedical research
- **Dataset**: Questions from PubMed abstract conclusions
- **Citation**: Jin et al. (2019). "PubMedQA: A Dataset for Biomedical Research Question Answering"
- **Why it matters**: Tests scientific reasoning and comprehension of medical research.

**Model Performance**:
```
BioGPT:       81.2% accuracy ✅
              Luo et al. (2022), DOI:10.1093/bib/bbac409
```

### Code Generation Benchmarks

#### HumanEval
- **What it measures**: Python code generation from docstrings
- **Dataset**: 164 hand-written programming problems
- **Citation**: Chen et al. (2021). "Evaluating Large Language Models Trained on Code"
- **Why it matters**: Industry standard for code generation capability.

**Model Performance**:
```
Claude 3 Opus:     84.5% pass@1 ✅ (Anthropic Model Card, 2024)
GPT-4:             67.0% pass@1 ✅ (OpenAI Technical Report, 2023)
GPT-4 Turbo:       69.0% pass@1 ✅ (OpenAI Documentation, 2024)
GPT-3.5 Turbo:     48.0% pass@1 ⚠️  (OpenAI Documentation, 2023)
CodeLlama 34B:     48.0% pass@1 ⚠️  (Meta, 2023)
```

#### MBPP (Mostly Basic Python Problems)
- **What it measures**: Basic Python programming tasks
- **Dataset**: 974 crowd-sourced Python programming problems
- **Citation**: Austin et al. (2021). "Program Synthesis with Large Language Models"
- **Why it matters**: Tests practical programming ability.

**Model Performance**:
```
CodeLlama 34B:     56.0% pass@1 (Meta, 2023)
```

### General Knowledge & Reasoning Benchmarks

#### MMLU (Massive Multitask Language Understanding)
- **What it measures**: Multi-domain knowledge across 57 subjects
- **Dataset**: Exam questions from STEM, humanities, social sciences, etc.
- **Citation**: Hendrycks et al. (2021). "Measuring Massive Multitask Language Understanding"
- **Why it matters**: Comprehensive test of general intelligence and domain expertise.

**Model Performance**:
```
Claude 3 Opus:     86.8% ✅ (Anthropic Model Card, 2024)
GPT-4:             86.4% ✅ (OpenAI Technical Report, 2023)
GPT-4 Turbo:       86.0% ✅ (OpenAI Documentation, 2024)
Claude 3 Sonnet:   78.8% ✅ (Anthropic Model Card, 2024)
Claude 3 Haiku:    75.2% ✅ (Anthropic Model Card, 2024)
GPT-3.5 Turbo:     70.0% ⚠️  (OpenAI Documentation, 2023)
Llama 2 70B:       68.9% ⚠️  (Meta, 2023)
Mistral 7B:        60.6% ⚠️  (Mistral AI, 2023)
```

#### GSM8K (Grade School Math 8K)
- **What it measures**: Mathematical reasoning and problem-solving
- **Dataset**: 8,500 grade-school level math problems
- **Citation**: Cobbe et al. (2021). "Training Verifiers to Solve Math Word Problems"
- **Why it matters**: Tests logical reasoning and computational accuracy.

**Model Performance**:
```
Claude 3 Opus:     95.1% ✅ (Anthropic Model Card, 2024)
GPT-4:             92.0% ✅ (OpenAI Technical Report, 2023)
```

#### GPQA (Graduate-Level Google-Proof Q&A)
- **What it measures**: Expert-level reasoning on graduate-level questions
- **Dataset**: Questions requiring graduate-level expertise
- **Citation**: Rein et al. (2023). "GPQA: A Graduate-Level Google-Proof Q&A Benchmark"
- **Why it matters**: Tests true expert-level understanding.

**Model Performance**:
```
Claude 3 Opus:     59.6% (Anthropic Model Card, 2024)
```

---

## Citation Standards

### Required Citation Elements

Every benchmark claim includes:

1. **Benchmark Name**: Official benchmark identifier
2. **Score**: Numerical result with metric (accuracy, F1, pass@1, etc.)
3. **Dataset**: Specific dataset used
4. **Year**: Publication or evaluation year
5. **Citation**: Full citation or DOI
6. **Source URL**: Link to verify the claim

### Example Citation Format

```typescript
{
  benchmark_name: 'MedQA (USMLE)',
  score: 0.867,
  metric: 'accuracy',
  dataset: 'Medical Question Answering (US Medical Licensing Exam)',
  year: 2023,
  citation: 'OpenAI (2023). GPT-4 Technical Report',
  source_url: 'https://arxiv.org/abs/2303.08774'
}
```

---

## Model Performance Database

### Data Structure

All benchmark data is stored in [`/src/lib/data/model-benchmarks.ts`](../src/lib/data/model-benchmarks.ts)

```typescript
export const MODEL_BENCHMARKS: Record<string, BenchmarkResult[]> = {
  'gpt-4': [
    {
      benchmark_name: 'MedQA (USMLE)',
      score: 0.867,
      metric: 'accuracy',
      dataset: 'Medical Question Answering (US Medical Licensing Exam)',
      year: 2023,
      citation: 'OpenAI (2023). GPT-4 Technical Report',
      source_url: 'https://arxiv.org/abs/2303.08774'
    },
    // ... more benchmarks
  ],
  'microsoft/biogpt': [ /* ... */ ],
  // ... more models
};
```

### Model Citations

Official documentation and research papers:

```typescript
export const MODEL_CITATIONS: Record<string, {
  model_card?: string;
  technical_report?: string;
  papers?: string[];
}> = {
  'gpt-4': {
    model_card: 'https://platform.openai.com/docs/models/gpt-4',
    technical_report: 'https://arxiv.org/abs/2303.08774',
    papers: ['https://arxiv.org/abs/2303.08774']
  },
  // ... more models
};
```

---

## Evidence-Based Recommendations

### Recommendation Format

When the system suggests alternative models, it provides:

```typescript
{
  name: 'BioGPT',
  reason: 'Specialized biomedical language model pre-trained on PubMed abstracts. Achieves state-of-the-art performance on biomedical NER and relation extraction tasks.',
  benchmarks: [
    {
      benchmark_name: 'BC5CDR (Disease)',
      score: 0.849,
      metric: 'F1',
      citation: 'Luo et al. (2022). BioGPT',
      doi: '10.1093/bib/bbac409'
    }
  ],
  citations: [
    'https://academic.oup.com/bib/article/23/6/bbac409/6713511'
  ]
}
```

### Example: Medical Writer Agent + GPT-3.5 Turbo

**Current Model**: GPT-3.5 Turbo
**Score**: 62/100 (Acceptable)

**Evidence-Based Recommendations**:

#### 1. BioGPT
**Reason**: Specialized biomedical language model pre-trained on PubMed abstracts.

**Evidence**:
- BC5CDR (Disease): F1 0.849
- BC5CDR (Chemical): F1 0.939
- PubMedQA: 81.2% accuracy
- **Citation**: Luo et al. (2022). "BioGPT: generative pre-trained transformer for biomedical text generation and mining". *Briefings in Bioinformatics*, 23(6). DOI:10.1093/bib/bbac409

#### 2. GPT-4
**Reason**: Achieves 86.7% accuracy on MedQA (USMLE), exceeding the passing threshold for US Medical Licensing Exam.

**Evidence**:
- MedQA (USMLE): 86.7% accuracy
- MMLU: 86.4% accuracy
- **Citation**: OpenAI (2023). "GPT-4 Technical Report". arXiv:2303.08774

#### 3. PubMedBERT
**Reason**: Domain-specific BERT model trained on PubMed abstracts and full-text articles.

**Evidence**:
- BLURB (Avg): 81.3% average score
- BC5CDR-disease: F1 0.858
- ChemProt: F1 0.772
- **Citation**: Gu et al. (2020). "Domain-Specific Language Model Pretraining for Biomedical NLP". arXiv:2007.15779

---

## How to Verify Claims

### Step 1: Check the Source URL

Every claim includes a `source_url` field linking to the original publication or documentation.

### Step 2: Verify with DOI

If a DOI is provided, use it to find the peer-reviewed publication:
```
https://doi.org/10.1093/bib/bbac409
```

### Step 3: Cross-Reference with Model Cards

Official model cards provide verified performance data:
- OpenAI: https://platform.openai.com/docs/models
- Anthropic: https://www.anthropic.com/claude
- Hugging Face: https://huggingface.co/{model-id}

### Step 4: Check Benchmark Leaderboards

Public leaderboards track official results:
- MMLU: https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu
- HumanEval: https://paperswithcode.com/sota/code-generation-on-humaneval
- MedQA: https://paperswithcode.com/dataset/medqa-usmle

---

## Limitations & Caveats

### 1. Benchmark Performance ≠ Real-World Performance

Benchmarks are **proxies** for real-world capability, not perfect predictors. Consider:

- **Domain shift**: Benchmarks may not match your exact use case
- **Prompt engineering**: Performance varies significantly with prompt design
- **Task complexity**: Benchmarks test specific scenarios, not all edge cases

### 2. Benchmark Recency

Model performance improves over time with:
- Fine-tuning updates
- Instruction-following improvements
- Context window expansions

**Solution**: Check the `year` field in benchmark data and prefer recent evaluations.

### 3. Missing Benchmarks

Not all models have been evaluated on all benchmarks. Absence of data doesn't mean poor performance.

### 4. Benchmark Gaming

Some models may be optimized specifically for common benchmarks. Look for:

- **Multiple benchmarks**: Cross-validate across different tests
- **Held-out test sets**: Prefer evaluations on unseen data
- **Independent evaluations**: Third-party benchmarks are more trustworthy

### 5. Cost-Performance Trade-offs

Higher benchmark scores often come with:
- Higher API costs
- Slower inference times
- Larger context requirements

**Solution**: Consider the `cost_per_query` and `average_response_time` alongside accuracy.

---

## Research Paper References

### Model Papers

1. **GPT-4**: OpenAI (2023). "GPT-4 Technical Report". arXiv:2303.08774
   https://arxiv.org/abs/2303.08774

2. **Claude 3**: Anthropic (2024). "Claude 3 Model Card"
   https://www.anthropic.com/claude

3. **BioGPT**: Luo et al. (2022). "BioGPT: generative pre-trained transformer for biomedical text generation and mining". *Briefings in Bioinformatics*, 23(6). DOI:10.1093/bib/bbac409
   https://academic.oup.com/bib/article/23/6/bbac409/6713511

4. **PubMedBERT**: Gu et al. (2020). "Domain-Specific Language Model Pretraining for Biomedical NLP". arXiv:2007.15779
   https://arxiv.org/abs/2007.15779

5. **ClinicalBERT**: Alsentzer et al. (2019). "Publicly Available Clinical BERT Embeddings". arXiv:1904.03323
   https://arxiv.org/abs/1904.03323

6. **CodeLlama**: Meta (2023). "Code Llama: Open Foundation Models for Code". arXiv:2308.12950
   https://arxiv.org/abs/2308.12950

7. **Llama 2**: Touvron et al. (2023). "Llama 2: Open Foundation and Fine-Tuned Chat Models". arXiv:2307.09288
   https://arxiv.org/abs/2307.09288

### Benchmark Papers

1. **MMLU**: Hendrycks et al. (2021). "Measuring Massive Multitask Language Understanding". ICLR 2021
   https://arxiv.org/abs/2009.03300

2. **HumanEval**: Chen et al. (2021). "Evaluating Large Language Models Trained on Code". arXiv:2107.03374
   https://arxiv.org/abs/2107.03374

3. **MedQA**: Jin et al. (2021). "What Disease does this Patient Have? A Large-scale Open Domain Question Answering Dataset from Medical Exams". Applied Sciences, 11(14)
   https://www.mdpi.com/2076-3417/11/14/6421

4. **GSM8K**: Cobbe et al. (2021). "Training Verifiers to Solve Math Word Problems". arXiv:2110.14168
   https://arxiv.org/abs/2110.14168

5. **GPQA**: Rein et al. (2023). "GPQA: A Graduate-Level Google-Proof Q&A Benchmark". arXiv:2311.12022
   https://arxiv.org/abs/2311.12022

---

## Contributing Benchmark Data

To add new benchmark data:

1. **Find validated source** (peer-reviewed paper, official model card, or verified leaderboard)
2. **Extract citation details** (benchmark name, score, metric, year, DOI/URL)
3. **Add to `/src/lib/data/model-benchmarks.ts`**
4. **Follow the citation format**:

```typescript
{
  benchmark_name: 'Benchmark Name',
  score: 0.XX,
  metric: 'accuracy|F1|pass@1|etc.',
  dataset: 'Dataset description',
  year: 2024,
  citation: 'Author et al. (Year). Title',
  doi: 'DOI if available',
  source_url: 'https://...'
}
```

5. **Submit PR with verification** links

---

## Questions & Support

**Q: How often is benchmark data updated?**
A: We update benchmark data quarterly and when major model releases occur.

**Q: Can I request a specific benchmark?**
A: Yes! Open an issue with the benchmark details and citation.

**Q: What if I find incorrect data?**
A: Please report via GitHub issue with the correct citation and evidence.

**Q: Why isn't model X included?**
A: We only include models with publicly available benchmark results and citations. Submit a PR with validated data to add a model.

---

## License & Attribution

All benchmark data is cited from publicly available sources. Original research papers and benchmarks are subject to their respective licenses. This documentation synthesizes public information for educational and research purposes.

When using this data, please cite the original sources provided in the benchmark references.

/**
 * Knowledge Domain Detector
 *
 * Automatically detects relevant knowledge domains from user queries using:
 * 1. Regex pattern matching (fast, ~10ms)
 * 2. RAG semantic search (fallback, ~150ms)
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { OpenAIEmbeddings } from '@langchain/openai';

interface DomainPattern {
  domains: string[];
  pattern: RegExp;
  priority: number;
}

export class KnowledgeDomainDetector {
  private static instance: KnowledgeDomainDetector;
  private embeddings: OpenAIEmbeddings;
  private domainPatterns: DomainPattern[] = [];

  private constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'text-embedding-3-large',
    });

    this.initializePatterns();
  }

  static getInstance(): KnowledgeDomainDetector {
    if (!KnowledgeDomainDetector.instance) {
      KnowledgeDomainDetector.instance = new KnowledgeDomainDetector();
    }
    return KnowledgeDomainDetector.instance;
  }

  /**
   * Initialize regex patterns for fast domain detection
   */
  private initializePatterns(): void {
    this.domainPatterns = [
      // Tier 1: Core Domains (High Priority)
      {
        domains: ['regulatory_affairs'],
        pattern: /\b(fda|ema|regulatory|510k|pma|submission|approval|compliance|ich|guideline|cfr|21 cfr|part 11|regulatory pathway|pre-market|post-market|inspection|warning letter)\b/i,
        priority: 1,
      },
      {
        domains: ['clinical_development'],
        pattern: /\b(clinical trial|protocol|study design|cro|investigator|irb|ethics committee|informed consent|adverse event|sae|phase [1-4]|enrollment|endpoint|placebo|randomization|blinding)\b/i,
        priority: 1,
      },
      {
        domains: ['pharmacovigilance'],
        pattern: /\b(safety|adverse event|side effect|pharmacovigilance|risk management|signal detection|icsr|psur|pbrer|rems|product label|boxed warning|contraindication)\b/i,
        priority: 1,
      },
      {
        domains: ['quality_assurance'],
        pattern: /\b(gmp|quality control|quality assurance|validation|deviation|capa|audit|inspection|batch record|manufacturing|process validation|cleaning validation|equipment qualification)\b/i,
        priority: 1,
      },
      {
        domains: ['medical_affairs'],
        pattern: /\b(medical information|scientific communication|publication|congress|kol|speaker|medical science liaison|evidence generation|real world evidence|health economics|market access)\b/i,
        priority: 1,
      },
      {
        domains: ['drug_safety'],
        pattern: /\b(drug safety|adr|adverse drug reaction|safety surveillance|risk benefit|safety signal|causality assessment|pregnancy exposure|lactation|pediatric safety)\b/i,
        priority: 1,
      },
      {
        domains: ['clinical_operations'],
        pattern: /\b(site selection|site monitoring|data management|clinical data|eCRF|EDC|ctms|clinical supply|patient recruitment|retention|protocol deviation|study closure)\b/i,
        priority: 1,
      },
      {
        domains: ['medical_writing'],
        pattern: /\b(clinical study report|csr|investigator brochure|protocol writing|informed consent|regulatory document|medical writing|technical writing|csb|briefing document)\b/i,
        priority: 1,
      },
      {
        domains: ['biostatistics'],
        pattern: /\b(statistical analysis|sample size|power analysis|biostatistics|sap|statistical methods|interim analysis|survival analysis|subgroup analysis|multiplicity|p-value)\b/i,
        priority: 1,
      },
      {
        domains: ['data_management'],
        pattern: /\b(clinical data management|cdm|data cleaning|query management|database lock|data validation|sdtm|adam|cdisc|data standards|data review)\b/i,
        priority: 1,
      },

      // Tier 2: Specialized Domains
      {
        domains: ['scientific_publications'],
        pattern: /\b(manuscript|publication|journal|peer review|authorship|abstract|poster|case report|systematic review|meta-analysis|literature search)\b/i,
        priority: 2,
      },
      {
        domains: ['nonclinical_sciences'],
        pattern: /\b(preclinical|toxicology|pharmacology|in vitro|in vivo|animal study|genotoxicity|carcinogenicity|reproductive toxicity|pk\/pd|adme)\b/i,
        priority: 2,
      },
      {
        domains: ['risk_management'],
        pattern: /\b(risk assessment|risk mitigation|risk management plan|rmp|benefit-risk|safety specification|pharmacovigilance plan|risk minimization|effectiveness evaluation)\b/i,
        priority: 2,
      },
      {
        domains: ['submissions_and_filings'],
        pattern: /\b(ind|nda|bla|maa|dossier|ctd|ectd|module [1-5]|regulatory submission|filing|application|expedited review|breakthrough therapy|orphan drug)\b/i,
        priority: 2,
      },
      {
        domains: ['health_economics'],
        pattern: /\b(heor|health economics|outcomes research|cost effectiveness|qaly|icer|budget impact|value dossier|pricing|reimbursement|hta|health technology assessment)\b/i,
        priority: 2,
      },
      {
        domains: ['medical_devices'],
        pattern: /\b(medical device|ivd|in vitro diagnostic|class [i-iii]|510k|pma|ide|mdr|ivdr|device classification|software as medical device|samd|udi)\b/i,
        priority: 2,
      },
      {
        domains: ['bioinformatics'],
        pattern: /\b(genomics|proteomics|biomarker|next generation sequencing|ngs|omics|gene expression|mutation analysis|variant calling|pathway analysis|systems biology)\b/i,
        priority: 2,
      },
      {
        domains: ['companion_diagnostics'],
        pattern: /\b(companion diagnostic|cdx|biomarker testing|patient selection|precision medicine|genetic testing|targeted therapy|pharmacogenomics|test development|analytical validation)\b/i,
        priority: 2,
      },

      // Tier 3: Emerging Domains
      {
        domains: ['digital_health'],
        pattern: /\b(digital health|mobile health|mhealth|wearable|digital therapeutic|remote monitoring|telehealth|health app|connected device|sensor)\b/i,
        priority: 3,
      },
      {
        domains: ['precision_medicine'],
        pattern: /\b(precision medicine|personalized medicine|genetic profiling|targeted therapy|biomarker-driven|individualized treatment|pharmacogenetics|molecular diagnostics)\b/i,
        priority: 3,
      },
      {
        domains: ['ai_ml_healthcare'],
        pattern: /\b(artificial intelligence|machine learning|deep learning|neural network|predictive model|ai in healthcare|clinical decision support|algorithm|computer vision|nlp in medicine)\b/i,
        priority: 3,
      },
      {
        domains: ['telemedicine'],
        pattern: /\b(telemedicine|telehealth|remote consultation|virtual visit|tele-monitoring|remote patient monitoring|rpm|digital clinic|virtual care)\b/i,
        priority: 3,
      },
      {
        domains: ['sustainability'],
        pattern: /\b(sustainability|environmental impact|green pharma|carbon footprint|sustainable manufacturing|waste reduction|circular economy|eco-design|environmental stewardship)\b/i,
        priority: 3,
      },

      // Cross-cutting patterns
      {
        domains: ['regulatory_affairs', 'quality_assurance'],
        pattern: /\b(inspection readiness|regulatory inspection|gmp compliance|quality audit|regulatory compliance|quality standards)\b/i,
        priority: 1,
      },
      {
        domains: ['clinical_development', 'biostatistics'],
        pattern: /\b(clinical trial design|trial methodology|efficacy analysis|safety analysis|clinical endpoint|primary endpoint|secondary endpoint)\b/i,
        priority: 1,
      },
      {
        domains: ['pharmacovigilance', 'drug_safety'],
        pattern: /\b(safety monitoring|safety reporting|benefit-risk assessment|safety update|safety review|periodic safety report)\b/i,
        priority: 1,
      },
    ];
  }

  /**
   * Main detection method - tries regex first, falls back to RAG
   */
  async detectDomains(query: string, options: {
    maxDomains?: number;
    minConfidence?: number;
    useRAG?: boolean;
  } = {}): Promise<DetectedDomain[]> {
    const {
      maxDomains = 5,
      minConfidence = 0.3,
      useRAG = true,
    } = options;

    // Phase 1: Fast regex pattern matching
    const regexDetected = this.detectByRegex(query);

    // If we have high-confidence matches, return them
    if (regexDetected.length > 0 && regexDetected[0].confidence >= 0.8) {
      return regexDetected.slice(0, maxDomains);
    }

    // Phase 2: RAG semantic search (fallback)
    if (useRAG) {
      const ragDetected = await this.detectByRAG(query, maxDomains);

      // Merge results, prioritizing regex matches
      const merged = this.mergeDetections(regexDetected, ragDetected);

      return merged
        .filter(d => d.confidence >= minConfidence)
        .slice(0, maxDomains);
    }

    return regexDetected
      .filter(d => d.confidence >= minConfidence)
      .slice(0, maxDomains);
  }

  /**
   * Fast regex-based detection
   */
  private detectByRegex(query: string): DetectedDomain[] {
    const detectedMap = new Map<string, DetectedDomain>();

    for (const { domains, pattern, priority } of this.domainPatterns) {
      const matches = query.match(pattern);

      if (matches) {
        const matchCount = matches.length;
        const confidence = Math.min(0.9, 0.5 + (matchCount * 0.1));

        for (const domain of domains) {
          if (!detectedMap.has(domain)) {
            detectedMap.set(domain, {
              domain,
              confidence,
              method: 'regex',
              priority,
              matchedKeywords: matches,
            });
          } else {
            // Boost confidence if multiple patterns match same domain
            const existing = detectedMap.get(domain)!;
            existing.confidence = Math.min(0.95, existing.confidence + 0.1);
            existing.matchedKeywords = [
              ...(existing.matchedKeywords || []),
              ...matches,
            ];
          }
        }
      }
    }

    return Array.from(detectedMap.values())
      .sort((a, b) => {
        // Sort by priority first, then confidence
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.confidence - a.confidence;
      });
  }

  /**
   * RAG-based semantic detection (fallback for complex queries)
   */
  private async detectByRAG(
    query: string,
    maxDomains: number
  ): Promise<DetectedDomain[]> {
    try {
      // Get query embedding
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Load all knowledge domains with descriptions
      const { data: domains, error } = await supabaseAdmin
        .from('knowledge_domains')
        .select('slug, name, description, tier')
        .eq('is_active', true);

      if (error || !domains) {
        console.error('Failed to load domains for RAG:', error);
        return [];
      }

      // Calculate semantic similarity for each domain
      const similarities = await Promise.all(
        domains.map(async (domain) => {
          // Create domain profile for embedding
          const profile = `${domain.name}: ${domain.description || ''}`;
          const domainEmbedding = await this.embeddings.embedQuery(profile);

          // Calculate cosine similarity
          const similarity = this.cosineSimilarity(queryEmbedding, domainEmbedding);

          return {
            domain: domain.slug,
            confidence: similarity,
            method: 'rag' as const,
            priority: domain.tier,
            matchedKeywords: [],
          };
        })
      );

      return similarities
        .filter(s => s.confidence > 0.3)
        .sort((a, b) => {
          // Sort by priority first, then confidence
          if (a.priority !== b.priority) return a.priority - b.priority;
          return b.confidence - a.confidence;
        })
        .slice(0, maxDomains);
    } catch (error) {
      console.error('RAG detection failed:', error);
      return [];
    }
  }

  /**
   * Merge regex and RAG detections, prioritizing regex matches
   */
  private mergeDetections(
    regexResults: DetectedDomain[],
    ragResults: DetectedDomain[]
  ): DetectedDomain[] {
    const merged = new Map<string, DetectedDomain>();

    // Add regex results first (higher priority)
    for (const detection of regexResults) {
      merged.set(detection.domain, detection);
    }

    // Add RAG results, boosting confidence if domain already detected by regex
    for (const detection of ragResults) {
      if (merged.has(detection.domain)) {
        const existing = merged.get(detection.domain)!;
        // Boost confidence if both methods agree
        existing.confidence = Math.min(0.98, existing.confidence + 0.1);
        existing.method = 'hybrid';
      } else {
        merged.set(detection.domain, detection);
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.confidence - a.confidence;
      });
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get domain details from slugs
   */
  async getDomainDetails(domainSlugs: string[]) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_domains')
      .select('*')
      .in('slug', domainSlugs);

    if (error) {
      console.error('Failed to load domain details:', error);
      return [];
    }

    return data || [];
  }
}

export interface DetectedDomain {
  domain: string;
  confidence: number;
  method: 'regex' | 'rag' | 'hybrid';
  priority: number;
  matchedKeywords?: RegExpMatchArray[];
}

export const domainDetector = KnowledgeDomainDetector.getInstance();

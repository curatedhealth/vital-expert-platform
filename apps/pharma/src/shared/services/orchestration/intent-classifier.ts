/**
 * Intent Classifier - Advanced NLP-based Query Classification
 * Part of VITAL AI Master Orchestrator System
 */

import { IntentResult } from '@/shared/types/orchestration.types';

interface ClassificationRule {
  keywords: string[];
  priority: number;
  domain: string;
  intent: string;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  multiAgentRequired?: boolean;
}

export class IntentClassifier {
  private rules: Map<string, ClassificationRule[]> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  async classify(query: string): Promise<IntentResult> {

    // Score each domain

    const matchedKeywords: string[] = [];
    const matchedIntents: string[] = [];
    let maxComplexity: 'low' | 'medium' | 'high' | 'very-high' = 'low';

    // Evaluate all rules
    for (const [domain, rules] of this.rules.entries()) {

      for (const rule of rules) {

        // Check keyword matches
        for (const keyword of rule.keywords) {

          if (keywordScore > 0) {
            ruleScore += keywordScore * rule.priority / 100;
            keywordMatches++;
            matchedKeywords.push(keyword);
          }
        }

        // Apply rule if we have matches
        if (keywordMatches > 0) {
          domainScore += ruleScore;
          matchedIntents.push(rule.intent);

          // Update complexity
          if (this.getComplexityScore(rule.complexity) > this.getComplexityScore(maxComplexity)) {
            maxComplexity = rule.complexity;
          }

          // Check multi-agent requirement
          if (rule.multiAgentRequired) {
            requiresMultiAgent = true;
          }
        }
      }

      domainScores.set(domain, domainScore);
    }

    // Determine primary domain and confidence

      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    // Calculate confidence (0-100)

    // Get top domains

    // Enhance multi-agent detection
    requiresMultiAgent = requiresMultiAgent || this.detectMultiAgentNeed(query, domains, maxComplexity);

    return {
      primaryDomain,
      domains,
      confidence,
      keywords: Array.from(new Set(matchedKeywords)),
      complexity: maxComplexity,
      requiresMultiAgent,
      intent: this.getPrimaryIntent(matchedIntents, primaryDomain),
      subintents: Array.from(new Set(matchedIntents)).slice(0, 5)
    };
  }

  private loadDefaultRules() {
    // Digital Health Rules (Highest Priority)
    this.rules.set('digital_health', [
      {
        keywords: ['digital therapeutic', 'dtx', 'prescription digital', 'software as medical device', 'samd'],
        priority: 100,
        domain: 'digital_health',
        intent: 'digital_therapeutics',
        complexity: 'high',
        multiAgentRequired: true
      },
      {
        keywords: ['mobile health', 'mhealth', 'health app', 'wearable', 'fitness tracker', 'connected device'],
        priority: 95,
        domain: 'digital_health',
        intent: 'mobile_health',
        complexity: 'medium'
      },
      {
        keywords: ['telemedicine', 'telehealth', 'virtual care', 'remote monitoring', 'rpm', 'remote patient'],
        priority: 95,
        domain: 'digital_health',
        intent: 'telehealth',
        complexity: 'medium'
      },
      {
        keywords: ['artificial intelligence', 'ai', 'machine learning', 'ml', 'algorithm', 'clinical ai'],
        priority: 90,
        domain: 'digital_health',
        intent: 'ai_ml_clinical',
        complexity: 'high',
        multiAgentRequired: true
      },
      {
        keywords: ['fhir', 'ehr integration', 'interoperability', 'health information exchange', 'api'],
        priority: 85,
        domain: 'digital_health',
        intent: 'integration',
        complexity: 'high'
      }
    ]);

    // Regulatory Rules
    this.rules.set('regulatory', [
      {
        keywords: ['fda', '510k', 'pma', 'ide', 'regulatory', 'submission', 'clearance', 'approval'],
        priority: 95,
        domain: 'regulatory',
        intent: 'fda_pathway',
        complexity: 'high',
        multiAgentRequired: true
      },
      {
        keywords: ['ce mark', 'mdr', 'ivdr', 'eu regulation', 'notified body', 'conformity assessment'],
        priority: 90,
        domain: 'regulatory',
        intent: 'eu_regulation',
        complexity: 'high'
      },
      {
        keywords: ['iso 13485', 'quality management', 'qms', 'design control', 'risk management'],
        priority: 85,
        domain: 'regulatory',
        intent: 'quality_system',
        complexity: 'high'
      }
    ]);

    // Clinical Rules
    this.rules.set('clinical', [
      {
        keywords: ['clinical trial', 'study design', 'protocol', 'endpoint', 'pivotal study', 'ide study'],
        priority: 95,
        domain: 'clinical',
        intent: 'clinical_trial_design',
        complexity: 'high',
        multiAgentRequired: true
      },
      {
        keywords: ['safety', 'adverse event', 'pharmacovigilance', 'side effect', 'risk benefit'],
        priority: 90,
        domain: 'clinical',
        intent: 'safety_monitoring',
        complexity: 'high'
      },
      {
        keywords: ['evidence', 'real world', 'rwe', 'rwd', 'outcomes', 'effectiveness'],
        priority: 85,
        domain: 'clinical',
        intent: 'evidence_generation',
        complexity: 'medium'
      }
    ]);

    // Market Access Rules
    this.rules.set('market_access', [
      {
        keywords: ['reimbursement', 'coverage', 'payer', 'cms', 'medicare', 'medicaid', 'insurance'],
        priority: 90,
        domain: 'market_access',
        intent: 'reimbursement_strategy',
        complexity: 'high',
        multiAgentRequired: true
      },
      {
        keywords: ['health economics', 'heor', 'cost effectiveness', 'budget impact', 'health technology assessment', 'hta'],
        priority: 85,
        domain: 'market_access',
        intent: 'health_economics',
        complexity: 'high'
      },
      {
        keywords: ['pricing', 'value based', 'outcomes based', 'risk sharing', 'managed entry'],
        priority: 80,
        domain: 'market_access',
        intent: 'pricing_strategy',
        complexity: 'medium'
      }
    ]);

    // Compliance Rules
    this.rules.set('compliance', [
      {
        keywords: ['hipaa', 'privacy', 'phi', 'protected health information', 'data security'],
        priority: 95,
        domain: 'compliance',
        intent: 'data_privacy',
        complexity: 'high'
      },
      {
        keywords: ['gdpr', 'data protection', 'consent', 'data subject rights', 'privacy by design'],
        priority: 90,
        domain: 'compliance',
        intent: 'gdpr_compliance',
        complexity: 'high'
      },
      {
        keywords: ['audit', 'inspection', 'warning letter', 'compliance', 'remediation'],
        priority: 85,
        domain: 'compliance',
        intent: 'audit_response',
        complexity: 'high'
      }
    ]);

    // Business Rules
    this.rules.set('business', [
      {
        keywords: ['strategy', 'market entry', 'commercialization', 'go to market', 'launch'],
        priority: 80,
        domain: 'business',
        intent: 'commercialization',
        complexity: 'medium'
      },
      {
        keywords: ['partnership', 'collaboration', 'joint venture', 'alliance', 'licensing'],
        priority: 75,
        domain: 'business',
        intent: 'partnerships',
        complexity: 'medium'
      }
    ]);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private calculateKeywordScore(keyword: string, query: string, words: string[]): number {
    // Exact phrase match gets highest score
    if (query.includes(keyword.toLowerCase())) {
      return 10;
    }

    // Check for partial matches

    for (const kw of keywordWords) {
      if (words.some((w: any) => w.includes(kw) || kw.includes(w))) {
        matchedWords++;
      }
    }

    // Score based on percentage of keyword words matched
    if (matchedWords === keywordWords.length) {
      return 8; // All words matched separately
    } else if (matchedWords > keywordWords.length / 2) {
      return 5; // Majority matched
    } else if (matchedWords > 0) {
      return 2; // Some matches
    }

    return 0;
  }

  private calculateMaxScore(query: string): number {
    // Estimate maximum possible score based on query length and complexity

    return Math.max(10, wordCount * 2);
  }

  private getComplexityScore(complexity: string): number {
    switch (complexity) {
      case 'very-high': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private detectMultiAgentNeed(query: string, domains: string[], complexity: string): boolean {
    // Multi-agent needed if:
    // 1. Multiple domains detected
    if (domains.length > 2) return true;

    // 2. Very high complexity
    if (complexity === 'very-high') return true;

    // 3. Query contains coordination keywords

      'strategy', 'comprehensive', 'end-to-end', 'full', 'complete',
      'integrated', 'holistic', 'across', 'multiple', 'various'
    ];

    if (coordinationKeywords.some(kw => lowerQuery.includes(kw))) {
      return true;
    }

    // 4. Cross-functional queries

      ['regulatory', 'clinical'],
      ['clinical', 'market_access'],
      ['regulatory', 'business'],
      ['digital_health', 'regulatory']
    ];

    for (const [domain1, domain2] of crossFunctionalPairs) {
      if (domains.includes(domain1) && domains.includes(domain2)) {
        return true;
      }
    }

    return false;
  }

  private getPrimaryIntent(intents: string[], primaryDomain: string): string {
    if (intents.length === 0) return 'general_inquiry';

    // Group intents by frequency

    intents.forEach(intent => {
      intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);
    });

    // Return most frequent intent, or first one related to primary domain

      .sort((a, b) => b[1] - a[1]);

    return sortedIntents[0]?.[0] || 'general_inquiry';
  }

  // Method to add custom rules
  loadRules(customRules: Record<string, Partial<ClassificationRule> & { keywords: string[] }>) {
    for (const [domain, rule] of Object.entries(customRules)) {
      const fullRule: ClassificationRule = {
        keywords: rule.keywords,
        priority: rule.priority || 50,
        domain: rule.domain || domain,
        intent: rule.intent || 'custom',
        complexity: rule.complexity || 'medium',
        multiAgentRequired: rule.multiAgentRequired || false
      };

      if (!this.rules.has(domain)) {
        this.rules.set(domain, []);
      }
      this.rules.get(domain)?.push(fullRule);
    }
  }
}
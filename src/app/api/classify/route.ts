import { NextRequest, NextResponse } from 'next/server';

/**
 * 🧠 Ultra-Intelligent Intent Classification API
 * Provides real-time intent analysis for progressive complexity disclosure
 */

interface IntentClassificationResult {
  category: string;
  confidence: number;
  complexity: number;
  agents: string[];
  context: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    stakeholder: 'researcher' | 'regulatory' | 'clinical' | 'commercial' | 'executive';
    phase: 'discovery' | 'preclinical' | 'clinical' | 'regulatory' | 'commercial';
  };
}

// 🎯 Intent Pattern Definitions
const INTENT_PATTERNS: Record<string, any> = {
  regulatory: {
    keywords: ['fda', 'regulatory', 'approval', 'submission', '510k', 'nda', 'bla', 'pma', 'ide', 'guidance'],
    patterns: [/\b(regulatory|approval|submission)\b/i, /\bfda\b/i, /\b510\(?k\)?\b/i, /\bnda\b/i],
    weight: 0.9,
    agents: ['fda-regulatory-strategist', 'regulatory-affairs-expert', 'compliance-officer']
  },
  clinical: {
    keywords: ['clinical', 'trial', 'study', 'protocol', 'endpoint', 'recruitment', 'phase', 'patients'],
    patterns: [/\b(clinical trial|study protocol)\b/i, /\bphase\s+[123]\b/i, /\bendpoint/i],
    weight: 0.85,
    agents: ['clinical-trial-designer', 'biostatistician', 'clinical-operations']
  },
  market_access: {
    keywords: ['reimbursement', 'payer', 'coverage', 'pricing', 'heor', 'health economics', 'formulary'],
    patterns: [/\b(reimbursement|market access)\b/i, /\bpayer\b/i, /\bpricing\b/i],
    weight: 0.8,
    agents: ['market-access-strategist', 'health-economist', 'payer-expert']
  },
  digital_health: {
    keywords: ['digital', 'app', 'software', 'algorithm', 'samd', 'dtx', 'digital therapeutic', 'ai', 'ml'],
    patterns: [/\b(digital health|mobile app)\b/i, /\bsoftware.*medical device\b/i, /\bai\b|\bml\b/i],
    weight: 0.85,
    agents: ['digital-health-strategist', 'software-architect', 'ai-ml-expert']
  },
  commercial: {
    keywords: ['launch', 'marketing', 'sales', 'commercial', 'promotion', 'brand', 'competitive'],
    patterns: [/\b(product launch|commercial strategy)\b/i, /\bmarketing\b/i],
    weight: 0.75,
    agents: ['launch-strategist', 'commercial-analyst', 'brand-manager']
  }
};

// 🧮 Complexity Assessment Factors
function calculateComplexity(query: string, category: string): number {

  // Length factor
  if (query.length > 200) complexity += 0.3;
  else if (query.length > 100) complexity += 0.2;
  else if (query.length > 50) complexity += 0.1;

  // Technical terms
  const technicalTerms = [
    'protocol', 'endpoint', 'biomarker', 'stratification', 'randomization',
    'pharmacokinetics', 'pharmacodynamics', 'bioequivalence', 'companion diagnostic'
  ];
  complexity += technicalTerms.filter(term => query.toLowerCase().includes(term)).length * 0.15;

  // Category-specific complexity
  if (category === 'regulatory') complexity += 0.2;
  if (category === 'clinical') complexity += 0.25;

  // Multiple question indicators
  if (query.includes('?') && query.split('?').length > 2) complexity += 0.2;

  // Multi-stakeholder complexity

  if (stakeholderCount > 1) complexity += stakeholderCount * 0.05;

  return Math.min(complexity, 1.0);
}

// 🎯 Context Analysis
function analyzeContext(query: string, category: string) {

  // Urgency Analysis
  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('emergency')) {
    urgency = 'critical';
  } else if (queryLower.includes('soon') || queryLower.includes('timeline') || queryLower.includes('deadline')) {
    urgency = 'high';
  } else if (queryLower.includes('planning') || queryLower.includes('future') || queryLower.includes('strategy')) {
    urgency = 'low';
  }

  // Stakeholder Analysis
  let stakeholder: 'researcher' | 'regulatory' | 'clinical' | 'commercial' | 'executive' = 'researcher';
  if (queryLower.includes('fda') || queryLower.includes('regulatory') || queryLower.includes('submission')) {
    stakeholder = 'regulatory';
  } else if (queryLower.includes('trial') || queryLower.includes('clinical') || queryLower.includes('protocol')) {
    stakeholder = 'clinical';
  } else if (queryLower.includes('market') || queryLower.includes('commercial') || queryLower.includes('launch')) {
    stakeholder = 'commercial';
  } else if (queryLower.includes('strategy') || queryLower.includes('investment') || queryLower.includes('roi')) {
    stakeholder = 'executive';
  }

  // Development Phase Analysis
  let phase: 'discovery' | 'preclinical' | 'clinical' | 'regulatory' | 'commercial' = 'discovery';
  if (queryLower.includes('discovery') || queryLower.includes('research')) {
    phase = 'discovery';
  } else if (queryLower.includes('preclinical') || queryLower.includes('animal')) {
    phase = 'preclinical';
  } else if (queryLower.includes('phase') || queryLower.includes('clinical')) {
    phase = 'clinical';
  } else if (queryLower.includes('approval') || queryLower.includes('submission')) {
    phase = 'regulatory';
  } else if (queryLower.includes('launch') || queryLower.includes('market')) {
    phase = 'commercial';
  }

  return { urgency, stakeholder, phase };
}

// 🔍 Intent Scoring Algorithm
function scoreIntentMatch(tokens: string[], query: string, pattern: unknown): unknown {

  // Score keywords
  for (const keyword of pattern.keywords) {
    if (tokens.includes(keyword) || query.includes(keyword)) {
      score += 0.1;
      foundKeywords.push(keyword);
    }
  }

  // Score regex patterns
  for (const regex of pattern.patterns) {
    if (regex.test(query)) {
      score += 0.3;
    }
  }

  return {
    confidence: Math.min(score, pattern.weight),
    keyTerms: foundKeywords
  };
}

export async function POST(request: NextRequest) {
  try {

    const { query } = body;

    if (!query || query.length < 10) {
      return NextResponse.json({
        category: 'general',
        confidence: 0.3,
        complexity: 0.1,
        agents: [],
        context: {
          urgency: 'low',
          stakeholder: 'researcher',
          phase: 'discovery'
        }
      });
    }

    return {
      category: 'general',
      confidence: 0.3,
      complexity: 0.1,
      agents: [] as string[]
    };

    // Fast pattern matching
    for (const [category, pattern] of Object.entries(INTENT_PATTERNS)) {

      if (score.confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence: score.confidence,
          complexity: calculateComplexity(query, category),
          agents: pattern.agents
        };
      }
    }

    // Context analysis

    // Apply contextual boosting
    if (bestMatch.category === 'regulatory' && query.includes('510k')) {
      bestMatch.confidence = Math.min(bestMatch.confidence + 0.2, 1.0);
    }

    if (bestMatch.category === 'clinical' && query.includes('phase 3')) {
      bestMatch.confidence = Math.min(bestMatch.confidence + 0.15, 1.0);
    }

    const result: IntentClassificationResult = {
      ...bestMatch,
      context
    };

    return NextResponse.json(result);

  } catch (error) {
    // console.error('Intent classification error:', error);

    return NextResponse.json(
      {
        category: 'general',
        confidence: 0.3,
        complexity: 0.1,
        agents: [],
        context: {
          urgency: 'low',
          stakeholder: 'researcher',
          phase: 'discovery'
        }
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'VITAL AI Intent Classification',
    version: '1.0.0',
    patterns: Object.keys(INTENT_PATTERNS).length
  });
}
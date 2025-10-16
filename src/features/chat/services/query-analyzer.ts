import { z } from 'zod';
import { OpenAI } from 'openai';
import * as natural from 'natural';

// Query analysis result schema
const QueryAnalysisSchema = z.object({
  intent: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1)
  }),
  
  entities: z.array(z.object({
    type: z.enum(['drug', 'disease', 'procedure', 'regulation', 'organization', 'clinical_trial']),
    value: z.string(),
    context: z.string().optional(),
    confidence: z.number()
  })),
  
  complexity: z.object({
    score: z.number().min(1).max(10),
    factors: z.array(z.string()),
    estimatedResponseTime: z.number(), // seconds
    requiresSpecialist: z.boolean()
  }),
  
  domain: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).optional(),
    interdisciplinary: z.boolean()
  }),
  
  regulatory: z.object({
    region: z.array(z.enum(['US', 'EU', 'UK', 'Japan', 'China', 'Global'])),
    requiresCompliance: z.boolean(),
    sensitivityLevel: z.enum(['public', 'confidential', 'restricted'])
  }),
  
  urgency: z.enum(['routine', 'priority', 'urgent', 'critical']),
  
  requiredCapabilities: z.array(z.string()),
  
  suggestedTools: z.array(z.string())
});

export type QueryAnalysis = z.infer<typeof QueryAnalysisSchema>;

export class QueryAnalyzer {
  private openai: OpenAI;
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
  private classifier: natural.BayesClassifier;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.classifier = new natural.BayesClassifier();
    
    this.initializeClassifier();
  }
  
  private initializeClassifier() {
    // Train classifier with medical/regulatory domain examples
    const trainingData = [
      { text: 'What are the FDA requirements for drug approval?', category: 'regulatory' },
      { text: 'Show me clinical trial results for diabetes medications', category: 'clinical' },
      { text: 'Explain the mechanism of action for ACE inhibitors', category: 'medical' },
      { text: 'Compare effectiveness of COVID vaccines', category: 'research' },
      { text: 'What are the reimbursement codes for cardiac procedures?', category: 'reimbursement' },
      { text: 'Analyze market access strategy for EU', category: 'market_access' },
      { text: 'How do I submit a 510(k) application?', category: 'regulatory' },
      { text: 'What are the side effects of metformin?', category: 'medical' },
      { text: 'Clinical trial protocol for Phase II study', category: 'clinical' },
      { text: 'Health economics analysis for new drug', category: 'health_economics' },
      { text: 'Patient safety reporting requirements', category: 'safety' },
      { text: 'Drug interaction checker', category: 'medical' },
      { text: 'Regulatory submission timeline', category: 'regulatory' },
      { text: 'Market research for oncology drugs', category: 'market_research' },
      { text: 'Quality assurance procedures', category: 'quality' },
      { text: 'Medical device classification', category: 'regulatory' },
      { text: 'Pharmacovigilance reporting', category: 'safety' },
      { text: 'Clinical data management', category: 'clinical' },
      { text: 'Regulatory intelligence', category: 'regulatory' },
      { text: 'Medical writing guidelines', category: 'medical_writing' }
    ];
    
    trainingData.forEach(item => {
      this.classifier.addDocument(item.text, item.category);
    });
    
    this.classifier.train();
  }
  
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    // Step 1: Basic NLP analysis
    const tokens = this.tokenizer.tokenize(query.toLowerCase());
    const classification = this.classifier.classify(query);
    const classifications = this.classifier.getClassifications(query);
    
    // Step 2: Advanced analysis using GPT-4
    const gptAnalysis = await this.performGPTAnalysis(query);
    
    // Step 3: Entity extraction
    const entities = await this.extractEntities(query, tokens);
    
    // Step 4: Complexity assessment
    const complexity = this.assessComplexity(query, tokens, entities);
    
    // Step 5: Domain identification
    const domain = this.identifyDomain(classifications, entities, gptAnalysis);
    
    // Step 6: Regulatory requirements
    const regulatory = this.assessRegulatoryRequirements(query, entities);
    
    // Step 7: Capability matching
    const requiredCapabilities = this.identifyRequiredCapabilities(
      domain,
      complexity,
      entities
    );
    
    // Step 8: Tool suggestions
    const suggestedTools = this.suggestTools(domain, entities, complexity);
    
    return {
      intent: {
        primary: gptAnalysis.intent || classification,
        secondary: gptAnalysis.secondaryIntents,
        confidence: Math.max(...classifications.map(c => c.value))
      },
      entities,
      complexity,
      domain,
      regulatory,
      urgency: this.determineUrgency(query),
      requiredCapabilities,
      suggestedTools
    };
  }
  
  private async performGPTAnalysis(query: string): Promise<any> {
    const prompt = `Analyze this healthcare/regulatory query and provide structured analysis:
    
Query: "${query}"

Provide analysis in JSON format:
{
  "intent": "primary intent",
  "secondaryIntents": ["secondary intent 1", "secondary intent 2"],
  "keyTopics": ["topic1", "topic2"],
  "requiredExpertise": ["expertise1", "expertise2"],
  "estimatedComplexity": 1-10,
  "suggestedApproach": "approach description"
}`;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('GPT analysis error:', error);
      return {};
    }
  }
  
  private async extractEntities(query: string, tokens: string[]): Promise<any[]> {
    const entities = [];
    
    // Medical entity patterns
    const patterns = {
      drug: /\b([A-Z][a-z]+(?:mab|nib|ib|cin|pine|pril|sartan|statin|azole))\b/gi,
      trial: /\b(NCT\d{8}|phase\s+[IVX123]+|clinical\s+trial)\b/gi,
      regulation: /\b(FDA|EMA|MHRA|PMDA|21\s*CFR|ICH|GCP|GMP)\b/gi,
      disease: /\b(diabetes|cancer|hypertension|COVID-19|alzheimer|parkinson|asthma|depression)\b/gi,
      procedure: /\b(surgery|biopsy|screening|diagnosis|treatment|therapy|injection|infusion)\b/gi,
      organization: /\b(Pfizer|Novartis|Roche|Merck|GSK|AstraZeneca|Johnson\s*&\s*Johnson)\b/gi
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = query.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type,
            value: match,
            context: this.getEntityContext(match, query),
            confidence: 0.85
          });
        });
      }
    }
    
    return entities;
  }
  
  private assessComplexity(query: string, tokens: string[], entities: any[]): any {
    let score = 3; // Base complexity
    const factors = [];
    
    // Length factor
    if (tokens.length > 50) {
      score += 2;
      factors.push('Long query');
    }
    
    // Multiple questions
    const questionCount = (query.match(/\?/g) || []).length;
    if (questionCount > 1) {
      score += questionCount;
      factors.push(`Multiple questions (${questionCount})`);
    }
    
    // Technical terms
    const technicalTerms = [
      'pharmacokinetics', 'bioequivalence', 'pharmacovigilance',
      'meta-analysis', 'systematic review', 'real-world evidence',
      'biomarker', 'endpoint', 'adverse event', 'efficacy',
      'pharmacodynamics', 'drug-drug interaction', 'therapeutic index',
      'placebo-controlled', 'randomized', 'double-blind', 'crossover'
    ];
    
    const foundTechnical = technicalTerms.filter(term => 
      query.toLowerCase().includes(term)
    );
    
    if (foundTechnical.length > 0) {
      score += foundTechnical.length * 1.5;
      factors.push(`Technical terms: ${foundTechnical.join(', ')}`);
    }
    
    // Comparison requests
    if (/compare|versus|vs\.|difference between/i.test(query)) {
      score += 2;
      factors.push('Comparison request');
    }
    
    // Multi-step analysis
    if (/analyze.*then|first.*then|step.by.step/i.test(query)) {
      score += 3;
      factors.push('Multi-step analysis');
    }
    
    // Entity complexity
    if (entities.length > 3) {
      score += 1;
      factors.push(`Multiple entities (${entities.length})`);
    }
    
    // Regulatory complexity
    if (/FDA|EMA|regulatory|compliance|submission/i.test(query)) {
      score += 1;
      factors.push('Regulatory complexity');
    }
    
    // Clinical trial complexity
    if (/clinical trial|phase|protocol|endpoint/i.test(query)) {
      score += 1.5;
      factors.push('Clinical trial complexity');
    }
    
    // Cap at 10
    score = Math.min(score, 10);
    
    return {
      score,
      factors,
      estimatedResponseTime: score * 3, // seconds
      requiresSpecialist: score >= 7
    };
  }
  
  private identifyDomain(classifications: any[], entities: any[], gptAnalysis: any): any {
    // Primary domain from classifier
    const primary = classifications[0]?.label || 'general';
    
    // Secondary domains from other high-confidence classifications
    const secondary = classifications
      .slice(1)
      .filter(c => c.value > 0.3)
      .map(c => c.label);
    
    // Check for interdisciplinary needs
    const interdisciplinary = 
      secondary.length > 1 || 
      (gptAnalysis.requiredExpertise && gptAnalysis.requiredExpertise.length > 2);
    
    return {
      primary,
      secondary,
      interdisciplinary
    };
  }
  
  private assessRegulatoryRequirements(query: string, entities: any[]): any {
    const regions = [];
    const regionPatterns = {
      US: /\b(FDA|US|USA|United States|America|505\(b\)|510\(k\))/i,
      EU: /\b(EMA|EU|Europe|European Union|CE mark|MDR|IVDR)/i,
      UK: /\b(MHRA|UK|United Kingdom|Britain|NICE)/i,
      Japan: /\b(PMDA|Japan|Japanese|MHLW)/i,
      China: /\b(NMPA|China|Chinese|CFDA)/i
    };
    
    for (const [region, pattern] of Object.entries(regionPatterns)) {
      if (pattern.test(query)) {
        regions.push(region);
      }
    }
    
    if (regions.length === 0) {
      regions.push('Global');
    }
    
    const requiresCompliance = entities.some(e => 
      e.type === 'regulation' || 
      /compliance|regulatory|submission|approval/i.test(query)
    );
    
    const sensitivityLevel = this.determineSensitivity(query);
    
    return {
      region: regions,
      requiresCompliance,
      sensitivityLevel
    };
  }
  
  private determineSensitivity(query: string): string {
    if (/confidential|proprietary|internal|restricted/i.test(query)) {
      return 'confidential';
    }
    if (/sensitive|private|personal|patient data/i.test(query)) {
      return 'restricted';
    }
    return 'public';
  }
  
  private determineUrgency(query: string): 'routine' | 'priority' | 'urgent' | 'critical' {
    if (/urgent|asap|immediately|critical|emergency/i.test(query)) {
      return 'urgent';
    }
    if (/priority|soon|today|deadline/i.test(query)) {
      return 'priority';
    }
    return 'routine';
  }
  
  private identifyRequiredCapabilities(domain: any, complexity: any, entities: any[]): string[] {
    const capabilities = new Set<string>();
    
    // Domain-based capabilities
    const domainCapabilities: Record<string, string[]> = {
      regulatory: ['regulatory_compliance', 'submission_expertise', 'guideline_interpretation'],
      clinical: ['clinical_trials', 'patient_safety', 'protocol_design'],
      medical: ['medical_knowledge', 'drug_information', 'disease_expertise'],
      research: ['literature_review', 'data_analysis', 'evidence_synthesis'],
      reimbursement: ['coding_expertise', 'payer_knowledge', 'health_economics'],
      market_access: ['pricing_strategy', 'market_analysis', 'stakeholder_management'],
      safety: ['pharmacovigilance', 'adverse_event_reporting', 'risk_assessment'],
      quality: ['quality_assurance', 'gmp_compliance', 'validation'],
      medical_writing: ['regulatory_writing', 'clinical_documents', 'scientific_communication']
    };
    
    if (domainCapabilities[domain.primary]) {
      domainCapabilities[domain.primary].forEach(cap => capabilities.add(cap));
    }
    
    domain.secondary?.forEach((sec: string) => {
      if (domainCapabilities[sec]) {
        domainCapabilities[sec].forEach(cap => capabilities.add(cap));
      }
    });
    
    // Complexity-based capabilities
    if (complexity.requiresSpecialist) {
      capabilities.add('specialist_knowledge');
      capabilities.add('advanced_analysis');
    }
    
    // Entity-based capabilities
    if (entities.some(e => e.type === 'drug')) {
      capabilities.add('pharmacology');
    }
    if (entities.some(e => e.type === 'clinical_trial')) {
      capabilities.add('clinical_trials');
    }
    if (entities.some(e => e.type === 'regulation')) {
      capabilities.add('regulatory_expertise');
    }
    
    return Array.from(capabilities);
  }
  
  private suggestTools(domain: any, entities: any[], complexity: any): string[] {
    const tools = new Set<string>();
    
    // Always useful tools
    tools.add('web_search');
    
    // Domain-specific tools
    const domainTools: Record<string, string[]> = {
      regulatory: ['fda_database', 'ema_database', 'regulatory_guidelines'],
      clinical: ['clinical_trials', 'cochrane_reviews', 'patient_registries'],
      medical: ['pubmed_search', 'drug_interaction', 'medical_calculator'],
      research: ['pubmed_search', 'web_of_science', 'meta_analysis'],
      reimbursement: ['cms_database', 'icd_lookup', 'drg_calculator'],
      safety: ['adverse_event_database', 'drug_safety_monitoring'],
      quality: ['gmp_guidelines', 'validation_templates']
    };
    
    if (domainTools[domain.primary]) {
      domainTools[domain.primary].forEach(tool => tools.add(tool));
    }
    
    // Entity-based tools
    if (entities.some(e => e.type === 'drug')) {
      tools.add('drug_database');
      tools.add('drug_interaction');
    }
    
    if (entities.some(e => e.type === 'clinical_trial')) {
      tools.add('clinical_trials');
    }
    
    if (entities.some(e => e.type === 'regulation')) {
      tools.add('regulatory_database');
    }
    
    // Complexity-based tools
    if (complexity.score > 7) {
      tools.add('rag_search'); // Internal knowledge base
      tools.add('expert_network'); // Connect to human experts
    }
    
    return Array.from(tools);
  }
  
  private getEntityContext(entity: string, query: string, windowSize: number = 50): string {
    const index = query.indexOf(entity);
    if (index === -1) return '';
    
    const start = Math.max(0, index - windowSize);
    const end = Math.min(query.length, index + entity.length + windowSize);
    
    return query.substring(start, end);
  }
}

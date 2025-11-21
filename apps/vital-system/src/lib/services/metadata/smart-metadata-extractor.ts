/**
 * Smart Metadata Extraction Service
 * Extracts comprehensive metadata from filenames and content using AI and pattern matching
 */

interface ExtractedMetadata {
  // Core identification
  title?: string;
  clean_title?: string;
  source_name?: string;
  source_url?: string;
  
  // Publication & Date
  year?: number;
  publication_date?: string;
  
  // Authors & Organization
  author?: string;
  authors?: string[];
  organization?: string;
  publisher?: string;
  
  // Classification
  document_type?: string;
  language?: string;
  
  // Healthcare/Pharma specific
  regulatory_body?: string;
  therapeutic_area?: string;
  geographic_scope?: string;
  
  // Content metadata
  keywords?: string[];
  summary?: string;
  abstract?: string;
  
  // File metadata
  page_count?: number;
  word_count?: number;
  
  // Confidence scores
  confidence?: {
    source?: number;
    year?: number;
    type?: number;
    [key: string]: number | undefined;
  };
}

interface TaxonomyConfig {
  // Source patterns (regex or keywords)
  sourcePatterns: Map<string, RegExp | string[]>;
  
  // Document type patterns
  documentTypePatterns: Map<string, RegExp | string[]>;
  
  // Regulatory body patterns
  regulatoryBodyPatterns: Map<string, RegExp | string[]>;
  
  // Therapeutic area patterns
  therapeuticAreaPatterns: Map<string, RegExp | string[]>;
  
  // Naming template
  namingTemplate?: string;
}

export class SmartMetadataExtractor {
  private taxonomy: TaxonomyConfig;
  private useAI: boolean;
  private openaiApiKey?: string;

  constructor(config?: { useAI?: boolean; openaiApiKey?: string; taxonomy?: Partial<TaxonomyConfig> }) {
    this.useAI = config?.useAI ?? false;
    this.openaiApiKey = config?.openaiApiKey || process.env.OPENAI_API_KEY;
    
    // Initialize taxonomy patterns
    this.taxonomy = {
      sourcePatterns: new Map([
        // Regulatory bodies
        ['FDA', /fda|food.*drug.*administration/i],
        ['EMA', /ema|european.*medicine.*agency/i],
        ['WHO', /who|world.*health.*organization/i],
        ['NIH', /nih|national.*institute.*health/i],
        ['NICE', /nice|national.*institute.*excellence/i],
        ['MHRA', /mhra|medicine.*healthcare.*agency/i],
        
        // Journals & Publications
        ['Nature', /nature/i],
        ['Science', /science/i],
        ['JAMA', /jama|journal.*american.*medical/i],
        ['NEJM', /nejm|new.*england.*journal/i],
        ['Lancet', /lancet/i],
        ['BMJ', /bmj|british.*medical.*journal/i],
        
        // Consultancies
        ['McKinsey', /mckinsey/i],
        ['Deloitte', /deloitte/i],
        ['BCG', /bcg|boston.*consulting/i],
        ['PwC', /pwc|pricewaterhouse/i],
        ['KPMG', /kpmg/i],
        
        // Pharma companies
        ['Pfizer', /pfizer/i],
        ['GSK', /gsk|glaxosmithkline/i],
        ['Novartis', /novartis/i],
        ['Roche', /roche/i],
        ['Merck', /merck/i],
        ['J&J', /johnson.*johnson|j&j/i],
        
        // Other common sources
        ['CDC', /cdc|centers.*disease.*control/i],
        ['CMS', /cms|centers.*medicare.*medicaid/i],
        ['HHS', /hhs|health.*human.*services/i],
      ]),
      
      documentTypePatterns: new Map([
        ['Regulatory Guidance', /guidance|guideline|regulation|regulatory.*guidance/i],
        ['Research Paper', /research|study|paper|publication|journal.*article/i],
        ['Clinical Protocol', /protocol|clinical.*protocol/i],
        ['Market Research Report', /market.*research|market.*report|market.*analysis/i],
        ['Government Regulation', /regulation|regulatory|fda.*regulation|ema.*regulation/i],
        ['Industry Standard', /standard|iso|ich.*guideline/i],
        ['Whitepaper', /whitepaper|white.*paper/i],
        ['Best Practice Guide', /best.*practice|best.*practice.*guide|practice.*guideline/i],
        ['Template', /template|form.*template/i],
        ['SOP', /sop|standard.*operating.*procedure/i],
        ['Clinical Trial', /clinical.*trial|trial.*protocol|study.*protocol/i],
        ['Systematic Review', /systematic.*review|meta.*analysis/i],
        ['Case Study', /case.*study|case.*report/i],
      ]),
      
      regulatoryBodyPatterns: new Map([
        ['FDA', /fda|food.*drug.*administration/i],
        ['EMA', /ema|european.*medicine.*agency/i],
        ['WHO', /who|world.*health.*organization/i],
        ['MHRA', /mhra|medicine.*healthcare.*agency/i],
        ['PMDA', /pmda|pharmaceutical.*device.*agency/i],
        ['Health Canada', /health.*canada|hc-sc/i],
        ['TGA', /tga|therapeutic.*goods.*administration/i],
      ]),
      
      therapeuticAreaPatterns: new Map([
        ['Oncology', /oncology|cancer|tumor|tumour|onco/i],
        ['Cardiology', /cardiology|cardiac|cardiovascular|heart/i],
        ['Neurology', /neurology|neurological|brain|nervous.*system/i],
        ['Immunology', /immunology|immune|immunotherapy/i],
        ['Infectious Disease', /infectious|infection|pathogen|bacterial|viral/i],
        ['Endocrinology', /endocrinology|diabetes|metabolic|hormone/i],
        ['Rheumatology', /rheumatology|rheumatoid|arthritis|autoimmune/i],
        ['Respiratory', /respiratory|pulmonary|lung|asthma|copd/i],
        ['Dermatology', /dermatology|skin|dermatological/i],
        ['Gastroenterology', /gastroenterology|gastro|digestive|gi/i],
      ]),
      
      ...config?.taxonomy,
    };
  }

  /**
   * Extract metadata from filename
   */
  async extractFromFilename(fileName: string): Promise<ExtractedMetadata> {
    const metadata: ExtractedMetadata = {
      title: fileName,
      confidence: {},
    };

    // Extract extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

    // Extract source name
    const sourceMatch = this.extractSource(nameWithoutExt);
    if (sourceMatch) {
      metadata.source_name = sourceMatch.name;
      metadata.confidence!.source = sourceMatch.confidence;
    }

    // Extract year (4-digit years 1900-2099)
    const yearMatch = nameWithoutExt.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        metadata.year = year;
        metadata.confidence!.year = 0.9;
      }
    }

    // Extract document type
    const typeMatch = this.extractDocumentType(nameWithoutExt);
    if (typeMatch) {
      metadata.document_type = typeMatch.type;
      metadata.confidence!.type = typeMatch.confidence;
    }

    // Extract regulatory body
    const regulatoryBodyMatch = this.extractRegulatoryBody(nameWithoutExt);
    if (regulatoryBodyMatch) {
      metadata.regulatory_body = regulatoryBodyMatch.body;
      metadata.confidence!.regulatory_body = regulatoryBodyMatch.confidence;
    }

    // Extract therapeutic area
    const therapeuticAreaMatch = this.extractTherapeuticArea(nameWithoutExt);
    if (therapeuticAreaMatch) {
      metadata.therapeutic_area = therapeuticAreaMatch.area;
      metadata.confidence!.therapeutic_area = therapeuticAreaMatch.confidence;
    }

    // Generate clean title (remove source, year, common patterns)
    metadata.clean_title = this.generateCleanTitle(nameWithoutExt, {
      source: metadata.source_name,
      year: metadata.year,
      type: metadata.document_type,
    });

    return metadata;
  }

  /**
   * Extract metadata from file content
   */
  async extractFromContent(content: string, fileName: string): Promise<ExtractedMetadata> {
    const metadata: ExtractedMetadata = {
      confidence: {},
    };

    // Extract from content using patterns
    const contentLower = content.toLowerCase();
    const contentSample = content.substring(0, 5000); // First 5000 chars for analysis

    // Extract year from content (more reliable)
    const yearMatches = content.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches && yearMatches.length > 0) {
      // Get most recent year
      const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 1900 && y <= new Date().getFullYear() + 1);
      if (years.length > 0) {
        metadata.year = Math.max(...years);
        metadata.confidence!.year = 0.95;
      }
    }

    // Extract source from content
    const sourceMatch = this.extractSource(contentSample);
    if (sourceMatch && sourceMatch.confidence > (metadata.confidence?.source || 0)) {
      metadata.source_name = sourceMatch.name;
      metadata.confidence!.source = sourceMatch.confidence;
    }

    // Extract document type from content
    const typeMatch = this.extractDocumentType(contentSample);
    if (typeMatch && typeMatch.confidence > (metadata.confidence?.type || 0)) {
      metadata.document_type = typeMatch.type;
      metadata.confidence!.type = typeMatch.confidence;
    }

    // Extract author patterns
    const authorPatterns = [
      /authors?[:\s]+([^\n]{10,200})/i,
      /by[:\s]+([^\n]{10,200})/i,
      /written\s+by[:\s]+([^\n]{10,200})/i,
      /corresponding\s+author[:\s]+([^\n]{10,200})/i,
    ];

    for (const pattern of authorPatterns) {
      const match = content.match(pattern);
      if (match) {
        metadata.author = match[1].trim().split(/\s+and\s+/)[0].trim();
        break;
      }
    }

    // Extract organization/publisher
    const orgPatterns = [
      /published\s+by[:\s]+([^\n]{10,100})/i,
      /institution[:\s]+([^\n]{10,100})/i,
      /organization[:\s]+([^\n]{10,100})/i,
    ];

    for (const pattern of orgPatterns) {
      const match = content.match(pattern);
      if (match) {
        metadata.organization = match[1].trim();
        break;
      }
    }

    // Use AI extraction if enabled
    if (this.useAI && this.openaiApiKey) {
      const aiMetadata = await this.extractWithAI(content, fileName);
      // Merge AI results (AI takes precedence)
      Object.assign(metadata, aiMetadata);
    }

    // Estimate word count
    metadata.word_count = content.split(/\s+/).filter(word => word.length > 0).length;

    // Detect language (simple heuristic)
    metadata.language = this.detectLanguage(content);

    return metadata;
  }

  /**
   * Extract metadata using AI/LLM
   */
  private async extractWithAI(content: string, fileName: string): Promise<Partial<ExtractedMetadata>> {
    if (!this.openaiApiKey) {
      return {};
    }

    try {
      const prompt = `Extract metadata from the following document. Return JSON with: title, source_name, year, document_type, author, organization, regulatory_body, therapeutic_area, summary (first 200 chars), keywords (array).
      
      Filename: ${fileName}
      Content preview: ${content.substring(0, 2000)}
      
      Return only valid JSON, no markdown or code blocks.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a metadata extraction expert. Extract document metadata and return only valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        console.warn('AI metadata extraction failed, using fallback');
        return {};
      }

      const data = await response.json();
      const aiResult = JSON.parse(data.choices[0].message.content);

      return {
        title: aiResult.title,
        source_name: aiResult.source_name,
        year: aiResult.year ? parseInt(aiResult.year) : undefined,
        document_type: aiResult.document_type,
        author: aiResult.author,
        organization: aiResult.organization,
        regulatory_body: aiResult.regulatory_body,
        therapeutic_area: aiResult.therapeutic_area,
        summary: aiResult.summary,
        keywords: aiResult.keywords ? (Array.isArray(aiResult.keywords) ? aiResult.keywords : [aiResult.keywords]) : undefined,
      };
    } catch (error) {
      console.error('AI metadata extraction error:', error);
      return {};
    }
  }

  /**
   * Extract source name from text
   */
  private extractSource(text: string): { name: string; confidence: number } | null {
    const textLower = text.toLowerCase();

    for (const [name, pattern] of this.taxonomy.sourcePatterns.entries()) {
      let matches = false;
      
      if (pattern instanceof RegExp) {
        matches = pattern.test(textLower);
      } else if (Array.isArray(pattern)) {
        matches = pattern.some(p => textLower.includes(p.toLowerCase()));
      }

      if (matches) {
        return {
          name,
          confidence: 0.9,
        };
      }
    }

    return null;
  }

  /**
   * Extract document type from text
   */
  private extractDocumentType(text: string): { type: string; confidence: number } | null {
    const textLower = text.toLowerCase();

    for (const [type, pattern] of this.taxonomy.documentTypePatterns.entries()) {
      let matches = false;
      
      if (pattern instanceof RegExp) {
        matches = pattern.test(textLower);
      } else if (Array.isArray(pattern)) {
        matches = pattern.some(p => textLower.includes(p.toLowerCase()));
      }

      if (matches) {
        return {
          type,
          confidence: 0.85,
        };
      }
    }

    return null;
  }

  /**
   * Extract regulatory body from text
   */
  private extractRegulatoryBody(text: string): { body: string; confidence: number } | null {
    const textLower = text.toLowerCase();

    for (const [body, pattern] of this.taxonomy.regulatoryBodyPatterns.entries()) {
      let matches = false;
      
      if (pattern instanceof RegExp) {
        matches = pattern.test(textLower);
      } else if (Array.isArray(pattern)) {
        matches = pattern.some(p => textLower.includes(p.toLowerCase()));
      }

      if (matches) {
        return {
          body,
          confidence: 0.9,
        };
      }
    }

    return null;
  }

  /**
   * Extract therapeutic area from text
   */
  private extractTherapeuticArea(text: string): { area: string; confidence: number } | null {
    const textLower = text.toLowerCase();

    for (const [area, pattern] of this.taxonomy.therapeuticAreaPatterns.entries()) {
      let matches = false;
      
      if (pattern instanceof RegExp) {
        matches = pattern.test(textLower);
      } else if (Array.isArray(pattern)) {
        matches = pattern.some(p => textLower.includes(p.toLowerCase()));
      }

      if (matches) {
        return {
          area,
          confidence: 0.8,
        };
      }
    }

    return null;
  }

  /**
   * Generate clean title by removing extracted metadata
   */
  private generateCleanTitle(fileName: string, extracted: { source?: string; year?: number; type?: string }): string {
    let clean = fileName;

    // Remove extension
    clean = clean.replace(/\.[^/.]+$/, '');

    // Remove source
    if (extracted.source) {
      clean = clean.replace(new RegExp(extracted.source, 'gi'), '').trim();
    }

    // Remove year
    if (extracted.year) {
      clean = clean.replace(new RegExp(extracted.year.toString(), 'g'), '').trim();
    }

    // Remove common separators and clean up
    clean = clean
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize first letter of each word
    clean = clean.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return clean || fileName;
  }

  /**
   * Detect language (simple heuristic)
   */
  private detectLanguage(text: string): string {
    // Simple heuristic - can be enhanced with language detection library
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    const englishCount = englishWords.filter(word => text.toLowerCase().includes(word)).length;
    
    // If > 5 common English words, assume English
    return englishCount > 5 ? 'en' : 'unknown';
  }

  /**
   * Merge metadata from multiple sources (filename + content)
   */
  mergeMetadata(...metadataList: ExtractedMetadata[]): ExtractedMetadata {
    const merged: ExtractedMetadata = {
      confidence: {},
    };

    for (const metadata of metadataList) {
      // Merge fields (later sources override earlier ones if they have higher confidence)
      for (const [key, value] of Object.entries(metadata)) {
        if (key === 'confidence') continue;
        
        if (value !== undefined && value !== null && value !== '') {
          const currentConfidence = merged.confidence?.[key] || 0;
          const newConfidence = metadata.confidence?.[key] || 0.5;
          
          if (newConfidence > currentConfidence || merged[key as keyof ExtractedMetadata] === undefined) {
            (merged as any)[key] = value;
            if (!merged.confidence) merged.confidence = {};
            merged.confidence[key] = newConfidence;
          }
        }
      }
    }

    return merged;
  }
}


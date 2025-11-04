import crypto from 'crypto';

export interface DocumentMetadata {
  // Basic file info
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;

  // Extracted metadata
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  keywords?: string[];
  creationDate?: string;
  modificationDate?: string;

  // Document analysis
  language?: string;
  pageCount?: number;
  wordCount?: number;

  // Content classification
  documentType?: 'research-paper' | 'guideline' | 'regulation' | 'manual' | 'report' | 'other';
  researchType?: 'systematic-review' | 'rct' | 'observational' | 'case-study' | 'meta-analysis' | 'other';

  // Publication info (extracted from content)
  journal?: string;
  doi?: string;
  pmid?: string;
  publishedDate?: string;
  volume?: string;
  issue?: string;
  pages?: string;

  // Classifications
  topics?: string[];
  methodology?: string[];
  studyDesign?: string;

  // Quality indicators
  citationCount?: number;
  impactFactor?: number;
  evidenceLevel?: string;
}

/**
 * Calculate MD5 hash of file content for deduplication
 */
export async function calculateFileHash(file: File): Promise<string> {

  hash.update(new Uint8Array(buffer));
  return hash.digest('hex');
}

/**
 * Extract metadata from PDF content using text analysis
 */
export function extractMetadataFromContent(
  content: string,
  fileName: string
): Partial<DocumentMetadata> {
  const metadata: Partial<DocumentMetadata> = { /* TODO: implement */ };

  // Extract title (first meaningful line or from filename)

  if (lines.length > 0) {
    // Try to find a title in the first few lines

    for (const line of titleCandidates) {
      if (line.length > 10 && line.length < 200 && !line.includes('Page ') && !line.includes('www.')) {
        metadata.title = line.trim();
        break;
      }
    }
  }

  // Fallback to filename if no title found
  if (!metadata.title) {
    metadata.title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
  }

  // Extract DOI

  if (doiMatch) {
    metadata.doi = doiMatch[1];
  }

  // Extract PMID

  if (pmidMatch) {
    metadata.pmid = pmidMatch[1];
  }

  // Extract journal name (look for common patterns)

    /Published in:?\s*([^\n]{10,100})/i,
    /Journal:?\s*([^\n]{5,80})/i,
    /Source:?\s*([^\n]{5,80})/i,
  ];

  for (const pattern of journalPatterns) {

    if (match) {
      metadata.journal = match[1].trim();
      break;
    }
  }

  // Extract date patterns

    /Published:?\s*([A-Za-z]+ \d{1,2},? \d{4})/i,
    /Date:?\s*([A-Za-z]+ \d{1,2},? \d{4})/i,
    /(\d{4}-\d{2}-\d{2})/,
    /([A-Za-z]+ \d{4})/,
  ];

  for (const pattern of datePatterns) {

    if (match) {
      metadata.publishedDate = match[1];
      break;
    }
  }

  // Extract authors (look for common patterns)

    /Authors?:?\s*([^\n]{10,200})/i,
    /By:?\s*([^\n]{10,200})/i,
    /Written by:?\s*([^\n]{10,200})/i,
  ];

  for (const pattern of authorPatterns) {

    if (match) {
      metadata.author = match[1].trim();
      break;
    }
  }

  // Classify document type based on content and filename
  metadata.documentType = classifyDocumentType(content, fileName);

  // Extract research type if it's a research paper
  if (metadata.documentType === 'research-paper') {
    metadata.researchType = classifyResearchType(content);
  }

  // Extract topics and keywords
  metadata.topics = extractTopics(content);
  metadata.methodology = extractMethodology(content);

  // Estimate word count
  metadata.wordCount = content.split(/\s+/).length;

  // Detect language (simple heuristic)
  metadata.language = detectLanguage(content);

  return metadata;
}

/**
 * Classify document type based on content analysis
 */
function classifyDocumentType(content: string, fileName: string): DocumentMetadata['documentType'] {

  // Research paper indicators

    'abstract', 'introduction', 'methods', 'results', 'discussion', 'conclusion',
    'systematic review', 'meta-analysis', 'randomized controlled trial', 'rct',
    'peer review', 'citation', 'bibliography', 'references'
  ];

  // Guideline indicators

    'guidance', 'guideline', 'recommendation', 'best practice', 'standard',
    'protocol', 'framework', 'policy', 'procedure'
  ];

  // Regulation indicators

    'regulation', 'compliance', 'fda', 'ema', 'ich', 'gcp', 'law', 'legal',
    'requirement', 'mandate', 'directive', 'code of federal regulations'
  ];

  // Manual indicators

    'manual', 'handbook', 'guide', 'tutorial', 'instruction', 'how-to',
    'user guide', 'implementation', 'toolkit'
  ];

    lowerContent.includes(term) || lowerFileName.includes(term)
  ).length;

    lowerContent.includes(term) || lowerFileName.includes(term)
  ).length;

    lowerContent.includes(term) || lowerFileName.includes(term)
  ).length;

    lowerContent.includes(term) || lowerFileName.includes(term)
  ).length;

    { type: 'research-paper' as const, score: researchScore },
    { type: 'guideline' as const, score: guidelineScore },
    { type: 'regulation' as const, score: regulationScore },
    { type: 'manual' as const, score: manualScore },
  ];

  return highest.score > 0 ? highest.type : 'other';
}

/**
 * Classify research type for research papers
 */
function classifyResearchType(content: string): DocumentMetadata['researchType'] {

  if (lowerContent.includes('systematic review')) return 'systematic-review';
  if (lowerContent.includes('meta-analysis')) return 'meta-analysis';
  if (lowerContent.includes('randomized controlled trial') || lowerContent.includes('rct')) return 'rct';
  if (lowerContent.includes('case study') || lowerContent.includes('case report')) return 'case-study';
  if (lowerContent.includes('cohort study') || lowerContent.includes('observational')) return 'observational';

  return 'other';
}

/**
 * Extract key topics from content
 */
function extractTopics(content: string): string[] {
  const topics: string[] = [];

  // Health/medical topics

    'digital health', 'telemedicine', 'telehealth', 'artificial intelligence',
    'machine learning', 'clinical decision support', 'electronic health records',
    'patient engagement', 'population health', 'precision medicine',
    'medical devices', 'regulatory', 'fda approval', 'clinical trials',
    'health economics', 'market access', 'reimbursement', 'value-based care',
    'cybersecurity', 'data privacy', 'interoperability', 'apis',
    'mobile health', 'mhealth', 'wearables', 'remote monitoring',
    'patient safety', 'quality improvement', 'clinical outcomes'
  ];

  for (const topic of healthTopics) {
    if (lowerContent.includes(topic)) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 10); // Limit to top 10 topics
}

/**
 * Extract methodology information
 */
function extractMethodology(content: string): string[] {
  const methodology: string[] = [];

    'qualitative', 'quantitative', 'mixed methods', 'survey', 'interview',
    'focus group', 'ethnography', 'case study', 'cross-sectional',
    'longitudinal', 'prospective', 'retrospective', 'randomized',
    'controlled trial', 'pilot study', 'feasibility study', 'usability testing',
    'statistical analysis', 'regression', 'machine learning', 'deep learning'
  ];

  for (const term of methodTerms) {
    if (lowerContent.includes(term)) {
      methodology.push(term);
    }
  }

  return methodology.slice(0, 5); // Limit to top 5 methodologies
}

/**
 * Simple language detection
 */
function detectLanguage(content: string): string {
  // Very basic language detection - can be enhanced with proper libraries

  if (englishCount >= 3) return 'en';

  // Add more language detection logic as needed
  return 'unknown';
}

/**
 * Check if two documents are duplicates based on various criteria
 */
export function areDocumentsDuplicate(
  doc1: { hash: string; name: string; size: number; title?: string },
  doc2: { hash: string; name: string; size: number; title?: string }
): { isDuplicate: boolean; reason: string } {

  // Exact hash match (same content)
  if (doc1.hash === doc2.hash) {
    return { isDuplicate: true, reason: 'identical-content' };
  }

  // Same filename and size
  if (doc1.name === doc2.name && doc1.size === doc2.size) {
    return { isDuplicate: true, reason: 'same-file-and-size' };
  }

  // Very similar filenames and similar size (within 5%)

  if (namesimilarity > 0.9 && sizeDifference < 0.05) {
    return { isDuplicate: true, reason: 'similar-name-and-size' };
  }

  // Similar titles (if available)
  if (doc1.title && doc2.title) {

    if (titleSimilarity > 0.95) {
      return { isDuplicate: true, reason: 'identical-title' };
    }
  }

  return { isDuplicate: false, reason: 'not-duplicate' };
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {

  if (longer.length === 0) return 1.0;

  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let _i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let _j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let _i = 1; i <= str2.length; i++) {
    for (let _j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
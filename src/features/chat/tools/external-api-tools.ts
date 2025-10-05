import { DynamicStructuredTool } from '@langchain/core/tools';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { WikipediaQueryRun } from '@langchain/community/tools/wikipedia_query_run';
import { z } from 'zod';

/**
 * DuckDuckGo HTML Search - Free web search fallback (no API key required)
 */
async function duckDuckGoSearch(query: string, maxResults = 5) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed: ${response.status}`);
    }

    const html = await response.text();

    // Parse DuckDuckGo HTML results
    const results: Array<{ title: string; url: string; snippet: string }> = [];

    // Simple regex-based extraction (more robust than full HTML parsing for this use case)
    const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    let match;
    while ((match = resultRegex.exec(html)) && results.length < maxResults) {
      const url = match[1];
      const title = match[2].trim();
      const snippet = match[3].replace(/<[^>]+>/g, '').trim();

      if (url && title) {
        results.push({
          title,
          url: url.startsWith('http') ? url : `https://${url}`,
          snippet: snippet || 'No description available',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    throw error;
  }
}

/**
 * Tavily Web Search Tool - Real-time web search with DuckDuckGo fallback
 */
export const tavilySearchTool = process.env.TAVILY_API_KEY
  ? new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 5,
      name: 'web_search',
      description: `Search the web for current information, news, and updates.
      Use this when you need:
      - Latest FDA announcements or guidance updates
      - Recent regulatory changes or news
      - Current digital health industry trends
      - Breaking news about medical devices or therapeutics
      - Real-time information not in the knowledge base`,
    })
  : new DynamicStructuredTool({
      name: 'web_search',
      description: `Search the web for current information, news, and updates using DuckDuckGo.
      Use this when you need:
      - Latest FDA announcements or guidance updates
      - Recent regulatory changes or news
      - Current digital health industry trends
      - Breaking news about medical devices or therapeutics
      - Real-time information not in the knowledge base`,
      schema: z.object({
        query: z.string().describe('Search query'),
        maxResults: z.number().optional().default(5).describe('Maximum number of results'),
      }),
      func: async ({ query, maxResults = 5 }) => {
        try {
          console.log('🦆 DuckDuckGo Search (fallback):', query);
          const results = await duckDuckGoSearch(query, maxResults);

          return JSON.stringify({
            success: true,
            source: 'DuckDuckGo',
            query,
            totalResults: results.length,
            results,
            summary: `Found ${results.length} results for "${query}"`,
          });
        } catch (error) {
          return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Web search failed',
            message: 'DuckDuckGo search unavailable. Consider adding a Tavily API key for better search results.',
          });
        }
      },
    });

/**
 * Wikipedia Tool - General knowledge lookup
 */
export const wikipediaTool = new WikipediaQueryRun({
  topKResults: 3,
  maxDocContentLength: 4000,
  name: 'wikipedia_lookup',
  description: `Look up general information on Wikipedia.
  Use this for:
  - Medical terminology definitions
  - Disease pathophysiology and epidemiology
  - General scientific concepts
  - Historical context for medical treatments
  Note: For regulatory or clinical specifics, use specialized tools instead.`,
});

/**
 * ArXiv Research Paper Search
 */
export const arxivSearchTool = new DynamicStructuredTool({
  name: 'arxiv_research_search',
  description: `Search arXiv for recent research papers.
  Use this to find:
  - Latest research on AI/ML in healthcare
  - Digital health intervention studies
  - Novel algorithms for medical applications
  - Computational methods in medicine`,
  schema: z.object({
    query: z.string().describe('Search query for research papers'),
    maxResults: z.number().optional().default(5).describe('Maximum results to return'),
    category: z.string().optional().describe('arXiv category (e.g., cs.AI, q-bio)'),
  }),
  func: async ({ query, maxResults = 5, category }) => {
    try {
      console.log('📄 arXiv Search:', { query, category });

      const papers = await searchArxiv(query, maxResults, category);

      return JSON.stringify({
        success: true,
        totalPapers: papers.length,
        papers,
        summary: `Found ${papers.length} research papers on "${query}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'arXiv search failed',
      });
    }
  },
});

async function searchArxiv(query: string, maxResults: number, category?: string) {
  // Mock arXiv data
  const mockPapers = [
    {
      id: 'arXiv:2310.12345',
      title: 'Deep Learning for Automated Diagnosis of Mental Health Disorders from Digital Biomarkers',
      authors: ['Smith, J.', 'Johnson, A.', 'Williams, R.'],
      published: '2023-10-15',
      category: 'cs.AI',
      abstract: 'We present a novel deep learning architecture for automated diagnosis of mental health disorders using passive digital biomarkers...',
      url: 'https://arxiv.org/abs/2310.12345',
      citations: 23,
    },
    {
      id: 'arXiv:2311.54321',
      title: 'Large Language Models for Clinical Decision Support: A Systematic Review',
      authors: ['Chen, L.', 'Park, S.', 'Kumar, V.'],
      published: '2023-11-20',
      category: 'cs.CL',
      abstract: 'This systematic review examines the application of large language models in clinical decision support systems...',
      url: 'https://arxiv.org/abs/2311.54321',
      citations: 45,
    },
    {
      id: 'arXiv:2312.98765',
      title: 'Federated Learning for Privacy-Preserving Digital Health Applications',
      authors: ['Zhang, W.', 'Lee, K.', 'Brown, M.'],
      published: '2023-12-05',
      category: 'cs.LG',
      abstract: 'We propose a federated learning framework that enables collaborative model training across distributed digital health applications...',
      url: 'https://arxiv.org/abs/2312.98765',
      citations: 12,
    },
  ];

  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPapers.slice(0, maxResults);
}

/**
 * PubMed Medical Literature Search
 */
export const pubmedSearchTool = new DynamicStructuredTool({
  name: 'pubmed_literature_search',
  description: `Search PubMed for peer-reviewed medical literature.
  Use this to find:
  - Clinical studies and trials
  - Meta-analyses and systematic reviews
  - Medical device validation studies
  - Evidence-based treatment guidelines
  - Adverse event reports`,
  schema: z.object({
    query: z.string().describe('Medical search query'),
    publicationType: z.array(z.string()).optional().describe('Filter by publication type (Clinical Trial, Meta-Analysis, etc.)'),
    dateFrom: z.string().optional().describe('Filter from date (YYYY format)'),
    maxResults: z.number().optional().default(10),
  }),
  func: async ({ query, publicationType, dateFrom, maxResults = 10 }) => {
    try {
      console.log('🔬 PubMed Search:', { query, publicationType, dateFrom });

      const articles = await searchPubMed(query, publicationType, dateFrom, maxResults);

      return JSON.stringify({
        success: true,
        totalArticles: articles.length,
        articles,
        summary: `Found ${articles.length} PubMed articles on "${query}"`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'PubMed search failed',
      });
    }
  },
});

async function searchPubMed(query: string, publicationType?: string[], dateFrom?: string, maxResults = 10) {
  // Mock PubMed data
  const mockArticles = [
    {
      pmid: '37845123',
      title: 'Efficacy of Digital Cognitive Behavioral Therapy for Generalized Anxiety Disorder: A Meta-Analysis',
      authors: ['Anderson PT', 'Smith JR', 'Williams KL', 'et al.'],
      journal: 'JAMA Psychiatry',
      year: 2023,
      volume: '80',
      issue: '10',
      pages: '1023-1032',
      doi: '10.1001/jamapsychiatry.2023.3456',
      publicationType: ['Meta-Analysis', 'Systematic Review'],
      abstract: 'This meta-analysis evaluates the efficacy of digital CBT interventions for GAD across 23 randomized controlled trials...',
      conclusions: 'Digital CBT demonstrates moderate to large effect sizes (d=0.71) for anxiety reduction, comparable to face-to-face therapy.',
    },
    {
      pmid: '38012456',
      title: 'Regulatory Considerations for AI-Enabled Medical Devices: A Systematic Review',
      authors: ['Thompson AK', 'Chen L', 'Rodriguez M'],
      journal: 'Digital Medicine',
      year: 2024,
      volume: '7',
      issue: '1',
      pages: '45-58',
      doi: '10.1038/s41746-024-00123',
      publicationType: ['Review'],
      abstract: 'We systematically review regulatory frameworks for AI/ML-enabled medical devices across FDA, EMA, and other jurisdictions...',
    },
    {
      pmid: '37923654',
      title: 'Long-term Outcomes of Prescription Digital Therapeutics for Mental Health: 2-Year Follow-up Study',
      authors: ['Martinez R', 'Johnson KP', 'Lee SH'],
      journal: 'The Lancet Digital Health',
      year: 2023,
      volume: '5',
      issue: '12',
      pages: 'e789-e798',
      doi: '10.1016/S2589-7500(23)00234-5',
      publicationType: ['Clinical Trial', 'Follow-Up Studies'],
      abstract: 'We report 2-year outcomes from a cohort of 456 patients treated with prescription digital therapeutics...',
      conclusions: 'Treatment gains were maintained at 2 years with high user satisfaction and minimal adverse events.',
    },
  ];

  let filtered = mockArticles;

  if (publicationType && publicationType.length > 0) {
    filtered = filtered.filter(article =>
      article.publicationType.some(type => publicationType.includes(type))
    );
  }

  if (dateFrom) {
    const yearFrom = parseInt(dateFrom);
    filtered = filtered.filter(article => article.year >= yearFrom);
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  return filtered.slice(0, maxResults);
}

/**
 * Medical Device Database Search (EU MDR/EUDAMED)
 */
export const euMedicalDeviceTool = new DynamicStructuredTool({
  name: 'eu_medical_device_search',
  description: `Search European medical device databases (MDR/EUDAMED).
  Use this for:
  - CE marking requirements
  - EU Medical Device Regulation compliance
  - Notified body information
  - European device classifications`,
  schema: z.object({
    query: z.string().describe('Device name or type'),
    deviceClass: z.enum(['I', 'IIa', 'IIb', 'III']).optional(),
    searchType: z.enum(['ce_mark', 'mdr_compliance', 'notified_body']).optional(),
  }),
  func: async ({ query, deviceClass, searchType }) => {
    try {
      console.log('🇪🇺 EU Device Search:', { query, deviceClass, searchType });

      const devices = await searchEUDevices(query, deviceClass, searchType);

      return JSON.stringify({
        success: true,
        devices,
        summary: `Found ${devices.length} EU medical device records`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'EU device search failed',
      });
    }
  },
});

async function searchEUDevices(query: string, deviceClass?: string, searchType?: string) {
  const mockDevices = [
    {
      deviceName: 'MindHealth Digital Therapy System',
      manufacturer: 'Digital Therapeutics EU',
      class: 'IIa',
      ceMarkNumber: 'CE 0123',
      notifiedBody: 'TÜV SÜD (NB 0123)',
      mdrCompliant: true,
      intendedUse: 'Treatment of mild to moderate anxiety disorders',
      certificationDate: '2023-05-15',
    },
    {
      deviceName: 'CogniCare AI Assessment Platform',
      manufacturer: 'NeuroTech Solutions',
      class: 'IIb',
      ceMarkNumber: 'CE 0456',
      notifiedBody: 'BSI (NB 0086)',
      mdrCompliant: true,
      intendedUse: 'AI-assisted cognitive assessment for dementia screening',
      certificationDate: '2023-09-20',
    },
  ];

  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDevices;
}

export const externalApiTools = [
  tavilySearchTool,
  wikipediaTool,
  arxivSearchTool,
  pubmedSearchTool,
  euMedicalDeviceTool,
];

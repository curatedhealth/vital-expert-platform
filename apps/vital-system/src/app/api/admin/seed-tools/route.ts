/**
 * Admin API - Seed Tools
 * Seeds the tools and tool_categories tables with initial data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🛠️ [Seed Tools] Starting tools seeding...');

    // First, check if categories exist
    const { data: existingCategories, error: categoriesCheckError } = await supabase
      .from('tool_categories')
      .select('id, name')
      .limit(1);

    if (categoriesCheckError) {
      console.error('❌ [Seed Tools] Error checking categories:', categoriesCheckError);
      return NextResponse.json({ 
        error: 'Failed to check categories', 
        details: categoriesCheckError.message 
      }, { status: 500 });
    }

    // Seed categories if they don't exist
    if (!existingCategories || existingCategories.length === 0) {
      console.log('📦 [Seed Tools] Seeding tool categories...');
      
      const categories = [
        { name: 'Evidence Research', description: 'Search and retrieve evidence from medical literature, clinical trials, and regulatory databases', icon: '🔬', display_order: 1 },
        { name: 'Regulatory & Standards', description: 'Access regulatory guidelines, standards, and compliance information', icon: '📋', display_order: 2 },
        { name: 'Digital Health', description: 'Digital medicine resources, decentralized trials, and digital endpoints', icon: '💻', display_order: 3 },
        { name: 'Knowledge Management', description: 'Internal knowledge bases and documentation', icon: '📚', display_order: 4 },
        { name: 'Computation', description: 'Mathematical calculations and data analysis', icon: '🔢', display_order: 5 },
        { name: 'General Research', description: 'Web search and general information retrieval', icon: '🌐', display_order: 6 },
      ];

      const { error: categoriesError } = await supabase
        .from('tool_categories')
        .upsert(categories, { onConflict: 'name' });

      if (categoriesError) {
        console.error('❌ [Seed Tools] Error seeding categories:', categoriesError);
        return NextResponse.json({ 
          error: 'Failed to seed categories', 
          details: categoriesError.message 
        }, { status: 500 });
      }
      console.log('✅ [Seed Tools] Categories seeded successfully');
    } else {
      console.log('ℹ️ [Seed Tools] Categories already exist, skipping...');
    }

    // Get category IDs
    const { data: categories } = await supabase
      .from('tool_categories')
      .select('id, name');

    const categoryMap = new Map(categories?.map(c => [c.name, c.id]) || []);

    // Check if tools exist
    const { data: existingTools, error: toolsCheckError } = await supabase
      .from('tools')
      .select('id')
      .limit(1);

    if (toolsCheckError) {
      console.error('❌ [Seed Tools] Error checking tools:', toolsCheckError);
      return NextResponse.json({ 
        error: 'Failed to check tools', 
        details: toolsCheckError.message 
      }, { status: 500 });
    }

    // Seed tools if they don't exist
    if (!existingTools || existingTools.length === 0) {
      console.log('📦 [Seed Tools] Seeding tools...');

      const tools = [
        // General Research
        {
          tool_key: 'web_search',
          name: 'Web Search',
          description: 'Search the web for current information, news, research papers, regulatory updates, clinical trial data, or drug approvals using Tavily API.',
          category_id: categoryMap.get('General Research'),
          tool_type: 'api',
          implementation_path: 'expert-tools.createWebSearchTool',
          requires_api_key: true,
          api_key_env_var: 'TAVILY_API_KEY',
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://docs.tavily.com'
        },
        // Evidence Research
        {
          tool_key: 'pubmed_search',
          name: 'PubMed Search',
          description: 'Search PubMed for peer-reviewed medical research papers, clinical studies, and systematic reviews.',
          category_id: categoryMap.get('Evidence Research'),
          tool_type: 'api',
          implementation_path: 'expert-tools.createPubMedSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://www.ncbi.nlm.nih.gov/books/NBK25501/'
        },
        {
          tool_key: 'search_clinical_trials',
          name: 'ClinicalTrials.gov Search',
          description: 'Search ClinicalTrials.gov for clinical trials by condition, intervention, sponsor, phase, or status.',
          category_id: categoryMap.get('Evidence Research'),
          tool_type: 'api',
          implementation_path: 'evidence-retrieval.createClinicalTrialsSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', condition: 'string', intervention: 'string', phase: 'string', status: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://clinicaltrials.gov/api/v2/'
        },
        {
          tool_key: 'cochrane_search',
          name: 'Cochrane Library Search',
          description: 'Search the Cochrane Library for systematic reviews, meta-analyses, and evidence-based medicine resources.',
          category_id: categoryMap.get('Evidence Research'),
          tool_type: 'api',
          implementation_path: 'evidence-retrieval.createCochraneSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://www.cochranelibrary.com/'
        },
        // Regulatory & Standards
        {
          tool_key: 'fda_search',
          name: 'FDA Database Search',
          description: 'Search FDA databases for drug approvals, safety communications, guidance documents, and regulatory information.',
          category_id: categoryMap.get('Regulatory & Standards'),
          tool_type: 'api',
          implementation_path: 'regulatory-tools.createFDASearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', database: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://open.fda.gov/'
        },
        {
          tool_key: 'ema_search',
          name: 'EMA Database Search',
          description: 'Search European Medicines Agency databases for European drug approvals, EPARs, and regulatory documents.',
          category_id: categoryMap.get('Regulatory & Standards'),
          tool_type: 'api',
          implementation_path: 'regulatory-tools.createEMASearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://www.ema.europa.eu/'
        },
        {
          tool_key: 'nice_search',
          name: 'NICE Guidelines Search',
          description: 'Search NICE (National Institute for Health and Care Excellence) for clinical guidelines, technology appraisals, and health economics evidence.',
          category_id: categoryMap.get('Regulatory & Standards'),
          tool_type: 'api',
          implementation_path: 'regulatory-tools.createNICESearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://www.nice.org.uk/'
        },
        // Digital Health
        {
          tool_key: 'dime_search',
          name: 'DiMe Digital Medicine Search',
          description: 'Search the Digital Medicine Society library for digital endpoints, decentralized trials, and digital health evidence.',
          category_id: categoryMap.get('Digital Health'),
          tool_type: 'api',
          implementation_path: 'digital-health-tools.createDiMeSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://www.dimesociety.org/'
        },
        // Knowledge Management
        {
          tool_key: 'knowledge_base_search',
          name: 'Knowledge Base Search',
          description: 'Search internal knowledge bases, SOPs, and company documentation using RAG.',
          category_id: categoryMap.get('Knowledge Management'),
          tool_type: 'function',
          implementation_path: 'knowledge-tools.createKnowledgeBaseSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', collection: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: null
        },
        // Computation
        {
          tool_key: 'wolfram_alpha',
          name: 'Wolfram Alpha',
          description: 'Perform mathematical calculations, unit conversions, statistical analysis, and scientific computations.',
          category_id: categoryMap.get('Computation'),
          tool_type: 'api',
          implementation_path: 'computation-tools.createWolframAlphaTool',
          requires_api_key: true,
          api_key_env_var: 'WOLFRAM_APP_ID',
          input_schema: { query: 'string' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: true,
          documentation_url: 'https://products.wolframalpha.com/api/'
        },
        {
          tool_key: 'calculator',
          name: 'Scientific Calculator',
          description: 'Perform basic and scientific calculations including statistics, probability, and mathematical functions.',
          category_id: categoryMap.get('Computation'),
          tool_type: 'function',
          implementation_path: 'computation-tools.createCalculatorTool',
          requires_api_key: false,
          input_schema: { expression: 'string' },
          output_format: 'text',
          timeout_seconds: 5,
          is_active: true,
          is_premium: false,
          documentation_url: null
        },
        // Additional tools
        {
          tool_key: 'arxiv_search',
          name: 'arXiv Search',
          description: 'Search arXiv for preprints in physics, mathematics, computer science, and related fields.',
          category_id: categoryMap.get('Evidence Research'),
          tool_type: 'api',
          implementation_path: 'evidence-retrieval.createArxivSearchTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://arxiv.org/help/api'
        },
        {
          tool_key: 'semantic_scholar',
          name: 'Semantic Scholar Search',
          description: 'Search Semantic Scholar for academic papers with AI-powered relevance ranking and citation analysis.',
          category_id: categoryMap.get('Evidence Research'),
          tool_type: 'api',
          implementation_path: 'evidence-retrieval.createSemanticScholarTool',
          requires_api_key: false,
          input_schema: { query: 'string', maxResults: 'number' },
          output_format: 'json',
          timeout_seconds: 30,
          is_active: true,
          is_premium: false,
          documentation_url: 'https://api.semanticscholar.org/'
        },
      ];

      const { error: toolsError } = await supabase
        .from('tools')
        .upsert(tools, { onConflict: 'tool_key' });

      if (toolsError) {
        console.error('❌ [Seed Tools] Error seeding tools:', toolsError);
        return NextResponse.json({ 
          error: 'Failed to seed tools', 
          details: toolsError.message 
        }, { status: 500 });
      }
      console.log('✅ [Seed Tools] Tools seeded successfully');
    } else {
      console.log('ℹ️ [Seed Tools] Tools already exist, skipping...');
    }

    // Get final counts
    const { count: categoryCount } = await supabase
      .from('tool_categories')
      .select('*', { count: 'exact', head: true });

    const { count: toolCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    console.log('✅ [Seed Tools] Seeding completed');
    return NextResponse.json({ 
      success: true, 
      message: 'Tools seeded successfully',
      categories: categoryCount,
      tools: toolCount
    });

  } catch (error) {
    console.error('❌ [Seed Tools] Seeding failed:', error);
    return NextResponse.json({ 
      error: 'Seeding failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get counts
    const { count: categoryCount } = await supabase
      .from('tool_categories')
      .select('*', { count: 'exact', head: true });

    const { count: toolCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      success: true,
      categories: categoryCount || 0,
      tools: toolCount || 0
    });

  } catch (error) {
    console.error('❌ [Seed Tools] Check failed:', error);
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}










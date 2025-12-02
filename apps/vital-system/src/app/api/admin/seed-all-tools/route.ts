/**
 * Admin API - Seed All Tools
 * Seeds the tools table with comprehensive tool data (100+ tools)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to create tool objects using the Gold Standard schema (slug, not tool_key)
const t = (slug: string, name: string, desc: string, type: string, meta: Record<string, any>) => ({
  slug,
  name,
  description: desc,
  tool_type: type,
  is_active: true,
  metadata: meta,
});

// Comprehensive list of 100+ tools
const ALL_TOOLS = [
  // STATISTICAL SOFTWARE (10)
  t('r-statistical', 'R Statistical Software', 'Open-source statistical computing environment for psychometric analysis and advanced statistical modeling.', 'function', { vendor: 'R Foundation', version: '4.3+', license: 'GPL-3', tier: 1, category: 'Statistical Software' }),
  t('sas', 'SAS', 'Industry-standard statistical software for clinical trials and regulatory submissions.', 'function', { vendor: 'SAS Institute', version: '9.4+', license: 'Commercial', tier: 1, category: 'Statistical Software' }),
  t('stata', 'Stata', 'Statistical software for data analysis, data management, and graphics.', 'function', { vendor: 'StataCorp', version: '18+', license: 'Commercial', tier: 1, category: 'Statistical Software' }),
  t('spss', 'IBM SPSS Statistics', 'Statistical software for predictive analytics and data mining.', 'function', { vendor: 'IBM', version: '29+', license: 'Commercial', tier: 2, category: 'Statistical Software' }),
  t('python-scipy', 'Python SciPy/NumPy', 'Python scientific computing libraries for numerical analysis.', 'function', { vendor: 'Open Source', version: '1.11+', license: 'BSD', tier: 1, category: 'Statistical Software' }),
  t('julia', 'Julia', 'High-performance programming language for technical computing.', 'function', { vendor: 'JuliaLang', version: '1.9+', license: 'MIT', tier: 2, category: 'Statistical Software' }),
  t('jmp', 'JMP', 'Statistical discovery software for interactive data visualization.', 'function', { vendor: 'SAS Institute', version: '17+', license: 'Commercial', tier: 2, category: 'Statistical Software' }),
  t('minitab', 'Minitab', 'Statistical software for quality improvement and Six Sigma.', 'function', { vendor: 'Minitab LLC', version: '21+', license: 'Commercial', tier: 2, category: 'Statistical Software' }),
  t('graphpad-prism', 'GraphPad Prism', 'Scientific graphing and statistics software for biomedical research.', 'function', { vendor: 'GraphPad Software', version: '10+', license: 'Commercial', tier: 1, category: 'Statistical Software' }),
  t('nquery', 'nQuery', 'Sample size and power analysis software for clinical trial design.', 'function', { vendor: 'Statsols', version: '9+', license: 'Commercial', tier: 1, category: 'Statistical Software' }),

  // EDC SYSTEMS (10)
  t('medidata-rave', 'Medidata Rave', 'Cloud-based clinical data management and EDC platform.', 'api', { vendor: 'Medidata (Dassault)', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('oracle-clinical', 'Oracle Clinical', 'Enterprise clinical trial data management system.', 'api', { vendor: 'Oracle', version: '5.2+', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('veeva-vault-cdms', 'Veeva Vault CDMS', 'Cloud-based clinical data management and EDC solution.', 'api', { vendor: 'Veeva Systems', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('openclinica', 'OpenClinica', 'Open-source electronic data capture and clinical data management.', 'api', { vendor: 'OpenClinica', version: '4.0+', license: 'LGPL', tier: 2, category: 'EDC System' }),
  t('redcap', 'REDCap', 'Secure web application for building and managing online surveys and databases.', 'api', { vendor: 'Vanderbilt', version: '13+', license: 'Free for non-profit', tier: 1, category: 'EDC System' }),
  t('clario', 'Clario (ERT)', 'Clinical endpoint technology and eCOA solutions.', 'api', { vendor: 'Clario', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('castor-edc', 'Castor EDC', 'User-friendly EDC platform for clinical research.', 'api', { vendor: 'Castor', license: 'Commercial', tier: 2, category: 'EDC System' }),
  t('ert-ecoa', 'ERT eCOA', 'Electronic clinical outcome assessment platform.', 'api', { vendor: 'ERT/Clario', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('signant-health', 'Signant Health', 'Patient engagement and clinical outcome assessment.', 'api', { vendor: 'Signant Health', license: 'Commercial', tier: 1, category: 'EDC System' }),
  t('clinpal', 'ClinPal', 'Patient-centric clinical trial platform.', 'api', { vendor: 'ClinPal', license: 'Commercial', tier: 2, category: 'EDC System' }),

  // CTMS (8)
  t('oracle-siebel-ctms', 'Oracle Siebel CTMS', 'Clinical trial management system for study planning and tracking.', 'api', { vendor: 'Oracle', version: '8.2+', license: 'Commercial', tier: 1, category: 'CTMS' }),
  t('veeva-vault-ctms', 'Veeva Vault CTMS', 'Cloud-based clinical trial management system.', 'api', { vendor: 'Veeva Systems', license: 'Commercial', tier: 1, category: 'CTMS' }),
  t('medidata-ctms', 'Medidata Clinical Cloud CTMS', 'Unified clinical trial management platform.', 'api', { vendor: 'Medidata', license: 'Commercial', tier: 1, category: 'CTMS' }),
  t('bioclinica-ctms', 'BioClinica CTMS', 'Clinical trial management and imaging solutions.', 'api', { vendor: 'BioClinica', license: 'Commercial', tier: 2, category: 'CTMS' }),
  t('trial-interactive', 'Trial Interactive', 'Clinical trial management and collaboration platform.', 'api', { vendor: 'Trial Interactive', license: 'Commercial', tier: 2, category: 'CTMS' }),
  t('forte-ctms', 'Forte CTMS', 'Clinical trial management system for study operations.', 'api', { vendor: 'Forte Research', license: 'Commercial', tier: 2, category: 'CTMS' }),
  t('clinone', 'ClinOne', 'Unified clinical trial platform for study management.', 'api', { vendor: 'ClinOne', license: 'Commercial', tier: 2, category: 'CTMS' }),
  t('gobalto', 'goBalto', 'Clinical trial startup acceleration platform.', 'api', { vendor: 'goBalto', license: 'Commercial', tier: 2, category: 'CTMS' }),

  // RESEARCH DATABASES (15)
  t('pubmed-api', 'PubMed/MEDLINE', 'Premier biomedical literature database with 35M+ citations.', 'api', { vendor: 'NCBI/NLM', license: 'Free', tier: 1, category: 'Research Database' }),
  t('clinicaltrials-gov', 'ClinicalTrials.gov', 'Database of clinical studies conducted around the world.', 'api', { vendor: 'NLM', license: 'Free', tier: 1, category: 'Research Database' }),
  t('cochrane-library', 'Cochrane Library', 'High-quality evidence for healthcare decision-making.', 'api', { vendor: 'Cochrane', license: 'Subscription', tier: 1, category: 'Research Database' }),
  t('embase', 'Embase', 'Biomedical and pharmacological database with drug focus.', 'api', { vendor: 'Elsevier', license: 'Subscription', tier: 1, category: 'Research Database' }),
  t('scopus', 'Scopus', 'Abstract and citation database of peer-reviewed literature.', 'api', { vendor: 'Elsevier', license: 'Subscription', tier: 1, category: 'Research Database' }),
  t('web-of-science', 'Web of Science', 'Citation indexing service for scientific literature.', 'api', { vendor: 'Clarivate', license: 'Subscription', tier: 1, category: 'Research Database' }),
  t('semantic-scholar', 'Semantic Scholar', 'AI-powered research tool for scientific literature.', 'api', { vendor: 'Allen Institute for AI', license: 'Free', tier: 1, category: 'Research Database' }),
  t('arxiv', 'arXiv', 'Open-access archive for preprints in physics, math, and CS.', 'api', { vendor: 'Cornell University', license: 'Free', tier: 1, category: 'Research Database' }),
  t('biorxiv', 'bioRxiv', 'Preprint server for biology.', 'api', { vendor: 'Cold Spring Harbor', license: 'Free', tier: 1, category: 'Research Database' }),
  t('medrxiv', 'medRxiv', 'Preprint server for health sciences.', 'api', { vendor: 'Cold Spring Harbor', license: 'Free', tier: 1, category: 'Research Database' }),
  t('google-scholar', 'Google Scholar', 'Search engine for scholarly literature.', 'api', { vendor: 'Google', license: 'Free', tier: 1, category: 'Research Database' }),
  t('dimensions', 'Dimensions', 'Linked research information system.', 'api', { vendor: 'Digital Science', license: 'Freemium', tier: 2, category: 'Research Database' }),
  t('openalex', 'OpenAlex', 'Open catalog of scholarly papers and authors.', 'api', { vendor: 'OurResearch', license: 'CC0', tier: 1, category: 'Research Database' }),
  t('europe-pmc', 'Europe PMC', 'Open science platform for life sciences literature.', 'api', { vendor: 'EMBL-EBI', license: 'Free', tier: 1, category: 'Research Database' }),
  t('crossref', 'Crossref', 'DOI registration and metadata for scholarly content.', 'api', { vendor: 'Crossref', license: 'Free', tier: 1, category: 'Research Database' }),

  // REGULATORY (10)
  t('fda-drugs', 'FDA Drugs@FDA', 'FDA database of approved drug products.', 'api', { vendor: 'FDA', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('fda-devices', 'FDA Device Database', 'FDA database of medical devices.', 'api', { vendor: 'FDA', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('ema-medicines', 'EMA Medicines Database', 'European Medicines Agency authorized medicines.', 'api', { vendor: 'EMA', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('dailymed', 'DailyMed', 'Official provider of FDA label information.', 'api', { vendor: 'NLM', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('rxnorm', 'RxNorm', 'Normalized names for clinical drugs.', 'api', { vendor: 'NLM', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('nice-guidelines', 'NICE Guidelines', 'UK NICE clinical guidelines and technology appraisals.', 'api', { vendor: 'NICE', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('ich-guidelines', 'ICH Guidelines', 'International Council for Harmonisation guidelines.', 'api', { vendor: 'ICH', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('who-essential-medicines', 'WHO Essential Medicines', 'WHO Model List of Essential Medicines.', 'api', { vendor: 'WHO', license: 'Free', tier: 1, category: 'Regulatory' }),
  t('pmda-japan', 'PMDA Japan', 'Japanese Pharmaceuticals and Medical Devices Agency.', 'api', { vendor: 'PMDA', license: 'Free', tier: 2, category: 'Regulatory' }),
  t('health-canada', 'Health Canada Drug Database', 'Canadian drug product database.', 'api', { vendor: 'Health Canada', license: 'Free', tier: 2, category: 'Regulatory' }),

  // HEOR & DECISION ANALYSIS (10)
  t('treeage-pro', 'TreeAge Pro', 'Decision analysis and health economic modeling software.', 'function', { vendor: 'TreeAge Software', license: 'Commercial', tier: 1, category: 'Decision Analysis' }),
  t('crystal-ball', 'Oracle Crystal Ball', 'Predictive modeling and Monte Carlo simulation.', 'function', { vendor: 'Oracle', license: 'Commercial', tier: 1, category: 'Decision Analysis' }),
  t('at-risk', '@RISK', 'Risk analysis and Monte Carlo simulation for Excel.', 'function', { vendor: 'Palisade', version: '8.0+', license: 'Commercial', tier: 1, category: 'Decision Analysis' }),
  t('analytica', 'Analytica', 'Visual software for quantitative decision models.', 'function', { vendor: 'Lumina Decision Systems', license: 'Commercial', tier: 2, category: 'Decision Analysis' }),
  t('r-heemod', 'R heemod Package', 'Health Economic Evaluation MODelling in R.', 'function', { vendor: 'Open Source', license: 'GPL-3', tier: 1, category: 'Decision Analysis' }),
  t('r-bcea', 'R BCEA Package', 'Bayesian Cost-Effectiveness Analysis in R.', 'function', { vendor: 'Open Source', license: 'GPL-3', tier: 1, category: 'Decision Analysis' }),
  t('r-hesim', 'R hesim Package', 'Health Economic Simulation Modeling in R.', 'function', { vendor: 'Open Source', license: 'GPL-3', tier: 1, category: 'Decision Analysis' }),
  t('amua', 'Amua', 'Open-source probabilistic modeling framework.', 'function', { vendor: 'Open Source', license: 'GPL-3', tier: 2, category: 'Decision Analysis' }),
  t('simul8', 'SIMUL8', 'Simulation software for process improvement.', 'function', { vendor: 'SIMUL8 Corporation', license: 'Commercial', tier: 2, category: 'Simulation' }),
  t('arena', 'Arena Simulation', 'Discrete event simulation and automation.', 'function', { vendor: 'Rockwell Automation', license: 'Commercial', tier: 2, category: 'Simulation' }),

  // PRO/COA TOOLS (8)
  t('proqolid', 'PROQOLID', 'Patient-Reported Outcome and QoL Instruments Database.', 'api', { vendor: 'Mapi Research Trust', license: 'Subscription', tier: 1, category: 'PRO Registry' }),
  t('eprovide', 'ePROVIDE', 'PRO instruments and linguistic validation platform.', 'api', { vendor: 'Mapi Research Trust', license: 'Subscription', tier: 1, category: 'PRO Registry' }),
  t('promis', 'PROMIS', 'Patient-Reported Outcomes Measurement Information System.', 'api', { vendor: 'NIH', license: 'Free', tier: 1, category: 'PRO Registry' }),
  t('cosmin', 'COSMIN Database', 'Standards for health Measurement INstruments.', 'api', { vendor: 'COSMIN', license: 'Free', tier: 1, category: 'PRO Registry' }),
  t('eortc-qlq', 'EORTC QLQ', 'Cancer Quality of Life Questionnaires.', 'api', { vendor: 'EORTC', license: 'Free/License', tier: 1, category: 'PRO Registry' }),
  t('eq-5d', 'EQ-5D', 'Health-related quality of life measure.', 'api', { vendor: 'EuroQol', license: 'License Required', tier: 1, category: 'PRO Registry' }),
  t('sf-36', 'SF-36 Health Survey', '36-Item Short Form Health Survey.', 'api', { vendor: 'RAND/QualityMetric', license: 'License Required', tier: 1, category: 'PRO Registry' }),
  t('fact-scales', 'FACT Scales', 'Functional Assessment of Cancer Therapy scales.', 'api', { vendor: 'FACIT.org', license: 'License Required', tier: 1, category: 'PRO Registry' }),

  // AI/ML & ORCHESTRATION (12)
  t('langchain', 'LangChain', 'Framework for developing LLM-powered applications.', 'function', { vendor: 'LangChain', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('langgraph', 'LangGraph', 'Library for stateful multi-actor LLM applications.', 'function', { vendor: 'LangChain', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('crewai', 'CrewAI', 'Framework for orchestrating role-playing AI agents.', 'function', { vendor: 'CrewAI', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('autogen', 'AutoGen', 'Multi-agent conversational AI systems framework.', 'function', { vendor: 'Microsoft', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('llamaindex', 'LlamaIndex', 'Data framework for LLM applications.', 'function', { vendor: 'LlamaIndex', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('haystack', 'Haystack', 'End-to-end NLP framework for search systems.', 'function', { vendor: 'deepset', license: 'Apache-2.0', tier: 1, category: 'AI Orchestration' }),
  t('semantic-kernel', 'Semantic Kernel', 'SDK for integrating LLMs into applications.', 'function', { vendor: 'Microsoft', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('dspy', 'DSPy', 'Framework for programming with foundation models.', 'function', { vendor: 'Stanford NLP', license: 'MIT', tier: 1, category: 'AI Orchestration' }),
  t('openai-api', 'OpenAI API', 'API access to GPT models.', 'api', { vendor: 'OpenAI', license: 'Commercial', tier: 1, category: 'AI API' }),
  t('anthropic-api', 'Anthropic Claude API', 'API access to Claude models.', 'api', { vendor: 'Anthropic', license: 'Commercial', tier: 1, category: 'AI API' }),
  t('google-gemini', 'Google Gemini API', 'API access to Google Gemini models.', 'api', { vendor: 'Google', license: 'Commercial', tier: 1, category: 'AI API' }),
  t('huggingface', 'Hugging Face', 'Platform for ML models and datasets.', 'api', { vendor: 'Hugging Face', license: 'Various', tier: 1, category: 'AI API' }),

  // STRATEGIC INTELLIGENCE (15)
  t('tavily-search', 'Tavily Search', 'AI-powered search API for real-time web information.', 'api', { vendor: 'Tavily', license: 'Commercial', tier: 1, category: 'Strategic Intelligence' }),
  t('perplexity-api', 'Perplexity API', 'AI-powered search and answer engine.', 'api', { vendor: 'Perplexity', license: 'Commercial', tier: 1, category: 'Strategic Intelligence' }),
  t('serper-api', 'Serper API', 'Google Search API for programmatic access.', 'api', { vendor: 'Serper', license: 'Commercial', tier: 1, category: 'Strategic Intelligence' }),
  t('news-api', 'NewsAPI', 'API for searching worldwide news articles.', 'api', { vendor: 'NewsAPI', license: 'Freemium', tier: 1, category: 'Strategic Intelligence' }),
  t('alpha-vantage', 'Alpha Vantage', 'Financial data API for stocks and crypto.', 'api', { vendor: 'Alpha Vantage', license: 'Freemium', tier: 2, category: 'Strategic Intelligence' }),
  t('wolfram-alpha', 'Wolfram Alpha', 'Computational knowledge engine.', 'api', { vendor: 'Wolfram', license: 'Commercial', tier: 1, category: 'Computation' }),
  t('exa-search', 'Exa Search', 'Neural search engine for similar content.', 'api', { vendor: 'Exa', license: 'Commercial', tier: 1, category: 'Strategic Intelligence' }),
  t('you-search', 'You.com Search API', 'AI-powered search API.', 'api', { vendor: 'You.com', license: 'Commercial', tier: 2, category: 'Strategic Intelligence' }),
  t('brave-search', 'Brave Search API', 'Privacy-focused search API.', 'api', { vendor: 'Brave', license: 'Commercial', tier: 2, category: 'Strategic Intelligence' }),
  t('firecrawl', 'Firecrawl', 'Web scraping and crawling API.', 'api', { vendor: 'Firecrawl', license: 'Commercial', tier: 1, category: 'Strategic Intelligence' }),
  t('jina-reader', 'Jina Reader', 'Web content extraction API.', 'api', { vendor: 'Jina AI', license: 'Free', tier: 1, category: 'Strategic Intelligence' }),
  t('diffbot', 'Diffbot', 'AI-powered web data extraction.', 'api', { vendor: 'Diffbot', license: 'Commercial', tier: 2, category: 'Strategic Intelligence' }),
  t('apify', 'Apify', 'Web scraping and automation platform.', 'api', { vendor: 'Apify', license: 'Freemium', tier: 2, category: 'Strategic Intelligence' }),
  t('scrapingbee', 'ScrapingBee', 'Web scraping API with JS rendering.', 'api', { vendor: 'ScrapingBee', license: 'Commercial', tier: 2, category: 'Strategic Intelligence' }),
  t('browserless', 'Browserless', 'Headless browser automation service.', 'api', { vendor: 'Browserless', license: 'Commercial', tier: 2, category: 'Strategic Intelligence' }),

  // MEDICAL IMAGING & BIOINFORMATICS (10)
  t('3d-slicer', '3D Slicer', 'Open-source platform for medical image computing.', 'function', { vendor: 'Open Source', license: 'BSD', tier: 1, category: 'Medical Imaging' }),
  t('itk-snap', 'ITK-SNAP', 'Software for segmentation of 3D medical images.', 'function', { vendor: 'Open Source', license: 'GPL', tier: 1, category: 'Medical Imaging' }),
  t('freesurfer', 'FreeSurfer', 'Brain imaging analysis software.', 'function', { vendor: 'MGH', license: 'Free', tier: 1, category: 'Medical Imaging' }),
  t('fsl', 'FSL', 'Comprehensive library of brain imaging analysis tools.', 'function', { vendor: 'Oxford', license: 'Free', tier: 1, category: 'Medical Imaging' }),
  t('ants', 'ANTs', 'Advanced Normalization Tools for neuroimaging.', 'function', { vendor: 'Penn Image Computing', license: 'Apache-2.0', tier: 1, category: 'Medical Imaging' }),
  t('blast', 'NCBI BLAST', 'Basic Local Alignment Search Tool for sequences.', 'api', { vendor: 'NCBI', license: 'Free', tier: 1, category: 'Bioinformatics' }),
  t('ensembl', 'Ensembl', 'Genome browser and annotation database.', 'api', { vendor: 'EMBL-EBI', license: 'Free', tier: 1, category: 'Bioinformatics' }),
  t('uniprot', 'UniProt', 'Universal Protein Resource database.', 'api', { vendor: 'UniProt Consortium', license: 'CC-BY', tier: 1, category: 'Bioinformatics' }),
  t('kegg', 'KEGG', 'Kyoto Encyclopedia of Genes and Genomes.', 'api', { vendor: 'Kanehisa Labs', license: 'Academic Free', tier: 1, category: 'Bioinformatics' }),
  t('string-db', 'STRING', 'Protein-protein interaction networks database.', 'api', { vendor: 'STRING Consortium', license: 'CC-BY', tier: 1, category: 'Bioinformatics' }),

  // HEALTHCARE INTEROPERABILITY (8)
  t('hapi-fhir', 'HAPI FHIR', 'Open-source FHIR implementation in Java.', 'function', { vendor: 'Smile CDR', license: 'Apache-2.0', tier: 1, category: 'Healthcare/FHIR' }),
  t('smart-on-fhir', 'SMART on FHIR', 'Standards-based apps that work across EHR systems.', 'api', { vendor: 'Boston Children\'s', license: 'Open', tier: 1, category: 'Healthcare/FHIR' }),
  t('cds-hooks', 'CDS Hooks', 'Clinical Decision Support integration standard.', 'api', { vendor: 'HL7', license: 'Open', tier: 1, category: 'Healthcare/CDS' }),
  t('ihe-profiles', 'IHE Profiles', 'Integrating the Healthcare Enterprise profiles.', 'api', { vendor: 'IHE', license: 'Open', tier: 1, category: 'Healthcare/Interoperability' }),
  t('omop-cdm', 'OMOP CDM', 'Observational Medical Outcomes Partnership Common Data Model.', 'function', { vendor: 'OHDSI', license: 'Apache-2.0', tier: 1, category: 'Healthcare/RWE' }),
  t('atlas-ohdsi', 'ATLAS', 'OHDSI analytics platform for observational data.', 'function', { vendor: 'OHDSI', license: 'Apache-2.0', tier: 1, category: 'Healthcare/RWE' }),
  t('achilles', 'ACHILLES', 'Automated Characterization of Health Information.', 'function', { vendor: 'OHDSI', license: 'Apache-2.0', tier: 1, category: 'Healthcare/RWE' }),
  t('synthea', 'Synthea', 'Synthetic patient population simulator.', 'function', { vendor: 'MITRE', license: 'Apache-2.0', tier: 1, category: 'Healthcare/Simulation' }),
];

export async function POST(request: NextRequest) {
  try {
    console.log('🛠️ [Seed All Tools] Starting comprehensive tools seeding...');
    console.log(`📊 [Seed All Tools] Tools to seed: ${ALL_TOOLS.length}`);

    // Get current tool count
    const { count: existingCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 [Seed All Tools] Existing tools: ${existingCount}`);

    // Upsert all tools (update if exists, insert if not)
    // Using slug as the unique identifier per the Gold Standard schema
    const { data, error } = await supabase
      .from('tools')
      .upsert(ALL_TOOLS, { 
        onConflict: 'slug',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ [Seed All Tools] Error seeding tools:', error);
      return NextResponse.json({ 
        error: 'Failed to seed tools', 
        details: error.message 
      }, { status: 500 });
    }

    // Get new tool count
    const { count: newCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ [Seed All Tools] Seeding completed. Total tools: ${newCount}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Tools seeded successfully',
      previousCount: existingCount || 0,
      newCount: newCount || 0,
      toolsAdded: (newCount || 0) - (existingCount || 0),
      totalToolsInSeed: ALL_TOOLS.length
    });

  } catch (error) {
    console.error('❌ [Seed All Tools] Seeding failed:', error);
    return NextResponse.json({ 
      error: 'Seeding failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { count: toolCount } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ 
      success: true,
      currentTools: toolCount || 0,
      availableToSeed: ALL_TOOLS.length
    });

  } catch (error) {
    console.error('❌ [Seed All Tools] Check failed:', error);
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

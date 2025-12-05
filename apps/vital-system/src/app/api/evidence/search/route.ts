/**
 * External Evidence Search API
 *
 * Unified API for searching external evidence sources:
 * - ClinicalTrials.gov
 * - FDA OpenFDA
 * - PubMed (via NCBI E-utilities)
 * - EMA (guidance/instructions)
 * - WHO Essential Medicines (guidance/instructions)
 */

import { NextRequest, NextResponse } from 'next/server';

// ClinicalTrials.gov API v2
async function searchClinicalTrials(query: string, options: { phase?: string; status?: string; maxResults?: number }) {
  const params = new URLSearchParams();
  params.append('query.term', query);
  params.append('pageSize', String(options.maxResults || 10));
  params.append('format', 'json');

  if (options.phase && options.phase !== 'all') {
    params.append('query.phase', `PHASE${options.phase}`);
  }

  if (options.status && options.status !== 'all') {
    params.append('query.status', options.status.toUpperCase());
  }

  const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${response.statusText}`);
  }

  const data = await response.json();
  const studies = data.studies || [];

  return studies.map((study: any) => {
    const protocolSection = study.protocolSection || {};
    const identificationModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const designModule = protocolSection.designModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
    const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};

    return {
      id: identificationModule.nctId || 'N/A',
      nctId: identificationModule.nctId,
      title: identificationModule.briefTitle || 'N/A',
      status: statusModule.overallStatus || 'Unknown',
      phase: designModule.phases?.join(', ') || 'N/A',
      conditions: conditionsModule.conditions || [],
      interventions: armsInterventionsModule.interventions?.map((i: any) => i.name) || [],
      sponsor: sponsorCollaboratorsModule.leadSponsor?.name || 'N/A',
      startDate: statusModule.startDateStruct?.date,
      completionDate: statusModule.completionDateStruct?.date,
      enrollmentCount: designModule.enrollmentInfo?.count,
      studyType: designModule.studyType || 'N/A',
      url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
      sourceType: 'clinical-trial',
    };
  });
}

// FDA OpenFDA API
async function searchFDA(query: string, options: { searchField?: string; maxResults?: number }) {
  let searchQuery: string;
  const field = options.searchField || 'all';

  if (field === 'all') {
    searchQuery = `openfda.brand_name:"${query}"+openfda.generic_name:"${query}"+products.active_ingredients.name:"${query}"`;
  } else if (field === 'brand_name') {
    searchQuery = `openfda.brand_name:"${query}"`;
  } else if (field === 'generic_name') {
    searchQuery = `openfda.generic_name:"${query}"`;
  } else if (field === 'indication') {
    searchQuery = `indications_and_usage:"${query}"`;
  } else if (field === 'sponsor_name') {
    searchQuery = `sponsor_name:"${query}"`;
  } else {
    searchQuery = query;
  }

  const url = `https://api.fda.gov/drug/drugsfda.json?search=${encodeURIComponent(searchQuery)}&limit=${options.maxResults || 10}`;
  const response = await fetch(url);

  if (!response.ok) {
    // FDA returns 404 when no results found
    if (response.status === 404) {
      return [];
    }
    throw new Error(`OpenFDA API error: ${response.statusText}`);
  }

  const data = await response.json();
  const results = data.results || [];

  return results.map((drug: any) => {
    const openfda = drug.openfda || {};
    const products = drug.products || [];
    const submissions = drug.submissions || [];

    const recentSubmission = submissions
      .filter((s: any) => s.submission_status === 'AP')
      .sort((a: any, b: any) => {
        return new Date(b.submission_status_date).getTime() - new Date(a.submission_status_date).getTime();
      })[0];

    return {
      id: drug.application_number || 'N/A',
      brandName: openfda.brand_name?.[0] || 'N/A',
      genericName: openfda.generic_name?.[0] || 'N/A',
      manufacturer: openfda.manufacturer_name?.[0] || drug.sponsor_name || 'N/A',
      approvalDate: recentSubmission?.submission_status_date || 'N/A',
      indication: products[0]?.active_ingredients?.[0]?.name || 'N/A',
      route: openfda.route || [],
      substanceName: openfda.substance_name?.[0] || 'N/A',
      approvalType: submissions[0]?.submission_type || 'N/A',
      url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${drug.application_number}`,
      sourceType: 'fda-approval',
    };
  });
}

// PubMed E-utilities API
async function searchPubMed(query: string, options: { maxResults?: number }) {
  const maxResults = options.maxResults || 10;

  // Step 1: Search for IDs
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    throw new Error(`PubMed search error: ${searchResponse.statusText}`);
  }

  const searchData = await searchResponse.json();
  const ids = searchData.esearchresult?.idlist || [];

  if (ids.length === 0) {
    return [];
  }

  // Step 2: Fetch details for the IDs
  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  const summaryResponse = await fetch(summaryUrl);

  if (!summaryResponse.ok) {
    throw new Error(`PubMed summary error: ${summaryResponse.statusText}`);
  }

  const summaryData = await summaryResponse.json();
  const results = summaryData.result || {};

  return ids.map((id: string) => {
    const article = results[id] || {};
    const authors = article.authors?.map((a: any) => a.name) || [];

    return {
      id: `PMID:${id}`,
      pmid: id,
      title: article.title || 'N/A',
      authors: authors.slice(0, 5),
      journal: article.source || 'N/A',
      publicationDate: article.pubdate || 'N/A',
      abstract: article.abstract || null, // Abstracts require separate fetch
      doi: article.elocationid || null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      sourceType: 'pubmed',
    };
  });
}

// EMA guidance (no API available)
function getEMAGuidance(query: string) {
  return {
    note: 'EMA does not provide a public REST API',
    searchUrl: `https://www.ema.europa.eu/en/medicines/field_ema_web_categories%253Aname_field/Human/ema_group_types/ema_medicine?search=${encodeURIComponent(query)}`,
    instructions: [
      '1. Visit the EMA medicines database',
      `2. Search for: ${query}`,
      '3. Review EPAR (European Public Assessment Reports)',
      '4. Check SmPC for prescribing information',
    ],
    resources: [
      {
        name: 'EMA Medicines Database',
        url: 'https://www.ema.europa.eu/en/medicines',
        description: 'Search all authorized medicines in the EU',
      },
      {
        name: 'European Public Assessment Reports',
        url: 'https://www.ema.europa.eu/en/medicines/download-medicine-data',
        description: 'Scientific assessment reports for centrally authorized products',
      },
    ],
    sourceType: 'ema-guidance',
  };
}

// WHO Essential Medicines guidance (no API available)
function getWHOGuidance(query: string) {
  return {
    note: 'WHO Essential Medicines List does not have a public API',
    searchUrl: `https://list.essentialmeds.org/?query=${encodeURIComponent(query)}`,
    instructions: [
      '1. Visit https://list.essentialmeds.org/',
      `2. Search for: ${query}`,
      '3. Check if listed in Core or Complementary List',
      '4. Review ATC classification and therapeutic use',
    ],
    resources: [
      {
        name: 'WHO EML Web Portal',
        url: 'https://list.essentialmeds.org/',
        description: 'Searchable web interface for Essential Medicines List',
      },
      {
        name: 'WHO Model List (PDF)',
        url: 'https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02',
        description: '23rd edition (2023) - Complete PDF list',
      },
    ],
    whatIsEML: {
      purpose: 'Medicines that satisfy priority health care needs of a population',
      coreList: 'Minimum medicine needs for a basic healthcare system',
      complementaryList: 'For priority diseases requiring specialized facilities',
    },
    sourceType: 'who-guidance',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, query, maxResults = 10, options = {} } = body;

    if (!source || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: source and query' },
        { status: 400 }
      );
    }

    let results: any;
    let metadata: any = {
      source,
      query,
      timestamp: new Date().toISOString(),
      maxResults,
    };

    switch (source) {
      case 'clinicaltrials':
        results = await searchClinicalTrials(query, { ...options, maxResults });
        metadata.totalResults = results.length;
        break;

      case 'fda':
        results = await searchFDA(query, { ...options, maxResults });
        metadata.totalResults = results.length;
        break;

      case 'pubmed':
        results = await searchPubMed(query, { maxResults });
        metadata.totalResults = results.length;
        break;

      case 'ema':
        results = getEMAGuidance(query);
        metadata.apiAvailable = false;
        break;

      case 'who':
        results = getWHOGuidance(query);
        metadata.apiAvailable = false;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown source: ${source}. Supported: clinicaltrials, fda, pubmed, ema, who` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata,
    });
  } catch (error) {
    console.error('Evidence search error:', error);
    return NextResponse.json(
      {
        error: 'Evidence search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const query = searchParams.get('query');
  const maxResults = parseInt(searchParams.get('maxResults') || '10', 10);

  if (!source || !query) {
    return NextResponse.json(
      { error: 'Missing required query parameters: source and query' },
      { status: 400 }
    );
  }

  // Delegate to POST handler
  const body = { source, query, maxResults };
  const fakeRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

  return POST(fakeRequest);
}

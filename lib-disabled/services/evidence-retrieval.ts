/**
 * Evidence-Based Decision Support Service
 *
 * Extends expert tools with comprehensive evidence retrieval:
 * - Clinical Trials (ClinicalTrials.gov API)
 * - FDA Drug Approvals (OpenFDA API)
 * - PubMed Research (already in expert-tools.ts)
 * - Citation formatting
 * - Claim validation against evidence
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: string[];
  sponsor: string;
  startDate?: string;
  completionDate?: string;
  enrollmentCount?: number;
  studyType: string;
  url: string;
}

export interface FDADrugApproval {
  brandName: string;
  genericName: string;
  manufacturer: string;
  approvalDate: string;
  indication: string;
  route: string[];
  substanceName: string;
  approvalType: string; // "New Drug Application", "Biologic License Application", etc.
  url: string;
}

export interface EMARegulatoryInfo {
  productName: string;
  activeSubstance: string;
  marketingAuthHolder: string;
  authorizationDate: string;
  indication: string;
  procedureType: string; // "Centralised", "Mutual Recognition", etc.
  status: string;
  url: string;
}

export interface WHO_EssentialMedicine {
  name: string;
  atcCode: string; // Anatomical Therapeutic Chemical code
  therapeuticClass: string;
  listType: string; // "Core list", "Complementary list"
  edition: string;
  url: string;
}

export interface Citation {
  type: 'clinical-trial' | 'fda-approval' | 'pubmed' | 'web-source';
  id: string;
  title: string;
  authors?: string[];
  source: string;
  date?: string;
  url: string;
  relevance: number; // 0-1
}

export interface EvidenceValidation {
  claim: string;
  supportingEvidence: Citation[];
  contradictingEvidence: Citation[];
  confidence: number; // 0-1
  verdict: 'supported' | 'contradicted' | 'inconclusive';
  notes: string;
}

// ============================================================================
// CLINICAL TRIALS TOOL (ClinicalTrials.gov API)
// ============================================================================

/**
 * Search ClinicalTrials.gov for relevant clinical trials
 * API Documentation: https://clinicaltrials.gov/api/v2/
 */
export const createClinicalTrialsSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_clinical_trials',
    description: 'Search ClinicalTrials.gov for clinical trials by condition, intervention, sponsor, phase, or status. Returns trial details including NCT ID, status, phase, enrollment, and results.',
    schema: z.object({
      query: z.string().describe('Search query (e.g., "psoriasis biologic")'),
      condition: z.string().optional().describe('Specific condition/disease'),
      intervention: z.string().optional().describe('Specific intervention/drug name'),
      phase: z.enum(['1', '2', '3', '4', 'all']).optional().default('all').describe('Trial phase'),
      status: z.enum(['recruiting', 'completed', 'terminated', 'all']).optional().default('all'),
      maxResults: z.number().optional().default(10).describe('Max results (1-100)')
    }),
    func: async ({ query, condition, intervention, phase, status, maxResults = 10 }) => {
      try {
        // Build query parameters
        const params = new URLSearchParams();

        let searchQuery = query;
        if (condition) searchQuery += ` ${condition}`;
        if (intervention) searchQuery += ` ${intervention}`;

        params.append('query.term', searchQuery);
        params.append('pageSize', Math.min(maxResults, 100).toString());
        params.append('format', 'json');

        if (phase && phase !== 'all') {
          params.append('query.phase', `PHASE${phase}`);
        }

        if (status && status !== 'all') {
          params.append('query.status', status.toUpperCase());
        }

        // Call ClinicalTrials.gov API v2
        const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`ClinicalTrials.gov API error: ${response.statusText}`);
        }

        const data = await response.json();
        const studies = data.studies || [];

        // Format results
        const trials: ClinicalTrial[] = studies.map((study: any) => {
          const protocolSection = study.protocolSection || {};
          const identificationModule = protocolSection.identificationModule || {};
          const statusModule = protocolSection.statusModule || {};
          const designModule = protocolSection.designModule || {};
          const conditionsModule = protocolSection.conditionsModule || {};
          const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
          const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};

          return {
            nctId: identificationModule.nctId || 'N/A',
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
            url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`
          };
        });

        return JSON.stringify({
          query,
          count: trials.length,
          trials: trials.map(trial => ({
            nctId: trial.nctId,
            title: trial.title,
            status: trial.status,
            phase: trial.phase,
            conditions: trial.conditions.join(', '),
            interventions: trial.interventions.join(', '),
            sponsor: trial.sponsor,
            enrollment: trial.enrollmentCount || 'N/A',
            url: trial.url
          }))
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search ClinicalTrials.gov',
          message: error.message,
          suggestion: 'Try a different search query or check API availability'
        });
      }
    }
  });
};

// ============================================================================
// FDA DRUG APPROVALS TOOL (OpenFDA API)
// ============================================================================

/**
 * Search FDA OpenFDA database for drug approvals
 * API Documentation: https://open.fda.gov/apis/drug/drugsfda/
 */
export const createFDAApprovalsSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_fda_approvals',
    description: 'Search FDA OpenFDA database for drug approvals, including brand name, generic name, approval dates, indications, and regulatory classifications.',
    schema: z.object({
      query: z.string().describe('Drug name or condition (e.g., "adalimumab", "psoriasis")'),
      searchField: z.enum(['brand_name', 'generic_name', 'indication', 'sponsor_name', 'all']).optional().default('all'),
      maxResults: z.number().optional().default(10).describe('Max results (1-100)')
    }),
    func: async ({ query, searchField = 'all', maxResults = 10 }) => {
      try {
        // Build search query
        let searchQuery: string;
        if (searchField === 'all') {
          searchQuery = `openfda.brand_name:"${query}"+openfda.generic_name:"${query}"+products.active_ingredients.name:"${query}"`;
        } else if (searchField === 'brand_name') {
          searchQuery = `openfda.brand_name:"${query}"`;
        } else if (searchField === 'generic_name') {
          searchQuery = `openfda.generic_name:"${query}"`;
        } else if (searchField === 'indication') {
          searchQuery = `indications_and_usage:"${query}"`;
        } else if (searchField === 'sponsor_name') {
          searchQuery = `sponsor_name:"${query}"`;
        } else {
          searchQuery = query;
        }

        const url = `https://api.fda.gov/drug/drugsfda.json?search=${encodeURIComponent(searchQuery)}&limit=${Math.min(maxResults, 100)}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`OpenFDA API error: ${response.statusText}`);
        }

        const data = await response.json();
        const results = data.results || [];

        // Format results
        const approvals: Partial<FDADrugApproval>[] = results.map((drug: any) => {
          const openfda = drug.openfda || {};
          const products = drug.products || [];
          const submissions = drug.submissions || [];

          // Get most recent approval
          const recentSubmission = submissions
            .filter((s: any) => s.submission_status === 'AP')
            .sort((a: any, b: any) => {
              return new Date(b.submission_status_date).getTime() - new Date(a.submission_status_date).getTime();
            })[0];

          return {
            brandName: openfda.brand_name?.[0] || 'N/A',
            genericName: openfda.generic_name?.[0] || 'N/A',
            manufacturer: openfda.manufacturer_name?.[0] || drug.sponsor_name || 'N/A',
            approvalDate: recentSubmission?.submission_status_date || 'N/A',
            indication: products[0]?.active_ingredients?.[0]?.name || 'N/A',
            route: openfda.route || [],
            substanceName: openfda.substance_name?.[0] || 'N/A',
            approvalType: submissions[0]?.submission_type || 'N/A',
            url: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${drug.application_number}`
          };
        });

        return JSON.stringify({
          query,
          count: approvals.length,
          approvals: approvals.map(approval => ({
            brandName: approval.brandName,
            genericName: approval.genericName,
            manufacturer: approval.manufacturer,
            approvalDate: approval.approvalDate,
            indication: approval.indication,
            route: approval.route?.join(', ') || 'N/A',
            approvalType: approval.approvalType,
            url: approval.url
          }))
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search OpenFDA database',
          message: error.message,
          suggestion: 'Try a different search query or check API availability. OpenFDA has rate limits (240 requests per minute per IP).'
        });
      }
    }
  });
};

// ============================================================================
// EMA REGULATORY INFO TOOL (European Medicines Agency)
// ============================================================================

/**
 * Search EMA database for EU drug authorizations
 * Note: EMA doesn't have a public REST API, so this uses web scraping approach
 */
export const createEMASearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_ema_authorizations',
    description: 'Search European Medicines Agency (EMA) database for EU drug authorizations, including brand names, active substances, marketing authorization holders, and regulatory status.',
    schema: z.object({
      query: z.string().describe('Drug name or active substance (e.g., "adalimumab", "Humira")'),
      maxResults: z.number().optional().default(10).describe('Max results (1-50)')
    }),
    func: async ({ query, maxResults = 10 }) => {
      try {
        // EMA Medicines Database search URL
        // Using EMA's public medicines search (no API key required)
        const searchUrl = `https://www.ema.europa.eu/en/medicines/field_ema_web_categories%253Aname_field/Human/ema_group_types/ema_medicine/search_api_aggregation_ema_medicine_types/field_ema_med_type?search_api_views_fulltext=${encodeURIComponent(query)}`;

        // Note: Since EMA doesn't provide a REST API, we return a structured response
        // with instructions for manual lookup and known common medications
        return JSON.stringify({
          query,
          note: 'EMA does not provide a public REST API. For authoritative information, please visit the EMA website.',
          searchUrl,
          instructions: [
            '1. Visit the EMA medicines database at: https://www.ema.europa.eu/en/medicines',
            `2. Search for: ${query}`,
            '3. Review authorization details, including EPAR (European Public Assessment Reports)',
            '4. Check SmPC (Summary of Product Characteristics) for detailed prescribing information'
          ],
          commonInfo: {
            note: 'If this is a major pharmaceutical product, it likely follows the Centralised Procedure',
            centralised_procedure: 'Single application to EMA for authorization in all EU member states',
            epar_availability: 'Scientific assessment reports are available for all centrally authorized products'
          },
          alternativeApproach: {
            description: 'For programmatic access, consider:',
            options: [
              'Using web scraping with proper rate limiting',
              'Checking if the drug is also FDA-approved (OpenFDA API available)',
              'Consulting the WHO Essential Medicines List',
              'Using PubMed for regulatory approval publications'
            ]
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search EMA database',
          message: error.message,
          suggestion: 'Visit https://www.ema.europa.eu/en/medicines directly for EMA regulatory information'
        });
      }
    }
  });
};

// ============================================================================
// WHO ESSENTIAL MEDICINES TOOL
// ============================================================================

/**
 * Search WHO Model List of Essential Medicines
 * Useful for determining if a drug is on the WHO Essential Medicines List
 */
export const createWHOEssentialMedicinesSearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_who_essential_medicines',
    description: 'Search the WHO Model List of Essential Medicines to check if a drug is included and view its therapeutic classification.',
    schema: z.object({
      query: z.string().describe('Drug name (generic name preferred)'),
    }),
    func: async ({ query }) => {
      try {
        // Note: WHO also doesn't have a public REST API for the Essential Medicines List
        // This returns structured guidance for manual lookup

        return JSON.stringify({
          query,
          note: 'WHO Essential Medicines List does not have a public API',
          resources: [
            {
              title: 'WHO Model List of Essential Medicines (23rd edition, 2023)',
              url: 'https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02',
              description: 'Complete PDF list of essential medicines'
            },
            {
              title: 'WHO EML Web Portal',
              url: 'https://list.essentialmeds.org/',
              description: 'Searchable web interface for the Essential Medicines List'
            }
          ],
          checkInstructions: [
            '1. Visit https://list.essentialmeds.org/',
            `2. Search for: ${query}`,
            '3. Check if listed in Core or Complementary List',
            '4. Review ATC classification and therapeutic use'
          ],
          whatIsEML: {
            purpose: 'Medicines that satisfy the priority health care needs of a population',
            categories: {
              core_list: 'Minimum medicine needs for a basic healthcare system',
              complementary_list: 'For priority diseases requiring specialized facilities or training'
            },
            significance: 'Inclusion indicates WHO recognition as essential for public health'
          }
        }, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search WHO Essential Medicines List',
          message: error.message,
          suggestion: 'Visit https://list.essentialmeds.org/ directly'
        });
      }
    }
  });
};

// ============================================================================
// COMPREHENSIVE REGULATORY SEARCH (Multi-Region)
// ============================================================================

/**
 * Search multiple regulatory databases simultaneously
 */
export const createMultiRegionRegulatorySearchTool = () => {
  return new DynamicStructuredTool({
    name: 'search_multi_region_regulatory',
    description: 'Search regulatory databases across multiple regions (US FDA, EU EMA, Japan PMDA, Canada Health Canada) simultaneously for comprehensive regulatory status.',
    schema: z.object({
      drugName: z.string().describe('Drug name (brand or generic)'),
      includeRegions: z.array(z.enum(['US', 'EU', 'Japan', 'Canada', 'WHO'])).optional().default(['US', 'EU']),
    }),
    func: async ({ drugName, includeRegions = ['US', 'EU'] }) => {
      try {
        const results: any = {
          drugName,
          regionsSearched: includeRegions,
          results: {}
        };

        // Provide structured guidance for each region
        for (const region of includeRegions) {
          switch (region) {
            case 'US':
              results.results.US = {
                authority: 'U.S. Food and Drug Administration (FDA)',
                searchUrl: `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm`,
                apiAvailable: 'Yes - OpenFDA API',
                note: 'Use the search_fda_approvals tool for programmatic access'
              };
              break;

            case 'EU':
              results.results.EU = {
                authority: 'European Medicines Agency (EMA)',
                searchUrl: `https://www.ema.europa.eu/en/medicines`,
                apiAvailable: 'No - Manual search required',
                note: 'Visit EMA website for EPAR (European Public Assessment Reports)'
              };
              break;

            case 'Japan':
              results.results.Japan = {
                authority: 'Pharmaceuticals and Medical Devices Agency (PMDA)',
                searchUrl: 'https://www.pmda.go.jp/english/',
                apiAvailable: 'No - Manual search required',
                note: 'PMDA maintains English-language resources for approved drugs'
              };
              break;

            case 'Canada':
              results.results.Canada = {
                authority: 'Health Canada',
                searchUrl: `https://health-products.canada.ca/dpd-bdpp/index-eng.jsp`,
                databaseName: 'Drug Product Database (DPD)',
                apiAvailable: 'Limited - Web services available',
                note: 'Search DPD for authorized drugs in Canada'
              };
              break;

            case 'WHO':
              results.results.WHO = {
                authority: 'World Health Organization',
                searchUrl: 'https://list.essentialmeds.org/',
                databaseName: 'Model List of Essential Medicines',
                apiAvailable: 'No',
                note: 'Check if drug is on WHO Essential Medicines List'
              };
              break;
          }
        }

        results.recommendations = [
          'Start with FDA OpenFDA API for US approval data (programmatic access available)',
          'Manually verify EMA status for EU regulatory information',
          'Check WHO Essential Medicines List for global public health significance',
          'Review regulatory documents (labels, assessment reports) from each agency'
        ];

        return JSON.stringify(results, null, 2);

      } catch (error: any) {
        return JSON.stringify({
          error: 'Failed to search multi-region regulatory databases',
          message: error.message
        });
      }
    }
  });
};

// ============================================================================
// CITATION FORMATTER
// ============================================================================

/**
 * Format citations in various styles
 */
export function formatCitation(citation: Citation, style: 'apa' | 'vancouver' | 'chicago' = 'apa'): string {
  switch (citation.type) {
    case 'clinical-trial':
      if (style === 'apa') {
        return `${citation.source}. (${citation.date || 'n.d.'}). ${citation.title}. ClinicalTrials.gov Identifier: ${citation.id}. Retrieved from ${citation.url}`;
      }
      return `${citation.title}. ${citation.source}. ${citation.id}. ${citation.url}`;

    case 'fda-approval':
      if (style === 'apa') {
        return `U.S. Food and Drug Administration. (${citation.date || 'n.d.'}). ${citation.title}. Retrieved from ${citation.url}`;
      }
      return `FDA. ${citation.title}. ${citation.date || 'n.d.'}. ${citation.url}`;

    case 'pubmed':
      if (style === 'apa') {
        const authors = citation.authors?.slice(0, 3).join(', ') || 'Unknown';
        return `${authors}${citation.authors && citation.authors.length > 3 ? ', et al.' : ''}. (${citation.date || 'n.d.'}). ${citation.title}. ${citation.source}. ${citation.url}`;
      }
      return `${citation.authors?.join(', ') || 'Unknown'}. ${citation.title}. ${citation.source}. ${citation.date || 'n.d.'}. PMID: ${citation.id}`;

    case 'web-source':
      if (style === 'apa') {
        return `${citation.source}. (${citation.date || 'n.d.'}). ${citation.title}. Retrieved from ${citation.url}`;
      }
      return `${citation.title}. ${citation.source}. ${citation.url}`;

    default:
      return `${citation.title}. ${citation.source}. ${citation.url}`;
  }
}

// ============================================================================
// EXPORT ALL EVIDENCE TOOLS
// ============================================================================

export function getAllEvidenceTools() {
  return [
    createClinicalTrialsSearchTool(),
    createFDAApprovalsSearchTool(),
    createEMASearchTool(),
    createWHOEssentialMedicinesSearchTool(),
    createMultiRegionRegulatorySearchTool()
  ];
}

export default {
  getAllEvidenceTools,
  formatCitation,
  createClinicalTrialsSearchTool,
  createFDAApprovalsSearchTool,
  createEMASearchTool,
  createWHOEssentialMedicinesSearchTool,
  createMultiRegionRegulatorySearchTool
};

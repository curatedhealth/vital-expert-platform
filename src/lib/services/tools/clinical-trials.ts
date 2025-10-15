import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// LangChain Best Practice: Comprehensive schema for complex queries
const ClinicalTrialsSchema = z.object({
  query: z.string().describe('Search term (condition, drug, sponsor, or NCT number)'),
  status: z.array(z.enum([
    'RECRUITING',
    'NOT_YET_RECRUITING',
    'ACTIVE_NOT_RECRUITING',
    'COMPLETED',
    'TERMINATED',
    'SUSPENDED',
    'WITHDRAWN'
  ])).optional().describe('Recruitment status filters'),
  phase: z.array(z.enum(['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4', 'NA']))
    .optional().describe('Trial phase filters'),
  studyType: z.enum(['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS', 'ALL'])
    .optional().default('ALL'),
  location: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    distance: z.number().optional().describe('Distance in miles from location')
  }).optional(),
  ageGroup: z.array(z.enum(['CHILD', 'ADULT', 'OLDER_ADULT'])).optional(),
  sex: z.enum(['ALL', 'FEMALE', 'MALE']).optional().default('ALL'),
  healthy: z.boolean().optional().describe('Include healthy volunteer studies'),
  resultsFirst: z.boolean().optional().describe('Only trials with posted results'),
  maxResults: z.number().optional().default(10)
});

export class ClinicalTrialsTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'clinical_trials',
      description: `Search ClinicalTrials.gov database for:
        - Active, recruiting, and completed clinical trials
        - Trial protocols and inclusion/exclusion criteria
        - Trial results and adverse events
        - Sponsor information and trial locations
        - Patient recruitment opportunities
        Covers 470,000+ studies from all 50 states and 221 countries.`,
      schema: ClinicalTrialsSchema,
      func: async (input) => this.searchTrials(input)
    });
  }
  
  private async searchTrials(input: z.infer<typeof ClinicalTrialsSchema>): Promise<string> {
    try {
      // Use ClinicalTrials.gov API v2
      const baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
      
      // Build complex query
      const queryParts = [input.query];
      const filterParts = [];
      
      if (input.status?.length) {
        filterParts.push(`status:${input.status.join(',')}`);
      }
      
      if (input.phase?.length) {
        filterParts.push(`phase:${input.phase.join(',')}`);
      }
      
      if (input.studyType && input.studyType !== 'ALL') {
        filterParts.push(`studyType:${input.studyType}`);
      }
      
      if (input.location?.country) {
        filterParts.push(`location.country:${input.location.country}`);
      }
      
      if (input.resultsFirst) {
        filterParts.push('results:true');
      }
      
      const params = new URLSearchParams({
        'query.term': queryParts.join(' AND '),
        'filter': filterParts.join(' AND '),
        'pageSize': input.maxResults.toString(),
        'countTotal': 'true',
        'fields': 'NCTId,BriefTitle,Condition,InterventionName,Phase,OverallStatus,PrimaryCompletionDate,StudyType,LeadSponsorName,LocationFacility,EnrollmentCount,BriefSummary'
      });
      
      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`ClinicalTrials.gov API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatTrialResults(data);
      
    } catch (error) {
      console.error('ClinicalTrials search error:', error);
      return `Failed to search ClinicalTrials.gov: ${error.message}`;
    }
  }
  
  private formatTrialResults(data: any): string {
    if (!data.studies || data.studies.length === 0) {
      return 'No clinical trials found matching your criteria';
    }
    
    const totalCount = data.totalCount || data.studies.length;
    let output = `Found ${totalCount} clinical trials. Showing first ${data.studies.length}:\n\n`;
    
    return output + data.studies.map((study: any, index: number) => {
      const protocol = study.protocolSection || {};
      const idModule = protocol.identificationModule || {};
      const statusModule = protocol.statusModule || {};
      const descModule = protocol.descriptionModule || {};
      const designModule = protocol.designModule || {};
      const armsModule = protocol.armsInterventionsModule || {};
      const sponsorModule = protocol.sponsorCollaboratorsModule || {};
      const locationsModule = protocol.contactsLocationsModule || {};
      
      return `
Trial ${index + 1}:
NCT Number: ${idModule.nctId}
Title: ${idModule.briefTitle}
Status: ${statusModule.overallStatus}
Phase: ${designModule.phases?.join(', ') || 'N/A'}
Study Type: ${designModule.studyType}

Conditions: ${protocol.conditionsModule?.conditions?.join(', ') || 'Not specified'}
Interventions: ${armsModule.interventions?.map((i: any) => `${i.type}: ${i.name}`).join('; ') || 'None listed'}

Sponsor: ${sponsorModule.leadSponsor?.name || 'Not specified'}
Enrollment: ${designModule.enrollmentInfo?.count || 'Not specified'} participants

Primary Completion: ${statusModule.primaryCompletionDateStruct?.date || 'Not specified'}
Study Start: ${statusModule.startDateStruct?.date || 'Not specified'}

Brief Summary:
${descModule.briefSummary || 'No summary available'}

Locations: ${locationsModule.locations?.slice(0, 3).map((loc: any) => 
  `${loc.city}, ${loc.state || loc.country}`).join('; ') || 'Not specified'}
${locationsModule.locations?.length > 3 ? `... and ${locationsModule.locations.length - 3} more locations` : ''}

ClinicalTrials.gov URL: https://clinicaltrials.gov/study/${idModule.nctId}
`;
    }).join('\n' + '='.repeat(80) + '\n');
  }
}

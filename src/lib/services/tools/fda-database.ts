import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// LangChain Best Practice: Multiple search endpoints with specific schemas
const FDASearchSchema = z.object({
  searchType: z.enum([
    'drug_approval',
    'drug_label',
    'adverse_events',
    'recalls',
    'warning_letters',
    'medical_devices',
    '510k',
    'pma'
  ]).describe('Type of FDA database to search'),
  query: z.string().describe('Search query'),
  dateRange: z.object({
    start: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    end: z.string().optional().describe('End date (YYYY-MM-DD)')
  }).optional(),
  limit: z.number().optional().default(10)
});

export class FDADatabaseTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'fda_database',
      description: `Search FDA databases for:
        - Drug approvals (NDA, ANDA, BLA)
        - Drug labels and prescribing information
        - Adverse events (FAERS database)
        - Product recalls and safety alerts
        - Warning letters and enforcement actions
        - Medical device approvals (510(k), PMA, De Novo)
        - Medical device adverse events (MAUDE)`,
      schema: FDASearchSchema,
      func: async (input) => this.searchFDA(input)
    });
  }
  
  private async searchFDA(input: z.infer<typeof FDASearchSchema>): Promise<string> {
    try {
      const baseUrl = 'https://api.fda.gov';
      const endpoint = this.getEndpoint(input.searchType);
      
      // Build query based on search type
      let searchQuery = input.query;
      if (input.dateRange?.start || input.dateRange?.end) {
        const start = input.dateRange.start || '2020-01-01';
        const end = input.dateRange.end || new Date().toISOString().split('T')[0];
        searchQuery += `+AND+receivedate:[${start}+TO+${end}]`;
      }
      
      const params = new URLSearchParams({
        search: searchQuery,
        limit: input.limit.toString()
      });
      
      const response = await fetch(`${baseUrl}${endpoint}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'VITAL-Expert/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`FDA API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatFDAResults(data, input.searchType);
      
    } catch (error) {
      console.error('FDA search error:', error);
      return `FDA database search failed: ${error.message}`;
    }
  }
  
  private getEndpoint(searchType: string): string {
    const endpoints = {
      'drug_approval': '/drug/drugsfda.json',
      'drug_label': '/drug/label.json',
      'adverse_events': '/drug/event.json',
      'recalls': '/drug/enforcement.json',
      'warning_letters': '/other/inspection_citations.json',
      'medical_devices': '/device/classification.json',
      '510k': '/device/510k.json',
      'pma': '/device/pma.json'
    };
    return endpoints[searchType] || '/drug/drugsfda.json';
  }
  
  private formatFDAResults(data: any, searchType: string): string {
    if (!data.results || data.results.length === 0) {
      return 'No FDA records found';
    }
    
    const results = data.results;
    
    switch (searchType) {
      case 'drug_approval':
        return this.formatDrugApprovals(results);
      case 'adverse_events':
        return this.formatAdverseEvents(results);
      case 'medical_devices':
        return this.formatMedicalDevices(results);
      case 'recalls':
        return this.formatRecalls(results);
      default:
        return this.formatGenericResults(results);
    }
  }
  
  private formatDrugApprovals(results: any[]): string {
    return results.map((item: any, index: number) => {
      const app = item.products?.[0] || item;
      return `
Drug Approval ${index + 1}:
Application Number: ${item.application_number}
Brand Name: ${app.brand_name}
Generic Name: ${app.active_ingredients?.map((i: any) => i.name).join(', ')}
Sponsor: ${item.sponsor_name}
Approval Date: ${item.approval_date}
Application Type: ${item.application_type}
Marketing Status: ${app.marketing_status}
Dosage Form: ${app.dosage_form}
Route: ${app.route}
Therapeutic Equivalence: ${app.te_code || 'N/A'}
`;
    }).join('\n---\n');
  }
  
  private formatAdverseEvents(results: any[]): string {
    return results.map((event: any, index: number) => {
      return `
Adverse Event ${index + 1}:
Report ID: ${event.safetyreportid}
Receive Date: ${event.receivedate}
Serious: ${event.serious === '1' ? 'Yes' : 'No'}
Patient Age: ${event.patient?.patientonsetage} ${event.patient?.patientonsetageunit}
Patient Sex: ${event.patient?.patientsex === '1' ? 'Male' : event.patient?.patientsex === '2' ? 'Female' : 'Unknown'}

Drugs Involved:
${(event.patient?.drug || []).map((drug: any) => 
  `- ${drug.medicinalproduct} (${drug.drugcharacterization === '1' ? 'Suspect' : 'Concomitant'})`
).join('\n')}

Reactions:
${(event.patient?.reaction || []).map((reaction: any) => 
  `- ${reaction.reactionmeddrapt} (Outcome: ${reaction.reactionoutcome})`
).join('\n')}

Outcome: ${event.serious === '1' ? `Death: ${event.seriousnessdeath || 'No'}, 
Hospitalization: ${event.seriousnesshospitalization || 'No'}, 
Life Threatening: ${event.seriousnesslifethreatening || 'No'}` : 'Non-serious'}
`;
    }).join('\n' + '='.repeat(60) + '\n');
  }
  
  private formatMedicalDevices(results: any[]): string {
    return results.map((device: any, index: number) => {
      return `
Medical Device ${index + 1}:
510(k) Number: ${device.k_number || device.knumber}
Device Name: ${device.device_name}
Applicant: ${device.applicant}
Decision Date: ${device.decision_date || device.date_received}
Decision: ${device.decision}
Device Class: ${device.device_class}
Product Code: ${device.product_code}
Regulation Number: ${device.regulation_number}
Predicate Devices: ${device.statement_or_summary || 'Not specified'}
`;
    }).join('\n---\n');
  }
  
  private formatRecalls(results: any[]): string {
    return results.map((recall: any, index: number) => {
      return `
Recall ${index + 1}:
Recall Number: ${recall.recall_number}
Status: ${recall.status}
Classification: Class ${recall.classification}
Product: ${recall.product_description}
Reason: ${recall.reason_for_recall}
Distribution: ${recall.distribution_pattern}
Quantity: ${recall.product_quantity}
Recall Date: ${recall.recall_initiation_date}
Report Date: ${recall.report_date}
Firm: ${recall.recalling_firm}
Voluntary/Mandated: ${recall.voluntary_mandated}
`;
    }).join('\n---\n');
  }
  
  private formatGenericResults(results: any[]): string {
    return results.map((item: any, index: number) => 
      `Result ${index + 1}:\n${JSON.stringify(item, null, 2)}`
    ).join('\n---\n');
  }
}

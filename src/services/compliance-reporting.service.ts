export interface ComplianceReport {
  id: string;
  type: 'FDA' | 'HIPAA' | 'SOC2' | 'GDPR';
  title: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  generatedAt: Date;
  generatedBy: string;
  data: any;
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  evidence: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface ComplianceFilters {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedBy?: string;
}

export interface CompliancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ComplianceReportingService {
  private static instance: ComplianceReportingService;
  private baseUrl = '/api/admin/compliance';

  static getInstance(): ComplianceReportingService {
    if (!ComplianceReportingService.instance) {
      ComplianceReportingService.instance = new ComplianceReportingService();
    }
    return ComplianceReportingService.instance;
  }

  async getReports(filters: ComplianceFilters = {}, pagination: CompliancePagination = { page: 1, limit: 50 }): Promise<{ reports: ComplianceReport[]; pagination: CompliancePagination }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`${this.baseUrl}/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch compliance reports');
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      throw error;
    }
  }

  async generateReport(type: string, data: any): Promise<ComplianceReport> {
    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      
      if (!response.ok) throw new Error('Failed to generate compliance report');
      return await response.json();
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  async getIncidentPlaybooks(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/playbooks`);
      if (!response.ok) throw new Error('Failed to fetch incident playbooks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching incident playbooks:', error);
      throw error;
    }
  }

  async updateIncidentPlaybook(id: string, updates: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/playbooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update incident playbook');
    } catch (error) {
      console.error('Error updating incident playbook:', error);
      throw error;
    }
  }
}
import React, { useState, useRef } from 'react';
import { AgentBulkImport, DomainExpertise, ValidationStatus, AgentStatus, RiskLevel } from '@/types/agent.types';
import { AgentService } from '@/services/agent.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  RefreshCw
} from 'lucide-react';

export const AgentImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'create' | 'update' | 'upsert'>('upsert');
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentService = new AgentService();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setResult(null);
      setValidationErrors([]);
      setProgress(10);

      // Read file
      const text = await file.text();
      setProgress(20);

      let importData: AgentBulkImport;
      try {
        importData = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON file. Please check the file format.');
      }

      // Validate structure
      if (!importData.agents || !Array.isArray(importData.agents)) {
        throw new Error('Invalid import file structure. Missing agents array.');
      }

      if (!importData.metadata) {
        throw new Error('Invalid import file structure. Missing metadata.');
      }

      setProgress(40);

      // Set import mode from UI or file
      importData.metadata.import_mode = importMode;

      // Import agents
      setProgress(60);
      const importResult = await agentService.bulkImportAgents(importData);
      setProgress(100);

      setResult(importResult);

      if (importResult.errors.length > 0) {
        setValidationErrors(importResult.errors);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setProgress(0);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const template: AgentBulkImport = {
      agents: [
        {
          name: "example-medical-agent",
          display_name: "Example Medical Agent",
          description: "An example medical AI agent for clinical decision support",
          domain_expertise: DomainExpertise.MEDICAL,
          model: "gpt-4",
          system_prompt: "You are a medical AI assistant specialized in clinical decision support. Always provide evidence-based recommendations and cite relevant medical literature.",
          temperature: 0.3,
          max_tokens: 2000,
          capabilities: ["Clinical Decision Support", "Medical Literature Review", "Symptom Analysis"],
          knowledge_domains: ["Cardiology", "Internal Medicine"],
          tier: 1,
          priority: 100,
          status: AgentStatus.DEVELOPMENT,
          validation_status: ValidationStatus.PENDING,
          accuracy_score: 0.95,
          business_function: "Clinical Operations",
          role: "Clinical Decision Support",
          rag_enabled: true,
          is_custom: true,
          medical_specialty: "Internal Medicine",
          pharma_enabled: true,
          verify_enabled: true,
          hipaa_compliant: true,
          regulatory_context: {
            is_regulated: true,
            risk_level: RiskLevel.HIGH,
            applicable_frameworks: ["FDA 21 CFR Part 820", "HIPAA"],
            compliance_requirements: ["Clinical Validation", "Audit Trail"]
          },
          validation_metadata: {
            type: "clinical",
            validated_by: "clinical-reviewer@example.com",
            validation_date: new Date().toISOString(),
            scope: "Clinical Decision Support",
            notes: "Validated for internal medicine use cases"
          },
          performance_metrics: {
            accuracy: 0.95,
            hallucination_rate: 0.02,
            citation_accuracy: 0.98
          }
        },
        {
          name: "example-legal-agent",
          display_name: "Example Legal Agent",
          description: "An example legal AI agent for healthcare law compliance",
          domain_expertise: DomainExpertise.LEGAL,
          model: "gpt-4",
          system_prompt: "You are a legal AI assistant specialized in healthcare law. Provide accurate legal guidance based on current regulations and always recommend consulting with qualified legal counsel.",
          temperature: 0.2,
          max_tokens: 3000,
          capabilities: ["Healthcare Law", "Regulatory Compliance", "Contract Review"],
          knowledge_domains: ["Healthcare Law", "HIPAA Compliance"],
          tier: 1,
          priority: 200,
          status: AgentStatus.DEVELOPMENT,
          validation_status: ValidationStatus.PENDING,
          accuracy_score: 0.98,
          business_function: "Legal & Compliance",
          role: "Legal Advisor",
          rag_enabled: true,
          is_custom: true,
          jurisdiction_coverage: ["US", "California"],
          legal_domains: ["Healthcare Law", "Privacy Law", "Regulatory Compliance"],
          bar_admissions: ["California State Bar"],
          legal_specialties: {
            practice_areas: ["Healthcare Law", "Privacy & Data Protection"],
            years_experience: { "Healthcare Law": 10, "Privacy Law": 8 },
            certifications: ["CIPP/US"]
          },
          gdpr_compliant: true,
          hipaa_compliant: true,
          audit_trail_enabled: true,
          regulatory_context: {
            is_regulated: true,
            risk_level: RiskLevel.CRITICAL,
            applicable_frameworks: ["State Bar Rules", "Legal Ethics"],
            compliance_requirements: ["Bar Certification", "Ethical Guidelines"]
          }
        },
        {
          name: "example-commercial-agent",
          display_name: "Example Commercial Agent",
          description: "An example commercial AI agent for healthcare sales support",
          domain_expertise: DomainExpertise.COMMERCIAL,
          model: "gpt-4",
          system_prompt: "You are a commercial AI assistant specialized in healthcare sales. Provide market insights, competitive analysis, and sales support while maintaining compliance with industry regulations.",
          temperature: 0.7,
          max_tokens: 2000,
          capabilities: ["Market Analysis", "Sales Support", "Competitive Intelligence"],
          knowledge_domains: ["Healthcare Markets", "Payer Landscape"],
          tier: 2,
          priority: 300,
          status: AgentStatus.DEVELOPMENT,
          validation_status: ValidationStatus.PENDING,
          accuracy_score: 0.90,
          business_function: "Sales & Marketing",
          role: "Sales Support",
          rag_enabled: true,
          is_custom: true,
          market_segments: ["Health Systems", "Payers", "ACOs"],
          customer_segments: ["C-Suite", "Clinical Leadership", "IT Leadership"],
          sales_methodology: "B2B Enterprise",
          geographic_focus: ["US", "Canada"],
          regulatory_context: {
            is_regulated: false,
            risk_level: RiskLevel.LOW
          }
        }
      ],
      metadata: {
        version: "2.0",
        created_date: new Date().toISOString(),
        created_by: "your-email@example.com",
        total_agents: 3,
        deployment_phase: "Phase 1 - Core Agents",
        validation_status: "pending",
        import_mode: "upsert",
        domain_focus: [DomainExpertise.MEDICAL, DomainExpertise.LEGAL, DomainExpertise.COMMERCIAL],
        target_environment: "development"
      }
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-bulk-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExampleData = (domain: DomainExpertise) => {
    // Create domain-specific examples
    const examples: Record<DomainExpertise, any> = {
      [DomainExpertise.MEDICAL]: {
        name: "cardiology-specialist",
        display_name: "Cardiology Specialist",
        description: "AI agent specialized in cardiovascular medicine and cardiac care protocols",
        medical_specialty: "Cardiology",
        pharma_enabled: true,
        verify_enabled: true,
        capabilities: ["ECG Interpretation", "Cardiac Risk Assessment", "Treatment Protocols"]
      },
      [DomainExpertise.LEGAL]: {
        name: "healthcare-attorney",
        display_name: "Healthcare Legal Advisor",
        description: "AI agent specialized in healthcare law and regulatory compliance",
        jurisdiction_coverage: ["US", "California", "New York"],
        legal_domains: ["Healthcare Law", "Medical Malpractice", "HIPAA Compliance"],
        bar_admissions: ["California State Bar", "New York State Bar"]
      },
      [DomainExpertise.FINANCIAL]: {
        name: "healthcare-economist",
        display_name: "Healthcare Economics Analyst",
        description: "AI agent specialized in healthcare economics and financial analysis",
        capabilities: ["Cost-Effectiveness Analysis", "Budget Impact Modeling", "ROI Calculations"]
      },
      [DomainExpertise.REGULATORY]: {
        name: "regulatory-specialist",
        display_name: "Regulatory Affairs Specialist",
        description: "AI agent specialized in regulatory compliance and submissions",
        capabilities: ["FDA Submissions", "Regulatory Strategy", "Compliance Monitoring"]
      },
      [DomainExpertise.BUSINESS]: {
        name: "business-analyst",
        display_name: "Business Strategy Analyst",
        description: "AI agent specialized in business strategy and operations",
        capabilities: ["Market Analysis", "Strategic Planning", "Operations Optimization"]
      },
      [DomainExpertise.TECHNICAL]: {
        name: "technical-specialist",
        display_name: "Technical Integration Specialist",
        description: "AI agent specialized in technical implementation and integration",
        capabilities: ["System Integration", "API Development", "Technical Architecture"]
      },
      [DomainExpertise.COMMERCIAL]: {
        name: "commercial-analyst",
        display_name: "Commercial Strategy Analyst",
        description: "AI agent specialized in commercial strategy and market access",
        capabilities: ["Market Research", "Commercial Strategy", "Competitive Analysis"]
      },
      [DomainExpertise.ACCESS]: {
        name: "market-access-specialist",
        display_name: "Market Access Specialist",
        description: "AI agent specialized in market access and reimbursement",
        capabilities: ["Payer Strategy", "Reimbursement Planning", "HTA Submissions"]
      },
      [DomainExpertise.GENERAL]: {
        name: "general-assistant",
        display_name: "General AI Assistant",
        description: "AI agent for general-purpose assistance",
        capabilities: ["General Q&A", "Document Review", "Information Synthesis"]
      }
    };

    const example = examples[domain];
    if (example) {
      const template: AgentBulkImport = {
        agents: [{
          ...example,
          domain_expertise: domain,
          model: "gpt-4",
          system_prompt: `You are an AI assistant specialized in ${domain}...`,
          temperature: domain === DomainExpertise.LEGAL ? 0.2 : 0.7,
          max_tokens: 2000,
          tier: 1,
          priority: 100,
          status: AgentStatus.DEVELOPMENT,
          validation_status: ValidationStatus.PENDING,
          rag_enabled: true,
          is_custom: true
        }],
        metadata: {
          version: "2.0",
          created_date: new Date().toISOString(),
          created_by: "example@domain.com",
          total_agents: 1,
          deployment_phase: `${domain} Example`,
          import_mode: "create"
        }
      };

      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domain}-agent-example.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setValidationErrors([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Agent Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import Mode Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Import Mode</label>
                  <Select value={importMode} onValueChange={(value: any) => setImportMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="create">Create Only (Fail if exists)</SelectItem>
                      <SelectItem value="update">Update Only (Fail if doesn't exist)</SelectItem>
                      <SelectItem value="upsert">Upsert (Create or Update)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {importMode === 'create' && 'Creates new agents, fails if agent name already exists'}
                    {importMode === 'update' && 'Updates existing agents, fails if agent doesn\'t exist'}
                    {importMode === 'upsert' && 'Creates new agents or updates existing ones'}
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">JSON File</label>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      disabled={importing}
                      className="hidden"
                      id="agent-file-upload"
                    />
                    <label htmlFor="agent-file-upload" className="flex-1">
                      <Button
                        variant="outline"
                        disabled={importing}
                        className="w-full cursor-pointer"
                        asChild
                      >
                        <span>
                          {importing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          {importing ? 'Importing...' : 'Select JSON File'}
                        </span>
                      </Button>
                    </label>
                    {(result || error) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearResults}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-gray-600 text-center">
                    {progress < 30 && 'Reading file...'}
                    {progress >= 30 && progress < 60 && 'Validating agents...'}
                    {progress >= 60 && progress < 100 && 'Importing agents...'}
                    {progress === 100 && 'Import complete!'}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Complete Template</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Full template with examples for all domain types and required fields
                    </p>
                    <Button onClick={downloadTemplate} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">JSON Schema</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Download the JSON schema for validation and IDE support
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Schema (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(DomainExpertise).map((domain) => (
                  <Card key={domain}>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2 capitalize">{domain} Agent</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Example configuration for {domain} domain agents
                      </p>
                      <Button
                        onClick={() => downloadExampleData(domain)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                  <div className="text-sm text-gray-600">Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{result.warnings?.length || 0}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
              </div>

              {/* Domain Summary */}
              {result.summary && (
                <div>
                  <h4 className="font-medium mb-2">By Domain</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.summary.by_domain).map(([domain, count]) => (
                      (count as number) > 0 && (
                        <Badge key={domain} variant="outline">
                          {domain}: {count as number}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((err: any, i: number) => (
                      <Alert key={i} variant="destructive">
                        <AlertDescription>
                          <strong>{err.agent}:</strong> {err.error}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">Warnings</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.warnings.map((warning: any, i: number) => (
                      <Alert key={i}>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{warning.agent}:</strong> {warning.warning}
                          {warning.recommendation && (
                            <span className="text-blue-600"> Recommendation: {warning.recommendation}</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
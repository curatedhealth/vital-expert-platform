'use client';

import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield,
  FileText,
  Lock,
  Eye,
  Database
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ComplianceStatusProps {
  className?: string;
}

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  score: number;
  lastChecked: string;
  requirements: string[];
  evidence: string[];
}

export function ComplianceStatus({ className = '' }: ComplianceStatusProps) {
  // Mock compliance data - in a real implementation, this would come from props or API
  const complianceItems: ComplianceItem[] = [
    {
      id: 'hipaa-1',
      name: 'HIPAA Privacy Rule',
      description: 'Protection of individually identifiable health information',
      status: 'compliant',
      score: 95,
      lastChecked: '2024-01-13T10:30:00Z',
      requirements: [
        'Access controls implemented',
        'Audit logging enabled',
        'Data encryption in transit',
        'Data encryption at rest',
        'User authentication required'
      ],
      evidence: [
        'RBAC policies configured',
        'Comprehensive audit logs',
        'TLS 1.3 encryption',
        'AES-256 encryption',
        'Multi-factor authentication'
      ]
    },
    {
      id: 'hipaa-2',
      name: 'HIPAA Security Rule',
      description: 'Administrative, physical, and technical safeguards',
      status: 'compliant',
      score: 92,
      lastChecked: '2024-01-13T10:30:00Z',
      requirements: [
        'Administrative safeguards',
        'Physical safeguards',
        'Technical safeguards',
        'Risk assessment completed',
        'Incident response plan'
      ],
      evidence: [
        'Security policies documented',
        'Data center security controls',
        'Network security measures',
        'Annual risk assessment',
        'Incident response procedures'
      ]
    },
    {
      id: 'soc2-1',
      name: 'SOC 2 Type II - Security',
      description: 'Security controls and procedures',
      status: 'partial',
      score: 78,
      lastChecked: '2024-01-12T14:20:00Z',
      requirements: [
        'Access controls',
        'System monitoring',
        'Data integrity',
        'Confidentiality',
        'Availability'
      ],
      evidence: [
        'User access management',
        'Security monitoring tools',
        'Data backup procedures',
        'Encryption standards',
        'Uptime monitoring'
      ]
    },
    {
      id: 'soc2-2',
      name: 'SOC 2 Type II - Availability',
      description: 'System availability and performance',
      status: 'compliant',
      score: 88,
      lastChecked: '2024-01-13T09:15:00Z',
      requirements: [
        'System availability monitoring',
        'Performance monitoring',
        'Capacity planning',
        'Disaster recovery',
        'Business continuity'
      ],
      evidence: [
        '99.9% uptime SLA',
        'Performance metrics tracking',
        'Capacity management',
        'DR procedures tested',
        'BC plan documented'
      ]
    },
    {
      id: 'gdpr-1',
      name: 'GDPR Compliance',
      description: 'General Data Protection Regulation compliance',
      status: 'partial',
      score: 72,
      lastChecked: '2024-01-11T16:45:00Z',
      requirements: [
        'Data subject rights',
        'Consent management',
        'Data portability',
        'Right to be forgotten',
        'Privacy by design'
      ],
      evidence: [
        'Privacy policy updated',
        'Consent tracking system',
        'Data export functionality',
        'Data deletion procedures',
        'Privacy impact assessments'
      ]
    },
    {
      id: 'iso27001',
      name: 'ISO 27001',
      description: 'Information security management system',
      status: 'non-compliant',
      score: 45,
      lastChecked: '2024-01-10T11:30:00Z',
      requirements: [
        'Information security policy',
        'Risk management framework',
        'Security controls implementation',
        'Continuous improvement',
        'Management review'
      ],
      evidence: [
        'Policy framework in development',
        'Risk assessment in progress',
        'Controls implementation ongoing',
        'Improvement plan created',
        'Management review scheduled'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'non-compliant': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'not-applicable': return <Shield className="h-5 w-5 text-gray-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'non-compliant': return 'bg-red-500';
      case 'not-applicable': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'partial': return 'secondary';
      case 'non-compliant': return 'destructive';
      case 'not-applicable': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'partial': return 'Partially Compliant';
      case 'non-compliant': return 'Non-Compliant';
      case 'not-applicable': return 'Not Applicable';
      default: return 'Unknown';
    }
  };

  const getComplianceIcon = (id: string) => {
    if (id.includes('hipaa')) return <FileText className="h-4 w-4" />;
    if (id.includes('soc2')) return <Shield className="h-4 w-4" />;
    if (id.includes('gdpr')) return <Lock className="h-4 w-4" />;
    if (id.includes('iso')) return <Database className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const overallScore = Math.round(
    complianceItems.reduce((sum, item) => sum + item.score, 0) / complianceItems.length
  );

  const compliantCount = complianceItems.filter(item => item.status === 'compliant').length;
  const partialCount = complianceItems.filter(item => item.status === 'partial').length;
  const nonCompliantCount = complianceItems.filter(item => item.status === 'non-compliant').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Overall Compliance Score</span>
          </CardTitle>
          <CardDescription>
            Comprehensive compliance status across all frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{overallScore}/100</div>
              <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
                {overallScore >= 80 ? 'Good' : overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={overallScore} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{nonCompliantCount}</div>
                <div className="text-sm text-muted-foreground">Non-Compliant</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Compliance Items */}
      <div className="space-y-4">
        {complianceItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getComplianceIcon(item.id)}
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.score}/100</div>
                    <div className="text-xs text-muted-foreground">
                      Last checked: {new Date(item.lastChecked).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Compliance Score</span>
                    <span>{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Requirements</span>
                    </h4>
                    <ul className="space-y-1">
                      {item.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>Evidence</span>
                    </h4>
                    <ul className="space-y-1">
                      {item.evidence.map((evidence, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {item.status !== 'compliant' && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Action Required
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          {item.status === 'partial' 
                            ? 'Some requirements need attention to achieve full compliance.'
                            : 'Significant work needed to meet compliance requirements.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
          <CardDescription>
            Key compliance metrics and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Strengths</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Strong HIPAA compliance (95% score)</li>
                <li>• Comprehensive audit logging</li>
                <li>• Robust access controls</li>
                <li>• Data encryption implemented</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Areas for Improvement</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ISO 27001 implementation (45% score)</li>
                <li>• GDPR compliance gaps (72% score)</li>
                <li>• SOC 2 Type II completion</li>
                <li>• Regular compliance audits needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

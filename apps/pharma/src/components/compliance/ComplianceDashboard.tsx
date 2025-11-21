/**
 * Compliance Dashboard
 *
 * Multi-jurisdiction compliance tracking for agents
 * Supports: FDA, EMA, MHRA, TGA, HIPAA, GDPR, ISO
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui'
import { Badge } from '@vital/ui'
import { Button } from '@vital/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui'
import { Alert, AlertDescription } from '@vital/ui'
import { Skeleton } from '@vital/ui'
import { Progress } from '@vital/ui'
import { useCompliance } from '@/lib/services/hooks/useBackendIntegration'
import type { ComplianceFramework, AgentCompliance } from '@/lib/services/backend-integration-client'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  FileText,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'
import { formatDistance} from 'date-fns'

interface ComplianceDashboardProps {
  agentId?: string
  showFrameworks?: boolean
  showViolations?: boolean
  className?: string
}

const FRAMEWORK_ICONS: Record<string, React.ReactNode> = {
  HIPAA: <Shield className="w-4 h-4" />,
  GDPR: <Globe className="w-4 h-4" />,
  FDA_MEDICAL_DEVICE: <FileText className="w-4 h-4" />,
  EMA_CLINICAL_TRIAL: <FileText className="w-4 h-4" />,
  ISO_13485: <Award className="w-4 h-4" />,
  ISO_27001: <Shield className="w-4 h-4" />
}

const STATUS_COLORS = {
  compliant: 'bg-green-500',
  partial: 'bg-yellow-500',
  non_compliant: 'bg-red-500',
  not_applicable: 'bg-gray-500',
  pending_review: 'bg-blue-500'
}

export function ComplianceDashboard({
  agentId,
  showFrameworks = true,
  showViolations = true,
  className = ''
}: ComplianceDashboardProps) {
  const {
    frameworks,
    agentCompliance,
    violations,
    loading,
    error,
    getFrameworks,
    getAgentCompliance,
    getViolations
  } = useCompliance()

  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    if (showFrameworks && frameworks.length === 0) {
      getFrameworks()
    }
    if (agentId) {
      getAgentCompliance(agentId)
    }
    if (showViolations) {
      getViolations(50)
    }
  }, [agentId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && frameworks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load compliance data: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate overall compliance
  const overallStats = {
    total: agentCompliance.length,
    compliant: agentCompliance.filter((c: any) => c.complianceStatus === 'compliant').length,
    certified: agentCompliance.filter((c: any) => c.isCertified).length,
    avgScore: agentCompliance.length > 0
      ? agentCompliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / agentCompliance.length
      : 0
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{overallStats.total}</div>
            <div className="text-sm text-muted-foreground">Frameworks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-500">{overallStats.compliant}</div>
            <div className="text-sm text-muted-foreground">Compliant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-500">{overallStats.certified}</div>
            <div className="text-sm text-muted-foreground">Certified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{(overallStats.avgScore * 100).toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Frameworks & Compliance Status */}
      {showFrameworks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Frameworks
            </CardTitle>
            <CardDescription>
              Multi-jurisdiction compliance tracking (FDA, EMA, MHRA, TGA, HIPAA, GDPR, ISO)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedFramework || 'all'} onValueChange={setSelectedFramework}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                {frameworks.slice(0, 6).map((fw) => (
                  <TabsTrigger key={fw.code} value={fw.code}>
                    {fw.code}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-6 space-y-4">
                {(selectedFramework && selectedFramework !== 'all'
                  ? frameworks.filter(fw => fw.code === selectedFramework)
                  : frameworks
                ).map((framework) => {
                  const compliance = agentCompliance.find((c: any) => c.frameworkCode === framework.code)

                  return (
                    <FrameworkCard
                      key={framework.id}
                      framework={framework}
                      compliance={compliance}
                    />
                  )
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Agent Compliance Details */}
      {agentId && agentCompliance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Agent Compliance Status
            </CardTitle>
            <CardDescription>
              Detailed compliance status for this agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentCompliance.map((compliance) => (
                <AgentComplianceCard
                  key={compliance.frameworkCode}
                  compliance={compliance}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violations */}
      {showViolations && violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent Violations ({violations.length})
            </CardTitle>
            <CardDescription>
              Compliance violations detected in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.slice(0, 10).map((violation) => (
                <ViolationCard key={violation.id} violation={violation} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Framework Card - Individual framework details
 */
function FrameworkCard({
  framework,
  compliance
}: {
  framework: ComplianceFramework
  compliance?: AgentCompliance
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {FRAMEWORK_ICONS[framework.code] || <Shield className="w-4 h-4" />}
          <div>
            <h4 className="font-medium">{framework.name}</h4>
            <p className="text-sm text-muted-foreground">{framework.fullName}</p>
          </div>
        </div>
        {compliance && (
          <Badge className={STATUS_COLORS[compliance.complianceStatus]}>
            {compliance.complianceStatus.replace('_', ' ')}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>{' '}
          <span className="font-medium capitalize">{framework.frameworkType.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Regions:</span>{' '}
          <span className="font-medium">{framework.applicableRegions.join(', ')}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Certification:</span>{' '}
          <span className="font-medium">{framework.certificationRequired ? 'Required' : 'Optional'}</span>
        </div>
        {compliance && (
          <div>
            <span className="text-muted-foreground">Score:</span>{' '}
            <span className="font-medium">
              {compliance.complianceScore ? `${(compliance.complianceScore * 100).toFixed(0)}%` : 'N/A'}
            </span>
          </div>
        )}
      </div>

      {compliance && compliance.complianceScore !== null && (
        <div className="mt-3">
          <Progress value={compliance.complianceScore * 100} className="h-2" />
        </div>
      )}
    </div>
  )
}

/**
 * Agent Compliance Card
 */
function AgentComplianceCard({ compliance }: { compliance: AgentCompliance }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium flex items-center gap-2">
            {compliance.frameworkName}
            {compliance.isCertified && (
              <Badge variant="outline" className="bg-blue-500 text-white border-0">
                <Award className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
          </h4>
          <p className="text-sm text-muted-foreground">Framework: {compliance.frameworkCode}</p>
        </div>
        <Badge className={STATUS_COLORS[compliance.complianceStatus]}>
          {compliance.complianceStatus.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
        {compliance.complianceScore !== null && (
          <div>
            <span className="text-muted-foreground">Score:</span>{' '}
            <span className="font-medium">{(compliance.complianceScore * 100).toFixed(0)}%</span>
          </div>
        )}
        {compliance.gapsCount > 0 && (
          <div>
            <span className="text-muted-foreground">Gaps:</span>{' '}
            <span className="font-medium text-red-500">{compliance.gapsCount}</span>
          </div>
        )}
        {compliance.certificationExpiry && (
          <div>
            <span className="text-muted-foreground">Cert Expires:</span>{' '}
            <span className="font-medium">
              {formatDistance(new Date(compliance.certificationExpiry), new Date(), { addSuffix: true })}
            </span>
          </div>
        )}
        {compliance.nextAssessmentDue && (
          <div>
            <span className="text-muted-foreground">Next Assessment:</span>{' '}
            <span className="font-medium">
              {formatDistance(new Date(compliance.nextAssessmentDue), new Date(), { addSuffix: true })}
            </span>
          </div>
        )}
      </div>

      {compliance.complianceScore !== null && (
        <Progress value={compliance.complianceScore * 100} className="h-2" />
      )}
    </div>
  )
}

/**
 * Violation Card
 */
function ViolationCard({ violation }: { violation: any }) {
  return (
    <div className="border border-red-200 rounded-lg p-3 bg-red-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{violation.action}</span>
            {violation.complianceTags && violation.complianceTags.length > 0 && (
              <div className="flex gap-1">
                {violation.complianceTags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {violation.riskLevel && (
              <Badge variant="destructive" className="text-xs">
                {violation.riskLevel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{violation.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistance(new Date(violation.occurredAt), new Date(), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Compliance Summary Widget - Quick overview
 */
export function ComplianceSummaryWidget({ agentId, className = '' }: { agentId?: string; className?: string }) {
  const { agentCompliance, getAgentCompliance } = useCompliance()

  useEffect(() => {
    if (agentId) {
      getAgentCompliance(agentId)
    }
  }, [agentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const compliantCount = agentCompliance.filter((c: any) => c.complianceStatus === 'compliant').length
  const certifiedCount = agentCompliance.filter((c: any) => c.isCertified).length

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm">
          {compliantCount}/{agentCompliance.length} Compliant
        </span>
      </div>
      {certifiedCount > 0 && (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-500" />
          <span className="text-sm">{certifiedCount} Certified</span>
        </div>
      )}
    </div>
  )
}

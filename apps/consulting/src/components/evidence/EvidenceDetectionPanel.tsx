/**
 * Evidence Detection Panel
 *
 * Displays multi-domain evidence detected in agent responses
 * Supports: Medical, Digital Health, Regulatory, Compliance
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useEvidenceDetection } from '@/lib/services/hooks/useBackendIntegration'
import type { Evidence, EvidenceDomain } from '@/lib/services/backend-integration-client'
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  Microscope,
  Smartphone,
  Scale,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

interface EvidenceDetectionPanelProps {
  text: string
  autoDetect?: boolean
  minConfidence?: number
  className?: string
}

const DOMAIN_ICONS: Record<EvidenceDomain, React.ReactNode> = {
  medical: <Microscope className="w-4 h-4" />,
  digital_health: <Smartphone className="w-4 h-4" />,
  regulatory: <Scale className="w-4 h-4" />,
  compliance: <Shield className="w-4 h-4" />
}

const DOMAIN_COLORS: Record<EvidenceDomain, string> = {
  medical: 'bg-blue-500',
  digital_health: 'bg-purple-500',
  regulatory: 'bg-green-500',
  compliance: 'bg-orange-500'
}

const QUALITY_COLORS = {
  HIGH: 'bg-green-500',
  MODERATE: 'bg-yellow-500',
  LOW: 'bg-orange-500',
  VERY_LOW: 'bg-red-500'
}

export function EvidenceDetectionPanel({
  text,
  autoDetect = true,
  minConfidence = 0.7,
  className = ''
}: EvidenceDetectionPanelProps) {
  const { detect, loading, error, evidence } = useEvidenceDetection()
  const [selectedDomain, setSelectedDomain] = useState<EvidenceDomain | 'all'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect && text) {
      detect(text, minConfidence)
    }
  }, [text, autoDetect, minConfidence, detect])

  // Group evidence by domain
  const evidenceByDomain = evidence.reduce((acc, ev, idx) => {
    if (!acc[ev.domain]) acc[ev.domain] = []
    acc[ev.domain].push({ ...ev, index: idx })
    return acc
  }, {} as Record<EvidenceDomain, Array<Evidence & { index: number }>>)

  const filteredEvidence = selectedDomain === 'all'
    ? evidence
    : evidenceByDomain[selectedDomain] || []

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  if (loading) {
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
          Failed to detect evidence: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (evidence.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Evidence Detection
          </CardTitle>
          <CardDescription>
            No evidence detected in this content
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Evidence Detected ({evidence.length})
          </span>
          <div className="flex items-center gap-2">
            {Object.entries(evidenceByDomain).map(([domain, items]) => (
              <Badge
                key={domain}
                variant="outline"
                className="flex items-center gap-1"
              >
                {DOMAIN_ICONS[domain as EvidenceDomain]}
                {items.length}
              </Badge>
            ))}
          </div>
        </CardTitle>
        <CardDescription>
          Multi-domain evidence across Medical, Digital Health, Regulatory, and Compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({evidence.length})</TabsTrigger>
            <TabsTrigger value="medical" disabled={!evidenceByDomain.medical}>
              Medical ({evidenceByDomain.medical?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="digital_health" disabled={!evidenceByDomain.digital_health}>
              Digital ({evidenceByDomain.digital_health?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="regulatory" disabled={!evidenceByDomain.regulatory}>
              Regulatory ({evidenceByDomain.regulatory?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="compliance" disabled={!evidenceByDomain.compliance}>
              Compliance ({evidenceByDomain.compliance?.length || 0})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-3">
            {filteredEvidence.map((ev, idx) => {
              const isExpanded = expandedItems.has((ev as any).index ?? idx)

              return (
                <div
                  key={(ev as any).index ?? idx}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  {/* Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpanded((ev as any).index ?? idx)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${DOMAIN_COLORS[ev.domain]}`} />
                        <span className="font-medium capitalize">
                          {ev.evidenceType.replace(/_/g, ' ')}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${QUALITY_COLORS[ev.quality]} text-white border-0`}
                        >
                          {ev.quality}
                        </Badge>
                        <Badge variant="outline">
                          {(ev.confidence * 100).toFixed(0)}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ev.reasoning}
                      </p>
                    </div>
                    <button className="ml-2 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {/* Entities */}
                      {ev.entities && ev.entities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Entities ({ev.entities.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {ev.entities.map((entity, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {entity.text}
                                <span className="ml-1 text-muted-foreground">
                                  ({entity.entityType})
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citations */}
                      {ev.citations && ev.citations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Citations ({ev.citations.length})</h4>
                          <div className="space-y-2">
                            {ev.citations.map((citation, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {citation.citationType}
                                  </span>
                                  <span className="ml-2">{citation.value}</span>
                                  {citation.source && (
                                    <span className="ml-2 text-muted-foreground">
                                      ({citation.source})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Metadata</h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {Object.entries(ev.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{key}:</span>{' '}
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Text */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Evidence Text</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {ev.text}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

/**
 * Inline Evidence Badge - for showing evidence count inline
 */
export function EvidenceBadge({ count, domain }: { count: number; domain?: EvidenceDomain }) {
  if (count === 0) return null

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {domain ? DOMAIN_ICONS[domain] : <FileText className="w-3 h-3" />}
      {count} evidence
    </Badge>
  )
}

/**
 * Evidence Summary - for showing quick stats
 */
export function EvidenceSummary({ evidence }: { evidence: Evidence[] }) {
  const byDomain = evidence.reduce((acc, ev) => {
    acc[ev.domain] = (acc[ev.domain] || 0) + 1
    return acc
  }, {} as Record<EvidenceDomain, number>)

  const byQuality = evidence.reduce((acc, ev) => {
    acc[ev.quality] = (acc[ev.quality] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const avgConfidence = evidence.reduce((sum, ev) => sum + ev.confidence, 0) / evidence.length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{evidence.length}</div>
        <div className="text-sm text-muted-foreground">Total Evidence</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{Object.keys(byDomain).length}</div>
        <div className="text-sm text-muted-foreground">Domains</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{byQuality.HIGH || 0}</div>
        <div className="text-sm text-muted-foreground">High Quality</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(0)}%</div>
        <div className="text-sm text-muted-foreground">Avg Confidence</div>
      </div>
    </div>
  )
}

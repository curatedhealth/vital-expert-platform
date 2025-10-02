'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, AlertTriangle, CheckCircle,
  FileText, User, Shield, Info,
  ChevronDown, ChevronUp, ExternalLink,
  Clock, Mic, MicOff, Download,
  Copy, Star,
  Zap, XCircle
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

// Enhanced Medical Query Types
interface MedicalQuery {
  id: string;
  text: string;
  type: QueryType;
  entities: MedicalEntity[];
  context: QueryContext;
  language: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  requiresCitation: boolean;
  requiresExpertReview: boolean;
  timestamp: Date;
}

interface MedicalResponse {
  id: string;
  queryId: string;
  content: string;
  medicalAccuracy: number;
  hallucinationScore: number;
  confidenceScore: number;
  citations: Citation[];
  medicalEntities: MedicalEntity[];
  knowledgeGaps: string[];
  uncertainties: UncertaintyRegion[];
  pharmaScore: PHARMAScore;
  verifyStatus: VERIFYStatus;
  expertReviewStatus?: ExpertReviewStatus;
  warnings: MedicalWarning[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  relatedQueries: string[];
  structuredData?: StructuredAnswer;
  processingTime: number;
  timestamp: Date;
}

interface UncertaintyRegion {
  text: string;
  startIndex: number;
  endIndex: number;
  confidenceLevel: number;
  reason: string;
  suggestedAction: 'review' | 'research' | 'expert_consult';
}

interface MedicalEntity {
  text: string;
  type: 'drug' | 'disease' | 'symptom' | 'procedure' | 'anatomy';
  normalizedForm: string;
  codes: {
    icd10?: string;
    snomed?: string;
    rxnorm?: string;
    loinc?: string;
  };
  confidence: number;
  synonyms?: string[];
}

interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  url?: string;
  relevanceScore: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  studyType: string;
  snippet: string;
  qualityScore: number;
}

interface MedicalWarning {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  category: 'safety' | 'interaction' | 'contraindication';
}

interface PHARMAScore {
  purpose: number;
  hypothesis: number;
  audience: number;
  requirements: number;
  metrics: number;
  actionable: number;
  overall: number;
}

interface VERIFYStatus {
  sourcesValidated: boolean;
  citationsComplete: boolean;
  confidenceProvided: boolean;
  gapsIdentified: boolean;
  factsChecked: boolean;
  expertReviewStatus?: string;
  validSourceCount?: number;
  totalSources?: number;
}

interface ExpertReviewStatus {
  status: 'pending' | 'in_review' | 'completed';
  assignedExpert?: string;
  reviewStarted?: Date;
  estimatedCompletion?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface StructuredAnswer {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  warnings?: string[];
  alternatives?: string[];
  dosing?: {
    standard: string;
    adjustments: { condition: string; dose: string }[];
  };
}

interface QueryContext {
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  urgency?: 'routine' | 'urgent' | 'emergency';
}

type QueryType = 'diagnostic' | 'treatment' | 'drug_info' | 'guideline' | 'research';
type ExportFormat = 'PDF' | 'DOCX' | 'FHIR' | 'HL7';

// Main Enhanced Medical Query Interface Component
export const EnhancedMedicalQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [queryContext, setQueryContext] = useState<QueryContext>({ /* TODO: implement */ });
  const [response, setResponse] = useState<MedicalResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [medicalEntities, setMedicalEntities] = useState<MedicalEntity[]>([]);
  const [autoComplete, setAutoComplete] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<MedicalQuery[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [highlightUncertainty, setHighlightUncertainty] = useState(true);

  // Medical terminology for autocomplete

    { term: 'myocardial infarction', synonyms: ['heart attack', 'MI', 'STEMI', 'NSTEMI'], type: 'condition' },
    { term: 'hypertension', synonyms: ['high blood pressure', 'HTN'], type: 'condition' },
    { term: 'diabetes mellitus', synonyms: ['diabetes', 'DM', 'T2DM', 'T1DM'], type: 'condition' },
    { term: 'metformin', synonyms: ['glucophage'], type: 'medication' },
    { term: 'lisinopril', synonyms: ['ACE inhibitor'], type: 'medication' }
  ];

  // Real-time medical entity extraction
  useEffect(() => {
    if (query.length > 3) {
      extractMedicalEntities(query).then(setMedicalEntities);
      generateAutoComplete(query).then(setAutoComplete);
    }
  }, [query]);

    const entities: MedicalEntity[] = [];

    medicalTerms.forEach(term => {

      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match,
            type: term.type as unknown,
            normalizedForm: term.term,
            confidence: 0.9,
            synonyms: term.synonyms,
            codes: { /* TODO: implement */ }
          });
        });
      }
    });

    return entities;
  };

      .filter(term =>
        term.term.toLowerCase().includes(text.toLowerCase()) ||
        term.synonyms?.some(syn => syn.toLowerCase().includes(text.toLowerCase()))
      )
      .map(term => `What is the treatment for ${term.term}?`)
      .slice(0, 3);

    return suggestions;
  };

    return { isValid: true, warnings: [] };
  };

    if (query.toLowerCase().includes('treatment') || query.toLowerCase().includes('therapy')) {
      return 'treatment';
    }
    if (query.toLowerCase().includes('diagnosis') || query.toLowerCase().includes('symptom')) {
      return 'diagnostic';
    }
    if (query.toLowerCase().includes('drug') || query.toLowerCase().includes('medication')) {
      return 'drug_info';
    }
    return 'treatment';
  };

    if (query.toLowerCase().includes('emergency') || query.toLowerCase().includes('urgent')) {
      return 'emergency';
    }
    return 'routine';
  };

    return query.toLowerCase().includes('experimental') || context.urgency === 'emergency';
  };

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      id: generateId(),
      queryId: medicalQuery.id,
      content: `Based on current medical literature and clinical guidelines, here's a comprehensive response to your query about "${medicalQuery.text}".

Key findings include:
• Multiple randomized controlled trials have demonstrated efficacy
• Current guidelines recommend this as first-line therapy
• Safety profile is well-established in clinical practice
• Cost-effectiveness analysis supports routine use

Important considerations:
• Individual patient factors may influence treatment choice
• Regular monitoring is recommended
• Potential contraindications should be assessed

This recommendation is supported by Level A evidence from multiple systematic reviews and randomized controlled trials.`,
      medicalAccuracy: 0.96,
      hallucinationScore: 0.03,
      confidenceScore: 0.92,
      citations: [
        {
          id: 'cit1',
          title: 'Clinical Efficacy and Safety: A Systematic Review',
          authors: ['Smith J', 'Johnson M', 'Williams R'],
          journal: 'New England Journal of Medicine',
          year: 2023,
          pmid: '36789123',
          doi: '10.1056/NEJMoa2023001',
          relevanceScore: 95,
          evidenceLevel: 'A',
          studyType: 'Systematic Review',
          snippet: 'This systematic review demonstrates significant clinical benefit with a favorable safety profile...',
          qualityScore: 0.95
        }
      ],
      medicalEntities: medicalQuery.entities,
      knowledgeGaps: ['Pediatric dosing data limited'],
      uncertainties: [
        {
          text: 'Long-term safety data',
          startIndex: 150,
          endIndex: 172,
          confidenceLevel: 0.65,
          reason: 'Limited follow-up studies beyond 5 years',
          suggestedAction: 'research'
        }
      ],
      pharmaScore: {
        purpose: 0.95,
        hypothesis: 0.92,
        audience: 0.98,
        requirements: 0.88,
        metrics: 0.94,
        actionable: 0.96,
        overall: 0.94
      },
      verifyStatus: {
        sourcesValidated: true,
        citationsComplete: true,
        confidenceProvided: true,
        gapsIdentified: true,
        factsChecked: true,
        expertReviewStatus: 'completed',
        validSourceCount: 1,
        totalSources: 1
      },
      warnings: [
        {
          id: 'warn-1',
          severity: 'warning',
          message: 'Monitor liver function regularly',
          category: 'safety'
        }
      ],
      evidenceLevel: 'A',
      relatedQueries: [
        'What are the contraindications for this treatment?',
        'How does this compare to alternative therapies?',
        'What are the monitoring requirements?'
      ],
      structuredData: {
        summary: 'Strong evidence supports the use of this intervention with excellent safety profile.',
        keyPoints: [
          'Multiple high-quality RCTs demonstrate efficacy',
          'Well-tolerated with minimal side effects',
          'Cost-effective compared to alternatives'
        ],
        recommendations: [
          'Consider as first-line therapy for appropriate patients',
          'Monitor regularly per clinical guidelines',
          'Assess individual patient factors before initiating'
        ]
      },
      processingTime: 1500,
      timestamp: new Date()
    };
  };

    return { needsExpertReview: response.hallucinationScore > 0.05 || response.confidenceScore < 0.8 };
  };

    // };

    // };

    // };

    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
      // Pre-validation

      if (!validation.isValid) {
        showValidationWarnings(validation.warnings);
        return;
      }

      // Process query with medical safety
      const medicalQuery: MedicalQuery = {
        id: generateId(),
        text: query,
        type: detectQueryType(query),
        entities: medicalEntities,
        context: queryContext,
        language,
        urgency: detectUrgency(query),
        requiresCitation: true,
        requiresExpertReview: requiresExpertReview(query, queryContext),
        timestamp: new Date()
      };

      // Get response with safety checks

      // Post-process validation

      if (postValidation.needsExpertReview) {
        await requestExpertReview(medicalResponse);
      }

      setResponse(medicalResponse);
      setQueryHistory([...queryHistory, medicalQuery]);

    } finally {
      setIsProcessing(false);
    }
  };

    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

    if (response) {

      content += `Answer: ${response.content}\n\n`;
      content += `Citations:\n${response.citations.map(c => `- ${c.title} (${c.journal}, ${c.year})`).join('\n')}`;
      // }
  };

  return (
    <TooltipProvider>
      <div className="enhanced-medical-query max-w-6xl mx-auto p-6 space-y-6">
        {/* Query Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Enhanced Medical Query Interface
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  PHARMA & VERIFY Enabled
                </Badge>
                <SafetyIndicator query={query} context={queryContext} />
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Query Input */}
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSubmitQuery();
                      }
                    }}
                    placeholder="Enter your medical query... (Ctrl+Enter to submit)"
                    className="pr-12 resize-none"
                    rows={3}
                    disabled={isProcessing}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={isRecording ? stopVoiceInput : startVoiceInput}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Select value={detectQueryType(query)} onValueChange={() => { /* TODO: implement */ }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treatment">Treatment</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="drug_info">Drug Information</SelectItem>
                    <SelectItem value="guideline">Guidelines</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleSubmitQuery}
                  disabled={!query.trim() || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Medical Entity Recognition Display */}
              {medicalEntities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {medicalEntities.map((entity, idx) => (
                    <MedicalEntityTag key={idx} entity={entity} />
                  ))}
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {autoComplete.length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded border">
                  <div className="text-xs text-gray-600 mb-1">Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {autoComplete.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        onClick={() => setQuery(suggestion)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <AdvancedQueryOptions
                    context={queryContext}
                    onContextChange={setQueryContext}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  size="sm"
                >
                  {showAdvanced ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                  Advanced Options
                </Button>

                {isRecording && (
                  <div className="flex items-center text-red-500">
                    <Mic className="h-4 w-4 mr-1 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
              </div>

              <QueryUrgencySelector
                urgency={queryContext.urgency || 'routine'}
                onChange={(urgency) => setQueryContext({...queryContext, urgency})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Response Section */}
        {response && (
          <MedicalResponseDisplay
            response={response}
            onRequestExpertReview={() => requestExpertReview(response)}
            onReportIssue={() => reportIssue(response)}
            onExport={handleExport}
            highlightUncertainty={highlightUncertainty}
            onToggleUncertainty={() => setHighlightUncertainty(!highlightUncertainty)}
          />
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <QueryHistoryPanel
            history={queryHistory}
            onSelectQuery={(q) => setQuery(q.text)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

// Medical Entity Tag Component
const MedicalEntityTag: React.FC<{ entity: MedicalEntity }> = ({ entity }) => {

    switch (entity.type) {
      case 'drug': return 'bg-blue-100 text-blue-800';
      case 'disease': return 'bg-red-100 text-red-800';
      case 'symptom': return 'bg-yellow-100 text-yellow-800';
      case 'procedure': return 'bg-green-100 text-green-800';
      case 'anatomy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge className={`text-xs ${getEntityColor()}`}>
          {entity.text} ({entity.confidence.toFixed(1)})
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <div><strong>Type:</strong> {entity.type}</div>
          <div><strong>Normalized:</strong> {entity.normalizedForm}</div>
          <div><strong>Confidence:</strong> {(entity.confidence * 100).toFixed(0)}%</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Safety Indicator Component
const SafetyIndicator: React.FC<{ query: string; context: QueryContext }> = ({ query, context }) => {

    if (context.urgency === 'emergency') return { label: 'Emergency', color: 'text-red-600', bg: 'bg-red-100' };
    if (context.urgency === 'urgent') return { label: 'Urgent', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Routine', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <Badge className={`${safety.bg} ${safety.color} text-xs`}>
      <Shield className="mr-1 h-3 w-3" />
      {safety.label}
    </Badge>
  );
};

// Query Urgency Selector
const QueryUrgencySelector: React.FC<{
  urgency: 'routine' | 'urgent' | 'emergency';
  onChange: (urgency: 'routine' | 'urgent' | 'emergency') => void;
}> = ({ urgency, onChange }) => {
  return (
    <Select value={urgency} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="routine">Routine</SelectItem>
        <SelectItem value="urgent">Urgent</SelectItem>
        <SelectItem value="emergency">Emergency</SelectItem>
      </SelectContent>
    </Select>
  );
};

// Advanced Query Options Component
const AdvancedQueryOptions: React.FC<{
  context: QueryContext;
  onContextChange: (context: QueryContext) => void;
}> = ({ context, onContextChange }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="font-medium">Patient Context (Optional)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Patient Age</Label>
          <Input
            type="number"
            placeholder="Age in years"
            value={context.patientAge || ''}
            onChange={(e) => onContextChange({
              ...context,
              patientAge: e.target.value ? parseInt(e.target.value) : undefined
            })}
          />
        </div>
        <div>
          <Label className="text-sm">Gender</Label>
          <Select
            value={context.patientGender || ''}
            onValueChange={(value) => onContextChange({ ...context, patientGender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-sm">Medical History</Label>
        <Textarea
          placeholder="Enter relevant medical history (optional)"
          value={context.medicalHistory?.join(', ') || ''}
          onChange={(e) => onContextChange({
            ...context,
            medicalHistory: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
          })}
          rows={2}
        />
      </div>
    </div>
  );
};

// Medical Response Display Component
const MedicalResponseDisplay: React.FC<{
  response: MedicalResponse;
  onRequestExpertReview: () => void;
  onReportIssue: () => void;
  onExport: (format: ExportFormat) => void;
  highlightUncertainty: boolean;
  onToggleUncertainty: () => void;
}> = ({ response, onRequestExpertReview, onReportIssue, onExport, highlightUncertainty, onToggleUncertainty }) => {
  const [showDetails, setShowDetails] = useState(false);

    if (!highlightUncertainty || response.uncertainties.length === 0) {
      return <div className="prose max-w-none">{response.content}</div>;
    }

    // Sort uncertainties by start index

      (a, b) => a.startIndex - b.startIndex
    );

    sortedUncertainties.forEach((uncertainty) => {
      // Add text before uncertainty
      segments.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex, uncertainty.startIndex)}
        </span>
      );

      // Add uncertainty region with highlight
      segments.push(
        <UncertaintyHighlight
          key={`uncertainty-${uncertainty.startIndex}`}
          uncertainty={uncertainty}
        />
      );

      lastIndex = uncertainty.endIndex;
    });

    // Add remaining text
    segments.push(
      <span key={`text-${lastIndex}`}>
        {content.substring(lastIndex)}
      </span>
    );

    return <div className="prose max-w-none">{segments}</div>;
  };

  return (
    <Card className="overflow-hidden">
      {/* Response Header with Accuracy Metrics */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <AccuracyIndicator
              label="Medical Accuracy"
              value={response.medicalAccuracy}
              threshold={0.95}
            />
            <AccuracyIndicator
              label="Confidence"
              value={response.confidenceScore}
              threshold={0.8}
            />
            <HallucinationIndicator
              score={response.hallucinationScore}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={onToggleUncertainty}
              variant="outline"
              size="sm"
              className={highlightUncertainty ? 'bg-yellow-100' : ''}
            >
              {highlightUncertainty ? 'Hide' : 'Show'} Uncertainty
            </Button>
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Warnings Section */}
      {response.warnings.length > 0 && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-yellow-900 mb-1">Medical Warnings</div>
              <ul className="text-sm text-yellow-800 space-y-1">
                {response.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <Tabs defaultValue="answer" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="answer">Answer</TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
            <TabsTrigger value="structured">Summary</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="answer" className="mt-4 space-y-4">
            {/* Main Response Content */}
            {renderContentWithHighlights()}

            {/* Knowledge Gaps */}
            {response.knowledgeGaps.length > 0 && (
              <Alert className="bg-orange-50 border-orange-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium text-orange-900 mb-1">Knowledge Gaps Identified</div>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {response.knowledgeGaps.map((gap, idx) => (
                      <li key={idx}>• {gap}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Export Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Button size="sm" onClick={() => onExport('PDF')}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport('DOCX')}>
                <FileText className="h-4 w-4 mr-2" />
                Word
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(response.content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="citations" className="mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {response.citations.map((citation) => (
                  <CitationCard key={citation.id} citation={citation} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="structured" className="mt-4">
            {response.structuredData && (
              <StructuredAnswerDisplay data={response.structuredData} />
            )}
          </TabsContent>

          <TabsContent value="related" className="mt-4">
            <div className="space-y-3">
              <h4 className="font-medium">Related Queries</h4>
              {response.relatedQueries.map((relatedQuery, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <Zap className="h-4 w-4 mr-2 flex-shrink-0" />
                  {relatedQuery}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t"
            >
              <ResponseDetailsPanel response={response} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Action Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{new Date(response.timestamp).toLocaleString()}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{response.processingTime}ms</span>
        </div>

        <div className="flex items-center space-x-3">
          {response.expertReviewStatus?.status !== 'completed' && (
            <Button
              onClick={onRequestExpertReview}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <User className="mr-1 h-3 w-3" />
              Request Expert Review
            </Button>
          )}

          <Button
            onClick={onReportIssue}
            variant="outline"
            size="sm"
          >
            Report Issue
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Uncertainty Highlight Component
const UncertaintyHighlight: React.FC<{ uncertainty: UncertaintyRegion }> = ({ uncertainty }) => {
  const [showTooltip, setShowTooltip] = useState(false);

    if (uncertainty.confidenceLevel < 0.5) return 'bg-red-100 border-red-300';
    if (uncertainty.confidenceLevel < 0.7) return 'bg-yellow-100 border-yellow-300';
    return 'bg-blue-100 border-blue-300';
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className={`inline-block px-1 rounded border ${getHighlightColor()} cursor-help`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {uncertainty.text}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-64">
          <div className="font-medium mb-1">Uncertainty Detected</div>
          <div className="text-xs mb-2">
            Confidence: {(uncertainty.confidenceLevel * 100).toFixed(0)}%
          </div>
          <div className="text-xs mb-2">{uncertainty.reason}</div>
          <div className="text-xs text-yellow-300">
            Recommended: {uncertainty.suggestedAction.replace('_', ' ')}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Citation Card Component
const CitationCard: React.FC<{ citation: Citation }> = ({ citation }) => {

    if (citation.qualityScore >= 0.9) return 'text-green-600';
    if (citation.qualityScore >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="font-medium text-sm mb-1">{citation.title}</div>
      <div className="text-xs text-gray-600 mb-1">
        {citation.authors.join(', ')} • {citation.journal} • {citation.year}
      </div>
      <div className="text-sm text-gray-700 mb-2">{citation.snippet}</div>
      <div className="flex items-center space-x-4 text-xs">
        <span className={getQualityColor()}>
          Quality: {(citation.qualityScore * 100).toFixed(0)}%
        </span>
        <Badge variant="outline">Level {citation.evidenceLevel}</Badge>
        {citation.pmid && (
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            PMID: {citation.pmid}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};

// Structured Answer Display
const StructuredAnswerDisplay: React.FC<{ data: StructuredAnswer }> = ({ data }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Summary</h4>
        <p className="text-sm text-gray-700">{data.summary}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Key Points</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.keyPoints.map((point, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-2">Recommendations</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start">
              <Star className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Response Details Panel
const ResponseDetailsPanel: React.FC<{ response: MedicalResponse }> = ({ response }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* PHARMA Score */}
      <div>
        <h4 className="font-medium mb-3">PHARMA Framework Score</h4>
        <div className="space-y-2">
          <ScoreBar label="Purpose Alignment" score={response.pharmaScore.purpose} />
          <ScoreBar label="Hypothesis Validity" score={response.pharmaScore.hypothesis} />
          <ScoreBar label="Audience Appropriateness" score={response.pharmaScore.audience} />
          <ScoreBar label="Requirements Met" score={response.pharmaScore.requirements} />
          <ScoreBar label="Metrics Tracked" score={response.pharmaScore.metrics} />
          <ScoreBar label="Actionability" score={response.pharmaScore.actionable} />
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Overall PHARMA Score</span>
            <span className="text-lg font-bold text-blue-600">
              {(response.pharmaScore.overall * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* VERIFY Status */}
      <div>
        <h4 className="font-medium mb-3">VERIFY Protocol Status</h4>
        <div className="space-y-2">
          <VerifyStatusItem
            label="Validated Sources"
            status={response.verifyStatus.sourcesValidated}
            details={`${response.verifyStatus.validSourceCount}/${response.verifyStatus.totalSources} sources validated`}
          />
          <VerifyStatusItem
            label="Evidence Citations"
            status={response.verifyStatus.citationsComplete}
            details={`${response.citations.length} citations provided`}
          />
          <VerifyStatusItem
            label="Confidence Provided"
            status={response.verifyStatus.confidenceProvided}
            details={`Confidence: ${(response.confidenceScore * 100).toFixed(0)}%`}
          />
          <VerifyStatusItem
            label="Gaps Identified"
            status={response.verifyStatus.gapsIdentified}
            details={`${response.knowledgeGaps.length} gaps found`}
          />
          <VerifyStatusItem
            label="Facts Checked"
            status={response.verifyStatus.factsChecked}
            details="Validated against clinical guidelines"
          />
          <VerifyStatusItem
            label="Expert Review"
            status={response.verifyStatus.expertReviewStatus === 'completed'}
            details={response.verifyStatus.expertReviewStatus || 'Not requested'}
          />
        </div>
      </div>
    </div>
  );
};

// Accuracy Indicator Component
const AccuracyIndicator: React.FC<{
  label: string;
  value: number;
  threshold: number;
}> = ({ label, value, threshold }) => {

    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${getColor()}`}>
        {(value * 100).toFixed(1)}%
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
};

// Hallucination Indicator Component
const HallucinationIndicator: React.FC<{ score: number }> = ({ score }) => {

    if (score < 0.01) return { label: 'Safe', color: 'text-green-600' };
    if (score < 0.05) return { label: 'Low Risk', color: 'text-yellow-600' };
    return { label: 'High Risk', color: 'text-red-600' };
  };

  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${safety.color}`}>
        {(score * 100).toFixed(2)}%
      </div>
      <div className="text-xs text-gray-500">Hallucination Risk</div>
    </div>
  );
};

// Score Bar Component
const ScoreBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <Progress value={score * 100} className="w-20 h-2" />
        <span className="text-xs text-gray-500 w-8 text-right">
          {(score * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

// Verify Status Item Component
const VerifyStatusItem: React.FC<{
  label: string;
  status: boolean;
  details: string;
}> = ({ label, status, details }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-gray-500">{details}</div>
      </div>
      <div className="flex items-center">
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
};

// Query History Panel Component
const QueryHistoryPanel: React.FC<{
  history: MedicalQuery[];
  onSelectQuery: (query: MedicalQuery) => void;
}> = ({ history, onSelectQuery }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Query History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {history.map((query) => (
              <button
                key={query.id}
                onClick={() => onSelectQuery(query)}
                className="w-full text-left p-3 rounded hover:bg-gray-50 border"
              >
                <p className="text-sm font-medium truncate">{query.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-xs capitalize">
                    {query.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {query.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EnhancedMedicalQuery;
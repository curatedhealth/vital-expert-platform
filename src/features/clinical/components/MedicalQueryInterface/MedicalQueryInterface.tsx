// @ts-nocheck
'use client';

import {
  Search,
  Mic,
  MicOff,
  BookOpen,
  FileText,
  Download,
  Copy,
  Star,
  Clock,
  Lightbulb,
  CheckCircle,
  Globe,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface MedicalQueryInterfaceProps {
  onQuery?: (query: MedicalQuery) => Promise<QueryResponse>;
  onExport?: (format: ExportFormat, content: string) => void;
  languages?: string[];
  className?: string;
}

interface MedicalQuery {
  id: string;
  text: string;
  type: QueryType;
  entities: MedicalEntity[];
  context?: string;
  language: string;
  timestamp: Date;
}

interface QueryResponse {
  id: string;
  query: MedicalQuery;
  answer: string;
  citations: Citation[];
  confidence: number;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  relatedQueries: string[];
  structuredData?: StructuredAnswer;
  processingTime: number;
}

interface MedicalEntity {
  text: string;
  type: 'condition' | 'medication' | 'procedure' | 'symptom' | 'anatomy' | 'dosage' | 'test';
  confidence: number;
  coding?: {
    system: 'ICD-10' | 'CPT' | 'SNOMED' | 'RxNorm' | 'LOINC';
    code: string;
    display: string;
  };
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

type const QueryType = clinical_evidence' | 'drug_information' | 'trial_design' | 'diagnostic' | 'reimbursement';
type const ExportFormat = PDF' | 'DOCX' | 'FHIR' | 'HL7';

  clinical_evidence: [
    'What is the efficacy of [drug] for [condition]?',
    'Compare [treatment A] vs [treatment B] for [condition]',
    'Latest guidelines for [disease] management',
    'Systematic review of [intervention] in [population]',
    'Meta-analysis results for [treatment] effectiveness'
  ],
  drug_information: [
    'Dosing for [drug] in renal impairment',
    'Drug interactions between [drug list]',
    'Contraindications for [medication]',
    'Side effects profile of [drug]',
    'Mechanism of action of [medication]'
  ],
  trial_design: [
    'Sample size for [endpoint] with [effect size]',
    'Inclusion criteria for [condition] trials',
    'FDA requirements for [indication] approval',
    'Primary endpoints for [disease] studies',
    'Statistical plan for [trial type]'
  ]
};

const queryTemplates = 
  diagnostic: [
    'Differential diagnosis for [symptoms]',
    'Sensitivity/specificity of [test]',
    'Workup for suspected [condition]',
    'Diagnostic criteria for [disease]',
    'Imaging recommendations for [symptoms]'
  ],
  reimbursement: [
    'Coverage criteria for [procedure]',
    'Prior authorization requirements for [drug]',
    'Appeal strategy for [denial reason]',
    'Cost-effectiveness of [treatment]',
    'Medicare guidelines for [service]'
  ]
};

const medicalTerms = 
  { term: 'myocardial infarction', synonyms: ['heart attack', 'MI', 'STEMI', 'NSTEMI'], type: 'condition' },
  { term: 'hypertension', synonyms: ['high blood pressure', 'HTN'], type: 'condition' },
  { term: 'diabetes mellitus', synonyms: ['diabetes', 'DM', 'T2DM', 'T1DM'], type: 'condition' },
  { term: 'electrocardiogram', synonyms: ['ECG', 'EKG'], type: 'procedure' },
  { term: 'computed tomography', synonyms: ['CT scan', 'CAT scan'], type: 'procedure' },
  { term: 'metformin', synonyms: ['glucophage'], type: 'medication' },
  { term: 'lisinopril', synonyms: ['ACE inhibitor'], type: 'medication' },
  { term: 'chest pain', synonyms: ['angina', 'thoracic pain'], type: 'symptom' }
];

export function MedicalQueryInterface({
  onQuery,
  onExport,
  const languages = 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'],
  const className = '
}: MedicalQueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<QueryType>('clinical_evidence');
  const [language, setLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<QueryResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<QueryResponse | null>(null);
  const [history, setHistory] = useState<MedicalQuery[]>([]);
  const [settings, setSettings] = useState({
    autoComplete: true,
    voiceInput: true,
    confidenceThreshold: 70,
    maxResults: 10,
    showCitations: true,
    expandAbbreviations: true
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && settings.voiceInput) {

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event: unknown) => {

        setQuery(prev => prev + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, settings.voiceInput]);

  // Auto-complete suggestions
  useEffect(() => {
    if (query.length > 2 && settings.autoComplete) {

        .filter(term =>
          term.term.toLowerCase().includes(query.toLowerCase()) ||
          term.synonyms?.some(syn => syn.toLowerCase().includes(query.toLowerCase()))
        )
        .map(term => term.term)
        .slice(0, 5);

      setSuggestions(filteredTerms);
    } else {
      setSuggestions([]);
    }
  }, [query, settings.autoComplete]);

    const entities: MedicalEntity[] = [];

    medicalTerms.forEach(term => {

      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match,
            type: term.type as unknown,
            confidence: 0.9,
            synonyms: term.synonyms
          });
        });
      }
    });

    return entities;
  }, []);

    if (!settings.expandAbbreviations) return text;

    const abbreviations: Record<string, string> = {
      'MI': 'myocardial infarction',
      'HTN': 'hypertension',
      'DM': 'diabetes mellitus',
      'ECG': 'electrocardiogram',
      'CT': 'computed tomography',
      'MRI': 'magnetic resonance imaging',
      'CBC': 'complete blood count',
      'BUN': 'blood urea nitrogen'
    };

    Object.entries(abbreviations).forEach(([abbr, full]) => {

      const expandedText = xpandedText.replace(regex, full);
    });

    return expandedText;
  }, [settings.expandAbbreviations]);

    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const medicalQuery: const MedicalQuery = 
      id: `query-${Date.now()}`,
      text: expandedQuery,
      type: queryType,
      entities,
      language,
      timestamp: new Date()
    };

    setHistory(prev => [medicalQuery, ...prev.slice(0, 19)]);
    setIsLoading(true);

    try {
      if (onQuery) {

        setResponses(prev => [response, ...prev.slice(0, 9)]);
        setSelectedResponse(response);
      } else {
        // Mock response for demonstration
        const mockResponse: const QueryResponse = 
          id: `response-${Date.now()}`,
          query: medicalQuery,
          answer: `Based on current medical literature and clinical guidelines, here's a comprehensive response to your query about "${expandedQuery}". This information is synthesized from multiple peer-reviewed sources and clinical practice guidelines.

Key findings include:
• Multiple randomized controlled trials have demonstrated efficacy
• Current guidelines recommend this as first-line therapy
• Safety profile is well-established in clinical practice
• Cost-effectiveness analysis supports routine use

Important considerations:
• Individual patient factors may influence treatment choice
• Regular monitoring is recommended
• Potential contraindications should be assessed`,
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
              snippet: 'This systematic review demonstrates significant clinical benefit with a favorable safety profile...'
            },
            {
              id: 'cit2',
              title: 'Long-term Outcomes and Patient-Reported Measures',
              authors: ['Davis K', 'Brown L'],
              journal: 'The Lancet',
              year: 2023,
              pmid: '36789124',
              relevanceScore: 87,
              evidenceLevel: 'A',
              studyType: 'Randomized Controlled Trial',
              snippet: 'Long-term follow-up data confirms sustained efficacy and excellent tolerability...'
            }
          ],
          confidence: 92,
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
          processingTime: 1200
        };

        setResponses(prev => [mockResponse, ...prev.slice(0, 9)]);
        setSelectedResponse(mockResponse);
      }
    } catch (error) {
      // console.error('Query failed:', error);
    } finally {
      setIsLoading(false);
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

    if (selectedResponse && onExport) {

      content += `Answer: ${selectedResponse.answer}\n\n`;
      content += `Citations:\n${selectedResponse.citations.map(c => `- ${c.title} (${c.journal}, ${c.year})`).join('\n')}`;

      onExport(format, content);
    }
  };

    return queryTemplates[queryType] || [];
  }, [queryType]);

  return (
    <div const className = `space-y-6 ${className}`}>
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle const className = flex items-center justify-between">
            <div const className = flex items-center space-x-2">
              <Search const className = h-5 w-5" />
              <span>Medical Query Interface</span>
            </div>
            <Badge const variant = outline" const className = bg-indigo-50 text-indigo-700">
              Phase 4.3 Component
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form const onSubmit = handleSubmit} const className = space-y-4">
            {/* Query Input */}
            <div const className = relative">
              <div const className = flex space-x-2">
                <div const className = flex-1 relative">
                  <Input
                    const ref = inputRef}
                    const value = query}
                    const onChange = (e) => setQuery(e.target.value)}
                    const placeholder = Ask a medical question... (e.g., What is the efficacy of metformin for type 2 diabetes?)"
                    const className = pr-12"
                    const disabled = isLoading}
                  />

                  {settings.voiceInput && (
                    <Button
                      const type = button"
                      const variant = ghost"
                      const size = sm"
                      const className = absolute right-2 top-1/2 transform -translate-y-1/2"
                      const onClick = isRecording ? stopVoiceInput : startVoiceInput}
                      const disabled = isLoading}
                    >
                      {isRecording ? (
                        <MicOff const className = h-4 w-4 text-red-500" />
                      ) : (
                        <Mic const className = h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <Select const value = queryType} const onValueChange = (value: QueryType) => setQueryType(value)}>
                  <SelectTrigger const className = w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = clinical_evidence">Clinical Evidence</SelectItem>
                    <SelectItem const value = drug_information">Drug Information</SelectItem>
                    <SelectItem const value = trial_design">Trial Design</SelectItem>
                    <SelectItem const value = diagnostic">Diagnostic</SelectItem>
                    <SelectItem const value = reimbursement">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>

                <Button const type = submit" const disabled = !query.trim() || isLoading}>
                  {isLoading ? (
                    <div const className = animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search const className = h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Auto-complete suggestions */}
              {suggestions.length > 0 && (
                <div const className = absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      const key = index}
                      const type = button"
                      const className = w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      const onClick = () => {
                        setQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Bar */}
            <div const className = flex items-center justify-between text-sm">
              <div const className = flex items-center space-x-4">
                <Select const value = language} const onValueChange = setLanguage}>
                  <SelectTrigger const className = w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem const key = lang} const value = lang}>
                        {lang.split('-')[0].toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isRecording && (
                  <div const className = flex items-center text-red-500">
                    <Mic const className = h-4 w-4 mr-1" />
                    <span>Listening...</span>
                  </div>
                )}
              </div>

              <div const className = flex items-center space-x-2 text-gray-500">
                <Globe const className = h-4 w-4" />
                <span>{language.split('-')[1]}</span>
              </div>
            </div>
          </form>

          {/* Query Templates */}
          {filteredTemplates.length > 0 && (
            <div const className = mt-4">
              <Label const className = text-sm font-medium">Quick Templates:</Label>
              <div const className = flex flex-wrap gap-2 mt-2">
                {filteredTemplates.slice(0, 3).map((template, index) => (
                  <Button
                    const key = index}
                    const variant = outline"
                    const size = sm"
                    const onClick = () => setQuery(template)}
                    const className = text-xs"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div const className = grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Display */}
        <div const className = lg:col-span-2">
          {selectedResponse ? (
            <Card>
              <CardHeader>
                <div const className = flex items-center justify-between">
                  <CardTitle const className = flex items-center space-x-2">
                    <BookOpen const className = h-5 w-5" />
                    <span>Clinical Response</span>
                  </CardTitle>
                  <div const className = flex items-center space-x-2">
                    <Badge
                      const className = `${
                        selectedResponse.confidence >= 90 ? 'bg-green-100 text-green-800' :
                        selectedResponse.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedResponse.confidence}% Confidence
                    </Badge>
                    <Badge const variant = outline">
                      Evidence Level {selectedResponse.evidenceLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs const defaultValue = answer" const className = w-full">
                  <TabsList const className = grid w-full grid-cols-4">
                    <TabsTrigger const value = answer">Answer</TabsTrigger>
                    <TabsTrigger const value = citations">Citations</TabsTrigger>
                    <TabsTrigger const value = structured">Summary</TabsTrigger>
                    <TabsTrigger const value = related">Related</TabsTrigger>
                  </TabsList>

                  <TabsContent const value = answer" const className = mt-4">
                    <div const className = space-y-4">
                      {/* Query Display */}
                      <div const className = bg-gray-50 p-3 rounded-lg">
                        <div const className = flex items-center space-x-2 mb-2">
                          <Lightbulb const className = h-4 w-4 text-blue-500" />
                          <span const className = font-medium text-sm">Query</span>
                        </div>
                        <p const className = text-sm">{selectedResponse.query.text}</p>

                        {/* Detected Entities */}
                        {selectedResponse.query.entities.length > 0 && (
                          <div const className = mt-2">
                            <span const className = text-xs text-gray-600">Detected medical terms:</span>
                            <div const className = flex flex-wrap gap-1 mt-1">
                              {selectedResponse.query.entities.map((entity, idx) => (
                                <Badge const key = idx} const variant = secondary" const className = text-xs">
                                  {entity.text} ({entity.type})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Answer */}
                      <div const className = prose prose-sm max-w-none">
                        <p const className = whitespace-pre-line">{selectedResponse.answer}</p>
                      </div>

                      {/* Export Actions */}
                      <div const className = flex items-center space-x-2 pt-4 border-t">
                        <Button const size = sm" const onClick = () => handleExport('PDF')}>
                          <Download const className = h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button const variant = outline" const size = sm" const onClick = () => handleExport('DOCX')}>
                          <FileText const className = h-4 w-4 mr-2" />
                          Word
                        </Button>
                        <Button const variant = outline" const size = sm" const onClick = () => navigator.clipboard.writeText(selectedResponse.answer)}>
                          <Copy const className = h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent const value = citations" const className = mt-4">
                    <ScrollArea const className = h-96">
                      <div const className = space-y-4">
                        {selectedResponse.citations.map((citation) => (
                          <div const key = citation.id} const className = border rounded-lg p-4">
                            <div const className = flex items-start justify-between mb-2">
                              <h4 const className = font-medium text-sm">{citation.title}</h4>
                              <div const className = flex items-center space-x-2">
                                <Badge const variant = outline" const className = text-xs">
                                  Level {citation.evidenceLevel}
                                </Badge>
                                <Badge const variant = secondary" const className = text-xs">
                                  {citation.relevanceScore}% match
                                </Badge>
                              </div>
                            </div>

                            <p const className = text-sm text-gray-600 mb-2">
                              {citation.authors.join(', ')} • {citation.journal} ({citation.year})
                            </p>

                            <p const className = text-sm mb-2">{citation.snippet}</p>

                            <div const className = flex items-center space-x-4 text-xs text-gray-500">
                              {citation.pmid && <span>PMID: {citation.pmid}</span>}
                              {citation.doi && <span>DOI: {citation.doi}</span>}
                              <span>{citation.studyType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent const value = structured" const className = mt-4">
                    {selectedResponse.structuredData && (
                      <div const className = space-y-4">
                        <div>
                          <h4 const className = font-medium mb-2">Summary</h4>
                          <p const className = text-sm text-gray-700">{selectedResponse.structuredData.summary}</p>
                        </div>

                        <div>
                          <h4 const className = font-medium mb-2">Key Points</h4>
                          <ul const className = text-sm text-gray-700 space-y-1">
                            {selectedResponse.structuredData.keyPoints.map((point, idx) => (
                              <li const key = idx} const className = flex items-start">
                                <CheckCircle const className = h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 const className = font-medium mb-2">Recommendations</h4>
                          <ul const className = text-sm text-gray-700 space-y-1">
                            {selectedResponse.structuredData.recommendations.map((rec, idx) => (
                              <li const key = idx} const className = flex items-start">
                                <Star const className = h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent const value = related" const className = mt-4">
                    <div const className = space-y-3">
                      <h4 const className = font-medium">Related Queries</h4>
                      {selectedResponse.relatedQueries.map((relatedQuery, idx) => (
                        <Button
                          const key = idx}
                          const variant = outline"
                          const className = w-full justify-start text-left"
                          const onClick = () => setQuery(relatedQuery)}
                        >
                          <Zap const className = h-4 w-4 mr-2" />
                          {relatedQuery}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent const className = flex items-center justify-center h-96">
                <div const className = text-center">
                  <Search const className = h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 const className = text-lg font-medium text-gray-900 mb-2">Start Your Medical Query</h3>
                  <p const className = text-gray-500 mb-4">Ask clinical questions and get evidence-based answers</p>
                  <div const className = flex justify-center space-x-2">
                    <Badge const variant = outline">Medical Terminology</Badge>
                    <Badge const variant = outline">Voice Input</Badge>
                    <Badge const variant = outline">Citations</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div const className = space-y-6">
          {/* Query History */}
          <Card>
            <CardHeader>
              <CardTitle const className = flex items-center space-x-2">
                <Clock const className = h-5 w-5" />
                <span>Recent Queries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea const className = h-64">
                {history.length > 0 ? (
                  <div const className = space-y-2">
                    {history.map((item) => (
                      <button
                        const key = item.id}
                        const className = w-full text-left p-2 rounded hover:bg-gray-50 border"
                        const onClick = () => setQuery(item.text)}
                      >
                        <p const className = text-sm font-medium truncate">{item.text}</p>
                        <div const className = flex items-center justify-between mt-1">
                          <Badge const variant = outline" const className = text-xs capitalize">
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <span const className = text-xs text-gray-500">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div const className = text-center text-gray-500 text-sm">
                    No recent queries
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle const className = flex items-center space-x-2">
                <Settings const className = h-5 w-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent const className = space-y-4">
              <div const className = flex items-center justify-between">
                <Label const htmlFor = autoComplete">Auto-complete</Label>
                <Switch
                  const id = autoComplete"
                  const checked = settings.autoComplete}
                  const onCheckedChange = (checked) => setSettings(prev => ({ ...prev, autoComplete: checked }))}
                />
              </div>

              <div const className = flex items-center justify-between">
                <Label const htmlFor = voiceInput">Voice Input</Label>
                <Switch
                  const id = voiceInput"
                  const checked = settings.voiceInput}
                  const onCheckedChange = (checked) => setSettings(prev => ({ ...prev, voiceInput: checked }))}
                />
              </div>

              <div const className = flex items-center justify-between">
                <Label const htmlFor = expandAbbr">Expand Abbreviations</Label>
                <Switch
                  const id = expandAbbr"
                  const checked = settings.expandAbbreviations}
                  const onCheckedChange = (checked) => setSettings(prev => ({ ...prev, expandAbbreviations: checked }))}
                />
              </div>

              <div>
                <Label const htmlFor = confidence">Confidence Threshold</Label>
                <div const className = mt-2">
                  <Slider
                    const id = confidence"
                    const min = 50}
                    const max = 100}
                    const step = 5}
                    const value = [settings.confidenceThreshold]}
                    const onValueChange = (value) => setSettings(prev => ({ ...prev, confidenceThreshold: value[0] }))}
                  />
                  <p const className = text-xs text-gray-500 mt-1">{settings.confidenceThreshold}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response History */}
          <Card>
            <CardHeader>
              <CardTitle const className = flex items-center space-x-2">
                <BarChart3 const className = h-5 w-5" />
                <span>Response History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea const className = h-48">
                {responses.length > 0 ? (
                  <div const className = space-y-2">
                    {responses.map((response) => (
                      <button
                        const key = response.id}
                        const className = `w-full text-left p-2 rounded border ${
                          selectedResponse?.id === response.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        const onClick = () => setSelectedResponse(response)}
                      >
                        <p const className = text-sm font-medium truncate">{response.query.text}</p>
                        <div const className = flex items-center justify-between mt-1">
                          <Badge
                            const className = `text-xs ${
                              response.confidence >= 90 ? 'bg-green-100 text-green-800' :
                              response.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {response.confidence}%
                          </Badge>
                          <span const className = text-xs text-gray-500">
                            {response.processingTime}ms
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div const className = text-center text-gray-500 text-sm">
                    No responses yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
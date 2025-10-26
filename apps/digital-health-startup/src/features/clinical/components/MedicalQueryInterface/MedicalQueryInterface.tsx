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

type QueryType = 'clinical_evidence' | 'drug_information' | 'trial_design' | 'diagnostic' | 'reimbursement';
type ExportFormat = 'PDF' | 'DOCX' | 'FHIR' | 'HL7';

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
  ],
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
  languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'],
  className = ''
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

      expandedText = expandedText.replace(regex, full);
    });

    return expandedText;
  }, [settings.expandAbbreviations]);

    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const medicalQuery: MedicalQuery = {
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
        const mockResponse: QueryResponse = {
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
      content += `Citations:\n${selectedResponse.citations.map((c: any) => `- ${c.title} (${c.journal}, ${c.year})`).join('\n')}`;

      onExport(format, content);
    }
  };

    return queryTemplates[queryType] || [];
  }, [queryType]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Medical Query Interface</span>
            </div>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
              Phase 4.3 Component
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Query Input */}
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a medical question... (e.g., What is the efficacy of metformin for type 2 diabetes?)"
                    className="pr-12"
                    disabled={isLoading}
                  />

                  {settings.voiceInput && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={isRecording ? stopVoiceInput : startVoiceInput}
                      disabled={isLoading}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <Select value={queryType} onValueChange={(value: QueryType) => setQueryType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical_evidence">Clinical Evidence</SelectItem>
                    <SelectItem value="drug_information">Drug Information</SelectItem>
                    <SelectItem value="trial_design">Trial Design</SelectItem>
                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="submit" disabled={!query.trim() || isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Auto-complete suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      onClick={() => {
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
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang.split('-')[0].toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isRecording && (
                  <div className="flex items-center text-red-500">
                    <Mic className="h-4 w-4 mr-1" />
                    <span>Listening...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                <Globe className="h-4 w-4" />
                <span>{language.split('-')[1]}</span>
              </div>
            </div>
          </form>

          {/* Query Templates */}
          {filteredTemplates.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium">Quick Templates:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredTemplates.slice(0, 3).map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(template)}
                    className="text-xs"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Display */}
        <div className="lg:col-span-2">
          {selectedResponse ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Clinical Response</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`${
                        selectedResponse.confidence >= 90 ? 'bg-green-100 text-green-800' :
                        selectedResponse.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedResponse.confidence}% Confidence
                    </Badge>
                    <Badge variant="outline">
                      Evidence Level {selectedResponse.evidenceLevel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="answer" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="answer">Answer</TabsTrigger>
                    <TabsTrigger value="citations">Citations</TabsTrigger>
                    <TabsTrigger value="structured">Summary</TabsTrigger>
                    <TabsTrigger value="related">Related</TabsTrigger>
                  </TabsList>

                  <TabsContent value="answer" className="mt-4">
                    <div className="space-y-4">
                      {/* Query Display */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">Query</span>
                        </div>
                        <p className="text-sm">{selectedResponse.query.text}</p>

                        {/* Detected Entities */}
                        {selectedResponse.query.entities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-600">Detected medical terms:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedResponse.query.entities.map((entity, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {entity.text} ({entity.type})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Answer */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-line">{selectedResponse.answer}</p>
                      </div>

                      {/* Export Actions */}
                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <Button size="sm" onClick={() => handleExport('PDF')}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('DOCX')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Word
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(selectedResponse.answer)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="citations" className="mt-4">
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {selectedResponse.citations.map((citation) => (
                          <div key={citation.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{citation.title}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  Level {citation.evidenceLevel}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {citation.relevanceScore}% match
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              {citation.authors.join(', ')} • {citation.journal} ({citation.year})
                            </p>

                            <p className="text-sm mb-2">{citation.snippet}</p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {citation.pmid && <span>PMID: {citation.pmid}</span>}
                              {citation.doi && <span>DOI: {citation.doi}</span>}
                              <span>{citation.studyType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="structured" className="mt-4">
                    {selectedResponse.structuredData && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Summary</h4>
                          <p className="text-sm text-gray-700">{selectedResponse.structuredData.summary}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Key Points</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedResponse.structuredData.keyPoints.map((point, idx) => (
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
                            {selectedResponse.structuredData.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start">
                                <Star className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="related" className="mt-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Related Queries</h4>
                      {selectedResponse.relatedQueries.map((relatedQuery, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => setQuery(relatedQuery)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
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
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Medical Query</h3>
                  <p className="text-gray-500 mb-4">Ask clinical questions and get evidence-based answers</p>
                  <div className="flex justify-center space-x-2">
                    <Badge variant="outline">Medical Terminology</Badge>
                    <Badge variant="outline">Voice Input</Badge>
                    <Badge variant="outline">Citations</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Query History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Queries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left p-2 rounded hover:bg-gray-50 border"
                        onClick={() => setQuery(item.text)}
                      >
                        <p className="text-sm font-medium truncate">{item.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    No recent queries
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoComplete">Auto-complete</Label>
                <Switch
                  id="autoComplete"
                  checked={settings.autoComplete}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoComplete: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="voiceInput">Voice Input</Label>
                <Switch
                  id="voiceInput"
                  checked={settings.voiceInput}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, voiceInput: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="expandAbbr">Expand Abbreviations</Label>
                <Switch
                  id="expandAbbr"
                  checked={settings.expandAbbreviations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, expandAbbreviations: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="confidence">Confidence Threshold</Label>
                <div className="mt-2">
                  <Slider
                    id="confidence"
                    min={50}
                    max={100}
                    step={5}
                    value={[settings.confidenceThreshold]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, confidenceThreshold: value[0] }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.confidenceThreshold}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Response History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {responses.length > 0 ? (
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <button
                        key={response.id}
                        className={`w-full text-left p-2 rounded border ${
                          selectedResponse?.id === response.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedResponse(response)}
                      >
                        <p className="text-sm font-medium truncate">{response.query.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge
                            className={`text-xs ${
                              response.confidence >= 90 ? 'bg-green-100 text-green-800' :
                              response.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {response.confidence}%
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {response.processingTime}ms
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
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
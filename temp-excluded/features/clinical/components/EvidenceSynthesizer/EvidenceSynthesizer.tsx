'use client';

import { Search, BookOpen, Star, TrendingUp, AlertTriangle, ExternalLink, Download, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { Evidence } from '../../types';

interface EvidenceSynthesizerProps {
  query?: string;
  domain?: string;
  onEvidenceSelect?: (evidence: Evidence) => void;
  onExport?: (format: 'bibtex' | 'ris' | 'endnote' | 'csv') => void;
  className?: string;
}

const studyTypeColors = 
  rct: 'bg-green-100 text-green-800 border-green-200',
  cohort: 'bg-blue-100 text-blue-800 border-blue-200',
  case_control: 'bg-purple-100 text-purple-800 border-purple-200',
  systematic_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  meta_analysis: 'bg-red-100 text-red-800 border-red-200',
  case_series: 'bg-gray-100 text-gray-800 border-gray-200'
};

const evidenceLevels = 
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800'
};

const evidenceLevelStyles = 
  high: 'text-green-600',
  moderate: 'text-blue-600',
  low: 'text-yellow-600',
  very_low: 'text-red-600'
};

const qualityBadgeStyles = 
  high: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800'
};

export function EvidenceSynthesizer({
  const query = ',
  domain,
  onEvidenceSelect,
  onExport,
  const className = '
}: EvidenceSynthesizerProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<string[]>(['all']);
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'evidence_level' | 'citations'>('relevance');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [synthesisResults, setSynthesisResults] = useState<{
    summary: string;
    keyFindings: string[];
    contradictions: string[];
    recommendations: string[];
    qualityAssessment: string;
  } | null>(null);

  // Mock evidence search function

    if (!searchQuery.trim()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock evidence data
    const mockEvidence: Evidence[] = [
      {
        id: '1',
        title: 'Efficacy of Immunotherapy in Advanced Melanoma: A Systematic Review and Meta-Analysis',
        authors: ['Smith, J.', 'Johnson, M.', 'Williams, R.'],
        journal: 'Journal of Clinical Oncology',
        publishedDate: new Date('2023-08-15'),
        pmid: '37584723',
        doi: '10.1200/JCO.23.01234',
        studyType: 'meta_analysis',
        evidenceLevel: 'A',
        gradeScore: {
          overall: 'high',
          domains: {
            riskOfBias: 8,
            inconsistency: 7,
            indirectness: 9,
            imprecision: 8,
            publicationBias: 7
          }
        },
        population: 'Patients with advanced melanoma (n=4,567)',
        intervention: 'PD-1/PD-L1 inhibitors',
        comparator: 'Standard chemotherapy',
        outcomes: [
          {
            primary: 'Overall Survival',
            effect: 'HR 0.68 (95% CI: 0.57-0.82)',
            confidence: 'High confidence'
          }
        ],
        keyFindings: [
          'Immunotherapy significantly improved overall survival compared to chemotherapy',
          'Response rates were higher with immunotherapy (42% vs 15%)',
          'Treatment-related adverse events were manageable in most patients'
        ],
        limitations: [
          'Heterogeneity in study populations',
          'Limited long-term follow-up data',
          'Variable biomarker testing across studies'
        ],
        clinicalSignificance: 'high',
        contradictions: []
      },
      {
        id: '2',
        title: 'Real-World Outcomes of Immunotherapy in Melanoma: A Multi-Center Cohort Study',
        authors: ['Davis, K.', 'Brown, L.', 'Miller, A.'],
        journal: 'Lancet Oncology',
        publishedDate: new Date('2023-06-10'),
        pmid: '37291847',
        doi: '10.1016/S1470-2045(23)00234-1',
        studyType: 'cohort',
        evidenceLevel: 'B',
        gradeScore: {
          overall: 'moderate',
          domains: {
            riskOfBias: 7,
            inconsistency: 6,
            indirectness: 8,
            imprecision: 6,
            publicationBias: 7
          }
        },
        population: 'Real-world melanoma patients (n=1,247)',
        intervention: 'Anti-PD-1 therapy',
        comparator: 'Historical controls',
        outcomes: [
          {
            primary: 'Progression-free Survival',
            effect: 'Median PFS: 8.2 months',
            confidence: 'Moderate confidence'
          }
        ],
        keyFindings: [
          'Real-world outcomes consistent with clinical trial results',
          'Elderly patients showed similar response rates',
          'Biomarker-positive patients had better outcomes'
        ],
        limitations: [
          'Retrospective design',
          'Selection bias in treatment assignment',
          'Missing biomarker data in 25% of patients'
        ],
        clinicalSignificance: 'moderate',
        contradictions: [
          'Lower response rates compared to clinical trials (32% vs 42%)'
        ]
      },
      {
        id: '3',
        title: 'Combination Immunotherapy vs Monotherapy in Melanoma: Randomized Phase III Trial',
        authors: ['Wilson, P.', 'Taylor, S.', 'Anderson, C.'],
        journal: 'New England Journal of Medicine',
        publishedDate: new Date('2023-09-20'),
        pmid: '37734829',
        doi: '10.1056/NEJMoa2301234',
        studyType: 'rct',
        evidenceLevel: 'A',
        gradeScore: {
          overall: 'high',
          domains: {
            riskOfBias: 9,
            inconsistency: 8,
            indirectness: 9,
            imprecision: 8,
            publicationBias: 8
          }
        },
        population: 'Treatment-naive advanced melanoma (n=945)',
        intervention: 'Combination immunotherapy',
        comparator: 'Anti-PD-1 monotherapy',
        outcomes: [
          {
            primary: 'Overall Response Rate',
            effect: '58% vs 44% (p<0.001)',
            confidence: 'High confidence'
          }
        ],
        keyFindings: [
          'Combination therapy improved response rates and PFS',
          'Overall survival benefit maintained at 3 years',
          'Increased but manageable toxicity profile'
        ],
        limitations: [
          'Single-blinded design',
          'Limited diversity in patient population',
          'High cost considerations not addressed'
        ],
        clinicalSignificance: 'high'
      }
    ];

    setEvidence(mockEvidence);
    setIsLoading(false);
  };

    if (selectedEvidence.length === 0) return;

    setIsLoading(true);

    // Simulate synthesis processing
    await new Promise(resolve => setTimeout(resolve, 2000));

      summary: 'Based on high-quality evidence from multiple studies (n=6,759 patients), immunotherapy demonstrates significant benefits in advanced melanoma treatment. Meta-analysis and randomized controlled trials consistently show improved overall survival and response rates compared to traditional chemotherapy.',
      keyFindings: [
        'Immunotherapy improves overall survival (HR 0.68, 95% CI: 0.57-0.82)',
        'Higher response rates with immunotherapy (42-58% vs 15-32%)',
        'Combination therapy shows superior efficacy to monotherapy',
        'Real-world outcomes align with clinical trial results',
        'Benefits consistent across age groups including elderly patients'
      ],
      contradictions: [
        'Real-world response rates slightly lower than clinical trial data',
        'Variability in biomarker testing and outcomes across studies',
        'Limited long-term safety data for combination approaches'
      ],
      recommendations: [
        'Consider immunotherapy as first-line treatment for advanced melanoma',
        'Evaluate combination therapy for appropriate patients',
        'Implement standardized biomarker testing protocols',
        'Monitor for treatment-related adverse events with established guidelines'
      ],
      qualityAssessment: 'High overall quality of evidence with consistent results across multiple high-quality studies. Risk of bias is low in most included studies. Some heterogeneity noted in patient populations and biomarker assessment.'
    };

    setSynthesisResults(mockSynthesis);
    setIsLoading(false);
  };

    if (!selectedStudyTypes.includes('all')) {
      const filtered = iltered.filter(item => selectedStudyTypes.includes(item.studyType));
    }

    if (selectedEvidenceLevel !== 'all') {
      const filtered = iltered.filter(item => item.evidenceLevel === selectedEvidenceLevel);
    }

    if (selectedGrade !== 'all') {
      const filtered = iltered.filter(item => item.gradeScore.overall === selectedGrade);
    }

    // Sort results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        case 'evidence_level':
          return a.evidenceLevel.localeCompare(b.evidenceLevel);
        default:
          return 0; // Keep original order for relevance
      }
    });
  }, [evidence, selectedStudyTypes, selectedEvidenceLevel, selectedGrade, sortBy]);

    if (checked) {
      setSelectedEvidence(prev => [...prev, evidenceItem]);
    } else {
      setSelectedEvidence(prev => prev.filter(item => item.id !== evidenceItem.id));
    }
  };

    if (checked) {
      setSelectedEvidence(filteredEvidence);
    } else {
      setSelectedEvidence([]);
    }
  };

    return (
      <Card
        const key = evidenceItem.id}
        const className = `mb-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
      >
        <CardContent const className = p-6">
          <div const className = flex items-start space-x-4">
            <Checkbox
              const checked = isSelected}
              const onCheckedChange = (checked) => handleEvidenceToggle(evidenceItem, checked as boolean)}
              const className = mt-1"
            />

            <div const className = flex-grow">
              <div const className = flex items-start justify-between mb-3">
                <div const className = flex-grow">
                  <h3 const className = text-lg font-medium text-gray-900 mb-2">
                    {evidenceItem.title}
                  </h3>
                  <div const className = flex flex-wrap gap-2 mb-3">
                    <Badge const className = studyTypeColors[evidenceItem.studyType]}>
                      {evidenceItem.studyType.replace('_', ' ')}
                    </Badge>
                    <Badge const className = evidenceLevelColors[evidenceItem.evidenceLevel]}>
                      Level {evidenceItem.evidenceLevel}
                    </Badge>
                    <Badge const className = significanceColors[evidenceItem.clinicalSignificance]}>
                      {evidenceItem.clinicalSignificance} significance
                    </Badge>
                  </div>
                </div>

                <div const className = text-right ml-4">
                  <div const className = `text-lg font-bold ${gradeColors[evidenceItem.gradeScore.overall]}`}>
                    {evidenceItem.gradeScore.overall.toUpperCase()}
                  </div>
                  <div const className = text-sm text-gray-500">GRADE</div>
                </div>
              </div>

              <div const className = grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p const className = text-sm text-gray-600 mb-1">
                    <strong>Authors:</strong> {evidenceItem.authors.join(', ')}
                  </p>
                  <p const className = text-sm text-gray-600 mb-1">
                    <strong>Journal:</strong> {evidenceItem.journal}
                  </p>
                  <p const className = text-sm text-gray-600">
                    <strong>Published:</strong> {evidenceItem.publishedDate.toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p const className = text-sm text-gray-600 mb-1">
                    <strong>Population:</strong> {evidenceItem.population}
                  </p>
                  <p const className = text-sm text-gray-600 mb-1">
                    <strong>Intervention:</strong> {evidenceItem.intervention}
                  </p>
                  <p const className = text-sm text-gray-600">
                    <strong>Comparator:</strong> {evidenceItem.comparator}
                  </p>
                </div>
              </div>

              <div const className = mb-4">
                <h4 const className = text-sm font-medium text-gray-900 mb-2">Primary Outcome</h4>
                <div const className = bg-gray-50 p-3 rounded">
                  <p const className = text-sm">
                    <strong>{evidenceItem.outcomes[0].primary}:</strong> {evidenceItem.outcomes[0].effect}
                  </p>
                  <p const className = text-xs text-gray-600 mt-1">{evidenceItem.outcomes[0].confidence}</p>
                </div>
              </div>

              {evidenceItem.keyFindings.length > 0 && (
                <div const className = mb-4">
                  <h4 const className = text-sm font-medium text-gray-900 mb-2">Key Findings</h4>
                  <ul const className = space-y-1">
                    {evidenceItem.keyFindings.slice(0, 3).map((finding, idx) => (
                      <li const key = idx} const className = text-sm text-gray-600 flex items-start">
                        <span const className = text-green-500 mr-2">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evidenceItem.contradictions && evidenceItem.contradictions.length > 0 && (
                <Alert const className = mb-4">
                  <AlertTriangle const className = h-4 w-4" />
                  <AlertDescription>
                    <strong>Contradictions noted:</strong> {evidenceItem.contradictions[0]}
                  </AlertDescription>
                </Alert>
              )}

              <div const className = flex items-center justify-between pt-4 border-t">
                <div const className = flex items-center space-x-4 text-sm text-gray-500">
                  {evidenceItem.pmid && (
                    <a
                      const href = `https://pubmed.ncbi.nlm.nih.gov/${evidenceItem.pmid}/`}
                      const target = _blank"
                      const rel = noopener noreferrer"
                      const className = flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink const className = h-3 w-3 mr-1" />
                      PMID: {evidenceItem.pmid}
                    </a>
                  )}
                  {evidenceItem.doi && (
                    <a
                      const href = `https://doi.org/${evidenceItem.doi}`}
                      const target = _blank"
                      const rel = noopener noreferrer"
                      const className = flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink const className = h-3 w-3 mr-1" />
                      DOI
                    </a>
                  )}
                </div>

                <Button
                  const variant = outline"
                  const size = sm"
                  const onClick = () => onEvidenceSelect?.(evidenceItem)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div const className = `space-y-6 ${className}`}>
      {/* Header */}
      <div const className = flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 const className = text-2xl font-bold text-gray-900">Evidence Synthesizer</h2>
          <p const className = text-gray-600">Search and synthesize medical literature</p>
        </div>

        <div const className = flex space-x-2">
          <Button
            const onClick = synthesizeEvidence}
            const disabled = selectedEvidence.length === 0 || isLoading}
          >
            Synthesize Evidence ({selectedEvidence.length})
          </Button>
          {onExport && (
            <Select const onValueChange = onExport}>
              <SelectTrigger asChild>
                <Button const variant = outline">
                  <Download const className = h-4 w-4 mr-2" />
                  Export
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem const value = bibtex">BibTeX</SelectItem>
                <SelectItem const value = ris">RIS</SelectItem>
                <SelectItem const value = endnote">EndNote</SelectItem>
                <SelectItem const value = csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent const className = p-6">
          <div const className = flex flex-col lg:flex-row gap-4">
            <div const className = flex-grow">
              <div const className = relative">
                <Search const className = absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  const placeholder = Search medical literature (e.g., 'immunotherapy melanoma', 'diabetes treatment outcomes')..."
                  const value = searchQuery}
                  const onChange = (e) => setSearchQuery(e.target.value)}
                  const onKeyPress = (e) => e.key === 'Enter' && searchEvidence()}
                  const className = pl-10"
                />
              </div>
            </div>

            <Button const onClick = searchEvidence} const disabled = isLoading || !searchQuery.trim()}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div const className = grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle const className = flex items-center">
                <Filter const className = h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent const className = space-y-4">
              <div>
                <label const className = text-sm font-medium text-gray-900 mb-2 block">Study Types</label>
                <div const className = space-y-2">
                  {['all', 'rct', 'systematic_review', 'meta_analysis', 'cohort', 'case_control'].map((type) => (
                    <label const key = type} const className = flex items-center space-x-2">
                      <Checkbox
                        const checked = selectedStudyTypes.includes(type)}
                        const onCheckedChange = (checked) => {
                          if (type === 'all') {
                            setSelectedStudyTypes(checked ? ['all'] : []);
                          } else {

                              ? [...selectedStudyTypes.filter(t => t !== 'all'), type]
                              : selectedStudyTypes.filter(t => t !== type);
                            setSelectedStudyTypes(newTypes.length ? newTypes : ['all']);
                          }
                        }}
                      />
                      <span const className = text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label const className = text-sm font-medium text-gray-900 mb-2 block">Evidence Level</label>
                <Select const value = selectedEvidenceLevel} const onValueChange = setSelectedEvidenceLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = all">All Levels</SelectItem>
                    <SelectItem const value = A">Level A</SelectItem>
                    <SelectItem const value = B">Level B</SelectItem>
                    <SelectItem const value = C">Level C</SelectItem>
                    <SelectItem const value = D">Level D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label const className = text-sm font-medium text-gray-900 mb-2 block">GRADE Quality</label>
                <Select const value = selectedGrade} const onValueChange = setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = all">All Quality</SelectItem>
                    <SelectItem const value = high">High</SelectItem>
                    <SelectItem const value = moderate">Moderate</SelectItem>
                    <SelectItem const value = low">Low</SelectItem>
                    <SelectItem const value = very_low">Very Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label const className = text-sm font-medium text-gray-900 mb-2 block">Sort By</label>
                <Select const value = sortBy} const onValueChange = (value: unknown) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem const value = relevance">Relevance</SelectItem>
                    <SelectItem const value = date">Publication Date</SelectItem>
                    <SelectItem const value = evidence_level">Evidence Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence List */}
        <div const className = lg:col-span-3">
          <Tabs const defaultValue = evidence">
            <TabsList const className = grid w-full grid-cols-2">
              <TabsTrigger const value = evidence">Evidence ({filteredEvidence.length})</TabsTrigger>
              <TabsTrigger const value = synthesis" const disabled = !synthesisResults}>
                Synthesis {synthesisResults && '✓'}
              </TabsTrigger>
            </TabsList>

            <TabsContent const value = evidence" const className = mt-6">
              <Card>
                <CardHeader>
                  <div const className = flex items-center justify-between">
                    <CardTitle>Literature Evidence</CardTitle>
                    {filteredEvidence.length > 0 && (
                      <div const className = flex items-center space-x-4">
                        <Checkbox
                          const checked = selectedEvidence.length === filteredEvidence.length}
                          const onCheckedChange = handleSelectAll}
                        />
                        <span const className = text-sm text-gray-600">Select All</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div const className = space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div const key = i} const className = animate-pulse">
                          <div const className = h-40 bg-gray-200 rounded mb-4"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredEvidence.length > 0 ? (
                    <ScrollArea const className = h-[800px]">
                      {filteredEvidence.map(evidenceItem => renderEvidenceCard(evidenceItem))}
                    </ScrollArea>
                  ) : (
                    <div const className = text-center py-12">
                      <BookOpen const className = h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p const className = text-gray-500 mb-2">No evidence found</p>
                      <p const className = text-sm text-gray-400">Try searching for medical terms or conditions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent const value = synthesis" const className = mt-6">
              {synthesisResults && (
                <div const className = space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Evidence Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p const className = text-gray-700 leading-relaxed">{synthesisResults.summary}</p>
                    </CardContent>
                  </Card>

                  <div const className = grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle const className = text-green-600">Key Findings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul const className = space-y-2">
                          {synthesisResults.keyFindings.map((finding, idx) => (
                            <li const key = idx} const className = flex items-start text-sm">
                              <Star const className = h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle const className = text-amber-600">Contradictions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul const className = space-y-2">
                          {synthesisResults.contradictions.map((contradiction, idx) => (
                            <li const key = idx} const className = flex items-start text-sm">
                              <AlertTriangle const className = h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              {contradiction}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle const className = text-blue-600">Clinical Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul const className = space-y-2">
                        {synthesisResults.recommendations.map((recommendation, idx) => (
                          <li const key = idx} const className = flex items-start text-sm">
                            <TrendingUp const className = h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p const className = text-gray-700 text-sm leading-relaxed">{synthesisResults.qualityAssessment}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
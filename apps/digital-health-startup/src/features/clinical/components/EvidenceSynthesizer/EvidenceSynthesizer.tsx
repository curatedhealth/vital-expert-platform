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

  rct: 'bg-green-100 text-green-800 border-green-200',
  cohort: 'bg-blue-100 text-blue-800 border-blue-200',
  case_control: 'bg-purple-100 text-purple-800 border-purple-200',
  systematic_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  meta_analysis: 'bg-red-100 text-red-800 border-red-200',
  case_series: 'bg-gray-100 text-gray-800 border-gray-200'
};

  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800'
};

  high: 'text-green-600',
  moderate: 'text-blue-600',
  low: 'text-yellow-600',
  very_low: 'text-red-600'
};

  high: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800'
};

export function EvidenceSynthesizer({
  query = '',
  domain,
  onEvidenceSelect,
  onExport,
  className = ''
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
      filtered = filtered.filter((item: any) => selectedStudyTypes.includes(item.studyType));
    }

    if (selectedEvidenceLevel !== 'all') {
      filtered = filtered.filter((item: any) => item.evidenceLevel === selectedEvidenceLevel);
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter((item: any) => item.gradeScore.overall === selectedGrade);
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
      setSelectedEvidence(prev => prev.filter((item: any) => item.id !== evidenceItem.id));
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
        key={evidenceItem.id}
        className={`mb-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleEvidenceToggle(evidenceItem, checked as boolean)}
              className="mt-1"
            />

            <div className="flex-grow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {evidenceItem.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={studyTypeColors[evidenceItem.studyType]}>
                      {evidenceItem.studyType.replace('_', ' ')}
                    </Badge>
                    <Badge className={evidenceLevelColors[evidenceItem.evidenceLevel]}>
                      Level {evidenceItem.evidenceLevel}
                    </Badge>
                    <Badge className={significanceColors[evidenceItem.clinicalSignificance]}>
                      {evidenceItem.clinicalSignificance} significance
                    </Badge>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${gradeColors[evidenceItem.gradeScore.overall]}`}>
                    {evidenceItem.gradeScore.overall.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">GRADE</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Authors:</strong> {evidenceItem.authors.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Journal:</strong> {evidenceItem.journal}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Published:</strong> {evidenceItem.publishedDate.toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Population:</strong> {evidenceItem.population}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Intervention:</strong> {evidenceItem.intervention}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Comparator:</strong> {evidenceItem.comparator}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Outcome</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>{evidenceItem.outcomes[0].primary}:</strong> {evidenceItem.outcomes[0].effect}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{evidenceItem.outcomes[0].confidence}</p>
                </div>
              </div>

              {evidenceItem.keyFindings.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Findings</h4>
                  <ul className="space-y-1">
                    {evidenceItem.keyFindings.slice(0, 3).map((finding, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evidenceItem.contradictions && evidenceItem.contradictions.length > 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Contradictions noted:</strong> {evidenceItem.contradictions[0]}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {evidenceItem.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${evidenceItem.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      PMID: {evidenceItem.pmid}
                    </a>
                  )}
                  {evidenceItem.doi && (
                    <a
                      href={`https://doi.org/${evidenceItem.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      DOI
                    </a>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEvidenceSelect?.(evidenceItem)}
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evidence Synthesizer</h2>
          <p className="text-gray-600">Search and synthesize medical literature</p>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={synthesizeEvidence}
            disabled={selectedEvidence.length === 0 || isLoading}
          >
            Synthesize Evidence ({selectedEvidence.length})
          </Button>
          {onExport && (
            <Select onValueChange={onExport}>
              <SelectTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bibtex">BibTeX</SelectItem>
                <SelectItem value="ris">RIS</SelectItem>
                <SelectItem value="endnote">EndNote</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medical literature (e.g., 'immunotherapy melanoma', 'diabetes treatment outcomes')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchEvidence()}
                  className="pl-10"
                />
              </div>
            </div>

            <Button onClick={searchEvidence} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Study Types</label>
                <div className="space-y-2">
                  {['all', 'rct', 'systematic_review', 'meta_analysis', 'cohort', 'case_control'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedStudyTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (type === 'all') {
                            setSelectedStudyTypes(checked ? ['all'] : []);
                          } else {

                              ? [...selectedStudyTypes.filter((t: any) => t !== 'all'), type]
                              : selectedStudyTypes.filter((t: any) => t !== type);
                            setSelectedStudyTypes(newTypes.length ? newTypes : ['all']);
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Evidence Level</label>
                <Select value={selectedEvidenceLevel} onValueChange={setSelectedEvidenceLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="A">Level A</SelectItem>
                    <SelectItem value="B">Level B</SelectItem>
                    <SelectItem value="C">Level C</SelectItem>
                    <SelectItem value="D">Level D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">GRADE Quality</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="very_low">Very Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: unknown) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Publication Date</SelectItem>
                    <SelectItem value="evidence_level">Evidence Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence List */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="evidence">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="evidence">Evidence ({filteredEvidence.length})</TabsTrigger>
              <TabsTrigger value="synthesis" disabled={!synthesisResults}>
                Synthesis {synthesisResults && '✓'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="evidence" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Literature Evidence</CardTitle>
                    {filteredEvidence.length > 0 && (
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedEvidence.length === filteredEvidence.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-gray-600">Select All</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-40 bg-gray-200 rounded mb-4"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredEvidence.length > 0 ? (
                    <ScrollArea className="h-[800px]">
                      {filteredEvidence.map(evidenceItem => renderEvidenceCard(evidenceItem))}
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No evidence found</p>
                      <p className="text-sm text-gray-400">Try searching for medical terms or conditions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="synthesis" className="mt-6">
              {synthesisResults && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Evidence Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{synthesisResults.summary}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Key Findings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {synthesisResults.keyFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <Star className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-amber-600">Contradictions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {synthesisResults.contradictions.map((contradiction, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              {contradiction}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Clinical Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {synthesisResults.recommendations.map((recommendation, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
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
                      <p className="text-gray-700 text-sm leading-relaxed">{synthesisResults.qualityAssessment}</p>
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
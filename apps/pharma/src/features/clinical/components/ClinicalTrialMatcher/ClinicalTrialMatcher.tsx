'use client';

import { Search, MapPin, Calendar, Users, Phone, Mail, ExternalLink, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';

import { ClinicalTrial, TrialMatch } from '../../types';

interface ClinicalTrialMatcherProps {
  patientData?: {
    age: number;
    gender: 'male' | 'female' | 'other';
    condition: string;
    medications: string[];
    labValues: Record<string, { value: number; unit: string; date: Date }>;
    medicalHistory: string[];
    location: { city: string; state: string; zipCode: string };
  };
  onTrialSelect?: (trial: ClinicalTrial) => void;
  onReferralGenerate?: (trial: ClinicalTrial) => void;
  className?: string;
}

  'Phase I': 'bg-blue-100 text-blue-800 border-blue-200',
  'Phase II': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Phase III': 'bg-green-100 text-green-800 border-green-200',
  'Phase IV': 'bg-purple-100 text-purple-800 border-purple-200'
};

  recruiting: 'bg-green-100 text-green-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800'
};

  eligible: 'text-green-600',
  potentially_eligible: 'text-yellow-600',
  not_eligible: 'text-red-600'
};

  eligible: CheckCircle,
  potentially_eligible: AlertCircle,
  not_eligible: XCircle
};

export function ClinicalTrialMatcher({
  patientData,
  onTrialSelect,
  onReferralGenerate,
  className = ''
}: ClinicalTrialMatcherProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('recruiting');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [matches, setMatches] = useState<TrialMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TrialMatch | null>(null);

  // Mock trial matching function

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock trial matches (in real implementation, this would call the AI matching service)
    const mockMatches: TrialMatch[] = [
      {
        trial: {
          nctNumber: 'NCT04567890',
          title: 'Phase II Study of Novel Immunotherapy in Advanced Melanoma',
          phase: 'Phase II',
          status: 'recruiting',
          condition: 'Advanced Melanoma',
          intervention: 'Experimental Immunotherapy Agent',
          sponsor: 'Memorial Sloan Kettering Cancer Center',
          locations: [
            { facility: 'Memorial Sloan Kettering Cancer Center', city: 'New York', state: 'NY', country: 'USA', distance: 15 },
            { facility: 'Johns Hopkins Hospital', city: 'Baltimore', state: 'MD', country: 'USA', distance: 35 }
          ],
          inclusionCriteria: [
            {
              id: '1',
              type: 'inclusion',
              category: 'demographic',
              description: 'Age >= 18 years',
              required: true
            },
            {
              id: '2',
              type: 'inclusion',
              category: 'medical',
              description: 'Histologically confirmed advanced melanoma',
              required: true
            }
          ],
          exclusionCriteria: [
            {
              id: '1',
              type: 'exclusion',
              category: 'medical',
              description: 'Active brain metastases',
              required: true
            }
          ],
          primaryEndpoints: ['Overall Response Rate'],
          secondaryEndpoints: ['Progression-free survival', 'Overall survival', 'Safety'],
          estimatedCompletion: new Date('2025-12-31'),
          contactInfo: {
            name: 'Dr. Sarah Johnson',
            phone: '(212) 555-0123',
            email: 'sarah.johnson@mskcc.org'
          }
        },
        matchScore: 92,
        eligibilityStatus: 'eligible',
        matchedCriteria: ['Age >= 18 years', 'Histologically confirmed advanced melanoma'],
        unmatchedCriteria: [],
        requiredAssessments: ['Recent imaging (within 4 weeks)', 'Laboratory studies'],
        confidence: 0.95
      },
      {
        trial: {
          nctNumber: 'NCT04123456',
          title: 'Phase III Randomized Study of Combination Therapy vs Standard Care',
          phase: 'Phase III',
          status: 'recruiting',
          condition: 'Advanced Solid Tumors',
          intervention: 'Combination Immunotherapy',
          sponsor: 'Dana-Farber Cancer Institute',
          locations: [
            { facility: 'Dana-Farber Cancer Institute', city: 'Boston', state: 'MA', country: 'USA', distance: 45 }
          ],
          inclusionCriteria: [
            {
              id: '1',
              type: 'inclusion',
              category: 'demographic',
              description: 'Age >= 21 years',
              required: true
            }
          ],
          exclusionCriteria: [],
          primaryEndpoints: ['Overall Survival'],
          secondaryEndpoints: ['Quality of Life', 'Toxicity'],
          estimatedCompletion: new Date('2026-06-30'),
          contactInfo: {
            name: 'Dr. Michael Chen',
            phone: '(617) 555-0198',
            email: 'michael.chen@dfci.harvard.edu'
          }
        },
        matchScore: 78,
        eligibilityStatus: 'potentially_eligible',
        matchedCriteria: ['Age >= 21 years'],
        unmatchedCriteria: ['Specific biomarker status unknown'],
        requiredAssessments: ['Biomarker testing', 'Performance status evaluation'],
        confidence: 0.82
      }
    ];

    setMatches(mockMatches);
    setIsLoading(false);
  };

    return matches.filter(match => {

      if (selectedPhase !== 'all' && trial.phase !== selectedPhase) return false;
      if (selectedStatus !== 'all' && trial.status !== selectedStatus) return false;

      if (searchTerm) {

        return trial.title.toLowerCase().includes(searchLower) ||
               trial.condition.toLowerCase().includes(searchLower) ||
               trial.intervention.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [matches, selectedPhase, selectedStatus, searchTerm]);

    setSelectedMatch(match);
    if (onTrialSelect) {
      onTrialSelect(match.trial);
    }
  };

    if (onReferralGenerate) {
      onReferralGenerate(match.trial);
    }
  };

  useEffect(() => {
    if (patientData) {
      performTrialMatching();
    }
  }, [patientData]);

    return (
      <Card
        key={match.trial.nctNumber}
        className={`mb-4 cursor-pointer hover:shadow-md transition-shadow ${
          selectedMatch?.trial.nctNumber === match.trial.nctNumber ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => handleTrialSelect(match)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <CardTitle className="text-lg mb-2 flex items-center">
                <EligibilityIcon className={`h-5 w-5 mr-2 ${eligibilityColors[match.eligibilityStatus]}`} />
                {match.trial.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={phaseColors[match.trial.phase]}>{match.trial.phase}</Badge>
                <Badge className={statusColors[match.trial.status]}>{match.trial.status}</Badge>
                <Badge variant="outline">{match.trial.nctNumber}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{match.matchScore}%</div>
              <div className="text-sm text-gray-500">Match Score</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Study Details</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Condition:</strong> {match.trial.condition}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Intervention:</strong> {match.trial.intervention}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Sponsor:</strong> {match.trial.sponsor}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                {nearestLocation.facility}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {nearestLocation.city}, {nearestLocation.state}
              </div>
              <div className="text-sm text-blue-600">
                {nearestLocation.distance} miles away
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Eligibility Status</h4>
              <div className={`text-sm font-medium ${eligibilityColors[match.eligibilityStatus]}`}>
                {match.eligibilityStatus.replace('_', ' ').toUpperCase()}
              </div>
              <Progress value={match.confidence * 100} className="mt-2" />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(match.confidence * 100)}% confidence
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Primary Endpoint</h4>
              <p className="text-sm text-gray-600">
                {match.trial.primaryEndpoints[0]}
              </p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Est. completion: {match.trial.estimatedCompletion.toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrialSelect(match);
                }}
              >
                View Details
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://clinicaltrials.gov/ct2/show/${match.trial.nctNumber}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View on ClinicalTrials.gov</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleReferralGenerate(match);
              }}
              disabled={match.eligibilityStatus === 'not_eligible'}
            >
              Generate Referral
            </Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Clinical Trial Matcher</h2>
          <p className="text-gray-600">Find matching clinical trials for your patient</p>
        </div>

        <div className="flex space-x-2">
          <Button onClick={performTrialMatching} disabled={isLoading}>
            {isLoading ? 'Matching...' : 'Find Trials'}
          </Button>
        </div>
      </div>

      {/* Patient Summary */}
      {patientData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Patient Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Age:</strong> {patientData.age} years old
              </div>
              <div>
                <strong>Gender:</strong> {patientData.gender}
              </div>
              <div>
                <strong>Primary Condition:</strong> {patientData.condition}
              </div>
              <div>
                <strong>Location:</strong> {patientData.location.city}, {patientData.location.state}
              </div>
              <div>
                <strong>Current Medications:</strong> {patientData.medications.length} medications
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search trials by condition, intervention, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="Phase I">Phase I</SelectItem>
                  <SelectItem value="Phase II">Phase II</SelectItem>
                  <SelectItem value="Phase III">Phase III</SelectItem>
                  <SelectItem value="Phase IV">Phase IV</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trial List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Trial Matches ({filteredMatches.length} found)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMatches.length > 0 ? (
                <ScrollArea className="h-[600px]">
                  {filteredMatches.map(match => renderMatchCard(match))}
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No trials found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPhase('all');
                      setSelectedStatus('recruiting');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Trial Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Trial Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMatch ? (
                <Tabs defaultValue="criteria">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="criteria">Criteria</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                  </TabsList>

                  <TabsContent value="criteria" className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Matched Criteria</h4>
                      <ul className="space-y-1">
                        {selectedMatch.matchedCriteria.map((criteria, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedMatch.unmatchedCriteria.length > 0 && (
                      <div>
                        <h4 className="font-medium text-amber-600 mb-2">Requires Assessment</h4>
                        <ul className="space-y-1">
                          {selectedMatch.unmatchedCriteria.map((criteria, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center">
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Required Assessments</h4>
                      <ul className="space-y-1">
                        {selectedMatch.requiredAssessments.map((assessment, idx) => (
                          <li key={idx} className="text-sm text-gray-600">• {assessment}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Study Contact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedMatch.trial.contactInfo.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`tel:${selectedMatch.trial.contactInfo.phone}`} className="text-sm text-blue-600 hover:underline">
                            {selectedMatch.trial.contactInfo.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`mailto:${selectedMatch.trial.contactInfo.email}`} className="text-sm text-blue-600 hover:underline">
                            {selectedMatch.trial.contactInfo.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Study Locations</h4>
                      <div className="space-y-2">
                        {selectedMatch.trial.locations.map((location, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium">{location.facility}</div>
                            <div className="text-gray-600">{location.city}, {location.state}</div>
                            <div className="text-blue-600">{location.distance} miles away</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a trial to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
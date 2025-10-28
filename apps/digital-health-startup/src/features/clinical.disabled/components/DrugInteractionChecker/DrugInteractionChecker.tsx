'use client';

import { Search, AlertTriangle, Plus, X, ExternalLink, Download, BookOpen, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';

import { DrugInteraction } from '../../types';

interface DrugInteractionCheckerProps {
  medications?: Array<{
    name: string;
    genericName: string;
    dosage: string;
    route: string;
    frequency: string;
  }>;
  onExport?: (format: 'pdf' | 'print' | 'email') => void;
  className?: string;
}

  major: 'bg-red-100 text-red-800 border-red-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  minor: 'bg-green-100 text-green-800 border-green-200'
};

  established: 'bg-red-100 text-red-800',
  probable: 'bg-yellow-100 text-yellow-800',
  theoretical: 'bg-gray-100 text-gray-800'
};

// Mock drug database for autocomplete

  { name: 'Warfarin', genericName: 'Warfarin', category: 'Anticoagulant' },
  { name: 'Aspirin', genericName: 'Acetylsalicylic acid', category: 'NSAID' },
  { name: 'Metformin', genericName: 'Metformin', category: 'Antidiabetic' },
  { name: 'Simvastatin', genericName: 'Simvastatin', category: 'Statin' },
  { name: 'Digoxin', genericName: 'Digoxin', category: 'Cardiac glycoside' },
  { name: 'Phenytoin', genericName: 'Phenytoin', category: 'Anticonvulsant' },
  { name: 'Carbamazepine', genericName: 'Carbamazepine', category: 'Anticonvulsant' },
  { name: 'Ketoconazole', genericName: 'Ketoconazole', category: 'Antifungal' },
  { name: 'Rifampin', genericName: 'Rifampin', category: 'Antibiotic' },
  { name: 'St. John\'s Wort', genericName: 'Hypericum perforatum', category: 'Herbal supplement' }
];

// Mock interaction data
const mockInteractions: DrugInteraction[] = [
  {
    drugA: { name: 'Warfarin', genericName: 'Warfarin', dosage: '5mg', route: 'Oral' },
    drugB: { name: 'Aspirin', genericName: 'Acetylsalicylic acid', dosage: '325mg', route: 'Oral' },
    interactionType: 'major',
    mechanism: 'Additive anticoagulant effects leading to increased bleeding risk',
    clinicalEffect: 'Significantly increased risk of bleeding, including gastrointestinal and intracranial hemorrhage',
    management: 'Avoid combination if possible. If must use together, reduce warfarin dose by 25-50% and monitor INR closely (every 3-5 days initially)',
    alternatives: [
      { drug: 'Acetaminophen', rationale: 'No anticoagulant effect, safer for pain relief' },
      { drug: 'Low-dose aspirin with PPI', rationale: 'If cardioprotection needed, use gastroprotection' }
    ],
    evidence: {
      level: 'established',
      references: ['PMID: 12345678', 'PMID: 87654321']
    },
    patientRiskFactors: ['Age >65', 'History of GI bleeding', 'Concurrent antiplatelet therapy']
  },
  {
    drugA: { name: 'Simvastatin', genericName: 'Simvastatin', dosage: '40mg', route: 'Oral' },
    drugB: { name: 'Ketoconazole', genericName: 'Ketoconazole', dosage: '200mg', route: 'Oral' },
    interactionType: 'major',
    mechanism: 'Ketoconazole inhibits CYP3A4, reducing simvastatin metabolism',
    clinicalEffect: 'Significantly increased simvastatin levels leading to increased risk of myopathy and rhabdomyolysis',
    management: 'Contraindicated. Discontinue simvastatin during ketoconazole therapy',
    alternatives: [
      { drug: 'Pravastatin', rationale: 'Not metabolized by CYP3A4, no interaction' },
      { drug: 'Rosuvastatin', rationale: 'Minimal interaction with CYP3A4 inhibitors' }
    ],
    evidence: {
      level: 'established',
      references: ['PMID: 11223344', 'PMID: 44332211']
    }
  },
  {
    drugA: { name: 'Digoxin', genericName: 'Digoxin', dosage: '0.25mg', route: 'Oral' },
    drugB: { name: 'Metformin', genericName: 'Metformin', dosage: '500mg', route: 'Oral' },
    interactionType: 'moderate',
    mechanism: 'Metformin may increase digoxin absorption and reduce renal clearance',
    clinicalEffect: 'Moderately increased digoxin levels, potential for toxicity',
    management: 'Monitor digoxin levels more frequently. Consider dose reduction if levels elevated',
    alternatives: [
      { drug: 'Insulin', rationale: 'No interaction with digoxin' }
    ],
    evidence: {
      level: 'probable',
      references: ['PMID: 55667788']
    },
    patientRiskFactors: ['Renal impairment', 'Age >70']
  }
];

export function DrugInteractionChecker({
  medications = [],
  onExport,
  className = ''
}: DrugInteractionCheckerProps) {
  const [selectedMedications, setSelectedMedications] = useState(medications);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDrug, setNewDrug] = useState({
    name: '',
    genericName: '',
    dosage: '',
    route: 'Oral',
    frequency: ''
  });
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<DrugInteraction | null>(null);

    if (!searchTerm) return drugDatabase;
    return drugDatabase.filter(drug =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

    setIsChecking(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Filter mock interactions based on selected medications

      return drugNames.includes(interaction.drugA.genericName.toLowerCase()) &&
             drugNames.includes(interaction.drugB.genericName.toLowerCase());
    });

    setInteractions(relevantInteractions);
    setIsChecking(false);
  };

      name: drug.name,
      genericName: drug.genericName,
      dosage: newDrug.dosage,
      route: newDrug.route,
      frequency: newDrug.frequency
    };

    setSelectedMedications(prev => [...prev, newMedication]);
    setNewDrug({
      name: '',
      genericName: '',
      dosage: '',
      route: 'Oral',
      frequency: ''
    });
    setSearchTerm('');
  };

    setSelectedMedications(prev => prev.filter((_, i) => i !== index));
  };

    return { major, moderate, minor };
  };

    return (
      <Card
        key={index}
        className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
          selectedInteraction === interaction ? 'ring-2 ring-blue-500' : ''
        } ${interaction.interactionType === 'major' ? 'border-red-200 bg-red-50' : ''}`}
        onClick={() => setSelectedInteraction(interaction)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-grow">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={interactionTypeColors[interaction.interactionType]}>
                  {interaction.interactionType.toUpperCase()}
                </Badge>
                <Badge className={evidenceLevelColors[interaction.evidence.level]}>
                  {interaction.evidence.level}
                </Badge>
                {interaction.interactionType === 'major' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>

              <h4 className="font-medium text-gray-900 mb-2">
                {interaction.drugA.name} + {interaction.drugB.name}
              </h4>

              <p className="text-sm text-gray-700 mb-3">{interaction.clinicalEffect}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-900 mb-1">Mechanism</div>
                  <p className="text-xs text-gray-600">{interaction.mechanism}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900 mb-1">Management</div>
                  <p className="text-xs text-gray-600">{interaction.management}</p>
                </div>
              </div>
            </div>
          </div>

          {interaction.alternatives.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-900 mb-1">Alternatives</div>
              <div className="space-y-1">
                {interaction.alternatives.slice(0, 2).map((alt, idx) => (
                  <div key={idx} className="text-xs text-blue-700">
                    <span className="font-medium">{alt.drug}:</span> {alt.rationale}
                  </div>
                ))}
              </div>
            </div>
          )}

          {interaction.patientRiskFactors && interaction.patientRiskFactors.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-900 mb-1">Risk Factors</div>
              <div className="flex flex-wrap gap-1">
                {interaction.patientRiskFactors.map((factor, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <BookOpen className="h-3 w-3" />
              <span>{interaction.evidence.references.length} reference{interaction.evidence.references.length > 1 ? 's' : ''}</span>
            </div>
            <Button variant="outline" size="sm">
              View Details
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
          <h2 className="text-2xl font-bold text-gray-900">Drug Interaction Checker</h2>
          <p className="text-gray-600">Identify and manage potential drug interactions</p>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={checkInteractions}
            disabled={selectedMedications.length < 2 || isChecking}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isChecking ? 'Checking...' : 'Check Interactions'}
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
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="print">Print Version</SelectItem>
                <SelectItem value="email">Email Report</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Add Medication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Search Drug</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchTerm && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredDrugs.map((drug) => (
                    <div
                      key={drug.name}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick=() => {
                        setNewDrug(prev => ({
                          ...prev,
                          name: drug.name,
                          genericName: drug.genericName
                         onKeyDown=() => {
                        setNewDrug(prev => ({
                          ...prev,
                          name: drug.name,
                          genericName: drug.genericName
                         role="button" tabIndex={0}));
                        setSearchTerm(drug.name);
                      }}
                    >
                      <div className="font-medium text-sm">{drug.name}</div>
                      <div className="text-xs text-gray-500">{drug.genericName} • {drug.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Dosage</label>
              <Input
                placeholder="e.g., 5mg"
                value={newDrug.dosage}
                onChange={(e) => setNewDrug(prev => ({ ...prev, dosage: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Route</label>
              <Select value={newDrug.route} onValueChange={(value) => setNewDrug(prev => ({ ...prev, route: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="IV">Intravenous</SelectItem>
                  <SelectItem value="IM">Intramuscular</SelectItem>
                  <SelectItem value="Topical">Topical</SelectItem>
                  <SelectItem value="Inhaled">Inhaled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Frequency</label>
              <Input
                placeholder="e.g., BID"
                value={newDrug.frequency}
                onChange={(e) => setNewDrug(prev => ({ ...prev, frequency: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {

                  if (drug && newDrug.dosage) {
                    addMedication(drug);
                  }
                }}
                disabled={!newDrug.name || !newDrug.dosage}
                className="w-full"
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Medications */}
      {selectedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Medications ({selectedMedications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedMedications.map((med, index) => (
                <div key={index} className="border rounded-lg p-3 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeMedication(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="pr-6">
                    <div className="font-medium text-sm">{med.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{med.genericName}</div>
                    <div className="text-xs text-gray-500">
                      {med.dosage} {med.route} {med.frequency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interaction Results */}
      {interactions.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{getInteractionSummary().major}</div>
                    <div className="text-sm text-red-700">Major Interactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{getInteractionSummary().moderate}</div>
                    <div className="text-sm text-yellow-700">Moderate Interactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{getInteractionSummary().minor}</div>
                    <div className="text-sm text-green-700">Minor Interactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {getInteractionSummary().major > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Critical Drug Interactions Detected:</strong> {getInteractionSummary().major} major interaction{getInteractionSummary().major > 1 ? 's' : ''} found.
                Immediate clinical review recommended.
              </AlertDescription>
            </Alert>
          )}

          {/* Interactions List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Drug Interactions ({interactions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {interactions.map((interaction, index) => renderInteractionCard(interaction, index))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Interaction Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Interaction Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedInteraction ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Drug Combination</h4>
                        <div className="text-sm text-gray-700">
                          <div>{selectedInteraction.drugA.name} ({selectedInteraction.drugA.dosage})</div>
                          <div>+ {selectedInteraction.drugB.name} ({selectedInteraction.drugB.dosage})</div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Clinical Management</h4>
                        <p className="text-sm text-gray-700">{selectedInteraction.management}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Alternative Options</h4>
                        <div className="space-y-2">
                          {selectedInteraction.alternatives.map((alt, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-blue-700">{alt.drug}</div>
                              <div className="text-gray-600 text-xs">{alt.rationale}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Evidence References</h4>
                        <div className="space-y-1">
                          {selectedInteraction.evidence.references.map((ref, idx) => (
                            <a
                              key={idx}
                              href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace('PMID: ', '')}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {ref}
                            </a>
                          ))}
                        </div>
                      </div>

                      {selectedInteraction.patientRiskFactors && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Patient Risk Factors</h4>
                          <div className="space-y-1">
                            {selectedInteraction.patientRiskFactors.map((factor, idx) => (
                              <div key={idx} className="text-sm text-gray-700 flex items-center">
                                <AlertTriangle className="h-3 w-3 text-yellow-500 mr-2" />
                                {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select an interaction to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* No Interactions State */}
      {selectedMedications.length >= 2 && interactions.length === 0 && !isChecking && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interactions Found</h3>
            <p className="text-gray-600">
              The selected medications appear to have no known significant drug interactions.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Always consult with a healthcare provider before making medication changes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isChecking && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Interactions</h3>
            <p className="text-gray-600">
              Analyzing {selectedMedications.length} medications for potential interactions...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {selectedMedications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600 mb-4">
              Add at least 2 medications to check for potential drug interactions.
            </p>
            <div className="text-sm text-gray-500">
              <p>• Search for medications by brand or generic name</p>
              <p>• Include dosage and route information</p>
              <p>• Click "Check Interactions" to analyze</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
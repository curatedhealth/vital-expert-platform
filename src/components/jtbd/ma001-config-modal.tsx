'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Search,
  Database,
  Bot,
  Brain,
  FileText,
  TrendingUp,
  X,
  Plus,
  Settings
} from 'lucide-react';

interface MA001Config {
  therapeuticAreas: string[];
  timeRange: {
    start: string;
    end: string;
  };
  keywords: string[];
  dataSources: string[];
  focusAreas: string[];
  outputFormat: string;
  confidenceThreshold: number;
  stepAgents: {
    step1: string;
    step2: string;
    step3: string;
  };
}

interface MA001ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (config: MA001Config) => void;
}

const AVAILABLE_AGENTS = [
  { id: 'literature-agent', name: 'Literature Research Agent', icon: FileText, description: 'Specialized in scientific literature analysis' },
  { id: 'trend-agent', name: 'Trend Analysis Agent', icon: TrendingUp, description: 'Expert in pattern recognition and forecasting' },
  { id: 'medical-agent', name: 'Medical Knowledge Agent', icon: Brain, description: 'Deep medical and pharmaceutical expertise' },
  { id: 'data-agent', name: 'Data Mining Agent', icon: Database, description: 'Advanced data extraction and processing' },
  { id: 'nlp-agent', name: 'NLP Analysis Agent', icon: Search, description: 'Natural language processing specialist' },
  { id: 'general-agent', name: 'General AI Agent', icon: Bot, description: 'Multi-purpose analysis and reasoning' }
];

const THERAPEUTIC_AREAS = [
  'Oncology', 'Neurology', 'Cardiology', 'Immunology', 'Infectious Diseases',
  'Diabetes & Metabolism', 'Respiratory', 'Rare Diseases', 'Mental Health',
  'Dermatology', 'Gastroenterology', 'Rheumatology'
];

const DATA_SOURCES = [
  'PubMed', 'ClinicalTrials.gov', 'FDA Orange Book', 'EMA Database',
  'Patent Databases', 'Conference Proceedings', 'Real-World Evidence',
  'Regulatory Filings', 'Company Reports', 'Medical News'
];

export const MA001ConfigModal: React.FC<MA001ConfigModalProps> = ({
  isOpen,
  onClose,
  onLaunch
}) => {
  const [config, setConfig] = useState<MA001Config>({
    therapeuticAreas: ['Oncology'],
    timeRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    },
    keywords: ['immunotherapy', 'biomarkers', 'precision medicine'],
    dataSources: ['PubMed', 'ClinicalTrials.gov'],
    focusAreas: ['Emerging therapies', 'Unmet medical needs'],
    outputFormat: 'detailed',
    confidenceThreshold: 0.7,
    stepAgents: {
      step1: 'data-agent',
      step2: 'literature-agent',
      step3: 'trend-agent'
    }
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newFocusArea, setNewFocusArea] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !config.keywords.includes(newKeyword.trim())) {
      setConfig(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setConfig(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addFocusArea = () => {
    if (newFocusArea.trim() && !config.focusAreas.includes(newFocusArea.trim())) {
      setConfig(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, newFocusArea.trim()]
      }));
      setNewFocusArea('');
    }
  };

  const removeFocusArea = (area: string) => {
    setConfig(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(a => a !== area)
    }));
  };

  const toggleTherapeuticArea = (area: string) => {
    setConfig(prev => ({
      ...prev,
      therapeuticAreas: prev.therapeuticAreas.includes(area)
        ? prev.therapeuticAreas.filter(a => a !== area)
        : [...prev.therapeuticAreas, area]
    }));
  };

  const toggleDataSource = (source: string) => {
    setConfig(prev => ({
      ...prev,
      dataSources: prev.dataSources.includes(source)
        ? prev.dataSources.filter(s => s !== source)
        : [...prev.dataSources, source]
    }));
  };

  const getAgentById = (id: string) => AVAILABLE_AGENTS.find(a => a.id === id);

  const handleLaunch = () => {
    onLaunch(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Configure MA001</h2>
              <p className="text-sm text-gray-600">Identify Emerging Scientific Trends</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Therapeutic Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Therapeutic Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {THERAPEUTIC_AREAS.map(area => (
                  <label key={area} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.therapeuticAreas.includes(area)}
                      onChange={() => toggleTherapeuticArea(area)}
                      className="rounded"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Analysis Time Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={config.timeRange.start}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, start: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={config.timeRange.end}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      timeRange: { ...prev.timeRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Research Keywords
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword (e.g., CAR-T therapy)"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="cursor-pointer">
                    {keyword}
                    <X className="h-3 w-3 ml-1" onClick={() => removeKeyword(keyword)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {DATA_SOURCES.map(source => (
                  <label key={source} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dataSources.includes(source)}
                      onChange={() => toggleDataSource(source)}
                      className="rounded"
                    />
                    <span className="text-sm">{source}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add focus area (e.g., Combination therapies)"
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                />
                <Button onClick={addFocusArea} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.focusAreas.map(area => (
                  <Badge key={area} variant="outline" className="cursor-pointer">
                    {area}
                    <X className="h-3 w-3 ml-1" onClick={() => removeFocusArea(area)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agent Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Step 1: Initialize Trend Analysis</Label>
                  <Select
                    value={config.stepAgents.step1}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      stepAgents: { ...prev.stepAgents, step1: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_AGENTS.map(agent => {
                        const Icon = agent.icon;
                        return (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{agent.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {getAgentById(config.stepAgents.step1) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getAgentById(config.stepAgents.step1)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Step 2: Conduct Literature Analysis</Label>
                  <Select
                    value={config.stepAgents.step2}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      stepAgents: { ...prev.stepAgents, step2: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_AGENTS.map(agent => {
                        const Icon = agent.icon;
                        return (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{agent.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {getAgentById(config.stepAgents.step2) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getAgentById(config.stepAgents.step2)?.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Step 3: Generate Trend Report</Label>
                  <Select
                    value={config.stepAgents.step3}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      stepAgents: { ...prev.stepAgents, step3: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_AGENTS.map(agent => {
                        const Icon = agent.icon;
                        return (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{agent.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {getAgentById(config.stepAgents.step3) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getAgentById(config.stepAgents.step3)?.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Output Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Output Format</Label>
                <Select
                  value={config.outputFormat}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, outputFormat: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Executive Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="insights">Key Insights Only</SelectItem>
                    <SelectItem value="data">Raw Data + Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Confidence Threshold: {Math.round(config.confidenceThreshold * 100)}%</Label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={config.confidenceThreshold}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    confidenceThreshold: parseFloat(e.target.value)
                  }))}
                  className="w-full mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex-shrink-0 flex items-center justify-between p-6">
          <div className="text-sm text-gray-600">
            Configuration will be applied to all 3 steps of the trend analysis workflow
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleLaunch} className="bg-blue-600 hover:bg-blue-700">
              Launch MA001 Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  FileText,
  BarChart3,
  Users,
  Database,
  ClipboardCheck,
  Microscope,
  Search as SearchIcon
} from 'lucide-react';
import { StepLibraryPanelProps } from '@/types/workflow-enhanced';

interface StepTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  capabilities: string[];
  estimatedDuration: number;
  complexity: 'Low' | 'Medium' | 'High';
}

const stepTemplates: StepTemplate[] = [
  // Regulatory Analysis Steps
  {
    id: 'regulatory-gap-analysis',
    name: 'Regulatory Gap Analysis',
    description: 'Analyze regulatory requirements and identify documentation gaps',
    icon: <SearchIcon className="w-4 h-4" />,
    category: 'Regulatory Analysis',
    capabilities: ['regulatory_analysis', 'gap_analysis', 'fda_expertise'],
    estimatedDuration: 45,
    complexity: 'Medium'
  },
  {
    id: 'predicate-device-analysis',
    name: 'Predicate Device Analysis',
    description: 'Research and analyze predicate devices for 510(k) submissions',
    icon: <Database className="w-4 h-4" />,
    category: 'Regulatory Analysis',
    capabilities: ['predicate_analysis', 'fda_database_search', 'device_comparison'],
    estimatedDuration: 60,
    complexity: 'High'
  },
  {
    id: 'compliance-check',
    name: 'Compliance Verification',
    description: 'Verify compliance with current regulatory standards',
    icon: <ClipboardCheck className="w-4 h-4" />,
    category: 'Regulatory Analysis',
    capabilities: ['compliance_analysis', 'regulatory_guidance'],
    estimatedDuration: 30,
    complexity: 'Low'
  },

  // Clinical Design Steps
  {
    id: 'literature-review',
    name: 'Literature Review',
    description: 'Comprehensive review of relevant scientific literature',
    icon: <FileText className="w-4 h-4" />,
    category: 'Clinical Design',
    capabilities: ['literature_search', 'evidence_review', 'medical_writing'],
    estimatedDuration: 90,
    complexity: 'Medium'
  },
  {
    id: 'study-design',
    name: 'Study Design',
    description: 'Design clinical study protocols and methodology',
    icon: <Microscope className="w-4 h-4" />,
    category: 'Clinical Design',
    capabilities: ['clinical_design', 'protocol_development', 'study_planning'],
    estimatedDuration: 120,
    complexity: 'High'
  },
  {
    id: 'statistical-planning',
    name: 'Statistical Analysis Plan',
    description: 'Develop statistical analysis plan and sample size calculations',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Clinical Design',
    capabilities: ['biostatistics', 'sample_size_calculation', 'statistical_planning'],
    estimatedDuration: 75,
    complexity: 'High'
  },

  // Market Access Steps
  {
    id: 'market-landscape',
    name: 'Market Landscape Analysis',
    description: 'Analyze competitive landscape and market positioning',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Market Access',
    capabilities: ['market_research', 'competitive_analysis'],
    estimatedDuration: 60,
    complexity: 'Medium'
  },
  {
    id: 'hta-assessment',
    name: 'HTA Requirements Assessment',
    description: 'Evaluate Health Technology Assessment requirements',
    icon: <ClipboardCheck className="w-4 h-4" />,
    category: 'Market Access',
    capabilities: ['hta_analysis', 'evidence_requirements'],
    estimatedDuration: 45,
    complexity: 'Medium'
  },
  {
    id: 'economic-modeling',
    name: 'Health Economic Modeling',
    description: 'Build cost-effectiveness and budget impact models',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Market Access',
    capabilities: ['economic_modeling', 'cost_effectiveness'],
    estimatedDuration: 90,
    complexity: 'High'
  },

  // Data Analysis Steps
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Clean, process, and prepare data for analysis',
    icon: <Database className="w-4 h-4" />,
    category: 'Data Analysis',
    capabilities: ['data_processing', 'data_cleaning'],
    estimatedDuration: 45,
    complexity: 'Medium'
  },
  {
    id: 'statistical-analysis',
    name: 'Statistical Analysis',
    description: 'Perform statistical analysis on clinical or research data',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Data Analysis',
    capabilities: ['statistical_analysis', 'data_interpretation'],
    estimatedDuration: 60,
    complexity: 'High'
  },

  // Report Generation Steps
  {
    id: 'regulatory-report',
    name: 'Regulatory Report Generation',
    description: 'Generate comprehensive regulatory submission documents',
    icon: <FileText className="w-4 h-4" />,
    category: 'Report Generation',
    capabilities: ['report_generation', 'regulatory_writing'],
    estimatedDuration: 90,
    complexity: 'Medium'
  },
  {
    id: 'clinical-report',
    name: 'Clinical Study Report',
    description: 'Generate clinical study reports and summaries',
    icon: <FileText className="w-4 h-4" />,
    category: 'Report Generation',
    capabilities: ['clinical_reporting', 'medical_writing'],
    estimatedDuration: 120,
    complexity: 'High'
  },

  // Quality Review Steps
  {
    id: 'quality-review',
    name: 'Quality Review',
    description: 'Comprehensive quality review of documents and processes',
    icon: <ClipboardCheck className="w-4 h-4" />,
    category: 'Quality Review',
    capabilities: ['quality_assessment', 'document_review'],
    estimatedDuration: 30,
    complexity: 'Low'
  },
  {
    id: 'expert-review',
    name: 'Expert Review',
    description: 'Subject matter expert review and validation',
    icon: <Users className="w-4 h-4" />,
    category: 'Quality Review',
    capabilities: ['expert_review', 'validation'],
    estimatedDuration: 45,
    complexity: 'Medium'
  }
];

export const StepLibraryPanel: React.FC<StepLibraryPanelProps> = ({
  onAddStep,
  categories
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSteps = stepTemplates.filter(step => {
    const matchesCategory = selectedCategory === 'All' || step.category === selectedCategory;
    const matchesSearch = step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         step.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         step.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddStep = (template: StepTemplate) => {
    // Calculate position based on existing steps
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100
    };
    onAddStep(template.category, position);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Step Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('All')}
            className="text-xs"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category.split(' ')[0]}
            </Button>
          ))}
        </div>
      </div>

      {/* Step Templates */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSteps.map(template => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-indigo-500"
            onClick={() => handleAddStep(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {template.icon}
                  <div>
                    <CardTitle className="text-sm leading-tight">
                      {template.name}
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="h-6 w-6 p-0">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Duration and Complexity */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {template.estimatedDuration} min
                </span>
                <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                  {template.complexity}
                </Badge>
              </div>

              {/* Capabilities */}
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Capabilities:</span>
                <div className="flex flex-wrap gap-1">
                  {template.capabilities.slice(0, 2).map((capability, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-1 py-0"
                    >
                      {capability.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {template.capabilities.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{template.capabilities.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSteps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No steps found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
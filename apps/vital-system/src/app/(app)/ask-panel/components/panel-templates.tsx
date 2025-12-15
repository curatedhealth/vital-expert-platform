'use client';

import {
  Search,
  Users,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
  Target
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
import { Input } from '@/lib/shared/components/ui/input';
import { cn } from '@/lib/shared/utils';

import { __usePanelStore as usePanelStore } from '../services/panel-store';

interface PanelTemplatesProps {
  onTemplateSelect: (template: unknown) => void;
  onCreateExpertPanel?: () => void;
}

export function PanelTemplates({ onTemplateSelect, onCreateExpertPanel }: PanelTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const { templates } = usePanelStore();

  // Get unique domains
  const domains = ['all', ...Array.from(new Set(templates.map((t: any) => t.domain)))];

  // Filter templates
  const filteredTemplates = templates.filter((template: any) => {
    const matchesDomain = selectedDomain === 'all' || template.domain === selectedDomain;
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && matchesDomain;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'regulatory': return '⚖️';
      case 'clinical': return '🔬';
      case 'commercial': return '💼';
      case 'digital_health': return '📱';
      default: return '🎯';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Ask Panel</h1>
                <p className="text-muted-foreground">Create virtual advisory boards with expert panels</p>
              </div>
            </div>
            {onCreateExpertPanel && (
              <Button
                onClick={onCreateExpertPanel}
                variant="default"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Create Expert Panel
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search panel templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {domains.map((domain) => (
                <Button
                  key={domain}
                  variant={selectedDomain === domain ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDomain(domain)}
                  className="capitalize"
                >
                  {domain === 'all' ? 'All Domains' : domain.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Featured Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Templates</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Popular advisory panel configurations for common pharmaceutical challenges
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTemplates.filter((t: any) => ['regulatory-advisory', 'clinical-design'].includes(t.id)).map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getDomainIcon(template.domain)}</div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {template.domain.replace(/_/g, ' ')}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs border",
                                getComplexityColor(template.complexity)
                              )}
                            >
                              {template.complexity} complexity
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>

                    {/* Recommended Members */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Panel Composition
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          <strong>{template.recommendedMembers.minMembers}-{template.recommendedMembers.maxMembers} experts</strong>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.recommendedMembers.businessFunctions.slice(0, 3).map((func, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {func.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {template.recommendedMembers.businessFunctions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.recommendedMembers.businessFunctions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Use Cases
                      </h4>
                      <div className="space-y-1">
                        {template.useCases.slice(0, 3).map((useCase, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {useCase}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Templates */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">All Templates</h2>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or domain filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
                    onClick={() => onTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-xl">{getDomainIcon(template.domain)}</div>
                          <div>
                            <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.domain.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm line-clamp-2 mb-3">
                        {template.description}
                      </CardDescription>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{template.recommendedMembers.minMembers}-{template.recommendedMembers.maxMembers} experts</span>
                          <Badge
                            className={cn(
                              "text-xs border",
                              getComplexityColor(template.complexity)
                            )}
                          >
                            {template.complexity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {template.useCases.length} use cases
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
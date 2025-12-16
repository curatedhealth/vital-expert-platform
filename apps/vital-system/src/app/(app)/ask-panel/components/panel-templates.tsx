'use client';

import {
  Search,
  Users,
  ArrowRight,
  CheckCircle
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

  const { templates } = usePanelStore();

  // Filter templates by search only (all 6 are panel workflows)
  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search panel workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Panel Workflows */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Panel Workflows</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Choose a panel workflow type to structure your expert consultation
            </p>

            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search
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
                        <div>
                          <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
                          <Badge
                            className={cn(
                              "text-xs border mt-2",
                              getComplexityColor(template.complexity)
                            )}
                          >
                            {template.complexity} complexity
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm line-clamp-2 mb-4">
                        {template.description}
                      </CardDescription>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{template.recommendedMembers.minMembers}-{template.recommendedMembers.maxMembers} experts</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.useCases.slice(0, 2).map((useCase, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
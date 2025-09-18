'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Star,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Beaker,
  Stethoscope,
  DollarSign,
  Shield,
  Download,
  Eye
} from 'lucide-react';
import {
  TemplateLibraryModalProps,
  WorkflowTemplate
} from '@/types/workflow-enhanced';

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  templates,
  onSelectTemplate,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);

  const categories = ['All', 'Regulatory', 'Clinical', 'Market Access', 'Medical Affairs', 'Custom'];
  const complexities = ['All', 'Low', 'Medium', 'High'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.industry_tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'All' || template.complexity_level === selectedComplexity;

    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const popularTemplates = templates
    .filter(t => t.is_public)
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 6);

  const recentTemplates = templates
    .filter(t => t.is_public)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Regulatory':
        return <Shield className="w-4 h-4" />;
      case 'Clinical':
        return <Stethoscope className="w-4 h-4" />;
      case 'Market Access':
        return <DollarSign className="w-4 h-4" />;
      case 'Medical Affairs':
        return <FileText className="w-4 h-4" />;
      default:
        return <Beaker className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Regulatory':
        return 'bg-red-100 text-red-800';
      case 'Clinical':
        return 'bg-blue-100 text-blue-800';
      case 'Market Access':
        return 'bg-green-100 text-green-800';
      case 'Medical Affairs':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const handleUseTemplate = (template: WorkflowTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const TemplateCard: React.FC<{ template: WorkflowTemplate; variant?: 'default' | 'compact' }> = ({
    template,
    variant = 'default'
  }) => (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(template.category)}
            <div className="flex-1">
              <CardTitle className={`leading-tight ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {template.name}
              </CardTitle>
              {variant !== 'compact' && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {renderStarRating(template.rating)}
            <Badge className={getCategoryColor(template.category)}>
              {template.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
        {variant === 'compact' && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Template Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {template.template_data.steps.length}
            </div>
            <div className="text-xs text-gray-500">Steps</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 flex items-center justify-center">
              <Clock className="w-3 h-3 mr-1" />
              {Math.round(template.estimated_duration / 60)}h
            </div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {template.usage_count}
            </div>
            <div className="text-xs text-gray-500">Uses</div>
          </div>
        </div>

        {/* Complexity and Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getComplexityColor(template.complexity_level)}>
              {template.complexity_level} Complexity
            </Badge>
            <span className="text-xs text-gray-500">
              v{template.version}
            </span>
          </div>

          {/* Industry Tags */}
          <div className="flex flex-wrap gap-1">
            {template.industry_tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.industry_tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.industry_tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewTemplate(template);
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleUseTemplate(template);
            }}
          >
            <Download className="w-3 h-3 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Workflow Template Library</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Search and Filters */}
            <div className="space-y-4 pb-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex space-x-1">
                  <span className="text-sm text-gray-600 px-2 py-1">Category:</span>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                <Separator orientation="vertical" className="h-8" />

                <div className="flex space-x-1">
                  <span className="text-sm text-gray-600 px-2 py-1">Complexity:</span>
                  {complexities.map(complexity => (
                    <Button
                      key={complexity}
                      variant={selectedComplexity === complexity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedComplexity(complexity)}
                      className="text-xs"
                    >
                      {complexity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="all" className="h-full flex flex-col">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    All Templates ({filteredTemplates.length})
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="flex-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Recent
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {filteredTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No templates found</h3>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="popular" className="flex-1 overflow-y-auto mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {popularTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="flex-1 overflow-y-auto mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {recentTemplates.map(template => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={true} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getCategoryIcon(previewTemplate.category)}
                <span>{previewTemplate.name}</span>
                <Badge className={getCategoryColor(previewTemplate.category)}>
                  {previewTemplate.category}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto">
              {/* Template Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-900">
                    {previewTemplate.template_data.steps.length}
                  </div>
                  <div className="text-sm text-gray-600">Steps</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(previewTemplate.estimated_duration / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Est. Duration</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-900">
                    {previewTemplate.usage_count}
                  </div>
                  <div className="text-sm text-gray-600">Times Used</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{previewTemplate.description}</p>
              </div>

              {/* Steps Preview */}
              <div>
                <h3 className="font-semibold mb-3">Workflow Steps</h3>
                <div className="space-y-2">
                  {previewTemplate.template_data.steps
                    .sort((a, b) => a.step_number - b.step_number)
                    .map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {step.step_number}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.step_name}</div>
                          <div className="text-xs text-gray-600">{step.step_description}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.estimated_duration || 30}min
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Industry Tags */}
              <div>
                <h3 className="font-semibold mb-2">Industry Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.industry_tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
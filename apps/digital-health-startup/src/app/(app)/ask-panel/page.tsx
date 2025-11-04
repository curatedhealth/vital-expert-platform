/**
 * Ask Panel Page
 * 
 * User-friendly journey for consulting with expert panels:
 * - Browse panel templates
 * - View panel details
 * - Add panels to sidebar
 * 
 * Aligned with Tools view design pattern
 */

'use client';

import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  LayoutGrid,
  Plus,
  Bot,
  Zap,
  Search,
  Filter,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  UserCog,
  HeartPulse,
  Shield,
  FileText,
  ChevronRight,
  X,
  Target,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PanelCreationWizard } from '@/features/ask-panel/components/PanelCreationWizard';
import { PanelConsultationView } from '@/features/ask-panel/components/PanelConsultationView';
import { PanelExecutionView } from '@/features/ask-panel/components/PanelExecutionView';
import { PANEL_TEMPLATES } from '@/features/ask-panel/constants/panel-templates';
import type { PanelConfiguration } from '@/features/ask-panel/types/agent';
import { useSavedPanels, type SavedPanel } from '@/contexts/ask-panel-context';

// Map emoji categories to lucide-react icons
const CATEGORY_ICONS: Record<string, any> = {
  'clinical-trials': Stethoscope,
  'research': FlaskConical,
  'regulatory': Shield,
  'patient-care': HeartPulse,
  'operations': UserCog,
  'default': Users,
};

// Get icon component for category
function getCategoryIcon(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
}

// Panel Details Dialog Component
interface PanelDetailsDialogProps {
  panel: SavedPanel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomize: (panel: SavedPanel) => void;
  onRun: (panel: SavedPanel) => void;
}

function PanelDetailsDialog({
  panel,
  open,
  onOpenChange,
  onCustomize,
  onRun,
}: PanelDetailsDialogProps) {
  if (!panel) return null;

  const IconComponent = getCategoryIcon(panel.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{panel.name}</DialogTitle>
              <DialogDescription className="text-base">
                {panel.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {panel.category}
            </Badge>
            <Badge variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              {panel.mode}
            </Badge>
            <Badge variant="outline">
              <Bot className="w-3 h-3 mr-1" />
              {panel.suggestedAgents.length} experts
            </Badge>
          </div>

          {/* Purpose */}
          {panel.purpose && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Purpose
              </h3>
              <p className="text-sm text-muted-foreground">{panel.purpose}</p>
            </div>
          )}

          {/* Selected Agents */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Selected Agents ({panel.suggestedAgents.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {panel.suggestedAgents.map((agent, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{agent}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Panel Configuration */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Configuration
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{panel.mode}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{panel.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Experts:</span>
                <span className="font-medium">{panel.suggestedAgents.length}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                onCustomize(panel);
                onOpenChange(false);
              }}
              className="flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Customize
            </Button>
            <Button
              onClick={() => {
                onRun(panel);
                onOpenChange(false);
              }}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <ChevronRight className="w-4 h-4 mr-2" />
              Run Panel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AskPanelPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPanel, setSelectedPanel] = useState<SavedPanel | null>(null);
  const [showPanelDetails, setShowPanelDetails] = useState(false);
  const [executingPanel, setExecutingPanel] = useState<SavedPanel | null>(null);

  const { addPanel } = useSavedPanels();

  // State for consultation view
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultationConfig, setConsultationConfig] = useState<PanelConfiguration | null>(null);
  const [consultationQuestion, setConsultationQuestion] = useState('');

  // Handle panel creation
  function handlePanelCreated(config: PanelConfiguration) {
    console.log('Panel created:', config);
    setShowWizard(false);
    
    // Navigate to consultation view
    setConsultationConfig(config);
    setConsultationQuestion(initialQuery);
    setShowConsultation(true);
  }

  // Handle back from consultation
  function handleBackFromConsultation() {
    setShowConsultation(false);
    setConsultationConfig(null);
    setConsultationQuestion('');
  }

  // Handle back from execution
  function handleBackFromExecution() {
    setExecutingPanel(null);
  }

  // Handle panel card click - show details
  const handleViewPanel = (template: typeof PANEL_TEMPLATES[0]) => {
    const IconComponent = getCategoryIcon(template.category);
    const panel: SavedPanel = {
      ...template,
      purpose: template.description,
      IconComponent,
    };
    setSelectedPanel(panel);
    setShowPanelDetails(true);
  };

  // Handle customize panel - add to sidebar and start wizard
  const handleCustomizePanel = (panel: SavedPanel) => {
    // Add panel to sidebar
    addPanel(panel);
    
    // Start wizard with panel's description
    setInitialQuery(panel.description);
    setShowWizard(true);
  };

  // Handle run panel - add to sidebar and open execution view
  const handleRunPanel = (panel: SavedPanel) => {
    // Add panel to sidebar
    addPanel(panel);
    
    // Open execution view
    setExecutingPanel(panel);
  };

  // Filter templates
  const filteredTemplates = PANEL_TEMPLATES.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(PANEL_TEMPLATES.map((t) => t.category)))];

  // Show execution view if active
  if (executingPanel) {
    return (
      <PanelExecutionView
        panel={executingPanel}
        onBack={handleBackFromExecution}
      />
    );
  }

  // Show consultation view if active
  if (showConsultation && consultationConfig && consultationQuestion) {
    return (
      <PanelConsultationView
        configuration={consultationConfig}
        initialQuestion={consultationQuestion}
        onBack={handleBackFromConsultation}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header */}
      <div className="border-b bg-background px-6 py-4 -mx-6 -mt-8 mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">Ask Panel</h1>
            <p className="text-sm text-muted-foreground">
              Multi-expert advisory board consultations
            </p>
          </div>
        </div>
      </div>

      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredTemplates.length} of {PANEL_TEMPLATES.length} panels
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-6 mt-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search panels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => setShowWizard(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Panel
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredTemplates.length} of {PANEL_TEMPLATES.length} panels
              </div>
            </CardContent>
          </Card>

          {/* Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const IconComponent = getCategoryIcon(template.category);
              
              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewPanel(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm mb-4">
                      {template.description}
                    </CardDescription>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.mode}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Bot className="w-3 h-3 mr-1" />
                        {template.suggestedAgents.length} experts
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-xs">
                        Click to view details
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          const IconComponent = getCategoryIcon(template.category);
                          handleRunPanel({
                            ...template,
                            purpose: template.description,
                            IconComponent,
                          });
                        }}
                      >
                        Run Panel
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No panels found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4 mt-6">
          {filteredTemplates.map((template) => {
            const IconComponent = getCategoryIcon(template.category);
            
            return (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewPanel(template)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="secondary" className="capitalize text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {template.mode}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Bot className="w-3 h-3 mr-1" />
                            {template.suggestedAgents.length} experts
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunPanel({
                          ...template,
                          purpose: template.description,
                          IconComponent,
                        });
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Panel
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>

        {/* By Category View */}
        <TabsContent value="category" className="space-y-8 mt-6">
          {categories.filter(cat => cat !== 'all').map(category => {
            const categoryTemplates = filteredTemplates.filter(t => t.category === category);
            if (categoryTemplates.length === 0) return null;

            const CategoryIcon = getCategoryIcon(category);

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <CategoryIcon className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <Badge variant="secondary">{categoryTemplates.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map((template) => {
                    const IconComponent = getCategoryIcon(template.category);
                    
                    return (
                      <Card
                        key={template.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleViewPanel(template)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <CardTitle className="text-base line-clamp-1">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-xs">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                <Bot className="w-3 h-3 mr-1" />
                                {template.suggestedAgents.length}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {template.mode}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunPanel({
                                  ...template,
                                  purpose: template.description,
                                  IconComponent,
                                });
                              }}
                            >
                              Run
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Panel Details Dialog */}
      <PanelDetailsDialog
        panel={selectedPanel}
        open={showPanelDetails}
        onOpenChange={setShowPanelDetails}
        onCustomize={handleCustomizePanel}
        onRun={handleRunPanel}
      />

      {/* Panel Creation Wizard */}
      {showWizard && (
        <PanelCreationWizard
          initialQuery={initialQuery}
          onComplete={handlePanelCreated}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

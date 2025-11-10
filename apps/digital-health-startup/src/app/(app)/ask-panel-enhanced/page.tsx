/**
 * Enhanced Ask Panel Page
 *
 * Complete panel creation workflow with:
 * 1. Panel Types Showcase (6 types)
 * 2. Management Pattern Selection
 * 3. Template Library with presets
 * 4. Customization & AI enhancement
 * 5. Panel execution
 */

'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Rocket,
  LayoutGrid,
  Settings,
  Play,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { PanelTypesShowcase, type PanelType } from '@/features/ask-panel/components/PanelTypesShowcase';
import { PanelManagementTypes, type ManagementType } from '@/features/ask-panel/components/PanelManagementTypes';
import { PanelTemplatesLibrary, type PanelTemplate } from '@/features/ask-panel/components/PanelTemplatesLibrary';
import { PanelExecutionView } from '@/features/ask-panel/components/PanelExecutionView';

// ============================================================================
// TYPES
// ============================================================================

type WorkflowStep = 'panel-types' | 'management' | 'templates' | 'customize' | 'execute';

interface PanelConfiguration {
  panelType?: PanelType;
  managementType?: ManagementType;
  template?: PanelTemplate;
  customizations?: Record<string, any>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EnhancedAskPanelPage() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('panel-types');
  const [configuration, setConfiguration] = useState<PanelConfiguration>({});
  const [showQuickStart, setShowQuickStart] = useState(true);

  // Workflow steps definition
  const steps = [
    { id: 'panel-types', label: 'Panel Type', completed: !!configuration.panelType },
    { id: 'management', label: 'Management', completed: !!configuration.managementType },
    { id: 'templates', label: 'Template', completed: !!configuration.template },
    { id: 'customize', label: 'Customize', completed: false },
    { id: 'execute', label: 'Execute', completed: false },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectPanelType = (type: PanelType) => {
    setConfiguration((prev) => ({ ...prev, panelType: type }));
    setCurrentStep('management');
  };

  const handleSelectManagementType = (type: ManagementType) => {
    setConfiguration((prev) => ({ ...prev, managementType: type }));
    setCurrentStep('templates');
  };

  const handleRunTemplate = (template: PanelTemplate) => {
    setConfiguration((prev) => ({ ...prev, template }));
    setCurrentStep('execute');
  };

  const handleCustomizeTemplate = (template: PanelTemplate) => {
    setConfiguration((prev) => ({ ...prev, template }));
    setCurrentStep('customize');
  };

  const handleDuplicateTemplate = (template: PanelTemplate) => {
    // Create a copy with modified name
    const duplicated = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isPreset: false,
    };
    setConfiguration((prev) => ({ ...prev, template: duplicated }));
    setCurrentStep('customize');
  };

  const handleBack = () => {
    const stepOrder: WorkflowStep[] = ['panel-types', 'management', 'templates', 'customize', 'execute'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setConfiguration({});
    setCurrentStep('panel-types');
  };

  // ============================================================================
  // QUICK START GUIDE
  // ============================================================================

  if (showQuickStart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 pt-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">VITAL Ask Panel</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Consult with expert AI panels for strategic decisions, regulatory guidance,
              and complex problem-solving in life sciences and healthcare.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => setShowQuickStart(false)}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Browse Panel Types</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore 6 orchestration patterns from structured debates to Delphi consensus
                </p>
                <Badge variant="secondary" className="text-xs">6 Panel Types</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => setShowQuickStart(false)}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Choose Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select from AI-only to human expert panels with AI support
                </p>
                <Badge variant="secondary" className="text-xs">4 Patterns</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => setShowQuickStart(false)}>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Use Templates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start with proven templates for FDA, clinical trials, and more
                </p>
                <Badge variant="secondary" className="text-xs">50+ Templates</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8"
              onClick={() => setShowQuickStart(false)}
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              Watch Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">6</div>
              <div className="text-sm text-muted-foreground">Panel Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4</div>
              <div className="text-sm text-muted-foreground">Management Patterns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">136</div>
              <div className="text-sm text-muted-foreground">AI Experts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">50+</div>
              <div className="text-sm text-muted-foreground">Templates</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN WORKFLOW UI
  // ============================================================================

  // Show execution view if in execute step
  if (currentStep === 'execute' && configuration.template) {
    return (
      <div className="h-screen flex flex-col">
        <PanelExecutionView
          panel={{
            ...configuration.template,
            purpose: configuration.template.description,
            IconComponent: Rocket,
          }}
          onBack={() => setCurrentStep('templates')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Progress */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack} disabled={currentStep === 'panel-types'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Expert Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}:{' '}
                  <span className="font-medium">{steps[currentStepIndex].label}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {configuration.panelType && (
                <Badge variant="outline" className="capitalize">
                  {configuration.panelType}
                </Badge>
              )}
              {configuration.managementType && (
                <Badge variant="outline" className="capitalize">
                  {configuration.managementType.replace(/_/g, ' ')}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 ${idx === currentStepIndex ? 'text-purple-600 font-medium' : ''}`}
                >
                  {step.completed && <span className="text-green-500">✓</span>}
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={currentStep} className="space-y-6">
          {/* Panel Types */}
          <TabsContent value="panel-types" className="mt-6">
            <PanelTypesShowcase onSelectType={handleSelectPanelType} />
          </TabsContent>

          {/* Management Types */}
          <TabsContent value="management" className="mt-6">
            <PanelManagementTypes
              onSelectType={handleSelectManagementType}
              selectedType={configuration.managementType}
            />
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="mt-6">
            <PanelTemplatesLibrary
              onRunTemplate={handleRunTemplate}
              onCustomizeTemplate={handleCustomizeTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
            />
          </TabsContent>

          {/* Customize */}
          <TabsContent value="customize" className="mt-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Customize Your Panel</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                AI-powered customization coming soon! For now, you can run the template as-is
                or go back to select a different template.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setCurrentStep('templates')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Choose Different Template
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => setCurrentStep('execute')}
                >
                  Run Panel
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

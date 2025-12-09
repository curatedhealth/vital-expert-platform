'use client';

/**
 * v0 AI Demo Page - KOL Engagement Workflow POC
 * 
 * Demonstrates v0 AI-powered UI generation for:
 * - Custom workflow nodes
 * - Agent cards
 * - Panel UIs
 * - Visualizations
 * - Dashboards
 * 
 * Use case: Medical Affairs KOL (Key Opinion Leader) Engagement
 */

import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  Users,
  Network,
  FileText,
  BarChart3,
  Layout,
  Box,
  Layers,
  ChevronRight,
  ExternalLink,
  Check,
  Copy,
  History,
  Lightbulb,
  Target,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';

// Import v0 components from shared package
// Using relative import for now - in production would be from '@vital/ai-ui/v0'
import {
  VitalV0GeneratorPanel,
  VitalV0PreviewFrame,
  type V0GenerationResponse,
  type V0GenerationType,
} from '@/../../packages/vital-ai-ui/src/v0';

/**
 * KOL Engagement Workflow - Pre-defined prompts for POC demonstration
 */
const KOL_WORKFLOW_SCENARIOS = {
  title: 'KOL Engagement Workflow',
  description: 'End-to-end workflow for identifying, engaging, and tracking Key Opinion Leaders in Medical Affairs',
  domain: 'Medical Affairs',
  stages: [
    {
      name: 'KOL Identification',
      tasks: ['Scientific Publication Analysis', 'Conference Presence Mapping', 'Influence Network Analysis'],
    },
    {
      name: 'Engagement Planning',
      tasks: ['Compliance Pre-Review', 'Engagement Strategy Development', 'Material Preparation'],
    },
    {
      name: 'Execution & Tracking',
      tasks: ['Meeting Documentation', 'Follow-up Action Items', 'Relationship Scoring Update'],
    },
  ],
};

/**
 * Pre-configured generation prompts organized by type
 */
const DEMO_PROMPTS: Record<V0GenerationType, Array<{
  id: string;
  title: string;
  description: string;
  prompt: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}>> = {
  'workflow-node': [
    {
      id: 'kol-scorer',
      title: 'KOL Influence Scorer',
      description: 'Calculate and display KOL influence metrics',
      prompt: `Create a KOL Influence Scorer workflow node component that displays:
- H-index with trend indicator (up/down arrow showing change)
- Publication count with recent activity badge (last 12 months)
- Citation impact score as a circular progress (0-100)
- Conference presentations count with venue icons
- Editorial board memberships as badges
- Overall influence percentile as a gradient progress bar
- Therapeutic area specialization tags

Design requirements:
- Card-based layout with collapsible detail sections
- Purple/blue healthcare color scheme
- Compact view by default, expandable for details
- React Flow compatible with Handle components for inputs/outputs
- Show loading skeleton state
- Support dark mode`,
      difficulty: 'advanced',
    },
    {
      id: 'compliance-gate',
      title: 'Compliance Gateway',
      description: 'Pre-engagement compliance verification checkpoint',
      prompt: `Create a Compliance Gateway workflow node that shows:
- Pre-engagement checklist (4-6 items: SOPs followed, approvals obtained, budget verified, conflict check, training current)
- Each checklist item with pass/fail/pending status icons
- Overall compliance score as percentage with color coding
- Required approvals section showing approver name, status, date
- Proceed/Hold decision buttons with confirmation modal
- Compliance history log (collapsible accordion)
- Warning banner when items are pending

Design:
- Traffic light colors (green=pass, yellow=pending, red=fail)
- Clean healthcare UI with shadcn/ui components
- Button states: disabled until all checks pass
- React Flow node with input/output handles`,
      difficulty: 'intermediate',
    },
    {
      id: 'engagement-tracker',
      title: 'Engagement Tracker',
      description: 'Track and analyze KOL interactions',
      prompt: `Create an Engagement Tracker workflow node displaying:
- Vertical timeline of past meetings (5 most recent)
- Each meeting shows: date, type icon, brief summary, outcome badge
- Sentiment trend indicator (positive/neutral/negative with sparkline)
- Follow-up tasks section with due dates, owners, priority badges
- Relationship strength meter (1-10 scale with visual gauge)
- Next recommended actions as action cards
- Quick add meeting button
- Export to CSV/PDF buttons

Style:
- Blue accent color theme
- Clean timeline with connecting lines
- Hover states showing more details
- Mobile-responsive card layout`,
      difficulty: 'advanced',
    },
    {
      id: 'pub-analyzer',
      title: 'Publication Analyzer',
      description: 'Analyze KOL publication portfolio',
      prompt: `Create a Publication Analyzer workflow node showing:
- Recent publications list (top 5) with title, journal, year
- Impact factor badges next to each journal
- Co-author mini-network visualization (small force graph)
- Citation trend sparkline chart
- Therapeutic area distribution as mini pie/donut chart
- "View Full Profile" button that expands details
- Filter by year range

Academic/professional styling with:
- Serif fonts for publication titles
- Journal impact factor color coding
- Clean data visualization`,
      difficulty: 'intermediate',
    },
  ],
  'agent-card': [
    {
      id: 'ma-specialist',
      title: 'Medical Affairs Specialist',
      description: 'AI agent for Medical Affairs support',
      prompt: `Create a Medical Affairs Specialist agent card showing:
- Agent avatar (placeholder circle with initials)
- Name: "Medical Affairs Specialist"
- Tier 2 badge (blue color)
- Specialization badges: KOL Management, Scientific Communications, Evidence Synthesis
- Expertise meter showing proficiency levels
- Active engagements count
- Recent activity summary (3 items)
- "Start Consultation" primary button
- "View Profile" secondary button

VITAL agent card patterns:
- Avatar: 56x56px with gradient border
- Tier badge: L2 = blue
- Hover state with subtle lift
- Compact and expanded view toggle`,
      difficulty: 'basic',
    },
    {
      id: 'regulatory-expert',
      title: 'Regulatory Expert',
      description: 'AI agent for regulatory guidance',
      prompt: `Create a Regulatory Expert agent card with:
- Agent avatar with regulatory icon overlay
- Name: "Regulatory Affairs Expert"
- Tier 3 badge (green for ultra-specialist)
- Region badges: FDA, EMA, PMDA, Health Canada
- Submission type tags: NDA, BLA, MAA, ANDA
- Compliance score indicator (circular)
- Active submissions tracker (mini kanban)
- "Get Guidance" CTA button

Professional regulatory styling with gold accents`,
      difficulty: 'intermediate',
    },
  ],
  'panel-ui': [
    {
      id: 'risk-panel',
      title: 'Risk Assessment Panel',
      description: 'Multi-expert risk evaluation interface',
      prompt: `Create a Risk Assessment Panel interface with:
- 5x5 risk matrix visualization (likelihood vs impact)
- Color-coded cells (green→yellow→orange→red)
- Expert panel sidebar showing 5 experts with:
  - Avatar, name, specialty
  - Current vote/position indicator
  - Speaking status (active/idle)
- Discussion thread area with message cards
- Consensus indicator bar (% agreement)
- Dissenting opinions highlight section
- Action items panel (right sidebar)
- "Submit Assessment" button

Professional healthcare risk management styling`,
      difficulty: 'advanced',
    },
    {
      id: 'protocol-review',
      title: 'Protocol Review Committee',
      description: 'Clinical protocol review interface',
      prompt: `Create a Protocol Review Committee interface showing:
- Protocol document outline (left sidebar, collapsible sections)
- Reviewer assignment grid (reviewer vs section)
- Comment threads per section
- Approval status badges per section (approved/changes requested/pending)
- Overall progress bar
- Decision tracker (approve/conditional/reject)
- Meeting notes area
- Export review summary button

Clinical/academic styling with blue and green palette`,
      difficulty: 'advanced',
    },
  ],
  'visualization': [
    {
      id: 'kol-network',
      title: 'KOL Network Graph',
      description: 'Interactive network visualization of KOL connections',
      prompt: `Create a KOL Network Graph visualization:
- Force-directed graph with nodes representing KOLs
- Node size based on influence score (larger = more influential)
- Node color by therapeutic area specialization
- Edge thickness showing collaboration strength
- Edge color showing interaction type (co-author, co-speaker, advisory board)
- Hover tooltip showing KOL details
- Click to select and highlight connections
- Zoom and pan controls
- Filter panel for therapeutic area, influence tier
- Legend showing color coding
- Mini-map in corner

Interactive features:
- Smooth animations
- Cluster by specialty option
- Search to highlight specific KOL`,
      difficulty: 'advanced',
    },
    {
      id: 'engagement-funnel',
      title: 'Engagement Funnel',
      description: 'KOL engagement stage visualization',
      prompt: `Create an Engagement Funnel visualization showing KOL stages:
- Funnel stages: Identified → Qualified → Contacted → Engaged → Active Collaboration
- Each stage shows count and percentage
- Conversion rates between stages
- Time-in-stage metrics (average days)
- Click stage to see KOL list in that stage
- Comparison to previous quarter (trend arrows)
- Filter by therapeutic area

Clean funnel design with:
- Gradient colors from purple (top) to green (bottom)
- Hover to highlight stage
- Responsive width`,
      difficulty: 'intermediate',
    },
  ],
  'dashboard': [
    {
      id: 'kol-dashboard',
      title: 'KOL Engagement Dashboard',
      description: 'Comprehensive KOL management dashboard',
      prompt: `Create a KOL Engagement Dashboard with these widgets:
- KPI cards row: Total KOLs, Active Engagements, Compliance Rate, Avg Influence Score
- Network graph widget (compact version) showing top connections
- Engagement timeline (horizontal, last 6 months)
- Upcoming activities card (next 5 meetings/events)
- Recent documents/artifacts card
- Compliance alerts panel
- Quick actions bar: Add KOL, Schedule Meeting, Generate Report

Layout:
- 3-column responsive grid
- Dark mode support
- Filter bar at top (therapeutic area, region, status)
- Refresh data button`,
      difficulty: 'advanced',
    },
  ],
  'form': [
    {
      id: 'kol-profile',
      title: 'KOL Profile Form',
      description: 'Form for capturing KOL information',
      prompt: `Create a KOL Profile Form with sections:
1. Personal Information: Name, Title, Institution, Email, Phone
2. Professional Background: Years of experience, Current positions, Previous affiliations
3. Expertise Areas: Multi-select for therapeutic areas, Specializations
4. Publication History: Auto-populate or manual entry option
5. Engagement Preferences: Preferred contact method, Best times, Language
6. Compliance: Conflict of interest disclosure, Agreement checkboxes

Form features:
- Progress indicator (step wizard)
- Save draft functionality
- Validation with helpful error messages
- Auto-save indicator
- Submit and review summary`,
      difficulty: 'intermediate',
    },
  ],
  'table': [
    {
      id: 'kol-directory',
      title: 'KOL Directory Table',
      description: 'Searchable KOL database table',
      prompt: `Create a KOL Directory Table with columns:
- Name (with avatar)
- Institution
- Therapeutic Area (badge)
- Influence Score (progress bar)
- Last Engagement (relative date)
- Status (Active/Prospect/Inactive badge)
- Actions (View, Edit, Contact icons)

Features:
- Search bar with filter suggestions
- Sort by any column
- Filter sidebar: Region, TA, Status, Score range
- Row expansion showing detailed profile
- Bulk selection with action menu
- Pagination with page size selector
- Export to CSV
- Column visibility toggle`,
      difficulty: 'intermediate',
    },
  ],
};

type GenerationHistory = {
  id: string;
  type: V0GenerationType;
  promptTitle: string;
  previewUrl: string;
  chatId: string;
  timestamp: string;
};

export default function V0DemoPage() {
  const [selectedType, setSelectedType] = useState<V0GenerationType>('workflow-node');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<V0GenerationResponse | null>(null);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'preview' | 'history'>('generator');

  const currentPrompts = DEMO_PROMPTS[selectedType] || [];

  const handleGenerationComplete = useCallback((result: V0GenerationResponse) => {
    setGenerationResult(result);
    setActiveTab('preview');
    
    // Add to history
    const promptConfig = currentPrompts.find(p => p.id === selectedPrompt);
    if (promptConfig) {
      setHistory(prev => [{
        id: `${Date.now()}`,
        type: selectedType,
        promptTitle: promptConfig.title,
        previewUrl: result.previewUrl,
        chatId: result.chatId,
        timestamp: new Date().toISOString(),
      }, ...prev.slice(0, 9)]);
    }
  }, [selectedType, selectedPrompt, currentPrompts]);

  const handleSelectPrompt = useCallback((promptId: string) => {
    setSelectedPrompt(promptId);
  }, []);

  const handleHistorySelect = useCallback((item: GenerationHistory) => {
    setGenerationResult({
      success: true,
      chatId: item.chatId,
      previewUrl: item.previewUrl,
      generationType: item.type,
      timestamp: item.timestamp,
    });
    setActiveTab('preview');
  }, []);

  const selectedPromptConfig = currentPrompts.find(p => p.id === selectedPrompt);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        icon={Sparkles}
        title="v0 AI Demo"
        description="Generate custom UI components for KOL Engagement workflows with AI"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              Medical Affairs POC
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://v0.dev', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              v0.dev
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full grid grid-cols-12 gap-6">
          {/* Left Sidebar - Workflow Context & Prompt Selection */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
            {/* Workflow Context Card */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  {KOL_WORKFLOW_SCENARIOS.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {KOL_WORKFLOW_SCENARIOS.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {KOL_WORKFLOW_SCENARIOS.stages.map((stage, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-medium flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] h-4 w-4 p-0 flex items-center justify-center">
                          {idx + 1}
                        </Badge>
                        {stage.name}
                      </div>
                      <div className="ml-5 text-muted-foreground">
                        {stage.tasks.join(' → ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generation Type Selector */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Generation Type</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'workflow-node', icon: Box, label: 'Node' },
                    { id: 'agent-card', icon: Users, label: 'Agent' },
                    { id: 'panel-ui', icon: Layers, label: 'Panel' },
                    { id: 'visualization', icon: BarChart3, label: 'Viz' },
                    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
                    { id: 'form', icon: FileText, label: 'Form' },
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start gap-1 text-xs"
                      onClick={() => {
                        setSelectedType(type.id as V0GenerationType);
                        setSelectedPrompt(null);
                      }}
                    >
                      <type.icon className="h-3 w-3" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Selection */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Demo Prompts
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a pre-configured prompt to try
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-2 pr-2">
                    {currentPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => handleSelectPrompt(prompt.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedPrompt === prompt.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm">{prompt.title}</div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              prompt.difficulty === 'advanced'
                                ? 'border-orange-300 text-orange-600'
                                : prompt.difficulty === 'intermediate'
                                ? 'border-blue-300 text-blue-600'
                                : 'border-green-300 text-green-600'
                            }`}
                          >
                            {prompt.difficulty}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {prompt.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="flex-shrink-0 mb-4">
                <TabsTrigger value="generator" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generator
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2" disabled={!generationResult}>
                  <ExternalLink className="h-4 w-4" />
                  Preview
                  {generationResult && <Badge variant="secondary" className="ml-1 text-[10px]">Ready</Badge>}
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                  {history.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{history.length}</Badge>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generator" className="flex-1 overflow-hidden m-0">
                <Card className="h-full flex flex-col">
                  {selectedPromptConfig ? (
                    <>
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {selectedPromptConfig.title}
                              <Badge variant="outline">{selectedType}</Badge>
                            </CardTitle>
                            <CardDescription>{selectedPromptConfig.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden">
                        <VitalV0GeneratorPanel
                          defaultType={selectedType}
                          workflowContext={{
                            name: KOL_WORKFLOW_SCENARIOS.title,
                            domain: KOL_WORKFLOW_SCENARIOS.domain,
                            existingNodes: ['start', 'kol-identification', 'compliance-check'],
                          }}
                          onGenerationComplete={handleGenerationComplete}
                          className="h-full"
                        />
                      </CardContent>
                    </>
                  ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md">
                        <Sparkles className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select a Demo Prompt</h3>
                        <p className="text-muted-foreground text-sm">
                          Choose a pre-configured prompt from the sidebar to start generating
                          custom UI components for the KOL Engagement workflow.
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-hidden m-0">
                {generationResult ? (
                  <VitalV0PreviewFrame
                    previewUrl={generationResult.previewUrl}
                    chatId={generationResult.chatId}
                    title={selectedPromptConfig?.title || 'Generated Component'}
                    className="h-full"
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <ExternalLink className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Generate a component to see the preview</p>
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-hidden m-0">
                <Card className="h-full overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Generation History
                    </CardTitle>
                    <CardDescription>Recent generations from this session</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {history.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {history.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleHistorySelect(item)}
                              className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{item.promptTitle}</div>
                                <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No generations yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}



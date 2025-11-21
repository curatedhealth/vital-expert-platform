"use client"

import React from 'react';
import { BookOpen, Users, GitBranch, Zap, Brain, Wrench, MessageSquare, Database, ChevronDown, ChevronRight, Rocket } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Mode3DocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Mode3Documentation({ isOpen, onClose }: Mode3DocumentationProps) {
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set(['overview', 'architecture']));

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Ask Expert Mode 3: Autonomous Manual - Documentation
          </DialogTitle>
          <DialogDescription>
            Expert-Driven Workflow - Multi-step autonomous execution with selected expert
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <div className="space-y-4">
            {/* Executive Overview */}
            <Collapsible
              open={openSections.has('overview')}
              onOpenChange={() => toggleSection('overview')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('overview') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">Executive Overview</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What is Mode 3?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Mode 3: Autonomous Manual</strong> ("Expert-Driven Workflow") is a goal-driven AI service where:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>User selects a specific expert agent</li>
                    <li>User provides a goal or task to accomplish</li>
                    <li>Expert autonomously executes multi-step workflow</li>
                    <li>Tool usage (research, analysis, generation)</li>
                    <li>Human approval checkpoints for critical steps</li>
                    <li>Response time: 3-5 minutes for complete workflow</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Expert Selection</div>
                    <div className="text-muted-foreground">Manual (User chooses)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Interaction Type</div>
                    <div className="text-muted-foreground">Autonomous (Goal-driven)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Agent Count</div>
                    <div className="text-muted-foreground">1 Expert (with sub-agents)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Workflow Duration</div>
                    <div className="text-muted-foreground">3-5 minutes</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* High-Level Architecture */}
            <Collapsible
              open={openSections.has('architecture')}
              onOpenChange={() => toggleSection('architecture')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('architecture') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">High-Level Architecture</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs space-y-2">
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">1. USER INPUT</div>
                    <div className="text-muted-foreground">User selects expert, provides goal/task</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">2. API GATEWAY</div>
                    <div className="text-muted-foreground">Authentication, Tenant isolation, Rate limiting</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">3. LANGGRAPH ORCHESTRATOR</div>
                    <div className="text-muted-foreground">START → load_agent → plan_workflow → execute_steps → END</div>
                    <div className="mt-1 text-xs">
                      <div>├─ receive_goal</div>
                      <div>├─ load_agent</div>
                      <div>├─ workflow_planning (Break down goal)</div>
                      <div>├─ step_execution_loop</div>
                      <div>│  ├─ research_step</div>
                      <div>│  ├─ analysis_step</div>
                      <div>│  ├─ tool_execution</div>
                      <div>│  ├─ checkpoint_approval (if needed)</div>
                      <div>│  └─ next_step_decision</div>
                      <div>├─ synthesize_results</div>
                      <div>├─ generate_deliverables</div>
                      <div>└─ update_memory</div>
                    </div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">4. STREAMING PROGRESS</div>
                    <div className="text-muted-foreground">SSE: Workflow steps, Progress updates, Intermediate results, Final deliverables</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">5. FRONTEND UPDATE</div>
                    <div className="text-muted-foreground">Display workflow progress, Show checkpoints, Present deliverables</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Workflow Phases */}
            <Collapsible
              open={openSections.has('phases')}
              onOpenChange={() => toggleSection('phases')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('phases') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">Workflow Phases</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-3">
                {[
                  {
                    phase: 'Phase 1: Initialization',
                    icon: Users,
                    color: 'bg-blue-500',
                    nodes: ['load_agent', 'receive_goal'],
                    description: 'Load selected expert profile and receive user goal/task'
                  },
                  {
                    phase: 'Phase 2: Workflow Planning',
                    icon: Brain,
                    color: 'bg-purple-500',
                    nodes: ['workflow_planning', 'break_down_goal'],
                    description: 'Expert breaks down goal into actionable steps and creates execution plan'
                  },
                  {
                    phase: 'Phase 3: Research & Context',
                    icon: Zap,
                    color: 'bg-pink-500',
                    nodes: ['research_step', 'update_context'],
                    description: 'Gather information, perform RAG search, collect relevant data'
                  },
                  {
                    phase: 'Phase 4: Analysis & Reasoning',
                    icon: Brain,
                    color: 'bg-orange-500',
                    nodes: ['analysis_step', 'agent_reasoning'],
                    description: 'Analyze collected information, apply expert reasoning'
                  },
                  {
                    phase: 'Phase 5: Tool Execution',
                    icon: Wrench,
                    color: 'bg-green-500',
                    nodes: ['tool_execution', 'generate_artifacts'],
                    description: 'Execute tools, generate documents, create deliverables'
                  },
                  {
                    phase: 'Phase 6: Checkpoint & Approval',
                    icon: Rocket,
                    color: 'bg-yellow-500',
                    nodes: ['checkpoint_approval', 'human_review'],
                    description: 'Present intermediate results for human approval if needed'
                  },
                  {
                    phase: 'Phase 7: Synthesis & Delivery',
                    icon: MessageSquare,
                    color: 'bg-cyan-500',
                    nodes: ['synthesize_results', 'generate_deliverables'],
                    description: 'Combine all results, create final deliverables'
                  },
                  {
                    phase: 'Phase 8: Persistence',
                    icon: Database,
                    color: 'bg-indigo-500',
                    nodes: ['update_memory', 'save_artifacts'],
                    description: 'Save workflow results, artifacts, and session data'
                  }
                ].map((phase, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded", phase.color, "text-white")}>
                        <phase.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{phase.phase}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {phase.nodes.map((node, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {node}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Node Descriptions */}
            <Collapsible
              open={openSections.has('nodes')}
              onOpenChange={() => toggleSection('nodes')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('nodes') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">Node Descriptions</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-2">
                {[
                  {
                    id: 'load_agent',
                    name: 'Load Agent',
                    duration: '1-2s',
                    description: 'Fetch agent profile, persona, knowledge bases, and sub-agent pool'
                  },
                  {
                    id: 'receive_goal',
                    name: 'Receive Goal',
                    duration: '1s',
                    description: 'Receive user goal/task and parse requirements'
                  },
                  {
                    id: 'workflow_planning',
                    name: 'Workflow Planning',
                    duration: '5-10s',
                    description: 'Break down goal into actionable steps, create execution plan'
                  },
                  {
                    id: 'research_step',
                    name: 'Research Step',
                    duration: '10-20s',
                    description: 'Gather information, perform RAG search, collect relevant data'
                  },
                  {
                    id: 'analysis_step',
                    name: 'Analysis Step',
                    duration: '15-30s',
                    description: 'Analyze collected information, apply expert reasoning'
                  },
                  {
                    id: 'tool_execution',
                    name: 'Tool Execution',
                    duration: '20-60s',
                    description: 'Execute tools (FDA API, Standards DB, document generation, etc.)'
                  },
                  {
                    id: 'checkpoint_approval',
                    name: 'Checkpoint Approval',
                    duration: 'User-dependent',
                    description: 'Present intermediate results for human approval if needed'
                  },
                  {
                    id: 'synthesize_results',
                    name: 'Synthesize Results',
                    duration: '10-20s',
                    description: 'Combine all results from workflow steps'
                  },
                  {
                    id: 'generate_deliverables',
                    name: 'Generate Deliverables',
                    duration: '30-60s',
                    description: 'Create final deliverables (documents, reports, artifacts)'
                  },
                  {
                    id: 'update_memory',
                    name: 'Update Memory',
                    duration: '2-3s',
                    description: 'Save workflow results, artifacts, and session data'
                  }
                ].map((node) => (
                  <div key={node.id} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                            {node.id}
                          </code>
                          <Badge variant="secondary" className="text-xs">
                            {node.duration}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm mt-1">{node.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Tool Integration */}
            <Collapsible
              open={openSections.has('tools')}
              onOpenChange={() => toggleSection('tools')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('tools') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">Tool Integration Points</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3 space-y-2">
                {[
                  {
                    name: 'predicate_device_search',
                    description: 'Search FDA 510(k) database for predicate devices',
                    source: 'FDA API (api.fda.gov/device/510k.json)',
                    duration: '2-3s'
                  },
                  {
                    name: 'regulatory_database_query',
                    description: 'Query internal regulatory database (CFR, FDA Guidance, ISO/IEC standards)',
                    source: 'Internal database',
                    duration: '1-2s'
                  },
                  {
                    name: 'document_generation',
                    description: 'Generate documents (protocols, reports, submissions)',
                    source: 'LLM + Templates',
                    duration: '30-60s'
                  },
                  {
                    name: 'standards_search',
                    description: 'Search ISO/IEC standards library',
                    source: 'Internal standards database',
                    duration: '1-2s'
                  },
                  {
                    name: 'web_search',
                    description: 'External research (PubMed, Google Scholar, etc.)',
                    source: 'Brave Search API',
                    duration: '3-5s'
                  },
                  {
                    name: 'document_analysis',
                    description: 'Analyze uploaded user documents (PDFs, Word)',
                    source: 'User uploads',
                    duration: '5-10s'
                  }
                ].map((tool) => (
                  <div key={tool.name} className="p-3 bg-background rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                          {tool.name}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Source:</strong> {tool.source}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2">
                        {tool.duration}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Performance Metrics */}
            <Collapsible
              open={openSections.has('performance')}
              onOpenChange={() => toggleSection('performance')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                  {openSections.has('performance') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Total Workflow Time</div>
                      <div className="text-muted-foreground">3-5 minutes</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Workflow Planning</div>
                      <div className="text-muted-foreground">5-10s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Research Phase</div>
                      <div className="text-muted-foreground">10-20s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Analysis Phase</div>
                      <div className="text-muted-foreground">15-30s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Tool Execution</div>
                      <div className="text-muted-foreground">20-60s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Deliverable Generation</div>
                      <div className="text-muted-foreground">30-60s</div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


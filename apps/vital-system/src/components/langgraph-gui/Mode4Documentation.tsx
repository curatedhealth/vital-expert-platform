"use client"

import React from 'react';
import { BookOpen, Users, GitBranch, Zap, Brain, Wrench, MessageSquare, Database, ChevronDown, ChevronRight, Rocket, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Mode4DocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Mode4Documentation({ isOpen, onClose }: Mode4DocumentationProps) {
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
            Ask Expert Mode 4: Autonomous Automatic - Documentation
          </DialogTitle>
          <DialogDescription>
            AI Collaborative Workflow - Multiple experts working together autonomously
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
                  <h4 className="font-semibold mb-2">What is Mode 4?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Mode 4: Autonomous Automatic</strong> ("AI Collaborative Workflow") is a goal-driven AI service where:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>AI automatically assembles a team of experts (up to 4)</li>
                    <li>User provides a complex goal requiring multiple domains</li>
                    <li>Experts collaborate autonomously to execute workflow</li>
                    <li>Advanced tool usage across multiple domains</li>
                    <li>Comprehensive deliverables from collaborative effort</li>
                    <li>Response time: 5-10 minutes for complete workflow</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Expert Selection</div>
                    <div className="text-muted-foreground">Automatic (AI assembles team)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Interaction Type</div>
                    <div className="text-muted-foreground">Autonomous (Goal-driven)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Agent Count</div>
                    <div className="text-muted-foreground">Up to 4 Experts (AI-selected team)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Workflow Duration</div>
                    <div className="text-muted-foreground">5-10 minutes</div>
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
                    <div className="text-muted-foreground">User provides complex goal (no expert selection needed)</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">2. EXPERT TEAM ASSEMBLY</div>
                    <div className="text-muted-foreground">AI analyzes goal and assembles team of 2-4 experts</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">3. API GATEWAY</div>
                    <div className="text-muted-foreground">Authentication, Tenant isolation, Rate limiting</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">4. LANGGRAPH ORCHESTRATOR</div>
                    <div className="text-muted-foreground">START → select_team → plan_workflow → collaborative_execution → END</div>
                    <div className="mt-1 text-xs">
                      <div>├─ receive_goal</div>
                      <div>├─ select_expert_team (2-4 experts)</div>
                      <div>├─ load_agents (all team members)</div>
                      <div>├─ collaborative_planning</div>
                      <div>├─ task_allocation</div>
                      <div>├─ parallel_execution</div>
                      <div>│  ├─ expert_1_workflow</div>
                      <div>│  ├─ expert_2_workflow</div>
                      <div>│  ├─ expert_3_workflow (if needed)</div>
                      <div>│  └─ expert_4_workflow (if needed)</div>
                      <div>├─ result_synthesis</div>
                      <div>├─ cross_expert_review</div>
                      <div>├─ generate_deliverables</div>
                      <div>└─ update_memory</div>
                    </div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">5. STREAMING PROGRESS</div>
                    <div className="text-muted-foreground">SSE: Team assembly, Workflow steps, Expert progress, Final deliverables</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">6. FRONTEND UPDATE</div>
                    <div className="text-muted-foreground">Display team members, workflow progress, collaborative results, deliverables</div>
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
                    phase: 'Phase 1: Expert Team Assembly',
                    icon: Sparkles,
                    color: 'bg-yellow-500',
                    nodes: ['select_expert_team', 'analyze_goal'],
                    description: 'AI analyzes complex goal and assembles team of 2-4 experts from different domains'
                  },
                  {
                    phase: 'Phase 2: Initialization',
                    icon: Users,
                    color: 'bg-blue-500',
                    nodes: ['load_agents', 'receive_goal'],
                    description: 'Load all selected expert profiles, personas, and knowledge bases'
                  },
                  {
                    phase: 'Phase 3: Collaborative Planning',
                    icon: Brain,
                    color: 'bg-purple-500',
                    nodes: ['collaborative_planning', 'task_allocation'],
                    description: 'Experts collaborate to break down goal and allocate tasks to each expert'
                  },
                  {
                    phase: 'Phase 4: Parallel Execution',
                    icon: GitBranch,
                    color: 'bg-pink-500',
                    nodes: ['parallel_execution', 'expert_workflows'],
                    description: 'Multiple experts work in parallel on their assigned tasks'
                  },
                  {
                    phase: 'Phase 5: Research & Context',
                    icon: Zap,
                    color: 'bg-orange-500',
                    nodes: ['research_step', 'update_context'],
                    description: 'Each expert gathers domain-specific information and performs RAG search'
                  },
                  {
                    phase: 'Phase 6: Tool Execution',
                    icon: Wrench,
                    color: 'bg-green-500',
                    nodes: ['tool_execution', 'generate_artifacts'],
                    description: 'Experts execute tools relevant to their domains, generate intermediate artifacts'
                  },
                  {
                    phase: 'Phase 7: Result Synthesis',
                    icon: Brain,
                    color: 'bg-cyan-500',
                    nodes: ['result_synthesis', 'cross_expert_review'],
                    description: 'Combine results from all experts, perform cross-expert review and validation'
                  },
                  {
                    phase: 'Phase 8: Deliverable Generation',
                    icon: MessageSquare,
                    color: 'bg-indigo-500',
                    nodes: ['generate_deliverables', 'final_review'],
                    description: 'Create comprehensive final deliverables incorporating all expert contributions'
                  },
                  {
                    phase: 'Phase 9: Persistence',
                    icon: Database,
                    color: 'bg-gray-500',
                    nodes: ['update_memory', 'save_artifacts'],
                    description: 'Save workflow results, all artifacts, and session data'
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
                    id: 'select_expert_team',
                    name: 'Select Expert Team',
                    duration: '3-5s',
                    description: 'AI analyzes complex goal and assembles team of 2-4 experts from different domains'
                  },
                  {
                    id: 'load_agents',
                    name: 'Load Agents',
                    duration: '3-5s',
                    description: 'Load all selected expert profiles, personas, knowledge bases for team members'
                  },
                  {
                    id: 'collaborative_planning',
                    name: 'Collaborative Planning',
                    duration: '10-15s',
                    description: 'Experts collaborate to break down goal into tasks and allocate work'
                  },
                  {
                    id: 'task_allocation',
                    name: 'Task Allocation',
                    duration: '5-10s',
                    description: 'Assign specific tasks to each expert based on their domain expertise'
                  },
                  {
                    id: 'parallel_execution',
                    name: 'Parallel Execution',
                    duration: '2-5 min',
                    description: 'Multiple experts work in parallel on their assigned tasks'
                  },
                  {
                    id: 'research_step',
                    name: 'Research Step',
                    duration: '15-30s',
                    description: 'Each expert gathers domain-specific information and performs RAG search'
                  },
                  {
                    id: 'tool_execution',
                    name: 'Tool Execution',
                    duration: '30-90s',
                    description: 'Experts execute tools relevant to their domains, generate intermediate artifacts'
                  },
                  {
                    id: 'result_synthesis',
                    name: 'Result Synthesis',
                    duration: '20-40s',
                    description: 'Combine results from all experts into coherent output'
                  },
                  {
                    id: 'cross_expert_review',
                    name: 'Cross-Expert Review',
                    duration: '15-30s',
                    description: 'Experts review each other\'s work for accuracy and completeness'
                  },
                  {
                    id: 'generate_deliverables',
                    name: 'Generate Deliverables',
                    duration: '60-120s',
                    description: 'Create comprehensive final deliverables incorporating all expert contributions'
                  },
                  {
                    id: 'update_memory',
                    name: 'Update Memory',
                    duration: '3-5s',
                    description: 'Save workflow results, all artifacts, and session data'
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
                    description: 'Generate comprehensive documents (submissions, protocols, reports)',
                    source: 'LLM + Templates',
                    duration: '60-120s'
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
                  },
                  {
                    name: 'data_analysis',
                    description: 'Perform statistical analysis and data processing',
                    source: 'Python scripts',
                    duration: '10-30s'
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
                      <div className="text-muted-foreground">5-10 minutes</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Team Assembly</div>
                      <div className="text-muted-foreground">3-5s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Collaborative Planning</div>
                      <div className="text-muted-foreground">10-15s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Parallel Execution</div>
                      <div className="text-muted-foreground">2-5 min</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Result Synthesis</div>
                      <div className="text-muted-foreground">20-40s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Deliverable Generation</div>
                      <div className="text-muted-foreground">60-120s</div>
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


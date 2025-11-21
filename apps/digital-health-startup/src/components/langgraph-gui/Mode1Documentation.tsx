"use client"

import React from 'react';
import { X, BookOpen, Users, GitBranch, Zap, Brain, Wrench, MessageSquare, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Mode1DocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Mode1Documentation({ isOpen, onClose }: Mode1DocumentationProps) {
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
            Ask Expert Mode 1: Interactive Manual - Documentation
          </DialogTitle>
          <DialogDescription>
            Comprehensive workflow visualization and implementation guide
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
                  <h4 className="font-semibold mb-2">What is Mode 1?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Mode 1: Interactive Manual</strong> is a conversational AI service where:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>User explicitly selects a specific expert agent</li>
                    <li>Multi-turn conversation with full context retention</li>
                    <li>Single expert maintains persona consistency throughout</li>
                    <li>No autonomous execution - guidance and conversation only</li>
                    <li>Response time: 15-25 seconds per message</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Expert Selection</div>
                    <div className="text-muted-foreground">Manual (User chooses)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Interaction Type</div>
                    <div className="text-muted-foreground">Interactive (Back-and-forth)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Agent Count</div>
                    <div className="text-muted-foreground">1 Expert (with sub-agents)</div>
                  </div>
                  <div className="p-2 bg-background rounded border">
                    <div className="font-medium">Context Window</div>
                    <div className="text-muted-foreground">Up to 200K tokens</div>
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
                    <div className="text-muted-foreground">User selects expert from gallery, types question</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">2. API GATEWAY</div>
                    <div className="text-muted-foreground">Authentication, Tenant isolation, Rate limiting</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">3. LANGGRAPH ORCHESTRATOR</div>
                    <div className="text-muted-foreground">START → load_agent → load_context → conversation_loop → END</div>
                    <div className="mt-1 text-xs">
                      <div>├─ receive_message</div>
                      <div>├─ update_context (RAG search)</div>
                      <div>├─ agent_reasoning (Chain-of-Thought)</div>
                      <div>├─ check_specialist_need</div>
                      <div>├─ tool_execution</div>
                      <div>├─ generate_response (Stream tokens)</div>
                      <div>└─ update_memory (Save to DB)</div>
                    </div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">4. STREAMING RESPONSE</div>
                    <div className="text-muted-foreground">SSE: Thinking steps, Response tokens, Citations, Metadata</div>
                  </div>
                  <div className="text-center">↓</div>
                  <div className="border-l-2 border-primary pl-2">
                    <div className="font-semibold">5. FRONTEND UPDATE</div>
                    <div className="text-muted-foreground">Display streaming response, Show citations, Enable next input</div>
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
                    nodes: ['load_agent', 'load_context'],
                    description: 'Load agent profile, persona, and conversation history'
                  },
                  {
                    phase: 'Phase 2: Context Enrichment',
                    icon: Zap,
                    color: 'bg-purple-500',
                    nodes: ['update_context'],
                    description: 'Hybrid RAG search (semantic + keyword) to enrich context'
                  },
                  {
                    phase: 'Phase 3: Reasoning & Planning',
                    icon: Brain,
                    color: 'bg-pink-500',
                    nodes: ['agent_reasoning', 'check_specialist_need'],
                    description: 'Chain-of-thought analysis, determine tool and specialist needs'
                  },
                  {
                    phase: 'Phase 4: Sub-Agent Orchestration',
                    icon: GitBranch,
                    color: 'bg-orange-500',
                    nodes: ['spawn_specialists'],
                    description: 'Dynamically spawn Level 3 specialist sub-agents'
                  },
                  {
                    phase: 'Phase 5: Tool Execution',
                    icon: Wrench,
                    color: 'bg-green-500',
                    nodes: ['check_tools_need', 'tool_execution'],
                    description: 'Execute tools (FDA API, Standards DB, etc.)'
                  },
                  {
                    phase: 'Phase 6: Response Generation',
                    icon: MessageSquare,
                    color: 'bg-cyan-500',
                    nodes: ['generate_response'],
                    description: 'Synthesize expert response with streaming'
                  },
                  {
                    phase: 'Phase 7: Persistence',
                    icon: Database,
                    color: 'bg-indigo-500',
                    nodes: ['update_memory', 'check_continuation'],
                    description: 'Persist conversation to database, update session stats'
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
                    id: 'load_context',
                    name: 'Load Context',
                    duration: '2-3s',
                    description: 'Load conversation history (last 10 turns) and build message history'
                  },
                  {
                    id: 'update_context',
                    name: 'Update Context (RAG)',
                    duration: '3-5s',
                    description: 'Hybrid RAG search combining semantic (Pinecone) and keyword (PostgreSQL) retrieval'
                  },
                  {
                    id: 'agent_reasoning',
                    name: 'Agent Reasoning',
                    duration: '3-5s',
                    description: 'Chain-of-thought analysis to determine tool needs, specialist needs, and response strategy'
                  },
                  {
                    id: 'spawn_specialists',
                    name: 'Spawn Specialists',
                    duration: '2-3s',
                    description: 'Dynamically spawn Level 3 specialist sub-agents for deep analysis'
                  },
                  {
                    id: 'tool_execution',
                    name: 'Tool Execution',
                    duration: '3-7s',
                    description: 'Execute tools like predicate_device_search, regulatory_database_query, standards_search'
                  },
                  {
                    id: 'generate_response',
                    name: 'Generate Response',
                    duration: '5-10s',
                    description: 'Synthesize comprehensive expert response with streaming, extract citations'
                  },
                  {
                    id: 'update_memory',
                    name: 'Update Memory',
                    duration: '1-2s',
                    description: 'Persist conversation to database, update session statistics, log analytics'
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
                      <div className="font-medium">Response Time (P50)</div>
                      <div className="text-muted-foreground">15-20s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Response Time (P95)</div>
                      <div className="text-muted-foreground">25-30s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">RAG Retrieval</div>
                      <div className="text-muted-foreground">&lt;3s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Tool Execution</div>
                      <div className="text-muted-foreground">&lt;5s per tool</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">LLM Generation</div>
                      <div className="text-muted-foreground">&lt;8s</div>
                    </div>
                    <div className="p-2 bg-background rounded border">
                      <div className="font-medium">Database Operations</div>
                      <div className="text-muted-foreground">&lt;1s</div>
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



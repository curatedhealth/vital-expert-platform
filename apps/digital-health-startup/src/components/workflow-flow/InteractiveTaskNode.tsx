'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Wrench, 
  Database, 
  Edit, 
  Save, 
  X, 
  Plus,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Agent {
  id: string;
  code: string;
  name: string;
  agent_type: string;
  framework?: string;
}

interface Tool {
  id: string;
  code: string;
  name: string;
  category: string;
  tool_type: string;
}

interface RagSource {
  id: string;
  code: string;
  name: string;
  source_type: string;
  domain?: string | null;
}

interface KnowledgeDomain {
  domain_id: string;
  code: string;
  domain_name: string;
  slug: string;
}

interface PromptSuite {
  id: string;
  unique_id: string;
  name: string;
  description?: string;
  category?: string;
}

interface PromptSubsuite {
  id: string;
  unique_id: string;
  name: string;
  description?: string;
}

interface PromptTemplate {
  id: string;
  unique_id: string;
  code?: string;
  title: string;
  description?: string;
  content_template: string;
}

interface TaskAssignment {
  agents: Array<{
    id: string;
    name: string;
    code: string;
    assignment_type?: string;
    execution_order?: number;
  }>;
  tools: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  rags: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  userPrompt?: string;
}

export const InteractiveTaskNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Available options
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [availableRags, setAvailableRags] = useState<RagSource[]>([]);
  const [availableDomains, setAvailableDomains] = useState<KnowledgeDomain[]>([]);
  const [availablePromptSuites, setAvailablePromptSuites] = useState<PromptSuite[]>([]);
  const [availableSubsuites, setAvailableSubsuites] = useState<PromptSubsuite[]>([]);
  const [availablePrompts, setAvailablePrompts] = useState<PromptTemplate[]>([]);
  
  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedPromptSuite, setSelectedPromptSuite] = useState<string>('');
  const [selectedPromptSubsuite, setSelectedPromptSubsuite] = useState<string>('');
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState<string>('');
  
  // Selected items
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedRags, setSelectedRags] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  
  // Protocol toggles
  const [humanInLoop, setHumanInLoop] = useState(false);
  const [pharmaProtocol, setPharmaProtocol] = useState(false);
  const [verifyProtocol, setVerifyProtocol] = useState(false);
  
  // Popovers
  const [agentPopoverOpen, setAgentPopoverOpen] = useState(false);
  const [toolPopoverOpen, setToolPopoverOpen] = useState(false);
  const [ragPopoverOpen, setRagPopoverOpen] = useState(false);

  // Initialize selected items from data
  useEffect(() => {
    if (data.agents) {
      setSelectedAgents(data.agents.map((a: any) => a.id));
    }
    if (data.tools) {
      setSelectedTools(data.tools.map((t: any) => t.id));
    }
    if (data.rags) {
      setSelectedRags(data.rags.map((r: any) => r.id));
    }
    if (data.userPrompt) {
      setUserPrompt(data.userPrompt);
    }
    // Initialize protocol toggles from data
    if (data.guardrails) {
      setHumanInLoop(data.guardrails.humanInLoop || false);
    }
    if (data.runPolicy) {
      setPharmaProtocol(data.runPolicy.pharmaProtocol || false);
      setVerifyProtocol(data.runPolicy.verifyProtocol || false);
    }
  }, [data]);

  // Fetch available options
  const fetchAvailableOptions = async () => {
    try {
      const [agentsRes, toolsRes, ragsRes, domainsRes, suitesRes] = await Promise.all([
        fetch('/api/workflows/agents'),
        fetch('/api/workflows/tools'),
        fetch('/api/workflows/rags'),
        fetch('/api/workflows/domains'),
        fetch('/api/workflows/prompt-suites'),
      ]);

      if (agentsRes.ok) {
        const { agents } = await agentsRes.json();
        setAvailableAgents(agents || []);
      }
      if (toolsRes.ok) {
        const { tools } = await toolsRes.json();
        setAvailableTools(tools || []);
      }
      if (ragsRes.ok) {
        const { rags } = await ragsRes.json();
        setAvailableRags(rags || []);
      }
      if (domainsRes.ok) {
        const { domains } = await domainsRes.json();
        setAvailableDomains(domains || []);
      }
      if (suitesRes.ok) {
        const { suites } = await suitesRes.json();
        setAvailablePromptSuites(suites || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchAvailableOptions();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (data.agents) {
      setSelectedAgents(data.agents.map((a: any) => a.id));
    }
    if (data.tools) {
      setSelectedTools(data.tools.map((t: any) => t.id));
    }
    if (data.rags) {
      setSelectedRags(data.rags.map((r: any) => r.id));
    }
    if (data.userPrompt) {
      setUserPrompt(data.userPrompt);
    }
    // Reset protocol toggles
    if (data.guardrails) {
      setHumanInLoop(data.guardrails.humanInLoop || false);
    }
    if (data.runPolicy) {
      setPharmaProtocol(data.runPolicy.pharmaProtocol || false);
      setVerifyProtocol(data.runPolicy.verifyProtocol || false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/workflows/tasks/${data.taskId}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: selectedAgents,
          toolIds: selectedTools,
          ragIds: selectedRags,
          userPrompt,
          humanInLoop,
          pharmaProtocol,
          verifyProtocol,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Update node data
        if (data.onUpdate) {
          data.onUpdate({
            agents: selectedAgents.map(id => 
              availableAgents.find(a => a.id === id)
            ).filter(Boolean),
            tools: selectedTools.map(id => 
              availableTools.find(t => t.id === id)
            ).filter(Boolean),
            rags: selectedRags.map(id => 
              availableRags.find(r => r.id === id)
            ).filter(Boolean),
            userPrompt,
            guardrails: { humanInLoop },
            runPolicy: { pharmaProtocol, verifyProtocol },
          });
        }
        setIsEditing(false);
      } else {
        const error = await response.json();
        console.error('Error saving assignments:', error);
        alert(`Failed to save: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const toggleRag = (ragId: string) => {
    setSelectedRags(prev =>
      prev.includes(ragId)
        ? prev.filter(id => id !== ragId)
        : [...prev, ragId]
    );
  };

  // Prompt Library handlers
  const handleSuiteChange = async (suiteId: string | undefined) => {
    setSelectedPromptSuite(suiteId || '');
    setSelectedPromptSubsuite('');
    setSelectedPromptTemplate('');
    setAvailableSubsuites([]);
    setAvailablePrompts([]);
    
    if (!suiteId) return;
    
    try {
      const response = await fetch(`/api/workflows/prompt-suites/${suiteId}/subsuites`);
      if (response.ok) {
        const { subsuites } = await response.json();
        setAvailableSubsuites(subsuites || []);
      }
    } catch (error) {
      console.error('Error fetching subsuites:', error);
    }
  };

  const handleSubsuiteChange = async (subsuiteId: string | undefined) => {
    setSelectedPromptSubsuite(subsuiteId || '');
    setSelectedPromptTemplate('');
    
    if (!subsuiteId) return;
    
    try {
      const url = new URL('/api/workflows/prompts', window.location.origin);
      if (selectedPromptSuite) url.searchParams.set('suiteId', selectedPromptSuite);
      if (subsuiteId) url.searchParams.set('subsuiteId', subsuiteId);
      
      const response = await fetch(url);
      if (response.ok) {
        const { prompts } = await response.json();
        setAvailablePrompts(prompts || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const handleApplyPromptTemplate = () => {
    if (!selectedPromptTemplate) return;
    
    const prompt = availablePrompts.find(p => p.id === selectedPromptTemplate);
    if (prompt) {
      setUserPrompt(prompt.content_template);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!userPrompt.trim()) return;
    
    try {
      const response = await fetch('/api/prompts/enhance-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          context: {
            suite: selectedPromptSuite,
            subsuite: selectedPromptSubsuite
          }
        })
      });
      
      if (response.ok) {
        const { enhancedPrompt } = await response.json();
        setUserPrompt(enhancedPrompt);
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
    }
  };

  const hasAgents = data.agents && data.agents.length > 0;
  const hasTools = data.tools && data.tools.length > 0;
  const hasRags = data.rags && data.rags.length > 0;
  const hasAssignments = hasAgents || hasTools || hasRags;

  return (
    <>
      <div className="relative">
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
        />
        
        <Card 
          className={cn(
            "min-w-[300px] max-w-[360px] transition-all duration-200",
            selected 
              ? "border-2 border-blue-600 shadow-2xl ring-4 ring-blue-100" 
              : "border-2 border-blue-300 shadow-lg hover:shadow-xl"
          )}
        >
          {/* Header */}
          <CardHeader className="p-0">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-t-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  Task {data.position}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/80">
                    {data.workflowPosition}.{data.position}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={handleEdit}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-sm font-semibold text-white leading-tight">
                {data.title}
              </CardTitle>
            </div>
          </CardHeader>

          {/* Body - Assignments */}
          {hasAssignments && (
            <CardContent className="p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {/* Agents */}
              {hasAgents && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {data.agents.length} Agent{data.agents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {data.agents.slice(0, 4).map((agent: any) => (
                      <div
                        key={agent.id}
                        className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5 text-xs"
                      >
                        <p className="font-medium text-blue-900 truncate">
                          {agent.name}
                        </p>
                        <p className="text-[10px] text-blue-600">
                          Order: {agent.execution_order || 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  {data.agents.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{data.agents.length - 4} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Tools */}
              {hasTools && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {data.tools.length} Tool{data.tools.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.tools.slice(0, 3).map((tool: any) => (
                      <Badge
                        key={tool.id}
                        variant="outline"
                        className="text-[10px] bg-green-50 border-green-300 text-green-800"
                      >
                        {tool.name}
                      </Badge>
                    ))}
                    {data.tools.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{data.tools.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* RAG Sources */}
              {hasRags && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-500 flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {data.rags.length} Source{data.rags.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {data.rags.slice(0, 2).map((rag: any) => (
                      <div
                        key={rag.id}
                        className="bg-purple-50 border border-purple-200 rounded-md px-2 py-1.5"
                      >
                        <p className="text-xs font-medium text-purple-900 truncate">
                          {rag.name}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {rag.source_type}
                        </Badge>
                      </div>
                    ))}
                    {data.rags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.rags.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* User Prompt */}
              {data.userPrompt && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      User Prompt
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic line-clamp-3">
                    {data.userPrompt}
                  </p>
                </div>
              )}
            </CardContent>
          )}

          {/* Empty state */}
          {!hasAssignments && (
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-2">No assignments</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={handleEdit}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Assignments
              </Button>
            </CardContent>
          )}
        </Card>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task Assignments</DialogTitle>
            <DialogDescription>
              Configure agents, tools, RAG sources, and user prompt for {data.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Agents Multi-Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                AI Agents ({selectedAgents.length} selected)
              </Label>
              <Popover open={agentPopoverOpen} onOpenChange={setAgentPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="text-sm truncate">
                      {selectedAgents.length === 0
                        ? 'Select agents...'
                        : `${selectedAgents.length} agent${selectedAgents.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <Plus className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search agents..." />
                    <CommandEmpty>No agents found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-64">
                        {availableAgents.map((agent) => (
                          <CommandItem
                            key={agent.id}
                            onSelect={() => toggleAgent(agent.id)}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedAgents.includes(agent.id)}
                              onCheckedChange={() => toggleAgent(agent.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{agent.name}</p>
                              <p className="text-xs text-gray-500">{agent.code}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedAgents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedAgents.map(id => {
                    const agent = availableAgents.find(a => a.id === id);
                    return agent ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {agent.name}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => toggleAgent(id)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Tools Multi-Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-green-600" />
                Tools ({selectedTools.length} selected)
              </Label>
              <Popover open={toolPopoverOpen} onOpenChange={setToolPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="text-sm truncate">
                      {selectedTools.length === 0
                        ? 'Select tools...'
                        : `${selectedTools.length} tool${selectedTools.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <Plus className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search tools..." />
                    <CommandEmpty>No tools found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-64">
                        {availableTools.map((tool) => (
                          <CommandItem
                            key={tool.id}
                            onSelect={() => toggleTool(tool.id)}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={() => toggleTool(tool.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tool.name}</p>
                              <p className="text-xs text-gray-500">{tool.category}</p>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedTools.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedTools.map(id => {
                    const tool = availableTools.find(t => t.id === id);
                    return tool ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {tool.name}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => toggleTool(id)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* RAG Sources Multi-Select */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                Knowledge Sources ({selectedRags.length} selected)
              </Label>
              
              {/* Domain Filter - Styled consistently */}
              {availableDomains.length > 0 && (
                <div className="text-xs text-gray-600 mb-1">Filter by domain:</div>
              )}
              {availableDomains.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs mb-2"
                  onClick={() => {
                    // Toggle through domains
                    const currentIndex = availableDomains.findIndex(d => d.code === selectedDomain);
                    if (currentIndex === -1 || currentIndex === availableDomains.length - 1) {
                      setSelectedDomain('all');
                    } else {
                      setSelectedDomain(availableDomains[currentIndex + 1].code);
                    }
                  }}
                >
                  {selectedDomain === 'all' ? 'All Domains' : 
                    availableDomains.find(d => d.code === selectedDomain)?.domain_name || 'All Domains'}
                </Button>
              )}
              
              {/* Count display matching Agents/Tools */}
              <div className="text-sm text-gray-600">
                {selectedRags.length} source{selectedRags.length !== 1 ? 's' : ''} selected
              </div>
              
              <Popover open={ragPopoverOpen} onOpenChange={setRagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="text-sm truncate">
                      {selectedRags.length === 0
                        ? 'Select knowledge sources...'
                        : `${selectedRags.length} source${selectedRags.length !== 1 ? 's' : ''} selected`}
                    </span>
                    <Plus className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search knowledge sources..." />
                    <CommandEmpty>No sources found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-64">
                        {availableRags
                          .filter(rag => 
                            selectedDomain === 'all' || 
                            rag.domain === selectedDomain ||
                            !rag.domain
                          )
                          .map((rag) => (
                          <CommandItem
                            key={rag.id}
                            onSelect={() => toggleRag(rag.id)}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedRags.includes(rag.id)}
                              onCheckedChange={() => toggleRag(rag.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{rag.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">{rag.source_type}</p>
                                {rag.domain && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    {rag.domain}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedRags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedRags.map(id => {
                    const rag = availableRags.find(r => r.id === id);
                    return rag ? (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {rag.name}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => toggleRag(id)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Protocol Toggles */}
            <div className="space-y-4 pt-2 border-t">
              <Label className="text-sm font-semibold text-gray-900">
                Workflow Protocols
              </Label>
              
              {/* Human in the Loop */}
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Human in the Loop (HITL)</p>
                      <p className="text-xs text-blue-700">Requires human approval before execution</p>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={humanInLoop}
                  onCheckedChange={setHumanInLoop}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* PHARMA Protocol */}
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">PHARMA Protocol</p>
                      <p className="text-xs text-green-700">Pharmaceutical compliance validation</p>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={pharmaProtocol}
                  onCheckedChange={setPharmaProtocol}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* VERIFY Protocol */}
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-purple-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">VERIFY Protocol</p>
                      <p className="text-xs text-purple-700">Output verification and validation</p>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={verifyProtocol}
                  onCheckedChange={setVerifyProtocol}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>

            {/* Prompt Library Integration */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                Prompt Library (PROMPTS™)
              </Label>
              <p className="text-xs text-gray-500">
                Select from our curated prompt templates to help structure your task instructions
              </p>
              
              {/* Prompt Suite Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Suite</Label>
                <Select value={selectedPromptSuite || undefined} onValueChange={handleSuiteChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a PROMPTS™ suite..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePromptSuites.map((suite) => (
                      <SelectItem key={suite.id} value={suite.id}>
                        {suite.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Subsuite Selection */}
              {selectedPromptSuite && availableSubsuites.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Sub-Suite</Label>
                  <Select value={selectedPromptSubsuite || undefined} onValueChange={handleSubsuiteChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a sub-suite..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubsuites.map((subsuite) => (
                        <SelectItem key={subsuite.id} value={subsuite.id}>
                          {subsuite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Prompt Template Selection */}
              {availablePrompts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Prompt Template ({availablePrompts.length} available)</Label>
                  <Select value={selectedPromptTemplate || undefined} onValueChange={setSelectedPromptTemplate}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          {prompt.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPromptTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleApplyPromptTemplate}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Apply Template to User Prompt
                    </Button>
                  )}
                </div>
              )}
              
              {/* Prompt Enhancer Button */}
              {userPrompt && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  onClick={handleEnhancePrompt}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance Prompt with AI
                </Button>
              )}
            </div>

            {/* User Prompt */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                User Prompt (Optional)
              </Label>
              <Textarea
                placeholder="Enter custom instructions or context for this task..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Provide additional context or instructions that will be used when executing this task
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

InteractiveTaskNode.displayName = 'InteractiveTaskNode';


'use client';

import { 
  Sparkles, 
  Search, 
  Copy, 
  Wand2, 
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Brain
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Textarea } from '@vital/ui';

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  complexity_level: string;
  system_prompt: string;
  user_prompt_template: string;
  prompt_starter: string;
  suite?: string;
  tags?: string[];
  target_users?: string[];
  use_cases?: string[];
  estimated_tokens?: number;
}

interface PromptEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (enhancedPrompt: string) => void;
  currentInput?: string;
  mode?: 'light' | 'advanced';
}

const DOMAINS = [
  'regulatory_affairs',
  'clinical_research',
  'market_access',
  'digital_health',
  'data_analytics',
  'medical_writing',
  'pharmacovigilance',
  'clinical_validation',
  'project_management',
  'commercial',
  'medical_affairs'
];

const PRISM_SUITES = [
  'RULES™',
  'TRIALS™',
  'GUARD™',
  'VALUE™',
  'BRIDGE™',
  'PROOF™',
  'CRAFT™',
  'SCOUT™',
  'PROJECT™'
];

export function PromptEnhancementModal({ 
  isOpen, 
  onClose, 
  onApplyPrompt, 
  currentInput = '',
  mode = 'light' 
}: PromptEnhancementModalProps) {
  const isAdvanced = mode === 'advanced';
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [suiteFilter, setSuiteFilter] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load prompts
  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(domainFilter !== 'all' && { domain: domainFilter }),
        ...(suiteFilter !== 'all' && { suite: suiteFilter })
      });

      const response = await fetch(`/api/prompts-crud?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load prompts');
      }

      setPrompts(data.prompts || []);
      setFilteredPrompts(data.prompts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-enhance current input
  const autoEnhancePrompt = async () => {
    if (!currentInput.trim()) return;

    setIsGenerating(true);
    try {
      // Simple enhancement logic - in a real implementation, this would use AI
      const enhanced = `Enhanced: ${currentInput}

Please provide a comprehensive response that includes:
- Detailed analysis
- Specific recommendations
- Implementation steps
- Best practices
- Risk considerations

Context: Healthcare professional seeking expert guidance.`;
      
      setEnhancedPrompt(enhanced);
      setActiveTab('enhance');
    } catch (err) {
      setError('Failed to enhance prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply selected prompt template
  const applyPromptTemplate = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    
    // Extract variables from the template
    const variables = prompt.user_prompt_template.match(/\{([^}]+)\}/g) || [];
    
    if (variables.length > 0) {
      // Create a form for variable input
      let template = prompt.user_prompt_template;
      variables.forEach(variable => {
        const varName = variable.slice(1, -1);
        template = template.replace(variable, `[${varName}]`);
      });
      setEnhancedPrompt(template);
    } else {
      setEnhancedPrompt(prompt.user_prompt_template);
    }
    
    setActiveTab('enhance');
  };

  // Apply enhanced prompt
  const handleApplyPrompt = () => {
    onApplyPrompt(enhancedPrompt);
    onClose();
  };

  // Load prompts on mount and when filters change
  useEffect(() => {
    if (isOpen) {
      loadPrompts();
      if (currentInput.trim()) {
        autoEnhancePrompt();
      }
    }
  }, [isOpen, searchTerm, domainFilter, suiteFilter]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Prompt Enhancement Library
          </DialogTitle>
          <DialogDescription>
            Enhance your prompts using our PROMPTS library or create custom enhancements
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isAdvanced ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Browse Library
            </TabsTrigger>
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Enhance Prompt
            </TabsTrigger>
            {isAdvanced && (
              <TabsTrigger value="auto" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-Enhance
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Domain</label>
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {DOMAINS.map((domain: any) => (
                      <SelectItem key={domain} value={domain}>
                        {domain.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">PRISM Suite</label>
                <Select value={suiteFilter} onValueChange={setSuiteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Suites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suites</SelectItem>
                    {PRISM_SUITES.map(suite => (
                      <SelectItem key={suite} value={suite}>
                        {suite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prompts Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading prompts...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => applyPromptTemplate(prompt)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {prompt.display_name}
                        </CardTitle>
                        {prompt.suite && (
                          <Badge variant="default" className="ml-2 text-xs">
                            {prompt.suite}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs line-clamp-2">
                        {prompt.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {prompt.domain.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {prompt.complexity_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.prompt_starter}
                        </p>
                        <Button size="sm" className="w-full">
                          <Copy className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enhance" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Original Input</label>
                <Textarea
                  value={currentInput}
                  readOnly
                  className="min-h-[100px] bg-muted"
                  placeholder="Your original prompt will appear here..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Enhanced Prompt</label>
                <Textarea
                  value={enhancedPrompt}
                  onChange={(e) => setEnhancedPrompt(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Enhanced prompt will appear here..."
                />
              </div>

              {selectedPrompt && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Using Template: {selectedPrompt.display_name}</h4>
                  <p className="text-sm text-blue-700 mb-2">{selectedPrompt.description}</p>
                  <div className="text-xs text-blue-600">
                    <strong>Template:</strong> {selectedPrompt.user_prompt_template}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleApplyPrompt} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Enhanced Prompt
                </Button>
                <Button variant="outline" onClick={() => setEnhancedPrompt('')}>
                  Clear
                </Button>
              </div>
            </div>
          </TabsContent>

          {isAdvanced && (
            <TabsContent value="auto" className="space-y-4">
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Prompt Enhancement</h3>
                <p className="text-muted-foreground mb-6">
                  Let our AI analyze your prompt and suggest improvements based on best practices
                </p>
                
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="p-4 bg-muted rounded-lg text-left">
                    <h4 className="font-medium mb-2">Current Input:</h4>
                    <p className="text-sm text-muted-foreground">{currentInput || 'No input provided'}</p>
                  </div>

                  <Button 
                    onClick={autoEnhancePrompt} 
                    disabled={isGenerating || !currentInput.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Auto-Enhance Prompt
                      </>
                    )}
                  </Button>

                  {enhancedPrompt && (
                    <div className="p-4 bg-green-50 rounded-lg text-left">
                      <h4 className="font-medium text-green-900 mb-2">Enhanced Version:</h4>
                      <p className="text-sm text-green-700">{enhancedPrompt}</p>
                      <Button 
                        size="sm" 
                        onClick={handleApplyPrompt}
                        className="mt-2"
                      >
                        Apply This Enhancement
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {enhancedPrompt && (
            <Button onClick={handleApplyPrompt}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Enhanced Prompt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PromptEnhancementModal;

// Convenience wrappers
export function PromptEnhancementModalLight(props: Omit<PromptEnhancementModalProps, 'mode'>) {
  return <PromptEnhancementModal {...props} mode="light" />;
}

export function PromptEnhancementModalAdvanced(props: Omit<PromptEnhancementModalProps, 'mode'>) {
  return <PromptEnhancementModal {...props} mode="advanced" />;
}

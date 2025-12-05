import { Save, Copy, Eye, EyeOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { useToast } from '@vital/ui';

interface Prompt {
  id?: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  system_prompt: string;
  user_prompt_template: string;
  acronym?: string;
  suite?: string;
  is_user_created?: boolean;
}

interface PromptEditorProps {
  prompt?: Prompt;
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
  mode: 'create' | 'edit' | 'copy';
}

  { value: 'medical_affairs', label: 'Medical Affairs' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'patient_advocacy', label: 'Patient Advocacy' },
  { value: 'general', label: 'General' }
];

  medical_affairs: `You are a medical affairs professional with expertise in {therapeutic_area}. Your role is to provide evidence-based insights and support clinical decision-making.

Context:
{context}

Task:
{task}

Please provide a comprehensive response that includes:
1. Clinical evidence review
2. Risk-benefit assessment
3. Regulatory considerations
4. Recommendations`,

  commercial: `You are a commercial strategy expert specializing in {market_segment}. Your role is to develop data-driven strategies that drive business growth while maintaining compliance.

Context:
{context}

Objective:
{objective}

Please provide:
1. Market analysis
2. Strategic recommendations
3. Implementation plan
4. Success metrics`,

  compliance: `You are a compliance expert with deep knowledge of healthcare regulations. Your role is to ensure adherence to regulatory requirements and identify potential risks.

Context:
{context}

Compliance Scope:
{scope}

Please provide:
1. Regulatory assessment
2. Risk analysis
3. Mitigation strategies
4. Monitoring plan`
};

export default function PromptEditor({ prompt, isOpen, onClose, onSave, mode }: PromptEditorProps) {
  const [formData, setFormData] = useState<Prompt>({
    name: '',
    display_name: '',
    description: '',
    domain: 'general',
    system_prompt: '',
    user_prompt_template: '',
    is_user_created: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({ /* TODO: implement */ });
  const { toast } = useToast();

  useEffect(() => {
    if (prompt && isOpen) {
      if (mode === 'copy') {
        setFormData({
          ...prompt,
          id: undefined,
          name: `${prompt.name} (Copy)`,
          display_name: `${prompt.display_name} (Copy)`,
          is_user_created: true
        });
      } else {
        setFormData(prompt);
      }
    } else if (mode === 'create' && isOpen) {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        domain: 'general',
        system_prompt: '',
        user_prompt_template: '',
        is_user_created: true
      });
    }
  }, [prompt, isOpen, mode]);

    const newErrors: Record<string, string> = { /* TODO: implement */ };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.system_prompt.trim()) {
      newErrors.system_prompt = 'System prompt is required';
    }
    if (!formData.user_prompt_template.trim()) {
      newErrors.user_prompt_template = 'User prompt template is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: "Success",
      description: `Prompt ${mode === 'create' ? 'created' : 'updated'} successfully`,
    });
    onClose();
  };

    setFormData(prev => ({
      ...prev,
      domain,
      user_prompt_template: PROMPT_TEMPLATES[domain as keyof typeof PROMPT_TEMPLATES] || prev.user_prompt_template
    }));
  };

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

    switch (mode) {
      case 'create': return 'Create New Prompt';
      case 'edit': return 'Edit Prompt';
      case 'copy': return 'Copy Prompt';
      default: return 'Prompt Editor';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {getTitle()}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Preview'}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && "Create a custom prompt for your specific needs"}
            {mode === 'edit' && "Modify this prompt to better suit your requirements"}
            {mode === 'copy' && "Create a copy of this prompt with your modifications"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            {showPreview && <TabsTrigger value="preview">Preview</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Internal prompt name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="User-friendly display name"
                  className={errors.display_name ? 'border-red-500' : ''}
                />
                {errors.display_name && <p className="text-sm text-red-500">{errors.display_name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this prompt does"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select value={formData.domain} onValueChange={handleDomainChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((domain: any) => (
                    <SelectItem key={domain.value} value={domain.value}>
                      {domain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.acronym && (
              <div className="space-y-2">
                <Label>Acronym</Label>
                <Badge variant="outline" className="w-fit">
                  {formData.acronym}
                </Badge>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="system_prompt">System Prompt *</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.system_prompt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                  placeholder="Enter the system prompt that defines the AI's role and behavior..."
                  rows={8}
                  className={`font-mono text-sm ${errors.system_prompt ? 'border-red-500' : ''}`}
                />
                {errors.system_prompt && <p className="text-sm text-red-500">{errors.system_prompt}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user_prompt_template">User Prompt Template *</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formData.user_prompt_template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="user_prompt_template"
                  value={formData.user_prompt_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_prompt_template: e.target.value }))}
                  placeholder="Enter the user prompt template with variables like {variable_name}..."
                  rows={12}
                  className={`font-mono text-sm ${errors.user_prompt_template ? 'border-red-500' : ''}`}
                />
                {errors.user_prompt_template && <p className="text-sm text-red-500">{errors.user_prompt_template}</p>}
                <p className="text-xs text-neutral-500">
                  Use {"{variable_name}"} for dynamic content that users can customize
                </p>
              </div>
            </div>
          </TabsContent>

          {showPreview && (
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-neutral-50">
                <h3 className="font-medium mb-2">System Prompt Preview</h3>
                <div className="bg-white border rounded p-3 font-mono text-sm whitespace-pre-wrap">
                  {formData.system_prompt || 'No system prompt entered...'}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-neutral-50">
                <h3 className="font-medium mb-2">User Prompt Template Preview</h3>
                <div className="bg-white border rounded p-3 font-mono text-sm whitespace-pre-wrap">
                  {formData.user_prompt_template || 'No user prompt template entered...'}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium mb-2">Variables Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {(formData.user_prompt_template.match(/{[^}]+}/g) || []).map((variable, index) => (
                    <Badge key={index} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                  {!(formData.user_prompt_template.match(/{[^}]+}/g) || []).length && (
                    <p className="text-sm text-neutral-500">No variables found</p>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {formData.is_user_created && (
              <Badge variant="secondary">Custom Prompt</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create' : 'Save'} Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
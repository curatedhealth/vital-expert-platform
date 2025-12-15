/**
 * Create RAG Modal Component
 * Modal for creating new global or agent-specific RAG knowledge bases
 */

'use client';

import { X, Plus, Database, Brain } from 'lucide-react';
import React, { useState } from 'react';

import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Badge , Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/lib/shared/components/ui';

import type { RagKnowledgeBase } from './types';

interface CreateRagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRagCreated: (rag: RagKnowledgeBase) => void;
  ragType: 'global' | 'agent_specific';
  agentId?: string;
  agentName?: string;
}

const KNOWLEDGE_DOMAINS = [
  'regulatory',
  'clinical_trials',
  'pharmacovigilance',
  'medical_devices',
  'fda_guidance',
  'ema_guidance',
  'ich_guidelines',
  'drug_development',
  'biostatistics',
  'clinical_data',
  'safety_reporting',
  'quality_assurance',
  'manufacturing',
  'labeling',
  'post_market_surveillance',
  'risk_management',
  'pharmacology',
  'toxicology',
  'biomarkers',
  'companion_diagnostics'
];

const EMBEDDING_MODELS = [
  { value: 'text-embedding-ada-002', label: 'OpenAI Ada-002 (Recommended)' },
  { value: 'text-embedding-3-small', label: 'OpenAI Embedding v3 Small' },
  { value: 'text-embedding-3-large', label: 'OpenAI Embedding v3 Large' },
  { value: 'sentence-transformers', label: 'Sentence Transformers' },
  { value: 'custom', label: 'Custom Model' }
];

const ACCESS_LEVELS = [
  { value: 'public', label: 'Public - Available to all users' },
  { value: 'organization', label: 'Organization - Available to organization members' },
  { value: 'private', label: 'Private - Restricted access' }
];

export const CreateRagModal: React.FC<CreateRagModalProps> = ({
  isOpen,
  onClose,
  onRagCreated,
  ragType,
  agentId,
  agentName
}) => {
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    purpose_description: '',
    embedding_model: 'text-embedding-ada-002',
    chunk_size: 1000,
    chunk_overlap: 200,
    similarity_threshold: 0.7,
    access_level: 'organization',
    knowledge_domains: [] as string[],
    contains_phi: false,
    hipaa_compliant: true,
    is_public: false
  });

  const [customDomain, setCustomDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      knowledge_domains: prev.knowledge_domains.includes(domain)
        ? prev.knowledge_domains.filter((d: any) => d !== domain)
        : [...prev.knowledge_domains, domain]
    }));
  };

  const handleAddCustomDomain = () => {
    if (customDomain.trim() && !formData.knowledge_domains.includes(customDomain.trim())) {
      setFormData(prev => ({
        ...prev,
        knowledge_domains: [...prev.knowledge_domains, customDomain.trim()]
      }));
      setCustomDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      knowledge_domains: prev.knowledge_domains.filter((d: any) => d !== domain)
    }));
  };

  const generateRagName = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.display_name.trim() || !formData.description.trim() || !formData.purpose_description.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      if (formData.knowledge_domains.length === 0) {
        alert('Please select at least one knowledge domain');
        return;
      }

      // Create RAG knowledge base
      const newRag: RagKnowledgeBase = {
        id: `rag_${Date.now()}`,
        name: generateRagName(formData.display_name),
        display_name: formData.display_name,
        description: formData.description,
        purpose_description: formData.purpose_description,
        rag_type: ragType,
        knowledge_domains: formData.knowledge_domains,
        document_count: 0,
        total_chunks: 0,
        quality_score: 0
      };

      // // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      onRagCreated(newRag);

      // Reset form
      setFormData({
        display_name: '',
        description: '',
        purpose_description: '',
        embedding_model: 'text-embedding-ada-002',
        chunk_size: 1000,
        chunk_overlap: 200,
        similarity_threshold: 0.7,
        access_level: 'organization',
        knowledge_domains: [],
        contains_phi: false,
        hipaa_compliant: true,
        is_public: false
      });

    } catch (error) {
      // console.error('❌ Failed to create RAG:', error);
      alert('Failed to create RAG knowledge base. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ragType === 'global' ? (
              <Database className="h-5 w-5" />
            ) : (
              <Brain className="h-5 w-5" />
            )}
            Create {ragType === 'global' ? 'Global' : 'Agent-Specific'} RAG Knowledge Base
            {ragType === 'agent_specific' && agentName && (
              <Badge variant="outline">for {agentName}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                placeholder="e.g., FDA Regulatory Guidelines"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_level">Access Level</Label>
              <Select
                value={formData.access_level}
                onValueChange={(value) => handleInputChange('access_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this RAG knowledge base contains..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose_description">Usage Purpose *</Label>
            <Textarea
              id="purpose_description"
              placeholder="Explain when and how this RAG should be used by agents..."
              value={formData.purpose_description}
              onChange={(e) => handleInputChange('purpose_description', e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              This description helps agents understand when to use this knowledge base.
            </p>
          </div>

          {/* Knowledge Domains */}
          <div className="space-y-3">
            <Label>Knowledge Domains *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {(KNOWLEDGE_DOMAINS || []).map((domain: any) => (
                <div key={domain} className="flex items-center space-x-2">
                  <Checkbox
                    id={domain}
                    checked={formData.knowledge_domains.includes(domain)}
                    onCheckedChange={() => handleToggleDomain(domain)}
                  />
                  <Label htmlFor={domain} className="text-sm">
                    {domain.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>

            {/* Custom Domain */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom domain..."
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomDomain()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomDomain}
                disabled={!customDomain.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Domains */}
            {formData.knowledge_domains.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.knowledge_domains.map((domain: any) => (
                  <Badge key={domain} variant="secondary" className="text-xs">
                    {domain.replace('_', ' ')}
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Technical Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embedding_model">Embedding Model</Label>
              <Select
                value={formData.embedding_model}
                onValueChange={(value) => handleInputChange('embedding_model', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMBEDDING_MODELS.map((model: any) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="similarity_threshold">Similarity Threshold</Label>
              <Input
                id="similarity_threshold"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.similarity_threshold}
                onChange={(e) => handleInputChange('similarity_threshold', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chunk_size">Chunk Size (tokens)</Label>
              <Input
                id="chunk_size"
                type="number"
                min="100"
                max="4000"
                value={formData.chunk_size}
                onChange={(e) => handleInputChange('chunk_size', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chunk_overlap">Chunk Overlap (tokens)</Label>
              <Input
                id="chunk_overlap"
                type="number"
                min="0"
                max="1000"
                value={formData.chunk_overlap}
                onChange={(e) => handleInputChange('chunk_overlap', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Compliance Settings */}
          <div className="space-y-3">
            <Label>Compliance & Security</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hipaa_compliant"
                  checked={formData.hipaa_compliant}
                  onCheckedChange={(checked) => handleInputChange('hipaa_compliant', checked)}
                />
                <Label htmlFor="hipaa_compliant">HIPAA Compliant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contains_phi"
                  checked={formData.contains_phi}
                  onCheckedChange={(checked) => handleInputChange('contains_phi', checked)}
                />
                <Label htmlFor="contains_phi">Contains PHI (Protected Health Information)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                />
                <Label htmlFor="is_public">Make publicly available</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : `Create ${ragType === 'global' ? 'Global' : 'Agent'} RAG`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
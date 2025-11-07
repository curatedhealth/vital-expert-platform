'use client';

import React, { useState } from 'react';
import { Plus, FolderPlus, X, Check } from 'lucide-react';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Label } from '@vital/ui';
import { Input } from '@vital/ui';
import { Textarea } from '@vital/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@vital/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@vital/ui';
import { ScrollArea } from '@vital/ui';
import { Checkbox } from '@vital/ui';
import { createClient } from '@vital/sdk/client';

interface KnowledgeDomain {
  domain_id: string;
  domain_name: string;
  slug?: string;
  tier?: number;
  domain_scope?: string;
  is_active?: boolean;
}

interface DomainMultiSelectProps {
  domains: KnowledgeDomain[];
  selectedDomains: string[];
  onDomainsChange: (domains: string[]) => void;
  onDomainCreated: (domain: KnowledgeDomain) => void;
  filteredDomains?: KnowledgeDomain[];
}

export function DomainMultiSelect({
  domains,
  selectedDomains,
  onDomainsChange,
  onDomainCreated,
  filteredDomains,
}: DomainMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [newDomainDescription, setNewDomainDescription] = useState('');
  const [newDomainSlug, setNewDomainSlug] = useState('');
  const [newDomainTier, setNewDomainTier] = useState('1');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const supabase = createClient();
  const displayDomains = filteredDomains || domains;

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      onDomainsChange(selectedDomains.filter(id => id !== domainId));
    } else {
      onDomainsChange([...selectedDomains, domainId]);
    }
  };

  const handleCreateDomain = async () => {
    if (!newDomainName.trim()) {
      setCreateError('Domain name is required');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      // Generate slug if not provided
      const slug = newDomainSlug.trim() || 
        newDomainName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Create domain in knowledge_domains_new table
      const { data, error } = await supabase
        .from('knowledge_domains_new')
        .insert({
          domain_name: newDomainName.trim(),
          slug,
          description: newDomainDescription.trim() || null,
          tier: parseInt(newDomainTier),
          domain_scope: 'user', // Default to user scope
          access_policy: 'personal_draft', // Default to personal
          maturity_level: 'Draft',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Success!
        const newDomain: KnowledgeDomain = {
          domain_id: data.domain_id,
          domain_name: data.domain_name,
          slug: data.slug,
          tier: data.tier,
          domain_scope: data.domain_scope,
          is_active: data.is_active,
        };

        onDomainCreated(newDomain);
        
        // Automatically select the newly created domain
        onDomainsChange([...selectedDomains, data.domain_id]);

        // Reset form
        setNewDomainName('');
        setNewDomainDescription('');
        setNewDomainSlug('');
        setNewDomainTier('1');
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating domain:', error);
      setCreateError(
        error instanceof Error 
          ? error.message 
          : 'Failed to create domain. Please try again.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const getSelectedDomainsText = () => {
    if (selectedDomains.length === 0) return 'Select domains...';
    if (selectedDomains.length === 1) {
      const domain = domains.find(d => d.domain_id === selectedDomains[0]);
      return domain?.domain_name || 'Unknown domain';
    }
    return `${selectedDomains.length} domains selected`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              {getSelectedDomainsText()}
              <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm">Select Knowledge Domains</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Choose one or more domains for your document
              </p>
            </div>

            <ScrollArea className="h-[300px] px-3 py-2">
              <div className="space-y-1">
                {displayDomains.map((domain) => {
                  const isSelected = selectedDomains.includes(domain.domain_id);
                  return (
                    <div
                      key={domain.domain_id}
                      className="flex items-center space-x-2 rounded-sm px-2 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => toggleDomain(domain.domain_id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDomain(domain.domain_id)}
                      />
                      <Label className="flex-1 cursor-pointer text-sm">
                        {domain.domain_name}
                      </Label>
                      {domain.tier && (
                        <Badge variant="outline" className="text-xs">
                          T{domain.tier}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Create New Domain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Knowledge Domain</DialogTitle>
                    <DialogDescription>
                      Add a new domain to organize your knowledge base
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain-name">Domain Name *</Label>
                      <Input
                        id="domain-name"
                        placeholder="e.g., Digital Health, Clinical Research"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain-slug">
                        Slug (optional)
                        <span className="text-xs text-muted-foreground ml-2">
                          Auto-generated if left empty
                        </span>
                      </Label>
                      <Input
                        id="domain-slug"
                        placeholder="e.g., digital-health"
                        value={newDomainSlug}
                        onChange={(e) => setNewDomainSlug(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain-description">Description</Label>
                      <Textarea
                        id="domain-description"
                        placeholder="Brief description of this knowledge domain"
                        value={newDomainDescription}
                        onChange={(e) => setNewDomainDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain-tier">Domain Tier</Label>
                      <select
                        id="domain-tier"
                        value={newDomainTier}
                        onChange={(e) => setNewDomainTier(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="1">Tier 1: Core (Essential knowledge)</option>
                        <option value="2">Tier 2: Specialized (Domain-specific)</option>
                        <option value="3">Tier 3: Emerging (Experimental)</option>
                      </select>
                    </div>

                    {createError && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                        {createError}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateDomain}
                      disabled={createLoading || !newDomainName.trim()}
                    >
                      {createLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Create Domain
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected domains display */}
      {selectedDomains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDomains.map((domainId) => {
            const domain = domains.find(d => d.domain_id === domainId);
            if (!domain) return null;
            
            return (
              <Badge
                key={domainId}
                variant="secondary"
                className="px-2 py-1"
              >
                {domain.domain_name}
                <button
                  onClick={() => toggleDomain(domainId)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}


/**
 * Refactored Domain Details Dialog
 * Displays domain information with view/edit modes
 * Separated into smaller, maintainable components
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Import our new modular components
import { DomainBasicInfo } from './DomainBasicInfo';
import { DomainModelConfig } from './DomainModelConfig';
import { DomainMetadata } from './DomainMetadata';
import { DomainEditForm } from './DomainEditForm';

interface DomainDetailsDialogProps {
  domain: any;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function DomainDetailsDialog({
  domain,
  onClose,
  onUpdate,
  onDelete,
}: DomainDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const domainId = domain.domain_id || domain.id;
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    name: domain.domain_name || domain.name,
    description: domain.domain_description_llm || domain.description || '',
    tier: domain.tier,
    priority: domain.priority,
    keywords: Array.isArray(domain.keywords) ? domain.keywords.join(', ') : '',
    sub_domains: Array.isArray(domain.sub_domains) ? domain.sub_domains.join(', ') : '',
    color: domain.color || '#3B82F6',
    embedding_model: domain.embedding_model || domain.recommended_models?.embedding?.primary || 'text-embedding-3-large',
    chat_model: domain.recommended_models?.chat?.primary || 'gpt-4-turbo-preview',
  });

  // Handle form data updates
  const handleFormChange = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Handle update
  const handleUpdate = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/knowledge-domains/${domainId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tier: formData.tier,
          priority: formData.priority,
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
          sub_domains: formData.sub_domains.split(',').map((s) => s.trim()).filter(Boolean),
          color: formData.color,
          embedding_model: formData.embedding_model,
          chat_model: formData.chat_model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update domain');
      }

      toast.success('Domain updated successfully');
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating domain:', error);
      toast.error('Failed to update domain');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/knowledge-domains/${domainId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete domain');
      }

      toast.success('Domain deleted successfully');
      onClose();
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Failed to delete domain');
    } finally {
      setDeleting(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      name: domain.domain_name || domain.name,
      description: domain.domain_description_llm || domain.description || '',
      tier: domain.tier,
      priority: domain.priority,
      keywords: Array.isArray(domain.keywords) ? domain.keywords.join(', ') : '',
      sub_domains: Array.isArray(domain.sub_domains) ? domain.sub_domains.join(', ') : '',
      color: domain.color || '#3B82F6',
      embedding_model: domain.embedding_model || domain.recommended_models?.embedding?.primary || 'text-embedding-3-large',
      chat_model: domain.recommended_models?.chat?.primary || 'gpt-4-turbo-preview',
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Domain' : (domain.domain_name || domain.name)}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update domain settings and tier mapping' 
              : (domain.domain_description_llm || domain.description || '')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info - Always show */}
          <DomainBasicInfo domain={domain} />

          {/* Edit Mode */}
          {isEditing ? (
            <DomainEditForm 
              formData={formData} 
              onChange={handleFormChange}
            />
          ) : (
            /* View Mode */
            <>
              <DomainModelConfig domain={domain} />
              <DomainMetadata domain={domain} />
            </>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            /* Edit Mode Buttons */
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdate} 
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            /* View Mode Buttons */
            <>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button 
                type="button" 
                variant="default" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


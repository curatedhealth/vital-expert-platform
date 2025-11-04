/**
 * Domain Edit Form Component
 * Form fields for editing domain properties
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DomainEditFormProps {
  formData: any;
  onChange: (updates: Partial<any>) => void;
}

export function DomainEditForm({ formData, onChange }: DomainEditFormProps) {
  return (
    <div className="space-y-4">
      {/* Tier Mapping */}
      <div>
        <Label htmlFor="tier">Tier *</Label>
        <Select
          value={formData.tier.toString()}
          onValueChange={(value) => onChange({ tier: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Tier 1: Core</SelectItem>
            <SelectItem value="2">Tier 2: Standard</SelectItem>
            <SelectItem value="3">Tier 3: Extended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div>
        <Label htmlFor="priority">Priority *</Label>
        <Select
          value={formData.priority.toString()}
          onValueChange={(value) => onChange({ priority: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Critical</SelectItem>
            <SelectItem value="2">2 - High</SelectItem>
            <SelectItem value="3">3 - Medium</SelectItem>
            <SelectItem value="4">4 - Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Domain name"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Domain description"
          rows={3}
        />
      </div>

      {/* Keywords */}
      <div>
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          value={formData.keywords}
          onChange={(e) => onChange({ keywords: e.target.value })}
          placeholder="e.g., fda, ema, regulatory"
        />
      </div>

      {/* Sub-domains */}
      <div>
        <Label htmlFor="sub_domains">Sub-domains (comma-separated)</Label>
        <Input
          id="sub_domains"
          value={formData.sub_domains}
          onChange={(e) => onChange({ sub_domains: e.target.value })}
          placeholder="e.g., submissions, inspections"
        />
      </div>

      {/* Color */}
      <div>
        <Label htmlFor="color">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            value={formData.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="flex-1"
            placeholder="#3B82F6"
          />
        </div>
      </div>

      {/* Embedding Model */}
      <div>
        <Label htmlFor="embedding_model">Embedding Model</Label>
        <Input
          id="embedding_model"
          value={formData.embedding_model}
          onChange={(e) => onChange({ embedding_model: e.target.value })}
          placeholder="text-embedding-3-large"
        />
      </div>

      {/* Chat Model */}
      <div>
        <Label htmlFor="chat_model">Chat Model</Label>
        <Input
          id="chat_model"
          value={formData.chat_model}
          onChange={(e) => onChange({ chat_model: e.target.value })}
          placeholder="gpt-4-turbo-preview"
        />
      </div>
    </div>
  );
}


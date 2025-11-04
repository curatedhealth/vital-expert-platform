import { Plus, Sparkles, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { AgentAvatar } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

import type { AgentFormData } from './types';

interface BasicTabProps {
  formData: AgentFormData;
  promptViewMode: 'edit' | 'preview';
  setFormData: React.Dispatch<React.SetStateAction<AgentFormData>>;
  setPromptViewMode: (mode: 'edit' | 'preview') => void;
  setShowIconModal: (show: boolean) => void;
  autoAssignAvatar: () => Promise<string>;
}

export function BasicTab({
  formData,
  promptViewMode,
  setFormData,
  setPromptViewMode,
  setShowIconModal,
  autoAssignAvatar,
}: BasicTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Agent Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Medical Writer"
              required
            />
          </div>
          <div>
            <Label htmlFor="avatar">Avatar</Label>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-200 rounded-lg bg-gray-50">
                <AgentAvatar avatar={formData.avatar} name="Selected Avatar" size="lg" />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIconModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Choose Icon
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    const newAvatar = await autoAssignAvatar();
                    setFormData((prev) => ({ ...prev, avatar: newAvatar }));
                  }}
                  className="flex items-center gap-2 text-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto-Assign
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Classification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <Label htmlFor="tier">Tier *</Label>
            <select
              id="tier"
              value={formData.tier}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tier: parseInt(e.target.value) as 1 | 2 | 3 }))
              }
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
            >
              <option value={1}>Tier 1 - Foundational</option>
              <option value={2}>Tier 2 - Specialist</option>
              <option value={3}>Tier 3 - Ultra-Specialist</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.tier === 1 && 'General purpose, broad knowledge'}
              {formData.tier === 2 && 'Domain-specific expertise'}
              {formData.tier === 3 && 'Highly specialized, niche expertise'}
            </p>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value as typeof formData.status }))
              }
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-market-purple"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="testing">Testing</option>
              <option value="development">Development</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.status === 'active' && 'Ready for production use'}
              {formData.status === 'inactive' && 'Not currently available'}
              {formData.status === 'testing' && 'Under quality assurance'}
              {formData.status === 'development' && 'Still being built'}
              {formData.status === 'deprecated' && 'No longer supported'}
            </p>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))
              }
              placeholder="1-10"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Display priority (1-10, higher = more prominent)
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the agent's expertise"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="systemPrompt">System Prompt *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPromptViewMode('preview')}
                className={cn(
                  'h-8 px-3 text-xs',
                  promptViewMode === 'preview' && 'bg-progress-teal/10 text-progress-teal'
                )}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPromptViewMode('edit')}
                className={cn(
                  'h-8 px-3 text-xs',
                  promptViewMode === 'edit' && 'bg-progress-teal/10 text-progress-teal'
                )}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          {promptViewMode === 'edit' ? (
            <textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Define the agent's role, expertise, and behavior..."
              className="w-full min-h-[400px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-market-purple font-mono text-sm"
              required
            />
          ) : (
            <div className="w-full min-h-[400px] max-h-[600px] overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-code:text-progress-teal prose-code:bg-progress-teal/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <ReactMarkdown>{formData.systemPrompt || '*No system prompt defined*'}</ReactMarkdown>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


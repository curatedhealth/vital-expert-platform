/**
 * Identity Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles basic agent identity configuration:
 * - Name, version, tagline, description
 * - Avatar selection with picker modal
 * - Status dropdown
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Sparkles, X } from 'lucide-react';
import type { EditFormTabProps, AvatarOption } from './types';
import { AgentStatus } from '../../types/agent.types';

// ============================================================================
// IDENTITY TAB COMPONENT
// ============================================================================

interface IdentityTabProps extends EditFormTabProps {
  /** Avatar options loaded from database */
  avatars: AvatarOption[];
}

export function IdentityTab({
  formState,
  updateField,
  avatars,
}: IdentityTabProps) {
  // Local state for avatar picker modal
  const [avatarPickerOpen, setAvatarPickerOpen] = React.useState(false);
  const [avatarFilter, setAvatarFilter] = React.useState('');

  // Filter avatars based on search term
  const filteredAvatars = React.useMemo(() => {
    if (!avatarFilter) return avatars;
    const searchLower = avatarFilter.toLowerCase();
    return avatars.filter(
      (a) =>
        a.persona_type?.toLowerCase().includes(searchLower) ||
        a.business_function?.toLowerCase().includes(searchLower) ||
        a.display_name?.toLowerCase().includes(searchLower)
    );
  }, [avatars, avatarFilter]);

  return (
    <div className="grid gap-4">
      {/* Name and Version Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Agent Name (ID)</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="unique-agent-name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={formState.version}
            onChange={(e) => updateField('version', e.target.value)}
            placeholder="1.0"
          />
        </div>
      </div>

      {/* Tagline */}
      <div className="grid gap-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={formState.tagline}
          onChange={(e) => updateField('tagline', e.target.value)}
          placeholder="Brief one-liner describing the agent's purpose"
        />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formState.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Detailed agent description"
          rows={4}
        />
      </div>

      {/* Avatar Picker Section */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                {formState.avatar_url ? (
                  <img
                    src={formState.avatar_url}
                    alt="Agent Avatar"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg';
                    }}
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Avatar Selection Buttons */}
            <div className="flex-1 space-y-2">
              <Label>Agent Avatar</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarPickerOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Choose Avatar
                </Button>
                {formState.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateField('avatar_url', '')}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formState.avatar_url
                  ? formState.avatar_url.split('/').pop()
                  : 'No avatar selected'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Picker Modal */}
      <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Select Agent Avatar
            </DialogTitle>
            <DialogDescription>
              Choose from {avatars.length || 100} VITAL avatars organized by persona type
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search avatars..."
              value={avatarFilter}
              onChange={(e) => setAvatarFilter(e.target.value)}
              className="flex-1"
            />
            <Select
              value={avatarFilter || 'all'}
              onValueChange={(value) => setAvatarFilter(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
                <SelectItem value="foresight">Foresight</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="pharma">Pharma</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Avatar Grid */}
          <ScrollArea className="h-[400px]">
            {avatars.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {filteredAvatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      updateField('avatar_url', avatar.public_url);
                      setAvatarPickerOpen(false);
                    }}
                    className={cn(
                      'p-2 rounded-lg border-2 hover:border-primary/50 transition-all',
                      formState.avatar_url === avatar.public_url
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    )}
                  >
                    <img
                      src={avatar.public_url}
                      alt={avatar.display_name || avatar.filename}
                      className="w-12 h-12 object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg';
                      }}
                    />
                    <p className="text-xs text-center truncate mt-1 text-muted-foreground">
                      {avatar.persona_type || 'Expert'}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <FallbackAvatarGrid
                formState={formState}
                updateField={updateField}
                onClose={() => setAvatarPickerOpen(false)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Manual Avatar URL and Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="avatar_url_manual">Avatar URL (Manual)</Label>
          <Input
            id="avatar_url_manual"
            value={formState.avatar_url}
            onChange={(e) => updateField('avatar_url', e.target.value)}
            placeholder="/assets/vital/avatars/..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formState.status}
            onValueChange={(value) => updateField('status', value as AgentStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AgentStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AgentStatus.DEVELOPMENT}>Development</SelectItem>
              <SelectItem value={AgentStatus.TESTING}>Testing</SelectItem>
              <SelectItem value={AgentStatus.DEPRECATED}>Deprecated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FALLBACK AVATAR GRID (when database avatars not loaded)
// ============================================================================

interface FallbackAvatarGridProps {
  formState: { avatar_url: string };
  updateField: (field: 'avatar_url', value: string) => void;
  onClose: () => void;
}

function FallbackAvatarGrid({ formState, updateField, onClose }: FallbackAvatarGridProps) {
  const avatarTypes = ['expert', 'foresight', 'medical', 'pharma', 'startup'];
  const avatarFunctions = [
    'analytics_insights',
    'commercial_marketing',
    'market_access',
    'medical_affairs',
    'product_innovation',
  ];
  const avatarNumbers = [1, 2, 3, 4];

  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>No avatars loaded from database.</p>
      <p className="text-sm mt-2">Using local avatar paths instead.</p>
      <div className="grid grid-cols-6 gap-2 mt-4">
        {avatarTypes.flatMap((type) =>
          avatarFunctions.flatMap((func) =>
            avatarNumbers.map((num) => {
              const path = `/assets/vital/avatars/vital_avatar_${type}_${func}_${String(num).padStart(2, '0')}.svg`;
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    updateField('avatar_url', path);
                    onClose();
                  }}
                  className={cn(
                    'p-2 rounded-lg border-2 hover:border-primary/50 transition-all',
                    formState.avatar_url === path
                      ? 'border-primary bg-primary/10'
                      : 'border-border'
                  )}
                >
                  <img
                    src={path}
                    alt={`${type} ${func} ${num}`}
                    className="w-12 h-12 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </button>
              );
            })
          )
        )}
      </div>
    </div>
  );
}

'use client';

import {
  ArrowLeft,
  X,
  Users,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/lib/shared/components/ui/avatar';
import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';
import { Input } from '@/lib/shared/components/ui/input';
import { Textarea } from '@/lib/shared/components/ui/textarea';
import { cn } from '@/lib/shared/utils';

import { __usePanelStore as usePanelStore } from '../services/panel-store';

interface PanelBuilderProps {
  templateId?: string | null;
  experts: unknown[];
  onPanelCreate: (panelConfig: unknown) => void;
  onBackToTemplates: () => void;
}

export function PanelBuilder({
  templateId,
  experts,
  onPanelCreate,
  onBackToTemplates
}: PanelBuilderProps) {
  const [panelName, setPanelName] = useState('');
  const [panelDescription, setPanelDescription] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<unknown[]>([]);

  const { templates } = usePanelStore();

  // Get template if templateId is provided
  const template = templateId ? templates.find((t: any) => t.id === templateId) : null;

  // Filter experts based on template recommendations
  const filteredExperts = template
    ? experts.filter((expert: any) =>
        template.recommendedMembers.businessFunctions.some((func: string) =>
          expert.businessFunction?.includes(func) ||
          expert.category?.includes(func)
        )
      )
    : experts;

  const handleToggleExpert = (expert: any) => {
    const isSelected = selectedExperts.some((e: any) => e.id === expert.id);

    setSelectedExperts(prev => {
      if (isSelected) {
        return prev.filter((e: any) => e.id !== expert.id);
      } else {
        return [...prev, expert];
      }
    });
  };

  const handleCreatePanel = () => {
    if (!panelName.trim() || selectedExperts.length === 0) return;

    const panelConfig = {
      name: panelName,
      description: panelDescription,
      templateId,
      members: selectedExperts.map((expert: any) => ({
        agent: expert,
        role: 'expert' as const,
        weight: 1
      })),
      metadata: {
        domain: template?.domain,
        complexity: template?.complexity || 'medium',
        consensusThreshold: 0.7,
        autoConsensus: true
      }
    };

    onPanelCreate(panelConfig);
  };

  // Get agent avatar
  const getAgentAvatar = (expert: any) => {
    if (expert.avatar?.startsWith('http')) {
      return expert.avatar;
    }

    const avatarMap: Record<string, string> = {
      'avatar_0001': '👨‍⚕️',
      'avatar_0002': '👩‍⚕️',
      'avatar_0003': '🧑‍💼',
      'avatar_0004': '👨‍💼',
      'avatar_0005': '👩‍💼',
      'avatar_0006': '🧑‍🔬',
      'avatar_0007': '👨‍🔬',
      'avatar_0008': '👩‍🔬',
      'avatar_0009': '👨‍⚖️',
      'avatar_0010': '👩‍⚖️',
    };

    return avatarMap[expert.avatar] || '🤖';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToTemplates}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Build Your Advisory Panel</h1>
              {template && (
                <p className="text-muted-foreground">
                  Based on {template.name} template
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Panel Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Panel Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Panel Name</label>
                <Input
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  placeholder={template ? `${template.name} Panel` : "Enter panel name..."}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={panelDescription}
                  onChange={(e) => setPanelDescription(e.target.value)}
                  placeholder="Describe the purpose and scope of this advisory panel..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expert Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Panel Members
                <Badge variant="outline" className="ml-auto">
                  {selectedExperts.length} selected
                </Badge>
              </CardTitle>
              {template && (
                <p className="text-sm text-muted-foreground">
                  Recommended: {template.recommendedMembers.minMembers}-{template.recommendedMembers.maxMembers} experts
                </p>
              )}
            </CardHeader>
            <CardContent>
              {/* Selected Experts */}
              {selectedExperts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Selected Experts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedExperts.map((expert: any) => (
                      <div
                        key={expert.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5 border-primary/20"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={expert.avatar?.startsWith('http') ? expert.avatar : undefined} />
                          <AvatarFallback>
                            {typeof getAgentAvatar(expert) === 'string' && getAgentAvatar(expert).length <= 2
                              ? getAgentAvatar(expert)
                              : expert.name.split(' ').map((n: string) => n[0]).join('')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{expert.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {expert.businessFunction?.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleToggleExpert(expert)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Experts */}
              <div>
                <h4 className="text-sm font-medium mb-3">
                  {template ? 'Recommended Experts' : 'Available Experts'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredExperts.map((expert: any) => {
                    const isSelected = selectedExperts.some((e: any) => e.id === expert.id);
                    const isRecommended = template
                      ? template.recommendedMembers.businessFunctions.some((func: string) =>
                          expert.businessFunction?.includes(func)
                        )
                      : false;

                    return (
                      <div
                        key={expert.id}
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        )}
                        onClick={() => handleToggleExpert(expert)}
                        onKeyDown={() => handleToggleExpert(expert)}
                        role="button"
                        tabIndex={0}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={expert.avatar?.startsWith('http') ? expert.avatar : undefined} />
                          <AvatarFallback>
                            {typeof getAgentAvatar(expert) === 'string' && getAgentAvatar(expert).length <= 2
                              ? getAgentAvatar(expert)
                              : expert.name.split(' ').map((n: string) => n[0]).join('')
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{expert.name}</p>
                            {isRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {expert.description}
                          </p>
                          {expert.businessFunction && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {expert.businessFunction.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Panel Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePanel}
              disabled={!panelName.trim() || selectedExperts.length === 0}
              size="lg"
            >
              Create Advisory Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
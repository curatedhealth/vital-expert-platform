'use client';

import {
  ArrowLeft,
  Users,
  MessageCircle,
  Settings,
  Target,
  Clock
} from 'lucide-react';
import { useState } from 'react';

import { ChatMessages } from '@/lib/shared/components/chat/chat-messages';
import { EnhancedChatInput } from '@/lib/shared/components/chat/enhanced-chat-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/shared/components/ui/avatar';
import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/shared/components/ui/card';

import { __usePanelStore as usePanelStore } from '../services/panel-store';

interface PanelInterfaceProps {
  panel: any;
  onBackToBuilder: () => void;
  onBackToTemplates: () => void;
}

export function PanelInterface({
  panel,
  onBackToBuilder,
  onBackToTemplates
}: PanelInterfaceProps) {
  const [message, setMessage] = useState('');

  const { sendMessageToPanel, isLoading } = usePanelStore();

  // Show welcome screen if no messages
  const showWelcome = !panel.messages || panel.messages.length === 0;

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

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    await sendMessageToPanel(messageText);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToTemplates}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{panel.name}</h1>
                <p className="text-sm text-muted-foreground">{panel.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Panel Members */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {panel.members.slice(0, 4).map((member: any, index: number) => (
                  <Avatar key={index} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={member.agent.avatar?.startsWith('http') ? member.agent.avatar : undefined} />
                    <AvatarFallback className="text-xs">
                      {typeof getAgentAvatar(member.agent) === 'string' && getAgentAvatar(member.agent).length <= 2
                        ? getAgentAvatar(member.agent)
                        : member.agent.name.split(' ').map((n: string) => n[0]).join('')
                      }
                    </AvatarFallback>
                  </Avatar>
                ))}
                {panel.members.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{panel.members.length - 4}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {panel.members.length} experts
              </span>
            </div>

            <Badge
              variant={panel.status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {panel.status}
            </Badge>

            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {showWelcome ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full space-y-6">
              {/* Panel Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Advisory Panel Ready
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Your advisory panel is assembled and ready to provide expert insights.
                    The panel will collaborate to give you comprehensive, multi-perspective advice.
                  </p>

                  {/* Panel Members Grid */}
                  <div>
                    <h4 className="font-semibold mb-3">Panel Members</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {panel.members.map((member: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.agent.avatar?.startsWith('http') ? member.agent.avatar : undefined} />
                            <AvatarFallback>
                              {typeof getAgentAvatar(member.agent) === 'string' && getAgentAvatar(member.agent).length <= 2
                                ? getAgentAvatar(member.agent)
                                : member.agent.name.split(' ').map((n: string) => n[0]).join('')
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{member.agent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.agent.businessFunction?.replace(/_/g, ' ')} • {member.role}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Weight: {member.weight}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel Capabilities */}
                  {panel.metadata && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{panel.members.length}</div>
                        <div className="text-xs text-muted-foreground">Expert Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{(panel.metadata.consensusThreshold * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Consensus Threshold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary capitalize">{panel.metadata.complexity}</div>
                        <div className="text-xs text-muted-foreground">Complexity Level</div>
                      </div>
                    </div>
                  )}

                  {/* Suggested Questions */}
                  <div>
                    <h4 className="font-semibold mb-3">Suggested Questions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "What are the key strategic considerations for this decision?",
                        "What risks should we be aware of and how can we mitigate them?",
                        "What are the different perspectives on this approach?",
                        "How do industry best practices apply to our situation?"
                      ].map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-3 text-left justify-start"
                          onClick={() => setMessage(question)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                          <span className="text-sm">{question}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-hidden">
            <ChatMessages
              messages={panel.messages}
              isTyping={isLoading}
            />
          </div>
        )}

        {/* Chat Input */}
        <div className="border-t bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <EnhancedChatInput
              value={message}
              onChange={setMessage}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask your advisory panel for expert insights..."
              showModelSelector={false}
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {panel.members.length} experts will collaborate on your response
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Response typically takes 3-5 minutes
                </span>
              </div>
              <span>Panel consensus enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
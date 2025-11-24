'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AgentService } from '@/features/agents/services/agent-service';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useAgentsStore } from '@/lib/stores/agents-store';
import type { AgentFeedback, AgentFeedbackFact } from '@/lib/stores/agents-store';

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: number;
  status: string;
  capabilities: string[];
  avatar?: string;
  isUserAdded?: boolean; // Track if agent is in user's list
  tools?: string[];
  knowledge_domains?: string[];
  totalConsultations?: number;
  satisfactionScore?: number;
  successRate?: number;
  averageResponseTime?: number;
  certifications?: string[];
  totalTokensUsed?: number;
  totalCost?: number;
  confidenceLevel?: number;
  availability?: 'online' | 'busy' | 'offline';
  longTermMemory?: {
    history?: Array<{
      userMessage: string;
      assistantMessage: string;
      timestamp: string;
    }>;
    facts?: AgentFeedbackFact[];
  };
  recentFeedback?: AgentFeedback[];
}

export interface AskExpertSession {
  sessionId: string;
  agent?: {
    name?: string;
    description?: string;
    avatar?: string | null;
  };
  lastMessage: string;
  messageCount: number;
}

interface AskExpertContextType {
  agents: Agent[];
  selectedAgents: string[];
  setSelectedAgents: (agentIds: string[]) => void;
  agentsLoading: boolean;
  sessions: AskExpertSession[];
  sessionsLoading: boolean;
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
  refreshSessions: () => Promise<void>;
  createNewSession: (options?: { title?: string; agentId?: string }) => Promise<string>;
  // New method to get all agents (unfiltered) for agent store pages
  getAllAgents: () => Promise<Agent[]>;
  // Method to refresh agents list (useful when user adds agents from store)
  refreshAgents: () => Promise<void>;
  // Method to add agent to user's list
  addAgentToUserList: (agentId: string) => Promise<void>;
  // Method to remove agent from user's list
  removeAgentFromUserList: (agentId: string) => Promise<void>;
}

const AskExpertContext = createContext<AskExpertContextType | undefined>(undefined);

function parseAgentStringList(rawValue: unknown): string[] {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item): item is string => item.length > 0);
  }

  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item): item is string => item.length > 0);
      }
    } catch {
      // Fall back to comma-separated parsing
    }

    return rawValue
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof rawValue === 'object') {
    const values = Object.values(rawValue as Record<string, unknown>);
    return values
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item): item is string => item.length > 0);
  }

  return [];
}

const DEFAULT_AGENT_TOOLS = ['web_search', 'calculator', 'database_query'];

function parseAgentTools(rawTools: unknown): string[] {
  const parsed = parseAgentStringList(rawTools);
  const normalized = new Set<string>();

  DEFAULT_AGENT_TOOLS.forEach((tool) => normalized.add(tool));
  parsed.forEach((tool) => {
    if (tool.length > 0) {
      normalized.add(tool);
    }
  });

  return Array.from(normalized);
}

function parseAgentKnowledgeDomains(rawDomains: unknown): string[] {
  return parseAgentStringList(rawDomains);
}

export function AskExpertProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [sessions, setSessions] = useState<AskExpertSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [userAddedAgentIds, setUserAddedAgentIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const mergeExternalAgents = useAgentsStore((state) => state.mergeExternalAgents);
  const loadAgentStatsFromStore = useAgentsStore((state) => state.loadAgentStats);

  // Method to refresh agents list (useful when user adds agents from store)
  const refreshAgents = useCallback(async () => {
    console.log('🔄 [AskExpertContext] refreshAgents called:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userObject: user
    });

    if (!user?.id) {
      console.log('🔄 [AskExpertContext] No user ID, clearing agents');
      setAgents([]);
      return;
    }

    console.log('🔄 [AskExpertContext] Refreshing agents list for user:', user.id);
    setAgentsLoading(true);
    try {
      // First, fetch user's added agents
      const response = await fetch(`/api/user-agents?userId=${encodeURIComponent(user.id)}`);

      if (!response.ok) {
        console.warn('⚠️ [AskExpertContext] Failed to fetch user agents:', response.statusText);
        console.warn('⚠️ [AskExpertContext] Using fallback: fetching all agents from agent store');
        
        // Fallback: fetch all agents from the agents table instead
        const fallbackResponse = await fetch('/api/agents?status=active');
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch agents: ${fallbackResponse.statusText}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        const allAgents = (fallbackData.agents || []).map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          role: agent.category || 'general',
          expertise: agent.specializations || [],
          displayName: agent.name,
          description: agent.description || '',
          avatar: agent.avatar_url || null,
          tier: agent.tier || 'tier_3',
          status: agent.status || 'active',
          category: agent.category || 'general',
          metadata: agent.metadata || {}
        }));
        
        console.log('✅ [AskExpertContext] Loaded agents from fallback:', allAgents.length);
        setAgents(allAgents);
        setUserAddedAgentIds(new Set());
        setAgentsLoading(false);
        return;
      }

      const data = await response.json();
      const userAgentRelationships = data.agents || [];

      // Track user-added agent IDs
      const userAddedIds = new Set<string>();
      
      // Process user-added agents (if the relationship includes agent data)
      // Supabase foreign key relationships return data in the relationship object
      const mappedAgents: Agent[] = userAgentRelationships
        .map((relationship: any) => {
          // Handle both cases: agent data from join, or just agent_id
          const agent = relationship.agents;
          const agentId = relationship.agent_id || agent?.id;
          
          if (!agentId) {
            return null;
          }
          
          // Track this as a user-added agent
          userAddedIds.add(agentId);
          
          // If we have full agent data from the join, use it
          if (agent && agent.id) {
            const metadata = agent.metadata || {};
            
            // Extract display name from multiple possible sources
            let displayName = 
              agent.display_name ||        // Root level (from API)
              metadata.display_name ||     // Metadata level
              agent.name ||                // Fallback to name
              'Unknown Agent';
            
            // Clean up display name - remove "(My Copy)" or "(Copy)" suffixes and weird formatting
            displayName = String(displayName)
              .replace(/\s*\(My Copy\)\s*/gi, '')
              .replace(/\s*\(Copy\)\s*/gi, '')
              .replace(/\[bea\]d-_agent_avatar_/gi, '')  // Remove malformed prefixes
              .replace(/^[^a-zA-Z]+/, '')                 // Remove leading non-letters
              .trim();
            
            // Capitalize first letter if needed
            if (displayName && displayName.length > 0) {
              displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            }
            
            // Fix avatar - use the exact avatar from the agent
            // Priority: metadata.avatar > agent.avatar > default
            let avatarCode = metadata.avatar || agent.avatar;
            
            // If no avatar provided or it's a descriptive string that doesn't match a file,
            // use a smart default based on the avatar description
            if (!avatarCode || (typeof avatarCode === 'string' && 
                !avatarCode.match(/^avatar_\d{3,4}$/) && 
                !avatarCode.startsWith('http') && 
                !avatarCode.startsWith('/'))) {
              
              const originalAvatar = avatarCode;
              
              // Try to extract number from prefix
              // e.g., "05boy_people_avatar..." -> "avatar_0005"
              // e.g., "11boy_people_avatar..." -> "avatar_0011"
              // e.g., "01arab_male_people..." -> "avatar_0001"
              const match = originalAvatar?.match(/^(\d+)/);
              if (match) {
                const num = match[1].padStart(4, '0');
                avatarCode = `avatar_${num}`;
              } else if (typeof originalAvatar === 'string') {
                // Fallback mapping for descriptive terms without number prefix
                if (originalAvatar.includes('beard') || originalAvatar.includes('arab')) {
                  avatarCode = 'avatar_0015';
                } else if (originalAvatar.includes('medical') || originalAvatar.includes('doctor')) {
                  avatarCode = 'avatar_0010';
                } else if (originalAvatar.includes('scientist') || originalAvatar.includes('research')) {
                  avatarCode = 'avatar_0012';
                } else if (originalAvatar.includes('boy') || originalAvatar.includes('teenager')) {
                  avatarCode = 'avatar_0005';
                } else {
                  avatarCode = 'avatar_0001'; // Generic default
                }
              } else {
                avatarCode = 'avatar_0001'; // Generic default
              }
            }
            
            console.log('🔍 [AskExpertContext] Processing agent:', {
              agentId,
              rawName: agent.name,
              rawDisplayName: agent.display_name,
              metadataDisplayName: metadata.display_name,
              finalDisplayName: displayName,
              rawAvatar: metadata.avatar || agent.avatar,
              finalAvatarCode: avatarCode,
            });
            
            return {
              id: agentId,
              name: agent.name,
              displayName: displayName,
              description: agent.description || '',
              tier: metadata.tier || agent.tier || 3,
              status: metadata.status || agent.status || 'active',
              capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
              avatar: avatarCode, // Use cleaned avatar code
              isUserAdded: true, // Mark as user-added
              tools: parseAgentTools(
                metadata.tools ??
                  metadata.allowed_tools ??
                  metadata.available_tools ??
                  agent.tools ??
                  agent.tool_access
              ),
              knowledge_domains: parseAgentKnowledgeDomains(
                metadata.knowledge_domains ??
                  agent.knowledge_domains
              ),
          };
          }
          
          return null;
        })
        .filter((agent): agent is Agent => agent !== null);

      // Update the global userAddedAgentIds set
      setUserAddedAgentIds(userAddedIds);
      
      console.log(`✅ [AskExpertContext] Loaded ${mappedAgents.length} user-added agents`, {
        userAddedIds: Array.from(userAddedIds)
      });

      // **IMPORTANT**: Only show user-added or user-created agents in Ask Expert sidebar
      // Don't fetch all available agents - user must explicitly add agents from the agents page
      setAgents(mappedAgents);
      console.log('ℹ️ [AskExpertContext] Agents list updated (user-added only)');
      
      // Optionally fetch stats for the user-added agents to enhance the display
      try {
        const agentsWithStats = await Promise.all(
          mappedAgents.slice(0, 24).map(async (agent) => {
            try {
              const stats = await loadAgentStatsFromStore(agent.id);
              if (stats) {
                return {
                  ...agent,
                  totalConsultations: stats.totalConsultations,
                  satisfactionScore: stats.satisfactionScore,
                  successRate: stats.successRate,
                  averageResponseTime: stats.averageResponseTime,
                  certifications: stats.certifications,
                  totalTokensUsed: stats.totalTokensUsed,
                  totalCost: stats.totalCost,
                  confidenceLevel: stats.confidenceLevel,
                  availability: stats.availability,
                  recentFeedback: stats.recentFeedback,
                };
              }
            } catch (error) {
              console.warn(`[AskExpertContext] Failed to fetch stats for agent ${agent.id}:`, error);
            }
            return agent;
          })
        );
        
        setAgents(agentsWithStats);
        console.log(`✅ [AskExpertContext] Enhanced ${agentsWithStats.length} agents with stats`);
      } catch (error) {
        console.error('❌ [AskExpertContext] Error fetching agent stats:', error);
        // Keep the agents without stats
      }
    } catch (error) {
      console.error('❌ [AskExpertContext] Error refreshing agents:', error);
      
      // Final fallback: try to fetch all agents from agent store
      try {
        console.warn('⚠️ [AskExpertContext] Attempting final fallback to agent store...');
        const fallbackResponse = await fetch('/api/agents?status=active');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const allAgents = (fallbackData.agents || []).map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            role: agent.category || 'general',
            expertise: agent.specializations || [],
            displayName: agent.name,
            description: agent.description || '',
            avatar: agent.avatar_url || null,
            tier: agent.tier || 'tier_3',
            status: agent.status || 'active',
            category: agent.category || 'general',
            metadata: agent.metadata || {}
          }));
          
          console.log('✅ [AskExpertContext] Loaded agents from final fallback:', allAgents.length);
          setAgents(allAgents);
        } else {
          console.warn('⚠️ [AskExpertContext] Final fallback also failed, using empty agent list');
          setAgents([]);
        }
      } catch (fallbackError) {
        console.error('❌ [AskExpertContext] Final fallback failed:', fallbackError);
        setAgents([]);
      }
    } finally {
      setAgentsLoading(false);
    }
  }, [user?.id, loadAgentStatsFromStore, mergeExternalAgents]);

  // Initial load of agents based on the signed-in user
  useEffect(() => {
    if (!user?.id) {
      setAgents([]);
      return;
    }

    void refreshAgents();
  }, [refreshAgents, user?.id]);

  // Listen for page visibility changes to refresh agents when user returns to Ask Expert page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Page became visible, refresh agents list
        refreshAgents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAgents, user?.id]);

  const fetchSessions = useCallback(async () => {
    if (!user?.id) {
      setSessions([]);
      return;
    }

    setSessionsLoading(true);
    try {
      const response = await fetch(`/api/ask-expert?userId=${encodeURIComponent(user.id)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedSessions: AskExpertSession[] = (data.sessions || []).map((session: any) => ({
        sessionId: session.sessionId,
        agent: session.agent
          ? {
              name: session.agent.name,
              description: session.agent.description,
              avatar: session.agent.avatar,
            }
          : undefined,
        lastMessage: session.lastMessage,
        messageCount: session.messageCount ?? 0,
      }));

      setSessions(fetchedSessions);
      setActiveSessionIdState(prev => prev ?? (fetchedSessions[0]?.sessionId ?? null));
    } catch (error) {
      console.error('❌ [AskExpertContext] Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const refreshSessions = useCallback(async () => {
    await fetchSessions();
  }, [fetchSessions]);

  const createNewSession = useCallback(
    async (options?: { title?: string; agentId?: string }) => {
      const fallbackId = `ask-expert-${Date.now()}`;
      let sessionId = fallbackId;

      if (user?.id) {
        try {
          console.log('🆕 [AskExpertContext] Creating new session:', {
            title: options?.title || 'New Conversation',
            agentId: options?.agentId,
            userId: user.id,
          });

          const response = await fetch('/api/chat/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: options?.title || 'New Conversation',
              agent_id: options?.agentId,
              user_id: user.id,
            }),
          });

          console.log('📡 [AskExpertContext] API Response status:', response.status, response.statusText);

          if (response.ok) {
            const payload = await response.json();
            console.log('📦 [AskExpertContext] API Response payload:', payload);
            
            const conversation = payload?.data?.conversation || payload?.conversation;
            
            if (conversation?.id) {
              sessionId = conversation.id;
              console.log('✅ [AskExpertContext] Created conversation with ID:', sessionId);
              
              const sessionRecord: AskExpertSession = {
                sessionId,
                agent: conversation.agent
                  ? {
                      name: conversation.agent.name,
                      description: conversation.agent.description,
                      avatar: conversation.agent.avatar,
                    }
                  : options?.agentId
                    ? (() => {
                        const agent = agents.find((a) => a.id === options?.agentId);
                        return agent
                          ? {
                              name: agent.displayName,
                              description: agent.description,
                              avatar: agent.avatar,
                            }
                          : undefined;
                      })()
                    : undefined,
                lastMessage:
                  conversation.updated_at || conversation.created_at || new Date().toISOString(),
                messageCount: conversation.message_count ?? 0,
              };

              setSessions((prev) => {
                const filtered = prev.filter((session) => session.sessionId !== sessionId);
                return [sessionRecord, ...filtered];
              });
            } else {
              console.error('❌ [AskExpertContext] No conversation ID in response:', payload);
            }
          } else {
            const errorBody = await response.text();
            console.error('❌ [AskExpertContext] Failed to create conversation via API');
            console.error('   Status:', response.status, response.statusText);
            console.error('   Response body:', errorBody);
            
            try {
              const errorJson = JSON.parse(errorBody);
              console.error('   Error details:', errorJson);
            } catch {
              // Not JSON, that's fine
            }
          }
        } catch (error) {
          console.error('❌ [AskExpertContext] Error creating conversation via API:', error);
          if (error instanceof Error) {
            console.error('   Error message:', error.message);
            console.error('   Error stack:', error.stack);
          }
        }
      }

      if (sessionId === fallbackId) {
        const agentSummary = options?.agentId
          ? (() => {
              const agent = agents.find((a) => a.id === options.agentId);
              return agent
                ? {
                    name: agent.displayName,
                    description: agent.description,
                    avatar: agent.avatar,
                  }
                : undefined;
            })()
          : undefined;

        setSessions((prev) => {
          const filtered = prev.filter((session) => session.sessionId !== sessionId);
          return [
            {
              sessionId,
              agent: agentSummary,
              lastMessage: new Date().toISOString(),
              messageCount: 0,
            },
            ...filtered,
          ];
        });
      }

      setActiveSessionIdState(sessionId);
      if (user?.id) {
        fetchSessions();
      }
      return sessionId;
    },
    [agents, user?.id, fetchSessions]
  );

  const handleSetActiveSessionId = useCallback((sessionId: string | null) => {
    setActiveSessionIdState(sessionId);
  }, []);

  // Method to get all agents (unfiltered) for agent store pages
  const getAllAgents = useCallback(async (): Promise<Agent[]> => {
    try {
      const agentService = new AgentService();
      const fetchedAgents = await agentService.getActiveAgents(true);

      const mappedAgents: Agent[] = fetchedAgents.map((agent: any) => {
        const metadata = agent.metadata || {};
        return {
          id: agent.id,
          name: agent.name,
          displayName: metadata.display_name || agent.name,
          description: agent.description || '',
          tier: metadata.tier || 3,
          status: metadata.status || 'active',
          capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
          avatar: metadata.avatar || undefined,
          tools: parseAgentTools(
            metadata.tools ??
              metadata.allowed_tools ??
              metadata.available_tools ??
              agent.tools ??
              agent.tool_access
          ),
          knowledge_domains: parseAgentKnowledgeDomains(
            metadata.knowledge_domains ??
              agent.knowledge_domains
          ),
        };
      });

      return mappedAgents;
    } catch (error) {
      console.error('❌ [AskExpertContext] Error loading all agents:', error);
      return [];
    }
  }, []);

  const addAgentToUserList = useCallback(async (agentId: string) => {
    if (!user?.id) {
      console.warn('[AskExpertContext] Cannot add agent: user not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/user-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          agentId,
          isUserCopy: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add agent: ${response.statusText}`);
      }

      // Refresh agents after adding
      await refreshAgents();
    } catch (error) {
      console.error('[AskExpertContext] Failed to add agent to user list:', error);
      throw error;
    }
  }, [user?.id, refreshAgents]);

  const removeAgentFromUserList = useCallback(async (agentId: string) => {
    if (!user?.id) {
      console.warn('[AskExpertContext] Cannot remove agent: user not authenticated');
      return;
    }

    try {
      console.log('🗑️ [AskExpertContext] Removing agent from user list:', agentId);
      
      // Optimistically update UI - remove agent immediately
      setAgents(prev => {
        const updated = prev.filter(agent => agent.id !== agentId);
        console.log(`✨ [AskExpertContext] Optimistically removed agent. Remaining: ${updated.length}`);
        return updated;
      });
      
      // Also remove from userAddedAgentIds set
      setUserAddedAgentIds(prev => {
        const updated = new Set(prev);
        updated.delete(agentId);
        return updated;
      });
      
      // If this was the selected agent, deselect it
      setSelectedAgents(prev => prev.filter(id => id !== agentId));

      // Then make the API call
      const response = await fetch('/api/user-agents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          agentId,
        }),
      });

      if (!response.ok) {
        console.error('❌ [AskExpertContext] API call failed, reverting optimistic update');
        throw new Error(`Failed to remove agent: ${response.statusText}`);
      }

      console.log('✅ [AskExpertContext] Agent removed successfully from database');
      
      // Optionally refresh to ensure consistency (but UI already updated)
      // await refreshAgents();
    } catch (error) {
      console.error('[AskExpertContext] Failed to remove agent from user list:', error);
      // Revert optimistic update on error
      await refreshAgents();
      throw error;
    }
  }, [user?.id, setSelectedAgents, refreshAgents]);

  // Auto-refresh agents when user changes
  useEffect(() => {
    console.log('🔄 [AskExpertContext] User changed, refreshing agents:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    refreshAgents();
  }, [user?.id, refreshAgents]);

  return (
    <AskExpertContext.Provider
      value={{
        agents,
        selectedAgents,
        setSelectedAgents,
        agentsLoading,
        sessions,
        sessionsLoading,
        activeSessionId,
        setActiveSessionId: handleSetActiveSessionId,
        refreshSessions,
        createNewSession,
        getAllAgents,
        refreshAgents,
        addAgentToUserList,
        removeAgentFromUserList,
      }}
    >
      {children}
    </AskExpertContext.Provider>
  );
}

export function useAskExpert() {
  const context = useContext(AskExpertContext);
  if (context === undefined) {
    throw new Error('useAskExpert must be used within an AskExpertProvider');
  }
  return context;
}

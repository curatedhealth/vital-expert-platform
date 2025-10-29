'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AgentService } from '@/features/agents/services/agent-service';
import { useAuth } from '@/lib/auth/supabase-auth-context';

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

export function AskExpertProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [sessions, setSessions] = useState<AskExpertSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [userAddedAgentIds, setUserAddedAgentIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

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
      const response = await fetch(`/api/user-agents?userId=${encodeURIComponent(user.id)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user agents: ${response.statusText}`);
      }

      const data = await response.json();
      const userAgentRelationships = data.agents || [];

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
          
          // If we have full agent data from the join, use it
          if (agent && agent.id) {
            const metadata = agent.metadata || {};
            
            // Clean up display name - remove "(My Copy)" or "(Copy)" suffixes
            let displayName = metadata.display_name || agent.name;
            displayName = displayName.replace(/\s*\(My Copy\)\s*/gi, '').replace(/\s*\(Copy\)\s*/gi, '').trim();
            
            // Add to userAddedAgentIds set
            setUserAddedAgentIds(prev => new Set([...prev, agentId]));
            
            return {
              id: agentId,
              name: agent.name,
              displayName: displayName,
              description: agent.description || '',
              tier: metadata.tier || 3,
              status: metadata.status || 'active',
              capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
              avatar: metadata.avatar || undefined,
              isUserAdded: true, // Mark as user-added
            };
          }
          
          // If we only have agent_id but no agent data, just track it for now
          // The agent details will be fetched from /api/agents-crud and merged later
          if (relationship.agent_id) {
            setUserAddedAgentIds(prev => new Set([...prev, relationship.agent_id]));
          }
          
          return null;
        })
        .filter((agent): agent is Agent => agent !== null);

      setAgents(mappedAgents);
      console.log(`✅ [AskExpertContext] Loaded ${mappedAgents.length} user agents for sidebar`);

      // Always fetch available agents from store to show in sidebar
      console.log(
        'ℹ️ [AskExpertContext] Fetching available agents from store to show in sidebar...'
      );
      
      try {
        const allAgentsResponse = await fetch('/api/agents-crud');
        if (allAgentsResponse.ok) {
          const allAgentsData = await allAgentsResponse.json();
          const availableAgents = allAgentsData.agents || [];
          
          console.log('🔍 [AskExpertContext] Raw agent data from API:', {
            totalAgents: availableAgents.length,
            firstFewAgents: availableAgents.slice(0, 3).map(a => ({
              id: a.id,
              name: a.name,
              display_name: a.display_name,
              description: a.description?.substring(0, 50) + '...',
              tier: a.tier
            }))
          });
          
          // Group agents by tier to get diverse selection
          const agentsByTier = availableAgents.reduce((acc: any, agent: any) => {
            const tier = agent.tier || 3;
            if (!acc[tier]) acc[tier] = [];
            acc[tier].push(agent);
            return acc;
          }, {});
          
          // Show ALL available agents from the store (not just a sample)
          const allAvailableAgents: Agent[] = availableAgents.map((agent: any) => {
            // Clean up display name - remove "(My Copy)" or "(Copy)" suffixes
            let displayName = agent.display_name || agent.name;
            displayName = displayName.replace(/\s*\(My Copy\)\s*/gi, '').replace(/\s*\(Copy\)\s*/gi, '').trim();
            
            return {
              id: agent.id,
              name: agent.name,
              displayName: displayName,
              description: agent.description || '',
              tier: agent.tier || 3,
              status: agent.status || 'active',
              capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
              avatar: agent.avatar || undefined,
              isUserAdded: userAddedAgentIds.has(agent.id), // Check if agent is user-added
            };
          });
          
          // Combine user-added agents with all available agents, avoiding duplicates
          const agentMap = new Map<string, Agent>();
          
          // First, add all available agents
          allAvailableAgents.forEach(agent => {
            agentMap.set(agent.id, agent);
          });
          
          // Then, update with user-added agents (they may override with isUserAdded=true)
          mappedAgents.forEach(agent => {
            const existingAgent = agentMap.get(agent.id);
            agentMap.set(agent.id, {
              ...(existingAgent || {}), // Keep existing data if available
              ...agent, // Override with user-added data (isUserAdded=true, etc.)
              isUserAdded: true, // Ensure this is set
            });
          });
          
          const allAgents = Array.from(agentMap.values());
          
          setAgents(allAgents);
          console.log(`✅ [AskExpertContext] Loaded ${allAgents.length} total agents:`, {
            userAdded: mappedAgents.length,
            available: allAvailableAgents.length,
            userAddedAgentIds: Array.from(userAddedAgentIds),
            agents: allAgents.map(a => ({ 
              id: a.id, 
              name: a.name, 
              displayName: a.displayName, 
              tier: a.tier, 
              isUserAdded: a.isUserAdded 
            }))
          });
        }
      } catch (error) {
        console.error('❌ [AskExpertContext] Error fetching available agents:', error);
        // If we can't fetch available agents, at least show user-added agents
        setAgents(mappedAgents);
      }
    } catch (error) {
      console.error('❌ [AskExpertContext] Error refreshing agents:', error);
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  }, [user?.id]);

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
      const response = await fetch('/api/user-agents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove agent: ${response.statusText}`);
      }

      // Refresh agents after removing
      await refreshAgents();
    } catch (error) {
      console.error('[AskExpertContext] Failed to remove agent from user list:', error);
      throw error;
    }
  }, [user?.id, refreshAgents]);

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

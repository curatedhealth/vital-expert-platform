#!/bin/bash

echo "🔧 Quick Fix: Bypassing user_agents table for testing..."

# Create a backup
cp apps/digital-health-startup/src/contexts/ask-expert-context.tsx apps/digital-health-startup/src/contexts/ask-expert-context.tsx.backup

# Create a simplified version that just fetches all agents
cat > apps/digital-health-startup/src/contexts/ask-expert-context-simple.tsx << 'EOF'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export interface Agent {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tier: number;
  status: string;
  capabilities: string[];
  avatar?: string;
  isUserAdded?: boolean;
}

export interface AskExpertSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  agentName?: string;
}

export interface AskExpertContextType {
  agents: Agent[];
  selectedAgents: string[];
  setSelectedAgents: (agents: string[]) => void;
  agentsLoading: boolean;
  sessions: AskExpertSession[];
  sessionsLoading: boolean;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  refreshAgents: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  createSession: (options?: { agentId?: string; title?: string }) => Promise<string>;
  getAllAgents: () => Promise<Agent[]>;
  addAgentToUserList: (agentId: string) => Promise<void>;
  removeAgentFromUserList: (agentId: string) => Promise<void>;
  userAddedAgentIds: Set<string>;
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

  // Simplified refreshAgents that just fetches all agents
  const refreshAgents = useCallback(async () => {
    console.log('🔄 [AskExpertContext] refreshAgents called (simplified version)');

    if (!user?.id) {
      console.log('🔄 [AskExpertContext] No user ID, clearing agents');
      setAgents([]);
      return;
    }

    console.log('🔄 [AskExpertContext] Refreshing agents list for user:', user.id);
    setAgentsLoading(true);
    
    try {
      // Just fetch all agents directly (bypass user_agents table)
      console.log('ℹ️ [AskExpertContext] Fetching all agents from store...');
      
      const allAgentsResponse = await fetch('/api/agents-crud');
      if (!allAgentsResponse.ok) {
        throw new Error(`Failed to fetch agents: ${allAgentsResponse.statusText}`);
      }
      
      const allAgentsData = await allAgentsResponse.json();
      const availableAgents = allAgentsData.agents || [];
      
      console.log('🔍 [AskExpertContext] Raw agent data from API:', {
        totalAgents: availableAgents.length,
        firstFewAgents: availableAgents.slice(0, 3).map(a => ({
          id: a.id,
          name: a.name,
          display_name: a.metadata?.display_name
        }))
      });
      
      // Map agents to the expected format
      const mappedAgents: Agent[] = availableAgents.map((agent: any) => {
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
          isUserAdded: false, // For now, mark all as not user-added
        };
      });

      setAgents(mappedAgents);
      console.log(`✅ [AskExpertContext] Loaded ${mappedAgents.length} agents for sidebar`);
      
    } catch (error) {
      console.error('❌ [AskExpertContext] Error refreshing agents:', error);
      setAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  }, [user?.id]);

  // Simplified session management
  const fetchSessions = useCallback(async () => {
    if (!user?.id) {
      setSessions([]);
      return;
    }

    setSessionsLoading(true);
    try {
      const response = await fetch(`/api/ask-expert?userId=${encodeURIComponent(user.id)}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
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

  const createSession = useCallback(async (options?: { agentId?: string; title?: string }) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await refreshSessions();
    return sessionId;
  }, [refreshSessions]);

  const getAllAgents = useCallback(async (): Promise<Agent[]> => {
    try {
      const response = await fetch('/api/agents-crud');
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('❌ [AskExpertContext] Error loading all agents:', error);
      return [];
    }
  }, []);

  const addAgentToUserList = useCallback(async (agentId: string) => {
    console.log('ℹ️ [AskExpertContext] addAgentToUserList called (simplified - no-op)');
    // For now, this is a no-op since we're bypassing user_agents table
  }, []);

  const removeAgentFromUserList = useCallback(async (agentId: string) => {
    console.log('ℹ️ [AskExpertContext] removeAgentFromUserList called (simplified - no-op)');
    // For now, this is a no-op since we're bypassing user_agents table
  }, []);

  const setActiveSessionId = useCallback((id: string | null) => {
    setActiveSessionIdState(id);
  }, []);

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
        setActiveSessionId,
        refreshAgents,
        refreshSessions,
        createSession,
        getAllAgents,
        addAgentToUserList,
        removeAgentFromUserList,
        userAddedAgentIds,
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
EOF

# Replace the original file
mv apps/digital-health-startup/src/contexts/ask-expert-context-simple.tsx apps/digital-health-startup/src/contexts/ask-expert-context.tsx

echo "✅ Simplified ask-expert-context.tsx created!"
echo "✅ All agents will now be fetched directly from /api/agents-crud"
echo "✅ user_agents table dependency removed for testing"

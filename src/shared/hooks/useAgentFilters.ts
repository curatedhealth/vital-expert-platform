import { useMemo } from 'react';
import { useAgentsStore } from '@/lib/stores/agents-store';

export function useAgentFilters() {
  const { agents } = useAgentsStore();

  const availableDomains = useMemo(() => {
    const uniqueDomains = new Set<string>();
    agents.forEach(agent => {
      agent.knowledge_domains?.forEach(domain => uniqueDomains.add(domain));
    });
    return Array.from(uniqueDomains).sort();
  }, [agents]);

  const availableCapabilities = useMemo(() => {
    const uniqueCapabilities = new Set<string>();
    agents.forEach(agent => {
      agent.capabilities?.forEach(cap => uniqueCapabilities.add(cap));
    });
    return Array.from(uniqueCapabilities).sort();
  }, [agents]);

  const availableBusinessFunctions = useMemo(() => {
    const uniqueBusinessFunctions = new Set<string>();
    agents.forEach(agent => {
      if (agent.business_function) {
        uniqueBusinessFunctions.add(agent.business_function);
      }
    });
    return Array.from(uniqueBusinessFunctions).sort();
  }, [agents]);

  const availableRoles = useMemo(() => {
    const uniqueRoles = new Set<string>();
    agents.forEach(agent => {
      if (agent.role) {
        uniqueRoles.add(agent.role);
      }
    });
    return Array.from(uniqueRoles).sort();
  }, [agents]);

  return {
    availableDomains,
    availableCapabilities,
    availableBusinessFunctions,
    availableRoles
  };
}
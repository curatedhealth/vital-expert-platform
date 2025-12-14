// Phase 1 foundation: lightweight wrapper around useMode3Mission/useMode4Background.
// Keeps a stable interface for future Deep Agents integration without breaking callers.

import { useMode3Mission } from '@/features/ask-expert/hooks/useMode3Mission';
import { useMode4Background } from '@/features/ask-expert/hooks/useMode4Background';

type Mode = 3 | 4;

export interface UseAutonomousModeOptions {
  mode: Mode;
  missionId?: string;
  agentId?: string;
  /** @deprecated Use agentId instead */
  expertId?: string;
  tenantId?: string;
}

export function useAutonomousMode(options: UseAutonomousModeOptions) {
  const { mode, ...rest } = options;
  return mode === 3 ? useMode3Mission(rest) : useMode4Background(rest);
}

export default useAutonomousMode;

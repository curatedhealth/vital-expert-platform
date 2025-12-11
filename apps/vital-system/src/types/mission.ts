// Phase 1 foundation: mission types for Mode 3/4 (aligned with backend models).

export type MissionMode = 3 | 4;

export type MissionStatus =
  | 'draft'
  | 'briefing'
  | 'ready'
  | 'running'
  | 'paused'
  | 'checkpoint'
  | 'completed'
  | 'failed'
  | 'aborted';

export interface TodoItem {
  id: string;
  description: string;
  agent_name?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  started_at?: string;
  completed_at?: string;
}

export interface Mission {
  id: string;
  title: string;
  objective: string;
  mode: MissionMode;
  status: MissionStatus;
  todos: TodoItem[];
  selected_agents: string[];
  budget_limit: number;
  budget_spent: number;
  created_at: string;
  updated_at: string;
}

export interface MissionEvent {
  id: string;
  mission_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface MissionArtifact {
  id: string;
  mission_id: string;
  artifact_type: string;
  title: string;
  content: string;
  file_path?: string;
  created_at: string;
}

export interface MissionCheckpoint {
  id: string;
  mission_id: string;
  checkpoint_type: string;
  message: string;
  options: Array<Record<string, unknown>>;
  context: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  response?: Record<string, unknown>;
  created_at: string;
}

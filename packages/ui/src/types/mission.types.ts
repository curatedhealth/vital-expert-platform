export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface MissionArtifact {
  id: string;
  title: string;
  description?: string;
  type?: string;
  url?: string;
  createdAt?: string;
}

export interface MissionCheckpoint {
  id: string;
  title: string;
  type?: string;
  status?: MissionStatus;
  timestamp?: string;
  isBlocking?: boolean;
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  family?: string;
  templateId?: string;
  status?: MissionStatus;
  progress?: number;
  startTime?: string;
  endTime?: string;
  artifacts?: MissionArtifact[];
  checkpoints?: MissionCheckpoint[];
}

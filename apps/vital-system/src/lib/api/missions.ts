// Phase 1 foundation: mission API client stubs (non-breaking placeholders).

import type { Mission, MissionEvent, MissionArtifact, MissionCheckpoint } from '@/types/mission';

const BASE = '/api/missions';

export async function listMissions(): Promise<Mission[]> {
  const res = await fetch(BASE, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to list missions: ${res.status}`);
  return res.json();
}

export async function getMission(id: string): Promise<Mission> {
  const res = await fetch(`${BASE}/${id}`, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch mission: ${res.status}`);
  return res.json();
}

export async function getMissionEvents(id: string): Promise<MissionEvent[]> {
  const res = await fetch(`${BASE}/${id}/events`, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch mission events: ${res.status}`);
  return res.json();
}

export async function getMissionArtifacts(id: string): Promise<MissionArtifact[]> {
  const res = await fetch(`${BASE}/${id}/artifacts`, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch mission artifacts: ${res.status}`);
  return res.json();
}

export async function getMissionCheckpoints(id: string): Promise<MissionCheckpoint[]> {
  const res = await fetch(`${BASE}/${id}/checkpoints`, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to fetch mission checkpoints: ${res.status}`);
  return res.json();
}

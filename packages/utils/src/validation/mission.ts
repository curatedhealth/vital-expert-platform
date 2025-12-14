import { isEmpty } from './index';

export function validateMissionGoal(goal: string): boolean {
  if (!goal || goal.trim().length < 5) return false;
  return true;
}

export function validateTemplateConfig(config: Record<string, unknown>): boolean {
  if (!config) return false;
  if (!config['templateId'] && !config['id']) return false;
  return true;
}

export function validateHITLResponse(response: { action: 'approve' | 'reject' | 'modify'; message?: string }): boolean {
  if (!response) return false;
  if (response.action === 'reject' || response.action === 'modify') {
    return !isEmpty(response.message);
  }
  return true;
}

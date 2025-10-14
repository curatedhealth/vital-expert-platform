/**
 * Simple conflict resolver for agent coordination
 */

export interface Conflict {
  id: string;
  type: string;
  agents: string[];
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface ConflictResolution {
  conflictId: string;
  resolution: string;
  confidence: number;
  timestamp: Date;
}

export class AgentConflictResolver {
  private conflicts: Conflict[] = [];
  private resolutions: ConflictResolution[] = [];

  detectConflicts(
    agents: any[],
    responses: any[],
    query: string,
    context: any
  ): Conflict[] {
    // Simple conflict detection - in production this would be more sophisticated
    const conflicts: Conflict[] = [];
    
    // Check for contradictory responses
    if (responses.length > 1) {
      const responseContents = responses.map(r => r.content?.toLowerCase() || '');
      const hasContradictions = responseContents.some((content, index) => {
        return responseContents.some((otherContent, otherIndex) => {
          if (index === otherIndex) return false;
          // Simple contradiction detection
          return content.includes('yes') && otherContent.includes('no') ||
                 content.includes('no') && otherContent.includes('yes');
        });
      });

      if (hasContradictions) {
        conflicts.push({
          id: `conflict-${Date.now()}`,
          type: 'contradictory_responses',
          agents: responses.map(r => r.agentId || 'unknown'),
          description: 'Agents provided contradictory responses',
          severity: 'medium',
          timestamp: new Date()
        });
      }
    }

    this.conflicts = [...this.conflicts, ...conflicts];
    return conflicts;
  }

  async resolveConflicts(conflicts: Conflict[]): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      // Simple resolution strategy
      const resolution: ConflictResolution = {
        conflictId: conflict.id,
        resolution: this.getResolutionStrategy(conflict),
        confidence: 0.8,
        timestamp: new Date()
      };

      resolutions.push(resolution);
    }

    this.resolutions = [...this.resolutions, ...resolutions];
    return resolutions;
  }

  private getResolutionStrategy(conflict: Conflict): string {
    switch (conflict.type) {
      case 'contradictory_responses':
        return 'Use majority consensus or request clarification from user';
      case 'resource_conflict':
        return 'Implement priority-based resource allocation';
      case 'timing_conflict':
        return 'Adjust execution order based on dependencies';
      default:
        return 'Escalate to human operator for manual resolution';
    }
  }

  getConflicts(): Conflict[] {
    return [...this.conflicts];
  }

  getResolutions(): ConflictResolution[] {
    return [...this.resolutions];
  }

  clearHistory(): void {
    this.conflicts = [];
    this.resolutions = [];
  }
}

export const agentConflictResolver = new AgentConflictResolver();


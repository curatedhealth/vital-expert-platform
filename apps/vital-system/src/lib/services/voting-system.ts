/**
 * Weighted Voting System
 * Implements Guide Section 6.2: Voting Mechanisms
 */

// Type defined locally (previously from langgraph-orchestrator)
export interface AgentReply {
  persona: string;
  text: string;
  confidence: number;
  citations: string[];
  timestamp: string;
  round: number;
  toolCalls?: Array<{ name: string; args: Record<string, unknown>; result?: string }>;
}

export interface VoteResult {
  decision: string;
  confidence: number;
  distribution: Record<string, number>;
  weightedScore: number;
}

export interface ConsensusResult {
  consensusReached: boolean;
  consensusScore: number;
  threshold: number;
  alignmentScores: Record<string, number>;
  majorityPosition: string;
  dissentingPositions: string[];
}

export class VotingSystem {
  /**
   * Weighted majority vote
   * Guide Section 6.2
   */
  weightedMajorityVote(
    votes: Record<string, string>,  // persona → vote
    weights: Record<string, number>  // persona → weight
  ): VoteResult {
    const voteTallies: Record<string, number> = {};

    // Calculate weighted votes
    for (const [persona, vote] of Object.entries(votes)) {
      const weight = weights[persona] || 1.0;
      voteTallies[vote] = (voteTallies[vote] || 0) + weight;
    }

    // Find winner
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const winner = Object.entries(voteTallies).reduce((max, [vote, tally]) =>
      tally > (voteTallies[max] || 0) ? vote : max
    , Object.keys(voteTallies)[0]);

    const winnerTally = voteTallies[winner];
    const confidence = winnerTally / totalWeight;

    return {
      decision: winner,
      confidence,
      distribution: voteTallies,
      weightedScore: winnerTally
    };
  }

  /**
   * Ranked choice voting (instant runoff)
   * For multiple options with preference ordering
   */
  rankedChoiceVoting(
    rankings: Record<string, string[]>,  // persona → [1st choice, 2nd choice, ...]
    weights: Record<string, number>
  ): VoteResult {
    const candidates = new Set<string>();
    Object.values(rankings).forEach(ranking =>
      ranking.forEach(candidate => candidates.add(candidate))
    );

    let remainingCandidates = Array.from(candidates);
    const currentRankings = { ...rankings };

    // Instant runoff rounds
    while (remainingCandidates.length > 1) {
      // Count first-choice votes
      const voteCounts: Record<string, number> = {};

      for (const [persona, ranking] of Object.entries(currentRankings)) {
        const firstChoice = ranking.find((c: any) => remainingCandidates.includes(c));
        if (firstChoice) {
          const weight = weights[persona] || 1.0;
          voteCounts[firstChoice] = (voteCounts[firstChoice] || 0) + weight;
        }
      }

      // Check if any candidate has majority
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      const winner = Object.entries(voteCounts).find(([_, count]) => count > totalWeight / 2);

      if (winner) {
        return {
          decision: winner[0],
          confidence: winner[1] / totalWeight,
          distribution: voteCounts,
          weightedScore: winner[1]
        };
      }

      // Eliminate candidate with fewest votes
      const loser = Object.entries(voteCounts).reduce((min, [candidate, count]) =>
        count < (voteCounts[min] || Infinity) ? candidate : min
      , Object.keys(voteCounts)[0]);

      remainingCandidates = remainingCandidates.filter((c: any) => c !== loser);
    }

    // Fallback: return last remaining candidate
    const finalCandidate = remainingCandidates[0];
    return {
      decision: finalCandidate,
      confidence: 1.0,
      distribution: { [finalCandidate]: Object.values(weights).reduce((s, w) => s + w, 0) },
      weightedScore: Object.values(weights).reduce((s, w) => s + w, 0)
    };
  }

  /**
   * Consensus threshold voting
   * Determines if consensus threshold is met
   */
  consensusThresholdVote(
    positions: Record<string, string>,  // persona → position statement
    weights: Record<string, number>,
    threshold: number = 0.7
  ): ConsensusResult {
    // Group similar positions (simplified - use semantic similarity in production)
    const positionGroups: Record<string, { personas: string[], weight: number }> = {};

    for (const [persona, position] of Object.entries(positions)) {
      // Simplified grouping - in production, use embeddings
      const normalizedPosition = position.toLowerCase().trim().slice(0, 100);

      if (!positionGroups[normalizedPosition]) {
        positionGroups[normalizedPosition] = { personas: [], weight: 0 };
      }

      positionGroups[normalizedPosition].personas.push(persona);
      positionGroups[normalizedPosition].weight += weights[persona] || 1.0;
    }

    // Calculate alignment scores
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const alignmentScores: Record<string, number> = {};

    for (const [position, group] of Object.entries(positionGroups)) {
      alignmentScores[position] = group.weight / totalWeight;
    }

    // Find majority position
    const majorityEntry = Object.entries(alignmentScores).reduce((max, entry) =>
      entry[1] > max[1] ? entry : max
    );

    const majorityPosition = majorityEntry[0];
    const consensusScore = majorityEntry[1];
    const consensusReached = consensusScore >= threshold;

    // Identify dissenting positions
    const dissentingPositions = Object.entries(alignmentScores)
      .filter(([pos, _]) => pos !== majorityPosition)
      .map(([pos, _]) => pos);

    return {
      consensusReached,
      consensusScore,
      threshold,
      alignmentScores,
      majorityPosition,
      dissentingPositions
    };
  }

  /**
   * Calculate weighted consensus from agent replies
   */
  calculateWeightedConsensus(
    replies: AgentReply[],
    weights: Record<string, number>
  ): ConsensusResult {
    // Extract positions from replies
    const positions: Record<string, string> = {};
    replies.forEach(reply => {
      positions[reply.persona] = reply.text;
    });

    return this.consensusThresholdVote(positions, weights, 0.7);
  }

  /**
   * Analyze vote polarization
   * Returns measure of how divided the board is
   */
  analyzePolarization(
    votes: Record<string, string>,
    weights: Record<string, number>
  ): {
    polarizationIndex: number;  // 0-1, higher = more polarized
    majorityStrength: number;
    numberOfFactions: number;
  } {
    const voteTallies: Record<string, number> = {};

    for (const [persona, vote] of Object.entries(votes)) {
      const weight = weights[persona] || 1.0;
      voteTallies[vote] = (voteTallies[vote] || 0) + weight;
    }

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const tallies = Object.values(voteTallies);
    const numberOfFactions = tallies.length;

    // Calculate Herfindahl index for polarization
    const herfindahlIndex = tallies.reduce((sum, tally) => {
      const share = tally / totalWeight;
      return sum + (share * share);
    }, 0);

    // Convert to polarization index (inverted)
    const polarizationIndex = 1 - herfindahlIndex;

    // Majority strength (highest faction)
    const majorityStrength = Math.max(...tallies) / totalWeight;

    return {
      polarizationIndex,
      majorityStrength,
      numberOfFactions
    };
  }
}

// Export singleton instance
export const votingSystem = new VotingSystem();

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Agent } from '@/core/domain/entities/agent.entity';

describe('Agent Entity', () => {
  let agent: Agent;

  beforeEach(() => {
    agent = new Agent(
      'test-agent-1',
      'medical-expert',
      'Medical Expert',
      'Expert in medical diagnosis and treatment',
      'You are a medical expert specializing in diagnosis and treatment.',
      ['medical-knowledge', 'diagnosis', 'treatment'],
      2,
      ['cardiology', 'neurology'],
      'gpt-4',
      0.7,
      4000,
      true,
      new Date('2024-01-01'),
      new Date('2024-01-01')
    );
  });

  describe('Constructor', () => {
    it('should create an agent with all required properties', () => {
      expect(agent.id).toBe('test-agent-1');
      expect(agent.name).toBe('medical-expert');
      expect(agent.displayName).toBe('Medical Expert');
      expect(agent.description).toBe('Expert in medical diagnosis and treatment');
      expect(agent.systemPrompt).toBe('You are a medical expert specializing in diagnosis and treatment.');
      expect(agent.capabilities).toEqual(['medical-knowledge', 'diagnosis', 'treatment']);
      expect(agent.tier).toBe(2);
      expect(agent.knowledgeDomains).toEqual(['cardiology', 'neurology']);
      expect(agent.model).toBe('gpt-4');
      expect(agent.temperature).toBe(0.7);
      expect(agent.maxTokens).toBe(4000);
      expect(agent.ragEnabled).toBe(true);
    });
  });

  describe('canHandleQuery', () => {
    it('should return true when agent has required capabilities', () => {
      const intent = {
        requiredCapabilities: ['medical-knowledge', 'diagnosis'],
        domain: 'medical',
        complexity: 'high'
      };

      const result = agent.canHandleQuery(intent);
      expect(result).toBe(true);
    });

    it('should return false when agent lacks required capabilities', () => {
      const intent = {
        requiredCapabilities: ['legal-knowledge', 'compliance'],
        domain: 'legal',
        complexity: 'medium'
      };

      const result = agent.canHandleQuery(intent);
      expect(result).toBe(false);
    });

    it('should return true when agent has partial capabilities', () => {
      const intent = {
        requiredCapabilities: ['medical-knowledge', 'legal-knowledge'],
        domain: 'medical-legal',
        complexity: 'high'
      };

      const result = agent.canHandleQuery(intent);
      expect(result).toBe(true);
    });
  });

  describe('matchesDomain', () => {
    it('should return true when agent matches domain', () => {
      expect(agent.matchesDomain('cardiology')).toBe(true);
      expect(agent.matchesDomain('neurology')).toBe(true);
    });

    it('should return false when agent does not match domain', () => {
      expect(agent.matchesDomain('dermatology')).toBe(false);
      expect(agent.matchesDomain('oncology')).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation without sensitive data', () => {
      const json = agent.toJSON();

      expect(json).toEqual({
        id: 'test-agent-1',
        name: 'medical-expert',
        displayName: 'Medical Expert',
        description: 'Expert in medical diagnosis and treatment',
        tier: 2,
        capabilities: ['medical-knowledge', 'diagnosis', 'treatment'],
        knowledgeDomains: ['cardiology', 'neurology'],
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
        ragEnabled: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      });

      // The toJSON method includes all properties, so we check the structure
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('displayName');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('tier');
      expect(json).toHaveProperty('capabilities');
      expect(json).toHaveProperty('knowledgeDomains');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty capabilities array', () => {
      const emptyAgent = new Agent(
        'empty-agent',
        'empty',
        'Empty Agent',
        'Agent with no capabilities',
        'You are an empty agent.',
        [],
        1,
        [],
        'gpt-3.5-turbo',
        0.5,
        2000,
        false,
        new Date(),
        new Date()
      );

      const intent = { requiredCapabilities: ['any-capability'], domain: 'any', complexity: 'low' };
      expect(emptyAgent.canHandleQuery(intent)).toBe(false);
    });

    it('should handle empty knowledge domains', () => {
      const noDomainAgent = new Agent(
        'no-domain-agent',
        'no-domain',
        'No Domain Agent',
        'Agent with no domains',
        'You are a general agent.',
        ['general-knowledge'],
        1,
        [],
        'gpt-3.5-turbo',
        0.5,
        2000,
        false,
        new Date(),
        new Date()
      );

      expect(noDomainAgent.matchesDomain('any-domain')).toBe(false);
    });
  });
});

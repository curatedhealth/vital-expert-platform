/**
 * Mode 1 Integration Tests (Python orchestration bridge)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from '@jest/globals';
import { executeMode1 } from '../../../../features/chat/services/mode1-manual-interactive';

describe('Mode 1 Integration (Python AI engine)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.AI_ENGINE_URL = 'https://ai-engine.test';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('streams metadata chunks followed by assistant content', async () => {
    const mockJson = vi.fn().mockResolvedValue({
      agent_id: 'agent-123',
      content: 'This is a synthesized advisory response.',
      confidence: 0.78,
      citations: [
        { id: 'cit-1', title: 'Clinical Guidance 2024', url: 'https://example.org/guidance', confidence_score: 0.92 },
        { id: 'cit-2', title: 'FDA Safety Notice', url: 'https://fda.gov/safety', confidence_score: 0.88 },
      ],
      metadata: {
        processing_metadata: { rag: { sources: 2 } },
        request: { enable_rag: true, enable_tools: false },
      },
      processing_time_ms: 1450,
    });

    const mockResponse = {
      ok: true,
      json: mockJson,
    } as unknown as Response;

    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValue(mockResponse);

    const generator = executeMode1({
      agentId: 'agent-123',
      message: 'Summarize the latest regulatory guidance for wearable heart monitors.',
      enableRAG: true,
      enableTools: false,
      selectedRagDomains: ['regulatory-affairs'],
    });

    const chunks: string[] = [];
    for await (const chunk of generator) {
      chunks.push(chunk);
    }

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://ai-engine.test/api/mode1/manual',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toMatch(/^__mode1_meta__/);
    expect(chunks[1]).toMatch(/^__mode1_meta__/);
    expect(chunks[2]).toBe('This is a synthesized advisory response.');
  });

  it('raises Mode1Error when AI engine responds with failure', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ detail: 'Agent not found' }),
    } as unknown as Response;

    vi.spyOn(global, 'fetch' as any).mockResolvedValue(mockErrorResponse);

    await expect(async () => {
      const generator = executeMode1({
        agentId: 'missing-agent',
        message: 'Hello?',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _chunk of generator) {
        // consume generator
      }
    }).rejects.toMatchObject({
      code: expect.any(String),
    });
  });
});

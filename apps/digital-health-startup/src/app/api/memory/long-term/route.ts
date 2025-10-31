import { NextRequest, NextResponse } from 'next/server';

import {
  createAutoLearningMemory,
  longTermMemoryService,
} from '@/features/chat/memory/long-term-memory';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, agentId, userMessage, assistantMessage } = await request.json();

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    if (!userMessage || !assistantMessage) {
      return NextResponse.json(
        { success: false, error: 'userMessage and assistantMessage are required' },
        { status: 400 }
      );
    }

    const memoryKey = `${userId}::${agentId}`;
    const existingMemory = await longTermMemoryService.retrieveLongTermMemory(memoryKey);

    const conversationHistory = Array.isArray(existingMemory?.history)
      ? existingMemory.history
      : [];

    conversationHistory.push({
      userMessage,
      assistantMessage,
      timestamp: new Date().toISOString(),
    });

    await longTermMemoryService.storeLongTermMemory(memoryKey, {
      ...(existingMemory ?? {}),
      history: conversationHistory.slice(-100), // keep last 100 interactions
    });

    let extractedFacts: unknown[] = [];
    try {
      const autoLearning = createAutoLearningMemory(userId, true);
      extractedFacts = await autoLearning.extractFacts(userId, userMessage, assistantMessage);
    } catch (error) {
      console.warn('[LongTermMemory] Fact extraction failed:', error);
    }

    return NextResponse.json({
      success: true,
      facts: extractedFacts,
    });
  } catch (error) {
    console.error('[LongTermMemory] Error handling request:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update long-term memory',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const agentId = searchParams.get('agentId');

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    const memoryKey = `${userId}::${agentId}`;
    const memory = await longTermMemoryService.retrieveLongTermMemory(memoryKey);

    let facts: Array<{
      id: string;
      fact: string;
      category: string;
      confidence: number;
      source: string;
      createdAt: string;
    }> = [];

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('user_facts')
        .select('id, fact, category, confidence, source, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && Array.isArray(data)) {
        facts = data.map((row) => ({
          id: row.id,
          fact: row.fact,
          category: row.category,
          confidence: row.confidence,
          source: row.source,
          createdAt: row.created_at,
        }));
      }
    } catch (error) {
      console.warn('[LongTermMemory] Failed to load user facts:', error);
    }

    return NextResponse.json({
      success: true,
      memory: memory ?? {},
      facts,
    });
  } catch (error) {
    console.error('[LongTermMemory] Error fetching memory:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve long-term memory',
      },
      { status: 500 }
    );
  }
}

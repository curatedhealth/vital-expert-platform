'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

type Mode = 'mode_1' | 'mode_2';

export type ThinkingState = {
  isThinking: boolean;
  steps: string[];
  logs: string[];
};

export type RailMode = 'agent' | 'evidence' | 'debug';

export type Source = {
  id: string;
  title?: string;
  url?: string;
  abstract?: string;
};

export type Agent = {
  id: string;
  name: string;
  avatar?: string;
  capabilities?: string[];
  level?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  agentId?: string;
  agentName?: string;
  citations?: Source[];
  type?: 'system_agent_select' | 'message';
  agent?: Agent;
};

type UpdateEvent =
  | { type: 'token'; data: string }
  | { type: 'agent_selected'; data: Agent }
  | { type: 'thinking_start'; data?: string }
  | { type: 'thinking_step'; data: string }
  | { type: 'thinking_end'; data?: string }
  | { type: 'citation'; data: Source }
  | { type: 'citation_focus'; data: Source }
  | { type: 'message'; data: Message };

interface InteractiveState {
  mode: Mode;
  conversationId: string | null;
  messages: Message[];
  activeAgent: Agent | null;
  thinkingState: ThinkingState;
  railMode: RailMode;
  activeSource: Source | null;

  setMode: (mode: Mode) => void;
  setMessages: (messages: Message[]) => void;
  setActiveAgent: (agent: Agent | null) => void;
  setThinking: (thinking: ThinkingState) => void;
  updateFromStream: (event: UpdateEvent) => void;
  addUserMessage: (content: string) => void;
  focusCitation: (source: Source) => void;
  reset: () => void;
}

export const useInteractiveStore = create<InteractiveState>((set, get) => ({
  mode: 'mode_1',
  conversationId: null,
  messages: [],
  activeAgent: null,
  thinkingState: { isThinking: false, steps: [], logs: [] },
  railMode: 'agent',
  activeSource: null,

  setMode: (mode) => set({ mode }),
  setMessages: (messages) => set({ messages }),
  setActiveAgent: (agent) => set({ activeAgent: agent }),
  setThinking: (thinking) => set({ thinkingState: thinking }),

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: uuidv4(),
          role: 'user',
          content,
          timestamp: new Date(),
          type: 'message',
        },
      ],
    })),

  updateFromStream: (event) => {
    set((state) => {
      switch (event.type) {
        case 'token': {
          const updated = [...state.messages];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: `${last.content}${event.data}`,
            };
          } else {
            updated.push({
              id: uuidv4(),
              role: 'assistant',
              content: event.data,
              timestamp: new Date(),
              type: 'message',
            });
          }
          return { messages: updated };
        }
        case 'agent_selected':
          return {
            activeAgent: event.data,
            railMode: 'agent',
            messages: [
              ...state.messages,
              {
                id: uuidv4(),
                role: 'system',
                content: 'Agent selected',
                type: 'system_agent_select',
                agent: event.data,
              },
            ],
          };
        case 'thinking_start':
          return {
            thinkingState: {
              ...state.thinkingState,
              isThinking: true,
              steps: event.data ? [event.data] : [],
            },
            railMode: 'evidence',
          };
        case 'thinking_step':
          return {
            thinkingState: {
              ...state.thinkingState,
              isThinking: true,
              steps: [...state.thinkingState.steps, event.data],
            },
            railMode: 'evidence',
          };
        case 'thinking_end':
          return {
            thinkingState: {
              ...state.thinkingState,
              isThinking: false,
            },
          };
        case 'citation':
          return {
            railMode: 'evidence',
            activeSource: event.data,
          };
        case 'citation_focus':
          return {
            railMode: 'evidence',
            activeSource: event.data,
          };
        case 'message':
          return {
            messages: [...state.messages, event.data],
          };
        default:
          return state;
      }
    });
  },

  focusCitation: (source) =>
    set({
      railMode: 'evidence',
      activeSource: source,
    }),

  reset: () =>
    set({
      messages: [],
      activeAgent: null,
      thinkingState: { isThinking: false, steps: [], logs: [] },
      railMode: 'agent',
      activeSource: null,
    }),
}));

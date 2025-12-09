// Stream events emitted from backend SSE for interactive chat (Modes 1/2)
export type StreamEvent =
  | {
      type: 'ui_update';
      component: 'VitalThinking';
      props: { steps: string[]; status?: string };
    }
  | {
      type: 'ui_update';
      component: 'VitalAgentCard';
      props: { agent: any; status?: string };
    }
  | { type: 'token'; data: string }
  | { type: 'citation'; data: { id: string; source?: string; url?: string } }
  | { type: 'done'; data: any }
  | { type: string; [key: string]: any };

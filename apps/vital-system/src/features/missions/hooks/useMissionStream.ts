'use client';

import { useEffect, useState } from 'react';

type MissionStreamState = {
  status: { currentStep: number; isStreaming: boolean };
  plan: any[];
  artifacts: any[];
  checkpoint: any | null;
  preflight: any | null;
  rawEvents: any[];
};

type StreamEvent = { type?: string; data?: any };

export interface MissionStreamOptions {
  missionId?: string;
  buildStreamUrl?: (missionId: string) => string;
}

export function useMissionStream(options: MissionStreamOptions = {}) {
  const { missionId, buildStreamUrl } = options;

  const [state, setState] = useState<MissionStreamState>({
    status: { currentStep: 0, isStreaming: true },
    plan: [],
    artifacts: [],
    checkpoint: null,
    preflight: null,
    rawEvents: [],
  });

  useEffect(() => {
    if (!missionId) return;
    const url = buildStreamUrl ? buildStreamUrl(missionId) : `/api/v1/missions/${missionId}/stream`;
    const es = new EventSource(url);

    const handleEvent = (ev: MessageEvent) => {
      let parsed: StreamEvent = { data: ev.data };
      try {
        parsed = JSON.parse(ev.data);
      } catch {
        /* keep raw */
      }

      const type = (parsed as any).type || ev.type || 'message';
      const data = (parsed as any).data ?? parsed;

      setState((prev) => {
        switch (type) {
          case 'plan':
          case 'plan_update':
            return { ...prev, plan: data.plan || data };
          case 'artifact':
            return { ...prev, artifacts: [...prev.artifacts, data] };
          case 'checkpoint':
            return { ...prev, checkpoint: data };
          case 'preflight':
            return { ...prev, preflight: data };
          case 'progress':
            return {
              ...prev,
              status: {
                ...prev.status,
                currentStep: data.current_step ?? data.currentStep ?? prev.status.currentStep,
              },
            };
          case 'complete':
          case 'done':
            return { ...prev, status: { ...prev.status, isStreaming: false } };
          case 'error':
            return { ...prev, status: { ...prev.status, isStreaming: false } };
          default:
            return prev;
        }
      });

      setState((prev) => ({ ...prev, rawEvents: [...prev.rawEvents, { type, data }] }));
    };

    es.onmessage = handleEvent;
    es.addEventListener('progress', handleEvent);
    es.addEventListener('complete', handleEvent);
    es.addEventListener('done', handleEvent);
    es.addEventListener('checkpoint', handleEvent);
    es.addEventListener('artifact', handleEvent);
    es.addEventListener('preflight', handleEvent);
    es.addEventListener('plan', handleEvent);

    es.onerror = () => {
      setState((prev) => ({ ...prev, status: { ...prev.status, isStreaming: false } }));
      es.close();
    };

    return () => es.close();
  }, [missionId, buildStreamUrl]);

  return state;
}

export default useMissionStream;

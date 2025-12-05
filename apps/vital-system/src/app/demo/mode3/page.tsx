"use client";

import { useEffect, useRef, useState } from "react";

interface Agent {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
}

interface EventLog {
  ts: string;
  event: string;
  content?: string;
  raw?: unknown;
}

interface ReasoningSummary {
  strategy?: string;
  plan?: unknown;
  plan_confidence?: number;
  iterations?: number;
  hitl_required?: boolean;
  confidence_threshold?: number;
}

function randomSession() {
  return `demo-${Math.random().toString(36).slice(2, 10)}`;
}

export default function Mode3DemoPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState("");
  const [jtbd, setJtbd] = useState("deep_research");
  const [message, setMessage] = useState(
    "Design a 510(k) submission strategy for a Class II wearable glucose monitor."
  );
  const [sessionId, setSessionId] = useState(randomSession());
  const [enableRag, setEnableRag] = useState(true);
  const [ragDomains, setRagDomains] = useState("digital_health,regulatory_affairs");
  const [requestedTools, setRequestedTools] = useState("web_search,db_lookup");
  const [output, setOutput] = useState("");
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [reasoning, setReasoning] = useState<ReasoningSummary | null>(null);

  const appendEvent = (event: string, payload: unknown, content?: string) => {
    setEvents((prev) => [
      {
        ts: new Date().toISOString(),
        event,
        content,
        raw: payload,
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setAgentsLoading(true);
        setAgentsError(null);

        const params = new URLSearchParams({ status: "active", limit: "50" });
        const tryEndpoints = [
          `/api/agents?${params.toString()}`,           // primary (may require auth)
          `/api/agents-crud-noauth?${params.toString()}`, // fallback (no-auth)
          `/api/agents-crud?showAll=true`,               // legacy CRUD
        ];

        let list: Agent[] = [];
        let lastStatus: number | undefined;

        for (const url of tryEndpoints) {
          try {
            const resp = await fetch(url);
            lastStatus = resp.status;
            if (!resp.ok) continue;
            const data = await resp.json();
            const candidates = [
              data?.data,
              data?.agents,
              data?.results,
              data?.items,
              Array.isArray(data) ? data : undefined,
            ].filter(Boolean);
            for (const c of candidates) {
              if (Array.isArray(c) && c.length > 0) {
                list = c;
                break;
              }
            }
            if (list.length === 0 && Array.isArray(candidates[0])) {
              list = candidates[0];
            }
            if (list.length > 0) break;
          } catch (err) {
            // continue to next endpoint
          }
        }

        if (list.length === 0) {
          const msg = `Could not load agents (last status ${lastStatus ?? "n/a"}). Enter agent ID manually.`;
          setAgentsError(msg);
          appendEvent("agents_error", { status: lastStatus, message: msg });
        } else {
          setAgents(list);
          setAgentId(list[0].id || "");
        }
      } catch (err) {
        const msg = `Agents fetch error: ${String(err)}`;
        setAgentsError(msg);
        appendEvent("agents_error", { message: msg });
      } finally {
        setAgentsLoading(false);
      }
    };
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    if (!agentId) {
      setUiError("Please select or enter an agent ID.");
      return;
    }
    setOutput("");
    setEvents([]);
    setReasoning(null);
    setLoading(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const resp = await fetch("/api/ask-expert/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": "demo-tenant",
          "x-user-id": "demo-user",
        },
        credentials: "include",
        body: JSON.stringify({
          mode: "3",
          agent_id: agentId,
          message,
          session_id: sessionId,
          hitl_enabled: true,
          hitl_safety_level: "balanced",
          enable_rag: enableRag,
          jtbd,
          selected_rag_domains: ragDomains
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          requested_tools: requestedTools
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        setUiError(`Request failed: ${resp.status} ${resp.statusText}`);
        appendEvent("error", { status: resp.status, body: errText });
        setLoading(false);
        return;
      }

      if (!resp.body) {
        const err = "No response body";
        setUiError(err);
        appendEvent("error", { message: err });
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payloadStr = line.slice(5).trim();
          if (!payloadStr) continue;
          try {
            const payload = JSON.parse(payloadStr);
            const eventName = payload.event || payload.type || "message";

            if (eventName === "token" && payload.content) {
              setOutput((prev) => prev + payload.content);
            }
            if (eventName === "done" && payload.content) {
              setOutput((prev) => prev + payload.content);
            }

            appendEvent(eventName, payload, payload.content || payload.message);
            if (eventName === "pattern") {
              setReasoning((prev) => ({
                ...(prev || {}),
                strategy: payload.strategy,
                hitl_required: payload.hitl_required,
                confidence_threshold: payload.confidence_threshold,
                iterations: payload.iterations,
              }));
            }
            if (eventName === "plan") {
              setReasoning((prev) => ({
                ...(prev || {}),
                plan: payload.plan,
                plan_confidence: payload.plan_confidence,
              }));
            }
            if (eventName === "iteration_summary") {
              setReasoning((prev) => ({
                ...(prev || {}),
                iterations: payload.iterations ?? prev?.iterations,
              }));
            }
            if (eventName === "done" && payload.autonomous_reasoning) {
              setReasoning((prev) => ({
                ...(prev || {}),
                strategy: payload.autonomous_reasoning?.strategy ?? prev?.strategy,
                plan: payload.autonomous_reasoning?.plan ?? prev?.plan,
                plan_confidence:
                  payload.autonomous_reasoning?.plan_confidence ?? prev?.plan_confidence,
                iterations:
                  payload.autonomous_reasoning?.iterations ?? prev?.iterations,
              }));
            }
          } catch (err) {
            appendEvent("parse_error", { err: String(err), raw: payloadStr });
          }
        }
      }
    } catch (err) {
      if ((err as any).name === "AbortError") {
        appendEvent("aborted", { message: "Request aborted" });
      } else {
        appendEvent("error", { message: String(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = () => {
    controllerRef.current?.abort();
    setLoading(false);
  };

  const resetSession = () => {
    setSessionId(randomSession());
    setOutput("");
    setEvents([]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mode 3 Demo (Manual Autonomous)</h1>
          <p className="text-sm text-muted-foreground">
            Streams Mode 3 via /api/ask-expert/stream with RAG/tool controls.
          </p>
        </div>
        <button className="text-sm underline text-blue-600" onClick={resetSession}>
          New session
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-card p-4 rounded-md border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col text-sm gap-1">
            Agent
            <select
              className="border rounded px-2 py-2 bg-background"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={agents.length === 0}
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.display_name || a.name || a.id}
                </option>
              ))}
              {agents.length === 0 && <option value="">No agents loaded</option>}
            </select>
            {agentsLoading && (
              <span className="text-xs text-muted-foreground">Loading agents…</span>
            )}
            {agentsError && (
              <span className="text-xs text-red-600">
                {agentsError}
              </span>
            )}
            <input
              className="mt-2 border rounded px-2 py-1 bg-background"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="Or enter agent ID manually"
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Session ID
            <input
              className="border rounded px-2 py-1 bg-background"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col text-sm gap-1">
            JTBD Template
            <select
              className="border rounded px-2 py-2 bg-background"
              value={jtbd}
              onChange={(e) => setJtbd(e.target.value)}
            >
              <option value="deep_research">Deep Research</option>
              <option value="strategy_options">Strategy</option>
              <option value="tactical_planning">Tactical Planning</option>
              <option value="evaluation_critique">Evaluation</option>
            </select>
          </label>
        </div>
        {uiError && (
          <div className="text-sm text-red-600">
            {uiError}
          </div>
        )}
        <label className="flex flex-col text-sm gap-1">
          Message
          <textarea
            className="border rounded px-2 py-2 min-h-[120px] bg-background"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enableRag}
              onChange={(e) => setEnableRag(e.target.checked)}
            />
            Enable RAG
          </label>
          <label className="flex flex-col text-sm gap-1">
            RAG Domains (comma-separated)
            <input
              className="border rounded px-2 py-1 bg-background"
              value={ragDomains}
              onChange={(e) => setRagDomains(e.target.value)}
              placeholder="domain_a,domain_b"
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Requested Tools (comma-separated)
            <input
              className="border rounded px-2 py-1 bg-background"
              value={requestedTools}
              onChange={(e) => setRequestedTools(e.target.value)}
              placeholder="web_search,db_lookup"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Streaming…" : "Run Mode 3"}
          </button>
          {loading && (
            <button type="button" onClick={handleAbort} className="px-3 py-2 border rounded">
              Abort
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Streamed Output</h2>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-6 min-h-[160px]">
            {output || "(waiting for tokens…)"}
          </div>
        </div>
        <div className="border rounded p-3 bg-card max-h-[320px] overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Event Log</h2>
          </div>
          <ul className="space-y-2 text-sm">
            {events.map((ev, idx) => (
              <li key={`${ev.ts}-${idx}`} className="border-b pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ev.event}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ev.ts).toLocaleTimeString()}
                  </span>
                </div>
                {ev.content && <div className="text-muted-foreground text-xs">{ev.content}</div>}
              </li>
            ))}
            {events.length === 0 && (
              <li className="text-xs text-muted-foreground">No events yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border rounded p-3 bg-card">
        <h2 className="font-semibold mb-2">Reasoning & Plan</h2>
        {reasoning ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Strategy:</span>{" "}
              {reasoning.strategy || "n/a"}{" "}
              {reasoning.iterations != null && (
                <span className="text-muted-foreground">
                  (iterations: {reasoning.iterations})
                </span>
              )}
            </div>
            <div>
              <span className="font-medium">HITL required:</span>{" "}
              {String(reasoning.hitl_required ?? false)}{" "}
              {reasoning.confidence_threshold != null && (
                <span className="text-muted-foreground">
                  (confidence threshold: {reasoning.confidence_threshold})
                </span>
              )}
            </div>
            {reasoning.plan && (
              <details className="border rounded p-2 bg-background">
                <summary className="cursor-pointer font-medium">
                  Plan (confidence: {reasoning.plan_confidence ?? "n/a"})
                </summary>
                <pre className="text-xs whitespace-pre-wrap mt-2">
                  {JSON.stringify(reasoning.plan, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No reasoning metadata yet.</div>
        )}
      </div>
    </div>
  );
}

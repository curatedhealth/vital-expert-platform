"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, Bot, FileText, Sparkles, Copy, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id?: string;
  type: "orchestrator" | "agent" | "summary" | "system";
  role: string;
  content: string;
  timestamp: string;
  agent_id?: string;
  agent_name?: string;
  metadata?: {
    round?: number;
    role?: string;
    consensus_level?: number;
  };
}

interface StreamingPanelConsultationProps {
  question: string;
  panelId: string;
  /** Agent IDs for the panel consultation */
  agentIds?: string[];
  /** @deprecated Use agentIds instead */
  expertIds?: string[];
  tenantId: string;
  enableDebate?: boolean;
  maxRounds?: number;
  onComplete?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
}

export function StreamingPanelConsultation({
  question,
  panelId,
  agentIds,
  expertIds, // Deprecated - use agentIds
  tenantId,
  enableDebate = true,
  maxRounds = 3,
  onComplete,
  onError,
}: StreamingPanelConsultationProps) {
  // Resolve effective agent IDs (agentIds takes precedence over deprecated expertIds)
  const effectiveAgentIds = agentIds || expertIds || [];
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Start streaming on mount
  useEffect(() => {
    startStreaming();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startStreaming = async () => {
    setIsStreaming(true);
    setError(null);
    setMessages([]);

    // Filter out any fallback IDs before sending to backend (safety check)
    const validAgentIds = effectiveAgentIds.filter(id => {
      return id && !id.startsWith('fallback-') && !id.startsWith('agent-');
    });

    if (validAgentIds.length === 0) {
      const errorMsg = "No valid agents selected. Please ensure agents exist in the database.";
      setError(errorMsg);
      setIsStreaming(false);
      onError?.(new Error(errorMsg));
      return;
    }

    if (validAgentIds.length !== effectiveAgentIds.length) {
      console.warn(
        `[StreamingPanelConsultation] Filtered out ${effectiveAgentIds.length - validAgentIds.length} fallback agent IDs. ` +
        `Sending ${validAgentIds.length} valid agent IDs to backend.`
      );
    }

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ask-panel-enhanced/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          template_slug: panelId,
          selected_agent_ids: validAgentIds,
          tenant_id: tenantId,
          enable_debate: enableDebate,
          max_rounds: maxRounds,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove "data: " prefix
            if (data.trim()) {
              try {
                const event = JSON.parse(data);

                if (event.type === "message" && event.data) {
                  const eventData = event.data;
                  const isModerator =
                    eventData.role === "moderator" ||
                    eventData.agent_name === "Moderator" ||
                    (typeof eventData.content === "string" &&
                      eventData.content.toLowerCase().includes("moderator"));

                  const mapped: Message = {
                    id: eventData.id || `msg-${Date.now()}-${Math.random()}`,
                    type: isModerator
                      ? "agent" // Show moderator as normal assistant message
                      : eventData.type === "summary"
                      ? "summary"
                      : eventData.type === "system"
                      ? "system"
                      : eventData.type === "agent" || eventData.type === "orchestrator"
                      ? eventData.type
                      : "agent",
                    role: isModerator ? "moderator" : eventData.role || "assistant",
                    content: eventData.content || "",
                    timestamp: eventData.timestamp
                      ? new Date(eventData.timestamp).toLocaleTimeString()
                      : new Date().toLocaleTimeString(),
                    agent_id: eventData.agent_id,
                    agent_name: isModerator
                      ? "Moderator"
                      : eventData.agent_name || eventData.role,
                    metadata: eventData.metadata,
                  };

                  setMessages((prev) => [...prev, mapped]);
                } else if (event.type === "complete") {
                  console.log("✅ Panel consultation completed", event.data);
                  setIsStreaming(false);
                  if (onComplete) {
                    onComplete(messages);
                  }
                } else if (event.type === "error") {
                  console.error("❌ Stream error:", event.data);
                  setError(event.data.message || "An error occurred");
                  setIsStreaming(false);
                  if (onError) {
                    onError(new Error(event.data.message));
                  }
                }
              } catch (e) {
                console.error("Failed to parse SSE event:", e, data);
              }
            }
          }
        }
      }

      setIsStreaming(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          console.log("Stream cancelled by user");
        } else {
          console.error("Streaming error:", err);
          setError(err.message);
          if (onError) {
            onError(err);
          }
        }
      }
      setIsStreaming(false);
    }
  };

  const copyAllMessages = () => {
    const text = messages
      .map(
        (msg) =>
          `[${msg.type.toUpperCase()}] ${msg.role}\n${msg.content}\n---`
      )
      .join("\n\n");

    navigator.clipboard.writeText(text);
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `panel-consultation-${Date.now()}.json`;
    link.click();
  };

  const getMessageIcon = (type: Message["type"]) => {
    switch (type) {
      case "orchestrator":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "agent":
        return <Bot className="w-5 h-5 text-blue-500" />;
      case "summary":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "system":
        return <Sparkles className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMessageTheme = (type: Message["type"]) => {
    switch (type) {
      case "orchestrator":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800";
      case "agent":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
      case "summary":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
      case "system":
        return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Panel Consultation</CardTitle>
            {isStreaming && (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Streaming
              </Badge>
            )}
            {!isStreaming && messages.length > 0 && (
              <Badge variant="outline" className="bg-green-50">
                Complete
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllMessages}
              disabled={messages.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJSON}
              disabled={messages.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          <strong>Question:</strong> {question}
        </p>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary">{effectiveAgentIds.length} Agents</Badge>
          {enableDebate && <Badge variant="secondary">Multi-Round Debate</Badge>}
          <Badge variant="secondary">Max {maxRounds} Rounds</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <ScrollArea
          ref={scrollAreaRef}
          className="h-[600px] w-full rounded-md border p-4"
        >
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Waiting for panel responses...</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <Card className={`${getMessageTheme(message.type)} border`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getMessageIcon(message.type)}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {message.agent_name || message.role}
                        </p>
                        {message.metadata?.round && (
                          <p className="text-xs text-muted-foreground">
                            Round {message.metadata.round}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.metadata?.consensus_level !== undefined && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Consensus Level:{" "}
                          {Math.round(message.metadata.consensus_level * 100)}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {index < messages.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

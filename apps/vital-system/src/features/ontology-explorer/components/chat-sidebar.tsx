"use client";

/**
 * AI Chat Sidebar
 *
 * Natural language interface for graph exploration.
 * Users can ask questions about the ontology and get
 * the graph updated based on their queries.
 */

import { useState, useRef, useEffect } from "react";
import { useGraphStore } from "../stores/graph-store";
import type { ChatMessage } from "../types/graph.types";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  X,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Example queries users can try
const EXAMPLE_QUERIES = [
  "Show me all Medical Affairs roles",
  "What JTBDs have high AI potential?",
  "Find agents that handle regulatory tasks",
  "Show the path from Clinical Operations to patient outcomes",
  "Which roles perform the most JTBDs?",
];

export function ChatSidebar({ isOpen, onClose, className }: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chatMessages,
    addChatMessage,
    clearChat,
    searchGraph,
    fetchOntologyGraph,
    highlightNodes,
  } = useGraphStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);

    // Add user message
    addChatMessage({
      role: "user",
      content: userMessage,
    });

    try {
      // Process the query - for now, simple keyword matching
      // In production, this would call an AI service to parse the query
      const response = await processQuery(userMessage);

      addChatMessage({
        role: "assistant",
        content: response.message,
        graphAction: response.action,
      });

      // Execute graph action if present
      if (response.action) {
        switch (response.action.type) {
          case "highlight":
            if (response.action.nodeIds) {
              highlightNodes(response.action.nodeIds);
            }
            break;
          case "filter":
            // Apply filter based on query
            await fetchOntologyGraph({
              function_filter: response.action.query,
            });
            break;
          case "query":
            if (response.action.query) {
              await searchGraph(response.action.query);
            }
            break;
        }
      }
    } catch (error) {
      addChatMessage({
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "w-80 bg-background border-l flex flex-col h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Graph Navigator</h3>
            <p className="text-xs text-muted-foreground">AI-powered exploration</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h4 className="font-medium mb-2">Ask me anything</h4>
            <p className="text-sm text-muted-foreground mb-4">
              I can help you explore the ontology graph with natural language
              queries.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Try asking:
              </p>
              {EXAMPLE_QUERIES.map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(query)}
                  className="w-full text-left px-3 py-2 bg-muted/50 hover:bg-muted rounded-md text-sm flex items-center gap-2 group"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1">{query}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the ontology..."
            className="flex-1 px-3 py-2 bg-muted rounded-md text-sm focus:ring-1 focus:ring-primary border-none"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {isProcessing && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Processing...
          </p>
        )}
      </form>
    </div>
  );
}

// Chat message bubble component
function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary" : "bg-gradient-to-br from-violet-500 to-purple-600"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.graphAction && (
          <div className="mt-2 pt-2 border-t border-current/10 text-xs opacity-75">
            Action: {message.graphAction.type}
            {message.graphAction.nodeIds && (
              <span> ({message.graphAction.nodeIds.length} nodes)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple query processor (placeholder for AI integration)
async function processQuery(query: string): Promise<{
  message: string;
  action?: ChatMessage["graphAction"];
}> {
  const lowerQuery = query.toLowerCase();

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simple keyword matching
  if (lowerQuery.includes("medical affairs")) {
    return {
      message:
        "I'll filter the graph to show Medical Affairs roles and their related JTBDs.",
      action: {
        type: "filter",
        query: "Medical Affairs",
      },
    };
  }

  if (lowerQuery.includes("ai potential") || lowerQuery.includes("automation")) {
    return {
      message:
        "Searching for JTBDs with high AI automation potential. I'll highlight nodes with automation scores above 70%.",
      action: {
        type: "query",
        query: "automation",
      },
    };
  }

  if (lowerQuery.includes("agent") || lowerQuery.includes("regulatory")) {
    return {
      message:
        "Searching for agents that handle regulatory tasks...",
      action: {
        type: "query",
        query: "regulatory agent",
      },
    };
  }

  if (lowerQuery.includes("role") || lowerQuery.includes("jtbd")) {
    return {
      message:
        "I'll search for roles and their associated JTBDs.",
      action: {
        type: "query",
        query: query,
      },
    };
  }

  // Default response
  return {
    message: `I'll search the graph for "${query}". The matching nodes will be highlighted.`,
    action: {
      type: "query",
      query: query,
    },
  };
}

export default ChatSidebar;

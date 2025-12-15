"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@vital/ui";
import { Button } from "@vital/ui";
import { Badge } from "@vital/ui";
import { Input } from "@vital/ui";
import { Textarea } from "@vital/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@vital/ui";
import { cn } from "@/lib/shared/utils";

// Read CSRF token from cookies (supports __Host-csrf-token or csrf_token)
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie?.split(";") || [];
  for (const c of parts) {
    const [name, ...rest] = c.trim().split("=");
    if (!name) continue;
    if (name === "__Host-csrf-token" || name === "csrf_token") {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

// Simple OpenAI client wrapper (browser-safe fetch to your Next API route)
async function fetchEnhancedPrompt(payload: {
  prompt: string;
  instructions?: string;
  mode: "auto" | "rewrite";
}) {
  const csrf = getCsrfTokenFromCookie();
  const resp = await fetch("/api/prompt-enhancer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return data.enhanced as string;
}

type Suite = {
  code: string;
  name: string;
};

const SUITES: Suite[] = [
  { code: "RULES", name: "RULES™ (Regulatory)" },
  { code: "TRIALS", name: "TRIALS™ (Clinical Research)" },
  { code: "GUARD", name: "GUARD™ (Safety)" },
  { code: "VALUE", name: "VALUE™ (Market Access)" },
  { code: "BRIDGE", name: "BRIDGE™ (Digital Health)" },
  { code: "PROOF", name: "PROOF™ (Clinical Validation)" },
  { code: "CRAFT", name: "CRAFT™ (Medical Writing)" },
  { code: "SCOUT", name: "SCOUT™ (Data Analytics)" },
  { code: "PROJECT", name: "PROJECT™ (Project Mgmt)" },
];

const COMPLEXITIES = ["basic", "intermediate", "advanced", "expert"] as const;

interface PromptEnhancerProps {
  value: string;
  onApply: (enhanced: string) => void;
  triggerClassName?: string;
  selectedAgentName?: string;
}

export function PromptEnhancer({ value, onApply, triggerClassName, selectedAgentName }: PromptEnhancerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"auto" | "rewrite">("auto");
  const [instructions, setInstructions] = useState("Apply PRISM gold-standard structure; be concise; no PII; enforce compliance/fair balance.");
  const [suite, setSuite] = useState<string>("VALUE");
  const [complexity, setComplexity] = useState<string>("intermediate");
  const [enhanced, setEnhanced] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableApply = useMemo(() => loading || !value.trim(), [loading, value]);

  const handleEnhance = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        prompt: value,
        instructions: `${instructions}\nSuite: ${suite}\nComplexity: ${complexity}${selectedAgentName ? `\nAgent: ${selectedAgentName}` : ""}`,
        mode,
      };
      const out = await fetchEnhancedPrompt(payload);
      setEnhanced(out);
    } catch (err: any) {
      setError(err?.message || "Failed to enhance");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (enhanced.trim()) {
      onApply(enhanced);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", triggerClassName)}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (target?.closest('[data-radix-select-content],[data-radix-select-portal],[role="listbox"]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Prompt AI Enhancer</DialogTitle>
            <DialogDescription>
              Transform your prompt with PRISM gold-standard structure or AI rewrite.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Select value={suite} onValueChange={setSuite}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Suite" />
                </SelectTrigger>
                <SelectContent>
                  {SUITES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-Enhance</SelectItem>
                  <SelectItem value="rewrite">Rewrite/Structure</SelectItem>
                </SelectContent>
              </Select>

              {selectedAgentName && (
                <Badge variant="outline">Agent: {selectedAgentName}</Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Optional instructions</div>
              <Input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g., enforce constraints, add context fields, keep concise"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Original Prompt</div>
              <Textarea value={value} readOnly className="min-h-[120px]" />
            </div>

            <div className="flex items-center gap-3">
              <Button disabled={disableApply} onClick={handleEnhance}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Enhance
              </Button>
              {error && <span className="text-xs text-destructive">{error}</span>}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Enhanced Prompt</div>
              <Textarea
                value={enhanced}
                onChange={(e) => setEnhanced(e.target.value)}
                placeholder="Enhanced prompt will appear here"
                className="min-h-[180px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button disabled={!enhanced.trim()} onClick={handleApply}>
                <Check className="h-4 w-4 mr-1" /> Apply Enhanced Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

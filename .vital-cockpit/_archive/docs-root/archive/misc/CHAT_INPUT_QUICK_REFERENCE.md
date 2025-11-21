# Chat Input Component - Quick Reference Card

## 🎯 What Was Added

```
┌─────────────────────────────────────────────────────────┐
│  Enhanced Chat Input Component                          │
│  ═══════════════════════════════════════════════════════│
│                                                          │
│  1. 🤖 AI MODELS (25+)                                   │
│     • OpenAI: GPT-5, GPT-4.1, GPT-4, GPT-3.5           │
│     • Google: Gemini 2.5 Pro, Gemini Flash             │
│     • Anthropic: Claude 4, Claude 3                    │
│     • HuggingFace: Llama, Mixtral, CuratedHealth       │
│                                                          │
│  2. 📚 RAG SOURCES (Multi-select)                       │
│     • All knowledge bases                              │
│     • Domain categorization                            │
│     • Description tooltips                             │
│                                                          │
│  3. 🔧 TOOLS (Top 10)                                   │
│     • Most-used tools ranked                           │
│     • Category badges                                  │
│     • Usage-based sorting                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📝 Minimal Setup (3 Steps)

### Step 1: Import
```tsx
import { ChatInput } from '@/features/chat/components/chat-input';
```

### Step 2: State
```tsx
const [selectedRags, setSelectedRags] = useState<string[]>([]);
const [selectedTools, setSelectedTools] = useState<string[]>([]);
```

### Step 3: Props
```tsx
<ChatInput
  // ... existing props ...
  selectedRags={selectedRags}
  onRagsChange={setSelectedRags}
  selectedTools={selectedTools}
  onToolsChange={setSelectedTools}
/>
```

## 🎨 Visual Guide

```
Toolbar Layout:
┌──────────────────────────────────────────────────────┐
│ [✨ Enhance] [📎 Attach] [🎤 Voice]                   │
│                                                       │
│          [📊 RAGs (2)] [🔧 Tools (3)] [🤖 GPT-4]    │
│           Blue          Green          White         │
└──────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/llm/available-models` | GET | 25+ AI models |
| `/api/workflows/rags` | GET | All RAG sources |
| `/api/workflows/tools` | GET | Active tools |

## 💻 Copy-Paste Example

```tsx
'use client';

import { ChatInput } from '@/features/chat/components/chat-input';
import { useState } from 'react';

export function MyEnhancedChat() {
  const [message, setMessage] = useState('');
  const [selectedRags, setSelectedRags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          ragSources: selectedRags,    // ← Use these!
          tools: selectedTools           // ← Use these!
        })
      });
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatInput
      value={message}
      onChange={setMessage}
      onSend={handleSend}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }}
      isLoading={isLoading}
      selectedAgent={null}

      // New props ↓
      selectedRags={selectedRags}
      onRagsChange={setSelectedRags}
      selectedTools={selectedTools}
      onToolsChange={setSelectedTools}
    />
  );
}
```

## 🎯 Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedRags` | `string[]` | No | Array of selected RAG codes |
| `onRagsChange` | `(rags: string[]) => void` | No | Callback when RAGs change |
| `selectedTools` | `string[]` | No | Array of selected tool codes |
| `onToolsChange` | `(tools: string[]) => void` | No | Callback when tools change |
| `selectedModel` | `AIModel` | No | Currently selected AI model |
| `onModelChange` | `(model: AIModel) => void` | No | Callback when model changes |

## 🔍 Type Definitions

```typescript
interface RAGSource {
  id: string;
  code: string;      // ← Use this for selection
  name: string;
  description?: string;
  domain?: string;
}

interface Tool {
  id: string;
  code: string;      // ← Use this for selection
  name: string;
  description?: string;
  category?: string;
  usage_count?: number;
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider?: string;
  maxTokens?: number;
}
```

## ⚡ Quick Actions

### Pre-select Medical RAGs
```tsx
setSelectedRags(['medical-literature', 'fda-guidelines', 'clinical-trials']);
```

### Pre-select Research Tools
```tsx
setSelectedTools(['pubmed-search', 'drug-interactions', 'clinical-calculator']);
```

### Clear All Selections
```tsx
setSelectedRags([]);
setSelectedTools([]);
```

## 🎨 Color Scheme

- 🔵 **Blue** = RAGs (border-blue-200, bg-blue-50)
- 🟢 **Green** = Tools (border-green-200, bg-green-50)
- ⚪ **White** = Models (border-gray-200, bg-white)

## 📱 Responsive

- Desktop: All buttons in one row
- Mobile: Wraps automatically with `flex-wrap`

## ✅ Features Included

- ✅ Multi-select with checkboxes
- ✅ Real-time selection counters
- ✅ Domain/category badges
- ✅ Ranked tool display (#1, #2, etc.)
- ✅ Loading states
- ✅ Empty state messages
- ✅ Error handling with fallbacks
- ✅ TypeScript support
- ✅ Responsive design

## 🚀 Files to Check

1. **Component**: `apps/digital-health-startup/src/features/chat/components/chat-input.tsx`
2. **Usage Guide**: `apps/digital-health-startup/src/features/chat/components/CHAT_INPUT_USAGE.md`
3. **Example**: `apps/digital-health-startup/src/features/chat/components/ChatInputExample.tsx`
4. **Summary**: `CHAT_INPUT_UPDATE_SUMMARY.md` (this folder)

## 💡 Tips

1. **Test the example first**: Import `ChatInputExample` component
2. **Check console logs**: Component logs data fetching
3. **Use presets**: Create preset combinations for common use cases
4. **Handle selections**: Access via `selectedRags` and `selectedTools` arrays

## 📊 What You Get

```
Before:  [      Chat Input      ]
         Just a text box

After:   [📊 RAGs] [🔧 Tools] [🤖 Model]
         Full AI configuration control!
```

---

**Ready to use!** Just add the 3 props and you're done! 🎉

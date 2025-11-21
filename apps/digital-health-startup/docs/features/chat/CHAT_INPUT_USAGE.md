# Enhanced Chat Input Component - Usage Guide

The enhanced `ChatInput` component now includes comprehensive support for:
1. **All AI Models** - OpenAI (GPT-4, GPT-5), Google Gemini, Anthropic Claude, and Hugging Face models
2. **RAG Sources** - Multi-select knowledge sources for context-aware responses
3. **Top Tools** - Top 10 most-used tools selection

## Features Added

### 1. AI Model Selection
- **OpenAI Models**: GPT-5, GPT-5 mini, GPT-5 nano, GPT-4.1, GPT-4, GPT-3.5 Turbo
- **Google Gemini**: Gemini 2.5 Pro, Gemini Flash
- **Anthropic Claude**: Claude Opus 4, Claude Sonnet 4.5, Claude 3 family
- **Hugging Face**: Custom CuratedHealth medical models, Llama 3, Mixtral, Mistral, and more

### 2. RAG (Knowledge Sources) Selector
- Multi-select dropdown with checkboxes
- Shows all available RAG sources from your knowledge base
- Displays domain badges and descriptions
- Real-time selection count

### 3. Tools Selector
- Top 10 most-used tools
- Multi-select with ranking (#1, #2, etc.)
- Shows tool categories and descriptions
- Usage-based sorting

## Basic Usage

```tsx
import { ChatInput } from '@/features/chat/components/chat-input';
import { useState } from 'react';

function MyChat() {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>();
  const [selectedRags, setSelectedRags] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      // Your send logic here
      console.log('Message:', message);
      console.log('Model:', selectedModel);
      console.log('RAGs:', selectedRags);
      console.log('Tools:', selectedTools);

      // Make API call with selected options
      await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          modelId: selectedModel?.id,
          ragSources: selectedRags,
          tools: selectedTools,
        }),
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

      // Model selection
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}

      // RAG selection
      selectedRags={selectedRags}
      onRagsChange={setSelectedRags}

      // Tools selection
      selectedTools={selectedTools}
      onToolsChange={setSelectedTools}

      // Optional features
      enableVoice={true}
      onStop={() => setIsLoading(false)}
    />
  );
}
```

## Advanced Usage with Agent Integration

```tsx
import { ChatInput } from '@/features/chat/components/chat-input';
import { useAgent } from '@/hooks/useAgent';

function AgentChat() {
  const {
    message,
    setMessage,
    selectedAgent,
    send,
    isLoading,
    selectedModel,
    setSelectedModel,
  } = useAgent();

  const [selectedRags, setSelectedRags] = useState<string[]>([
    'medical-literature',
    'fda-guidelines'
  ]);

  const [selectedTools, setSelectedTools] = useState<string[]>([
    'pubmed-search',
    'drug-interactions'
  ]);

  return (
    <ChatInput
      value={message}
      onChange={setMessage}
      onSend={send}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      }}
      isLoading={isLoading}
      selectedAgent={selectedAgent}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      selectedRags={selectedRags}
      onRagsChange={setSelectedRags}
      selectedTools={selectedTools}
      onToolsChange={setSelectedTools}
    />
  );
}
```

## Component Props

```typescript
interface ChatInputProps {
  // Required
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  selectedAgent: Agent | null;

  // Optional - Voice
  enableVoice?: boolean;

  // Optional - Model Selection
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;

  // Optional - Stop Generation
  onStop?: () => void;

  // Optional - RAG Selection (NEW)
  selectedRags?: string[];
  onRagsChange?: (rags: string[]) => void;

  // Optional - Tools Selection (NEW)
  selectedTools?: string[];
  onToolsChange?: (tools: string[]) => void;
}
```

## Type Definitions

```typescript
export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider?: string;
  maxTokens?: number;
}

export interface RAGSource {
  id: string;
  code: string;
  name: string;
  source_type?: string;
  description?: string;
  domain?: string;
  source?: string;
}

export interface Tool {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  is_active?: boolean;
  usage_count?: number;
}
```

## API Endpoints Used

The component automatically fetches data from these endpoints:

1. **Models**: `GET /api/llm/available-models`
   - Returns all configured AI models with their capabilities
   - Falls back to default models if API fails

2. **RAGs**: `GET /api/workflows/rags`
   - Returns all available RAG/knowledge sources
   - Combines data from multiple tables

3. **Tools**: `GET /api/workflows/tools`
   - Returns all active tools
   - Automatically sorted by usage_count

## Visual Features

### RAG Selector (Blue Theme)
- 🔵 Blue badge showing "RAGs (X)" where X is selection count
- Checkbox interface for multi-select
- Domain badges for categorization
- Real-time selection counter

### Tools Selector (Green Theme)
- 🟢 Green badge showing "Tools (X)" where X is selection count
- Numbered ranking (#1 through #10)
- Category badges
- Usage-based sorting

### Model Selector (Gray Theme)
- ⚪ White badge showing current model name
- Organized by provider (OpenAI, Anthropic, Google, Hugging Face)
- Model descriptions and token limits
- Checkmark on selected model

## Best Practices

1. **Pre-select Common RAGs**: Pre-populate frequently used knowledge sources
2. **Context-Aware Tools**: Select tools relevant to the current workflow
3. **Model Selection**: Choose appropriate model based on task complexity
4. **Handle Errors**: Implement error handling for API failures
5. **Loading States**: Show loading indicators during API calls

## Styling & Theming

The component uses:
- Tailwind CSS for styling
- Lucide React for icons
- Shadcn/ui components (Button, DropdownMenu, Badge, etc.)
- Responsive design with `flex-wrap` for mobile

## Performance Notes

- APIs are called once on component mount
- Results are cached in component state
- Top 10 tools limit prevents overwhelming UI
- Debouncing recommended for real-time search features (future enhancement)

## Future Enhancements

- [ ] Search/filter within RAG and Tool selectors
- [ ] Save favorite combinations as presets
- [ ] Model comparison tooltips
- [ ] Cost estimation per model
- [ ] Token usage tracking
- [ ] Recently used items
- [ ] Keyboard shortcuts for quick selection

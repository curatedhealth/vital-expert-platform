# AI Reasoning Component

A collapsible React component with TypeScript and shadcn/ui for displaying AI thinking process in conversational AI applications.

## Features

- ✅ **Auto-opening**: Automatically opens when AI starts reasoning
- ✅ **Auto-closing**: Closes when reasoning is complete
- ✅ **Duration tracking**: Shows how long the AI spent thinking
- ✅ **Smooth animations**: Elegant expand/collapse transitions
- ✅ **Streaming support**: Works with streaming AI responses
- ✅ **Step-by-step display**: Optional numbered steps for clear reasoning
- ✅ **Fully accessible**: ARIA attributes for screen readers
- ✅ **TypeScript**: Full type safety

## Installation

The component is already included in this project. If you need to install it in another project:

```bash
npx shadcn@latest add https://www.shadcn.io/registry/ai.json
```

## Basic Usage

```tsx
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";

export function MyChat() {
  const [isThinking, setIsThinking] = useState(false);
  const [reasoningText, setReasoningText] = useState("");

  return (
    <Reasoning isStreaming={isThinking}>
      <ReasoningTrigger title="Thinking" />
      <ReasoningContent>
        {reasoningText || "Let me think about this step by step..."}
      </ReasoningContent>
    </Reasoning>
  );
}
```

## Advanced Usage: Step-by-Step Reasoning

```tsx
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  ReasoningStep,
} from "@/components/ai/reasoning";

export function DetailedReasoning() {
  return (
    <Reasoning isStreaming={false}>
      <ReasoningTrigger title="AI Reasoning Process" />
      <ReasoningContent>
        <ReasoningStep step={1}>
          <strong>Problem Analysis:</strong> Understanding the user's question
          about clinical trial design for digital therapeutics.
        </ReasoningStep>
        <ReasoningStep step={2}>
          <strong>Regulatory Context:</strong> FDA requires clinical validation
          for efficacy claims in digital therapeutics.
        </ReasoningStep>
        <ReasoningStep step={3}>
          <strong>Study Design:</strong> Recommending randomized controlled
          trial with active comparator.
        </ReasoningStep>
      </ReasoningContent>
    </Reasoning>
  );
}
```

## Integration with Chat Messages

```tsx
import { ChatMessages } from "@/features/chat/components/chat-messages";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai/reasoning";

export function ChatWithReasoning() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState("");

  const handleSendMessage = async (message: string) => {
    setIsThinking(true);
    setCurrentReasoning("");

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          if (data.type === "reasoning") {
            setCurrentReasoning((prev) => prev + data.content);
          } else if (data.type === "content") {
            // Handle regular message content
          } else if (data.type === "done") {
            setIsThinking(false);
          }
        }
      }
    }
  };

  return (
    <div>
      <ChatMessages messages={messages} />

      {currentReasoning && (
        <Reasoning isStreaming={isThinking}>
          <ReasoningTrigger title="AI Thinking" />
          <ReasoningContent>{currentReasoning}</ReasoningContent>
        </Reasoning>
      )}
    </div>
  );
}
```

## Props

### Reasoning

| Prop          | Type      | Default | Description                           |
| ------------- | --------- | ------- | ------------------------------------- |
| `isStreaming` | `boolean` | `false` | Whether AI is currently reasoning     |
| `className`   | `string`  | -       | Additional CSS classes                |
| `children`    | `node`    | -       | ReasoningTrigger and ReasoningContent |

### ReasoningTrigger

| Prop        | Type     | Default      | Description                 |
| ----------- | -------- | ------------ | --------------------------- |
| `title`     | `string` | `"Thinking"` | Title text to display       |
| `className` | `string` | -            | Additional CSS classes      |

### ReasoningContent

| Prop        | Type     | Default | Description                 |
| ----------- | -------- | ------- | --------------------------- |
| `children`  | `node`   | -       | Reasoning content to display |
| `className` | `string` | -       | Additional CSS classes      |

### ReasoningStep

| Prop        | Type     | Default | Description                 |
| ----------- | -------- | ------- | --------------------------- |
| `step`      | `number` | -       | Step number (1, 2, 3, ...)  |
| `children`  | `node`   | -       | Step content                |
| `className` | `string` | -       | Additional CSS classes      |

## Behavior

1. **Auto-open**: When `isStreaming` becomes `true`, the reasoning panel automatically expands
2. **Auto-close**: When `isStreaming` becomes `false`, the panel collapses after 1 second
3. **Manual toggle**: Users can manually expand/collapse by clicking the trigger
4. **Duration tracking**: Automatically tracks and displays thinking duration

## Styling

The component uses Tailwind CSS classes and can be customized by:

1. Passing `className` prop to any component
2. Modifying the default styles in `reasoning.tsx`
3. Using CSS custom properties for theming

## Accessibility

- Uses proper ARIA attributes (`aria-expanded`, `aria-controls`)
- Keyboard accessible (click trigger to expand/collapse)
- Screen reader friendly with semantic HTML

## Examples

See `reasoning-demo.tsx` for a complete working example with simulated streaming.

## License

MIT
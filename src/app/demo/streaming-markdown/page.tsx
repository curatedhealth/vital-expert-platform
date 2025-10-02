"use client";

import { useState } from "react";

import { StreamingResponse } from "@/shared/components/ui/ai";
import {
  Conversation,
  ConversationContent
} from "@/shared/components/ui/ai/conversation";
import {
  PromptInputTextarea,
  PromptInputSubmit
} from "@/shared/components/ui/ai/prompt-input";

export default function StreamingMarkdownDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
  }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);

    e.preventDefault();
    if (!input.trim()) return;

      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
    };

      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsStreaming(true);

    // Simulate streaming response

## Overview
For your novel oncology therapeutic, here's a comprehensive **FDA breakthrough therapy strategy**:

### 1. **Pre-Clinical Foundation**
- Establish robust preclinical data package
- Demonstrate **unmet medical need** in target indication
- Generate compelling efficacy signals

### 2. **Regulatory Pathway**
- Submit **Breakthrough Therapy Designation (BTD)** request
- Prepare for **Fast Track** designation
- Consider **Priority Review** pathway

### 3. **Clinical Trial Design**
\`\`\`typescript
interface ClinicalTrial {
  phase: 'I' | 'II' | 'III';
  endpoints: string[];
  patientPopulation: string;
  statisticalPower: number;
}
\`\`\`

### 4. **Key Success Factors**
- [ ] **Strong preclinical data**
- [ ] **Clear clinical benefit**
- [ ] **Unmet medical need**
- [ ] **Manufacturing readiness**

### 5. **Timeline Estimate**
- **Pre-IND Meeting**: 2-3 months
- **IND Submission**: 6-9 months
- **BTD Request**: 9-12 months
- **Phase I/II**: 18-24 months
- **NDA Submission**: 36-48 months

> **Important**: Always consult with FDA early and often throughout development.

### Next Steps
1. Schedule **pre-IND meeting** with FDA
2. Prepare **comprehensive data package**
3. Engage **regulatory consultants**
4. Develop **risk mitigation strategies**

For more detailed guidance, consider engaging our **Regulatory Strategy Expert** for personalized consultation.`;

    // Simulate streaming by revealing content progressively

      if (charIndex < characters.length) {
        // eslint-disable-next-line security/detect-object-injection
        currentContent += characters[charIndex];
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: currentContent }
              : msg
          )
        );
        charIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      }
    }, 30); // Slower character-by-character streaming for better effect
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Streaming Markdown Demo
            </h1>
            <p className="text-gray-600">
              Experience intelligent streaming markdown with auto-completing formatting and syntax highlighting
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 overflow-y-auto">
              <Conversation>
                <ConversationContent>
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-bold text-sm">
                          {message.role === 'user' ? 'USER' : 'AI'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-lg p-4 shadow-sm border">
                          <StreamingResponse
                            content={message.content}
                            isStreaming={message.isStreaming || false}
                            variant="enhanced"
                            showCursor={message.isStreaming || false}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </ConversationContent>
              </Conversation>
            </div>

            <div className="border-t bg-gray-50 p-4">
              <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  placeholder="Ask for markdown content... (try: 'Create a regulatory strategy')"
                  disabled={isStreaming}
                  className="flex-1"
                />
                <PromptInputSubmit 
                  disabled={!input.trim() || isStreaming} 
                  status={isStreaming ? 'loading' : 'idle'}
                />
              </form>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Real-time streaming markdown</li>
                <li>✅ Auto-completing formatting</li>
                <li>✅ Syntax highlighting</li>
                <li>✅ Code block support</li>
                <li>✅ Link detection</li>
                <li>✅ List formatting</li>
                <li>✅ Blockquote styling</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold mb-4">Try These</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setInput("Create a clinical trial design")}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Clinical trial design
                </button>
                <button
                  onClick={() => setInput("Write a regulatory strategy")}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Regulatory strategy
                </button>
                <button
                  onClick={() => setInput("Explain market access")}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Market access analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

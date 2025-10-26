import { HfInference } from '@huggingface/inference';

export interface HuggingFaceConfig {
  apiKey: string;
  model: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export class HuggingFaceService {
  private hf: HfInference;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel: string = 'gpt-4') {
    // Use environment variable if apiKey not provided
    const key = apiKey || process.env.HUGGINGFACE_API_KEY || '';
    this.hf = new HfInference(key);
    this.defaultModel = defaultModel;
  }

  /**
   * Generate text completion using Hugging Face Inference API
   */
  async generate(
    messages: ChatMessage[],
    options: GenerateOptions = {}
  ): Promise<string> {
    const {
      temperature = 0.7,
      max_tokens = 2000,
      top_p = 0.9,
    } = options;

    try {
      // For Hugging Face models, we need to format the messages into a single prompt
      const prompt = this.formatMessages(messages);

      const response = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: max_tokens,
          top_p,
          return_full_text: false,
        },
      });

      return response.generated_text;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw new Error(`Hugging Face API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate text completion with streaming
   */
  async *generateStream(
    messages: ChatMessage[],
    options: GenerateOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      temperature = 0.7,
      max_tokens = 2000,
      top_p = 0.9,
    } = options;

    try {
      const prompt = this.formatMessages(messages);

      const stream = this.hf.textGenerationStream({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: max_tokens,
          top_p,
          return_full_text: false,
        },
      });

      for await (const chunk of stream) {
        if (chunk.token?.text) {
          yield chunk.token.text;
        }
      }
    } catch (error) {
      console.error('Hugging Face streaming error:', error);
      throw new Error(`Hugging Face streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format chat messages into a prompt string
   * Different models may require different formats
   */
  private formatMessages(messages: ChatMessage[]): string {
    // For most instruction-tuned models, use this format:
    // <s>[INST] <<SYS>>system_message<</SYS>>user_message [/INST]

    const systemMessage = messages.find((m: any) => m.role === 'system');
    const chatMessages = messages.filter((m: any) => m.role !== 'system');

    let prompt = '';

    if (systemMessage) {
      prompt += `<<SYS>>\n${systemMessage.content}\n<</SYS>>\n\n`;
    }

    // Build conversation
    chatMessages.forEach((msg, index) => {
      if (msg.role === 'user') {
        prompt += `[INST] ${msg.content} [/INST]\n`;
      } else if (msg.role === 'assistant') {
        prompt += `${msg.content}\n`;
      }
    });

    return prompt;
  }

  /**
   * Check if the model is available
   */
  async checkModel(modelId: string): Promise<boolean> {
    try {
      await this.hf.textGeneration({
        model: modelId,
        inputs: 'test',
        parameters: {
          max_new_tokens: 1,
        },
      });
      return true;
    } catch (error) {
      console.error(`Model ${modelId} not available:`, error);
      return false;
    }
  }

  /**
   * Set the default model
   */
  setModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Get the current default model
   */
  getModel(): string {
    return this.defaultModel;
  }
}

// Export a default instance
export const huggingfaceService = new HuggingFaceService();
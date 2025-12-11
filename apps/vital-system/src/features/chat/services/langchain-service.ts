/**
 * LangChain service stub
 * TODO: Implement LangChain integration when chat feature is developed
 */

export interface LangChainConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LangChainService {
  private config: LangChainConfig;

  constructor(config: LangChainConfig = {}) {
    this.config = config;
  }

  async invoke(_input: string): Promise<string> {
    // TODO: Implement LangChain invocation
    console.warn('LangChainService.invoke is not implemented');
    return '';
  }

  async stream(_input: string): AsyncGenerator<string> {
    // TODO: Implement streaming
    console.warn('LangChainService.stream is not implemented');
    return (async function* () {
      yield '';
    })();
  }
}

export const createLangChainService = (config?: LangChainConfig): LangChainService => {
  return new LangChainService(config);
};

export default LangChainService;

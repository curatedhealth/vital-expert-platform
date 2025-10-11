/**
 * Mock Database Service
 * Provides fallback database functionality when no real database is configured
 */

export interface MockDatabaseConfig {
  isEnabled: boolean;
  fallbackToMock: boolean;
}

export class MockDatabaseService {
  private static instance: MockDatabaseService;
  private config: MockDatabaseConfig;

  constructor(config: MockDatabaseConfig = { isEnabled: true, fallbackToMock: true }) {
    this.config = config;
  }

  static getInstance(): MockDatabaseService {
    if (!MockDatabaseService.instance) {
      MockDatabaseService.instance = new MockDatabaseService();
    }
    return MockDatabaseService.instance;
  }

  // Mock LLM Providers data
  getMockLLMProviders() {
    return [
      {
        id: 'mock-openai-1',
        provider_name: 'OpenAI GPT-4',
        provider_type: 'openai',
        model_id: 'gpt-4',
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-anthropic-1',
        provider_name: 'Anthropic Claude',
        provider_type: 'anthropic',
        model_id: 'claude-3-sonnet',
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mock-google-1',
        provider_name: 'Google Gemini',
        provider_type: 'google',
        model_id: 'gemini-pro',
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Mock Usage Logs data
  getMockUsageLogs() {
    return [
      {
        id: 'mock-usage-1',
        llm_provider_id: 'mock-openai-1',
        agent_id: null,
        user_id: null,
        request_id: 'mock-request-1',
        input_tokens: 100,
        output_tokens: 50,
        total_tokens: 150,
        cost_input: 0.0001,
        cost_output: 0.0002,
        total_cost: 0.0003,
        latency_ms: 1200,
        status: 'success',
        created_at: new Date().toISOString()
      }
    ];
  }

  // Mock database query method
  async query(table: string, operation: string = 'select', data?: any) {
    console.log(`[Mock DB] ${operation.toUpperCase()} on ${table}`);
    
    switch (table) {
      case 'llm_providers':
        if (operation === 'select') {
          return { data: this.getMockLLMProviders(), error: null };
        }
        break;
      case 'llm_usage_logs':
        if (operation === 'select') {
          return { data: this.getMockUsageLogs(), error: null };
        }
        break;
      default:
        return { data: [], error: null };
    }
    
    return { data: [], error: null };
  }

  // Check if database is available
  async isDatabaseAvailable(): Promise<boolean> {
    // In a real implementation, this would check database connectivity
    // For now, we'll return false to use mock data
    return false;
  }
}

export const mockDatabase = MockDatabaseService.getInstance();

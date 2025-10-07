/**
 * Simplified Long Term Memory Service
 */

export class LongTermMemoryService {
  async storeLongTermMemory(key: string, value: any): Promise<void> {
    // Mock implementation
    console.log(`Storing long-term memory: ${key}`);
  }

  async retrieveLongTermMemory(key: string): Promise<any> {
    // Mock implementation
    return { content: `Mock long-term memory for: ${key}` };
  }
}

export const longTermMemoryService = new LongTermMemoryService();

// Export the missing function that other files are trying to import
export const createAutoLearningMemory = () => new LongTermMemoryService();
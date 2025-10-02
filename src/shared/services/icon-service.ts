export interface Icon {
  id: string;
  name: string;
  display_name: string;
  category: 'avatar' | 'prompt' | 'process' | 'medical' | 'regulatory' | 'general';
  subcategory?: string;
  description?: string;
  file_path: string;
  file_url: string;
  svg_content?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class IconService {
  private baseUrl = '/api/icons';

  private async fetchAPI(endpoint: string, options?: RequestInit): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();

      // eslint-disable-next-line security/detect-object-injection
      if (!response.ok) {
        // eslint-disable-next-line security/detect-object-injection
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      // console.error('IconService API error:', error);
      throw error;
    }
  }

  /**
   * Get all active icons
   */
  async getAllIcons(): Promise<Icon[]> {
    try {

      // eslint-disable-next-line security/detect-object-injection
      return response.icons || [];
    } catch (error) {
      // console.error('Error in getAllIcons:', error);
      return this.getFallbackIcons();
    }
  }

  /**
   * Get icons by category
   */
  async getIconsByCategory(category: Icon['category']): Promise<Icon[]> {
    try {

      // eslint-disable-next-line security/detect-object-injection
      return response.icons || [];
    } catch (error) {
      // console.error('Error in getIconsByCategory:', error);
      return [];
    }
  }

  /**
   * Get icons by multiple categories
   */
  async getIconsByCategories(categories: Icon['category'][]): Promise<Icon[]> {
    try {

      // eslint-disable-next-line security/detect-object-injection
      return response.icons || [];
    } catch (error) {
      // console.error('Error in getIconsByCategories:', error);
      return [];
    }
  }

  /**
   * Search icons by name, tags, or description
   */
  async searchIcons(query: string, category?: Icon['category']): Promise<Icon[]> {
    try {

      if (category) {
        params.append('category', category);
      }

      // eslint-disable-next-line security/detect-object-injection
      return response.icons || [];
    } catch (error) {
      // console.error('Error in searchIcons:', error);
      return [];
    }
  }

  /**
   * Get icon by name
   */
  async getIconByName(name: string): Promise<Icon | null> {
    try {

      // eslint-disable-next-line security/detect-object-injection

      // eslint-disable-next-line security/detect-object-injection
      return icons.find((icon: Icon) => icon.name === name) || null;
    } catch (error) {
      // console.error('Error in getIconByName:', error);
      return null;
    }
  }

  /**
   * Add a new icon
   */
  async addIcon(iconData: Omit<Icon, 'id' | 'created_at' | 'updated_at'>): Promise<Icon | null> {
    try {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iconData)
      });
      // eslint-disable-next-line security/detect-object-injection
      return response.icon || null;
    } catch (error) {
      // console.error('Error in addIcon:', error);
      return null;
    }
  }

  /**
   * Update an existing icon
   */
  async updateIcon(id: string, updates: Partial<Omit<Icon, 'id' | 'created_at' | 'updated_at'>>): Promise<Icon | null> {
    try {

        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      // eslint-disable-next-line security/detect-object-injection
      return response.icon || null;
    } catch (error) {
      // console.error('Error in updateIcon:', error);
      return null;
    }
  }

  /**
   * Delete an icon (soft delete by setting is_active to false)
   */
  async deleteIcon(id: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      // console.error('Error in deleteIcon:', error);
      return false;
    }
  }

  /**
   * Get icons suitable for avatars
   */
  async getAvatarIcons(): Promise<Icon[]> {
    try {
      return await this.getIconsByCategory('avatar');
    } catch (error) {
      // eslint-disable-next-line security/detect-object-injection
      return this.getFallbackIcons().filter(icon => icon.category === 'avatar' || icon.category === 'medical');
    }
  }

  /**
   * Get icons suitable for prompts
   */
  async getPromptIcons(): Promise<Icon[]> {
    try {
      return await this.getIconsByCategories(['prompt', 'medical', 'regulatory', 'process']);
    } catch (error) {
      // eslint-disable-next-line security/detect-object-injection
      return this.getFallbackIcons().filter(icon =>
        // eslint-disable-next-line security/detect-object-injection
        ['prompt', 'medical', 'regulatory', 'process'].includes(icon.category)
      );
    }
  }

  /**
   * Get icons suitable for processes
   */
  async getProcessIcons(): Promise<Icon[]> {
    try {
      return await this.getIconsByCategory('process');
    } catch (error) {
      // eslint-disable-next-line security/detect-object-injection
      return this.getFallbackIcons().filter(icon => icon.category === 'process');
    }
  }

  /**
   * Fallback icons when database is not available - using emoji for immediate display
   */
  private getFallbackIcons(): Icon[] {
    return [
      {
        id: 'fallback-1',
        name: 'medical_document',
        display_name: 'Medical Document',
        category: 'medical',
        description: 'Medical document icon',
        file_path: '📋',
        file_url: '📋',
        tags: ['medical', 'document'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        name: 'healthcare_analysis',
        display_name: 'Healthcare Analysis',
        category: 'medical',
        description: 'Healthcare analysis icon',
        file_path: '🔍',
        file_url: '🔍',
        tags: ['healthcare', 'analysis'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        name: 'stethoscope',
        display_name: 'Stethoscope',
        category: 'medical',
        description: 'Medical stethoscope icon',
        file_path: '🩺',
        file_url: '🩺',
        tags: ['stethoscope', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-4',
        name: 'checklist',
        display_name: 'Checklist',
        category: 'process',
        description: 'Checklist process icon',
        file_path: '✅',
        file_url: '✅',
        tags: ['checklist', 'process'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-5',
        name: 'thermometer',
        display_name: 'Thermometer',
        category: 'medical',
        description: 'Medical thermometer icon',
        file_path: '🌡️',
        file_url: '🌡️',
        tags: ['thermometer', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-6',
        name: 'xray',
        display_name: 'X-Ray',
        category: 'medical',
        description: 'Medical X-ray icon',
        file_path: '🩻',
        file_url: '🩻',
        tags: ['xray', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-7',
        name: 'heart',
        display_name: 'Heart',
        category: 'medical',
        description: 'Heart medical icon',
        file_path: '❤️',
        file_url: '❤️',
        tags: ['heart', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-8',
        name: 'pill',
        display_name: 'Pill',
        category: 'medical',
        description: 'Medical pill icon',
        file_path: '💊',
        file_url: '💊',
        tags: ['pill', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-9',
        name: 'hospital',
        display_name: 'Hospital',
        category: 'medical',
        description: 'Hospital building icon',
        file_path: '🏥',
        file_url: '🏥',
        tags: ['hospital', 'medical'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'fallback-10',
        name: 'dna',
        display_name: 'DNA',
        category: 'medical',
        description: 'DNA research icon',
        file_path: '🧬',
        file_url: '🧬',
        tags: ['dna', 'research'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}
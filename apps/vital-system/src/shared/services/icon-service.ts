export interface Icon {
  id: string;
  name: string;
  display_name: string;
  category: 'avatar' | 'prompt' | 'process' | 'medical' | 'regulatory' | 'general';
  subcategory?: string;
  description?: string;
  icon?: string; // Supabase Storage URL for avatars
  file_path?: string;
  file_url?: string;
  svg_content?: string;
  tags?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  sort_order?: number;
}

interface ApiResponse {
  icons?: Icon[];
  icon?: Icon;
  error?: string;
}

export class IconService {
  private baseUrl = '/api/icons';

  private async fetchAPI(endpoint: string, options?: RequestInit): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data as ApiResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all active icons
   */
  async getAllIcons(): Promise<Icon[]> {
    try {
      const response = await this.fetchAPI('');
      return response.icons || [];
    } catch (error) {
      return this.getFallbackIcons();
    }
  }

  /**
   * Get icons by category
   */
  async getIconsByCategory(category: Icon['category']): Promise<Icon[]> {
    try {
      const response = await this.fetchAPI(`?category=${encodeURIComponent(category)}`);
      return response.icons || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get icons by multiple categories
   */
  async getIconsByCategories(categories: Icon['category'][]): Promise<Icon[]> {
    try {
      const response = await this.fetchAPI(`?categories=${encodeURIComponent(categories.join(','))}`);
      return response.icons || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Search icons by name, tags, or description
   */
  async searchIcons(query: string, category?: Icon['category']): Promise<Icon[]> {
    try {
      const params = new URLSearchParams({ query });
      if (category) {
        params.append('category', category);
      }
      const response = await this.fetchAPI(`/search?${params.toString()}`);
      return response.icons || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get icon by name
   */
  async getIconByName(name: string): Promise<Icon | null> {
    try {
      const response = await this.fetchAPI(`?name=${encodeURIComponent(name)}`);
      const icons = response.icons || [];
      return icons.find((icon: Icon) => icon.name === name) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Add a new icon
   */
  async addIcon(iconData: Omit<Icon, 'id' | 'created_at' | 'updated_at'>): Promise<Icon | null> {
    try {
      const response = await this.fetchAPI('', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iconData)
      });
      return response.icon || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update an existing icon
   */
  async updateIcon(id: string, updates: Partial<Omit<Icon, 'id' | 'created_at' | 'updated_at'>>): Promise<Icon | null> {
    try {
      const response = await this.fetchAPI(`/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return response.icon || null;
    } catch (error) {
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
      return this.getFallbackIcons().filter(icon =>
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
        file_path: '/icons/png/avatars/avatar_0001.png',
        file_url: '/icons/png/avatars/avatar_0001.png',
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
        file_path: '/icons/png/avatars/avatar_0002.png',
        file_url: '/icons/png/avatars/avatar_0002.png',
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
        file_path: '/icons/png/avatars/avatar_0003.png',
        file_url: '/icons/png/avatars/avatar_0003.png',
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
        file_path: '/icons/png/avatars/avatar_0004.png',
        file_url: '/icons/png/avatars/avatar_0004.png',
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
        file_path: '/icons/png/avatars/avatar_0005.png',
        file_url: '/icons/png/avatars/avatar_0005.png',
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
        file_path: '/icons/png/avatars/avatar_0006.png',
        file_url: '/icons/png/avatars/avatar_0006.png',
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
        file_path: '/icons/png/avatars/avatar_0007.png',
        file_url: '/icons/png/avatars/avatar_0007.png',
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
        file_path: '/icons/png/avatars/avatar_0008.png',
        file_url: '/icons/png/avatars/avatar_0008.png',
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
        file_path: '/icons/png/avatars/avatar_0009.png',
        file_url: '/icons/png/avatars/avatar_0009.png',
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
        file_path: '/icons/png/avatars/avatar_0010.png',
        file_url: '/icons/png/avatars/avatar_0010.png',
        tags: ['dna', 'research'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

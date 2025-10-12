// Placeholder icon service for deployment
export interface Icon {
  name: string;
  component: any;
  file_url?: string;
  category?: string;
  subcategory?: string;
  id?: string;
  display_name?: string;
  tags?: string[];
  icon?: string;
}

export const getIcons = (): Icon[] => {
  return [];
};

export const getIconByName = (name: string): Icon | undefined => {
  return undefined;
};

export class IconService {
  async getAllIcons(): Promise<Icon[]> {
    return [];
  }
  async getIconsByCategory(category: string): Promise<Icon[]> {
    return [];
  }
  async searchIcons(query: string): Promise<Icon[]> {
    return [];
  }
  async getPromptIcons(): Promise<Icon[]> {
    return [];
  }
  async getAvatarIcons(): Promise<Icon[]> {
    return [];
  }
  async getProcessIcons(): Promise<Icon[]> {
    return [];
  }
}

export const iconService = new IconService();

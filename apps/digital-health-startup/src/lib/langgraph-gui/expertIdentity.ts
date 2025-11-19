import { 
  User, 
  Stethoscope, 
  FileText, 
  Laptop, 
  Microscope, 
  Pill, 
  Heart,
  Brain,
  Shield,
  FlaskConical,
  type LucideIcon
} from 'lucide-react';

// Expert type to icon mapping
export const EXPERT_TYPE_ICONS: Record<string, LucideIcon> = {
  regulatory_expert: FileText,
  clinical_expert: Stethoscope,
  digital_health_expert: Laptop,
  medical_expert: Microscope,
  pharmaceutical_expert: Pill,
  cardiology_expert: Heart,
  neurology_expert: Brain,
  safety_expert: Shield,
  research_expert: FlaskConical,
  default: User,
};

// Expert type to color mapping
export const EXPERT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  regulatory_expert: { bg: 'bg-blue-500', text: 'text-white' },
  clinical_expert: { bg: 'bg-green-500', text: 'text-white' },
  digital_health_expert: { bg: 'bg-purple-500', text: 'text-white' },
  medical_expert: { bg: 'bg-red-500', text: 'text-white' },
  pharmaceutical_expert: { bg: 'bg-orange-500', text: 'text-white' },
  cardiology_expert: { bg: 'bg-pink-500', text: 'text-white' },
  neurology_expert: { bg: 'bg-indigo-500', text: 'text-white' },
  safety_expert: { bg: 'bg-yellow-500', text: 'text-yellow-900' },
  research_expert: { bg: 'bg-teal-500', text: 'text-white' },
  default: { bg: 'bg-gray-500', text: 'text-white' },
};

// Track expert identities
class ExpertIdentityManager {
  private expertMap: Map<string, {
    id: string;
    name: string;
    type: string;
    icon: LucideIcon;
    color: { bg: string; text: string };
    avatar?: string;
  }> = new Map();

  private expertCounter = 0;

  getOrCreateExpert(expertName: string, expertType?: string, nodeId?: string): {
    id: string;
    name: string;
    type: string;
    icon: LucideIcon;
    color: { bg: string; text: string };
    avatar?: string;
  } {
    // Use nodeId if available for consistent identification
    const key = nodeId || expertName;
    
    if (this.expertMap.has(key)) {
      return this.expertMap.get(key)!;
    }

    // Create new expert identity
    const type = expertType || 'default';
    const icon = EXPERT_TYPE_ICONS[type] || EXPERT_TYPE_ICONS.default;
    const color = EXPERT_TYPE_COLORS[type] || EXPERT_TYPE_COLORS.default;
    
    const expert = {
      id: `expert-${this.expertCounter++}`,
      name: expertName,
      type,
      icon,
      color,
    };

    this.expertMap.set(key, expert);
    return expert;
  }

  getExpert(key: string) {
    return this.expertMap.get(key);
  }

  getAllExperts() {
    return Array.from(this.expertMap.values());
  }

  clear() {
    this.expertMap.clear();
    this.expertCounter = 0;
  }
}

// Singleton instance
export const expertIdentityManager = new ExpertIdentityManager();


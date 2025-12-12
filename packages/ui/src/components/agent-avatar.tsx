import { cn } from '../lib/utils';

// Agent interface for avatar generation (minimal required fields)
export interface AgentAvatarData {
  id?: string;
  name?: string;
  avatar_url?: string;
  tier?: number;
  business_function?: string;
  function_name?: string;
  agent_levels?: { level_number: number };
}

// ============================================================================
// VITAL AVATAR SYSTEM
// All agents use VITAL avatars from /assets/vital/avatars
// ============================================================================

// Super Agent avatars for Master level agents (Level 1)
const SUPER_AGENT_AVATARS = [
  '/assets/vital/super_agents/super_orchestrator.svg',
  '/assets/vital/super_agents/super_reasoner.svg',
  '/assets/vital/super_agents/super_synthesizer.svg',
  '/assets/vital/super_agents/super_architect.svg',
  '/assets/vital/super_agents/super_critic.svg',
];

// Avatar prefixes and business function categories are documented in BUSINESS_FUNCTION_AVATAR_MAP
// Available prefixes: expert, foresight, medical, pharma, startup
// Available categories: analytics_insights, commercial_marketing, market_access, medical_affairs, product_innovation

// Business function keyword mapping to avatar categories
const BUSINESS_FUNCTION_AVATAR_MAP: Record<string, string> = {
  // Analytics & Insights
  'analytics': 'analytics_insights',
  'analytics_insights': 'analytics_insights',
  'data_analytics': 'analytics_insights',
  'data_science': 'analytics_insights',
  'data': 'analytics_insights',
  'business_intelligence': 'analytics_insights',
  'bi': 'analytics_insights',
  'reporting': 'analytics_insights',
  'insights': 'analytics_insights',
  'intelligence': 'analytics_insights',
  'forecasting': 'analytics_insights',
  'prediction': 'analytics_insights',
  'modeling': 'analytics_insights',
  'statistics': 'analytics_insights',
  
  // Commercial & Marketing
  'commercial': 'commercial_marketing',
  'commercial_marketing': 'commercial_marketing',
  'marketing': 'commercial_marketing',
  'sales': 'commercial_marketing',
  'sales_marketing': 'commercial_marketing',
  'brand': 'commercial_marketing',
  'branding': 'commercial_marketing',
  'advertising': 'commercial_marketing',
  'promotion': 'commercial_marketing',
  'communications': 'commercial_marketing',
  'digital': 'commercial_marketing',
  'content': 'commercial_marketing',
  'campaign': 'commercial_marketing',
  'customer': 'commercial_marketing',
  'crm': 'commercial_marketing',
  
  // Market Access
  'market_access': 'market_access',
  'access': 'market_access',
  'pricing': 'market_access',
  'reimbursement': 'market_access',
  'health_economics': 'market_access',
  'heor': 'market_access',
  'payer': 'market_access',
  'hta': 'market_access',
  'value': 'market_access',
  'outcomes': 'market_access',
  'policy': 'market_access',
  'government': 'market_access',
  'tender': 'market_access',
  
  // Medical Affairs
  'medical': 'medical_affairs',
  'medical_affairs': 'medical_affairs',
  'clinical': 'medical_affairs',
  'clinical_operations': 'medical_affairs',
  'regulatory': 'medical_affairs',
  'pharmacovigilance': 'medical_affairs',
  'safety': 'medical_affairs',
  'compliance': 'medical_affairs',
  'legal': 'medical_affairs',
  'quality': 'medical_affairs',
  'affairs': 'medical_affairs',
  'science': 'medical_affairs',
  'msl': 'medical_affairs',
  'kol': 'medical_affairs',
  'trial': 'medical_affairs',
  'study': 'medical_affairs',
  
  // Product & Innovation
  'product': 'product_innovation',
  'product_innovation': 'product_innovation',
  'innovation': 'product_innovation',
  'r_and_d': 'product_innovation',
  'r&d': 'product_innovation',
  'research': 'product_innovation',
  'development': 'product_innovation',
  'engineering': 'product_innovation',
  'technology': 'product_innovation',
  'tech': 'product_innovation',
  'design': 'product_innovation',
  'strategy': 'product_innovation',
  'portfolio': 'product_innovation',
  'pipeline': 'product_innovation',
  'discovery': 'product_innovation',
};

// Level to prefix mapping for avatar files
const LEVEL_AVATAR_PREFIX: Record<number, string> = {
  1: 'expert',    // Master agents use expert style
  2: 'expert',    // Expert
  3: 'foresight', // Specialist
  4: 'pharma',    // Worker
  5: 'startup',   // Tool
};

// Get a consistent hash for deterministic avatar selection
const getHash = (identifier: string): number => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Get a consistent super agent avatar based on agent name/id
const getSuperAgentAvatar = (identifier: string): string => {
  const index = getHash(identifier) % SUPER_AGENT_AVATARS.length;
  return SUPER_AGENT_AVATARS[index];
};

// Match business function to avatar category
const matchBusinessFunctionCategory = (businessFunction: string | undefined | null): string => {
  if (!businessFunction) return 'analytics_insights';
  
  // Normalize: lowercase, replace spaces/hyphens with underscores
  const normalized = businessFunction.toLowerCase().replace(/[\s-]+/g, '_');
  
  // Direct match
  if (BUSINESS_FUNCTION_AVATAR_MAP[normalized]) {
    return BUSINESS_FUNCTION_AVATAR_MAP[normalized];
  }
  
  // Partial match - check if any keyword is contained
  for (const [keyword, category] of Object.entries(BUSINESS_FUNCTION_AVATAR_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return category;
    }
  }
  
  // Word-by-word matching
  const words = normalized.split('_');
  for (const word of words) {
    if (word.length >= 3 && BUSINESS_FUNCTION_AVATAR_MAP[word]) {
      return BUSINESS_FUNCTION_AVATAR_MAP[word];
    }
  }
  
  // Default fallback
  return 'analytics_insights';
};

// Get VITAL avatar path for any agent
const getVitalAvatar = (
  level: number | undefined,
  businessFunction: string | undefined | null,
  identifier: string
): string => {
  // Determine prefix based on level (default to 'expert')
  const prefix = level ? (LEVEL_AVATAR_PREFIX[level] || 'expert') : 'expert';
  
  // Match business function to category
  const category = matchBusinessFunctionCategory(businessFunction);
  
  // Get consistent avatar number (1-20) based on identifier
  const avatarNumber = (getHash(identifier) % 20) + 1;
  const paddedNumber = avatarNumber.toString().padStart(2, '0');
  
  return `/assets/vital/avatars/vital_avatar_${prefix}_${category}_${paddedNumber}.svg`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface AgentAvatarProps {
  agent?: AgentAvatarData;
  avatar?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'list' | 'card';
  className?: string;
  level?: number;
  businessFunction?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  list: 'w-[30px] h-[30px]',
  card: 'w-[50px] h-[50px]'
};

export function AgentAvatar({
  agent,
  avatar: avatarProp,
  name: nameProp,
  size = 'md',
  className,
  level,
  businessFunction
}: AgentAvatarProps) {
  // Get identifier for consistent avatar selection
  const name = agent?.name || nameProp || 'Agent';
  const identifier = agent?.id || agent?.name || name;

  // Determine agent level
  const agentLevel = level || (agent as any)?.tier || (agent as any)?.agent_levels?.level_number;

  // Get business function from props or agent object
  const agentBusinessFunction = businessFunction || (agent as any)?.business_function || (agent as any)?.function_name;

  // Check if agent has a stored avatar_url (from Supabase storage)
  const storedAvatarUrl = (agent as any)?.avatar_url || avatarProp;

  // Determine avatar source
  let avatar: string;

  // Priority 1: Use stored Supabase URL if it's an SVG from our system
  if (storedAvatarUrl && (
    storedAvatarUrl.includes('supabase.co/storage') ||
    storedAvatarUrl.includes('/assets/vital/') ||
    storedAvatarUrl.includes('vital_avatar_')
  )) {
    avatar = storedAvatarUrl;
  } else if (agentLevel === 1) {
    // Priority 2: Level 1 (Master): Use super agent avatars
    avatar = getSuperAgentAvatar(identifier);
  } else {
    // Priority 3: ALL other agents: Use VITAL avatars based on business function
    avatar = getVitalAvatar(agentLevel, agentBusinessFunction, identifier);
  }

  // Fallback avatar path
  const fallbackAvatar = '/assets/vital/avatars/vital_avatar_expert_analytics_insights_01.svg';

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0 bg-gray-50',
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
        className
      )}
      style={{
        minWidth: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
        minHeight: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
        maxWidth: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
        maxHeight: size === 'card' ? '50px' : size === 'list' ? '30px' : undefined,
      }}
    >
      <img
        src={avatar}
        alt={name}
        className="w-full h-full object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.src.includes(fallbackAvatar)) {
            target.src = fallbackAvatar;
          }
        }}
      />
    </div>
  );
}

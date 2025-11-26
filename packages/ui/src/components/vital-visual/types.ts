/**
 * VITAL Visual Asset Type Definitions
 *
 * Type-safe definitions for the VITAL visual asset library based on
 * Brand Guidelines v5.0 taxonomy.
 */

/**
 * Persona Types (5 types)
 *
 * Represents the 5 core persona archetypes in the VITAL system.
 */
export type PersonaType = "expert" | "foresight" | "medical" | "pharma" | "startup"

/**
 * Departments (5 departments)
 *
 * Organizational departments within pharma/healthcare companies.
 */
export type Department =
  | "analytics_insights"
  | "commercial_marketing"
  | "market_access"
  | "medical_affairs"
  | "product_innovation"

/**
 * Agent Tiers (AgentOS 3.0 Hierarchy)
 *
 * 5-level agent classification system:
 * - 1: Master (orchestrators)
 * - 2: Expert (specialists)
 * - 3: Specialist (domain-specific)
 * - 4: Worker (task execution)
 * - 5: Tool (single-purpose utilities)
 */
export type AgentTier = 1 | 2 | 3 | 4 | 5

/**
 * Tenant Identity Colors
 *
 * 8 primary colors mapped to tenant domains from Brand Guidelines v5.0
 */
export type TenantColor =
  | "purple"  // Expert Purple (#9B5DE0)
  | "blue"    // Pharma Blue (#0046FF)
  | "black"   // Startup Black (#292621)
  | "red"     // Medical Red (#EF4444)
  | "pink"    // Foresight Pink (#FF3796)
  | "teal"    // Systems Teal (#00B5AD)
  | "orange"  // Velocity Orange (#FF6B00)
  | "indigo"  // Research Indigo (#4F46E5)

/**
 * Tenant Identity Color Hex Values
 */
export const TENANT_COLORS: Record<TenantColor, string> = {
  purple: "#9B5DE0",
  blue: "#0046FF",
  black: "#292621",
  red: "#EF4444",
  pink: "#FF3796",
  teal: "#00B5AD",
  orange: "#FF6B00",
  indigo: "#4F46E5",
}

/**
 * Component Size Variants
 */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

/**
 * Icon Variant (color)
 */
export type IconVariant = "black" | "purple"

/**
 * Avatar Metadata
 *
 * Full metadata for an agent avatar from the 500-avatar library.
 */
export interface AvatarMetadata {
  /** Persona type */
  personaType: PersonaType
  /** Department */
  department: Department
  /** Variant number (1-20) */
  variant: number
  /** Full filename (e.g., "vital_avatar_expert_medical_affairs_01") */
  filename: string
  /** SVG file path */
  path: string
  /** Associated tenant color */
  tenantColor: TenantColor
}

/**
 * Icon Metadata
 *
 * Metadata for general purpose icons (130 total).
 */
export interface IconMetadata {
  /** Icon name */
  name: string
  /** Category (analytics, workflow, medical, etc.) */
  category: string
  /** Color variant available */
  variant: IconVariant
  /** SVG file path */
  path: string
  /** Keywords for search */
  keywords: string[]
}

/**
 * Super Agent Metadata
 *
 * Metadata for Level 1 Master orchestrator icons (5 total).
 */
export interface SuperAgentMetadata {
  /** Super agent name */
  name: string
  /** Display name */
  displayName: string
  /** Description */
  description: string
  /** SVG file path */
  path: string
  /** Primary tenant color */
  primaryColor: TenantColor
}

/**
 * Persona Type Metadata
 *
 * Extended information about each persona type.
 */
export interface PersonaTypeInfo {
  value: PersonaType
  label: string
  color: string
  description: string
}

/**
 * Department Metadata
 *
 * Extended information about each department.
 */
export interface DepartmentInfo {
  value: Department
  label: string
  description: string
}

/**
 * Persona Type Definitions
 */
export const PERSONA_TYPES: PersonaTypeInfo[] = [
  {
    value: "expert",
    label: "Expert",
    color: "#9B5DE0",
    description: "Domain experts and specialists",
  },
  {
    value: "foresight",
    label: "Foresight",
    color: "#FF3796",
    description: "Strategic advisors and futurists",
  },
  {
    value: "medical",
    label: "Medical",
    color: "#EF4444",
    description: "Healthcare and clinical specialists",
  },
  {
    value: "pharma",
    label: "Pharma",
    color: "#0046FF",
    description: "Pharmaceutical industry experts",
  },
  {
    value: "startup",
    label: "Startup",
    color: "#292621",
    description: "Innovation and entrepreneurship",
  },
]

/**
 * Department Definitions
 */
export const DEPARTMENTS: DepartmentInfo[] = [
  {
    value: "analytics_insights",
    label: "Analytics & Insights",
    description: "Data analytics and business intelligence",
  },
  {
    value: "commercial_marketing",
    label: "Commercial & Marketing",
    description: "Commercial strategy and marketing",
  },
  {
    value: "market_access",
    label: "Market Access",
    description: "Reimbursement and market access",
  },
  {
    value: "medical_affairs",
    label: "Medical Affairs",
    description: "Medical strategy and affairs",
  },
  {
    value: "product_innovation",
    label: "Product Innovation",
    description: "Product development and innovation",
  },
]

/**
 * Icon Categories
 */
export const ICON_CATEGORIES = [
  "analytics",
  "workflow",
  "medical",
  "collaboration",
  "data",
  "navigation",
  "action",
  "status",
] as const

export type IconCategory = (typeof ICON_CATEGORIES)[number]

/**
 * Helper function to construct avatar path
 */
export function getAvatarPath(
  personaType: PersonaType,
  department: Department,
  variant: number
): string {
  const paddedVariant = String(variant).padStart(2, "0")
  return `vital_avatar_${personaType}_${department}_${paddedVariant}`
}

/**
 * Helper function to parse avatar filename
 */
export function parseAvatarFilename(filename: string): AvatarMetadata | null {
  const match = filename.match(/vital_avatar_(\w+)_(\w+)_(\d{2})/)
  if (!match) return null

  const [, personaType, department, variantStr] = match
  const variant = parseInt(variantStr, 10)

  const personaInfo = PERSONA_TYPES.find((p) => p.value === personaType)
  if (!personaInfo) return null

  return {
    personaType: personaType as PersonaType,
    department: department as Department,
    variant,
    filename,
    path: `/assets/vital/avatars/${filename}.svg`,
    tenantColor: personaInfo.color === "#9B5DE0" ? "purple" : "blue", // Simplified mapping
  }
}

/**
 * Helper function to get persona color
 */
export function getPersonaColor(personaType: PersonaType): string {
  const persona = PERSONA_TYPES.find((p) => p.value === personaType)
  return persona?.color || "#9B5DE0"
}

/**
 * Helper function to get department label
 */
export function getDepartmentLabel(department: Department): string {
  const dept = DEPARTMENTS.find((d) => d.value === department)
  return dept?.label || department
}

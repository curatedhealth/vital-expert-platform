/**
 * Shared types for persona components
 */

export interface Persona {
  id: string;
  slug: string;
  name: string;
  title?: string;
  tagline?: string;
  one_liner?: string;
  archetype?: string;
  persona_type?: string;
  persona_number?: number;
  section?: string;
  segment?: string;
  organization_type?: string;
  typical_organization_size?: string;
  seniority_level?: string;
  department_id?: string;
  department_slug?: string;
  department_name?: string;
  function_id?: string;
  function_slug?: string;
  function_name?: string;
  role_id?: string;
  role_slug?: string;
  role_name?: string;
  // Joined org structure data
  org_roles?: { id: string; name: string; role_code?: string } | null;
  org_departments?: { id: string; name: string; department_code?: string } | null;
  org_functions?: { id: string; name: string; function_code?: string } | null;
  years_of_experience?: number;
  years_in_function?: number;
  years_in_industry?: number;
  years_in_current_role?: number;
  education_level?: string;
  budget_authority?: string;
  key_responsibilities?: string[];
  technology_adoption?: string;
  risk_tolerance?: string;
  decision_making_style?: string;
  learning_style?: string;
  work_style?: string;
  work_style_preference?: string;
  work_arrangement?: string;
  location_type?: string;
  geographic_scope?: string;
  team_size?: string;
  team_size_typical?: number;
  direct_reports?: number;
  reporting_to?: string;
  span_of_control?: string;
  salary_min_usd?: number;
  salary_median_usd?: number;
  salary_max_usd?: number;
  metadata?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
  // Counts from junction tables
  pain_points_count?: number;
  jtbds_count?: number;
  goals_count?: number;
  challenges_count?: number;
}

export interface PersonaStats {
  total: number;
  totalRoles?: number;
  totalDepartments?: number;
  totalFunctions?: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  byFunction: Record<string, number>;
  bySeniority: Record<string, number>;
}

export interface PersonaFilters {
  searchQuery: string;
  selectedRole: string;
  selectedDepartment: string;
  selectedFunction: string;
  selectedSeniority: string;
}


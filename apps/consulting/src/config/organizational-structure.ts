/**
 * Centralized Organizational Structure Configuration
 *
 * This file defines the hierarchical structure of:
 * - Business Functions (main organizational areas)
 * - Departments (within each function)
 * - Roles (within each department)
 *
 * Based on healthcare industry standards and aligned with the database schema
 * defined in: database/sql/migrations/2025/20250120000000_healthcare_compliance_enhancement.sql
 *
 * Database mappings:
 * - business_functions table: regulatory_affairs, clinical_development, market_access, medical_writing, safety_pharmacovigilance, quality_assurance
 * - org_functions, org_departments, org_roles: New organizational structure tables
 */

// FALLBACK ONLY - Database (org_functions table) is the single source of truth
// These 12 functions match what's in Supabase and serve as fallback when DB is unavailable
export const BUSINESS_FUNCTIONS = [
  { value: 'research-development', label: 'Research & Development' },
  { value: 'clinical-development', label: 'Clinical Development' },
  { value: 'regulatory-affairs', label: 'Regulatory Affairs' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'quality', label: 'Quality' },
  { value: 'medical-affairs', label: 'Medical Affairs' },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'business-development', label: 'Business Development' },
  { value: 'legal', label: 'Legal' },
  { value: 'finance', label: 'Finance' },
  { value: 'it-digital', label: 'IT/Digital' },
] as const;

/**
 * Departments mapped by business function
 * Supports fuzzy matching with multiple key formats for flexibility
 */
export const DEPARTMENTS_BY_FUNCTION: Record<string, string[]> = {
  // Regulatory Affairs
  'regulatory-affairs': ['Regulatory Strategy', 'Regulatory Operations', 'Regulatory Intelligence'],
  'Regulatory Affairs': ['Regulatory Strategy', 'Regulatory Operations', 'Regulatory Intelligence'],
  'Regulatory': ['Regulatory Strategy', 'Regulatory Operations', 'Regulatory Intelligence'],

  // Clinical Affairs / Clinical Development
  'clinical-affairs': ['Clinical Operations', 'Clinical Science', 'Biostatistics', 'Data Management'],
  'Clinical Affairs': ['Clinical Operations', 'Clinical Science', 'Biostatistics', 'Data Management'],
  'Clinical Development': ['Clinical Operations', 'Clinical Science', 'Biostatistics', 'Data Management'],
  'clinical-development': ['Clinical Operations', 'Clinical Science', 'Biostatistics', 'Data Management'],
  'Clinical': ['Clinical Operations', 'Clinical Science', 'Biostatistics', 'Data Management'],

  // Medical Affairs
  'medical-affairs': ['Medical Information', 'Medical Writing', 'Publications', 'Medical Science Liaison'],
  'Medical Affairs': ['Medical Information', 'Medical Writing', 'Publications', 'Medical Science Liaison'],
  'Medical': ['Medical Information', 'Medical Writing', 'Publications', 'Medical Science Liaison'],

  // Commercial / Market Access
  'commercial': ['Market Access', 'HEOR', 'Payer Relations', 'Pricing & Contracting', 'Value & Evidence', 'Access Strategy', 'Reimbursement', 'Commercial Analytics', 'Market Insights & Intelligence', 'Patient Access Services', 'Policy & Government Affairs', 'Trade & Distribution'],
  'Commercial': ['Market Access', 'HEOR', 'Payer Relations', 'Pricing & Contracting', 'Value & Evidence', 'Access Strategy', 'Reimbursement', 'Commercial Analytics', 'Market Insights & Intelligence', 'Patient Access Services', 'Policy & Government Affairs', 'Trade & Distribution'],
  'market-access': ['Market Access', 'HEOR', 'Payer Relations', 'Pricing & Contracting', 'Value & Evidence', 'Access Strategy', 'Reimbursement', 'Commercial Analytics', 'Market Insights & Intelligence', 'Patient Access Services', 'Policy & Government Affairs', 'Trade & Distribution'],
  'market_access': ['Market Access', 'HEOR', 'Payer Relations', 'Pricing & Contracting', 'Value & Evidence', 'Access Strategy', 'Reimbursement', 'Commercial Analytics', 'Market Insights & Intelligence', 'Patient Access Services', 'Policy & Government Affairs', 'Trade & Distribution'],
  'Market Access': ['Market Access', 'HEOR', 'Payer Relations', 'Pricing & Contracting', 'Value & Evidence', 'Access Strategy', 'Reimbursement', 'Commercial Analytics', 'Market Insights & Intelligence', 'Patient Access Services', 'Policy & Government Affairs', 'Trade & Distribution'],

  // Safety / Pharmacovigilance
  'safety': ['Pharmacovigilance', 'Drug Safety', 'Signal Detection', 'Risk Management'],
  'Safety': ['Pharmacovigilance', 'Drug Safety', 'Signal Detection', 'Risk Management'],
  'Pharmacovigilance': ['Pharmacovigilance', 'Drug Safety', 'Signal Detection', 'Risk Management'],
  'pharmacovigilance': ['Pharmacovigilance', 'Drug Safety', 'Signal Detection', 'Risk Management'],
  'safety-pharmacovigilance': ['Pharmacovigilance', 'Drug Safety', 'Signal Detection', 'Risk Management'],

  // Quality / Quality Assurance
  'quality': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing', 'Quality Assurance'],
  'Quality': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing', 'Quality Assurance'],
  'Quality Assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing', 'Quality Assurance'],
  'quality-assurance': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing', 'Quality Assurance'],
  'QA': ['Quality Management Systems', 'Quality Control', 'Compliance & Auditing', 'Quality Assurance'],
};

/**
 * Roles mapped by business function and department
 * Structure: { function_key: { department_name: [roles...] } }
 */

// Regulatory Affairs Roles
const REGULATORY_ROLES = {
  'Regulatory Strategy': ['Strategy Director', 'Regulatory Strategist', 'Senior Regulatory Affairs Manager'],
  'Regulatory Operations': ['Regulatory Affairs Manager', 'Regulatory Specialist', 'Regulatory Coordinator'],
  'Regulatory Intelligence': ['Regulatory Intelligence Manager', 'Intelligence Analyst', 'Competitive Intelligence Specialist'],
};

// Clinical Affairs Roles
const CLINICAL_ROLES = {
  'Clinical Operations': ['Clinical Operations Manager', 'Clinical Research Associate', 'CRA Supervisor', 'Clinical Trial Manager'],
  'Clinical Science': ['Medical Director', 'Clinical Scientist', 'Clinical Pharmacologist'],
  'Biostatistics': ['Biostatistician', 'Senior Biostatistician', 'Statistical Programmer'],
  'Data Management': ['Data Manager', 'Clinical Data Coordinator', 'Database Administrator'],
};

// Medical Affairs Roles
const MEDICAL_AFFAIRS_ROLES = {
  'Medical Information': ['Medical Information Specialist', 'Medical Information Manager', 'Senior Medical Reviewer'],
  'Medical Writing': ['Medical Writer', 'Senior Medical Writer', 'Medical Writing Manager'],
  'Publications': ['Publications Manager', 'Publications Specialist', 'Scientific Communications Lead'],
  'Medical Science Liaison': ['MSL', 'Senior MSL', 'MSL Manager', 'Field Medical Director'],
};

// Commercial Roles
const COMMERCIAL_ROLES = {
  'Market Access': ['Market Access Director', 'Market Access Manager', 'Reimbursement Specialist'],
  'HEOR': ['HEOR Director', 'HEOR Manager', 'Health Economics Analyst', 'Outcomes Research Scientist'],
  'Payer Relations': ['Payer Relations Manager', 'Account Manager', 'Contracting Specialist'],
  'Value & Access': ['Value & Access Lead', 'Value Dossier Manager', 'Access Strategy Manager'],
};

// Safety / Pharmacovigilance Roles
const SAFETY_ROLES = {
  'Pharmacovigilance': ['Pharmacovigilance Director', 'Pharmacovigilance Manager', 'PV Specialist', 'Safety Scientist'],
  'Drug Safety': ['Drug Safety Officer', 'Safety Physician', 'Drug Safety Associate'],
  'Signal Detection': ['Signal Detection Manager', 'Safety Signal Analyst', 'Safety Data Analyst'],
  'Risk Management': ['Risk Management Manager', 'Risk Management Specialist', 'RMP Lead'],
};

// Quality Roles
const QUALITY_ROLES = {
  'Quality Management Systems': ['QMS Architect', 'QMS Manager', 'ISO 13485 Specialist', 'Design Controls Lead'],
  'Quality Control': ['Quality Analyst', 'QC Manager', 'Testing Specialist', 'Validation Engineer'],
  'Compliance & Auditing': ['Compliance Officer', 'Internal Auditor', 'Regulatory Compliance Specialist', 'Audit Manager'],
  'Quality Assurance': ['QA Manager', 'Quality Assurance Specialist', 'QA Lead', 'Senior Specialist'],
};

/**
 * Complete roles mapping by function
 * Includes fuzzy matching keys for flexibility
 */
export const ROLES_BY_DEPARTMENT: Record<string, Record<string, string[]>> = {
  // Regulatory Affairs
  'regulatory-affairs': REGULATORY_ROLES,
  'Regulatory Affairs': REGULATORY_ROLES,
  'Regulatory': REGULATORY_ROLES,

  // Clinical Affairs
  'clinical-affairs': CLINICAL_ROLES,
  'Clinical Affairs': CLINICAL_ROLES,
  'Clinical Development': CLINICAL_ROLES,
  'clinical-development': CLINICAL_ROLES,
  'Clinical': CLINICAL_ROLES,

  // Medical Affairs
  'medical-affairs': MEDICAL_AFFAIRS_ROLES,
  'Medical Affairs': MEDICAL_AFFAIRS_ROLES,
  'Medical': MEDICAL_AFFAIRS_ROLES,

  // Commercial
  'commercial': COMMERCIAL_ROLES,
  'Commercial': COMMERCIAL_ROLES,
  'market-access': COMMERCIAL_ROLES,
  'Market Access': COMMERCIAL_ROLES,

  // Safety
  'safety': SAFETY_ROLES,
  'Safety': SAFETY_ROLES,
  'Pharmacovigilance': SAFETY_ROLES,
  'pharmacovigilance': SAFETY_ROLES,
  'safety-pharmacovigilance': SAFETY_ROLES,

  // Quality
  'quality': QUALITY_ROLES,
  'Quality': QUALITY_ROLES,
  'Quality Assurance': QUALITY_ROLES,
  'quality-assurance': QUALITY_ROLES,
  'QA': QUALITY_ROLES,
};

/**
 * Helper function to get departments for a business function
 */
export function getDepartmentsForFunction(businessFunction: string): string[] {
  return DEPARTMENTS_BY_FUNCTION[businessFunction] || [];
}

/**
 * Helper function to get roles for a department within a business function
 */
export function getRolesForDepartment(businessFunction: string, department: string): string[] {
  const departmentRoles = ROLES_BY_DEPARTMENT[businessFunction];
  if (!departmentRoles) return [];
  return departmentRoles[department] || [];
}

/**
 * Helper function to normalize business function names
 * Useful for converting between different formats (kebab-case, Title Case, etc.)
 */
export function normalizeBusinessFunction(input: string): string | undefined {
  const normalized = input.toLowerCase().replace(/\s+/g, '-');

  const mapping: Record<string, string> = {
    'regulatory-affairs': 'Regulatory Affairs',
    'regulatory': 'Regulatory Affairs',
    'clinical-affairs': 'Clinical Development',
    'clinical-development': 'Clinical Development',
    'clinical': 'Clinical Development',
    'medical-affairs': 'Medical Affairs',
    'medical': 'Medical Affairs',
    'commercial': 'Commercial',
    'market-access': 'Commercial',
    'safety': 'Safety',
    'pharmacovigilance': 'Safety',
    'safety-pharmacovigilance': 'Safety',
    'quality': 'Quality',
    'quality-assurance': 'Quality',
    'qa': 'Quality',
  };

  return mapping[normalized];
}

/**
 * Get all unique departments across all functions
 */
export function getAllDepartments(): string[] {
  const departments = new Set<string>();
  Object.values(DEPARTMENTS_BY_FUNCTION).forEach(depts => {
    depts.forEach(dept => departments.add(dept));
  });
  return Array.from(departments).sort();
}

/**
 * Get all unique roles across all departments
 */
export function getAllRoles(): string[] {
  const roles = new Set<string>();
  Object.values(ROLES_BY_DEPARTMENT).forEach(deptRoles => {
    Object.values(deptRoles).forEach(roleList => {
      roleList.forEach(role => roles.add(role));
    });
  });
  return Array.from(roles).sort();
}

// Organizational structure configuration for VITAL Path
export const organizationalStructure = {
  departments: [
    {
      id: 'clinical',
      name: 'Clinical Operations',
      description: 'Clinical trials, patient care, and medical research',
      functions: ['clinical-trials', 'patient-care', 'medical-research']
    },
    {
      id: 'regulatory',
      name: 'Regulatory Affairs',
      description: 'Compliance, regulatory submissions, and quality assurance',
      functions: ['compliance', 'regulatory-submissions', 'quality-assurance']
    },
    {
      id: 'research',
      name: 'Research & Development',
      description: 'Drug discovery, development, and innovation',
      functions: ['drug-discovery', 'development', 'innovation']
    },
    {
      id: 'commercial',
      name: 'Commercial Operations',
      description: 'Marketing, sales, and business development',
      functions: ['marketing', 'sales', 'business-development']
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Manufacturing, supply chain, and logistics',
      functions: ['manufacturing', 'supply-chain', 'logistics']
    }
  ],
  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access and management',
      permissions: ['all']
    },
    {
      id: 'clinician',
      name: 'Clinician',
      description: 'Clinical operations and patient care',
      permissions: ['clinical', 'patient-data', 'medical-records']
    },
    {
      id: 'researcher',
      name: 'Researcher',
      description: 'Research and development activities',
      permissions: ['research', 'data-analysis', 'experiments']
    },
    {
      id: 'regulatory',
      name: 'Regulatory Specialist',
      description: 'Compliance and regulatory affairs',
      permissions: ['compliance', 'regulatory', 'quality']
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to relevant data',
      permissions: ['read']
    }
  ],
  functions: [
    {
      id: 'clinical-trials',
      name: 'Clinical Trials',
      department: 'clinical',
      description: 'Clinical trial management and monitoring'
    },
    {
      id: 'patient-care',
      name: 'Patient Care',
      department: 'clinical',
      description: 'Patient care and treatment management'
    },
    {
      id: 'medical-research',
      name: 'Medical Research',
      department: 'clinical',
      description: 'Medical research and studies'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      department: 'regulatory',
      description: 'Regulatory compliance and auditing'
    },
    {
      id: 'regulatory-submissions',
      name: 'Regulatory Submissions',
      department: 'regulatory',
      description: 'Regulatory document submissions'
    },
    {
      id: 'quality-assurance',
      name: 'Quality Assurance',
      department: 'regulatory',
      description: 'Quality assurance and control'
    },
    {
      id: 'drug-discovery',
      name: 'Drug Discovery',
      department: 'research',
      description: 'Drug discovery and development'
    },
    {
      id: 'development',
      name: 'Development',
      department: 'research',
      description: 'Product development and testing'
    },
    {
      id: 'innovation',
      name: 'Innovation',
      department: 'research',
      description: 'Innovation and new technology'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      department: 'commercial',
      description: 'Marketing and promotion'
    },
    {
      id: 'sales',
      name: 'Sales',
      department: 'commercial',
      description: 'Sales and customer relations'
    },
    {
      id: 'business-development',
      name: 'Business Development',
      department: 'commercial',
      description: 'Business development and partnerships'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      department: 'operations',
      description: 'Manufacturing and production'
    },
    {
      id: 'supply-chain',
      name: 'Supply Chain',
      department: 'operations',
      description: 'Supply chain management'
    },
    {
      id: 'logistics',
      name: 'Logistics',
      department: 'operations',
      description: 'Logistics and distribution'
    }
  ]
};

// Helper functions and mappings
export const DEPARTMENTS_BY_FUNCTION = organizationalStructure.functions.reduce((acc, func) => {
  if (!acc[func.department]) {
    acc[func.department] = [];
  }
  acc[func.department].push(func);
  return acc;
}, {} as Record<string, typeof organizationalStructure.functions>);

export const ROLES_BY_DEPARTMENT = organizationalStructure.roles.reduce((acc, role) => {
  // Map roles to departments based on permissions
  const departments = organizationalStructure.departments.filter(dept => 
    role.permissions.some(perm => dept.functions.includes(perm))
  );
  departments.forEach(dept => {
    if (!acc[dept.id]) {
      acc[dept.id] = [];
    }
    acc[dept.id].push(role);
  });
  return acc;
}, {} as Record<string, typeof organizationalStructure.roles>);

export const BUSINESS_FUNCTIONS = organizationalStructure.functions;

export default organizationalStructure;

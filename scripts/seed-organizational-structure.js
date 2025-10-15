const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const organizationalData = {
  'Medical Affairs': {
    code: 'MA',
    description: 'Medical strategy, scientific communications, and clinical liaison',
    departments: {
      'Medical Science Liaisons': {
        roles: ['Medical Science Liaison', 'Senior MSL', 'MSL Manager', 'MSL Team Lead']
      },
      'Medical Information': {
        roles: ['Medical Information Specialist', 'Senior Medical Information Specialist', 'Medical Information Manager']
      },
      'Medical Writing': {
        roles: ['Medical Writer', 'Senior Medical Writer', 'Medical Writing Manager']
      },
      'Publications': {
        roles: ['Publications Manager', 'Publications Specialist', 'Scientific Publications Lead']
      }
    }
  },
  'Clinical Development': {
    code: 'CD',
    description: 'Clinical trial design, execution, and oversight',
    departments: {
      'Clinical Operations': {
        roles: ['Clinical Research Associate', 'Senior CRA', 'Clinical Trial Manager', 'Clinical Operations Director']
      },
      'Clinical Data Management': {
        roles: ['Data Manager', 'Senior Data Manager', 'CDM Lead']
      },
      'Biostatistics': {
        roles: ['Biostatistician', 'Senior Biostatistician', 'Biostatistics Manager']
      },
      'Clinical Pharmacology': {
        roles: ['Clinical Pharmacologist', 'Senior Clinical Pharmacologist', 'Clinical Pharmacology Director']
      }
    }
  },
  'Regulatory Affairs': {
    code: 'RA',
    description: 'Regulatory strategy, submissions, and compliance',
    departments: {
      'Regulatory Strategy': {
        roles: ['Regulatory Strategist', 'Senior Regulatory Strategist', 'Regulatory Strategy Director']
      },
      'Regulatory Submissions': {
        roles: ['Regulatory Affairs Specialist', 'Senior Regulatory Affairs Specialist', 'Submissions Manager']
      },
      'Regulatory Intelligence': {
        roles: ['Regulatory Intelligence Analyst', 'Senior Regulatory Intelligence Analyst']
      }
    }
  },
  'Pharmacovigilance': {
    code: 'PV',
    description: 'Drug safety monitoring and adverse event management',
    departments: {
      'Safety Operations': {
        roles: ['Safety Officer', 'Senior Safety Officer', 'Safety Operations Manager']
      },
      'Signal Detection': {
        roles: ['Signal Detection Specialist', 'Senior Signal Detection Specialist', 'Signal Detection Lead']
      },
      'Safety Reporting': {
        roles: ['Safety Reporting Specialist', 'Senior Safety Reporting Specialist', 'Safety Reporting Manager']
      }
    }
  },
  'Quality Assurance': {
    code: 'QA',
    description: 'Quality systems, auditing, and compliance',
    departments: {
      'Quality Control': {
        roles: ['QC Analyst', 'Senior QC Analyst', 'QC Manager']
      },
      'Quality Assurance': {
        roles: ['QA Specialist', 'Senior QA Specialist', 'QA Manager', 'QA Director']
      },
      'Auditing': {
        roles: ['Quality Auditor', 'Senior Quality Auditor', 'Audit Manager']
      }
    }
  },
  'Business Development': {
    code: 'BD',
    description: 'Partnerships, licensing, and strategic growth',
    departments: {
      'Corporate Development': {
        roles: ['Business Development Manager', 'Senior Business Development Manager', 'VP Business Development']
      },
      'Licensing': {
        roles: ['Licensing Manager', 'Senior Licensing Manager', 'Licensing Director']
      },
      'Alliance Management': {
        roles: ['Alliance Manager', 'Senior Alliance Manager', 'Alliance Director']
      }
    }
  },
  'Commercial': {
    code: 'COM',
    description: 'Marketing, sales, and market access',
    departments: {
      'Marketing': {
        roles: ['Product Manager', 'Senior Product Manager', 'Marketing Director']
      },
      'Sales': {
        roles: ['Sales Representative', 'Senior Sales Representative', 'Sales Manager', 'Regional Sales Director']
      },
      'Market Access': {
        roles: ['Market Access Manager', 'Senior Market Access Manager', 'Market Access Director']
      },
      'Brand Strategy': {
        roles: ['Brand Strategist', 'Senior Brand Strategist', 'Brand Strategy Director']
      }
    }
  },
  'Research & Development': {
    code: 'RD',
    description: 'Drug discovery, preclinical, and translational research',
    departments: {
      'Discovery Research': {
        roles: ['Research Scientist', 'Senior Research Scientist', 'Principal Scientist', 'Research Director']
      },
      'Preclinical Development': {
        roles: ['Preclinical Scientist', 'Senior Preclinical Scientist', 'Preclinical Development Manager']
      },
      'Translational Medicine': {
        roles: ['Translational Scientist', 'Senior Translational Scientist', 'Translational Medicine Director']
      }
    }
  },
  'Manufacturing & Supply Chain': {
    code: 'MSC',
    description: 'Production, supply chain, and logistics',
    departments: {
      'Manufacturing Operations': {
        roles: ['Manufacturing Operator', 'Manufacturing Supervisor', 'Manufacturing Manager', 'Plant Manager']
      },
      'Supply Chain': {
        roles: ['Supply Chain Analyst', 'Supply Chain Manager', 'Supply Chain Director']
      },
      'Process Development': {
        roles: ['Process Development Scientist', 'Senior Process Development Scientist', 'Process Development Manager']
      }
    }
  },
  'Data Science & Analytics': {
    code: 'DSA',
    description: 'Data analytics, AI/ML, and real-world evidence',
    departments: {
      'Data Science': {
        roles: ['Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Data Science Manager']
      },
      'Real-World Evidence': {
        roles: ['RWE Analyst', 'Senior RWE Analyst', 'RWE Manager']
      },
      'Analytics': {
        roles: ['Analytics Specialist', 'Senior Analytics Specialist', 'Analytics Manager']
      }
    }
  },
  'Digital Health': {
    code: 'DH',
    description: 'Digital therapeutics, health tech, and connected health',
    departments: {
      'Digital Therapeutics': {
        roles: ['Digital Health Specialist', 'Senior Digital Health Specialist', 'Digital Health Director']
      },
      'Health Technology': {
        roles: ['Health Tech Product Manager', 'Senior Health Tech Product Manager', 'Health Tech Director']
      },
      'Connected Health': {
        roles: ['Connected Health Specialist', 'Senior Connected Health Specialist', 'Connected Health Manager']
      }
    }
  },
  'Health Economics & Outcomes Research': {
    code: 'HEOR',
    description: 'Health economics, outcomes research, and value demonstration',
    departments: {
      'Health Economics': {
        roles: ['Health Economist', 'Senior Health Economist', 'Health Economics Manager']
      },
      'Outcomes Research': {
        roles: ['Outcomes Researcher', 'Senior Outcomes Researcher', 'Outcomes Research Manager']
      },
      'HEOR Strategy': {
        roles: ['HEOR Strategist', 'Senior HEOR Strategist', 'HEOR Director']
      }
    }
  }
};

async function seedOrganizationalStructure() {
  console.log('🌱 Starting organizational structure seeding...\n');

  for (const [functionName, functionData] of Object.entries(organizationalData)) {
    console.log(`📊 Processing Business Function: ${functionName}`);

    // Insert business function
    const { data: businessFunction, error: functionError } = await supabase
      .from('business_functions')
      .upsert({
        code: functionData.code,
        name: functionName,
        description: functionData.description
      }, {
        onConflict: 'code',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (functionError) {
      console.error(`  ❌ Error inserting business function ${functionName}:`, functionError);
      continue;
    }

    console.log(`  ✅ Business function created: ${functionName} (${businessFunction.id})`);

    // Insert departments and roles
    for (const [deptName, deptData] of Object.entries(functionData.departments)) {
      // Check if department already exists
      const { data: existingDept } = await supabase
        .from('departments')
        .select('*')
        .eq('business_function_id', businessFunction.id)
        .eq('name', deptName)
        .single();

      let department;
      if (existingDept) {
        department = existingDept;
        console.log(`    📁 Department exists: ${deptName} (${department.id})`);
      } else {
        const { data: newDept, error: deptError } = await supabase
          .from('departments')
          .insert({
            business_function_id: businessFunction.id,
            name: deptName,
            description: `${deptName} department within ${functionName}`
          })
          .select()
          .single();

        if (deptError) {
          console.error(`    ❌ Error inserting department ${deptName}:`, deptError);
          continue;
        }

        department = newDept;
        console.log(`    📁 Department created: ${deptName} (${department.id})`);
      }

      // Insert roles
      for (const roleName of deptData.roles) {
        // Determine level from role name
        let level = 'Individual Contributor';
        if (roleName.includes('Senior') || roleName.includes('Sr.')) level = 'Senior';
        if (roleName.includes('Lead') || roleName.includes('Principal')) level = 'Lead';
        if (roleName.includes('Manager')) level = 'Manager';
        if (roleName.includes('Director') || roleName.includes('VP')) level = 'Director';

        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('organizational_roles')
          .select('*')
          .eq('department_id', department.id)
          .eq('name', roleName)
          .single();

        if (existingRole) {
          console.log(`      👤 Role exists: ${roleName} (${level})`);
        } else {
          const { data: role, error: roleError } = await supabase
            .from('organizational_roles')
            .insert({
              business_function_id: businessFunction.id,
              department_id: department.id,
              name: roleName,
              description: `${roleName} within ${deptName}`,
              level: level
            })
            .select()
            .single();

          if (roleError) {
            console.error(`      ❌ Error inserting role ${roleName}:`, roleError);
          } else {
            console.log(`      👤 Role created: ${roleName} (${level})`);
          }
        }
      }
    }

    console.log('');
  }

  // Print statistics
  const { data: functions } = await supabase.from('business_functions').select('id');
  const { data: departments } = await supabase.from('departments').select('id');
  const { data: roles } = await supabase.from('organizational_roles').select('id');

  console.log('✅ Seeding complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Business Functions: ${functions?.length || 0}`);
  console.log(`   - Departments: ${departments?.length || 0}`);
  console.log(`   - Roles: ${roles?.length || 0}`);
}

seedOrganizationalStructure().catch(console.error);

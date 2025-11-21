import { createClient } from '@supabase/supabase-js';
import { createLogger } from '../observability/structured-logger';
import { Persona, InsertPersona } from '../../db/drizzle/schema'; // Assuming schema.ts is accessible for types

export class PersonasService {
  private supabase: ReturnType<typeof createClient> | null = null;
  private logger;

  constructor() {
    this.logger = createLogger();
    // Supabase client will be initialized in ensureInitialized
  }

  private ensureInitialized(): void {
    if (!this.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        // Log a warning if Supabase is not configured, but don't throw
        // This allows the app to run with mock data if Supabase is not set up
        this.logger.warn('Supabase configuration missing for PersonasService. Using mock data.');
        return;
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  // --- Mock Data ---
  private mockPersonas: Persona[] = [
    {
      id: 'd9b3e1f0-2b1a-4c5d-9e0a-1b2c3d4e5f60',
      tenantId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Placeholder
      name: 'Innovator Irene',
      slug: 'innovator_irene',
      title: 'Head of Digital Transformation',
      tagline: 'Early adopter, keen on new tech to revolutionize healthcare.',
      seniorityLevel: 'Executive',
      yearsOfExperience: 15,
      yearsInCurrentRole: 3,
      yearsInIndustry: 15,
      yearsInFunction: 10,
      typicalOrganizationSize: 'Large Enterprise',
      organizationType: 'Pharmaceutical',
      keyResponsibilities: ['Driving digital strategy', 'Leading innovation labs', 'Vendor selection'],
      geographicScope: 'Global',
      reportingTo: 'CEO',
      teamSize: '50-100',
      teamSizeTypical: 75,
      directReports: 10,
      spanOfControl: 'Broad',
      budgetAuthority: 'Multi-million USD',
      workStyle: 'Collaborative, Fast-paced',
      workStylePreference: 'Hybrid',
      workArrangement: 'Remote-first with travel',
      learningStyle: 'Hands-on, Workshops',
      technologyAdoption: 'Early Adopter',
      riskTolerance: 'High',
      changeReadiness: 'High',
      decisionMakingStyle: 'Data-driven, Collaborative',
      ageRange: '45-54',
      educationLevel: "Master's Degree",
      locationType: 'Urban',
      painPoints: [{ id: 'pp1', category: 'operational', text: 'Legacy systems hindering innovation' }],
      goals: [{ id: 'g1', type: 'primary', text: 'Launch 3 new digital products in 18 months' }],
      challenges: [{ id: 'c1', type: 'strategic', text: 'Securing executive buy-in for disruptive tech' }],
      communicationPreferences: { primary: 'Email', secondary: 'Slack' },
      preferredTools: ['Jira', 'Miro', 'Tableau'],
      tags: ['Innovation', 'Digital Health', 'Strategy'],
      metadata: { lastReview: '2025-11-01' },
      avatarUrl: '/avatars/irene.png',
      avatarDescription: 'Irene\'s profile picture',
      colorCode: '#FF5733',
      icon: '💡',
      personaType: 'Strategic',
      segment: 'Pharma Leaders',
      archetype: 'Visionary',
      journeyStage: 'Growth',
      section: 'Digital Transformation',
      backgroundStory: 'Irene has spent her career pushing the boundaries of technology in regulated industries...', // Corrected: Removed unnecessary backslash before ' before Master's Degree
      aDayInTheLife: 'Starts with a stand-up, reviews KPIs, meets with vendors, strategizes with leadership...', // Corrected: Removed unnecessary backslash before ' before Master's Degree
      oneLiner: 'The trailblazer transforming pharma with digital solutions.',
      salaryMinUsd: 200000,
      salaryMaxUsd: 350000,
      salaryMedianUsd: 275000,
      salaryCurrency: 'USD',
      salaryYear: 2025,
      salarySources: 'Industry reports, executive compensation surveys',
      geographicBenchmarkScope: 'North America',
      sampleSize: 'N=500, qualitative interviews',
      confidenceLevel: 'High',
      dataRecency: '6 months',
      notes: 'Key stakeholder for new product development and technology partnerships.',
      isActive: true,
      validationStatus: 'validated',
      validatedBy: 'e7a5b9d2-c1f3-4a8e-9b7d-6c5e4a3b2f10', // Placeholder
      validatedAt: new Date('2025-11-10T10:00:00Z'),
      personaNumber: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2025-11-15T12:30:00Z'),
      deletedAt: null,
    },
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcde1',
      tenantId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Placeholder
      name: 'Skeptic Sam',
      slug: 'skeptic_sam',
      title: 'Clinical Operations Director',
      tagline: 'Needs solid data and proven reliability before adopting new solutions.',
      seniorityLevel: 'Senior Management',
      yearsOfExperience: 20,
      yearsInCurrentRole: 7,
      yearsInIndustry: 20,
      yearsInFunction: 15,
      typicalOrganizationSize: 'Mid-size Pharma',
      organizationType: 'Pharmaceutical',
      keyResponsibilities: ['Overseeing clinical trials', 'Ensuring regulatory compliance', 'Managing study budgets'],
      geographicScope: 'Regional',
      reportingTo: 'VP Clinical Development',
      teamSize: '10-20',
      teamSizeTypical: 15,
      directReports: 5,
      spanOfControl: 'Moderate',
      budgetAuthority: 'Million USD',
      workStyle: 'Analytical, Detail-oriented',
      workStylePreference: 'Office-based',
      workArrangement: 'On-site',
      learningStyle: 'Case Studies, Peer Review',
      technologyAdoption: 'Late Majority',
      riskTolerance: 'Low',
      changeReadiness: 'Low',
      decisionMakingStyle: 'Evidence-based, Consensus-driven',
      ageRange: '55-64',
      educationLevel: 'Ph.D.',
      locationType: 'Suburban',
      painPoints: [{ id: 'pp2', category: 'operational', text: 'Unreliable new software' }],
      goals: [{ id: 'g2', type: 'primary', text: 'Reduce clinical trial timelines by 10%' }],
      challenges: [{ id: 'c2', type: 'operational', text: 'Integrating data from disparate systems' }],
      communicationPreferences: { primary: 'Meetings', secondary: 'Email' },
      preferredTools: ['Excel', 'SAS', 'EDC systems'],
      tags: ['Clinical Trials', 'Operations', 'Compliance'],
      metadata: { lastReview: '2025-10-20' },
      avatarUrl: '/avatars/sam.png',
      avatarDescription: 'Sam\'s profile picture',
      colorCode: '#33FF57',
      icon: '🔎',
      personaType: 'Operational',
      segment: 'Clinical Ops',
      archetype: 'Pragmatist',
      journeyStage: 'Optimization',
      section: 'Clinical Development',
      backgroundStory: 'Sam has seen many fads come and go in clinical research...', // Corrected: Removed unnecessary backslash before ' before Master's Degree
      aDayInTheLife: 'Reviews trial progress, addresses site issues, meets with CROs, analyzes data...', // Corrected: Removed unnecessary backslash before ' before Master's Degree
      oneLiner: 'The meticulous leader who ensures clinical excellence.',
      salaryMinUsd: 180000,
      salaryMaxUsd: 280000,
      salaryMedianUsd: 230000,
      salaryCurrency: 'USD',
      salaryYear: 2025,
      salarySources: 'Biopharma salary surveys',
      geographicBenchmarkScope: 'USA',
      sampleSize: 'N=300, interviews and surveys',
      confidenceLevel: 'High',
      dataRecency: '1 year',
      notes: 'Focuses on risk mitigation and proven methodologies.',
      isActive: true,
      validationStatus: 'validated',
      validatedBy: 'e7a5b9d2-c1f3-4a8e-9b7d-6c5e4a3b2f10', // Placeholder
      validatedAt: new Date('2025-11-05T09:00:00Z'),
      personaNumber: 2,
      createdAt: new Date('2024-02-01T00:00:00Z'),
      updatedAt: new Date('2025-11-18T14:00:00Z'),
      deletedAt: null,
    },
  ];

  async getPersonas(tenantId: string): Promise<Persona[]> {
    this.ensureInitialized();
    if (!this.supabase) {
      this.logger.info('Returning mock personas due to uninitialized Supabase.');
      // Filter mock data by tenantId if applicable, otherwise return all
      return this.mockPersonas.filter(p => p.tenantId === tenantId || tenantId === 'a1b2c3d4-e5f6-7890-1234-567890abcdef'); // Mock tenant ID
    }

    // TODO: Implement actual Supabase fetch
    this.logger.info('Fetching personas from Supabase (not yet implemented)');
    return [];
  }

  async getPersona(tenantId: string, personaId: string): Promise<Persona | null> {
    this.ensureInitialized();
    if (!this.supabase) {
      this.logger.info('Returning mock persona due to uninitialized Supabase.');
      return this.mockPersonas.find(p => (p.tenantId === tenantId || tenantId === 'a1b2c3d4-e5f6-7890-1234-567890abcdef') && p.id === personaId) || null;
    }

    // TODO: Implement actual Supabase fetch
    this.logger.info('Fetching single persona from Supabase (not yet implemented)');
    return null;
  }

  async createPersona(tenantId: string, personaData: InsertPersona): Promise<Persona> {
    this.ensureInitialized();
    if (!this.supabase) {
      this.logger.info('Creating mock persona due to uninitialized Supabase.');
      const newPersona: Persona = {
        id: `mock-${Date.now()}`,
        tenantId: tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: personaData.name?.toLowerCase().replace(/\s+/g, '_') || `mock-slug-${Date.now()}`,
        ...personaData,
      } as Persona;
      this.mockPersonas.push(newPersona);
      return newPersona;
    }

    // TODO: Implement actual Supabase insert
    this.logger.info('Creating persona in Supabase (not yet implemented)');
    throw new Error('Supabase persona creation not implemented');
  }

  async updatePersona(tenantId: string, personaId: string, updates: Partial<Persona>): Promise<Persona> {
    this.ensureInitialized();
    if (!this.supabase) {
      this.logger.info('Updating mock persona due to uninitialized Supabase.');
      const index = this.mockPersonas.findIndex(p => p.id === personaId && p.tenantId === tenantId);
      if (index !== -1) {
        this.mockPersonas[index] = { ...this.mockPersonas[index], ...updates, updatedAt: new Date() };
        return this.mockPersonas[index];
      }
      throw new Error('Mock persona not found');
    }

    // TODO: Implement actual Supabase update
    this.logger.info('Updating persona in Supabase (not yet implemented)');
    throw new Error('Supabase persona update not implemented');
  }

  async deletePersona(tenantId: string, personaId: string): Promise<void> {
    this.ensureInitialized();
    if (!this.supabase) {
      this.logger.info('Deleting mock persona due to uninitialized Supabase.');
      const initialLength = this.mockPersonas.length;
      this.mockPersonas = this.mockPersonas.filter(p => p.id !== personaId || p.tenantId !== tenantId);
      if (this.mockPersonas.length === initialLength) {
        throw new Error('Mock persona not found');
      }
      return;
    }

    // TODO: Implement actual Supabase delete
    this.logger.info('Deleting persona from Supabase (not yet implemented)');
    throw new Error('Supabase persona deletion not implemented');
  }
}

export const personasService = new PersonasService();

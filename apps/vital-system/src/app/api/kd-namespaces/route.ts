import { NextRequest, NextResponse } from 'next/server';

/**
 * Knowledge Domain (KD) Namespace Configuration
 *
 * These namespaces map to Pinecone vector store namespaces for RAG retrieval.
 * Format: KD-{category}-{domain}
 *
 * Categories:
 * - reg: Regulatory (FDA, EMA, ICH)
 * - dh: Digital Health (SaMD, Interoperability, Cybersecurity)
 * - clinical: Clinical Operations (Trials, Biostatistics)
 * - ma: Medical Affairs (MSL, Medical Info, Education)
 * - heor: Health Economics & Outcomes Research
 * - safety: Drug Safety & Pharmacovigilance
 * - general: General knowledge and best practices
 */

export interface KDNamespace {
  namespace: string;
  name: string;
  description: string;
  category: 'regulatory' | 'digital_health' | 'clinical' | 'medical_affairs' | 'heor' | 'safety' | 'general';
  icon?: string;
  vectorCount?: number;
}

// Static configuration of available KD namespaces
// This matches the namespace_config.py structure but with KD-* prefix
const KD_NAMESPACES: KDNamespace[] = [
  // --- REGULATORY ---
  {
    namespace: 'KD-reg-fda',
    name: 'FDA Regulations',
    description: 'FDA regulations, guidance documents, 510(k), PMA, De Novo',
    category: 'regulatory',
    icon: '🏛️',
  },
  {
    namespace: 'KD-reg-ema',
    name: 'EMA/EU MDR',
    description: 'EMA regulations, EU MDR, IVDR',
    category: 'regulatory',
    icon: '🇪🇺',
  },
  {
    namespace: 'KD-reg-ich',
    name: 'ICH Guidelines',
    description: 'ICH guidelines and harmonization standards',
    category: 'regulatory',
    icon: '🌐',
  },
  {
    namespace: 'KD-reg-general',
    name: 'General Regulatory',
    description: 'General regulatory content and compliance standards',
    category: 'regulatory',
    icon: '📋',
  },

  // --- DIGITAL HEALTH ---
  {
    namespace: 'KD-dh-samd',
    name: 'SaMD/AI-ML',
    description: 'Software as Medical Device (SaMD), AI/ML regulations',
    category: 'digital_health',
    icon: '💻',
  },
  {
    namespace: 'KD-dh-interop',
    name: 'Interoperability',
    description: 'Healthcare interoperability (FHIR, HL7, standards)',
    category: 'digital_health',
    icon: '🔗',
  },
  {
    namespace: 'KD-dh-cybersec',
    name: 'Cybersecurity',
    description: 'Healthcare cybersecurity and data protection',
    category: 'digital_health',
    icon: '🔒',
  },
  {
    namespace: 'KD-dh-general',
    name: 'General Digital Health',
    description: 'General digital health foundations',
    category: 'digital_health',
    icon: '📱',
  },

  // --- CLINICAL ---
  {
    namespace: 'KD-clinical-trials',
    name: 'Clinical Trials',
    description: 'Clinical trials design, conduct, and management',
    category: 'clinical',
    icon: '🔬',
  },
  {
    namespace: 'KD-clinical-ops',
    name: 'Clinical Operations',
    description: 'Clinical operations and site management',
    category: 'clinical',
    icon: '🏥',
  },
  {
    namespace: 'KD-clinical-biostat',
    name: 'Biostatistics',
    description: 'Biostatistics and data analysis',
    category: 'clinical',
    icon: '📊',
  },

  // --- MEDICAL AFFAIRS ---
  {
    namespace: 'KD-ma-msl',
    name: 'MSL/Field Medical',
    description: 'Medical Science Liaison activities',
    category: 'medical_affairs',
    icon: '👨‍⚕️',
  },
  {
    namespace: 'KD-ma-info',
    name: 'Medical Information',
    description: 'Medical information and inquiry management',
    category: 'medical_affairs',
    icon: 'ℹ️',
  },
  {
    namespace: 'KD-ma-education',
    name: 'Medical Education',
    description: 'Medical education and HCP training',
    category: 'medical_affairs',
    icon: '🎓',
  },
  {
    namespace: 'KD-ma-comms',
    name: 'Scientific Communications',
    description: 'Scientific communications and publications',
    category: 'medical_affairs',
    icon: '📝',
  },

  // --- HEOR & RWE ---
  {
    namespace: 'KD-heor-rwe',
    name: 'Real-World Evidence',
    description: 'Real-world evidence and observational studies',
    category: 'heor',
    icon: '🌍',
  },
  {
    namespace: 'KD-heor-econ',
    name: 'Health Economics',
    description: 'Health economics and outcomes research',
    category: 'heor',
    icon: '💰',
  },
  {
    namespace: 'KD-heor-access',
    name: 'Market Access',
    description: 'Market access, pricing, and reimbursement',
    category: 'heor',
    icon: '🚪',
  },

  // --- SAFETY ---
  {
    namespace: 'KD-safety-pv',
    name: 'Pharmacovigilance',
    description: 'Pharmacovigilance and drug safety',
    category: 'safety',
    icon: '⚠️',
  },

  // --- GENERAL ---
  {
    namespace: 'KD-best-practices',
    name: 'Best Practices',
    description: 'Best practices and use cases',
    category: 'general',
    icon: '⭐',
  },
  {
    namespace: 'KD-futures',
    name: 'Futures & Innovation',
    description: 'Futures thinking and innovation',
    category: 'general',
    icon: '🚀',
  },
  {
    namespace: 'KD-industry',
    name: 'Industry Reports',
    description: 'Industry reports and market intelligence',
    category: 'general',
    icon: '📈',
  },
  {
    namespace: 'KD-coaching',
    name: 'Coaching & Development',
    description: 'Coaching and professional development',
    category: 'general',
    icon: '🎯',
  },
  {
    namespace: 'KD-general',
    name: 'General Knowledge',
    description: 'General knowledge base content',
    category: 'general',
    icon: '📚',
  },
];

// Category metadata for grouping
const CATEGORIES = [
  { id: 'regulatory', name: 'Regulatory', icon: '⚖️' },
  { id: 'digital_health', name: 'Digital Health', icon: '💻' },
  { id: 'clinical', name: 'Clinical Operations', icon: '🔬' },
  { id: 'medical_affairs', name: 'Medical Affairs', icon: '👨‍⚕️' },
  { id: 'heor', name: 'HEOR & Market Access', icon: '💰' },
  { id: 'safety', name: 'Safety & PV', icon: '⚠️' },
  { id: 'general', name: 'General', icon: '📚' },
];

/**
 * GET /api/kd-namespaces
 * Returns available Knowledge Domain namespaces for agent configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: filter by category
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let namespaces = KD_NAMESPACES;

    if (category && category !== 'all') {
      namespaces = namespaces.filter(ns => ns.category === category);
    }

    return NextResponse.json({
      namespaces,
      categories: CATEGORIES,
      count: namespaces.length,
    });
  } catch (error) {
    console.error('Error fetching KD namespaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KD namespaces' },
      { status: 500 }
    );
  }
}

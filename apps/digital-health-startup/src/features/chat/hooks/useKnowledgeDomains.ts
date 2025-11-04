import { useState, useEffect } from 'react';
import { supabase } from '@vital/sdk/client';

interface KnowledgeDomain {
  value: string;
  label: string;
  tier: number;
  recommended_embedding?: string;
  recommended_chat?: string;
  color?: string;
}

const fallbackKnowledgeDomains: KnowledgeDomain[] = [
  { value: 'regulatory-affairs', label: 'Regulatory Affairs', tier: 1 },
  { value: 'clinical-research', label: 'Clinical Research', tier: 1 },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance', tier: 1 },
  { value: 'medical-affairs', label: 'Medical Affairs', tier: 2 },
  { value: 'quality-assurance', label: 'Quality Assurance', tier: 2 },
  { value: 'market-access', label: 'Market Access', tier: 2 },
  { value: 'health-economics', label: 'Health Economics', tier: 2 },
  { value: 'real-world-evidence', label: 'Real-World Evidence', tier: 2 },
  { value: 'competitive-intelligence', label: 'Competitive Intelligence', tier: 3 },
];

interface RecommendedModels {
  embedding: string | null;
  chat: string | null;
}

export function useKnowledgeDomains() {
  const [knowledgeDomains, setKnowledgeDomains] = useState<KnowledgeDomain[]>(fallbackKnowledgeDomains);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [recommendedModels, setRecommendedModels] = useState<RecommendedModels>({
    embedding: null,
    chat: null,
  });

  useEffect(() => {
    const fetchKnowledgeDomains = async () => {
      try {
        setLoadingDomains(true);
        const { data, error } = await supabase
          .from('knowledge_domains')
          .select('slug, name, tier, recommended_models, color')
          .eq('is_active', true)
          .order('priority');

        if (error) throw error;

        if (data && data.length > 0) {
          const domains = data.map((d) => ({
            value: d.slug,
            label: d.name,
            tier: d.tier,
            recommended_embedding: d.recommended_models?.embedding?.primary,
            recommended_chat: d.recommended_models?.chat?.primary,
            color: d.color,
          }));
          setKnowledgeDomains(domains);
          console.log(`✅ Loaded ${domains.length} knowledge domains from database`);
        } else {
          setKnowledgeDomains(fallbackKnowledgeDomains);
          console.log('ℹ️ Using fallback knowledge domains');
        }
      } catch (error) {
        console.error('Failed to load knowledge domains:', error);
        setKnowledgeDomains(fallbackKnowledgeDomains);
      } finally {
        setLoadingDomains(false);
      }
    };

    fetchKnowledgeDomains();
  }, []);

  return {
    knowledgeDomains,
    loadingDomains,
    recommendedModels,
    setRecommendedModels,
  };
}


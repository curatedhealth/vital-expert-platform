/**
 * Domain Metadata Component
 * Displays keywords, sub-domains, and statistics
 */

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface DomainMetadataProps {
  domain: any;
}

export function DomainMetadata({ domain }: DomainMetadataProps) {
  const hasKeywords = domain.keywords && domain.keywords.length > 0;
  const hasSubDomains = domain.sub_domains && domain.sub_domains.length > 0;
  const hasAgentCount = domain.agent_count_estimate > 0;

  if (!hasKeywords && !hasSubDomains && !hasAgentCount) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Keywords */}
      {hasKeywords && (
        <div>
          <Label className="text-sm font-medium">Keywords</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {domain.keywords.map((keyword: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sub-domains */}
      {hasSubDomains && (
        <div>
          <Label className="text-sm font-medium">Sub-domains</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {domain.sub_domains.map((sub: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {sub}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {hasAgentCount && (
        <div>
          <Label className="text-sm font-medium">Estimated Agent Count</Label>
          <div className="text-2xl font-bold mt-1">{domain.agent_count_estimate}</div>
        </div>
      )}
    </div>
  );
}


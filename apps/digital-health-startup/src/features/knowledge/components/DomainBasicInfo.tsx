/**
 * Domain Basic Info Component
 * Displays read-only basic information about a domain
 */

import { Label } from '@/components/ui/label';

interface DomainBasicInfoProps {
  domain: any;
}

export function DomainBasicInfo({ domain }: DomainBasicInfoProps) {
  const domainId = domain.domain_id || domain.slug || domain.id;
  const code = domain.code || 'N/A';

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-xs text-muted-foreground">Domain ID</Label>
        <div className="font-mono text-sm">{domainId}</div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Code</Label>
        <div className="font-mono text-sm">{code}</div>
      </div>
    </div>
  );
}


import { Button } from '../button';

export interface HITLApprovalButtonProps {
  onApprove: () => void;
  onReject: () => void;
  onModify?: () => void;
  isLoading?: boolean;
}

export function HITLApprovalButton({
  onApprove,
  onReject,
  onModify,
  isLoading = false,
}: HITLApprovalButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={onApprove} disabled={isLoading}>
        Approve
      </Button>
      <Button size="sm" variant="secondary" onClick={onModify} disabled={isLoading || !onModify}>
        Request Changes
      </Button>
      <Button size="sm" variant="destructive" onClick={onReject} disabled={isLoading}>
        Reject
      </Button>
    </div>
  );
}

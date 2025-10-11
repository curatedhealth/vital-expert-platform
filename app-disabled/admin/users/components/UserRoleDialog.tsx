'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface UserRoleDialogProps {
  userId: string;
  currentRole: string;
  userName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}

const roleOptions = [
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  { value: 'user', label: 'User', description: 'Standard user access' },
  { value: 'manager', label: 'Manager', description: 'Operational management' },
  { value: 'admin', label: 'Admin', description: 'Administrative access' },
  { value: 'super_admin', label: 'Super Admin', description: 'Full system control' }
];

export default function UserRoleDialog({
  userId,
  currentRole,
  userName,
  isOpen,
  onOpenChange,
  onRoleChange,
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onRoleChange(userId, selectedRole);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  const canAssignRole = (role: string) => {
    if (role === 'super_admin') {
    }
    return true;
  };

  const getRoleDescription = (role: string) => {
    const option = roleOptions.find(opt => opt.value === role);
    return option?.description || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Update the role for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Current Role</Label>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium capitalize">
                {currentRole.replace('_', ' ')}
              </div>
              <div className="text-sm text-muted-foreground">
                {getRoleDescription(currentRole)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newRole">New Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={!canAssignRole(option.value)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Only super admins can assign the super admin role.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
            >
              {isLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

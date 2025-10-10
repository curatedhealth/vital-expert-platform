'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key } from 'lucide-react';

export default function MFAManagement() {
  const [mfaMethods, setMfaMethods] = useState([
    { id: '1', type: 'TOTP', status: 'active', lastUsed: '2024-01-15' },
    { id: '2', type: 'SMS', status: 'active', lastUsed: '2024-01-14' },
    { id: '3', type: 'Email', status: 'inactive', lastUsed: '2024-01-10' }
  ]);

  return (
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Multi-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mfaMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {method.type === 'TOTP' && <Smartphone className="h-5 w-5" />}
                {method.type === 'SMS' && <Key className="h-5 w-5" />}
                {method.type === 'Email' && <Key className="h-5 w-5" />}
        <div>
                  <p className="font-medium">{method.type}</p>
                  <p className="text-sm text-gray-500">Last used: {method.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                  {method.status}
                </Badge>
                <Button variant="outline" size="sm">
                  {method.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
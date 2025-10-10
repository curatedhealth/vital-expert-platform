'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Clock, AlertTriangle } from 'lucide-react';

export default function ImpersonationManagement() {
  const [sessions, setSessions] = useState([
    { id: '1', admin: 'admin@example.com', target: 'user@example.com', started: '2024-01-15 10:30', status: 'active' },
    { id: '2', admin: 'admin@example.com', target: 'test@example.com', started: '2024-01-14 14:20', status: 'ended' },
    { id: '3', admin: 'superadmin@example.com', target: 'demo@example.com', started: '2024-01-13 09:15', status: 'ended' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Impersonation Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Monitor and manage user impersonation sessions for support and debugging.
            </p>
            <Button>Start New Session</Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Target User</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.admin}</TableCell>
                  <TableCell>{session.target}</TableCell>
                  <TableCell>{session.started}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {session.status === 'active' && (
                        <Button variant="outline" size="sm" className="text-red-600">
                          End Session
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  type: 'policy' | 'procedure' | 'system' | 'process';
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requestedBy: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  implementedAt?: Date;
  impact: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ChangeManagementProps {
  initialChanges?: ChangeRequest[];
}

export default function ChangeManagement({ initialChanges = [] }: ChangeManagementProps) {
  const [changes, setChanges] = useState<ChangeRequest[]>(initialChanges);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Change Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Active Change Requests</h3>
              <Button>Create Change Request</Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">{change.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{change.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(change.status)}>
                        {change.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(change.priority)}>
                        {change.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getRiskColor(change.riskLevel)}>
                        {change.riskLevel}
                      </span>
                    </TableCell>
                    <TableCell>{change.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(change.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {change.status === 'pending_review' && (
                          <>
                            <Button variant="outline" size="sm" className="text-green-600">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
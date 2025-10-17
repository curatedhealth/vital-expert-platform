'use client';

import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AccessReviewManagement() {
  const [reviews, setReviews] = useState([
    { id: '1', user: 'john.doe@example.com', resource: 'Admin Panel', status: 'pending', requestedBy: 'admin@example.com', date: '2024-01-15' },
    { id: '2', user: 'jane.smith@example.com', resource: 'API Access', status: 'approved', requestedBy: 'admin@example.com', date: '2024-01-14' },
    { id: '3', user: 'bob.wilson@example.com', resource: 'Database', status: 'rejected', requestedBy: 'admin@example.com', date: '2024-01-13' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Access Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
            {reviews.map((review) => (
                    <TableRow key={review.id}>
                <TableCell>{review.user}</TableCell>
                <TableCell>{review.resource}</TableCell>
                      <TableCell>
                  <Badge className={getStatusColor(review.status)}>
                    {review.status}
                  </Badge>
                      </TableCell>
                <TableCell>{review.requestedBy}</TableCell>
                <TableCell>{review.date}</TableCell>
                      <TableCell>
                  <div className="flex gap-2">
                    {review.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600">
                          <CheckCircle className="h-4 w-4" />
                              </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <XCircle className="h-4 w-4" />
                            </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      View
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </CardContent>
      </Card>
  );
}
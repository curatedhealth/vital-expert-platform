/**
 * Ask Expert Page (Placeholder)
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function AskExpertPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ask Expert</h1>
          <p className="text-muted-foreground mt-2">1:1 Expert Consultation</p>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Ask Expert Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              This feature is currently under development
            </p>
            <Button>
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


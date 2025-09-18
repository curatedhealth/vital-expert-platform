'use client';

import { AlertCircle, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DemoModeBanner() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isDevelopment || hasSupabaseConfig) {
    return null;
  }

  return (
    <Card className="mx-4 mb-6 border-regulatory-gold bg-regulatory-gold/5">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-regulatory-gold" />
          <div>
            <h3 className="font-semibold text-deep-charcoal">Demo Mode</h3>
            <p className="text-sm text-medical-gray">
              VITALpath is running in demo mode. Configure your environment variables to enable full functionality.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://github.com/anthropics/claude-code/blob/main/README.md', '_blank')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Setup Guide
        </Button>
      </CardContent>
    </Card>
  );
}
/**
 * Ask Panel Home/Landing Page
 * Redirects to dashboard
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  // Always redirect to dashboard
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

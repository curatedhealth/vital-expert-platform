'use client';

import { useEffect, useState } from 'react';

import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Temporarily disable loading state to show the page content
  // TODO: Re-enable after fixing hydration issues
  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}
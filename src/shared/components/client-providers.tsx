'use client';

import { useEffect, useState } from 'react';

import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a minimal loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-progress-teal"></div>
      </div>
    );
  }

  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}
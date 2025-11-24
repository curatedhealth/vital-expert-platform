import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AppLayoutClient } from './AppLayoutClient';
import { createClient } from '@/lib/supabase/server';

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  // DEVELOPMENT BYPASS: Skip auth check in development mode
  if (process.env.NODE_ENV === 'development') {
    const devUser = {
      id: 'dev-superadmin',
      email: 'superadmin@vitalexpert.com',
      user_metadata: { full_name: 'Super Admin (Dev)' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any;
    
    console.log('🔓 Development mode: Bypassing authentication');
    return <AppLayoutClient initialUser={devUser}>{children}</AppLayoutClient>;
  }

  // PRODUCTION: Normal auth flow
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <AppLayoutClient initialUser={user}>{children}</AppLayoutClient>;
}

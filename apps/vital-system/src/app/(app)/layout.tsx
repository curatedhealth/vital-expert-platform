import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AppLayoutClient } from './AppLayoutClient';
import { createClient } from '@/lib/supabase/server';

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
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

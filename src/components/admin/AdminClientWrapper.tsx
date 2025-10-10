'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface AdminClientWrapperProps {
  children: React.ReactNode;
}

export default function AdminClientWrapper({ children }: AdminClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No session found, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user is admin based on email
        const isAdmin = session.user.email === 'hn@vitalexpert.com' || 
                       session.user.email?.includes('admin') || 
                       session.user.email?.includes('manager');

        if (!isAdmin) {
          console.log('User is not admin, redirecting to forbidden');
          router.push('/admin/forbidden');
          return;
        }

        console.log('User authorized for admin access');
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
